document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const screenQuestion = document.getElementById('screen-question');
    const screenCelebration = document.getElementById('screen-celebration');
    const screenDate = document.getElementById('screen-date');
    const screenCountdown = document.getElementById('screen-countdown');
    
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const teasingText = document.getElementById('teasing-text');
    
    const dateForm = document.getElementById('date-form');
    const datePicker = document.getElementById('date-picker');
    const timePicker = document.getElementById('time-picker');
    const messageInput = document.getElementById('message-input');
    const btnSubmitDate = document.getElementById('btn-submit-date');
    
    const confirmedDatetime = document.getElementById('confirmed-datetime');
    const btnReset = document.getElementById('btn-reset');
    
    // Countdown elements
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');

    // --- State ---
    let noAttempts = 0;
    const teasingMessages = [
        "Hey! 😭",
        "Nice try 😂",
        "Why are you chasing No? 🥺",
        "Are you sureeee? 👉👈",
        "The Yes button is right there 💕",
        "Okay, now you're just bullying me 😭😂",
        "I can do this all day ✨",
        "Just click Yes already! 💖",
        "You can't escape me 🥺",
        "Pleaseeee? 💕"
    ];
    let countdownInterval;

    // --- Initial Setup ---
    initBackgroundParticles();
    initCursorTrail();
    setMinDate();
    checkExistingDate();

    // --- Screen 1: The Question ---

    const moveNoButton = (e) => {
        if(e) e.preventDefault();
        
        noAttempts++;
        
        // Show and update teasing text
        teasingText.classList.remove('hidden');
        teasingText.textContent = teasingMessages[Math.min(noAttempts - 1, teasingMessages.length - 1)];
        
        // Increase YES button size to make it more tempting
        const currentScale = 1 + (noAttempts * 0.1);
        btnYes.style.transform = `scale(${Math.min(currentScale, 1.8)})`;
        if (noAttempts > 5) {
            btnYes.style.boxShadow = `0 0 ${Math.min(noAttempts * 5, 40)}px rgba(255, 71, 87, 0.8)`;
        }

        // Move NO button
        const btnRect = btnNo.getBoundingClientRect();
        
        if (btnNo.parentNode !== document.body) {
            document.body.appendChild(btnNo);
            btnNo.style.position = 'fixed';
            btnNo.style.zIndex = '9999';
            btnNo.style.margin = '0';
            btnNo.style.left = `${btnRect.left}px`;
            btnNo.style.top = `${btnRect.top}px`;
            
            // Allow CSS transition to apply on subsequent frames
            requestAnimationFrame(() => {
                btnNo.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        }

        const padding = 20;
        const maxX = window.innerWidth - btnRect.width - padding;
        const maxY = window.innerHeight - btnRect.height - padding;
        
        let newX, newY;
        let attempts = 0;
        do {
            newX = Math.max(padding, Math.random() * maxX);
            newY = Math.max(padding, Math.random() * maxY);
            attempts++;
        } while (attempts < 10 && isOverlappingYes(newX, newY, btnRect.width, btnRect.height));

        requestAnimationFrame(() => {
            btnNo.style.left = `${newX}px`;
            btnNo.style.top = `${newY}px`;
        });
    };

    const isOverlappingYes = (x, y, w, h) => {
        const yesRect = btnYes.getBoundingClientRect();
        // Add a buffer zone around the yes button
        const buffer = 40;
        return !(x + w < yesRect.left - buffer || 
                 x > yesRect.right + buffer || 
                 y + h < yesRect.top - buffer || 
                 y > yesRect.bottom + buffer);
    };

    // Make the No button run away on hover, touch, and focus
    btnNo.addEventListener('mouseover', moveNoButton);
    btnNo.addEventListener('touchstart', moveNoButton, {passive: false});
    btnNo.addEventListener('focus', moveNoButton); 
    btnNo.addEventListener('click', moveNoButton);

    // YES Button Clicked
    btnYes.addEventListener('click', () => {
        btnNo.style.display = 'none';
        btnNo.style.position = 'relative';
        btnNo.style.left = 'auto';
        btnNo.style.top = 'auto';
        btnNo.style.margin = '';
        btnNo.style.zIndex = '50';
        document.querySelector('.buttons-container').appendChild(btnNo);
        
        switchScreen(screenQuestion, screenCelebration);
        
        createConfetti();
        triggerHeartExplosion();
        
        // Sequence of cute messages
        setTimeout(() => document.getElementById('celeb-msg-1').classList.add('show'), 500);
        setTimeout(() => document.getElementById('celeb-msg-2').classList.add('show'), 1800);
        setTimeout(() => document.getElementById('celeb-msg-3').classList.add('show'), 3200);
        
        // Transition to date picker automatically
        setTimeout(() => {
            switchScreen(screenCelebration, screenDate);
        }, 6000);
    });

    // --- Screen 2: Date Picker ---

    function setMinDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        datePicker.min = `${year}-${month}-${day}`;
    }

    const checkFormValidity = () => {
        if (datePicker.value && timePicker.value) {
            btnSubmitDate.disabled = false;
        } else {
            btnSubmitDate.disabled = true;
        }
    };

    datePicker.addEventListener('change', checkFormValidity);
    timePicker.addEventListener('change', checkFormValidity);
    datePicker.addEventListener('input', checkFormValidity);
    timePicker.addEventListener('input', checkFormValidity);

    dateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dateStr = datePicker.value;
        const timeStr = timePicker.value;
        const messageVal = messageInput ? messageInput.value.trim() : '';
        
        if (!dateStr || !timeStr) return;

        // Cross-browser safe parsing for Safari on iOS and mobile webviews
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const targetDate = new Date(year, month - 1, day, hours, minutes);
        
        if (isNaN(targetDate.getTime())) {
            alert("Please pick a valid date and time! 💖");
            return;
        }

        // Ensure not in past
        if (targetDate < new Date()) {
            alert("Oops! You can't pick a date in the past! 🕰️");
            return;
        }
        
        try {
            localStorage.setItem('dateOfDate', targetDate.toISOString());
        } catch (err) {
            console.warn('LocalStorage save error:', err);
        }

        // Send push notification to Telegram
        sendNotification(dateStr, timeStr, messageVal);

        showCountdownScreen(targetDate);
    });

    async function sendNotification(date, time, message) {
        try {
            await fetch('/api/send-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, time, message })
            });
        } catch (err) {
            console.warn('Failed to send Telegram notification:', err);
        }
    }

    // --- Screen 3: Countdown ---

    function checkExistingDate() {
        try {
            const savedDate = localStorage.getItem('dateOfDate');
            if (savedDate) {
                const targetDate = new Date(savedDate);
                if (!isNaN(targetDate.getTime()) && targetDate > new Date()) {
                    screenQuestion.classList.replace('active', 'hidden');
                    screenQuestion.setAttribute('aria-hidden', 'true');
                    showCountdownScreen(targetDate, true);
                } else {
                    localStorage.removeItem('dateOfDate');
                }
            }
        } catch (err) {
            console.warn('LocalStorage read error:', err);
        }
    }

    function showCountdownScreen(targetDate, instant = false) {
        const activeCard = document.querySelector('.card.active') || screenDate;
        if (!instant) {
            switchScreen(activeCard, screenCountdown);
        } else {
            activeCard.classList.remove('active');
            activeCard.classList.add('hidden');
            activeCard.setAttribute('aria-hidden', 'true');
            activeCard.style.opacity = '';
            
            screenCountdown.classList.remove('hidden');
            screenCountdown.classList.add('active');
            screenCountdown.removeAttribute('aria-hidden');
            screenCountdown.style.opacity = '';
        }
        
        // Format: "Saturday, August 15 at 6:30 PM"
        const options = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' };
        try {
            confirmedDatetime.textContent = targetDate.toLocaleDateString('en-US', options);
        } catch (err) {
            confirmedDatetime.textContent = targetDate.toLocaleString();
        }
        
        startCountdown(targetDate);
    }

    function startCountdown(targetDate) {
        if (countdownInterval) clearInterval(countdownInterval);

        const elDays = cdDays || document.getElementById('cd-days');
        const elHours = cdHours || document.getElementById('cd-hours');
        const elMins = cdMins || document.getElementById('cd-mins');
        const elSecs = cdSecs || document.getElementById('cd-secs');
        
        const updateCD = () => {
            const now = new Date();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                clearInterval(countdownInterval);
                if (elDays) elDays.textContent = '00';
                if (elHours) elHours.textContent = '00';
                if (elMins) elMins.textContent = '00';
                if (elSecs) elSecs.textContent = '00';
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            
            if (elDays) elDays.textContent = String(days).padStart(2, '0');
            if (elHours) elHours.textContent = String(hours).padStart(2, '0');
            if (elMins) elMins.textContent = String(mins).padStart(2, '0');
            if (elSecs) elSecs.textContent = String(secs).padStart(2, '0');
        };
        
        updateCD();
        countdownInterval = setInterval(updateCD, 1000);
    }

    btnReset.addEventListener('click', () => {
        try {
            localStorage.removeItem('dateOfDate');
        } catch (e) {}
        clearInterval(countdownInterval);
        
        // Reset everything
        noAttempts = 0;
        teasingText.classList.add('hidden');
        btnYes.style.transform = 'scale(1)';
        btnYes.style.boxShadow = '';
        btnNo.style.display = '';
        btnNo.style.position = 'relative';
        btnNo.style.left = 'auto';
        btnNo.style.top = 'auto';
        btnNo.style.margin = '';
        btnNo.style.zIndex = '50';
        document.querySelector('.buttons-container').appendChild(btnNo);
        
        dateForm.reset();
        btnSubmitDate.disabled = true;
        
        // Hide celebration messages
        document.querySelectorAll('.hidden-msg').forEach(el => el.classList.remove('show'));
        
        switchScreen(screenCountdown, screenQuestion);
    });

    // --- Utilities & Effects ---

    function switchScreen(oldScreen, newScreen) {
        if (!oldScreen || !newScreen || oldScreen === newScreen) return;

        oldScreen.style.opacity = '0';
        
        setTimeout(() => {
            oldScreen.classList.remove('active');
            oldScreen.classList.add('hidden');
            oldScreen.setAttribute('aria-hidden', 'true');
            oldScreen.style.opacity = '';
            
            newScreen.style.opacity = '0';
            newScreen.classList.remove('hidden');
            newScreen.setAttribute('aria-hidden', 'false');
            
            // Force reflow
            void newScreen.offsetWidth;
            
            newScreen.classList.add('active');
            newScreen.style.opacity = '';
        }, 300);
    }

    function initBackgroundParticles() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        
        const container = document.getElementById('background-particles');
        const icons = ['💗', '✨', '💕', '💖', '🌸'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => createParticle(container, icons), Math.random() * 5000);
        }
        
        setInterval(() => {
            if (document.visibilityState === 'visible' && container.children.length < 30) {
                createParticle(container, icons);
            }
        }, 1500);
    }

    function createParticle(container, icons) {
        const el = document.createElement('div');
        el.className = 'floating-particle';
        el.textContent = icons[Math.floor(Math.random() * icons.length)];
        el.style.left = `${Math.random() * 100}%`;
        el.style.fontSize = `${Math.random() * 15 + 10}px`;
        el.style.animationDuration = `${Math.random() * 10 + 15}s`;
        
        container.appendChild(el);
        
        setTimeout(() => {
            if (el.parentNode === container) el.remove();
        }, 25000);
    }

    function initCursorTrail() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || isTouchDevice()) return;
        
        const container = document.getElementById('cursor-trail');
        let lastTime = 0;
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastTime < 40) return; // limit trail density
            lastTime = now;
            
            const trail = document.createElement('div');
            trail.className = 'trail-particle';
            trail.textContent = '✨';
            trail.style.left = `${e.clientX - 10}px`;
            trail.style.top = `${e.clientY - 10}px`;
            
            container.appendChild(trail);
            
            setTimeout(() => trail.remove(), 1000);
        });

        document.addEventListener('click', (e) => {
            for(let i = 0; i < 6; i++) {
                const burst = document.createElement('div');
                burst.className = 'trail-particle';
                burst.textContent = ['💖', '✨'][Math.floor(Math.random() * 2)];
                burst.style.left = `${e.clientX - 10}px`;
                burst.style.top = `${e.clientY - 10}px`;
                burst.style.position = 'fixed';
                
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 40 + 20;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                burst.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
                burst.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
                
                container.appendChild(burst);
                
                requestAnimationFrame(() => {
                    burst.style.transform = `translate(${tx}px, ${ty}px) scale(1.5)`;
                    burst.style.opacity = '0';
                });
                
                setTimeout(() => burst.remove(), 500);
            }
        });
    }

    function createConfetti() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        
        const colors = ['#ffb7b2', '#ff9a9e', '#f8c291', '#fff', '#e2f0cb', '#ff8b94'];
        
        for (let i = 0; i < 120; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = `${Math.random() * 100}%`;
            conf.style.background = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDuration = `${Math.random() * 3 + 2}s`;
            conf.style.animationDelay = `${Math.random() * 1.5}s`;
            document.body.appendChild(conf);
            
            setTimeout(() => conf.remove(), 6000);
        }
    }

    function triggerHeartExplosion() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        
        for(let i = 0; i < 40; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'trail-particle';
                el.textContent = ['💖', '💕', '✨', '💗'][Math.floor(Math.random() * 4)];
                el.style.fontSize = `${Math.random() * 25 + 15}px`;
                el.style.position = 'fixed';
                el.style.left = '50%';
                el.style.top = '50%';
                el.style.zIndex = '1000';
                
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 15 + 5;
                const tx = Math.cos(angle) * velocity * 20;
                const ty = Math.sin(angle) * velocity * 20;
                
                el.style.transition = 'all 1.2s cubic-bezier(0.1, 0.8, 0.3, 1)';
                document.body.appendChild(el);
                
                requestAnimationFrame(() => {
                    el.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(0)`;
                    el.style.opacity = '0';
                });
                
                setTimeout(() => el.remove(), 1200);
            }, i * 40);
        }
    }

    // Interactive Card tilt on desktop
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches || isTouchDevice()) return;
        
        const activeCard = document.querySelector('.card.active');
        if (!activeCard) return;
        
        // Gentle tilt effect based on mouse position relative to the center
        const xAxis = (window.innerWidth / 2 - e.clientX) / 60;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 60;
        
        activeCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
    
    // Reset tilt
    document.addEventListener('mouseleave', () => {
        const activeCard = document.querySelector('.card.active');
        if (activeCard) {
            activeCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
        }
    });

    function isTouchDevice() {
        return (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));
    }
});
