window.addEventListener("DOMContentLoaded",(e)=>{
    customElements.define("graph-application",GraphApplication);
    customElements.define("x-path",XPath);
});
class BarchartRace extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(document.createTextNode("test"));
        console.log(this.childNodes);
    }
}
class XPath extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode:'open'});
        const xpath = document.createElement('input');
        xpath.setAttribute("type","text");

        shadowRoot.appendChild(xpath);
    }
}