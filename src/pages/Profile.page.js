import { Navbar } from "../components/Navbar.js";
import { api } from "../services/api-client.js";
import { getUser, clearStorage } from "../state/storage.js";
import { router } from "../router.js";
import "../css/pages/profile.css";

const ROLE_ALLOWLIST = ["Gerente", "Analista", "Tecnico", "Usuario", "Auditor"];

const render = async () => {
  const navbarHTML = Navbar.render();

  return `
    ${navbarHTML}
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Profile</h2>
          <p class="text-muted mb-0">Your account details and security settings</p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card shadow-sm border-0 profile-card">
            <div class="card-body">
              <h5 class="fw-semibold mb-3">Account Details</h5>
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input id="profileName" class="form-control" type="text" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input id="profileEmail" class="form-control" type="email" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <input id="profileRole" class="form-control" type="text" readonly>
              </div>
              <div class="mb-0">
                <label class="form-label">Last Access</label>
                <input id="profileLastAccess" class="form-control" type="text" readonly>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card shadow-sm border-0 profile-card">
            <div class="card-body">
              <h5 class="fw-semibold mb-3">Change Password</h5>
              <form id="passwordForm" novalidate>
                <div class="mb-3">
                  <label class="form-label">New Password</label>
                  <input id="newPassword" class="form-control" type="password" required>
                  <div class="invalid-feedback">Password is required.</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Confirm Password</label>
                  <input id="confirmPassword" class="form-control" type="password" required>
                  <div class="invalid-feedback">Please confirm the password.</div>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <button id="passwordSubmit" type="submit" class="btn btn-dark">Update Password</button>
                  <span id="passwordStatus" class="small text-muted"></span>
                </div>
              </form>
            </div>
          </div>

          <div class="card shadow-sm border-0 profile-card mt-4">
            <div class="card-body">
              <h5 class="fw-semibold mb-3">Session</h5>
              <p class="text-muted">If you suspect any unusual activity, sign out and log in again.</p>
              <button id="logoutBtn" class="btn btn-outline-secondary">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const init = async () => {
  Navbar.init();
  loadProfile();
  bindEvents();
};

const loadProfile = () => {
  const user = getUser();
  const passwordStatus = document.querySelector("#passwordStatus");

  if (!user) {
    if (passwordStatus) {
      passwordStatus.textContent = "No user session found.";
      passwordStatus.classList.add("text-danger");
    }
    return;
  }

  const name = user.nombre || user.name || user.fullName || user.full_name || "User";
  const email = user.email || user.correo || "";
  const role = user.rol || user.role || user.Rol || user.ROLE || "";
  const lastAccess = user.ultimo_acceso || user.lastAccess || user.fecha_creacion || "";

  const nameInput = document.querySelector("#profileName");
  const emailInput = document.querySelector("#profileEmail");
  const roleInput = document.querySelector("#profileRole");
  const lastAccessInput = document.querySelector("#profileLastAccess");

  if (nameInput) nameInput.value = name;
  if (emailInput) emailInput.value = email;
  if (roleInput) roleInput.value = role || "Usuario";
  if (lastAccessInput) lastAccessInput.value = lastAccess || "-";
};

const setPasswordStatus = (message, type) => {
  const statusEl = document.querySelector("#passwordStatus");
  if (!statusEl) return;
  statusEl.textContent = message || "";
  statusEl.classList.remove("text-success", "text-danger", "text-muted");
  if (type === "success") {
    statusEl.classList.add("text-success");
  } else if (type === "error") {
    statusEl.classList.add("text-danger");
  } else {
    statusEl.classList.add("text-muted");
  }
};

const setSubmitting = (isSubmitting) => {
  const submitBtn = document.querySelector("#passwordSubmit");
  if (!submitBtn) return;
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? "Updating..." : "Update Password";
};

const handlePassword = async (event) => {
  event.preventDefault();
  setPasswordStatus("");

  const password = document.querySelector("#newPassword")?.value.trim() || "";
  const confirm = document.querySelector("#confirmPassword")?.value.trim() || "";

  if (!password || !confirm) {
    setPasswordStatus("Password is required.", "error");
    return;
  }

  if (password !== confirm) {
    setPasswordStatus("Passwords do not match.", "error");
    return;
  }

  const user = getUser();
  const userId = user && (user.id || user.id_usuario || user.userId);
  if (!userId) {
    setPasswordStatus("User id not found in session.", "error");
    return;
  }

  if (!SIGAM_CONFIG.API_BASE_URL) {
    setPasswordStatus("API not available.", "error");
    return;
  }

  try {
    setSubmitting(true);
    await api.apiRequest(`${SIGAM_CONFIG.USUARIOS_ENDPOINT}/${encodeURIComponent(userId)}/password`, {
      method: "PUT",
      body: { password }
    });
    setPasswordStatus("Password updated successfully.", "success");
    const form = document.querySelector("#passwordForm");
    if (form) form.reset();
  } catch (error) {
    setPasswordStatus(error.message || "Could not update password.", "error");
  } finally {
    setSubmitting(false);
  }
};

const handleLogout = () => {
  clearStorage();
  router.navigateTo("/login", { replace: true });
};

const bindEvents = () => {
  const form = document.querySelector("#passwordForm");
  const logoutBtn = document.querySelector("#logoutBtn");

  if (form) {
    form.addEventListener("submit", handlePassword);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
};

export const ProfilePage = {
  render,
  init,
  meta: {
    bodyClass: "page-profile",
    roles: ROLE_ALLOWLIST
  }
};
