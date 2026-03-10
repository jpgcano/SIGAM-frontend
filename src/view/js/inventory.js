const assets = [

{
name:"Dell Latitude 7420 Laptop",
id:"AST-001",
brand:"Dell Latitude 7420",
serial:"DL7420-2023-001",
assigned:"Maria Garcia",
location:"Central Building - Floor 3",
status:"active",
type:"laptop",
warranty:"expired"
},

{
name:"HP EliteDesk 800 G6",
id:"AST-002",
brand:"HP EliteDesk 800 G6",
serial:"HP800-2022-045",
assigned:"Pedro Ramirez",
location:"Central Building - Floor 2",
status:"maintenance",
type:"desktop",
warranty:"expired"
},

{
name:"Dell PowerEdge R740 Server",
id:"AST-003",
brand:"Dell PowerEdge R740",
serial:"DL-R740-2021-001",
assigned:"",
location:"Data Center - Floor 1",
status:"active",
type:"server",
warranty:"3 days"
}

]

const grid = document.getElementById("assetGrid")
const searchInput = document.getElementById("searchInput")
const statusFilter = document.getElementById("statusFilter")
const typeFilter = document.getElementById("typeFilter")
const resultCount = document.getElementById("resultCount")


function renderAssets(list){

grid.innerHTML=""

list.forEach(asset=>{

let badge="bg-success"

if(asset.status==="maintenance"){
badge="bg-warning text-dark"
}

grid.innerHTML+=`

<div class="col-md-4">

<div class="card shadow-sm h-100">

<div class="card-body">

<h5 class="fw-bold">${asset.name}</h5>

<small class="text-muted">${asset.id}</small>

<hr>

<p><strong>Brand / Model</strong><br>${asset.brand}</p>

<p><strong>Serial</strong><br>${asset.serial}</p>

<p><strong>Assigned To</strong><br>${asset.assigned}</p>

<p><strong>Location</strong><br>${asset.location}</p>

<div class="d-flex justify-content-between">

<span class="badge ${badge}">
${asset.status}
</span>

<small class="text-danger">
Warranty ${asset.warranty}
</small>

</div>

</div>

</div>

</div>

`

})

resultCount.innerText=`Showing ${list.length} of ${assets.length} assets`

}


function filterAssets(){

const search = searchInput.value.toLowerCase()
const status = statusFilter.value
const type = typeFilter.value

let filtered = assets.filter(asset=>{

const matchSearch =
asset.name.toLowerCase().includes(search) ||
asset.serial.toLowerCase().includes(search) ||
asset.brand.toLowerCase().includes(search)

const matchStatus =
status==="all" || asset.status===status

const matchType =
type==="all" || asset.type===type

return matchSearch && matchStatus && matchType

})

renderAssets(filtered)

}

searchInput.addEventListener("input",filterAssets)
statusFilter.addEventListener("change",filterAssets)
typeFilter.addEventListener("change",filterAssets)

renderAssets(assets)
 

document.addEventListener("DOMContentLoaded", function(){

const form = document.getElementById("assetForm")

form.addEventListener("submit", function(e){

e.preventDefault()

const newAsset = {

name: document.getElementById("name").value,
id: "AST-" + (assets.length + 1).toString().padStart(3,"0"),
brand: document.getElementById("brand").value,
serial: document.getElementById("serial").value,
assigned: document.getElementById("assigned").value,
location: document.getElementById("location").value,
status: document.getElementById("status").value,
type: document.getElementById("type").value,
warranty: document.getElementById("warranty").value

}

assets.push(newAsset)

renderAssets(assets)

form.reset()

const modal = bootstrap.Modal.getInstance(document.getElementById("assetModal"))
modal.hide()

})

})