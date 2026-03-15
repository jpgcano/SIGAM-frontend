import { Navbar } from "../components/Navbar.js";
import { api } from "../api-client.js";
import SIGAM_CONFIG from "../config.js";
import { router } from "../router.js";
import "../css/pages/tickets.css";

const ROLE_ALLOWLIST = ["Gerente", "Analista", "Tecnico", "Usuario"];

const render = async () => {
  const navbarHTML = Navbar.render();

  return `
    ${navbarHTML}
    <div class="container">
      <div class="header">
        <div>
          <h1>Ticket</h1>
          <p class="subtitle">Detalle del ticket y sugerencias</p>
        </div>
        <button class="btn-nuevo" id="backBtn">Volver</button>
      </div>

      <div class="ticket-detail">
        <div class="detail-header">
          <h2 id="detailTitle">Ticket</h2>
          <span id="detailStatus" class="ticket-status">Estado</span>
        </div>
        <div class="detail-grid">
          <div><strong>ID:</strong> <span id="detailId">-</span></div>
          <div><strong>Creado:</strong> <span id="detailCreated">-</span></div>
          <div><strong>Activo:</strong> <span id="detailAsset">-</span></div>
          <div><strong>Clasificacion:</strong> <span id="detailCategory">-</span></div>
          <div><strong>Asignado a:</strong> <span id="detailAssigned">-</span></div>
          <div><strong>Estado:</strong> <span id="detailEstado">-</span></div>
        </div>
        <div class="detail-section">
          <h3>Descripcion</h3>
          <p id="detailDescription">-</p>
        </div>
        <div class="detail-section">
          <h3>Soluciones sugeridas</h3>
          <div id="detailSolutions" class="detail-solutions">
            <p class="muted">Sin sugerencias por ahora.</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const init = async () => {
  Navbar.init();
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      router.navigateTo("/tickets");
    });
  }
  await loadTicket();
};

const normalizeToken = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
};

const mapStatusClass = (status) => {
  const key = normalizeToken(status);
  if (key.includes("abierto")) return "status-abierto";
  if (key.includes("proceso")) return "status-en-proceso";
  if (key.includes("cerrado")) return "status-cerrado";
  if (key.includes("resuelto")) return "status-resuelto";
  return "";
};

const renderSolutions = (list) => {
  const detailSolutions = document.getElementById("detailSolutions");
  if (!detailSolutions) return;
  if (!Array.isArray(list) || list.length === 0) {
    detailSolutions.innerHTML = '<p class="muted">Sin sugerencias por ahora.</p>';
    return;
  }
  detailSolutions.innerHTML = list.map((item) => {
    if (typeof item === "string") {
      return `<div class="solution-card"><p>${item}</p></div>`;
    }
    const desc = item.descripcion || item.diagnostico || "Sin descripcion";
    const score = typeof item.score === "number" ? item.score.toFixed(2) : "";
    const meta = [
      item.id_ticket ? `Ticket #${item.id_ticket}` : "",
      score ? `Score: ${score}` : "",
      item.estado ? `Estado: ${item.estado}` : ""
    ].filter(Boolean).join(" • ");
    const keywords = Array.isArray(item.matched_keywords) && item.matched_keywords.length
      ? `<p>Coincidencias: ${item.matched_keywords.join(", ")}</p>`
      : "";
    return `
      <div class="solution-card">
        <p><strong>${meta || "Sugerencia"}</strong></p>
        <p>${desc}</p>
        ${keywords}
      </div>
    `;
  }).join("");
};

const normalizeTicket = (raw) => {
  const createdAt = raw.createdAt || raw.date || raw.created_at || raw.created_on || raw.fecha_creacion;
  const rawStatus = raw.status || raw.estado || "";
  const categoryLabel = raw.clasificacion_nlp || raw.category || raw.categoria || raw.categoria_nombre || "";
  return {
    id: raw.id || raw._id || raw.ticketId || raw.codigo || raw.id_ticket,
    title: raw.title || raw.titulo || raw.asunto || raw.descripcion || "",
    description: raw.description || raw.descripcion || "",
    device: raw.device || raw.dispositivo || raw.activo || raw.activo_serial || "",
    category: categoryLabel,
    createdBy: raw.createdBy || raw.creadoPor || raw.created_by || raw.usuario_reporta || "",
    assignedTo: raw.assignedTo || raw.asignadoA || raw.assigned_to || raw.usuario_asignado || "",
    status: rawStatus,
    createdAtLabel: createdAt ? new Date(createdAt).toLocaleString() : ""
  };
};

const loadTicket = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;
  if (!SIGAM_CONFIG.API_BASE_URL) return;

  const payload = await api.apiRequest(`${SIGAM_CONFIG.TICKETS_ENDPOINT}/${encodeURIComponent(id)}?suggestions=true`);
  const ticket = normalizeTicket(payload || {});

  const detailTitle = document.getElementById("detailTitle");
  const detailStatus = document.getElementById("detailStatus");
  const detailId = document.getElementById("detailId");
  const detailCreated = document.getElementById("detailCreated");
  const detailAsset = document.getElementById("detailAsset");
  const detailCategory = document.getElementById("detailCategory");
  const detailAssigned = document.getElementById("detailAssigned");
  const detailEstado = document.getElementById("detailEstado");
  const detailDescription = document.getElementById("detailDescription");

  if (detailTitle) detailTitle.textContent = ticket.title || `Ticket #${ticket.id}`;
  if (detailStatus) {
    detailStatus.textContent = ticket.status || "Pending";
    detailStatus.className = `ticket-status ${mapStatusClass(ticket.status)}`;
  }
  if (detailId) detailId.textContent = ticket.id || "-";
  if (detailCreated) detailCreated.textContent = ticket.createdAtLabel || "-";
  if (detailAsset) detailAsset.textContent = ticket.device || "-";
  if (detailCategory) detailCategory.textContent = ticket.category || "-";
  if (detailAssigned) detailAssigned.textContent = ticket.assignedTo || "Sin asignar";
  if (detailEstado) detailEstado.textContent = ticket.status || "-";
  if (detailDescription) detailDescription.textContent = ticket.description || "-";

  renderSolutions(payload?.suggestions || []);
};

export const TicketDetailPage = {
  render,
  init,
  meta: {
    bodyClass: "page-tickets",
    roles: ROLE_ALLOWLIST
  }
};
