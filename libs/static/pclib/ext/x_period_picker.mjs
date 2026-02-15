import { PiCoComponent } from "../cmps/pc_component.mjs";

class XPeriodPicker extends PiCoComponent {
    css() {
        return `
            :host {
                display:inline-block;
                font:14px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
                outline: none!important;
            }
            :host(:focus) {
            }
            :host([disabled]) {
                opacity:.6;
                pointer-events:none;
            }
            .field {
                position:relative;
                width: 240px;
            }
            input {
                width:100%;
                box-sizing:border-box;
                padding:4px 64px 4px 9px;
                border:1px solid #cbd5e1;
                border-radius: .25em;
                background:#fff; color:#0f172a;
                font-size: inherit;
            }
            input:focus {
                outline:none;
                border-color:#6366f1;
                box-shadow:0 0 0 3px #6366f122;
            }
            .btns {
                position:absolute;
                top:0;
                right:0;
                height:100%;
                display:flex;
                gap:2px;
                align-items:center;
                padding:0 2px;
            }
            .icon, .clear{
                border:1px solid #e2e8f0;
                background:#f8fafc;
                border-radius: .25em;
                height:22px;
                cursor:pointer;
                color:#475569;
            }
            .icon:hover, .clear:hover {
                background:#eef2ff;
            }
            icon {
                font-family: SymbolsRounded;
                font-size: 1em;
            }
            .popup {
                position:absolute;
                z-index:999999;
                margin-top:2px;
                min-width: 220px;
                background:#fff;
                color:#0f172a;
                border:1px solid #e2e8f0;
                border-radius:12px;
                box-shadow:0 12px 34px #00000018;
                padding:10px;
                display:none;
            }
            .popup.open {
                display:block;
            }
            .cal-head {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:8px;
                margin-bottom:6px;
            }
            .nav { display:flex; gap:6px; }
            .nav button {
                border:1px solid #e2e8f0; background:#f8fafc; border-radius:8px;
                width:24px; height:24px; cursor:pointer; font-size: 1.2em;
            }
            .title { font-weight:600; flex:1; text-align:center; }
            .grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; }
            .dow { text-align:center; font-size: 1em; color:#64748b; padding:3px 0; }
            .day {
                border:0; background:#f8fafc; border-radius:8px; padding:8px 0;
                cursor:pointer; text-align:center; position:relative; font-size:.9em;
            }
            .day:hover { background:#eef2ff; }
            .day[aria-disabled="true"] { cursor:not-allowed; opacity:.35; }
            .day.range { background:#e0e7ff; }
            .day.start, .day.end { background:#4f46e5; color:#fff; }
            .day.start::after, .day.end::after {
                content:''; position:absolute; top:0; bottom:0; width:8px; background:transparent;
            }
            .day.start::after { right:-4px; background:linear-gradient(to right, #4f46e5, #e0e7ff); }
            .day.end::after { left:-4px; background:linear-gradient(to left, #4f46e5, #e0e7ff); }
            .day.today { outline:1px dashed #4f46e566; outline-offset:-3px; }
            .sr-only { position:absolute; left:-9999px; }
            button {font-size: inherit}
        `
    }

    htm() {
        return `
            <div class="field">
                <input type="text" part="input" readonly
                    aria-haspopup="dialog" aria-expanded="false" aria-controls="cal" autocomplete="off"
                    placeholder="Seleziona periodo">
                <div class="btns">
                    <button class="clear" type="button" title="Pulisci" aria-label="Pulisci">✕</button>
                    <button class="icon" type="button" title="Apri calendario" aria-label="Apri calendario"><icon>date_range</icon></button>
                </div>
                <div class="popup" id="cal" role="dialog" aria-modal="true">
                    <div class="cal-head">
                        <div class="nav">
                            <button type="button" data-nav="-12" aria-label="Anno precedente">«</button>
                            <button type="button" data-nav="-1" aria-label="Mese precedente">‹</button>
                        </div>
                        <div class="title" aria-live="polite"></div>
                        <div class="nav">
                            <button type="button" data-nav="1" aria-label="Mese successivo">›</button>
                            <button type="button" data-nav="12" aria-label="Anno successivo">»</button>
                        </div>
                    </div>
                    <div class="grid dow"></div>
                    <div class="grid days" role="grid" aria-label="Calendario"></div>
                </div>
            </div>
        `
    }

