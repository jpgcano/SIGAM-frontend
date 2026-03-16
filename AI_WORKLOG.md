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

### 2026-03-14 - IA: Codex
- Issue: Migración Calendar a SPA (open-source Calendar.js)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Calendar a SPA usando librería open-source y datos reales.
- Cambios:
  - `src/pages/Calendar.page.js`: Vista SPA con Calendar.js y modales de mantenimiento.
  - `src/components/Navbar.js`: Agregado enlace a Calendar.
  - `src/main.js`: Ruta `/calendar`.
  - Eliminados: `src/legacy/pages/calendar.html`, `src/legacy/js/pages/calendar.page.js`, `src/legacy/js/calendar.js`.
- Evidencia:
  - Calendar renderiza eventos desde API, permite drag-and-drop y CRUD básico.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Migración Reports a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Reports a SPA usando estilos y lógica legacy.
- Cambios:
  - `src/pages/Reports.page.js`: Vista SPA con métricas, gráficas y listados.
  - `src/components/Navbar.js`: Agregado enlace a Reports.
  - `src/main.js`: Ruta `/reports`.
  - Eliminados: `src/legacy/pages/reports.html`, `src/legacy/js/pages/reports.page.js`, `src/legacy/js/reports.js`.
- Evidencia:
  - Reports renderiza métricas y charts con Chart.js cargado dinámicamente.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Migración Profile a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Profile a SPA usando estilos y lógica legacy.
- Cambios:
  - `src/pages/Profile.page.js`: Vista SPA de perfil y cambio de password.
  - `src/components/Navbar.js`: Agregado enlace a Profile.
  - `src/main.js`: Ruta `/profile`.
  - Eliminados: `src/legacy/pages/profile.html`, `src/legacy/js/pages/profile.page.js`, `src/legacy/js/profile.js`.
- Evidencia:
  - Perfil renderiza datos de sesión y permite actualizar password.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-14 - IA: Codex
- Issue: Migración Admin a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Admin a SPA usando estilos y lógica legacy.
- Cambios:
  - `src/pages/Admin.page.js`: Vista SPA completa con usuarios, configuración, seguridad y backup.
  - `src/components/Navbar.js`: Agregado enlace a Profile (roles).
  - `src/main.js`: Ruta `/admin` usa `AdminPage` con meta de roles.
  - Eliminados: `src/legacy/pages/admin.html`, `src/legacy/js/pages/admin.page.js`, `src/legacy/js/admin.js`.
- Evidencia:
  - Admin renderiza usuarios, filtros y acciones con datos de API o cache.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-15 - IA: Codex
- Issue: Migración Register a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Register a SPA usando estilos y lógica legacy.
- Cambios:
  - `src/pages/Register.page.js`: Registro con API real y validaciones.
  - Eliminados: `src/legacy/pages/register.html`, `src/legacy/js/pages/register.page.js`, `src/legacy/js/register.js`.
- Evidencia:
  - Registro muestra estados y redirige a login al completar.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-15 - IA: Codex
- Issue: Migración Ticket Detail a SPA (estilos + lógica)
- Rama: developer (feature/task)
- Objetivo: Migrar la vista Ticket Detail a SPA usando estilos y lógica legacy.
- Cambios:
  - `src/pages/TicketDetail.page.js`: Vista SPA de detalle de ticket y sugerencias.
  - `src/main.js`: Ruta `/ticket-detail`.
  - Eliminados: `src/legacy/pages/ticket-detail.html`, `src/legacy/js/ticket-detail.js`.
- Evidencia:
  - Ticket detail renderiza datos, estado y sugerencias desde API.
- Commit(s):
  - (Pendiente de aplicación)

### 2026-03-15 - IA: Codex
- Issue: Normalizacion de colecciones API en vistas clave
- Rama: developer (feature/task)
- Objetivo: Evitar vistas vacias cuando la API envuelve datos en data/items/rows/results.
- Cambios:
  - `src/utils/normalize.js`: Utilidad central para extraer colecciones desde respuestas API comunes.
  - `src/pages/Tickets.page.js`: Reusa normalizacion central.
  - `src/pages/Inventory.page.js`: Reusa normalizacion central.
  - `src/pages/Dashboard.page.js`: Reusa normalizacion central.
  - `src/pages/Reports.page.js`: Reusa normalizacion central.
  - `src/pages/Calendar.page.js`: Reusa normalizacion central.
