# AI Worklog - SIGAM Frontend

Bitácora obligatoria para registrar el trabajo realizado por IA en el frontend.

## Reglas de uso
1. Crear una entrada por cada tarea/issue trabajada.
2. Incluir commit(s) relacionados para trazabilidad.

---

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Refactorización SPA - Fase 1 (Setup)
- Rama: developer (feature/spa-init)
- Objetivo: Configurar Vite y estructura base para Single Page Application.
- Cambios:
  - `vite.config.js`: Eliminada configuración Multi-Page; limpieza de inputs.
  - `src/view/index.html`: Creado archivo único de entrada con contenedor #app.
  - `src/view/src/router.js`: Implementado router básico en Vanilla JS.
  - `src/view/src/main.js`: Punto de entrada que inicializa el router.
- Decisiones técnicas: 
  - Se mantiene `src/view` como root de Vite para compatibilidad con assets existentes (`/css`, `/services`).
  - Se crea carpeta `src/view/src` para lógica moderna de la aplicación.
- Pendiente: 
  - Migrar vistas HTML existentes (`pages/*.html`) a módulos JS.
  - Implementar Navbar como componente.
- Evidencia:
  - `pnpm run dev` carga `index.html` y muestra mensaje de bienvenida del router.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Refactorización SPA - Fase 1 (Migración Login)
- Rama: developer (feature/spa-init)
- Objetivo: Convertir `login.html` en un módulo de página JS para la SPA.
- Cambios:
  - `src/view/router.js`: Refactorizado para soportar un objeto de página con `render` e `init`.
  - `src/view/main.js`: Actualizado para registrar la nueva ruta `/login`.
  - `src/view/src/pages/Login.page.js`: (Creado) Módulo que contiene el HTML y la lógica de la página de login.
  - `src/view/src/api.js`: (Creado) Mock de la API para permitir pruebas de login.
  - `src/view/src/core/storage.js`: (Creado) Módulo para gestionar `localStorage` (token y usuario).
- Decisiones técnicas: 
  - El router ahora invoca una función `init()` después de renderizar el HTML, permitiendo que cada página anexe sus propios event listeners.
  - Los enlaces de navegación internos (ej: a `/register`) se interceptan para usar `router.navigateTo()` en lugar de recargar la página.
- Pendiente: 
  - Migrar `register.html` y las demás páginas.
- Evidencia:
  - Navegar a `/login` renderiza el formulario. El login con `test@j-axon.com` / `password` simula una redirección al dashboard.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Refactorización SPA - Fase 1 (Migración Register)
- Rama: developer (feature/spa-init)
- Objetivo: Convertir `register.html` en un módulo de página JS (`Register.page.js`).
- Cambios:
  - `src/view/pages/Register.page.js`: Creado módulo con formulario de registro y lógica de validación simple.
  - `src/view/api.js`: Agregado método mock `register` para simular creación de cuenta.
  - `src/view/main.js`: Importada y registrada la ruta `/register`.
- Decisiones técnicas:
  - Se valida coincidencia de passwords en el cliente antes de llamar a la API.
  - Se importan estilos CSS específicos (`../../css/pages/register.css`) dentro del módulo JS.
- Pendiente:
  - Migrar `dashboard.html`.
- Evidencia:
  - Navegar a `/register` muestra el formulario. Al enviar, simula registro y redirige a `/login`.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Fix Pantalla Blanca (Rutas incorrectas)
- Rama: developer (feature/spa-init)
- Objetivo: Corregir las rutas de importación que causaban error 404 en main.js y módulos.
- Cambios:
  - `src/view/index.html`: Corregido `src` del script principal a `/main.js`.
  - `src/view/pages/Login.page.js`: Movido desde `src/view/` a `src/view/pages/` y corregido import de `storage.js`.
- Decisiones técnicas:
  - Se simplifica la estructura para que los imports relativos (`../`) funcionen correctamente desde la carpeta `pages`.
- Evidencia:
  - La aplicación debe cargar el router y mostrar el Login/Registro correctamente.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Refactorización SPA - Fase 1 (Migración Dashboard)
- Rama: developer (feature/spa-init)
- Objetivo: Migrar `dashboard.html` a `Dashboard.page.js` y crear Navbar.
- Cambios:
  - `src/view/components/Navbar.js`: Creado componente reutilizable para la navegación superior.
  - `src/view/pages/Dashboard.page.js`: Creado módulo con la estructura del dashboard.
  - `src/view/api.js`: Agregado endpoint mock `dashboard.getSummary`.
  - `src/view/main.js`: Registrada la ruta `/dashboard` con el nuevo componente.
