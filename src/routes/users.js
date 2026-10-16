// Ruta de registro de usuarios: valida y guarda en data/users.json.

const express = require('express');
const bcrypt = require('bcryptjs');
const Validation = require('../../public/js/validation');
const store = require('../services/store');

const router = express.Router();

// POST /api/register
router.post('/register', async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    // Se valida en el servidor (nunca confiar solo en el cliente)
    const existingUsers = store.readUsers();
    const result = Validation.validateRegistration(body, { existingUsers });

    if (!result.valid) {
      return res.status(400).json({ ok: false, errors: result.errors });
    }

    const { nombre, usuario, email, password, fechaNacimiento } = result.values;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      nombre,
      usuario,
      email,
      fechaNacimiento,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    store.addUser(user);

    res.status(201).json({
      ok: true,
      message: `¡Bienvenido, ${nombre}! Tu cuenta fue creada correctamente.`,
      user: { id: user.id, nombre, usuario, email },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