- Evidencia:
  - `test/api-normalization-2026-03-15.md`
- Commit(s):
  - 3ab39e7

### 2026-03-15 - IA: Codex
- Issue: Ajuste de mapeo de campos Tickets API
- Rama: developer (feature/task)
- Objetivo: Mostrar datos de tickets provenientes de `vw_tickets_operacion`.
- Cambios:
  - `src/pages/Tickets.page.js`: Mapeo de `categoria_ticket`, `activo_serial`, `tecnico_asignado` y `usuario_reporta`.
- Evidencia:
  - `test/tickets-api-field-mapping-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Fix carga categorias tickets
- Rama: developer (feature/task)
- Objetivo: Eliminar error runtime por `loadCategorias` faltante.
- Cambios:
  - `src/pages/Tickets.page.js`: Agrega `loadCategorias` y renderiza categorias.
- Evidencia:
  - `test/tickets-load-categories-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Evitar respuestas 304 sin body en API
- Rama: developer (feature/task)
- Objetivo: Forzar `fetch` a no usar cache y evitar 304 en endpoints de tickets.
- Cambios:
  - `src/api-client.js`: Usa `cache: 'no-store'` por defecto.
- Evidencia:
  - `test/api-cache-no-store-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Fallback de categorias en Tickets
- Rama: developer (feature/task)
- Objetivo: Mantener filtro de categorias funcionando sin dependencia del endpoint.
- Cambios:
  - `src/pages/Tickets.page.js`: Deriva categorias desde tickets y muestra clasificacion IA.
- Evidencia:
  - `test/tickets-category-fallback-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Mostrar categoria en cards con fallback a clasificacion IA
- Rama: developer (feature/task)
- Objetivo: Evitar cards sin categoria cuando solo existe clasificacion.
- Cambios:
  - `src/pages/Tickets.page.js`: Usa clasificacion IA como fallback visual y para filtros.
- Evidencia:
  - `test/tickets-category-fallback-v2-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Listas en crear ticket con categorias fallando
- Rama: developer (feature/task)
- Objetivo: No bloquear el formulario si no hay categorias disponibles.
- Cambios:
  - `src/pages/Tickets.page.js`: Deshabilita categoria cuando falla API y no la exige en validacion.
- Evidencia:
  - `test/tickets-create-lists-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Eliminacion de legacy
- Rama: developer (feature/task)
- Objetivo: Remover codigo legacy no utilizado.
- Cambios:
  - Eliminado `src/legacy/` completo.
- Evidencia:
  - `test/remove-legacy-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Limpieza de carpetas vacias
- Rama: developer (feature/task)
- Objetivo: Eliminar directorios vacios que quedaron de legacy.
- Cambios:
  - Eliminadas carpetas vacias en `src/`.
- Evidencia:
  - `test/remove-empty-folders-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Reencarpetado modular de src
- Rama: developer (feature/task)
- Objetivo: Separar servicios y estado en carpetas dedicadas.
- Cambios:
  - `src/services/`: `api-client.js`, `config.js`, `env.js`, `api.js`.
  - `src/state/`: `storage.js`.
  - Actualizacion de imports en pages/router/components.
- Evidencia:
  - `test/restructure-src-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Organizacion Ticket Detail
- Rama: developer (feature/task)
- Objetivo: Mejorar detalle de ticket con categoria y clasificacion separadas.
- Cambios:
  - `src/pages/TicketDetail.page.js`: Campos separados y fallback de sugerencias.
- Evidencia:
  - `test/ticket-detail-organize-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Estilos Tickets
- Rama: developer (feature/task)
- Objetivo: Reordenar layout, centrar contenido y mejorar look & feel.
- Cambios:
  - `src/css/pages/tickets.css`: Nuevo layout responsive, cards y modales consistentes.
- Evidencia:
  - `test/tickets-styles-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Acciones Ticket Detail y removal delete
- Rama: developer (feature/task)
- Objetivo: Evitar eliminacion de tickets y permitir cambio de estado/reasignacion por rol.
- Cambios:
  - `src/pages/Tickets.page.js`: Elimina opcion de borrar.
  - `src/pages/TicketDetail.page.js`: Acciones de estado y reasignacion por rol.
  - `src/css/pages/tickets.css`: Estilos para acciones.
- Evidencia:
  - `test/ticket-detail-actions-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Ajuste UI sugerencias Ticket Detail
