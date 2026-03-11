// Espera a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData()
})

// cargar datos del backend
async function loadDashboardData() {
    try {
        const response = await fetch("http://localhost:3000/api/dashboard")
        const data = await response.json()
        updateCards(data)
        createCharts(data)
    } catch (error) {
        console.error("Error loading dashboard data:", error)
    }
}

// actualizar tarjetas del dashboard
function updateCards(data){
    document.querySelector(".card-activos h2").textContent = data.assets
    document.querySelector(".card-tikects h2").textContent = data.openTickets
    document.querySelector(".card-scheduled h2").textContent = data.scheduledMaintenance
    document.querySelector(".card-cost h2").textContent = "$" + data.totalCost
}

// crear todas las graficas
function createCharts(data){
    createPieChart(data)
    createBarChart(data)
    createLineChart(data)
}

// grafica de assets por tipo
function createPieChart(data){
    const footChart = document.getElementById("footChart")
    new Chart(footChart, {
        type: "pie",
        data: {
            labels: ["Laptops", "Desktops", "Servers", "Printers", "Monitors"],
            datasets: [{
                data: [
                    data.assetsByType.laptops,
                    data.assetsByType.desktops,
                    data.assetsByType.servers,
                    data.assetsByType.printers,
                    data.assetsByType.monitors
                ],
                backgroundColor: [
                    "#4e73df",
                    "#1cc88a",
                    "#f6c23e",
                    "#e74a3b",
                    "#858796"
                ]
            }]
        },
        options:{
            responsive:true
        }
    })
}

// grafica de tickets por categoria
function createBarChart(data){
    const barChart = document.getElementById("barChart")
    new Chart(barChart, {
        type: "bar",
        data: {
            labels: ["Hardware", "Software"],
            datasets: [{
                label: "Tickets",
                data: [
                    data.ticketsByCategory.hardware,
                    data.ticketsByCategory.software
                ],
                backgroundColor: "#4e73df"
            }]
        },
        options:{
            responsive:true
        }
    })
}

// grafica de costos de mantenimiento
function createLineChart(data){
    const lineCtx = document.getElementById("lineChart")
    new Chart(lineCtx, {
        type: "line",
        data: {
            labels: ["Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb"],
            datasets: [{
                label: "Maintenance Cost",
                data: data.maintenanceCost,
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
    })
}