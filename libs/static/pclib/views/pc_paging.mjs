/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: PCApp.mjs
 *  Description: App Widget - The root widget of the application
 */


import { PiCoContainer } from '../cmps/pc_container.mjs';
import { PiCoButton } from '../cmps/pc_button.mjs';

export class PiCoPaging extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                position: relative;
                box-sizing: border-box;
                display: flex;
                border: 0px solid var(--bdc);
                outline: none!important;
                gap: .2em;
                width: 100%;
            }
            label {
                flex: 1;
                color: hsl(0, 0%, 30%);
                white-space: nowrap;
            }
            page-buttons {
                display: inline-flex;
                gap: .2em;
            }
            pc-button {
                --btn-bgc: white;
                --btn-fgc: black;
                border: .5px solid var(--bdc);
                width: fit-content;
                background-color: var(--app-bgc);
            }
            page-buttons > pc-button {
                width: 3em;
            }
            pc-button:not([icon]) {
                min-width: 1.5em;
                padding: 0;
            }
            pc-button.selezionato {
                background-color: hsla(215, 92%, 61%, 1.00);
                color: white;
            }
            pc-button:hover {
                background-color: hsla(215, 92%, 61%, 1.00);
                color: white;
            }
            pc-button[disabled] {
                --btn-fgc: hsl(0, 0%, 70%);
                --btn-bgc: hsl(0, 0%, 90%);
                border-color: hsl(0, 0%, 80%);
                pointer-events: none;
                --display: none;
            }
        `
    }
    htm() {
        return `
            <label>Showing 1 to 10 of 107</label>
            <pc-button id="previous-button" icon="chevron_left" text="Previous"></pc-button>
            <page-buttons>
                <pc-button text="1" class="selezionato" ></pc-button>
                <pc-button text="2" ></pc-button>
                <pc-button text="3" ></pc-button>
                <pc-button text="4" ></pc-button>
                <pc-button text="5" ></pc-button>
            </page-buttons>
            <pc-button id="next-button" icon="chevron_right" text="Next" style="flex-direction: row-reverse"></pc-button>
        `
    }

    onCreation() {
        const root = this.shadowRoot;
        this.label = root.querySelector('label');
        this.previousBtn = root.querySelector('pc-button#previous-button');
        this.nextBtn = root.querySelector('pc-button#next-button');

        this.opts = {
            _numRecords: 127,
            _pageSize: 10,
            _currentPage: 1,
            _totalPages: Math.ceil(127 / 10),
            _groupSize: 5,
            _firstGroupPage: 1
        }
        this.createPageButtons();

        this.buttons = root.querySelectorAll('page-buttons > pc-button');

        this.update();

        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.opts._currentPage = parseInt(button.getAttribute('text'));
                this.buttons.forEach(btn => btn.classList.remove('selezionato'));
                button.classList.add('selezionato');
                this.update();
            });
        });
        this.previousBtn.addEventListener('click', () => {
            // if (this.opts._firstGroupPage === 1) return;
            if (this.opts._currentPage > this.opts._firstGroupPage) {
                this.opts._currentPage -= 1;
                this.update();
                return;
            }
            this.opts._firstGroupPage -= this.opts._groupSize;
            this.opts._currentPage = this.opts._firstGroupPage + this.opts._groupSize - 1;
            this.update();
        })

        this.nextBtn.addEventListener('click', () => {
            // if (this.opts._firstGroupPage + this.opts._groupSize > this.opts._totalPages) return;
            if (this.opts._currentPage < this.opts._firstGroupPage + this.opts._groupSize - 1 &&
                this.opts._currentPage < this.opts._totalPages) {
                this.opts._currentPage += 1;
                this.update();
                return;
            }
            this.opts._firstGroupPage += this.opts._groupSize;
            this.opts._currentPage = this.opts._firstGroupPage;
            this.update();
        })
    }

    setNumRecords(n, pageSize = 10) {
        this.opts._numRecords = n
        this.opts._pageSize = pageSize
        this.opts._totalPages = Math.ceil(n / pageSize)
        this.opts._currentPage = n == 0 ? 0 : 1
        this.update()
    }

    createPageButtons() {
        const pageButtonsContainer = this.shadowRoot.querySelector('page-buttons');
        pageButtonsContainer.innerHTML = '';
        for (let i = 1; i <= this.opts._groupSize; i++) {
            const btn = new PiCoButton();
            btn.setAttribute('text', i);
            if (i === this.opts._currentPage) btn.classList.add('selezionato');
            pageButtonsContainer.appendChild(btn);
        }
    }

    update() {
        this.updateLabel();
        this.updateButtons();
        const ne = new CustomEvent('show-page')
        ne.page = this.opts
        this.dispatchEvent(ne)
    }
    updateLabel() {
        const { _numRecords, _pageSize, _currentPage } = this.opts;
        const startRecord = _currentPage == 0 ? 0 : (_currentPage - 1) * _pageSize + 1;
        const endRecord = Math.min(_currentPage * _pageSize, _numRecords);
        this.label.textContent = `Showing ${startRecord} to ${endRecord} of ${_numRecords}`;
    };

    updateButtons() {
        this.buttons.forEach((btn, i) => {
            btn.classList.remove('selezionato')
            if (this.opts._firstGroupPage + i > this.opts._totalPages) {
                btn.setAttribute('disabled', '');
                btn.setAttribute('text', '-');
            } else {
                btn.removeAttribute('disabled');
                btn.setAttribute('text', this.opts._firstGroupPage + i);
            }
        });
        if (this.opts._currentPage == 0) {
            this.previousBtn.setAttribute('disabled', '')
            this.nextBtn.setAttribute('disabled', '')
            return;
        }
        const curpage = (this.opts._currentPage - 1) % this.opts._groupSize;
        this.buttons[curpage].classList.add('selezionato');

        const { _currentPage, _groupSize, _totalPages } = this.opts;
        if (_currentPage === 1) this.previousBtn.setAttribute('disabled', '')
        else this.previousBtn.removeAttribute('disabled');
        if (_currentPage >= _totalPages) this.nextBtn.setAttribute('disabled', '')
        else this.nextBtn.removeAttribute('disabled');
    }

}

try { customElements.define('pc-paging', PiCoPaging) } catch { }