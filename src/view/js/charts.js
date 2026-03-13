const api = window.SIGAM_API;
let pieChartInstance;
let barChartInstance;
let lineChartInstance;

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});

async function safeFetch(fn) {
    if (!fn) {
        return [];
    }
    try {
        const data = await fn();
        return Array.isArray(data) ? data : data || [];
    } catch (error) {
        return [];
    }
}

async function loadDashboardData() {
    const recentContainer = document.getElementById("recentTickets");
    const maintenanceContainer = document.getElementById("upcomingMaintenance");

    if (!api) {
        if (recentContainer) {
            recentContainer.innerHTML = '<p class="ticket-empty">API not available.</p>';
        }
        if (maintenanceContainer) {
            maintenanceContainer.innerHTML = '<p class="ticket-empty">API not available.</p>';
        }
        return;
    }

    const [activos, tickets, mantenimientos] = await Promise.all([
        safeFetch(api.getActivos),
        safeFetch(api.getTickets),
        safeFetch(api.getMantenimientos)
    ]);

    const data = buildDashboardData(activos, tickets, mantenimientos);
    updateCards(data);
    createCharts(data);

    if (recentContainer) {
        renderRecentTickets(recentContainer, (tickets || []).map(normalizeTicket));
    }
    if (maintenanceContainer) {
        renderUpcomingMaintenance(maintenanceContainer, mantenimientos);
    }
}

function normalizeTicket(raw) {
    const createdAt =
        raw.createdAt ||
        raw.date ||
        raw.created_at ||
        raw.created_on ||
        raw.fecha_creacion;
    const status =
        raw.status ||
        raw.estado ||
        raw.estado_ticket ||
        raw.estado_actual ||
        raw.status_ticket ||
        "";
    const createdDate = createdAt ? new Date(createdAt) : null;
    return {
        id: raw.id || raw._id || raw.ticketId || raw.codigo || raw.id_ticket,
        title: raw.title || raw.titulo || raw.asunto || "",
        device: raw.device || raw.dispositivo || "",
        category: raw.category || raw.categoria || "",
        status,
        createdAt: createdDate
    };
}

function renderRecentTickets(container, list) {
    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = '<p class="ticket-empty">No recent tickets.</p>';
        return;
    }

    const recent = list
        .slice()
        .sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.getTime() : 0;
            const dateB = b.createdAt ? b.createdAt.getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 5);

    container.innerHTML = "";
    recent.forEach(ticket => {
        const item = document.createElement("div");
        item.className = "recent-ticket";
        const ui = mapStatus(ticket.status);
        item.innerHTML = `
            <span class="dot ${ui.dot}" style="background:${ui.dotColor}"></span>
            <div>
                <strong>${ticket.title || "Untitled ticket"}</strong>
                <p>${ticket.device || ticket.category || "No details"}</p>
                <small class="text-muted d-block">
                    ${ticket.createdAt ? ticket.createdAt.toLocaleString() : ""}
                </small>
                <span class="badge ${ui.badge}" style="background:${ui.badgeBg};color:${ui.badgeColor}">
                    ${ui.label}
                </span>
            </div>
        `;
        container.appendChild(item);
    });
}

function mapStatus(status) {
    const value = (status || "").toLowerCase();
    if (value.includes("progreso") || value.includes("progress")) {
        return {
            dot: "status-progress",
            badge: "badge-progress",
            label: status || "in progress",
            dotColor: "#f59e0b",
            badgeBg: "#fef3c7",
            badgeColor: "#92400e"
        };
    }
    if (value.includes("complet") || value.includes("resolved") || value.includes("cerrad") || value.includes("resuelt")) {
        return {
            dot: "status-resolved",
            badge: "badge-resolved",
            label: status || "resolved",
            dotColor: "#16a34a",
            badgeBg: "#dcfce7",
            badgeColor: "#166534"
        };
    }
    if (value.includes("pend") || value.includes("open") || value.includes("abiert")) {
        return {
            dot: "status-open",
            badge: "badge-open",
            label: status || "open",
            dotColor: "#dc2626",
            badgeBg: "#fee2e2",
            badgeColor: "#b91c1c"
        };
    }
    return {
        dot: "status-open",
        badge: "badge-open",
        label: status || "open",
        dotColor: "#dc2626",
        badgeBg: "#fee2e2",
        badgeColor: "#b91c1c"
    };
}

