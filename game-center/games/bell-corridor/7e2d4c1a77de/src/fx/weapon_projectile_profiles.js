// Presentation sizes only: collision radii remain owned by the gameplay runtime.
// Every geometry has transverse radius 1 and longitudinal (z) half-length 1.
const p = (shape, radius, length, trail, detail, line, impact, signature) =>
  ({shape, radius, length, trail, detail, line, impact, signature});

// Explicit original-ID registry. Physical bullets may share a profile; special
// mechanisms use silhouettes, trails and details, rather than arbitrary colors.
const profiles = {
  pistol_rusty: p('capsule',.40,.55,'tracer','none','beam','spark','圆头短直弹与细曳光'),
  pistol_heavy: p('capsule',.42,.65,'tracer','notch','beam','spark','粗圆头弹与缺口腰标'),
  smg_hornet: p('capsule',.29,.40,'tracer','none','beam','spark','密集短圆头曳光弹；真实散布随连射展开'),
  rifle_carbine: p('capsule',.31,.48,'tracer','none','beam','spark','细圆头直弹；第六发快照显示穿甲腰环'),
  shotgun_sapper: p('sphere',.30,.30,'tracer','none','beam','spark','圆散弹成扇形分布'),
  shotgun_dragon: p('flame',.32,.46,'ember','spark','flame','ember','七颗火舌散弹与短余烬尾'),
  sniper_rail: p('dart',.40,.85,'tracer','fins','beam','spark','长尖磁轨针与短尾翼'),
  rocket_hammer: p('rocket',.48,.80,'ember','fins','pulse','blast','尖头粗火箭、尾翼与推进余烬'),
  grenade_lobber: p('grenade',.46,.46,'none','ring','pulse','blast','圆肩榴弹与腰环；高度弧线沿实际重力弹'),
  minigun_shredder: p('capsule',.27,.35,'tracer','none','beam','spark','密集极短圆头弹，真实射速逐渐预热'),
  laser_lance: p('dart',.40,.72,'plasma','none','pulse','plasma','尖头光矛；短促断续脉冲线'),
  plasma_repeater: p('sphere',.44,.44,'plasma','ring','pulse','plasma','环绕等离子球芯；穿首敌后球芯缩小并撤腰环'),
  gauss_lancer: p('dart',.46,.85,'electric','ring','electric','electric','长尖磁暴针与电尾腰环；蓄力快照放大针芯'),
  flame_belcher: p('flame',.40,.62,'ember','none','flame','ember','短程尖火舌与余烬短尾'),
  orb_sling: p('sphere',.48,.48,'comet','ring','pulse','blast','大圆球核、单腰环与追踪短彗尾'),
  charge_nova: p('sphere',.50,.50,'plasma','spark','pulse','blast','新星圆核、外围火花与等离子尾'),
  shuriken_launcher: p('star',.44,.30,'tracer','notch','beam','shatter','扁星形刃与缺口；真实墙反射改变飞行方向'),
  arc_coil: p('fork',.44,.55,'electric','spark','electric','electric','叉形电芯与短电尾；链以分段电线连接'),
  burst_triple: p('capsule',.30,.43,'tracer','none','beam','spark','三拍短圆头直弹；每拍沿实际支付时刻发出'),
  spike_nailer: p('dart',.40,.82,'tracer','notch','beam','spark','细长钉针与缺口钉帽'),
  tox_sprayer: p('droplet',.44,.58,'plasma','none','pulse','seal','尖尾酸滴；停喷后的凝结快照显示破膜环'),
  crystal_caster: p('crystal',.44,.68,'plasma','fins','beam','shatter','三枚棱晶与小晶翼；首折后实际收束成束'),
  storm_battery: p('fork',.50,.66,'electric','fork','electric','electric','大双叉电芯、叉饰与电尾；满蓄快照扩大叉芯'),
  pyroclast: p('crystal',.32,.46,'ember','spark','pulse','blast','九颗棱角熔渣与余烬短尾'),
  void_ripper: p('crystal',.50,.70,'comet','notch','pulse','blast','缺口虚空棱芯与短彗尾；带本人目标快照时闭合环'),
  aegis_lance: p('dart',.50,.82,'plasma','ring','pulse','plasma','粗光矛与护环；架稳释放宽短脉冲'),
  bell_sight: p('dart',.40,.80,'tracer','ring','beam','spark','尖针与单照钟环；瞄准快照增加针宽'),
  witness_pistol: p('capsule',.40,.55,'tracer','seal','beam','seal','圆头证言弹与方印尾章'),
  offset_duelist: p('dart',.40,.70,'tracer','notch','beam','spark','斜尖决斗弹与缺口腰标'),
  hourhand_rifle: p('dart',.40,.78,'tracer','none','beam','spark','细时针弹；合法节拍快照显示单环'),
  shatter_optic: p('crystal',.42,.67,'tracer','notch','beam','shatter','缺口裂镜晶针'),
  patient_relic: p('capsule',.40,.70,'tracer','ring','beam','spark','长圆头圣铳弹与腰环；位移蓄势快照加粗'),
  split_decision: p('dart',.40,.65,'tracer','fork','beam','spark','尖头裁决弹与分叉尾饰'),
  window_keeper: p('capsule',.40,.60,'tracer','notch','beam','spark','短缺口直弹；门边令牌快照改粗短重弹'),
  counterweight: p('dart',.42,.82,'tracer','ring','pulse','spark','长配重针与腰环；第二段沿真实延迟射线'),
  last_witness: p('dart',.42,.76,'tracer','seal','beam','seal','尖头证针与方印；三证齐全快照增加针芯宽'),
  escapement_smg: p('capsule',.30,.42,'tracer','none','beam','spark','三拍窄圆头弹与真实机械闭锁'),
  ratchet_repeater: p('capsule',.30,.45,'tracer','notch','beam','spark','缺口棘轮弹；第三拍快照改成三颗短圆珠'),
  vent_rifle: p('capsule',.31,.48,'tracer','none','beam','spark','细圆头直弹；真实热散布与停火锁定'),
  relay_carbine: p('capsule',.31,.48,'tracer','none','beam','spark','细圆头接班弹；令牌兑现快照显示三枚带环弹'),
  metronome_carbine: p('capsule',.31,.48,'tracer','none','beam','spark','节拍圆头弹；第三次合法拍快照改尖针带环'),
  funnel_shotgun: p('sphere',.30,.30,'tracer','none','beam','spark','六颗圆散弹；已释放窄束模式为三颗长弹'),
  double_bell: p('sphere',.31,.31,'tracer','ring','beam','spark','四颗带腰环钟珠；次扣真实扇角收窄'),
  backstep_bellows: p('capsule',.31,.38,'tracer','notch','beam','spark','五颗缺口短弹；合法后撤外沿两弹为粗短推击球'),
  seam_sweeper: p('dart',.30,.47,'tracer','fork','beam','spark','七颗叉尾短针，实际左右瓣保留中央缝隙'),
  breach_bucket: p('sphere',.32,.32,'tracer','notch','beam','shatter','缺口圆散弹；墙面派生弹改棱碎片'),
  ring_shot: p('capsule',.30,.43,'tracer','ring','beam','spark','带环六弹窄束；五单位变形标记改扁圆珠并实际展开'),
  grit_reloader: p('capsule',.34,.47,'tracer','none','beam','spark','四颗粗短圆头散弹'),
  line_scribe: p('dart',.40,.82,'tracer','none','beam','spark','尺线长针与真实命中残线'),
  shield_chisel: p('cube',.44,.65,'tracer','notch','beam','shatter','方头粗凿与缺口腰标'),
  tandem_rail: p('dart',.42,.84,'electric','fins','beam','electric','两根带翼尖轨针，真实平行发射点保留中央空隙'),
  stopper_rail: p('dart',.46,.74,'tracer','seal','anchor','shatter','粗磁桩针与方桩印；实际第三目标位置终止飞行'),
  weft_needle: p('dart',.40,.85,'tracer','fork','braid','spark','长织针与叉尾；实际两开火点之间形成横线'),
  fuse_rail: p('dart',.42,.83,'ember','notch','beam','ember','缺口长导轨针与短熔断余烬尾'),
  door_frame: p('cube',.46,.70,'tracer','seal','anchor','shatter','两枚方形门桩与方印；实际双落点形成横线'),
  retrieval_saw: p('disc',.48,.27,'tracer','notch','beam','shatter','扁锯盘与缺口；回程快照出现接收腰环'),
  corner_prism: p('crystal',.46,.78,'plasma','notch','beam','shatter','缺口棱镜尖芯；实际两段反射射线'),
  bank_stamp: p('capsule',.30,.44,'tracer','seal','beam','seal','方印短弹；实际墙碰后的派生双针'),
  boomerang_fork: p('fork',.46,.58,'tracer','fork','beam','spark','双叉回环弹与叉饰；回程快照改腰环'),
  wall_clock: p('disc',.44,.30,'tracer','seal','anchor','seal','扁钟印弹与方印；墙印发出的弹改长时针'),
  skipping_stone: p('disc',.46,.28,'none','notch','beam','shatter','扁缺口石弹；实际低空短跳轨迹'),
  angle_debt: p('dart',.40,.68,'tracer','notch','beam','spark','缺口借角针；角债快照显示棱晶腰环'),
  spiral_winch: p('disc',.48,.30,'comet','fork','braid','shatter','扁盘索与叉饰、彗尾；实际半圈弧线运动'),
  mirror_slug: p('cube',.50,.64,'plasma','ring','pulse','shatter','方头镜背重弹与腰环；折返准备改方印，回程改短芯'),
  polygon_oath: p('crystal',.46,.80,'tracer','fins','beam','shatter','细长折线棱晶与晶翼；沿实际最多两折飞行'),
  nail_collapse: p('dart',.42,.75,'tracer','seal','anchor','blast','粗钉印尖弹与方印尾章'),
  fuse_lantern: p('grenade',.46,.50,'ember','spark','pulse','blast','短肩引信榴弹与余烬火花'),
  clap_mortar: p('grenade',.44,.40,'tracer','ring','pulse','blast','短圆肩迫击珠与配对腰环'),
  pressure_mine: p('disc',.48,.25,'none','seal','anchor','blast','扁压板雷芯与方印'),
  echo_shell: p('rocket',.48,.72,'plasma','ring','pulse','blast','带腰环回声弹壳与等离子尾'),
  quarry_splitter: p('cube',.50,.64,'tracer','notch','beam','shatter','方头采石重芯；墙派生弹改棱晶碎片'),
  clock_bomb: p('sphere',.46,.46,'none','notch','pulse','blast','缺口钟弹圆芯；遥控部署显示在实际地面实例'),
  ash_invoice: p('capsule',.42,.60,'ember','seal','pulse','blast','方印灰烬弹与短余烬尾'),
  thunder_cask: p('grenade',.52,.56,'electric','ring','electric','blast','粗圆肩雷桶与桶腰环、电尾'),
  conductive_sign: p('dart',.42,.70,'electric','seal','electric','electric','尖导电签与方印电尾'),
  ladder_coil: p('dart',.44,.77,'electric','notch','electric','electric','缺口梯针、电尾与分段电线'),
  capacitor_sieve: p('sphere',.44,.44,'electric','ring','electric','electric','带腰环电容珠与电尾'),
  grounding_rod: p('dart',.46,.78,'electric','seal','anchor','electric','方印接地杆针与电尾；地面廊沿实际两杆位置'),
  ion_abacus: p('sphere',.44,.44,'electric','notch','electric','electric','缺口算盘电珠与短电尾'),
  bell_switch: p('sphere',.46,.46,'electric','seal','electric','seal','带方印继电珠与电尾'),
  // 2026-10-13：line 从 'electric' 改为 'solid'。
  // 原因：特效层遇到 electric 会**忽略束宽**、改画 4 条 .11 粗的细电弧，并强制用档案自带的近白色
  // （试玩反馈"熔核激光炮依旧是一条很细的白色激光条"的根因）。改 beam 后走核心+外壳的粗束，
  // 宽度取 BEAM_WIDTH_MUL（熔核 ×10）与武器色。
  spark_shuttle: p('dart',.46,.80,'electric','fork','beam','electric','长叉尾电梭；实心粗光束'),
  storm_receipt: p('dart',.44,.65,'electric','seal','electric','electric','短方印回执电针'),
  kiln_ray: p('flame',.44,.65,'ember','spark','flame','ember','火舌芯与火花；窄火焰线沿实际持续射线'),
  hinge_beam: p('capsule',.44,.75,'plasma','ring','beam','plasma','长圆芯铰链光线与腰环；方向受真实转向上限约束'),
  thread_beam: p('dart',.40,.85,'plasma','none','beam','plasma','细尖线芯与窄直光线'),
  aperture_lamp: p('sphere',.46,.46,'plasma','ring','pulse','plasma','带环灯芯；实际两条边界脉冲标出释放照射锥'),
  braid_light: p('dart',.42,.72,'plasma','fork','braid','plasma','叉尾细光芯、编辫线型与实际左右交替射线'),
  prism_anchor: p('crystal',.46,.56,'plasma','seal','anchor','seal','方印短棱锚芯；锚线仅连接实际存活锚'),
  frost_tile: p('cube',.46,.54,'frost','snow','anchor','frost','方形霜砖芯、雪饰与短霜尾'),
  ember_seam: p('flame',.42,.65,'ember','notch','flame','ember','缺口火舌芯与实际细火缝线'),
  acid_sieve: p('droplet',.42,.55,'plasma','notch','pulse','seal','三颗缺口酸滴与短雾尾'),
  steam_valve: p('droplet',.44,.56,'frost','none','flame','frost','水滴芯与短白霜汽尾；排压快照改粗尖汽舌'),
  salt_cracker: p('crystal',.44,.58,'none','notch','beam','shatter','干燥缺口盐晶与碎晶命中'),
  mist_pendulum: p('sphere',.46,.46,'plasma','none','pulse','seal','无环雾珠与短雾尾；雾区实际朝初始方向移动'),
  kiln_seal: p('cube',.44,.60,'ember','seal','anchor','seal','方炉印弹、方印饰与余烬尾'),
  quench_chalice: p('droplet',.46,.60,'frost','snow','pulse','frost','大淬火水滴与雪饰、霜尾'),
  wax_seal: p('disc',.44,.28,'none','seal','anchor','seal','扁蜡封签与方印；信弹快照改长彗芯封章'),
  orbit_guard: p('dart',.46,.80,'plasma','ring','anchor','plasma','环卫长轨针与腰环；存储态短尾、放出态长彗尾'),
  chase_comet: p('comet',.46,.70,'tracer','none','pulse','plasma','尖彗芯；实际六单位寻敌成功后改彗尾与腰环'),
  ring_satellite: p('sphere',.46,.46,'plasma','ring','anchor','plasma','卫星圆核与轨环；实际卫星弹改长针并沿地面轨道走'),
  chain_harpoon: p('fork',.46,.66,'tracer','fork','anchor','spark','低伤双叉钩；重弹快照改长尖芯与彗尾'),
  return_post: p('cube',.44,.48,'none','seal','anchor','seal','方回站印芯；实际信弹改长彗芯，到站后出现环'),
  beacon_furnace: p('capsule',.40,.56,'tracer','seal','anchor','ember','方印指令弹；信标派生弹改小火舌与余烬尾'),
  tripod_caster: p('capsule',.40,.62,'tracer','notch','beam','spark','炮架指令发射缺口圆头弹'),
  bell_hound: p('capsule',.40,.54,'tracer','ring','beam','spark','带环指令弹；伴兽行动由实际命中指令驱动'),
  shield_lantern: p('capsule',.40,.55,'tracer','notch','beam','spark','缺口原弹；灯座真实转化弹改宽圆光核带环'),
  spring_nest: p('sphere',.40,.40,'tracer','notch','beam','spark','弹簧巢派生缺口圆珠'),
  procession_drum: p('capsule',.40,.55,'tracer','none','beam','spark','主圆头弹；真实鼓卫伴弹改带环短珠'),
  stake_keeper: p('dart',.40,.65,'tracer','seal','anchor','spark','巡炮派生尖桩针与方印'),
  recall_censer: p('capsule',.40,.55,'tracer','seal','beam','spark','方印积灰主弹；回收强化快照改带火花短散珠'),
  reversible_breech: p('capsule',.40,.60,'tracer','notch','beam','spark','缺口直射弹；已发散射模式改三颗短圆珠'),
  escrow_cannon: p('capsule',.40,.50,'tracer','notch','pulse','spark','缺口短押注弹；兑现快照改带环粗重弹'),
  empty_chamber: p('capsule',.40,.55,'tracer','none','pulse','spark','普通圆头弹；维护首发快照改粗短带环冲击珠'),
  balance_ledger: p('dart',.40,.72,'tracer','notch','beam','spark','窄缺口秤针；真实资源比例快照改宽双圆珠'),
  flywheel_vow: p('capsule',.30,.40,'tracer','none','beam','spark','低速短圆头弹；满轮重击快照改粗长带环针'),
  folding_pike: p('dart',.40,.68,'tracer','fins','beam','spark','带翼尖直弹；实际蓄力前刺为短脉冲线'),
  chamber_lottery: p('dart',.42,.75,'tracer','notch','beam','spark','直针牌为缺口长针；扇弹牌短珠；跳弹牌扁星刃'),
  mercy_invoice: p('capsule',.40,.60,'tracer','seal','beam','seal','方印收据主弹与盖印命中；兑现由实际命中结算'),
  reserve_mill: p('capsule',.40,.55,'tracer','notch','beam','spark','缺口磨坊直弹；实际磨弹快照改粗晶芯与环'),
  split_escapement: p('capsule',.30,.45,'tracer','notch','beam','spark','窄缺口连发弹；宽态快照改两颗短圆珠'),
  yama_call: p('dart',.40,.85,'tracer','fins','beam','spark','紫色重针与方印；单发巨伤'),
  tesla_arc: p('fork',.44,.55,'electric','spark','electric','electric','放电叉芯；面向扇面自动成链'),
  hive_scepter: p('capsule',.40,.62,'tracer','notch','beam','spark','木纹法杖顶端蜂巢；敲地即涌出蜘蛛'),
};

