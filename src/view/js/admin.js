const api = window.SIGAM_API
let users = []
let usingApi = false
const statusEl = document.getElementById("adminStatus")

function setStatus(message, type) {
    if (!statusEl) {
        return
    }
    statusEl.textContent = message || ""
    statusEl.className = "small"
    if (type === "error") {
        statusEl.classList.add("text-danger")
    } else if (type === "success") {
        statusEl.classList.add("text-success")
    } else {
        statusEl.classList.add("text-muted")
    }
}

function normalizeUser(raw) {
    return {
        id: raw.id_usuario || raw.id || raw.userId || "",
        name: raw.nombre || raw.name || "",
        email: raw.email || "",
        role: raw.rol || raw.role || "Usuario",
        status: raw.estado || raw.status || "Active",
        lastAccess: raw.ultimo_acceso || raw.lastAccess || raw.fecha_creacion || ""
    }
}

async function loadUsers() {
    if (api && api.getUsuarios) {
        try {
            const data = await api.getUsuarios()
            users = (data || []).map(normalizeUser)
            usingApi = true
            setStatus("Usuarios cargados desde API.", "success")
            renderUsers()
            return
        } catch (error) {
            setStatus("No se pudo cargar usuarios desde API. Usando cache local.", "error")
        }
    }

    usingApi = false
    users = JSON.parse(localStorage.getItem("users")) || []
    renderUsers()
}

function renderUsers() {

    let table = document.getElementById("userTable")
    table.innerHTML = ""

    users.forEach((user, index) => {

        table.innerHTML += `

<tr>

<td>${user.name}</td>

<td>${user.email}</td>

<td>${badgeRole(user.role)}</td>

<td>${badgeStatus(user.status)}</td>

<td>${timeAgo(user.lastAccess)}</td>


<td>

<button class="btn btn-sm btn-light" onclick="editUser(${index})">
<i class="bi bi-pencil"></i>
</button>

<button class="btn btn-sm btn-light text-danger" onclick="deleteUser(${index})">
<i class="bi bi-trash"></i>
</button>

</td>

</tr>

`

    })

    updateStats()

}

function badgeStatus(status) {

    if (status === "Active") {
        return `<span class="badge bg-success-subtle text-success rounded-pill">Active</span>`
    }

    if (status === "Blocked") {
        return `<span class="badge bg-danger-subtle text-danger rounded-pill">Blocked</span>`
    }

    return `<span class="badge bg-secondary-subtle text-secondary rounded-pill">Inactive</span>`

}

function badgeRole(role) {

    if (role === "Gerente") {
        return `<span class="badge bg-primary">Gerente</span>`
    }

    if (role === "Tecnico") {
        return `<span class="badge bg-info text-dark">Tecnico</span>`
    }

    if (role === "Analista") {
        return `<span class="badge bg-secondary">Analista</span>`
    }

    if (role === "Auditor") {
        return `<span class="badge bg-dark">Auditor</span>`
    }

    return `<span class="badge bg-secondary">Usuario</span>`

}

function timeAgo(date) {

    if (!date) return "-"

    let now = new Date()
    let past = new Date(date)

    let seconds = Math.floor((now - past) / 1000)

    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)
    let days = Math.floor(hours / 24)

    if (seconds < 60) return "Just now"
    if (minutes < 60) return minutes + " min ago"
    if (hours < 24) return hours + " hours ago"

    return days + " days ago"

}

function saveUser() {

    let name = document.getElementById("name").value
    let email = document.getElementById("email").value
    let role = document.getElementById("role").value
    let password = document.getElementById("password").value
    let editIndex = document.getElementById("editIndex").value

    const now = new Date().toLocaleString()

    if (usingApi && api) {
        const target = users[editIndex] || {}
        const userId = target.id

        if (editIndex === "") {
            if (!password) {
                alert("Password is required")
                return
            }
            api.createUsuario({
                nombre: name,
                email,
                password,
                rol: role
            }).then(() => {
                setStatus("Usuario creado en API.", "success")
                loadUsers()
            }).catch(() => {
                setStatus("No se pudo crear usuario en API.", "error")
            })
            let modal = bootstrap.Modal.getInstance(document.getElementById("userModal"))
            modal.hide()
            return
        } else if (userId) {
            const updates = []
            if (role) {
                updates.push(api.updateUsuarioRol(userId, role))
            }
            if (password) {
                updates.push(api.updateUsuarioPassword(userId, password))
            }
            Promise.allSettled(updates).then(() => {
                setStatus("Usuario actualizado en API.", "success")
                loadUsers()
            }).catch(() => {
                setStatus("No se pudo actualizar usuario en API.", "error")
            })
            let modal = bootstrap.Modal.getInstance(document.getElementById("userModal"))
            modal.hide()
            return
        }
    } else if (editIndex === "") {

        let exists = users.some(user => user.email === email)

        if (exists && editIndex === "") {
            alert("User with this email already exists")
            return
        }

        users.push({
            name,
            email,
            role,
            status: "Active",
            lastAccess: now
        })

    } else {

        users[editIndex].name = name
        users[editIndex].email = email
        users[editIndex].role = role

    }

    localStorage.setItem("users", JSON.stringify(users))

    renderUsers()

    let modal = bootstrap.Modal.getInstance(document.getElementById("userModal"))
    modal.hide()

}



function deleteUser(index) {

    if (confirm("Delete user?")) {

        if (usingApi) {
            alert("No hay endpoint para eliminar usuarios en API.")
            return
        }

        users.splice(index, 1)
        localStorage.setItem("users", JSON.stringify(users))
        renderUsers()

    }

}


function editUser(index) {

    let user = users[index]

    document.getElementById("name").value = user.name
    document.getElementById("email").value = user.email
    document.getElementById("role").value = user.role
    document.getElementById("password").value = ""
    document.getElementById("editIndex").value = index

    let modal = new bootstrap.Modal(document.getElementById("userModal"))

    modal.show()

}

function updateStats() {

    const usersCount = users.length

    const assets = JSON.parse(localStorage.getItem("assets")) || []
    const tickets = JSON.parse(localStorage.getItem("tickets")) || []

    const usersCard = document.getElementById("statUsers")
    const assetsCard = document.getElementById("statAssets")
    const ticketsCard = document.getElementById("statTickets")

    if (usersCard) usersCard.innerText = usersCount
    if (assetsCard) assetsCard.innerText = assets.length
    if (ticketsCard) ticketsCard.innerText = tickets.length

}


const searchInput = document.getElementById("searchInput")
if (searchInput) {
    searchInput.addEventListener("keyup", function () {

        let value = this.value.toLowerCase()

        let rows = document.querySelectorAll("#userTable tr")

        rows.forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none"
        })

    })
}

loadUsers()

setInterval(loadUsers, 60000)
