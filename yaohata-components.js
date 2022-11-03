const yaohata = {};
yaohata.ns = {
	'' : 'http://www.w3.org/1999/xhtml',
	'mathml': 'http://www.w3.org/1998/Math/MathML'
};
yaohata.nsResolver = function nsResolver(prefix) {
	return yaohata.ns[prefix] || null;
};

const parser = new DOMParser();

const settings = {
	base:null,
	children:null
}

class Setting extends HTMLElement {
	constructor() {
		super();
		settings.base = this.getAttribute("base");
		settings.children = this.childNodes;
		console.log(settings);
	}
}
customElements.define("yaohata-setting",Setting);


/*開発中*/
class Version extends HTMLElement {
	constructor() {
		this.replaceWith(document.createTextNode("1.1.0"));
	}
}

/*meta name="description"の表示*/
class Description extends HTMLElement {
	constructor() {
		super();
		const value = document.evaluate("//meta[@name='description']/@content",document,yaohata.nsResolver,XPathResult.STRING_TYPE,null).stringValue;
		this.replaceWith(document.createTextNode(value));
	}
}
customElements.define("the-description",Description);

/*開発中*/
class Modified extends HTMLElement {
	constructor() {
		super();
		const value = document.evaluate("//meta[@name='modified']/@content",document,yaohata.nsResolver,XPathResult.STRING_TYPE,null).stringValue;
		this.replaceWith(document.createTextNode(value));
	}
}
customElements.define("the-modified",Modified);

class Twitter extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element:this,
			name:"twitter",
			defaultTemplate:`<a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" yc:data-url="" data-show-count="false">Tweet</a><script async="" src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
			params:{
				"data-url":document.URL
			}
		 }
		 exec(arg);
	}
}
customElements.define("twitter-button",Twitter);

class Facebook extends HTMLElement {

	constructor() {
		super();

		const arg = {
			element:this,
			name:"facebook",
			defaultTemplate:`<div class="fb-share-button" yc:data-href="" data-layout="button_count" data-size="small"><a target="_blank" yc:href="" class="fb-xfbml-parse-ignore">シェアする</a></div>`,
			params:{
				"url":document.URL
			}
		 }
		 exec(arg);
	}
}
customElements.define("facebook-button",Facebook);

class Line extends HTMLElement {
	constructor() {
		super();
		
		const arg = {
			element:this,
			name:"line",
			defaultTemplate:`<div class="line-it-button" data-lang="ja" data-type="share-a" data-env="REAL" yc:data-url="" data-color="default" data-size="small" data-count="true" data-ver="3" style="display: none;"></div>
			<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>`,
			params:{
				"data-url":document.URL,
				"text":""
			}
		 }
		 exec(arg);
	}
}
customElements.define("line-button",Line);

/*OGPを表示する*/
class Ogp extends HTMLElement {
	constructor() {
		super();

		const arg = {
			element:this,
			name:"ogp",
			defaultTemplate:`<div><img yc:image="" width="64"/><a yc:url=""><yc:title/></a><div><yc:description/></div></div>`,
			params:{
				"path":this.getAttribute("path")
			}
		}
		exec(arg);
	}
}
customElements.define("internal-ogp",Ogp);

class Quote extends HTMLElement {
	constructor(){
		super();
		
		const arg = {
			element:this,
			name:"quote",
			defaultTemplate:`<blockquote><yc:content/><p><cite><a yc:url=""><yc:title/></a></cite></p></blockquote>`,
			params:{
				"path":this.getAttribute("path"),
				"target":this.getAttribute("target")
			}
		}
		exec(arg);
	}
}
customElements.define("internal-quote",Quote);

class Source extends HTMLElement {
	constructor(){
		super();

		const arg = {
			element:this,
			name:"quote",
			defaultTemplate:`<pre><yc:content/></pre>`,
			params:{
				"path":this.getAttribute("path"),
				"from":this.getAttribute("from")||"",
				"to":this.getAttribute("to")||""
			}
		}
		exec(arg);
	}
}

function exec(arg){
	//文字列のHTMLをいったんtemplate要素を作って挿入し、DocumentFragmentを取り出す
	let string = "<template xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:yc=\"urn:yaohata-components\">"+arg.defaultTemplate+"</template>";
	let temp = parser.parseFromString(string,"application/xml");
	console.log(temp.documentElement);
	let defaultTemplate = temp.documentElement.content;
	document.importNode(defaultTemplate,true);

	//カスタム要素にtemplate属性がある場合を優先し、次にsettings要素での設定を見て、それでなければデフォルトのテンプレートを使う
	let templateName = arg.element.getAttribute("template");
	if(!templateName) {
		console.log(settings);
		settings.children.forEach((e)=>{
			if(e.nodeName == arg.name && e.querySelector("template")) {
				templateName = e.querySelector("tempalte").textContent;
			}
		});
	}
	let template = templateName?document.getElementById(templateName).content:defaultTemplate;

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
				arg.element.replaceWith(d.principalResult);
				break;
			case "shadow":
				arg.element.attachShadow({mode:"open"})
				//
				.appendChild(d.principalResult);
				break;
			default:
				arg.element.replaceWith(d.principalResult);
		}
	 }).catch(v=>{
		console.log(v);
	 });
}
