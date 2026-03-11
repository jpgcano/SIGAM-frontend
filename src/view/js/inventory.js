// load the assets array from browser storage; if nothing is stored yet, fall back
// to a hard‑coded default list. using `let` because we will reassign when pushing new
// assets later. this ensures persistence across page reloads.
let assets = JSON.parse(localStorage.getItem("assets")) || [

    {
        name: "Dell Latitude 7420 Laptop",
        id: "AST-001",
        brand: "Dell Latitude 7420",
        serial: "DL7420-2023-001",
        assigned: "Maria Garcia",
        location: "Central Building - Floor 3",
        status: "active",
        type: "laptop",
        warranty: "expired",
        stock: 8,
        minStock: 5,
        suppliers: [
            { name: "TechSource", price: 1250, leadTime: 5 }
        ]
    },

    {
        name: "HP EliteDesk 800 G6",
        id: "AST-002",
        brand: "HP EliteDesk 800 G6",
        serial: "HP800-2022-045",
        assigned: "Pedro Ramirez",
        location: "Central Building - Floor 2",
        status: "maintenance",
        type: "desktop",
        warranty: "expired",
        stock: 2,
        minStock: 4,
        suppliers: [
            { name: "OfficeParts", price: 980, leadTime: 7 }
        ]
    },

    {
        name: "Dell PowerEdge R740 Server",
        id: "AST-003",
        brand: "Dell PowerEdge R740",
        serial: "DL-R740-2021-001",
        assigned: "",
        location: "Data Center - Floor 1",
        status: "active",
        type: "server",
        warranty: "3 days",
        stock: 1,
        minStock: 1,
        suppliers: [
            { name: "ServerPro", price: 6200, leadTime: 14 },
            { name: "TechSource", price: 6450, leadTime: 10 }
        ]
    }

];

// grab references to important DOM elements that we will update/interact with
const grid = document.getElementById("assetGrid")
const searchInput = document.getElementById("searchInput")
const statusFilter = document.getElementById("statusFilter")
const typeFilter = document.getElementById("typeFilter")
const resultCount = document.getElementById("resultCount")
const stockTableBody = document.getElementById("stockTableBody")
const supplierCards = document.getElementById("supplierCards")
const supplierForm = document.getElementById("supplierForm")
const supplierEditName = document.getElementById("supplierEditName")
const supplierEditRows = document.getElementById("supplierEditRows")
let editingSupplierName = null

const assetEditForm = document.getElementById("assetEditForm")
const editName = document.getElementById("editName")
const editBrand = document.getElementById("editBrand")
const editSerial = document.getElementById("editSerial")
const editAssigned = document.getElementById("editAssigned")
const editLocation = document.getElementById("editLocation")
const editStatus = document.getElementById("editStatus")
const editType = document.getElementById("editType")
const editWarranty = document.getElementById("editWarranty")
const editStock = document.getElementById("editStock")
const editMinStock = document.getElementById("editMinStock")
const editSupplierName = document.getElementById("editSupplierName")
const editSupplierPrice = document.getElementById("editSupplierPrice")
const editSupplierLeadTime = document.getElementById("editSupplierLeadTime")
let editingAssetId = null

function normalizeAssets(list) {
    return list.map(asset => {
        const normalized = { ...asset }
        if (typeof normalized.stock !== "number") {
            normalized.stock = Number.parseInt(normalized.stock || "0", 10) || 0
        }
        if (typeof normalized.minStock !== "number") {
            normalized.minStock = Number.parseInt(normalized.minStock || "0", 10) || 0
        }
        if (!Array.isArray(normalized.suppliers)) {
            normalized.suppliers = []
        }
        return normalized
    })
}

assets = normalizeAssets(assets)


