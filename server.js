// Carga las variables del archivo .env (PORT, ...)
require('dotenv').config();

const path = require('path');
const express = require('express');

const giveawaysRouter = require('./src/routes/giveaways');
const usersRouter = require('./src/routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Parseo de JSON en el cuerpo de las peticiones
app.use(express.json());

// Sirve el front-end (HTML, CSS, JS) desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API propia
app.use('/api', giveawaysRouter);
app.use('/api', usersRouter);

// Comprobación rápida
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'FindFreeJuegos', api: 'GamerPower (sin autenticación)' });
});

// Rutas "bonitas" para las páginas
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/giveaway', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'giveaway.html'));
});

// 404 específico para la API (devuelve JSON, no HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta de API no encontrada.' });
});

// Manejador de errores central
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('[ERROR]', err.message);
  res.status(status).json({ ok: false, error: err.message || 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`\n  Portal de videojuegos corriendo en http://localhost:${PORT}\n`);
});
