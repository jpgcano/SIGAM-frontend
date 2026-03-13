// currentDate holds the date displayed by the calendar; it is mutated when the
// user navigates periods or jumps to today.
let currentDate = new Date()
let viewMode = "month"
let editIndex = null
const api = window.SIGAM_API
let maintenances = []
let assetsList = []
let usingApi = false
const scheduleStatus = document.getElementById("scheduleStatus")

function setScheduleStatus(message, type) {
  if (!scheduleStatus) {
    return
  }
  scheduleStatus.textContent = message || ""
  scheduleStatus.className = "me-auto small"
  if (type === "error") {
    scheduleStatus.classList.add("text-danger")
  } else if (type === "success") {
    scheduleStatus.classList.add("text-success")
  } else {
    scheduleStatus.classList.add("text-muted")
  }
}

function loadMaintenances() {
  return maintenances
}

function saveMaintenances(list) {
  maintenances = Array.isArray(list) ? list : []
  localStorage.setItem("maintenances", JSON.stringify(maintenances))
}

function normalizeMaintenance(raw) {
  return {
    id: raw.id || raw.id_mantenimiento || raw.id_mantenimiento_orden || "",
    ticketId: raw.id_ticket || raw.ticketId || "",
    technicianId: raw.id_usuario_tecnico || raw.technicianId || "",
    asset: raw.asset || raw.activo || raw.assetName || "",
    type: raw.tipo || raw.type || "preventive",
    date: raw.fecha_inicio || raw.date || "",
    notes: raw.diagnostico || raw.notes || ""
  }
}

async function refreshMaintenances() {
  if (api && api.getMantenimientos) {
    try {
      const data = await api.getMantenimientos()
      usingApi = true
      saveMaintenances((data || []).map(normalizeMaintenance))
      setScheduleStatus("Mantenimientos cargados desde API.", "success")
      renderCalendar()
      return
    } catch (error) {
      setScheduleStatus("No se pudo cargar mantenimientos desde API.", "error")
    }
  }
  usingApi = false
  const cached = JSON.parse(localStorage.getItem("maintenances")) || []
  saveMaintenances(cached.map(normalizeMaintenance))
  renderCalendar()
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getStartOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function updateViewButtons() {
  const weekBtn = document.getElementById("viewWeekBtn")
  const monthBtn = document.getElementById("viewMonthBtn")
  if (!weekBtn || !monthBtn) {
    return
  }
  if (viewMode === "week") {
    weekBtn.classList.add("active")
    monthBtn.classList.remove("active")
  } else {
    monthBtn.classList.add("active")
    weekBtn.classList.remove("active")
  }
}

function renderCalendar() {
  const calendar = document.getElementById("calendar")
  calendar.innerHTML = ""

  const maintenances = loadMaintenances()
  const todayStr = formatDate(new Date())
  updateStats(maintenances)

  if (viewMode === "week") {
    renderWeek(calendar, maintenances, todayStr)
  } else {
    renderMonth(calendar, maintenances, todayStr)
  }

  wireDragAndDrop()
  updateViewButtons()
}

function renderMonth(calendar, maintenances, todayStr) {
  calendar.classList.remove("week")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const monthName = currentDate.toLocaleString("default", { month: "long" })
  document.getElementById("monthLabel").innerText = `${monthName} ${year}`

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div class="day-placeholder"></div>`
  }

  for (let d = 1; d <= totalDays; d++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`

    const eventsHTML = buildEventsHTML(maintenances, fullDate)

    const isToday = fullDate === todayStr ? " today" : ""
    calendar.innerHTML += `
      <div class="day${isToday}" data-date="${fullDate}">
        <div class="day-number">${d}</div>
        ${eventsHTML}
      </div>
    `
  }
}

function renderWeek(calendar, maintenances, todayStr) {
  calendar.classList.add("week")

  const start = getStartOfWeek(currentDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const startLabel = start.toLocaleString("default", {
    month: "short",
    day: "numeric",
  })
  const endLabel = end.toLocaleString("default", {
    month: "short",
    day: "numeric",
  })
  const label =
    start.getFullYear() === end.getFullYear()
      ? `${startLabel} - ${endLabel}, ${end.getFullYear()}`
      : `${startLabel}, ${start.getFullYear()} - ${endLabel}, ${end.getFullYear()}`

  document.getElementById("monthLabel").innerText = label

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(start)
    dayDate.setDate(start.getDate() + i)
    const fullDate = formatDate(dayDate)
    const dayNumber = dayDate.getDate()
    const eventsHTML = buildEventsHTML(maintenances, fullDate)

    const isToday = fullDate === todayStr ? " today" : ""
    calendar.innerHTML += `
      <div class="day${isToday}" data-date="${fullDate}">
        <div class="day-number">${dayNumber}</div>
        ${eventsHTML}
      </div>
    `
  }
}

