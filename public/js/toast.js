(function () {
    let container = null;

    function ensureContainer() {
        if (container) return container;
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
        return container;
    }

    function showToast(message, options) {
        const opts = options || {};
        const type = opts.type || "success";
        const duration = opts.duration || 4000;
        const actionText = opts.actionText;
        const onAction = opts.onAction;

        const root = ensureContainer();

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const icon = document.createElement("span");
        icon.className = "toast-icon";
        icon.textContent = type === "success" ? "✓" : type === "error" ? "!" : "i";

        const text = document.createElement("span");
        text.className = "toast-text";
        text.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(text);

        let timer;

        function dismiss() {
            clearTimeout(timer);
            toast.classList.remove("show");
            toast.classList.add("hide");
            setTimeout(() => toast.remove(), 250);
        }

        if (actionText && typeof onAction === "function") {
            const actionBtn = document.createElement("button");
            actionBtn.type = "button";
            actionBtn.className = "toast-action-btn";
            actionBtn.textContent = actionText;
            actionBtn.addEventListener("click", () => {
                onAction();
                dismiss();
            });
            toast.appendChild(actionBtn);
        }

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "toast-close-btn";
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.textContent = "×";
        closeBtn.addEventListener("click", dismiss);
        toast.appendChild(closeBtn);

        root.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        timer = setTimeout(dismiss, duration);

        return dismiss;
    }

    window.showToast = showToast;
})();