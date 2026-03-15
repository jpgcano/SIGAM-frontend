import { renderButton } from "./Button.js";

const getStatusClass = (status) => {
  if (status === "maintenance") {
    return "status-warning";
  }
  return "status-ok";
};

const getStatusBadgeClass = (status) => {
  if (status === "maintenance") {
    return "bg-warning text-dark";
  }
  return "bg-success";
};

export const renderAssetCard = (asset) => {
  const badge = getStatusBadgeClass(asset.status);
  const statusClass = getStatusClass(asset.status);
  return `
    <div class="card shadow-sm h-100 asset-card ${statusClass}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="fw-bold">${asset.name}</h5>
            ${renderButton({
              label: "Edit",
              variant: "outlineDark",
              className: "btn-sm asset-edit",
              attrs: { type: "button", "data-asset-id": asset.id }
            })}
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
  `;
};
