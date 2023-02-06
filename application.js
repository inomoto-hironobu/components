window.addEventListener("DOMContentLoaded",(e)=>{
    customElements.define("graph-application",GraphApplication);
});
class BarchartRace extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(document.createTextNode("test"));
        console.log(this.childNodes);
    }
}