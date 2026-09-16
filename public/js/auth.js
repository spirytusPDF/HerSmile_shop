document.addEventListener("DOMContentLoaded", () => {
    const accountBtn = document.getElementById("accountBtn");
    const accountDropdown = document.getElementById("accountDropdown");
    const authModal = document.getElementById("authModal");
    const closeModal = document.getElementById("closeModal");

    const authStepChoice = document.getElementById("authStepChoice");
    const authStepSignIn = document.getElementById("authStepSignIn");
    const authStepSignUp = document.getElementById("authStepSignUp");

    const toSignInBtn = document.getElementById("toSignInBtn");
    const toSignUpBtn = document.getElementById("toSignUpBtn");
    const switchSignUp = document.getElementById("switchSignUp");
    const switchSignIn = document.getElementById("switchSignIn");

    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    const signInEmail = document.getElementById("signInEmail");
    const signInPassword = document.getElementById("signInPassword");
    const signInError = document.getElementById("signInError");

    const signUpEmail = document.getElementById("signUpEmail");
    const signUpPassword = document.getElementById("signUpPassword");
    const signUpError = document.getElementById("signUpError");

    const bar1 = document.getElementById("bar1");
    const bar2 = document.getElementById("bar2");
    const bar3 = document.getElementById("bar3");
    const strengthText = document.getElementById("strengthText");

    function getCurrentUser() {
        const userJson = localStorage.getItem("hersmile_current_user");
        if (!userJson) return null;
        try {
            return JSON.parse(userJson);
        } catch (e) {
            localStorage.removeItem("hersmile_current_user");
            return null;
        }
    }

    function setCurrentUser(userObj) {
        localStorage.setItem("hersmile_current_user", JSON.stringify(userObj));
    }

    function showStep(step) {
        if (authStepChoice) authStepChoice.style.display = "none";
        if (authStepSignIn) authStepSignIn.style.display = "none";
        if (authStepSignUp) authStepSignUp.style.display = "none";
        if (step) step.style.display = "block";
    }

    const MIN_PASSWORD_LENGTH = 8;

    const STRENGTH_LEVELS = {
        0: { text: "Weak", color: "#E0E0E0", bars: 0 },
        1: { text: "Weak", color: "#C0392B", bars: 1 },
        2: { text: "Medium", color: "#E0A800", bars: 2 },
        3: { text: "Strong", color: "#2E7D32", bars: 3 }
    };

    function calcPasswordStrength(password) {
        if (!password) return 0;

        let points = 0;
        if (password.length >= MIN_PASSWORD_LENGTH) points++;
        if (password.length >= 12) points++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
        if (/\d/.test(password)) points++;
        if (/[^A-Za-z0-9]/.test(password)) points++;

        // короткий пароль никогда не может быть "сильным"
        if (password.length < MIN_PASSWORD_LENGTH) return 1;

        if (points <= 2) return 1;
        if (points === 3) return 2;
        return 3;
    }

    function renderPasswordStrength(password) {
        const bars = [bar1, bar2, bar3];
        const level = STRENGTH_LEVELS[calcPasswordStrength(password)];

        bars.forEach((bar, index) => {
            if (!bar) return;
            bar.style.backgroundColor = index < level.bars ? level.color : "#E0E0E0";
        });

        if (strengthText) {
            strengthText.textContent = password ? level.text : "Weak";
            strengthText.style.color = password ? level.color : "#666";
        }
    }

    if (signUpPassword) {
        signUpPassword.addEventListener("input", () => {
            renderPasswordStrength(signUpPassword.value);
            if (signUpError) signUpError.style.display = "none";
        });
    }

    if (accountBtn) {
        accountBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const activeUser = getCurrentUser();

            if (activeUser) {
                renderAuthorizedDropdown(activeUser.login);
                if (accountDropdown) {
                    accountDropdown.classList.toggle("show");
                }
            } else {
                if (accountDropdown) {
                    accountDropdown.classList.remove("show");
                }
                if (authModal) {
                    authModal.classList.add("active");
                }
                showStep(authStepChoice);
            }
        });
    } else {
        console.error("Элемент #accountBtn не найден в DOM!");
    }

    if (closeModal) {
        closeModal.addEventListener("click", closeModalFunc);
    }

    if (authModal) {
        authModal.addEventListener("click", (e) => {
            if (e.target === authModal) {
                closeModalFunc();
            }
        });
    }

    function closeModalFunc() {
        if (authModal) authModal.classList.remove("active");
        resetForms();
    }

    function resetForms() {
        if (signInForm) signInForm.reset();
        if (signUpForm) signUpForm.reset();
        if (signInError) signInError.style.display = "none";
        if (signUpError) signUpError.style.display = "none";
        renderPasswordStrength("");
    }

    if (toSignInBtn) toSignInBtn.addEventListener("click", () => showStep(authStepSignIn));
    if (toSignUpBtn) toSignUpBtn.addEventListener("click", () => showStep(authStepSignUp));
    if (switchSignUp) switchSignUp.addEventListener("click", (e) => { e.preventDefault(); showStep(authStepSignUp); });
    if (switchSignIn) switchSignIn.addEventListener("click", (e) => { e.preventDefault(); showStep(authStepSignIn); });

    if (signUpForm) {
        signUpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const login = signUpEmail.value.trim();
            const password = signUpPassword.value;

            if (password.length < MIN_PASSWORD_LENGTH) {
                signUpError.textContent = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
                signUpError.style.display = "block";
                signUpPassword.focus();
                return;
            }

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    signUpError.innerHTML = data.error || data.message || "Failed to create user";
                    signUpError.style.display = "block";
                    return;
                }

                setCurrentUser({ id: data.userId, login: login });
                closeModalFunc();
            } catch (err) {
                console.error(err);
                signUpError.innerHTML = "Server connection error.";
                signUpError.style.display = "block";
            }
        });
    }

    if (signInForm) {
        signInForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const login = signInEmail.value.trim();
            const password = signInPassword.value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    signInError.innerHTML = data.error || data.message || "Failed to login";
                    signInError.style.display = "block";
                    return;
                }

                setCurrentUser({ id: data.user.id, login: data.user.login });
                closeModalFunc();
            } catch (err) {
                console.error(err);
                signInError.innerHTML = "Server connection error.";
                signInError.style.display = "block";
            }
        });
    }

    renderPasswordStrength("");

    function renderAuthorizedDropdown(loginOrEmail) {
        if (!accountDropdown) return;
        accountDropdown.innerHTML = `
          <div class="acc-user-info">
            <span class="acc-user-email">${loginOrEmail}</span>
          </div>
          <div class="acc-links-section">
            <a href="#" class="acc-link-item" id="dropdownOrdersBtn">Order History</a>
          </div>
          <div class="acc-logout-section">
            <button class="acc-logout-btn" id="dropdownLogoutBtn">Sign Out</button>
          </div>
        `;
        const ordersBtn = document.getElementById("dropdownOrdersBtn");
        if (ordersBtn) {
            ordersBtn.addEventListener("click", (e) => {
                e.preventDefault();
                accountDropdown.classList.remove("show");
                const user = getCurrentUser();
                if (user && window.openOrderHistory) {
                    window.openOrderHistory(user.id);
                }
            });
        }

        const logoutBtn = document.getElementById("dropdownLogoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("hersmile_current_user");
                accountDropdown.classList.remove("show");
            });
        }
    }
});