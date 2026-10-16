// Cliente de la API externa GamerPower (https://www.gamerpower.com/api).
// Es pública: NO requiere API key ni autenticación.
// Límite de uso: no superar 10 peticiones por segundo.

const BASE_URL = 'https://www.gamerpower.com/api';

async function gpFetch(path, params = {}) {
  const url = new URL(BASE_URL + path);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });

  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  // 201 = "No active giveaways" (respuesta válida, sin resultados)
  if (response.status === 404) {
    const err = new Error('No se encontró el recurso solicitado en GamerPower.');
    err.status = 404;
    throw err;
  }
  if (!response.ok) {
    const err = new Error(`La API GamerPower respondió con estado ${response.status}`);
    err.status = 502;
    throw err;
  }

  return response.json();
}

// Lista de giveaways (con filtros opcionales)
async function getGiveaways({ platform, type, sort } = {}) {
  const data = await gpFetch('/giveaways', {
    platform: platform || undefined,
    type: type || undefined,
    'sort-by': sort || undefined,
  });
  return Array.isArray(data) ? data : [];
}

// Detalle de un giveaway por id
async function getGiveaway(id) {
  const data = await gpFetch('/giveaway', { id });
  if (Array.isArray(data)) return data[0] || null;
  return data && typeof data === 'object' ? data : null;
}

module.exports = { getGiveaways, getGiveaway };
