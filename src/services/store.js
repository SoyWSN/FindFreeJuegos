// Almacenamiento sencillo de usuarios en un archivo JSON.
// No usa base de datos: lee/escribe data/users.json.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

function readUsers() {
  ensureFile();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('No se pudo leer data/users.json:', err.message);
    return [];
  }
}

function saveUsers(users) {
  ensureFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function addUser(user) {
  const users = readUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

module.exports = { readUsers, saveUsers, addUser };