    onCreation() {
        this._locale = 'it-IT' || navigator.language || 'it-IT';
        this._firstDay = 1; // 1=Mon, 0=Sun
        this._start = null; // Date
        this._end = null;   // Date
        this._min = null;
        this._max = null;
        this._hover = null; // Date (preview while picking end)
        this._open = false;
        this._visibleMonth = this._strip(new Date());

        // Refs
        this.$input = this.shadowRoot.querySelector('input');
        this.$icon = this.shadowRoot.querySelector('.icon');
        this.$clear = this.shadowRoot.querySelector('.clear');
        this.$pop = this.shadowRoot.querySelector('.popup');
        this.$title = this.shadowRoot.querySelector('.title');
        this.$dow = this.shadowRoot.querySelector('.grid.dow');
        this.$days = this.shadowRoot.querySelector('.grid.days');

        // Events
        this.$icon.addEventListener('click', () => this.toggle());
        this.$clear.addEventListener('click', () => this.clear());
        this.$input.addEventListener('click', () => this.open());
        this.$input.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); this.open(); this._focusFirst(); } });
        this.shadowRoot.addEventListener('click', e => e.stopPropagation());
        document.addEventListener('click', () => this.close());
        this.$pop.addEventListener('keydown', (e) => this._onGridKey(e));
        this.$pop.querySelectorAll('.nav button').forEach(b => b.addEventListener('click', () => {
            const d = Number(b.dataset.nav) || 0; this._addMonths(d); this._render();
            this._focusSelectedOrFirst();
        }));
    }

    onConnected() {
        if (this.hasAttribute('locale')) this._locale = this.getAttribute('locale') || this._locale;
        if (this.hasAttribute('first-day')) this._firstDay = Number(this.getAttribute('first-day')) === 0 ? 0 : 1;
        if (this.hasAttribute('min')) this._min = this._parseISO(this.getAttribute('min'));
        if (this.hasAttribute('max')) this._max = this._parseISO(this.getAttribute('max'));
        if (this.hasAttribute('start')) this.start = this.getAttribute('start');
        if (this.hasAttribute('end')) this.end = this.getAttribute('end');
        if (this.hasAttribute('placeholder')) this.$input.placeholder = this.getAttribute('placeholder') || this.$input.placeholder;
        this._renderDOW(); this._render();
        this._updateInput();
    }

    static get observedAttributes() {
        return ['start', 'end', 'min', 'max', 'locale', 'first-day', 'disabled', 'placeholder', 'noclear'];
    }
    attributeChangedCallback(name, _o, n) {
        switch (name) {
            case 'locale': this._locale = n || this._locale; this._renderDOW(); this._render(); this._updateInput(); break;
            case 'first-day': this._firstDay = Number(n) === 0 ? 0 : 1; this._renderDOW(); this._render(); break;
            case 'min': this._min = n ? this._parseISO(n) : null; this._render(); break;
            case 'max': this._max = n ? this._parseISO(n) : null; this._render(); break;
            case 'start': this.start = n || ''; break;
            case 'end': this.end = n || ''; break;
            case 'disabled':
                if (this.hasAttribute('disabled')) { this.$input.setAttribute('disabled', ''); }
                else { this.$input.removeAttribute('disabled'); }
                break;
            case 'placeholder':
                this.$input.placeholder = n || this.$input.placeholder; break;
                break;
            case 'noclear':
                this.$clear.style.display = n != null ? 'none' : 'inline'
                break
        }
    }

    // Public API
    open() { if (!this._open) { this._open = true; this.$pop.classList.add('open'); this.$input.setAttribute('aria-expanded', 'true'); this._render(); this._focusSelectedOrFirst(); } }
    close() { if (this._open) { this._open = false; this.$pop.classList.remove('open'); this.$input.setAttribute('aria-expanded', 'false'); this._hover = null; this.dispatchEvent(new CustomEvent('close')) } }
    toggle() { this._open ? this.close() : this.open(); }

    get start() { return this._start ? this._iso(this._start) : ''; }
    set start(v) {
        const d = this._toDate(v);
        this._start = d; if (this._start) this._visibleMonth = new Date(this._start.getFullYear(), this._start.getMonth(), 1);
        if (this._end && this._start && this._end < this._start) this._end = this._start;
        this._reflect('start', this.start || null);
        this._render(); this._updateInput();
    }
    get end() { return this._end ? this._iso(this._end) : ''; }
    set end(v) {
        const d = this._toDate(v);
        this._end = d;
        if (this._start && this._end && this._end < this._start) this._start = this._end;
        this._reflect('end', this.end || null);
        this._render(); this._updateInput();
    }
    get min() { return this._min ? this._iso(this._min) : ''; }
    set min(v) { this._min = this._toDate(v); this._reflect('min', this.min || null); this._render(); }
    get max() { return this._max ? this._iso(this._max) : ''; }
    set max(v) { this._max = this._toDate(v); this._reflect('max', this.max || null); this._render(); }

    clear() {
        const changed = !!(this._start || this._end);
        this._start = this._end = this._hover = null;
        this._reflect('start', null); this._reflect('end', null);
        this._updateInput(); this._render();
        if (changed) this._emitChange();
    }

    // Rendering
    _renderDOW() {
        this.$dow.innerHTML = '';
        const fmt = new Intl.DateTimeFormat(this._locale, { weekday: 'short' });
        const base = new Date(Date.UTC(2025, 0, 5)); // Sunday
        for (let i = 0; i < 7; i++) {
            const d = new Date(base); d.setUTCDate(base.getUTCDate() + ((i + (this._firstDay === 1 ? 1 : 0)) % 7));
            const div = document.createElement('div');
            div.className = 'dow';
            div.textContent = fmt.format(d).replace(/\.$/, '').toUpperCase();
            this.$dow.appendChild(div);
        }
    }

    _render() {
        // header
        const monthFmt = new Intl.DateTimeFormat(this._locale, { month: 'long', year: 'numeric' });
        this.$title.textContent = monthFmt.format(this._visibleMonth);

        // days
        const year = this._visibleMonth.getFullYear();
        const month = this._visibleMonth.getMonth();
        const first = new Date(year, month, 1);
        const startIdx = (first.getDay() - (this._firstDay === 1 ? 1 : 0) + 7) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalCells = 42;
        const today = this._strip(new Date());

        this.$days.innerHTML = '';
        this.$days.setAttribute('tabindex', '-1');

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('button');
            cell.className = 'day'; cell.type = 'button'; cell.setAttribute('role', 'gridcell');

            let d;
            if (i < startIdx) {
                const prevDays = new Date(year, month, 0).getDate();
                const dayNum = prevDays - startIdx + i + 1;
                d = new Date(year, month - 1, dayNum);
                cell.textContent = String(dayNum);
                cell.style.opacity = '.35';
            } else if (i >= startIdx + daysInMonth) {
                const dayNum = i - (startIdx + daysInMonth) + 1;
                d = new Date(year, month + 1, dayNum);
                cell.textContent = String(dayNum);
                cell.style.opacity = '.35';
            } else {
                const dayNum = i - startIdx + 1;
                d = new Date(year, month, dayNum);
                cell.textContent = String(dayNum);
            }


            cell.dataset.iso = this._iso(d)


            const disabled = (this._min && d < this._min) || (this._max && d > this._max);
            if (disabled) { cell.setAttribute('aria-disabled', 'true'); cell.disabled = true; }

            if (this._same(d, today)) cell.classList.add('today');

            // range classes
            const [a, b] = this._rangeForPaint();
            if (a && b) {
                if (this._same(d, a)) cell.classList.add('start');
                if (this._same(d, b)) cell.classList.add('end');
                if (d > a && d < b) cell.classList.add('range');
            }

            // interactions
            cell.addEventListener('click', () => {
                if (disabled) return;
                this._onDayClick(d);
            });
            cell.addEventListener('mouseenter', () => {
                if (this._start && !this._end && !disabled) { this._hover = d; this._paintHover(); }
            });
            cell.addEventListener('mouseleave', () => {
                if (this._start && !this._end) { this._hover = null; this._paintHover(); }
            });

            this.$days.appendChild(cell);
        }
    }

    _paintHover() {
        // Aggiorna solo le classi range/start/end senza ricreare tutto
        const btns = this.$days.querySelectorAll('.day');
        const [a, b] = this._rangeForPaint();
        btns.forEach(btn => {
            btn.classList.remove('start', 'end', 'range');
            const d = this._parseISO(btn.dataset.iso);
            if (a && b) {
                if (this._same(d, a)) btn.classList.add('start');
                if (this._same(d, b)) btn.classList.add('end');
                if (d > a && d < b) btn.classList.add('range');
            }
        });
    }

    _onDayClick(d) {
        // 1° click → start; 2° click → end (swap se necessario); 3° click → ricomincia da start
        if (!this._start || (this._start && this._end)) {
            this._start = this._strip(d); this._end = null; this._hover = null;
        } else if (this._start && !this._end) {
            const a = this._strip(this._start), b = this._strip(d);
            if (this._min && b < this._min) return;
            if (this._max && b > this._max) return;
            if (b >= a) { this._end = b; } else { this._end = a; this._start = b; }
            this._hover = null;
            // emit change
            this._reflect('start', this.start || null);
            this._reflect('end', this.end || null);
            this._updateInput();
            this._emitChange();
            this.close();
        }
        // keep month aligned to chosen date
        this._visibleMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        this._render();
    }

    // Keyboard navigation in popup
    _onGridKey(e) {
        const active = this.shadowRoot.activeElement?.classList.contains('day') ? this.shadowRoot.activeElement : null;
        const move = (delta) => {
            const base = active ? this._parseISO(active.dataset.iso) : this._strip(new Date());
            const d = new Date(base); d.setDate(d.getDate() + delta);
            if (d.getMonth() !== this._visibleMonth.getMonth() || d.getFullYear() !== this._visibleMonth.getFullYear()) {
                this._visibleMonth = new Date(d.getFullYear(), d.getMonth(), 1);
                this._render();
            }
            const target = this.shadowRoot.querySelector(`.day[data-iso="${this._iso(d)}"]`);
            if (target && !target.disabled) target.focus();
        };
        switch (e.key) {
            case 'Escape': this.close(); this.$input.focus(); break;
            case 'PageUp': e.preventDefault(); this._addMonths(-1); this._render(); this._focusSelectedOrFirst(); break;
            case 'PageDown': e.preventDefault(); this._addMonths(1); this._render(); this._focusSelectedOrFirst(); break;
            case 'Home': e.preventDefault(); this._moveToStartOfWeek(active); break;
            case 'End': e.preventDefault(); this._moveToEndOfWeek(active); break;
            case 'ArrowLeft': e.preventDefault(); move(-1); break;
            case 'ArrowRight': e.preventDefault(); move(1); break;
            case 'ArrowUp': e.preventDefault(); move(-7); break;
            case 'ArrowDown': e.preventDefault(); move(7); break;
            case 'Enter':
            case ' ':
                if (active) {
                    e.preventDefault();
                    const d = this._parseISO(active.dataset.iso);
                    if (active.getAttribute('aria-disabled') !== 'true') this._onDayClick(d);
                }
                break;
        }
    }

    _moveToStartOfWeek(active) {
        const el = active || this.$days.querySelector('.day[aria-disabled="false"]');
        if (!el) return;
        const d = this._parseISO(el.dataset.iso);
        const dow = (d.getDay() - (this._firstDay === 1 ? 1 : 0) + 7) % 7;
        d.setDate(d.getDate() - dow);
        if (d.getMonth() !== this._visibleMonth.getMonth()) this._visibleMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        this._render();
        this.shadowRoot.querySelector(`.day[data-iso="${this._iso(d)}"]`)?.focus();
    }
    _moveToEndOfWeek(active) {
        const el = active || this.$days.querySelector('.day[aria-disabled="false"]');
        if (!el) return;
        const d = this._parseISO(el.dataset.iso);
        const dow = (d.getDay() - (this._firstDay === 1 ? 1 : 0) + 7) % 7;
        d.setDate(d.getDate() + (6 - dow));
        if (d.getMonth() !== this._visibleMonth.getMonth()) this._visibleMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        this._render();
        this.shadowRoot.querySelector(`.day[data-iso="${this._iso(d)}"]`)?.focus();
    }

    _focusSelectedOrFirst() {
        const a = this.shadowRoot.querySelector('.day.start');
        const b = this.shadowRoot.querySelector('.day[aria-disabled="false"]');
        (a || b)?.focus();
    }
    _focusFirst() { this._focusSelectedOrFirst(); }

    // Helpers
    _rangeForPaint() {
        if (this._start && this._end) return [this._start, this._end];
        if (this._start && this._hover) {
            const a = this._hover >= this._start ? this._start : this._hover;
            const b = this._hover >= this._start ? this._hover : this._start;
            return [a, b];
        }
        return [null, null];
    }
    _updateInput() {
        const s = this._start ? this._fmt(this._start) : '';
        const e = this._end ? this._fmt(this._end) : '';
        this.$input.value = (s || e) ? `${s || '-'} - ${e || '-'}` : '';
    }
    _emitChange() {
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            detail: { start: this.start || null, end: this.end || null }
        }));
    }
    _reflect(attr, val) {
        //if (val == null || val === '') this.removeAttribute(attr); else this.setAttribute(attr, String(val));
    }
    _addMonths(delta) { const y = this._visibleMonth.getFullYear(), m = this._visibleMonth.getMonth(); this._visibleMonth = new Date(y, m + delta, 1); }
    _strip(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    _same(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    _iso(d) { const m = d.getMonth() + 1, day = d.getDate(); return `${d.getFullYear()}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
    _parseISO(s) { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return null; return new Date(+m[1], +m[2] - 1, +m[3]); }
    _toDate(v) { if (!v) return null; if (v instanceof Date) return this._strip(v); const d = this._parseISO(v); return d ? this._strip(d) : null; }
    _fmt(d) { try { return new Intl.DateTimeFormat(this._locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d); } catch { return this._iso(d); } }
}

customElements.define('x-period-picker', XPeriodPicker);
export default XPeriodPicker;
