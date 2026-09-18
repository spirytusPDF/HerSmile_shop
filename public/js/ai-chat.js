document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("aiChatToggle");
    const chatWindow = document.getElementById("aiChatWindow");
    const closeBtn = document.getElementById("aiChatClose");
    const messagesEl = document.getElementById("aiChatMessages");
    const form = document.getElementById("aiChatForm");
    const input = document.getElementById("aiChatInput");
    const sendBtn = document.getElementById("aiChatSendBtn");

    if (!toggleBtn || !chatWindow || !form || !input || !messagesEl) return;

    // ассистент на бэкенде сейчас советует только парфюмы (aiController
    // фильтрует инвентарь по category: 'perfume'), поэтому подсказки — про духи
    const QUICK_QUESTIONS = [
        "Recommend a perfume for everyday wear",
        "Something floral and light for spring",
        "A bold fragrance for an evening out",
        "What's a good perfume gift for someone?"
    ];

    // короткая история диалога, чтобы бэкенд видел контекст последних реплик
    const MAX_HISTORY = 12;
    let history = [];
    let isWaiting = false;
    let quickRepliesEl = null;

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function appendMessage(text, role) {
        const bubble = document.createElement("div");
        bubble.className = `ai-chat-msg ai-chat-msg-${role}`;
        bubble.textContent = text;
        messagesEl.appendChild(bubble);
        scrollToBottom();
        return bubble;
    }

    function showTypingIndicator() {
        const typing = document.createElement("div");
        typing.className = "ai-chat-typing";
        typing.id = "aiChatTyping";
        typing.innerHTML = "<span></span><span></span><span></span>";
        messagesEl.appendChild(typing);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typing = document.getElementById("aiChatTyping");
        if (typing) typing.remove();
    }

    function setWaiting(state) {
        isWaiting = state;
        if (sendBtn) sendBtn.disabled = state;
        if (input) input.disabled = state;
    }

    function removeQuickReplies() {
        if (quickRepliesEl) {
            quickRepliesEl.remove();
            quickRepliesEl = null;
        }
    }

    function showQuickReplies() {
        if (quickRepliesEl) return;

        quickRepliesEl = document.createElement("div");
        quickRepliesEl.className = "ai-chat-quick-replies";

        QUICK_QUESTIONS.forEach(question => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "ai-chat-quick-btn";
            chip.textContent = question;
            chip.addEventListener("click", () => {
                if (isWaiting) return;
                removeQuickReplies();
                sendMessage(question);
            });
            quickRepliesEl.appendChild(chip);
        });

        messagesEl.appendChild(quickRepliesEl);
        scrollToBottom();
    }

    async function sendMessage(text) {
        appendMessage(text, "user");
        history.push({ role: "user", content: text });
        if (history.length > MAX_HISTORY) {
            history = history.slice(-MAX_HISTORY);
        }

        setWaiting(true);
        showTypingIndicator();

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, history })
            });

            hideTypingIndicator();

            if (!response.ok) {
                appendMessage(
                    "The assistant is temporarily unavailable. Please try again in a moment.",
                    "error"
                );
                return;
            }

            const data = await response.json();
            const reply = data.reply || data.message || data.response || data.text;

            if (!reply) {
                appendMessage(
                    "The assistant is temporarily unavailable. Please try again in a moment.",
                    "error"
                );
                return;
            }

            appendMessage(reply, "bot");
            history.push({ role: "assistant", content: reply });
            if (history.length > MAX_HISTORY) {
                history = history.slice(-MAX_HISTORY);
            }
        } catch (err) {
            console.error("AI chat request failed:", err);
            hideTypingIndicator();
            appendMessage(
                "The assistant is temporarily unavailable. Please try again in a moment.",
                "error"
            );
        } finally {
            setWaiting(false);
            input.focus();
        }
    }

    function openChat() {
        chatWindow.classList.add("show");
        toggleBtn.classList.add("hide");
        input.focus();

        // подсказки показываем только в самом начале диалога
        if (history.length === 0) {
            showQuickReplies();
        }
    }

    function closeChat() {
        chatWindow.classList.remove("show");
        toggleBtn.classList.remove("hide");
    }

    toggleBtn.addEventListener("click", openChat);

    if (closeBtn) {
        closeBtn.addEventListener("click", closeChat);
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const text = input.value.trim();
        if (!text || isWaiting) return;

        removeQuickReplies();
        input.value = "";
        sendMessage(text);
    });
});