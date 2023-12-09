const parser = new DOMParser();

const yaohata_components_location_href = SaxonJS.XPath.evaluate("//link[@rel='yaohata-components-location']/@href",document,{
	xpathDefaultNamespace: "http://www.w3.org/1999/xhtml"
})
let yaohata_components_location;
if(yaohata_components_location_href) {
	yaohata_components_location = yaohata_components_location_href.value;
	console.log("yaohata_components_location:"+yaohata_components_location);
} else {
	console.error("yaohata_components_location is not defined.");
}

window.addEventListener("DOMContentLoaded", function() {
	if(yaohata_components_location) {
		customElements.define("share-buttons", ShareButtons);
		customElements.define("internal-quote", InternalQuote);
		
		customElements.define("internal-ogp", InternalOgp);

	}
});
class UtilityRendering extends HTMLElement {
	constructor() {
		super();
		if(this.getAttribute("template")) {
			fetch(this.getAttribute("template"))
			.then(response => response.text())
			.then(data => {

			});
		}
	}
}
class ShareButtons extends HTMLElement {
	constructor() {
		super();
		const self = this;
		template(this)
		.then(template=>{
			const params = {
				params:{
					"url": encodeURIComponent(document.URL),
					"title": document.querySelector('title').textContent,
					"text": encodeURIComponent(this.getAttribute("text"))
				}
			}
			transform(template, params)
			.then(f=>{
				self.replaceWith(f);
			}).catch(v => {
				console.log(v);
			});
		});
	}
}
class Youtube extends HTMLElement {
	constructor() {
		super();
		const id = this.getAttribute("id");
		const self = this;
		template(this)
		.then(template=>{
			const params = {
				params:{
					"id": id
				}
			}
			transform(template, params)
			.then(f=>{
				self.replaceWith(f);
			}).catch(v => {
				console.log(v);
			});
		});
	}
}



/**
 * json-loop
 */
class JsonLoop extends HTMLElement {
	constructor() {
		super();
		const xpath = this.getAttribute("xpath");
		const path = this.getAttribute("path");
		const self = this;
		
	}
}


class FigureImage extends HTMLElement {
	constructor() {
		super();
	}
}
//customElements.define("figure-image",FigureImage);

/*OGPを表示する*/
class InternalOgp extends HTMLElement {

	constructor() {
		super();
		const self = this;
		const path = this.getAttribute("path");
		const templatePath = this.getAttribute("template");
		const type = this.getAttribute("type");
		if(!(path && templatePath)) {
			throw new Error("");
		}
		fetch(templatePath)
		.then(response => response.text())
		.then(text => {
			const template = parser.parseFromString(text, "application/xml");

			fetch(path)
			.then(response=>response.text())
			.then(text=>{
				let dom;
				if(type === "html") {
					dom = parser.parseFromString(text, "text/html");
				} else if(type === "xhtml") {
					dom = parser.parseFromString(text, "application/xhtml+xml");
				}

				const title = SaxonJS.XPath.evaluate("//meta[@property = 'og:title']/@content", dom);
				const description = SaxonJS.XPath.evaluate("//meta[@property = 'og:description']",dom);
				const params = {
					path:path,
					title:title,
					description:description
				};
				transform(template, params)
				.then(fragment=>{
					self.replaceWith(fragment);
				});
			});
			
			
		});
	}
}

class InternalQuote extends HTMLElement {
	constructor() {
		super();
		const elem = this;
		const path = this.getAttribute("path");
		const templatePath = this.getAttribute("template");

		fetch(this.getAttribute("path"))
			.then((response) => response.text())
			.then((data) => {
				const arg = {
					element: this,
					name: "quote",
					sef: "fetch.sef.json",
					defaultTemplate: `<blockquote><yc:content/><p><cite><a yc:href="{path}"><yc:title/></a></cite></p></blockquote>`,
					params: {
						"path": this.getAttribute("path"),
						"target": this.getAttribute("target"),
						"document": parser.parseFromString(data, "text/html")
					}
				}
				exec(arg);
			});
	}
}


