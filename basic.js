window.defs = {};

window.addEventListener("DOMContentLoaded",(e)=>{
	customElements.define("the-version", Version);
	customElements.define("window-def", Definition);
	customElements.define("window-ref", Reference);
	customElements.define("x-path", XPath);
	customElements.define("console-log", ConsoleLog);
	customElements.define("meta-content", MetaContent);
});

/*開発中*/
class Version extends HTMLElement {
	constructor() {
		this.replaceWith(document.createTextNode("1.2.0"));
	}
}

class Title extends HTMLElement {

}

/*meta name="**"の表示*/
class MetaContent extends HTMLElement {
	constructor() {
		super();
		const elem = this;
		const value = function (dom) {
			return dom.evaluate("//meta[@name='" + elem.getAttribute("name") + "']/@content", dom, yaohata.nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		}
		const path = this.getAttribute("path");
		let dom;
		if (path) {
			fetch(path)
				.then((response) => response.text())
				.then((data) => {
					//テキストからHTMLをパースし、value関数で値を取得、テキストノードを作り、置き換える
					this.replaceWith(document.createTextNode(value(parser.parseFromString(data, "text/html"))));
				});
		} else {
			this.replaceWith(document.createTextNode(value(document)));
		}
	}
}


class Definition extends HTMLElement {
	constructor() {
		super();
		//name属性は必須、無ければエラーを投げる
		const name = this.getAttribute("name");
		if(!name) throw new Error("nameがない");

		let target;
		//ref属性があるなら参照する
		if(this.hasAttribute("ref")) {
			target = document.getElementById(this.getAttribute("ref"));
		} else {
			target = this;
		}
		if(this.hasAttribute("value")) {
			window.defs[name] = this.getAttribute("value");
		} else if(this.hasAttribute("type")) {
			const type = this.getAttribute("type");
			
			if(type=="string") {
				window.defs[name] = target.textContent;
			} else if(type=="dom") {
				const f = document.createDocumentFragment();
				let c = null;
				while(c = target.firstChild) {
					f.appendChild(c);
				}
				window.defs[name] = f;
			} else if(type=="json") {
				window.defs[name] = JSON.parse(target.textContent);
			}
		} else {
			window.defs[name] = target.textContent;
		}
		this.remove();
	}
}

class Reference extends HTMLElement {
	constructor() {
		super();

		const name = this.getAttribute("name");
		if(!name) throw new Error("nameがない");

		this.replaceWith(window.defs[name]);
	}
}

class Framexs extends HTMLElement {

}
class SaxonTransfomer extends HTMLElement {
	constructor() {
		super();
		const params = {};
		this.querySelectorAll("param").forEach(param=>{
			params[param.getAttribute("name")] = param.getAttribute("value");
		});
		if(this.getAttribute("html")) {

		}
		const options = {
			stylesheetLocation: this.getAttribute("stylesheetLocation"),
			//template要素はからのためcontentプロパティでDocumentFragmentを取得する
			sourceNode: this.getAttribute("sourceNode"),
			stylesheetParams: params,
			destination: "document"
		};
		SaxonJS.transform(options,"async").then(d=>{

		});
	}
}
/**
 * 
 */
class ConsoleLog extends HTMLElement {
	constructor() {
		super();
		let content;
		if(this.hasAttribute("ref")) {
			const target = document.getElementById(this.getAttribute("ref"));
			if(target) content = target.textContent;
		} else {
			content = this.textContent;
		}
		let val;
		if(this.hasAttribute("type")) {
			const type = this.getAttribute("type");
			if(type=="string") {
				val = content;
			} else if(type=="dom") {
				const f = document.createDocumentFragment();
				let c = null;
				while(c = this.firstChild) {
					f.appendChild(c);
				}
				val = f;
			} else if(type=="json") {
				val = JSON.parse(content);
			} else if(type=="xpath") {

				try {
					val = SaxonJS.XPath.evaluate(content, document, {
						params:{
							"self":this,
							"defs":window.defs
						},
						xpathDefaultNamespace: "http://www.w3.org/1999/xhtml"
					});
				} catch(e){
					console.error(content + ":");
					console.error(e);
				}
				
			}
		} else {
			val = content;
		}
		console.log(val);
		this.remove();
	}
}

/**
 * SaxonJSのXPath機能を使う
 */
class XPath extends HTMLElement {
	constructor() {
		super();
		let xpath;
		//ref属性があるならwindow.defsから、その値の変数をXPathとする。
		const ref = this.getAttribute("ref");
		if(ref) {
			if(typeof defs[ref] == 'string') {
				xpath = window.defs[ref];
			} else {
				console.error(defs[ref]);
				throw new Error("定義変数がstringでない。");
			}
		} else {
			xpath = this.textContent;
		}
		//console.log(xpath);
		const shadow = this.attachShadow({mode:"open"});
		//documentをコンテキストに、自身をself、window.defsをdefsにバインドする
		let result = SaxonJS.XPath.evaluate(xpath, document, {
			params:{
				"self":this,
				"defs":window.defs
			},
			xpathDefaultNamespace: "http://www.w3.org/1999/xhtml"
		});
		//console.log(result);
		
		//result要素を作り,結果を付け加える
		const resultnode = document.createElement("result");
		if(result instanceof Node) {
			const resultclone = result.cloneNode(true);
			resultnode.append(resultclone);
			//console.log(resultclone);
		} else {
			resultnode.append(result);
		}
		this.appendChild(resultnode);

		shadow.append(result);
		
		
		//self.replaceWith(result);

	}
}
/**/
class FetchHtml extends HTMLElement {
	constructor() {
		super();

		const elem = this;
		const path = this.getAttribute("path");
		const target = this.getAttribute("target");

		fetch(this.getAttribute("path"))
			.then((response) => new DOMParser().parseFromString(response.text(), 'text/html'))
			.then((html) => {
				
			});
	}
}