function buildEventsHTML(maintenances, fullDate) {
  let eventsHTML = ""
  maintenances.forEach((m, index) => {
    if (m.date !== fullDate) {
      return
    }
    eventsHTML += `
      <div
        class="event ${m.type}"
        draggable="true"
        data-index="${index}"
        data-date="${fullDate}"
        onclick="showMaintenance(${index})"
      >
        ${m.asset}
      </div>
    `
  })
  return eventsHTML
}

function wireDragAndDrop() {
  const events = document.querySelectorAll(".event[draggable='true']")
  events.forEach((eventEl) => {
    eventEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", eventEl.dataset.index)
      e.dataTransfer.effectAllowed = "move"
      eventEl.classList.add("dragging")
    })
    eventEl.addEventListener("dragend", () => {
      eventEl.classList.remove("dragging")
    })
  })

  const days = document.querySelectorAll(".day[data-date]")
  days.forEach((dayEl) => {
    dayEl.addEventListener("dragover", (e) => {
      e.preventDefault()
      dayEl.classList.add("drag-over")
    })
    dayEl.addEventListener("dragleave", () => {
      dayEl.classList.remove("drag-over")
    })
    dayEl.addEventListener("drop", (e) => {
      e.preventDefault()
      dayEl.classList.remove("drag-over")
      const index = Number.parseInt(
        e.dataTransfer.getData("text/plain"),
        10
      )
      if (Number.isNaN(index)) {
        return
      }
      const list = loadMaintenances()
      if (!list[index]) {
        return
      }
      list[index].date = dayEl.dataset.date
      saveMaintenances(list)
      renderCalendar()
      if (usingApi && api && api.updateMantenimiento && list[index].id) {
        api.updateMantenimiento(list[index].id, {
          fecha_inicio: list[index].date,
          diagnostico: list[index].notes,
          id_ticket: list[index].ticketId,
          id_usuario_tecnico: list[index].technicianId
        }).catch(() => {
          setScheduleStatus("No se pudo actualizar la fecha en API.", "error")
        })
      }
    })
  })
}

function prevPeriod() {
  if (viewMode === "week") {
    currentDate.setDate(currentDate.getDate() - 7)
  } else {
    currentDate.setMonth(currentDate.getMonth() - 1)
  }
  renderCalendar()
}

function nextPeriod() {
  if (viewMode === "week") {
    currentDate.setDate(currentDate.getDate() + 7)
  } else {
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  renderCalendar()
}

function goToday() {
  currentDate = new Date()
  renderCalendar()
}

function setViewMode(mode) {
  viewMode = mode
  renderCalendar()
}

refreshMaintenances()

// get reference to scheduling form so we can intercept submissions
const scheduleForm = document.getElementById("scheduleForm")

// handle form submissions for adding/editing maintenance entries
if (scheduleForm) {
  scheduleForm.addEventListener("submit", function (e) {
    e.preventDefault()

    const ticketId = document.getElementById("ticketId").value.trim()
    const assetValue = document.getElementById("assetName").value
    const typeValue = document.getElementById("maintenanceType").value
    const dateValue = document.getElementById("maintenanceDate").value
    const notesValue = document.getElementById("notes").value

    if (!ticketId || !dateValue) {
      setScheduleStatus("Ticket ID y Date son obligatorios.", "error")
      return
    }

    const user = api && api.getUser ? api.getUser() : null
    const technicianId = user && (user.id || user.id_usuario || user.userId)

    if (!technicianId) {
      setScheduleStatus("Debes iniciar sesion para programar mantenimiento.", "error")
      return
    }

    const maintenance = {
      id: editIndex !== null ? (maintenances[editIndex] || {}).id : "",
      ticketId,
      technicianId,
      asset: assetValue,
      type: typeValue,
      date: dateValue,
      notes: notesValue
    }

    const list = loadMaintenances()
    if (editIndex !== null) {
      list[editIndex] = maintenance
      editIndex = null
    } else {
      list.push(maintenance)
    }

    saveMaintenances(list)
    renderCalendar()

    if (usingApi && api) {
      const payload = {
        id_ticket: Number(ticketId) || ticketId,
        id_usuario_tecnico: technicianId,
        diagnostico: notesValue,
        fecha_inicio: dateValue
      }

      const action = maintenance.id && api.updateMantenimiento
        ? api.updateMantenimiento(maintenance.id, payload)
        : api.createMantenimiento(payload)

      action.then(() => {
        setScheduleStatus("Mantenimiento guardado en API.", "success")
        refreshMaintenances()
      }).catch(() => {
        setScheduleStatus("No se pudo guardar mantenimiento en API.", "error")
      })
    }

    scheduleForm.reset()

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("scheduleModal")
    )
    if (modal) {
      modal.hide()
    }
  })
}

