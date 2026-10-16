# FindFreeJuegos — Portal de giveaways de videojuegos

Proyecto web sencillo con **Node.js + Express** (backend/proxy) y **HTML/CSS/JS** (front).
Consume la API externa gratuita **[GamerPower](https://www.gamerpower.com/api)**, que
**no requiere API key ni autenticación**.

## Pantallas

| Ruta             | Pantalla                       | Descripción |
|------------------|--------------------------------|-------------|
| `/`              | **Inicio**                     | Filtros + grid de giveaways activos (GamerPower). |
| `/registro`      | **Registro de usuario**        | Formulario con validación completa (cliente y servidor). |
| `/giveaway?id=`  | **Info del tema (detalle)**    | Información completa de un giveaway: valor, plataformas, instrucciones y enlace para reclamar. |

## Requisitos

- Node.js 18 o superior (probado con Node 24).

## Puesta en marcha

1. **Instala las dependencias**
   ```bash
   npm install
   ```

2. **Configura el `.env`** (opcional; solo define el puerto)
   - Copia `.env.example` a `.env` si no existe:
     ```
     PORT=3000
     ```
   > GamerPower no necesita clave, así que no hay secretos que configurar.
   > Aun así, la app usa `.env` (vía `dotenv`) y lo excluye con `.gitignore`.

3. **Arranca el servidor**
   ```bash
   npm start
   # o en modo desarrollo (reinicio automático):
   npm run dev
   ```

4. Abre http://localhost:3000

## API propia

| Método | Ruta                     | Descripción |
|--------|--------------------------|-------------|
| GET    | `/api/giveaways`         | Lista giveaways. Query: `platform`, `type`, `sort`. |
| GET    | `/api/giveaways/:id`     | Detalle de un giveaway. |
| POST   | `/api/register`          | Crea un usuario (validado). |
| GET    | `/api/health`            | Estado del servicio. |

**Filtros disponibles** (se reenvían a GamerPower):

- `platform`: `pc`, `steam`, `epic-games-store`, `gog`, `itchio`, `ps4`, `ps5`,
  `xbox-series-xs`, `xbox-one`, `switch`, `android`, `ios`, `drm-free`.
- `type`: `game`, `loot`, `beta`.
- `sort`: `date`, `value`, `popularity`.

Ejemplos: `/api/giveaways?platform=steam&type=game&sort=value`

> El backend hace de proxy hacia GamerPower, así se evitan problemas de CORS y se
> normaliza la respuesta antes de entregarla al navegador (`src/services/gamerpower.js`).
> Límite de la API: no superar 10 peticiones por segundo.

## Validación del registro

Validado en el cliente (`public/js/register.js`) **y** en el servidor
(`src/routes/users.js`), con las mismas reglas definidas en `public/js/validation.js`:

- **Nombre:** mínimo 3 caracteres, solo letras y espacios.
- **Usuario:** 3–20 caracteres (letras, números, `_`), único.
- **Email:** formato válido y único.
- **Contraseña:** mínimo 8 caracteres, al menos una letra y un número.
- **Confirmar contraseña:** debe coincidir.
- **Fecha de nacimiento:** válida y edad ≥ 13.
- **Términos:** obligatorio.

Las contraseñas se guardan **hasheadas** con `bcryptjs`.

## Estructura

```
paginapatino/
├── .env / .env.example      # configuración del servidor (sin claves)
├── .gitignore               # ignora .env, node_modules y data/users.json
├── server.js                # arranque de Express
├── src/
│   ├── routes/              # giveaways.js (proxy GamerPower), users.js (registro)
│   └── services/            # gamerpower.js (cliente HTTP), store.js (data/users.json)
├── public/                  # front-end (HTML, CSS, JS)
│   ├── index.html · register.html · giveaway.html
│   ├── css/styles.css
│   └── js/validation.js · main.js · register.js · giveaway.js
└── data/users.json          # creado en runtime (ignorado por git)
```

## Atribución

Los datos provienen de **[GamerPower](https://www.gamerpower.com)**, cuyo uso requiere
atribución con un enlace activo. Por eso el pie de página enlaza a gamerpower.com.

## Notas

- GamerPower es gratis para uso personal y comercial; solo pide la atribución.
- Los usuarios se guardan en `data/users.json` (sin base de datos).
