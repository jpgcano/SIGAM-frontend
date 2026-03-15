// Calendar page (POO).
(function () {
  const BasePage = window.SIGAM_UI && window.SIGAM_UI.BasePage;

  class CalendarPage extends BasePage {
    constructor() {
      super(document);
      this.currentDate = new Date();
      this.viewMode = 'month';
      this.editIndex = null;

      this.api = window.SIGAM_API;
      this.maintenances = [];
      this.assetsList = [];
      this.usingApi = false;

      this.scheduleStatus = this.qs('#scheduleStatus');
      this.scheduleForm = this.qs('#scheduleForm');
      this.calendarEl = this.qs('#calendar');
      this.monthLabel = this.qs('#monthLabel');

      this.scheduledEl = this.qs('#scheduledCount');
      this.overdueEl = this.qs('#overdueCount');
      this.assetsEl = this.qs('#assetsCount');
    }

    init() {
      this.bindEvents();
      this.refreshMaintenances();
      this.loadAssets();
    }

    bindEvents() {
      if (this.scheduleForm) {
        this.scheduleForm.addEventListener('submit', (e) => this.handleScheduleSubmit(e));
      }

      this.qs('#prevPeriodBtn')?.addEventListener('click', () => this.prevPeriod());
      this.qs('#nextPeriodBtn')?.addEventListener('click', () => this.nextPeriod());
      this.qs('#goTodayBtn')?.addEventListener('click', () => this.goToday());
      this.qs('#viewWeekBtn')?.addEventListener('click', () => this.setViewMode('week'));
      this.qs('#viewMonthBtn')?.addEventListener('click', () => this.setViewMode('month'));

      this.qs('#deleteMaintenanceBtn')?.addEventListener('click', () => this.deleteMaintenance());
      this.qs('#editMaintenanceBtn')?.addEventListener('click', () => this.editMaintenance());

      this.calendarEl?.addEventListener('click', (e) => {
        const eventEl = e.target.closest('.event');
        if (eventEl && eventEl.dataset.index) {
          this.showMaintenance(Number.parseInt(eventEl.dataset.index, 10));
        }
      });
    }

    setScheduleStatus(message, type) {
      if (!this.scheduleStatus) return;
      this.scheduleStatus.textContent = message || '';
      this.scheduleStatus.className = 'me-auto small';
      if (type === 'error') {
        this.scheduleStatus.classList.add('text-danger');
      } else if (type === 'success') {
        this.scheduleStatus.classList.add('text-success');
      } else {
        this.scheduleStatus.classList.add('text-muted');
      }
    }

    loadMaintenances() {
      return this.maintenances;
    }

    saveMaintenances(list) {
      this.maintenances = Array.isArray(list) ? list : [];
      localStorage.setItem('maintenances', JSON.stringify(this.maintenances));
    }

    normalizeMaintenance(raw) {
      return {
        id: raw.id || raw.id_mantenimiento || raw.id_mantenimiento_orden || '',
        ticketId: raw.id_ticket || raw.ticketId || '',
        technicianId: raw.id_usuario_tecnico || raw.technicianId || '',
        asset: raw.asset || raw.activo || raw.assetName || '',
        type: raw.tipo || raw.type || 'preventive',
        date: raw.fecha_inicio || raw.date || '',
        notes: raw.diagnostico || raw.notes || ''
      };
    }

    async refreshMaintenances() {
      if (this.api && this.api.getMantenimientos) {
        try {
          const data = await this.api.getMantenimientos({ limit: 50, offset: 0 });
          this.usingApi = true;
          this.saveMaintenances((data || []).map((item) => this.normalizeMaintenance(item)));
          this.setScheduleStatus('Maintenance loaded from the API.', 'success');
          this.renderCalendar();
          return;
        } catch (error) {
          this.setScheduleStatus('Could not load maintenance from the API.', 'error');
        }
      }
      this.usingApi = false;
      const cached = JSON.parse(localStorage.getItem('maintenances')) || [];
      this.saveMaintenances(cached.map((item) => this.normalizeMaintenance(item)));
      this.renderCalendar();
    }

    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    getStartOfWeek(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      return d;
    }

    updateViewButtons() {
      const weekBtn = this.qs('#viewWeekBtn');
      const monthBtn = this.qs('#viewMonthBtn');
      if (!weekBtn || !monthBtn) return;
      if (this.viewMode === 'week') {
        weekBtn.classList.add('active');
        monthBtn.classList.remove('active');
      } else {
        monthBtn.classList.add('active');
        weekBtn.classList.remove('active');
      }
    }

    renderCalendar() {
      if (!this.calendarEl) return;
      this.calendarEl.innerHTML = '';

      const maintenances = this.loadMaintenances();
      const todayStr = this.formatDate(new Date());
      this.updateStats(maintenances);

      if (this.viewMode === 'week') {
        this.renderWeek(this.calendarEl, maintenances, todayStr);
      } else {
        this.renderMonth(this.calendarEl, maintenances, todayStr);
      }

      this.wireDragAndDrop();
      this.updateViewButtons();
    }

    renderMonth(calendar, maintenances, todayStr) {
      calendar.classList.remove('week');
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      const monthName = this.currentDate.toLocaleString('default', { month: 'long' });
      if (this.monthLabel) {
        this.monthLabel.innerText = `${monthName} ${year}`;
      }

      for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += '<div class="day-placeholder"></div>';
      }

      for (let d = 1; d <= totalDays; d++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const eventsHTML = this.buildEventsHTML(maintenances, fullDate);
        const isToday = fullDate === todayStr ? ' today' : '';
        calendar.innerHTML += `
      <div class="day${isToday}" data-date="${fullDate}">
        <div class="day-number">${d}</div>
        ${eventsHTML}
      </div>
    `;
      }
    }

    renderWeek(calendar, maintenances, todayStr) {
      calendar.classList.add('week');
      const start = this.getStartOfWeek(this.currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      const startLabel = start.toLocaleString('default', { month: 'short', day: 'numeric' });
      const endLabel = end.toLocaleString('default', { month: 'short', day: 'numeric' });
      const label =
        start.getFullYear() === end.getFullYear()
          ? `${startLabel} - ${endLabel}, ${end.getFullYear()}`
          : `${startLabel}, ${start.getFullYear()} - ${endLabel}, ${end.getFullYear()}`;

      if (this.monthLabel) {
        this.monthLabel.innerText = label;
      }

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + i);
        const fullDate = this.formatDate(dayDate);
        const dayNumber = dayDate.getDate();
        const eventsHTML = this.buildEventsHTML(maintenances, fullDate);

        const isToday = fullDate === todayStr ? ' today' : '';
        calendar.innerHTML += `
      <div class="day${isToday}" data-date="${fullDate}">
        <div class="day-number">${dayNumber}</div>
        ${eventsHTML}
      </div>
    `;
      }
    }

    buildEventsHTML(maintenances, fullDate) {
      let eventsHTML = '';
      maintenances.forEach((m, index) => {
        if (m.date !== fullDate) return;
        eventsHTML += `
      <div
        class="event ${m.type}"
        draggable="true"
        data-index="${index}"
        data-date="${fullDate}"
      >
        ${m.asset}
      </div>
    `;
      });
      return eventsHTML;
    }

    wireDragAndDrop() {
      const events = document.querySelectorAll(".event[draggable='true']");
      events.forEach((eventEl) => {
        eventEl.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', eventEl.dataset.index);
          e.dataTransfer.effectAllowed = 'move';
          eventEl.classList.add('dragging');
        });
        eventEl.addEventListener('dragend', () => {
          eventEl.classList.remove('dragging');
        });
      });

      const days = document.querySelectorAll('.day[data-date]');
      days.forEach((dayEl) => {
        dayEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          dayEl.classList.add('drag-over');
        });
        dayEl.addEventListener('dragleave', () => {
          dayEl.classList.remove('drag-over');
        });
        dayEl.addEventListener('drop', (e) => {
          e.preventDefault();
          dayEl.classList.remove('drag-over');
          const index = Number.parseInt(e.dataTransfer.getData('text/plain'), 10);
          if (Number.isNaN(index)) return;
          const list = this.loadMaintenances();
          if (!list[index]) return;
          list[index].date = dayEl.dataset.date;
          this.saveMaintenances(list);
          this.renderCalendar();
          if (this.usingApi && this.api && this.api.updateMantenimiento && list[index].id) {
            this.api.updateMantenimiento(list[index].id, {
              fecha_inicio: list[index].date,
              diagnostico: list[index].notes,
              id_ticket: list[index].ticketId,
              id_usuario_tecnico: list[index].technicianId
            }).catch(() => {
              this.setScheduleStatus('Could not update the date in the API.', 'error');
            });
          }
        });
      });
    }

    prevPeriod() {
      if (this.viewMode === 'week') {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
      } else {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      }
      this.renderCalendar();
    }

    nextPeriod() {
      if (this.viewMode === 'week') {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
      } else {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      }
      this.renderCalendar();
    }

    goToday() {
      this.currentDate = new Date();
      this.renderCalendar();
    }

    setViewMode(mode) {
      this.viewMode = mode;
      this.renderCalendar();
    }

    async handleScheduleSubmit(e) {
      e.preventDefault();

      const ticketId = this.qs('#ticketId').value.trim();
      const assetValue = this.qs('#assetName').value;
      const typeValue = this.qs('#maintenanceType').value;
      const dateValue = this.qs('#maintenanceDate').value;
      const notesValue = this.qs('#notes').value;

      if (!ticketId || !dateValue) {
        this.setScheduleStatus('Ticket ID y Date son obligatorios.', 'error');
        return;
      }

      const user = this.api && this.api.getUser ? this.api.getUser() : null;
      const technicianId = user && (user.id || user.id_usuario || user.userId);

      if (!technicianId) {
        this.setScheduleStatus('Debes iniciar sesion para programar mantenimiento.', 'error');
        return;
      }

      const maintenance = {
        id: this.editIndex !== null ? (this.maintenances[this.editIndex] || {}).id : '',
        ticketId,
        technicianId,
        asset: assetValue,
        type: typeValue,
        date: dateValue,
        notes: notesValue
      };

      const list = this.loadMaintenances();
      if (this.editIndex !== null) {
        list[this.editIndex] = maintenance;
        this.editIndex = null;
      } else {
        list.push(maintenance);
      }

      this.saveMaintenances(list);
      this.renderCalendar();

      if (this.usingApi && this.api) {
        const payload = {
          id_ticket: Number(ticketId) || ticketId,
          id_usuario_tecnico: technicianId,
          diagnostico: notesValue,
          fecha_inicio: dateValue
        };

        const action = maintenance.id && this.api.updateMantenimiento
          ? this.api.updateMantenimiento(maintenance.id, payload)
          : this.api.createMantenimiento(payload);

        action.then(() => {
          this.setScheduleStatus('Maintenance saved in the API.', 'success');
          this.refreshMaintenances();
        }).catch(() => {
          this.setScheduleStatus('Could not save maintenance in the API.', 'error');
        });
      }

      this.scheduleForm.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
      if (modal) {
        modal.hide();
      }
    }

    showMaintenance(index) {
      const maintenances = this.loadMaintenances();
      const m = maintenances[index];
      if (!m) return;

      this.editIndex = index;

      this.qs('#detailAsset').innerText = m.asset;
      this.qs('#detailType').innerText = m.type;
      this.qs('#detailDate').innerText = m.date;
      this.qs('#detailNotes').innerText = m.notes || '-';

      const modal = new bootstrap.Modal(document.getElementById('detailModal'));
      modal.show();
    }

    async loadAssets() {
      const select = this.qs('#assetName');
      if (!select) return;
      select.innerHTML = '';

      if (this.api && this.api.getActivos) {
        this.api.getActivos({ limit: 50, offset: 0 }).then((assets) => {
          this.assetsList = Array.isArray(assets) ? assets : [];
          if (this.assetsList.length === 0) {
            select.innerHTML = '<option value="">No assets available</option>';
            return;
          }
          this.assetsList.forEach((asset) => {
            const id = asset.id_activo || asset.id || asset.idActivo || '';
            const labelParts = [asset.modelo, asset.serial, asset.sede, asset.sala].filter(Boolean);
            const label = labelParts.join(' - ') || asset.nombre || `Asset ${id}`;
            select.innerHTML += `
          <option value="${label}">
            ${label}
          </option>
        `;
          });
        }).catch(() => {
          select.innerHTML = '<option value="">No assets available</option>';
        });
        return;
      }

      const assets = JSON.parse(localStorage.getItem('assets')) || [];
      if (assets.length === 0) {
        select.innerHTML = '<option value="">No assets available</option>';
        return;
      }

      assets.forEach((asset) => {
        select.innerHTML += `
      <option value="${asset.name}">
        ${asset.name}
      </option>
    `;
      });
    }

    deleteMaintenance() {
      const maintenances = this.loadMaintenances();
      if (!confirm('Delete this maintenance?')) return;

      const target = maintenances[this.editIndex] || {};
      if (this.usingApi && this.api && this.api.deleteMantenimiento && target.id) {
        this.api.deleteMantenimiento(target.id).catch(() => {
          this.setScheduleStatus('Could not delete in the API.', 'error');
        });
      }
      maintenances.splice(this.editIndex, 1);
      this.saveMaintenances(maintenances);
      this.renderCalendar();

      const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
      modal.hide();
    }

    editMaintenance() {
      const maintenances = this.loadMaintenances();
      const m = maintenances[this.editIndex];
      if (!m) return;

      this.qs('#ticketId').value = m.ticketId || '';
      this.qs('#assetName').value = m.asset;
      this.qs('#maintenanceType').value = m.type;
      this.qs('#maintenanceDate').value = m.date;
      this.qs('#notes').value = m.notes;

      const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
      modal.show();
    }

    updateStats(maintenances) {
      const today = new Date().toISOString().split('T')[0];

      if (this.scheduledEl) this.scheduledEl.innerText = maintenances.length;
      const overdue = maintenances.filter((m) => m.date < today).length;
      if (this.overdueEl) this.overdueEl.innerText = overdue;
      const uniqueAssets = new Set(maintenances.map((m) => m.asset));
      if (this.assetsEl) this.assetsEl.innerText = uniqueAssets.size;
    }
  }

  window.SIGAM_PAGES = window.SIGAM_PAGES || {};
  window.SIGAM_PAGES.CalendarPage = CalendarPage;
})();
