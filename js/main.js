/* ============================================================
   个人作品集 v2 · 交互脚本
   三件事：滚动入场动画 + 导航高亮 + 顶栏搜索跳转（均可安全降级）
   ============================================================ */
(function () {
  'use strict';

  /* 标记 JS 可用：入场动画的隐藏样式只在此标记下生效 */
  document.documentElement.classList.add('js');

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 滚动入场 ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll('.reveal')
  );

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. 导航高亮 ---------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.topnav a[href^="#"]')
  );

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          links.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    links.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { spy.observe(target); }
    });
  }

  /* ---------- 3. 顶栏搜索：关键词 → 区块跳转 ---------- */
  var input = document.getElementById('site-search');
  var wrap = document.querySelector('.search');

  var KEYWORD_MAP = [
    { id: 'about',   kw: ['简介', '关于', '介绍', '我是', '个人'] },
    { id: 'idea',    kw: ['理念', '创作', '学习', '方向', '态度', '代码', '项目'] },
    { id: 'archive', kw: ['档案', '课程', '技能', '成长', '在校', '主修'] },
    { id: 'contact', kw: ['联系', '邮箱', '微信', '方式', '简历', '合作'] }
  ];

  if (input && wrap) {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') { return; }
      var q = input.value.trim();
      if (!q) { return; }

      var hit = null;
      for (var i = 0; i < KEYWORD_MAP.length && !hit; i++) {
        for (var j = 0; j < KEYWORD_MAP[i].kw.length; j++) {
          if (q.indexOf(KEYWORD_MAP[i].kw[j]) > -1) {
            hit = KEYWORD_MAP[i].id;
            break;
          }
        }
      }

      var target = hit ? document.getElementById(hit) : null;
      if (target) {
        target.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start'
        });
        input.value = '';
      } else {
        /* 未命中：胶囊轻微晃动提示 */
        wrap.classList.remove('no-hit');
        void wrap.offsetWidth; /* 重新触发动画 */
        wrap.classList.add('no-hit');
      }
    });
  }
})();
