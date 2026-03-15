import { Navbar } from "../components/Navbar.js";
import { api } from "../services/api-client.js";
import SIGAM_CONFIG from "../services/config.js";
import { getUser } from "../state/storage.js";
import { router } from "../router.js";
import { normalizeCollection } from "../utils/normalize.js";
import { renderButton } from "../components/Button.js";
import "../css/pages/calendar.css";

const ROLE_ALLOWLIST = ["Gerente", "Tecnico"];
const CALENDAR_CSS_CDN = "https://cdn.jsdelivr.net/gh/williamtroup/Calendar.js@main/dist/calendar.js.min.css";
const CALENDAR_JS_CDN = "https://cdn.jsdelivr.net/gh/williamtroup/Calendar.js@main/dist/calendar.min.js";

let calendarInstance = null;
let currentView = "full-month";

const render = async () => {
  const navbarHTML = Navbar.render();

  return `
    ${navbarHTML}
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Maintenance Calendar</h3>
          <p class="text-muted">
            Scheduling preventive maintenance and inspections
          </p>
        </div>

        ${renderButton({
          label: "+ Schedule Maintenance",
          variant: "dark",
          attrs: { "data-bs-toggle": "modal", "data-bs-target": "#scheduleModal" }
        })}
      </div>

      <div class="row mb-4">
        <div class="col-md-4">
          <div class="stat-card">
            <i class="bi bi-calendar-event"></i>
            <h6 class="text-muted">Scheduled</h6>
            <h3 id="scheduledCount">0</h3>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-card">
            <i class="bi bi-exclamation-triangle"></i>
            <h6 class="text-muted text-danger">Overdue</h6>
            <h3 id="overdueCount">0</h3>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-card">
            <i class="bi bi-wrench"></i>
            <h6 class="text-muted text-success">Assets in Plan</h6>
            <h3 id="assetsCount">0</h3>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-2">
          ${renderButton({
            id: "prevPeriodBtn",
            content: "&lsaquo;",
            variant: "light"
          })}
          <h5 id="monthLabel" class="mb-0"></h5>
          ${renderButton({
            id: "nextPeriodBtn",
            content: "&rsaquo;",
            variant: "light"
          })}
        </div>

        <div class="d-flex gap-2">
          <div class="btn-group" role="group" aria-label="Calendar view">
            ${renderButton({
              id: "viewWeekBtn",
              label: "Week",
              variant: "outlineDark"
            })}
            ${renderButton({
              id: "viewMonthBtn",
              label: "Month",
              variant: "outlineDark"
            })}
          </div>
          <select class="form-select">
            <option>All Types</option>
            <option>Preventive</option>
            <option>In inspection</option>
            <option>Repair</option>
          </select>
          ${renderButton({
            id: "goTodayBtn",
            label: "Today",
            variant: "light"
          })}
        </div>
      </div>

      <div id="calendar" class="calendar"></div>
    </div>

    <div class="modal fade" id="scheduleModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Schedule Maintenance</h5>

            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form id="scheduleForm">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Ticket ID</label>
                <input id="ticketId" class="form-control" placeholder="e.g. 10" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Asset</label>
                <select id="assetName" class="form-select"></select>
              </div>

              <div class="mb-3">
                <label class="form-label">Maintenance Type</label>
                <select id="maintenanceType" class="form-select">
                  <option value="preventive">Preventive</option>
                  <option value="inspection">Inspection</option>
                  <option value="repair">Repair</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Date</label>
                <input id="maintenanceDate" type="date" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea id="notes" class="form-control"></textarea>
              </div>
            </div>

            <div class="modal-footer">
              ${renderButton({
                label: "Cancel",
                variant: "secondary",
                attrs: { "data-bs-dismiss": "modal" }
              })}

              <div id="scheduleStatus" class="me-auto small text-muted" aria-live="polite"></div>
              ${renderButton({
                label: "Save Schedule",
                type: "submit",
                variant: "dark"
              })}
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="modal fade" id="detailModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Maintenance Details</h5>

            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <p><strong>Asset:</strong> <span id="detailAsset"></span></p>
            <p><strong>Type:</strong> <span id="detailType"></span></p>
            <p><strong>Date:</strong> <span id="detailDate"></span></p>
            <p><strong>Notes:</strong> <span id="detailNotes"></span></p>
          </div>

          <div class="modal-footer">
            ${renderButton({
              id: "deleteMaintenanceBtn",
              label: "Delete",
              variant: "danger"
            })}

            ${renderButton({
              id: "editMaintenanceBtn",
              label: "Edit",
              variant: "primaryBootstrap"
            })}

            ${renderButton({
              label: "Close",
              variant: "secondary",
              attrs: { "data-bs-dismiss": "modal" }
            })}
          </div>
        </div>
      </div>
    </div>
  `;
};

