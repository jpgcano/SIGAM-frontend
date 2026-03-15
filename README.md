# SIGAM Frontend

Frontend estatico de SIGAM (HTML, CSS y JavaScript vanilla) migrado a SPA con Vite. Este repo consume un backend REST y se despliega como sitio estatico en Vercel.

## Requisitos
- Node.js solo para el build de Vercel.
- Backend accesible para pruebas de login, tickets e inventario.

## Estructura
- `index.html`: entrada unica de la SPA
- `src/main.js`: bootstrap de la app
- `src/router.js`: router SPA
- `src/pages`: vistas SPA (`*.page.js`)
- `src/components`: componentes reutilizables
- `src/css`: estilos
- `src/api-client.js`: cliente API ESM para SPA
- `src/config.js`: configuracion de endpoints
- `src/legacy`: HTML y JS anteriores (solo referencia, no usados por la SPA)
- `scripts`: scripts de build (inyeccion de entorno legacy)
- `test`: evidencia de pruebas por tarea

## Configuracion de entorno
- `VITE_SIGAM_API`: URL base del backend (por ejemplo `https://sigam-backend.vercel.app`).

En Vite, solo variables con prefijo `VITE_` estan disponibles en el frontend.
Para uso local puedes definir `window.SIGAM_API` en consola del navegador o guardar `SIGAM_API` en localStorage.

## Uso local rapido
1. Ejecuta `pnpm install` y luego `pnpm dev`.
2. Abre `http://localhost:5173`.

## Rutas
Las rutas se resuelven en el cliente con el router SPA. En Vercel se reescribe todo a `index.html`.

## Autenticacion y roles
- El token se guarda en localStorage (`sigam_token`).
- El usuario se guarda en localStorage (`sigam_user`).
- El router de la SPA valida sesion y rol antes de renderizar vistas protegidas.

## API y configuracion
- `src/config.js` define `SIGAM_CONFIG` con endpoints y `API_BASE_URL`.
- `src/api-client.js` centraliza `fetch`, tokens y manejo de errores para la SPA.

## Despliegue en Vercel
1. Configura la variable de entorno `VITE_SIGAM_API` en el proyecto de Vercel.
2. Vercel usa `package.json` con el script `build`.
3. El `distDir` configurado es `dist` y las rutas limpias se resuelven via `vercel.json`.

## Evidencia de pruebas
- Al terminar cada tarea, guardar evidencia en `test/` (capturas, logs o checklist).

## Tests automaticos
Este repo usa Vitest con entorno JSDOM para pruebas de DOM y funcionalidad.
Para ejecutar:
```
pnpm install
pnpm test
```

## Contribucion rapida
1. Trabaja por tarea e incluye evidencia en `test/`.
2. Un commit por tarea.
3. Actualiza `AI_WORKLOG.md` con el resumen de cambios y evidencia.
