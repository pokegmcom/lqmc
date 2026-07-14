/* 乐趣萌宠 - 萌宠图鉴 PokéAPI 对接 + 详情弹窗 + 搜索
   说明：PokéAPI 中文(zh-Hans)数据稀疏且官方原画托管于 githubusercontent（国内访问不稳定），
   故采用：主图用本地卡片图保证显示；名字/特性优先本地中文字典，API 中文作为补充；
   描述/genus 优先 API zh-Hans→zh-Hant，无中文则不显示该段，避免出现英文。 */
(function () {
  'use strict';

  // ===== 本地中文名映射（按 PokéAPI id，保证名字一定显示中文）=====
  var LOCAL_NAMES = {
    1: '妙蛙种子', 2: '妙蛙草', 3: '妙蛙花',
    4: '小火龙', 5: '火恐龙', 6: '喷火龙',
    7: '杰尼龟', 8: '卡咪龟', 9: '水箭龟',
    25: '皮卡丘', 26: '雷丘',
    94: '耿鬼', 130: '暴鲤龙', 133: '伊布', 143: '卡比兽',
    149: '快龙', 150: '超梦', 393: '波加曼', 448: '路卡利欧', 658: '甲贺忍蛙'
  };

  // ===== 属性名称映射（PokéAPI 英文 → 中文）=====
  var TYPE_NAMES_ZH = {
    normal: '一般', fire: '火', water: '水', electric: '电', grass: '草',
    ice: '冰', fighting: '格斗', poison: '毒', ground: '地面', flying: '飞行',
    psychic: '超能', bug: '虫', rock: '岩石', ghost: '幽灵', dragon: '龙',
    dark: '恶', steel: '钢', fairy: '妖精'
  };

  // 属性渐变色（与设计系统一致）
  var TYPE_GRADIENTS = {
    normal: 'linear-gradient(135deg,#BCAAA4,#8D6E63)',
    fire: 'linear-gradient(135deg,#FFB74D,#FF7043)',
    water: 'linear-gradient(135deg,#4FC3F7,#0288D1)',
    electric: 'linear-gradient(135deg,#FFD54F,#FFB300)',
    grass: 'linear-gradient(135deg,#81C784,#388E3C)',
    ice: 'linear-gradient(135deg,#81D4FA,#0288D1)',
    fighting: 'linear-gradient(135deg,#4DB6AC,#00695C)',
    poison: 'linear-gradient(135deg,#BA68C8,#6A1B9A)',
    ground: 'linear-gradient(135deg,#A1887F,#5D4037)',
    flying: 'linear-gradient(135deg,#90CAF9,#1976D2)',
    psychic: 'linear-gradient(135deg,#9575CD,#512DA8)',
    bug: 'linear-gradient(135deg,#AED581,#558B2F)',
    rock: 'linear-gradient(135deg,#BCAAA4,#6D4C41)',
    ghost: 'linear-gradient(135deg,#BA68C8,#7B1FA2)',
    dragon: 'linear-gradient(135deg,#7986CB,#3949AB)',
    dark: 'linear-gradient(135deg,#757575,#424242)',
    steel: 'linear-gradient(135deg,#90A4AE,#546E7A)',
    fairy: 'linear-gradient(135deg,#F48FB1,#C2185B)'
  };

  // ===== 特性中英字典（覆盖常见特性，回退用）=====
  var ABILITIES_ZH = {
    'overgrow': '茂盛', 'blaze': '猛火', 'torrent': '激流', 'shield-dust': '鳞粉',
    'shed-skin': '蜕皮', 'compound-eyes': '复眼', 'swarm': '虫之预感', 'run-away': '逃跑',
    'guts': '毅力', 'hustle': '全力', 'intimidate': '威吓', 'static': '静电',
    'lightning-rod': '避雷针', 'sand-stream': '扬沙', 'sand-veil': '沙隐',
    'poison-point': '毒刺', 'rivalry': '斗争心', 'inner-focus': '精神力',
    'keen-eye': '锐利目光', 'tangled-feet': '蹒跚', 'big-pecks': '胸甲',
    'pure-power': '纯粹之力', 'damp': '湿气', 'cloud-nine': '无关天气',
    'swift-swim': '悠游自如', 'rain-dish': '雨盘', 'hydrate': '储水',
    'sticky-hold': '黏着', 'pulling': '吸盘', 'threaten': '威吓',
    'cute-charm': '迷人之躯', 'magic-guard': '魔法防守', 'wonder-skin': '奇迹皮肤',
    'immunity': '免疫', 'thick-fat': '厚脂肪', 'gluttony': '贪吃鬼',
    'unnerve': '紧逼感', 'pickpocket': '顺手牵羊', 'gluttony': '贪吃鬼',
    'multiscale': '多重鳞片', 'pressure': '压迫感', 'unaware': '纯朴',
    'defiant': '不服输', 'steadfast': '不屈之心', 'speed-boost': '加速',
    'battle-armor': '战斗盔甲', 'sturdy': '结实', 'dazzling': '耀眼',
    'storm-drain': '引水', 'water-absorb': '储水', 'adaptability': '适应力',
    'anticipation': '预知梦', 'forewarn': '危险预知', 'frisk': '察言观色',
    'trace': '复制', 'synchronize': '同步', 'natural-cure': '自然回复',
    'levitate': '漂浮', 'flash-fire': '引火', 'flame-body': '火焰之躯',
    'drought': '日照', 'solar-power': '太阳之力', 'aftermath': '引爆',
    'pickup': '捡拾', 'technician': '技术高手', 'mold-breaker': '破格',
    'scrappy': '胆量', 'huge-power': '大力士', 'sweet-veil': '甜幕',
    'aroma-veil': '芳香幕', 'flower-veil': '花幕', 'grass-pelt': '草之毛皮',
    'harvest': '收获', 'frisk': '察言观色', 'telepathy': '心灵感应',
    ' justified': '正义之心', 'weak-armor': '碎裂铠甲', 'curse': '诅咒',
    'iron-barbs': '铁刺', 'rough-skin': '粗糙肌肤', 'prankster': '恶作剧之心',
    'sand-force': '沙之力', 'sheer-force': '强行', 'contrary': '反 BALL',
    'simple': '单纯', 'unburden': '轻装', 'moxie': '自信过度',
    'anger-point': '愤怒穴道', 'snow-cloak': '雪隐', 'snow-warning': '降雪',
    'tinted-lens': '有色眼镜', 'filter': '过滤', 'slow-start': '慢启动',
    'motor-drive': '电气引擎', 'solid-rock': '坚硬脑袋', 'wonder-guard': '神奇守护',
    'forecast': '天气预报', 'flower-gift': '花之礼', 'multitype': '多属性',
    'zen-mode': '达摩模式', 'victory-star': '胜利之星', 'illusion': '幻觉',
    'infiltrator': '穿透', 'teravolt': '兆级电压', 'turboblaze': '涡轮火焰',
    'aroma-veil': '芳香幕', 'flower-veil': '花幕', 'cheek-pouch': '颊囊',
    'protean': '变幻自如', 'furfrou-coat': '毛皮大衣',
    'strong-jaw': '强壮之颚', 'mega-launcher': '超级发射器',
    'grass-pelt': '草之毛皮', 'symbiosis': '共生', 'tough-claws': '硬爪',
    'pixilate': '妖精皮肤', 'gooey': '黏滑', 'parental-bond': '亲子爱',
    'aerilate': '飞行皮肤', 'refrigerate': '冷冻皮肤', 'normalize': '一般皮肤',
    'stance-change': '战斗切换', 'gale-wings': '疾风之翼', 'magician': '魔术师',
    'bulletproof': '防弹', 'competitive': '好胜', 'sticky-hold': '黏着',
    'sweet-veil': '甜幕', 'aura-break': '气场破坏', 'dark-aura': '暗黑气场',
    'fairy-aura': '妖精气场', 'primordial-sea': '始源之海',
    'desolate-land': '终结之地', 'delta-stream': '三角气流',
    'battle-bond': '战斗羁绊', 'shadow-shield': '影子盾甲', 'power-construct': '群聚变形',
    'schooling': '鱼群', 'berserk': '怒火冲天', 'surge-surfer': '冲浪之尾',
    'battery': '蓄电池', 'liquid-voice': '液态之声', 'dancer': '舞者',
    'corrosion': '腐蚀', 'comatose': '绝对睡眠', 'queenly-majesty': '女王的威严',
    'infiltrator': '穿透', 'water-compaction': '遇水凝固', 'stakeout': '蹲守',
    'mimicry': '拟态', 'rattled': '胆怯', 'ball-fetch': '捡球',
    'cotton-down': '棉絮', 'mirror-armor': '镜甲', 'gulp-missile': '一发导弹',
    'steam-engine': '蒸汽机', 'punk-rock': '朋克摇滚', 'sand-spit': '吐沙',
    'ice-scales': '冰鳞', 'rice-body': '米质之躯', 'hunger-switch': '饥饿开关',
    'pastel-veil': '彩幕', 'neutering-blast': '中和', 'steam-power': '蒸汽机',
    'perish-body': '亡躯', 'wandering-spirit': '游魂', 'gorilla-tactics': '猩猩战术',
    'neutralizing-gas': '化学气体', 'intrepid-sword': '不挠之剑', 'dauntless-shield': '不屈之盾',
    'libero': '自由者', 'ball-fetch': '捡球', 'cotton-down': '棉絮',
    'propeller-tail': '螺旋尾鳍', 'gigantamax': '极巨化', 'intrepid-sword': '不挠之剑',
    'undaunted': '不屈之盾', 'armor-tail': '尾甲', 'costar': '协力',
    'hospitality': '好客', 'mind-s-eye': '心眼', 'sharpness': '锋锐',
    'supreme-overlord': '至高意志', 'costar': '协力', 'toxic-debris': '毒满地',
    'armor-tail': '尾甲', 'earth-eater': '食土', 'mycelium-might': '菌丝之力',
    'minds-eye': '心眼', 'supreme-overlord': '至高意志', 'zero-to-hero': '从零到英雄',
    'commander': '司令', 'poison-puppeteer': '毒傀儡', 'toxic-chain': '毒锁链',
    'hospitality': '好客', 'embody-aspect': '现身姿态', 'opportunist': '伺机而动',
    'super-sweet-syrup': '超级糖浆', 'hospitality': '好客', 'lingering-aroma': '余香',
    'seed-sower': '播种', 'hospitality': '好客', 'thermal-exchange': '热交换',
    'anger-shell': '怒甲', 'purifying-salt': '净化盐', 'well-baked-body': '烤焦之躯',
    'wind-rider': '乘风', 'guard-dog': '看门狗', 'rocky-payload': '岩石负载',
    'wind-power': '风力', 'zero-to-hero': '从零到英雄', 'hospitality': '好客'
  };

  // 能力值名称映射
  var STAT_NAMES_ZH = {
    hp: 'HP', attack: '攻击', defense: '防御',
    'special-attack': '特攻', 'special-defense': '特防', speed: '速度'
  };

  var API_BASE = 'https://pokeapi.co/api/v2';
  var cache = {};
  var modal, modalContent, lastFocused;

  // 取中文名称 / 描述 / 分类（优先 zh-Hans → zh-Hant → 空，不回退英文）
  function pickZh(arr, key) {
    var item = arr.filter(function (x) { return x.language && x.language.name === 'zh-Hans'; })[0];
    if (item) return item[key];
    item = arr.filter(function (x) { return x.language && x.language.name === 'zh-Hant'; })[0];
    if (item) return item[key];
    return '';
  }

  // 拉取单只宝可梦数据（pokemon + species 并行请求，结果缓存）
  function fetchPokemon(id, localName) {
    var key = String(id);
    if (cache[key]) return cache[key];
    cache[key] = Promise.all([
      fetch(API_BASE + '/pokemon/' + id).then(function (r) { if (!r.ok) throw new Error('pokemon'); return r.json(); }),
      fetch(API_BASE + '/pokemon-species/' + id).then(function (r) { if (!r.ok) throw new Error('species'); return r.json(); })
    ]).then(function (res) {
      var poke = res[0], species = res[1];
      // 名字优先级：API zh-Hans → 本地映射 → 本地名 → API en
      var apiName = pickZh(species.names, 'name');
      var name = apiName || LOCAL_NAMES[id] || localName || poke.name;
      var genus = pickZh(species.genera, 'genus');
      var flavor = pickZh(species.flavor_text_entries, 'flavor_text');
      flavor = flavor ? flavor.replace(/[\f\n\r]/g, ' ').replace(/\s+/g, ' ').trim() : '';
      // 特性中文名：本地字典 → 无则留空
      var abilities = poke.abilities.map(function (a) {
        var en = a.ability.name;
        var zh = ABILITIES_ZH[en] || '';
        return { en: en, zh: zh };
      });
      return {
        id: poke.id,
        name: name,
        enName: poke.name,
        genus: genus,
        types: poke.types.map(function (t) { return t.type.name; }),
        stats: poke.stats.map(function (s) { return { name: s.stat.name, value: s.base_stat }; }),
        height: (poke.height / 10).toFixed(1),   // 米
        weight: (poke.weight / 10).toFixed(1),   // 千克
        abilities: abilities,
        description: flavor
      };
    }).catch(function (e) {
      cache[key] = null;
      throw e;
    });
    return cache[key];
  }

  // 构建属性标签 HTML
  function typeBadgesHtml(types) {
    return types.map(function (t) {
      var zh = TYPE_NAMES_ZH[t] || t;
      var grad = TYPE_GRADIENTS[t] || 'var(--gradient-warm)';
      return '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white" style="background:' + grad + ';">' + zh + '系</span>';
    }).join('');
  }

  // 构建能力值条 HTML
  function statsHtml(stats) {
    var MAX = 200;
    return stats.map(function (s) {
      var zh = STAT_NAMES_ZH[s.name] || s.name;
      var pct = Math.min(100, (s.value / MAX) * 100);
      var color = s.value >= 100 ? 'var(--color-primary-dark)' : (s.value >= 70 ? 'var(--color-primary)' : 'var(--state-info)');
      return '<div>'
        + '<div class="flex justify-between text-xs mb-1">'
        + '<span style="color: var(--color-text-secondary);">' + zh + '</span>'
        + '<span class="font-bold" style="color: var(--color-text-primary);">' + s.value + '</span>'
        + '</div>'
        + '<div class="stat-bar-track"><div class="stat-bar-fill" style="width:' + pct + '%; background:' + color + ';"></div></div>'
        + '</div>';
    }).join('');
  }

  // 渲染弹窗内容（主图用本地卡片图，保证显示）
  function renderModal(data, fallbackImg, fallbackName) {
    var nameText = data.name || fallbackName;
    var idStr = '#' + String(data.id).padStart(4, '0');
    // 主图直接用本地卡片图，避免 githubusercontent 超时
    var img = fallbackImg;
    var html =
      '<div class="text-center pt-6 pb-4 px-6" style="background: var(--color-bg-secondary);">'
      + '<img src="' + img + '" alt="' + nameText + '萌宠形象" class="w-40 h-40 mx-auto object-contain" loading="lazy">'
      + '<div class="text-xs mt-2" style="color: var(--color-text-tertiary);">' + idStr + '</div>'
      + '<h3 class="text-2xl font-black mt-1" style="color: var(--color-text-primary);">' + nameText + '</h3>'
      + (data.enName ? '<div class="text-xs mt-0.5 capitalize" style="color: var(--color-text-tertiary);">' + data.enName + '</div>' : '')
      + (data.genus ? '<div class="text-xs mt-1" style="color: var(--color-text-secondary);">' + data.genus + '</div>' : '')
      + '<div class="flex justify-center gap-2 mt-3 flex-wrap">' + typeBadgesHtml(data.types) + '</div>'
      + '</div>'
      + '<div class="p-6 space-y-5">'
      + (data.description ? '<p class="text-sm leading-relaxed" style="color: var(--color-text-secondary);">' + data.description + '</p>' : '')
      + '<div class="grid grid-cols-2 gap-3">'
      + '<div class="rounded-lg p-3 text-center" style="background: var(--color-bg-secondary);">'
      + '<div class="text-xs" style="color: var(--color-text-tertiary);">身高</div>'
      + '<div class="font-bold mt-0.5" style="color: var(--color-text-primary);">' + data.height + ' m</div>'
      + '</div>'
      + '<div class="rounded-lg p-3 text-center" style="background: var(--color-bg-secondary);">'
      + '<div class="text-xs" style="color: var(--color-text-tertiary);">体重</div>'
      + '<div class="font-bold mt-0.5" style="color: var(--color-text-primary);">' + data.weight + ' kg</div>'
      + '</div>'
      + '</div>'
      + (data.abilities.length ? '<div>'
      + '<div class="text-xs font-bold mb-2" style="color: var(--color-text-secondary);">特性</div>'
      + '<div class="flex flex-wrap gap-2">' + data.abilities.map(function (a) {
        var label = a.zh || a.en.replace(/-/g, ' ');
        return '<span class="px-3 py-1 rounded-full text-xs" style="background: var(--color-primary-bg); color: var(--color-primary-dark);">' + label + '</span>';
      }).join('') + '</div></div>' : '')
      + '<div>'
      + '<div class="text-xs font-bold mb-3" style="color: var(--color-text-secondary);">基础能力值</div>'
      + '<div class="space-y-2.5">' + statsHtml(data.stats) + '</div>'
      + '</div>'
      + '<p class="text-center text-xs pt-2" style="color: var(--color-text-tertiary); border-top: 1px solid var(--color-border-subtle);">能力数据来源：<a href="https://pokeapi.co" target="_blank" rel="noopener" style="color: var(--color-primary);">PokéAPI</a></p>'
      + '</div>';
    modalContent.innerHTML = html;
    // 触发数值条动画
    requestAnimationFrame(function () {
      var fills = modalContent.querySelectorAll('.stat-bar-fill');
      fills.forEach(function (f) {
        var w = f.style.width;
        f.style.width = '0';
        requestAnimationFrame(function () { f.style.width = w; });
      });
    });
  }

  // 渲染加载态
  function renderLoading() {
    modalContent.innerHTML =
      '<div class="py-16 flex flex-col items-center gap-3">'
      + '<div class="spinner"></div>'
      + '<p class="text-sm" style="color: var(--color-text-secondary);">正在获取萌宠数据…</p>'
      + '</div>';
  }

  // 渲染错误态（离线 / 接口异常时回退到本地信息）
  function renderError(fallbackImg, fallbackName, fallbackType) {
    var zh = TYPE_NAMES_ZH[fallbackType] || fallbackType;
    modalContent.innerHTML =
      '<div class="text-center pt-6 pb-4 px-6" style="background: var(--color-bg-secondary);">'
      + '<img src="' + fallbackImg + '" alt="' + fallbackName + '萌宠形象" class="w-32 h-32 mx-auto object-contain">'
      + '<h3 class="text-2xl font-black mt-2" style="color: var(--color-text-primary);">' + fallbackName + '</h3>'
      + '<span class="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-medium text-white" style="background:' + (TYPE_GRADIENTS[fallbackType] || 'var(--gradient-warm)') + ';">' + zh + '系</span>'
      + '</div>'
      + '<div class="p-6">'
      + '<p class="text-sm text-center" style="color: var(--color-text-tertiary);">接口暂时无法连接，仅显示本地信息。请稍后重试。</p>'
      + '</div>';
  }

  // 打开弹窗
  function openModal(card) {
    if (!modal) return;
    var id = card.getAttribute('data-pokemon-id');
    var fallbackImg = card.querySelector('img').getAttribute('src');
    var fallbackName = card.querySelector('.font-bold').textContent.trim();
    var fallbackType = card.getAttribute('data-type');

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    renderLoading();

    fetchPokemon(id, fallbackName).then(function (data) {
      renderModal(data, fallbackImg, fallbackName);
    }).catch(function () {
      renderError(fallbackImg, fallbackName, fallbackType);
    });

    // 焦点移到关闭按钮
    setTimeout(function () {
      var closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // 初始化卡片交互（点击 / 键盘）+ 弹窗事件
  function initModal() {
    modal = document.getElementById('pokemon-modal');
    if (!modal) return;
    modalContent = modal.querySelector('.modal-content');
    var closeBtn = modal.querySelector('.modal-close');

    var cards = document.querySelectorAll('[data-pokemon-card]');
    cards.forEach(function (card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', '查看 ' + (card.querySelector('.font-bold') ? card.querySelector('.font-bold').textContent.trim() : '') + ' 详情');
      card.addEventListener('click', function () { openModal(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  // 搜索：按名称 / 编号实时过滤
  function initSearch() {
    var input = document.getElementById('pokedex-search');
    if (!input) return;
    var cards = document.querySelectorAll('[data-pokemon-card]');
    var emptyTip = document.getElementById('pokedex-empty');

    function apply() {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        // 被属性筛选隐藏的卡片不参与搜索
        if (card.getAttribute('data-type-hidden') === '1') { card.style.display = 'none'; return; }
        var name = card.querySelector('.font-bold').textContent.trim().toLowerCase();
        var no = card.querySelector('.text-xs').textContent.trim().toLowerCase();
        var match = !q || name.indexOf(q) > -1 || no.indexOf(q) > -1;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (emptyTip) emptyTip.style.display = visible === 0 ? '' : 'none';
    }

    input.addEventListener('input', apply);
  }

  function init() {
    initModal();
    initSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
