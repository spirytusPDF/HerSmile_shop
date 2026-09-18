document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("aiChatToggle");
    const chatWindow = document.getElementById("aiChatWindow");
    const closeBtn = document.getElementById("aiChatClose");
    const messagesEl = document.getElementById("aiChatMessages");
    const form = document.getElementById("aiChatForm");
    const input = document.getElementById("aiChatInput");
    const sendBtn = document.getElementById("aiChatSendBtn");

    if (!toggleBtn || !chatWindow || !form || !input || !messagesEl) return;

    // Ассистент подсказывает про духи (как и было задумано изначально)
    const QUICK_QUESTIONS = [
        "Recommend a perfume for everyday wear",
        "Something floral and light for spring",
        "A bold fragrance for an evening out",
        "What's a good perfume gift for someone?"
    ];

    const MOOD_KEYWORDS = {
        everyday: ["everyday", "daily", "work", "office", "casual", "light", "subtle"],
        floral: ["floral", "flower", "flowers", "rose", "jasmine", "spring", "fresh"],
        bold: ["bold", "strong", "evening", "night", "party", "intense", "sexy", "date"],
        gift: ["gift", "present", "someone", "her", "girlfriend", "wife", "mom", "birthday"],
        sweet: ["sweet", "vanilla", "gourmand", "warm", "cozy"],
        woody: ["woody", "wood", "musk", "earthy", "deep"],
        summer: ["summer", "citrus", "fruity", "beach", "hot"],
        winter: ["winter", "cold", "amber", "spice", "spicy"]
    };

    const OPENERS = [
        "Great choice of mood!",
        "I love that direction.",
        "Here's something I think you'll like.",
        "Let me point you to a favorite of ours.",
        "That's a lovely ask —"
    ];

    const CLOSERS = [
        "You can find it by typing its name into the search bar above! ✨",
        "Just search for it by name at the top of the page to see more details. 🌸",
        "Type the name into our search bar to check it out. 💫"
    ];

    const MAX_HISTORY = 12;
    let history = [];
    let isWaiting = false;
    let quickRepliesEl = null;
    let perfumesCache = null;
    let lastRecommendedId = null;

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

    async function getPerfumes() {
        if (perfumesCache && perfumesCache.length) return perfumesCache;
        const response = await fetch("/api/products?category=perfume");
        if (!response.ok) throw new Error("Failed to load perfumes");
        const data = await response.json();
        perfumesCache = Array.isArray(data) ? data : [];
        return perfumesCache;
    }

    function detectMoods(text) {
        const found = new Set();
        Object.keys(MOOD_KEYWORDS).forEach(mood => {
            MOOD_KEYWORDS[mood].forEach(kw => {
                if (text.includes(kw)) found.add(mood);
            });
        });
        return found;
    }

    function scoreProduct(product, words, moods) {
        const haystack = [product.name, product.brand, product.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        let score = 0;
        words.forEach(w => {
            if (w.length > 2 && haystack.includes(w)) score += 2;
        });
        moods.forEach(mood => {
            MOOD_KEYWORDS[mood].forEach(kw => {
                if (haystack.includes(kw)) score += 1;
            });
        });
        return score;
    }

    function pickPerfume(perfumes, message) {
        const text = message.toLowerCase();
        const words = text.split(/[^a-zа-яіїєё0-9]+/i).filter(Boolean);
        const moods = detectMoods(text);

        let ranked = perfumes
            .map(p => ({ product: p, score: scoreProduct(p, words, moods) }))
            .sort((a, b) => b.score - a.score);

        // стараемся не рекомендовать один и тот же товар два раза подряд
        if (ranked.length > 1 && ranked[0].product.id === lastRecommendedId) {
            ranked = ranked.slice(1).concat(ranked[0]);
        }

        const top = ranked[0];
        const chosen = (top && top.score > 0)
            ? top.product
            : perfumes[Math.floor(Math.random() * perfumes.length)];

        lastRecommendedId = chosen.id;
        return chosen;
    }

    function firstSentence(text) {
        if (!text) return "";
        const trimmed = text.trim();
        const idx = trimmed.indexOf(".");
        return (idx > 0 && idx < 160)
            ? trimmed.slice(0, idx + 1)
            : trimmed.slice(0, 140).trim() + "…";
    }

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function composeReply(product) {
        const opener = pick(OPENERS);
        const closer = pick(CLOSERS);
        const snippet = firstSentence(product.description);
        return `${opener} I'd recommend "${product.name}" by ${product.brand} — $${product.price}. ${snippet} ${closer}`;
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
            const perfumes = await getPerfumes();

            // небольшая пауза, чтобы typing-indicator выглядел естественно
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

            hideTypingIndicator();

            if (!perfumes.length) {
                appendMessage(
                    "The assistant is temporarily unavailable. Please try again in a moment.",
                    "error"
                );
                return;
            }

            const product = pickPerfume(perfumes, text);
            const reply = composeReply(product);

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