export const PROJECTILE_PROFILES = Object.freeze(Object.fromEntries(
  Object.entries(profiles).map(([weaponId, profile]) => [weaponId, Object.freeze({weaponId,...profile})]),
));
const SAFE = Object.freeze({weaponId:'',...p('capsule',.40,.55,'tracer','none','beam','spark','基础圆头安全弹')});
const adapt = (base, values, feature) => ({...base,...values,signature:`${base.signature}；当前：${feature}`});

function resolveProfile(record = {}) {
  const raw = record?.shot?.weaponId || record?.weaponId || record?.sourceWeapon || '';
  const weaponId = typeof raw === 'string' ? raw.replace(/^spell_/, '') : '';
  // 万华转轮（试玩反馈："依旧是普通的子弹，没有说是全随机…没看到激光、也没看到陨石、也没看到召唤"）：
  // 机制侧确实按档位随机抽武器，但弹体外观一直用万华转轮自己的档案 → 玩家看不出抽到了什么。
  // 这里让"抽到的武器"决定弹体轮廓（同档位的激光/陨石/召唤因此一眼可辨）；颜色由实体 color 承担。
  const lotteryPick=record?.shot?.lottery?.borrowId||record?.shot?.mechanical?.lotteryPick;
  // card 0 = 子弹类（手枪/冲锋/步枪/机枪/狙击）→ 继承该枪自己的弹道轮廓；
  // card 1/2/3 = 爆破 / 装置(召唤·部署) / 能量(激光) → 交给下面 chamber_lottery 的 switch，
  // 用明显不同的轮廓（球 / 星 / 彗星），这样"抽到陨石法杖、召唤、毒圈那类"一眼可辨。
  const lotteryCard=record?.shot?.mechanical?.card;
  if(weaponId==='chamber_lottery'&&(lotteryCard===undefined||lotteryCard===0)&&typeof lotteryPick==='string'&&Object.hasOwn(PROJECTILE_PROFILES,lotteryPick)){
    const rolled=resolveProfile({...record,weaponId:lotteryPick,visualMode:undefined,
      shot:{...(record.shot||{}),weaponId:lotteryPick,mechanical:{...(record.shot?.mechanical||{}),lotteryPick:undefined}}});
    return adapt(rolled,{weaponId:'chamber_lottery'},'万华转轮：外观跟随所抽武器 '+lotteryPick);
  }
  const base = Object.hasOwn(PROJECTILE_PROFILES,weaponId) ? PROJECTILE_PROFILES[weaponId] : {...SAFE,weaponId};
  const shot=record?.shot||{}, precision=shot.precision||{}, geometry=shot.geometry||{}, energy=shot.energy||{}, mechanical=shot.mechanical||{};
  const mode=record?.visualMode;
  // Paid visualForm survives hero damage changes and later reloads. Older
  // snapshots without it use the registered default; do not guess from damage.
  switch (weaponId) {
    case 'plasma_repeater':
      if ((record.hit?.length||0)>0) return adapt(base,{radius:.40,length:.40,detail:'none'},'已穿首敌，缩核无环'); break;
    case 'rifle_carbine':
      if (precision.pierce===1) return adapt(base,{detail:'ring',length:.60},'第六发穿甲环'); break;
    case 'gauss_lancer':
      if (precision.heavy===true) return adapt(base,{radius:.52},'满蓄粗针'); break;
    case 'bell_sight':
      if (shot.dwellTarget) return adapt(base,{radius:.42},'瞄准完成粗针'); break;
    case 'hourhand_rifle':
      if (precision.damage===12) return adapt(base,{detail:'ring'},'合法节拍针环'); break;
    case 'patient_relic':
      if (precision.damage===18) return adapt(base,{radius:.42,length:.80},'位移蓄势粗长弹'); break;
    case 'window_keeper':
      if (precision.range===16) return adapt(base,{radius:.42,length:.45,detail:'ring'},'门边短重弹'); break;
    case 'last_witness':
      if (precision.damage===27) return adapt(base,{radius:.46,trail:'comet'},'三证齐全重针'); break;
    case 'ratchet_repeater':
      if (precision.count===3) return adapt(base,{shape:'sphere',radius:.30,length:.30},'第三拍横扇圆珠'); break;
    case 'relay_carbine':
      if (precision.relay===true) return adapt(base,{detail:'ring',length:.40},'令牌兑现三弹腰环'); break;
    case 'metronome_carbine':
      if (precision.damage===7) return adapt(base,{shape:'dart',detail:'ring',length:.62},'第三合法拍尖针'); break;
    case 'funnel_shotgun':
      if (shot.visualForm==='focused' || (!record.shot&&mode==='focused')) return adapt(base,{shape:'capsule',radius:.34,length:.60,detail:'ring'},'窄束三弹'); break;
    case 'backstep_bellows':
      if (geometry.retreat && (shot.unitId===0||shot.unitId===4)) return adapt(base,{shape:'sphere',radius:.34,length:.34,detail:'ring'},'后撤外沿短推击'); break;
    case 'breach_bucket':
      if (record.secondary===true) return adapt(base,{shape:'crystal',radius:.30,length:.48,detail:'none'},'墙面棱碎片'); break;
    case 'ring_shot':
      if (record.transformed===true) return adapt(base,{shape:'sphere',radius:.30,length:.30,detail:'none'},'过环横向展开'); break;
    case 'retrieval_saw': case 'boomerang_fork': case 'spiral_winch':
      if (record.phase==='return') return adapt(base,{detail:'ring',trail:'comet'},'回程接收环与彗尾'); break;
    case 'bank_stamp':
      if (record.secondary===true) return adapt(base,{shape:'dart',length:.62,detail:'none'},'墙碰派生双针'); break;
    case 'wall_clock':
      if (geometry.mark) return adapt(base,{shape:'dart',length:.78,detail:'ring'},'墙印射出长针'); break;
    case 'angle_debt':
      if (geometry.debt===true) return adapt(base,{shape:'crystal',detail:'ring'},'角债镜像棱晶'); break;
    case 'mirror_slug':
      if (record.phase==='wait') return adapt(base,{detail:'seal',trail:'none'},'折返准备方印');
      if (record.phase==='return') return adapt(base,{length:.40,trail:'comet'},'反向短芯'); break;
    case 'quarry_splitter':
      if (record.secondary===true) return adapt(base,{shape:'crystal',radius:.40,length:.60,detail:'none'},'墙面剥离棱片'); break;
    case 'storm_battery':
      if (energy.fork===true) return adapt(base,{radius:.52,length:.78},'满蓄分叉大电芯'); break;
    case 'tox_sprayer':
      if (energy.acid===true) return adapt(base,{detail:'ring'},'凝结后破膜腰环'); break;
    case 'spark_shuttle':
      if (energy.exit) return adapt(base,{shape:'fork',detail:'ring',length:.62},'主动截断出口叉芯');
      if (record.mechanic==='shuttle') return adapt(base,{detail:'ring'},'往返电梭腰环'); break;
    case 'steam_valve':
      if (energy.steam===true) return adapt(base,{shape:'flame',radius:.50,length:.74,detail:'ring'},'排压尖汽舌'); break;
    case 'wax_seal':
      if (shot.letter===true) return adapt(base,{shape:'comet',length:.72,trail:'comet'},'追信长彗芯封章'); break;
    case 'void_ripper':
      if (mechanical.target) return adapt(base,{detail:'ring'},'本人裂口追踪环'); break;
    case 'orbit_guard':
      if (record.mechanic==='released-orbit') return adapt(base,{trail:'comet',detail:'fins'},'已放出轨针彗尾'); break;
    case 'chase_comet':
      if (record.cometChecked===true && record.targetId) return adapt(base,{trail:'comet',detail:'ring'},'六单位后锁定追踪环'); break;
    case 'ring_satellite':
      if (record.mechanic==='satellite') return adapt(base,{shape:'dart',length:.76,detail:'fins'},'绕中心长卫星针'); break;
    case 'chain_harpoon':
      if (mechanical.hook===false) return adapt(base,{shape:'dart',radius:.50,length:.82,trail:'comet',detail:'ring'},'沿缆重尖弹'); break;
    case 'return_post':
      if (record.phase==='to-post'||record.phase==='after-post') return adapt(base,{shape:'comet',length:.74,trail:'comet',detail:record.phase==='after-post'?'ring':'seal'},record.phase==='after-post'?'过站转向环':'到站信弹封章'); break;
    case 'beacon_furnace':
      if (record.secondary===true) return adapt(base,{shape:'flame',radius:.32,length:.46,trail:'ember',detail:'spark'},'信标弱火伴弹'); break;
    case 'shield_lantern':
      if (record.converted===true) return adapt(base,{shape:'sphere',radius:.52,length:.52,trail:'plasma',detail:'ring',impact:'plasma'},'灯座转化宽光球'); break;
    case 'procession_drum':
      if (record.secondary===true) return adapt(base,{shape:'sphere',radius:.30,length:.30,detail:'ring'},'鼓卫短珠'); break;
    case 'recall_censer':
      if (mechanical.censerBoost===true) return adapt(base,{shape:'sphere',radius:.32,length:.32,trail:'ember',detail:'spark'},'回收积灰散珠'); break;
    case 'reversible_breech':
      if (shot.visualForm==='scatter' || (!record.shot&&mode==='scatter')) return adapt(base,{shape:'sphere',radius:.31,length:.31,detail:'none'},'散射模式三珠'); break;
    case 'escrow_cannon':
      if (mechanical.cash===true) return adapt(base,{radius:.50,length:.78,detail:'ring'},'第三发押注兑现重弹'); break;
    case 'empty_chamber':
      if (mechanical.shock===true) return adapt(base,{shape:'sphere',radius:.50,length:.50,detail:'ring'},'维护首发冲击珠'); break;
    case 'balance_ledger':
      if (mechanical.wide===true) return adapt(base,{shape:'sphere',radius:.32,length:.32,detail:'ring'},'高比例宽双珠'); break;
    case 'flywheel_vow':
      if (mechanical.wheel===true) return adapt(base,{shape:'dart',radius:.50,length:.85,detail:'ring'},'满轮重针'); break;
    case 'folding_pike':
      if (mechanical.stab===true) return adapt(base,{radius:.48,length:.85,line:'pulse',detail:'ring'},'蓄力短前刺'); break;
    case 'chamber_lottery': {
      const card=Number.isInteger(mechanical.card)?mechanical.card:mode;
      if (card===1||card==='scatter') return adapt(base,{shape:'sphere',radius:.32,length:.32,detail:'none'},'扇弹牌短珠');
      if (card===2||card==='bounce') return adapt(base,{shape:'star',radius:.46,length:.28,detail:'ring'},'跳弹牌扁星刃');
      // 2026-10-13：抽到能量/激光类 → 彗星芯；抽到爆破类 → 榴弹。避免"抽到激光/陨石却还是普通子弹样"。
      if (card===3||card==='energy') return adapt(base,{shape:'comet',radius:.44,length:.70,detail:'ring'},'能量牌彗星芯');
      if (card===4||card==='blast') return adapt(base,{shape:'grenade',radius:.42,length:.42,detail:'none'},'爆破牌榴弹芯');
      if (card===5||card==='artifact') return adapt(base,{shape:'crystal',radius:.50,length:.72,detail:'ring'},'神系晶核（四级抽取）'); break;
    }
    case 'reserve_mill':
      if (mechanical.milled===true) return adapt(base,{shape:'crystal',radius:.50,length:.78,detail:'ring'},'实际磨弹粗晶芯'); break;
    case 'split_escapement':
      if (mechanical.wide===true) return adapt(base,{shape:'sphere',radius:.32,length:.32,detail:'ring'},'宽态双珠'); break;
  }
  return {...base};
}

export function projectileProfile(record = {}) {
  const profile=resolveProfile(record);
  const raw=record?.shot?.weaponId||record?.weaponId||record?.sourceWeapon||'';
  if (record?.isSpell!==true && !(typeof raw==='string'&&raw.startsWith('spell_'))) return profile;
  // Translate ordinary physical ammunition into energy needles, while fire,
  // frost, electrical, crystal, fork and return silhouettes keep their mechanism.
  const values={};
  if (profile.shape==='capsule' && profile.trail==='tracer') values.shape='dart';
  if (profile.trail==='tracer') values.trail='plasma';
  const weakenedPlasma=profile.weaponId==='plasma_repeater'&&(record?.hit?.length||0)>0;
  if (profile.detail==='none'&&!weakenedPlasma) values.detail='ring';
  if (profile.impact==='spark') values.impact='plasma';
  return adapt(profile,values,'法术译形，保留原机制轮廓与能量标识');
}