function buildDashboardData(activos, tickets, mantenimientos) {
    const safeActivos = Array.isArray(activos) ? activos : [];
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    const safeMaint = Array.isArray(mantenimientos) ? mantenimientos : [];
    const openTickets = safeTickets.filter((ticket) => {
        const status = (ticket.estado || ticket.status || "").toLowerCase();
        return !status.includes("cerrad") && !status.includes("complet");
    }).length;

    const ticketsByCategory = {};
    safeTickets.forEach((ticket) => {
        const category =
            ticket.categoria ||
            ticket.category ||
            ticket.tipo ||
            "Sin categoria";
        const label = String(category || "Sin categoria");
        ticketsByCategory[label] = (ticketsByCategory[label] || 0) + 1;
    });

    const assetsByType = {
        laptops: 0,
        desktops: 0,
        servers: 0,
        printers: 0,
        monitors: 0,
        others: 0
    };
    safeActivos.forEach((asset) => {
        const model = String(asset.modelo || asset.nombre || asset.marca || "").toLowerCase();
        if (model.includes("laptop") || model.includes("notebook")) {
            assetsByType.laptops += 1;
        } else if (model.includes("server")) {
            assetsByType.servers += 1;
        } else if (model.includes("printer") || model.includes("impresora")) {
            assetsByType.printers += 1;
        } else if (model.includes("monitor")) {
            assetsByType.monitors += 1;
        } else if (model.includes("desktop") || model.includes("pc")) {
            assetsByType.desktops += 1;
        } else {
            assetsByType.others += 1;
        }
    });

    const totalCost = safeMaint.reduce((sum, m) => {
        const raw = m.costo || m.costo_total || m.costo_mantenimiento || m.total_cost || m.cost;
        const value = Number.parseFloat(raw || "0");
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    const scheduledMaintenance = countUpcoming(safeMaint, 30);

    return {
        assets: safeActivos.length,
        openTickets,
        scheduledMaintenance,
        totalCost,
        assetsByType,
        ticketsByCategory,
        maintenanceCost: buildMaintenanceTrend(safeMaint)
    };
}

// actualizar tarjetas del dashboard
function updateCards(data) {
    const assetsEl = document.querySelector(".card-activos h2");
    const ticketsEl = document.querySelector(".card-tikects h2");
    const scheduledEl = document.querySelector(".card-scheduled h2");
    const costEl = document.querySelector(".card-cost h2");

    if (assetsEl) assetsEl.textContent = data.assets ?? "-";
    if (ticketsEl) ticketsEl.textContent = data.openTickets ?? "-";
    if (scheduledEl) scheduledEl.textContent = data.scheduledMaintenance ?? "-";
    if (costEl) {
        costEl.textContent = data.totalCost ? `$${Math.round(data.totalCost)}` : "-";
    }
}

// crear todas las graficas
function createCharts(data) {
    if (typeof Chart === "undefined") {
        return;
    }
    createPieChart(data);
    createBarChart(data);
    createLineChart(data);
}

// grafica de assets por tipo
function createPieChart(data) {
    const footChart = document.getElementById("footChart");
    if (!footChart) {
        return;
    }
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
    pieChartInstance = new Chart(footChart, {
        type: "pie",
        data: {
            labels: ["Laptops", "Desktops", "Servers", "Printers", "Monitors", "Others"],
            datasets: [{
                data: [
                    data.assetsByType?.laptops ?? 0,
                    data.assetsByType?.desktops ?? 0,
                    data.assetsByType?.servers ?? 0,
                    data.assetsByType?.printers ?? 0,
                    data.assetsByType?.monitors ?? 0,
                    data.assetsByType?.others ?? 0
                ],
                backgroundColor: [
                    "#4e73df",
                    "#1cc88a",
                    "#f6c23e",
                    "#e74a3b",
                    "#858796",
                    "#9ca3af"
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// grafica de tickets por categoria
function createBarChart(data) {
    const barChart = document.getElementById("barChart");
    if (!barChart) {
        return;
    }
    const labels = Object.keys(data.ticketsByCategory || {});
    const values = labels.map((label) => data.ticketsByCategory[label] || 0);
    if (barChartInstance) {
        barChartInstance.destroy();
    }
    barChartInstance = new Chart(barChart, {
        type: "bar",
        data: {
            labels: labels.length ? labels : ["Sin categoria"],
            datasets: [{
                label: "Tickets",
                data: [
                    ...(values.length ? values : [0])
                ],
                backgroundColor: "#4e73df"
            }]
        },
        options: {
            responsive: true
        }
    });
}

// grafica de costos de mantenimiento
function createLineChart(data) {
    const lineCtx = document.getElementById("lineChart");
    if (!lineCtx) {
        return;
    }
    if (lineChartInstance) {
        lineChartInstance.destroy();
    }
    const trend = Array.isArray(data.maintenanceCost) ? data.maintenanceCost : [];
    lineChartInstance = new Chart(lineCtx, {
        type: "line",
        data: {
            labels: trend.map((item) => item.label),
            datasets: [{
                label: "Maintenance Cost",
                data: trend.map((item) => item.value),
                borderColor: "#4e73df",
                backgroundColor: "rgba(78,115,223,0.1)",
                tension: 0.4,
                fill: true,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderUpcomingMaintenance(container, list) {
    const maints = Array.isArray(list) ? list : [];
    if (!maints.length) {
        container.innerHTML = '<p class="ticket-empty">No upcoming maintenance.</p>';
        return;
    }
    const normalized = maints.map(normalizeMaintenance);
    const withDate = normalized.filter((m) => m.date);
    const withoutDate = normalized.filter((m) => !m.date);

    let upcoming = withDate
        .filter((m) => m.date >= todayISO())
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
        .slice(0, 5);

    if (!upcoming.length && withoutDate.length) {
        upcoming = withoutDate.slice(0, 5);
    }

    if (!upcoming.length) {
        container.innerHTML = '<p class="ticket-empty">No upcoming maintenance.</p>';
        return;
    }

    container.innerHTML = "";
    upcoming.forEach((m) => {
        const title = m.asset || (m.ticketId ? `Ticket #${m.ticketId}` : "Maintenance");
        const subtitle = m.notes || m.type || "Maintenance scheduled";
        const dateLabel = m.date ? new Date(m.date).toLocaleDateString() : "Sin fecha";
        const item = document.createElement("div");
        item.className = "maintenance-next";
        item.innerHTML = `
            <h4>${title}</h4>
            <h6>${subtitle}</h6>
            <h6>${dateLabel}</h6>
        `;
        container.appendChild(item);
    });
}

function normalizeMaintenance(raw) {
    const rawDate =
        raw.fecha_inicio ||
        raw.fecha_programada ||
        raw.fecha_mantenimiento ||
        raw.fecha ||
        raw.date;
    const normalizedDate = normalizeDate(rawDate);
    return {
        id: raw.id || raw.id_mantenimiento || raw.id_mantenimiento_orden || "",
        ticketId: raw.id_ticket || raw.ticketId || "",
        asset: raw.activo || raw.asset || raw.assetName || "",
        type: raw.tipo || raw.type || "",
        date: normalizedDate || "",
        notes: raw.diagnostico || raw.notes || ""
    };
}

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function normalizeDate(value) {
    if (!value) {
        return "";
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }
    return parsed.toISOString().split("T")[0];
}

function countUpcoming(list, days) {
    const today = todayISO();
    const limit = new Date();
    limit.setDate(limit.getDate() + days);
    const limitStr = limit.toISOString().split("T")[0];
    return (list || [])
        .map(normalizeMaintenance)
        .filter((m) => m.date && m.date >= today && m.date <= limitStr).length;
}

function buildMaintenanceTrend(list) {
    const months = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString("default", { month: "short" });
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            label,
            value: 0
        });
    }
    const monthMap = new Map(months.map((m) => [m.key, m]));
    (list || []).forEach((m) => {
        const normalized = normalizeMaintenance(m);
        if (!normalized.date) {
            return;
        }
        const key = normalized.date.slice(0, 7);
        if (!monthMap.has(key)) {
            return;
        }
        const costRaw = m.costo || m.costo_total || m.costo_mantenimiento || m.total_cost || m.cost;
        const cost = Number.parseFloat(costRaw || "0");
        if (!Number.isFinite(cost)) {
            return;
        }
        monthMap.get(key).value += cost;
    });
    return months;
}
