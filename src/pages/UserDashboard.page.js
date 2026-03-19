import { Navbar } from "../components/Navbar.js";
import { renderButton } from "../components/Button.js";
import { renderTicketCardBody } from "../components/TicketCard.js";
import { fetchActivos, fetchCategorias, fetchTickets, createTicket } from "../services/user-tickets.js";
import SIGAM_CONFIG from "../services/config.js";
import { router } from "../router.js";
import {
  normalizeToken,
  mapStatusClass,
  getActivoSerial,
  normalizeTicket,
  getUserContext,
  isTicketFromUser
} from "../utils/user-dashboard.js";
import "../css/pages/user-dashboard.css";

const ROLE_ALLOWLIST = ["Usuario"];

const render = async () => {
  const navbarHTML = Navbar.render();

  return `
    ${navbarHTML}
    <main class="user-dashboard">
      <section class="user-hero sigam-section">
        <div>
          <h1>Mi panel</h1>
          <p class="subtitle">Crea tickets y monitorea los activos en seguimiento.</p>
        </div>
        <div class="user-hero-actions">
          <span id="userLastSync" class="muted"></span>
          ${renderButton({
            id: "refreshUserTickets",
            label: "Actualizar",
            variant: "outlineSecondary",
            className: "btn-sm",
            attrs: { type: "button" }
          })}
        </div>
      </section>

      <section class="user-summary sigam-card-grid sigam-card-grid-3">
        <div class="sigam-stat-card">
          <div class="sigam-stat-card-header">
            <div>
              <div class="sigam-stat-card-label">Tickets activos</div>
              <div id="userActiveCount" class="sigam-stat-card-value">0</div>
            </div>
            <div class="sigam-stat-card-icon primary">
              <i class="bi bi-activity"></i>
            </div>
          </div>
          <span class="sigam-stat-card-trend" id="userActiveTrend">Sin datos</span>
        </div>

        <div class="sigam-stat-card">
          <div class="sigam-stat-card-header">
            <div>
              <div class="sigam-stat-card-label">En proceso</div>
              <div id="userInProgress" class="sigam-stat-card-value">0</div>
            </div>
            <div class="sigam-stat-card-icon warning">
              <i class="bi bi-hourglass-split"></i>
            </div>
          </div>
          <span class="sigam-stat-card-trend" id="userInProgressTrend">Sin datos</span>
        </div>

        <div class="sigam-stat-card">
          <div class="sigam-stat-card-header">
            <div>
              <div class="sigam-stat-card-label">Ultimo ticket</div>
              <div id="userLastTicket" class="sigam-stat-card-value">-</div>
            </div>
            <div class="sigam-stat-card-icon success">
              <i class="bi bi-check2-circle"></i>
            </div>
          </div>
          <span class="sigam-stat-card-trend" id="userLastTicketStatus">Sin datos</span>
        </div>
      </section>

      <section class="sigam-section user-form">
        <h2>Crear nuevo ticket</h2>
        <p class="muted">Describe el incidente y el activo que requiere soporte.</p>
        <form id="userTicketForm" novalidate>
          <div class="form-grid">
            <div class="form-field">
              <label for="userDevice">Serial del activo</label>
              <input id="userDevice" list="userDeviceList" placeholder="Serial o codigo del activo" required>
              <datalist id="userDeviceList"></datalist>
              <div class="field-error" id="userDeviceError"></div>
            </div>
            <div class="form-field">
              <label for="userCategory">Categoria</label>
              <select id="userCategory">
                <option value="">Selecciona categoria</option>
              </select>
              <div class="field-error" id="userCategoryError"></div>
            </div>
          </div>
          <div class="form-field">
            <label for="userDescription">Descripcion</label>
            <textarea id="userDescription" rows="4" placeholder="Describe el incidente" required></textarea>
            <div class="field-error" id="userDescriptionError"></div>
          </div>
          <div class="form-actions">
            <div id="userTicketStatus" class="muted" aria-live="polite"></div>
            ${renderButton({
              id: "userCreateTicket",
              label: "Crear ticket",
              type: "submit",
              variant: "primary"
            })}
          </div>
        </form>
      </section>

      <section class="sigam-section user-tickets">
        <div class="section-header">
          <h2>Tickets activos</h2>
          <span id="userTicketsCount" class="muted"></span>
        </div>
        <div id="userTicketsList" class="user-ticket-list"></div>
        <p id="userTicketsStatus" class="muted"></p>
      </section>
    </main>
  `;
};

const init = async () => {
  Navbar.init();
  initUserDashboard();
};

