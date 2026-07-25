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

    // --- Screen 2: Cute Date & Time Selector ---

    const datePills = document.querySelectorAll('.date-pill');
    const timePills = document.querySelectorAll('.time-pill');
    const customDateContainer = document.getElementById('custom-date-container');
    const customTimeContainer = document.getElementById('custom-time-container');

    const selectMonth = document.getElementById('select-month');
    const selectDay = document.getElementById('select-day');
    const selectYear = document.getElementById('select-year');

    const selectHour = document.getElementById('select-hour');
    const selectMinute = document.getElementById('select-minute');
    const selectAmpm = document.getElementById('select-ampm');

    initCustomDropdowns();

    // Date Pill Selection
    datePills.forEach(pill => {
        pill.addEventListener('click', () => {
            datePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            if (pill.dataset.dateType === 'custom') {
                if (customDateContainer) customDateContainer.classList.remove('hidden');
            } else {
                if (customDateContainer) customDateContainer.classList.add('hidden');
            }
        });
    });

    // Time Pill Selection
    timePills.forEach(pill => {
        pill.addEventListener('click', () => {
            timePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            if (pill.dataset.time === 'custom') {
                if (customTimeContainer) customTimeContainer.classList.remove('hidden');
            } else {
                if (customTimeContainer) customTimeContainer.classList.add('hidden');
            }
        });
    });

    function initCustomDropdowns() {
        if (!selectMonth || !selectDay || !selectYear) return;

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        selectMonth.innerHTML = '';
        months.forEach((m, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = m;
            if (idx === tomorrow.getMonth()) opt.selected = true;
            selectMonth.appendChild(opt);
        });

        selectYear.innerHTML = '';
        const currentYear = now.getFullYear();
        for (let y = currentYear; y <= currentYear + 2; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === tomorrow.getFullYear()) opt.selected = true;
            selectYear.appendChild(opt);
        }

        updateDays();
        populateHours();

        selectMonth.addEventListener('change', updateDays);
        selectYear.addEventListener('change', updateDays);
    }

    function updateDays() {
        if (!selectMonth || !selectDay || !selectYear) return;
        const year = parseInt(selectYear.value, 10);
        const month = parseInt(selectMonth.value, 10);

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const selectedDay = parseInt(selectDay.value, 10) || (new Date().getDate() + 1);

        selectDay.innerHTML = '';
        for (let d = 1; d <= daysInMonth; d++) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            if (d === Math.min(selectedDay, daysInMonth)) opt.selected = true;
            selectDay.appendChild(opt);
        }
    }

    function populateHours() {
        if (!selectHour) return;
        selectHour.innerHTML = '';
        for (let h = 1; h <= 12; h++) {
            const opt = document.createElement('option');
            opt.value = h;
            opt.textContent = h;
            if (h === 7) opt.selected = true;
            selectHour.appendChild(opt);
        }
    }

    function getSelectedTargetDate() {
        const activeDatePill = document.querySelector('.date-pill.active');
        const activeTimePill = document.querySelector('.time-pill.active');

        const dateType = activeDatePill ? activeDatePill.dataset.dateType : 'tomorrow';
        const timeType = activeTimePill ? activeTimePill.dataset.time : '18:00';

        const now = new Date();
        let targetYear = now.getFullYear();
        let targetMonth = now.getMonth();
        let targetDay = now.getDate();

        if (dateType === 'tomorrow') {
            const t = new Date(now);
            t.setDate(now.getDate() + 1);
            targetYear = t.getFullYear();
            targetMonth = t.getMonth();
            targetDay = t.getDate();
        } else if (dateType === 'saturday') {
            const t = new Date(now);
            let dayOfWeek = t.getDay();
            let distance = (6 - dayOfWeek + 7) % 7;
            if (distance === 0) distance = 7;
            t.setDate(now.getDate() + distance);
            targetYear = t.getFullYear();
            targetMonth = t.getMonth();
            targetDay = t.getDate();
        } else if (dateType === 'sunday') {
            const t = new Date(now);
            let dayOfWeek = t.getDay();
            let distance = (0 - dayOfWeek + 7) % 7;
            if (distance === 0) distance = 7;
            t.setDate(now.getDate() + distance);
            targetYear = t.getFullYear();
            targetMonth = t.getMonth();
            targetDay = t.getDate();
        } else if (dateType === 'next-weekend') {
            const t = new Date(now);
            let dayOfWeek = t.getDay();
            let distance = (6 - dayOfWeek + 7) % 7 + 7;
            t.setDate(now.getDate() + distance);
            targetYear = t.getFullYear();
            targetMonth = t.getMonth();
            targetDay = t.getDate();
        } else if (dateType === 'custom') {
            targetYear = parseInt(selectYear.value, 10);
            targetMonth = parseInt(selectMonth.value, 10);
            targetDay = parseInt(selectDay.value, 10);
        }

        let hours = 18;
        let minutes = 0;

        if (timeType === 'custom') {
            let h = parseInt(selectHour.value, 10);
            const m = parseInt(selectMinute.value, 10);
            const ampm = selectAmpm.value;

            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            hours = h;
            minutes = m;
        } else {
            const [h, m] = timeType.split(':').map(Number);
            hours = h;
            minutes = m;
        }

        return new Date(targetYear, targetMonth, targetDay, hours, minutes);
    }

    dateForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const targetDate = getSelectedTargetDate();

        if (isNaN(targetDate.getTime())) {
            alert("Please pick a valid date and time! 💖");
            return;
        }

        if (targetDate <= new Date()) {
            alert("Oops! You can't pick a date in the past! 🕰️");
            return;
        }

        const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`;
        const messageVal = messageInput ? messageInput.value.trim() : '';

        try {
            localStorage.setItem('dateOfDate', targetDate.toISOString());
        } catch (err) {
            console.warn('LocalStorage save error:', err);
        }

        sendNotification(dateStr, timeStr, messageVal);
        showCountdownScreen(targetDate);
    });

    async function sendNotification(date, time, message) {
        const botToken = '8858077913:AAHAFRiI0Q-2ioID7nFqZPLRox-HwPI9r3Q';
        const chatId = '2021386080';

        // 1. Try serverless API endpoint first
        try {
            const res = await fetch('/api/send-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, time, message })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) return;
            }
        } catch (err) {
            console.warn('Backend route unavailable, falling back to direct Telegram API call:', err);
        }

        // 2. Direct Telegram API call fallback for static hosting like GitHub Pages
        try {
            const formattedText = `💖 *NEW DATE CONFIRMED!* 💖\n\n📅 *Date:* ${date || 'N/A'}\n⏰ *Time:* ${time || 'N/A'}\n💌 *Message:* ${message || 'No message left'}`;
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: formattedText,
                    parse_mode: 'Markdown'
                })
            });
        } catch (err) {
            console.warn('Direct Telegram API send failed:', err);
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
            activeCard.style.transform = '';
            
            screenCountdown.classList.remove('hidden');
            screenCountdown.classList.add('active');
            screenCountdown.removeAttribute('aria-hidden');
            screenCountdown.style.opacity = '';
            screenCountdown.style.transform = '';
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
        
        // Reset pills to defaults
        document.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.time-pill').forEach(p => p.classList.remove('active'));
        const firstDatePill = document.querySelector('.date-pill[data-date-type="tomorrow"]');
        const firstTimePill = document.querySelector('.time-pill[data-time="18:00"]');
        if (firstDatePill) firstDatePill.classList.add('active');
        if (firstTimePill) firstTimePill.classList.add('active');
        const customDateContainer = document.getElementById('custom-date-container');
        const customTimeContainer = document.getElementById('custom-time-container');
        if (customDateContainer) customDateContainer.classList.add('hidden');
        if (customTimeContainer) customTimeContainer.classList.add('hidden');
        
        // Hide celebration messages
        document.querySelectorAll('.hidden-msg').forEach(el => el.classList.remove('show'));
        
        switchScreen(screenCountdown, screenQuestion);
    });

    // --- Utilities & Effects ---

    function switchScreen(oldScreen, newScreen) {
        if (!oldScreen || !newScreen || oldScreen === newScreen) return;

        oldScreen.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        oldScreen.style.opacity = '0';
        oldScreen.style.transform = 'scale(0.95)';
        oldScreen.style.pointerEvents = 'none';

        setTimeout(() => {
            oldScreen.classList.remove('active');
            oldScreen.classList.add('hidden');
            oldScreen.style.opacity = '';
            oldScreen.style.transform = '';
            oldScreen.style.pointerEvents = '';
            oldScreen.setAttribute('aria-hidden', 'true');

            newScreen.style.transition = 'none';
            newScreen.style.opacity = '0';
            newScreen.style.transform = 'scale(0.95)';
            newScreen.classList.remove('hidden');
            newScreen.setAttribute('aria-hidden', 'false');

            // Force reflow
            void newScreen.offsetWidth;

            newScreen.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            newScreen.classList.add('active');
            newScreen.style.opacity = '1';
            newScreen.style.transform = 'scale(1)';
            newScreen.style.pointerEvents = 'auto';

            setTimeout(() => {
                newScreen.style.transition = '';
                newScreen.style.opacity = '';
                newScreen.style.transform = '';
                newScreen.style.pointerEvents = '';
            }, 350);
        }, 250);
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
        if (window.innerWidth < 768 || 
            window.matchMedia("(prefers-reduced-motion: reduce)").matches || 
            !window.matchMedia("(hover: hover) and (pointer: fine)").matches || 
            isTouchDevice()) return;
        
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
