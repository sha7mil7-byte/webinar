'use strict';
(function () {
  var tg = (window.Telegram && window.Telegram.WebApp) || null;
  var $ = function (id) { return document.getElementById(id); };
  var all = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var ver = function (v) { try { return !!(tg && tg.isVersionAtLeast && tg.isVersionAtLeast(v)); } catch (e) { return false; } };
  var inTg = !!(tg && tg.initData);
  var useMain = inTg && !/[?&]btn=1/.test(location.search) && ver('6.1');
  var REG = 'https://mansur-halalinvest.getcourse.ru/vibecoding_veb'; // страница регистрации в GetCourse
  var cfg = null;

  /* ---------- Telegram: тема, размер ---------- */
  function applyTheme() {
    var dark = tg && tg.colorScheme ? tg.colorScheme === 'dark' : window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var bg = dark ? '#101714' : '#f4f8f5';
    try { if (tg) { tg.setHeaderColor && tg.setHeaderColor(bg); tg.setBackgroundColor && tg.setBackgroundColor(bg); if (ver('7.10')) tg.setBottomBarColor(bg); } } catch (e) {}
  }
  if (tg) { try { tg.ready(); tg.expand(); tg.onEvent && tg.onEvent('themeChanged', applyTheme); } catch (e) {} }
  applyTheme();
  var tap = function () { try { if (ver('6.1')) tg.HapticFeedback.impactOccurred('light'); } catch (e) {} };

  /* ---------- внешние ссылки: в Telegram открываем через openLink ---------- */
  function open(url) {
    tap();
    try { if (inTg && tg.openLink) { tg.openLink(url); return true; } } catch (e) {}
    return false;
  }
  all('[data-reg], [data-ext]').forEach(function (a) {
    a.addEventListener('click', function (e) { if (open(a.getAttribute('href') || REG)) e.preventDefault(); });
  });
  if (useMain) {
    $('fixbar').hidden = true;
    var mb = tg.MainButton;
    mb.setText('Зарегистрироваться бесплатно');
    try { if (ver('7.10')) mb.setParams({ has_shine_effect: true }); } catch (e) {}
    mb.onClick(function () { open(REG); });
    mb.show();
    document.body.style.paddingBottom = 'calc(var(--sab) + 80px)';
  }

  /* ---------- дата и таймер ---------- */
  function whenLabel() {
    if (!cfg || !cfg.startsAt) return ((cfg && cfg.dayText) || '28 октября') + ' · время объявим в Telegram';
    return new Date(cfg.startsAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + ' (МСК)';
  }
  function setNum(el, v) {
    if (el.textContent === v) return;
    el.textContent = v; el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
  }
  function tick() {
    if (!cfg || !cfg.startsAt) return;
    var left = new Date(cfg.startsAt).getTime() - Date.now(), over = left <= 0;
    $('timer').hidden = over; $('timer2').hidden = over; $('live').hidden = !over;
    if (over) return;
    var m = Math.floor(left / 60000);
    var d = String(Math.floor(m / 1440)), h = String(Math.floor((m % 1440) / 60)).padStart(2, '0'), mi = String(m % 60).padStart(2, '0');
    setNum($('t-d'), d); setNum($('t-h'), h); setNum($('t-m'), mi);
    setNum($('u-d'), d); setNum($('u-h'), h); setNum($('u-m'), mi);
  }

  /* ---------- появление при прокрутке ---------- */
  (function reveal() {
    all('.stag').forEach(function (box) {
      Array.prototype.forEach.call(box.children, function (c, i) { c.style.transitionDelay = i * 90 + 'ms'; });
    });
    var els = all('.rv, .stag');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- старт: дата и время вебинара заданы здесь (страница без сервера) ---------- */
  cfg = { dayText: '28 октября', startsAt: '2026-10-28T20:00:00+03:00' };
  $('f-title').textContent = cfg.dayText + ' — ждём вас';
  $('fact-when').textContent = '';
  $('fact-when').append(cfg.dayText, document.createElement('br'), 'в 20:00 (МСК)');
  $('f-when').textContent = whenLabel();
  $('timer').hidden = false; $('timer2').hidden = false;
  tick(); setInterval(tick, 1000);
})();
