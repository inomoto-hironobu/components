const ns = {
	'' : 'http://www.w3.org/1999/xhtml',
	'mathml': 'http://www.w3.org/1998/Math/MathML'
};
const nsResolver = function nsResolver(prefix) {
	return ns[prefix] || null;
};

const parser = new DOMParser();

const settings = {
	base:null,
	children:null
}

/*開発中*/
class Version extends HTMLElement {
	constructor() {
		this.attachShadow({mode:"closed"}).appendChild(document.createTextNode("1.0.0"));
	}
}

class Settings extends HTMLElement {
	constructor() {
		super();
		settings.base = this.getAttribute("base");
		settings.children = this.childNodes;
	}
}
customElements.define("yaohata-setting",Settings);

/*開発中*/
class Description extends HTMLElement {
	constructor() {
		super();
		const value = document.evaluate("//meta[@name='description']/@content",document,nsResolver,XPathResult.STRING_TYPE,null).stringValue;
		this.attachShadow({mode:"closed"}).shadowRoot.appendChild(document.createTextNode(value));
	}
}

/*開発中*/
class Modified extends HTMLElement {

}

class Twitter extends HTMLElement {
	constructor() {
		super();

		const arg = {
			name:"twitter",
			defaultTemplate:`<a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" t:data-url="" data-show-count="false">Tweet</a><script async="" src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
			params:{
				"data-url":document.URL
			}
		 }
		 exec(this,arg);
	}
}
customElements.define("twitter-button",Twitter);

class Facebook extends HTMLElement {

	constructor() {
		super();

		const arg = {
			name:"facebook",
			defaultTemplate:`<div class="fb-share-button" t:data-href="" data-layout="button_count" data-size="small"><a target="_blank" t:href="" class="fb-xfbml-parse-ignore">シェアする</a></div>`,
			params:{
				"url":document.URL
			}
		 }
		 exec(this,arg);
	}
}
customElements.define("facebook-button",Facebook);

class Line extends HTMLElement {
	constructor() {
		super();
		
		const arg = {
			name:"line",
			defaultTemplate:`<div class="line-it-button" data-lang="ja" data-type="share-a" data-env="REAL" t:data-url="" data-color="default" data-size="small" data-count="true" data-ver="3" style="display: none;"></div>
			<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>`,
			params:{
				"data-url":document.URL
			}
		 }
		 exec(this,arg);
	}
}
customElements.define("line-button",Line);

/*開発中*/
class Ogp extends HTMLElement {
	constructor() {
		super();
	}
}

class Quote extends HTMLElement {
	constructor(){
		super();
		
		const defaultTemplate = document.createDocumentFragment();
		defaultTemplate.innerHTML=`<blockquote><t:content/><p><cite><a t:url=""><t:title/></a></cite></p></blockquote>`
		
		const arg = {
			name:"quote",
			defaultTemplate:defaultTemplate,
			params:{
				"path":this.getAttribute("path"),
				"target":this.getAttribute("target")
			}
		}
		exec(arg);
	}
}
customElements.define("i-quote",Quote);

function exec(customElement,arg){
	//文字列のHTMLをいったんtemplate要素を作って挿入し、DocumentFragmentを取り出す
	let string = "<template xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:t=\"urn:template\">"+arg.defaultTemplate+"</template>";
	let temp = parser.parseFromString(string,"application/xml");
	console.log(temp.documentElement);
	let defaultTemplate = temp.documentElement.content;

	//カスタム要素にtemplate属性がある場合を優先し、次にsettings要素での設定を見て、それでなければデフォルトのテンプレートを使う
	let templateName = customElement.getAttribute("template");
	if(!templateName) {
		settings.children.forEach((e)=>{
			if(e.nodeName == arg.name && e.querySelector("template")) {
				templateName = e.querySelector("tempalte").textContent;
			}
		})
	}
	template = templateName?document.getElementById(templateName).content:defaultTemplate;

	const options = {
		stylesheetLocation: settings.base+arg.name+".sef.json",
		//template要素はからのためcontentプロパティでDocumentFragmentを取得する
		sourceNode: template,
		stylesheetParams:arg.params,
		destination:"document"
	};

	SaxonJS.transform(options, "async")
	.then(d=>{
		console.log(d);
		switch(arg.mode) {
			case "replace":
				customElement.replaceWith(d.principalResult);
				break;
			case "shadow":
				customElement.attachShadow({mode:"open"})
				//
				.appendChild(d.principalResult);
				break;
			default:
				customElement.replaceWith(d.principalResult);
		}
	 }).catch(v=>{
		console.log(v);
	 });
}
