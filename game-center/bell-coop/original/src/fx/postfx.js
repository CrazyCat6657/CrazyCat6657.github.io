// ============================================================
//  低分辨率复古渲染管线
//  内部以 240p 渲染 → 亮部提取 → 高斯泛光 → 合成
//  合成阶段：ACES 色调映射 / 色阶量化 / 有序抖动 / 色差 / 暗角 / 受击闪烁
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { RENDER } from '../core/constants.js';

const QUAD_VERT = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const BRIGHT_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform float threshold;
uniform float knee;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float soft = clamp((l - threshold + knee) / (2.0 * knee + 1e-4), 0.0, 1.0);
  float w = max(soft * soft * (l - threshold), 0.0) / max(l, 1e-4);
  gl_FragColor = vec4(c * w, 1.0);
}
`;

const BLUR_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 dir;         // 像素步长 * 方向
varying vec2 vUv;
void main(){
  float w[5];
  w[0]=0.227027; w[1]=0.1945946; w[2]=0.1216216; w[3]=0.054054; w[4]=0.016216;
  vec3 sum = texture2D(tDiffuse, vUv).rgb * w[0];
  for(int i=1;i<5;i++){
    vec2 o = dir * float(i) * 1.35;
    sum += texture2D(tDiffuse, vUv + o).rgb * w[i];
    sum += texture2D(tDiffuse, vUv - o).rgb * w[i];
  }
  gl_FragColor = vec4(sum, 1.0);
}
`;

const COMPOSITE_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform sampler2D tBloom;
uniform vec2 texel;
uniform float bloomStrength;
uniform float exposure;
uniform float levels;
uniform float ditherAmt;
uniform float vignette;
uniform float time;
uniform float hurt;
uniform float flash;
uniform float chroma;
uniform float saturation;
uniform float scanline;
uniform vec3 tint;
uniform vec3 hurtTint;
uniform float aberrationBoost;
uniform float pixelScale;
varying vec2 vUv;

