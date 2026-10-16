// Pantalla de Detalle: muestra la información completa de un giveaway.
(function () {
  'use strict';

  var detailEl = document.getElementById('detail');
  var statusEl = document.getElementById('status');

  var ICON_ARROW_LEFT =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  var ICON_EXTERNAL =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

  function setStatus(type, message) {
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

  function render(g) {
    var img = g.image
      ? '<img class="detail__img" src="' + escapeHtml(g.image) + '" alt="' + escapeHtml(g.title) + '" />'
      : '<div class="detail__img detail__img--none">Sin imagen</div>';

    var meta = [];
    if (g.worth && g.worth !== 'N/A') meta.push('<span><strong>Valor:</strong> ' + escapeHtml(g.worth) + '</span>');
    if (g.type) meta.push('<span><strong>Tipo:</strong> ' + escapeHtml(g.type) + '</span>');
    if (g.platforms) meta.push('<span><strong>Plataformas:</strong> ' + escapeHtml(g.platforms) + '</span>');
    if (g.users) meta.push('<span><strong>Reclamados:</strong> ' + Number(g.users).toLocaleString('es') + '</span>');
    if (g.endDate && g.endDate !== 'N/A') meta.push('<span><strong>Termina:</strong> ' + escapeHtml(g.endDate) + '</span>');
    if (g.publishedDate) meta.push('<span><strong>Publicado:</strong> ' + escapeHtml(g.publishedDate) + '</span>');
    if (g.status) meta.push('<span><strong>Estado:</strong> ' + escapeHtml(g.status) + '</span>');

    statusEl.hidden = true;

    detailEl.innerHTML =
      '<a class="back" href="/">' + ICON_ARROW_LEFT + ' Volver al inicio</a>' +
      '<div class="detail">' +
        '<div class="detail__media">' + img + '</div>' +
        '<div class="detail__info">' +
          '<h1 class="detail__title">' + escapeHtml(g.title) + '</h1>' +
          '<div class="detail__meta">' + meta.join('') + '</div>' +
          (g.description
            ? '<div class="detail__group"><h3>Descripción</h3><p>' + escapeHtml(g.description) + '</p></div>'
            : '') +
          (g.instructions
            ? '<div class="detail__group"><h3>Cómo reclamarlo</h3><p class="pre">' + escapeHtml(g.instructions) + '</p></div>'
            : '') +
          '<div class="detail__actions">' +
            (g.openUrl
              ? '<a class="btn btn--primary" href="' + escapeHtml(g.openUrl) + '" target="_blank" rel="noopener">Reclamar ahora ' + ICON_EXTERNAL + '</a>'
              : '') +
            (g.pageUrl
              ? '<a class="btn btn--ghost" href="' + escapeHtml(g.pageUrl) + '" target="_blank" rel="noopener">Ver en GamerPower ' + ICON_EXTERNAL + '</a>'
              : '') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  async function load() {
    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      setStatus('error', 'No se especificó ningún giveaway.');
      return;
    }

    try {
      var res = await fetch('/api/giveaways/' + encodeURIComponent(id));
      var data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo cargar el giveaway.');
      render(data.giveaway);
    } catch (err) {
      setStatus('error', 'Error: ' + err.message);
    }
  }

  load();
})();
