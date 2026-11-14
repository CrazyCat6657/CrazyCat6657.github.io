var od=0,Dc=1,ad=2;var Nc=1,Ia=2,di=3,Zn=0,hn=1,dn=2,Pi=0,ps=1,Uc=2,Fc=3,Oc=4,ld=5,Xi=100,cd=101,ud=102,hd=103,dd=104,fd=200,pd=201,md=202,gd=203,ha=204,da=205,xd=206,_d=207,yd=208,vd=209,Md=210,Sd=211,bd=212,Ed=213,Td=214,Pa=0,La=1,Da=2,ms=3,Na=4,Ua=5,Fa=6,Oa=7,Bc=0,wd=1,Ad=2,Li=0,Rd=1,Cd=2,Id=3,Ba=4,Pd=5,Ld=6,Dd=7,Mc="attached",Nd="detached",zc=300,bs=301,Es=302,za=303,ka=304,po=306,Kn=1e3,si=1001,$s=1002,Yt=1003,Ha=1004;var Ts=1005;var cn=1006,hr=1007;var jn=1008;var Qn=1009,kc=1010,Hc=1011,dr=1012,Va=1013,Ki=1014,On=1015,fr=1016,Ga=1017,Wa=1018,pr=1020,Vc=35902,Gc=35899,Wc=1021,Xc=1022,Rn=1023,Js=1026,mr=1027,Xa=1028,qa=1029,qc=1030,Ya=1031;var Za=1033,mo=33776,go=33777,xo=33778,_o=33779,Ka=35840,$a=35841,Ja=35842,ja=35843,Qa=36196,el=37492,tl=37496,nl=37808,il=37809,sl=37810,rl=37811,ol=37812,al=37813,ll=37814,cl=37815,ul=37816,hl=37817,dl=37818,fl=37819,pl=37820,ml=37821,gl=36492,xl=36494,_l=36495,yl=36283,vl=36284,Ml=36285,Sl=36286;var gs=2300,xs=2301,ua=2302,Sc=2400,bc=2401,Ec=2402,Ud=2500;var Yc=0,yo=1,gr=2,Fd=3200,Od=3201;var Zc=0,Bd=1,Di="",Pt="srgb",Zt="srgb-linear",Hr="linear",ft="srgb";var fs=7680;var Tc=519,zd=512,kd=513,Hd=514,Kc=515,Vd=516,Gd=517,Wd=518,Xd=519,fa=35044;var $c="300 es",qn=2e3,Vr=2001;var Ti=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},nn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Sh=1234567,zr=Math.PI/180,_s=180/Math.PI;function Yn(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(nn[n&255]+nn[n>>8&255]+nn[n>>16&255]+nn[n>>24&255]+"-"+nn[e&255]+nn[e>>8&255]+"-"+nn[e>>16&15|64]+nn[e>>24&255]+"-"+nn[t&63|128]+nn[t>>8&255]+"-"+nn[t>>16&255]+nn[t>>24&255]+nn[i&255]+nn[i>>8&255]+nn[i>>16&255]+nn[i>>24&255]).toLowerCase()}function tt(n,e,t){return Math.max(e,Math.min(t,n))}function Jc(n,e){return(n%e+e)%e}function dp(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function fp(n,e,t){return n!==e?(t-n)/(e-n):0}function kr(n,e,t){return(1-t)*n+t*e}function pp(n,e,t,i){return kr(n,e,1-Math.exp(-t*i))}function mp(n,e=1){return e-Math.abs(Jc(n,e*2)-e)}function gp(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function xp(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function _p(n,e){return n+Math.floor(Math.random()*(e-n+1))}function yp(n,e){return n+Math.random()*(e-n)}function vp(n){return n*(.5-Math.random())}function Mp(n){n!==void 0&&(Sh=n);let e=Sh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Sp(n){return n*zr}function bp(n){return n*_s}function Ep(n){return(n&n-1)===0&&n!==0}function Tp(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function wp(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Ap(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+i)/2),u=o((e+i)/2),h=r((e-i)/2),d=o((e-i)/2),f=r((i-e)/2),g=o((i-e)/2);switch(s){case"XYX":n.set(a*u,c*h,c*d,a*l);break;case"YZY":n.set(c*d,a*u,c*h,a*l);break;case"ZXZ":n.set(c*h,c*d,a*u,a*l);break;case"XZX":n.set(a*u,c*g,c*f,a*l);break;case"YXY":n.set(c*f,a*u,c*g,a*l);break;case"ZYZ":n.set(c*g,c*f,a*u,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Xn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function dt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var xr={DEG2RAD:zr,RAD2DEG:_s,generateUUID:Yn,clamp:tt,euclideanModulo:Jc,mapLinear:dp,inverseLerp:fp,lerp:kr,damp:pp,pingpong:mp,smoothstep:gp,smootherstep:xp,randInt:_p,randFloat:yp,randFloatSpread:vp,seededRandom:Mp,degToRad:Sp,radToDeg:bp,isPowerOfTwo:Ep,ceilPowerOfTwo:Tp,floorPowerOfTwo:wp,setQuaternionFromProperEuler:Ap,normalize:dt,denormalize:Xn},je=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(tt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Un=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let c=i[s+0],l=i[s+1],u=i[s+2],h=i[s+3],d=r[o+0],f=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=x;return}if(h!==x||c!==d||l!==f||u!==g){let m=1-a,p=c*d+l*f+u*g+h*x,w=p>=0?1:-1,E=1-p*p;if(E>Number.EPSILON){let R=Math.sqrt(E),C=Math.atan2(R,p*w);m=Math.sin(m*C)/R,a=Math.sin(a*C)/R}let y=a*w;if(c=c*m+d*y,l=l*m+f*y,u=u*m+g*y,h=h*m+x*y,m===1-a){let R=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=R,l*=R,u*=R,h*=R}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],c=i[s+1],l=i[s+2],u=i[s+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*h+c*f-l*d,e[t+1]=c*g+u*d+l*h-a*f,e[t+2]=l*g+u*f+a*d-c*h,e[t+3]=u*g-a*h-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),u=a(s/2),h=a(r/2),d=c(i/2),f=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=d*u*h+l*f*g,this._y=l*f*h-d*u*g,this._z=l*u*g+d*f*h,this._w=l*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+l*f*g,this._y=l*f*h-d*u*g,this._z=l*u*g-d*f*h,this._w=l*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-l*f*g,this._y=l*f*h+d*u*g,this._z=l*u*g+d*f*h,this._w=l*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-l*f*g,this._y=l*f*h+d*u*g,this._z=l*u*g-d*f*h,this._w=l*u*h+d*f*g;break;case"YZX":this._x=d*u*h+l*f*g,this._y=l*f*h+d*u*g,this._z=l*u*g-d*f*h,this._w=l*u*h-d*f*g;break;case"XZY":this._x=d*u*h-l*f*g,this._y=l*f*h-d*u*g,this._z=l*u*g+d*f*h,this._w=l*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=i+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(i>a&&i>h){let f=2*Math.sqrt(1+i-a-h);this._w=(u-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>h){let f=2*Math.sqrt(1+a-i-h);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+u)/f}else{let f=2*Math.sqrt(1+h-i-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(tt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-i*l,this._z=r*u+o*l+i*c-s*a,this._w=o*u-i*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,d=Math.sin(t*u)/l;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},A=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*i),u=2*(a*t-r*s),h=2*(r*i-o*t);return this.x=t+c*l+o*h-a*u,this.y=i+c*u+a*l-r*h,this.z=s+c*h+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this.z=tt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this.z=tt(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(tt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-i*c,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Zl.copy(this).projectOnVector(e),this.sub(Zl)}reflect(e){return this.sub(Zl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Zl=new A,bh=new Un,Xe=class n{constructor(e,t,i,s,r,o,a,c,l){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l)}set(e,t,i,s,r,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=i,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],u=i[4],h=i[7],d=i[2],f=i[5],g=i[8],x=s[0],m=s[3],p=s[6],w=s[1],E=s[4],y=s[7],R=s[2],C=s[5],L=s[8];return r[0]=o*x+a*w+c*R,r[3]=o*m+a*E+c*C,r[6]=o*p+a*y+c*L,r[1]=l*x+u*w+h*R,r[4]=l*m+u*E+h*C,r[7]=l*p+u*y+h*L,r[2]=d*x+f*w+g*R,r[5]=d*m+f*E+g*C,r[8]=d*p+f*y+g*L,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-i*r*u+i*a*c+s*r*l-s*o*c}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,d=a*c-u*r,f=l*r-o*c,g=t*h+i*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(s*l-u*i)*x,e[2]=(a*i-s*o)*x,e[3]=d*x,e[4]=(u*t-s*c)*x,e[5]=(s*r-a*t)*x,e[6]=f*x,e[7]=(i*c-l*t)*x,e[8]=(o*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Kl.makeScale(e,t)),this}rotate(e){return this.premultiply(Kl.makeRotation(-e)),this}translate(e,t){return this.premultiply(Kl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Kl=new Xe;function jc(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function js(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function qd(){let n=js("canvas");return n.style.display="block",n}var Eh={};function Qs(n){n in Eh||(Eh[n]=!0,console.warn(n))}function Yd(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Th=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),wh=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Rp(){let n={enabled:!0,workingColorSpace:Zt,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ft&&(s.r=Ei(s.r),s.g=Ei(s.g),s.b=Ei(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ft&&(s.r=Ks(s.r),s.g=Ks(s.g),s.b=Ks(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Di?Hr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Qs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Qs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Zt]:{primaries:e,whitePoint:i,transfer:Hr,toXYZ:Th,fromXYZ:wh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Pt},outputColorSpaceConfig:{drawingBufferColorSpace:Pt}},[Pt]:{primaries:e,whitePoint:i,transfer:ft,toXYZ:Th,fromXYZ:wh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Pt}}}),n}var st=Rp();function Ei(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ks(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Us,pa=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Us===void 0&&(Us=js("canvas")),Us.width=e.width,Us.height=e.height;let s=Us.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Us}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=js("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Ei(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Ei(t[i]/255)*255):t[i]=Ei(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Cp=0,er=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Cp++}),this.uuid=Yn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push($l(s[o].image)):r.push($l(s[o]))}else r=$l(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function $l(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?pa.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Ip=0,Jl=new A,Ht=class n extends Ti{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=si,s=si,r=cn,o=jn,a=Rn,c=Qn,l=n.DEFAULT_ANISOTROPY,u=Di){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ip++}),this.uuid=Yn(),this.name="",this.source=new er(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new je(0,0),this.repeat=new je(1,1),this.center=new je(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Jl).x}get height(){return this.source.getSize(Jl).y}get depth(){return this.source.getSize(Jl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==zc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Kn:e.x=e.x-Math.floor(e.x);break;case si:e.x=e.x<0?0:1;break;case $s:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Kn:e.y=e.y-Math.floor(e.y);break;case si:e.y=e.y<0?0:1;break;case $s:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ht.DEFAULT_IMAGE=null;Ht.DEFAULT_MAPPING=zc;Ht.DEFAULT_ANISOTROPY=1;var lt=class n{constructor(e=0,t=0,i=0,s=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],f=c[5],g=c[9],x=c[2],m=c[6],p=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(l+1)/2,y=(f+1)/2,R=(p+1)/2,C=(u+d)/4,L=(h+x)/4,F=(g+m)/4;return E>y&&E>R?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=C/i,r=L/i):y>R?y<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),i=C/s,r=F/s):R<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),i=L/r,s=F/r),this.set(i,s,r,t),this}let w=Math.sqrt((m-g)*(m-g)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(w)<.001&&(w=1),this.x=(m-g)/w,this.y=(h-x)/w,this.z=(d-u)/w,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this.z=tt(this.z,e.z,t.z),this.w=tt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this.z=tt(this.z,e,t),this.w=tt(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(tt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ma=class extends Ti{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:cn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new lt(0,0,e,t),this.scissorTest=!1,this.viewport=new lt(0,0,e,t);let s={width:e,height:t,depth:i.depth},r=new Ht(s);this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){let t={minFilter:cn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new er(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},oi=class extends ma{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Gr=class extends Ht{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Yt,this.minFilter=Yt,this.wrapR=si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ga=class extends Ht{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Yt,this.minFilter=Yt,this.wrapR=si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var un=class{constructor(e=new A(1/0,1/0,1/0),t=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Vn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Vn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Vn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Vn):Vn.fromBufferAttribute(r,o),Vn.applyMatrix4(e.matrixWorld),this.expandByPoint(Vn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ko.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ko.copy(i.boundingBox)),ko.applyMatrix4(e.matrixWorld),this.union(ko)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vn),Vn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Pr),Ho.subVectors(this.max,Pr),Fs.subVectors(e.a,Pr),Os.subVectors(e.b,Pr),Bs.subVectors(e.c,Pr),Bi.subVectors(Os,Fs),zi.subVectors(Bs,Os),cs.subVectors(Fs,Bs);let t=[0,-Bi.z,Bi.y,0,-zi.z,zi.y,0,-cs.z,cs.y,Bi.z,0,-Bi.x,zi.z,0,-zi.x,cs.z,0,-cs.x,-Bi.y,Bi.x,0,-zi.y,zi.x,0,-cs.y,cs.x,0];return!jl(t,Fs,Os,Bs,Ho)||(t=[1,0,0,0,1,0,0,0,1],!jl(t,Fs,Os,Bs,Ho))?!1:(Vo.crossVectors(Bi,zi),t=[Vo.x,Vo.y,Vo.z],jl(t,Fs,Os,Bs,Ho))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_i[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_i[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_i[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_i[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_i[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_i[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_i[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_i[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_i),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},_i=[new A,new A,new A,new A,new A,new A,new A,new A],Vn=new A,ko=new un,Fs=new A,Os=new A,Bs=new A,Bi=new A,zi=new A,cs=new A,Pr=new A,Ho=new A,Vo=new A,us=new A;function jl(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){us.fromArray(n,r);let a=s.x*Math.abs(us.x)+s.y*Math.abs(us.y)+s.z*Math.abs(us.z),c=e.dot(us),l=t.dot(us),u=i.dot(us);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var Pp=new un,Lr=new A,Ql=new A,xn=class{constructor(e=new A,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Pp.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Lr.subVectors(e,this.center);let t=Lr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Lr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ql.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Lr.copy(e.center).add(Ql)),this.expandByPoint(Lr.copy(e.center).sub(Ql))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},yi=new A,ec=new A,Go=new A,ki=new A,tc=new A,Wo=new A,nc=new A,qi=class{constructor(e=new A,t=new A(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,yi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=yi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(yi.copy(this.origin).addScaledVector(this.direction,t),yi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){ec.copy(e).add(t).multiplyScalar(.5),Go.copy(t).sub(e).normalize(),ki.copy(this.origin).sub(ec);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Go),a=ki.dot(this.direction),c=-ki.dot(Go),l=ki.lengthSq(),u=Math.abs(1-o*o),h,d,f,g;if(u>0)if(h=o*c-a,d=o*a-c,g=r*u,h>=0)if(d>=-g)if(d<=g){let x=1/u;h*=x,d*=x,f=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l):d<=g?(h=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(ec).addScaledVector(Go,d),f}intersectSphere(e,t){yi.subVectors(e.center,this.origin);let i=yi.dot(this.direction),s=yi.dot(yi)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(i=(e.min.x-d.x)*l,s=(e.max.x-d.x)*l):(i=(e.max.x-d.x)*l,s=(e.min.x-d.x)*l),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),i>c||a>s)||((a>i||i!==i)&&(i=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,yi)!==null}intersectTriangle(e,t,i,s,r){tc.subVectors(t,e),Wo.subVectors(i,e),nc.crossVectors(tc,Wo);let o=this.direction.dot(nc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ki.subVectors(this.origin,e);let c=a*this.direction.dot(Wo.crossVectors(ki,Wo));if(c<0)return null;let l=a*this.direction.dot(tc.cross(ki));if(l<0||c+l>o)return null;let u=-a*ki.dot(nc);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},We=class n{constructor(e,t,i,s,r,o,a,c,l,u,h,d,f,g,x,m){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l,u,h,d,f,g,x,m)}set(e,t,i,s,r,o,a,c,l,u,h,d,f,g,x,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,s=1/zs.setFromMatrixColumn(e,0).length(),r=1/zs.setFromMatrixColumn(e,1).length(),o=1/zs.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=o*u,f=o*h,g=a*u,x=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=f+g*l,t[5]=d-x*l,t[9]=-a*c,t[2]=x-d*l,t[6]=g+f*l,t[10]=o*c}else if(e.order==="YXZ"){let d=c*u,f=c*h,g=l*u,x=l*h;t[0]=d+x*a,t[4]=g*a-f,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=x+d*a,t[10]=o*c}else if(e.order==="ZXY"){let d=c*u,f=c*h,g=l*u,x=l*h;t[0]=d-x*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=x-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let d=o*u,f=o*h,g=a*u,x=a*h;t[0]=c*u,t[4]=g*l-f,t[8]=d*l+x,t[1]=c*h,t[5]=x*l+d,t[9]=f*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let d=o*c,f=o*l,g=a*c,x=a*l;t[0]=c*u,t[4]=x-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=f*h+g,t[10]=d-x*h}else if(e.order==="XZY"){let d=o*c,f=o*l,g=a*c,x=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+x,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Lp,e,Dp)}lookAt(e,t,i){let s=this.elements;return Tn.subVectors(e,t),Tn.lengthSq()===0&&(Tn.z=1),Tn.normalize(),Hi.crossVectors(i,Tn),Hi.lengthSq()===0&&(Math.abs(i.z)===1?Tn.x+=1e-4:Tn.z+=1e-4,Tn.normalize(),Hi.crossVectors(i,Tn)),Hi.normalize(),Xo.crossVectors(Tn,Hi),s[0]=Hi.x,s[4]=Xo.x,s[8]=Tn.x,s[1]=Hi.y,s[5]=Xo.y,s[9]=Tn.y,s[2]=Hi.z,s[6]=Xo.z,s[10]=Tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],u=i[1],h=i[5],d=i[9],f=i[13],g=i[2],x=i[6],m=i[10],p=i[14],w=i[3],E=i[7],y=i[11],R=i[15],C=s[0],L=s[4],F=s[8],b=s[12],S=s[1],P=s[5],U=s[9],k=s[13],q=s[2],J=s[6],K=s[10],oe=s[14],X=s[3],de=s[7],ge=s[11],Pe=s[15];return r[0]=o*C+a*S+c*q+l*X,r[4]=o*L+a*P+c*J+l*de,r[8]=o*F+a*U+c*K+l*ge,r[12]=o*b+a*k+c*oe+l*Pe,r[1]=u*C+h*S+d*q+f*X,r[5]=u*L+h*P+d*J+f*de,r[9]=u*F+h*U+d*K+f*ge,r[13]=u*b+h*k+d*oe+f*Pe,r[2]=g*C+x*S+m*q+p*X,r[6]=g*L+x*P+m*J+p*de,r[10]=g*F+x*U+m*K+p*ge,r[14]=g*b+x*k+m*oe+p*Pe,r[3]=w*C+E*S+y*q+R*X,r[7]=w*L+E*P+y*J+R*de,r[11]=w*F+E*U+y*K+R*ge,r[15]=w*b+E*k+y*oe+R*Pe,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],x=e[7],m=e[11],p=e[15];return g*(+r*c*h-s*l*h-r*a*d+i*l*d+s*a*f-i*c*f)+x*(+t*c*f-t*l*d+r*o*d-s*o*f+s*l*u-r*c*u)+m*(+t*l*h-t*a*f-r*o*h+i*o*f+r*a*u-i*l*u)+p*(-s*a*u-t*c*h+t*a*d+s*o*h-i*o*d+i*c*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],x=e[13],m=e[14],p=e[15],w=h*m*l-x*d*l+x*c*f-a*m*f-h*c*p+a*d*p,E=g*d*l-u*m*l-g*c*f+o*m*f+u*c*p-o*d*p,y=u*x*l-g*h*l+g*a*f-o*x*f-u*a*p+o*h*p,R=g*h*c-u*x*c-g*a*d+o*x*d+u*a*m-o*h*m,C=t*w+i*E+s*y+r*R;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let L=1/C;return e[0]=w*L,e[1]=(x*d*r-h*m*r-x*s*f+i*m*f+h*s*p-i*d*p)*L,e[2]=(a*m*r-x*c*r+x*s*l-i*m*l-a*s*p+i*c*p)*L,e[3]=(h*c*r-a*d*r-h*s*l+i*d*l+a*s*f-i*c*f)*L,e[4]=E*L,e[5]=(u*m*r-g*d*r+g*s*f-t*m*f-u*s*p+t*d*p)*L,e[6]=(g*c*r-o*m*r-g*s*l+t*m*l+o*s*p-t*c*p)*L,e[7]=(o*d*r-u*c*r+u*s*l-t*d*l-o*s*f+t*c*f)*L,e[8]=y*L,e[9]=(g*h*r-u*x*r-g*i*f+t*x*f+u*i*p-t*h*p)*L,e[10]=(o*x*r-g*a*r+g*i*l-t*x*l-o*i*p+t*a*p)*L,e[11]=(u*a*r-o*h*r-u*i*l+t*h*l+o*i*f-t*a*f)*L,e[12]=R*L,e[13]=(u*x*s-g*h*s+g*i*d-t*x*d-u*i*m+t*h*m)*L,e[14]=(g*a*s-o*x*s-g*i*c+t*x*c+o*i*m-t*a*m)*L,e[15]=(o*h*s-u*a*s+u*i*c-t*h*c-o*i*d+t*a*d)*L,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+i,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+i,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,d=r*l,f=r*u,g=r*h,x=o*u,m=o*h,p=a*h,w=c*l,E=c*u,y=c*h,R=i.x,C=i.y,L=i.z;return s[0]=(1-(x+p))*R,s[1]=(f+y)*R,s[2]=(g-E)*R,s[3]=0,s[4]=(f-y)*C,s[5]=(1-(d+p))*C,s[6]=(m+w)*C,s[7]=0,s[8]=(g+E)*L,s[9]=(m-w)*L,s[10]=(1-(d+x))*L,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements,r=zs.set(s[0],s[1],s[2]).length(),o=zs.set(s[4],s[5],s[6]).length(),a=zs.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Gn.copy(this);let l=1/r,u=1/o,h=1/a;return Gn.elements[0]*=l,Gn.elements[1]*=l,Gn.elements[2]*=l,Gn.elements[4]*=u,Gn.elements[5]*=u,Gn.elements[6]*=u,Gn.elements[8]*=h,Gn.elements[9]*=h,Gn.elements[10]*=h,t.setFromRotationMatrix(Gn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=qn,c=!1){let l=this.elements,u=2*r/(t-e),h=2*r/(i-s),d=(t+e)/(t-e),f=(i+s)/(i-s),g,x;if(c)g=r/(o-r),x=o*r/(o-r);else if(a===qn)g=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===Vr)g=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=qn,c=!1){let l=this.elements,u=2/(t-e),h=2/(i-s),d=-(t+e)/(t-e),f=-(i+s)/(i-s),g,x;if(c)g=1/(o-r),x=o/(o-r);else if(a===qn)g=-2/(o-r),x=-(o+r)/(o-r);else if(a===Vr)g=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},zs=new A,Gn=new We,Lp=new A(0,0,0),Dp=new A(1,1,1),Hi=new A,Xo=new A,Tn=new A,Ah=new We,Rh=new Un,$n=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(tt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-tt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(tt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-tt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(tt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-tt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Ah.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ah,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Rh.setFromEuler(this),this.setFromQuaternion(Rh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};$n.DEFAULT_ORDER="XYZ";var tr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Np=0,Ch=new A,ks=new Un,vi=new We,qo=new A,Dr=new A,Up=new A,Fp=new Un,Ih=new A(1,0,0),Ph=new A(0,1,0),Lh=new A(0,0,1),Dh={type:"added"},Op={type:"removed"},Hs={type:"childadded",child:null},ic={type:"childremoved",child:null},At=class n extends Ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Np++}),this.uuid=Yn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new A,t=new $n,i=new Un,s=new A(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new We},normalMatrix:{value:new Xe}}),this.matrix=new We,this.matrixWorld=new We,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new tr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.multiply(ks),this}rotateOnWorldAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.premultiply(ks),this}rotateX(e){return this.rotateOnAxis(Ih,e)}rotateY(e){return this.rotateOnAxis(Ph,e)}rotateZ(e){return this.rotateOnAxis(Lh,e)}translateOnAxis(e,t){return Ch.copy(e).applyQuaternion(this.quaternion),this.position.add(Ch.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ih,e)}translateY(e){return this.translateOnAxis(Ph,e)}translateZ(e){return this.translateOnAxis(Lh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(vi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?qo.copy(e):qo.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Dr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?vi.lookAt(Dr,qo,this.up):vi.lookAt(qo,Dr,this.up),this.quaternion.setFromRotationMatrix(vi),s&&(vi.extractRotation(s.matrixWorld),ks.setFromRotationMatrix(vi),this.quaternion.premultiply(ks.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Dh),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Op),ic.child=e,this.dispatchEvent(ic),ic.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),vi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),vi.multiply(e.parent.matrixWorld)),e.applyMatrix4(vi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Dh),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Dr,e,Up),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Dr,Fp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};At.DEFAULT_UP=new A(0,1,0);At.DEFAULT_MATRIX_AUTO_UPDATE=!0;At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Wn=new A,Mi=new A,sc=new A,Si=new A,Vs=new A,Gs=new A,Nh=new A,rc=new A,oc=new A,ac=new A,lc=new lt,cc=new lt,uc=new lt,Wi=class n{constructor(e=new A,t=new A,i=new A){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Wn.subVectors(e,t),s.cross(Wn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Wn.subVectors(s,t),Mi.subVectors(i,t),sc.subVectors(e,t);let o=Wn.dot(Wn),a=Wn.dot(Mi),c=Wn.dot(sc),l=Mi.dot(Mi),u=Mi.dot(sc),h=o*l-a*a;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(l*c-a*u)*d,g=(o*u-a*c)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Si)===null?!1:Si.x>=0&&Si.y>=0&&Si.x+Si.y<=1}static getInterpolation(e,t,i,s,r,o,a,c){return this.getBarycoord(e,t,i,s,Si)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Si.x),c.addScaledVector(o,Si.y),c.addScaledVector(a,Si.z),c)}static getInterpolatedAttribute(e,t,i,s,r,o){return lc.setScalar(0),cc.setScalar(0),uc.setScalar(0),lc.fromBufferAttribute(e,t),cc.fromBufferAttribute(e,i),uc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(lc,r.x),o.addScaledVector(cc,r.y),o.addScaledVector(uc,r.z),o}static isFrontFacing(e,t,i,s){return Wn.subVectors(i,t),Mi.subVectors(e,t),Wn.cross(Mi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Wn.subVectors(this.c,this.b),Mi.subVectors(this.a,this.b),Wn.cross(Mi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;Vs.subVectors(s,i),Gs.subVectors(r,i),rc.subVectors(e,i);let c=Vs.dot(rc),l=Gs.dot(rc);if(c<=0&&l<=0)return t.copy(i);oc.subVectors(e,s);let u=Vs.dot(oc),h=Gs.dot(oc);if(u>=0&&h<=u)return t.copy(s);let d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(i).addScaledVector(Vs,o);ac.subVectors(e,r);let f=Vs.dot(ac),g=Gs.dot(ac);if(g>=0&&f<=g)return t.copy(r);let x=f*l-c*g;if(x<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(i).addScaledVector(Gs,a);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return Nh.subVectors(r,s),a=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(Nh,a);let p=1/(m+x+d);return o=x*p,a=d*p,t.copy(i).addScaledVector(Vs,o).addScaledVector(Gs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Zd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vi={h:0,s:0,l:0},Yo={h:0,s:0,l:0};function hc(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ne=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,st.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=st.workingColorSpace){return this.r=e,this.g=t,this.b=i,st.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=st.workingColorSpace){if(e=Jc(e,1),t=tt(t,0,1),i=tt(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=hc(o,r,e+1/3),this.g=hc(o,r,e),this.b=hc(o,r,e-1/3)}return st.colorSpaceToWorking(this,s),this}setStyle(e,t=Pt){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Pt){let i=Zd[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ei(e.r),this.g=Ei(e.g),this.b=Ei(e.b),this}copyLinearToSRGB(e){return this.r=Ks(e.r),this.g=Ks(e.g),this.b=Ks(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Pt){return st.workingToColorSpace(sn.copy(this),e),Math.round(tt(sn.r*255,0,255))*65536+Math.round(tt(sn.g*255,0,255))*256+Math.round(tt(sn.b*255,0,255))}getHexString(e=Pt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=st.workingColorSpace){st.workingToColorSpace(sn.copy(this),t);let i=sn.r,s=sn.g,r=sn.b,o=Math.max(i,s,r),a=Math.min(i,s,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case i:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-i)/h+2;break;case r:c=(i-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=st.workingColorSpace){return st.workingToColorSpace(sn.copy(this),t),e.r=sn.r,e.g=sn.g,e.b=sn.b,e}getStyle(e=Pt){st.workingToColorSpace(sn.copy(this),e);let t=sn.r,i=sn.g,s=sn.b;return e!==Pt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Vi),this.setHSL(Vi.h+e,Vi.s+t,Vi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Vi),e.getHSL(Yo);let i=kr(Vi.h,Yo.h,t),s=kr(Vi.s,Yo.s,t),r=kr(Vi.l,Yo.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},sn=new Ne;Ne.NAMES=Zd;var Bp=0,_n=class extends Ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Bp++}),this.uuid=Yn(),this.name="",this.type="Material",this.blending=ps,this.side=Zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ha,this.blendDst=da,this.blendEquation=Xi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ne(0,0,0),this.blendAlpha=0,this.depthFunc=ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Tc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fs,this.stencilZFail=fs,this.stencilZPass=fs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ps&&(i.blending=this.blending),this.side!==Zn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ha&&(i.blendSrc=this.blendSrc),this.blendDst!==da&&(i.blendDst=this.blendDst),this.blendEquation!==Xi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ms&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Tc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==fs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==fs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Kt=class extends _n{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ne(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $n,this.combine=Bc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Ft=new A,Zo=new je,zp=0,Bt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:zp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=fa,this.updateRanges=[],this.gpuType=On,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Zo.fromBufferAttribute(this,t),Zo.applyMatrix3(e),this.setXY(t,Zo.x,Zo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix3(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix4(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyNormalMatrix(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.transformDirection(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Xn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=dt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Xn(t,this.array)),t}setX(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Xn(t,this.array)),t}setY(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Xn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Xn(t,this.array)),t}setW(e,t){return this.normalized&&(t=dt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=dt(t,this.array),i=dt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=dt(t,this.array),i=dt(i,this.array),s=dt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=dt(t,this.array),i=dt(i,this.array),s=dt(s,this.array),r=dt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==fa&&(e.usage=this.usage),e}};var Wr=class extends Bt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Xr=class extends Bt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var kt=class extends Bt{constructor(e,t,i){super(new Float32Array(e),t,i)}},kp=0,Nn=new We,dc=new At,Ws=new A,wn=new un,Nr=new un,qt=new A,$t=class n extends Ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kp++}),this.uuid=Yn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(jc(e)?Xr:Wr)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Xe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Nn.makeRotationFromQuaternion(e),this.applyMatrix4(Nn),this}rotateX(e){return Nn.makeRotationX(e),this.applyMatrix4(Nn),this}rotateY(e){return Nn.makeRotationY(e),this.applyMatrix4(Nn),this}rotateZ(e){return Nn.makeRotationZ(e),this.applyMatrix4(Nn),this}translate(e,t,i){return Nn.makeTranslation(e,t,i),this.applyMatrix4(Nn),this}scale(e,t,i){return Nn.makeScale(e,t,i),this.applyMatrix4(Nn),this}lookAt(e){return dc.lookAt(e),dc.updateMatrix(),this.applyMatrix4(dc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ws).negate(),this.translate(Ws.x,Ws.y,Ws.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new kt(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new un);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];wn.setFromBufferAttribute(r),this.morphTargetsRelative?(qt.addVectors(this.boundingBox.min,wn.min),this.boundingBox.expandByPoint(qt),qt.addVectors(this.boundingBox.max,wn.max),this.boundingBox.expandByPoint(qt)):(this.boundingBox.expandByPoint(wn.min),this.boundingBox.expandByPoint(wn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(e){let i=this.boundingSphere.center;if(wn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Nr.setFromBufferAttribute(a),this.morphTargetsRelative?(qt.addVectors(wn.min,Nr.min),wn.expandByPoint(qt),qt.addVectors(wn.max,Nr.max),wn.expandByPoint(qt)):(wn.expandByPoint(Nr.min),wn.expandByPoint(Nr.max))}wn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)qt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(qt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)qt.fromBufferAttribute(a,l),c&&(Ws.fromBufferAttribute(e,l),qt.add(Ws)),s=Math.max(s,i.distanceToSquared(qt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Bt(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let F=0;F<i.count;F++)a[F]=new A,c[F]=new A;let l=new A,u=new A,h=new A,d=new je,f=new je,g=new je,x=new A,m=new A;function p(F,b,S){l.fromBufferAttribute(i,F),u.fromBufferAttribute(i,b),h.fromBufferAttribute(i,S),d.fromBufferAttribute(r,F),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,S),u.sub(l),h.sub(l),f.sub(d),g.sub(d);let P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(P),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(P),a[F].add(x),a[b].add(x),a[S].add(x),c[F].add(m),c[b].add(m),c[S].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let F=0,b=w.length;F<b;++F){let S=w[F],P=S.start,U=S.count;for(let k=P,q=P+U;k<q;k+=3)p(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let E=new A,y=new A,R=new A,C=new A;function L(F){R.fromBufferAttribute(s,F),C.copy(R);let b=a[F];E.copy(b),E.sub(R.multiplyScalar(R.dot(b))).normalize(),y.crossVectors(C,b);let P=y.dot(c[F])<0?-1:1;o.setXYZW(F,E.x,E.y,E.z,P)}for(let F=0,b=w.length;F<b;++F){let S=w[F],P=S.start,U=S.count;for(let k=P,q=P+U;k<q;k+=3)L(e.getX(k+0)),L(e.getX(k+1)),L(e.getX(k+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Bt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new A,r=new A,o=new A,a=new A,c=new A,l=new A,u=new A,h=new A;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,m),a.add(u),c.add(u),l.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)qt.fromBufferAttribute(e,t),qt.normalize(),e.setXYZ(t,qt.x,qt.y,qt.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u),f=0,g=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?f=c[x]*a.data.stride+a.offset:f=c[x]*u;for(let p=0;p<u;p++)d[g++]=l[f++]}return new Bt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=e(c,i);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){let d=l[u],f=e(d,i);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){let f=l[h];u.push(f.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Uh=new We,hs=new qi,Ko=new xn,Fh=new A,$o=new A,Jo=new A,jo=new A,fc=new A,Qo=new A,Oh=new A,ea=new A,ze=class extends At{constructor(e=new $t,t=new Kt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Qo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=a[c],h=r[c];u!==0&&(fc.fromBufferAttribute(h,e),o?Qo.addScaledVector(fc,u):Qo.addScaledVector(fc.sub(t),u))}t.add(Qo)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ko.copy(i.boundingSphere),Ko.applyMatrix4(r),hs.copy(e.ray).recast(e.near),!(Ko.containsPoint(hs.origin)===!1&&(hs.intersectSphere(Ko,Fh)===null||hs.origin.distanceToSquared(Fh)>(e.far-e.near)**2))&&(Uh.copy(r).invert(),hs.copy(e.ray).applyMatrix4(Uh),!(i.boundingBox!==null&&hs.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,hs)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=o[m.materialIndex],w=Math.max(m.start,f.start),E=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=w,R=E;y<R;y+=3){let C=a.getX(y),L=a.getX(y+1),F=a.getX(y+2);s=ta(this,p,e,i,l,u,h,C,L,F),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let w=a.getX(m),E=a.getX(m+1),y=a.getX(m+2);s=ta(this,o,e,i,l,u,h,w,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=o[m.materialIndex],w=Math.max(m.start,f.start),E=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let y=w,R=E;y<R;y+=3){let C=y,L=y+1,F=y+2;s=ta(this,p,e,i,l,u,h,C,L,F),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let w=m,E=m+1,y=m+2;s=ta(this,o,e,i,l,u,h,w,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Hp(n,e,t,i,s,r,o,a){let c;if(e.side===hn?c=i.intersectTriangle(o,r,s,!0,a):c=i.intersectTriangle(s,r,o,e.side===Zn,a),c===null)return null;ea.copy(a),ea.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(ea);return l<t.near||l>t.far?null:{distance:l,point:ea.clone(),object:n}}function ta(n,e,t,i,s,r,o,a,c,l){n.getVertexPosition(a,$o),n.getVertexPosition(c,Jo),n.getVertexPosition(l,jo);let u=Hp(n,e,t,i,$o,Jo,jo,Oh);if(u){let h=new A;Wi.getBarycoord(Oh,$o,Jo,jo,h),s&&(u.uv=Wi.getInterpolatedAttribute(s,a,c,l,h,new je)),r&&(u.uv1=Wi.getInterpolatedAttribute(r,a,c,l,h,new je)),o&&(u.normal=Wi.getInterpolatedAttribute(o,a,c,l,h,new A),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new A,materialIndex:0};Wi.getNormal($o,Jo,jo,d.normal),u.face=d,u.barycoord=h}return u}var ai=class n extends $t{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new kt(l,3)),this.setAttribute("normal",new kt(u,3)),this.setAttribute("uv",new kt(h,2));function g(x,m,p,w,E,y,R,C,L,F,b){let S=y/L,P=R/F,U=y/2,k=R/2,q=C/2,J=L+1,K=F+1,oe=0,X=0,de=new A;for(let ge=0;ge<K;ge++){let Pe=ge*P-k;for(let et=0;et<J;et++){let vt=et*S-U;de[x]=vt*w,de[m]=Pe*E,de[p]=q,l.push(de.x,de.y,de.z),de[x]=0,de[m]=0,de[p]=C>0?1:-1,u.push(de.x,de.y,de.z),h.push(et/L),h.push(1-ge/F),oe+=1}}for(let ge=0;ge<F;ge++)for(let Pe=0;Pe<L;Pe++){let et=d+Pe+J*ge,vt=d+Pe+J*(ge+1),Et=d+(Pe+1)+J*(ge+1),ut=d+(Pe+1)+J*ge;c.push(et,vt,ut),c.push(vt,Et,ut),X+=6}a.addGroup(f,X,b),f+=X,d+=oe}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ws(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function rn(n){let e={};for(let t=0;t<n.length;t++){let i=ws(n[t]);for(let s in i)e[s]=i[s]}return e}function Vp(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Qc(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:st.workingColorSpace}var Kd={clone:ws,merge:rn},Gp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Wp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Jn=class extends _n{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Gp,this.fragmentShader=Wp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ws(e.uniforms),this.uniformsGroups=Vp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},qr=class extends At{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new We,this.projectionMatrix=new We,this.projectionMatrixInverse=new We,this.coordinateSystem=qn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Gi=new A,Bh=new je,zh=new je,Ot=class extends qr{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=_s*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(zr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return _s*2*Math.atan(Math.tan(zr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Gi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z),Gi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z)}getViewSize(e,t){return this.getViewBounds(e,Bh,zh),t.subVectors(zh,Bh)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(zr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*i/l,s*=o.width/c,i*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Xs=-90,qs=1,xa=class extends At{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ot(Xs,qs,e,t);s.layers=this.layers,this.add(s);let r=new Ot(Xs,qs,e,t);r.layers=this.layers,this.add(r);let o=new Ot(Xs,qs,e,t);o.layers=this.layers,this.add(o);let a=new Ot(Xs,qs,e,t);a.layers=this.layers,this.add(a);let c=new Ot(Xs,qs,e,t);c.layers=this.layers,this.add(c);let l=new Ot(Xs,qs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===qn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Vr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,c),e.setRenderTarget(i,4,s),e.render(t,l),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Yr=class extends Ht{constructor(e=[],t=bs,i,s,r,o,a,c,l,u){super(e,t,i,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},_a=class extends oi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Yr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ai(5,5,5),r=new Jn({name:"CubemapFromEquirect",uniforms:ws(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:hn,blending:Pi});r.uniforms.tEquirect.value=t;let o=new ze(s,r),a=t.minFilter;return t.minFilter===jn&&(t.minFilter=cn),new xa(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}},$e=class extends At{constructor(){super(),this.isGroup=!0,this.type="Group"}},Xp={type:"move"},nr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $e,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $e,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $e,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,i),p=this._getHandJoint(l,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Xp)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new $e;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}};var Zr=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ne(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Kr=class extends At{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $n,this.environmentIntensity=1,this.environmentRotation=new $n,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},ir=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=fa,this.updateRanges=[],this.version=0,this.uuid=Yn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},ln=new A,sr=class n{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)ln.fromBufferAttribute(this,t),ln.applyMatrix4(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ln.fromBufferAttribute(this,t),ln.applyNormalMatrix(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ln.fromBufferAttribute(this,t),ln.transformDirection(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Xn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=dt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Xn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Xn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Xn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Xn(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=dt(t,this.array),i=dt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=dt(t,this.array),i=dt(i,this.array),s=dt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=dt(t,this.array),i=dt(i,this.array),s=dt(s,this.array),r=dt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Bt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};var kh=new A,Hh=new lt,Vh=new lt,qp=new A,Gh=new We,na=new A,pc=new xn,Wh=new We,mc=new qi,$r=class extends ze{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Mc,this.bindMatrix=new We,this.bindMatrixInverse=new We,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new un),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,na),this.boundingBox.expandByPoint(na)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new xn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,na),this.boundingSphere.expandByPoint(na)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let i=this.material,s=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),pc.copy(this.boundingSphere),pc.applyMatrix4(s),e.ray.intersectsSphere(pc)!==!1&&(Wh.copy(s).invert(),mc.copy(e.ray).applyMatrix4(Wh),!(this.boundingBox!==null&&mc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,mc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new lt,t=this.geometry.attributes.skinWeight;for(let i=0,s=t.count;i<s;i++){e.fromBufferAttribute(t,i);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Mc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Nd?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let i=this.skeleton,s=this.geometry;Hh.fromBufferAttribute(s.attributes.skinIndex,e),Vh.fromBufferAttribute(s.attributes.skinWeight,e),kh.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=Vh.getComponent(r);if(o!==0){let a=Hh.getComponent(r);Gh.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(qp.copy(kh).applyMatrix4(Gh),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},rr=class extends At{constructor(){super(),this.isBone=!0,this.type="Bone"}},Jr=class extends Ht{constructor(e=null,t=1,i=1,s,r,o,a,c,l=Yt,u=Yt,h,d){super(null,o,a,c,l,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Xh=new We,Yp=new We,jr=class n{constructor(e=[],t=[]){this.uuid=Yn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new We)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let i=new We;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let e=this.bones,t=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:Yp;Xh.multiplyMatrices(a,t[r]),Xh.toArray(i,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new n(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let i=new Jr(t,e,e,Rn,On);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,s=e.bones.length;i<s;i++){let r=e.bones[i],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new rr),this.bones.push(o),this.boneInverses.push(new We().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,i=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=i[s];e.boneInverses.push(a.toArray())}return e}},Yi=class extends Bt{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ys=new We,qh=new We,ia=[],Yh=new un,Zp=new We,Ur=new ze,Fr=new xn,Qr=class extends ze{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Yi(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Zp)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new un),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Ys),Yh.copy(e.boundingBox).applyMatrix4(Ys),this.boundingBox.union(Yh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new xn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Ys),Fr.copy(e.boundingSphere).applyMatrix4(Ys),this.boundingSphere.union(Fr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(Ur.geometry=this.geometry,Ur.material=this.material,Ur.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Fr.copy(this.boundingSphere),Fr.applyMatrix4(i),e.ray.intersectsSphere(Fr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ys),qh.multiplyMatrices(i,Ys),Ur.matrixWorld=qh,Ur.raycast(e,ia);for(let o=0,a=ia.length;o<a;o++){let c=ia[o];c.instanceId=r,c.object=this,t.push(c)}ia.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Yi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Jr(new Float32Array(s*this.count),s,this.count,Xa,On));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<i.length;l++)o+=i[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*e;r[c]=a,r.set(i,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},gc=new A,Kp=new A,$p=new Xe,ii=class{constructor(e=new A(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=gc.subVectors(i,t).cross(Kp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(gc),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||$p.getNormalMatrix(e),s=this.coplanarPoint(gc).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ds=new xn,Jp=new je(.5,.5),sa=new A,or=class{constructor(e=new ii,t=new ii,i=new ii,s=new ii,r=new ii,o=new ii){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=qn,i=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],h=r[5],d=r[6],f=r[7],g=r[8],x=r[9],m=r[10],p=r[11],w=r[12],E=r[13],y=r[14],R=r[15];if(s[0].setComponents(l-o,f-u,p-g,R-w).normalize(),s[1].setComponents(l+o,f+u,p+g,R+w).normalize(),s[2].setComponents(l+a,f+h,p+x,R+E).normalize(),s[3].setComponents(l-a,f-h,p-x,R-E).normalize(),i)s[4].setComponents(c,d,m,y).normalize(),s[5].setComponents(l-c,f-d,p-m,R-y).normalize();else if(s[4].setComponents(l-c,f-d,p-m,R-y).normalize(),t===qn)s[5].setComponents(l+c,f+d,p+m,R+y).normalize();else if(t===Vr)s[5].setComponents(c,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ds.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ds.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ds)}intersectsSprite(e){ds.center.set(0,0,0);let t=Jp.distanceTo(e.center);return ds.radius=.7071067811865476+t,ds.applyMatrix4(e.matrixWorld),this.intersectsSphere(ds)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(sa.x=s.normal.x>0?e.max.x:e.min.x,sa.y=s.normal.y>0?e.max.y:e.min.y,sa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(sa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Zi=class extends _n{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ne(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ya=new A,va=new A,Zh=new We,Or=new qi,ra=new xn,xc=new A,Kh=new A,wi=class extends At{constructor(e=new $t,t=new Zi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)ya.fromBufferAttribute(t,s-1),va.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=ya.distanceTo(va);e.setAttribute("lineDistance",new kt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ra.copy(i.boundingSphere),ra.applyMatrix4(s),ra.radius+=r,e.ray.intersectsSphere(ra)===!1)return;Zh.copy(s).invert(),Or.copy(e.ray).applyMatrix4(Zh);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=i.index,d=i.attributes.position;if(u!==null){let f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=l){let p=u.getX(x),w=u.getX(x+1),E=oa(this,e,Or,c,p,w,x);E&&t.push(E)}if(this.isLineLoop){let x=u.getX(g-1),m=u.getX(f),p=oa(this,e,Or,c,x,m,g-1);p&&t.push(p)}}else{let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=l){let p=oa(this,e,Or,c,x,x+1,x);p&&t.push(p)}if(this.isLineLoop){let x=oa(this,e,Or,c,g-1,f,g-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function oa(n,e,t,i,s,r,o){let a=n.geometry.attributes.position;if(ya.fromBufferAttribute(a,s),va.fromBufferAttribute(a,r),t.distanceSqToSegment(ya,va,xc,Kh)>i)return;xc.applyMatrix4(n.matrixWorld);let l=e.ray.origin.distanceTo(xc);if(!(l<e.near||l>e.far))return{distance:l,point:Kh.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}var $h=new A,Jh=new A,eo=class extends wi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)$h.fromBufferAttribute(t,s),Jh.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+$h.distanceTo(Jh);e.setAttribute("lineDistance",new kt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},to=class extends wi{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},ar=class extends _n{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ne(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},jh=new We,wc=new qi,aa=new xn,la=new A,no=class extends At{constructor(e=new $t,t=new ar){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),aa.copy(i.boundingSphere),aa.applyMatrix4(s),aa.radius+=r,e.ray.intersectsSphere(aa)===!1)return;jh.copy(s).invert(),wc.copy(e.ray).applyMatrix4(jh);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=i.index,h=i.attributes.position;if(l!==null){let d=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let g=d,x=f;g<x;g++){let m=l.getX(g);la.fromBufferAttribute(h,m),Qh(la,m,c,s,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let g=d,x=f;g<x;g++)la.fromBufferAttribute(h,g),Qh(la,g,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Qh(n,e,t,i,s,r,o){let a=wc.distanceSqToPoint(n);if(a<t){let c=new A;wc.closestPointToPoint(n,c),c.applyMatrix4(i);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var io=class extends Ht{constructor(e,t,i,s,r,o,a,c,l){super(e,t,i,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},so=class extends Ht{constructor(e,t,i=Ki,s,r,o,a=Yt,c=Yt,l,u=Js,h=1){if(u!==Js&&u!==mr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,s,r,o,a,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new er(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ro=class extends Ht{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Fn=class n extends $t{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],g=0,x=[],m=i/2,p=0;w(),o===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(u),this.setAttribute("position",new kt(h,3)),this.setAttribute("normal",new kt(d,3)),this.setAttribute("uv",new kt(f,2));function w(){let y=new A,R=new A,C=0,L=(t-e)/i;for(let F=0;F<=r;F++){let b=[],S=F/r,P=S*(t-e)+e;for(let U=0;U<=s;U++){let k=U/s,q=k*c+a,J=Math.sin(q),K=Math.cos(q);R.x=P*J,R.y=-S*i+m,R.z=P*K,h.push(R.x,R.y,R.z),y.set(J,L,K).normalize(),d.push(y.x,y.y,y.z),f.push(k,1-S),b.push(g++)}x.push(b)}for(let F=0;F<s;F++)for(let b=0;b<r;b++){let S=x[b][F],P=x[b+1][F],U=x[b+1][F+1],k=x[b][F+1];(e>0||b!==0)&&(u.push(S,P,k),C+=3),(t>0||b!==r-1)&&(u.push(P,U,k),C+=3)}l.addGroup(p,C,0),p+=C}function E(y){let R=g,C=new je,L=new A,F=0,b=y===!0?e:t,S=y===!0?1:-1;for(let U=1;U<=s;U++)h.push(0,m*S,0),d.push(0,S,0),f.push(.5,.5),g++;let P=g;for(let U=0;U<=s;U++){let q=U/s*c+a,J=Math.cos(q),K=Math.sin(q);L.x=b*K,L.y=m*S,L.z=b*J,h.push(L.x,L.y,L.z),d.push(0,S,0),C.x=J*.5+.5,C.y=K*.5*S+.5,f.push(C.x,C.y),g++}for(let U=0;U<s;U++){let k=R+U,q=P+U;y===!0?u.push(q,q+1,k):u.push(q+1,q,k),F+=3}l.addGroup(p,F,y===!0?1:2),p+=F}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},lr=class n extends Fn{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var yn=class n extends $t{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),c=Math.floor(s),l=a+1,u=c+1,h=e/a,d=t/c,f=[],g=[],x=[],m=[];for(let p=0;p<u;p++){let w=p*d-o;for(let E=0;E<l;E++){let y=E*h-r;g.push(y,-w,0),x.push(0,0,1),m.push(E/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let w=0;w<a;w++){let E=w+l*p,y=w+l*(p+1),R=w+1+l*(p+1),C=w+1+l*p;f.push(E,y,C),f.push(y,R,C)}this.setIndex(f),this.setAttribute("position",new kt(g,3)),this.setAttribute("normal",new kt(x,3)),this.setAttribute("uv",new kt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};var An=class n extends $t{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(o+a,Math.PI),l=0,u=[],h=new A,d=new A,f=[],g=[],x=[],m=[];for(let p=0;p<=i;p++){let w=[],E=p/i,y=0;p===0&&o===0?y=.5/t:p===i&&c===Math.PI&&(y=-.5/t);for(let R=0;R<=t;R++){let C=R/t;h.x=-e*Math.cos(s+C*r)*Math.sin(o+E*a),h.y=e*Math.cos(o+E*a),h.z=e*Math.sin(s+C*r)*Math.sin(o+E*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),m.push(C+y,1-E),w.push(l++)}u.push(w)}for(let p=0;p<i;p++)for(let w=0;w<t;w++){let E=u[p][w+1],y=u[p][w],R=u[p+1][w],C=u[p+1][w+1];(p!==0||o>0)&&f.push(E,y,C),(p!==i-1||c<Math.PI)&&f.push(y,R,C)}this.setIndex(f),this.setAttribute("position",new kt(g,3)),this.setAttribute("normal",new kt(x,3)),this.setAttribute("uv",new kt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ae=class extends _n{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ne(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Zc,this.normalScale=new je(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $n,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},zt=class extends ae{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new je(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return tt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ne(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ne(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ne(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Ma=class extends _n{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Fd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Sa=class extends _n{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ca(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function jp(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function Qp(n){function e(s,r){return n[s]-n[r]}let t=n.length,i=new Array(t);for(let s=0;s!==t;++s)i[s]=s;return i.sort(e),i}function ed(n,e,t){let i=n.length,s=new n.constructor(i);for(let r=0,o=0;o!==i;++r){let a=t[r]*e;for(let c=0;c!==e;++c)s[o++]=n[a+c]}return s}function $d(n,e,t,i){let s=1,r=n[0];for(;r!==void 0&&r[i]===void 0;)r=n[s++];if(r===void 0)return;let o=r[i];if(o!==void 0)if(Array.isArray(o))do o=r[i],o!==void 0&&(e.push(r.time),t.push(...o)),r=n[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[i],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=n[s++];while(r!==void 0);else do o=r[i],o!==void 0&&(e.push(r.time),t.push(o)),r=n[s++];while(r!==void 0)}var Ai=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},ba=class extends Ai{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Sc,endingEnd:Sc}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case bc:r=e,a=2*t-i;break;case Ec:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case bc:o=e,c=2*i-t;break;case Ec:o=1,c=i+s[1]-s[0];break;default:o=e-1,c=t}let l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(i-t)/(s-t),x=g*g,m=x*g,p=-d*m+2*d*x-d*g,w=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*g+1,E=(-1-f)*m+(1.5+f)*x+.5*g,y=f*m-f*x;for(let R=0;R!==a;++R)r[R]=p*o[u+R]+w*o[l+R]+E*o[c+R]+y*o[h+R];return r}},Ea=class extends Ai{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(i-t)/(s-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[l+d]*h+o[c+d]*u;return r}},Ta=class extends Ai{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},vn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ca(t,this.TimeBufferType),this.values=ca(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:ca(e.times,Array),values:ca(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Ta(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ea(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ba(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case gs:t=this.InterpolantFactoryMethodDiscrete;break;case xs:t=this.InterpolantFactoryMethodLinear;break;case ua:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return gs;case this.InterpolantFactoryMethodLinear:return xs;case this.InterpolantFactoryMethodSmooth:return ua}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=i[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(s!==void 0&&jp(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===ua,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(s)c=!0;else{let h=a*i,d=h-i,f=h+i;for(let g=0;g!==i;++g){let x=t[h+g];if(x!==t[d+g]||x!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let f=0;f!==i;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};vn.prototype.ValueTypeName="";vn.prototype.TimeBufferType=Float32Array;vn.prototype.ValueBufferType=Float32Array;vn.prototype.DefaultInterpolation=xs;var Ri=class extends vn{constructor(e,t,i){super(e,t,i)}};Ri.prototype.ValueTypeName="bool";Ri.prototype.ValueBufferType=Array;Ri.prototype.DefaultInterpolation=gs;Ri.prototype.InterpolantFactoryMethodLinear=void 0;Ri.prototype.InterpolantFactoryMethodSmooth=void 0;var oo=class extends vn{constructor(e,t,i,s){super(e,t,i,s)}};oo.prototype.ValueTypeName="color";var li=class extends vn{constructor(e,t,i,s){super(e,t,i,s)}};li.prototype.ValueTypeName="number";var wa=class extends Ai{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(s-t),l=e*a;for(let u=l+a;l!==u;l+=4)Un.slerpFlat(r,0,o,l-a,o,l,c);return r}},ci=class extends vn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new wa(this.times,this.values,this.getValueSize(),e)}};ci.prototype.ValueTypeName="quaternion";ci.prototype.InterpolantFactoryMethodSmooth=void 0;var Ci=class extends vn{constructor(e,t,i){super(e,t,i)}};Ci.prototype.ValueTypeName="string";Ci.prototype.ValueBufferType=Array;Ci.prototype.DefaultInterpolation=gs;Ci.prototype.InterpolantFactoryMethodLinear=void 0;Ci.prototype.InterpolantFactoryMethodSmooth=void 0;var ui=class extends vn{constructor(e,t,i,s){super(e,t,i,s)}};ui.prototype.ValueTypeName="vector";var ao=class{constructor(e="",t=-1,i=[],s=Ud){this.name=e,this.tracks=i,this.duration=t,this.blendMode=s,this.uuid=Yn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],i=e.tracks,s=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(tm(i[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],i=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=i.length;r!==o;++r)t.push(vn.toJSON(i[r]));return s}static CreateFromMorphTargetSequence(e,t,i,s){let r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);let u=Qp(c);c=ed(c,1,u),l=ed(l,1,u),!s&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new li(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){let s=e;i=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<i.length;s++)if(i[s].name===t)return i[s];return null}static CreateClipsFromMorphTargetSequences(e,t,i){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){let l=e[a],u=l.name.match(r);if(u&&u.length>1){let h=u[1],d=s[h];d||(s[h]=d=[]),d.push(l)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,i));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let i=function(h,d,f,g,x){if(f.length!==0){let m=[],p=[];$d(f,m,p,g),m.length!==0&&x.push(new h(d,m,p))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode,c=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let d=l[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let x=0;x<d[g].morphTargets.length;x++)f[d[g].morphTargets[x]]=-1;for(let x in f){let m=[],p=[];for(let w=0;w!==d[g].morphTargets.length;++w){let E=d[g];m.push(E.time),p.push(E.morphTarget===x?1:0)}s.push(new li(".morphTargetInfluence["+x+"]",m,p))}c=f.length*o}else{let f=".bones["+t[h].name+"]";i(ui,f+".position",d,"pos",s),i(ci,f+".quaternion",d,"rot",s),i(ui,f+".scale",d,"scl",s)}}return s.length===0?null:new this(r,c,s,a)}resetDuration(){let e=this.tracks,t=0;for(let i=0,s=e.length;i!==s;++i){let r=this.tracks[i];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let i=0;i<this.tracks.length;i++)e.push(this.tracks[i].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function em(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return li;case"vector":case"vector2":case"vector3":case"vector4":return ui;case"color":return oo;case"quaternion":return ci;case"bool":case"boolean":return Ri;case"string":return Ci}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function tm(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=em(n.type);if(n.times===void 0){let t=[],i=[];$d(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}var ri={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}},Aa=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.abortController=new AbortController,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){let f=l[h],g=l[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Jd=new Aa,hi=class{constructor(e){this.manager=e!==void 0?e:Jd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};hi.DEFAULT_MATERIAL_NAME="__DEFAULT";var bi={},Ac=class extends Error{constructor(e,t){super(e),this.response=t}},cr=class extends hi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ri.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(bi[e]!==void 0){bi[e].push({onLoad:t,onProgress:i,onError:s});return}bi[e]=[],bi[e].push({onLoad:t,onProgress:i,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let u=bi[e],h=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0,x=0,m=new ReadableStream({start(p){w();function w(){h.read().then(({done:E,value:y})=>{if(E)p.close();else{x+=y.byteLength;let R=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:f});for(let C=0,L=u.length;C<L;C++){let F=u[C];F.onProgress&&F.onProgress(R)}p.enqueue(y),w()}},E=>{p.error(E)})}}});return new Response(m)}else throw new Ac(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return l.json();default:if(a==="")return l.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{ri.add(`file:${e}`,l);let u=bi[e];delete bi[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onLoad&&f.onLoad(l)}}).catch(l=>{let u=bi[e];if(u===void 0)throw this.manager.itemError(e),l;delete bi[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Zs=new WeakMap,Ra=class extends hi{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ri.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let h=Zs.get(o);h===void 0&&(h=[],Zs.set(o,h)),h.push({onLoad:t,onError:s})}return o}let a=js("img");function c(){u(),t&&t(this);let h=Zs.get(this)||[];for(let d=0;d<h.length;d++){let f=h[d];f.onLoad&&f.onLoad(this)}Zs.delete(this),r.manager.itemEnd(e)}function l(h){u(),s&&s(h),ri.remove(`image:${e}`);let d=Zs.get(this)||[];for(let f=0;f<d.length;f++){let g=d[f];g.onError&&g.onError(h)}Zs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),ri.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var lo=class extends hi{constructor(e){super(e)}load(e,t,i,s){let r=new Ht,o=new Ra(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},i,s),r}},ys=class extends At{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ne(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},co=class extends ys{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ne(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},_c=new We,td=new A,nd=new A,uo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new je(512,512),this.mapType=Qn,this.map=null,this.mapPass=null,this.matrix=new We,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new or,this._frameExtents=new je(1,1),this._viewportCount=1,this._viewports=[new lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;td.setFromMatrixPosition(e.matrixWorld),t.position.copy(td),nd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(nd),t.updateMatrixWorld(),_c.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(_c,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(_c)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Rc=class extends uo{constructor(){super(new Ot(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,i=_s*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},vs=class extends ys{constructor(e,t,i=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Rc}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},id=new We,Br=new A,yc=new A,Cc=class extends uo{constructor(){super(new Ot(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new je(4,2),this._viewportCount=6,this._viewports=[new lt(2,1,1,1),new lt(0,1,1,1),new lt(3,1,1,1),new lt(1,1,1,1),new lt(3,0,1,1),new lt(1,0,1,1)],this._cubeDirections=[new A(1,0,0),new A(-1,0,0),new A(0,0,1),new A(0,0,-1),new A(0,1,0),new A(0,-1,0)],this._cubeUps=[new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,0,1),new A(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),Br.setFromMatrixPosition(e.matrixWorld),i.position.copy(Br),yc.copy(i.position),yc.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(yc),i.updateMatrixWorld(),s.makeTranslation(-Br.x,-Br.y,-Br.z),id.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(id,i.coordinateSystem,i.reversedDepth)}},Mn=class extends ys{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Cc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Ms=class extends qr{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ic=class extends uo{constructor(){super(new Ms(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ss=class extends ys{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.shadow=new Ic}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Ii=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var vc=new WeakMap,ho=class extends hi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ri.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{if(vc.has(o)===!0)s&&s(vc.get(o)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(l),r.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return ri.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){s&&s(l),vc.set(c,l),ri.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ri.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Ca=class extends Ot{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},fo=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var eu="\\[\\]\\.:\\/",nm=new RegExp("["+eu+"]","g"),tu="[^"+eu+"]",im="[^"+eu.replace("\\.","")+"]",sm=/((?:WC+[\/:])*)/.source.replace("WC",tu),rm=/(WCOD+)?/.source.replace("WCOD",im),om=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",tu),am=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",tu),lm=new RegExp("^"+sm+rm+om+am+"$"),cm=["material","materials","bones","map"],Pc=class{constructor(e,t,i){let s=i||yt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},yt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(nm,"")}static parseTrackName(e){let t=lm.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);cm.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=i(a.children);if(c)return c}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[s];if(o===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};yt.Composite=Pc;yt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};yt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};yt.prototype.GetterByBindingType=[yt.prototype._getValue_direct,yt.prototype._getValue_array,yt.prototype._getValue_arrayElement,yt.prototype._getValue_toArray];yt.prototype.SetterByBindingTypeAndVersioning=[[yt.prototype._setValue_direct,yt.prototype._setValue_direct_setNeedsUpdate,yt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_array,yt.prototype._setValue_array_setNeedsUpdate,yt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_arrayElement,yt.prototype._setValue_arrayElement_setNeedsUpdate,yt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_fromArray,yt.prototype._setValue_fromArray_setNeedsUpdate,yt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Fv=new Float32Array(1);var sd=new We,ur=class{constructor(e,t,i=0,s=1/0){this.ray=new qi(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new tr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return sd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(sd),this}intersectObject(e,t=!0,i=[]){return Lc(e,this,i,t),i.sort(rd),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Lc(e[s],this,i,t);return i.sort(rd),i}};function rd(n,e){return n.distance-e.distance}function Lc(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let o=0,a=r.length;o<a;o++)Lc(r[o],e,t,!0)}}function nu(n,e,t,i){let s=um(i);switch(t){case Wc:return n*e;case Xa:return n*e/s.components*s.byteLength;case qa:return n*e/s.components*s.byteLength;case qc:return n*e*2/s.components*s.byteLength;case Ya:return n*e*2/s.components*s.byteLength;case Xc:return n*e*3/s.components*s.byteLength;case Rn:return n*e*4/s.components*s.byteLength;case Za:return n*e*4/s.components*s.byteLength;case mo:case go:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case xo:case _o:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case $a:case ja:return Math.max(n,16)*Math.max(e,8)/4;case Ka:case Ja:return Math.max(n,8)*Math.max(e,8)/2;case Qa:case el:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case tl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case nl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case il:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case sl:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case rl:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case ol:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case al:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case ll:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case cl:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case ul:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case hl:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case dl:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case fl:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case pl:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case ml:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case gl:case xl:case _l:return Math.ceil(n/4)*Math.ceil(e/4)*16;case yl:case vl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Ml:case Sl:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function um(n){switch(n){case Qn:case kc:return{byteLength:1,components:1};case dr:case Hc:case fr:return{byteLength:2,components:1};case Ga:case Wa:return{byteLength:2,components:4};case Ki:case Va:case On:return{byteLength:4,components:1};case Vc:case Gc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function Sf(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function dm(n){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,h=l.byteLength,d=n.createBuffer();n.bindBuffer(c,d),n.bufferData(c,l,u),a.onUploadCallback();let f;if(l instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=n.SHORT;else if(l instanceof Uint32Array)f=n.UNSIGNED_INT;else if(l instanceof Int32Array)f=n.INT;else if(l instanceof Int8Array)f=n.BYTE;else if(l instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,c,l){let u=c.array,h=c.updateRanges;if(n.bindBuffer(l,a),h.length===0)n.bufferSubData(l,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){let g=h[d],x=h[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,h[d]=x)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){let x=h[f];n.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var fm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,pm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,mm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,xm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_m=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ym=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,vm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Mm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Sm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,bm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Em=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Tm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,wm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Am=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Rm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Cm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Im=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Pm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Lm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Dm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Nm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Um=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Fm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Om=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Bm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,zm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,km=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Hm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Vm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Gm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Xm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,qm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Ym=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Zm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Km=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,$m=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Jm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,jm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,eg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,tg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ng=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ig=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,sg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,rg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,og=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ag=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,cg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ug=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,hg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,dg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,fg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,pg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,mg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,gg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,xg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_g=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,yg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,vg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Mg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Sg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Eg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Tg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ag=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Cg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ig=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Pg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Lg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ng=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Ug=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Fg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Og=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Bg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,kg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Hg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Vg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Gg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Wg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,qg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Yg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Zg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Kg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,$g=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Jg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,jg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Qg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,e0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,t0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,n0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,i0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,s0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,r0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,o0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,a0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,l0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,c0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,u0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,h0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,d0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,f0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,p0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,m0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,g0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,x0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,y0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,v0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,M0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,S0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,b0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,E0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,T0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,w0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,A0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,C0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,I0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,P0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,D0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,N0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,U0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,O0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,B0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,z0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,k0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,H0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,V0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,G0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,W0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ze={alphahash_fragment:fm,alphahash_pars_fragment:pm,alphamap_fragment:mm,alphamap_pars_fragment:gm,alphatest_fragment:xm,alphatest_pars_fragment:_m,aomap_fragment:ym,aomap_pars_fragment:vm,batching_pars_vertex:Mm,batching_vertex:Sm,begin_vertex:bm,beginnormal_vertex:Em,bsdfs:Tm,iridescence_fragment:wm,bumpmap_pars_fragment:Am,clipping_planes_fragment:Rm,clipping_planes_pars_fragment:Cm,clipping_planes_pars_vertex:Im,clipping_planes_vertex:Pm,color_fragment:Lm,color_pars_fragment:Dm,color_pars_vertex:Nm,color_vertex:Um,common:Fm,cube_uv_reflection_fragment:Om,defaultnormal_vertex:Bm,displacementmap_pars_vertex:zm,displacementmap_vertex:km,emissivemap_fragment:Hm,emissivemap_pars_fragment:Vm,colorspace_fragment:Gm,colorspace_pars_fragment:Wm,envmap_fragment:Xm,envmap_common_pars_fragment:qm,envmap_pars_fragment:Ym,envmap_pars_vertex:Zm,envmap_physical_pars_fragment:rg,envmap_vertex:Km,fog_vertex:$m,fog_pars_vertex:Jm,fog_fragment:jm,fog_pars_fragment:Qm,gradientmap_pars_fragment:eg,lightmap_pars_fragment:tg,lights_lambert_fragment:ng,lights_lambert_pars_fragment:ig,lights_pars_begin:sg,lights_toon_fragment:og,lights_toon_pars_fragment:ag,lights_phong_fragment:lg,lights_phong_pars_fragment:cg,lights_physical_fragment:ug,lights_physical_pars_fragment:hg,lights_fragment_begin:dg,lights_fragment_maps:fg,lights_fragment_end:pg,logdepthbuf_fragment:mg,logdepthbuf_pars_fragment:gg,logdepthbuf_pars_vertex:xg,logdepthbuf_vertex:_g,map_fragment:yg,map_pars_fragment:vg,map_particle_fragment:Mg,map_particle_pars_fragment:Sg,metalnessmap_fragment:bg,metalnessmap_pars_fragment:Eg,morphinstance_vertex:Tg,morphcolor_vertex:wg,morphnormal_vertex:Ag,morphtarget_pars_vertex:Rg,morphtarget_vertex:Cg,normal_fragment_begin:Ig,normal_fragment_maps:Pg,normal_pars_fragment:Lg,normal_pars_vertex:Dg,normal_vertex:Ng,normalmap_pars_fragment:Ug,clearcoat_normal_fragment_begin:Fg,clearcoat_normal_fragment_maps:Og,clearcoat_pars_fragment:Bg,iridescence_pars_fragment:zg,opaque_fragment:kg,packing:Hg,premultiplied_alpha_fragment:Vg,project_vertex:Gg,dithering_fragment:Wg,dithering_pars_fragment:Xg,roughnessmap_fragment:qg,roughnessmap_pars_fragment:Yg,shadowmap_pars_fragment:Zg,shadowmap_pars_vertex:Kg,shadowmap_vertex:$g,shadowmask_pars_fragment:Jg,skinbase_vertex:jg,skinning_pars_vertex:Qg,skinning_vertex:e0,skinnormal_vertex:t0,specularmap_fragment:n0,specularmap_pars_fragment:i0,tonemapping_fragment:s0,tonemapping_pars_fragment:r0,transmission_fragment:o0,transmission_pars_fragment:a0,uv_pars_fragment:l0,uv_pars_vertex:c0,uv_vertex:u0,worldpos_vertex:h0,background_vert:d0,background_frag:f0,backgroundCube_vert:p0,backgroundCube_frag:m0,cube_vert:g0,cube_frag:x0,depth_vert:_0,depth_frag:y0,distanceRGBA_vert:v0,distanceRGBA_frag:M0,equirect_vert:S0,equirect_frag:b0,linedashed_vert:E0,linedashed_frag:T0,meshbasic_vert:w0,meshbasic_frag:A0,meshlambert_vert:R0,meshlambert_frag:C0,meshmatcap_vert:I0,meshmatcap_frag:P0,meshnormal_vert:L0,meshnormal_frag:D0,meshphong_vert:N0,meshphong_frag:U0,meshphysical_vert:F0,meshphysical_frag:O0,meshtoon_vert:B0,meshtoon_frag:z0,points_vert:k0,points_frag:H0,shadow_vert:V0,shadow_frag:G0,sprite_vert:W0,sprite_frag:X0},he={common:{diffuse:{value:new Ne(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new je(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ne(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ne(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new Ne(16777215)},opacity:{value:1},center:{value:new je(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},fi={basic:{uniforms:rn([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.fog]),vertexShader:Ze.meshbasic_vert,fragmentShader:Ze.meshbasic_frag},lambert:{uniforms:rn([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Ne(0)}}]),vertexShader:Ze.meshlambert_vert,fragmentShader:Ze.meshlambert_frag},phong:{uniforms:rn([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Ne(0)},specular:{value:new Ne(1118481)},shininess:{value:30}}]),vertexShader:Ze.meshphong_vert,fragmentShader:Ze.meshphong_frag},standard:{uniforms:rn([he.common,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.roughnessmap,he.metalnessmap,he.fog,he.lights,{emissive:{value:new Ne(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag},toon:{uniforms:rn([he.common,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.gradientmap,he.fog,he.lights,{emissive:{value:new Ne(0)}}]),vertexShader:Ze.meshtoon_vert,fragmentShader:Ze.meshtoon_frag},matcap:{uniforms:rn([he.common,he.bumpmap,he.normalmap,he.displacementmap,he.fog,{matcap:{value:null}}]),vertexShader:Ze.meshmatcap_vert,fragmentShader:Ze.meshmatcap_frag},points:{uniforms:rn([he.points,he.fog]),vertexShader:Ze.points_vert,fragmentShader:Ze.points_frag},dashed:{uniforms:rn([he.common,he.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ze.linedashed_vert,fragmentShader:Ze.linedashed_frag},depth:{uniforms:rn([he.common,he.displacementmap]),vertexShader:Ze.depth_vert,fragmentShader:Ze.depth_frag},normal:{uniforms:rn([he.common,he.bumpmap,he.normalmap,he.displacementmap,{opacity:{value:1}}]),vertexShader:Ze.meshnormal_vert,fragmentShader:Ze.meshnormal_frag},sprite:{uniforms:rn([he.sprite,he.fog]),vertexShader:Ze.sprite_vert,fragmentShader:Ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ze.background_vert,fragmentShader:Ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:Ze.backgroundCube_vert,fragmentShader:Ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ze.cube_vert,fragmentShader:Ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ze.equirect_vert,fragmentShader:Ze.equirect_frag},distanceRGBA:{uniforms:rn([he.common,he.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ze.distanceRGBA_vert,fragmentShader:Ze.distanceRGBA_frag},shadow:{uniforms:rn([he.lights,he.fog,{color:{value:new Ne(0)},opacity:{value:1}}]),vertexShader:Ze.shadow_vert,fragmentShader:Ze.shadow_frag}};fi.physical={uniforms:rn([fi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new je(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new Ne(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new je},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new Ne(0)},specularColor:{value:new Ne(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new je},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag};var bl={r:0,b:0,g:0},As=new $n,q0=new We;function Y0(n,e,t,i,s,r,o){let a=new Ne(0),c=r===!0?0:1,l,u,h=null,d=0,f=null;function g(E){let y=E.isScene===!0?E.background:null;return y&&y.isTexture&&(y=(E.backgroundBlurriness>0?t:e).get(y)),y}function x(E){let y=!1,R=g(E);R===null?p(a,c):R&&R.isColor&&(p(R,1),y=!0);let C=n.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||y)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(E,y){let R=g(y);R&&(R.isCubeTexture||R.mapping===po)?(u===void 0&&(u=new ze(new ai(1,1,1),new Jn({name:"BackgroundCubeMaterial",uniforms:ws(fi.backgroundCube.uniforms),vertexShader:fi.backgroundCube.vertexShader,fragmentShader:fi.backgroundCube.fragmentShader,side:hn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,L,F){this.matrixWorld.copyPosition(F.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),As.copy(y.backgroundRotation),As.x*=-1,As.y*=-1,As.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(As.y*=-1,As.z*=-1),u.material.uniforms.envMap.value=R,u.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(q0.makeRotationFromEuler(As)),u.material.toneMapped=st.getTransfer(R.colorSpace)!==ft,(h!==R||d!==R.version||f!==n.toneMapping)&&(u.material.needsUpdate=!0,h=R,d=R.version,f=n.toneMapping),u.layers.enableAll(),E.unshift(u,u.geometry,u.material,0,0,null)):R&&R.isTexture&&(l===void 0&&(l=new ze(new yn(2,2),new Jn({name:"BackgroundMaterial",uniforms:ws(fi.background.uniforms),vertexShader:fi.background.vertexShader,fragmentShader:fi.background.fragmentShader,side:Zn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=R,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=st.getTransfer(R.colorSpace)!==ft,R.matrixAutoUpdate===!0&&R.updateMatrix(),l.material.uniforms.uvTransform.value.copy(R.matrix),(h!==R||d!==R.version||f!==n.toneMapping)&&(l.material.needsUpdate=!0,h=R,d=R.version,f=n.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function p(E,y){E.getRGB(bl,Qc(n)),i.buffers.color.setClear(bl.r,bl.g,bl.b,y,o)}function w(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,y=1){a.set(E),c=y,p(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(E){c=E,p(a,c)},render:x,addToRenderList:m,dispose:w}}function Z0(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,o=!1;function a(S,P,U,k,q){let J=!1,K=h(k,U,P);r!==K&&(r=K,l(r.object)),J=f(S,k,U,q),J&&g(S,k,U,q),q!==null&&e.update(q,n.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,y(S,P,U,k),q!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function c(){return n.createVertexArray()}function l(S){return n.bindVertexArray(S)}function u(S){return n.deleteVertexArray(S)}function h(S,P,U){let k=U.wireframe===!0,q=i[S.id];q===void 0&&(q={},i[S.id]=q);let J=q[P.id];J===void 0&&(J={},q[P.id]=J);let K=J[k];return K===void 0&&(K=d(c()),J[k]=K),K}function d(S){let P=[],U=[],k=[];for(let q=0;q<t;q++)P[q]=0,U[q]=0,k[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:U,attributeDivisors:k,object:S,attributes:{},index:null}}function f(S,P,U,k){let q=r.attributes,J=P.attributes,K=0,oe=U.getAttributes();for(let X in oe)if(oe[X].location>=0){let ge=q[X],Pe=J[X];if(Pe===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(Pe=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(Pe=S.instanceColor)),ge===void 0||ge.attribute!==Pe||Pe&&ge.data!==Pe.data)return!0;K++}return r.attributesNum!==K||r.index!==k}function g(S,P,U,k){let q={},J=P.attributes,K=0,oe=U.getAttributes();for(let X in oe)if(oe[X].location>=0){let ge=J[X];ge===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(ge=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(ge=S.instanceColor));let Pe={};Pe.attribute=ge,ge&&ge.data&&(Pe.data=ge.data),q[X]=Pe,K++}r.attributes=q,r.attributesNum=K,r.index=k}function x(){let S=r.newAttributes;for(let P=0,U=S.length;P<U;P++)S[P]=0}function m(S){p(S,0)}function p(S,P){let U=r.newAttributes,k=r.enabledAttributes,q=r.attributeDivisors;U[S]=1,k[S]===0&&(n.enableVertexAttribArray(S),k[S]=1),q[S]!==P&&(n.vertexAttribDivisor(S,P),q[S]=P)}function w(){let S=r.newAttributes,P=r.enabledAttributes;for(let U=0,k=P.length;U<k;U++)P[U]!==S[U]&&(n.disableVertexAttribArray(U),P[U]=0)}function E(S,P,U,k,q,J,K){K===!0?n.vertexAttribIPointer(S,P,U,q,J):n.vertexAttribPointer(S,P,U,k,q,J)}function y(S,P,U,k){x();let q=k.attributes,J=U.getAttributes(),K=P.defaultAttributeValues;for(let oe in J){let X=J[oe];if(X.location>=0){let de=q[oe];if(de===void 0&&(oe==="instanceMatrix"&&S.instanceMatrix&&(de=S.instanceMatrix),oe==="instanceColor"&&S.instanceColor&&(de=S.instanceColor)),de!==void 0){let ge=de.normalized,Pe=de.itemSize,et=e.get(de);if(et===void 0)continue;let vt=et.buffer,Et=et.type,ut=et.bytesPerElement,j=Et===n.INT||Et===n.UNSIGNED_INT||de.gpuType===Va;if(de.isInterleavedBufferAttribute){let te=de.data,ve=te.stride,ke=de.offset;if(te.isInstancedInterleavedBuffer){for(let Ce=0;Ce<X.locationSize;Ce++)p(X.location+Ce,te.meshPerAttribute);S.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Ce=0;Ce<X.locationSize;Ce++)m(X.location+Ce);n.bindBuffer(n.ARRAY_BUFFER,vt);for(let Ce=0;Ce<X.locationSize;Ce++)E(X.location+Ce,Pe/X.locationSize,Et,ge,ve*ut,(ke+Pe/X.locationSize*Ce)*ut,j)}else{if(de.isInstancedBufferAttribute){for(let te=0;te<X.locationSize;te++)p(X.location+te,de.meshPerAttribute);S.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let te=0;te<X.locationSize;te++)m(X.location+te);n.bindBuffer(n.ARRAY_BUFFER,vt);for(let te=0;te<X.locationSize;te++)E(X.location+te,Pe/X.locationSize,Et,ge,Pe*ut,Pe/X.locationSize*te*ut,j)}}else if(K!==void 0){let ge=K[oe];if(ge!==void 0)switch(ge.length){case 2:n.vertexAttrib2fv(X.location,ge);break;case 3:n.vertexAttrib3fv(X.location,ge);break;case 4:n.vertexAttrib4fv(X.location,ge);break;default:n.vertexAttrib1fv(X.location,ge)}}}}w()}function R(){F();for(let S in i){let P=i[S];for(let U in P){let k=P[U];for(let q in k)u(k[q].object),delete k[q];delete P[U]}delete i[S]}}function C(S){if(i[S.id]===void 0)return;let P=i[S.id];for(let U in P){let k=P[U];for(let q in k)u(k[q].object),delete k[q];delete P[U]}delete i[S.id]}function L(S){for(let P in i){let U=i[P];if(U[S.id]===void 0)continue;let k=U[S.id];for(let q in k)u(k[q].object),delete k[q];delete U[S.id]}}function F(){b(),o=!0,r!==s&&(r=s,l(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:F,resetDefaultState:b,dispose:R,releaseStatesOfGeometry:C,releaseStatesOfProgram:L,initAttributes:x,enableAttribute:m,disableUnusedAttributes:w}}function K0(n,e,t){let i;function s(l){i=l}function r(l,u){n.drawArrays(i,l,u),t.update(u,i,1)}function o(l,u,h){h!==0&&(n.drawArraysInstanced(i,l,u,h),t.update(u,i,h))}function a(l,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];t.update(f,i,1)}function c(l,u,h,d){if(h===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<l.length;g++)o(l[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(i,l,0,u,0,d,0,h);let g=0;for(let x=0;x<h;x++)g+=u[x]*d[x];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function $0(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let L=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(L){return!(L!==Rn&&i.convert(L)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(L){let F=L===fr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(L!==Qn&&i.convert(L)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&L!==On&&!F)}function c(L){if(L==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";L="mediump"}return L==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,C=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:w,maxVaryings:E,maxFragmentUniforms:y,vertexTextures:R,maxSamples:C}}function J0(n){let e=this,t=null,i=0,s=!1,r=!1,o=new ii,a=new Xe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||i!==0||s;return s=d,i=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,p=n.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):l();else{let w=r?0:i,E=w*4,y=p.clippingState||null;c.value=y,y=u(g,d,E,f);for(let R=0;R!==E;++R)y[R]=t[R];p.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,f,g){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let p=f+x*4,w=d.matrixWorldInverse;a.getNormalMatrix(w),(m===null||m.length<p)&&(m=new Float32Array(p));for(let E=0,y=f;E!==x;++E,y+=4)o.copy(h[E]).applyMatrix4(w,a),o.normal.toArray(m,y),m[y+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function j0(n){let e=new WeakMap;function t(o,a){return a===za?o.mapping=bs:a===ka&&(o.mapping=Es),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===za||a===ka)if(e.has(o)){let c=e.get(o).texture;return t(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=new _a(c.height);return l.fromEquirectangularTexture(n,o),e.set(o,l),o.addEventListener("dispose",s),t(l.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}var yr=4,jd=[.125,.215,.35,.446,.526,.582],Is=20,iu=new Ms,Qd=new Ne,su=null,ru=0,ou=0,au=!1,Cs=(1+Math.sqrt(5))/2,_r=1/Cs,ef=[new A(-Cs,_r,0),new A(Cs,_r,0),new A(-_r,0,Cs),new A(_r,0,Cs),new A(0,Cs,-_r),new A(0,Cs,_r),new A(-1,1,-1),new A(1,1,-1),new A(-1,1,1),new A(1,1,1)],Q0=new A,wl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100,r={}){let{size:o=256,position:a=Q0}=r;su=this._renderer.getRenderTarget(),ru=this._renderer.getActiveCubeFace(),ou=this._renderer.getActiveMipmapLevel(),au=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,s,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=nf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(su,ru,ou),this._renderer.xr.enabled=au,e.scissorTest=!1,El(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===bs||e.mapping===Es?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),su=this._renderer.getRenderTarget(),ru=this._renderer.getActiveCubeFace(),ou=this._renderer.getActiveMipmapLevel(),au=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:cn,minFilter:cn,generateMipmaps:!1,type:fr,format:Rn,colorSpace:Zt,depthBuffer:!1},s=tf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=tf(e,t,i);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ex(r)),this._blurMaterial=tx(r,e,t)}return s}_compileMaterial(e){let t=new ze(this._lodPlanes[0],e);this._renderer.compile(t,iu)}_sceneToCubeUV(e,t,i,s,r){let c=new Ot(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(Qd),h.toneMapping=Li,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));let x=new Kt({name:"PMREM.Background",side:hn,depthWrite:!1,depthTest:!1}),m=new ze(new ai,x),p=!1,w=e.background;w?w.isColor&&(x.color.copy(w),e.background=null,p=!0):(x.color.copy(Qd),p=!0);for(let E=0;E<6;E++){let y=E%3;y===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[E],r.y,r.z)):y===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[E]));let R=this._cubeSize;El(s,y*R,E>2?R:0,R,R),h.setRenderTarget(s),p&&h.render(m,c),h.render(e,c)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=w}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===bs||e.mapping===Es;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=sf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=nf());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new ze(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;El(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,iu)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=ef[(s-r-1)%ef.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new ze(this._lodPlanes[s],l),d=l.uniforms,f=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Is-1),x=r/g,m=isFinite(r)?1+Math.floor(u*x):Is;m>Is&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Is}`);let p=[],w=0;for(let L=0;L<Is;++L){let F=L/x,b=Math.exp(-F*F/2);p.push(b),L===0?w+=b:L<m&&(w+=2*b)}for(let L=0;L<p.length;L++)p[L]=p[L]/w;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:E}=this;d.dTheta.value=g,d.mipInt.value=E-i;let y=this._sizeLods[s],R=3*y*(s>E-yr?s-E+yr:0),C=4*(this._cubeSize-y);El(t,R,C,3*y,2*y),c.setRenderTarget(t),c.render(h,iu)}};function ex(n){let e=[],t=[],i=[],s=n,r=n-yr+1+jd.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let c=1/a;o>n-yr?c=jd[o-n+yr-1]:o===0&&(c=0),i.push(c);let l=1/(a-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,x=3,m=2,p=1,w=new Float32Array(x*g*f),E=new Float32Array(m*g*f),y=new Float32Array(p*g*f);for(let C=0;C<f;C++){let L=C%3*2/3-1,F=C>2?0:-1,b=[L,F,0,L+2/3,F,0,L+2/3,F+1,0,L,F,0,L+2/3,F+1,0,L,F+1,0];w.set(b,x*g*C),E.set(d,m*g*C);let S=[C,C,C,C,C,C];y.set(S,p*g*C)}let R=new $t;R.setAttribute("position",new Bt(w,x)),R.setAttribute("uv",new Bt(E,m)),R.setAttribute("faceIndex",new Bt(y,p)),e.push(R),s>yr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function tf(n,e,t){let i=new oi(n,e,t);return i.texture.mapping=po,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function El(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function tx(n,e,t){let i=new Float32Array(Is),s=new A(0,1,0);return new Jn({name:"SphericalGaussianBlur",defines:{n:Is,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:xu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function nf(){return new Jn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:xu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function sf(){return new Jn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:xu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function xu(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function nx(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let c=a.mapping,l=c===za||c===ka,u=c===bs||c===Es;if(l||u){let h=e.get(a),d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new wl(n)),h=l?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let f=a.image;return l&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new wl(n)),h=l?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let c=0,l=6;for(let u=0;u<l;u++)a[u]!==void 0&&c++;return c===l}function r(a){let c=a.target;c.removeEventListener("dispose",r);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function ix(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&Qs("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function sx(n,e,t,i){let s={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function c(h){let d=h.attributes;for(let f in d)e.update(d[f],n.ARRAY_BUFFER)}function l(h){let d=[],f=h.index,g=h.attributes.position,x=0;if(f!==null){let w=f.array;x=f.version;for(let E=0,y=w.length;E<y;E+=3){let R=w[E+0],C=w[E+1],L=w[E+2];d.push(R,C,C,L,L,R)}}else if(g!==void 0){let w=g.array;x=g.version;for(let E=0,y=w.length/3-1;E<y;E+=3){let R=E+0,C=E+1,L=E+2;d.push(R,C,C,L,L,R)}}else return;let m=new(jc(d)?Xr:Wr)(d,1);m.version=x;let p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function rx(n,e,t){let i;function s(d){i=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,f){n.drawElements(i,f,r,d*o),t.update(f,i,1)}function l(d,f,g){g!==0&&(n.drawElementsInstanced(i,f,r,d*o,g),t.update(f,i,g))}function u(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,i,1)}function h(d,f,g,x){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)l(d[p]/o,f[p],x[p]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,r,d,0,x,0,g);let p=0;for(let w=0;w<g;w++)p+=f[w]*x[w];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function ox(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function ax(n,e,t){let i=new WeakMap,s=new lt;function r(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(a);if(d===void 0||d.count!==h){let b=function(){L.dispose(),i.delete(a),a.removeEventListener("dispose",b)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],w=a.morphAttributes.color||[],E=0;f===!0&&(E=1),g===!0&&(E=2),x===!0&&(E=3);let y=a.attributes.position.count*E,R=1;y>e.maxTextureSize&&(R=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let C=new Float32Array(y*R*4*h),L=new Gr(C,y,R,h);L.type=On,L.needsUpdate=!0;let F=E*4;for(let S=0;S<h;S++){let P=m[S],U=p[S],k=w[S],q=y*R*4*S;for(let J=0;J<P.count;J++){let K=J*F;f===!0&&(s.fromBufferAttribute(P,J),C[q+K+0]=s.x,C[q+K+1]=s.y,C[q+K+2]=s.z,C[q+K+3]=0),g===!0&&(s.fromBufferAttribute(U,J),C[q+K+4]=s.x,C[q+K+5]=s.y,C[q+K+6]=s.z,C[q+K+7]=0),x===!0&&(s.fromBufferAttribute(k,J),C[q+K+8]=s.x,C[q+K+9]=s.y,C[q+K+10]=s.z,C[q+K+11]=k.itemSize===4?s.w:1)}}d={count:h,texture:L,size:new je(y,R)},i.set(a,d),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let x=0;x<l.length;x++)f+=l[x];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(n,"morphTargetBaseInfluence",g),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function lx(n,e,t,i){let s=new WeakMap;function r(c){let l=i.render.frame,u=c.geometry,h=e.get(c,u);if(s.get(h)!==l&&(e.update(h),s.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let d=c.skeleton;s.get(d)!==l&&(d.update(),s.set(d,l))}return h}function o(){s=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}var bf=new Ht,rf=new so(1,1),Ef=new Gr,Tf=new ga,wf=new Yr,of=[],af=[],lf=new Float32Array(16),cf=new Float32Array(9),uf=new Float32Array(4);function Mr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=of[s];if(r===void 0&&(r=new Float32Array(s),of[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Vt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Gt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Rl(n,e){let t=af[e];t===void 0&&(t=new Int32Array(e),af[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function cx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function ux(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;n.uniform2fv(this.addr,e),Gt(t,e)}}function hx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Vt(t,e))return;n.uniform3fv(this.addr,e),Gt(t,e)}}function dx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;n.uniform4fv(this.addr,e),Gt(t,e)}}function fx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Vt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Gt(t,e)}else{if(Vt(t,i))return;uf.set(i),n.uniformMatrix2fv(this.addr,!1,uf),Gt(t,i)}}function px(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Vt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Gt(t,e)}else{if(Vt(t,i))return;cf.set(i),n.uniformMatrix3fv(this.addr,!1,cf),Gt(t,i)}}function mx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Vt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Gt(t,e)}else{if(Vt(t,i))return;lf.set(i),n.uniformMatrix4fv(this.addr,!1,lf),Gt(t,i)}}function gx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function xx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;n.uniform2iv(this.addr,e),Gt(t,e)}}function _x(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Vt(t,e))return;n.uniform3iv(this.addr,e),Gt(t,e)}}function yx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;n.uniform4iv(this.addr,e),Gt(t,e)}}function vx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Mx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;n.uniform2uiv(this.addr,e),Gt(t,e)}}function Sx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Vt(t,e))return;n.uniform3uiv(this.addr,e),Gt(t,e)}}function bx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;n.uniform4uiv(this.addr,e),Gt(t,e)}}function Ex(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(rf.compareFunction=Kc,r=rf):r=bf,t.setTexture2D(e||r,s)}function Tx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Tf,s)}function wx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||wf,s)}function Ax(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Ef,s)}function Rx(n){switch(n){case 5126:return cx;case 35664:return ux;case 35665:return hx;case 35666:return dx;case 35674:return fx;case 35675:return px;case 35676:return mx;case 5124:case 35670:return gx;case 35667:case 35671:return xx;case 35668:case 35672:return _x;case 35669:case 35673:return yx;case 5125:return vx;case 36294:return Mx;case 36295:return Sx;case 36296:return bx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ex;case 35679:case 36299:case 36307:return Tx;case 35680:case 36300:case 36308:case 36293:return wx;case 36289:case 36303:case 36311:case 36292:return Ax}}function Cx(n,e){n.uniform1fv(this.addr,e)}function Ix(n,e){let t=Mr(e,this.size,2);n.uniform2fv(this.addr,t)}function Px(n,e){let t=Mr(e,this.size,3);n.uniform3fv(this.addr,t)}function Lx(n,e){let t=Mr(e,this.size,4);n.uniform4fv(this.addr,t)}function Dx(n,e){let t=Mr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Nx(n,e){let t=Mr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Ux(n,e){let t=Mr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Fx(n,e){n.uniform1iv(this.addr,e)}function Ox(n,e){n.uniform2iv(this.addr,e)}function Bx(n,e){n.uniform3iv(this.addr,e)}function zx(n,e){n.uniform4iv(this.addr,e)}function kx(n,e){n.uniform1uiv(this.addr,e)}function Hx(n,e){n.uniform2uiv(this.addr,e)}function Vx(n,e){n.uniform3uiv(this.addr,e)}function Gx(n,e){n.uniform4uiv(this.addr,e)}function Wx(n,e,t){let i=this.cache,s=e.length,r=Rl(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||bf,r[o])}function Xx(n,e,t){let i=this.cache,s=e.length,r=Rl(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Tf,r[o])}function qx(n,e,t){let i=this.cache,s=e.length,r=Rl(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||wf,r[o])}function Yx(n,e,t){let i=this.cache,s=e.length,r=Rl(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Ef,r[o])}function Zx(n){switch(n){case 5126:return Cx;case 35664:return Ix;case 35665:return Px;case 35666:return Lx;case 35674:return Dx;case 35675:return Nx;case 35676:return Ux;case 5124:case 35670:return Fx;case 35667:case 35671:return Ox;case 35668:case 35672:return Bx;case 35669:case 35673:return zx;case 5125:return kx;case 36294:return Hx;case 36295:return Vx;case 36296:return Gx;case 35678:case 36198:case 36298:case 36306:case 35682:return Wx;case 35679:case 36299:case 36307:return Xx;case 35680:case 36300:case 36308:case 36293:return qx;case 36289:case 36303:case 36311:case 36292:return Yx}}var cu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Rx(t.type)}},uu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Zx(t.type)}},hu=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},lu=/(\w+)(\])?(\[|\.)?/g;function hf(n,e){n.seq.push(e),n.map[e.id]=e}function Kx(n,e,t){let i=n.name,s=i.length;for(lu.lastIndex=0;;){let r=lu.exec(i),o=lu.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){hf(t,l===void 0?new cu(a,n,e):new uu(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new hu(a),hf(t,h)),t=h}}}var vr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Kx(r,o,this)}}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function df(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var $x=37297,Jx=0;function jx(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var ff=new Xe;function Qx(n){st._getMatrix(ff,st.workingColorSpace,n);let e=`mat3( ${ff.elements.map(t=>t.toFixed(4))} )`;switch(st.getTransfer(n)){case Hr:return[e,"LinearTransferOETF"];case ft:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function pf(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+jx(n.getShaderSource(e),a)}else return r}function e_(n,e){let t=Qx(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function t_(n,e){let t;switch(e){case Rd:t="Linear";break;case Cd:t="Reinhard";break;case Id:t="Cineon";break;case Ba:t="ACESFilmic";break;case Ld:t="AgX";break;case Dd:t="Neutral";break;case Pd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Tl=new A;function n_(){st.getLuminanceCoefficients(Tl);let n=Tl.x.toFixed(4),e=Tl.y.toFixed(4),t=Tl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function i_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(vo).join(`
`)}function s_(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function r_(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function vo(n){return n!==""}function mf(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function gf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var o_=/^[ \t]*#include +<([\w\d./]+)>/gm;function du(n){return n.replace(o_,l_)}var a_=new Map;function l_(n,e){let t=Ze[e];if(t===void 0){let i=a_.get(e);if(i!==void 0)t=Ze[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return du(t)}var c_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function xf(n){return n.replace(c_,u_)}function u_(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function _f(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function h_(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Nc?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Ia?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===di&&(e="SHADOWMAP_TYPE_VSM"),e}function d_(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case bs:case Es:e="ENVMAP_TYPE_CUBE";break;case po:e="ENVMAP_TYPE_CUBE_UV";break}return e}function f_(n){let e="ENVMAP_MODE_REFLECTION";return n.envMap&&n.envMapMode===Es&&(e="ENVMAP_MODE_REFRACTION"),e}function p_(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Bc:e="ENVMAP_BLENDING_MULTIPLY";break;case wd:e="ENVMAP_BLENDING_MIX";break;case Ad:e="ENVMAP_BLENDING_ADD";break}return e}function m_(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function g_(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=h_(t),l=d_(t),u=f_(t),h=p_(t),d=m_(t),f=i_(t),g=s_(r),x=s.createProgram(),m,p,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(vo).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(vo).join(`
`),p.length>0&&(p+=`
`)):(m=[_f(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vo).join(`
`),p=[_f(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Li?"#define TONE_MAPPING":"",t.toneMapping!==Li?Ze.tonemapping_pars_fragment:"",t.toneMapping!==Li?t_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ze.colorspace_pars_fragment,e_("linearToOutputTexel",t.outputColorSpace),n_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(vo).join(`
`)),o=du(o),o=mf(o,t),o=gf(o,t),a=du(a),a=mf(a,t),a=gf(a,t),o=xf(o),a=xf(a),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===$c?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===$c?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let E=w+m+o,y=w+p+a,R=df(s,s.VERTEX_SHADER,E),C=df(s,s.FRAGMENT_SHADER,y);s.attachShader(x,R),s.attachShader(x,C),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function L(P){if(n.debug.checkShaderErrors){let U=s.getProgramInfoLog(x)||"",k=s.getShaderInfoLog(R)||"",q=s.getShaderInfoLog(C)||"",J=U.trim(),K=k.trim(),oe=q.trim(),X=!0,de=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(X=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,R,C);else{let ge=pf(s,R,"vertex"),Pe=pf(s,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+J+`
`+ge+`
`+Pe)}else J!==""?console.warn("THREE.WebGLProgram: Program Info Log:",J):(K===""||oe==="")&&(de=!1);de&&(P.diagnostics={runnable:X,programLog:J,vertexShader:{log:K,prefix:m},fragmentShader:{log:oe,prefix:p}})}s.deleteShader(R),s.deleteShader(C),F=new vr(s,x),b=r_(s,x)}let F;this.getUniforms=function(){return F===void 0&&L(this),F};let b;this.getAttributes=function(){return b===void 0&&L(this),b};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(x,$x)),S},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Jx++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=R,this.fragmentShader=C,this}var x_=0,fu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new pu(e),t.set(e,i)),i}},pu=class{constructor(e){this.id=x_++,this.code=e,this.usedTimes=0}};function __(n,e,t,i,s,r,o){let a=new tr,c=new fu,l=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures,f=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(b){return l.add(b),b===0?"uv":`uv${b}`}function m(b,S,P,U,k){let q=U.fog,J=k.geometry,K=b.isMeshStandardMaterial?U.environment:null,oe=(b.isMeshStandardMaterial?t:e).get(b.envMap||K),X=oe&&oe.mapping===po?oe.image.height:null,de=g[b.type];b.precision!==null&&(f=s.getMaxPrecision(b.precision),f!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",f,"instead."));let ge=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Pe=ge!==void 0?ge.length:0,et=0;J.morphAttributes.position!==void 0&&(et=1),J.morphAttributes.normal!==void 0&&(et=2),J.morphAttributes.color!==void 0&&(et=3);let vt,Et,ut,j;if(de){let ht=fi[de];vt=ht.vertexShader,Et=ht.fragmentShader}else vt=b.vertexShader,Et=b.fragmentShader,c.update(b),ut=c.getVertexShaderID(b),j=c.getFragmentShaderID(b);let te=n.getRenderTarget(),ve=n.state.buffers.depth.getReversed(),ke=k.isInstancedMesh===!0,Ce=k.isBatchedMesh===!0,rt=!!b.map,tn=!!b.matcap,I=!!oe,Tt=!!b.aoMap,Ge=!!b.lightMap,Oe=!!b.bumpMap,be=!!b.normalMap,wt=!!b.displacementMap,Ee=!!b.emissiveMap,Ye=!!b.metalnessMap,Xt=!!b.roughnessMap,Ut=b.anisotropy>0,T=b.clearcoat>0,_=b.dispersion>0,z=b.iridescence>0,$=b.sheen>0,ee=b.transmission>0,Y=Ut&&!!b.anisotropyMap,Re=T&&!!b.clearcoatMap,le=T&&!!b.clearcoatNormalMap,Te=T&&!!b.clearcoatRoughnessMap,we=z&&!!b.iridescenceMap,se=z&&!!b.iridescenceThicknessMap,me=$&&!!b.sheenColorMap,Fe=$&&!!b.sheenRoughnessMap,Ae=!!b.specularMap,fe=!!b.specularColorMap,qe=!!b.specularIntensityMap,N=ee&&!!b.transmissionMap,re=ee&&!!b.thicknessMap,ce=!!b.gradientMap,ye=!!b.alphaMap,ne=b.alphaTest>0,Q=!!b.alphaHash,Se=!!b.extensions,Ve=Li;b.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Ve=n.toneMapping);let Mt={shaderID:de,shaderType:b.type,shaderName:b.name,vertexShader:vt,fragmentShader:Et,defines:b.defines,customVertexShaderID:ut,customFragmentShaderID:j,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:f,batching:Ce,batchingColor:Ce&&k._colorsTexture!==null,instancing:ke,instancingColor:ke&&k.instanceColor!==null,instancingMorph:ke&&k.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:te===null?n.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Zt,alphaToCoverage:!!b.alphaToCoverage,map:rt,matcap:tn,envMap:I,envMapMode:I&&oe.mapping,envMapCubeUVHeight:X,aoMap:Tt,lightMap:Ge,bumpMap:Oe,normalMap:be,displacementMap:d&&wt,emissiveMap:Ee,normalMapObjectSpace:be&&b.normalMapType===Bd,normalMapTangentSpace:be&&b.normalMapType===Zc,metalnessMap:Ye,roughnessMap:Xt,anisotropy:Ut,anisotropyMap:Y,clearcoat:T,clearcoatMap:Re,clearcoatNormalMap:le,clearcoatRoughnessMap:Te,dispersion:_,iridescence:z,iridescenceMap:we,iridescenceThicknessMap:se,sheen:$,sheenColorMap:me,sheenRoughnessMap:Fe,specularMap:Ae,specularColorMap:fe,specularIntensityMap:qe,transmission:ee,transmissionMap:N,thicknessMap:re,gradientMap:ce,opaque:b.transparent===!1&&b.blending===ps&&b.alphaToCoverage===!1,alphaMap:ye,alphaTest:ne,alphaHash:Q,combine:b.combine,mapUv:rt&&x(b.map.channel),aoMapUv:Tt&&x(b.aoMap.channel),lightMapUv:Ge&&x(b.lightMap.channel),bumpMapUv:Oe&&x(b.bumpMap.channel),normalMapUv:be&&x(b.normalMap.channel),displacementMapUv:wt&&x(b.displacementMap.channel),emissiveMapUv:Ee&&x(b.emissiveMap.channel),metalnessMapUv:Ye&&x(b.metalnessMap.channel),roughnessMapUv:Xt&&x(b.roughnessMap.channel),anisotropyMapUv:Y&&x(b.anisotropyMap.channel),clearcoatMapUv:Re&&x(b.clearcoatMap.channel),clearcoatNormalMapUv:le&&x(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Te&&x(b.clearcoatRoughnessMap.channel),iridescenceMapUv:we&&x(b.iridescenceMap.channel),iridescenceThicknessMapUv:se&&x(b.iridescenceThicknessMap.channel),sheenColorMapUv:me&&x(b.sheenColorMap.channel),sheenRoughnessMapUv:Fe&&x(b.sheenRoughnessMap.channel),specularMapUv:Ae&&x(b.specularMap.channel),specularColorMapUv:fe&&x(b.specularColorMap.channel),specularIntensityMapUv:qe&&x(b.specularIntensityMap.channel),transmissionMapUv:N&&x(b.transmissionMap.channel),thicknessMapUv:re&&x(b.thicknessMap.channel),alphaMapUv:ye&&x(b.alphaMap.channel),vertexTangents:!!J.attributes.tangent&&(be||Ut),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!J.attributes.uv&&(rt||ye),fog:!!q,useFog:b.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:ve,skinning:k.isSkinnedMesh===!0,morphTargets:J.morphAttributes.position!==void 0,morphNormals:J.morphAttributes.normal!==void 0,morphColors:J.morphAttributes.color!==void 0,morphTargetsCount:Pe,morphTextureStride:et,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ve,decodeVideoTexture:rt&&b.map.isVideoTexture===!0&&st.getTransfer(b.map.colorSpace)===ft,decodeVideoTextureEmissive:Ee&&b.emissiveMap.isVideoTexture===!0&&st.getTransfer(b.emissiveMap.colorSpace)===ft,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===dn,flipSided:b.side===hn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Se&&b.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Se&&b.extensions.multiDraw===!0||Ce)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Mt.vertexUv1s=l.has(1),Mt.vertexUv2s=l.has(2),Mt.vertexUv3s=l.has(3),l.clear(),Mt}function p(b){let S=[];if(b.shaderID?S.push(b.shaderID):(S.push(b.customVertexShaderID),S.push(b.customFragmentShaderID)),b.defines!==void 0)for(let P in b.defines)S.push(P),S.push(b.defines[P]);return b.isRawShaderMaterial===!1&&(w(S,b),E(S,b),S.push(n.outputColorSpace)),S.push(b.customProgramCacheKey),S.join()}function w(b,S){b.push(S.precision),b.push(S.outputColorSpace),b.push(S.envMapMode),b.push(S.envMapCubeUVHeight),b.push(S.mapUv),b.push(S.alphaMapUv),b.push(S.lightMapUv),b.push(S.aoMapUv),b.push(S.bumpMapUv),b.push(S.normalMapUv),b.push(S.displacementMapUv),b.push(S.emissiveMapUv),b.push(S.metalnessMapUv),b.push(S.roughnessMapUv),b.push(S.anisotropyMapUv),b.push(S.clearcoatMapUv),b.push(S.clearcoatNormalMapUv),b.push(S.clearcoatRoughnessMapUv),b.push(S.iridescenceMapUv),b.push(S.iridescenceThicknessMapUv),b.push(S.sheenColorMapUv),b.push(S.sheenRoughnessMapUv),b.push(S.specularMapUv),b.push(S.specularColorMapUv),b.push(S.specularIntensityMapUv),b.push(S.transmissionMapUv),b.push(S.thicknessMapUv),b.push(S.combine),b.push(S.fogExp2),b.push(S.sizeAttenuation),b.push(S.morphTargetsCount),b.push(S.morphAttributeCount),b.push(S.numDirLights),b.push(S.numPointLights),b.push(S.numSpotLights),b.push(S.numSpotLightMaps),b.push(S.numHemiLights),b.push(S.numRectAreaLights),b.push(S.numDirLightShadows),b.push(S.numPointLightShadows),b.push(S.numSpotLightShadows),b.push(S.numSpotLightShadowsWithMaps),b.push(S.numLightProbes),b.push(S.shadowMapType),b.push(S.toneMapping),b.push(S.numClippingPlanes),b.push(S.numClipIntersection),b.push(S.depthPacking)}function E(b,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),S.gradientMap&&a.enable(22),b.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),b.push(a.mask)}function y(b){let S=g[b.type],P;if(S){let U=fi[S];P=Kd.clone(U.uniforms)}else P=b.uniforms;return P}function R(b,S){let P;for(let U=0,k=u.length;U<k;U++){let q=u[U];if(q.cacheKey===S){P=q,++P.usedTimes;break}}return P===void 0&&(P=new g_(n,S,b,r),u.push(P)),P}function C(b){if(--b.usedTimes===0){let S=u.indexOf(b);u[S]=u[u.length-1],u.pop(),b.destroy()}}function L(b){c.remove(b)}function F(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:y,acquireProgram:R,releaseProgram:C,releaseShaderCache:L,programs:u,dispose:F}}function y_(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,c){n.get(o)[a]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function v_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function yf(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function vf(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(h,d,f,g,x,m){let p=n[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:x,group:m},n[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=x,p.group=m),e++,p}function a(h,d,f,g,x,m){let p=o(h,d,f,g,x,m);f.transmission>0?i.push(p):f.transparent===!0?s.push(p):t.push(p)}function c(h,d,f,g,x,m){let p=o(h,d,f,g,x,m);f.transmission>0?i.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function l(h,d){t.length>1&&t.sort(h||v_),i.length>1&&i.sort(d||yf),s.length>1&&s.sort(d||yf)}function u(){for(let h=e,d=n.length;h<d;h++){let f=n[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:c,finish:u,sort:l}}function M_(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new vf,n.set(i,[o])):s>=r.length?(o=new vf,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function S_(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new A,color:new Ne};break;case"SpotLight":t={position:new A,direction:new A,color:new Ne,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new A,color:new Ne,distance:0,decay:0};break;case"HemisphereLight":t={direction:new A,skyColor:new Ne,groundColor:new Ne};break;case"RectAreaLight":t={color:new Ne,position:new A,halfWidth:new A,halfHeight:new A};break}return n[e.id]=t,t}}}function b_(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var E_=0;function T_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function w_(n){let e=new S_,t=b_(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new A);let s=new A,r=new We,o=new We;function a(l){let u=0,h=0,d=0;for(let b=0;b<9;b++)i.probe[b].set(0,0,0);let f=0,g=0,x=0,m=0,p=0,w=0,E=0,y=0,R=0,C=0,L=0;l.sort(T_);for(let b=0,S=l.length;b<S;b++){let P=l[b],U=P.color,k=P.intensity,q=P.distance,J=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=U.r*k,h+=U.g*k,d+=U.b*k;else if(P.isLightProbe){for(let K=0;K<9;K++)i.probe[K].addScaledVector(P.sh.coefficients[K],k);L++}else if(P.isDirectionalLight){let K=e.get(P);if(K.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let oe=P.shadow,X=t.get(P);X.shadowIntensity=oe.intensity,X.shadowBias=oe.bias,X.shadowNormalBias=oe.normalBias,X.shadowRadius=oe.radius,X.shadowMapSize=oe.mapSize,i.directionalShadow[f]=X,i.directionalShadowMap[f]=J,i.directionalShadowMatrix[f]=P.shadow.matrix,w++}i.directional[f]=K,f++}else if(P.isSpotLight){let K=e.get(P);K.position.setFromMatrixPosition(P.matrixWorld),K.color.copy(U).multiplyScalar(k),K.distance=q,K.coneCos=Math.cos(P.angle),K.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),K.decay=P.decay,i.spot[x]=K;let oe=P.shadow;if(P.map&&(i.spotLightMap[R]=P.map,R++,oe.updateMatrices(P),P.castShadow&&C++),i.spotLightMatrix[x]=oe.matrix,P.castShadow){let X=t.get(P);X.shadowIntensity=oe.intensity,X.shadowBias=oe.bias,X.shadowNormalBias=oe.normalBias,X.shadowRadius=oe.radius,X.shadowMapSize=oe.mapSize,i.spotShadow[x]=X,i.spotShadowMap[x]=J,y++}x++}else if(P.isRectAreaLight){let K=e.get(P);K.color.copy(U).multiplyScalar(k),K.halfWidth.set(P.width*.5,0,0),K.halfHeight.set(0,P.height*.5,0),i.rectArea[m]=K,m++}else if(P.isPointLight){let K=e.get(P);if(K.color.copy(P.color).multiplyScalar(P.intensity),K.distance=P.distance,K.decay=P.decay,P.castShadow){let oe=P.shadow,X=t.get(P);X.shadowIntensity=oe.intensity,X.shadowBias=oe.bias,X.shadowNormalBias=oe.normalBias,X.shadowRadius=oe.radius,X.shadowMapSize=oe.mapSize,X.shadowCameraNear=oe.camera.near,X.shadowCameraFar=oe.camera.far,i.pointShadow[g]=X,i.pointShadowMap[g]=J,i.pointShadowMatrix[g]=P.shadow.matrix,E++}i.point[g]=K,g++}else if(P.isHemisphereLight){let K=e.get(P);K.skyColor.copy(P.color).multiplyScalar(k),K.groundColor.copy(P.groundColor).multiplyScalar(k),i.hemi[p]=K,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=he.LTC_FLOAT_1,i.rectAreaLTC2=he.LTC_FLOAT_2):(i.rectAreaLTC1=he.LTC_HALF_1,i.rectAreaLTC2=he.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let F=i.hash;(F.directionalLength!==f||F.pointLength!==g||F.spotLength!==x||F.rectAreaLength!==m||F.hemiLength!==p||F.numDirectionalShadows!==w||F.numPointShadows!==E||F.numSpotShadows!==y||F.numSpotMaps!==R||F.numLightProbes!==L)&&(i.directional.length=f,i.spot.length=x,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=y+R-C,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=L,F.directionalLength=f,F.pointLength=g,F.spotLength=x,F.rectAreaLength=m,F.hemiLength=p,F.numDirectionalShadows=w,F.numPointShadows=E,F.numSpotShadows=y,F.numSpotMaps=R,F.numLightProbes=L,i.version=E_++)}function c(l,u){let h=0,d=0,f=0,g=0,x=0,m=u.matrixWorldInverse;for(let p=0,w=l.length;p<w;p++){let E=l[p];if(E.isDirectionalLight){let y=i.directional[h];y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(E.isSpotLight){let y=i.spot[f];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(E.isRectAreaLight){let y=i.rectArea[g];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(E.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(E.width*.5,0,0),y.halfHeight.set(0,E.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),g++}else if(E.isPointLight){let y=i.point[d];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),d++}else if(E.isHemisphereLight){let y=i.hemi[x];y.direction.setFromMatrixPosition(E.matrixWorld),y.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:i}}function Mf(n){let e=new w_(n),t=[],i=[];function s(u){l.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function c(u){e.setupView(t,u)}let l={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function A_(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Mf(n),e.set(s,[a])):r>=o.length?(a=new Mf(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var R_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,C_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function I_(n,e,t){let i=new or,s=new je,r=new je,o=new lt,a=new Ma({depthPacking:Od}),c=new Sa,l={},u=t.maxTextureSize,h={[Zn]:hn,[hn]:Zn,[dn]:dn},d=new Jn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new je},radius:{value:4}},vertexShader:R_,fragmentShader:C_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new $t;g.setAttribute("position",new Bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new ze(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nc;let p=this.type;this.render=function(C,L,F){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;let b=n.getRenderTarget(),S=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),U=n.state;U.setBlending(Pi),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let k=p!==di&&this.type===di,q=p===di&&this.type!==di;for(let J=0,K=C.length;J<K;J++){let oe=C[J],X=oe.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",oe,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);let de=X.getFrameExtents();if(s.multiply(de),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/de.x),s.x=r.x*de.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/de.y),s.y=r.y*de.y,X.mapSize.y=r.y)),X.map===null||k===!0||q===!0){let Pe=this.type!==di?{minFilter:Yt,magFilter:Yt}:{};X.map!==null&&X.map.dispose(),X.map=new oi(s.x,s.y,Pe),X.map.texture.name=oe.name+".shadowMap",X.camera.updateProjectionMatrix()}n.setRenderTarget(X.map),n.clear();let ge=X.getViewportCount();for(let Pe=0;Pe<ge;Pe++){let et=X.getViewport(Pe);o.set(r.x*et.x,r.y*et.y,r.x*et.z,r.y*et.w),U.viewport(o),X.updateMatrices(oe,Pe),i=X.getFrustum(),y(L,F,X.camera,oe,this.type)}X.isPointLightShadow!==!0&&this.type===di&&w(X,F),X.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(b,S,P)};function w(C,L){let F=e.update(x);d.defines.VSM_SAMPLES!==C.blurSamples&&(d.defines.VSM_SAMPLES=C.blurSamples,f.defines.VSM_SAMPLES=C.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new oi(s.x,s.y)),d.uniforms.shadow_pass.value=C.map.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,n.setRenderTarget(C.mapPass),n.clear(),n.renderBufferDirect(L,null,F,d,x,null),f.uniforms.shadow_pass.value=C.mapPass.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,n.setRenderTarget(C.map),n.clear(),n.renderBufferDirect(L,null,F,f,x,null)}function E(C,L,F,b){let S=null,P=F.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(P!==void 0)S=P;else if(S=F.isPointLight===!0?c:a,n.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0||L.alphaToCoverage===!0){let U=S.uuid,k=L.uuid,q=l[U];q===void 0&&(q={},l[U]=q);let J=q[k];J===void 0&&(J=S.clone(),q[k]=J,L.addEventListener("dispose",R)),S=J}if(S.visible=L.visible,S.wireframe=L.wireframe,b===di?S.side=L.shadowSide!==null?L.shadowSide:L.side:S.side=L.shadowSide!==null?L.shadowSide:h[L.side],S.alphaMap=L.alphaMap,S.alphaTest=L.alphaToCoverage===!0?.5:L.alphaTest,S.map=L.map,S.clipShadows=L.clipShadows,S.clippingPlanes=L.clippingPlanes,S.clipIntersection=L.clipIntersection,S.displacementMap=L.displacementMap,S.displacementScale=L.displacementScale,S.displacementBias=L.displacementBias,S.wireframeLinewidth=L.wireframeLinewidth,S.linewidth=L.linewidth,F.isPointLight===!0&&S.isMeshDistanceMaterial===!0){let U=n.properties.get(S);U.light=F}return S}function y(C,L,F,b,S){if(C.visible===!1)return;if(C.layers.test(L.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&S===di)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,C.matrixWorld);let k=e.update(C),q=C.material;if(Array.isArray(q)){let J=k.groups;for(let K=0,oe=J.length;K<oe;K++){let X=J[K],de=q[X.materialIndex];if(de&&de.visible){let ge=E(C,de,b,S);C.onBeforeShadow(n,C,L,F,k,ge,X),n.renderBufferDirect(F,null,k,ge,C,X),C.onAfterShadow(n,C,L,F,k,ge,X)}}}else if(q.visible){let J=E(C,q,b,S);C.onBeforeShadow(n,C,L,F,k,J,null),n.renderBufferDirect(F,null,k,J,C,null),C.onAfterShadow(n,C,L,F,k,J,null)}}let U=C.children;for(let k=0,q=U.length;k<q;k++)y(U[k],L,F,b,S)}function R(C){C.target.removeEventListener("dispose",R);for(let F in l){let b=l[F],S=C.target.uuid;S in b&&(b[S].dispose(),delete b[S])}}}var P_={[Pa]:La,[Da]:Fa,[Na]:Oa,[ms]:Ua,[La]:Pa,[Fa]:Da,[Oa]:Na,[Ua]:ms};function L_(n,e){function t(){let N=!1,re=new lt,ce=null,ye=new lt(0,0,0,0);return{setMask:function(ne){ce!==ne&&!N&&(n.colorMask(ne,ne,ne,ne),ce=ne)},setLocked:function(ne){N=ne},setClear:function(ne,Q,Se,Ve,Mt){Mt===!0&&(ne*=Ve,Q*=Ve,Se*=Ve),re.set(ne,Q,Se,Ve),ye.equals(re)===!1&&(n.clearColor(ne,Q,Se,Ve),ye.copy(re))},reset:function(){N=!1,ce=null,ye.set(-1,0,0,0)}}}function i(){let N=!1,re=!1,ce=null,ye=null,ne=null;return{setReversed:function(Q){if(re!==Q){let Se=e.get("EXT_clip_control");Q?Se.clipControlEXT(Se.LOWER_LEFT_EXT,Se.ZERO_TO_ONE_EXT):Se.clipControlEXT(Se.LOWER_LEFT_EXT,Se.NEGATIVE_ONE_TO_ONE_EXT),re=Q;let Ve=ne;ne=null,this.setClear(Ve)}},getReversed:function(){return re},setTest:function(Q){Q?te(n.DEPTH_TEST):ve(n.DEPTH_TEST)},setMask:function(Q){ce!==Q&&!N&&(n.depthMask(Q),ce=Q)},setFunc:function(Q){if(re&&(Q=P_[Q]),ye!==Q){switch(Q){case Pa:n.depthFunc(n.NEVER);break;case La:n.depthFunc(n.ALWAYS);break;case Da:n.depthFunc(n.LESS);break;case ms:n.depthFunc(n.LEQUAL);break;case Na:n.depthFunc(n.EQUAL);break;case Ua:n.depthFunc(n.GEQUAL);break;case Fa:n.depthFunc(n.GREATER);break;case Oa:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ye=Q}},setLocked:function(Q){N=Q},setClear:function(Q){ne!==Q&&(re&&(Q=1-Q),n.clearDepth(Q),ne=Q)},reset:function(){N=!1,ce=null,ye=null,ne=null,re=!1}}}function s(){let N=!1,re=null,ce=null,ye=null,ne=null,Q=null,Se=null,Ve=null,Mt=null;return{setTest:function(ht){N||(ht?te(n.STENCIL_TEST):ve(n.STENCIL_TEST))},setMask:function(ht){re!==ht&&!N&&(n.stencilMask(ht),re=ht)},setFunc:function(ht,xi,ni){(ce!==ht||ye!==xi||ne!==ni)&&(n.stencilFunc(ht,xi,ni),ce=ht,ye=xi,ne=ni)},setOp:function(ht,xi,ni){(Q!==ht||Se!==xi||Ve!==ni)&&(n.stencilOp(ht,xi,ni),Q=ht,Se=xi,Ve=ni)},setLocked:function(ht){N=ht},setClear:function(ht){Mt!==ht&&(n.clearStencil(ht),Mt=ht)},reset:function(){N=!1,re=null,ce=null,ye=null,ne=null,Q=null,Se=null,Ve=null,Mt=null}}}let r=new t,o=new i,a=new s,c=new WeakMap,l=new WeakMap,u={},h={},d=new WeakMap,f=[],g=null,x=!1,m=null,p=null,w=null,E=null,y=null,R=null,C=null,L=new Ne(0,0,0),F=0,b=!1,S=null,P=null,U=null,k=null,q=null,J=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),K=!1,oe=0,X=n.getParameter(n.VERSION);X.indexOf("WebGL")!==-1?(oe=parseFloat(/^WebGL (\d)/.exec(X)[1]),K=oe>=1):X.indexOf("OpenGL ES")!==-1&&(oe=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),K=oe>=2);let de=null,ge={},Pe=n.getParameter(n.SCISSOR_BOX),et=n.getParameter(n.VIEWPORT),vt=new lt().fromArray(Pe),Et=new lt().fromArray(et);function ut(N,re,ce,ye){let ne=new Uint8Array(4),Q=n.createTexture();n.bindTexture(N,Q),n.texParameteri(N,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(N,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Se=0;Se<ce;Se++)N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY?n.texImage3D(re,0,n.RGBA,1,1,ye,0,n.RGBA,n.UNSIGNED_BYTE,ne):n.texImage2D(re+Se,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ne);return Q}let j={};j[n.TEXTURE_2D]=ut(n.TEXTURE_2D,n.TEXTURE_2D,1),j[n.TEXTURE_CUBE_MAP]=ut(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[n.TEXTURE_2D_ARRAY]=ut(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),j[n.TEXTURE_3D]=ut(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),te(n.DEPTH_TEST),o.setFunc(ms),Oe(!1),be(Dc),te(n.CULL_FACE),Tt(Pi);function te(N){u[N]!==!0&&(n.enable(N),u[N]=!0)}function ve(N){u[N]!==!1&&(n.disable(N),u[N]=!1)}function ke(N,re){return h[N]!==re?(n.bindFramebuffer(N,re),h[N]=re,N===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=re),N===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=re),!0):!1}function Ce(N,re){let ce=f,ye=!1;if(N){ce=d.get(re),ce===void 0&&(ce=[],d.set(re,ce));let ne=N.textures;if(ce.length!==ne.length||ce[0]!==n.COLOR_ATTACHMENT0){for(let Q=0,Se=ne.length;Q<Se;Q++)ce[Q]=n.COLOR_ATTACHMENT0+Q;ce.length=ne.length,ye=!0}}else ce[0]!==n.BACK&&(ce[0]=n.BACK,ye=!0);ye&&n.drawBuffers(ce)}function rt(N){return g!==N?(n.useProgram(N),g=N,!0):!1}let tn={[Xi]:n.FUNC_ADD,[cd]:n.FUNC_SUBTRACT,[ud]:n.FUNC_REVERSE_SUBTRACT};tn[hd]=n.MIN,tn[dd]=n.MAX;let I={[fd]:n.ZERO,[pd]:n.ONE,[md]:n.SRC_COLOR,[ha]:n.SRC_ALPHA,[Md]:n.SRC_ALPHA_SATURATE,[yd]:n.DST_COLOR,[xd]:n.DST_ALPHA,[gd]:n.ONE_MINUS_SRC_COLOR,[da]:n.ONE_MINUS_SRC_ALPHA,[vd]:n.ONE_MINUS_DST_COLOR,[_d]:n.ONE_MINUS_DST_ALPHA,[Sd]:n.CONSTANT_COLOR,[bd]:n.ONE_MINUS_CONSTANT_COLOR,[Ed]:n.CONSTANT_ALPHA,[Td]:n.ONE_MINUS_CONSTANT_ALPHA};function Tt(N,re,ce,ye,ne,Q,Se,Ve,Mt,ht){if(N===Pi){x===!0&&(ve(n.BLEND),x=!1);return}if(x===!1&&(te(n.BLEND),x=!0),N!==ld){if(N!==m||ht!==b){if((p!==Xi||y!==Xi)&&(n.blendEquation(n.FUNC_ADD),p=Xi,y=Xi),ht)switch(N){case ps:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Uc:n.blendFunc(n.ONE,n.ONE);break;case Fc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Oc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case ps:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Uc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Fc:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Oc:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}w=null,E=null,R=null,C=null,L.set(0,0,0),F=0,m=N,b=ht}return}ne=ne||re,Q=Q||ce,Se=Se||ye,(re!==p||ne!==y)&&(n.blendEquationSeparate(tn[re],tn[ne]),p=re,y=ne),(ce!==w||ye!==E||Q!==R||Se!==C)&&(n.blendFuncSeparate(I[ce],I[ye],I[Q],I[Se]),w=ce,E=ye,R=Q,C=Se),(Ve.equals(L)===!1||Mt!==F)&&(n.blendColor(Ve.r,Ve.g,Ve.b,Mt),L.copy(Ve),F=Mt),m=N,b=!1}function Ge(N,re){N.side===dn?ve(n.CULL_FACE):te(n.CULL_FACE);let ce=N.side===hn;re&&(ce=!ce),Oe(ce),N.blending===ps&&N.transparent===!1?Tt(Pi):Tt(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),o.setFunc(N.depthFunc),o.setTest(N.depthTest),o.setMask(N.depthWrite),r.setMask(N.colorWrite);let ye=N.stencilWrite;a.setTest(ye),ye&&(a.setMask(N.stencilWriteMask),a.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),a.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),Ee(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?te(n.SAMPLE_ALPHA_TO_COVERAGE):ve(n.SAMPLE_ALPHA_TO_COVERAGE)}function Oe(N){S!==N&&(N?n.frontFace(n.CW):n.frontFace(n.CCW),S=N)}function be(N){N!==od?(te(n.CULL_FACE),N!==P&&(N===Dc?n.cullFace(n.BACK):N===ad?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ve(n.CULL_FACE),P=N}function wt(N){N!==U&&(K&&n.lineWidth(N),U=N)}function Ee(N,re,ce){N?(te(n.POLYGON_OFFSET_FILL),(k!==re||q!==ce)&&(n.polygonOffset(re,ce),k=re,q=ce)):ve(n.POLYGON_OFFSET_FILL)}function Ye(N){N?te(n.SCISSOR_TEST):ve(n.SCISSOR_TEST)}function Xt(N){N===void 0&&(N=n.TEXTURE0+J-1),de!==N&&(n.activeTexture(N),de=N)}function Ut(N,re,ce){ce===void 0&&(de===null?ce=n.TEXTURE0+J-1:ce=de);let ye=ge[ce];ye===void 0&&(ye={type:void 0,texture:void 0},ge[ce]=ye),(ye.type!==N||ye.texture!==re)&&(de!==ce&&(n.activeTexture(ce),de=ce),n.bindTexture(N,re||j[N]),ye.type=N,ye.texture=re)}function T(){let N=ge[de];N!==void 0&&N.type!==void 0&&(n.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function _(){try{n.compressedTexImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function z(){try{n.compressedTexImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function $(){try{n.texSubImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ee(){try{n.texSubImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Y(){try{n.compressedTexSubImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Re(){try{n.compressedTexSubImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function le(){try{n.texStorage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Te(){try{n.texStorage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function we(){try{n.texImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function se(){try{n.texImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function me(N){vt.equals(N)===!1&&(n.scissor(N.x,N.y,N.z,N.w),vt.copy(N))}function Fe(N){Et.equals(N)===!1&&(n.viewport(N.x,N.y,N.z,N.w),Et.copy(N))}function Ae(N,re){let ce=l.get(re);ce===void 0&&(ce=new WeakMap,l.set(re,ce));let ye=ce.get(N);ye===void 0&&(ye=n.getUniformBlockIndex(re,N.name),ce.set(N,ye))}function fe(N,re){let ye=l.get(re).get(N);c.get(re)!==ye&&(n.uniformBlockBinding(re,ye,N.__bindingPointIndex),c.set(re,ye))}function qe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},de=null,ge={},h={},d=new WeakMap,f=[],g=null,x=!1,m=null,p=null,w=null,E=null,y=null,R=null,C=null,L=new Ne(0,0,0),F=0,b=!1,S=null,P=null,U=null,k=null,q=null,vt.set(0,0,n.canvas.width,n.canvas.height),Et.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:te,disable:ve,bindFramebuffer:ke,drawBuffers:Ce,useProgram:rt,setBlending:Tt,setMaterial:Ge,setFlipSided:Oe,setCullFace:be,setLineWidth:wt,setPolygonOffset:Ee,setScissorTest:Ye,activeTexture:Xt,bindTexture:Ut,unbindTexture:T,compressedTexImage2D:_,compressedTexImage3D:z,texImage2D:we,texImage3D:se,updateUBOMapping:Ae,uniformBlockBinding:fe,texStorage2D:le,texStorage3D:Te,texSubImage2D:$,texSubImage3D:ee,compressedTexSubImage2D:Y,compressedTexSubImage3D:Re,scissor:me,viewport:Fe,reset:qe}}function D_(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new je,u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return f?new OffscreenCanvas(T,_):js("canvas")}function x(T,_,z){let $=1,ee=Ut(T);if((ee.width>z||ee.height>z)&&($=z/Math.max(ee.width,ee.height)),$<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let Y=Math.floor($*ee.width),Re=Math.floor($*ee.height);h===void 0&&(h=g(Y,Re));let le=_?g(Y,Re):h;return le.width=Y,le.height=Re,le.getContext("2d").drawImage(T,0,0,Y,Re),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+Y+"x"+Re+")."),le}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),T;return T}function m(T){return T.generateMipmaps}function p(T){n.generateMipmap(T)}function w(T){return T.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?n.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function E(T,_,z,$,ee=!1){if(T!==null){if(n[T]!==void 0)return n[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Y=_;if(_===n.RED&&(z===n.FLOAT&&(Y=n.R32F),z===n.HALF_FLOAT&&(Y=n.R16F),z===n.UNSIGNED_BYTE&&(Y=n.R8)),_===n.RED_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.R8UI),z===n.UNSIGNED_SHORT&&(Y=n.R16UI),z===n.UNSIGNED_INT&&(Y=n.R32UI),z===n.BYTE&&(Y=n.R8I),z===n.SHORT&&(Y=n.R16I),z===n.INT&&(Y=n.R32I)),_===n.RG&&(z===n.FLOAT&&(Y=n.RG32F),z===n.HALF_FLOAT&&(Y=n.RG16F),z===n.UNSIGNED_BYTE&&(Y=n.RG8)),_===n.RG_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.RG8UI),z===n.UNSIGNED_SHORT&&(Y=n.RG16UI),z===n.UNSIGNED_INT&&(Y=n.RG32UI),z===n.BYTE&&(Y=n.RG8I),z===n.SHORT&&(Y=n.RG16I),z===n.INT&&(Y=n.RG32I)),_===n.RGB_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),z===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),z===n.UNSIGNED_INT&&(Y=n.RGB32UI),z===n.BYTE&&(Y=n.RGB8I),z===n.SHORT&&(Y=n.RGB16I),z===n.INT&&(Y=n.RGB32I)),_===n.RGBA_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),z===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),z===n.UNSIGNED_INT&&(Y=n.RGBA32UI),z===n.BYTE&&(Y=n.RGBA8I),z===n.SHORT&&(Y=n.RGBA16I),z===n.INT&&(Y=n.RGBA32I)),_===n.RGB&&(z===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),z===n.UNSIGNED_INT_10F_11F_11F_REV&&(Y=n.R11F_G11F_B10F)),_===n.RGBA){let Re=ee?Hr:st.getTransfer($);z===n.FLOAT&&(Y=n.RGBA32F),z===n.HALF_FLOAT&&(Y=n.RGBA16F),z===n.UNSIGNED_BYTE&&(Y=Re===ft?n.SRGB8_ALPHA8:n.RGBA8),z===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),z===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function y(T,_){let z;return T?_===null||_===Ki||_===pr?z=n.DEPTH24_STENCIL8:_===On?z=n.DEPTH32F_STENCIL8:_===dr&&(z=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Ki||_===pr?z=n.DEPTH_COMPONENT24:_===On?z=n.DEPTH_COMPONENT32F:_===dr&&(z=n.DEPTH_COMPONENT16),z}function R(T,_){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==Yt&&T.minFilter!==cn?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function C(T){let _=T.target;_.removeEventListener("dispose",C),F(_),_.isVideoTexture&&u.delete(_)}function L(T){let _=T.target;_.removeEventListener("dispose",L),S(_)}function F(T){let _=i.get(T);if(_.__webglInit===void 0)return;let z=T.source,$=d.get(z);if($){let ee=$[_.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&b(T),Object.keys($).length===0&&d.delete(z)}i.remove(T)}function b(T){let _=i.get(T);n.deleteTexture(_.__webglTexture);let z=T.source,$=d.get(z);delete $[_.__cacheKey],o.memory.textures--}function S(T){let _=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(_.__webglFramebuffer[$]))for(let ee=0;ee<_.__webglFramebuffer[$].length;ee++)n.deleteFramebuffer(_.__webglFramebuffer[$][ee]);else n.deleteFramebuffer(_.__webglFramebuffer[$]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[$])}else{if(Array.isArray(_.__webglFramebuffer))for(let $=0;$<_.__webglFramebuffer.length;$++)n.deleteFramebuffer(_.__webglFramebuffer[$]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let $=0;$<_.__webglColorRenderbuffer.length;$++)_.__webglColorRenderbuffer[$]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[$]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let z=T.textures;for(let $=0,ee=z.length;$<ee;$++){let Y=i.get(z[$]);Y.__webglTexture&&(n.deleteTexture(Y.__webglTexture),o.memory.textures--),i.remove(z[$])}i.remove(T)}let P=0;function U(){P=0}function k(){let T=P;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),P+=1,T}function q(T){let _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function J(T,_){let z=i.get(T);if(T.isVideoTexture&&Ye(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&z.__version!==T.version){let $=T.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(z,T,_);return}}else T.isExternalTexture&&(z.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,z.__webglTexture,n.TEXTURE0+_)}function K(T,_){let z=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&z.__version!==T.version){j(z,T,_);return}t.bindTexture(n.TEXTURE_2D_ARRAY,z.__webglTexture,n.TEXTURE0+_)}function oe(T,_){let z=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&z.__version!==T.version){j(z,T,_);return}t.bindTexture(n.TEXTURE_3D,z.__webglTexture,n.TEXTURE0+_)}function X(T,_){let z=i.get(T);if(T.version>0&&z.__version!==T.version){te(z,T,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,z.__webglTexture,n.TEXTURE0+_)}let de={[Kn]:n.REPEAT,[si]:n.CLAMP_TO_EDGE,[$s]:n.MIRRORED_REPEAT},ge={[Yt]:n.NEAREST,[Ha]:n.NEAREST_MIPMAP_NEAREST,[Ts]:n.NEAREST_MIPMAP_LINEAR,[cn]:n.LINEAR,[hr]:n.LINEAR_MIPMAP_NEAREST,[jn]:n.LINEAR_MIPMAP_LINEAR},Pe={[zd]:n.NEVER,[Xd]:n.ALWAYS,[kd]:n.LESS,[Kc]:n.LEQUAL,[Hd]:n.EQUAL,[Wd]:n.GEQUAL,[Vd]:n.GREATER,[Gd]:n.NOTEQUAL};function et(T,_){if(_.type===On&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===cn||_.magFilter===hr||_.magFilter===Ts||_.magFilter===jn||_.minFilter===cn||_.minFilter===hr||_.minFilter===Ts||_.minFilter===jn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(T,n.TEXTURE_WRAP_S,de[_.wrapS]),n.texParameteri(T,n.TEXTURE_WRAP_T,de[_.wrapT]),(T===n.TEXTURE_3D||T===n.TEXTURE_2D_ARRAY)&&n.texParameteri(T,n.TEXTURE_WRAP_R,de[_.wrapR]),n.texParameteri(T,n.TEXTURE_MAG_FILTER,ge[_.magFilter]),n.texParameteri(T,n.TEXTURE_MIN_FILTER,ge[_.minFilter]),_.compareFunction&&(n.texParameteri(T,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(T,n.TEXTURE_COMPARE_FUNC,Pe[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Yt||_.minFilter!==Ts&&_.minFilter!==jn||_.type===On&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let z=e.get("EXT_texture_filter_anisotropic");n.texParameterf(T,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function vt(T,_){let z=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",C));let $=_.source,ee=d.get($);ee===void 0&&(ee={},d.set($,ee));let Y=q(_);if(Y!==T.__cacheKey){ee[Y]===void 0&&(ee[Y]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,z=!0),ee[Y].usedTimes++;let Re=ee[T.__cacheKey];Re!==void 0&&(ee[T.__cacheKey].usedTimes--,Re.usedTimes===0&&b(_)),T.__cacheKey=Y,T.__webglTexture=ee[Y].texture}return z}function Et(T,_,z){return Math.floor(Math.floor(T/z)/_)}function ut(T,_,z,$){let Y=T.updateRanges;if(Y.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,z,$,_.data);else{Y.sort((se,me)=>se.start-me.start);let Re=0;for(let se=1;se<Y.length;se++){let me=Y[Re],Fe=Y[se],Ae=me.start+me.count,fe=Et(Fe.start,_.width,4),qe=Et(me.start,_.width,4);Fe.start<=Ae+1&&fe===qe&&Et(Fe.start+Fe.count-1,_.width,4)===fe?me.count=Math.max(me.count,Fe.start+Fe.count-me.start):(++Re,Y[Re]=Fe)}Y.length=Re+1;let le=n.getParameter(n.UNPACK_ROW_LENGTH),Te=n.getParameter(n.UNPACK_SKIP_PIXELS),we=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let se=0,me=Y.length;se<me;se++){let Fe=Y[se],Ae=Math.floor(Fe.start/4),fe=Math.ceil(Fe.count/4),qe=Ae%_.width,N=Math.floor(Ae/_.width),re=fe,ce=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,qe),n.pixelStorei(n.UNPACK_SKIP_ROWS,N),t.texSubImage2D(n.TEXTURE_2D,0,qe,N,re,ce,z,$,_.data)}T.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,le),n.pixelStorei(n.UNPACK_SKIP_PIXELS,Te),n.pixelStorei(n.UNPACK_SKIP_ROWS,we)}}function j(T,_,z){let $=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&($=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&($=n.TEXTURE_3D);let ee=vt(T,_),Y=_.source;t.bindTexture($,T.__webglTexture,n.TEXTURE0+z);let Re=i.get(Y);if(Y.version!==Re.__version||ee===!0){t.activeTexture(n.TEXTURE0+z);let le=st.getPrimaries(st.workingColorSpace),Te=_.colorSpace===Di?null:st.getPrimaries(_.colorSpace),we=_.colorSpace===Di||le===Te?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let se=x(_.image,!1,s.maxTextureSize);se=Xt(_,se);let me=r.convert(_.format,_.colorSpace),Fe=r.convert(_.type),Ae=E(_.internalFormat,me,Fe,_.colorSpace,_.isVideoTexture);et($,_);let fe,qe=_.mipmaps,N=_.isVideoTexture!==!0,re=Re.__version===void 0||ee===!0,ce=Y.dataReady,ye=R(_,se);if(_.isDepthTexture)Ae=y(_.format===mr,_.type),re&&(N?t.texStorage2D(n.TEXTURE_2D,1,Ae,se.width,se.height):t.texImage2D(n.TEXTURE_2D,0,Ae,se.width,se.height,0,me,Fe,null));else if(_.isDataTexture)if(qe.length>0){N&&re&&t.texStorage2D(n.TEXTURE_2D,ye,Ae,qe[0].width,qe[0].height);for(let ne=0,Q=qe.length;ne<Q;ne++)fe=qe[ne],N?ce&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,fe.width,fe.height,me,Fe,fe.data):t.texImage2D(n.TEXTURE_2D,ne,Ae,fe.width,fe.height,0,me,Fe,fe.data);_.generateMipmaps=!1}else N?(re&&t.texStorage2D(n.TEXTURE_2D,ye,Ae,se.width,se.height),ce&&ut(_,se,me,Fe)):t.texImage2D(n.TEXTURE_2D,0,Ae,se.width,se.height,0,me,Fe,se.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){N&&re&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ye,Ae,qe[0].width,qe[0].height,se.depth);for(let ne=0,Q=qe.length;ne<Q;ne++)if(fe=qe[ne],_.format!==Rn)if(me!==null)if(N){if(ce)if(_.layerUpdates.size>0){let Se=nu(fe.width,fe.height,_.format,_.type);for(let Ve of _.layerUpdates){let Mt=fe.data.subarray(Ve*Se/fe.data.BYTES_PER_ELEMENT,(Ve+1)*Se/fe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,Ve,fe.width,fe.height,1,me,Mt)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,0,fe.width,fe.height,se.depth,me,fe.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ne,Ae,fe.width,fe.height,se.depth,0,fe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else N?ce&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,0,fe.width,fe.height,se.depth,me,Fe,fe.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ne,Ae,fe.width,fe.height,se.depth,0,me,Fe,fe.data)}else{N&&re&&t.texStorage2D(n.TEXTURE_2D,ye,Ae,qe[0].width,qe[0].height);for(let ne=0,Q=qe.length;ne<Q;ne++)fe=qe[ne],_.format!==Rn?me!==null?N?ce&&t.compressedTexSubImage2D(n.TEXTURE_2D,ne,0,0,fe.width,fe.height,me,fe.data):t.compressedTexImage2D(n.TEXTURE_2D,ne,Ae,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):N?ce&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,fe.width,fe.height,me,Fe,fe.data):t.texImage2D(n.TEXTURE_2D,ne,Ae,fe.width,fe.height,0,me,Fe,fe.data)}else if(_.isDataArrayTexture)if(N){if(re&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ye,Ae,se.width,se.height,se.depth),ce)if(_.layerUpdates.size>0){let ne=nu(se.width,se.height,_.format,_.type);for(let Q of _.layerUpdates){let Se=se.data.subarray(Q*ne/se.data.BYTES_PER_ELEMENT,(Q+1)*ne/se.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Q,se.width,se.height,1,me,Fe,Se)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,me,Fe,se.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ae,se.width,se.height,se.depth,0,me,Fe,se.data);else if(_.isData3DTexture)N?(re&&t.texStorage3D(n.TEXTURE_3D,ye,Ae,se.width,se.height,se.depth),ce&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,me,Fe,se.data)):t.texImage3D(n.TEXTURE_3D,0,Ae,se.width,se.height,se.depth,0,me,Fe,se.data);else if(_.isFramebufferTexture){if(re)if(N)t.texStorage2D(n.TEXTURE_2D,ye,Ae,se.width,se.height);else{let ne=se.width,Q=se.height;for(let Se=0;Se<ye;Se++)t.texImage2D(n.TEXTURE_2D,Se,Ae,ne,Q,0,me,Fe,null),ne>>=1,Q>>=1}}else if(qe.length>0){if(N&&re){let ne=Ut(qe[0]);t.texStorage2D(n.TEXTURE_2D,ye,Ae,ne.width,ne.height)}for(let ne=0,Q=qe.length;ne<Q;ne++)fe=qe[ne],N?ce&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,me,Fe,fe):t.texImage2D(n.TEXTURE_2D,ne,Ae,me,Fe,fe);_.generateMipmaps=!1}else if(N){if(re){let ne=Ut(se);t.texStorage2D(n.TEXTURE_2D,ye,Ae,ne.width,ne.height)}ce&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,me,Fe,se)}else t.texImage2D(n.TEXTURE_2D,0,Ae,me,Fe,se);m(_)&&p($),Re.__version=Y.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function te(T,_,z){if(_.image.length!==6)return;let $=vt(T,_),ee=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,T.__webglTexture,n.TEXTURE0+z);let Y=i.get(ee);if(ee.version!==Y.__version||$===!0){t.activeTexture(n.TEXTURE0+z);let Re=st.getPrimaries(st.workingColorSpace),le=_.colorSpace===Di?null:st.getPrimaries(_.colorSpace),Te=_.colorSpace===Di||Re===le?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);let we=_.isCompressedTexture||_.image[0].isCompressedTexture,se=_.image[0]&&_.image[0].isDataTexture,me=[];for(let Q=0;Q<6;Q++)!we&&!se?me[Q]=x(_.image[Q],!0,s.maxCubemapSize):me[Q]=se?_.image[Q].image:_.image[Q],me[Q]=Xt(_,me[Q]);let Fe=me[0],Ae=r.convert(_.format,_.colorSpace),fe=r.convert(_.type),qe=E(_.internalFormat,Ae,fe,_.colorSpace),N=_.isVideoTexture!==!0,re=Y.__version===void 0||$===!0,ce=ee.dataReady,ye=R(_,Fe);et(n.TEXTURE_CUBE_MAP,_);let ne;if(we){N&&re&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ye,qe,Fe.width,Fe.height);for(let Q=0;Q<6;Q++){ne=me[Q].mipmaps;for(let Se=0;Se<ne.length;Se++){let Ve=ne[Se];_.format!==Rn?Ae!==null?N?ce&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se,0,0,Ve.width,Ve.height,Ae,Ve.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se,qe,Ve.width,Ve.height,0,Ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?ce&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se,0,0,Ve.width,Ve.height,Ae,fe,Ve.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se,qe,Ve.width,Ve.height,0,Ae,fe,Ve.data)}}}else{if(ne=_.mipmaps,N&&re){ne.length>0&&ye++;let Q=Ut(me[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ye,qe,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(se){N?ce&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,me[Q].width,me[Q].height,Ae,fe,me[Q].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,qe,me[Q].width,me[Q].height,0,Ae,fe,me[Q].data);for(let Se=0;Se<ne.length;Se++){let Mt=ne[Se].image[Q].image;N?ce&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se+1,0,0,Mt.width,Mt.height,Ae,fe,Mt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se+1,qe,Mt.width,Mt.height,0,Ae,fe,Mt.data)}}else{N?ce&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Ae,fe,me[Q]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,qe,Ae,fe,me[Q]);for(let Se=0;Se<ne.length;Se++){let Ve=ne[Se];N?ce&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se+1,0,0,Ae,fe,Ve.image[Q]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Se+1,qe,Ae,fe,Ve.image[Q])}}}m(_)&&p(n.TEXTURE_CUBE_MAP),Y.__version=ee.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ve(T,_,z,$,ee,Y){let Re=r.convert(z.format,z.colorSpace),le=r.convert(z.type),Te=E(z.internalFormat,Re,le,z.colorSpace),we=i.get(_),se=i.get(z);if(se.__renderTarget=_,!we.__hasExternalTextures){let me=Math.max(1,_.width>>Y),Fe=Math.max(1,_.height>>Y);ee===n.TEXTURE_3D||ee===n.TEXTURE_2D_ARRAY?t.texImage3D(ee,Y,Te,me,Fe,_.depth,0,Re,le,null):t.texImage2D(ee,Y,Te,me,Fe,0,Re,le,null)}t.bindFramebuffer(n.FRAMEBUFFER,T),Ee(_)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,$,ee,se.__webglTexture,0,wt(_)):(ee===n.TEXTURE_2D||ee>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,$,ee,se.__webglTexture,Y),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ke(T,_,z){if(n.bindRenderbuffer(n.RENDERBUFFER,T),_.depthBuffer){let $=_.depthTexture,ee=$&&$.isDepthTexture?$.type:null,Y=y(_.stencilBuffer,ee),Re=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=wt(_);Ee(_)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,le,Y,_.width,_.height):z?n.renderbufferStorageMultisample(n.RENDERBUFFER,le,Y,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,Y,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Re,n.RENDERBUFFER,T)}else{let $=_.textures;for(let ee=0;ee<$.length;ee++){let Y=$[ee],Re=r.convert(Y.format,Y.colorSpace),le=r.convert(Y.type),Te=E(Y.internalFormat,Re,le,Y.colorSpace),we=wt(_);z&&Ee(_)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,we,Te,_.width,_.height):Ee(_)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,we,Te,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,Te,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ce(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let $=i.get(_.depthTexture);$.__renderTarget=_,(!$.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),J(_.depthTexture,0);let ee=$.__webglTexture,Y=wt(_);if(_.depthTexture.format===Js)Ee(_)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ee,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ee,0);else if(_.depthTexture.format===mr)Ee(_)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ee,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function rt(T){let _=i.get(T),z=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){let $=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),$){let ee=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,$.removeEventListener("dispose",ee)};$.addEventListener("dispose",ee),_.__depthDisposeCallback=ee}_.__boundDepthTexture=$}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");let $=T.texture.mipmaps;$&&$.length>0?Ce(_.__webglFramebuffer[0],T):Ce(_.__webglFramebuffer,T)}else if(z){_.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[$]),_.__webglDepthbuffer[$]===void 0)_.__webglDepthbuffer[$]=n.createRenderbuffer(),ke(_.__webglDepthbuffer[$],T,!1);else{let ee=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Y=_.__webglDepthbuffer[$];n.bindRenderbuffer(n.RENDERBUFFER,Y),n.framebufferRenderbuffer(n.FRAMEBUFFER,ee,n.RENDERBUFFER,Y)}}else{let $=T.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),ke(_.__webglDepthbuffer,T,!1);else{let ee=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Y=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,Y),n.framebufferRenderbuffer(n.FRAMEBUFFER,ee,n.RENDERBUFFER,Y)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function tn(T,_,z){let $=i.get(T);_!==void 0&&ve($.__webglFramebuffer,T,T.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),z!==void 0&&rt(T)}function I(T){let _=T.texture,z=i.get(T),$=i.get(_);T.addEventListener("dispose",L);let ee=T.textures,Y=T.isWebGLCubeRenderTarget===!0,Re=ee.length>1;if(Re||($.__webglTexture===void 0&&($.__webglTexture=n.createTexture()),$.__version=_.version,o.memory.textures++),Y){z.__webglFramebuffer=[];for(let le=0;le<6;le++)if(_.mipmaps&&_.mipmaps.length>0){z.__webglFramebuffer[le]=[];for(let Te=0;Te<_.mipmaps.length;Te++)z.__webglFramebuffer[le][Te]=n.createFramebuffer()}else z.__webglFramebuffer[le]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){z.__webglFramebuffer=[];for(let le=0;le<_.mipmaps.length;le++)z.__webglFramebuffer[le]=n.createFramebuffer()}else z.__webglFramebuffer=n.createFramebuffer();if(Re)for(let le=0,Te=ee.length;le<Te;le++){let we=i.get(ee[le]);we.__webglTexture===void 0&&(we.__webglTexture=n.createTexture(),o.memory.textures++)}if(T.samples>0&&Ee(T)===!1){z.__webglMultisampledFramebuffer=n.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let le=0;le<ee.length;le++){let Te=ee[le];z.__webglColorRenderbuffer[le]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,z.__webglColorRenderbuffer[le]);let we=r.convert(Te.format,Te.colorSpace),se=r.convert(Te.type),me=E(Te.internalFormat,we,se,Te.colorSpace,T.isXRRenderTarget===!0),Fe=wt(T);n.renderbufferStorageMultisample(n.RENDERBUFFER,Fe,me,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.RENDERBUFFER,z.__webglColorRenderbuffer[le])}n.bindRenderbuffer(n.RENDERBUFFER,null),T.depthBuffer&&(z.__webglDepthRenderbuffer=n.createRenderbuffer(),ke(z.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Y){t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),et(n.TEXTURE_CUBE_MAP,_);for(let le=0;le<6;le++)if(_.mipmaps&&_.mipmaps.length>0)for(let Te=0;Te<_.mipmaps.length;Te++)ve(z.__webglFramebuffer[le][Te],T,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+le,Te);else ve(z.__webglFramebuffer[le],T,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);m(_)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Re){for(let le=0,Te=ee.length;le<Te;le++){let we=ee[le],se=i.get(we),me=n.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(me=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(me,se.__webglTexture),et(me,we),ve(z.__webglFramebuffer,T,we,n.COLOR_ATTACHMENT0+le,me,0),m(we)&&p(me)}t.unbindTexture()}else{let le=n.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(le=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(le,$.__webglTexture),et(le,_),_.mipmaps&&_.mipmaps.length>0)for(let Te=0;Te<_.mipmaps.length;Te++)ve(z.__webglFramebuffer[Te],T,_,n.COLOR_ATTACHMENT0,le,Te);else ve(z.__webglFramebuffer,T,_,n.COLOR_ATTACHMENT0,le,0);m(_)&&p(le),t.unbindTexture()}T.depthBuffer&&rt(T)}function Tt(T){let _=T.textures;for(let z=0,$=_.length;z<$;z++){let ee=_[z];if(m(ee)){let Y=w(T),Re=i.get(ee).__webglTexture;t.bindTexture(Y,Re),p(Y),t.unbindTexture()}}}let Ge=[],Oe=[];function be(T){if(T.samples>0){if(Ee(T)===!1){let _=T.textures,z=T.width,$=T.height,ee=n.COLOR_BUFFER_BIT,Y=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Re=i.get(T),le=_.length>1;if(le)for(let we=0;we<_.length;we++)t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+we,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+we,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Re.__webglMultisampledFramebuffer);let Te=T.texture.mipmaps;Te&&Te.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Re.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Re.__webglFramebuffer);for(let we=0;we<_.length;we++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(ee|=n.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(ee|=n.STENCIL_BUFFER_BIT)),le){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Re.__webglColorRenderbuffer[we]);let se=i.get(_[we]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,se,0)}n.blitFramebuffer(0,0,z,$,0,0,z,$,ee,n.NEAREST),c===!0&&(Ge.length=0,Oe.length=0,Ge.push(n.COLOR_ATTACHMENT0+we),T.depthBuffer&&T.resolveDepthBuffer===!1&&(Ge.push(Y),Oe.push(Y),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Oe)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Ge))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),le)for(let we=0;we<_.length;we++){t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+we,n.RENDERBUFFER,Re.__webglColorRenderbuffer[we]);let se=i.get(_[we]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+we,n.TEXTURE_2D,se,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Re.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&c){let _=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function wt(T){return Math.min(s.maxSamples,T.samples)}function Ee(T){let _=i.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Ye(T){let _=o.render.frame;u.get(T)!==_&&(u.set(T,_),T.update())}function Xt(T,_){let z=T.colorSpace,$=T.format,ee=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||z!==Zt&&z!==Di&&(st.getTransfer(z)===ft?($!==Rn||ee!==Qn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),_}function Ut(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=U,this.setTexture2D=J,this.setTexture2DArray=K,this.setTexture3D=oe,this.setTextureCube=X,this.rebindTextures=tn,this.setupRenderTarget=I,this.updateRenderTargetMipmap=Tt,this.updateMultisampleRenderTarget=be,this.setupDepthRenderbuffer=rt,this.setupFrameBufferTexture=ve,this.useMultisampledRTT=Ee}function N_(n,e){function t(i,s=Di){let r,o=st.getTransfer(s);if(i===Qn)return n.UNSIGNED_BYTE;if(i===Ga)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Wa)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Vc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Gc)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===kc)return n.BYTE;if(i===Hc)return n.SHORT;if(i===dr)return n.UNSIGNED_SHORT;if(i===Va)return n.INT;if(i===Ki)return n.UNSIGNED_INT;if(i===On)return n.FLOAT;if(i===fr)return n.HALF_FLOAT;if(i===Wc)return n.ALPHA;if(i===Xc)return n.RGB;if(i===Rn)return n.RGBA;if(i===Js)return n.DEPTH_COMPONENT;if(i===mr)return n.DEPTH_STENCIL;if(i===Xa)return n.RED;if(i===qa)return n.RED_INTEGER;if(i===qc)return n.RG;if(i===Ya)return n.RG_INTEGER;if(i===Za)return n.RGBA_INTEGER;if(i===mo||i===go||i===xo||i===_o)if(o===ft)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===mo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===go)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===xo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===_o)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===mo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===go)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===xo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===_o)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ka||i===$a||i===Ja||i===ja)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ka)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===$a)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ja)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===ja)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Qa||i===el||i===tl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Qa||i===el)return o===ft?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===tl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===nl||i===il||i===sl||i===rl||i===ol||i===al||i===ll||i===cl||i===ul||i===hl||i===dl||i===fl||i===pl||i===ml)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===nl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===il)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===sl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===rl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ol)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===al)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ll)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===cl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===ul)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===hl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===dl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===fl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===pl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ml)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===gl||i===xl||i===_l)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===gl)return o===ft?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===xl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===_l)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===yl||i===vl||i===Ml||i===Sl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===yl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===vl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ml)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Sl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===pr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var U_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,F_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,mu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new ro(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Jn({vertexShader:U_,fragmentShader:F_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ze(new yn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},gu=class extends Ti{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,d=null,f=null,g=null,x=typeof XRWebGLBinding<"u",m=new mu,p={},w=t.getContextAttributes(),E=null,y=null,R=[],C=[],L=new je,F=null,b=new Ot;b.viewport=new lt;let S=new Ot;S.viewport=new lt;let P=[b,S],U=new Ca,k=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let te=R[j];return te===void 0&&(te=new nr,R[j]=te),te.getTargetRaySpace()},this.getControllerGrip=function(j){let te=R[j];return te===void 0&&(te=new nr,R[j]=te),te.getGripSpace()},this.getHand=function(j){let te=R[j];return te===void 0&&(te=new nr,R[j]=te),te.getHandSpace()};function J(j){let te=C.indexOf(j.inputSource);if(te===-1)return;let ve=R[te];ve!==void 0&&(ve.update(j.inputSource,j.frame,l||o),ve.dispatchEvent({type:j.type,data:j.inputSource}))}function K(){s.removeEventListener("select",J),s.removeEventListener("selectstart",J),s.removeEventListener("selectend",J),s.removeEventListener("squeeze",J),s.removeEventListener("squeezestart",J),s.removeEventListener("squeezeend",J),s.removeEventListener("end",K),s.removeEventListener("inputsourceschange",oe);for(let j=0;j<R.length;j++){let te=C[j];te!==null&&(C[j]=null,R[j].disconnect(te))}k=null,q=null,m.reset();for(let j in p)delete p[j];e.setRenderTarget(E),f=null,d=null,h=null,s=null,y=null,ut.stop(),i.isPresenting=!1,e.setPixelRatio(F),e.setSize(L.width,L.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){a=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(j){l=j},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",J),s.addEventListener("selectstart",J),s.addEventListener("selectend",J),s.addEventListener("squeeze",J),s.addEventListener("squeezestart",J),s.addEventListener("squeezeend",J),s.addEventListener("end",K),s.addEventListener("inputsourceschange",oe),w.xrCompatible!==!0&&await t.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(L),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let ve=null,ke=null,Ce=null;w.depth&&(Ce=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=w.stencil?mr:Js,ke=w.stencil?pr:Ki);let rt={colorFormat:t.RGBA8,depthFormat:Ce,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(rt),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new oi(d.textureWidth,d.textureHeight,{format:Rn,type:Qn,depthTexture:new so(d.textureWidth,d.textureHeight,ke,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let ve={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ve),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new oi(f.framebufferWidth,f.framebufferHeight,{format:Rn,type:Qn,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),ut.setContext(s),ut.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function oe(j){for(let te=0;te<j.removed.length;te++){let ve=j.removed[te],ke=C.indexOf(ve);ke>=0&&(C[ke]=null,R[ke].disconnect(ve))}for(let te=0;te<j.added.length;te++){let ve=j.added[te],ke=C.indexOf(ve);if(ke===-1){for(let rt=0;rt<R.length;rt++)if(rt>=C.length){C.push(ve),ke=rt;break}else if(C[rt]===null){C[rt]=ve,ke=rt;break}if(ke===-1)break}let Ce=R[ke];Ce&&Ce.connect(ve)}}let X=new A,de=new A;function ge(j,te,ve){X.setFromMatrixPosition(te.matrixWorld),de.setFromMatrixPosition(ve.matrixWorld);let ke=X.distanceTo(de),Ce=te.projectionMatrix.elements,rt=ve.projectionMatrix.elements,tn=Ce[14]/(Ce[10]-1),I=Ce[14]/(Ce[10]+1),Tt=(Ce[9]+1)/Ce[5],Ge=(Ce[9]-1)/Ce[5],Oe=(Ce[8]-1)/Ce[0],be=(rt[8]+1)/rt[0],wt=tn*Oe,Ee=tn*be,Ye=ke/(-Oe+be),Xt=Ye*-Oe;if(te.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(Xt),j.translateZ(Ye),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Ce[10]===-1)j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{let Ut=tn+Ye,T=I+Ye,_=wt-Xt,z=Ee+(ke-Xt),$=Tt*I/T*Ut,ee=Ge*I/T*Ut;j.projectionMatrix.makePerspective(_,z,$,ee,Ut,T),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function Pe(j,te){te===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(te.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let te=j.near,ve=j.far;m.texture!==null&&(m.depthNear>0&&(te=m.depthNear),m.depthFar>0&&(ve=m.depthFar)),U.near=S.near=b.near=te,U.far=S.far=b.far=ve,(k!==U.near||q!==U.far)&&(s.updateRenderState({depthNear:U.near,depthFar:U.far}),k=U.near,q=U.far),U.layers.mask=j.layers.mask|6,b.layers.mask=U.layers.mask&3,S.layers.mask=U.layers.mask&5;let ke=j.parent,Ce=U.cameras;Pe(U,ke);for(let rt=0;rt<Ce.length;rt++)Pe(Ce[rt],ke);Ce.length===2?ge(U,b,S):U.projectionMatrix.copy(b.projectionMatrix),et(j,U,ke)};function et(j,te,ve){ve===null?j.matrix.copy(te.matrixWorld):(j.matrix.copy(ve.matrixWorld),j.matrix.invert(),j.matrix.multiply(te.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=_s*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(j){c=j,d!==null&&(d.fixedFoveation=j),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(j){return p[j]};let vt=null;function Et(j,te){if(u=te.getViewerPose(l||o),g=te,u!==null){let ve=u.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let ke=!1;ve.length!==U.cameras.length&&(U.cameras.length=0,ke=!0);for(let I=0;I<ve.length;I++){let Tt=ve[I],Ge=null;if(f!==null)Ge=f.getViewport(Tt);else{let be=h.getViewSubImage(d,Tt);Ge=be.viewport,I===0&&(e.setRenderTargetTextures(y,be.colorTexture,be.depthStencilTexture),e.setRenderTarget(y))}let Oe=P[I];Oe===void 0&&(Oe=new Ot,Oe.layers.enable(I),Oe.viewport=new lt,P[I]=Oe),Oe.matrix.fromArray(Tt.transform.matrix),Oe.matrix.decompose(Oe.position,Oe.quaternion,Oe.scale),Oe.projectionMatrix.fromArray(Tt.projectionMatrix),Oe.projectionMatrixInverse.copy(Oe.projectionMatrix).invert(),Oe.viewport.set(Ge.x,Ge.y,Ge.width,Ge.height),I===0&&(U.matrix.copy(Oe.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),ke===!0&&U.cameras.push(Oe)}let Ce=s.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=i.getBinding();let I=h.getDepthInformation(ve[0]);I&&I.isValid&&I.texture&&m.init(I,s.renderState)}if(Ce&&Ce.includes("camera-access")&&x){e.state.unbindTexture(),h=i.getBinding();for(let I=0;I<ve.length;I++){let Tt=ve[I].camera;if(Tt){let Ge=p[Tt];Ge||(Ge=new ro,p[Tt]=Ge);let Oe=h.getCameraImage(Tt);Ge.sourceTexture=Oe}}}}for(let ve=0;ve<R.length;ve++){let ke=C[ve],Ce=R[ve];ke!==null&&Ce!==void 0&&Ce.update(ke,te,l||o)}vt&&vt(j,te),te.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:te}),g=null}let ut=new Sf;ut.setAnimationLoop(Et),this.setAnimationLoop=function(j){vt=j},this.dispose=function(){}}},Rs=new $n,O_=new We;function B_(n,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Qc(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,w,E,y){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,w,E):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===hn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===hn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let w=e.get(p),E=w.envMap,y=w.envMapRotation;E&&(m.envMap.value=E,Rs.copy(y),Rs.x*=-1,Rs.y*=-1,Rs.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Rs.y*=-1,Rs.z*=-1),m.envMapRotation.value.setFromMatrix4(O_.makeRotationFromEuler(Rs)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,w,E){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*w,m.scale.value=E*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,w){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===hn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){let w=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function z_(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(w,E){let y=E.program;i.uniformBlockBinding(w,y)}function l(w,E){let y=s[w.id];y===void 0&&(g(w),y=u(w),s[w.id]=y,w.addEventListener("dispose",m));let R=E.program;i.updateUBOMapping(w,R);let C=e.render.frame;r[w.id]!==C&&(d(w),r[w.id]=C)}function u(w){let E=h();w.__bindingPointIndex=E;let y=n.createBuffer(),R=w.__size,C=w.usage;return n.bindBuffer(n.UNIFORM_BUFFER,y),n.bufferData(n.UNIFORM_BUFFER,R,C),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,y),y}function h(){for(let w=0;w<a;w++)if(o.indexOf(w)===-1)return o.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(w){let E=s[w.id],y=w.uniforms,R=w.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let C=0,L=y.length;C<L;C++){let F=Array.isArray(y[C])?y[C]:[y[C]];for(let b=0,S=F.length;b<S;b++){let P=F[b];if(f(P,C,b,R)===!0){let U=P.__offset,k=Array.isArray(P.value)?P.value:[P.value],q=0;for(let J=0;J<k.length;J++){let K=k[J],oe=x(K);typeof K=="number"||typeof K=="boolean"?(P.__data[0]=K,n.bufferSubData(n.UNIFORM_BUFFER,U+q,P.__data)):K.isMatrix3?(P.__data[0]=K.elements[0],P.__data[1]=K.elements[1],P.__data[2]=K.elements[2],P.__data[3]=0,P.__data[4]=K.elements[3],P.__data[5]=K.elements[4],P.__data[6]=K.elements[5],P.__data[7]=0,P.__data[8]=K.elements[6],P.__data[9]=K.elements[7],P.__data[10]=K.elements[8],P.__data[11]=0):(K.toArray(P.__data,q),q+=oe.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,U,P.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(w,E,y,R){let C=w.value,L=E+"_"+y;if(R[L]===void 0)return typeof C=="number"||typeof C=="boolean"?R[L]=C:R[L]=C.clone(),!0;{let F=R[L];if(typeof C=="number"||typeof C=="boolean"){if(F!==C)return R[L]=C,!0}else if(F.equals(C)===!1)return F.copy(C),!0}return!1}function g(w){let E=w.uniforms,y=0,R=16;for(let L=0,F=E.length;L<F;L++){let b=Array.isArray(E[L])?E[L]:[E[L]];for(let S=0,P=b.length;S<P;S++){let U=b[S],k=Array.isArray(U.value)?U.value:[U.value];for(let q=0,J=k.length;q<J;q++){let K=k[q],oe=x(K),X=y%R,de=X%oe.boundary,ge=X+de;y+=de,ge!==0&&R-ge<oe.storage&&(y+=R-ge),U.__data=new Float32Array(oe.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=y,y+=oe.storage}}}let C=y%R;return C>0&&(y+=R-C),w.__size=y,w.__cache={},this}function x(w){let E={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(E.boundary=4,E.storage=4):w.isVector2?(E.boundary=8,E.storage=8):w.isVector3||w.isColor?(E.boundary=16,E.storage=12):w.isVector4?(E.boundary=16,E.storage=16):w.isMatrix3?(E.boundary=48,E.storage=48):w.isMatrix4?(E.boundary=64,E.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),E}function m(w){let E=w.target;E.removeEventListener("dispose",m);let y=o.indexOf(E.__bindingPointIndex);o.splice(y,1),n.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function p(){for(let w in s)n.deleteBuffer(s[w]);o=[],s={},r={}}return{bind:c,update:l,dispose:p}}var Al=class{constructor(e={}){let{canvas:t=qd(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;let g=new Uint32Array(4),x=new Int32Array(4),m=null,p=null,w=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Li,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,R=!1;this._outputColorSpace=Pt;let C=0,L=0,F=null,b=-1,S=null,P=new lt,U=new lt,k=null,q=new Ne(0),J=0,K=t.width,oe=t.height,X=1,de=null,ge=null,Pe=new lt(0,0,K,oe),et=new lt(0,0,K,oe),vt=!1,Et=new or,ut=!1,j=!1,te=new We,ve=new A,ke=new lt,Ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},rt=!1;function tn(){return F===null?X:1}let I=i;function Tt(v,O){return t.getContext(v,O)}try{let v={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",ce,!1),t.addEventListener("webglcontextrestored",ye,!1),t.addEventListener("webglcontextcreationerror",ne,!1),I===null){let O="webgl2";if(I=Tt(O,v),I===null)throw Tt(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let Ge,Oe,be,wt,Ee,Ye,Xt,Ut,T,_,z,$,ee,Y,Re,le,Te,we,se,me,Fe,Ae,fe,qe;function N(){Ge=new ix(I),Ge.init(),Ae=new N_(I,Ge),Oe=new $0(I,Ge,e,Ae),be=new L_(I,Ge),Oe.reversedDepthBuffer&&d&&be.buffers.depth.setReversed(!0),wt=new ox(I),Ee=new y_,Ye=new D_(I,Ge,be,Ee,Oe,Ae,wt),Xt=new j0(y),Ut=new nx(y),T=new dm(I),fe=new Z0(I,T),_=new sx(I,T,wt,fe),z=new lx(I,_,T,wt),se=new ax(I,Oe,Ye),le=new J0(Ee),$=new __(y,Xt,Ut,Ge,Oe,fe,le),ee=new B_(y,Ee),Y=new M_,Re=new A_(Ge),we=new Y0(y,Xt,Ut,be,z,f,c),Te=new I_(y,z,Oe),qe=new z_(I,wt,Oe,be),me=new K0(I,Ge,wt),Fe=new rx(I,Ge,wt),wt.programs=$.programs,y.capabilities=Oe,y.extensions=Ge,y.properties=Ee,y.renderLists=Y,y.shadowMap=Te,y.state=be,y.info=wt}N();let re=new gu(y,I);this.xr=re,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let v=Ge.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=Ge.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(v){v!==void 0&&(X=v,this.setSize(K,oe,!1))},this.getSize=function(v){return v.set(K,oe)},this.setSize=function(v,O,H=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}K=v,oe=O,t.width=Math.floor(v*X),t.height=Math.floor(O*X),H===!0&&(t.style.width=v+"px",t.style.height=O+"px"),this.setViewport(0,0,v,O)},this.getDrawingBufferSize=function(v){return v.set(K*X,oe*X).floor()},this.setDrawingBufferSize=function(v,O,H){K=v,oe=O,X=H,t.width=Math.floor(v*H),t.height=Math.floor(O*H),this.setViewport(0,0,v,O)},this.getCurrentViewport=function(v){return v.copy(P)},this.getViewport=function(v){return v.copy(Pe)},this.setViewport=function(v,O,H,V){v.isVector4?Pe.set(v.x,v.y,v.z,v.w):Pe.set(v,O,H,V),be.viewport(P.copy(Pe).multiplyScalar(X).round())},this.getScissor=function(v){return v.copy(et)},this.setScissor=function(v,O,H,V){v.isVector4?et.set(v.x,v.y,v.z,v.w):et.set(v,O,H,V),be.scissor(U.copy(et).multiplyScalar(X).round())},this.getScissorTest=function(){return vt},this.setScissorTest=function(v){be.setScissorTest(vt=v)},this.setOpaqueSort=function(v){de=v},this.setTransparentSort=function(v){ge=v},this.getClearColor=function(v){return v.copy(we.getClearColor())},this.setClearColor=function(){we.setClearColor(...arguments)},this.getClearAlpha=function(){return we.getClearAlpha()},this.setClearAlpha=function(){we.setClearAlpha(...arguments)},this.clear=function(v=!0,O=!0,H=!0){let V=0;if(v){let B=!1;if(F!==null){let ie=F.texture.format;B=ie===Za||ie===Ya||ie===qa}if(B){let ie=F.texture.type,pe=ie===Qn||ie===Ki||ie===dr||ie===pr||ie===Ga||ie===Wa,Me=we.getClearColor(),xe=we.getClearAlpha(),Ue=Me.r,Be=Me.g,Le=Me.b;pe?(g[0]=Ue,g[1]=Be,g[2]=Le,g[3]=xe,I.clearBufferuiv(I.COLOR,0,g)):(x[0]=Ue,x[1]=Be,x[2]=Le,x[3]=xe,I.clearBufferiv(I.COLOR,0,x))}else V|=I.COLOR_BUFFER_BIT}O&&(V|=I.DEPTH_BUFFER_BIT),H&&(V|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ce,!1),t.removeEventListener("webglcontextrestored",ye,!1),t.removeEventListener("webglcontextcreationerror",ne,!1),we.dispose(),Y.dispose(),Re.dispose(),Ee.dispose(),Xt.dispose(),Ut.dispose(),z.dispose(),fe.dispose(),qe.dispose(),$.dispose(),re.dispose(),re.removeEventListener("sessionstart",ni),re.removeEventListener("sessionend",gh),as.stop()};function ce(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function ye(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;let v=wt.autoReset,O=Te.enabled,H=Te.autoUpdate,V=Te.needsUpdate,B=Te.type;N(),wt.autoReset=v,Te.enabled=O,Te.autoUpdate=H,Te.needsUpdate=V,Te.type=B}function ne(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Q(v){let O=v.target;O.removeEventListener("dispose",Q),Se(O)}function Se(v){Ve(v),Ee.remove(v)}function Ve(v){let O=Ee.get(v).programs;O!==void 0&&(O.forEach(function(H){$.releaseProgram(H)}),v.isShaderMaterial&&$.releaseShaderCache(v))}this.renderBufferDirect=function(v,O,H,V,B,ie){O===null&&(O=Ce);let pe=B.isMesh&&B.matrixWorld.determinant()<0,Me=op(v,O,H,V,B);be.setMaterial(V,pe);let xe=H.index,Ue=1;if(V.wireframe===!0){if(xe=_.getWireframeAttribute(H),xe===void 0)return;Ue=2}let Be=H.drawRange,Le=H.attributes.position,it=Be.start*Ue,xt=(Be.start+Be.count)*Ue;ie!==null&&(it=Math.max(it,ie.start*Ue),xt=Math.min(xt,(ie.start+ie.count)*Ue)),xe!==null?(it=Math.max(it,0),xt=Math.min(xt,xe.count)):Le!=null&&(it=Math.max(it,0),xt=Math.min(xt,Le.count));let Dt=xt-it;if(Dt<0||Dt===1/0)return;fe.setup(B,V,Me,H,xe);let St,_t=me;if(xe!==null&&(St=T.get(xe),_t=Fe,_t.setIndex(St)),B.isMesh)V.wireframe===!0?(be.setLineWidth(V.wireframeLinewidth*tn()),_t.setMode(I.LINES)):_t.setMode(I.TRIANGLES);else if(B.isLine){let De=V.linewidth;De===void 0&&(De=1),be.setLineWidth(De*tn()),B.isLineSegments?_t.setMode(I.LINES):B.isLineLoop?_t.setMode(I.LINE_LOOP):_t.setMode(I.LINE_STRIP)}else B.isPoints?_t.setMode(I.POINTS):B.isSprite&&_t.setMode(I.TRIANGLES);if(B.isBatchedMesh)if(B._multiDrawInstances!==null)Qs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),_t.renderMultiDrawInstances(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount,B._multiDrawInstances);else if(Ge.get("WEBGL_multi_draw"))_t.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{let De=B._multiDrawStarts,Ct=B._multiDrawCounts,at=B._multiDrawCount,bn=xe?T.get(xe).bytesPerElement:1,Ns=Ee.get(V).currentProgram.getUniforms();for(let En=0;En<at;En++)Ns.setValue(I,"_gl_DrawID",En),_t.render(De[En]/bn,Ct[En])}else if(B.isInstancedMesh)_t.renderInstances(it,Dt,B.count);else if(H.isInstancedBufferGeometry){let De=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Ct=Math.min(H.instanceCount,De);_t.renderInstances(it,Dt,Ct)}else _t.render(it,Dt)};function Mt(v,O,H){v.transparent===!0&&v.side===dn&&v.forceSinglePass===!1?(v.side=hn,v.needsUpdate=!0,zo(v,O,H),v.side=Zn,v.needsUpdate=!0,zo(v,O,H),v.side=dn):zo(v,O,H)}this.compile=function(v,O,H=null){H===null&&(H=v),p=Re.get(H),p.init(O),E.push(p),H.traverseVisible(function(B){B.isLight&&B.layers.test(O.layers)&&(p.pushLight(B),B.castShadow&&p.pushShadow(B))}),v!==H&&v.traverseVisible(function(B){B.isLight&&B.layers.test(O.layers)&&(p.pushLight(B),B.castShadow&&p.pushShadow(B))}),p.setupLights();let V=new Set;return v.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;let ie=B.material;if(ie)if(Array.isArray(ie))for(let pe=0;pe<ie.length;pe++){let Me=ie[pe];Mt(Me,H,B),V.add(Me)}else Mt(ie,H,B),V.add(ie)}),p=E.pop(),V},this.compileAsync=function(v,O,H=null){let V=this.compile(v,O,H);return new Promise(B=>{function ie(){if(V.forEach(function(pe){Ee.get(pe).currentProgram.isReady()&&V.delete(pe)}),V.size===0){B(v);return}setTimeout(ie,10)}Ge.get("KHR_parallel_shader_compile")!==null?ie():setTimeout(ie,10)})};let ht=null;function xi(v){ht&&ht(v)}function ni(){as.stop()}function gh(){as.start()}let as=new Sf;as.setAnimationLoop(xi),typeof self<"u"&&as.setContext(self),this.setAnimationLoop=function(v){ht=v,re.setAnimationLoop(v),v===null?as.stop():as.start()},re.addEventListener("sessionstart",ni),re.addEventListener("sessionend",gh),this.render=function(v,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(O),O=re.getCamera()),v.isScene===!0&&v.onBeforeRender(y,v,O,F),p=Re.get(v,E.length),p.init(O),E.push(p),te.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Et.setFromProjectionMatrix(te,qn,O.reversedDepth),j=this.localClippingEnabled,ut=le.init(this.clippingPlanes,j),m=Y.get(v,w.length),m.init(),w.push(m),re.enabled===!0&&re.isPresenting===!0){let ie=y.xr.getDepthSensingMesh();ie!==null&&ql(ie,O,-1/0,y.sortObjects)}ql(v,O,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(de,ge),rt=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,rt&&we.addToRenderList(m,v),this.info.render.frame++,ut===!0&&le.beginShadows();let H=p.state.shadowsArray;Te.render(H,v,O),ut===!0&&le.endShadows(),this.info.autoReset===!0&&this.info.reset();let V=m.opaque,B=m.transmissive;if(p.setupLights(),O.isArrayCamera){let ie=O.cameras;if(B.length>0)for(let pe=0,Me=ie.length;pe<Me;pe++){let xe=ie[pe];_h(V,B,v,xe)}rt&&we.render(v);for(let pe=0,Me=ie.length;pe<Me;pe++){let xe=ie[pe];xh(m,v,xe,xe.viewport)}}else B.length>0&&_h(V,B,v,O),rt&&we.render(v),xh(m,v,O);F!==null&&L===0&&(Ye.updateMultisampleRenderTarget(F),Ye.updateRenderTargetMipmap(F)),v.isScene===!0&&v.onAfterRender(y,v,O),fe.resetDefaultState(),b=-1,S=null,E.pop(),E.length>0?(p=E[E.length-1],ut===!0&&le.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,w.pop(),w.length>0?m=w[w.length-1]:m=null};function ql(v,O,H,V){if(v.visible===!1)return;if(v.layers.test(O.layers)){if(v.isGroup)H=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(O);else if(v.isLight)p.pushLight(v),v.castShadow&&p.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||Et.intersectsSprite(v)){V&&ke.setFromMatrixPosition(v.matrixWorld).applyMatrix4(te);let pe=z.update(v),Me=v.material;Me.visible&&m.push(v,pe,Me,H,ke.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||Et.intersectsObject(v))){let pe=z.update(v),Me=v.material;if(V&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),ke.copy(v.boundingSphere.center)):(pe.boundingSphere===null&&pe.computeBoundingSphere(),ke.copy(pe.boundingSphere.center)),ke.applyMatrix4(v.matrixWorld).applyMatrix4(te)),Array.isArray(Me)){let xe=pe.groups;for(let Ue=0,Be=xe.length;Ue<Be;Ue++){let Le=xe[Ue],it=Me[Le.materialIndex];it&&it.visible&&m.push(v,pe,it,H,ke.z,Le)}}else Me.visible&&m.push(v,pe,Me,H,ke.z,null)}}let ie=v.children;for(let pe=0,Me=ie.length;pe<Me;pe++)ql(ie[pe],O,H,V)}function xh(v,O,H,V){let B=v.opaque,ie=v.transmissive,pe=v.transparent;p.setupLightsView(H),ut===!0&&le.setGlobalState(y.clippingPlanes,H),V&&be.viewport(P.copy(V)),B.length>0&&Bo(B,O,H),ie.length>0&&Bo(ie,O,H),pe.length>0&&Bo(pe,O,H),be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function _h(v,O,H,V){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[V.id]===void 0&&(p.state.transmissionRenderTarget[V.id]=new oi(1,1,{generateMipmaps:!0,type:Ge.has("EXT_color_buffer_half_float")||Ge.has("EXT_color_buffer_float")?fr:Qn,minFilter:jn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:st.workingColorSpace}));let ie=p.state.transmissionRenderTarget[V.id],pe=V.viewport||P;ie.setSize(pe.z*y.transmissionResolutionScale,pe.w*y.transmissionResolutionScale);let Me=y.getRenderTarget(),xe=y.getActiveCubeFace(),Ue=y.getActiveMipmapLevel();y.setRenderTarget(ie),y.getClearColor(q),J=y.getClearAlpha(),J<1&&y.setClearColor(16777215,.5),y.clear(),rt&&we.render(H);let Be=y.toneMapping;y.toneMapping=Li;let Le=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),p.setupLightsView(V),ut===!0&&le.setGlobalState(y.clippingPlanes,V),Bo(v,H,V),Ye.updateMultisampleRenderTarget(ie),Ye.updateRenderTargetMipmap(ie),Ge.has("WEBGL_multisampled_render_to_texture")===!1){let it=!1;for(let xt=0,Dt=O.length;xt<Dt;xt++){let St=O[xt],_t=St.object,De=St.geometry,Ct=St.material,at=St.group;if(Ct.side===dn&&_t.layers.test(V.layers)){let bn=Ct.side;Ct.side=hn,Ct.needsUpdate=!0,yh(_t,H,V,De,Ct,at),Ct.side=bn,Ct.needsUpdate=!0,it=!0}}it===!0&&(Ye.updateMultisampleRenderTarget(ie),Ye.updateRenderTargetMipmap(ie))}y.setRenderTarget(Me,xe,Ue),y.setClearColor(q,J),Le!==void 0&&(V.viewport=Le),y.toneMapping=Be}function Bo(v,O,H){let V=O.isScene===!0?O.overrideMaterial:null;for(let B=0,ie=v.length;B<ie;B++){let pe=v[B],Me=pe.object,xe=pe.geometry,Ue=pe.group,Be=pe.material;Be.allowOverride===!0&&V!==null&&(Be=V),Me.layers.test(H.layers)&&yh(Me,O,H,xe,Be,Ue)}}function yh(v,O,H,V,B,ie){v.onBeforeRender(y,O,H,V,B,ie),v.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),B.onBeforeRender(y,O,H,V,v,ie),B.transparent===!0&&B.side===dn&&B.forceSinglePass===!1?(B.side=hn,B.needsUpdate=!0,y.renderBufferDirect(H,O,V,B,v,ie),B.side=Zn,B.needsUpdate=!0,y.renderBufferDirect(H,O,V,B,v,ie),B.side=dn):y.renderBufferDirect(H,O,V,B,v,ie),v.onAfterRender(y,O,H,V,B,ie)}function zo(v,O,H){O.isScene!==!0&&(O=Ce);let V=Ee.get(v),B=p.state.lights,ie=p.state.shadowsArray,pe=B.state.version,Me=$.getParameters(v,B.state,ie,O,H),xe=$.getProgramCacheKey(Me),Ue=V.programs;V.environment=v.isMeshStandardMaterial?O.environment:null,V.fog=O.fog,V.envMap=(v.isMeshStandardMaterial?Ut:Xt).get(v.envMap||V.environment),V.envMapRotation=V.environment!==null&&v.envMap===null?O.environmentRotation:v.envMapRotation,Ue===void 0&&(v.addEventListener("dispose",Q),Ue=new Map,V.programs=Ue);let Be=Ue.get(xe);if(Be!==void 0){if(V.currentProgram===Be&&V.lightsStateVersion===pe)return Mh(v,Me),Be}else Me.uniforms=$.getUniforms(v),v.onBeforeCompile(Me,y),Be=$.acquireProgram(Me,xe),Ue.set(xe,Be),V.uniforms=Me.uniforms;let Le=V.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Le.clippingPlanes=le.uniform),Mh(v,Me),V.needsLights=lp(v),V.lightsStateVersion=pe,V.needsLights&&(Le.ambientLightColor.value=B.state.ambient,Le.lightProbe.value=B.state.probe,Le.directionalLights.value=B.state.directional,Le.directionalLightShadows.value=B.state.directionalShadow,Le.spotLights.value=B.state.spot,Le.spotLightShadows.value=B.state.spotShadow,Le.rectAreaLights.value=B.state.rectArea,Le.ltc_1.value=B.state.rectAreaLTC1,Le.ltc_2.value=B.state.rectAreaLTC2,Le.pointLights.value=B.state.point,Le.pointLightShadows.value=B.state.pointShadow,Le.hemisphereLights.value=B.state.hemi,Le.directionalShadowMap.value=B.state.directionalShadowMap,Le.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Le.spotShadowMap.value=B.state.spotShadowMap,Le.spotLightMatrix.value=B.state.spotLightMatrix,Le.spotLightMap.value=B.state.spotLightMap,Le.pointShadowMap.value=B.state.pointShadowMap,Le.pointShadowMatrix.value=B.state.pointShadowMatrix),V.currentProgram=Be,V.uniformsList=null,Be}function vh(v){if(v.uniformsList===null){let O=v.currentProgram.getUniforms();v.uniformsList=vr.seqWithValue(O.seq,v.uniforms)}return v.uniformsList}function Mh(v,O){let H=Ee.get(v);H.outputColorSpace=O.outputColorSpace,H.batching=O.batching,H.batchingColor=O.batchingColor,H.instancing=O.instancing,H.instancingColor=O.instancingColor,H.instancingMorph=O.instancingMorph,H.skinning=O.skinning,H.morphTargets=O.morphTargets,H.morphNormals=O.morphNormals,H.morphColors=O.morphColors,H.morphTargetsCount=O.morphTargetsCount,H.numClippingPlanes=O.numClippingPlanes,H.numIntersection=O.numClipIntersection,H.vertexAlphas=O.vertexAlphas,H.vertexTangents=O.vertexTangents,H.toneMapping=O.toneMapping}function op(v,O,H,V,B){O.isScene!==!0&&(O=Ce),Ye.resetTextureUnits();let ie=O.fog,pe=V.isMeshStandardMaterial?O.environment:null,Me=F===null?y.outputColorSpace:F.isXRRenderTarget===!0?F.texture.colorSpace:Zt,xe=(V.isMeshStandardMaterial?Ut:Xt).get(V.envMap||pe),Ue=V.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Be=!!H.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Le=!!H.morphAttributes.position,it=!!H.morphAttributes.normal,xt=!!H.morphAttributes.color,Dt=Li;V.toneMapped&&(F===null||F.isXRRenderTarget===!0)&&(Dt=y.toneMapping);let St=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,_t=St!==void 0?St.length:0,De=Ee.get(V),Ct=p.state.lights;if(ut===!0&&(j===!0||v!==S)){let an=v===S&&V.id===b;le.setState(V,v,an)}let at=!1;V.version===De.__version?(De.needsLights&&De.lightsStateVersion!==Ct.state.version||De.outputColorSpace!==Me||B.isBatchedMesh&&De.batching===!1||!B.isBatchedMesh&&De.batching===!0||B.isBatchedMesh&&De.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&De.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&De.instancing===!1||!B.isInstancedMesh&&De.instancing===!0||B.isSkinnedMesh&&De.skinning===!1||!B.isSkinnedMesh&&De.skinning===!0||B.isInstancedMesh&&De.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&De.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&De.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&De.instancingMorph===!1&&B.morphTexture!==null||De.envMap!==xe||V.fog===!0&&De.fog!==ie||De.numClippingPlanes!==void 0&&(De.numClippingPlanes!==le.numPlanes||De.numIntersection!==le.numIntersection)||De.vertexAlphas!==Ue||De.vertexTangents!==Be||De.morphTargets!==Le||De.morphNormals!==it||De.morphColors!==xt||De.toneMapping!==Dt||De.morphTargetsCount!==_t)&&(at=!0):(at=!0,De.__version=V.version);let bn=De.currentProgram;at===!0&&(bn=zo(V,O,B));let Ns=!1,En=!1,Ir=!1,It=bn.getUniforms(),Ln=De.uniforms;if(be.useProgram(bn.program)&&(Ns=!0,En=!0,Ir=!0),V.id!==b&&(b=V.id,En=!0),Ns||S!==v){be.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),It.setValue(I,"projectionMatrix",v.projectionMatrix),It.setValue(I,"viewMatrix",v.matrixWorldInverse);let gn=It.map.cameraPosition;gn!==void 0&&gn.setValue(I,ve.setFromMatrixPosition(v.matrixWorld)),Oe.logarithmicDepthBuffer&&It.setValue(I,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&It.setValue(I,"isOrthographic",v.isOrthographicCamera===!0),S!==v&&(S=v,En=!0,Ir=!0)}if(B.isSkinnedMesh){It.setOptional(I,B,"bindMatrix"),It.setOptional(I,B,"bindMatrixInverse");let an=B.skeleton;an&&(an.boneTexture===null&&an.computeBoneTexture(),It.setValue(I,"boneTexture",an.boneTexture,Ye))}B.isBatchedMesh&&(It.setOptional(I,B,"batchingTexture"),It.setValue(I,"batchingTexture",B._matricesTexture,Ye),It.setOptional(I,B,"batchingIdTexture"),It.setValue(I,"batchingIdTexture",B._indirectTexture,Ye),It.setOptional(I,B,"batchingColorTexture"),B._colorsTexture!==null&&It.setValue(I,"batchingColorTexture",B._colorsTexture,Ye));let Dn=H.morphAttributes;if((Dn.position!==void 0||Dn.normal!==void 0||Dn.color!==void 0)&&se.update(B,H,bn),(En||De.receiveShadow!==B.receiveShadow)&&(De.receiveShadow=B.receiveShadow,It.setValue(I,"receiveShadow",B.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(Ln.envMap.value=xe,Ln.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&O.environment!==null&&(Ln.envMapIntensity.value=O.environmentIntensity),En&&(It.setValue(I,"toneMappingExposure",y.toneMappingExposure),De.needsLights&&ap(Ln,Ir),ie&&V.fog===!0&&ee.refreshFogUniforms(Ln,ie),ee.refreshMaterialUniforms(Ln,V,X,oe,p.state.transmissionRenderTarget[v.id]),vr.upload(I,vh(De),Ln,Ye)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(vr.upload(I,vh(De),Ln,Ye),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&It.setValue(I,"center",B.center),It.setValue(I,"modelViewMatrix",B.modelViewMatrix),It.setValue(I,"normalMatrix",B.normalMatrix),It.setValue(I,"modelMatrix",B.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){let an=V.uniformsGroups;for(let gn=0,Yl=an.length;gn<Yl;gn++){let ls=an[gn];qe.update(ls,bn),qe.bind(ls,bn)}}return bn}function ap(v,O){v.ambientLightColor.needsUpdate=O,v.lightProbe.needsUpdate=O,v.directionalLights.needsUpdate=O,v.directionalLightShadows.needsUpdate=O,v.pointLights.needsUpdate=O,v.pointLightShadows.needsUpdate=O,v.spotLights.needsUpdate=O,v.spotLightShadows.needsUpdate=O,v.rectAreaLights.needsUpdate=O,v.hemisphereLights.needsUpdate=O}function lp(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return F},this.setRenderTargetTextures=function(v,O,H){let V=Ee.get(v);V.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),Ee.get(v.texture).__webglTexture=O,Ee.get(v.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:H,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,O){let H=Ee.get(v);H.__webglFramebuffer=O,H.__useDefaultFramebuffer=O===void 0};let cp=I.createFramebuffer();this.setRenderTarget=function(v,O=0,H=0){F=v,C=O,L=H;let V=!0,B=null,ie=!1,pe=!1;if(v){let xe=Ee.get(v);if(xe.__useDefaultFramebuffer!==void 0)be.bindFramebuffer(I.FRAMEBUFFER,null),V=!1;else if(xe.__webglFramebuffer===void 0)Ye.setupRenderTarget(v);else if(xe.__hasExternalTextures)Ye.rebindTextures(v,Ee.get(v.texture).__webglTexture,Ee.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Le=v.depthTexture;if(xe.__boundDepthTexture!==Le){if(Le!==null&&Ee.has(Le)&&(v.width!==Le.image.width||v.height!==Le.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ye.setupDepthRenderbuffer(v)}}let Ue=v.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(pe=!0);let Be=Ee.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Be[O])?B=Be[O][H]:B=Be[O],ie=!0):v.samples>0&&Ye.useMultisampledRTT(v)===!1?B=Ee.get(v).__webglMultisampledFramebuffer:Array.isArray(Be)?B=Be[H]:B=Be,P.copy(v.viewport),U.copy(v.scissor),k=v.scissorTest}else P.copy(Pe).multiplyScalar(X).floor(),U.copy(et).multiplyScalar(X).floor(),k=vt;if(H!==0&&(B=cp),be.bindFramebuffer(I.FRAMEBUFFER,B)&&V&&be.drawBuffers(v,B),be.viewport(P),be.scissor(U),be.setScissorTest(k),ie){let xe=Ee.get(v.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+O,xe.__webglTexture,H)}else if(pe){let xe=O;for(let Ue=0;Ue<v.textures.length;Ue++){let Be=Ee.get(v.textures[Ue]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+Ue,Be.__webglTexture,H,xe)}}else if(v!==null&&H!==0){let xe=Ee.get(v.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,xe.__webglTexture,H)}b=-1},this.readRenderTargetPixels=function(v,O,H,V,B,ie,pe,Me=0){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Ee.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&pe!==void 0&&(xe=xe[pe]),xe){be.bindFramebuffer(I.FRAMEBUFFER,xe);try{let Ue=v.textures[Me],Be=Ue.format,Le=Ue.type;if(!Oe.textureFormatReadable(Be)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Oe.textureTypeReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=v.width-V&&H>=0&&H<=v.height-B&&(v.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+Me),I.readPixels(O,H,V,B,Ae.convert(Be),Ae.convert(Le),ie))}finally{let Ue=F!==null?Ee.get(F).__webglFramebuffer:null;be.bindFramebuffer(I.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(v,O,H,V,B,ie,pe,Me=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=Ee.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&pe!==void 0&&(xe=xe[pe]),xe)if(O>=0&&O<=v.width-V&&H>=0&&H<=v.height-B){be.bindFramebuffer(I.FRAMEBUFFER,xe);let Ue=v.textures[Me],Be=Ue.format,Le=Ue.type;if(!Oe.textureFormatReadable(Be))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Oe.textureTypeReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let it=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,it),I.bufferData(I.PIXEL_PACK_BUFFER,ie.byteLength,I.STREAM_READ),v.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+Me),I.readPixels(O,H,V,B,Ae.convert(Be),Ae.convert(Le),0);let xt=F!==null?Ee.get(F).__webglFramebuffer:null;be.bindFramebuffer(I.FRAMEBUFFER,xt);let Dt=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Yd(I,Dt,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,it),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,ie),I.deleteBuffer(it),I.deleteSync(Dt),ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,O=null,H=0){let V=Math.pow(2,-H),B=Math.floor(v.image.width*V),ie=Math.floor(v.image.height*V),pe=O!==null?O.x:0,Me=O!==null?O.y:0;Ye.setTexture2D(v,0),I.copyTexSubImage2D(I.TEXTURE_2D,H,0,0,pe,Me,B,ie),be.unbindTexture()};let up=I.createFramebuffer(),hp=I.createFramebuffer();this.copyTextureToTexture=function(v,O,H=null,V=null,B=0,ie=null){ie===null&&(B!==0?(Qs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ie=B,B=0):ie=0);let pe,Me,xe,Ue,Be,Le,it,xt,Dt,St=v.isCompressedTexture?v.mipmaps[ie]:v.image;if(H!==null)pe=H.max.x-H.min.x,Me=H.max.y-H.min.y,xe=H.isBox3?H.max.z-H.min.z:1,Ue=H.min.x,Be=H.min.y,Le=H.isBox3?H.min.z:0;else{let Dn=Math.pow(2,-B);pe=Math.floor(St.width*Dn),Me=Math.floor(St.height*Dn),v.isDataArrayTexture?xe=St.depth:v.isData3DTexture?xe=Math.floor(St.depth*Dn):xe=1,Ue=0,Be=0,Le=0}V!==null?(it=V.x,xt=V.y,Dt=V.z):(it=0,xt=0,Dt=0);let _t=Ae.convert(O.format),De=Ae.convert(O.type),Ct;O.isData3DTexture?(Ye.setTexture3D(O,0),Ct=I.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Ye.setTexture2DArray(O,0),Ct=I.TEXTURE_2D_ARRAY):(Ye.setTexture2D(O,0),Ct=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,O.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,O.unpackAlignment);let at=I.getParameter(I.UNPACK_ROW_LENGTH),bn=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Ns=I.getParameter(I.UNPACK_SKIP_PIXELS),En=I.getParameter(I.UNPACK_SKIP_ROWS),Ir=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,St.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,St.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ue),I.pixelStorei(I.UNPACK_SKIP_ROWS,Be),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Le);let It=v.isDataArrayTexture||v.isData3DTexture,Ln=O.isDataArrayTexture||O.isData3DTexture;if(v.isDepthTexture){let Dn=Ee.get(v),an=Ee.get(O),gn=Ee.get(Dn.__renderTarget),Yl=Ee.get(an.__renderTarget);be.bindFramebuffer(I.READ_FRAMEBUFFER,gn.__webglFramebuffer),be.bindFramebuffer(I.DRAW_FRAMEBUFFER,Yl.__webglFramebuffer);for(let ls=0;ls<xe;ls++)It&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ee.get(v).__webglTexture,B,Le+ls),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ee.get(O).__webglTexture,ie,Dt+ls)),I.blitFramebuffer(Ue,Be,pe,Me,it,xt,pe,Me,I.DEPTH_BUFFER_BIT,I.NEAREST);be.bindFramebuffer(I.READ_FRAMEBUFFER,null),be.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(B!==0||v.isRenderTargetTexture||Ee.has(v)){let Dn=Ee.get(v),an=Ee.get(O);be.bindFramebuffer(I.READ_FRAMEBUFFER,up),be.bindFramebuffer(I.DRAW_FRAMEBUFFER,hp);for(let gn=0;gn<xe;gn++)It?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Dn.__webglTexture,B,Le+gn):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Dn.__webglTexture,B),Ln?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,an.__webglTexture,ie,Dt+gn):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,an.__webglTexture,ie),B!==0?I.blitFramebuffer(Ue,Be,pe,Me,it,xt,pe,Me,I.COLOR_BUFFER_BIT,I.NEAREST):Ln?I.copyTexSubImage3D(Ct,ie,it,xt,Dt+gn,Ue,Be,pe,Me):I.copyTexSubImage2D(Ct,ie,it,xt,Ue,Be,pe,Me);be.bindFramebuffer(I.READ_FRAMEBUFFER,null),be.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else Ln?v.isDataTexture||v.isData3DTexture?I.texSubImage3D(Ct,ie,it,xt,Dt,pe,Me,xe,_t,De,St.data):O.isCompressedArrayTexture?I.compressedTexSubImage3D(Ct,ie,it,xt,Dt,pe,Me,xe,_t,St.data):I.texSubImage3D(Ct,ie,it,xt,Dt,pe,Me,xe,_t,De,St):v.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,ie,it,xt,pe,Me,_t,De,St.data):v.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,ie,it,xt,St.width,St.height,_t,St.data):I.texSubImage2D(I.TEXTURE_2D,ie,it,xt,pe,Me,_t,De,St);I.pixelStorei(I.UNPACK_ROW_LENGTH,at),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,bn),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ns),I.pixelStorei(I.UNPACK_SKIP_ROWS,En),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Ir),ie===0&&O.generateMipmaps&&I.generateMipmap(Ct),be.unbindTexture()},this.initRenderTarget=function(v){Ee.get(v).__webglFramebuffer===void 0&&Ye.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Ye.setTextureCube(v,0):v.isData3DTexture?Ye.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Ye.setTexture2DArray(v,0):Ye.setTexture2D(v,0),be.unbindTexture()},this.resetState=function(){C=0,L=0,F=null,be.reset(),fe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=st._getDrawingBufferColorSpace(e),t.unpackColorSpace=st._getUnpackColorSpace()}};function _u(n,e){if(e===Yc)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),n;if(e===gr||e===yo){let t=n.getIndex();if(t===null){let o=[],a=n.getAttribute("position");if(a!==void 0){for(let c=0;c<a.count;c++)o.push(c);n.setIndex(o),t=n.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),n}let i=t.count-2,s=[];if(e===gr)for(let o=1;o<=i;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=n.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),n}var Cl=class extends hi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Tu(t)}),this.register(function(t){return new wu(t)}),this.register(function(t){return new Uu(t)}),this.register(function(t){return new Fu(t)}),this.register(function(t){return new Ou(t)}),this.register(function(t){return new Ru(t)}),this.register(function(t){return new Cu(t)}),this.register(function(t){return new Iu(t)}),this.register(function(t){return new Pu(t)}),this.register(function(t){return new Eu(t)}),this.register(function(t){return new Lu(t)}),this.register(function(t){return new Au(t)}),this.register(function(t){return new Nu(t)}),this.register(function(t){return new Du(t)}),this.register(function(t){return new Su(t)}),this.register(function(t){return new Bu(t)}),this.register(function(t){return new zu(t)})}load(e,t,i,s){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let l=Ii.extractUrlBase(e);o=Ii.resolveURL(l,this.path)}else o=Ii.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){s?s(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new cr(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},i,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,i,s){let r,o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Pf){try{o[nt.KHR_BINARY_GLTF]=new ku(e)}catch(h){s&&s(h);return}r=JSON.parse(o[nt.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new Yu(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](l);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],d=r.extensionsRequired||[];switch(h){case nt.KHR_MATERIALS_UNLIT:o[h]=new bu;break;case nt.KHR_DRACO_MESH_COMPRESSION:o[h]=new Hu(r,this.dracoLoader);break;case nt.KHR_TEXTURE_TRANSFORM:o[h]=new Vu;break;case nt.KHR_MESH_QUANTIZATION:o[h]=new Gu;break;default:d.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(i,s)}parseAsync(e,t){let i=this;return new Promise(function(s,r){i.parse(e,t,s,r)})}};function H_(){let n={};return{get:function(e){return n[e]},add:function(e,t){n[e]=t},remove:function(e){delete n[e]},removeAll:function(){n={}}}}var nt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Su=class{constructor(e){this.parser=e,this.name=nt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let i=0,s=t.length;i<s;i++){let r=t[i];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,i="light:"+e,s=t.cache.get(i);if(s)return s;let r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,u=new Ne(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],Zt);let h=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Ss(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Mn(u),l.distance=h;break;case"spot":l=new vs(u),l.distance=h,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),pi(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),s=Promise.resolve(l),t.cache.add(i,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,i=this.parser,r=i.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return i._getNodeRef(t.cache,a,c)})}},bu=class{constructor(){this.name=nt.KHR_MATERIALS_UNLIT}getMaterialType(){return Kt}extendParams(e,t,i){let s=[];e.color=new Ne(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Zt),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(i.assignTexture(e,"map",r.baseColorTexture,Pt))}return Promise.all(s)}},Eu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Tu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(i.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(i.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(i.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new je(a,a)}return Promise.all(r)}},wu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_DISPERSION}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Au=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(i.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(i.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},Ru=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_SHEEN}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new Ne(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=s.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Zt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(i.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Pt)),o.sheenRoughnessTexture!==void 0&&r.push(i.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},Cu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(i.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},Iu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_VOLUME}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(i.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ne().setRGB(a[0],a[1],a[2],Zt),Promise.all(r)}},Pu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_IOR}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},Lu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_SPECULAR}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(i.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ne().setRGB(a[0],a[1],a[2],Zt),o.specularColorTexture!==void 0&&r.push(i.assignTexture(t,"specularColorMap",o.specularColorTexture,Pt)),Promise.all(r)}},Du=class{constructor(e){this.parser=e,this.name=nt.EXT_MATERIALS_BUMP}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(i.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},Nu=class{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:zt}extendMaterialParams(e,t){let i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(i.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}},Uu=class{constructor(e){this.parser=e,this.name=nt.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,i=t.json,s=i.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(i.extensionsRequired&&i.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},Fu=class{constructor(e){this.parser=e,this.name=nt.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,i=this.parser,s=i.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=i.textureLoader;if(a.uri){let l=i.options.manager.getHandler(a.uri);l!==null&&(c=l)}return i.loadTextureImage(e,o.source,c)}},Ou=class{constructor(e){this.parser=e,this.name=nt.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,i=this.parser,s=i.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=i.textureLoader;if(a.uri){let l=i.options.manager.getHandler(a.uri);l!==null&&(c=l)}return i.loadTextureImage(e,o.source,c)}},Bu=class{constructor(e){this.name=nt.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,i=t.bufferViews[e];if(i.extensions&&i.extensions[this.name]){let s=i.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let c=s.byteOffset||0,l=s.byteLength||0,u=s.count,h=s.byteStride,d=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,d,s.mode,s.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(f),u,h,d,s.mode,s.filter),f})})}else return null}},zu=class{constructor(e){this.name=nt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,i=t.nodes[e];if(!i.extensions||!i.extensions[this.name]||i.mesh===void 0)return null;let s=t.meshes[i.mesh];for(let l of s.primitives)if(l.mode!==Bn.TRIANGLES&&l.mode!==Bn.TRIANGLE_STRIP&&l.mode!==Bn.TRIANGLE_FAN&&l.mode!==void 0)return null;let o=i.extensions[this.name].attributes,a=[],c={};for(let l in o)a.push(this.parser.getDependency("accessor",o[l]).then(u=>(c[l]=u,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let u=l.pop(),h=u.isGroup?u.children:[u],d=l[0].count,f=[];for(let g of h){let x=new We,m=new A,p=new Un,w=new A(1,1,1),E=new Qr(g.geometry,g.material,d);for(let y=0;y<d;y++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,y),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,y),c.SCALE&&w.fromBufferAttribute(c.SCALE,y),E.setMatrixAt(y,x.compose(m,p,w));for(let y in c)if(y==="_COLOR_0"){let R=c[y];E.instanceColor=new Yi(R.array,R.itemSize,R.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&g.geometry.setAttribute(y,c[y]);At.prototype.copy.call(E,g),this.parser.assignFinalMaterial(E),f.push(E)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}},Pf="glTF",Mo=12,Af={JSON:1313821514,BIN:5130562},ku=class{constructor(e){this.name=nt.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Mo),i=new TextDecoder;if(this.header={magic:i.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Pf)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-Mo,r=new DataView(e,Mo),o=0;for(;o<s;){let a=r.getUint32(o,!0);o+=4;let c=r.getUint32(o,!0);if(o+=4,c===Af.JSON){let l=new Uint8Array(e,Mo+o,a);this.content=i.decode(l)}else if(c===Af.BIN){let l=Mo+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Hu=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=nt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let i=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(let u in o){let h=Xu[u]||u.toLowerCase();a[h]=o[u]}for(let u in e.attributes){let h=Xu[u]||u.toLowerCase();if(o[u]!==void 0){let d=i.accessors[e.attributes[u]],f=Sr[d.componentType];l[h]=f.name,c[h]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,d){s.decodeDracoFile(u,function(f){for(let g in f.attributes){let x=f.attributes[g],m=c[g];m!==void 0&&(x.normalized=m)}h(f)},a,l,Zt,d)})})}},Vu=class{constructor(){this.name=nt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},Gu=class{constructor(){this.name=nt.KHR_MESH_QUANTIZATION}},Il=class extends Ai{constructor(e,t,i,s){super(e,t,i,s)}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=i[r+o];return t}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,u=s-t,h=(i-t)/u,d=h*h,f=d*h,g=e*l,x=g-l,m=-2*f+3*d,p=f-d,w=1-m,E=p-d+h;for(let y=0;y!==a;y++){let R=o[x+y+a],C=o[x+y+c]*u,L=o[g+y+a],F=o[g+y]*u;r[y]=w*R+E*C+m*L+p*F}return r}},V_=new Un,Wu=class extends Il{interpolate_(e,t,i,s){let r=super.interpolate_(e,t,i,s);return V_.fromArray(r).normalize().toArray(r),r}},Bn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Sr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Rf={9728:Yt,9729:cn,9984:Ha,9985:hr,9986:Ts,9987:jn},Cf={33071:si,33648:$s,10497:Kn},yu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Xu={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},$i={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},G_={CUBICSPLINE:void 0,LINEAR:xs,STEP:gs},vu={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function W_(n){return n.DefaultMaterial===void 0&&(n.DefaultMaterial=new ae({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Zn})),n.DefaultMaterial}function Ps(n,e,t){for(let i in t.extensions)n[i]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[i]=t.extensions[i])}function pi(n,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(n.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function X_(n,e,t){let i=!1,s=!1,r=!1;for(let l=0,u=e.length;l<u;l++){let h=e[l];if(h.POSITION!==void 0&&(i=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),i&&s&&r)break}if(!i&&!s&&!r)return Promise.resolve(n);let o=[],a=[],c=[];for(let l=0,u=e.length;l<u;l++){let h=e[l];if(i){let d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):n.attributes.position;o.push(d)}if(s){let d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):n.attributes.normal;a.push(d)}if(r){let d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):n.attributes.color;c.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){let u=l[0],h=l[1],d=l[2];return i&&(n.morphAttributes.position=u),s&&(n.morphAttributes.normal=h),r&&(n.morphAttributes.color=d),n.morphTargetsRelative=!0,n})}function q_(n,e){if(n.updateMorphTargets(),e.weights!==void 0)for(let t=0,i=e.weights.length;t<i;t++)n.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(n.morphTargetInfluences.length===t.length){n.morphTargetDictionary={};for(let i=0,s=t.length;i<s;i++)n.morphTargetDictionary[t[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Y_(n){let e,t=n.extensions&&n.extensions[nt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Mu(t.attributes):e=n.indices+":"+Mu(n.attributes)+":"+n.mode,n.targets!==void 0)for(let i=0,s=n.targets.length;i<s;i++)e+=":"+Mu(n.targets[i]);return e}function Mu(n){let e="",t=Object.keys(n).sort();for(let i=0,s=t.length;i<s;i++)e+=t[i]+":"+n[t[i]]+";";return e}function qu(n){switch(n){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Z_(n){return n.search(/\.jpe?g($|\?)/i)>0||n.search(/^data\:image\/jpeg/)===0?"image/jpeg":n.search(/\.webp($|\?)/i)>0||n.search(/^data\:image\/webp/)===0?"image/webp":n.search(/\.ktx2($|\?)/i)>0||n.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var K_=new We,Yu=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new H_,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let i=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;i=/^((?!chrome|android).)*safari/i.test(a)===!0;let c=a.match(/Version\/(\d+)/);s=i&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||i&&s<17||r&&o<98?this.textureLoader=new lo(this.options.manager):this.textureLoader=new ho(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new cr(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let i=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([i.getDependencies("scene"),i.getDependencies("animation"),i.getDependencies("camera")])}).then(function(o){let a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:i,userData:{}};return Ps(r,a,s),pi(a,s),Promise.all(i._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(let c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],i=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let o=t[s].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(i[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,i){if(e.refs[t]<=1)return i;let s=i.clone(),r=(o,a)=>{let c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(let[l,u]of o.children.entries())r(u,a.children[l])};return r(i,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let i=0;i<t.length;i++){let s=e(t[i]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let i=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&i.push(r)}return i}getDependency(e,t){let i=e+":"+t,s=this.cache.get(i);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(i,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let i=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return i.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],i=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[nt.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,o){i.load(Ii.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(i){let s=t.byteLength||0,r=t.byteOffset||0;return i.slice(r,r+s)})}loadAccessor(e){let t=this,i=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let o=yu[s.type],a=Sr[s.componentType],c=s.normalized===!0,l=new a(s.count*o);return Promise.resolve(new Bt(l,o,c))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],c=yu[s.type],l=Sr[s.componentType],u=l.BYTES_PER_ELEMENT,h=u*c,d=s.byteOffset||0,f=s.bufferView!==void 0?i.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,x,m;if(f&&f!==h){let p=Math.floor(d/f),w="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count,E=t.cache.get(w);E||(x=new l(a,p*f,s.count*f/u),E=new ir(x,f/u),t.cache.add(w,E)),m=new sr(E,c,d%f/u,g)}else a===null?x=new l(s.count*c):x=new l(a,d,s.count*c),m=new Bt(x,c,g);if(s.sparse!==void 0){let p=yu.SCALAR,w=Sr[s.sparse.indices.componentType],E=s.sparse.indices.byteOffset||0,y=s.sparse.values.byteOffset||0,R=new w(o[1],E,s.sparse.count*p),C=new l(o[2],y,s.sparse.count*c);a!==null&&(m=new Bt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let L=0,F=R.length;L<F;L++){let b=R[L];if(m.setX(b,C[L*c]),c>=2&&m.setY(b,C[L*c+1]),c>=3&&m.setZ(b,C[L*c+2]),c>=4&&m.setW(b,C[L*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,i=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let c=i.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,i){let s=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];let l=this.loadImageSource(t,i).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let d=(r.samplers||{})[o.sampler]||{};return u.magFilter=Rf[d.magFilter]||cn,u.minFilter=Rf[d.minFilter]||jn,u.wrapS=Cf[d.wrapS]||Kn,u.wrapT=Cf[d.wrapT]||Kn,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Yt&&u.minFilter!==cn,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){let i=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=s.images[e],a=self.URL||self.webkitURL,c=o.uri||"",l=!1;if(o.bufferView!==void 0)c=i.getDependency("bufferView",o.bufferView).then(function(h){l=!0;let d=new Blob([h],{type:o.mimeType});return c=a.createObjectURL(d),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(c).then(function(h){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(x){let m=new Ht(x);m.needsUpdate=!0,d(m)}),t.load(Ii.resolveURL(h,r.path),g,void 0,f)})}).then(function(h){return l===!0&&a.revokeObjectURL(c),pi(h,o),h.userData.mimeType=o.mimeType||Z_(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),h});return this.sourceCache[e]=u,u}assignTexture(e,t,i,s){let r=this;return this.getDependency("texture",i.index).then(function(o){if(!o)return null;if(i.texCoord!==void 0&&i.texCoord>0&&(o=o.clone(),o.channel=i.texCoord),r.extensions[nt.KHR_TEXTURE_TRANSFORM]){let a=i.extensions!==void 0?i.extensions[nt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let c=r.associations.get(o);o=r.extensions[nt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,i=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+i.uuid,c=this.cache.get(a);c||(c=new ar,_n.prototype.copy.call(c,i),c.color.copy(i.color),c.map=i.map,c.sizeAttenuation=!1,this.cache.add(a,c)),i=c}else if(e.isLine){let a="LineBasicMaterial:"+i.uuid,c=this.cache.get(a);c||(c=new Zi,_n.prototype.copy.call(c,i),c.color.copy(i.color),c.map=i.map,this.cache.add(a,c)),i=c}if(s||r||o){let a="ClonedMaterial:"+i.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=i.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),s&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(i))),i=c}e.material=i}getMaterialType(){return ae}loadMaterial(e){let t=this,i=this.json,s=this.extensions,r=i.materials[e],o,a={},c=r.extensions||{},l=[];if(c[nt.KHR_MATERIALS_UNLIT]){let h=s[nt.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),l.push(h.extendParams(a,r,t))}else{let h=r.pbrMetallicRoughness||{};if(a.color=new Ne(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let d=h.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],Zt),a.opacity=d[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",h.baseColorTexture,Pt)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=dn);let u=r.alphaMode||vu.OPAQUE;if(u===vu.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===vu.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Kt&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new je(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;a.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&o!==Kt&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Kt){let h=r.emissiveFactor;a.emissive=new Ne().setRGB(h[0],h[1],h[2],Zt)}return r.emissiveTexture!==void 0&&o!==Kt&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Pt)),Promise.all(l).then(function(){let h=new o(a);return r.name&&(h.name=r.name),pi(h,r),t.associations.set(h,{materials:e}),r.extensions&&Ps(s,h,r),h})}createUniqueName(e){let t=yt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,i=this.extensions,s=this.primitiveCache;function r(a){return i[nt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return If(c,a,t)})}let o=[];for(let a=0,c=e.length;a<c;a++){let l=e[a],u=Y_(l),h=s[u];if(h)o.push(h.promise);else{let d;l.extensions&&l.extensions[nt.KHR_DRACO_MESH_COMPRESSION]?d=r(l):d=If(new $t,l,t),s[u]={primitive:l,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,i=this.json,s=this.extensions,r=i.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){let u=o[c].material===void 0?W_(this.cache):this.getDependency("material",o[c].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(c){let l=c.slice(0,c.length-1),u=c[c.length-1],h=[];for(let f=0,g=u.length;f<g;f++){let x=u[f],m=o[f],p,w=l[f];if(m.mode===Bn.TRIANGLES||m.mode===Bn.TRIANGLE_STRIP||m.mode===Bn.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new $r(x,w):new ze(x,w),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===Bn.TRIANGLE_STRIP?p.geometry=_u(p.geometry,yo):m.mode===Bn.TRIANGLE_FAN&&(p.geometry=_u(p.geometry,gr));else if(m.mode===Bn.LINES)p=new eo(x,w);else if(m.mode===Bn.LINE_STRIP)p=new wi(x,w);else if(m.mode===Bn.LINE_LOOP)p=new to(x,w);else if(m.mode===Bn.POINTS)p=new no(x,w);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&q_(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),pi(p,r),m.extensions&&Ps(s,p,m),t.assignFinalMaterial(p),h.push(p)}for(let f=0,g=h.length;f<g;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return r.extensions&&Ps(s,h[0],r),h[0];let d=new $e;r.extensions&&Ps(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=h.length;f<g;f++)d.add(h[f]);return d})}loadCamera(e){let t,i=this.json.cameras[e],s=i[i.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return i.type==="perspective"?t=new Ot(xr.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):i.type==="orthographic"&&(t=new Ms(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),i.name&&(t.name=this.createUniqueName(i.name)),pi(t,i),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],i=[];for(let s=0,r=t.joints.length;s<r;s++)i.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?i.push(this.getDependency("accessor",t.inverseBindMatrices)):i.push(null),Promise.all(i).then(function(s){let r=s.pop(),o=s,a=[],c=[];for(let l=0,u=o.length;l<u;l++){let h=o[l];if(h){a.push(h);let d=new We;r!==null&&d.fromArray(r.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new jr(a,c)})}loadAnimation(e){let t=this.json,i=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],c=[],l=[],u=[];for(let h=0,d=s.channels.length;h<d;h++){let f=s.channels[h],g=s.samplers[f.sampler],x=f.target,m=x.node,p=s.parameters!==void 0?s.parameters[g.input]:g.input,w=s.parameters!==void 0?s.parameters[g.output]:g.output;x.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",w)),l.push(g),u.push(x))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(h){let d=h[0],f=h[1],g=h[2],x=h[3],m=h[4],p=[];for(let E=0,y=d.length;E<y;E++){let R=d[E],C=f[E],L=g[E],F=x[E],b=m[E];if(R===void 0)continue;R.updateMatrix&&R.updateMatrix();let S=i._createAnimationTracks(R,C,L,F,b);if(S)for(let P=0;P<S.length;P++)p.push(S[P])}let w=new ao(r,void 0,p);return pi(w,s),w})}createNodeMesh(e){let t=this.json,i=this,s=t.nodes[e];return s.mesh===void 0?null:i.getDependency("mesh",s.mesh).then(function(r){let o=i._getNodeRef(i.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=s.weights.length;c<l;c++)a.morphTargetInfluences[c]=s.weights[c]}),o})}loadNode(e){let t=this.json,i=this,s=t.nodes[e],r=i._loadNodeShallow(e),o=[],a=s.children||[];for(let l=0,u=a.length;l<u;l++)o.push(i.getDependency("node",a[l]));let c=s.skin===void 0?Promise.resolve(null):i.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){let u=l[0],h=l[1],d=l[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,K_)});for(let f=0,g=h.length;f<g;f++)u.add(h[f]);return u})}_loadNodeShallow(e){let t=this.json,i=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],c=s._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(l){return s._getNodeRef(s.cameraCache,r.camera,l)})),s._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let u;if(r.isBone===!0?u=new rr:l.length>1?u=new $e:l.length===1?u=l[0]:u=new At,u!==l[0])for(let h=0,d=l.length;h<d;h++)u.add(l[h]);if(r.name&&(u.userData.name=r.name,u.name=o),pi(u,r),r.extensions&&Ps(i,u,r),r.matrix!==void 0){let h=new We;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!s.associations.has(u))s.associations.set(u,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let h=s.associations.get(u);s.associations.set(u,{...h})}return s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,i=this.json.scenes[e],s=this,r=new $e;i.name&&(r.name=s.createUniqueName(i.name)),pi(r,i),i.extensions&&Ps(t,r,i);let o=i.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(s.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let u=0,h=c.length;u<h;u++)r.add(c[u]);let l=u=>{let h=new Map;for(let[d,f]of s.associations)(d instanceof _n||d instanceof Ht)&&h.set(d,f);return u.traverse(d=>{let f=s.associations.get(d);f!=null&&h.set(d,f)}),h};return s.associations=l(r),r})}_createAnimationTracks(e,t,i,s,r){let o=[],a=e.name?e.name:e.uuid,c=[];$i[r.path]===$i.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(a);let l;switch($i[r.path]){case $i.weights:l=li;break;case $i.rotation:l=ci;break;case $i.translation:case $i.scale:l=ui;break;default:i.itemSize===1?l=li:l=ui;break}let u=s.interpolation!==void 0?G_[s.interpolation]:xs,h=this._getArrayFromAccessor(i);for(let d=0,f=c.length;d<f;d++){let g=new l(c[d]+"."+$i[r.path],t.array,h,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let i=qu(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*i;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(i){let s=this instanceof ci?Wu:Il;return new s(this.times,this.values,this.getValueSize()/3,i)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function $_(n,e,t){let i=e.attributes,s=new un;if(i.POSITION!==void 0){let a=t.json.accessors[i.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(s.set(new A(c[0],c[1],c[2]),new A(l[0],l[1],l[2])),a.normalized){let u=qu(Sr[a.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new A,c=new A;for(let l=0,u=r.length;l<u;l++){let h=r[l];if(h.POSITION!==void 0){let d=t.json.accessors[h.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){let x=qu(Sr[d.componentType]);c.multiplyScalar(x)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}n.boundingBox=s;let o=new xn;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,n.boundingSphere=o}function If(n,e,t){let i=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){n.setAttribute(a,c)})}for(let o in i){let a=Xu[o]||o.toLowerCase();a in n.attributes||s.push(r(i[o],a))}if(e.indices!==void 0&&!n.index){let o=t.getDependency("accessor",e.indices).then(function(a){n.setIndex(a)});s.push(o)}return st.workingColorSpace!==Zt&&"COLOR_0"in i&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${st.workingColorSpace}" not supported.`),pi(n,e),$_(n,e,t),Promise.all(s).then(function(){return e.targets!==void 0?X_(n,e.targets,t):n})}var D={eye:1.58,radius:.165,walk:2.85,quiet:1.55,crouch:1.18,sprint:5.85,accel:24,friction:30,sensitivity:.00165,roomW:3.36,roomD:6.05,roomH:2.88,corridorW:2.54,corridorL:18.6,doorW:.9,doorH:2.05,roomXs:[-6.3,-2.1,2.1,6.3]},W={app:document.getElementById("app"),pause:document.getElementById("pauseOverlay"),start:document.getElementById("startButton"),zone:document.getElementById("zone"),floorTag:document.getElementById("floorTag"),objective:document.getElementById("objective"),subObjective:document.getElementById("subObjective"),prompt:document.getElementById("interactPrompt"),hpBar:document.getElementById("hpBar"),hpText:document.getElementById("hpText"),weaponName:document.getElementById("weaponName"),ammoText:document.getElementById("ammoText"),slot1:document.getElementById("slot1"),slot2:document.getElementById("slot2"),slot3:document.getElementById("slot3"),slot4:document.getElementById("slot4"),inventory:document.getElementById("inventory"),invAmmo:document.getElementById("invAmmo"),invShells:document.getElementById("invShells"),invBandage:document.getElementById("invBandage"),invMed:document.getElementById("invMed"),invGrenade:document.getElementById("invGrenade"),invMolotov:document.getElementById("invMolotov"),invMaint:document.getElementById("invMaint"),invCard:document.getElementById("invCard"),invMaster:document.getElementById("invMaster"),eqPistol:document.getElementById("eqPistol"),eqShotgun:document.getElementById("eqShotgun"),eqSMG:document.getElementById("eqSMG"),eqMelee:document.getElementById("eqMelee"),lootPanel:document.getElementById("lootPanel"),lootTitle:document.getElementById("lootTitle"),lootItems:document.getElementById("lootItems"),toast:document.getElementById("toast"),damage:document.getElementById("damageVignette"),hit:document.getElementById("hitmarker"),end:document.getElementById("endScreen"),endStats:document.getElementById("endStats"),restart:document.getElementById("restartButton"),sens:document.getElementById("sens"),sensValue:document.getElementById("sensValue"),floorFade:document.getElementById("floorFade"),threatHud:document.getElementById("threatHud"),threatText:document.getElementById("threatText"),difficulty:document.getElementById("difficulty"),difficultyHint:document.getElementById("difficultyHint"),bossHud:document.getElementById("bossHud"),bossName:document.getElementById("bossName"),bossFill:document.getElementById("bossBarFill"),bossHp:document.getElementById("bossHp"),actionProgress:document.getElementById("actionProgress"),actionText:document.getElementById("actionText"),actionFill:document.getElementById("actionFill"),missionBanner:document.getElementById("missionBanner"),missionBannerText:document.getElementById("missionBannerText"),mapOverlay:document.getElementById("mapOverlay"),mapCanvas:document.getElementById("mapCanvas"),mapTitle:document.getElementById("mapTitle"),mapObjective:document.getElementById("mapObjective"),tutorialCard:document.getElementById("tutorialCard"),tutorialTitle:document.getElementById("tutorialTitle"),tutorialText:document.getElementById("tutorialText"),invDecoy:document.getElementById("invDecoy"),staminaBar:document.getElementById("staminaBar"),staminaText:document.getElementById("staminaText"),powerState:document.getElementById("powerState"),seedText:document.getElementById("seedText"),perfHud:document.getElementById("perfHud"),perfFps:document.getElementById("perfFps"),perfFrame:document.getElementById("perfFrame"),perfCalls:document.getElementById("perfCalls"),perfTris:document.getElementById("perfTris"),perfAi:document.getElementById("perfAi"),perfRooms:document.getElementById("perfRooms"),perfArt:document.getElementById("perfArt"),quality:document.getElementById("quality"),qualityHint:document.getElementById("qualityHint")};function J_(n){let e=2166136261;for(let t of String(n))e^=t.charCodeAt(0),e=Math.imul(e,16777619)>>>0;return e||68683270}var j_=new URLSearchParams(location.search).get("seed"),Q_=new Uint32Array(1),ey=globalThis.crypto?.getRandomValues?globalThis.crypto.getRandomValues(Q_)[0]:Date.now(),Po=j_||String(ey>>>0),Zu=J_(Po);function He(){return Zu=Zu*1664525+1013904223>>>0,Zu/4294967296}function Ni(n,e,t){return Math.max(e,Math.min(t,n))}function fn(n,e,t,i){return xr.lerp(n,e,1-Math.exp(-t*i))}function ty(n,e){return xr.euclideanModulo(e-n+Math.PI,Math.PI*2)-Math.PI}var Ui=new Kr;Ui.background=new Ne(9608600);Ui.fog=new Zr(9608600,15,34);var bt=new Ot(76,innerWidth/innerHeight,.035,90);Ui.add(bt);var mt=new Al({antialias:!0,powerPreference:"high-performance"});mt.setSize(innerWidth,innerHeight);var Ji=Math.min(devicePixelRatio,1.1);mt.setPixelRatio(Ji);mt.outputColorSpace=Pt;mt.toneMapping=Ba;mt.toneMappingExposure=1.04;mt.shadowMap.enabled=!0;mt.shadowMap.type=Ia;W.app.appendChild(mt.domElement);function rh(n,e=512,t=512){let i=document.createElement("canvas");i.width=e,i.height=t;let s=i.getContext("2d");n(s,e,t);let r=new io(i);return r.colorSpace=Pt,r.anisotropy=4,r}var Bl=rh((n,e,t)=>{n.fillStyle="#c5b28d",n.fillRect(0,0,e,t),n.strokeStyle="rgba(72,63,51,.42)",n.lineWidth=3;for(let i=0;i<=4;i++){let s=i*e/4;n.beginPath(),n.moveTo(s,0),n.lineTo(s,t),n.stroke(),n.beginPath(),n.moveTo(0,s),n.lineTo(e,s),n.stroke()}for(let i=0;i<700;i++)n.fillStyle=`rgba(65,52,41,${He()*.05})`,n.fillRect(He()*e,He()*t,1+He()*2,1+He()*2)});Bl.wrapS=Bl.wrapT=Kn;Bl.repeat.set(13,7);var zl=rh((n,e,t)=>{n.fillStyle="#a8794e",n.fillRect(0,0,e,t);for(let i=0;i<t;i+=8)n.strokeStyle=`rgba(72,44,24,${.05+He()*.08})`,n.beginPath(),n.moveTo(0,i),n.bezierCurveTo(e*.3,i+He()*5,e*.65,i-He()*4,e,i+He()*3),n.stroke()},512,256);zl.wrapS=zl.wrapT=Kn;zl.repeat.set(2,1);var ue={wall:new ae({color:14804191,roughness:.96}),ceiling:new ae({color:15856109,roughness:.96}),floor:new ae({map:Bl,roughness:.78}),metal:new ae({color:13092004,roughness:.54,metalness:.2}),darkMetal:new ae({color:2961973,roughness:.5,metalness:.34}),wood:new ae({map:zl,color:12884585,roughness:.74}),woodDark:new ae({color:9857349,roughness:.82}),navy:new ae({color:3362660,roughness:.92}),mesh:new ae({color:12174787,roughness:.8,transparent:!0,opacity:.34,side:dn,depthWrite:!1}),black:new ae({color:1382169,roughness:.75}),white:new ae({color:15263967,roughness:.75}),cardboard:new ae({color:10975821,roughness:.94}),redDoor:new ae({color:7547429,roughness:.45}),grayDoor:new ae({color:5265240,metalness:.22,roughness:.52}),green:new ae({color:6585700,roughness:.86}),blue:new ae({color:4287885,roughness:.78}),red:new ae({color:9321014,roughness:.78}),acid:new ae({color:9162570,emissive:3235101,emissiveIntensity:1.2,roughness:.55}),purple:new ae({color:6901887,roughness:.8}),tileWhite:new ae({color:14277850,roughness:.72})};function Z(n,e,t,i,s,r=0,o=0,a=0,c=!1,l=!0){let u=new ze(new ai(e,t,i),s);return u.position.set(r,o,a),u.castShadow=c,u.receiveShadow=l,n.add(u),u}function mn(n,e,t,i=.018,s=ue.metal){let r=new A().subVectors(t,e),o=r.length(),a=new ze(new Fn(i,i,o,8),s);return a.position.copy(e).add(t).multiplyScalar(.5),a.quaternion.setFromUnitVectors(new A(0,1,0),r.normalize()),a.castShadow=!1,n.add(a),a}function kl(n,e,t,i,s,r,o,a=14){let c=new ze(new Fn(e,e,t,a),i);return c.position.set(s,r,o),c.castShadow=!0,n.add(c),c}function wo(n,e="#ece8d9",t="#343838",i=150){let s=rh((r,o,a)=>{r.fillStyle=e,r.fillRect(0,0,o,a),r.fillStyle=t,r.font=`bold ${i}px sans-serif`,r.textAlign="center",r.textBaseline="middle",r.fillText(n,o/2,a/2)},512,256);return new Kt({map:s,toneMapped:!1,transparent:!0})}var Je={},_e=4,Xf=[],Eo=[];function Lo(n){let e=new $e;e.name=`floor-${n}`,Ui.add(e);let t={id:n,root:e,colliders:[],doors:[],interactables:[],rooms:[],enemies:[],loot:[],portals:[],lights:[],roomByLabel:{},visited:new Set,events:[]};return Je[n]=t,t}function pn(n,e,t,i,s,r=""){n.colliders.push({minX:e-i/2,maxX:e+i/2,minZ:t-s/2,maxZ:t+s/2,label:r})}function is(n,e,t){e.userData={...e.userData,...t,floor:n.id},n.interactables.push(e)}function ot(n,e,t){return{x:n.x+e,z:n.nearZ+n.side*t}}function Lf(n,e,t=!0){if(!t){Z(n.root,.08,D.roomH,D.corridorW,ue.wall,e,D.roomH/2,0,!1,!0),pn(n,e,0,.12,D.corridorW,"end wall");return}let i=(D.corridorW-D.doorW)/2;Z(n.root,.08,D.roomH,i,ue.wall,e,D.roomH/2,-D.corridorW/2+i/2,!1,!0),pn(n,e,-D.corridorW/2+i/2,.12,i,"end wall"),Z(n.root,.08,D.roomH,i,ue.wall,e,D.roomH/2,D.corridorW/2-i/2,!1,!0),pn(n,e,D.corridorW/2-i/2,.12,i,"end wall"),Z(n.root,.08,D.roomH-D.doorH,D.doorW,ue.wall,e,D.doorH+(D.roomH-D.doorH)/2,0,!1,!0)}var oh={5:{name:"\u9876\u5C42\u901A\u4FE1\u533A",accent:12093396,light:15787007,bg:8223366},4:{name:"\u751F\u6D3B\u533A",accent:13086037,light:16052184,bg:9608600},3:{name:"\u7BA1\u7406\u8BBE\u5907\u533A",accent:6201205,light:14478301,bg:7568760},2:{name:"\u9694\u79BB\u5931\u8D25\u533A",accent:5670560,light:12376292,bg:5069148},1:{name:"\u5927\u5385\u4E0E\u5916\u754C\u5165\u53E3",accent:11882565,light:16765897,bg:6050640}};function Do(n){let e=oh[n.id];Z(n.root,D.corridorL,.06,D.corridorW,ue.floor,0,.01,0,!1,!0),Z(n.root,D.corridorL,.06,D.corridorW,ue.ceiling,0,D.roomH,0,!1,!0);let t=new ae({color:e.accent,roughness:.68,emissive:e.accent,emissiveIntensity:.08});Z(n.root,D.corridorL-.45,.014,.085,t,0,.048,0,!1,!1);let i=[];for(let r=-D.corridorL/2+2;r<D.corridorL/2-1.2;r+=3.15)i.push(r);for(let r of i){let o=new ae({color:16777215,emissive:e.light,emissiveIntensity:3});Z(n.root,.72,.04,.12,o,r,2.82,0,!1,!1);let a=new Mn(e.light,1,6,1.7);a.position.set(r,2.52,0),n.root.add(a),n.lights.push(a)}Lf(n,-D.corridorL/2,!0),Lf(n,D.corridorL/2,!0);for(let r of[-1,1]){let o=r*(D.corridorL/2-.12),a=new ze(new yn(1.28,.64),wo(`${n.id}F`,"#151a19",`#${e.accent.toString(16).padStart(6,"0")}`,190));a.position.set(o,1.68,0),a.rotation.y=r>0?-Math.PI/2:Math.PI/2,n.root.add(a)}let s=new ze(new yn(1.9,.34),wo(`${n.id}F \xB7 ${e.name}`,"#252b29",`#${e.accent.toString(16).padStart(6,"0")}`,90));s.position.set(0,2.25,-D.corridorW/2+.055),n.root.add(s)}function gi(n,e,t={}){let i=e==="east",s=i?D.corridorL/2:-D.corridorL/2,r=new $e;r.position.set(s+(i?-.045:.045),0,-D.doorW/2),n.root.add(r);let o=Z(r,.055,D.doorH,D.doorW,ue.grayDoor,0,D.doorH/2,D.doorW/2);is(n,o,{type:"portal"});let a=new ze(new yn(.68,.22),wo(t.label||"\u697C\u68AF\u95F4","#d9ddd6","#2d3331",110));a.position.set(s+(i?-.09:.09),2.34,0),a.rotation.y=i?-Math.PI/2:Math.PI/2,n.root.add(a);let c=i?1:-1;Z(n.root,2.2,.06,2.1,new ae({color:7830391,roughness:.92}),s+c*1.05,.01,0,!1,!0);for(let u=0;u<5;u++)Z(n.root,.62,.12,1.32,new ae({color:8948614,roughness:.88}),s+c*(.55+u*.25),.07+u*.12,0,!1,!0);let l={floor:n.id,side:e,pivot:r,slab:o,open:!!t.open,angle:t.open?i?-1.25:1.25:0,target:t.open?i?-1.25:1.25:0,locked:!!t.locked,lockType:t.lockType||null,toFloor:t.toFloor||null,endGame:!!t.endGame,label:t.label||"\u697C\u68AF\u95F4"};return r.rotation.y=l.angle,o.userData.portal=l,n.portals.push(l),l}function ny(n,e={}){let t=Je[n.floor],i=n.x+n.doorOffset,s=i-D.doorW/2,r=new $e;r.position.set(s,0,n.nearZ-n.side*.045),t.root.add(r);let o=Z(r,D.doorW-.02,D.doorH-.02,.055,e.gray?ue.grayDoor:ue.redDoor,D.doorW/2,D.doorH/2,0,!0,!0);is(t,o,{type:"door"});let a=Z(r,.035,.15,.04,ue.darkMetal,D.doorW-.12,1.03,-n.side*.05,!0,!1);is(t,a,{type:"door"});let c=e.initialOpen?-n.side*Math.PI*.43:0,l=null;if(e.locked){let h=new ae({color:11943220,emissive:8066578,emissiveIntensity:1.4,roughness:.4});l=Z(r,.035,.035,.025,h,D.doorW-.12,1.18,-n.side*.052,!1,!1)}let u={floor:n.floor,room:n,pivot:r,slab:o,handle:a,lockLamp:l,open:!!e.initialOpen,angle:c,target:c,locked:!!e.locked,lockType:e.lockType||null,label:e.label||n.label};return o.userData.door=u,a.userData.door=u,t.doors.push(u),n.door=u,u}function Ke(n,e,t,i,s="dorm",r=0,o={}){let a=s==="dorm"?D.roomD:o.depth||4,c=i*D.corridorW/2,l=c+i*a,u=D.roomW/2,h=.12,d={floor:n.id,label:e,x:t,side:i,nearZ:c,farZ:l,depth:a,doorOffset:h,kind:s,variant:r,group:new $e,generatedInteriorGroup:new $e,door:null,heroAsset:null};n.root.add(d.group),n.root.add(d.generatedInteriorGroup),n.rooms.push(d),n.roomByLabel[e]=d,Z(d.group,D.roomW,.06,a,ue.floor,t,.01,c+i*a/2,!1,!0),Z(d.group,D.roomW,.06,a,ue.ceiling,t,D.roomH,c+i*a/2,!1,!0),Z(d.group,.08,D.roomH,a,ue.wall,t-u,D.roomH/2,c+i*a/2,!1,!0),Z(d.group,.08,D.roomH,a,ue.wall,t+u,D.roomH/2,c+i*a/2,!1,!0),pn(n,t-u,c+i*a/2,.11,a,"room side"),pn(n,t+u,c+i*a/2,.11,a,"room side");let f=t+h,g=f-D.doorW/2-(t-u),x=t+u-(f+D.doorW/2);if(Z(d.group,g,D.roomH,.08,ue.wall,t-u+g/2,D.roomH/2,c,!1,!0),Z(d.group,x,D.roomH,.08,ue.wall,f+D.doorW/2+x/2,D.roomH/2,c,!1,!0),Z(d.group,D.doorW,D.roomH-D.doorH,.08,ue.wall,f,D.doorH+(D.roomH-D.doorH)/2,c,!1,!0),pn(n,t-u+g/2,c,g,.11,"front wall"),pn(n,f+D.doorW/2+x/2,c,x,.11,"front wall"),s==="dorm"){let y=(D.roomW-1.62)/2;Z(d.group,y,D.roomH,.08,ue.wall,t-u+y/2,D.roomH/2,l,!1,!0),Z(d.group,y,D.roomH,.08,ue.wall,t+u-y/2,D.roomH/2,l,!1,!0),Z(d.group,1.62,.87,.08,ue.wall,t,.87/2,l,!1,!0),Z(d.group,1.62,D.roomH-.87-1.42,.08,ue.wall,t,.87+1.42+(D.roomH-.87-1.42)/2,l,!1,!0),pn(n,t,l,D.roomW,.11,"far wall");let R=new ae({color:8662572,roughness:.43});Z(d.group,1.62+.06,.05,.055,R,t,.87,l-i*.08),Z(d.group,1.62+.06,.05,.055,R,t,.87+1.42,l-i*.08),Z(d.group,.05,1.42,.055,R,t-1.62/2,.87+1.42/2,l-i*.08),Z(d.group,.05,1.42,.055,R,t+1.62/2,.87+1.42/2,l-i*.08);let C=new zt({color:11454665,transparent:!0,opacity:.23,transmission:.14,roughness:.18,side:dn}),L=new ze(new yn(1.62-.05,1.42-.05),C);L.position.set(t,.87+1.42/2,l-i*.1),L.rotation.y=i===1?Math.PI:0,d.group.add(L)}else Z(d.group,D.roomW,D.roomH,.08,ue.wall,t,D.roomH/2,l,!1,!0),pn(n,t,l,D.roomW,.11,"special back");ny(d,o);let m=new ze(new yn(s==="dorm"?.4:.58,.18),wo(e,s==="dorm"?"#e9e6da":"#d8dfdc","#343838",s==="dorm"?150:100));return m.position.set(f,2.28,c-i*.075),m.rotation.y=i===1?Math.PI:0,d.group.add(m),s==="dorm"?oy(d,r):s==="utility"?ay(d):s==="wash"&&ly(d),d}function Ul(n,e,t,i=0){let s=new $e;s.position.set(e,0,t),s.rotation.y=i,n.add(s),Z(s,.43,.055,.43,ue.black,0,.45,0),Z(s,.42,.48,.045,ue.black,0,.75,.18);for(let r of[-1,1])for(let o of[-1,1])mn(s,new A(r*.18,.44,o*.17),new A(r*.21,.02,o*.2),.013,ue.darkMetal);return s}function iy(n,e,t,i=0){let s=new $e;s.position.set(e,0,t),s.rotation.y=i,n.add(s),Z(s,.48,.06,.47,ue.black,0,.48,0);let r=Z(s,.46,.58,.065,new ae({color:1843234,roughness:.82}),0,.82,.2);r.rotation.x=-.08,mn(s,new A(0,.45,.05),new A(0,.18,.03),.025,ue.darkMetal);for(let o=0;o<5;o++){let a=o*Math.PI*2/5;mn(s,new A(0,.18,.03),new A(Math.sin(a)*.3,.1,Math.cos(a)*.3),.016,ue.darkMetal)}return Z(s,.06,.05,.36,ue.black,-.28,.66,0),Z(s,.06,.05,.36,ue.black,.28,.66,0),s}function So(n,e,t,i,s=6,r="x"){let o=[13881538,12370862,9135699,4155243,13212237,5857388];for(let a=0;a<s;a++){let c=.024+He()*.018,l=.18+He()*.08,u=.13+He()*.07;Z(n,l,c,u,new ae({color:o[a%o.length],roughness:.9}),r==="x"?e:e+(a-s/2)*.04,t+a*.028,r==="z"?i:i+(a-s/2)*.035,!1,!1)}}function Hl(n,e,t,i=2106666){let s=new $e;s.position.set(e,0,t),n.add(s);let r=new ae({color:i,roughness:.95});return Z(s,.32,.42,.18,r,0,.23,0),Z(s,.24,.12,.07,r,0,.3,.12),s}function Vl(n,e,t,i=0,s=14211278){let r=new $e;r.position.set(e,.05,t),r.rotation.y=i,n.add(r),Z(r,.14,.08,.27,new ae({color:s,roughness:.8}),0,0,0),Z(r,.14,.045,.09,ue.darkMetal,0,-.02,-.09)}function Ao(n,e,t,i=3){for(let s=0;s<i;s++){let r=.3+He()*.18,o=.25+He()*.14,a=.16+He()*.1;Z(n,r,a,o,ue.cardboard,e+(He()-.5)*.12,a/2+s*.19,t+(He()-.5)*.12)}}function sy(n,e,t,i){let r=new $e;r.position.set(e,.79,t),n.add(r);let o=new ae({color:10330273,metalness:.35,roughness:.45});Z(r,.23,.018,.34,o,0,.01,0);let a=new $e;a.position.set(-i*.115,.02,0),a.rotation.z=i*.18,r.add(a),Z(a,.015,.22,.34,new ae({color:2567472,roughness:.45}),0,.11,0),Z(a,.006,.18,.3,new ae({color:857885,emissive:1319980,emissiveIntensity:.9}),i*.011,.11,0,!1,!1)}function ry(n,e,t,i,s){if(sy(n,e-i*.04,t-.08,i),s%6===0)Z(n,.11,.025,.3,ue.white,e+i*.14,.79+.01,t+.13,!1,!1),Z(n,.06,.028,.08,new ae({color:5433248,emissive:2468203,emissiveIntensity:1.2}),e+i*.16,.79+.015,t+.3,!1,!1),So(n,e-i*.14,.79+.02,t-.38,7);else if(s%6===1)So(n,e+i*.16,.79+.02,t+.28,9),kl(n,.1,.22,new zt({color:11123904,transparent:!0,opacity:.45,roughness:.2}),e-i*.17,.79+.12,t+.32),Z(n,.1,.035,.1,ue.white,e-i*.17,.79+.25,t+.32,!1,!1);else if(s%6===2){let o=new ze(new Fn(.085,.075,.14,14),new ae({color:12104357,metalness:.4,roughness:.4}));o.position.set(e-i*.16,.79+.08,t-.35),n.add(o);for(let a=0;a<9;a++)mn(n,new A(e-i*.16,.79+.14,t-.35),new A(e-i*(.13+He()*.1),.79+.28+He()*.09,t-.4+He()*.13),.004,ue.green);Z(n,.11,.018,.17,ue.black,e-i*.02,.79+.02,t+.03,!1,!1)}else s%6===3?(Z(n,.24,.025,.34,new ae({color:8751499,roughness:.5}),e+i*.02,.79+.03,t+.22,!1,!1),So(n,e+i*.16,.79+.02,t-.32,6),kl(n,.105,.22,new zt({color:12043205,transparent:!0,opacity:.48,roughness:.25}),e-i*.16,.79+.12,t+.34)):s%6===4?(So(n,e-i*.14,.79+.02,t-.28,10),Z(n,.12,.09,.11,new ae({color:11130478,roughness:.7}),e+i*.16,.79+.05,t+.34,!1,!1),Z(n,.08,.18,.08,new ae({color:5671085,roughness:.5}),e+i*.12,.79+.09,t-.36,!1,!1)):(Z(n,.18,.07,.12,new ae({color:14274475,roughness:.8}),e-i*.15,.79+.04,t-.34,!1,!1),So(n,e+i*.15,.79+.02,t+.34,5),Z(n,.1,.17,.1,ue.black,e-i*.15,.79+.09,t+.3,!1,!1))}function Pl(n,e,t,i){let s=Je[n.floor],r=ot(n,e*1.2,t),o=new $e;o.position.set(r.x,0,r.z),(n.generatedInteriorGroup||s.root).add(o),Z(o,.88,.1,1.92,ue.metal,0,1.67,0),Z(o,.8,.12,1.84,new ae({color:4810619,roughness:.96}),0,1.77,0);for(let h of[-.41,.41])for(let d of[-.91,.91])mn(o,new A(h,.02,d),new A(h,2.31,d),.024,ue.metal);let a=-e*.43;mn(o,new A(a,1.89,-.87),new A(a,1.89,.87),.018,ue.metal),mn(o,new A(a,2.08,-.87),new A(a,2.08,.87),.016,ue.metal),Z(o,.83,.09,1.88,ue.navy,0,2.61,0,!1,!1);let c=new ze(new yn(1.83,.64),ue.mesh);if(c.position.set(a,2.28,0),c.rotation.y=Math.PI/2,o.add(c),i%3===0&&Z(o,.025,1.05,.28,ue.navy,a,2.05,.66,!1,!1),i%2===0){Z(o,.055,1.6,.055,ue.metal,a,.8,.52-.16),Z(o,.055,1.6,.055,ue.metal,a,.8,.52+.16);for(let d=0;d<5;d++)Z(o,.065,.035,.32,ue.metal,a,.22+d*.28,.52)}let l=-e*.13;Z(o,.68,.055,1.03,ue.wood,l,.75,0),Z(o,.05,.7,1.03,ue.woodDark,e*.31,.39,0);let u=i%2===0?.7:-.7;return Z(o,.58,1.45,.36,ue.wood,e*.05,.73,u),Z(o,.36,.032,1,ue.wood,-e*.18,1.22,0),ry(o,l,0,e,i),i%3===0?iy(o,-e*.52,.05,e>0?-Math.PI/2:Math.PI/2):Ul(o,-e*.52,.04,e>0?-Math.PI/2:Math.PI/2),i%4===0?(Hl(o,-e*.55,.7),Vl(o,-e*.43,-.69,.15),Vl(o,-e*.62,-.68,-.1)):i%4===1?(Ao(o,-e*.56,.68,2),Hl(o,-e*.5,-.68,5399893)):i%4===2?Z(o,.24,.25,.24,new ae({color:7172978,roughness:.8}),-e*.58,.13,.67):Ao(o,-e*.55,-.69,2),pn(s,r.x,r.z,.94,1.96,"bed station"),o}function oy(n,e){let t=Je[n.floor],i=n.generatedInteriorGroup||i,s=e*3%6;Pl(n,-1,1.55,(s+0)%6),Pl(n,-1,4.03,(s+1)%6),Pl(n,1,1.55,(s+2)%6),Pl(n,1,4.03,(s+3)%6);let r=ot(n,0,5.42);Ao(i,r.x-.38,r.z,2+e%2),Ao(i,r.x+.38,r.z,2);let o=ot(n,-.72,5.6);Hl(i,o.x,o.z,e%2?2238251:5465429),Vl(i,o.x+.27,o.z-.1*n.side,.12),Vl(i,o.x+.43,o.z-.08*n.side,-.08);let a=ot(n,0,D.roomD-.12);for(let l=-6;l<=6;l++)Z(i,.065,.58,.09,ue.white,a.x+l*.1,.39,a.z-n.side*.08,!1,!0);let c=ot(n,.64,D.roomD-.54);for(let l of[.16,.43,.7])Z(i,.39,.025,.26,ue.white,c.x,l,c.z);for(let l of[-1,1])for(let u of[-1,1])mn(i,new A(c.x+l*.18,.04,c.z+u*.11),new A(c.x+l*.18,.8,c.z+u*.11),.011,ue.white);if(n.label==="418"){let l=ot(n,0,D.roomD-.83);Z(i,.46,.23,.34,new ae({color:12474189,roughness:.92}),l.x,.115,l.z),Z(i,.5,.22,.34,ue.cardboard,l.x-.04,.34,l.z+.18*n.side);for(let u of[-.2,0,.2]){let h=new ze(new An(.075,12,8),new ae({color:14731586,roughness:.82}));h.position.set(l.x+u,.54,l.z-.05*n.side),i.add(h)}}}function ay(n){let e=Je[n.floor],t=n.nearZ+n.side*n.depth/2;Z(e.root,.7,1.72,.38,ue.grayDoor,n.x+.85,.86,t+.55*n.side),Z(e.root,.7,1.72,.38,ue.grayDoor,n.x-.85,.86,t+.55*n.side);for(let i=0;i<3;i++)Z(e.root,2.35,.05,.44,ue.darkMetal,n.x,.38+i*.55,t-.65*n.side);if(n.label==="\u8BBE\u5907\u95F4"||n.label==="\u914D\u7535\u95F4"){let i=Z(e.root,.34,.52,.16,new ae({color:12567484,roughness:.65}),n.x,1.48,n.farZ-n.side*.12,!1,!0);is(e,i,{type:"breaker",breakerId:n.label==="\u8BBE\u5907\u95F4"?"stair":"core"}),Z(e.root,.08,.14,.03,new ae({color:9122608,roughness:.5}),n.x,1.49,n.farZ-n.side*.22,!1,!1)}pn(e,n.x+.85,t+.55*n.side,.75,.42,"utility cabinet"),pn(e,n.x-.85,t+.55*n.side,.75,.42,"utility cabinet")}function ly(n){let e=Je[n.floor],t=n.nearZ+n.side*n.depth/2,i=new ae({color:15198692,roughness:.45});for(let r of[-.72,0,.72])Z(e.root,.58,.09,.4,i,n.x+r,.82,t-.7*n.side),kl(e.root,.025,.24,ue.darkMetal,n.x+r,.98,t-.74*n.side),pn(e,n.x+r,t-.7*n.side,.62,.44,"sink");for(let r of[-.72,.72])Z(e.root,.05,1.92,1.3,ue.tileWhite,n.x+r*.67,.96,t+.7*n.side),Z(e.root,.72,1.78,.05,ue.tileWhite,n.x+r,.89,t+.98*n.side);let s=new Mn(13098740,.32,3,2);s.position.set(n.x,2.25,t),e.root.add(s)}function No(n){let e=D.corridorL/2,t=D.roomW/2,i=D.roomXs.map(o=>[o-t,o+t]).sort((o,a)=>o[0]-a[0]),s=[],r=-e;for(let[o,a]of i)o>r+.01&&s.push([r,o]),r=Math.max(r,a);r<e-.01&&s.push([r,e]);for(let[o,a]of s){let c=a-o,l=(o+a)/2;for(let u of[-D.corridorW/2,D.corridorW/2])Z(n.root,c,D.roomH,.08,ue.wall,l,D.roomH/2,u,!1,!0),pn(n,l,u,c,.11,"corridor infill")}}function cy(){let n=Lo(5);return Do(n),Ke(n,"502",D.roomXs[0],-1,"dorm",2,{initialOpen:!1}),Ke(n,"\u901A\u4FE1\u95F4",D.roomXs[0],1,"utility",0,{gray:!0,initialOpen:!1,depth:4.2}),Ke(n,"504",D.roomXs[1],-1,"dorm",4,{initialOpen:!0}),Ke(n,"\u667E\u6652\u95F4",D.roomXs[1],1,"wash",0,{gray:!0,initialOpen:!0,depth:4}),Ke(n,"506",D.roomXs[2],-1,"dorm",1,{initialOpen:!1}),Ke(n,"\u5F31\u7535\u95F4",D.roomXs[2],1,"utility",0,{gray:!0,initialOpen:!1,depth:4}),Ke(n,"508",D.roomXs[3],-1,"dorm",5,{initialOpen:!1}),Ke(n,"\u5929\u53F0\u524D\u5BA4",D.roomXs[3],1,"utility",0,{gray:!0,locked:!0,lockType:"sealed",depth:3.8}),No(n),n.eastPortal=gi(n,"east",{label:"\u4E1C\u4FA7\u697C\u68AF \xB7 \u2193 4F",open:!0,toFloor:4}),n.westPortal=gi(n,"west",{label:"\u897F\u4FA7 \xB7 \u5929\u53F0\u95E8\u5C01\u9501",locked:!0,lockType:"sealed"}),n}function uy(){let n=Lo(4);return Do(n),Ke(n,"418",D.roomXs[0],-1,"dorm",0,{initialOpen:!1}),Ke(n,"417",D.roomXs[0],1,"dorm",1,{initialOpen:!1}),Ke(n,"420",D.roomXs[1],-1,"dorm",2,{initialOpen:!1}),Ke(n,"419",D.roomXs[1],1,"dorm",3,{initialOpen:!1}),Ke(n,"422",D.roomXs[2],-1,"dorm",4,{initialOpen:!0}),Ke(n,"\u8BBE\u5907\u95F4",D.roomXs[2],1,"utility",0,{gray:!0,locked:!0,lockType:"maint",depth:4}),Ke(n,"424",D.roomXs[3],-1,"dorm",5,{initialOpen:!1}),Ke(n,"\u81EA\u4E60\u95F4",D.roomXs[3],1,"utility",0,{gray:!0,initialOpen:!0,depth:4.5}),No(n),n.eastPortal=gi(n,"east",{label:"\u4E1C\u4FA7\u697C\u68AF \xB7 \u2191 5F",open:!0,toFloor:5}),n.westPortal=gi(n,"west",{label:"\u897F\u4FA7\u697C\u68AF \xB7 \u2193 3F",locked:!0,lockType:"stairpower",toFloor:3}),n}function hy(){let n=Lo(3);return Do(n),Ke(n,"312",D.roomXs[0],-1,"dorm",5,{initialOpen:!1}),Ke(n,"\u6D17\u6F31\u95F4",D.roomXs[0],1,"wash",0,{gray:!0,initialOpen:!0,depth:4}),Ke(n,"314",D.roomXs[1],-1,"dorm",0,{initialOpen:!1}),Ke(n,"\u5BBF\u7BA1\u503C\u73ED\u5BA4",D.roomXs[1],1,"utility",0,{gray:!0,initialOpen:!1,depth:4}),Ke(n,"316",D.roomXs[2],-1,"dorm",3,{initialOpen:!0}),Ke(n,"\u914D\u7535\u95F4",D.roomXs[2],1,"utility",0,{gray:!0,initialOpen:!1,locked:!0,lockType:"maint",depth:4}),Ke(n,"318",D.roomXs[3],-1,"dorm",1,{initialOpen:!1}),Ke(n,"\u536B\u751F\u95F4",D.roomXs[3],1,"wash",0,{gray:!0,initialOpen:!1,depth:4.2}),No(n),n.eastPortal=gi(n,"east",{label:"\u4E1C\u4FA7\u697C\u68AF \xB7 \u2191 4F",open:!0,toFloor:4}),n.westPortal=gi(n,"west",{label:"\u897F\u4FA7\u697C\u68AF \xB7 \u2193 2F",locked:!0,lockType:"card",toFloor:2}),n}function dy(){let n=Lo(2);return Do(n),Ke(n,"212",D.roomXs[0],-1,"dorm",1,{initialOpen:!1}),Ke(n,"\u6D17\u8863\u95F4",D.roomXs[0],1,"wash",0,{gray:!0,initialOpen:!0,depth:4}),Ke(n,"214",D.roomXs[1],-1,"dorm",4,{initialOpen:!1}),Ke(n,"\u503C\u73ED\u5BA4",D.roomXs[1],1,"utility",0,{gray:!0,initialOpen:!1,locked:!0,lockType:"powercard2",depth:4}),Ke(n,"216",D.roomXs[2],-1,"dorm",5,{initialOpen:!0}),Ke(n,"\u50A8\u7269\u95F4",D.roomXs[2],1,"utility",0,{gray:!0,initialOpen:!1,locked:!0,lockType:"powercard2",depth:4}),Ke(n,"218",D.roomXs[3],-1,"dorm",2,{initialOpen:!1}),Ke(n,"\u6DCB\u6D74\u95F4",D.roomXs[3],1,"wash",0,{gray:!0,initialOpen:!0,depth:4.2}),No(n),n.eastPortal=gi(n,"east",{label:"\u4E1C\u4FA7\u697C\u68AF \xB7 \u2191 3F",open:!0,toFloor:3}),n.westPortal=gi(n,"west",{label:"\u897F\u4FA7\u697C\u68AF \xB7 \u2193 1F",locked:!0,lockType:"master",toFloor:1}),n}function fy(){let n=Lo(1);return Do(n),Ke(n,"101",D.roomXs[0],-1,"dorm",3,{initialOpen:!1}),Ke(n,"\u5BBF\u7BA1\u524D\u53F0",D.roomXs[0],1,"utility",0,{gray:!0,initialOpen:!0,depth:4.3}),Ke(n,"\u95E8\u5385",D.roomXs[1],-1,"utility",0,{gray:!0,initialOpen:!0,depth:4.8}),Ke(n,"\u5FEB\u9012\u95F4",D.roomXs[1],1,"utility",0,{gray:!0,initialOpen:!1,depth:4.2}),Ke(n,"\u6D88\u9632\u63A7\u5236\u5BA4",D.roomXs[2],-1,"utility",0,{gray:!0,initialOpen:!1,depth:4}),Ke(n,"102",D.roomXs[2],1,"dorm",4,{initialOpen:!0}),Ke(n,"\u516C\u5171\u5927\u5385",D.roomXs[3],-1,"utility",0,{gray:!0,initialOpen:!0,depth:5.1}),Ke(n,"\u95E8\u536B\u5BA4",D.roomXs[3],1,"utility",0,{gray:!0,initialOpen:!1,depth:3.8}),No(n),n.eastPortal=gi(n,"east",{label:"\u4E1C\u4FA7\u697C\u68AF \xB7 \u2191 2F",open:!0,toFloor:2}),n.westPortal=gi(n,"west",{label:"\u4E00\u5C42\u6B63\u95E8 \xB7 OUTSIDE",locked:!0,lockType:"master",endGame:!0}),n}var Fi=cy(),Lt=uy(),pt=hy(),Wt=dy(),Oi=fy();for(let n of[Fi,pt,Wt,Oi])n.root.visible=!1;var Ro={performance:{label:"Performance",pixel:.82,hero:!1,shadow:!1,roomRange:0},balanced:{label:"Balanced",pixel:1,hero:!0,shadow:!1,roomRange:1},quality:{label:"Quality",pixel:1.2,hero:!0,shadow:!0,roomRange:2}},ct={quality:"balanced",heroStatus:"idle",hero418:null,heroMeshes:0,heroMaterials:0,visibleRooms:0,fallbackReason:"",assetErrors:[]},py=new Cl;function ah(n,e=!1){Ro[n]||(n="balanced"),ct.quality=n;let t=Ro[n];if(Ji=Math.min(devicePixelRatio,t.pixel),mt.setPixelRatio(Ji),mt.shadowMap.enabled=t.shadow,W.qualityHint&&(W.qualityHint.textContent=n==="performance"?"\u7A0B\u5E8F\u5316\u623F\u95F4 \xB7 \u6700\u4F4E\u9634\u5F71":n==="quality"?"Hero Room \xB7 \u9AD8\u50CF\u7D20\u6BD4 \xB7 \u52A8\u6001\u9634\u5F71":"Hero Room \xB7 \u52A8\u6001\u6027\u80FD\u4FDD\u62A4"),!t.hero&&ct.hero418){ct.hero418.visible=!1;let i=Lt.roomByLabel[418];i.generatedInteriorGroup.visible=!0}t.hero&&ct.hero418&&(ct.hero418.visible=!0,Lt.roomByLabel[418].generatedInteriorGroup.visible=!1),e&&Ie(`\u753B\u8D28\uFF1A${t.label}`,700)}function my(n){n.updateMatrixWorld(!0);let e=new un,t=new A,i=0;return n.traverse(s=>{if(!s.isMesh)return;e.setFromObject(s),e.getSize(t);let r=Math.min(t.x,t.y,t.z),o=t.x>2.6&&t.z>4.4&&t.y<.18,a=t.x>2.6&&t.y>1.9&&t.z<.18,c=t.z>4.4&&t.y>1.9&&t.x<.18;(o||a||c)&&(s.visible=!1,i++)}),i}function gy(n){let e=new Set,t=0;n.traverse(i=>{if(!i.isMesh)return;t++,i.frustumCulled=!0,i.castShadow=ct.quality==="quality",i.receiveShadow=!0;let s=Array.isArray(i.material)?i.material:[i.material];for(let r of s)r&&(e.add(r),r.map&&(r.map.anisotropy=Math.min(4,mt.capabilities.getMaxAnisotropy()),r.map.colorSpace=Pt),r.needsUpdate=!0)}),ct.heroMeshes=t,ct.heroMaterials=e.size}function xy(){ct.heroStatus==="loading"||ct.heroStatus==="ready"||!Ro[ct.quality].hero||(ct.heroStatus="loading",W.perfArt&&(W.perfArt.textContent="LOAD"),py.load("./assets/hero/418_reference.glb",n=>{let e=Lt.roomByLabel[418],t=n.scene;t.name="HeroRoom_418_Reference",t.scale.setScalar(.8),t.position.set(e.x,.2,e.nearZ+e.side*e.depth/2),t.rotation.y=0,my(t),gy(t),Lt.root.add(t),e.heroAsset=t,ct.hero418=t,ct.heroStatus="ready",e.generatedInteriorGroup.visible=!1,t.visible=Ro[ct.quality].hero,W.perfArt&&(W.perfArt.textContent=`GLB ${ct.heroMeshes}`),Ie("418 Hero Room \u7F8E\u672F\u8D44\u4EA7\u5DF2\u8F7D\u5165",1200)},void 0,n=>{ct.heroStatus="failed",ct.fallbackReason=String(n?.message||n),ct.assetErrors.push(ct.fallbackReason),Lt.roomByLabel[418].generatedInteriorGroup.visible=!0,W.perfArt&&(W.perfArt.textContent="FALLBACK"),console.warn("[v0.7] Hero Room load failed; procedural fallback retained",n)}))}function _y(){let n=Pn(),e=0,t=Ro[ct.quality];for(let i of n.rooms){let s=!0;if(i.kind==="dorm"){let r=i.x+i.doorOffset,o=Math.hypot(G.pos.x-r,G.pos.z-i.nearZ),a=G.pos.x>i.x-D.roomW/2&&G.pos.x<i.x+D.roomW/2&&(i.side<0&&G.pos.z<i.nearZ&&G.pos.z>i.farZ||i.side>0&&G.pos.z>i.nearZ&&G.pos.z<i.farZ),c=i.door&&Math.abs(i.door.angle)>.28;s=a||c&&o<(t.roomRange?8.5:4.4)||o<2.1,i.label==="418"&&i.heroAsset?(i.heroAsset.visible=s&&t.hero,i.generatedInteriorGroup.visible=s&&!t.hero):i.generatedInteriorGroup.visible=s}s&&e++}ct.visibleRooms=e,W.perfRooms&&(W.perfRooms.textContent=String(e))}function ti(n,e){let t=Je[n.floor],i=n.nearZ+n.side*n.depth*.58;if(n.eventType=e,e==="study"){let s=new ae({color:9203536,roughness:.82});for(let o of[-.75,.55]){let a=ot(n,0,2.15+o);Z(t.root,2.1,.06,.62,s,a.x,.76,a.z);for(let c of[-.65,0,.65]){let l=ot(n,c,2.15+o);Ul(t.root,l.x,l.z,n.side>0?Math.PI:0)}}let r=ot(n,.18,3.4);Z(t.root,.42,.24,.06,new ae({color:2503482,emissive:3233386,emissiveIntensity:1.1}),r.x,1.06,r.z,!1,!1),pn(t,n.x,n.nearZ+n.side*2.15,2.15,.72,"study tables")}else if(e==="barricaded"){let s=ot(n,.15,1.28),r=Ul(t.root,s.x,s.z,.55*n.side);r.rotation.z=.16;let o=ot(n,-.7,4.85);Ao(t.root,o.x,o.z,4);let a=ot(n,.7,5.15);Hl(t.root,a.x,a.z,4800828)}else if(e==="struggle"){let s=new ae({color:6954267,roughness:.96});for(let a=0;a<7;a++){let c=ot(n,-.55+a*.18,1.15+a*.34);Z(t.root,.12,.012,.22,s,c.x,.045,c.z,!1,!1)}let r=ot(n,.55,2.65),o=Ul(t.root,r.x,r.z,.6);o.rotation.z=1.02}else if(e==="quiet"){let s=ot(n,0,4.75);Z(t.root,.92,.08,.48,new ae({color:5594200,roughness:.9}),s.x,.08,s.z);let r=new Mn(15849380,.45,2.8,2);r.position.set(s.x,1.25,s.z),t.root.add(r)}else if(e==="shower"){let s=new Mn(10275543,.45,3.5,2);s.position.set(n.x,2.22,i),t.root.add(s);for(let r of[-.7,0,.7]){let o=ot(n,r,2.65);kl(t.root,.018,.32,ue.darkMetal,o.x,1.9,o.z)}}}ti(Fi.roomByLabel.\u901A\u4FE1\u95F4,"quiet");ti(Fi.roomByLabel[504],"barricaded");ti(Lt.roomByLabel.\u81EA\u4E60\u95F4,"study");ti(Lt.roomByLabel[424],"barricaded");ti(pt.roomByLabel.\u5BBF\u7BA1\u503C\u73ED\u5BA4,"quiet");ti(pt.roomByLabel[318],"struggle");ti(pt.roomByLabel.\u536B\u751F\u95F4,"quiet");ti(Wt.roomByLabel[218],"struggle");ti(Wt.roomByLabel.\u6DCB\u6D74\u95F4,"shower");ti(Oi.roomByLabel[101],"struggle");ti(Oi.roomByLabel.\u516C\u5171\u5927\u5385,"barricaded");function yy(n){let e=(t,i,s,r=78)=>{let o=new ze(new yn(1.82,.62),wo(t,i,s,r));o.position.set(.1,1.62,-D.corridorW/2+.052),n.root.add(o)};if(n.id===5){e("5F \u9876\u5C42\u901A\u4FE1\u533A / ROOFTOP","#342a3c","#e2c8f3",70);let t=new ae({color:6448490,metalness:.45,roughness:.5});for(let i of[-7.3,7])mn(n.root,new A(i,.02,.76),new A(i,2,.76),.025,t),mn(n.root,new A(i-.35,1.55,.76),new A(i+.35,1.55,.76),.018,t)}else if(n.id===4){e("4F \u751F\u6D3B\u533A / LIFE","#d9d0a7","#353b35",88);let t=new ae({color:6719070,roughness:.9});for(let i of[-7.8,7.7]){let s=new ze(new Fn(.15,.12,.28,12),new ae({color:9008221,roughness:.9}));s.position.set(i,.14,.82),n.root.add(s);for(let r=0;r<5;r++)mn(n.root,new A(i,.28,.82),new A(i+(He()-.5)*.22,.65+He()*.18,.82+(He()-.5)*.18),.018,t)}}else if(n.id===3){e("3F \u7BA1\u7406\u8BBE\u5907\u533A / SYSTEM","#254033","#a7d2b4",74);let t=new ae({color:13211448,roughness:.72});for(let i of[-5.1,4.5])Z(n.root,.82,.055,.18,t,i,.075,.78,!1,!1),Z(n.root,.52,.34,.3,ue.cardboard,i+.25,.17,-.7,!1,!0)}else if(n.id===2){e("2F \u9694\u79BB\u5931\u8D25\u533A / ISOLATION","#1c2d34","#afd5e6",68);let t=new ae({color:3497331,emissive:2378592,emissiveIntensity:1.25,roughness:.55});for(let s of[-7.4,-3.7,0,3.7,7.4])Z(n.root,.34,.055,.1,t,s,2.2,-D.corridorW/2+.06,!1,!1);let i=new ae({color:5513246,roughness:.98});for(let[s,r,o]of[[-5.7,.28,.45],[-1.4,-.52,.3],[4.2,.48,.55]])Z(n.root,o,.008,.16,i,s,.045,r,!1,!1)}else{e("1F \u5927\u5385 / LOBBY \xB7 EXIT","#402523","#efb3a8",72);let t=new zt({color:10336700,transparent:!0,opacity:.18,roughness:.12});for(let s of[-7.2,6.4]){let r=new ze(new yn(.62,.42),t);r.position.set(s,.55,.9),r.rotation.x=-Math.PI/2,n.root.add(r)}let i=new ae({color:6169376,roughness:.98});for(let[s,r,o]of[[-6.2,.35,.7],[-2.5,-.55,.42],[5,.5,.62]])Z(n.root,o,.008,.18,i,s,.045,r,!1,!1)}}for(let n of[Fi,Lt,pt,Wt,Oi])yy(n);function vy(n){n.nav=[],n.navEdges=new Map;let e=(o,a,c="",l=null)=>{let u={id:n.nav.length,x:o,z:a,tag:c,door:l};return n.nav.push(u),n.navEdges.set(u.id,[]),u},t=(o,a)=>{n.navEdges.get(o.id).push(a.id),n.navEdges.get(a.id).push(o.id)},i=[];for(let o=-D.corridorL/2+.72;o<=D.corridorL/2-.72;o+=1.28)i.push(e(o,0,"corridor"));for(let o=0;o<i.length-1;o++)t(i[o],i[o+1]);for(let o of n.rooms){let a=o.x+o.doorOffset,c=e(a,o.nearZ-o.side*.38,"door-out",o.door),l=e(a,o.nearZ+o.side*.38,"door-in",o.door),u=e(o.x,o.nearZ+o.side*Math.min(2.1,o.depth*.5),"room"),h=e(o.x,o.nearZ+o.side*Math.min(o.depth-.55,4.85),"room-far"),d=i[0],f=999;for(let g of i){let x=Math.abs(g.x-a);x<f&&(f=x,d=g)}t(d,c),t(c,l),t(l,u),t(u,h)}let s=e(-D.corridorL/2+.38,0,"portal"),r=e(D.corridorL/2-.38,0,"portal");t(i[0],s),t(i[i.length-1],r)}for(let n of Object.values(Je))vy(n);Ui.add(new co(15200501,5327676,1.38));var os=new Ss(16774105,1.35);os.position.set(-7,12,-5);os.castShadow=!0;os.shadow.mapSize.set(512,512);os.shadow.camera.left=-13;os.shadow.camera.right=13;os.shadow.camera.top=11;os.shadow.camera.bottom=-11;Ui.add(os);var ei={easy:{label:"\u7B80\u5355",hp:.78,damage:.62,speed:.94,loot:1.35,extra:0},normal:{label:"\u666E\u901A",hp:1,damage:1,speed:1,loot:1,extra:1},hard:{label:"\u56F0\u96BE",hp:1.08,damage:1.42,speed:1.12,loot:.78,extra:2}},My={pistol:"M9 \u624B\u67AA",ammo9:"9mm \u5F39\u836F",shotgun:"\u6CF5\u52A8\u9730\u5F39\u67AA",smg:"MP5 \u51B2\u950B\u67AA",shells:"12G \u9730\u5F39",crowbar:"\u64AC\u68CD",bandage:"\u7EF7\u5E26",medkit:"\u533B\u7597\u5305",grenade:"\u7834\u7247\u624B\u96F7",molotov:"\u71C3\u70E7\u74F6",decoy:"\u73BB\u7483\u74F6\u8BF1\u9975",maintKey:"\u7EF4\u4FEE\u94A5\u5319",accessCard:"\u5BBF\u820D\u95E8\u7981\u5361",masterKey:"\u603B\u95E8\u6743\u9650\u5361"},Ds=null;function Sy(n,e,t,i,s,r="box"){let o=Je[n.floor],a=ot(n,e,t),c=new $e;c.position.set(a.x,0,a.z),o.root.add(c);let l=r==="metal"?new ae({color:6648168,roughness:.7}):ue.cardboard,u=Z(c,.42,.22,.31,l,0,.11,0),h=new $e;h.position.set(0,.22,-n.side*.155),c.add(h);let d=Z(h,.42,.035,.31,l,0,0,n.side*.155),f={floor:n.floor,room:n,g:c,body:u,lidPivot:h,label:i,contents:s,opened:!1,looted:!1,openT:0};return is(o,u,{type:"loot",container:f}),is(o,d,{type:"loot",container:f}),o.loot.push(f),f}var lh=[];function gt(n,e,t,i,s,r,o="box"){let a=Sy(e,t,i,s,r,o);return a.id=n,lh.push(a),a}function br(n,e,t=1){n&&n.contents.push([e,t])}function Sn(n){return lh.find(e=>e.id===n)}gt("5-502",Fi.roomByLabel[502],-.15,3.35,"\u4E0A\u9501\u65C5\u884C\u7BB1",[["ammo9",22],["medkit",1]],"metal");gt("5-comm",Fi.roomByLabel.\u901A\u4FE1\u95F4,.1,2.45,"\u901A\u4FE1\u5907\u4EF6\u7BB1",[["grenade",1],["decoy",2],["ammo9",18]],"metal");gt("5-504",Fi.roomByLabel[504],.25,4.2,"\u5E78\u5B58\u8005\u80CC\u5305",[["shells",6],["bandage",2],["molotov",1]],"metal");gt("5-weak",Fi.roomByLabel.\u5F31\u7535\u95F4,-.12,2.55,"\u5F31\u7535\u5DE5\u5177\u7BB1",[["ammo9",24],["grenade",1]],"metal");gt("4-start",Lt.roomByLabel[418],.04,2.2,"\u684C\u8FB9\u5DE5\u5177\u7BB1",[["pistol",1],["ammo9",24]],"metal");gt("4-417",Lt.roomByLabel[417],-.22,3.25,"\u5E8A\u4E0B\u7EB8\u7BB1",[["ammo9",18],["bandage",1]]);gt("4-419",Lt.roomByLabel[419],.18,4.3,"\u4E66\u684C\u62BD\u5C49",[["ammo9",12],["grenade",1]]);gt("4-420",Lt.roomByLabel[420],-.1,4.72,"\u7EFF\u8272\u6536\u7EB3\u7BB1",[["bandage",1]],"metal");gt("4-422",Lt.roomByLabel[422],.38,2.52,"\u5E8A\u67B6\u65C1\u5DE5\u5177\u888B",[["crowbar",1],["medkit",1]],"metal");gt("4-study",Lt.roomByLabel.\u81EA\u4E60\u95F4,.22,3.1,"\u684C\u4E0B\u7EB8\u888B",[["decoy",2],["bandage",1]]);gt("4-424",Lt.roomByLabel[424],-.2,4.65,"\u65C5\u884C\u7BB1\u5939\u5C42",[["ammo9",16],["decoy",1]],"metal");gt("3-312",pt.roomByLabel[312],-.18,3.2,"\u5E8A\u4E0B\u7EB8\u7BB1",[["shells",5],["bandage",2]]);gt("3-314",pt.roomByLabel[314],.1,4.2,"\u957F\u6761\u6B66\u5668\u7BB1",[["shells",8]],"metal");gt("3-duty",pt.roomByLabel.\u5BBF\u7BA1\u503C\u73ED\u5BA4,-.04,2.82,"\u503C\u73ED\u5458\u67DC",[["grenade",1],["medkit",1]],"metal");gt("3-316",pt.roomByLabel[316],-.28,3.85,"\u7EB8\u7BB1",[["shells",5],["bandage",1]]);gt("3-wash",pt.roomByLabel.\u6D17\u6F31\u95F4,.62,2.55,"\u6E05\u6D01\u7528\u54C1\u67DC",[["medkit",1],["bandage",1]],"metal");gt("3-318",pt.roomByLabel[318],.28,4.4,"\u7FFB\u5012\u7684\u62BD\u5C49",[["shells",4],["grenade",1]]);gt("3-toilet",pt.roomByLabel.\u536B\u751F\u95F4,-.3,2.3,"\u4FDD\u6D01\u67DC",[["decoy",2],["bandage",1]],"metal");gt("2-212",Wt.roomByLabel[212],-.12,3.35,"\u5E8A\u4E0B\u884C\u674E\u7BB1",[["ammo9",28],["grenade",1]],"metal");gt("2-214",Wt.roomByLabel[214],.16,4.18,"\u9ED1\u8272\u6B66\u5668\u7BB1",[["smg",1],["ammo9",60]],"metal");gt("2-216",Wt.roomByLabel[216],-.18,2.3,"\u4E66\u684C\u62BD\u5C49",[["bandage",2],["molotov",1]]);gt("2-laundry",Wt.roomByLabel.\u6D17\u8863\u95F4,.52,2.4,"\u6D17\u8863\u7528\u54C1\u67DC",[["medkit",1],["molotov",1]],"metal");gt("2-store",Wt.roomByLabel.\u50A8\u7269\u95F4,-.2,2.62,"\u5E94\u6025\u7269\u8D44\u7BB1",[["grenade",2],["ammo9",36],["medkit",1]],"metal");gt("2-duty",Wt.roomByLabel.\u503C\u73ED\u5BA4,.08,2.85,"\u503C\u73ED\u5458\u4FDD\u9669\u7BB1",[["ammo9",30]],"metal");gt("2-218",Wt.roomByLabel[218],-.22,4.6,"\u5E8A\u5C3E\u65C5\u884C\u5305",[["ammo9",24],["decoy",1]],"metal");gt("2-shower",Wt.roomByLabel.\u6DCB\u6D74\u95F4,.38,2.6,"\u66F4\u8863\u67DC",[["medkit",1],["molotov",1]],"metal");gt("1-front",Oi.roomByLabel.\u5BBF\u7BA1\u524D\u53F0,.05,2.35,"\u524D\u53F0\u6025\u6551\u67DC",[["medkit",1],["bandage",2]],"metal");gt("1-parcel",Oi.roomByLabel.\u5FEB\u9012\u95F4,-.1,2.5,"\u62C6\u5F00\u7684\u5FEB\u9012\u7BB1",[["ammo9",34],["shells",5]]);gt("1-fire",Oi.roomByLabel.\u6D88\u9632\u63A7\u5236\u5BA4,.12,2.45,"\u6D88\u9632\u5E94\u6025\u67DC",[["grenade",1],["molotov",1]],"metal");var M={hp:100,bandages:0,medkits:0,grenades:0,molotovs:0,decoys:0,ammo9:0,shells:0,maintKey:!1,accessCard:!1,masterKey:!1,stairPower:!1,corePower:!1,powerZones:{1:!1,2:!1,3:!1,4:!0,5:!0},power2Restored:!1,owned:{pistol:!1,shotgun:!1,smg:!1,crowbar:!1},mags:{pistol:0,shotgun:0,smg:0},current:null,kills:0,shots:0,hits:0,started:!1,won:!1,dead:!1,startTime:0,powerRunnerSpawned:!1,difficulty:"normal",difficultyApplied:!1,bossStarted:!1,bossDefeated:!1,finalHorde:!1,useAction:null,slowUntil:0,flashlight:!1,lastMissionKey:"",lastDamageTime:-99,lastCombatTime:-99,tutorialSeen:new Set,roomEventSeen:new Set,runSeed:Po,placements:{},storySeen:new Set,safeRoom:!1,stamina:100,lastSprintTime:-99,performanceWarnings:0};function Ku(n){return n[Math.floor(He()*n.length)]}function by(){let n=["4-420","4-422","4-424"],e=["3-314","3-316","3-318","3-duty"],t=["2-duty","2-store"];M.placements.maint=Ku(n),M.placements.shotgun=Ku(e),M.placements.master=Ku(t),br(Sn(M.placements.maint),"maintKey",1),br(Sn(M.placements.shotgun),"shotgun",1),br(Sn(M.placements.master),"masterKey",1);let i=qf();if(!i.ok){console.warn("Run placement audit failed, applying safe defaults",i);for(let s of lh)s.contents=s.contents.filter(([r])=>!["maintKey","shotgun","masterKey"].includes(r));M.placements={maint:"4-420",shotgun:"3-314",master:"2-duty"},br(Sn("4-420"),"maintKey",1),br(Sn("3-314"),"shotgun",1),br(Sn("2-duty"),"masterKey",1)}}function qf(){let n={maint:Sn(M.placements.maint),shotgun:Sn(M.placements.shotgun),master:Sn(M.placements.master)},e=[];return(!n.maint||n.maint.floor!==4||n.maint.room.door?.locked)&&e.push("maintenance key must be in an initially reachable 4F room"),(!n.shotgun||n.shotgun.floor!==3||n.shotgun.room.label==="\u914D\u7535\u95F4")&&e.push("shotgun must be reachable before/without the power-room dependency"),(!n.master||n.master.floor!==2||!["\u503C\u73ED\u5BA4","\u50A8\u7269\u95F4"].includes(n.master.room.label))&&e.push("master key must be in the powered secure 2F zone"),{ok:e.length===0,problems:e,seed:Po,placements:{...M.placements}}}by();console.info("[DormEscape v0.6] run audit",qf());function Ie(n,e=1500){W.toast.textContent=n,W.toast.style.opacity=1,clearTimeout(Ie._t),Ie._t=setTimeout(()=>W.toast.style.opacity=0,e)}function jt(n,e,t,i=4200){M.tutorialSeen.has(n)||(M.tutorialSeen.add(n),W.tutorialTitle.textContent=e,W.tutorialText.textContent=t,W.tutorialCard.classList.remove("hidden"),clearTimeout(jt._t),jt._t=setTimeout(()=>W.tutorialCard.classList.add("hidden"),i))}function Ar(n){W.missionBannerText.textContent=n,W.missionBanner.classList.remove("hidden"),clearTimeout(Ar._t),Ar._t=setTimeout(()=>W.missionBanner.classList.add("hidden"),2800)}function Df(n){Ds=n,W.lootTitle.textContent=n.label,W.lootItems.innerHTML="";for(let[e,t]of n.contents){let i=document.createElement("div");i.innerHTML=`<span>${My[e]}</span><b>${t>1?"\xD7"+t:"1"}</b>`,W.lootItems.appendChild(i)}W.lootPanel.classList.remove("hidden")}function Ey(){Ds=null,W.lootPanel.classList.add("hidden")}function Ty(n,e){let t=ei[M.difficulty]||ei.normal;return["ammo9","shells"].includes(n)?Math.max(1,Math.round(e*t.loot)):e}function wy(n,e=1){e=Ty(n,e),n==="pistol"?(M.owned.pistol=!0,M.mags.pistol=Math.max(M.mags.pistol,12),M.current||ts("pistol"),jt("pistol","M9 \u624B\u67AA","\u5DE6\u952E\u5C04\u51FB \xB7 \u53F3\u952E\u7784\u51C6 \xB7 R \u6362\u5F39\u3002\u6253\u7A7A\u540E\u4E5F\u4F1A\u81EA\u52A8\u6362\u5F39\u3002")):n==="ammo9"?M.ammo9+=e:n==="shotgun"?(M.owned.shotgun=!0,M.mags.shotgun=Math.max(M.mags.shotgun,5),ts("shotgun"),jt("shotgun","\u6CF5\u52A8\u9730\u5F39\u67AA","\u8FD1\u8DDD\u79BB\u9AD8\u7206\u53D1\uFF0C\u5F39\u4ED3 5 \u53D1\u3002R \u9010\u53D1\u88C5\u586B\uFF0C\u5F00\u706B\u53EF\u4E2D\u65AD\u88C5\u586B\u3002")):n==="smg"?(M.owned.smg=!0,M.mags.smg=Math.max(M.mags.smg,30),ts("smg"),jt("smg","MP5 \u51B2\u950B\u67AA","\u9002\u5408\u5904\u7406\u4E2D\u8FD1\u8DDD\u79BB Runner \u4E0E\u666E\u901A\u5C38\u7FA4\u3002\u6CE8\u610F\u63A7\u5236\u8FDE\u7EED\u5C04\u51FB\u3002")):n==="shells"?M.shells+=e:n==="crowbar"?(M.owned.crowbar=!0,M.current||ts("crowbar")):n==="bandage"?(M.bandages+=e,jt("bandage","\u7EF7\u5E26","F \u4F7F\u7528\uFF1A\u7EA6 1.35 \u79D2\uFF0C\u6062\u590D 28 HP\uFF1B\u53D7\u5230\u653B\u51FB\u4F1A\u4E2D\u65AD\u3002")):n==="medkit"?(M.medkits+=e,jt("medkit","\u533B\u7597\u5305","G \u4F7F\u7528\uFF1A\u7EA6 3.25 \u79D2\uFF0C\u6062\u590D 62 HP\uFF1B\u9002\u5408\u8131\u79BB\u6218\u6597\u540E\u4F7F\u7528\u3002")):n==="grenade"?(M.grenades+=e,jt("grenade","\u7834\u7247\u624B\u96F7","Q \u6295\u63B7\u3002\u9002\u5408\u5BC6\u96C6\u611F\u67D3\u8005\uFF0C\u4F46\u8FD1\u8DDD\u79BB\u7206\u70B8\u4E5F\u4F1A\u4F24\u5230\u81EA\u5DF1\u3002")):n==="molotov"?(M.molotovs+=e,jt("molotov","\u71C3\u70E7\u74F6","T \u6295\u63B7\u3002\u706B\u7130\u53EF\u4EE5\u6682\u65F6\u5C01\u9501\u95E8\u53E3\u6216\u8D70\u5ECA\u3002")):n==="decoy"?(M.decoys+=e,jt("decoy","\u73BB\u7483\u74F6\u8BF1\u9975","C \u6295\u63B7\u3002\u843D\u5730\u788E\u88C2\u4F1A\u5236\u9020\u5927\u58F0\u54CD\uFF0C\u53EF\u628A\u9644\u8FD1\u611F\u67D3\u8005\u5F15\u79BB\u623F\u95F4\u3002")):n==="maintKey"?M.maintKey=!0:n==="accessCard"?M.accessCard=!0:n==="masterKey"&&(M.masterKey=!0,Wt.westPortal.locked=!1,Oi.westPortal.locked=!1,Ar("\u83B7\u5F97\u603B\u95E8\u6743\u9650 \xB7 \u524D\u5F80 1F \u6B63\u95E8"))}function Ay(n){if(!n.looted){for(let[e,t]of n.contents)wy(e,t);n.looted=!0,Ey(),Ie("\u5DF2\u62FF\u8D70\u5168\u90E8\u7269\u54C1"),ns(),Hn()}}function Ry(n){n.looted||(n.opened?Df(n):(n.opened=!0,n.openT=0,Df(n),Ie("\u641C\u7D22\u5B8C\u6210 \xB7 \u518D\u6309 E \u5168\u90E8\u62FF\u8D70",1e3)))}function ch(){return _e===5&&!M.storySeen.has("comm")?{key:"optional5",text:"\u53EF\u9009\uFF1A\u68C0\u67E5 5F \u901A\u4FE1\u95F4",sub:"\u9876\u5C42\u4E0D\u662F\u5F53\u524D\u4E3B\u7EBF\u5FC5\u7ECF\u533A\uFF0C\u4F46\u53EF\u80FD\u6709\u9AD8\u4EF7\u503C\u7269\u8D44\u548C\u707E\u53D8\u7EBF\u7D22\u3002",floor:5,label:"\u901A\u4FE1\u95F4"}:M.owned.pistol?M.maintKey?M.stairPower?_e===4?{key:"down3",text:"\u4ECE\u897F\u4FA7\u697C\u68AF\u4E0B\u5230 3F",sub:"\u4E1C\u4FA7\u697C\u68AF\u901A\u5F80 5F \u53EF\u9009\u63A2\u7D22\u533A\uFF1B\u897F\u4FA7\u7EE7\u7EED\u4E3B\u7EBF\u3002",floor:4,label:"westPortal"}:_e===3&&!M.corePower?{key:"corepower",text:"\u8FDB\u5165 3F \u914D\u7535\u95F4\uFF0C\u6062\u590D\u4E3B\u5E72\u4F9B\u7535",sub:"\u8FD9\u4F1A\u4E3A 2F \u5C40\u90E8\u914D\u7535\u63D0\u4F9B\u7535\u6E90\uFF0C\u540C\u65F6\u63D0\u9AD8\u4EAE\u533A\u611F\u67D3\u8005\u7684\u89C6\u89C9\u80FD\u529B\u3002",floor:3,label:"\u914D\u7535\u95F4"}:_e===3&&!M.owned.shotgun&&!M.bossStarted?{key:"shotgun",text:"\u63A2\u7D22 3F\uFF0C\u5BFB\u627E\u66F4\u5F3A\u7684\u8FD1\u8DDD\u79BB\u6B66\u5668",sub:`\u9730\u5F39\u67AA\u672C\u5C40\u4F4D\u4E8E ${Sn(M.placements.shotgun)?.room.label||"3F"}\uFF1B\u5B83\u4E0D\u662F\u901A\u5173\u786C\u9501\uFF0C\u4F46\u5BF9 HEAVY \u5F88\u6709\u4EF7\u503C\u3002`,floor:3,label:Sn(M.placements.shotgun)?.room.label}:_e===3&&!M.bossDefeated?{key:"boss",text:"\u7A81\u7834 3F \u4E2D\u592E\u5C01\u9501\u533A",sub:"HEAVY \u5FC5\u5B9A\u4F5C\u4E3A\u660E\u786E\u5173\u5361\u4E8B\u4EF6\u51FA\u73B0\u3002\u51B2\u649E\u649E\u5899\u540E\u7684\u786C\u76F4\u662F\u4E3B\u8981\u8F93\u51FA\u7A97\u53E3\u3002",floor:3,label:"boss"}:_e===3?{key:"down2",text:"\u4F7F\u7528\u95E8\u7981\u5361\uFF0C\u4ECE\u897F\u4FA7\u697C\u68AF\u4E0B\u5230 2F",sub:"2F \u521D\u59CB\u65AD\u7535\u3002\u4F60\u53EF\u4EE5\u4FDD\u6301\u9ED1\u6697\u6F5C\u884C\uFF0C\u4E5F\u5FC5\u987B\u5728\u9700\u8981\u7535\u5B50\u95E8\u65F6\u6062\u590D\u5C40\u90E8\u7535\u529B\u3002",floor:3,label:"westPortal"}:_e===2&&!M.power2Restored?{key:"power2",text:"\u627E\u5230 2F \u5C40\u90E8\u914D\u7535\u7BB1\uFF0C\u6062\u590D\u95E8\u7981\u4F9B\u7535",sub:"\u6062\u590D\u4F9B\u7535\u4F1A\u70B9\u4EAE\u533A\u57DF\u3001\u542F\u7528\u5B89\u5168\u95E8\uFF0C\u4E5F\u4F1A\u5236\u9020\u566A\u97F3\u5E76\u63D0\u9AD8\u611F\u67D3\u8005\u89C6\u8DDD\u3002",floor:2,label:"floor2Panel"}:_e===2&&!M.masterKey?{key:"master",text:"\u641C\u7D22 2F \u5B89\u5168\u533A\uFF0C\u53D6\u5F97\u603B\u95E8\u6743\u9650",sub:`\u603B\u95E8\u6743\u9650\u672C\u5C40\u4F4D\u4E8E ${Sn(M.placements.master)?.room.label||"\u5B89\u5168\u533A"}\u3002\u5019\u9009\u4F4D\u7F6E\u5747\u7ECF\u8FC7\u4F9D\u8D56\u68C0\u67E5\u3002`,floor:2,label:Sn(M.placements.master)?.room.label}:_e===2?{key:"down1",text:"\u4ECE\u897F\u4FA7\u697C\u68AF\u8FDB\u5165 1F",sub:"\u4E00\u697C\u662F\u5916\u754C\u611F\u67D3\u8FDB\u5165\u5BBF\u820D\u697C\u7684\u4E3B\u8981\u65B9\u5411\u3002\u603B\u95E8\u6743\u9650\u5DF2\u83B7\u5F97\u3002",floor:2,label:"westPortal"}:_e===1?{key:"escape",text:"\u7A7F\u8FC7 1F \u5927\u5385\uFF0C\u4ECE\u6B63\u95E8\u64A4\u79BB",sub:"\u63A5\u8FD1\u6B63\u95E8\u4F1A\u89E6\u53D1\u4E00\u573A\u771F\u5B9E\u7684\u6700\u7EC8\u538B\u529B\u4E8B\u4EF6\uFF1B\u64A4\u79BB\u95E8\u672C\u8EAB\u4E0D\u4F1A\u51ED\u7A7A\u6492\u8C0E\u3002",floor:1,label:"westPortal"}:{key:"return",text:"\u8FD4\u56DE\u4E3B\u7EBF\u697C\u5C42",sub:"M \u67E5\u770B\u697C\u5C42\u5730\u56FE\u548C\u697C\u68AF\u65B9\u5411\u3002",floor:4,label:"westPortal"}:{key:"stairpower",text:"\u8FDB\u5165 4F \u8BBE\u5907\u95F4\uFF0C\u6062\u590D\u697C\u68AF\u63A7\u5236\u7535\u6E90",sub:"\u901A\u7535\u4F1A\u4EA7\u751F\u771F\u5B9E\u673A\u68B0\u566A\u97F3\uFF0C\u5E76\u60CA\u52A8\u9644\u8FD1\u4ECD\u5B58\u6D3B\u7684\u611F\u67D3\u8005\u3002",floor:4,label:"\u8BBE\u5907\u95F4"}:{key:"maint",text:"\u641C\u7D22 4F\uFF0C\u627E\u5230\u7EF4\u4FEE\u94A5\u5319",sub:`\u672C\u5C40\u5173\u952E\u7269\u54C1\u4F4D\u7F6E\u7531 Seed ${Po} \u51B3\u5B9A\uFF1B\u7CFB\u7EDF\u5DF2\u5B8C\u6210\u53EF\u89E3\u6027\u68C0\u67E5\u3002`,floor:4,label:Sn(M.placements.maint)?.room.label}:{key:"arm",text:"\u641C\u7D22 418\uFF0C\u627E\u5230\u53EF\u4EE5\u9632\u8EAB\u7684\u6B66\u5668",sub:"\u5148\u5EFA\u7ACB\u6700\u57FA\u672C\u7684\u6218\u6597\u80FD\u529B\u3002",floor:4,label:"418"}}function ns(n=!1){let e=ch();W.objective.textContent=e.text,W.subObjective.textContent=e.sub,(n||M.lastMissionKey!==e.key)&&(M.lastMissionKey=e.key,Ar(e.text),Uo())}function Yf(n,e,t){for(let i of n.rooms){let s=Math.min(i.nearZ,i.farZ),r=Math.max(i.nearZ,i.farZ);if(e>i.x-D.roomW/2&&e<i.x+D.roomW/2&&t>s&&t<r)return i}return null}function Cy(n){let e=ch();if(e.floor!==n.id)return null;if(e.label==="eastPortal")return{x:D.corridorL/2-.25,z:0,label:"\u4E1C\u4FA7\u697C\u68AF"};if(e.label==="westPortal")return{x:-D.corridorL/2+.25,z:0,label:"\u897F\u4FA7\u697C\u68AF"};if(e.label==="boss")return{x:0,z:0,label:"\u5C01\u9501\u533A"};if(e.label==="floor2Panel")return{x:5.95,z:-D.corridorW/2+.12,label:"2F \u5C40\u90E8\u914D\u7535"};let t=n.roomByLabel[e.label];return t?{x:t.x,z:t.nearZ+t.side*t.depth*.45,label:t.label}:null}function Uo(){if(!W.mapCanvas)return;let n=W.mapCanvas,e=n.getContext("2d"),t=Je[_e],i=oh[_e];e.clearRect(0,0,n.width,n.height),e.fillStyle="#0f1513",e.fillRect(0,0,n.width,n.height);let s=42,r=D.corridorL/2+1.3,o=D.roomD+D.corridorW/2+.65,a=(n.width-s*2)/(r*2),c=(n.height-s*2)/(o*2),l=Math.min(a,c),u=n.width/2,h=n.height/2,d=E=>u+E*l,f=E=>h+E*l;e.fillStyle="#29322e",e.strokeStyle="#5b665f",e.lineWidth=2,e.fillRect(d(-D.corridorL/2),f(-D.corridorW/2),D.corridorL*l,D.corridorW*l),e.strokeRect(d(-D.corridorL/2),f(-D.corridorW/2),D.corridorL*l,D.corridorW*l);let g=Cy(t);for(let E of t.rooms){let y=Math.min(E.nearZ,E.farZ),R=Math.max(E.nearZ,E.farZ),C=t.visited.has(E.label);e.fillStyle=C?"#465650":"#1a211f",e.strokeStyle=C?"#7e8d85":"#39423e",e.lineWidth=1.4,e.fillRect(d(E.x-D.roomW/2),f(y),D.roomW*l,(R-y)*l),e.strokeRect(d(E.x-D.roomW/2),f(y),D.roomW*l,(R-y)*l),e.fillStyle=C?"#d7ded8":"#718079",e.font="12px sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText(E.label,d(E.x),f((y+R)/2)),g&&g.label===E.label&&(e.strokeStyle="#d1a85f",e.lineWidth=4,e.strokeRect(d(E.x-D.roomW/2)+2,f(y)+2,D.roomW*l-4,(R-y)*l-4))}e.fillStyle="#67716c",e.fillRect(d(-D.corridorL/2-.85),f(-.9),.85*l,1.8*l),e.fillRect(d(D.corridorL/2),f(-.9),.85*l,1.8*l),e.fillStyle="#d2d8d3",e.font="bold 12px sans-serif";let x=t.westPortal,m=t.eastPortal,p=x?.endGame?"\u897F\u4FA7\u51FA\u53E3":x?.toFloor?`\u897F\u2192${x.toFloor}F`:"\u897F\u4FA7\u5C01\u9501",w=m?.toFloor?`\u4E1C\u2192${m.toFloor}F`:"\u4E1C\u4FA7\u5C01\u9501";e.fillText(p,d(-D.corridorL/2-.43),f(0)),e.fillText(w,d(D.corridorL/2+.43),f(0)),g&&!t.roomByLabel[g.label]&&(e.beginPath(),e.arc(d(g.x),f(g.z),11,0,Math.PI*2),e.strokeStyle="#d1a85f",e.lineWidth=4,e.stroke()),e.beginPath(),e.arc(d(G.pos.x),f(G.pos.z),7,0,Math.PI*2),e.fillStyle="#f0d86c",e.fill(),e.beginPath(),e.moveTo(d(G.pos.x),f(G.pos.z)),e.lineTo(d(G.pos.x-Math.sin(G.yaw)*.55),f(G.pos.z-Math.cos(G.yaw)*.55)),e.strokeStyle="#fff0a3",e.lineWidth=3,e.stroke(),W.mapTitle.textContent=`${_e}F \xB7 ${i.name}`,W.mapObjective.textContent=`\u5F53\u524D\u76EE\u6807\uFF1A${ch().text}`}function Iy(){Qt&&(Qt=!1,W.inventory.classList.add("hidden")),en=!en,W.mapOverlay.classList.toggle("hidden",!en),en?(Uo(),document.exitPointerLock?.()):!M.dead&&!M.won&&mt.domElement.requestPointerLock()}function Py(){if(M.difficultyApplied)return;M.difficulty=W.difficulty?.value||"normal";let n=ei[M.difficulty];M.difficultyApplied=!0,W.difficultyHint.textContent=n.label;for(let e of Xf)e.maxHp=e.baseHp*n.hp,e.hp=e.maxHp,e.speedMul=n.speed;M.difficulty==="hard"?zf(2):M.difficulty==="normal"&&zf(1),Hn()}var ji=new $e;bt.add(ji);var In=new $e,zn=new $e,kn=new $e,Rr=new $e;ji.add(In,zn,kn,Rr);var uh=new ae({color:2369579,roughness:.42,metalness:.5}),hh=new ae({color:1382168,roughness:.72}),dh=new ae({color:7162162,roughness:.78});Z(In,.1,.11,.36,uh,.16,-.15,-.42);Z(In,.095,.22,.13,hh,.16,-.28,-.31);Z(In,.055,.055,.09,ue.darkMetal,.16,-.13,-.64);Z(zn,.095,.095,.72,uh,.12,-.16,-.5);Z(zn,.12,.13,.28,dh,.12,-.2,-.2);Z(zn,.075,.075,.47,ue.darkMetal,.12,-.16,-.96);Z(zn,.14,.09,.25,dh,.12,-.19,-.58);Z(kn,.11,.14,.48,uh,.12,-.17,-.5);Z(kn,.1,.24,.13,hh,.12,-.29,-.36);Z(kn,.055,.055,.34,ue.darkMetal,.12,-.16,-.85);Z(kn,.2,.055,.1,hh,.12,-.21,-.57);var Fo=new ae({color:855567,metalness:.55,roughness:.35});Z(In,.105,.035,.29,Fo,.16,-.085,-.43,!1,!1);Z(In,.018,.035,.018,ue.white,.16,-.052,-.55,!1,!1);Z(In,.018,.03,.018,ue.white,.16,-.052,-.3,!1,!1);Z(In,.115,.022,.08,ue.darkMetal,.16,-.105,-.56,!1,!1);Z(In,.115,.022,.08,ue.darkMetal,.16,-.105,-.3,!1,!1);Z(zn,.025,.025,.42,Fo,.12,-.105,-.79,!1,!1);Z(zn,.16,.11,.23,dh,.12,-.18,-.59,!1,!1);Z(zn,.045,.045,.05,ue.white,.12,-.105,-1.18,!1,!1);Z(kn,.16,.035,.23,Fo,.12,-.095,-.5,!1,!1);Z(kn,.035,.065,.04,Fo,.12,-.065,-.63,!1,!1);Z(kn,.035,.065,.04,Fo,.12,-.065,-.39,!1,!1);var Zf=new ae({color:9386032,roughness:.48,metalness:.35});mn(Rr,new A(.1,-.45,-.25),new A(.24,.1,-.78),.026,Zf);mn(Rr,new A(.24,.1,-.78),new A(.34,.15,-.82),.026,Zf);var es=new Mn(16765066,0,2.5,2);es.position.set(.12,-.14,-1);ji.add(es);var $u=new ur,ss={pistol:{name:"M9 PISTOL",mag:12,interval:.175,reload:1.04,noise:5.4,body:41,headMul:2,spreadHip:.006,spreadAds:.0022,auto:!1},shotgun:{name:"PUMP SHOTGUN",mag:5,interval:.78,shellTime:.5,noise:8.2,pellets:8,body:20,headMul:1.35,spreadHip:.068,spreadAds:.042,auto:!1},smg:{name:"MP5 SMG",mag:30,interval:.087,reload:1.35,noise:6.1,body:23,headMul:1.75,spreadHip:.018,spreadAds:.008,auto:!0},crowbar:{name:"CROWBAR",interval:.49,noise:2.2,body:54,range:1.48,auto:!1}},rs=!1,Ll=-10,Ls=0,Fl=0,Rt={active:!1,type:null,timer:0},fh=!1,To=0;function ts(n){!n||!M.owned[n]||(M.current=n,Rt.active=!1,rs=!1,In.visible=n==="pistol",zn.visible=n==="shotgun",kn.visible=n==="smg",Rr.visible=n==="crowbar",Hn())}In.visible=zn.visible=kn.visible=Rr.visible=!1;function Ly(){if(!M.current)return"-- / --";if(M.current==="crowbar")return"\u221E";let n=ss[M.current],e=M.mags[M.current],t=M.current==="shotgun"?M.shells:M.ammo9;return`${e} / ${n.mag} \xB7 ${t}`}function Kf(){W.hit.classList.remove("show"),W.hit.offsetWidth,W.hit.classList.add("show")}function Nf(n){let e=new A;if(bt.getWorldDirection(e),n>0){let t=new A(1,0,0).applyQuaternion(bt.quaternion),i=new A(0,1,0).applyQuaternion(bt.quaternion);e.addScaledVector(t,(He()-.5)*n).addScaledVector(i,(He()-.5)*n).normalize()}return e}function Uf(n,e,t,i=1){let s=Je[_e];$u.set(bt.position,n),$u.far=e;let r=s.enemies.flatMap(a=>a.hitMeshes).filter(a=>a.visible),o=$u.intersectObjects(r,!1);if(!o.length)return!1;for(let a of o){let c=a.object.userData.enemy;if(!c||c.dead)continue;if(Cr(bt.position,n,a.distance,_e))return!1;let l=a.object.userData.part,u=l==="head"?t*i:t;return c.damage(u,n,l),Kf(),!0}return!1}function Dl(n,e){(n==="shotgun"?M.shells:M.ammo9)>0&&(To=Math.max(To,e+.24))}function $f(n){if(!M.current||M.dead||M.won||M.useAction)return;M.lastCombatTime=n;let e=ss[M.current];if(!(n-Ll<e.interval)){if(Rt.active)if(M.current==="shotgun")Rt.active=!1;else return;if(M.current==="pistol"||M.current==="smg"){let t=M.current;if(M.mags[t]<=0){Dl(t,n),t==="pistol"&&Ie("\u5F39\u5323\u5DF2\u7A7A \xB7 \u81EA\u52A8\u6362\u5F39",650);return}M.mags[t]--,M.shots++,Ll=n,Ls=Math.min(t==="smg"?.15:.18,Ls+(t==="smg"?.035:.072)),es.position.set(t==="smg"?.12:.16,-.14,t==="smg"?-.86:-.68),es.intensity=t==="smg"?4.4:5,Ff(t),Nt(G.pos.x,G.pos.z,_e,e.noise,"gun"),Uf(Nf(rs?e.spreadAds:e.spreadHip),36,e.body,e.headMul)&&M.hits++,M.mags[t]===0&&Dl(t,n)}else if(M.current==="shotgun"){if(M.mags.shotgun<=0){Dl("shotgun",n),Ie("\u67AA\u819B\u7A7A\u4E86 \xB7 \u81EA\u52A8\u88C5\u586B",650);return}M.mags.shotgun--,M.shots++,Ll=n,Ls=Math.min(.3,Ls+.16),es.position.set(.12,-.14,-1),es.intensity=8,Ff("shotgun"),Nt(G.pos.x,G.pos.z,_e,e.noise,"shotgun");let t=!1;for(let i=0;i<e.pellets;i++)Uf(Nf(rs?e.spreadAds:e.spreadHip),25,e.body,e.headMul)&&(t=!0);t&&M.hits++,M.mags.shotgun===0&&Dl("shotgun",n)}else{if(Ll=n,Fl=1,Nt(G.pos.x,G.pos.z,_e,e.noise,"melee"),ky(),M.grappledBy){Co(),Ie("\u64AC\u68CD\u5272\u65AD\u7F20\u7ED5",550),Hn();return}let t=new A;bt.getWorldDirection(t);let i=null,s=99;for(let r of Je[_e].enemies){if(r.dead)continue;let o=r.g.position.x-G.pos.x,a=r.g.position.z-G.pos.z,c=Math.hypot(o,a);c>e.range||(o*t.x+a*t.z)/Math.max(.001,c)<.4||Cr(G.pos,new A(o,0,a).normalize(),c-.1,_e)||c<s&&(i=r,s=c)}i&&(i.damage(e.body,t,"body"),M.hits++,Kf(),zy(),M.grappledBy===i&&Co())}Hn()}}function Jf(){if(!M.current||Rt.active||M.dead||M.useAction)return;let n=M.current;if(n!=="crowbar"){if(n==="pistol"||n==="smg"){let e=ss[n];if(M.mags[n]>=e.mag||M.ammo9<=0)return;Rt={active:!0,type:n,timer:e.reload},Ie(n==="smg"?"\u66F4\u6362 SMG \u5F39\u5323\u2026":"\u66F4\u6362\u5F39\u5323\u2026",650)}else if(n==="shotgun"){if(M.mags.shotgun>=5||M.shells<=0)return;Rt={active:!0,type:"shotgun",timer:ss.shotgun.shellTime},Ie("\u9010\u53D1\u88C5\u586B\u9730\u5F39\u2026",650)}}}function Dy(n,e){if(To&&e>=To&&!Rt.active&&(To=0,Jf()),!!Rt.active&&(Rt.timer-=n,!(Rt.timer>0))){if(Rt.type==="pistol"||Rt.type==="smg"){let t=ss[Rt.type],i=t.mag-M.mags[Rt.type],s=Math.min(i,M.ammo9);M.mags[Rt.type]+=s,M.ammo9-=s,Rt.active=!1,Of()}else M.mags.shotgun<5&&M.shells>0?(M.mags.shotgun++,M.shells--,Of(),Rt.timer=ss.shotgun.shellTime):Rt.active=!1;Hn()}}function jf(n){M.useAction||M.dead||M.hp>=100||n==="bandage"&&M.bandages<=0||n==="medkit"&&M.medkits<=0||(M.useAction={type:n,t:0,duration:n==="bandage"?1.35:3.25},W.actionText.textContent=n==="bandage"?"\u5305\u624E\u4F24\u53E3\u2026":"\u4F7F\u7528\u533B\u7597\u5305\u2026",W.actionProgress.classList.remove("hidden"))}function Ny(n="\u6CBB\u7597\u88AB\u6253\u65AD"){M.useAction&&(M.useAction=null,W.actionProgress.classList.add("hidden"),Ie(n,650))}function Uy(n){if(M.useAction&&(M.useAction.t+=n,W.actionFill.style.width=`${Ni(M.useAction.t/M.useAction.duration*100,0,100)}%`,M.useAction.t>=M.useAction.duration)){let e=M.useAction.type;e==="bandage"?(M.bandages--,M.hp=Math.min(100,M.hp+28)):(M.medkits--,M.hp=Math.min(100,M.hp+62)),M.useAction=null,W.actionProgress.classList.add("hidden"),Hy(),Ie(e==="bandage"?"\u7EF7\u5E26 +28 HP":"\u533B\u7597\u5305 +62 HP"),Hn()}}function Fy(){jf("bandage")}function Oy(){jf("medkit")}var Qi=null;function By(){Qi||(Qi=new(window.AudioContext||window.webkitAudioContext)),Qi.resume?.()}function mi(n,e,t,i,s="square"){if(!Qi)return;let r=Qi.currentTime,o=Qi.createOscillator(),a=Qi.createGain();o.type=s,o.frequency.setValueAtTime(n,r),o.frequency.exponentialRampToValueAtTime(Math.max(10,e),r+t),a.gain.setValueAtTime(i,r),a.gain.exponentialRampToValueAtTime(.001,r+t),o.connect(a).connect(Qi.destination),o.start(r),o.stop(r+t+.01)}function Ff(n){n==="shotgun"?(mi(95,30,.16,.24,"square"),mi(48,25,.2,.12,"sawtooth")):mi(150,55,.09,.16,"square")}function zy(){mi(260,120,.06,.05,"triangle")}function bo(){mi(75,52,.32,.024,"sawtooth")}function ky(){mi(120,65,.08,.06,"triangle")}function Of(){mi(440,260,.04,.022,"square")}function Hy(){mi(520,720,.1,.025,"sine")}function Nt(n,e,t,i,s="noise"){for(Eo.push({x:n,z:e,floor:t,radius:i,kind:s,time:performance.now()/1e3});Eo.length>24;)Eo.shift()}function Vy(n,e){if(n.floor!==e.floor)return 0;let t=e.g.position.x-n.x,i=e.g.position.z-n.z,s=Math.hypot(t,i);if(s<.05)return n.radius;let r=new A(t,0,i).normalize(),o=n.radius;return Cr(new A(n.x,1.15,n.z),r,Math.max(0,s-.12),n.floor)&&(o*=.38),n.kind==="door"&&(o*=.86),n.kind==="sprint"&&(o*=1.08),o}var Tr=[],wr=[];function Xl(n,e,t,i=16757342){let s=new $e;s.position.set(e,.35,t),Je[n].root.add(s);let r=new Kt({color:i,transparent:!0,opacity:.55}),o=new ze(new An(.35,12,8),r);s.add(o);let a=new Mn(i,9,5,2);s.add(a);let c=0;wr.push({kind:"fx",floor:n,g:s,t:0,duration:.32,update(l){this.t+=l,o.scale.setScalar(1+this.t*8),r.opacity=Math.max(0,.55-this.t*1.6),a.intensity=Math.max(0,9-this.t*28)}})}function Ju(n){if(M.dead||M.won||M.useAction)return;if(n==="grenade"&&M.grenades<=0){Ie("\u6CA1\u6709\u624B\u96F7");return}if(n==="molotov"&&M.molotovs<=0){Ie("\u6CA1\u6709\u71C3\u70E7\u74F6");return}if(n==="decoy"&&M.decoys<=0){Ie("\u6CA1\u6709\u73BB\u7483\u74F6\u8BF1\u9975");return}n==="grenade"?M.grenades--:n==="molotov"?M.molotovs--:M.decoys--;let e=new A;bt.getWorldDirection(e);let t=new $e,i;if(n==="grenade"){let s=new ae({color:5660759,roughness:.55,metalness:.35});i=new ze(new An(.08,10,8),s)}else if(n==="molotov"){let s=new ae({color:8014380,roughness:.55});i=new ze(new Fn(.045,.055,.22,10),s)}else{let s=new zt({color:10337728,roughness:.18,transparent:!0,opacity:.62});i=new ze(new Fn(.043,.052,.2,10),s)}t.add(i),t.position.copy(bt.position).addScaledVector(e,.45),Je[_e].root.add(t),Tr.push({kind:n,floor:_e,g:t,vel:e.multiplyScalar(n==="grenade"?8:n==="molotov"?7:7.8).add(new A(0,2.1,0)),t:0,fuse:n==="grenade"?1.85:99}),Nt(G.pos.x,G.pos.z,_e,1.8,"throw"),Hn()}function Gy(n){mi(980,180,.1,.055,"triangle"),Nt(n.g.position.x,n.g.position.z,n.floor,7.2,"decoy"),Xl(n.floor,n.g.position.x,n.g.position.z,10145750),Ie("\u73BB\u7483\u74F6\u788E\u88C2 \xB7 \u9644\u8FD1\u611F\u67D3\u8005\u4F1A\u53BB\u8C03\u67E5",900)}function Wy(n){mi(75,22,.26,.24,"sawtooth"),Xl(n.floor,n.g.position.x,n.g.position.z),Nt(n.g.position.x,n.g.position.z,n.floor,12,"explosion");for(let e of Je[n.floor].enemies){if(e.dead)continue;let t=Math.hypot(e.g.position.x-n.g.position.x,e.g.position.z-n.g.position.z);t<4.2&&!Cr(new A(n.g.position.x,1,n.g.position.z),new A(e.g.position.x-n.g.position.x,0,e.g.position.z-n.g.position.z).normalize(),Math.max(0,t-.2),n.floor)&&e.damage(Math.max(35,185*(1-t/5)),new A,t<1.8?"head":"body")}if(n.floor===_e){let e=Math.hypot(G.pos.x-n.g.position.x,G.pos.z-n.g.position.z);e<3&&Io(Math.max(6,38*(1-e/3.2)))}}function Xy(n,e,t){let i=new $e;i.position.set(e,.035,t),Je[n].root.add(i);for(let s=0;s<7;s++){let r=new Kt({color:s%2?16739109:16757295,transparent:!0,opacity:.72}),o=new ze(new lr(.1+He()*.08,.3+He()*.26,7),r);o.position.set((He()-.5)*1.6,.16,(He()-.5)*1.6),i.add(o)}wr.push({kind:"fire",floor:n,g:i,x:e,z:t,r:1.45,t:0,duration:8.2,tick:0}),Nt(e,t,n,8,"fire")}function qy(n,e,t){let i=new $e;i.position.set(e,.025,t),Je[n].root.add(i);let s=new Kt({color:9364301,transparent:!0,opacity:.6}),r=new ze(new Fn(1.05,1.12,.025,24),s);i.add(r);let o=new Mn(8640074,1.4,3,2);o.position.y=.3,i.add(o),wr.push({kind:"acid",floor:n,g:i,x:e,z:t,r:1.12,t:0,warmup:.45,duration:6.5,tick:0})}function Yy(n){for(let e=Tr.length-1;e>=0;e--){let t=Tr[e];if(t.t+=n,t.vel.y-=9.8*n,t.g.position.addScaledVector(t.vel,n),t.g.position.y<.09){if(t.g.position.y=.09,t.kind==="decoy"&&t.t>.18){Gy(t),Je[t.floor].root.remove(t.g),Tr.splice(e,1);continue}if(t.vel.y=Math.abs(t.vel.y)*.28,t.vel.x*=.72,t.vel.z*=.72,t.kind==="molotov"&&t.t>.25){Xy(t.floor,t.g.position.x,t.g.position.z),Je[t.floor].root.remove(t.g),Tr.splice(e,1);continue}}t.kind==="grenade"&&t.t>=t.fuse&&(Wy(t),Je[t.floor].root.remove(t.g),Tr.splice(e,1))}}function Zy(n){for(let e=wr.length-1;e>=0;e--){let t=wr[e];if(t.t+=n,t.update&&t.update(n),(t.kind==="fire"||t.kind==="acid")&&t.floor===_e&&(!t.warmup||t.t>=t.warmup)&&(t.tick-=n,t.tick<=0)){t.tick=.24;for(let s of Je[t.floor].enemies){if(s.dead)continue;Math.hypot(s.g.position.x-t.x,s.g.position.z-t.z)<t.r&&s.damage(t.kind==="fire"?11:7,new A,"body",!0)}Math.hypot(G.pos.x-t.x,G.pos.z-t.z)<t.r&&Io(t.kind==="fire"?5:4)}t.t>t.duration&&(Je[t.floor].root.remove(t.g),wr.splice(e,1))}}var Ky={walker:{hp:112,speed:2.15,radius:.35,damage:15,attackRange:.78,attackCd:.78,sight:9,shirt:3753285,scale:1},runner:{hp:72,speed:3.6,radius:.3,damage:12,attackRange:.76,attackCd:.52,sight:11,shirt:9252907,scale:.9},dormant:{hp:102,speed:2.3,radius:.34,damage:16,attackRange:.78,attackCd:.72,sight:8,shirt:3686718,scale:.98},corrosive:{hp:88,speed:1.75,radius:.35,damage:9,attackRange:.75,attackCd:.9,sight:10.5,shirt:7178045,scale:.98},volatile:{hp:92,speed:1.62,radius:.37,damage:13,attackRange:.78,attackCd:.92,sight:9.5,shirt:9072956,scale:1.02},grappler:{hp:120,speed:2.1,radius:.35,damage:12,attackRange:.8,attackCd:.88,sight:11,shirt:6178671,scale:1},heavy:{hp:680,speed:1.88,radius:.36,damage:34,attackRange:.94,attackCd:.92,sight:12,shirt:5062712,scale:1}};function $y(n){if(Xl(n.floor,n.g.position.x,n.g.position.z,14136140),Nt(n.g.position.x,n.g.position.z,n.floor,8,"burst"),n.floor===_e){let e=Math.hypot(G.pos.x-n.g.position.x,G.pos.z-n.g.position.z);e<2.5&&Io(Math.max(5,30*(1-e/2.7)))}for(let e of Je[n.floor].enemies){if(e===n||e.dead)continue;let t=Math.hypot(e.g.position.x-n.g.position.x,e.g.position.z-n.g.position.z);t<2.2&&e.damage(55*(1-t/2.5),new A,"body",!0)}}function Qe(n,e,t,i,s=0,r={}){let o=Je[n],a=Ky[e],c=new $e;c.position.set(t,e==="dormant"?-.1:0,i),c.rotation.y=s,o.root.add(c);let l=a.scale,u=e==="corrosive"?9546079:e==="volatile"?11115363:e==="grappler"?9205908:e==="runner"?10129269:9148792,h=new ae({color:u,roughness:.95}),d=new ae({color:a.shirt,roughness:.93}),f=new ae({color:2435885,roughness:.95}),g=e==="heavy"?.52:.38,x=Z(c,g*l,.62*l,.23*l,d,0,1.08*l,0),m=new ze(new An(.17*l,12,9),h);if(m.position.set(0,1.52*l,.01),m.castShadow=!0,c.add(m),e==="heavy"&&(Z(c,.72,.2,.28,d,0,1.3,0),Z(c,.76,.08,.3,new ae({color:2894118,roughness:.88}),0,1.46,0),c.rotation.x=.03),e==="runner"&&(c.rotation.x=.16,Z(c,.44,.055,.25,new ae({color:10895928,emissive:4920592,emissiveIntensity:.35}),0,1.29,.02,!1,!1)),e==="corrosive"){let U=new ze(new An(.28,14,9),ue.acid);U.scale.set(1.36,1.08,.78),U.position.set(0,1.08,-.1),c.add(U);for(let q of[-.18,0,.18]){let J=new ze(new An(.035,8,6),ue.acid);J.position.set(q,.72,.08),c.add(J)}let k=new Mn(8837964,2.2,2.1,2);k.position.set(0,1.5,.2),c.add(k)}if(e==="volatile"){let U=new ae({color:11967298,emissive:5981717,emissiveIntensity:.8,roughness:.65}),k=new ze(new An(.31,12,9),U);k.scale.set(1.25,1.05,.82),k.position.set(0,1.03,.02),c.add(k)}let p=Z(c,.14*l,.58*l,.15*l,f,-.105*l,.47*l,0),w=Z(c,.14*l,.58*l,.15*l,f,.105*l,.47*l,0),E=new $e,y=new $e,R=e==="grappler"?1.45:1;E.position.set(-.235*l,1.35*l,0),y.position.set(.235*l,1.35*l,0),c.add(E,y);let C=Z(E,.11*l,.48*l*R,.12*l,h,0,-.24*l*R,0),L=Z(y,.11*l,.48*l*R,.12*l,h,0,-.24*l*R,0),F=new Kt({color:e==="corrosive"?12058457:12068127});for(let U of[-.06,.06]){let k=new ze(new An(.016*l,6,4),F);k.position.set(U*l,1.56*l,.155*l),c.add(k)}let b=d.clone();b.color.offsetHSL(0,0,-.035);for(let U of[-1,1]){let k=new ze(new An((e==="heavy"?.17:.115)*l,8,6),b);k.scale.set(1.2,.78,1),k.position.set(U*(e==="heavy"?.32:.225)*l,1.34*l,0),c.add(k)}let S=new ze(new ai(.2*l,.07*l,.14*l),h);if(S.position.set(0,1.43*l,.055*l),S.rotation.x=.1,c.add(S),e==="runner"){let U=new ze(new lr(.08,.42,7),new ae({color:6643277,roughness:1}));U.rotation.x=Math.PI/2,U.position.set(0,1.2,-.19),c.add(U)}if(e==="heavy")for(let U of[-1,1]){let k=new ze(new ai(.22,.16,.3),new ae({color:3156775,roughness:.95}));k.position.set(U*.31,1.36,0),k.rotation.z=U*.16,c.add(k)}let P={floor:n,type:e,def:a,g:c,torso:x,head:m,legL:p,legR:w,armL:C,armR:L,armLP:E,armRP:y,baseHp:a.hp,maxHp:a.hp,hp:a.hp,speedMul:1,dead:!1,state:e==="dormant"?"dormant":r.aggressive?"chase":"idle",alerted:!!r.aggressive,phase:He()*6,lastAttack:-9,lastSeen:-9,lastHeard:-9,lastNoiseScan:-9,searchPos:new A(t,0,i),deathT:0,hitMeshes:[],doorCooldown:0,path:[],pathI:0,pathTimer:0,stuckT:0,lastPos:new A(t,0,i),burstT:0,burstCd:He()*1.5,spitCd:1+He()*2,grappleCd:2+He()*2,chargeCd:2+He()*2,chargeT:0,stunT:0,isBoss:!!r.boss,directorReserve:!!r.reserve};if(e==="dormant"&&(c.rotation.z=1.12,c.position.y=-.38,E.rotation.x=-.85,y.rotation.x=.55),e==="grappler"){let U=new ae({color:8347029,emissive:2823480,emissiveIntensity:.55,roughness:.75});mn(c,new A(-.24,1.24,.02),new A(-.5,.58,.16),.025,U),mn(c,new A(.24,1.24,.02),new A(.52,.54,.14),.025,U)}for(let[U,k]of[[m,"head"],[x,"body"],[p,"body"],[w,"body"],[C,"body"],[L,"body"]])U.userData={enemy:P,part:k},U.castShadow=!0,P.hitMeshes.push(U);if(P.damage=(U,k,q="body",J=!1)=>{P.dead||(P.hp-=U,P.alerted=!0,P.state="chase",P.lastSeen=performance.now()/1e3,typeof G<"u"&&P.searchPos.set(G.pos.x,0,G.pos.z),e==="dormant"&&(c.rotation.z=0,c.position.y=0),P.hp<=0&&(P.dead=!0,P.state="dead",M.kills++,M.grappledBy===P&&Co(),P.type==="volatile"&&$y(P),P.isBoss?(M.bossDefeated=!0,M.accessCard=!0,pt.westPortal.locked=!1,pt.eastPortal.locked=!1,W.bossHud.classList.add("hidden"),Ie("\u91CD\u578B\u611F\u67D3\u8005\u5012\u4E0B \xB7 \u83B7\u5F97\u5BBF\u820D\u95E8\u7981\u5361",2200),ns()):J||Ie(e==="corrosive"?"\u8150\u8680\u611F\u67D3\u8005\u5DF2\u51FB\u5012":e==="grappler"?"\u7F20\u7ED5\u611F\u67D3\u8005\u5DF2\u51FB\u5012":e==="volatile"?"\u7206\u56CA\u611F\u67D3\u8005\u7206\u88C2":"\u611F\u67D3\u8005\u5DF2\u51FB\u5012",700)))},M.difficultyApplied){let U=ei[M.difficulty];P.maxHp=P.baseHp*U.hp,P.hp=P.maxHp,P.speedMul=U.speed}return o.enemies.push(P),Xf.push(P),P}function Bf(n,e,t){let i=n.nav[0],s=1/0;for(let r of n.nav){let o=(r.x-e)**2+(r.z-t)**2;o<s&&(s=o,i=r)}return i}function Jy(n){return!n.door||!n.door.locked}function jy(n,e,t,i,s){let r=Bf(n,e,t),o=Bf(n,i,s);if(r.id===o.id)return[o];let a=[r.id],c=new Map([[r.id,-1]]);for(;a.length;){let h=a.shift();for(let d of n.navEdges.get(h)||[]){if(c.has(d))continue;let f=n.nav[d];if(Jy(f)){if(c.set(d,h),d===o.id){a.length=0;break}a.push(d)}}}if(!c.has(o.id))return[r];let l=[],u=o.id;for(;u!==-1;)l.push(u),u=c.get(u);return l.reverse(),l.map(h=>n.nav[h])}function Qf(n,e,t,i){let s=e.def.radius;for(let r of n.colliders){if(r.enabled===!1)continue;let o=Math.max(r.minX,Math.min(t,r.maxX)),a=Math.max(r.minZ,Math.min(i,r.maxZ)),c=t-o,l=i-a;if(c*c+l*l<s*s)return{blocked:!0,door:null}}for(let r of n.doors){if(Math.abs(r.angle)>.72)continue;let o=r.room.x+r.room.doorOffset,a=r.room.nearZ,c=Math.max(o-D.doorW*.47,Math.min(t,o+D.doorW*.47)),l=t-c,u=i-a;if(l*l+u*u<s*s)return{blocked:!0,door:r}}for(let r of n.enemies){if(r===e||r.dead||e.type==="heavy")continue;let o=Math.max(.24,s+r.def.radius-.3),a=t-r.g.position.x,c=i-r.g.position.z;if(a*a+c*c<o*o)return{blocked:!0,door:null}}return{blocked:!1}}function Cr(n,e,t,i){let s=Je[i],r=Math.ceil(Math.max(0,t)/.09);for(let o=1;o<r;o++){let a=o*.09,c=n.x+e.x*a,l=n.z+e.z*a;for(let u of s.colliders)if(c>u.minX&&c<u.maxX&&l>u.minZ&&l<u.maxZ)return!0;for(let u of s.doors){if(Math.abs(u.angle)>.6)continue;let h=u.room.x+u.room.doorOffset,d=u.room.nearZ;if(Math.abs(c-h)<D.doorW*.5&&Math.abs(l-d)<.095)return!0}for(let u of s.portals){if(Math.abs(u.angle)>.6)continue;let h=u.side==="east"?D.corridorL/2:-D.corridorL/2;if(Math.abs(c-h)<.1&&Math.abs(l)<D.doorW*.5)return!0}}return!1}function Qy(n){if(n.floor!==_e||n.dead)return!1;let e=G.pos.x-n.g.position.x,t=G.pos.z-n.g.position.z,i=Math.hypot(e,t),s=!!M.powerZones[n.floor],r=s?1:M.flashlight?1.08:.62;if(i>n.def.sight*r)return!1;let o=new A(e,0,t).normalize(),a=new A(Math.sin(n.g.rotation.y),0,Math.cos(n.g.rotation.y));return i>2.5&&a.dot(o)<-.18?!1:!Cr(new A(n.g.position.x,1.3,n.g.position.z),o,Math.max(0,i-.22),n.floor)}function ep(n,e){return!e||e.locked||n.doorCooldown>0?!1:(e.open=!0,e.fastMotion=!0,e.target=-e.room.side*Math.PI*.52,n.doorCooldown=.45,Nt(e.room.x+e.room.doorOffset,e.room.nearZ,n.floor,3.1,"door-fast"),!0)}function nh(n,e,t,i,s=1){let r=Je[n.floor],o=e-n.g.position.x,a=t-n.g.position.z,c=Math.hypot(o,a);if(c<.06)return!0;let l=n.def.speed*n.speedMul*s,u=o/c*l,h=a/c*l,d=[[u,h],[u*.72,h*.72],[h*.55,-u*.55],[-h*.55,u*.55],[u,0],[0,h]];for(let[f,g]of d){let x=n.g.position.x+f*i,m=n.g.position.z+g*i,p=Qf(r,n,x,m);if(!p.blocked)return n.g.position.x=x,n.g.position.z=m,!0;if(p.door&&ep(n,p.door))return!1}return!1}function ev(n,e,t,i,s=1){let r=Je[n.floor];n.pathTimer-=i,(n.pathTimer<=0||!n.path.length)&&(n.path=jy(r,n.g.position.x,n.g.position.z,e,t),n.pathI=Math.min(1,n.path.length-1),n.pathTimer=.32+He()*.12);let o=n.path[n.pathI]||{x:e,z:t};Math.hypot(o.x-n.g.position.x,o.z-n.g.position.z)<.28&&n.pathI<n.path.length-1&&(n.pathI++,o=n.path[n.pathI]),o?.door&&!o.door.open&&!o.door.locked&&Math.hypot(o.x-n.g.position.x,o.z-n.g.position.z)<.75&&ep(n,o.door);let a=n.pathI>=n.path.length-1?{x:e,z:t}:o,c=nh(n,a.x,a.z,i,s);if(Math.hypot(n.g.position.x-n.lastPos.x,n.g.position.z-n.lastPos.z)<.012?n.stuckT+=i:(n.stuckT=0,n.lastPos.set(n.g.position.x,0,n.g.position.z)),n.stuckT>.65){n.pathTimer=0,n.stuckT=0;let u=He()*Math.PI*2;nh(n,n.g.position.x+Math.cos(u),n.g.position.z+Math.sin(u),i,1.2)}return c}function tv(n){if(M.grappledBy||M.dead)return;M.grappledBy=n,M.slowUntil=performance.now()/1e3+1.65;let e=new Zi({color:12159699,transparent:!0,opacity:.78}),t=new $t().setFromPoints([new A,new A]),i=new wi(t,e);Je[n.floor].root.add(i),M.grappleLine=i,n.grappleCd=5.5,Ie("\u88AB\u7F20\u4F4F\u4E86\uFF01\u51FB\u6740\u7F20\u7ED5\u4F53\u6216\u7528\u64AC\u68CD\u6323\u8131",1200)}function Co(){M.grappleLine&&(Je[_e]?.root.remove(M.grappleLine),M.grappleLine=null),M.grappledBy=null,M.slowUntil=0}function nv(n){if(!M.grappledBy||M.grappledBy.dead||M.grappledBy.floor!==_e||n>M.slowUntil){Co();return}let e=M.grappledBy;if(Math.hypot(e.g.position.x-G.pos.x,e.g.position.z-G.pos.z)>7){Co();return}if(M.grappleLine){let t=M.grappleLine.geometry.attributes.position.array;t[0]=e.g.position.x,t[1]=1.25,t[2]=e.g.position.z,t[3]=G.pos.x,t[4]=1.1,t[5]=G.pos.z,M.grappleLine.geometry.attributes.position.needsUpdate=!0}}function iv(n,e,t){if(!M.started||!e||t>8.5)return;let i={runner:["Runner \xB7 \u5FEB\u901F\u611F\u67D3\u8005","\u4F1A\u7A81\u7136\u77ED\u8DDD\u79BB\u51B2\u523A\uFF0C\u4F18\u5148\u5904\u7406\uFF0C\u522B\u8BA9\u5B83\u8D34\u8138\u3002"],dormant:["Dormant \xB7 \u6F5C\u4F0F\u611F\u67D3\u8005","\u5012\u5730\u4E0D\u4EE3\u8868\u6B7B\u4EA1\u3002\u9760\u8FD1\u3001\u641C\u7D22\u6216\u5236\u9020\u566A\u97F3\u90FD\u53EF\u80FD\u60CA\u9192\u5B83\u3002"],corrosive:["Corrosive \xB7 \u8150\u8680\u4F53","\u7EFF\u8272\u56CA\u4F53\u5F88\u9192\u76EE\uFF1B\u5B83\u4F1A\u5411\u4F60\u7684\u7AD9\u4F4D\u55B7\u5410\u9178\u6DB2\uFF0C\u903C\u4F60\u79BB\u5F00\u5B89\u5168\u89D2\u843D\u3002"],grappler:["Grappler \xB7 \u7F20\u7ED5\u4F53","\u5F02\u5E38\u957F\u81C2\u4F1A\u9650\u5236\u79FB\u52A8\u3002\u51FB\u6740\u5B83\uFF0C\u6216\u7528\u64AC\u68CD\u5FEB\u901F\u6323\u8131\u3002"],volatile:["Volatile \xB7 \u7206\u56CA\u611F\u67D3\u8005","\u8179\u90E8\u53D1\u4EAE\u3002\u6B7B\u4EA1\u4F1A\u7206\u88C2\uFF0C\u9760\u592A\u8FD1\u4F1A\u53D7\u4F24\uFF0C\u4E5F\u80FD\u70B8\u4F24\u5176\u5B83\u611F\u67D3\u8005\u3002"],heavy:["HEAVY \xB7 \u91CD\u578B\u611F\u67D3\u8005","\u4F1A\u51B2\u649E\u5E76\u5728\u649E\u5899\u540E\u786C\u76F4\u3002\u9730\u5F39\u67AA\u548C\u7206\u70B8\u7269\u6700\u9002\u5408\u5904\u7406\u5B83\u3002"]}[n.type];i&&jt("special-"+n.type,i[0],i[1],4800)}function sv(n,e,t){if(n.floor!==_e)return;if(n.dead){n.deathT+=e,n.g.rotation.z=fn(n.g.rotation.z,-Math.PI*.47,5,e),n.g.position.y=fn(n.g.position.y,-.31,3,e);return}n.doorCooldown=Math.max(0,n.doorCooldown-e),n.burstCd-=e,n.spitCd-=e,n.grappleCd-=e,n.chargeCd-=e,n.stunT=Math.max(0,n.stunT-e);let i=G.pos.x-n.g.position.x,s=G.pos.z-n.g.position.z,r=Math.hypot(i,s),o=Qy(n),a=new A(i,0,s).normalize();iv(n,o,r);let c=n.lastNoiseScan;for(let g=Eo.length-1;g>=0;g--){let x=Eo[g];if(x.floor!==n.floor||x.time<=n.lastNoiseScan)continue;c=Math.max(c,x.time);let m=Math.hypot(x.x-n.g.position.x,x.z-n.g.position.z),p=Vy(x,n);if(m<p){if(n.lastHeard=x.time,n.searchPos.set(x.x,0,x.z),n.state==="dormant"&&m>2&&x.kind!=="gun"&&x.kind!=="shotgun"&&x.kind!=="explosion"&&x.kind!=="decoy")continue;n.alerted=!0,n.state!=="chase"&&(n.state="investigate");break}}if(n.lastNoiseScan=c,o&&(n.alerted=!0,n.state="chase",n.lastSeen=t,n.searchPos.set(G.pos.x,0,G.pos.z),n.type==="dormant"&&(n.g.rotation.z=0,n.g.position.y=0,bo())),n.state==="dormant"){r<1.7&&o&&(n.state="chase",n.alerted=!0,n.g.rotation.z=0,n.g.position.y=0,bo());return}if(!n.alerted)return;if(n.phase+=e*(8+n.def.speed*1.8),n.legL.rotation.x=Math.sin(n.phase)*.42,n.legR.rotation.x=-Math.sin(n.phase)*.42,n.armLP.rotation.x=-Math.sin(n.phase)*.22,n.armRP.rotation.x=Math.sin(n.phase)*.22,n.stunT>0){n.g.rotation.z=Math.sin(t*10)*.04;return}else n.g.rotation.z=fn(n.g.rotation.z,0,8,e);let l=n.searchPos.x,u=n.searchPos.z;n.state==="chase"&&(l=G.pos.x,u=G.pos.z,!o&&t-n.lastSeen>3.1&&(n.state="investigate"));let h=Math.atan2(l-n.g.position.x,u-n.g.position.z);if(n.g.rotation.y+=ty(n.g.rotation.y,h)*Math.min(1,e*8),n.type==="runner"&&n.state==="chase"&&o&&r>1.3&&r<6.5&&n.burstCd<=0&&(n.burstT=.55,n.burstCd=2+He()*1.2),n.burstT>0){n.burstT-=e,nh(n,G.pos.x,G.pos.z,e,1.75);return}if(n.type==="corrosive"&&n.state==="chase"&&o&&r>2.1&&r<7.3&&n.spitCd<=0){n.spitCd=4.1+He()*1,qy(n.floor,G.pos.x+G.vel.x*.22,G.pos.z+G.vel.z*.22),Nt(n.g.position.x,n.g.position.z,n.floor,4,"spit"),bo();return}if(n.type==="grappler"&&n.state==="chase"&&o&&r>2.3&&r<6.2&&n.grappleCd<=0&&!M.grappledBy){n.grappleCd=5.6,tv(n);return}if(n.type==="heavy"&&n.isBoss&&n.state==="chase"&&o&&r>2.4&&r<8&&n.chargeCd<=0&&(n.chargeT=.85,n.chargeCd=n.hp/n.maxHp<.45?3.2:4.8,n.chargeDir=a.clone(),Ie("HEAVY \u51B2\u649E\uFF01",500)),n.type==="heavy"&&n.chargeT>0){n.chargeT-=e;let g=n.g.position.x+n.chargeDir.x*6*e,x=n.g.position.z+n.chargeDir.z*6*e;if(Qf(Je[n.floor],n,g,x).blocked){n.chargeT=0,n.stunT=1.35,Ie("HEAVY \u649E\u5899\u786C\u76F4",650);return}n.g.position.x=g,n.g.position.z=x,r<1.05&&(n.chargeT=0,Io(34),n.stunT=.55);return}let d=r>.001&&!Cr(new A(n.g.position.x,1.12,n.g.position.z),a,Math.max(0,r-.25),n.floor);if(n.state==="chase"&&r<=n.def.attackRange&&d){t-n.lastAttack>n.def.attackCd&&(n.lastAttack=t,n.armLP.rotation.x=-1.18,n.armRP.rotation.x=-1.08,Io(n.def.damage*ei[M.difficulty].damage),bo());return}if(n.state==="investigate"&&Math.hypot(l-n.g.position.x,u-n.g.position.z)<.42){t-n.lastHeard>2&&(n.state="idle");return}let f=n.type==="heavy"&&n.hp/n.maxHp<.45?1.34:1;ev(n,l,u,e,f)}Qe(5,"walker",-4.8,.3,0);Qe(5,"runner",5.4,-.45,Math.PI,{reserve:!0});{let n=ot(Fi.roomByLabel[504],.08,4.1);Qe(5,"dormant",n.x,n.z,0)}Qe(4,"walker",-.65,.18,Math.PI,{aggressive:!0});{let n=ot(Lt.roomByLabel[417],.05,3.7);Qe(4,"walker",n.x,n.z,0)}{let n=ot(Lt.roomByLabel[419],.05,.95);Qe(4,"dormant",n.x,n.z,Math.PI)}{let n=ot(Lt.roomByLabel[422],-.15,4.4);Qe(4,"runner",n.x,n.z,0)}Qe(3,"walker",-4.6,.3,0);Qe(3,"runner",4.3,-.25,Math.PI);{let n=ot(pt.roomByLabel.\u6D17\u6F31\u95F4,.05,2.55);Qe(3,"corrosive",n.x,n.z,Math.PI)}{let n=ot(pt.roomByLabel[316],.15,4.15);Qe(3,"dormant",n.x,n.z,0)}Qe(2,"walker",-5.1,.2,0);Qe(2,"runner",3.9,-.25,Math.PI);Qe(2,"volatile",1.8,.62,Math.PI);{let n=ot(Wt.roomByLabel.\u6D17\u8863\u95F4,.05,2.2);Qe(2,"corrosive",n.x,n.z,Math.PI)}{let n=ot(Wt.roomByLabel[216],.1,1);Qe(2,"dormant",n.x,n.z,0)}{let n=ot(Wt.roomByLabel.\u50A8\u7269\u95F4,0,2);Qe(2,"grappler",n.x,n.z,Math.PI)}Qe(1,"walker",-4.9,.25,0);Qe(1,"runner",4.6,-.3,Math.PI);Qe(1,"volatile",1.2,.72,Math.PI,{reserve:!0});{let n=ot(Oi.roomByLabel[101],.08,3.8);Qe(1,"dormant",n.x,n.z,0)}{let n=ot(Lt.roomByLabel[424],.1,4.7);Qe(4,"dormant",n.x,n.z,0,{reserve:!0})}{let n=ot(pt.roomByLabel[318],-.1,4.3);Qe(3,"runner",n.x,n.z,Math.PI,{reserve:!0})}{let n=ot(pt.roomByLabel.\u536B\u751F\u95F4,.1,2.7);Qe(3,"volatile",n.x,n.z,Math.PI,{reserve:!0})}{let n=ot(Wt.roomByLabel[218],0,4.2);Qe(2,"dormant",n.x,n.z,0,{reserve:!0})}{let n=ot(Wt.roomByLabel.\u6DCB\u6D74\u95F4,.1,2.6);Qe(2,"corrosive",n.x,n.z,Math.PI,{reserve:!0})}function zf(n){n>=1&&(Qe(5,"walker",1.6,.68,Math.PI),Qe(3,"walker",1.7,.7,Math.PI),Qe(2,"walker",.8,-.72,0),Qe(1,"walker",-1.8,.7,Math.PI)),n>=2&&(Qe(4,"runner",2.9,.72,Math.PI),Qe(3,"corrosive",5,.7,Math.PI),Qe(2,"grappler",-2.6,.68,0),Qe(1,"runner",6.1,.68,Math.PI))}function rv(){if(M.bossStarted)return;M.bossStarted=!0,pt.eastPortal.locked=!0,pt.eastPortal.lockType="boss",pt.eastPortal.open=!1,pt.eastPortal.target=0,pt.westPortal.locked=!0,pt.westPortal.lockType="boss",pt.westPortal.open=!1,pt.westPortal.target=0,Ar("HEAVY \xB7 3F \u5C01\u9501\u6218"),Xl(3,-6.3,.05,12166538);let n=Qe(3,"heavy",-6.3,0,Math.PI/2,{aggressive:!0,boss:!0});n.maxHp=n.baseHp*ei[M.difficulty].hp,n.hp=n.maxHp,n.speedMul=ei[M.difficulty].speed,M.boss=n,W.bossHud.classList.remove("hidden"),W.bossName.textContent="HEAVY \xB7 3F \u5C01\u9501\u4F53",jt("heavy-event","BOSS \u6218\uFF1AHEAVY","\u5B83\u4E0D\u4F1A\u518D\u85CF\u5728\u623F\u95F4\u91CC\u3002\u4FDD\u6301\u8D70\u5ECA\u673A\u52A8\uFF0C\u8BF1\u5BFC\u51B2\u649E\u5899\u9762\uFF1B\u649E\u5899\u540E\u662F\u9730\u5F39\u67AA\u548C\u624B\u96F7\u7684\u8F93\u51FA\u7A97\u53E3\u3002",5200),Ie("\u5899\u540E\u4F20\u6765\u5DE8\u54CD\u2014\u2014\u91CD\u578B\u611F\u67D3\u8005\u649E\u8FDB\u4E86\u4E3B\u8D70\u5ECA\uFF01",2e3),Nt(-6.3,0,3,6.8,"boss");for(let e of[-7.6,-4.8])Qe(3,"walker",e,.78*(e>-4?1:-1),Math.PI,{aggressive:!0});ns(!0)}function ov(){if(!M.finalHorde){M.finalHorde=!0,Ar("1F \u6B63\u95E8\u538B\u529B\u4E8B\u4EF6\uFF1A\u7A81\u7834\u5927\u5385"),Ie("\u6B63\u95E8\u5916\u7684\u649E\u51FB\u58F0\u771F\u5B9E\u60CA\u52A8\u4E86\u5927\u5385\u9644\u8FD1\u7684\u611F\u67D3\u8005",2200);for(let[n,e,t]of[["runner",6.9,.55],["volatile",4.9,-.62],["corrosive",1.8,.72],["grappler",-2.4,-.7],["walker",-6,.55]])Qe(1,n,e,t,Math.PI,{aggressive:!0});Nt(-D.corridorL/2-.2,0,1,10,"outside-impact")}}var Cn={timer:7,campT:0,lastEvent:-99,lastFloor:4};function kf(n,e){let t=n-G.pos.x,i=e-G.pos.z;return Math.abs(t)>Math.abs(i)?t>0?"\u4E1C\u4FA7":"\u897F\u4FA7":i>0?"\u5357\u4FA7\u623F\u95F4\u65B9\u5411":"\u5317\u4FA7\u623F\u95F4\u65B9\u5411"}function ih(n,e,t,i=3.5){return Je[n].enemies.find(s=>!s.dead&&Math.hypot(s.g.position.x-e,s.g.position.z-t)<i)||null}function av(n){if(!(!n||M.roomEventSeen.has(`${n.floor}:${n.label}`)))if(M.roomEventSeen.add(`${n.floor}:${n.label}`),n.label==="\u901A\u4FE1\u95F4")Er("23:42 \xB7 \u9876\u5C42\u901A\u4FE1\u8BB0\u5F55","\u6709\u4EBA\u8BD5\u56FE\u4ECE 5F \u5F31\u7535\u7CFB\u7EDF\u63A5\u5165\u5916\u7EBF\u3002\u6700\u540E\u4E00\u6761\u8BB0\u5F55\u53EA\u6709\uFF1A\u201C\u5929\u53F0\u95E8\u4ECE\u5916\u4FA7\u53CD\u9501\uFF0C\u522B\u518D\u5F80\u4E0A\u3002\u201D","comm");else if(n.label==="\u81EA\u4E60\u95F4")jt("study-decoy","\u53E6\u4E00\u79CD\u73A9\u6CD5\uFF1A\u5F15\u5F00\u611F\u67D3\u8005","\u8FD9\u91CC\u80FD\u627E\u5230\u73BB\u7483\u74F6\u3002C \u6295\u63B7\u8BF1\u9975\uFF0C\u628A\u9644\u8FD1\u611F\u67D3\u8005\u5F15\u5411\u58F0\u97F3\u6765\u6E90\uFF0C\u518D\u53BB\u641C\u7D22\u5176\u5B83\u623F\u95F4\u3002",5200);else if(n.label==="424")Er("23:07 \xB7 4F \u7559\u8A00","\u5BBF\u7BA1\u901A\u77E5\u6240\u6709\u4EBA\u7559\u5728\u5BDD\u5BA4\uFF0C\u4E0D\u8981\u4E0B\u697C\u3002\u6709\u4EBA\u5728\u8FD9\u4E4B\u540E\u4ECD\u7136\u6536\u62FE\u4E86\u65C5\u884C\u7BB1\u3002","424-note");else if(n.label==="\u5BBF\u7BA1\u503C\u73ED\u5BA4")M.safeRoom=!0,Er("23:19 \xB7 \u5BBF\u7BA1\u8BB0\u5F55","\u4E00\u697C\u95E8\u7981\u8FDE\u7EED\u62A5\u8B66\uFF0C2F \u4E34\u65F6\u5C01\u95ED\u3002\u8FD9\u91CC\u7684\u95E8\u88AB\u5E78\u5B58\u8005\u91CD\u65B0\u52A0\u56FA\u8FC7\uFF0C\u53EF\u4EE5\u77ED\u6682\u5598\u606F\u3002","duty-log");else if(n.label==="318"){let e=pt.roomByLabel.\u536B\u751F\u95F4,t=ih(3,e.x,e.nearZ+e.side*2.4,3);t?(Nt(t.g.position.x,t.g.position.z,3,3.6,"enemy-impact"),Ie("\u4F60\u786E\u5B9E\u542C\u89C1\u536B\u751F\u95F4\u65B9\u5411\u6709\u4E1C\u897F\u649E\u5230\u4E86\u9694\u65AD\u3002",1400)):Ie("\u536B\u751F\u95F4\u65B9\u5411\u6CA1\u6709\u65B0\u7684\u52A8\u9759\u3002\u4F60\u4E4B\u524D\u6E05\u7406\u7684\u533A\u57DF\u4FDD\u6301\u5B89\u9759\u3002",1100)}else if(n.label==="\u536B\u751F\u95F4")Er("23:24 \xB7 3F \u75D5\u8FF9","\u5730\u4E0A\u6709\u62D6\u62FD\u75D5\u8FF9\uFF0C\u5374\u6CA1\u6709\u5BF9\u5E94\u7684\u5C38\u4F53\u3002\u6709\u4EBA\u628A\u4F24\u8005\u4ECE\u8FD9\u91CC\u5E26\u8D70\u4E86\u3002","3f-trace");else if(n.label==="218"){let e=ih(2,-5.8,.25,3.6);e?(Nt(e.g.position.x,e.g.position.z,2,3.6,"enemy-door"),Ie("\u897F\u4FA7\u786E\u5B9E\u4F20\u6765\u4E00\u58F0\u95E8\u54CD\u3002",1200)):Ie("\u8FD9\u4E00\u6BB5\u5DF2\u7ECF\u88AB\u4F60\u6E05\u7A7A\uFF0C\u53EA\u5269\u5E94\u6025\u706F\u7684\u7535\u6D41\u58F0\u3002",1e3)}else n.label==="\u6DCB\u6D74\u95F4"?Ie("\u6C34\u58F0\u4F1A\u63A9\u76D6\u4E00\u90E8\u5206\u4F4E\u5F3A\u5EA6\u811A\u6B65\u58F0\uFF0C\u4F46\u4E0D\u4F1A\u4F2A\u9020\u654C\u4EBA\u63D0\u793A\u3002",1400):n.label==="\u95E8\u5385"?Er("23:31 \xB7 \u4E00\u5C42\u95E8\u5385","\u5165\u53E3\u73BB\u7483\u7531\u5916\u5411\u5185\u7834\u88C2\u30022F \u5E76\u4E0D\u662F\u611F\u67D3\u6E90\u2014\u2014\u6709\u4EBA\u4ECE\u4E00\u697C\u9003\u4E0A\u53BB\u540E\u624D\u5931\u63A7\u3002","lobby-truth"):n.label==="\u6D88\u9632\u63A7\u5236\u5BA4"&&Er("23:35 \xB7 \u6D88\u9632\u4E3B\u673A","\u706B\u8B66\u6CA1\u6709\u6700\u5148\u89E6\u53D1\uFF1B\u6700\u65E9\u7684\u5927\u89C4\u6A21\u62A5\u8B66\u6765\u81EA\u95E8\u7981\u548C\u4E00\u5C42\u5927\u5385\u3002","fire-log")}function Er(n,e,t){M.storySeen.has(t)||(M.storySeen.add(t),jt("story-"+t,n,e,5600))}function lv(){let n=Pn(),e=Yf(n,G.pos.x,G.pos.z);e&&(n.visited.has(e.label)||(n.visited.add(e.label),Uo()),av(e))}function Gl(n,e,t){n.alerted=!0,n.state==="dormant"?(n.state="investigate",n.g.rotation.z=0,n.g.position.y=0):n.state="investigate",n.searchPos.set(e,0,t),n.lastHeard=performance.now()/1e3,n.pathTimer=0}function cv(n,e){if(!M.started||M.dead||M.won||en||Qt||M.bossStarted&&!M.bossDefeated)return;let t=Pn(),i=Yf(t,G.pos.x,G.pos.z);if(_e===3&&i?.label==="\u5BBF\u7BA1\u503C\u73ED\u5BA4")return;let s=t.enemies.filter(g=>!g.dead),r=s.filter(g=>g.state==="chase").length,o=s.filter(g=>g.state==="investigate").length;if(G.moveSpeed<.25&&r>=2?Cn.campT+=n:Cn.campT=Math.max(0,Cn.campT-n*1.5),Cn.campT>5.4&&e-Cn.lastEvent>6){let g=s.find(x=>x.type==="corrosive")||s.find(x=>x.type==="grappler")||s.find(x=>x.type==="runner");g&&(Gl(g,G.pos.x,G.pos.z),g.type==="corrosive"&&(g.spitCd=0),Ie(`\u4F60\u542C\u89C1${kf(g.g.position.x,g.g.position.z)}\u6709\u771F\u5B9E\u811A\u6B65\u63A5\u8FD1\u3002`,1300),Cn.lastEvent=e),Cn.campT=0}if(Cn.timer-=n,Cn.timer>0)return;let a=M.difficulty==="easy"?1.35:M.difficulty==="hard"?.78:1;if(Cn.timer=(7.5+He()*5)*a,r>0||o>2||e-M.lastDamageTime<5||e-M.lastCombatTime<4)return;let c=M.difficulty==="easy"?.45:M.difficulty==="hard"?.88:.68;if(He()>c)return;let l=s.filter(g=>g.state==="idle"||g.state==="dormant").map(g=>({e:g,d:Math.hypot(g.g.position.x-G.pos.x,g.g.position.z-G.pos.z)})).filter(g=>g.d>3.2&&g.d<13.5).sort((g,x)=>(x.e.directorReserve?1:0)-(g.e.directorReserve?1:0)||g.d-x.d);if(!l.length)return;let u=l[0].e,h=He()*Math.PI*2,d=G.pos.x+Math.cos(h)*(1.2+He()*1),f=G.pos.z+Math.sin(h)*(1.2+He()*1);Gl(u,d,f),Cn.lastEvent=e,He()<.55&&Ie(`\u4F60\u542C\u89C1${kf(u.g.position.x,u.g.position.z)}\u4F20\u6765\u771F\u5B9E\u811A\u6B65\u58F0\u3002`,900)}var uv=Lt.roomByLabel[418],Hf=ot(uv,0,1.05),G={pos:new A(Hf.x,D.eye,Hf.z),yaw:0,pitch:0,vel:new A,moveSpeed:0,eye:D.eye,mode:"walk"},on=new Set,Qt=!1,en=!1,Wl=1,Oo=new vs(15266542,3.3,13,Math.PI/6,.42,1.3);Oo.position.set(.1,-.04,.05);Oo.target.position.set(0,-.12,-4);bt.add(Oo);bt.add(Oo.target);function Ol(){bt.position.copy(G.pos),bt.rotation.order="YXZ",bt.rotation.y=G.yaw,bt.rotation.x=G.pitch,bt.rotation.z=0,Oo.visible=M.flashlight}function Pn(){return Je[_e]}function hv(n,e,t){let i=Pn();for(let s of i.doors){if(Math.abs(s.angle)>.68)continue;let r=s.room.x+s.room.doorOffset,o=s.room.nearZ,a=Ni(n,r-D.doorW*.5,r+D.doorW*.5),c=n-a,l=e-o;if(c*c+l*l<t*t)return!0}for(let s of i.portals){if(Math.abs(s.angle)>.68)continue;let r=s.side==="east"?D.corridorL/2:-D.corridorL/2,o=Ni(e,-D.doorW*.5,D.doorW*.5),a=n-r,c=e-o;if(a*a+c*c<t*t)return!0}return!1}function Vf(n,e){let t=D.radius,i=Pn();for(let s of i.colliders){if(s.enabled===!1)continue;let r=Ni(n,s.minX,s.maxX),o=Ni(e,s.minZ,s.maxZ),a=n-r,c=e-o;if(a*a+c*c<t*t)return!0}return hv(n,e,t)}function Io(n){M.dead||M.won||(M.useAction&&Ny(),M.lastDamageTime=performance.now()/1e3,M.hp=Math.max(0,M.hp-n),W.damage.style.opacity=.7,setTimeout(()=>W.damage.style.opacity=0,130),M.hp<=0&&(M.dead=!0,mh(!1)),Hn())}function dv(n){let e=n.room.x+n.room.doorOffset,t=n.room.nearZ;if(Math.hypot(G.pos.x-e,G.pos.z-t)<.48)return!0;for(let i of Je[n.floor].enemies)if(!i.dead&&Math.hypot(i.g.position.x-e,i.g.position.z-t)<.5)return!0;return!1}function fv(n){return n.locked?n.lockType==="maint"&&M.maintKey?(n.locked=!1,n.lockLamp&&(n.lockLamp.visible=!1),Ie("\u7EF4\u4FEE\u94A5\u5319\u6253\u5F00\u4E86\u8BBE\u5907\u95F4"),!0):n.lockType==="card"&&M.accessCard?(n.locked=!1,n.lockLamp&&(n.lockLamp.visible=!1),Ie("\u95E8\u7981\u5361\u9A8C\u8BC1\u901A\u8FC7"),!0):n.lockType==="powercard2"?M.power2Restored?M.accessCard?(n.locked=!1,n.lockLamp&&(n.lockLamp.visible=!1),Ie("2F \u5B89\u5168\u95E8\u9A8C\u8BC1\u901A\u8FC7"),!0):(Ie("\u7535\u5B50\u95E8\uFF1A\u9700\u8981\u5BBF\u820D\u95E8\u7981\u5361"),!1):(Ie("\u7535\u5B50\u95E8\u65E0\u7535\uFF1A\u5148\u6062\u590D 2F \u5C40\u90E8\u914D\u7535"),!1):(Ie(n.lockType==="maint"?"\u8BBE\u5907\u95F4\u4E0A\u9501\uFF1A\u9700\u8981\u7EF4\u4FEE\u94A5\u5319":n.lockType==="card"?"\u7535\u5B50\u95E8\u9501\uFF1A\u9700\u8981\u5BBF\u820D\u95E8\u7981\u5361":"\u95E8\u88AB\u9501\u4F4F\u4E86"),!1):!0}function pv(n,e="normal"){if(!fv(n))return;if(n.open&&dv(n)){Ie("\u95E8\u88AB\u6321\u4F4F\u4E86");return}n.open=!n.open;let t=e==="fast",i=e==="quiet";n.fastMotion=t,n.slowMotion=i,n.target=n.open?-n.room.side*Math.PI*.52:0,Nt(n.room.x+n.room.doorOffset,n.room.nearZ,n.floor,t?4.2:i?.75:n.open?1.55:2.1,t?"door-fast":i?"door-quiet":"door"),t&&Ie(n.open?"\u5FEB\u901F\u63A8\u95E8\uFF1A\u58F0\u97F3\u66F4\u5927":"\u5FEB\u901F\u5173\u95E8\uFF1A\u9644\u8FD1\u611F\u67D3\u8005\u53EF\u80FD\u542C\u89C1",650)}function mv(n){return n.locked?n.lockType==="stairpower"&&M.stairPower||n.lockType==="card"&&M.accessCard||n.lockType==="master"&&M.masterKey?(n.locked=!1,!0):n.lockType==="boss"?(Ie("\u6218\u6597\u533A\u57DF\u5C01\u9501\uFF1A\u5148\u89E3\u51B3\u91CD\u578B\u611F\u67D3\u8005"),!1):(n.lockType==="stairpower"?Ie("\u697C\u68AF\u63A7\u5236\u5668\u6CA1\u6709\u4F9B\u7535"):n.lockType==="card"?Ie("\u9700\u8981\u5BBF\u820D\u95E8\u7981\u5361"):n.lockType==="master"?Ie("\u9700\u8981\u603B\u95E8\u6743\u9650\u5361"):Ie("\u8FD9\u4E00\u4FA7\u5DF2\u7ECF\u5C01\u9501"),!1):!0}function gv(n){if(mv(n)){if(!n.open){n.open=!0,n.target=n.side==="east"?-Math.PI*.52:Math.PI*.52,Nt(n.side==="east"?D.corridorL/2:-D.corridorL/2,0,n.floor,2.5,"door");return}if(n.endGame){M.won=!0,mh(!0);return}n.toFloor&&sh(n.toFloor,_e)}}function tp(){let n=oh[_e];W.floorTag.textContent=`${_e}F`,W.floorTag.className=`floor${_e}`,Ui.background.set(n.bg),Ui.fog.color.set(n.bg),ph(),Uo()}function sh(n,e=_e){W.floorFade.classList.add("active"),document.exitPointerLock?.(),setTimeout(()=>{Je[_e].root.visible=!1,_e=n,Je[_e].root.visible=!0;let i=Je[_e].portals.find(o=>o.toFloor===e)?.side||"east",s=i==="east"?D.corridorL/2-1.05:-D.corridorL/2+1.05;G.pos.set(s,G.eye,0),G.yaw=i==="east"?Math.PI/2:-Math.PI/2,G.pitch=0,G.vel.set(0,0,0),Cn.timer=4.5,Cn.campT=0,tp();let r={5:["5F \xB7 \u9876\u5C42\u901A\u4FE1\u533A","\u7D2B\u8272\u6807\u8BC6\u3002\u8FD9\u91CC\u662F\u53EF\u9009\u9AD8\u98CE\u9669\u533A\u57DF\uFF0C\u4E3B\u7EBF\u4E0D\u8981\u6C42\u6E05\u7A7A\u3002"],3:["3F \xB7 \u7BA1\u7406\u8BBE\u5907\u533A","\u7EFF\u8272\u6807\u8BC6\u3002\u4F9B\u7535\u3001\u5BBF\u7BA1\u548C Heavy \u4E8B\u4EF6\u90FD\u96C6\u4E2D\u5728\u8FD9\u91CC\u3002"],2:["2F \xB7 \u9694\u79BB\u5931\u8D25\u533A","\u84DD\u8272\u6807\u8BC6\u3002\u9ED8\u8BA4\u65AD\u7535\uFF1B\u9ED1\u6697\u4F1A\u964D\u4F4E\u611F\u67D3\u8005\u89C6\u8DDD\uFF0C\u4F46\u7535\u5B50\u95E8\u4E5F\u65E0\u6CD5\u5DE5\u4F5C\u3002"],1:["1F \xB7 \u5927\u5385\u4E0E\u5916\u754C\u5165\u53E3","\u7EA2\u8272\u6807\u8BC6\u3002\u8FD9\u91CC\u8FDE\u63A5\u697C\u5916\uFF0C\u4E5F\u662F\u6700\u7EC8\u64A4\u79BB\u65B9\u5411\u3002"]}[_e];r&&jt("floor"+_e,r[0],r[1]),_e===2&&!M.flashlight&&(M.flashlight=!0,jt("flashlight","\u624B\u7535\u4E0E\u9ED1\u6697","L \u5F00\u5173\u624B\u7535\u3002\u65AD\u7535\u65F6\u611F\u67D3\u8005\u89C6\u8DDD\u4E0B\u964D\uFF0C\u4F46\u4F60\u7684\u624B\u7535\u4E5F\u4F1A\u8BA9\u5B83\u4EEC\u66F4\u5BB9\u6613\u770B\u5230\u4F60\u3002"),Ie("2F \u5F53\u524D\u65AD\u7535 \xB7 \u624B\u7535\u81EA\u52A8\u5F00\u542F",1200)),ns(!0),Hn(),W.floorFade.classList.remove("active"),setTimeout(()=>{!M.dead&&!M.won&&!Qt&&!en&&mt.domElement.requestPointerLock()},80)},280)}var ju=new ur;function np(){let n=new A;bt.getWorldDirection(n),ju.set(bt.position,n),ju.far=2.35;let e=ju.intersectObjects(Pn().interactables.filter(t=>t.visible!==!1),!1);return e.length?e[0].object.userData:null}function xv(n,e,t,i,s){let r=new ae({color:12567484,roughness:.65}),o=Z(n.root,.34,.52,.16,r,e,1.45,t,!1,!0);return is(n,o,{type:"breaker",breakerId:i,label:s}),o}var Fb=xv(Wt,5.95,-D.corridorW/2+.12,"floor2","2F \u5C40\u90E8\u914D\u7535");function _v(n){let e=Je[n.floor],t=ot(n,-.7,1.05),i=new $e;i.position.set(t.x,0,t.z),e.root.add(i);let s=Z(i,.72,.82,.34,ue.wood,0,.41,0,!1,!0);is(e,s,{type:"barricade"});let r={minX:t.x-.38,maxX:t.x+.38,minZ:t.z-.2,maxZ:t.z+.2,label:"movable barricade",enabled:!1};e.colliders.push(r);let o={room:n,g:i,mesh:s,collider:r,active:!1,home:i.position.clone(),block:new A(n.x+n.doorOffset,0,n.nearZ+n.side*.24)};return s.userData.barricade=o,o}var Ob=_v(pt.roomByLabel.\u5BBF\u7BA1\u503C\u73ED\u5BA4);function yv(n){n.active=!n.active,n.active?(n.g.position.copy(n.block),n.collider.minX=n.block.x-.45,n.collider.maxX=n.block.x+.45,n.collider.minZ=n.block.z-.18,n.collider.maxZ=n.block.z+.18,n.collider.enabled=!0,Nt(n.block.x,n.block.z,n.room.floor,2.4,"furniture"),Ie("\u67DC\u5B50\u88AB\u63A8\u5230\u95E8\u524D\uFF1A\u80FD\u62D6\u5EF6\u666E\u901A\u611F\u67D3\u8005\uFF0C\u4F46\u4E0D\u662F\u6C38\u4E45\u5B89\u5168\u70B9",1200)):(n.g.position.copy(n.home),n.collider.enabled=!1,Nt(n.home.x,n.home.z,n.room.floor,2,"furniture"),Ie("\u79FB\u5F00\u4E86\u4E34\u65F6\u8DEF\u969C",700))}function ip(){let n=null,e=1.45;for(let t of Pn().portals){let i=t.side==="east"?D.corridorL/2:-D.corridorL/2,s=Math.hypot(G.pos.x-i,G.pos.z);s<e&&(n=t,e=s)}return n}function Qu(n,e,t=""){M.powerZones[n]=e,sp(performance.now()/1e3),ph(),t&&Ie(t,1300)}function vv(n){if(n==="stair"){if(M.stairPower){Ie("4F \u697C\u68AF\u63A7\u5236\u7535\u6E90\u5DF2\u7ECF\u6062\u590D");return}M.stairPower=!0,Lt.westPortal.locked=!1,Qu(4,!0,"\u697C\u68AF\u63A7\u5236\u5668\u6062\u590D\u4F9B\u7535");let e=Lt.roomByLabel.\u8BBE\u5907\u95F4;Nt(e.x,e.farZ,4,6.6,"power"),Sv(),ns(!0);return}if(n==="core"){if(M.corePower){Ie("3F \u4E3B\u5E72\u4F9B\u7535\u5DF2\u7ECF\u6062\u590D");return}M.corePower=!0,Qu(3,!0,"3F \u4E3B\u5E72\u4F9B\u7535\u6062\u590D \xB7 2F \u5C40\u90E8\u914D\u7535\u73B0\u5728\u53EF\u4EE5\u542F\u52A8");let e=pt.roomByLabel.\u914D\u7535\u95F4;Nt(e.x,e.farZ,3,7.2,"power");let t=ih(3,e.x,e.nearZ,7);t&&Gl(t,e.x,e.nearZ),ns(!0);return}if(n==="floor2"){if(!M.corePower){Ie("\u914D\u7535\u7BB1\u6CA1\u6709\u4E0A\u7EA7\u7535\u6E90\uFF1A\u5148\u6062\u590D 3F \u4E3B\u5E72\u4F9B\u7535");return}if(M.power2Restored=!M.power2Restored,Qu(2,M.power2Restored,M.power2Restored?"2F \u5C40\u90E8\u4F9B\u7535\u6062\u590D\uFF1A\u7535\u5B50\u95E8\u542F\u7528\uFF0C\u4F46\u4EAE\u533A\u66F4\u5BB9\u6613\u88AB\u53D1\u73B0":"2F \u5C40\u90E8\u4F9B\u7535\u5173\u95ED\uFF1A\u7535\u5B50\u95E8\u5931\u6548\uFF0C\u611F\u67D3\u8005\u89C6\u8DDD\u964D\u4F4E"),Nt(5.95,-D.corridorW/2+.12,2,M.power2Restored?7.8:3.2,"power"),M.power2Restored){let e=_e===2?Je[2].enemies.find(t=>!t.dead&&t.state!=="chase"):null;e&&Gl(e,5.95,0)}ns(!0);return}}function Mv(){if(M.dead||M.won)return;if(Ds&&!Ds.looted){Ay(Ds);return}let n=np();if(n?.type==="door"&&n.door){let t=on.has("Space")||on.has("KeyX")?"fast":on.has("ShiftLeft")||on.has("ShiftRight")?"quiet":"normal";pv(n.door,t);return}if(n?.type==="loot"&&n.container){Ry(n.container);return}if(n?.type==="breaker"){vv(n.breakerId);return}if(n?.type==="barricade"&&n.barricade){yv(n.barricade);return}let e=n?.type==="portal"?n.portal:ip();if(e){gv(e);return}}function Sv(){if(M.powerRunnerSpawned)return;M.powerRunnerSpawned=!0;let n=Qe(4,"runner",-5.55,.25,Math.PI/2,{aggressive:!0});n.maxHp=n.baseHp*ei[M.difficulty].hp,n.hp=n.maxHp,n.speedMul=ei[M.difficulty].speed,n.searchPos.set(G.pos.x,0,G.pos.z),bo(),Ie("\u8FDC\u5904\u4F20\u6765\u6025\u4FC3\u7684\u811A\u6B65\u58F0\u2026",1700)}function bv(){let n=np(),e="";if(Ds&&!Ds.looted)e="E \xB7 \u5168\u90E8\u62FF\u8D70";else if(n?.type==="door"&&n.door){let t=n.door;e=t.locked?t.lockType==="maint"?"E \xB7 \u7528\u7EF4\u4FEE\u94A5\u5319\u89E3\u9501":t.lockType==="card"?"E \xB7 \u4F7F\u7528\u95E8\u7981\u5361\u89E3\u9501":t.lockType==="powercard2"?"E \xB7 \u7535\u5B50\u5B89\u5168\u95E8":"E \xB7 \u95E8\u5DF2\u9501":`E \xB7 ${t.open?"\u5173\u95ED":"\u5F00\u95E8"} ${t.label} \xB7 Shift+E \u8F7B\u63A8 \xB7 Space+E \u5FEB\u63A8`}else if(n?.type==="loot"&&n.container&&!n.container.looted)e=n.container.opened?`E \xB7 \u67E5\u770B ${n.container.label}`:`E \xB7 \u641C\u7D22 ${n.container.label}`;else if(n?.type==="breaker")e=`E \xB7 \u64CD\u4F5C ${n.label||"\u914D\u7535\u7BB1"}`;else if(n?.type==="barricade")e=`E \xB7 ${n.barricade?.active?"\u79FB\u5F00":"\u63A8\u52A8"} \u4E34\u65F6\u8DEF\u969C`;else{let t=n?.type==="portal"?n.portal:ip();t&&(e=t.locked?t.lockType==="stairpower"?"E \xB7 \u697C\u68AF\u63A7\u5236\u5668\u65AD\u7535":t.lockType==="card"?"E \xB7 \u9700\u8981\u95E8\u7981\u5361":t.lockType==="master"?"E \xB7 \u9700\u8981\u603B\u95E8\u6743\u9650":t.lockType==="boss"?"E \xB7 \u6218\u6597\u533A\u57DF\u5C01\u9501":"E \xB7 \u6B64\u8DEF\u5C01\u9501":t.open?t.endGame?"E \xB7 \u79BB\u5F00\u5BBF\u820D\u697C":`E \xB7 \u524D\u5F80 ${t.toFloor}F`:"E \xB7 \u6253\u5F00\u697C\u68AF\u95F4")}W.prompt.textContent=e,W.prompt.classList.toggle("show",!!e&&!Qt&&!en)}function ph(){if(!W.powerState)return;let n=M.powerZones[_e]?"ON":"OFF";W.powerState.textContent=`${_e}F POWER ${n}`,W.powerState.classList.toggle("off",n==="OFF"),W.seedText&&(W.seedText.textContent=`SEED ${Po}`)}function Hn(){W.hpText.textContent=Math.ceil(M.hp),W.hpBar.style.width=`${M.hp}%`,W.staminaBar&&(W.staminaBar.style.width=`${M.stamina}%`),W.staminaText&&(W.staminaText.textContent=Math.ceil(M.stamina)),W.weaponName.textContent=M.current?ss[M.current].name:"EMPTY HANDS",W.ammoText.textContent=Ly(),W.invAmmo.textContent=M.ammo9,W.invShells.textContent=M.shells,W.invBandage.textContent=M.bandages,W.invMed.textContent=M.medkits,W.invGrenade.textContent=M.grenades,W.invMolotov.textContent=M.molotovs,W.invDecoy&&(W.invDecoy.textContent=M.decoys),W.invMaint.textContent=M.maintKey?"\u5DF2\u83B7\u5F97":"\u672A\u83B7\u5F97",W.invCard.textContent=M.accessCard?"\u5DF2\u83B7\u5F97":"\u672A\u83B7\u5F97",W.invMaster.textContent=M.masterKey?"\u5DF2\u83B7\u5F97":"\u672A\u83B7\u5F97",W.eqPistol.textContent=M.owned.pistol?"M9":"\u2014",W.eqShotgun.textContent=M.owned.shotgun?"PUMP":"\u2014",W.eqSMG.textContent=M.owned.smg?"MP5":"\u2014",W.eqMelee.textContent=M.owned.crowbar?"CROWBAR":"\u2014";for(let[n,e]of[[W.slot1,"pistol"],[W.slot2,"shotgun"],[W.slot3,"smg"],[W.slot4,"crowbar"]])n.classList.toggle("owned",M.owned[e]),n.classList.toggle("active",M.current===e)}function Gf(){let n=Pn();for(let e of n.rooms){let t=Math.min(e.nearZ,e.farZ),i=Math.max(e.nearZ,e.farZ);if(G.pos.x>e.x-D.roomW/2&&G.pos.x<e.x+D.roomW/2&&G.pos.z>t&&G.pos.z<i)return e.kind==="dorm"?`${e.label} \xB7 \u5BBF\u820D`:`${e.label}`}return Math.abs(G.pos.x)>D.corridorL/2-.8?`${_e}F \xB7 \u697C\u68AF\u95F4`:`${_e}F \xB7 \u5BBF\u820D\u8D70\u5ECA`}function Ev(){let n=0,e=0,t=0;for(let i of Pn().enemies)i.dead||Math.hypot(i.g.position.x-G.pos.x,i.g.position.z-G.pos.z)>11||(i.state==="chase"?(n++,["runner","corrosive","volatile","grappler","heavy"].includes(i.type)&&t++):i.state==="investigate"&&e++);if(W.threatHud.classList.toggle("combat",n>0),W.threatHud.classList.toggle("alert",n===0&&e>0),W.threatText.textContent=n?`\u4EA4\u6218 \xB7 ${n}${t?" \xB7 \u7279\u6B8A "+t:""}`:e?"\u9644\u8FD1\u6709\u52A8\u9759":"\u5B89\u9759",M.boss&&!M.boss.dead&&M.boss.floor===_e){let i=Ni(M.boss.hp/M.boss.maxHp*100,0,100);W.bossFill.style.width=`${i}%`,W.bossHp.textContent=`${Math.ceil(i)}%`}}Hn();var Nl=0,eh=1/120;function Tv(){en&&(en=!1,W.mapOverlay.classList.add("hidden")),Qt=!Qt,W.inventory.classList.toggle("hidden",!Qt),Qt&&document.pointerLockElement===mt.domElement?document.exitPointerLock():!Qt&&!M.dead&&!M.won&&mt.domElement.requestPointerLock()}W.start.addEventListener("click",()=>{By(),M.started=!0,M.startTime||(M.startTime=performance.now()),Py(),ah(W.quality?.value||"balanced"),xy(),W.difficulty&&(W.difficulty.disabled=!0),W.quality&&(W.quality.disabled=!0),tp(),ph(),ns(!0),setTimeout(()=>jt("basics","v0.7 \u79FB\u52A8\u4E0E\u63A2\u7D22","Shift \u9759\u6B65 \xB7 Ctrl \u8E72\u4F0F \xB7 Space / X \u51B2\u523A \xB7 E \u4EA4\u4E92\u3002418 \u4F1A\u5C1D\u8BD5\u8F7D\u5165\u65B0\u7684 Hero Room\uFF1B\u5931\u8D25\u65F6\u81EA\u52A8\u4FDD\u7559\u7A0B\u5E8F\u5316\u623F\u95F4\u3002",6e3),650),mt.domElement.requestPointerLock()});W.restart.addEventListener("click",()=>location.reload());W.sens.addEventListener("input",()=>{Wl=parseFloat(W.sens.value),W.sensValue.textContent=Wl.toFixed(2)+"\xD7"});W.difficulty?.addEventListener("change",()=>W.difficultyHint.textContent=ei[W.difficulty.value].label);W.quality?.addEventListener("change",()=>ah(W.quality.value,!1));mt.domElement.addEventListener("click",()=>{!Qt&&!en&&!M.dead&&!M.won&&document.pointerLockElement!==mt.domElement&&mt.domElement.requestPointerLock()});document.addEventListener("pointerlockchange",()=>{let n=document.pointerLockElement===mt.domElement;W.pause.classList.toggle("hidden",n||Qt||en||M.dead||M.won)});document.addEventListener("mousemove",n=>{if(document.pointerLockElement!==mt.domElement||Qt||en||M.dead||M.won)return;let e=Ni(Number.isFinite(n.movementX)?n.movementX:0,-80,80),t=Ni(Number.isFinite(n.movementY)?n.movementY:0,-65,65);G.yaw-=e*D.sensitivity*Wl,G.pitch-=t*D.sensitivity*Wl,G.pitch=Ni(G.pitch,-1.34,1.34)});document.addEventListener("contextmenu",n=>n.preventDefault());document.addEventListener("mousedown",n=>{document.pointerLockElement!==mt.domElement||en||Qt||(n.button===0&&(fh=!0,$f(performance.now()/1e3)),n.button===2&&M.current!=="crowbar"&&(rs=!0))});document.addEventListener("mouseup",n=>{n.button===0&&(fh=!1),n.button===2&&(rs=!1)});addEventListener("keydown",n=>{if(on.add(n.code),!n.repeat){if(n.code==="KeyM"){Iy();return}if(n.code==="KeyB"||n.code==="Tab"){n.preventDefault(),Tv();return}if(n.code==="KeyP"){W.perfHud?.classList.toggle("hidden");return}en||Qt||(n.code==="KeyE"&&Mv(),n.code==="KeyR"&&Jf(),n.code==="KeyF"&&Fy(),n.code==="KeyG"&&Oy(),n.code==="KeyQ"&&Ju("grenade"),n.code==="KeyT"&&Ju("molotov"),n.code==="KeyC"&&Ju("decoy"),n.code==="KeyL"&&(M.flashlight=!M.flashlight,Ie(M.flashlight?"\u624B\u7535\u5F00\u542F":"\u624B\u7535\u5173\u95ED",500)),n.code==="Digit1"&&ts("pistol"),n.code==="Digit2"&&ts("shotgun"),n.code==="Digit3"&&ts("smg"),n.code==="Digit4"&&ts("crowbar"),n.code==="KeyH"&&document.body.classList.toggle("ui-hidden"))}});addEventListener("keyup",n=>on.delete(n.code));function wv(n){if(document.pointerLockElement!==mt.domElement||Qt||en||M.dead||M.won){G.vel.multiplyScalar(Math.max(0,1-n*D.friction));return}let e=(on.has("KeyW")?1:0)-(on.has("KeyS")?1:0),t=(on.has("KeyD")?1:0)-(on.has("KeyA")?1:0),i=Math.hypot(e,t),s=i?e/i:0,r=i?t/i:0,o=on.has("ShiftLeft")||on.has("ShiftRight"),a=on.has("ControlLeft")||on.has("ControlRight"),c=on.has("Space")||on.has("KeyX"),l=performance.now()/1e3,u=c&&i>0&&M.stamina>1&&!a&&!o&&!rs&&!M.useAction,h=a?D.crouch:o?D.quiet:u?D.sprint:D.walk;if(u)M.stamina=Math.max(0,M.stamina-27*n),M.lastSprintTime=l,G.mode="sprint";else{let L=l-M.lastSprintTime>.65?19:6;M.stamina=Math.min(100,M.stamina+L*n),G.mode=a?"crouch":o?"quiet":"walk"}M.grappledBy&&l<M.slowUntil&&(h*=.42),M.useAction&&(h*=.46);let d=-Math.sin(G.yaw),f=-Math.cos(G.yaw),g=Math.cos(G.yaw),x=-Math.sin(G.yaw),m=(d*s+g*r)*h,p=(f*s+x*r)*h,w=i?D.accel:D.friction,E=Math.min(1,w*n);G.vel.x+=(m-G.vel.x)*E,G.vel.z+=(p-G.vel.z)*E;let y=G.pos.x+G.vel.x*n;Vf(y,G.pos.z)?G.vel.x=0:G.pos.x=y;let R=G.pos.z+G.vel.z*n;Vf(G.pos.x,R)?G.vel.z=0:G.pos.z=R;let C=a?1.16:D.eye;G.eye=fn(G.eye,C,12,n),G.pos.y=G.eye,G.moveSpeed=Math.hypot(G.vel.x,G.vel.z)}var th=0;function Av(n){if(th-=n,th>0||document.pointerLockElement!==mt.domElement||G.moveSpeed<.35)return;let e=0,t=.75,i="footstep";G.mode==="sprint"?(e=M.difficulty==="hard"?5.4:4.4,t=.34,i="sprint"):G.mode==="walk"?(e=1.45,t=.68):G.mode==="quiet"?(e=.42,t=.86,i="quiet-step"):G.mode==="crouch"&&(e=.22,t=.95,i="crouch-step"),e>0&&Nt(G.pos.x,G.pos.z,_e,e,i),th=t}function Rv(n){for(let e of Object.values(Je))if(e.root.visible){for(let t of e.doors)t.angle=fn(t.angle,t.target,t.fastMotion?24:t.slowMotion?4.2:10,n),t.pivot.rotation.y=t.angle,Math.abs(t.angle-t.target)<.025&&(t.fastMotion=!1,t.slowMotion=!1);for(let t of e.portals)t.angle=fn(t.angle,t.target,14,n),t.pivot.rotation.y=t.angle;for(let t of e.loot)t.opened&&(t.openT=Math.min(1,t.openT+n*3),t.lidPivot.rotation.x=-t.room.side*t.openT*1.12)}}function Cv(n,e){Dy(n,e),Uy(n),fh&&M.current&&ss[M.current]?.auto&&$f(e),Ls=fn(Ls,0,18,n),Fl=fn(Fl,0,9,n),es.intensity=fn(es.intensity,0,28,n);let t=rs?60:G.mode==="sprint"?78:76;bt.fov=fn(bt.fov,t,12,n),bt.updateProjectionMatrix();let i=G.moveSpeed>.3,s=i?Math.sin(performance.now()*.012)*.0035:0;ji.position.x=fn(ji.position.x,rs?0:.02,14,n),ji.position.y=fn(ji.position.y,s,14,n),ji.rotation.x=-Ls,M.current==="crowbar"?Rr.rotation.x=-Fl*.85:(In.rotation.y=fn(In.rotation.y,Rt.active&&Rt.type==="pistol"?.35:0,14,n),zn.rotation.y=fn(zn.rotation.y,Rt.active&&Rt.type==="shotgun"?.22:0,14,n),kn.rotation.y=fn(kn.rotation.y,Rt.active&&Rt.type==="smg"?.28:0,14,n))}function sp(n){let e=Pn(),t=!!M.powerZones[_e];for(let i=0;i<e.lights.length;i++){let s=e.lights[i],r=t?1:.1;_e===5?r=t?1.08:.18:_e===4?r=t?1.28:.16:_e===3?r=t?.92:.24:_e===2?r=t?.72:.055:_e===1&&(r=t?.78:.2),t&&_e===3&&i===1&&(r=.42+Math.max(0,Math.sin(n*7.7))*.55),_e===2&&!t&&i%3===0&&(r=.18+(Math.sin(n*(3+i))>.35?.1:0)),s.intensity=r}}function Wf(n){sp(n)}function Iv(){let n=Pn();for(let e of n.portals)if(!(e.locked||!e.open||Math.abs(e.angle)<.9)){if(e.side==="east"&&G.pos.x>D.corridorL/2+.28){e.toFloor&&sh(e.toFloor,_e);return}if(e.side==="west"&&G.pos.x<-D.corridorL/2-.28){e.endGame?(M.won=!0,mh(!0)):e.toFloor&&sh(e.toFloor,_e);return}}}function mh(n){document.exitPointerLock?.(),W.end.classList.remove("hidden");let e=Math.max(1,Math.round((performance.now()-M.startTime)/1e3)),t=M.shots?Math.round(M.hits/M.shots*100):0;n?(W.end.querySelector("h1").textContent="\u4F60\u7A81\u7834\u4E86\u611F\u67D3\u533A",W.endStats.textContent=`\u96BE\u5EA6 ${ei[M.difficulty].label} \xB7 \u7528\u65F6 ${Math.floor(e/60)}:${String(e%60).padStart(2,"0")} \xB7 \u51FB\u5012 ${M.kills} \xB7 \u547D\u4E2D\u7387 ${t}% \xB7 v0.7 \u5B8C\u6210\u3002`):(W.end.querySelector("h1").textContent="\u611F\u67D3\u6269\u6563",W.endStats.textContent=`\u4F60\u5012\u5728\u4E86 ${_e}F\u3002\u51FB\u5012 ${M.kills} \xB7 \u547D\u4E2D\u7387 ${t}%`)}function Pv(){if(_e!==3||M.bossStarted||!M.corePower||Math.abs(G.pos.z)>D.corridorW/2-.08)return;(M.owned.shotgun?G.pos.x<.9:G.pos.x<-4)&&rv()}function Lv(){_e===1&&M.masterKey&&!M.finalHorde&&G.pos.x<-2&&Math.abs(G.pos.z)<D.corridorW/2+.2&&ov()}var Jt={t:0,frames:0,last:performance.now(),fps:60,lowT:0,adapted:!1};function Dv(n){if(Jt.frames++,n-Jt.last<500)return;let e=(n-Jt.last)/1e3;Jt.fps=Jt.frames/e;let t=1e3/Math.max(1,Jt.fps);Jt.frames=0,Jt.last=n;let i=mt.info.render,s=Pn().enemies.filter(r=>!r.dead).length;W.perfFps&&(W.perfFps.textContent=Jt.fps.toFixed(0)),W.perfFrame&&(W.perfFrame.textContent=t.toFixed(1)+" ms"),W.perfCalls&&(W.perfCalls.textContent=String(i.calls)),W.perfTris&&(W.perfTris.textContent=(i.triangles/1e3).toFixed(0)+"k"),W.perfAi&&(W.perfAi.textContent=String(s)),W.perfRooms&&(W.perfRooms.textContent=String(ct.visibleRooms)),W.perfArt&&(W.perfArt.textContent=ct.heroStatus==="ready"&&ct.hero418?.visible?`GLB ${ct.heroMeshes}`:ct.heroStatus==="failed"?"FALLBACK":"PROC"),Jt.fps<42&&M.started?(Jt.lowT+=e,Jt.lowT>4&&!Jt.adapted&&Ji>.82&&(Ji=Math.max(.82,Ji-.18),mt.setPixelRatio(Ji),Jt.adapted=!0,M.performanceWarnings++,Ie(`\u6027\u80FD\u4FDD\u62A4\uFF1A\u6E32\u67D3\u6BD4\u4F8B\u964D\u81F3 ${Ji.toFixed(2)}\xD7`,1500)),Jt.lowT>8&&ct.hero418?.visible&&ct.quality==="balanced"&&(ct.hero418.visible=!1,Lt.roomByLabel[418].generatedInteriorGroup.visible=!0,ct.fallbackReason="sustained low FPS",ct.quality="performance",M.performanceWarnings++,Ie("\u6027\u80FD\u4FDD\u62A4\uFF1A418 \u5207\u56DE\u7A0B\u5E8F\u5316\u623F\u95F4",1800))):Jt.lowT=Math.max(0,Jt.lowT-e*2)}ah(W.quality?.value||"balanced");var Nv=new fo;function Uv(n,e){if(!M.started){Ol(),Wf(e);return}if(Qt||en||!M.dead&&!M.won&&document.pointerLockElement!==mt.domElement){Ol(),W.zone.textContent=Gf(),en&&Uo();return}for(Nl=Math.min(Nl+n,.12);Nl>=eh;)wv(eh),Nl-=eh;Av(n),Rv(n),Cv(n,e),Yy(n),Zy(n);for(let i of Pn().enemies)sv(i,n,e);nv(e),Pv(),Lv(),cv(n,e),lv(),_y(),Ol(),bv(),Ev(),Wf(e),Iv(),W.zone.textContent=Gf(),Hn()}function rp(){requestAnimationFrame(rp);let n=Math.min(Nv.getDelta(),.033),e=performance.now();Uv(n,e/1e3),mt.render(Ui,bt),Dv(e)}Ol();rp();addEventListener("resize",()=>{bt.aspect=innerWidth/innerHeight,bt.updateProjectionMatrix(),mt.setSize(innerWidth,innerHeight)});