vec3 aces(vec3 x){
  const float a=2.51, b=0.03, c=2.43, d=0.59, e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

float bayer4(vec2 p){
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int idx = y*4 + x;
  float m[16];
  m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
  m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
  m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0;m[13]=7.0; m[14]=13.0;m[15]=5.0;
  for(int i=0;i<16;i++){ if(i==idx) return m[i]/16.0; }
  return 0.0;
}

void main(){
  vec2 uv = vUv;
  // 色差（受击 / 爆炸时增强）
  float ca = chroma + aberrationBoost;
  vec2 d = (uv - 0.5);
  vec3 col;
  col.r = texture2D(tDiffuse, uv + d * ca ).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - d * ca ).b;

  vec3 bloom = texture2D(tBloom, uv).rgb;
  col += bloom * bloomStrength;

  col *= exposure;
  col = aces(col);
  col *= tint;

  // 饱和度
  float lum = dot(col, vec3(0.2126,0.7152,0.0722));
  col = mix(vec3(lum), col, saturation);

  // 受击红光：只染边缘、不染画面中心。
  // 旧实现是无差别 mix(0.55 强度)，连续掉血时 hurt 会叠到 1.3，
  // 相当于整屏 ~70% 被红盖住 —— 玩家在最需要看弹幕的时候反而看不清战场。
  // 现在把强度按"离画面中心的距离"加权：中心几乎不受影响，边缘明确发红。
  float hw = clamp(hurt, 0.0, 1.0) * 0.62;
  float hd = smoothstep(0.10, 0.78, length((uv - 0.5) * vec2(1.06, 1.0)));
  col = mix(col, hurtTint, hw * mix(0.16, 1.0, hd));
  col += vec3(flash);

  // 暗角
  float v = smoothstep(1.05, 0.28, length((uv-0.5)*vec2(1.06,1.0))*1.42);
  col *= mix(1.0, v, vignette);

  // 扫描线（极轻）
  if(scanline > 0.001){
    float s = 0.5 + 0.5*sin(uv.y * pixelScale * 3.14159);
    col *= mix(1.0, 0.86 + 0.14*s, scanline);
  }

  // 色阶量化 + 有序抖动（NDS 调色板质感）
  vec2 dpx = uv / texel;
  float b = bayer4(dpx) - 0.5;
  col += b * ditherAmt / max(levels,2.0);
  col = floor(col * levels + 0.5) / levels;
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export class PostFX {
  constructor(renderer) {
    this.renderer = renderer;
    this.enabled = true;
    this.pixelScale = 3.0;
    this.width = 320; this.height = RENDER.internalHeight;

    const rtOpt = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.rtScene = new THREE.WebGLRenderTarget(320, 240, { ...rtOpt, depthBuffer: true });
    this.rtBloomA = new THREE.WebGLRenderTarget(160, 120, rtOpt);
    this.rtBloomB = new THREE.WebGLRenderTarget(160, 120, rtOpt);
    this.rtBloomC = new THREE.WebGLRenderTarget(160, 120, rtOpt);

    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quadScene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);

    this.brightMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: BRIGHT_FRAG,
      uniforms: { tDiffuse: { value: null }, threshold: { value: 0.86 }, knee: { value: 0.38 } },
      depthTest: false, depthWrite: false,
    });
    this.blurMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: BLUR_FRAG,
      uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2() } },
      depthTest: false, depthWrite: false,
    });
    this.compMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        tDiffuse: { value: null }, tBloom: { value: null },
        texel: { value: new THREE.Vector2(1 / 320, 1 / 240) },
        bloomStrength: { value: RENDER.bloom }, exposure: { value: RENDER.exposure },
        levels: { value: RENDER.levels }, ditherAmt: { value: RENDER.dither },
        vignette: { value: RENDER.vignette }, time: { value: 0 },
        hurt: { value: 0 }, flash: { value: 0 }, chroma: { value: 0.0022 },
        saturation: { value: 1.06 }, scanline: { value: 0.10 },
        tint: { value: new THREE.Vector3(1, 1, 1) },
        hurtTint: { value: new THREE.Vector3(0.75, 0.06, 0.06) },
        aberrationBoost: { value: 0 }, pixelScale: { value: 240 },
      },
      depthTest: false, depthWrite: false,
    });
  }

  setSize(canvasW, canvasH) {
    const aspect = canvasW / canvasH;
    const h = RENDER.internalHeight;
    let w = Math.round(h * aspect);
    w = Math.max(RENDER.minWidth, Math.min(RENDER.maxWidth, w));
    w -= w % 2; 
    this.width = w; this.height = h;
    this.rtScene.setSize(w, h);
    const bw = Math.max(2, Math.round(w / 2)), bh = Math.max(2, Math.round(h / 2));
    this.rtBloomA.setSize(bw, bh);
    this.rtBloomB.setSize(bw, bh);
    this.rtBloomC.setSize(bw, bh);
    this.compMat.uniforms.texel.value.set(1 / w, 1 / h);
    this.compMat.uniforms.pixelScale.value = h;
    this.pixelScale = canvasH / h;
    this._bw = bw; this._bh = bh;
  }

  _blit(mat, target) {
    this.quad.material = mat;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.quadScene, this.quadCam);
  }

  render(scene, camera, dt) {
    const r = this.renderer;
    if (!this.enabled) {
      r.setRenderTarget(null);
      r.render(scene, camera);
      this.sceneStats = { tris: r.info.render.triangles, calls: r.info.render.calls };
      return;
    }
    r.setRenderTarget(this.rtScene);
    r.clear();
    r.render(scene, camera);
    this.sceneStats = { tris: r.info.render.triangles, calls: r.info.render.calls };

    // 亮部
    this.brightMat.uniforms.tDiffuse.value = this.rtScene.texture;
    this._blit(this.brightMat, this.rtBloomA);

    // 模糊 两轮
    const blur = this.blurMat.uniforms;
    for (let i = 0; i < 2; i++) {
      const rad = i === 0 ? 1.0 : 2.1;
      blur.tDiffuse.value = this.rtBloomA.texture;
      blur.dir.value.set(rad / this._bw, 0);
      this._blit(this.blurMat, this.rtBloomB);
      blur.tDiffuse.value = this.rtBloomB.texture;
      blur.dir.value.set(0, rad / this._bh);
      this._blit(this.blurMat, this.rtBloomC);
      if (i === 0) {
        // 第二轮在更宽的源上叠加
        blur.tDiffuse.value = this.rtBloomC.texture;
        blur.dir.value.set(2.2 / this._bw, 0);
        this._blit(this.blurMat, this.rtBloomA);
        blur.tDiffuse.value = this.rtBloomA.texture;
        blur.dir.value.set(0, 2.2 / this._bh);
        this._blit(this.blurMat, this.rtBloomB);
      }
    }

    this.compMat.uniforms.tDiffuse.value = this.rtScene.texture;
    this.compMat.uniforms.tBloom.value = this.rtBloomC.texture;
    this.compMat.uniforms.time.value += dt;
    this._blit(this.compMat, null);
    r.setRenderTarget(null);
  }
}
