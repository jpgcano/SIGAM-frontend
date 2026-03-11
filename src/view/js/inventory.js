<<<<<<< HEAD
// load the assets array from browser storage; if nothing is stored yet, fall back
// to a hard‑coded default list. using `let` because we will reassign when pushing new
// assets later. this ensures persistence across page reloads.
let assets = JSON.parse(localStorage.getItem("assets")) || [

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

];

// grab references to important DOM elements that we will update/interact with
const grid = document.getElementById("assetGrid")
const searchInput = document.getElementById("searchInput")
const statusFilter = document.getElementById("statusFilter")
const typeFilter = document.getElementById("typeFilter")
const resultCount = document.getElementById("resultCount")


// renderAssets builds the grid of cards from a given list of asset objects.
// it empties the container then appends a bootstrap card for each asset, also
// updating the counter showing how many assets are currently visible vs total.
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


// filterAssets reads the search and filter inputs, applies them to the global
// `assets` array, and calls renderAssets with the filtered results.
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

// wire up input events so that the list refreshes whenever the user types or
// changes a filter dropdown.
searchInput.addEventListener("input",filterAssets)
statusFilter.addEventListener("change",filterAssets)
typeFilter.addEventListener("change",filterAssets)

// initial rendering of whatever is currently in the array
renderAssets(assets)

// if the page loaded and storage was empty (first visit), save the default
// list so subsequent reloads honour persistence
if(!localStorage.getItem("assets")){
    localStorage.setItem("assets", JSON.stringify(assets));
}



// wait for the DOM to finish loading before accessing form fields, then
// set up the submission handler for adding new assets.
document.addEventListener("DOMContentLoaded", function(){

const form = document.getElementById("assetForm")

    // when the new-asset form is submitted, build an object out of the inputs,
    // push it to the assets array, save the updated array to storage, re-render
    // the grid and reset/close the modal.
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
localStorage.setItem("assets", JSON.stringify(assets))

renderAssets(assets)

form.reset()

const modal = bootstrap.Modal.getInstance(document.getElementById("assetModal"))
modal.hide()

})

})
=======
const grid = document.getElementById('assetGrid');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const typeFilter = document.getElementById('typeFilter');
const resultCount = document.getElementById('resultCount');

let assets = [];

function normalizeLocation(asset) {
    const parts = [asset.sede, asset.piso, asset.sala].filter(Boolean);
    return parts.length ? parts.join(' - ') : 'N/A';
}

function mapAsset(apiAsset) {
    const estadoActivo = apiAsset.estado_activo !== undefined ? apiAsset.estado_activo : true;
    return {
        name: apiAsset.modelo || apiAsset.serial || 'Activo',
        id: apiAsset.id_activo ? `AST-${String(apiAsset.id_activo).padStart(3, '0')}` : 'AST',
        brand: apiAsset.proveedor || apiAsset.nombre_categoria || 'N/A',
        serial: apiAsset.serial || 'N/A',
        assigned: '',
        location: normalizeLocation(apiAsset),
        status: estadoActivo ? 'active' : 'maintenance',
        type: (apiAsset.nombre_categoria || 'other').toLowerCase(),
        warranty: apiAsset.estado_vida_util || 'N/A'
    };
}

function renderAssets(list) {
    grid.innerHTML = '';

    list.forEach(asset => {
        let badge = 'bg-success';
        if (asset.status === 'maintenance') {
            badge = 'bg-warning text-dark';
        }

        grid.innerHTML += `
        <div class="col-md-4">
            <div class="card shadow-sm h-100">
                <div class="card-body">
                    <h5 class="fw-bold">${asset.name}</h5>
                    <small class="text-muted">${asset.id}</small>
                    <hr>
                    <p><strong>Brand / Categoria</strong><br>${asset.brand}</p>
                    <p><strong>Serial</strong><br>${asset.serial}</p>
                    <p><strong>Location</strong><br>${asset.location}</p>
                    <div class="d-flex justify-content-between">
                        <span class="badge ${badge}">
                            ${asset.status}
                        </span>
                        <small class="text-danger">
                            Vida util ${asset.warranty}
                        </small>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    resultCount.innerText = `Showing ${list.length} of ${assets.length} assets`;
}

function filterAssets() {
    const search = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const type = typeFilter.value;

    const filtered = assets.filter(asset => {
        const matchSearch =
            asset.name.toLowerCase().includes(search) ||
            asset.serial.toLowerCase().includes(search) ||
            asset.brand.toLowerCase().includes(search);

        const matchStatus = status === 'all' || asset.status === status;
        const matchType = type === 'all' || asset.type === type;

        return matchSearch && matchStatus && matchType;
    });

    renderAssets(filtered);
}

async function loadAssets() {
    if (!window.SIGAM_API) {
        alert('Config de API no cargada.');
        return;
    }

    if (!window.SIGAM_API.getToken()) {
        alert('Inicia sesion para ver inventario.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const data = await window.SIGAM_API.apiRequest('/api/activos');
        assets = Array.isArray(data) ? data.map(mapAsset) : [];
        renderAssets(assets);
    } catch (error) {
        alert(error.message || 'No se pudo cargar el inventario.');
    }
}

searchInput.addEventListener('input', filterAssets);
statusFilter.addEventListener('change', filterAssets);
typeFilter.addEventListener('change', filterAssets);

document.addEventListener('DOMContentLoaded', () => {
    loadAssets();

    const form = document.getElementById('assetForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!window.SIGAM_API) {
            alert('Config de API no cargada.');
            return;
        }

        const serial = document.getElementById('serial').value.trim();
        const modelo = document.getElementById('modelo').value.trim();
        const fechaCompra = document.getElementById('fecha_compra').value;
        const vidaUtil = Number(document.getElementById('vida_util').value);
        const nivelCriticidad = document.getElementById('nivel_criticidad').value;

        if (!serial || !fechaCompra || !vidaUtil) {
            alert('Serial, fecha de compra y vida util son obligatorios.');
            return;
        }

        try {
            await window.SIGAM_API.apiRequest('/api/activos', {
                method: 'POST',
                body: {
                    serial,
                    modelo: modelo || undefined,
                    fecha_compra: fechaCompra,
                    vida_util: vidaUtil,
                    nivel_criticidad: nivelCriticidad
                }
            });

            form.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('assetModal'));
            modal.hide();
            await loadAssets();
        } catch (error) {
            alert(error.message || 'No se pudo crear el activo.');
        }
    });
});
>>>>>>> feature/cadena
