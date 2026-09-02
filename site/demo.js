(function () {
  var root = document.getElementById('demo');
  if (!root) return;

  var panels = root.querySelectorAll('[data-demo-panel]');
  var dots = root.querySelectorAll('[data-demo-dot]');
  var caption = document.getElementById('demo-caption');
  var back = document.getElementById('demo-back');
  var next = document.getElementById('demo-next');
  var pdfNote = document.getElementById('demo-pdf-note');
  var mockNav = root.querySelectorAll('[data-mock-nav]');
  var n = panels.length;
  var i = 0;

  var captions = [
    'Open on a customer, then start an estimate.',
    'Water, Cat 1, Class 2. Tax rate is suggested from the ZIP.',
    'Tick PPE and floor protection; set dehumidifier and air movers by the day.',
    'Living room: carpet extract, antimicrobial, an air mover in the room.',
    'The shop downloads a unit-priced PDF.'
  ];

  function go(to) {
    i = Math.max(0, Math.min(to, n - 1));
    panels.forEach(function (el, k) {
      el.hidden = k !== i;
    });
    dots.forEach(function (d, k) {
      if (k === i) d.setAttribute('aria-current', 'step');
      else d.removeAttribute('aria-current');
      d.classList.toggle('done', k < i);
    });
    if (caption) caption.textContent = captions[i] || '';
    if (back) back.disabled = i === 0;
    if (next) next.disabled = i === n - 1;
    var onCustomers = i === 0;
    mockNav.forEach(function (link) {
      if (link.getAttribute('data-mock-nav') === (onCustomers ? 'customers' : 'estimate')) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    if (pdfNote && i !== n - 1) pdfNote.hidden = true;
  }

  if (back) back.addEventListener('click', function () { go(i - 1); });
  if (next) next.addEventListener('click', function () { go(i + 1); });
  dots.forEach(function (d, k) {
    d.addEventListener('click', function () { go(k); });
  });
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-demo-advance]');
    if (t) {
      e.preventDefault();
      go(i + 1);
    }
    if (e.target.closest('#demo-pdf')) {
      e.preventDefault();
      if (pdfNote) pdfNote.hidden = false;
    }
  });
  root.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      go(i - 1);
    }
  });

  var start = 0;
  var q = new URLSearchParams(location.search).get('demo');
  if (q !== null && q !== '') {
    var n0 = parseInt(q, 10);
    if (!isNaN(n0)) start = n0;
  }
  go(start);
})();