- Rama: developer (feature/task)
- Objetivo: Diferenciar sugerencias IA vs tickets similares.
- Cambios:
  - `src/pages/TicketDetail.page.js`: Render IA shape y etiqueta de tickets similares.
- Evidencia:
  - `test/ticket-detail-suggestions-ui-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Mostrar solo soluciones IA
- Rama: developer (feature/task)
- Objetivo: Ocultar sugerencias historicas y mostrar solo IA.
- Cambios:
  - `src/pages/TicketDetail.page.js`: Filtra sugerencias no IA y cambia el titulo.
- Evidencia:
  - `test/ticket-detail-ia-only-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Ajustes UI Ticket Detail
- Rama: developer (feature/task)
- Objetivo: Renombrar seccion IA y mostrar tipo de activo + estado con color.
- Cambios:
  - `src/pages/TicketDetail.page.js`: Nuevo campo tipo de activo y estado con clase.
  - `src/css/pages/tickets.css`: Ajuste visual para status en detalle.
- Evidencia:
  - `test/ticket-detail-ui-v2-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Posibles causas en sugerencias IA
- Rama: developer (feature/task)
- Objetivo: Ocultar confianza y mostrar posibles causas cuando existan.
- Cambios:
  - `src/pages/TicketDetail.page.js`: Render de causas y sin confianza.
- Evidencia:
  - `test/ticket-detail-causes-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Ajustes CSS tickets
- Rama: developer (feature/task)
- Objetivo: Separar elementos y destacar estados en UI.
- Cambios:
  - `src/css/pages/tickets.css`: Espaciado, badges y ajustes de acciones.
- Evidencia:
  - `test/tickets-css-spacing-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Ajuste estilo tarjetas tickets
- Rama: developer (feature/task)
- Objetivo: Mejorar apariencia de cards.
- Cambios:
  - `src/css/pages/tickets.css`: Tarjetas mas limpias y sobrias.
- Evidencia:
  - `test/tickets-card-style-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Componentizacion de tarjetas (Tickets + Inventario)
- Rama: feature/components-cards
- Objetivo: Reutilizar tarjetas y eliminar HTML duplicado.
- Cambios:
  - `src/components/TicketCard.js`: nuevo componente para render de tarjetas de tickets.
  - `src/components/AssetCard.js`: nuevo componente para render de tarjetas de activos.
  - `src/pages/Tickets.page.js`: consume componente de ticket card.
  - `src/pages/Inventory.page.js`: consume componente de asset card.
  - `test/components-cards-2026-03-15.md`: evidencia de prueba.
- Evidencia: `test/components-cards-2026-03-15.md`.
- Commit: pendiente.

### 2026-03-15 - IA: Codex
- Issue: Componentizacion de botones (navbar y paginas)
- Rama: feature/components-cards
- Objetivo: Unificar estilo y centralizar render de botones.
- Cambios:
  - `src/components/Button.js`: componente base de botones con variantes.
  - `src/css/components/buttons.css`: estilos comunes de botones.
  - `src/components/Navbar.js`: usa componente de botones para logout.
  - `src/pages/Tickets.page.js`: botones principales con componente.
  - `src/pages/TicketDetail.page.js`: botones principales con componente.
  - `src/pages/Inventory.page.js`: acciones y modales con componente.
  - `src/pages/Calendar.page.js`: acciones y modales con componente.
  - `src/pages/Admin.page.js`: tabs y acciones con componente.
  - `src/pages/Profile.page.js`: acciones con componente.
  - `src/pages/Login.page.js` y `src/pages/Register.page.js`: botones de submit con componente.
  - `test/components-buttons-2026-03-15.md`: evidencia de prueba.
- Evidencia: `test/components-buttons-2026-03-15.md`.
- Commit: pendiente.

