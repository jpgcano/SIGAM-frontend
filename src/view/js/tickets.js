const modal = document.getElementById("ticketModal");
const openBtn = document.getElementById("newTicketBtn");
const closeBtn = document.querySelector(".close");

const addTicketBtn = document.getElementById("addTicket");
const ticketList = document.getElementById("ticketList");

let ticketCounter = 1;

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

    const ticket = document.createElement("div");

    ticket.classList.add("ticket");

    ticket.innerHTML = `
        <div class="ticket-status">${status}</div>
        <div class="ticket-title">
            ${title}
        </div>
        <div class="ticket-info">
            ${description}
        </div>
        <div class="ticket-info">
            TK-${ticketCounter} • ${device} • ${category}
        </div>
        <div class="ticket-info">
            Creado por: ${createdBy} • Asignado a: ${assignedTo} • ${date} • ${estimate} estimadas
        </div>
    `;

    ticketList.appendChild(ticket);

    ticketCounter++;

    modal.style.display = "none";
});