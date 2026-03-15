const api = window.SIGAM_API;
let costChart;
let assetsChart;
let maintenanceChart;

document.addEventListener("DOMContentLoaded", () => {
    loadReports();
});

async function safeFetch(fn) {
    if (!fn) {
        return [];
    }
    try {
        const data = await fn();
        return Array.isArray(data) ? data : data || [];
    } catch {
        return [];
    }
}

async function loadReports() {
    const [assets, tickets, maintenances] = await Promise.all([
        safeFetch(api && api.getActivos),
        safeFetch(api && api.getTickets),
        safeFetch(api && api.getMantenimientos)
    ]);

    setStatus(`Assets: ${assets.length} • Tickets: ${tickets.length} • Maintenances: ${maintenances.length}`);

    const metrics = buildMetrics(assets, tickets, maintenances);
    renderMetrics(metrics);

    renderCharts(assets, maintenances);
    renderComparisonChart(maintenances);
    renderAttentionAssets(assets, maintenances);
    renderExpiringWarranties(assets);
}

function setStatus(message) {
    const statusEl = document.getElementById("reportsStatus");
    if (!statusEl) {
        return;
    }
    statusEl.textContent = message || "";
}

function buildMetrics(assets, tickets, maintenances) {
    const investment = sumBy(assets, [
        "costo",
        "costo_compra",
        "precio",
        "valor_compra",
        "valor"
    ]);

    const maintenanceCost = sumBy(maintenances, [
        "costo",
        "costo_total",
        "costo_mantenimiento",
        "total_cost",
        "cost"
    ]);

    const manHours = sumBy(maintenances, [
        "horas",
        "horas_hombre",
        "man_hours",
        "manhours",
        "duracion_horas"
    ]);

    const totalTickets = Array.isArray(tickets) ? tickets.length : 0;
    const closedTickets = (tickets || []).filter((t) => {
        const status = String(
            t.estado || t.status || t.estado_ticket || t.estado_actual || ""
        ).toLowerCase();
        return status.includes("cerrad") || status.includes("resuelt") || status.includes("complet");
    }).length;

    const resolutionRate = totalTickets
        ? Math.round((closedTickets / totalTickets) * 100)
        : 0;

    return {
        investment,
        maintenanceCost,
        manHours,
        resolutionRate
    };
}

function renderMetrics(metrics) {
    const investmentEl = document.getElementById("totalInvestment");
    const maintenanceEl = document.getElementById("maintenanceCost");
    const hoursEl = document.getElementById("savedHours");
    const rateEl = document.getElementById("resolutionRate");

    if (investmentEl) investmentEl.textContent = formatCurrency(metrics.investment);
    if (maintenanceEl) maintenanceEl.textContent = formatCurrency(metrics.maintenanceCost);
    if (hoursEl) hoursEl.textContent = `${Math.round(metrics.manHours)}h`;
    if (rateEl) rateEl.textContent = `${metrics.resolutionRate}%`;
}

