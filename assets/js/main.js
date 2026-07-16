/* 乐趣萌宠 - 前端交互脚本 */
(function () {
  'use strict';

  // 初始化 Lucide 图标
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // 移动端菜单：点击外部关闭
  function initMobileMenus() {
    var menus = document.querySelectorAll('details.mobile-menu, nav details');
    document.addEventListener('click', function (e) {
      menus.forEach(function (menu) {
        if (!menu.hasAttribute('open')) return;
        if (menu.contains(e.target)) return;
        menu.removeAttribute('open');
      });
    });
    // 点击菜单内链接后关闭
    menus.forEach(function (menu) {
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.removeAttribute('open');
        });
      });
    });
    // Esc 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      menus.forEach(function (menu) { menu.removeAttribute('open'); });
    });
  }

  // 萌宠图鉴：属性筛选
  function initPokedexFilter() {
    var grid = document.querySelector('[data-pokedex-grid]');
    if (!grid) return;
    var pills = document.querySelectorAll('[data-filter-pill]');
    var cards = grid.querySelectorAll('[data-pokemon-card]');

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var type = pill.getAttribute('data-type');
        pills.forEach(function (p) {
          p.classList.remove('is-active');
          p.setAttribute('aria-pressed', 'false');
          // 还原非激活样式
          p.style.background = p.getAttribute('data-inactive-bg') || '';
          p.style.borderColor = p.getAttribute('data-inactive-border') || '';
          p.style.color = p.getAttribute('data-inactive-color') || '';
        });
        pill.classList.add('is-active');
        pill.setAttribute('aria-pressed', 'true');
        pill.style.background = '';
        pill.style.borderColor = '';
        pill.style.color = '';

        cards.forEach(function (card) {
          var cardType = card.getAttribute('data-type');
          if (type === 'all' || cardType === type) {
            card.removeAttribute('data-type-hidden');
          } else {
            card.setAttribute('data-type-hidden', '1');
          }
        });
        // 联动搜索框：在新的筛选结果中重新应用搜索词
        var searchInput = document.getElementById('pokedex-search');
        if (searchInput) searchInput.dispatchEvent(new Event('input'));
      });
    });
  }

  // 新闻公告：分类筛选
  function initNewsFilter() {
    var list = document.querySelector('[data-news-list]');
    if (!list) return;
    var tabs = document.querySelectorAll('[data-news-tab]');
    var items = list.querySelectorAll('[data-news-item]');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var cat = tab.getAttribute('data-category');
        tabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
          t.style.background = '';
          t.style.color = '';
          t.style.border = '1px solid var(--color-border)';
          t.style.color = 'var(--color-text-secondary)';
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        tab.style.background = 'var(--gradient-warm)';
        tab.style.color = '#fff';
        tab.style.border = '1px solid transparent';

        items.forEach(function (item) {
          var itemCat = item.getAttribute('data-category');
          if (cat === 'all' || itemCat === cat) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 简单分页按钮反馈
  function initPagination() {
    document.querySelectorAll('[data-pagination] button').forEach(function (btn) {
      if (btn.hasAttribute('disabled') || btn.getAttribute('aria-current') === 'page') return;
      btn.addEventListener('click', function () {
        // 静态站点仅做视觉反馈，不真正跳转
        btn.style.opacity = '0.6';
        setTimeout(function () { btn.style.opacity = ''; }, 200);
      });
    });
  }

  // 兑换码一键复制
  function initCopyCodes() {
    var btns = document.querySelectorAll('.copy-code-btn');
    if (!btns.length) return;

    function showFeedback(btn, ok) {
      var textEl = btn.querySelector('.code-text');
      var original = textEl ? textEl.textContent : '';
      if (textEl) textEl.textContent = ok ? '已复制' : '复制失败';
      btn.classList.remove('copied', 'failed');
      btn.classList.add(ok ? 'copied' : 'failed');
      setTimeout(function () {
        if (textEl) textEl.textContent = original;
        btn.classList.remove('copied', 'failed');
      }, 1500);
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = btn.getAttribute('data-code') || '';
        if (!code) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(
            function () { showFeedback(btn, true); },
            function () { fallbackCopy(code, btn); }
          );
        } else {
          fallbackCopy(code, btn);
        }
      });
    });

    function fallbackCopy(text, btn) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        showFeedback(btn, ok);
      } catch (e) {
        showFeedback(btn, false);
      }
    }
  }

  function init() {
    initIcons();
    initMobileMenus();
    initPokedexFilter();
    initNewsFilter();
    initPagination();
    initCopyCodes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