### 2026-03-15 - IA: Codex
- Issue: Estandarizacion de secciones y vista lista para tickets
- Rama: feature/components-cards
- Objetivo: Unificar secciones visuales, evitar duplicidad en inventario y agregar grid/list en tickets.
- Cambios:
  - `src/css/components/sections.css`: estilos base para secciones.
  - `src/main.js`: importa estilos de secciones.
  - `src/pages/Tickets.page.js`: toggle grid/list, tabla de lista y estilos de seccion.
  - `src/css/pages/tickets.css`: estilos de tabla y toggle.
  - `src/pages/Inventory.page.js`: secciones con estilo comun y Stock Alerts solo bajo minimo.
  - `test/tickets-view-toggle-2026-03-15.md`: evidencia de prueba.
- Evidencia: `test/tickets-view-toggle-2026-03-15.md`.
- Commit: pendiente.

### 2026-03-15 - IA: Codex
- Issue: Inventario - ajustes de vista y paginacion
- Rama: feature/components-cards
- Objetivo: Reubicar toggles de vista, corregir paginacion en lista y eliminar sensacion de duplicado.
- Cambios:
  - `src/pages/Inventory.page.js`: reubica toggles, aplica paginacion cliente cuando aplica.
  - `test/inventory-view-pagination-2026-03-15.md`: evidencia de prueba.
- Evidencia: `test/inventory-view-pagination-2026-03-15.md`.
- Commit: pendiente.

### 2026-03-15 - IA: Codex
- Issue: Inventario estilos, bordes por estado y tipo de activo
- Rama: feature/components-cards
- Objetivo: Separar tarjetas/lista, usar colores por estado y corregir tipo.
- Cambios:
  - `src/css/pages/inventory.css`: bordes por estado, sombras y separacion.
  - `src/components/AssetCard.js`: clase de estado para tarjetas.
  - `src/pages/Inventory.page.js`: clases por estado en filas y mapeo de type.
  - `src/css/pages/tickets.css`: bordes por estado en tarjetas/tabla.
  - `src/pages/Tickets.page.js`: clases por estado en tarjetas/tabla.
  - `test/inventory-style-status-2026-03-15.md`: evidencia.
- Evidencia: `test/inventory-style-status-2026-03-15.md`.
- Commit: pendiente.

### 2026-03-15 - IA: Codex
- Issue: Ajustes visuales tickets/inventario
- Rama: feature/components-cards
- Objetivo: Recuperar estilos de botones, colores de estado y layout de proveedores.
- Cambios:
  - `src/css/components/buttons.css`: estilos base para botones (btn-nuevo, btn-page, outline).
  - `src/css/pages/tickets.css`: bordes por estado en tarjetas y filas.
  - `src/pages/Tickets.page.js`: clases de estado para tarjetas y filas.
  - `src/css/pages/inventory.css`: grid de tarjetas, tabla de proveedores, layout mas aireado.
  - `src/pages/Inventory.page.js`: lista de proveedores en tabla.
  - `test/tickets-inventory-style-fix-2026-03-15.md`: evidencia.
- Evidencia: `test/tickets-inventory-style-fix-2026-03-15.md`.
- Commit: pendiente.

### 2026-03-15 - IA: Codex
- Issue: Profile cambio de contrase�a (fix submit)
- Rama: developer (feature/task)
- Objetivo: Asegurar que el cambio de contrase�a use configuracion de API y pueda guardar.
- Cambios:
  - `src/pages/Profile.page.js`: agrega import de `SIGAM_CONFIG` para usar endpoints.
- Evidencia:
  - `test/profile-password-update-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Profile cambio de contrase�a (fallback 404)
- Rama: developer (feature/task)
- Objetivo: Evitar 404 al actualizar password probando endpoints y metodos alternos.
- Cambios:
  - `src/pages/Profile.page.js`: agrega fallback PATCH/PUT a endpoints alternos.
- Evidencia:
  - `test/profile-password-update-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Profile cambio de contrase�a (payload requerido)
- Rama: developer (feature/task)
- Objetivo: Evitar error de "campo requerido password" enviando variantes de payload.
- Cambios:
  - `src/pages/Profile.page.js`: payload compatible con distintos nombres de campos.
- Evidencia:
  - `test/profile-password-update-2026-03-15.md`
- Commit(s):
  - (Pendiente de aplicacion)