- Decisiones técnicas:
  - Se comentó la lógica de `Chart.js` temporalmente hasta que se instale la librería vía npm.
  - El Navbar maneja el cierre de sesión (`logout`) limpiando el storage y redirigiendo a login.
- Evidencia:
  - Al hacer login, se ve el dashboard con Navbar, tarjetas de estadísticas y listas (mock).
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Fix Router 404 (Robustez)
- Rama: developer (feature/spa-init)
- Objetivo: Solucionar el error 404 del router y hacerlo más robusto.
- Cambios:
  - `src/view/router.js`: Modificado `handleRoute` para normalizar la URL, eliminando barras finales.
  - `src/view/main.js`: Agregada una ruta `/404` personalizada para una mejor experiencia de usuario.
- Decisiones técnicas:
  - La normalización de rutas previene errores comunes de navegación manual (ej. `/login` vs `/login/`).
- Pendiente:
  - Eliminar el archivo duplicado `src/view/Login.page.js`.
- Evidencia:
  - La aplicación ahora debería resolver las rutas correctamente, incluso con una barra al final, y mostrar una página 404 personalizada para rutas no existentes.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Cleanup File Structure
- Rama: developer (feature/spa-init)
- Objetivo: Eliminar archivo Navbar.js duplicado en la raíz para mantener la estructura limpia.
- Cambios:
  - `Navbar.js` (root): Eliminado.
- Decisiones técnicas:
  - Se mantiene únicamente `src/view/components/Navbar.js` como la fuente de verdad.
- Evidencia:
  - Estructura de carpetas limpia y sin duplicados.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Fix Import Resolution Error
- Rama: developer (feature/spa-init)
- Objetivo: Corregir error de Vite al no poder resolver la importación del Navbar.
- Cambios:
  - `src/view/pages/Dashboard.page.js`: Cambiada ruta de importación a absoluta (`/components/Navbar.js`).
  - `src/view/components/Navbar.js`: Estandarizadas sus importaciones a rutas absolutas.
  - `src/view/pages/Login.page.js`, `src/view/pages/Register.page.js`, `src/view/main.js`: Estandarizadas todas las importaciones a rutas absolutas.
- Decisiones técnicas:
  - Se adoptó el uso de rutas absolutas desde la raíz de Vite (`src/view`) para todas las importaciones de módulos. Esto es más robusto y evita errores de resolución con rutas relativas (`../`).
- Evidencia:
  - El error de importación desaparece y el Dashboard debería renderizarse correctamente.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Fix Final Import Resolution
- Rama: developer (feature/spa-init)
- Objetivo: Corregir error de resolución de importación del Navbar debido a archivos duplicados y rutas incorrectas.
- Cambios:
  - `src/view/pages/Navbar.js`: Eliminado archivo duplicado.
  - `src/view/components/Navbar.js`: Corregidas sus importaciones a rutas absolutas.
- Decisiones técnicas:
  - Se consolida la estructura de componentes eliminando duplicados y se finaliza la estandarización de rutas de importación a absolutas para evitar ambigüedades con Vite.
- Evidencia:
  - `pnpm run dev` debe iniciar sin errores y renderizar el Dashboard correctamente.
- Commit(s):
  - (Pendiente de aplicación)

### 2024-05-22 - IA: Gemini Code Assist
- Issue: Course Correction - Revert to Relative Paths
- Rama: developer (feature/spa-init)
- Objetivo: Corregir todos los errores de resolución de importación volviendo a una estrategia de rutas relativas, que es más estable en esta configuración de Vite.
- Cambios:
  - `src/view/pages/Dashboard.page.js`: Revertido a `../components/Navbar.js`.
  - `src/view/components/Navbar.js`: Revertido a `../router.js`.
  - `src/view/pages/Login.page.js`, `src/view/pages/Register.page.js`: Revertidos a rutas relativas.
  - `src/view/main.js`: Revertido a rutas relativas (`./pages/...`).
- Decisiones técnicas:
  - Se abandona el uso de rutas absolutas (`/`) para los imports de módulos JS debido a problemas de resolución persistentes. Se estandariza el uso de rutas relativas (`../`, `./`), que ya funcionan correctamente para los imports de CSS.
- Evidencia:
  - La aplicación ahora debe compilar sin errores de importación y renderizar todas las páginas migradas (Login, Register, Dashboard).
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Guardas de autenticación y redirección por rol en SPA
- Rama: developer (feature/task)
- Objetivo: Asegurar que la primera vista sea Login si no hay sesión y redirigir según rol cuando existe sesión.
- Cambios:
  - `src/view/router.js`: Agregadas guardas de autenticación, roles y redirección por defecto.
  - `src/view/main.js`: Definido resolver de ruta por rol y registrada ruta `/admin` con roles permitidos.
  - `src/view/pages/Login.page.js`: Redirección post-login según rol.
  - `src/view/components/Navbar.js`: Creado componente Navbar mínimo para SPA.
