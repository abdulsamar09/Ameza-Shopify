/**
 * AMEZA TRAVEL INTERACTIVE SEARCHBOX SYSTEM
 * Full Dynamic Interactive Popovers:
 * 1. Destination Autocomplete & Recent/Trending Destinations
 * 2. Interactive Dual-Month Range Datepicker with Flexible Options
 * 3. Occupancy / Guests & Rooms Interactive Counter with Pet Toggle
 */

export class TravelSearchbox {
  constructor(options = {}) {
    this.container = options.container || document;
    this.onSearch = options.onSearch || null;

    // State for dates
    const today = new Date();
    this.currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Default 5-day stay or user dates
    this.startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    this.endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
    this.hoverDate = null;
    this.flexOption = 'Exact dates';

    // State for guests
    this.adults = 2;
    this.children = 0;
    this.rooms = 1;
    this.hasPets = false;

    this.init();
  }

  init() {
    this.bindPopovers();
    this.initDestination();
    this.initDatePicker();
    this.initGuests();
    this.updateDatesDisplay();
    this.updateGuestsDisplay();
  }

  // Close all popovers on outside click
  bindPopovers() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown')) {
        this.closeAllPopovers();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPopovers();
      }
    });
  }

  closeAllPopovers() {
    document.querySelectorAll('.search-dropdown-popover').forEach(pop => {
      pop.classList.remove('open');
    });
    document.querySelectorAll('.travel-search-field').forEach(f => {
      f.classList.remove('is-active-field');
    });
  }

  togglePopover(fieldWrap, popover) {
    const wasOpen = popover.classList.contains('open');
    this.closeAllPopovers();
    if (!wasOpen) {
      popover.classList.add('open');
      fieldWrap.classList.add('is-active-field');
    }
  }

  // =========================================================================
  // 1. DESTINATION AUTOCOMPLETE & DROPDOWN
  // =========================================================================
  initDestination() {
    const fieldWrap = this.container.querySelector('#field-destination-wrap');
    const input = this.container.querySelector('#input-destination');
    const popover = this.container.querySelector('#popover-destination');

    if (!input || !popover) return;

    input.addEventListener('focus', () => {
      this.closeAllPopovers();
      popover.classList.add('open');
      fieldWrap?.classList.add('is-active-field');
    });

    // Live search filter
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = popover.querySelectorAll('.popover-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });

    // Item click
    popover.addEventListener('click', (e) => {
      const item = e.target.closest('.popover-item');
      if (item) {
        const val = item.getAttribute('data-val') || item.querySelector('.popover-primary')?.textContent;
        input.value = val.trim();
        this.closeAllPopovers();

        // Optionally open next field (Datepicker)
        const dateInput = this.container.querySelector('#input-dates');
        const datesWrap = this.container.querySelector('#field-dates-wrap');
        const datesPopover = this.container.querySelector('#popover-dates');
        if (datesPopover && datesWrap) {
          setTimeout(() => {
            this.togglePopover(datesWrap, datesPopover);
          }, 150);
        }
      }
    });
  }

  // =========================================================================
  // 2. DUAL-MONTH RANGE DATEPICKER
  // =========================================================================
  initDatePicker() {
    const fieldWrap = this.container.querySelector('#field-dates-wrap');
    const input = this.container.querySelector('#input-dates');
    const popover = this.container.querySelector('#popover-dates');

    if (!fieldWrap || !popover) return;

    fieldWrap.addEventListener('click', (e) => {
      if (e.target.closest('.search-dropdown-popover')) return;
      this.togglePopover(fieldWrap, popover);
      this.renderCalendars();
    });

    // Flexible pills click
    popover.querySelectorAll('.date-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        popover.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.flexOption = pill.textContent.trim();
        this.updateDatesDisplay();
      });
    });

    // Initial render
    this.renderCalendars();
  }

  renderCalendars() {
    const container = this.container.querySelector('#datepicker-months-container');
    if (!container) return;

    const m1 = new Date(this.currentMonthDate);
    const m2 = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);

    container.innerHTML = `
      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <button type="button" class="cal-nav-btn" id="cal-prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
          <span class="cal-month-title">${this.getMonthName(m1)} ${m1.getFullYear()}</span>
          <span class="cal-nav-spacer"></span>
        </div>
        ${this.generateMonthGrid(m1)}
      </div>

      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <span class="cal-nav-spacer"></span>
          <span class="cal-month-title">${this.getMonthName(m2)} ${m2.getFullYear()}</span>
          <button type="button" class="cal-nav-btn" id="cal-next-btn"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        ${this.generateMonthGrid(m2)}
      </div>
    `;

    // Navigation buttons
    container.querySelector('#cal-prev-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
      this.renderCalendars();
    });

    container.querySelector('#cal-next-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
      this.renderCalendars();
    });

    // Bind Day clicks and hovers
    container.querySelectorAll('.cal-day-cell:not(.disabled):not(.empty)').forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const cellDate = new Date(dateStr);

      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDateClick(cellDate);
      });

      cell.addEventListener('mouseenter', () => {
        if (this.startDate && !this.endDate) {
          this.hoverDate = cellDate;
          this.highlightHoverRange();
        }
      });
    });
  }

  generateMonthGrid(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = `
      <div class="calendar-weekdays">
        ${weekDays.map(d => `<span>${d}</span>`).join('')}
      </div>
      <div class="calendar-days-grid">
    `;

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="cal-day-cell empty"></div>`;
    }

    // Day cells
    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);

      const isPast = dateObj < today;
      const isStart = this.startDate && this.isSameDay(dateObj, this.startDate);
      const isEnd = this.endDate && this.isSameDay(dateObj, this.endDate);
      const isInRange = this.startDate && this.endDate && dateObj > this.startDate && dateObj < this.endDate;

      let classes = ['cal-day-cell'];
      if (isPast) classes.push('disabled');
      if (isStart) classes.push('is-start');
      if (isEnd) classes.push('is-end');
      if (isInRange) classes.push('is-in-range');

      const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      html += `<div class="${classes.join(' ')}" data-date="${dateIso}">${day}</div>`;
    }

    html += `</div>`;
    return html;
  }

  handleDateClick(date) {
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.endDate = null;
      this.renderCalendars();
    } else if (this.startDate && !this.endDate) {
      if (date < this.startDate) {
        this.startDate = date;
        this.endDate = null;
      } else {
        this.endDate = date;
        this.updateDatesDisplay();
        this.renderCalendars();
        
        // Auto-close after selection and open Guests popover
        setTimeout(() => {
          this.closeAllPopovers();
          const guestsWrap = this.container.querySelector('#field-guests-wrap');
          const guestsPop = this.container.querySelector('#popover-guests');
          if (guestsWrap && guestsPop) {
            this.togglePopover(guestsWrap, guestsPop);
          }
        }, 300);
      }
    }
  }

  highlightHoverRange() {
    const container = this.container.querySelector('#datepicker-months-container');
    if (!container || !this.startDate || this.endDate) return;

    container.querySelectorAll('.cal-day-cell:not(.disabled):not(.empty)').forEach(cell => {
      const cellDate = new Date(cell.getAttribute('data-date'));
      if (cellDate > this.startDate && cellDate <= this.hoverDate) {
        cell.classList.add('is-hover-range');
      } else {
        cell.classList.remove('is-hover-range');
      }
    });
  }

  updateDatesDisplay() {
    const input = this.container.querySelector('#input-dates');
    if (!input) return;

    if (this.startDate && this.endDate) {
      const sStr = this.formatShortDate(this.startDate);
      const eStr = this.formatShortDate(this.endDate);
      const flexStr = this.flexOption && this.flexOption !== 'Exact dates' ? ` (${this.flexOption})` : '';
      input.value = `${sStr} — ${eStr}${flexStr}`;
    } else if (this.startDate) {
      input.value = `${this.formatShortDate(this.startDate)} — Select check-out`;
    }
  }

  // =========================================================================
  // 3. GUESTS & ROOMS COUNTER POPUP
  // =========================================================================
  initGuests() {
    const fieldWrap = this.container.querySelector('#field-guests-wrap');
    const popover = this.container.querySelector('#popover-guests');

    if (!fieldWrap || !popover) return;

    fieldWrap.addEventListener('click', (e) => {
      if (e.target.closest('.search-dropdown-popover')) return;
      this.togglePopover(fieldWrap, popover);
    });

    // Adults Controls
    popover.querySelector('#btn-adults-minus')?.addEventListener('click', () => {
      if (this.adults > 1) {
        this.adults--;
        this.updateGuestsUI();
      }
    });
    popover.querySelector('#btn-adults-plus')?.addEventListener('click', () => {
      if (this.adults < 30) {
        this.adults++;
        this.updateGuestsUI();
      }
    });

    // Children Controls
    popover.querySelector('#btn-children-minus')?.addEventListener('click', () => {
      if (this.children > 0) {
        this.children--;
        this.updateGuestsUI();
      }
    });
    popover.querySelector('#btn-children-plus')?.addEventListener('click', () => {
      if (this.children < 10) {
        this.children++;
        this.updateGuestsUI();
      }
    });

    // Rooms Controls
    popover.querySelector('#btn-rooms-minus')?.addEventListener('click', () => {
      if (this.rooms > 1) {
        this.rooms--;
        this.updateGuestsUI();
      }
    });
    popover.querySelector('#btn-rooms-plus')?.addEventListener('click', () => {
      if (this.rooms < 10) {
        this.rooms++;
        this.updateGuestsUI();
      }
    });

    // Pets Toggle
    const petsToggle = popover.querySelector('#chk-travel-pets');
    petsToggle?.addEventListener('change', (e) => {
      this.hasPets = e.target.checked;
      this.updateGuestsDisplay();
    });

    // Done Button
    popover.querySelector('#btn-guests-done')?.addEventListener('click', () => {
      this.closeAllPopovers();
    });

    this.updateGuestsUI();
  }

  updateGuestsUI() {
    const popover = this.container.querySelector('#popover-guests');
    if (!popover) return;

    popover.querySelector('#val-adults').textContent = this.adults;
    popover.querySelector('#val-children').textContent = this.children;
    popover.querySelector('#val-rooms').textContent = this.rooms;

    // Disabled states
    const btnAdultsMinus = popover.querySelector('#btn-adults-minus');
    const btnChildrenMinus = popover.querySelector('#btn-children-minus');
    const btnRoomsMinus = popover.querySelector('#btn-rooms-minus');

    if (btnAdultsMinus) btnAdultsMinus.disabled = (this.adults <= 1);
    if (btnChildrenMinus) btnChildrenMinus.disabled = (this.children <= 0);
    if (btnRoomsMinus) btnRoomsMinus.disabled = (this.rooms <= 1);

    this.updateGuestsDisplay();
  }

  updateGuestsDisplay() {
    const summaryLabel = this.container.querySelector('#label-guests-summary');
    if (!summaryLabel) return;

    const adultText = this.adults === 1 ? '1 Adult' : `${this.adults} Adults`;
    const childText = this.children === 1 ? '1 Child' : `${this.children} Children`;
    const roomText = this.rooms === 1 ? '1 Room' : `${this.rooms} Rooms`;
    const petText = this.hasPets ? ' &bull; Pets allowed' : '';

    summaryLabel.innerHTML = `${adultText} &bull; ${childText} &bull; ${roomText}${petText}`;
  }

  // =========================================================================
  // UTILITY HELPERS
  // =========================================================================
  getMonthName(date) {
    return date.toLocaleString('en-US', { month: 'long' });
  }

  formatShortDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}

// =========================================================================
// FLIGHT SEARCHBOX SYSTEM
// =========================================================================
export class FlightSearchbox {
  constructor(options = {}) {
    this.container = options.container || document;
    this.tripType = 'round-trip'; // 'round-trip' | 'one-way' | 'multi-city'

    const today = new Date();
    this.currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.departureDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
    this.returnDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);
    this.hoverDate = null;

    this.adults = 1;
    this.children = 0;
    this.infants = 0;
    this.cabinClass = 'Economy';

    this.init();
  }

  init() {
    this.bindTripTypeRadios();
    this.bindPopovers();
    this.initAirportInputs();
    this.initFlightDatePicker();
    this.initFlightCabinPassenger();
    this.updateFlightDatesDisplay();
    this.updateCabinDisplay();
  }

  bindTripTypeRadios() {
    const radios = this.container.querySelectorAll('input[name="trip-type"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.tripType = e.target.value;
        if (this.tripType === 'one-way') {
          this.returnDate = null;
        } else if (!this.returnDate && this.departureDate) {
          this.returnDate = new Date(this.departureDate);
          this.returnDate.setDate(this.departureDate.getDate() + 7);
        }
        this.updateFlightDatesDisplay();
        this.renderFlightCalendars();
      });
    });
  }

  bindPopovers() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown')) {
        this.closeAllPopovers();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPopovers();
      }
    });
  }

  closeAllPopovers() {
    document.querySelectorAll('.search-dropdown-popover').forEach(pop => {
      pop.classList.remove('open');
    });
    document.querySelectorAll('.travel-search-field').forEach(f => {
      f.classList.remove('is-active-field');
    });
  }

  togglePopover(fieldWrap, popover) {
    const wasOpen = popover.classList.contains('open');
    this.closeAllPopovers();
    if (!wasOpen) {
      popover.classList.add('open');
      fieldWrap.classList.add('is-active-field');
    }
  }

  // 1. Airports (From & To)
  initAirportInputs() {
    // Departure Airport
    const fromWrap = this.container.querySelector('#field-flight-from-wrap');
    const fromInput = this.container.querySelector('#flight-from-input');
    const fromPopover = this.container.querySelector('#popover-flight-from');

    if (fromInput && fromPopover) {
      fromInput.addEventListener('focus', () => {
        this.closeAllPopovers();
        fromPopover.classList.add('open');
        fromWrap?.classList.add('is-active-field');
      });

      fromInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        fromPopover.querySelectorAll('.popover-item').forEach(item => {
          item.style.display = (!q || item.textContent.toLowerCase().includes(q)) ? 'flex' : 'none';
        });
      });

      fromPopover.addEventListener('click', (e) => {
        const item = e.target.closest('.popover-item');
        if (item) {
          const val = item.getAttribute('data-val') || item.querySelector('.popover-primary')?.textContent;
          fromInput.value = val.trim();
          this.closeAllPopovers();

          // Move to To input
          const toWrap = this.container.querySelector('#field-flight-to-wrap');
          const toPopover = this.container.querySelector('#popover-flight-to');
          if (toWrap && toPopover) {
            setTimeout(() => this.togglePopover(toWrap, toPopover), 150);
          }
        }
      });
    }

    // Destination Airport
    const toWrap = this.container.querySelector('#field-flight-to-wrap');
    const toInput = this.container.querySelector('#flight-to-input');
    const toPopover = this.container.querySelector('#popover-flight-to');

    if (toInput && toPopover) {
      toInput.addEventListener('focus', () => {
        this.closeAllPopovers();
        toPopover.classList.add('open');
        toWrap?.classList.add('is-active-field');
      });

      toInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        toPopover.querySelectorAll('.popover-item').forEach(item => {
          item.style.display = (!q || item.textContent.toLowerCase().includes(q)) ? 'flex' : 'none';
        });
      });

      toPopover.addEventListener('click', (e) => {
        const item = e.target.closest('.popover-item');
        if (item) {
          const val = item.getAttribute('data-val') || item.querySelector('.popover-primary')?.textContent;
          toInput.value = val.trim();
          this.closeAllPopovers();

          // Move to Dates
          const datesWrap = this.container.querySelector('#field-flight-dates-wrap');
          const datesPop = this.container.querySelector('#popover-flight-dates');
          if (datesWrap && datesPop) {
            setTimeout(() => this.togglePopover(datesWrap, datesPop), 150);
          }
        }
      });
    }
  }

  // 2. Flight Dates
  initFlightDatePicker() {
    const fieldWrap = this.container.querySelector('#field-flight-dates-wrap');
    const popover = this.container.querySelector('#popover-flight-dates');

    if (!fieldWrap || !popover) return;

    fieldWrap.addEventListener('click', (e) => {
      if (e.target.closest('.search-dropdown-popover')) return;
      this.togglePopover(fieldWrap, popover);
      this.renderFlightCalendars();
    });

    this.renderFlightCalendars();
  }

  renderFlightCalendars() {
    const container = this.container.querySelector('#flight-datepicker-months-container');
    if (!container) return;

    const m1 = new Date(this.currentMonthDate);
    const m2 = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);

    container.innerHTML = `
      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <button type="button" class="cal-nav-btn" id="flight-cal-prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
          <span class="cal-month-title">${this.getMonthName(m1)} ${m1.getFullYear()}</span>
          <span class="cal-nav-spacer"></span>
        </div>
        ${this.generateFlightMonthGrid(m1)}
      </div>

      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <span class="cal-nav-spacer"></span>
          <span class="cal-month-title">${this.getMonthName(m2)} ${m2.getFullYear()}</span>
          <button type="button" class="cal-nav-btn" id="flight-cal-next-btn"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        ${this.generateFlightMonthGrid(m2)}
      </div>
    `;

    container.querySelector('#flight-cal-prev-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
      this.renderFlightCalendars();
    });

    container.querySelector('#flight-cal-next-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
      this.renderFlightCalendars();
    });

    container.querySelectorAll('.cal-day-cell:not(.disabled):not(.empty)').forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const cellDate = new Date(dateStr);

      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleFlightDateClick(cellDate);
      });
    });
  }

  generateFlightMonthGrid(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = `
      <div class="calendar-weekdays">
        ${weekDays.map(d => `<span>${d}</span>`).join('')}
      </div>
      <div class="calendar-days-grid">
    `;

    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="cal-day-cell empty"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);

      const isPast = dateObj < today;
      const isStart = this.departureDate && this.isSameDay(dateObj, this.departureDate);
      const isEnd = this.returnDate && this.isSameDay(dateObj, this.returnDate);
      const isInRange = this.departureDate && this.returnDate && dateObj > this.departureDate && dateObj < this.returnDate;

      let classes = ['cal-day-cell'];
      if (isPast) classes.push('disabled');
      if (isStart) classes.push('is-start');
      if (isEnd) classes.push('is-end');
      if (isInRange) classes.push('is-in-range');

      const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      html += `<div class="${classes.join(' ')}" data-date="${dateIso}">${day}</div>`;
    }

    html += `</div>`;
    return html;
  }

  handleFlightDateClick(date) {
    if (this.tripType === 'one-way') {
      this.departureDate = date;
      this.returnDate = null;
      this.updateFlightDatesDisplay();
      this.renderFlightCalendars();
      setTimeout(() => {
        this.closeAllPopovers();
        const cabWrap = this.container.querySelector('#field-flight-cabin-wrap');
        const cabPop = this.container.querySelector('#popover-flight-cabin');
        if (cabWrap && cabPop) this.togglePopover(cabWrap, cabPop);
      }, 250);
      return;
    }

    // Round-trip
    if (!this.departureDate || (this.departureDate && this.returnDate)) {
      this.departureDate = date;
      this.returnDate = null;
      this.renderFlightCalendars();
    } else if (this.departureDate && !this.returnDate) {
      if (date < this.departureDate) {
        this.departureDate = date;
        this.returnDate = null;
      } else {
        this.returnDate = date;
        this.updateFlightDatesDisplay();
        this.renderFlightCalendars();
        setTimeout(() => {
          this.closeAllPopovers();
          const cabWrap = this.container.querySelector('#field-flight-cabin-wrap');
          const cabPop = this.container.querySelector('#popover-flight-cabin');
          if (cabWrap && cabPop) this.togglePopover(cabWrap, cabPop);
        }, 250);
      }
    }
  }

  updateFlightDatesDisplay() {
    const input = this.container.querySelector('#flight-date-input');
    if (!input) return;

    if (this.tripType === 'one-way') {
      input.value = this.departureDate ? this.formatShortDate(this.departureDate) : 'Select departure date';
    } else {
      if (this.departureDate && this.returnDate) {
        input.value = `${this.formatShortDate(this.departureDate)} — ${this.formatShortDate(this.returnDate)}`;
      } else if (this.departureDate) {
        input.value = `${this.formatShortDate(this.departureDate)} — Select return`;
      }
    }
  }

  // 3. Cabin & Passenger
  initFlightCabinPassenger() {
    const fieldWrap = this.container.querySelector('#field-flight-cabin-wrap');
    const popover = this.container.querySelector('#popover-flight-cabin');

    if (!fieldWrap || !popover) return;

    fieldWrap.addEventListener('click', (e) => {
      if (e.target.closest('.search-dropdown-popover')) return;
      this.togglePopover(fieldWrap, popover);
    });

    // Adults
    popover.querySelector('#btn-flight-adults-minus')?.addEventListener('click', () => {
      if (this.adults > 1) {
        this.adults--;
        this.updateFlightCabinUI();
      }
    });
    popover.querySelector('#btn-flight-adults-plus')?.addEventListener('click', () => {
      if (this.adults < 9) {
        this.adults++;
        this.updateFlightCabinUI();
      }
    });

    // Children
    popover.querySelector('#btn-flight-children-minus')?.addEventListener('click', () => {
      if (this.children > 0) {
        this.children--;
        this.updateFlightCabinUI();
      }
    });
    popover.querySelector('#btn-flight-children-plus')?.addEventListener('click', () => {
      if (this.children < 9) {
        this.children++;
        this.updateFlightCabinUI();
      }
    });

    // Infants
    popover.querySelector('#btn-flight-infants-minus')?.addEventListener('click', () => {
      if (this.infants > 0) {
        this.infants--;
        this.updateFlightCabinUI();
      }
    });
    popover.querySelector('#btn-flight-infants-plus')?.addEventListener('click', () => {
      if (this.infants < this.adults) {
        this.infants++;
        this.updateFlightCabinUI();
      }
    });

    // Cabin class select
    popover.querySelectorAll('.cabin-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        popover.querySelectorAll('.cabin-option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.cabinClass = btn.getAttribute('data-cabin') || 'Economy';
        this.updateCabinDisplay();
      });
    });

    // Done
    popover.querySelector('#btn-flight-cabin-done')?.addEventListener('click', () => {
      this.closeAllPopovers();
    });

    this.updateFlightCabinUI();
  }

  updateFlightCabinUI() {
    const popover = this.container.querySelector('#popover-flight-cabin');
    if (!popover) return;

    popover.querySelector('#val-flight-adults').textContent = this.adults;
    popover.querySelector('#val-flight-children').textContent = this.children;
    popover.querySelector('#val-flight-infants').textContent = this.infants;

    const btnAM = popover.querySelector('#btn-flight-adults-minus');
    const btnCM = popover.querySelector('#btn-flight-children-minus');
    const btnIM = popover.querySelector('#btn-flight-infants-minus');

    if (btnAM) btnAM.disabled = (this.adults <= 1);
    if (btnCM) btnCM.disabled = (this.children <= 0);
    if (btnIM) btnIM.disabled = (this.infants <= 0);

    this.updateCabinDisplay();
  }

  updateCabinDisplay() {
    const label = this.container.querySelector('#label-flight-cabin-summary');
    if (!label) return;

    const totalPax = this.adults + this.children + this.infants;
    const paxText = totalPax === 1 ? '1 Adult' : `${totalPax} Passengers`;
    label.innerHTML = `${paxText} &bull; ${this.cabinClass}`;
  }

  getMonthName(date) {
    return date.toLocaleString('en-US', { month: 'long' });
  }

  formatShortDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}

// =========================================================================
// CAR RENTAL INTERACTIVE SEARCHBOX SYSTEM
// =========================================================================
export class CarRentalSearchbox {
  constructor(options = {}) {
    this.container = options.container || document;
    this.onSearch = options.onSearch || null;
    this.onChange = options.onChange || null;

    // State
    this.pickupLocation = 'Dubai International Airport (DXB)';
    this.dropoffLocation = 'Abu Dhabi International Airport (AUH)';
    this.isDiffDropoff = false;

    const today = new Date();
    this.currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.pickupDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    this.dropoffDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
    this.hoverDate = null;

    this.pickupTime = '10:00 AM';
    this.dropoffTime = '10:00 AM';
    this.driverAge = 30;
    this.isStandardAge = true;

    this.init();
  }

  init() {
    this.bindPopovers();
    this.initLocationAutocomplete();
    this.initDiffDropoffToggle();
    this.initDriverAgeToggle();
    this.initDatePicker();
    this.initTimeSelectors();
    this.updateDisplays();
  }

  bindPopovers() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown') && !e.target.closest('#chk-different-location-wrap') && !e.target.closest('#chk-driver-age-wrap')) {
        this.closeAllPopovers();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPopovers();
      }
    });
  }

  closeAllPopovers() {
    this.container.querySelectorAll('.search-dropdown-popover').forEach(pop => {
      pop.classList.remove('open');
    });
    this.container.querySelectorAll('.travel-search-field').forEach(f => {
      f.classList.remove('is-active-field');
    });
  }

  togglePopover(fieldWrap, popover) {
    const wasOpen = popover.classList.contains('open');
    this.closeAllPopovers();
    if (!wasOpen) {
      popover.classList.add('open');
      fieldWrap.classList.add('is-active-field');
    }
  }

  // 1. Pickup & Drop-off Location Autocomplete
  initLocationAutocomplete() {
    // Pickup Location
    const pWrap = this.container.querySelector('#field-car-location-wrap');
    const pInput = this.container.querySelector('#car-location-input');
    const pPop = this.container.querySelector('#popover-car-location');

    if (pInput && pPop) {
      pInput.addEventListener('focus', () => {
        this.closeAllPopovers();
        pPop.classList.add('open');
        pWrap?.classList.add('is-active-field');
      });

      pInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        this.pickupLocation = e.target.value;
        pPop.querySelectorAll('.popover-item').forEach(item => {
          const t = item.textContent.toLowerCase();
          item.style.display = (!q || t.includes(q)) ? 'flex' : 'none';
        });
      });

      pPop.addEventListener('click', (e) => {
        const item = e.target.closest('.popover-item');
        if (item) {
          const val = item.getAttribute('data-val') || item.querySelector('.popover-primary')?.textContent;
          pInput.value = val.trim();
          this.pickupLocation = val.trim();
          this.closeAllPopovers();
          this.triggerChange();

          // Move to next field (Pickup Date)
          const dateWrap = this.container.querySelector('#field-car-pickup-date-wrap');
          const datePop = this.container.querySelector('#popover-car-dates');
          if (dateWrap && datePop) {
            setTimeout(() => this.togglePopover(dateWrap, datePop), 150);
          }
        }
      });
    }

    // Drop-off Location (for different dropoff)
    const dWrap = this.container.querySelector('#field-car-dropoff-loc-wrap');
    const dInput = this.container.querySelector('#car-dropoff-loc-input');
    const dPop = this.container.querySelector('#popover-car-dropoff-loc');

    if (dInput && dPop) {
      dInput.addEventListener('focus', () => {
        this.closeAllPopovers();
        dPop.classList.add('open');
        dWrap?.classList.add('is-active-field');
      });

      dInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        this.dropoffLocation = e.target.value;
        dPop.querySelectorAll('.popover-item').forEach(item => {
          const t = item.textContent.toLowerCase();
          item.style.display = (!q || t.includes(q)) ? 'flex' : 'none';
        });
      });

      dPop.addEventListener('click', (e) => {
        const item = e.target.closest('.popover-item');
        if (item) {
          const val = item.getAttribute('data-val') || item.querySelector('.popover-primary')?.textContent;
          dInput.value = val.trim();
          this.dropoffLocation = val.trim();
          this.closeAllPopovers();
          this.triggerChange();
        }
      });
    }
  }

  // 2. Different Drop-off Toggle
  initDiffDropoffToggle() {
    const chk = this.container.querySelector('#chk-different-location');
    const dropoffWrap = this.container.querySelector('#field-car-dropoff-loc-wrap');
    const grid = this.container.querySelector('#form-car-search');

    if (chk && dropoffWrap && grid) {
      chk.addEventListener('change', (e) => {
        this.isDiffDropoff = e.target.checked;
        if (this.isDiffDropoff) {
          dropoffWrap.style.display = 'flex';
          grid.classList.add('has-diff-dropoff');
          setTimeout(() => {
            const dInput = this.container.querySelector('#car-dropoff-loc-input');
            const dPop = this.container.querySelector('#popover-car-dropoff-loc');
            if (dInput && dPop) this.togglePopover(dropoffWrap, dPop);
          }, 100);
        } else {
          dropoffWrap.style.display = 'none';
          grid.classList.remove('has-diff-dropoff');
        }
        this.triggerChange();
      });
    }
  }

  // 3. Driver Age Toggle
  initDriverAgeToggle() {
    const chk = this.container.querySelector('#chk-driver-age');
    const ageWrap = this.container.querySelector('#driver-age-custom-wrap');
    const ageInput = this.container.querySelector('#driver-age-input');

    if (chk && ageWrap) {
      chk.addEventListener('change', (e) => {
        this.isStandardAge = e.target.checked;
        if (!this.isStandardAge) {
          ageWrap.style.display = 'inline-flex';
          if (ageInput) ageInput.focus();
        } else {
          ageWrap.style.display = 'none';
          this.driverAge = 30;
        }
        this.triggerChange();
      });
    }

    if (ageInput) {
      ageInput.addEventListener('input', (e) => {
        this.driverAge = parseInt(e.target.value, 10) || 25;
        this.triggerChange();
      });
    }
  }

  // 4. Date Picker Popover (Dual Month with Range & Times)
  initDatePicker() {
    const pDateWrap = this.container.querySelector('#field-car-pickup-date-wrap');
    const dDateWrap = this.container.querySelector('#field-car-dropoff-date-wrap');
    const popover = this.container.querySelector('#popover-car-dates');

    if (!popover) return;

    // Opening from either Pick-up or Drop-off field
    [pDateWrap, dDateWrap].forEach(wrap => {
      wrap?.addEventListener('click', (e) => {
        if (e.target.closest('.search-dropdown-popover')) return;
        this.togglePopover(pDateWrap || wrap, popover);
        this.renderCalendars();
      });
    });

    // Apply / Done Button
    this.container.querySelector('#btn-car-dates-done')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllPopovers();
      this.updateDisplays();
      this.triggerChange();
    });

    this.renderCalendars();
  }

  renderCalendars() {
    const container = this.container.querySelector('#car-datepicker-months-container');
    if (!container) return;

    const m1 = new Date(this.currentMonthDate);
    const m2 = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);

    container.innerHTML = `
      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <button type="button" class="cal-nav-btn" id="car-cal-prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
          <span class="cal-month-title">${this.getMonthName(m1)} ${m1.getFullYear()}</span>
          <span class="cal-nav-spacer"></span>
        </div>
        ${this.generateMonthGrid(m1)}
      </div>

      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <span class="cal-nav-spacer"></span>
          <span class="cal-month-title">${this.getMonthName(m2)} ${m2.getFullYear()}</span>
          <button type="button" class="cal-nav-btn" id="car-cal-next-btn"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        ${this.generateMonthGrid(m2)}
      </div>
    `;

    // Navigation buttons
    container.querySelector('#car-cal-prev-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
      this.renderCalendars();
    });

    container.querySelector('#car-cal-next-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
      this.renderCalendars();
    });

    // Day clicks and hover
    container.querySelectorAll('.cal-day-cell:not(.disabled):not(.empty)').forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const cellDate = new Date(dateStr);

      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDateClick(cellDate);
      });

      cell.addEventListener('mouseenter', () => {
        if (this.pickupDate && !this.dropoffDate) {
          this.hoverDate = cellDate;
          this.highlightHoverRange();
        }
      });
    });

    // Update rental duration badge in header
    const days = this.getRentalDays();
    const durationBadge = this.container.querySelector('#car-rental-duration-badge');
    if (durationBadge) {
      durationBadge.textContent = `${days} Day${days > 1 ? 's' : ''} Rental`;
    }
  }

  generateMonthGrid(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = `
      <div class="calendar-weekdays">
        ${weekDays.map(d => `<span>${d}</span>`).join('')}
      </div>
      <div class="calendar-days-grid">
    `;

    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="cal-day-cell empty"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);

      const isPast = dateObj < today;
      const isStart = this.pickupDate && this.isSameDay(dateObj, this.pickupDate);
      const isEnd = this.dropoffDate && this.isSameDay(dateObj, this.dropoffDate);
      const isInRange = this.pickupDate && this.dropoffDate && dateObj > this.pickupDate && dateObj < this.dropoffDate;

      let classes = ['cal-day-cell'];
      if (isPast) classes.push('disabled');
      if (isStart) classes.push('is-start');
      if (isEnd) classes.push('is-end');
      if (isInRange) classes.push('is-in-range');

      const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      html += `<div class="${classes.join(' ')}" data-date="${dateIso}">${day}</div>`;
    }

    html += `</div>`;
    return html;
  }

  handleDateClick(date) {
    if (!this.pickupDate || (this.pickupDate && this.dropoffDate)) {
      this.pickupDate = date;
      this.dropoffDate = null;
      this.renderCalendars();
      this.updateDisplays();
    } else if (this.pickupDate && !this.dropoffDate) {
      if (date < this.pickupDate) {
        this.pickupDate = date;
        this.dropoffDate = null;
        this.renderCalendars();
        this.updateDisplays();
      } else {
        this.dropoffDate = date;
        this.renderCalendars();
        this.updateDisplays();
        this.triggerChange();
      }
    }
  }

  highlightHoverRange() {
    const container = this.container.querySelector('#car-datepicker-months-container');
    if (!container || !this.pickupDate || this.dropoffDate) return;

    container.querySelectorAll('.cal-day-cell:not(.disabled):not(.empty)').forEach(cell => {
      const cellDate = new Date(cell.getAttribute('data-date'));
      if (cellDate > this.pickupDate && cellDate <= this.hoverDate) {
        cell.classList.add('is-hover-range');
      } else {
        cell.classList.remove('is-hover-range');
      }
    });
  }

  // 5. Time Selectors (30-minute intervals)
  initTimeSelectors() {
    const pSel = this.container.querySelector('#select-car-pickup-time');
    const dSel = this.container.querySelector('#select-car-dropoff-time');

    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        const str = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        times.push(str);
      }
    }

    if (pSel) {
      pSel.innerHTML = times.map(t => `<option value="${t}" ${t === '10:00 AM' ? 'selected' : ''}>${t}</option>`).join('');
      pSel.addEventListener('change', (e) => {
        this.pickupTime = e.target.value;
        this.updateDisplays();
        this.triggerChange();
      });
    }

    if (dSel) {
      dSel.innerHTML = times.map(t => `<option value="${t}" ${t === '10:00 AM' ? 'selected' : ''}>${t}</option>`).join('');
      dSel.addEventListener('change', (e) => {
        this.dropoffTime = e.target.value;
        this.updateDisplays();
        this.triggerChange();
      });
    }
  }

  updateDisplays() {
    const pInput = this.container.querySelector('#car-pickup-date');
    const dInput = this.container.querySelector('#car-dropoff-date');

    if (pInput && this.pickupDate) {
      pInput.value = `${this.formatShortDate(this.pickupDate)}, ${this.pickupTime}`;
    }

    if (dInput) {
      if (this.dropoffDate) {
        dInput.value = `${this.formatShortDate(this.dropoffDate)}, ${this.dropoffTime}`;
      } else {
        dInput.value = `Select drop-off date`;
      }
    }

    const durationBadge = this.container.querySelector('#car-rental-duration-badge');
    if (durationBadge) {
      const days = this.getRentalDays();
      durationBadge.textContent = `${days} Day${days > 1 ? 's' : ''} Rental`;
    }
  }

  getRentalDays() {
    if (!this.pickupDate || !this.dropoffDate) return 3;
    const diff = Math.max(1, Math.round((this.dropoffDate - this.pickupDate) / (1000 * 60 * 60 * 24)));
    return diff;
  }

  getState() {
    return {
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.isDiffDropoff ? this.dropoffLocation : this.pickupLocation,
      isDiffDropoff: this.isDiffDropoff,
      pickupDate: this.pickupDate,
      dropoffDate: this.dropoffDate,
      pickupDateFormatted: this.pickupDate ? this.formatShortDate(this.pickupDate) : '',
      dropoffDateFormatted: this.dropoffDate ? this.formatShortDate(this.dropoffDate) : '',
      pickupTime: this.pickupTime,
      dropoffTime: this.dropoffTime,
      rentalDays: this.getRentalDays(),
      driverAge: this.isStandardAge ? '25 - 70' : this.driverAge
    };
  }

  triggerChange() {
    const state = this.getState();
    if (typeof this.onChange === 'function') {
      this.onChange(state);
    }
  }

  getMonthName(date) {
    return date.toLocaleString('en-US', { month: 'long' });
  }

  formatShortDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}

// ==========================================================================
// 4. ATTRACTIONS SEARCHBOX SYSTEM
// ==========================================================================

export class AttractionsSearchbox {
  constructor(options = {}) {
    this.container = options.container || document;
    this.onSearch = options.onSearch || null;
    this.onChange = options.onChange || null;

    const today = new Date();
    this.currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    this.destination = options.initialDestination || '';

    this.init();
  }

  init() {
    this.bindPopovers();
    this.initDestination();
    this.initDatePicker();
    this.updateDisplays();
  }

  bindPopovers() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown')) {
        this.closeAllPopovers();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPopovers();
      }
    });
  }

  closeAllPopovers() {
    this.container.querySelectorAll('.search-dropdown-popover').forEach(pop => {
      pop.classList.remove('open');
    });
    this.container.querySelectorAll('.travel-search-field').forEach(f => {
      f.classList.remove('is-active-field');
    });
  }

  togglePopover(fieldWrap, popover) {
    const wasOpen = popover.classList.contains('open');
    this.closeAllPopovers();
    if (!wasOpen) {
      popover.classList.add('open');
      fieldWrap.classList.add('is-active-field');
    }
  }

  initDestination() {
    const wrap = this.container.querySelector('#field-attr-destination-wrap');
    const input = this.container.querySelector('#input-attr-destination');
    const popover = this.container.querySelector('#popover-attr-destination');

    if (!input || !popover) return;

    input.addEventListener('focus', () => {
      this.closeAllPopovers();
      popover.classList.add('open');
      wrap?.classList.add('is-active-field');
    });

    input.addEventListener('input', (e) => {
      this.destination = e.target.value.trim();
      const q = this.destination.toLowerCase();
      popover.querySelectorAll('.popover-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
      });
      this.triggerChange();
    });

    popover.addEventListener('click', (e) => {
      const item = e.target.closest('.popover-item');
      if (item) {
        const val = item.getAttribute('data-val') || item.querySelector('.popover-primary')?.textContent;
        this.destination = val.trim();
        input.value = this.destination;
        this.closeAllPopovers();
        this.triggerChange();

        // Auto open datepicker
        const dateWrap = this.container.querySelector('#field-attr-dates-wrap');
        const datePop = this.container.querySelector('#popover-attr-dates');
        if (dateWrap && datePop) {
          setTimeout(() => {
            this.togglePopover(dateWrap, datePop);
            this.renderCalendars();
          }, 150);
        }
      }
    });
  }

  initDatePicker() {
    const dateWrap = this.container.querySelector('#field-attr-dates-wrap');
    const popover = this.container.querySelector('#popover-attr-dates');

    if (!dateWrap || !popover) return;

    dateWrap.addEventListener('click', (e) => {
      if (e.target.closest('.search-dropdown-popover')) return;
      this.togglePopover(dateWrap, popover);
      this.renderCalendars();
    });

    this.container.querySelector('#btn-attr-dates-done')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllPopovers();
      this.updateDisplays();
      this.triggerChange();
    });

    this.renderCalendars();
  }

  renderCalendars() {
    const container = this.container.querySelector('#attr-datepicker-months-container');
    if (!container) return;

    const m1 = new Date(this.currentMonthDate);
    const m2 = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);

    container.innerHTML = `
      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <button type="button" class="cal-nav-btn" id="attr-cal-prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
          <span class="cal-month-title">${this.getMonthName(m1)} ${m1.getFullYear()}</span>
          <span class="cal-nav-spacer"></span>
        </div>
        ${this.generateMonthGrid(m1)}
      </div>

      <div class="calendar-month-col">
        <div class="calendar-month-header">
          <span class="cal-nav-spacer"></span>
          <span class="cal-month-title">${this.getMonthName(m2)} ${m2.getFullYear()}</span>
          <button type="button" class="cal-nav-btn" id="attr-cal-next-btn"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        ${this.generateMonthGrid(m2)}
      </div>
    `;

    container.querySelector('#attr-cal-prev-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
      this.renderCalendars();
    });

    container.querySelector('#attr-cal-next-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
      this.renderCalendars();
    });

    container.querySelectorAll('.cal-day-cell:not(.disabled):not(.empty)').forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const cellDate = new Date(dateStr);

      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedDate = cellDate;
        this.updateDisplays();
        this.renderCalendars();
        this.triggerChange();
        setTimeout(() => {
          this.closeAllPopovers();
        }, 200);
      });
    });
  }

  generateMonthGrid(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    let html = `
      <div class="cal-grid">
        <div class="cal-weekdays-row">
          ${weekDays.map(w => `<div class="cal-weekday">${w}</div>`).join('')}
        </div>
        <div class="cal-days-grid">
    `;

    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="cal-day-cell empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const isPast = dateObj < today;
      const isSelected = this.selectedDate && this.isSameDay(dateObj, this.selectedDate);

      let classes = ['cal-day-cell'];
      if (isPast) classes.push('disabled');
      if (isSelected) classes.push('selected-start', 'selected-end');

      const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      html += `
        <div class="${classes.join(' ')}" data-date="${dateIso}">
          <span>${day}</span>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
    return html;
  }

  updateDisplays() {
    const input = this.container.querySelector('#input-attr-dates');
    if (input && this.selectedDate) {
      input.value = this.formatShortDate(this.selectedDate);
    }
  }

  setDestination(city) {
    this.destination = city;
    const input = this.container.querySelector('#input-attr-destination');
    if (input) {
      input.value = city;
    }
    this.triggerChange();
  }

  getState() {
    return {
      destination: this.destination,
      date: this.selectedDate,
      dateFormatted: this.selectedDate ? this.formatShortDate(this.selectedDate) : ''
    };
  }

  triggerChange() {
    const state = this.getState();
    if (typeof this.onChange === 'function') {
      this.onChange(state);
    }
  }

  getMonthName(date) {
    return date.toLocaleString('en-US', { month: 'long' });
  }

  formatShortDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}



