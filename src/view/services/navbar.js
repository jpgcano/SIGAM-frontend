(() => {
    const container = document.getElementById("app-navbar");
    if (!container) {
        return;
    }

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
        })
        .catch((error) => {
            console.warn("Navbar load failed:", error);
        });
})();
