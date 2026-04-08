/* ================================================
   七宝的世界 — main.js  Pop Art Edition
   ================================================ */

// ===== 🎨 炫酷鼠标跟随动效 =====
(function initCursor() {
  // 创建元素
  const dot   = document.createElement('div');
  const ring  = document.createElement('div');
  const trail = [];
  const TRAIL_LEN = 10;

  dot.id  = 'cur-dot';
  ring.id = 'cur-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  // 残影粒子池
  for (let i = 0; i < TRAIL_LEN; i++) {
    const t = document.createElement('div');
    t.className = 'cur-trail';
    t.style.opacity = (1 - i / TRAIL_LEN) * 0.5;
    t.style.transform = `scale(${1 - i / TRAIL_LEN * 0.6})`;
    document.body.appendChild(t);
    trail.push({ el: t, x: -100, y: -100 });
  }

  // 注入 CSS
  const style = document.createElement('style');
  style.textContent = `
    * { cursor: none !important; }
    #cur-dot {
      position: fixed; pointer-events: none; z-index: 999999;
      width: 10px; height: 10px; border-radius: 50%;
      background: #FF1744;
      box-shadow: 0 0 12px #FF1744, 0 0 24px rgba(255,23,68,0.5);
      transform: translate(-50%,-50%);
      transition: width .15s, height .15s, background .2s;
      mix-blend-mode: multiply;
    }
    #cur-ring {
      position: fixed; pointer-events: none; z-index: 999998;
      width: 36px; height: 36px; border-radius: 50%;
      border: 2px solid #FFE500;
      box-shadow: 0 0 8px #FFE500, inset 0 0 8px rgba(255,229,0,0.2);
      transform: translate(-50%,-50%);
      transition: width .2s, height .2s, border-color .2s, box-shadow .2s;
      mix-blend-mode: multiply;
    }
    #cur-ring.hov {
      width: 56px; height: 56px;
      border-color: #FF1744;
      box-shadow: 0 0 16px #FF1744, inset 0 0 12px rgba(255,23,68,0.15);
    }
    #cur-ring.click {
      width: 18px; height: 18px;
      border-color: #0057FF;
      box-shadow: 0 0 20px #0057FF;
    }
    .cur-trail {
      position: fixed; pointer-events: none; z-index: 999990;
      width: 8px; height: 8px; border-radius: 50%;
      background: #FFE500;
      transform: translate(-50%,-50%);
      transition: none;
    }
    @media (hover: none) {
      #cur-dot, #cur-ring, .cur-trail { display: none !important; }
      * { cursor: auto !important; }
    }
  `;
  document.head.appendChild(style);

  let mx = -200, my = -200;
  let rx = -200, ry = -200;
  let history = Array(TRAIL_LEN).fill({ x: -200, y: -200 });
  let frame = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });

  // 悬停效果
  const hoverSels = 'a,button,.qn-item,.blog-card,.video-card,.proj-card,.g-item,.hobby-chip,.channel,.color-strip';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSels)) ring.classList.add('hov');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSels)) ring.classList.remove('hov');
  });

  // 点击爆炸效果
  document.addEventListener('mousedown', () => {
    ring.classList.add('click');
    dot.style.width = '14px';
    dot.style.height = '14px';
    dot.style.background = '#0057FF';
    // 爆炸粒子
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      const angle = (i / 8) * Math.PI * 2;
      const colors = ['#FF1744','#FFE500','#0057FF','#00E5FF','#FF4081','#00C853'];
      p.style.cssText = `
        position:fixed; pointer-events:none; z-index:999997;
        width:6px; height:6px; border-radius:50%;
        background:${colors[i % colors.length]};
        left:${mx}px; top:${my}px;
        transform:translate(-50%,-50%);
        animation: pop-burst 0.5s ease-out forwards;
      `;
      p.style.setProperty('--dx', Math.cos(angle) * 40 + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * 40 + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 520);
    }
  });
  document.addEventListener('mouseup', () => {
    ring.classList.remove('click');
    dot.style.width = '';
    dot.style.height = '';
    dot.style.background = '';
  });

  // 爆炸关键帧
  const kf = document.createElement('style');
  kf.textContent = `@keyframes pop-burst {
    0%   { transform: translate(-50%,-50%) scale(1); opacity:1; }
    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); opacity:0; }
  }`;
  document.head.appendChild(kf);

  // RAF 动画循环
  function animate() {
    // dot: 直接跟随
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    // ring: 弹性跟随（惯性）
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    // 残影历史
    history.unshift({ x: mx, y: my });
    history = history.slice(0, TRAIL_LEN);

    // 每2帧更新一次残影
    if (frame % 2 === 0) {
      trail.forEach((t, i) => {
        const pos = history[Math.min(i * 2 + 2, history.length - 1)];
        t.el.style.left = pos.x + 'px';
        t.el.style.top  = pos.y + 'px';
      });
    }
    frame++;
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== Navbar scroll =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ===== Page Navigation =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  const navLink = document.getElementById('nav-' + pageId);
  if (navLink) navLink.classList.add('active');

  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(triggerReveal, 80);
  return false;
}

