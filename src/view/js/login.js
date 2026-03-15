// Login flow: validate inputs, call API, persist token/user, redirect.
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm")
    const emailInput = document.getElementById("email")
    const passwordInput = document.getElementById("password")
    const statusEl = document.getElementById("loginStatus")
    const submitBtn = document.getElementById("loginBtn")
    let loginAttempts = 0

    function setStatus(message, type) {
        if (!statusEl) {
            return
        }
        statusEl.textContent = message || ""
        statusEl.style.color = "#6b7280"
        if (type === "error") {
            statusEl.style.color = "#dc2626"
        }
        if (type === "success") {
            statusEl.style.color = "#059669"
        }
    }

    function setSubmitting(isSubmitting) {
        if (!submitBtn) {
            return
        }
        submitBtn.disabled = isSubmitting
        submitBtn.textContent = isSubmitting ? "Loading..." : "Enter"
    }

    if (!form) {
        return
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        setStatus("")

        const email = emailInput.value.trim()
        const password = passwordInput.value

        if (!email || !password) {
            setStatus("Enter email and password.", "error")
            return
        }

        if (!window.SIGAM_API) {
            setStatus("API config not loaded.", "error")
            return
        }

        try {
            setSubmitting(true)
            const data = await window.SIGAM_API.apiRequest("/api/auth/login", {
                method: "POST",
                body: { email, password }
            })

            window.SIGAM_API.setToken(data.token)
            const userPayload = data.user || data.usuario || data.profile || {}
            if (userPayload && typeof userPayload === "object") {
                if (!userPayload.email && data.email) userPayload.email = data.email
                if (!userPayload.email) userPayload.email = email
                if (!userPayload.nombre && data.nombre) userPayload.nombre = data.nombre
                if (!userPayload.name && data.name) userPayload.name = data.name
                if (!userPayload.rol && data.rol) userPayload.rol = data.rol
                if (!userPayload.role && data.role) userPayload.role = data.role
            }
            window.SIGAM_API.setUser(userPayload)

            setStatus("Login successful. Redirecting...", "success")
            window.location.href = "dashboard.html"
        } catch (error) {
            loginAttempts += 1
            if (loginAttempts >= 3) {
                setStatus("Too many failed attempts. Please wait and try again.", "error")
                submitBtn.disabled = true
                return
            }
            setStatus(error.message || "Authentication error.", "error")
        } finally {
            setSubmitting(false)
        }
    })
})