const init = async () => {
  Navbar.init();
  await ensureBootstrapJs();
  await ensureCalendarJs();
  await initCalendar();
};

const ensureBootstrapJs = () => {
  if (window.bootstrap) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-sigam-bootstrap="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Bootstrap JS failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
    script.async = true;
    script.setAttribute("data-sigam-bootstrap", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Bootstrap JS failed to load"));
    document.head.appendChild(script);
  });
};

const ensureCalendarJs = () => {
  if (window.calendarJs) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-sigam-calendar="true"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CALENDAR_CSS_CDN;
      link.setAttribute("data-sigam-calendar", "true");
      document.head.appendChild(link);
    }

    const existing = document.querySelector('script[data-sigam-calendar="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Calendar.js failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = CALENDAR_JS_CDN;
    script.async = true;
    script.setAttribute("data-sigam-calendar", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendar.js failed to load"));
    document.head.appendChild(script);
  });
};

const initCalendar = async () => {
  const state = {
    maintenances: [],
    assetsList: [],
    usingApi: false,
    editIndex: null
  };

  const scheduleStatus = document.querySelector("#scheduleStatus");
  const scheduleForm = document.querySelector("#scheduleForm");
  const calendarEl = document.querySelector("#calendar");
  const monthLabel = document.querySelector("#monthLabel");

  const scheduledEl = document.querySelector("#scheduledCount");
  const overdueEl = document.querySelector("#overdueCount");
  const assetsEl = document.querySelector("#assetsCount");

  const prevPeriodBtn = document.querySelector("#prevPeriodBtn");
  const nextPeriodBtn = document.querySelector("#nextPeriodBtn");
  const goTodayBtn = document.querySelector("#goTodayBtn");
  const viewWeekBtn = document.querySelector("#viewWeekBtn");
  const viewMonthBtn = document.querySelector("#viewMonthBtn");

  const detailAsset = document.querySelector("#detailAsset");
  const detailType = document.querySelector("#detailType");
  const detailDate = document.querySelector("#detailDate");
  const detailNotes = document.querySelector("#detailNotes");

  const deleteBtn = document.querySelector("#deleteMaintenanceBtn");
  const editBtn = document.querySelector("#editMaintenanceBtn");

  const ticketIdInput = document.querySelector("#ticketId");
  const assetSelect = document.querySelector("#assetName");
  const typeSelect = document.querySelector("#maintenanceType");
  const dateInput = document.querySelector("#maintenanceDate");
  const notesInput = document.querySelector("#notes");

  if (!calendarEl || !window.calendarJs) {
    return;
  }

  calendarInstance = new window.calendarJs("calendar", {
    manualEditingEnabled: false,
    dragAndDropForEventsEnabled: true,
    views: {
      fullWeek: { enabled: true },
      timeline: { enabled: true }
    },
    events: {
      onEventClick: (event) => {
        const maintenance = findMaintenanceByEvent(state.maintenances, event);
        if (!maintenance) return;
        state.editIndex = state.maintenances.indexOf(maintenance);
        if (detailAsset) detailAsset.textContent = maintenance.asset || "";
        if (detailType) detailType.textContent = maintenance.type || "";
        if (detailDate) detailDate.textContent = maintenance.date || "";
        if (detailNotes) detailNotes.textContent = maintenance.notes || "-";
        const modal = new window.bootstrap.Modal(document.getElementById("detailModal"));
        modal.show();
      },
      onEventDragDrop: (event, targetDate) => {
        const maintenance = findMaintenanceByEvent(state.maintenances, event);
        if (!maintenance || !targetDate) return;
        maintenance.date = targetDate.toISOString().split("T")[0];
        persistMaintenances(state);
        updateStats(state, scheduledEl, overdueEl, assetsEl);
        if (state.usingApi) {
          updateMaintenanceInApi(maintenance);
        }
      },
      onViewChange: (viewName) => {
        currentView = viewName || currentView;
        updateViewButtons(currentView, viewWeekBtn, viewMonthBtn);
        updateMonthLabel(monthLabel);
      }
    }
  });

  updateViewButtons(currentView, viewWeekBtn, viewMonthBtn);
  updateMonthLabel(monthLabel);

  if (prevPeriodBtn) {
    prevPeriodBtn.addEventListener("click", () => {
      calendarInstance.moveCurrentViewToPreviousDate();
      updateMonthLabel(monthLabel);
    });
  }
  if (nextPeriodBtn) {
    nextPeriodBtn.addEventListener("click", () => {
      calendarInstance.moveCurrentViewToNextDate();
      updateMonthLabel(monthLabel);
    });
  }
  if (goTodayBtn) {
    goTodayBtn.addEventListener("click", () => {
      calendarInstance.moveToToday();
      updateMonthLabel(monthLabel);
    });
  }
  if (viewWeekBtn) {
    viewWeekBtn.addEventListener("click", () => {
      calendarInstance.setOptions({ viewToOpenOnFirstLoad: "full-week" });
      calendarInstance.refresh();
      currentView = "full-week";
      updateViewButtons(currentView, viewWeekBtn, viewMonthBtn);
      updateMonthLabel(monthLabel);
    });
  }
  if (viewMonthBtn) {
    viewMonthBtn.addEventListener("click", () => {
      calendarInstance.setOptions({ viewToOpenOnFirstLoad: "full-month" });
      calendarInstance.refresh();
      currentView = "full-month";
      updateViewButtons(currentView, viewWeekBtn, viewMonthBtn);
      updateMonthLabel(monthLabel);
    });
  }

  if (scheduleForm) {
    scheduleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ticketId = ticketIdInput ? ticketIdInput.value.trim() : "";
      const assetValue = assetSelect ? assetSelect.value : "";
      const typeValue = typeSelect ? typeSelect.value : "preventive";
      const dateValue = dateInput ? dateInput.value : "";
      const notesValue = notesInput ? notesInput.value : "";

      if (!ticketId || !dateValue) {
        setScheduleStatus(scheduleStatus, "Ticket ID y Date son obligatorios.", "error");
        return;
      }

      const user = getUser();
      const technicianId = user && (user.id || user.id_usuario || user.userId);

      if (!technicianId) {
        setScheduleStatus(scheduleStatus, "Debes iniciar sesion para programar mantenimiento.", "error");
        return;
      }

      const maintenance = {
        id: state.editIndex !== null ? (state.maintenances[state.editIndex] || {}).id : "",
        localId: state.editIndex === null ? buildLocalId() : undefined,
        ticketId,
        technicianId,
        asset: assetValue,
        type: typeValue,
        date: dateValue,
        notes: notesValue
      };

      if (state.editIndex !== null) {
        state.maintenances[state.editIndex] = maintenance;
        state.editIndex = null;
      } else {
        state.maintenances.push(maintenance);
      }

      persistMaintenances(state);
      syncCalendarEvents(state.maintenances);
      updateStats(state, scheduledEl, overdueEl, assetsEl);

      if (state.usingApi) {
        await upsertMaintenanceInApi(maintenance, scheduleStatus, state);
      }

      scheduleForm.reset();
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("scheduleModal"));
      if (modal) {
        modal.hide();
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this maintenance?")) return;
      const target = state.maintenances[state.editIndex] || {};
      if (state.usingApi && target.id) {
        await deleteMaintenanceInApi(target.id, scheduleStatus);
      }
      state.maintenances.splice(state.editIndex, 1);
      persistMaintenances(state);
      syncCalendarEvents(state.maintenances);
      updateStats(state, scheduledEl, overdueEl, assetsEl);
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("detailModal"));
      if (modal) modal.hide();
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const target = state.maintenances[state.editIndex];
      if (!target) return;
      if (ticketIdInput) ticketIdInput.value = target.ticketId || "";
      if (assetSelect) assetSelect.value = target.asset || "";
      if (typeSelect) typeSelect.value = target.type || "preventive";
      if (dateInput) dateInput.value = target.date || "";
      if (notesInput) notesInput.value = target.notes || "";
      const modal = new window.bootstrap.Modal(document.getElementById("scheduleModal"));
      modal.show();
    });
  }

  await refreshMaintenances(state, scheduleStatus, scheduledEl, overdueEl, assetsEl);
  await loadAssets(state, assetSelect);
};