// ===== Mobile Menu =====
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ===== Scroll Reveal =====
function triggerReveal() {
  const els = document.querySelectorAll('.page.active .reveal:not(.visible)');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  els.forEach(el => observer.observe(el));
}
window.addEventListener('load', triggerReveal);
window.addEventListener('scroll', triggerReveal, { passive: true });

// ===== Form submit =====
async function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submitText');
  if (!btn) return;
  const orig = btn.textContent;
  const form = e.target;
  const button = btn.closest('button');

  // 收集表单数据
  const inputs = form.querySelectorAll('input, textarea');
  const name    = inputs[0] ? inputs[0].value.trim() : '';
  const contact = inputs[1] ? inputs[1].value.trim() : '';
  const message = inputs[2] ? inputs[2].value.trim() : '';

  btn.textContent = '发送中...';
  button.disabled = true;

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: '0611ec50-d9bb-4d64-a95d-25892e5bd9ac',
        subject: '【七宝主页】新留言来啦 🌟',
        from_name: name || '访客',
        name: name,
        contact: contact,
        message: message,
      }),
    });
    const data = await res.json();
    if (data.success) {
      btn.textContent = '✓ 已发送！';
      button.style.background = '#22c55e';
      form.reset();
      setTimeout(() => {
        btn.textContent = orig;
        button.style.background = '';
        button.disabled = false;
      }, 3000);
    } else {
      throw new Error(data.message || '发送失败');
    }
  } catch (err) {
    btn.textContent = '发送失败，请重试';
    button.style.background = '#ef4444';
    button.disabled = false;
    setTimeout(() => {
      btn.textContent = orig;
      button.style.background = '';
    }, 3000);
  }
}

// ===== Gallery Filter =====
function filterGallery(cat, btn) {
  document.querySelectorAll('.gtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.g-item').forEach(item => {
    item.classList.toggle('hidden', cat !== 'all' && item.dataset.cat !== cat);
  });
}

// ===== 今日运势 =====
const FORTUNES = [
  {
    overall: 5, keyword: '势不可挡',
    career: '今天工作状态满格！创意迸发，和同事配合默契，推进中的项目有重大突破，领导对你刮目相看。',
    love: '感情甜蜜，对方主动示好，气氛温馨浪漫。单身的你今天异性缘极佳，说不定有惊喜邂逅！',
    wealth: '财运旺盛，有意外之财的可能，之前的投入有望收到回报。适合签合同、谈合作。',
    health: '精力充沛，运动效果翻倍，今天训练特别带劲。记得补充水分，保持好状态！',
  },
  {
    overall: 5, keyword: '万事皆顺',
    career: '决策力超强，今天做的判断十拿九稳。上司欣赏你的表现，升职加薪的好消息不远了！',
    love: '伴侣关系升温，一起做一件浪漫的小事会带来惊喜。今天说出心里话，对方一定感动。',
    wealth: '偏财运强，今天买彩票或者处理财务都比较顺利，收入有所增加，可以适当犒劳自己。',
    health: '身心舒畅，面色红润，走到哪里都是全场最亮的那颗星。适合尝试新运动项目！',
  },
  {
    overall: 4, keyword: '锐意进取',
    career: '思路清晰，执行力超强。今天完成了一直拖着的难题，成就感满满，同事都向你取经。',
    love: '感情稳定，互相理解多一些，小矛盾也会迎刃而解。适合计划一次浪漫的短途旅行。',
    wealth: '财运平稳偏旺，日常开销顺畅，有小额意外收入。投资方面不妨稳中求胜。',
    health: '状态不错，适合今天安排健身或户外活动，拳击和 Crossfit 都能出好成绩！',
  },
  {
    overall: 5, keyword: '耀眼全场',
    career: '今天你是全场焦点！演讲汇报表现出色，得到多方认可，工作积极推进，好消息接连而来。',
    love: '桃花运爆棚，魅力值MAX。情侣间有浪漫惊喜，单身的你今天出门绝对有人对你一见钟情。',
    wealth: '钱包鼓鼓，花钱有节制的同时也会有意外进账。今天谈价格、签协议都有利于你。',
    health: '元气满满，睡眠质量极佳，整个人神采飞扬。适合今天试试潜水或冲浪这类挑战性运动！',
  },
  {
    overall: 4, keyword: '稳步向前',
    career: '踏实努力的付出今天得到了肯定，项目按计划推进，人际关系融洽。积累厚度，厚积薄发。',
    love: '感情如细水长流，平淡中见真情。今天适合和爱人做顿饭、聊聊未来计划。',
    wealth: '收支平衡，财务状况健康。现在是规划未来财富的好时机，不妨列一个小目标清单。',
    health: '身体状态良好，注意劳逸结合。今天烹饪一顿营养均衡的美食犒赏自己吧！',
  },
];

