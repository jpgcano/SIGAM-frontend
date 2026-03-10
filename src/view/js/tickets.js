let tickets = [];
let ticketCounter = 1;

const statusFilter = document.getElementById("statusFilter");
const modal = document.getElementById("ticketModal");
const openBtn = document.getElementById("newTicketBtn");
const closeBtn = document.querySelector(".close");

const addTicketBtn = document.getElementById("addTicket");
const ticketList = document.getElementById("ticketList");

const searchInput = document.getElementById("searchInput");

/* abrir modal */
openBtn.onclick = () => {
    modal.style.display = "flex";
};

/* cerrar modal */
closeBtn.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

/* crear ticket */

addTicketBtn.addEventListener("click", () => {

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const device = document.getElementById("device").value;
    const category = document.getElementById("category").value;
    const createdBy = document.getElementById("createdBy").value;
    const assignedTo = document.getElementById("assignedTo").value;
    const estimate = document.getElementById("estimate").value;
    const status = document.getElementById("status").value;
    const date = new Date().toLocaleDateString();

    const ticketData = {
        id: ticketCounter,
        title,
        description,
        device,
        category,
        createdBy,
        assignedTo,
        estimate,
        status,
        date
    };

tickets.push(ticketData);

ticketCounter++;
applyFilters();
modal.style.display = "none";
});

function renderTickets(list) {

    ticketList.innerHTML = "";

    if(list.length === 0){
    ticketList.innerHTML = "<p>No hay tickets que coincidan</p>";
    return;
    }

    list.forEach((ticket, index) => {

        const div = document.createElement("div");

        div.classList.add("ticket");

        div.innerHTML = `
            <div class="ticket-status">${ticket.status}</div>

            <div class="ticket-title">
                ${ticket.title}
            </div>

            <div class="ticket-info">
                ${ticket.description}
            </div>

            <div class="ticket-info">
                TK-${ticket.id} • ${ticket.device} • ${ticket.category}
            </div>

            <div class="ticket-info">
                Creado por: ${ticket.createdBy} • 
                Asignado a: ${ticket.assignedTo} • 
                ${ticket.date} • 
                ${ticket.estimate} estimadas
            </div>

            <button class="delete-btn" onclick="deleteTicket(${index})">Eliminar</button>
        `;

        ticketList.appendChild(div);

    });

}


/* BORRAR TICKET */

function deleteTicket(index) {

    tickets.splice(index, 1);

    applyFilters();

}


function applyFilters(){

    const search = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = tickets.filter(ticket => {

        const matchSearch =
            ticket.title.toLowerCase().includes(search) ||
            ticket.description.toLowerCase().includes(search) ||
            ticket.device.toLowerCase().includes(search) ||
            ticket.category.toLowerCase().includes(search);

        const matchStatus =
            status === "all" || ticket.status === status;

        return matchSearch && matchStatus;

    });

    renderTickets(filtered);
}

searchInput.addEventListener("input", applyFilters);

statusFilter.addEventListener("change", applyFilters);