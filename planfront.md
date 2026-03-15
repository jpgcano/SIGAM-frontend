# Plan de Refactorización y Modernización del Frontend

## 1. Visión General y Objetivos

El estado actual del frontend presenta desafíos de mantenibilidad, escalabilidad y rendimiento debido a prácticas como la inclusión de múltiples scripts manuales, la repetición de código y la falta de una arquitectura modular.

Este plan tiene como objetivo modernizar la base del código para transformarlo en una **Single Page Application (SPA)**, utilizando un enfoque basado en componentes de Vanilla JS y aprovechando el bundler **Vite** (ya presente en el proyecto).

**Objetivos Clave:**
- **Eliminar la carga manual de scripts:** Centralizar todo el código en un único punto de entrada (`main.js`).
- **Arquitectura de Componentes:** Crear componentes reutilizables (Navbar, Cards, Modals) para eliminar la duplicación de HTML y JS.
- **SPA (Single Page Application):** Utilizar un router del lado del cliente para renderizar vistas dinámicamente sin recargar la página, mejorando la experiencia de usuario.
- **Código Moderno y Limpio:** Adoptar los últimos estándares de JS (ESM, async/await), dividir archivos extensos y seguir los principios SOLID.

---

## 2. Fases del Plan de Trabajo

### Fase 1: Transición a Arquitectura SPA con Vite

**Meta:** Establecer la estructura base de la SPA, eliminando la configuración Multi-Page actual.

1.  **Crear `index.html` Único:**
    - Será el único archivo HTML del proyecto.
    - Contendrá un `div` principal (ej: `<div id="app"></div>`) y una sola etiqueta `<script type="module" src="/src/main.js"></script>`.
    - Se eliminarán los demás archivos `.html` del directorio `view/`.

2.  **Implementar un Router Básico (`src/router.js`):**
    - Creará un router simple en Vanilla JS.
    - Mapeará rutas (ej: `/tickets`, `/inventory`) a los componentes de página correspondientes.
    - Escuchará los cambios en la URL para renderizar la vista correcta dentro de `<div id="app"></div>`.

3.  **Convertir Vistas HTML a "Componentes de Página":**
    - Cada `view/*.html` actual se convertirá en un módulo JS en `src/pages/`.
    - **Ejemplo:** `view/tickets.html` se convierte en `src/pages/Tickets.page.js`.
    - Cada módulo exportará una función que devuelve el HTML de la página como un string y una función `init()` para añadir la lógica y los event listeners.

4.  **Crear el Punto de Entrada (`src/main.js`):**
    - Importará el router y los estilos globales.
    - Inicializará la aplicación, renderizando la página correspondiente a la URL actual.

### Fase 2: Creación de Componentes Reutilizables

**Meta:** Identificar y abstraer elementos de UI repetidos en componentes modulares.

1.  **Identificar Componentes:**
    - **Candidatos:** Navbar, Sidebar, Tarjetas de Métricas, Tablas de Datos, Modales.
    - Se creará un directorio `src/components/`.

2.  **Crear Módulos de Componente:**
    - **Ejemplo:** `src/components/Navbar.js`.
    - Cada módulo exportará una función que genera el HTML del componente.
    - La lógica asociada (ej: desplegar menú) se incluirá en el mismo módulo.

3.  **Integrar Componentes en las Páginas:**
    - Los "Componentes de Página" (`src/pages/*.js`) importarán y utilizarán estos componentes reutilizables para construir su vista, en lugar de tener HTML duplicado.

### Fase 3: Refactorización y Limpieza

**Meta:** Mejorar la calidad del código, reducir la complejidad y asegurar el uso de estándares modernos.

1.  **Dividir Archivos Grandes:**
    - Archivos como `calendar.js` (y otros que superen ~200 líneas) se dividirán en módulos más pequeños con responsabilidades únicas (ej: `api.js`, `ui.js`, `state.js`).

2.  **Modernizar Código (ES6+):**
    - Reemplazar `var` por `let`/`const`.
    - Usar `async/await` para todo el código asíncrono.
    - Usar arrow functions y template literals.

3.  **Limpieza Final:**
    - Eliminar todos los archivos JS y CSS antiguos que ya no se utilicen después de la migración.
    - Verificar que `package.json` y `vite.config.js` estén limpios y configurados para el nuevo enfoque SPA.

---

**Nota sobre los permisos:** El sistema de seguridad me obliga a pedir confirmación para cada modificación de archivo. Es una medida para proteger tu código. Seguiré este plan de forma estructurada para que las solicitudes de cambio sean claras y puedas aprobarlas en bloques lógicos, minimizando las interrupciones.