// when a day event is clicked, show the details modal and populate it
// using the index of the maintenance entry in the array. also store the index
// in `editIndex` to allow editing or deletion subsequently.
function showMaintenance(index) {
  const maintenances = loadMaintenances()
  const m = maintenances[index]
  if (!m) {
    return
  }

  editIndex = index

  document.getElementById("detailAsset").innerText = m.asset
  document.getElementById("detailType").innerText = m.type
  document.getElementById("detailDate").innerText = m.date
  document.getElementById("detailNotes").innerText = m.notes || "-"

  const modal = new bootstrap.Modal(document.getElementById("detailModal"))
  modal.show()
}

// populate the asset dropdown in the scheduling form from stored assets
function loadAssets() {
  const select = document.getElementById("assetName")
  if (!select) {
    return
  }
  select.innerHTML = ""

  if (api && api.getActivos) {
    api.getActivos().then((assets) => {
      assetsList = Array.isArray(assets) ? assets : []
      if (assetsList.length === 0) {
        select.innerHTML = '<option value="">No assets available</option>'
        return
      }
      assetsList.forEach((asset) => {
        const id = asset.id_activo || asset.id || asset.idActivo || ""
        const labelParts = [asset.modelo, asset.serial, asset.sede, asset.sala].filter(Boolean)
        const label = labelParts.join(" - ") || asset.nombre || `Activo ${id}`
        select.innerHTML += `
          <option value="${label}">
            ${label}
          </option>
        `
      })
    }).catch(() => {
      select.innerHTML = '<option value="">No assets available</option>'
    })
    return
  }

  const assets = JSON.parse(localStorage.getItem("assets")) || []
  if (assets.length === 0) {
    select.innerHTML = '<option value="">No assets available</option>'
    return
  }

  assets.forEach((asset) => {
    select.innerHTML += `
      <option value="${asset.name}">
        ${asset.name}
      </option>
    `
  })
}

loadAssets()

// remove the currently selected maintenance (editIndex) after user
// confirmation, persist changes and refresh calendar
function deleteMaintenance() {
  const maintenances = loadMaintenances()

  if (confirm("Delete this maintenance?")) {
    const target = maintenances[editIndex] || {}
    if (usingApi && api && api.deleteMantenimiento && target.id) {
      api.deleteMantenimiento(target.id).catch(() => {
        setScheduleStatus("No se pudo eliminar en API.", "error")
      })
    }
    maintenances.splice(editIndex, 1)
    saveMaintenances(maintenances)
    renderCalendar()

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("detailModal")
    )
    modal.hide()
  }
}

// load the selected maintenance into the scheduling form and show it
// so the user can modify and resubmit. editIndex remains set so the
// submit handler knows to replace rather than append.
function editMaintenance() {
  const maintenances = loadMaintenances()
  const m = maintenances[editIndex]
  if (!m) {
    return
  }

  document.getElementById("ticketId").value = m.ticketId || ""
  document.getElementById("assetName").value = m.asset
  document.getElementById("maintenanceType").value = m.type
  document.getElementById("maintenanceDate").value = m.date
  document.getElementById("notes").value = m.notes

  const modal = new bootstrap.Modal(document.getElementById("scheduleModal"))
  modal.show()
}

// recalculates the dashboard statistics based on stored maintenances
function updateStats(maintenances) {
  const scheduledEl = document.getElementById("scheduledCount")
  const overdueEl = document.getElementById("overdueCount")
  const assetsEl = document.getElementById("assetsCount")

  const today = new Date().toISOString().split("T")[0]

  // total scheduled
  scheduledEl.innerText = maintenances.length

  // overdue: dates before today
  const overdue = maintenances.filter((m) => m.date < today).length
  overdueEl.innerText = overdue

  // assets in plan: unique asset names
  const uniqueAssets = new Set(maintenances.map((m) => m.asset))
  assetsEl.innerText = uniqueAssets.size
}
