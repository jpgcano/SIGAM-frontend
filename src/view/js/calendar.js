let currentDate = new Date()

let maintenances = JSON.parse(localStorage.getItem("maintenances")) || []

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


// cargar mantenimientos
let maintenances = JSON.parse(localStorage.getItem("maintenances")) || []


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

const scheduleForm = document.getElementById("scheduleForm")

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