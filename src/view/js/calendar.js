// currentDate holds the date displayed by the calendar; it is mutated when the
// user navigates months or jumps to today.
let currentDate = new Date()

let maintenances = JSON.parse(localStorage.getItem("maintenances")) || []

// renderCalendar builds the calendar grid for the month contained in
// `currentDate`. It also injects maintenance events and updates the header
// and statistics.
function renderCalendar(){

const calendar = document.getElementById("calendar")
calendar.innerHTML=""

const year = currentDate.getFullYear()
const month = currentDate.getMonth()

const firstDay = new Date(year,month,1).getDay()
const totalDays = new Date(year,month+1,0).getDate()

const monthName = currentDate.toLocaleString("default",{month:"long"})

document.getElementById("monthLabel").innerText =
monthName + " " + year


    // cargar mantenimientos - re-read fresh copy each render in case other
    // routines modified storage (e.g., deletion/edits below)
    let maintenances = JSON.parse(localStorage.getItem("maintenances")) || []

    // actualizar estadísticas
    updateStats(maintenances);


// espacios antes del primer día
for(let i=0;i<firstDay;i++){
calendar.innerHTML += `<div></div>`
}


// generar días
for(let d=1; d<=totalDays; d++){

// crear fecha completa
let fullDate =
year + "-" +
String(month+1).padStart(2,"0") + "-" +
String(d).padStart(2,"0")

// buscar mantenimientos de ese día
let dayMaintenances = maintenances.filter(m => m.date === fullDate)

let eventsHTML = ""

dayMaintenances.forEach(m => {

eventsHTML += `
<div class="event ${m.type}" onclick="showMaintenance(${maintenances.indexOf(m)})">
${m.asset}
</div>
`

})

calendar.innerHTML += `

<div class="day">

<div class="day-number">${d}</div>

${eventsHTML}

</div>

`

}

}


// navigation helpers: adjust currentDate and re-render
function prevMonth(){

currentDate.setMonth(currentDate.getMonth()-1)
renderCalendar()

}

function nextMonth(){

currentDate.setMonth(currentDate.getMonth()+1)
renderCalendar()

}

function goToday(){

currentDate = new Date()
renderCalendar()

}

renderCalendar()

// get reference to scheduling form so we can intercept submissions
const scheduleForm = document.getElementById("scheduleForm")

// handle form submissions for adding/editing maintenance entries
scheduleForm.addEventListener("submit", function(e){

e.preventDefault()

const maintenance = {

asset: document.getElementById("assetName").value,
type: document.getElementById("maintenanceType").value,
date: document.getElementById("maintenanceDate").value,
notes: document.getElementById("notes").value

}
if(editIndex !== null){
    maintenances[editIndex] = maintenance
    editIndex = null
}else{
    maintenances.push(maintenance)

}

localStorage.setItem("maintenances", JSON.stringify(maintenances))

renderCalendar()

scheduleForm.reset()

const modalElement = document.getElementById("scheduleModal")
const modal = bootstrap.Modal.getInstance(document.getElementById("scheduleModal"))
if(modal){
    modal.hide()
}

alert("Maintenance scheduled!")

})

// when a day event is clicked, show the details modal and populate it
// using the index of the maintenance entry in the array. also store the index
// in `editIndex` to allow editing or deletion subsequently.
function showMaintenance(index){

let maintenances = JSON.parse(localStorage.getItem("maintenances")) || []
let m = maintenances[index]

editIndex = index

document.getElementById("detailAsset").innerText = m.asset
document.getElementById("detailType").innerText = m.type
document.getElementById("detailDate").innerText = m.date
document.getElementById("detailNotes").innerText = m.notes || "-"

let modal = new bootstrap.Modal(document.getElementById("detailModal"))
modal.show()

}

// populate the asset dropdown in the scheduling form from stored assets
function loadAssets(){

let assets = JSON.parse(localStorage.getItem("assets")) || []

let select = document.getElementById("assetName")

select.innerHTML = ""

assets.forEach(asset => {

select.innerHTML += `
<option value="${asset.name}">
${asset.name}
</option>
`

})

}
loadAssets()
let editIndex = null

// remove the currently selected maintenance (editIndex) after user
// confirmation, persist changes and refresh calendar
function deleteMaintenance(){

let maintenances = JSON.parse(localStorage.getItem("maintenances")) || []

if(confirm("Delete this maintenance?")){

maintenances.splice(editIndex,1)

localStorage.setItem("maintenances", JSON.stringify(maintenances))

renderCalendar()

let modal = bootstrap.Modal.getInstance(document.getElementById("detailModal"))
modal.hide()

}

}

// load the selected maintenance into the scheduling form and show it
// so the user can modify and resubmit. editIndex remains set so the
// submit handler knows to replace rather than append.
function editMaintenance(){

let maintenances = JSON.parse(localStorage.getItem("maintenances")) || []
let m = maintenances[editIndex]

document.getElementById("assetName").value = m.asset
document.getElementById("maintenanceType").value = m.type
document.getElementById("maintenanceDate").value = m.date
document.getElementById("notes").value = m.notes

let modal = new bootstrap.Modal(document.getElementById("scheduleModal"))
modal.show()

}
// recalculates the dashboard statistics based on stored maintenances
function updateStats(maintenances) {
    const scheduledEl = document.getElementById("scheduledCount");
    const overdueEl = document.getElementById("overdueCount");
    const assetsEl = document.getElementById("assetsCount");

    const today = new Date().toISOString().split("T")[0];

    // total scheduled
    scheduledEl.innerText = maintenances.length;

    // overdue: dates before today
    const overdue = maintenances.filter(m => m.date < today).length;
    overdueEl.innerText = overdue;

    // assets in plan: unique asset names
    const uniqueAssets = new Set(maintenances.map(m => m.asset));
    assetsEl.innerText = uniqueAssets.size;
}
