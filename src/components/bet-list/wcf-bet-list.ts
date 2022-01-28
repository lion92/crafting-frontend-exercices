import css from './wcf-bet-list.scss';
import { getBetList } from "../../business/bets/getBetList";
import { Bet, BetChoice, BetInfo } from "../../models/bet";
import loaderIcon from '../../assets/loader.gif'
import { updateSelectedBets } from '../../business/bets/updateSelectedBets';

const template = document.createElement('template');
template.innerHTML = `
<style>${css}</style>

<div class="loader">
    <img src="${loaderIcon}" alt="loader" />
</div>

<div class="bet-list" hidden>
    <h3>Liste des paris - Football</h3>
</div>
`;

export class BetList extends HTMLElement {
    private bets: Bet[] = [];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' })
            .appendChild(template.content.cloneNode(true));

        window.addEventListener('CLICK_BET', ((event: Event) => {
            const { betInfo, choice } = (event as CustomEvent).detail;
            this.selectBet(betInfo, choice);
        }).bind(this));
    }

    async connectedCallback() {
        const betList: BetInfo[] = await getBetList();

        this.hideLoader();
        this.displayBetList(betList);
    }

    hideLoader() {
        this.shadowRoot!.querySelector<HTMLElement>('.loader')!.style.display = 'none';
    }

    displayBetList(betList: BetInfo[]) {
        const betListElement = this.shadowRoot!.querySelector('.bet-list')!;

        betListElement.removeAttribute('hidden');
        betList.forEach((bet: BetInfo) => {
            betListElement.insertAdjacentHTML('beforeend', `<wcf-bet-item bet='${JSON.stringify(bet)}'></wcf-bet-item>`);
        });
    }

    selectBet(betInfo: BetInfo, choice: BetChoice) {
        const newBets = updateSelectedBets(this.bets, betInfo, choice);
        this.bets = newBets

        window.dispatchEvent(new CustomEvent('UPDATE_BETS', { detail: { bets: newBets } }))
    }
}

customElements.define('wcf-bet-list', BetList);