- Decisiones técnicas:
  - Se usa `storage.js` como fuente de token/usuario para evitar duplicación.
  - Roles no reconocidos redirigen a `/dashboard` por defecto.
- Evidencia:
  - Navegar a rutas protegidas sin token redirige a `/login`.
  - Con sesión activa, `/login` redirige al home según rol.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Configuración de API desde `.env` (sin hardcode)
- Rama: developer (feature/task)
- Objetivo: Usar variable de entorno para la URL de la API y evitar datos quemados.
- Cambios:
  - `.env`: Renombrada a `VITE_SIGAM_API`.
  - `src/view/env.js`: Inyecta `VITE_SIGAM_API` en `window.SIGAM_API` y `window.__ENV__`.
  - `src/view/main.js`: Importa `env.js` al inicio.
  - `src/view/js/runtime-env.js`: Eliminado hardcode de URL.
  - `src/view/js/config.js`: Sin fallback hardcodeado.
- Evidencia:
  - `import.meta.env.VITE_SIGAM_API` disponible en tiempo de build para Vite.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Migración Login a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista de login a SPA, reutilizando estilos y eliminando archivos legacy.
- Cambios:
  - `src/view/pages/Login.page.js`: Actualizado para usar API real y body class.
  - `src/view/api-client.js`: Cliente ESM para login con `SIGAM_CONFIG`.
  - `src/view/router.js`: Soporte de `bodyClass` por página.
  - `src/view/main.js`: Importa `global.css`.
  - Eliminados: `src/view/pages/login.html`, `src/view/js/pages/login.page.js`, `src/view/js/login.js`, `src/view/Login.page.js`.
- Evidencia:
  - Login en SPA carga estilos de `login.css` y valida credenciales vía API.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Reorganización de estructura de carpetas (SPA en `src/`)
- Rama: developer (feature/task)
- Objetivo: Eliminar el root `src/view` y mover la SPA a `src/` con estructura clara.
- Cambios:
  - `index.html`: Movido a raíz y actualizado para `/src/main.js`.
  - `src/*`: `main.js`, `router.js`, `env.js`, `api-client.js`, `storage.js`, `config.js`.
  - `src/components`, `src/pages`, `src/css` movidos desde `src/view`.
  - `src/legacy`: archivos HTML/JS anteriores y `services` para referencia.
  - `public/logo_circular.png`: favicon centralizado.
  - `vite.config.js` y `vercel.json` actualizados para SPA.
  - `README.md` y `SKILL.md` actualizados con nuevas rutas.
- Evidencia:
  - Estructura alineada a SPA moderna y Vite root en `.`
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Migración Dashboard a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Dashboard a SPA usando estilos existentes y lógica real de API.
- Cambios:
  - `src/pages/Dashboard.page.js`: Reescrito con estructura legacy, gráficos y carga de datos.
  - Eliminados: `src/legacy/pages/dashboard.html`, `src/legacy/js/pages/dashboard.page.js`, `src/legacy/js/charts.js`.
- Evidencia:
  - Dashboard renderiza cards, listas y gráficos con Chart.js cargado dinámicamente.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Migración Inventory a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Inventory a SPA usando estilos y lógica legacy.
- Cambios:
  - `src/pages/Inventory.page.js`: Vista SPA con inventario, modales y lógica CRUD.
  - `src/components/Navbar.js`: Agregado enlace a Inventory.
  - `src/router.js`: Soporte de múltiples clases en `body`.
  - `src/main.js`: Ruta `/inventory`.
  - Eliminados: `src/legacy/pages/inventory.html`, `src/legacy/js/pages/inventory.page.js`, `src/legacy/js/inventory.js`.
- Evidencia:
  - Inventory renderiza grid/lista, tabla de stock y proveedores; modales funcionan con Bootstrap JS cargado dinámicamente.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Migración Tickets a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Tickets a SPA usando estilos y lógica legacy.
- Cambios:
  - `src/pages/Tickets.page.js`: Vista SPA con filtros, modal y CRUD.
  - `src/components/Navbar.js`: Agregado enlace a Tickets.
  - `src/config.js`: Agregado `CATEGORIAS_TICKET_ENDPOINT`.
  - `src/main.js`: Ruta `/tickets`.
  - Eliminados: `src/legacy/pages/tickets.html`, `src/legacy/js/pages/tickets.page.js`, `src/legacy/js/tickets.js`.
- Evidencia:
  - Tickets renderiza lista, modal y filtros; carga activos y categorias desde API.
- Commit(s):
  - (Pendiente de aplicación)
