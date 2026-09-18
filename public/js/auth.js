document.addEventListener("DOMContentLoaded", () => {
    const accountBtn = document.getElementById("accountBtn");
    const accountDropdown = document.getElementById("accountDropdown");
    const authModal = document.getElementById("authModal");
    const closeModal = document.getElementById("closeModal");

    const authStepChoice = document.getElementById("authStepChoice");
    const authStepSignIn = document.getElementById("authStepSignIn");
    const authStepSignUp = document.getElementById("authStepSignUp");
    const authStepProfile = document.getElementById("authStepProfile");

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
        if (authStepProfile) authStepProfile.style.display = "none";
        if (step) step.style.display = "block";
    }

    window.openAuthModal = function () {
        if (accountDropdown) accountDropdown.classList.remove("show");
        if (authModal) authModal.classList.add("active");
        showStep(authStepChoice);
    };

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

            if (!accountDropdown) return;

            if (activeUser) {
                renderAuthorizedDropdown(activeUser);
            } else {
                renderGuestDropdown();
            }
            accountDropdown.classList.toggle("show");
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

        const profileFormEl = document.getElementById("profileForm");
        const profileErrorEl = document.getElementById("profileError");
        if (profileFormEl) profileFormEl.reset();
        if (profileErrorEl) profileErrorEl.style.display = "none";
    }

    if (toSignInBtn) toSignInBtn.addEventListener("click", () => showStep(authStepSignIn));
    if (toSignUpBtn) toSignUpBtn.addEventListener("click", () => showStep(authStepSignUp));
    if (switchSignUp) switchSignUp.addEventListener("click", (e) => { e.preventDefault(); showStep(authStepSignUp); });
    if (switchSignIn) switchSignIn.addEventListener("click", (e) => { e.preventDefault(); showStep(authStepSignIn); });

    const LOGIN_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const LOGIN_PHONE_REGEX = /^380\d{9}$/;

    function validateSignupLogin(login) {
        if (login.includes("@")) {
            if (!LOGIN_EMAIL_REGEX.test(login)) {
                return "Please enter a valid email address using English letters only.";
            }
            return null;
        }

        if (!LOGIN_PHONE_REGEX.test(login)) {
            return "Please enter a valid phone number in the format 380XXXXXXXXX.";
        }
        return null;
    }

    if (signUpForm) {
        signUpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const login = signUpEmail.value.trim();
            const password = signUpPassword.value;

            const loginError = validateSignupLogin(login);
            if (loginError) {
                signUpError.textContent = loginError;
                signUpError.style.display = "block";
                signUpEmail.focus();
                return;
            }

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

                if (authStepProfile) {
                    showStep(authStepProfile);
                } else {
                    closeModalFunc();
                    if (window.showToast) {
                        window.showToast("Successfully signed up! Now you can add products to your cart.", {
                            type: "success"
                        });
                    }
                }
            } catch (err) {
                console.error(err);
                signUpError.innerHTML = "Server connection error.";
                signUpError.style.display = "block";
            }
        });
    }

    const profileForm = document.getElementById("profileForm");
    const profileFirstName = document.getElementById("profileFirstName");
    const profileLastName = document.getElementById("profileLastName");
    const profileError = document.getElementById("profileError");
    const profileSkipBtn = document.getElementById("profileSkipBtn");

    function openProfileStep() {
        const user = getCurrentUser();
        if (profileFirstName) profileFirstName.value = user && user.firstName ? user.firstName : "";
        if (profileLastName) profileLastName.value = user && user.lastName ? user.lastName : "";
        if (profileError) profileError.style.display = "none";

        if (authModal) authModal.classList.add("active");
        showStep(authStepProfile);
    }

    function finishProfileStep(firstName, lastName) {
        const user = getCurrentUser();
        if (user) {
            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            setCurrentUser(user);
        }

        closeModalFunc();

        if (window.showToast) {
            window.showToast("Welcome to HerSmile! Now you can add products to your cart.", {
                type: "success"
            });
        }
    }

    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const firstName = profileFirstName.value.trim();
            const lastName = profileLastName.value.trim();
            const nameRegex = /^[A-Za-z]+$/;

            if (!nameRegex.test(firstName)) {
                profileError.textContent = "Please enter a valid first name using English letters only.";
                profileError.style.display = "block";
                profileFirstName.focus();
                return;
            }
            if (!nameRegex.test(lastName)) {
                profileError.textContent = "Please enter a valid last name using English letters only.";
                profileError.style.display = "block";
                profileLastName.focus();
                return;
            }

            profileError.style.display = "none";
            finishProfileStep(firstName, lastName);
        });
    }

    if (profileSkipBtn) {
        profileSkipBtn.addEventListener("click", () => finishProfileStep());
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

                if (window.showToast) {
                    window.showToast("Successfully signed in! Now you can add products to your cart.", {
                        type: "success"
                    });
                }
            } catch (err) {
                console.error(err);
                signInError.innerHTML = "Server connection error.";
                signInError.style.display = "block";
            }
        });
    }

    renderPasswordStrength("");

    function renderAuthorizedDropdown(user) {
        if (!accountDropdown) return;

        const displayName = (user.firstName || user.lastName)
            ? [user.firstName, user.lastName].filter(Boolean).join(" ")
            : user.login;

        accountDropdown.innerHTML = `
          <div class="acc-user-info">
            <span class="acc-user-email">${displayName}</span>
            <button type="button" class="acc-edit-btn" id="accEditProfileBtn" title="Edit name">✎ Edit</button>
          </div>
          <div class="acc-links-section">
            <a href="#" class="acc-link-item" id="dropdownOrdersBtn">Order History</a>
          </div>
          <div class="acc-logout-section">
            <button class="acc-logout-btn" id="dropdownLogoutBtn">Sign Out</button>
          </div>
        `;

        const editProfileBtn = document.getElementById("accEditProfileBtn");
        if (editProfileBtn) {
            editProfileBtn.addEventListener("click", () => {
                accountDropdown.classList.remove("show");
                openProfileStep();
            });
        }
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

    function renderGuestDropdown() {
        if (!accountDropdown) return;
        accountDropdown.innerHTML = `
          <div class="acc-links-section" style="border-bottom: none; padding-top: 0;">
            <a href="#" class="acc-link-item" id="dropdownSignInBtn">Sign In</a>
            <a href="#" class="acc-link-item" id="dropdownOrdersGuestBtn" style="margin-top: 10px;">Order History</a>
          </div>
        `;

        const signInBtn = document.getElementById("dropdownSignInBtn");
        if (signInBtn) {
            signInBtn.addEventListener("click", (e) => {
                e.preventDefault();
                accountDropdown.classList.remove("show");
                window.openAuthModal();
            });
        }

        const ordersGuestBtn = document.getElementById("dropdownOrdersGuestBtn");
        if (ordersGuestBtn) {
            ordersGuestBtn.addEventListener("click", (e) => {
                e.preventDefault();
                accountDropdown.classList.remove("show");
                if (window.showToast) {
                    window.showToast("You're not signed in. Please sign in first to view your order history.", {
                        type: "info",
                        actionText: "Sign in",
                        onAction: () => window.openAuthModal()
                    });
                } else {
                    window.openAuthModal();
                }
            });
        }
    }
});