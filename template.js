const yaohata = {};
yaohata.ns = {
	'h': 'http://www.w3.org/1999/xhtml',
	'mathml': 'http://www.w3.org/1998/Math/MathML',
	's': 'urn:yaohata-components-setting'
};
yaohata.nsResolver = function nsResolver(prefix) {
	return yaohata.ns[prefix] || null;
};

const parser = new DOMParser();
//<link rel="yaohata-components-setting" href="..."/>から設定情報を得る
const setting_loc = SaxonJS.XPath.evaluate("//link[@rel='yaohata-components-setting']/@href",document,{
	xpathDefaultNamespace: "http://www.w3.org/1999/xhtml"
}).value
let setting;
let sefbase;

function get(tag, key) {
	if (setting) {
		return setting.evaluate("/s:setting/s:" + tag + "/s:" + key + "/text()", setting, yaohata.nsResolver, XPathResult.STRING_TYPE, null).stringValue;
	} else {
		fetch(setting_loc)
			.then((res) => parser.parseFromString(res.text(), "application/xml"))
			.then((dom) => {
				setting = dom;
				return get(tag, key);
			});
	}
}
console.log(setting_loc);
fetch(setting_loc)
	.then((res) => res.text())
	.then((text) => {
		setting = parser.parseFromString(text, "application/xml");
		//sefbaseを取得
		sefbase = SaxonJS.XPath.evaluate("/setting/@sefbase",setting,{
			xpathDefaultNamespace: "urn:yaohata-components-setting"
		}).value;
		console.log(sefbase);
		customElements.define(TwitterButton.name, TwitterButton);
		customElements.define("facebook-button", FacebookButton);
		customElements.define("line-button", LineButton);
		customElements.define("linkedin-button", LinkedInButton);
		customElements.define("share-buttons", ShareButtons);
		customElements.define("internal-quote", InternalQuote);
		customElements.define("internal-fetch", InternalFetch);
		customElements.define("internal-ogp", InternalOgp);
		customElements.define("link-url", LinkURL);
		customElements.define("json-loop", JsonLoop);
	})
	.catch((data) => console.error(data));

class ShareButtons extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element: this,
			name: "share-buttons",
			sef: "sns.sef.json",
			defaultTemplate: ``,
			params: {
				"url": encodeURIComponent(document.URL),
				"title": document.querySelector('title').textContent,
				"text": encodeURIComponent(this.getAttribute("text"))
			}
		};
		exec(arg);
	}
}
class Youtube extends HTMLElement {
	constructor() {
		super();
		`<div class="youtube">
		<iframe width="560" height="315" src="https://www.youtube.com/embed/{code}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen=""></iframe>
		</div>`;
	}
}

class LinkURL extends HTMLElement {
	constructor() {
		super();
		const a = document.createElement("a");
		a.setAttribute("href", this.textContent);
		a.appendChild(document.createTextNode(this.textContent));
		for (let attr of this.getAttributeNames()) {
			a.setAttributeNode(attr);
		}
		this.replaceWith(a);
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
		const exec = function (target) {
			try {
				let result = SaxonJS.XPath.evaluate(xpath, target, {
					xpathDefaultNamespace: "http://www.w3.org/1999/xhtml",
					resultForm: "array"
				});

				console.log(result);
				const f = document.createDocumentFragment();
				self.childNodes.forEach((e) => {
					console.log(e);
					f.appendChild(e.cloneNode(true));
				});
				const r = document.createDocumentFragment();
				console.log(f);
				result.forEach(item => {
					const copy = f.cloneNode(true);
					SaxonJS.XPath.evaluate("//val", copy, {
						xpathDefaultNamespace: "http://www.w3.org/1999/xhtml",
						resultForm: "array"
					}).forEach((val) => {
						if (val.getAttribute("xpath")) {
							console.log(item);
							const result = SaxonJS.XPath.evaluate(val.getAttribute("xpath"), item, {
								xpathDefaultNamespace: "http://www.w3.org/1999/xhtml"
							});
							val.replaceWith(document.createTextNode(result));
						} else {
							val.replaceWith(document.createTextNode(item));
						}
					});
					r.appendChild(copy);
					console.log(r);
				});

				self.replaceWith(r);
			} catch (e) {
				console.error(e);
			}

		};
		if (path) {
			fetch(path)
				.then((response) => response.json())
				.then((data) => exec(data));
		} else {
			exec(document);
		}
	}
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
customElements.define("meta-content", MetaContent);

class TwitterButton extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element: this,
			name: "twitter-button",
			sef: "sns.sef.json",
			defaultTemplate: `<a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" yc:data-url="{url}" data-show-count="false">Tweet</a><script async="" src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
			params: {
				"url": document.URL,
				"title": document.querySelector('title').textContent,
				"text": this.getAttribute("text")
			}
		};
		exec(arg);
	}
	static name = "twitter-button";
}


class FacebookButton extends HTMLElement {

	constructor() {
		super();

		const arg = {
			element: this,
			name: "facebook",
			sef: "sns.sef.json",
			defaultTemplate: `<div class="fb-share-button" yc:data-href="{url}" data-layout="button_count" data-size="small"><a target="_blank" yc:href="https://www.facebook.com/sharer/sharer.php?u={url}" class="fb-xfbml-parse-ignore">シェアする</a></div>`,
			params: {
				"url": document.URL,
				"title": document.querySelector('title').textContent,
				"text": this.getAttribute("text")
			}
		}
		exec(arg);
	}
}


class LineButton extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element: this,
			name: "line",
			sef: "sns.sef.json",
			defaultTemplate: `<div class="line-it-button" data-lang="ja" data-type="share-a" data-env="REAL" yc:data-url="{url}" data-color="default" data-size="small" data-count="true" data-ver="3" style="display: none;"></div>
			<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>`,
			params: {
				"url": document.URL,
				"title": document.querySelector('title').textContent,
				"text": this.getAttribute("text")
			}
		}
		exec(arg);
	}
}


class LinkedInButton extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element: this,
			name: "linkedin",
			sef: "sns.sef.json",
			defaultTemplate: `<script src="https://platform.linkedin.com/in.js" type="text/javascript"></script>
			<script type="IN/Share" yc:data-url="{url}"></script><p><a href=""></a></p>
			`,
			params: {
				"url": document.URL,
				"title": document.querySelector('title').textContent,
				"text": this.getAttribute("text")
			}
		}
		exec(arg);
	}
}

class FigureImage extends HTMLElement {
	constructor() {
		super();
	}
}
//customElements.define("figure-image",FigureImage);

/**/
class InternalFetch extends HTMLElement {
	constructor() {
		super();

		const elem = this;
		fetch(this.getAttribute("path"))
			.then((response) => response.text())
			.then((data) => {
				const arg = {
					element: elem,
					name: "internal-fetch",
					sef: "fetch.sef.json",
					defaultTemplate: `<yc:content/>`,
					params: {
						"path": elem.getAttribute("path"),
						"target": elem.getAttribute("target"),
						"template": elem.getAttribute("template"),
						"document": parser.parseFromString(data, "text/html")
					}
				}
				exec(arg);
			});
	}
}

/*OGPを表示する*/
class InternalOgp extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element: this,
			name: "internal-ogp",
			sef: "ogp.sef.json",
			defaultTemplate: `<div><img yc:src="{image}" width="64"/><a yc:href="{path}"><yc:title/></a><div><yc:description/></div></div>`,
			params: {
				"path": this.getAttribute("path")
			}
		}
		exec(arg);
	}
}


class InternalQuote extends HTMLElement {
	constructor() {
		super();
		const elem = this;
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