const initUserDashboard = () => {
  const state = {
    tickets: [],
    activosList: [],
    activosBySerial: new Map(),
    categoriasMap: new Map(),
    categoriasAvailable: false
  };

  const refreshBtn = document.getElementById("refreshUserTickets");
  const lastSync = document.getElementById("userLastSync");
  const activeCount = document.getElementById("userActiveCount");
  const activeTrend = document.getElementById("userActiveTrend");
  const inProgress = document.getElementById("userInProgress");
  const inProgressTrend = document.getElementById("userInProgressTrend");
  const lastTicketValue = document.getElementById("userLastTicket");
  const lastTicketStatus = document.getElementById("userLastTicketStatus");

  const deviceInput = document.getElementById("userDevice");
  const deviceList = document.getElementById("userDeviceList");
  const categorySelect = document.getElementById("userCategory");
  const descriptionInput = document.getElementById("userDescription");
  const form = document.getElementById("userTicketForm");
  const submitBtn = document.getElementById("userCreateTicket");
  const formStatus = document.getElementById("userTicketStatus");

  const ticketsList = document.getElementById("userTicketsList");
  const ticketsStatus = document.getElementById("userTicketsStatus");
  const ticketsCount = document.getElementById("userTicketsCount");

  const setStatus = (element, message, type) => {
    if (!element) return;
    element.textContent = message || "";
    element.className = "muted";
    if (type === "error") element.classList.add("text-danger");
    if (type === "success") element.classList.add("text-success");
    if (type === "loading") element.classList.add("text-muted");
  };

  const setSubmitting = (button, isSubmitting, label) => {
    if (!button) return;
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? "Enviando..." : label;
  };

  const setFieldError = (input, message) => {
    if (!input) return;
    const errorEl = document.getElementById(`${input.id}Error`);
    if (message) {
      input.classList.add("input-error");
      if (errorEl) errorEl.textContent = message;
    } else {
      input.classList.remove("input-error");
      if (errorEl) errorEl.textContent = "";
    }
  };

  const clearFormErrors = () => {
    setFieldError(deviceInput, "");
    setFieldError(categorySelect, "");
    setFieldError(descriptionInput, "");
  };

  const validateForm = () => {
    let isValid = true;
    if (!deviceInput.value.trim()) {
      setFieldError(deviceInput, "El serial es obligatorio.");
      isValid = false;
    } else {
      setFieldError(deviceInput, "");
    }
    if (state.categoriasAvailable && !categorySelect.value) {
      setFieldError(categorySelect, "Selecciona una categoria.");
      isValid = false;
    } else {
      setFieldError(categorySelect, "");
    }
    if (!descriptionInput.value.trim()) {
      setFieldError(descriptionInput, "La descripcion es obligatoria.");
      isValid = false;
    } else {
      setFieldError(descriptionInput, "");
    }
    return isValid;
  };

  const renderCategorias = (list) => {
    if (!categorySelect) return;
    state.categoriasMap = new Map(
      list.map((categoria) => {
        const id = categoria.id_categoria_ticket || categoria.id_categoria || categoria.id || categoria.idCategoria;
        const label = categoria.nombre || categoria.name || categoria.categoria || categoria.nombre_categoria || String(id || "Categoria");
        return [String(id), label];
      })
    );

    const placeholder = '<option value="">Selecciona categoria</option>';
    const options = Array.from(state.categoriasMap.entries())
      .map(([id, label]) => `<option value="${id}">${label}</option>`)
      .join("");
    categorySelect.innerHTML = placeholder + options;
    categorySelect.disabled = false;
    state.categoriasAvailable = options.length > 0;
  };

  const disableCategorySelect = () => {
    if (!categorySelect) return;
    categorySelect.innerHTML = '<option value="">Categorias no disponibles</option>';
    categorySelect.disabled = true;
    state.categoriasAvailable = false;
  };

  const updateStats = (tickets) => {
    const normalized = tickets.map((ticket) => normalizeTicket(ticket));
    const active = normalized.filter((ticket) => {
      const key = normalizeToken(ticket.status);
      return !key.includes("cerrado") && !key.includes("resuelto");
    });
    const inProcess = active.filter((ticket) => {
      const key = normalizeToken(ticket.status);
      return key.includes("proceso") || key.includes("asignado");
    });

    if (activeCount) activeCount.textContent = active.length;
    if (activeTrend) activeTrend.textContent = active.length ? "Activos" : "Sin activos";
    if (inProgress) inProgress.textContent = inProcess.length;
    if (inProgressTrend) inProgressTrend.textContent = inProcess.length ? "En seguimiento" : "Sin seguimiento";

    const last = normalized
      .filter((ticket) => ticket.createdAt)
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (lastTicketValue) lastTicketValue.textContent = last ? `TK-${last.id || ""}` : "-";
    if (lastTicketStatus) lastTicketStatus.textContent = last ? (last.status || "Pendiente") : "Sin datos";
  };

  const renderTickets = (tickets) => {
    if (!ticketsList) return;
    ticketsList.innerHTML = "";

    const normalized = tickets.map((ticket) => normalizeTicket(ticket));
    const active = normalized.filter((ticket) => {
      const key = normalizeToken(ticket.status);
      return !key.includes("cerrado") && !key.includes("resuelto");
    });

    if (ticketsCount) {
      ticketsCount.textContent = `${active.length} activos`;
    }

    if (!active.length) {
      ticketsList.innerHTML = '<p class="muted">No tienes tickets activos en este momento.</p>';
      return;
    }

    active
      .slice(0, 8)
      .forEach((ticket, index) => {
        const card = document.createElement("div");
        card.className = `ticket ticket-card ${mapStatusClass(ticket.status)}`;
        card.innerHTML = renderTicketCardBody({
          ticket,
          index,
          statusClass: mapStatusClass
        });
        card.addEventListener("click", () => {
          if (ticket.id) {
            router.navigateTo(`/ticket-detail?id=${encodeURIComponent(ticket.id)}`);
          }
        });
        ticketsList.appendChild(card);
      });
  };

  const updateLastSync = () => {
    if (!lastSync) return;
    const now = new Date();
    lastSync.textContent = `Actualizado ${now.toLocaleTimeString()}`;
  };

  const loadActivos = async () => {
    if (!SIGAM_CONFIG.API_BASE_URL) return;
    try {
      const data = await fetchActivos();
      state.activosList = Array.isArray(data) ? data : [];
      state.activosBySerial = new Map(
        state.activosList
          .map((activo) => ({
            serial: getActivoSerial(activo),
            activo
          }))
          .filter((item) => item.serial)
          .map((item) => [String(item.serial).trim().toLowerCase(), item.activo])
      );

      if (deviceList) {
        const serials = Array.from(new Set(
          state.activosList
            .map((activo) => getActivoSerial(activo))
            .filter(Boolean)
            .map((serial) => String(serial).trim())
        ));
        deviceList.innerHTML = serials
          .map((serial) => `<option value="${serial}"></option>`)
          .join("");
      }
    } catch (error) {
      setStatus(formStatus, "No se pudieron cargar los activos.", "error");
    }
  };

  const loadCategorias = async () => {
    if (!SIGAM_CONFIG.API_BASE_URL) return;
    try {
      const data = await fetchCategorias();
      const list = Array.isArray(data) ? data : [];
      renderCategorias(list);
      if (list.length === 0) {
        disableCategorySelect();
      }
    } catch (error) {
      disableCategorySelect();
      setStatus(formStatus, "No se pudieron cargar las categorias.", "error");
    }
  };

  const loadTickets = async () => {
    if (!SIGAM_CONFIG.API_BASE_URL) {
      setStatus(ticketsStatus, "API no disponible.", "error");
      return;
    }
    const userCtx = getUserContext();
    if (!userCtx.id && !userCtx.email && !userCtx.name) {
      setStatus(ticketsStatus, "No se pudo identificar el usuario.", "error");
      return;
    }

    setStatus(ticketsStatus, "Cargando tickets...", "loading");

    let data = [];
    try {
      data = await fetchTickets({ limit: 200, offset: 0, id_usuario: userCtx.id || undefined });
    } catch (error) {
      try {
        data = await fetchTickets({ limit: 200, offset: 0 });
      } catch (innerError) {
        setStatus(ticketsStatus, "No se pudieron cargar los tickets.", "error");
        return;
      }
    }

    const list = Array.isArray(data) ? data : [];
    const filtered = list.filter((ticket) => isTicketFromUser(ticket, userCtx));
    state.tickets = filtered;

    updateStats(filtered);
    renderTickets(filtered);
    setStatus(ticketsStatus, filtered.length ? "" : "Sin tickets activos.", "");
    updateLastSync();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFormErrors();
    setStatus(formStatus, "", "");

    if (!validateForm()) {
      setStatus(formStatus, "Revisa los campos marcados.", "error");
      return;
    }

    if (!SIGAM_CONFIG.API_BASE_URL) {
      setStatus(formStatus, "API no disponible.", "error");
      return;
    }

    const serialValue = deviceInput.value.trim();
    const matchedActivo = state.activosBySerial.get(serialValue.toLowerCase());
    const assetId = matchedActivo
      ? (matchedActivo.id_activo || matchedActivo.id || matchedActivo.idActivo)
      : "";

    if (!assetId) {
      setStatus(formStatus, "Serial no encontrado. Verifica el activo.", "error");
      return;
    }

    const payload = {
      id_activo: Number(assetId) || assetId,
      descripcion: descriptionInput.value.trim()
    };

    if (categorySelect.value) {
      payload.id_categoria_ticket = Number(categorySelect.value) || categorySelect.value;
    }

    setSubmitting(submitBtn, true, "Crear ticket");

    try {
      await createTicket(payload);
      form.reset();
      setStatus(formStatus, "Ticket creado correctamente.", "success");
      await loadTickets();
    } catch (error) {
      setStatus(formStatus, "No se pudo crear el ticket.", "error");
    } finally {
      setSubmitting(submitBtn, false, "Crear ticket");
    }
  };

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => loadTickets());
  }

  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  Promise.allSettled([loadActivos(), loadCategorias()]).finally(() => {
    loadTickets();
  });
};

export const UserDashboardPage = {
  render,
  init,
  meta: {
    bodyClass: "page-user-dashboard",
    roles: ROLE_ALLOWLIST
  }
};
