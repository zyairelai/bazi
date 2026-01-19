
(function () {
    const saveBtn = document.getElementById('saveBtn');
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyList = document.getElementById('historyList');

    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoveX = 0;
    let touchMoveY = 0;
    let currentSwipeItem = null;
    const MAX_SWIPE = 120; // Width of two buttons (60px each)
    const TAP_THRESHOLD = 8; // Pixels of movement allowed for a tap

    // --- PWA Mode Check ---
    function checkStandalone() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) {
            document.body.classList.add('is-standalone');
        }
    }
    checkStandalone();

    // --- History Logic ---
    function getHistory() {
        const data = localStorage.getItem('bazi_history');
        return data ? JSON.parse(data) : [];
    }

    function saveHistory(history) {
        localStorage.setItem('bazi_history', JSON.stringify(history));
    }

    function saveCurrentState() {
        const name = prompt("Enter Name：");
        if (!name) return;

        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        const date = document.getElementById('dateSelect').value;
        const hour = document.getElementById('hourSelect').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const calendar = document.querySelector('input[name="calendar"]:checked').value;

        const entry = {
            id: Date.now(),
            name,
            year,
            month,
            date,
            hour,
            gender,
            calendar,
            timestamp: new Date().toLocaleString()
        };

        const history = getHistory();
        history.unshift(entry);
        saveHistory(history);
        alert("Saved successfully!");

        // Enforce "original current DaYun" view after saving
        if (typeof window.resetSelectedDayun === 'function') {
            window.resetSelectedDayun();
        }
        if (typeof window.updateBaziTable === 'function') {
            window.updateBaziTable();
        }
    }

    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<div style="text-align:center; padding: 20px; color: #9ca3af;">No records</div>';
            return;
        }

        history.forEach(entry => {
            const wrapper = document.createElement('div');
            wrapper.className = 'history-item-wrapper';

            wrapper.innerHTML = `
                <div class="swipe-actions">
                    <button class="action-btn edit-action" data-id="${entry.id}">🖋️</button>
                    <button class="action-btn delete-action" data-id="${entry.id}">🗑️</button>
                </div>
                <div class="history-item" data-id="${entry.id}">
                    <div class="history-item-name">${entry.name}</div>
                    <div class="history-item-date">${entry.year}-${entry.month}-${entry.date} ${entry.hour} (${entry.gender === 'male' ? 'Male' : 'Female'})</div>
                </div>
            `;

            const item = wrapper.querySelector('.history-item');
            const editBtn = wrapper.querySelector('.edit-action');
            const deleteBtn = wrapper.querySelector('.delete-action');

            // Swipe Handlers
            item.addEventListener('touchstart', (e) => {
                handleTouchStart(e, item);
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                handleTouchMove(e, item);
            }, { passive: false });

            item.addEventListener('touchend', (e) => {
                handleTouchEnd(e, item, entry);
            });

            // Mouse Click for Desktop (Non-touch devices)
            item.addEventListener('click', (e) => {
                // Only handle click if it wasn't a touch event (which we'll handle in touchend)
                // Or if handleTouchEnd didn't preventDefault
                if (e.defaultPrevented) return;

                const offset = getXOffset(item);
                if (offset === 0) {
                    jumpToEntry(entry);
                } else {
                    closeAllSwipes();
                }
            });

            // Action Handlers
            editBtn.onclick = (e) => {
                e.stopPropagation();
                editEntry(entry.id);
            };
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteEntry(entry.id);
            };

            historyList.appendChild(wrapper);
        });
    }

    function getXOffset(el) {
        const transform = window.getComputedStyle(el).transform;
        if (transform === 'none') return 0;
        const matrix = transform.match(/matrix.*\((.+)\)/);
        return matrix ? parseFloat(matrix[1].split(', ')[4]) : 0;
    }

    function closeAllSwipes() {
        document.querySelectorAll('.history-item').forEach(item => {
            item.style.transform = 'translateX(0px)';
        });
        currentSwipeItem = null;
    }

    function handleTouchStart(e, item) {
        if (currentSwipeItem && currentSwipeItem !== item) {
            closeAllSwipes();
        }
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoveX = 0;
        touchMoveY = 0;
        item.style.transition = 'none';
        currentSwipeItem = item;
    }

    function handleTouchMove(e, item) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        touchMoveX = touchX - touchStartX;
        touchMoveY = touchY - touchStartY;

        // Only allow swiping left
        let offset = Math.min(0, Math.max(-MAX_SWIPE, touchMoveX));

        // Visual feedback
        item.style.transform = `translateX(${offset}px)`;

        // Prevent page scroll only if swiping horizontally more than vertically
        if (Math.abs(touchMoveX) > 10 && Math.abs(touchMoveX) > Math.abs(touchMoveY)) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e, item, entry) {
        item.style.transition = 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
        const currentOffset = Math.abs(getXOffset(item));

        if (currentOffset > MAX_SWIPE / 2) {
            item.style.transform = `translateX(-${MAX_SWIPE}px)`;
        } else {
            item.style.transform = 'translateX(0px)';

            // Calculate total distance moved
            const moveDist = Math.sqrt(touchMoveX * touchMoveX + touchMoveY * touchMoveY);

            // If it was a clean tap (minimal movement), trigger jump and PREVENT ghost click
            if (moveDist < TAP_THRESHOLD) {
                e.preventDefault();
                jumpToEntry(entry);
            }
            currentSwipeItem = null;
        }
    }

    // --- Modal Animations & State ---
    function showHistory() {
        renderHistory();
        historyModal.style.display = 'block';
        const content = historyModal.querySelector('.modal-content');
        content.classList.remove('slide-down');
        content.classList.add('slide-up');

        // Add to history so back button can close it
        if (window.history.state !== 'history-open') {
            window.history.pushState('history-open', '');
        }
    }

    function hideHistory(isFromPopState = false) {
        const content = historyModal.querySelector('.modal-content');
        content.classList.remove('slide-up');
        content.classList.add('slide-down');

        const onAnimationEnd = () => {
            content.removeEventListener('animationend', onAnimationEnd);
            if (content.classList.contains('slide-down')) {
                historyModal.style.display = 'none';
                content.classList.remove('slide-down');
            }
        };
        content.addEventListener('animationend', onAnimationEnd);

        // If closed via button/overlay, we need to pop the state
        if (!isFromPopState && window.history.state === 'history-open') {
            window.history.back();
        }
    }

    window.addEventListener('popstate', (event) => {
        if (historyModal.style.display === 'block') {
            hideHistory(true);
        }
    });

    function jumpToEntry(entry) {
        // Always reset DaYun selection to "current" when jumping from history
        if (typeof window.resetSelectedDayun === 'function') {
            window.resetSelectedDayun();
        }

        const genderRadio = document.querySelector(`input[name="gender"][value="${entry.gender}"]`);
        if (genderRadio) genderRadio.checked = true;

        const calendarRadio = document.querySelector(`input[name="calendar"][value="${entry.calendar}"]`);
        if (calendarRadio) calendarRadio.checked = true;

        document.getElementById('yearSelect').value = entry.year;
        document.getElementById('monthSelect').value = entry.month;
        document.getElementById('dateSelect').value = entry.date;
        document.getElementById('hourSelect').value = entry.hour;

        if (typeof window.updateDate === 'function') window.updateDate();
        if (typeof window.updateBaziTable === 'function') window.updateBaziTable();

        hideHistory();
    }

    function editEntry(id) {
        const history = getHistory();
        const entry = history.find(h => h.id === id);
        if (entry) {
            const newName = prompt("Edit:", entry.name);
            if (newName) {
                entry.name = newName;
                saveHistory(history);
                renderHistory();
            }
        }
    }

    function deleteEntry(id) {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        const history = getHistory().filter(h => h.id !== id);
        saveHistory(history);
        renderHistory();
    }

    // --- Event Listeners ---
    saveBtn.onclick = saveCurrentState;
    historyBtn.onclick = showHistory;
    closeHistoryBtn.onclick = () => hideHistory();

    window.onclick = (e) => {
        if (e.target === historyModal) {
            hideHistory();
        }
    };

})();
