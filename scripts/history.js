
(function () {
    const saveBtn = document.getElementById('saveBtn');
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyList = document.getElementById('historyList');
    const contextMenu = document.getElementById('contextMenu');
    const editHistoryBtn = document.getElementById('editHistoryBtn');
    const deleteHistoryBtn = document.getElementById('deleteHistoryBtn');

    let currentContextMenuId = null;
    let longPressTimer = null;
    let isLongPress = false;
    let touchStartX = 0;
    let touchStartY = 0;

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
    }

    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<div style="text-align:center; padding: 20px; color: #9ca3af;">No records</div>';
            return;
        }

        history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-item-name">${entry.name}</div>
                <div class="history-item-date">${entry.year}-${entry.month}-${entry.date} ${entry.hour} (${entry.gender === 'male' ? 'Male' : 'Female'})</div>
            `;

            // Touch Events for Long Press
            item.ontouchstart = (e) => handleTouchStart(e, entry);
            item.ontouchend = (e) => handleTouchEnd(e, entry);
            item.ontouchmove = handleTouchMove;

            // Mouse Events for testing
            item.onmousedown = (e) => {
                if (e.button === 0) { // Left click
                    longPressTimer = setTimeout(() => {
                        isLongPress = true;
                        showContextMenu(e.clientX, e.clientY, entry.id);
                    }, 600);
                }
            };
            item.onmouseup = () => {
                clearTimeout(longPressTimer);
                if (!isLongPress) jumpToEntry(entry);
                isLongPress = false;
            };

            // Prevent scroll/move during long press
            item.oncontextmenu = (e) => e.preventDefault();

            historyList.appendChild(item);
        });
    }

    function jumpToEntry(entry) {
        // Update Gender
        const genderRadio = document.querySelector(`input[name="gender"][value="${entry.gender}"]`);
        if (genderRadio) genderRadio.checked = true;

        // Update Calendar
        const calendarRadio = document.querySelector(`input[name="calendar"][value="${entry.calendar}"]`);
        if (calendarRadio) calendarRadio.checked = true;

        // Update Selects
        document.getElementById('yearSelect').value = entry.year;
        document.getElementById('monthSelect').value = entry.month;
        document.getElementById('dateSelect').value = entry.date;
        document.getElementById('hourSelect').value = entry.hour;

        // Trigger updates in main.js
        if (typeof window.updateDate === 'function') {
            window.updateDate();
        }
        if (typeof window.updateBaziTable === 'function') {
            window.updateBaziTable();
        }

        historyModal.style.display = 'none';
    }

    // --- Touch Handling ---
    function handleTouchStart(e, entry) {
        isLongPress = false;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        longPressTimer = setTimeout(() => {
            isLongPress = true;
            showContextMenu(touchStartX, touchStartY, entry.id);
        }, 600);
    }

    function handleTouchMove(e) {
        const touch = e.touches[0];
        const moveX = Math.abs(touch.clientX - touchStartX);
        const moveY = Math.abs(touch.clientY - touchStartY);

        if (moveX > 10 || moveY > 10) {
            clearTimeout(longPressTimer);
        }
    }

    function handleTouchEnd(e, entry) {
        clearTimeout(longPressTimer);
        if (!isLongPress) {
            jumpToEntry(entry);
        }
        // Small delay to prevent ghost clicks if needed
        setTimeout(() => { isLongPress = false; }, 50);
    }

    // --- Context Menu ---
    function showContextMenu(x, y, id) {
        currentContextMenuId = id;
        contextMenu.style.display = 'block';

        // Position menu
        const menuWidth = 120;
        const menuHeight = 80;
        let left = x;
        let top = y;

        if (left + menuWidth > window.innerWidth) left -= menuWidth;
        if (top + menuHeight > window.innerHeight) top -= menuHeight;

        contextMenu.style.left = left + 'px';
        contextMenu.style.top = top + 'px';
    }

    // --- Event Listeners ---
    saveBtn.onclick = saveCurrentState;
    historyBtn.onclick = () => {
        renderHistory();
        historyModal.style.display = 'block';
    };
    closeHistoryBtn.onclick = () => {
        historyModal.style.display = 'none';
    };

    window.onclick = (e) => {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    };

    editHistoryBtn.onclick = () => {
        const history = getHistory();
        const entry = history.find(h => h.id === currentContextMenuId);
        if (entry) {
            const newName = prompt("Edit:", entry.name);
            if (newName) {
                entry.name = newName;
                saveHistory(history);
                renderHistory();
            }
        }
        contextMenu.style.display = 'none';
    };

    deleteHistoryBtn.onclick = () => {
        const history = getHistory().filter(h => h.id !== currentContextMenuId);
        saveHistory(history);
        renderHistory();
        contextMenu.style.display = 'none';
    };

})();
