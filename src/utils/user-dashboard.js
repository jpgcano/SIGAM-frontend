import { getUser } from "../state/storage.js";

export const normalizeToken = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const mapStatusClass = (status) => {
  const key = normalizeToken(status);
  if (key.includes("abierto")) return "status-abierto";
  if (key.includes("proceso") || key.includes("asignado")) return "status-en-proceso";
  if (key.includes("cerrado")) return "status-cerrado";
  if (key.includes("resuelto")) return "status-resuelto";
  return "";
};

export const getActivoSerial = (activo) => {
  return (
    activo.serial ||
    activo.serie ||
    activo.codigo ||
    activo.codigo_activo ||
    activo.serial_activo ||
    ""
  );
};

export const normalizeTicket = (raw) => {
  const createdAt = raw.createdAt || raw.date || raw.created_at || raw.created_on || raw.fecha_creacion;
  const rawStatus = raw.status || raw.estado || "";
  const categoryLabel =
    raw.categoria_ticket ||
    raw.category ||
    raw.categoria ||
    raw.categoria_nombre ||
    "";

  return {
    id: raw.id || raw._id || raw.ticketId || raw.codigo || raw.id_ticket,
    title: raw.title || raw.titulo || raw.asunto || raw.descripcion || "",
    description: raw.description || raw.descripcion || "",
    device: raw.device || raw.dispositivo || raw.activo_serial || "",
    category: categoryLabel,
    createdBy: raw.createdBy || raw.creadoPor || raw.created_by || raw.usuario_reporta || "",
    assignedTo: raw.assignedTo || raw.asignadoA || raw.assigned_to || raw.usuario_asignado || raw.tecnico_asignado || "",
    status: rawStatus,
    createdAt: createdAt ? new Date(createdAt) : null,
    date: createdAt ? new Date(createdAt).toLocaleDateString() : ""
  };
};

export const getUserContext = () => {
  const user = getUser() || {};
  return {
    raw: user,
    id: user.id || user.id_usuario || user.userId || "",
    email: String(user.email || user.correo || "").toLowerCase(),
    name: normalizeToken(user.nombre || user.name || user.fullName || "")
  };
};

export const isTicketFromUser = (raw, userCtx) => {
  const ticketId = raw.id_usuario_reporta || raw.id_usuario || raw.usuario_id || raw.usuarioId || raw.userId || raw.created_by || "";
  if (userCtx.id && ticketId && String(ticketId) === String(userCtx.id)) return true;

  const ticketEmail = String(
    raw.email ||
    raw.correo ||
    raw.email_reporta ||
    raw.usuario_email ||
    ""
  ).toLowerCase();
  if (userCtx.email && ticketEmail && ticketEmail === userCtx.email) return true;

  const ticketName = normalizeToken(
    raw.usuario_reporta ||
    raw.createdBy ||
    raw.creadoPor ||
    raw.usuario ||
    ""
  );
  if (userCtx.name && ticketName && ticketName === userCtx.name) return true;

  return false;
};
