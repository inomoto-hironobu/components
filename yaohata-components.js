const yaohata = {};
yaohata.ns = {
	'' : 'http://www.w3.org/1999/xhtml',
	'mathml': 'http://www.w3.org/1998/Math/MathML'
};
yaohata.nsResolver = function nsResolver(prefix) {
	return yaohata.ns[prefix] || null;
};

const parser = new DOMParser();

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
	var s = new XMLSerializer();
	var d = document;
	
	//文字列のHTMLをいったんtemplate要素を作って挿入し、DocumentFragmentを取り出す

	let string = "<template xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:yc=\"urn:yaohata-components\">"+arg.defaultTemplate+"</template>";
	let temp = parser.parseFromString(string,"application/xml");
	let defaultTemplate = temp.documentElement.content;

	//カスタム要素にtemplate属性がある場合を優先し、次にsettings要素での設定を見て、それでなければデフォルトのテンプレートを使う
	let templateName = arg.element.getAttribute("template");
	let template;
	if(!templateName) {
		if(setting.c[arg.name] && setting.c[arg.name].template){
			let t = document.getElementById(setting.c[arg.name].template).content;
			var str = s.serializeToString(t);
			let string = "<template xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:yc=\"urn:yaohata-components\">"+str+"</template>";
			const dom = parser.parseFromString(string,"application/xml");
			const f = dom.documentElement.content;
			template = f;
		} else {
			template = defaultTemplate;
		}
	} else {
		template = defaultTemplate;
	}
	console.log(template);
	const options = {
		stylesheetLocation: setting.base+arg.name+".sef.json",
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
				console.log(d.principalResult);
				arg.element.replaceWith(d.principalResult);
		}
	 }).catch(v=>{
		console.log(v);
	 });
}