const setScheduleStatus = (element, message, type) => {
  if (!element) return;
  element.textContent = message || "";
  element.className = "me-auto small";
  if (type === "error") {
    element.classList.add("text-danger");
  } else if (type === "success") {
    element.classList.add("text-success");
  } else {
    element.classList.add("text-muted");
  }
};

const normalizeMaintenance = (raw) => {
  return {
    id: raw.id || raw.id_mantenimiento || raw.id_mantenimiento_orden || "",
    localId: raw.localId,
    ticketId: raw.id_ticket || raw.ticketId || "",
    technicianId: raw.id_usuario_tecnico || raw.technicianId || "",
    asset: raw.asset || raw.activo || raw.assetName || "",
    type: raw.tipo || raw.type || "preventive",
    date: raw.fecha_inicio || raw.date || "",
    notes: raw.diagnostico || raw.notes || ""
  };
};

const buildLocalId = () => `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const refreshMaintenances = async (state, scheduleStatus, scheduledEl, overdueEl, assetsEl) => {
  if (SIGAM_CONFIG.API_BASE_URL) {
    try {
      const payload = await api.apiRequest(SIGAM_CONFIG.MANTENIMIENTOS_ENDPOINT);
      const data = normalizeCollection(payload);
      state.usingApi = true;
      state.maintenances = (data || []).map((item) => normalizeMaintenance(item));
      persistMaintenances(state);
      syncCalendarEvents(state.maintenances);
      setScheduleStatus(scheduleStatus, "Maintenance loaded from the API.", "success");
      updateStats(state, scheduledEl, overdueEl, assetsEl);
      return;
    } catch (error) {
      setScheduleStatus(scheduleStatus, "Could not load maintenance from the API.", "error");
    }
  }

  state.usingApi = false;
  const cached = JSON.parse(localStorage.getItem("maintenances") || "[]");
  state.maintenances = cached.map((item) => normalizeMaintenance(item));
  syncCalendarEvents(state.maintenances);
  updateStats(state, scheduledEl, overdueEl, assetsEl);
};

const persistMaintenances = (state) => {
  localStorage.setItem("maintenances", JSON.stringify(state.maintenances));
};

const syncCalendarEvents = (maintenances) => {
  if (!calendarInstance) return;
  const events = maintenances.map((m) => ({
    id: m.id || m.localId || buildLocalId(),
    title: `${m.asset || "Asset"} - ${m.type || "maintenance"}`,
    from: m.date ? new Date(`${m.date}T00:00:00`) : new Date(),
    to: m.date ? new Date(`${m.date}T23:59:59`) : new Date(),
    description: m.notes || "",
    group: m.technicianId ? `Technician ${m.technicianId}` : "Technician",
    isAllDay: true,
    customTags: {
      maintenanceId: m.id,
      localId: m.localId,
      ticketId: m.ticketId,
      technicianId: m.technicianId,
      asset: m.asset,
      type: m.type,
      date: m.date,
      notes: m.notes
    }
  }));
  calendarInstance.setEvents(events);
};

const findMaintenanceByEvent = (maintenances, event) => {
  const custom = event && event.customTags ? event.customTags : {};
  const id = custom.maintenanceId || event.id;
  const localId = custom.localId;
  return maintenances.find((m) => (id && m.id === id) || (localId && m.localId === localId));
};

const updateStats = (state, scheduledEl, overdueEl, assetsEl) => {
  if (!scheduledEl && !overdueEl && !assetsEl) {
    return;
  }
  const today = new Date().toISOString().split("T")[0];
  if (scheduledEl) scheduledEl.innerText = state.maintenances.length;
  const overdue = state.maintenances.filter((m) => m.date && m.date < today).length;
  if (overdueEl) overdueEl.innerText = overdue;
  const uniqueAssets = new Set(state.maintenances.map((m) => m.asset));
  if (assetsEl) assetsEl.innerText = uniqueAssets.size;
};

const loadAssets = async (state, select) => {
  if (!select) return;
  select.innerHTML = "";

  if (SIGAM_CONFIG.API_BASE_URL) {
    try {
      const payload = await api.apiRequest(SIGAM_CONFIG.ACTIVOS_ENDPOINT);
      const data = normalizeCollection(payload);
      state.assetsList = Array.isArray(data) ? data : [];
      if (state.assetsList.length === 0) {
        select.innerHTML = '<option value="">No assets available</option>';
        return;
      }
      state.assetsList.forEach((asset) => {
        const id = asset.id_activo || asset.id || asset.idActivo || "";
        const labelParts = [asset.modelo, asset.serial, asset.sede, asset.sala].filter(Boolean);
        const label = labelParts.join(" - ") || asset.nombre || `Asset ${id}`;
        select.innerHTML += `
          <option value="${label}">
            ${label}
          </option>
        `;
      });
      return;
    } catch {
      select.innerHTML = '<option value="">No assets available</option>';
      return;
    }
  }

  const assets = JSON.parse(localStorage.getItem("assets") || "[]");
  if (assets.length === 0) {
    select.innerHTML = '<option value="">No assets available</option>';
    return;
  }

  assets.forEach((asset) => {
    select.innerHTML += `
      <option value="${asset.name}">
        ${asset.name}
      </option>
    `;
  });
};

const upsertMaintenanceInApi = async (maintenance, scheduleStatus, state) => {
  const payload = {
    id_ticket: Number(maintenance.ticketId) || maintenance.ticketId,
    id_usuario_tecnico: maintenance.technicianId,
    diagnostico: maintenance.notes,
    fecha_inicio: maintenance.date
  };

  try {
    if (maintenance.id) {
      const safeId = encodeURIComponent(maintenance.id);
      await api.apiRequest(`${SIGAM_CONFIG.MANTENIMIENTOS_ENDPOINT}/${safeId}`, {
        method: "PUT",
        body: payload
      });
    } else {
      const response = await api.apiRequest(SIGAM_CONFIG.MANTENIMIENTOS_ENDPOINT, {
        method: "POST",
        body: payload
      });
      if (response && response.id) {
        maintenance.id = response.id;
        persistMaintenances(state);
      }
    }
    setScheduleStatus(scheduleStatus, "Maintenance saved in the API.", "success");
    await refreshMaintenances(state, scheduleStatus);
  } catch {
    setScheduleStatus(scheduleStatus, "Could not save maintenance in the API.", "error");
  }
};

const updateMaintenanceInApi = async (maintenance) => {
  if (!maintenance.id) return;
  const payload = {
    id_ticket: Number(maintenance.ticketId) || maintenance.ticketId,
    id_usuario_tecnico: maintenance.technicianId,
    diagnostico: maintenance.notes,
    fecha_inicio: maintenance.date
  };
  const safeId = encodeURIComponent(maintenance.id);
  try {
    await api.apiRequest(`${SIGAM_CONFIG.MANTENIMIENTOS_ENDPOINT}/${safeId}`, {
      method: "PUT",
      body: payload
    });
  } catch {
    // ignore update errors here
  }
};

const deleteMaintenanceInApi = async (maintenanceId, scheduleStatus) => {
  try {
    const safeId = encodeURIComponent(maintenanceId);
    await api.apiRequest(`${SIGAM_CONFIG.MANTENIMIENTOS_ENDPOINT}/${safeId}`, { method: "DELETE" });
    setScheduleStatus(scheduleStatus, "Maintenance deleted in the API.", "success");
  } catch {
    setScheduleStatus(scheduleStatus, "Could not delete in the API.", "error");
  }
};

const updateViewButtons = (viewName, weekBtn, monthBtn) => {
  if (!weekBtn || !monthBtn) return;
  const isWeek = String(viewName).includes("week");
  weekBtn.classList.toggle("active", isWeek);
  monthBtn.classList.toggle("active", !isWeek);
};

const updateMonthLabel = (labelEl) => {
  if (!labelEl || !calendarInstance) return;
  const current = calendarInstance.getCurrentDisplayDate();
  const monthName = current.toLocaleString("default", { month: "long" });
  labelEl.textContent = `${monthName} ${current.getFullYear()}`;
};

export const CalendarPage = {
  render,
  init,
  meta: {
    bodyClass: "page-calendar",
    roles: ROLE_ALLOWLIST
  }
};
