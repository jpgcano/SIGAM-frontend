let currentDate = new Date()

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


for(let i=0;i<firstDay;i++){

calendar.innerHTML += `<div></div>`

}


for(let d=1; d<=totalDays; d++){

calendar.innerHTML += `

<div class="day">

<div class="day-number">${d}</div>

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
