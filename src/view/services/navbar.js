// Loads the shared navbar and highlights the active route.
(() => {
    const container = document.getElementById("app-navbar");
    if (!container) {
        return;
    }

    const ensureNavbarStyles = () => {
        if (document.querySelector('link[data-sigam-navbar="true"]')) {
            return;
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "../css/navbar.css";
        link.setAttribute("data-sigam-navbar", "true");
        document.head.appendChild(link);
    };

    ensureNavbarStyles();

    let currentPage = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!currentPage) {
        currentPage = "dashboard.html";
    }

    fetch("../services/navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Navbar fetch failed");
            }
            return response.text();
        })
        .then((html) => {
            container.innerHTML = html;
            const links = container.querySelectorAll("[data-page]");
            links.forEach((link) => {
                const page = link.getAttribute("data-page");
                if (page && page.toLowerCase() === currentPage) {
                    link.classList.add("active", "fw-bold", "text-primary");
                }
            });

            const api = window.SIGAM_API;
            let user = api && api.getUser ? api.getUser() : null;
            if (!user) {
                try {
                    const raw = localStorage.getItem("sigam_user");
                    user = raw ? JSON.parse(raw) : null;
                } catch {
                    user = null;
                }
            }
            if (user) {
                const nameEl = container.querySelector("#navbar-user-name");
                const emailEl = container.querySelector("#navbar-user-email");
                const roleEl = container.querySelector("#navbar-user-role");
                const userBox = container.querySelector("#navbar-user");
                const logoutBtn = container.querySelector("#navbar-logout");

                const name = user.nombre || user.name || user.fullName || user.full_name || "";
                const email = user.email || user.correo || "";
                const role = user.rol || user.role || user.Rol || user.ROLE || "";
                const normalizedRole = String(role || "").toLowerCase();

                if (userBox && (name || email)) {
                    userBox.classList.remove("d-none");
                    if (nameEl) nameEl.textContent = name || "Usuario";
                    if (emailEl) emailEl.textContent = email;
                }

                if (roleEl && role) {
                    roleEl.classList.remove("d-none");
                    roleEl.textContent = role;
                    roleEl.classList.remove("bg-primary", "bg-success", "bg-info", "bg-warning", "bg-secondary", "text-dark");
                    if (normalizedRole.includes("gerente")) {
                        roleEl.classList.add("bg-success");
                    } else if (normalizedRole.includes("auditor")) {
                        roleEl.classList.add("bg-warning", "text-dark");
                    } else if (normalizedRole.includes("analista")) {
                        roleEl.classList.add("bg-info", "text-dark");
                    } else if (normalizedRole.includes("tecnico") || normalizedRole.includes("técnico")) {
                        roleEl.classList.add("bg-warning", "text-dark");
                    } else if (normalizedRole.includes("usuario")) {
                        roleEl.classList.add("bg-secondary");
                    } else {
                        roleEl.classList.add("bg-secondary");
                    }
                }

                if (logoutBtn) {
                    logoutBtn.classList.remove("d-none");
                    logoutBtn.addEventListener("click", () => {
                        if (api && api.clearToken) api.clearToken();
                        if (api && api.clearUser) api.clearUser();
                        window.location.href = "login.html";
                    });
                }
            }
        })
        .catch((error) => {
            console.warn("Navbar load failed:", error);
        });
})();