class InternalSource extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element: this,
			name: "quote",
			defaultTemplate: `<pre><yc:content/></pre>`,
			params: {
				"path": this.getAttribute("path"),
				"from": this.getAttribute("from") || "",
				"to": this.getAttribute("to") || ""
			}
		}
		exec(arg);
	}
}
async function transform(template, params) {
	const options = {
		stylesheetLocation: yaohata_components_location + '/sef/template.sef.json',
		sourceNode: template,
		stylesheetParams: params,
		destination: "document"
	};

	const result = await SaxonJS.transform(options, "async");
	console.log(result);
	const f = document.createDocumentFragment();
	result.principalResult.childNodes.forEach((e)=>{
		f.append(e.cloneNode(true));
	});
	return f
}
async function template(element) {
	const templatePath = element.getAttribute("template");
	let path;
	let target;
	if(templatePath.indexOf('#') !== -1) {
		const words = templatePath.split('#');
		if(words.length === 2) {
			path = words[0];
			target = words[1];
		} else {
			throw new Error("invalidなパス："+templatePath);
		}
	} else {
		path = templatePath;
	}
	const response = await fetch(path);
	if(response.status !== 200) {
		throw new Error(response);
	}
	const text = await response.text();
	console.log(text);
	const xml = parser.parseFromString(text, "application/xml");
	let template;
	if(!target && SaxonJS.XPath.evaluate("namespace-uri(/*) = 'yaohata-components' and local-name(/*) = 'template'", xml)) {
		template = xml.documentElement;
	} else if(target && SaxonJS.XPath.evaluate("namespace-uri(/*) = 'yaohata-components' and local-name(/*) = 'templates'", xml)) {
		template = SaxonJS.XPath.evaluate("/yc:templates/yc:template[@name=$name][1]", xml, {
			namespaceContext:{yc:'yaohata-components'},
			params:{name: target}
		});
	} else {
		throw new Error("xml is not valid."+xml.documentElement.nodeName);
	}
	return template;
}

function exec(arg) {
	var s = new XMLSerializer();
	var d = document;

	//文字列のHTMLをいったんtemplate要素を作って挿入し、DocumentFragmentを取り出す

	let string = "<template xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:yc=\"urn:yaohata-components\">" + arg.defaultTemplate + "</template>";
	let temp = parser.parseFromString(string, "application/xml");
	let defaultTemplate = temp.documentElement.content;

	//カスタム要素にtemplate属性がある場合を優先し、次にsettings要素での設定を見て、それでなければデフォルトのテンプレートを使う
	let templateName = arg.element.getAttribute("template");
	let template;
	if (!templateName) {
		console.log(get(arg.name, "template"));
		let id = get(arg.name, "template");
		if (id) {
			let t = document.getElementById(id).content;
			let str = s.serializeToString(t);
			let string = "<template xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:yc=\"urn:yaohata-components\">" + str + "</template>";
			const dom = parser.parseFromString(string, "application/xml");
			const f = dom.documentElement.content;
			template = f;
		} else {
			template = defaultTemplate;
		}
	} else {
		let t = document.getElementById(templateName).content;
		let str = s.serializeToString(t);
		let string = "<template xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:yc=\"urn:yaohata-components\">" + str + "</template>";
		const dom = parser.parseFromString(string, "application/xml");
		const f = dom.documentElement.content;
		template = f;
	}
	const options = {
		stylesheetLocation: sefbase + arg.sef,
		//template要素はからのためcontentプロパティでDocumentFragmentを取得する
		sourceNode: template,
		stylesheetParams: arg.params,
		destination: "document"
	};

	SaxonJS.transform(options, "async")
		.then(d => {
			console.log(d);
			console.log(arg.element);
			const f = document.createDocumentFragment();
			d.principalResult.childNodes.forEach((e)=>{
				f.append(e.cloneNode(true));
			});
			arg.element.replaceWith(f);
		}).catch(v => {
			console.log(v);
		});
}