function getTodayFortune() {
  const d = new Date();
  const idx = (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate() + Math.floor(Math.random() * 2)) % FORTUNES.length;
  return FORTUNES[idx];
}

function renderFortune(f) {
  const d = new Date();
  const dateStr = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · 今日运势`;
  document.getElementById('fortuneDate').textContent = dateStr;

  const stars = Array.from({length: 5}, (_, i) =>
    `<div class="fortune-star${i < f.overall ? '' : ' dim'}">★</div>`
  ).join('');

  document.getElementById('fortuneBody').innerHTML = `
    <div class="fortune-stars">${stars}</div>
    <div class="fortune-item">
      <span class="fi-label">事业</span>
      <span class="fi-text">${f.career}</span>
    </div>
    <div class="fortune-item">
      <span class="fi-label">感情</span>
      <span class="fi-text">${f.love}</span>
    </div>
    <div class="fortune-item">
      <span class="fi-label">财运</span>
      <span class="fi-text">${f.wealth}</span>
    </div>
    <div class="fortune-item">
      <span class="fi-label">健康</span>
      <span class="fi-text">${f.health}</span>
    </div>
    <div style="text-align:center;margin-top:1.2rem;">
      <span class="fortune-keyword">${f.keyword}</span>
    </div>
  `;
}

function openFortune() {
  renderFortune(getTodayFortune());
  document.getElementById('fortuneModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFortune(e) {
  if (e && e.target !== document.getElementById('fortuneModal')) return;
  document.getElementById('fortuneModal').classList.remove('open');
  document.body.style.overflow = '';
}

function refreshFortune() {
  const card = document.getElementById('fortuneCard');
  card.style.animation = 'none';
  requestAnimationFrame(() => {
    card.style.animation = 'popIn 0.3s ease';
    renderFortune(getTodayFortune());
  });
}

// ===== Keyboard =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('navLinks').classList.remove('open');
});

// ===== Blog 搜索过滤 =====
function filterBlogs(keyword) {
  const q = keyword.trim().toLowerCase();
  const featured = document.querySelector('.blog-featured');
  const cards = document.querySelectorAll('.blog-card');
  const noResult = document.getElementById('blogNoResult');

  function matchEl(el) {
    if (!q) return true;
    const title    = (el.dataset.title    || '').toLowerCase();
    const keywords = (el.dataset.keywords || '').toLowerCase();
    const text     = el.innerText.toLowerCase();
    return title.includes(q) || keywords.includes(q) || text.includes(q);
  }

  // 搜索 featured
  let visibleCount = 0;
  if (featured) {
    const show = matchEl(featured);
    featured.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  }

  // 搜索普通卡片
  cards.forEach(card => {
    const show = matchEl(card);
    card.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  // 无结果提示
  if (noResult) noResult.style.display = (q && visibleCount === 0) ? '' : 'none';

  // 清除按钮显隐
  const clearBtn = document.querySelector('.blog-search-clear');
  if (clearBtn) clearBtn.style.opacity = q ? '0.6' : '';
}

function clearBlogSearch() {
  const input = document.querySelector('.blog-search-input');
  if (input) {
    input.value = '';
    filterBlogs('');
    input.focus();
  }
}
