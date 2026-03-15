const api = window.SIGAM_API;
const backBtn = document.getElementById('backBtn');
const detailTitle = document.getElementById('detailTitle');
const detailStatus = document.getElementById('detailStatus');
const detailId = document.getElementById('detailId');
const detailCreated = document.getElementById('detailCreated');
const detailAsset = document.getElementById('detailAsset');
const detailCategory = document.getElementById('detailCategory');
const detailAssigned = document.getElementById('detailAssigned');
const detailEstado = document.getElementById('detailEstado');
const detailDescription = document.getElementById('detailDescription');
const detailSolutions = document.getElementById('detailSolutions');

function normalizeToken(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();
}

function mapStatusClass(status) {
    const key = normalizeToken(status);
    if (key.includes('abierto')) return 'status-abierto';
    if (key.includes('proceso')) return 'status-en-proceso';
    if (key.includes('cerrado')) return 'status-cerrado';
    if (key.includes('resuelto')) return 'status-resuelto';
    return '';
}

function renderSolutions(list) {
    if (!detailSolutions) return;
    if (!Array.isArray(list) || list.length === 0) {
        detailSolutions.innerHTML = '<p class="muted">Sin sugerencias por ahora.</p>';
        return;
    }
    detailSolutions.innerHTML = list.map((item) => {
        if (typeof item === 'string') {
            return '<div class="solution-card"><p>' + item + '</p></div>';
        }
        const desc = item.descripcion || item.diagnostico || 'Sin descripcion';
        const score = typeof item.score === 'number' ? item.score.toFixed(2) : '';
        const meta = [
            item.id_ticket ? 'Ticket #' + item.id_ticket : '',
            score ? 'Score: ' + score : '',
            item.estado ? 'Estado: ' + item.estado : ''
        ].filter(Boolean).join(' • ');
        const keywords = Array.isArray(item.matched_keywords) && item.matched_keywords.length
            ? '<p>Coincidencias: ' + item.matched_keywords.join(', ') + '</p>'
            : '';
        return '<div class="solution-card">' +
            '<p><strong>' + (meta || 'Sugerencia') + '</strong></p>' +
            '<p>' + desc + '</p>' +
            keywords +
        '</div>';
    }).join('');
}

function normalizeTicket(raw) {
    const createdAt = raw.createdAt || raw.date || raw.created_at || raw.created_on || raw.fecha_creacion;
    const rawStatus = raw.status || raw.estado || '';
    const categoryLabel = raw.clasificacion_nlp || raw.category || raw.categoria || raw.categoria_nombre || '';
    return {
        id: raw.id || raw._id || raw.ticketId || raw.codigo || raw.id_ticket,
        title: raw.title || raw.titulo || raw.asunto || raw.descripcion || '',
        description: raw.description || raw.descripcion || '',
        device: raw.device || raw.dispositivo || raw.activo || raw.activo_serial || '',
        category: categoryLabel,
        createdBy: raw.createdBy || raw.creadoPor || raw.created_by || raw.usuario_reporta || '',
        assignedTo: raw.assignedTo || raw.asignadoA || raw.assigned_to || raw.usuario_asignado || '',
        status: rawStatus,
        createdAtLabel: createdAt ? new Date(createdAt).toLocaleString() : ''
    };
}

async function loadTicket() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    if (!api || !api.getTicket) return;

    const payload = await api.getTicket(id, { suggestions: true });
    const ticket = normalizeTicket(payload);

    detailTitle.textContent = ticket.title || 'Ticket #' + ticket.id;
    detailStatus.textContent = ticket.status || 'Pending';
    detailStatus.className = 'ticket-status ' + mapStatusClass(ticket.status);
    detailId.textContent = ticket.id || '-';
    detailCreated.textContent = ticket.createdAtLabel || '-';
    detailAsset.textContent = ticket.device || '-';
    detailCategory.textContent = ticket.category || '-';
    detailAssigned.textContent = ticket.assignedTo || 'Sin asignar';
    detailEstado.textContent = ticket.status || '-';
    detailDescription.textContent = ticket.description || '-';
    renderSolutions(payload.suggestions || []);
}

if (backBtn) {
    backBtn.addEventListener('click', () => {
        window.location.href = './tickets.html';
    });
}

loadTicket().catch(() => {
    if (detailSolutions) {
        detailSolutions.innerHTML = '<p class="muted">No se pudo cargar el ticket.</p>';
    }
});