// renderAssets builds the grid of cards from a given list of asset objects.
// it empties the container then appends a bootstrap card for each asset, also
// updating the counter showing how many assets are currently visible vs total.
function renderAssets(list) {

    grid.innerHTML = ""

    list.forEach(asset => {

        let badge = "bg-success"

        if (asset.status === "maintenance") {
            badge = "bg-warning text-dark"
        }

        grid.innerHTML += `

<div class="col-md-4">

<div class="card shadow-sm h-100">

<div class="card-body">

<div class="d-flex justify-content-between align-items-start">
<h5 class="fw-bold">${asset.name}</h5>
<button
  class="btn btn-sm btn-outline-dark asset-edit"
  type="button"
  data-asset-id="${asset.id}"
>
  Edit
</button>
</div>

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

    resultCount.innerText = `Showing ${list.length} of ${assets.length} assets`

}

function renderStockTable(list) {
    if (!stockTableBody) {
        return
    }
    stockTableBody.innerHTML = ""

    list.forEach(asset => {
        const isLow = asset.stock < asset.minStock
        const statusBadge = isLow
            ? '<span class="badge bg-danger">Below minimum</span>'
            : '<span class="badge bg-success">OK</span>'

        stockTableBody.innerHTML += `
          <tr class="${isLow ? "table-danger" : ""}">
            <td>${asset.name}</td>
            <td class="text-muted">${asset.type}</td>
            <td class="text-muted">${asset.location}</td>
            <td class="text-end fw-semibold">${asset.stock}</td>
            <td class="text-end text-muted">${asset.minStock}</td>
            <td>${statusBadge}</td>
          </tr>
        `
    })
}

function renderSupplierCards(list) {
    if (!supplierCards) {
        return
    }
    supplierCards.innerHTML = ""

    const assetBestPrices = {}
    list.forEach(asset => {
        const prices = (asset.suppliers || [])
            .map(s => ({ name: s.name, price: Number.parseInt(s.price || "0", 10) || 0 }))
            .filter(s => s.price > 0)
        if (prices.length) {
            const best = prices.reduce((min, cur) => (cur.price < min.price ? cur : min))
            assetBestPrices[asset.name] = best
        }
    })

    const suppliers = {}
    list.forEach(asset => {
        (asset.suppliers || []).forEach(supplier => {
            if (!suppliers[supplier.name]) {
                suppliers[supplier.name] = {
                    name: supplier.name,
                    items: 0,
                    totalStock: 0,
                    totalPrice: 0,
                    leadTimes: [],
                    assets: []
                }
            }
            suppliers[supplier.name].items += 1
            suppliers[supplier.name].totalStock += asset.stock
            suppliers[supplier.name].totalPrice += supplier.price || 0
            if (typeof supplier.leadTime === "number") {
                suppliers[supplier.name].leadTimes.push(supplier.leadTime)
            }
            suppliers[supplier.name].assets.push({
                assetName: asset.name,
                price: supplier.price || 0,
                isBest: assetBestPrices[asset.name] &&
                    assetBestPrices[asset.name].name === supplier.name
            })
        })
    })

    Object.values(suppliers).forEach(supplier => {
        const avgPrice = supplier.items ? Math.round(supplier.totalPrice / supplier.items) : 0
        const avgLeadTime = supplier.leadTimes.length
            ? Math.round(supplier.leadTimes.reduce((a, b) => a + b, 0) / supplier.leadTimes.length)
            : 0

        const assetRows = supplier.assets
            .slice()
            .sort((a, b) => (a.price || 0) - (b.price || 0))
            .map(item => `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted">${item.assetName}</span>
            <span class="fw-semibold ${item.isBest ? "text-success" : ""}">
              $${item.price}${item.isBest ? " best" : ""}
            </span>
          </div>
        `).join("")

        supplierCards.innerHTML += `
          <div class="col-md-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <h6 class="fw-bold mb-1">${supplier.name}</h6>
                  <div class="d-flex gap-2 align-items-center">
                    <span class="badge bg-primary-subtle text-primary border">Supplier</span>
                    <button
                      class="btn btn-sm btn-outline-dark supplier-edit"
                      type="button"
                      data-supplier="${supplier.name}"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div class="text-muted small mb-3">Assets supplied: ${supplier.items}</div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Avg Price</span>
                  <span class="fw-semibold">$${avgPrice}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Total Stock</span>
                  <span class="fw-semibold">${supplier.totalStock}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Avg Lead Time</span>
                  <span class="fw-semibold">${avgLeadTime} days</span>
                </div>
                <div class="border-top pt-3 mt-3">
                  <div class="text-muted small mb-2">Price by asset</div>
                  ${assetRows || '<div class="text-muted small">No price data</div>'}
                </div>
              </div>
            </div>
          </div>
        `
    })
}

function openSupplierEditor(supplierName) {
    if (!supplierEditRows || !supplierEditName) {
        return
    }
    editingSupplierName = supplierName
    supplierEditName.value = supplierName
    supplierEditRows.innerHTML = ""

    assets.forEach(asset => {
        const supplierIndex = (asset.suppliers || []).findIndex(
            supplier => supplier.name === supplierName
        )
        if (supplierIndex === -1) {
            return
        }
        const supplier = asset.suppliers[supplierIndex]
        supplierEditRows.innerHTML += `
          <tr data-asset-id="${asset.id}" data-supplier-index="${supplierIndex}">
            <td>${asset.name}</td>
            <td class="text-end">
              <input
                class="form-control form-control-sm text-end"
                type="number"
                min="0"
                value="${supplier.price || 0}"
              />
            </td>
            <td class="text-end">
              <input
                class="form-control form-control-sm text-end"
                type="number"
                min="0"
                value="${supplier.leadTime || 0}"
              />
            </td>
          </tr>
        `
    })

    const modal = new bootstrap.Modal(document.getElementById("supplierModal"))
    modal.show()
}

function openAssetEditor(assetId) {
    const asset = assets.find(item => item.id === assetId)
    if (!asset) {
        return
    }
    editingAssetId = assetId

    editName.value = asset.name || ""
    editBrand.value = asset.brand || ""
    editSerial.value = asset.serial || ""
    editAssigned.value = asset.assigned || ""
    editLocation.value = asset.location || ""
    editStatus.value = asset.status || "active"
    editType.value = asset.type || "laptop"
    editWarranty.value = asset.warranty || ""
    editStock.value = asset.stock || 0
    editMinStock.value = asset.minStock || 0

    const primarySupplier = (asset.suppliers || [])[0] || {}
    editSupplierName.value = primarySupplier.name || ""
    editSupplierPrice.value = primarySupplier.price || 0
    editSupplierLeadTime.value = primarySupplier.leadTime || 0

    const modal = new bootstrap.Modal(document.getElementById("assetEditModal"))
    modal.show()
}

// filterAssets reads the search and filter inputs, applies them to the global
// `assets` array, and calls renderAssets with the filtered results.
function filterAssets() {

    const search = searchInput.value.toLowerCase()
    const status = statusFilter.value
    const type = typeFilter.value

    let filtered = assets.filter(asset => {

        const matchSearch =
            asset.name.toLowerCase().includes(search) ||
            asset.serial.toLowerCase().includes(search) ||
            asset.brand.toLowerCase().includes(search)

        const matchStatus =
            status === "all" || asset.status === status

        const matchType =
            type === "all" || asset.type === type

        return matchSearch && matchStatus && matchType

    })

    renderAssets(filtered)
    renderStockTable(filtered)
    renderSupplierCards(filtered)

}

// wire up input events so that the list refreshes whenever the user types or
// changes a filter dropdown.
searchInput.addEventListener("input", filterAssets)
statusFilter.addEventListener("change", filterAssets)
typeFilter.addEventListener("change", filterAssets)

// initial rendering of whatever is currently in the array
renderAssets(assets)
renderStockTable(assets)
renderSupplierCards(assets)

// if the page loaded and storage was empty (first visit), save the default
// list so subsequent reloads honour persistence
if (!localStorage.getItem("assets")) {
    localStorage.setItem("assets", JSON.stringify(assets));
}



// wait for the DOM to finish loading before accessing form fields, then
// set up the submission handler for adding new assets.
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("assetForm")

    // when the new-asset form is submitted, build an object out of the inputs,
    // push it to the assets array, save the updated array to storage, re-render
    // the grid and reset/close the modal.
    form.addEventListener("submit", function (e) {

        e.preventDefault()

        const newAsset = {

            name: document.getElementById("name").value,
            id: "AST-" + (assets.length + 1).toString().padStart(3, "0"),
            brand: document.getElementById("brand").value,
            serial: document.getElementById("serial").value,
            assigned: document.getElementById("assigned").value,
            location: document.getElementById("location").value,
            status: document.getElementById("status").value,
            type: document.getElementById("type").value,
            warranty: document.getElementById("warranty").value,
            stock: Number.parseInt(document.getElementById("stock").value || "0", 10) || 0,
            minStock: Number.parseInt(document.getElementById("minStock").value || "0", 10) || 0,
            suppliers: [
                {
                    name: document.getElementById("supplierName").value || "Unknown",
                    price: Number.parseInt(document.getElementById("supplierPrice").value || "0", 10) || 0,
                    leadTime: Number.parseInt(document.getElementById("supplierLeadTime").value || "0", 10) || 0
                }
            ]

        }

        assets.push(newAsset)
        localStorage.setItem("assets", JSON.stringify(assets))

        renderAssets(assets)
        renderStockTable(assets)
        renderSupplierCards(assets)

        form.reset()

        const modal = bootstrap.Modal.getInstance(document.getElementById("assetModal"))
        modal.hide()

    })

})


if (supplierCards) {
    supplierCards.addEventListener("click", function (event) {
        const button = event.target.closest(".supplier-edit")
        if (!button) {
            return
        }
        openSupplierEditor(button.dataset.supplier)
    })
}

if (grid) {
    grid.addEventListener("click", function (event) {
        const button = event.target.closest(".asset-edit")
        if (!button) {
            return
        }
        openAssetEditor(button.dataset.assetId)
    })
}

if (supplierForm) {
    supplierForm.addEventListener("submit", function (event) {
        event.preventDefault()
        if (!editingSupplierName) {
            return
        }
        const newName = supplierEditName.value.trim() || editingSupplierName

        const rows = supplierEditRows.querySelectorAll("tr")
        rows.forEach(row => {
            const assetId = row.dataset.assetId
            const supplierIndex = Number.parseInt(row.dataset.supplierIndex, 10)
            const inputs = row.querySelectorAll("input")
            const priceValue = Number.parseInt(inputs[0].value || "0", 10) || 0
            const leadValue = Number.parseInt(inputs[1].value || "0", 10) || 0

            const asset = assets.find(item => item.id === assetId)
            if (!asset || !asset.suppliers || !asset.suppliers[supplierIndex]) {
                return
            }
            asset.suppliers[supplierIndex].price = priceValue
            asset.suppliers[supplierIndex].leadTime = leadValue
        })

        if (newName !== editingSupplierName) {
            assets.forEach(asset => {
                (asset.suppliers || []).forEach(supplier => {
                    if (supplier.name === editingSupplierName) {
                        supplier.name = newName
                    }
                })
            })
        }

        localStorage.setItem("assets", JSON.stringify(assets))
        renderAssets(assets)
        renderStockTable(assets)
        renderSupplierCards(assets)

        const modal = bootstrap.Modal.getInstance(
            document.getElementById("supplierModal")
        )
        if (modal) {
            modal.hide()
        }
        editingSupplierName = null
    })
}

if (assetEditForm) {
    assetEditForm.addEventListener("submit", function (event) {
        event.preventDefault()
        const asset = assets.find(item => item.id === editingAssetId)
        if (!asset) {
            return
        }

        asset.name = editName.value
        asset.brand = editBrand.value
        asset.serial = editSerial.value
        asset.assigned = editAssigned.value
        asset.location = editLocation.value
        asset.status = editStatus.value
        asset.type = editType.value
        asset.warranty = editWarranty.value
        asset.stock = Number.parseInt(editStock.value || "0", 10) || 0
        asset.minStock = Number.parseInt(editMinStock.value || "0", 10) || 0

        const supplierNameValue = editSupplierName.value.trim()
        const supplierPriceValue = Number.parseInt(editSupplierPrice.value || "0", 10) || 0
        const supplierLeadValue = Number.parseInt(editSupplierLeadTime.value || "0", 10) || 0

        if (!Array.isArray(asset.suppliers)) {
            asset.suppliers = []
        }
        if (asset.suppliers.length === 0) {
            if (supplierNameValue) {
                asset.suppliers.push({
                    name: supplierNameValue,
                    price: supplierPriceValue,
                    leadTime: supplierLeadValue
                })
            }
        } else {
            asset.suppliers[0].name = supplierNameValue || asset.suppliers[0].name
            asset.suppliers[0].price = supplierPriceValue
            asset.suppliers[0].leadTime = supplierLeadValue
        }

        localStorage.setItem("assets", JSON.stringify(assets))
        renderAssets(assets)
        renderStockTable(assets)
        renderSupplierCards(assets)

        const modal = bootstrap.Modal.getInstance(
            document.getElementById("assetEditModal")
        )
        if (modal) {
            modal.hide()
        }
        editingAssetId = null
    })
}
