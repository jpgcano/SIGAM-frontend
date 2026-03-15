// Tickets page implemented with POO (extends CrudPage).
(function () {
  const CrudPage = window.SIGAM_UI && window.SIGAM_UI.CrudPage;

  function normalizeToken(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function mapStatusClass(status) {
    const key = normalizeToken(status);
    if (key.includes('abierto')) return 'status-abierto';
    if (key.includes('proceso')) return 'status-en-proceso';
    if (key.includes('cerrado')) return 'status-cerrado';
    if (key.includes('resuelto')) return 'status-resuelto';
    return '';
  }

  class TicketsPage extends CrudPage {
    constructor() {
      super(document);

      this.api = window.SIGAM_API;
      this.tickets = [];
      this.activosMap = new Map();
      this.activosBySerial = new Map();
      this.activosList = [];
      this.categoriasMap = new Map();
      this.categoriasList = [];

      this.modal = this.qs('#ticketModal');
      this.openBtn = this.qs('#newTicketBtn');
      this.closeBtn = this.qs('.close');

      this.ticketForm = this.qs('#ticketForm');
      this.addTicketBtn = this.qs('#addTicket');
      this.ticketList = this.qs('#ticketList');
      this.ticketListStatus = this.qs('#ticketListStatus');
      this.ticketPrevBtn = this.qs('#ticketPrevBtn');
      this.ticketNextBtn = this.qs('#ticketNextBtn');
      this.ticketPageInfo = this.qs('#ticketPageInfo');

      this.searchInput = this.qs('#searchInput');
      this.ticketStatusEl = this.qs('#ticketStatus');
      this.ticketsCount = this.qs('#contadorTickets');

      this.prevPageBtn = this.qs('#prevPage');
      this.nextPageBtn = this.qs('#nextPage');
      this.pageInfo = this.qs('#pageInfo');
      this.pageSizeSelect = this.qs('#pageSize');

      this.statusFilter = this.qs('#statusFilter');
      this.categoryFilter = this.qs('#categoryFilter');

      this.titleInput = this.qs('#title');
      this.descriptionInput = this.qs('#description');
      this.deviceInput = this.qs('#device');
      this.deviceList = this.qs('#deviceList');
      this.categoryInput = this.qs('#category');
      this.createdByInput = this.qs('#createdBy');
      this.assignedToInput = this.qs('#assignedTo');
      this.estimateInput = this.qs('#estimate');
      this.statusInput = this.qs('#status');

      this.TICKETS_PAGE_SIZE = 50;
      this.ticketOffset = 0;

      if (this.pageSizeSelect) {
        this.pageSize = Number(this.pageSizeSelect.value) || this.pageSize;
      }
    }

    init() {
      this.bindEvents();
      this.setCreatedByFromSession();
      Promise.all([this.loadActivos(), this.loadCategorias()]).then(() => {
        this.loadTickets(1);
      });
    }

    bindEvents() {
      if (this.openBtn && this.modal) {
        this.openBtn.onclick = () => {
          this.modal.style.display = 'flex';
          this.setStatus(this.ticketStatusEl, '');
          this.clearFormErrors();
        };
      }

      if (this.closeBtn && this.modal) {
        this.closeBtn.onclick = () => {
          this.modal.style.display = 'none';
        };
      }

      window.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.modal.style.display = 'none';
        }
      });

      if (this.ticketForm) {
        this.ticketForm.addEventListener('submit', (event) => this.handleSubmit(event));
      }

      if (this.searchInput) {
        this.searchInput.addEventListener('input', () => this.applyFilters());
      }
      if (this.statusFilter) {
        this.statusFilter.addEventListener('change', () => this.applyFilters());
      }
      if (this.categoryFilter) {
        this.categoryFilter.addEventListener('change', () => this.applyFilters());
      }

      if (this.prevPageBtn) {
        this.prevPageBtn.addEventListener('click', () => {
          if (this.currentPage > 1) {
            this.loadTickets(this.currentPage - 1);
          }
        });
      }

      if (this.nextPageBtn) {
        this.nextPageBtn.addEventListener('click', () => {
          if (this.hasMore) {
            this.loadTickets(this.currentPage + 1);
          }
        });
      }

      if (this.pageSizeSelect) {
        this.pageSizeSelect.addEventListener('change', () => {
          const nextSize = Number(this.pageSizeSelect.value) || 20;
          this.pageSize = nextSize;
          this.loadTickets(1);
        });
      }

      if (this.ticketPrevBtn) {
        this.ticketPrevBtn.addEventListener('click', () => {
          if (this.ticketOffset <= 0) return;
          this.ticketOffset = Math.max(0, this.ticketOffset - this.TICKETS_PAGE_SIZE);
          this.loadTickets();
        });
      }

      if (this.ticketNextBtn) {
        this.ticketNextBtn.addEventListener('click', () => {
          this.ticketOffset += this.TICKETS_PAGE_SIZE;
          this.loadTickets();
        });
      }
    }

    setListStatus(message, type) {
      this.setStatus(this.ticketListStatus, message, type);
    }

    setTicketStatus(message, type) {
      this.setStatus(this.ticketStatusEl, message, type);
    }

    getCurrentUser() {
      if (!this.api || !this.api.getUser) return null;
      return this.api.getUser();
    }

    setCreatedByFromSession() {
      const user = this.getCurrentUser();
      if (!this.createdByInput) return;
      if (user && (user.nombre || user.name || user.email)) {
        this.createdByInput.value = user.nombre || user.name || user.email;
        return;
      }
      this.createdByInput.value = 'User';
    }

    setFieldError(input, message) {
      if (!input) return;
      const errorEl = this.qs(`#${input.id}Error`);
      if (message) {
        input.classList.add('input-error');
        if (errorEl) errorEl.textContent = message;
      } else {
        input.classList.remove('input-error');
        if (errorEl) errorEl.textContent = '';
      }
    }

    clearFormErrors() {
      this.setFieldError(this.titleInput, '');
      this.setFieldError(this.descriptionInput, '');
      this.setFieldError(this.deviceInput, '');
      this.setFieldError(this.categoryInput, '');
      this.setFieldError(this.createdByInput, '');
      this.setFieldError(this.assignedToInput, '');
      this.setFieldError(this.estimateInput, '');
      this.setFieldError(this.statusInput, '');
    }

    validateTicketForm() {
      let isValid = true;

      if (!this.titleInput.value.trim()) {
        isValid = false;
        this.setFieldError(this.titleInput, 'Title is required.');
      } else {
        this.setFieldError(this.titleInput, '');
      }

      if (!this.descriptionInput.value.trim()) {
        isValid = false;
        this.setFieldError(this.descriptionInput, 'Description is required.');
      } else {
        this.setFieldError(this.descriptionInput, '');
      }

      if (!this.deviceInput.value.trim()) {
        isValid = false;
        this.setFieldError(this.deviceInput, 'Device is required.');
      } else {
        this.setFieldError(this.deviceInput, '');
      }

      if (!this.categoryInput.value) {
        isValid = false;
        this.setFieldError(this.categoryInput, 'Category is required.');
      } else {
        this.setFieldError(this.categoryInput, '');
      }

      if (!this.createdByInput.value.trim()) {
        isValid = false;
        this.setFieldError(this.createdByInput, 'Created by is required.');
      } else {
        this.setFieldError(this.createdByInput, '');
      }

      if (!this.statusInput.value) {
        isValid = false;
        this.setFieldError(this.statusInput, 'Status is required.');
      } else {
        this.setFieldError(this.statusInput, '');
      }

      this.setFieldError(this.assignedToInput, '');
      this.setFieldError(this.estimateInput, '');

      return isValid;
    }

    normalizeTicket(raw) {
      const createdAt = raw.createdAt || raw.date || raw.created_at || raw.created_on || raw.fecha_creacion;
      const idActivo = raw.id_activo || raw.activoId || raw.assetId;
      const activoInfo = this.activosMap.get(String(idActivo)) || {};
      const rawStatus = raw.status || raw.estado || '';
      const normalizedStatus = normalizeToken(rawStatus);
      const categoryId = raw.id_categoria_ticket || raw.id_categoria || raw.categoria_id || raw.categoriaId;
      const categoryLabel =
        raw.clasificacion_nlp ||
        raw.category ||
        raw.categoria ||
        raw.categoria_nombre ||
        (categoryId ? this.categoriasMap.get(String(categoryId)) : '') ||
        (activoInfo.raw && (activoInfo.raw.categoria || activoInfo.raw.categoria_nombre)) ||
        '';

      return {
        id: raw.id || raw._id || raw.ticketId || raw.codigo || raw.id_ticket,
        title: raw.title || raw.titulo || raw.asunto || raw.descripcion || '',
        description: raw.description || raw.descripcion || '',
        device: raw.device || raw.dispositivo || activoInfo.label || '',
        category: categoryLabel,
        createdBy: raw.createdBy || raw.creadoPor || raw.created_by || raw.usuario_reporta || '',
        assignedTo: raw.assignedTo || raw.asignadoA || raw.assigned_to || raw.usuario_asignado || '',
        estimate: raw.estimate || raw.tiempoEstimado || raw.estimated || '',
        status: rawStatus,
        statusNormalized: normalizedStatus,
        assetId: idActivo || '',
        date: createdAt ? new Date(createdAt).toLocaleDateString() : ''
      };
    }

    getActivoSerial(activo) {
      return (
        activo.serial ||
        activo.serie ||
        activo.codigo ||
        activo.codigo_activo ||
        activo.serial_activo ||
        ''
      );
    }

    async loadActivos() {
      if (!this.api || !this.api.getActivos) return;
      try {
        const data = await this.api.getActivos({ limit: 500, offset: 0 });
        this.activosList = Array.isArray(data) ? data : [];
        this.activosMap = new Map(
          this.activosList.map((activo) => {
            const id = activo.id_activo || activo.id || activo.idActivo;
            const labelParts = [
              activo.modelo,
              this.getActivoSerial(activo),
              activo.sede,
              activo.sala
            ].filter(Boolean);
            const label = labelParts.join(' - ');
            return [String(id), { label, raw: activo }];
          })
        );
        this.activosBySerial = new Map(
          this.activosList
            .map((activo) => ({
              serial: this.getActivoSerial(activo),
              activo
            }))
            .filter((item) => item.serial)
            .map((item) => [String(item.serial).trim().toLowerCase(), item.activo])
        );

        if (this.deviceList) {
          const serials = Array.from(new Set(
            this.activosList
              .map((activo) => this.getActivoSerial(activo))
              .filter(Boolean)
              .map((serial) => String(serial).trim())
          ));
          this.deviceList.innerHTML = serials
            .map((serial) => `<option value="${serial}"></option>`)
            .join('');
        }
      } catch (error) {
        this.setTicketStatus('Unable to load assets from API.', 'error');
      }
    }

    async loadCategorias() {
      if (!this.api || !this.api.getCategorias) return;
      try {
        const data = this.api.getCategoriasTicket
          ? await this.api.getCategoriasTicket()
          : await this.api.getCategorias();
        this.categoriasList = this.normalizeCategorias(data);
        this.renderCategorias();
      } catch (error) {
        this.categoriasList = [];
        this.renderCategorias();
        this.setTicketStatus('Unable to load categories from API.', 'error');
      }
    }

    normalizeCategorias(data) {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.categorias)) return data.categorias;
      if (data && Array.isArray(data.categories)) return data.categories;
      return [];
    }

    getCategoriaLabel(categoria) {
      return (
        categoria.nombre ||
        categoria.name ||
        categoria.categoria ||
        categoria.nombre_categoria ||
        ''
      );
    }

    renderCategorias() {
      if (!this.categoryInput) return;
      this.categoriasMap = new Map(
        this.categoriasList.map((categoria) => {
          const id = categoria.id_categoria_ticket || categoria.id_categoria || categoria.id || categoria.idCategoria || this.getCategoriaLabel(categoria);
          const label = this.getCategoriaLabel(categoria) || String(id || 'Categoria');
          return [String(id), label];
        })
      );

      const placeholder = '<option value="">Selecciona categoria</option>';
      const options = Array.from(this.categoriasMap.entries())
        .map(([id, label]) => `<option value="${id}">${label}</option>`)
        .join('');
      this.categoryInput.innerHTML = placeholder + options;

      if (this.categoryFilter) {
        const filterPlaceholder = '<option value="all">All categories</option>';
        const filterOptions = Array.from(this.categoriasMap.entries())
          .map(([id, label]) => `<option value="${normalizeToken(label)}">${label}</option>`)
          .join('');
        this.categoryFilter.innerHTML = filterPlaceholder + filterOptions;
      }
    }

    renderStatusFilter() {
      if (!this.statusFilter) return;
      const unique = new Map();
      this.tickets.forEach((ticket) => {
        const label = String(ticket.status || '').trim();
        if (!label) return;
        unique.set(normalizeToken(label), label);
      });
      const placeholder = '<option value="all">All the states</option>';
      const options = Array.from(unique.entries())
        .map(([value, label]) => `<option value="${value}">${label}</option>`)
        .join('');
      this.statusFilter.innerHTML = placeholder + options;
    }

    async loadTickets(page = 1) {
      if (!this.api || !this.api.getTickets) {
        this.setTicketStatus('API not available.', 'error');
        this.setListStatus('API not available.', 'error');
        return;
      }
      try {
        this.currentPage = page;
        const offset = (this.currentPage - 1) * this.pageSize;
        const data = await this.api.getTickets({ limit: this.pageSize, offset });
        this.tickets = (data || []).map((item) => this.normalizeTicket(item));
        this.hasMore = Array.isArray(data) && data.length === this.pageSize;
        localStorage.setItem('tickets', JSON.stringify(this.tickets));
        this.renderStatusFilter();
        this.applyFilters();
        this.updatePagination({
          pageInfo: this.pageInfo,
          prevBtn: this.prevPageBtn,
          nextBtn: this.nextPageBtn
        });
      } catch (error) {
        const status = error && error.status ? error.status : null;
        if (status === 401) {
          this.setListStatus('Session expired. Please log in again.', 'error');
          setTimeout(() => { window.location.href = 'login.html'; }, 800);
        } else if (status === 429) {
          this.setListStatus('Too many requests. Please wait and try again.', 'error');
        } else if (status === 500) {
          this.setListStatus('Server error loading tickets.', 'error');
        } else {
          this.setListStatus('Unable to load tickets from API.', 'error');
        }
        const cached = JSON.parse(localStorage.getItem('tickets') || '[]');
        this.tickets = cached.map((item) => this.normalizeTicket(item));
        this.hasMore = false;
        this.renderStatusFilter();
        this.applyFilters();
        this.updatePagination({
          pageInfo: this.pageInfo,
          prevBtn: this.prevPageBtn,
          nextBtn: this.nextPageBtn
        });
      }
    }

    renderTickets(list) {
      if (!this.ticketList) return;
      this.ticketList.innerHTML = '';

      if (list.length === 0) {
        this.ticketList.innerHTML = '<p>No matching tickets found.</p>';
        return;
      }

      list.forEach((ticket, index) => {
        const div = document.createElement('div');
        div.classList.add('ticket');
        div.innerHTML = `
            <div class="ticket-status ${mapStatusClass(ticket.status)}">${ticket.status || 'Pending'}</div>

            <div class="ticket-title">
                ${ticket.title || 'Ticket'}
            </div>

            <div class="ticket-desc">
                ${ticket.description}
            </div>

            <div class="ticket-info ticket-line">
                <span>TK-${ticket.id || index + 1}</span>
                <span>${ticket.device || 'Activo'}</span>
                <span>${ticket.category || 'Sin clasificacion'}</span>
            </div>

            <div class="ticket-info ticket-meta">
                <span>Creado por: ${ticket.createdBy || 'Sin usuario'}</span>
                <span>Asignado a: ${ticket.assignedTo || 'Sin asignar'}</span>
                <span>${ticket.date}</span>
                <span>${ticket.estimate || 'Sin estimado'}</span>
            </div>

            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        div.addEventListener('click', (event) => {
          if (event.target.closest('.delete-btn')) return;
          if (ticket.id) {
            window.location.href = `ticket-detail.html?id=${encodeURIComponent(ticket.id)}`;
          }
        });
        this.ticketList.appendChild(div);
      });

      this.ticketList.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          const idx = Number(btn.dataset.index);
          this.deleteTicket(idx);
        });
      });
    }

    async deleteTicket(index) {
      const ticket = this.tickets[index];
      if (!ticket) return;
      if (this.api && this.api.deleteTicket && ticket.id) {
        try {
          await this.api.deleteTicket(ticket.id);
        } catch (error) {
          this.setTicketStatus('Unable to delete ticket from API.', 'error');
          return;
        }
      }
      this.tickets.splice(index, 1);
      localStorage.setItem('tickets', JSON.stringify(this.tickets));
      this.applyFilters();
    }

    applyFilters() {
      const search = normalizeToken(this.searchInput ? this.searchInput.value : '');
      const status = normalizeToken(this.statusFilter ? this.statusFilter.value : '');
      const category = this.categoryFilter ? normalizeToken(this.categoryFilter.value) : 'all';

      const filtered = this.tickets.filter((ticket) => {
        const title = normalizeToken(ticket.title);
        const description = normalizeToken(ticket.description);
        const device = normalizeToken(ticket.device);
        const ticketCategory = normalizeToken(ticket.category);

        const matchSearch =
          title.includes(search) ||
          description.includes(search) ||
          device.includes(search) ||
          ticketCategory.includes(search);

        const matchStatus = status === 'all' || (ticket.statusNormalized || '').includes(status);
        const matchCategory = category === 'all' || ticketCategory.includes(category);

        return matchSearch && matchStatus && matchCategory;
      });

      this.renderTickets(filtered);
      if (this.ticketsCount) {
        this.ticketsCount.textContent = `${filtered.length} tickets`;
      }
    }

    async handleSubmit(event) {
      event.preventDefault();
      this.setTicketStatus('', 'loading');

      if (!this.validateTicketForm()) {
        this.setTicketStatus('Please fix the highlighted fields.', 'error');
        return;
      }

      if (!this.api || !this.api.createTicket) {
        this.setTicketStatus('API not available.', 'error');
        return;
      }

      this.setSubmitting(this.addTicketBtn, true, 'Add Ticket');

      const user = this.getCurrentUser() || {};
      const reporterId = user.id || user.id_usuario || user.userId || '';
      const serialValue = this.deviceInput.value.trim();
      const matchedActivo = this.activosBySerial.get(serialValue.toLowerCase());
      const assetId = matchedActivo
        ? (matchedActivo.id_activo || matchedActivo.id || matchedActivo.idActivo)
        : '';

      if (!reporterId) {
        this.setTicketStatus('You must sign in to create a ticket.', 'error');
        this.setSubmitting(this.addTicketBtn, false, 'Add Ticket');
        return;
      }

      if (!assetId) {
        this.setTicketStatus('Serial not found. Please verify the asset.', 'error');
        this.setSubmitting(this.addTicketBtn, false, 'Add Ticket');
        return;
      }

      const ticketPayload = {
        id_activo: Number(assetId) || assetId,
        descripcion: this.descriptionInput.value.trim()
      };

      const categoryValue = this.categoryInput.value;
      if (categoryValue) {
        ticketPayload.id_categoria_ticket = Number(categoryValue) || categoryValue;
      }

      try {
        await this.api.createTicket(ticketPayload);
        await this.loadTickets(this.currentPage);
        this.ticketForm.reset();
        this.clearFormErrors();
        this.setTicketStatus('Ticket created successfully.', 'success');
        if (this.modal) this.modal.style.display = 'none';
      } catch (error) {
        this.setTicketStatus('Unable to create ticket. Please try again.', 'error');
      } finally {
        this.setSubmitting(this.addTicketBtn, false, 'Add Ticket');
      }
    }
  }

  window.SIGAM_PAGES = window.SIGAM_PAGES || {};
  window.SIGAM_PAGES.TicketsPage = TicketsPage;
})();
