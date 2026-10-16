// Pantalla de Inicio: lista giveaways, aplica filtros y carga por bloques.
(function () {
  'use strict';

  var listEl = document.getElementById('list');
  var statusEl = document.getElementById('status');
  var listCount = document.getElementById('listCount');
  var filtersForm = document.getElementById('filtersForm');
  var searchInput = document.getElementById('searchInput');
  var platformSelect = document.getElementById('platformSelect');
  var typeSelect = document.getElementById('typeSelect');
  var sortSelect = document.getElementById('sortSelect');
  var loadMoreWrap = document.getElementById('loadMoreWrap');
  var loadMoreBtn = document.getElementById('loadMoreBtn');

  var PAGE_SIZE = 12;
  var current = [];
  var visible = PAGE_SIZE;

  function setStatus(type, message) {
    if (!message) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      statusEl.className = 'status';
      return;
    }
    statusEl.hidden = false;
    statusEl.className = 'status status--' + type;
    statusEl.textContent = message;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadingCards(count) {
    var html = '';
    for (var i = 0; i < count; i++) {
      html +=
        '<div class="card card--skeleton">' +
          '<div class="card__img"></div>' +
          '<div class="card__body"><span class="sk sk--line"></span><span class="sk sk--line sk--short"></span></div>' +
        '</div>';
    }
    listEl.innerHTML = html;
  }

  function cardGiveaway(g) {
    var platforms = String(g.platforms || '')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .slice(0, 3)
      .map(function (n) { return '<span class="chip">' + escapeHtml(n) + '</span>'; })
      .join('');

    var type = g.type ? '<span class="chip chip--type">' + escapeHtml(g.type) + '</span>' : '';

    var img = g.image
      ? '<img src="' + escapeHtml(g.image) + '" alt="' + escapeHtml(g.title) + '" loading="lazy" />'
      : '<div class="card__noimg">Sin imagen</div>';

    var worth = g.worth && g.worth !== 'N/A'
      ? '<span class="badge badge--worth">' + escapeHtml(g.worth) + '</span>'
      : '<span class="badge badge--free">Gratis</span>';

    var claimed = g.users
      ? '<span>' + Number(g.users).toLocaleString('es') + ' reclamados</span>'
      : '<span></span>';

    return (
      '<a class="card" href="/giveaway?id=' + encodeURIComponent(g.id) + '">' +
        '<div class="card__img">' + img + worth + '</div>' +
        '<div class="card__body">' +
          '<h3 class="card__title">' + escapeHtml(g.title) + '</h3>' +
          '<div class="chips">' + type + platforms + '</div>' +
          '<div class="card__foot">' + claimed + '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function renderList() {
    var q = searchInput.value.trim().toLowerCase();
    var filtered = q
      ? current.filter(function (g) { return String(g.title).toLowerCase().indexOf(q) !== -1; })
      : current;

    listCount.textContent = filtered.length.toLocaleString('es') + ' giveaways';

    if (!filtered.length) {
      listEl.innerHTML = '';
      loadMoreWrap.hidden = true;
      setStatus(
        'empty',
        current.length
          ? 'Ningún giveaway coincide con el filtro ingresado.'
          : 'No hay giveaways activos en este momento. Intenta más tarde.'
      );
      return;
    }

    setStatus('', '');
    var slice = filtered.slice(0, visible);
    listEl.innerHTML = slice.map(cardGiveaway).join('');

    var remaining = filtered.length - slice.length;
    if (remaining > 0) {
      loadMoreWrap.hidden = false;
      loadMoreBtn.textContent = 'Cargar más (' + remaining.toLocaleString('es') + ' restantes)';
    } else {
      loadMoreWrap.hidden = true;
    }
  }

  async function load() {
    loadingCards(PAGE_SIZE);
    setStatus('', '');
    loadMoreWrap.hidden = true;

    var params = new URLSearchParams();
    if (platformSelect.value) params.set('platform', platformSelect.value);
    if (typeSelect.value) params.set('type', typeSelect.value);
    if (sortSelect.value) params.set('sort', sortSelect.value);

    try {
      var res = await fetch('/api/giveaways' + (params.toString() ? '?' + params.toString() : ''));
      var data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo cargar la lista.');

      current = data.results || [];
      visible = PAGE_SIZE;
      renderList();
    } catch (err) {
      listEl.innerHTML = '';
      listCount.textContent = '';
      loadMoreWrap.hidden = true;
      setStatus('error', 'Error: ' + err.message);
    }
  }

  filtersForm.addEventListener('submit', function (e) {
    e.preventDefault();
    load();
  });
  platformSelect.addEventListener('change', load);
  typeSelect.addEventListener('change', load);
  sortSelect.addEventListener('change', load);
  searchInput.addEventListener('input', function () {
    visible = PAGE_SIZE;
    if (current.length) renderList();
  });
  loadMoreBtn.addEventListener('click', function () {
    visible += PAGE_SIZE;
    renderList();
  });

  load();
})();