function renderCharts(assets, maintenances) {
    const costCtx = document.getElementById("costChart");
    const assetsCtx = document.getElementById("assetsChart");
    if (!costCtx || !assetsCtx) {
        return;
    }

    const trend = buildMaintenanceTrend(maintenances);
    if (costChart) costChart.destroy();
    costChart = new Chart(costCtx, {
        type: "line",
        data: {
            labels: trend.map((item) => item.label),
            datasets: [
                {
                    label: "Maintenance Cost",
                    data: trend.map((item) => item.value),
                    borderColor: "#4e73df",
                    backgroundColor: "rgba(78,115,223,0.1)",
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const statusCounts = countAssetStatus(assets);
    if (assetsChart) assetsChart.destroy();
    assetsChart = new Chart(assetsCtx, {
        type: "pie",
        data: {
            labels: ["Active", "Maintenance"],
            datasets: [
                {
                    data: [statusCounts.active, statusCounts.maintenance],
                    backgroundColor: ["#22c55e", "#f59e0b"]
                }
            ]
        },
        options: { responsive: true }
    });
}

function renderComparisonChart(maintenances) {
    const ctx = document.getElementById("maintenanceChart");
    if (!ctx) {
        return;
    }

    const { preventive, corrective } = groupMaintenanceTypes(maintenances);
    if (maintenanceChart) maintenanceChart.destroy();

    maintenanceChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Preventive", "Corrective"],
            datasets: [
                {
                    label: "Count",
                    data: [preventive.count, corrective.count],
                    backgroundColor: "#3b82f6"
                },
                {
                    label: "Cost ($)",
                    data: [preventive.cost, corrective.cost],
                    backgroundColor: "#10b981",
                    yAxisID: "y1"
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: "index", intersect: false },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Count" } },
                y1: {
                    beginAtZero: true,
                    position: "right",
                    title: { display: true, text: "Cost ($)" },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function renderAttentionAssets(assets, maintenances) {
    const container = document.getElementById("attentionAssets");
    if (!container) {
        return;
    }
    const maintenanceByAsset = buildMaintenanceCostByAsset(maintenances);

    const attention = (assets || [])
        .map((asset) => enrichAsset(asset, maintenanceByAsset))
        .filter((asset) => asset.attentionScore >= 0.7)
        .sort((a, b) => b.attentionScore - a.attentionScore)
        .slice(0, 12);

    if (!attention.length) {
        container.innerHTML = '<p class="report-empty">No assets require attention.</p>';
        return;
    }

    container.innerHTML = attention.map((asset) => `
        <div class="asset-card mb-3">
            <h6>${asset.name}</h6>
            <small>${asset.id || "-"}</small>
            <div class="d-flex justify-content-between mt-3">
                <span>Depreciation: <strong>${Math.round(asset.depreciation * 100)}%</strong></span>
                <span>Maint. Cost: <strong>${asset.maintenancePct}%</strong></span>
            </div>
        </div>
    `).join("");
}

function renderExpiringWarranties(assets) {
    const container = document.getElementById("expiringWarranties");
    if (!container) {
        return;
    }

    const today = new Date();
    const in90 = new Date();
    in90.setDate(in90.getDate() + 90);

    const expiring = (assets || [])
        .map(normalizeAsset)
        .filter((asset) => asset.warrantyEnd && asset.warrantyEnd >= today && asset.warrantyEnd <= in90)
        .sort((a, b) => a.warrantyEnd - b.warrantyEnd)
        .slice(0, 12);

    if (!expiring.length) {
        container.innerHTML = '<p class="report-empty">No warranties expiring in the next 90 days.</p>';
        return;
    }

    container.innerHTML = expiring.map((asset) => {
        const daysLeft = Math.max(0, Math.ceil((asset.warrantyEnd - today) / (1000 * 60 * 60 * 24)));
        return `
            <div class="warranty-card mb-3">
                <div class="d-flex justify-content-between">
                    <div>
                        <h6>${asset.name}</h6>
                        <small>${asset.id || "-"}</small>
                        <p class="mb-0">Expires: ${asset.warrantyEnd.toLocaleDateString()}</p>
                    </div>
                    <span class="badge bg-warning text-dark badge-days">
                        ${daysLeft} days
                    </span>
                </div>
            </div>
        `;
    }).join("");
}

function normalizeAsset(raw) {
    const id = raw.id_activo || raw.id || raw.idActivo || raw.codigo || "";
    const name = raw.nombre || raw.modelo || raw.marca || `Asset ${id}` || "Asset";
    const status = String(raw.estado || raw.estado_vida_util || raw.status || "").toLowerCase();
    const purchaseDate = raw.fecha_compra ? new Date(raw.fecha_compra) : null;
    const lifeMonths = Number.parseInt(raw.vida_util || raw.vidaUtil || "", 10);
    let warrantyEnd = null;
    if (purchaseDate && Number.isFinite(lifeMonths) && lifeMonths > 0) {
        warrantyEnd = new Date(purchaseDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + lifeMonths);
    }

    return {
        id,
        name,
        status,
        purchaseDate,
        lifeMonths: Number.isFinite(lifeMonths) ? lifeMonths : null,
        warrantyEnd,
        raw
    };
}

function enrichAsset(raw, maintenanceByAsset) {
    const asset = normalizeAsset(raw);
    const now = new Date();
    let depreciation = 0;
    if (asset.purchaseDate && asset.lifeMonths) {
        const ageMonths = Math.max(0, (now.getFullYear() - asset.purchaseDate.getFullYear()) * 12 +
            (now.getMonth() - asset.purchaseDate.getMonth()));
        depreciation = Math.min(1, ageMonths / asset.lifeMonths);
    }

    const maintenanceCost = maintenanceByAsset.get(String(asset.id)) || 0;
    const maintenancePct = asset.raw && asset.raw.valor
        ? Math.round((maintenanceCost / asset.raw.valor) * 100)
        : maintenanceCost
            ? Math.min(100, Math.round(maintenanceCost / 100))
            : 0;

    const attentionScore = Math.max(
        depreciation,
        asset.status.includes("manten") || asset.status.includes("repair") ? 0.8 : 0
    );

    return {
        ...asset,
        depreciation,
        maintenancePct,
        attentionScore
    };
}

function buildMaintenanceTrend(maintenances) {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            label: d.toLocaleString("default", { month: "short" }),
            value: 0
        });
    }
    const monthMap = new Map(months.map((m) => [m.key, m]));
    (maintenances || []).forEach((m) => {
        const date = normalizeDate(m.fecha_inicio || m.fecha_programada || m.fecha || m.date);
        if (!date) {
            return;
        }
        const key = date.slice(0, 7);
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

function countAssetStatus(assets) {
    return (assets || []).reduce(
        (acc, asset) => {
            const status = String(asset.estado || asset.estado_vida_util || asset.status || "").toLowerCase();
            if (status.includes("manten") || status.includes("repair")) {
                acc.maintenance += 1;
            } else {
                acc.active += 1;
            }
            return acc;
        },
        { active: 0, maintenance: 0 }
    );
}

function groupMaintenanceTypes(list) {
    const result = {
        preventive: { count: 0, cost: 0 },
        corrective: { count: 0, cost: 0 }
    };
    (list || []).forEach((m) => {
        const type = String(m.tipo || m.type || m.mantenimiento_tipo || "").toLowerCase();
        const costRaw = m.costo || m.costo_total || m.costo_mantenimiento || m.total_cost || m.cost;
        const cost = Number.parseFloat(costRaw || "0");
        const bucket = type.includes("prevent") ? "preventive" : "corrective";
        result[bucket].count += 1;
        result[bucket].cost += Number.isFinite(cost) ? cost : 0;
    });
    return result;
}

function buildMaintenanceCostByAsset(list) {
    const map = new Map();
    (list || []).forEach((m) => {
        const assetId = m.id_activo || m.activo_id || m.asset_id || m.idActivo || "";
        if (!assetId) {
            return;
        }
        const costRaw = m.costo || m.costo_total || m.costo_mantenimiento || m.total_cost || m.cost;
        const cost = Number.parseFloat(costRaw || "0");
        if (!Number.isFinite(cost)) {
            return;
        }
        const key = String(assetId);
        map.set(key, (map.get(key) || 0) + cost);
    });
    return map;
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

function sumBy(list, fields) {
    return (list || []).reduce((sum, item) => {
        const value = fields.reduce((acc, key) => {
            if (acc !== null) return acc;
            if (item && item[key] !== undefined && item[key] !== null && item[key] !== "") {
                return Number.parseFloat(item[key]);
            }
            return acc;
        }, null);
        if (Number.isFinite(value)) {
            return sum + value;
        }
        return sum;
    }, 0);
}

function formatCurrency(value) {
    const amount = Number.isFinite(value) ? value : 0;
    return `$${Math.round(amount).toLocaleString("en-US")}`;
}
