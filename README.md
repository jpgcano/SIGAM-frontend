# SIGAM Frontend

Frontend estatico de SIGAM (HTML, CSS y JavaScript vanilla).

## Estructura
- `src/view/pages`: paginas HTML
- `src/view/css`: estilos
- `src/view/js`: logica de UI y servicios
- `src/view/services`: guard de autenticacion y navbar

## Configuracion de entorno
- `SIGAM_API`: URL base del backend (por ejemplo `https://sigam-backend.vercel.app`).

En Vercel este valor se inyecta en build y se escribe en `src/view/js/runtime-env.js`.
Para uso local puedes definir `window.SIGAM_API` en consola del navegador o guardar `SIGAM_API` en localStorage.

## Uso local rapido
1. Abre `src/view/pages/login.html` en el navegador.
2. Si necesitas rutas limpias, levanta un servidor estatico y navega a `/login` u otras rutas.

## Despliegue en Vercel
1. Configura la variable de entorno `SIGAM_API` en el proyecto de Vercel.
2. Vercel usara `package.json` con el script `build` para generar `src/view/js/runtime-env.js`.
3. El `distDir` configurado es `src/view` y las rutas limpias se resuelven via `vercel.json`.

Rutas limpias disponibles:
- `/` y `/login`
- `/register`
- `/dashboard`
- `/tickets`
- `/inventory`
- `/calendar`
- `/reports`
- `/admin`
