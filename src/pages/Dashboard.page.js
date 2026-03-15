import { Navbar } from "../components/Navbar.js";
import { api } from "../api.js";
import "../css/pages/dashboard.css";

const render = async () => {
    // Primero renderizamos el Navbar
    const navbarHTML = Navbar.render();

    return `
        ${navbarHTML}
        <main class="container-dashboard container">
            <!-- Summary Section -->
            <section class="cards-dashboard row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card p-3 text-center border-0 shadow-sm">
                        <h4>Total Assets</h4>
                        <h2 id="totalAssets">...</h2>
                        <h6 class="text-muted">Assets, Under maintenance</h6>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card p-3 text-center border-0 shadow-sm">
                        <h4>Open Tickets</h4>
                        <h2 id="openTickets">...</h2>
                        <h6 class="text-muted">Critical, In progress</h6>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card p-3 text-center border-0 shadow-sm">
                        <h4>Scheduled</h4>
                        <h2 id="scheduledMaintenance">...</h2>
                        <h6 class="text-muted">Next 30 days</h6>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card p-3 text-center border-0 shadow-sm">
                        <h4>Total Cost</h4>
                        <h2 id="totalCost">...</h2>
                        <h6 class="text-muted">Accumulated history</h6>
                    </div>
                </div>
            </section>

            <!-- Charts Section (Placeholder) -->
            <section class="charts row mb-4">
                <div class="col-md-6">
                    <div class="card p-3 shadow-sm h-100">
                        <h3>Assets by type</h3>
                        <div class="text-center text-muted py-5">[Chart: Assets Type Placeholder]</div>
                        <!-- <canvas id="footChart"></canvas> -->
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card p-3 shadow-sm h-100">
                        <h3>Tickets by category</h3>
                        <div class="text-center text-muted py-5">[Chart: Tickets Category Placeholder]</div>
                        <!-- <canvas id="barChart"></canvas> -->
                    </div>
                </div>
            </section>

            <!-- Lists Section -->
            <div class="row">
                <div class="col-md-6">
                    <h3>Recent Tickets</h3>
                    <div id="recentTickets" class="list-group">
                        <p class="text-muted">Loading tickets...</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <h3>Upcoming Maintenance</h3>
                    <div id="upcomingMaintenance" class="list-group">
                        <p class="text-muted">Loading maintenance...</p>
                    </div>
                </div>
            </div>
        </main>
    `;
};

const init = async () => {
    Navbar.init();

    try {
        const stats = await api.dashboard.getSummary();
        
        document.getElementById('totalAssets').textContent = stats.totalAssets;
        document.getElementById('openTickets').textContent = stats.openTickets;
        document.getElementById('scheduledMaintenance').textContent = stats.scheduledMaintenance;
        document.getElementById('totalCost').textContent = `$${stats.totalCost}`;
        
        // Aquí se llamaría a la lógica de renderizar listas completas
        document.getElementById('recentTickets').innerHTML = '<div class="list-group-item">Ticket #101: Printer issue</div><div class="list-group-item">Ticket #102: Network Slow</div>';
        document.getElementById('upcomingMaintenance').innerHTML = '<div class="list-group-item">Server Alpha - 2024-06-01</div>';
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
};

export const DashboardPage = { render, init };