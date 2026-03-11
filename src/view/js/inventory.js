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