### 2026-03-15 - IA: Codex
- Issue: Calendar asset metadata y filtros (seguimiento)
- Rama: developer (feature/task)
- Objetivo: Mantener los metadatos del ticket/activo dentro del objeto de mantenimiento para que el calendario no pierda eventos, no muestre `[object Object]` y los filtros de activos sigan funcionando luego de cada refresh.
- Cambios:
  - `src/pages/Calendar.page.js`: se añadieron helpers para leer campos de ticket/activo (tanto del payload anidado como de los alias SQL), `normalizeMaintenance` construye un `asset` enriquecido con `assetId`, se actualizó el formulario para crear mantenimientos con `asset` como objeto y se refactorizó `mergeMaintenanceItem` para mantener los metadatos existentes al sincronizar con el API.
- Evidencia: Prueba manual creando/actualizando mantenimientos con activos; el calendario sigue mostrando los eventos y los filtros de activos siguen aplicándose correctamente.
- Commit(s): pendiente de redondear cambios.

### 2026-03-16 - IA: Codex
- Issue: Hoja de vida del activo
- Rama: developer (feature/task)
- Objetivo: Crear una vista dedicada que reúna la trazabilidad, el ciclo de vida, el historial de mantenimiento y métricas de confiabilidad necesarias para auditoría.
- Cambios:
  - `src/components/AssetCard.js`: cada tarjeta ahora incluye un identificador y puede abrir la hoja de vida cuando se hace clic fuera del botón de edición.
  - `src/pages/Inventory.page.js`: se agregó navegación hacia `/asset-history?id=<activo>` y detección por teclado/ratón para mantener accesibilidad.
  - `src/pages/AssetHistory.page.js`: nueva vista con soporte para cargar datos del activo, listar mantenimientos, calcular MTTR/MTBF y mostrar el certificado de borrado.
  - `src/css/pages/asset-history.css`: estilos nuevos para la hoja de vida.
  - `src/main.js`: registro de la nueva ruta y orden para el router SPA.
  - `test/asset-history-2026-03-16.md`: evidencia manual de la funcionalidad.
- Evidencia: navegación desde inventario al detalle, carga de mantenimientos y métricas visibles en la vista.
- Commit(s): pendiente de aplicar.

### 2026-03-16 - IA: Codex
- Issue: Hoja de vida del activo (completar endpoints y consumos)
- Rama: developer (feature/task)
- Objetivo: Completar la hoja de vida con historial, asignaciones, documentos ISO 27001 y consumos de mantenimiento bajo demanda.
- Cambios:
  - `src/pages/AssetHistory.page.js`: carga paralela de `/activos/:id`, `/activos/:id/historial`, `/activos/:id/asignaciones`, `/activos/:id/documentos` y `/mantenimientos`; render de eventos, asignaciones, obsolescencia y consumos bajo demanda.
  - `src/pages/Inventory.page.js`: navegación desde filas de lista hacia hoja de vida con accesibilidad básica.
  - `src/components/AssetCard.js`: tarjetas navegables con `tabindex`.
  - `src/css/pages/asset-history.css`: estilos para asignaciones, eventos y consumos.
  - `test/asset-history-2026-03-16.md`: evidencia actualizada.
- Evidencia: se documentó en `test/asset-history-2026-03-16.md`.
- Commit(s): pendiente de aplicar.

### 2026-03-16 - IA: Codex
- Issue: Hoja de vida del activo (CRUD operativo)
- Rama: developer (feature/task)
- Objetivo: Habilitar acciones de administración desde la hoja de vida: asignar usuario, cambiar ubicación, gestionar software/licencias, subir documentos y dar de baja.
- Cambios:
  - `src/pages/AssetHistory.page.js`: se añadieron formularios y controles para asignaciones, ubicación, software, licencias, documentos y baja del activo.
  - `src/css/pages/asset-history.css`: estilos para nuevas secciones de gestión, formularios y listados.
- Evidencia: pendiente de validación manual.
- Commit(s): pendiente de aplicar.

### 2026-03-16 - IA: Codex
- Issue: Duplicados en acciones de hoja de vida
- Rama: developer (feature/task)
- Objetivo: Evitar envíos duplicados en asignación de usuario, documentos, licencias y software; deduplicar listas en UI.
- Cambios:
  - `src/pages/AssetHistory.page.js`: se añadieron guards de binding, dedupe y mensajes de error detallados.
- Evidencia: pendiente de validación manual.
- Commit(s): pendiente de aplicar.
