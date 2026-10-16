# Plan de proyecto — "Página Patino" (portal de giveaways de videojuegos)

> Proyecto sencillo y rápido: sitio web de videojuegos con 3 pantallas, API externa
> gratuita (GamerPower) y registro de usuario validado.

## 1. Objetivo

Construir un sitio web de temática **videojuegos** que:

- Se vea decente (tema oscuro tipo "gaming", responsive).
- Funcione de verdad (sin errores, con estados de carga/error).
- Tenga al menos 3 pantallas: **Inicio**, **Registro** e **Información del tema**.
- Consuma una **API externa gratuita** (GamerPower: giveaways de juegos).
- Use un archivo `.env` (excluido con `.gitignore`) para la configuración.

## 2. Stack

| Capa        | Tecnología                          | Por qué |
|-------------|-------------------------------------|---------|
| Servidor    | **Node.js + Express**               | Sirve el front y hace de *proxy* hacia GamerPower (evita CORS y normaliza datos). |
| Config      | **dotenv**                          | Lee la configuración desde `.env`. |
| Front-end   | **HTML + CSS + JS vanilla**         | Cero frameworks, rápido de hacer y de entender. |
| Datos       | **Archivo JSON** (`data/users.json`) | Sin base de datos; persistencia simple de usuarios. |
| API externa | **GamerPower** (www.gamerpower.com/api) | Gratis, sin autenticación, JSON, giveaways de juegos. |

Dependencias npm: `express`, `dotenv`, `bcryptjs`.

## 3. Pantallas (alcance)

1. **Inicio (`/` → `index.html`)**
   - Hero + barra de filtros (plataforma, tipo, orden) + búsqueda por título.
   - Grid de giveaways activos, ordenados por fecha / valor / popularidad.
   - Cada tarjeta (imagen, título, valor, tipo, plataformas) enlaza al detalle.
   - Estados: cargando, sin resultados, error.

2. **Registro (`/registro` → `register.html`)**
   - Formulario validado en el navegador **y** en el servidor.
   - Al enviarse correctamente: se guarda el usuario y se muestra mensaje de éxito.

3. **Información del tema / Detalle (`/giveaway?id=...` → `giveaway.html`)**
   - Muestra la información completa de un giveaway: valor, tipo, plataformas,
     descripción, instrucciones para reclamarlo, fechas, reclamados y enlaces.
   - Esta es la pantalla que "muestra información del tema" (videojuegos) con datos reales.

## 4. Estructura de archivos

```
paginapatino/
├── .env                  # configuración (PORT). NO se sube.
├── .env.example          # plantilla que SÍ se sube
├── .gitignore            # ignora .env, node_modules, data/users.json
├── package.json
├── README.md
├── server.js             # arranque de Express
├── src/
│   ├── routes/
│   │   ├── giveaways.js  # proxy a GamerPower
│   │   └── users.js      # registro
│   └── services/
│       ├── gamerpower.js # llamadas a GamerPower
│       └── store.js      # leer/escribir data/users.json
├── public/
│   ├── index.html
│   ├── register.html
│   ├── giveaway.html
│   ├── css/styles.css    # tema oscuro, variables CSS, responsive
│   └── js/
│       ├── validation.js # reglas compartidas cliente/servidor
│       ├── main.js       # inicio: filtros + listado
│       ├── register.js   # validación en vivo + envío
│       └── giveaway.js   # detalle del giveaway
└── data/
    └── users.json        # se crea en runtime (ignorado por git)
```

## 5. API propia (rutas del backend)

| Método | Ruta                  | Descripción |
|--------|-----------------------|-------------|
| GET    | `/api/giveaways`      | Proxy a GamerPower `/giveaways`. Query: `platform`, `type`, `sort`. |
| GET    | `/api/giveaways/:id`  | Proxy a GamerPower `/giveaway?id=`. |
| POST   | `/api/register`       | Valida y guarda un usuario nuevo. |

El navegador solo habla con `/api/...`; el backend consulta GamerPower.

## 6. Reglas de validación del registro

Se validan **en el cliente (UX) y en el servidor (seguridad)**:

| Campo                 | Regla |
|-----------------------|-------|
| Nombre completo       | Requerido, mínimo 3 caracteres, solo letras y espacios. |
| Usuario               | Requerido, 3–20 caracteres, letras/números/`_`, **único**. |
| Email                 | Requerido, formato válido, **único**. |
| Contraseña            | Requerido, mínimo 8, al menos 1 letra y 1 número. |
| Confirmar contraseña  | Requerido, debe coincidir. |
| Fecha de nacimiento   | Requerido, válida, edad ≥ 13. |
| Términos              | Checkbox obligatorio. |

Contraseñas hasheadas con `bcryptjs`.

## 7. Diseño / UX

- Tema oscuro con acento violeta/cian, tarjetas con bordes suaves y hover.
- Responsive (grid y filtros que se adaptan a móvil).
- Navbar común: Inicio · Registro.
- Estados claros: *cargando* (skeleton), *sin resultados*, *error*.

## 8. Configuración y seguridad

`.env` (NO se sube):
```
PORT=3000
```

`.gitignore`:
```
node_modules/
.env
data/users.json
```

> **Nota sobre las claves API:** GamerPower es una API pública que **no usa API key ni
> autenticación**, por lo que no hay claves que guardar en `.env`. Se mantiene el uso de
> `.env` + `.gitignore` para la configuración del servidor.

## 9. Plan de trabajo por fases

- [x] **Fase 0 — Setup**: `git init`, `package.json`, `express`/`dotenv`/`bcryptjs`, `.env`, `.gitignore`.
- [x] **Fase 1 — Backend base**: `server.js` + `services/gamerpower.js` + `routes/giveaways.js`.
- [x] **Fase 2 — Inicio**: hero, filtros, grid de giveaways.
- [x] **Fase 3 — Detalle / Info del tema**: `giveaway.html` + `giveaway.js`.
- [x] **Fase 4 — Registro**: validación en vivo (cliente) y en servidor.
- [x] **Fase 5 — Pulido y pruebas**: responsive, estados, `README.md`.

## 10. Riesgos / notas

- **Límite de peticiones**: GamerPower pide no superar 10 req/s — de sobra.
- **CORS**: se evita porque todo pasa por el backend (proxy).
- **Atribución**: el uso de GamerPower requiere enlace activo a gamerpower.com (está en el pie).
- **Duplicados**: se comprueban contra `data/users.json` antes de guardar.
- **Contraseñas**: hasheadas con `bcryptjs`.

## 11. Cómo se ejecuta

```bash
npm install
npm run start        # o: node server.js
# Abrir http://localhost:3000
```
