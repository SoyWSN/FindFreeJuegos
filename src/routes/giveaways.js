// Rutas de giveaways: actúan como proxy hacia GamerPower.
// El backend normaliza y filtra la respuesta antes de entregarla al navegador.

const express = require('express');
const gamerpower = require('../services/gamerpower');

const router = express.Router();

const ALLOWED_PLATFORMS = new Set([
  'pc', 'steam', 'epic-games-store', 'gog', 'itchio', 'ps4', 'ps5',
  'xbox-series-xs', 'xbox-one', 'switch', 'android', 'ios', 'drm-free',
]);
const ALLOWED_TYPES = new Set(['game', 'loot', 'beta']);
const ALLOWED_SORTS = new Set(['date', 'value', 'popularity']);

function pick(value, allowed) {
  const v = String(value || '').trim().toLowerCase();
  return allowed.has(v) ? v : '';
}

// GET /api/giveaways?platform=steam&type=game&sort=value
router.get('/giveaways', async (req, res, next) => {
  try {
    const platform = pick(req.query.platform, ALLOWED_PLATFORMS);
    const type = pick(req.query.type, ALLOWED_TYPES);
    const sort = pick(req.query.sort, ALLOWED_SORTS);

    const list = await gamerpower.getGiveaways({ platform, type, sort });

    res.json({
      ok: true,
      count: list.length,
      results: list.map(serializeListItem),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/giveaways/:id
router.get('/giveaways/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'ID inválido.' });
    }

    const giveaway = await gamerpower.getGiveaway(id);
    if (!giveaway) {
      return res.status(404).json({ ok: false, error: 'No se encontró ese giveaway.' });
    }

    res.json({ ok: true, giveaway: serializeGiveaway(giveaway) });
  } catch (err) {
    next(err);
  }
});

function serializeListItem(g) {
  return {
    id: g.id,
    title: g.title,
    image: g.image || g.thumbnail,
    worth: g.worth,
    type: g.type,
    platforms: g.platforms,
    users: g.users,
    endDate: g.end_date,
    status: g.status,
    url: g.open_giveaway_url,
  };
}

function serializeGiveaway(g) {
  return {
    id: g.id,
    title: g.title,
    image: g.image || g.thumbnail,
    thumbnail: g.thumbnail,
    worth: g.worth,
    description: g.description,
    instructions: g.instructions,
    type: g.type,
    platforms: g.platforms,
    users: g.users,
    publishedDate: g.published_date,
    endDate: g.end_date,
    status: g.status,
    openUrl: g.open_giveaway_url,
    pageUrl: g.gamerpower_url,
  };
}

module.exports = router;
