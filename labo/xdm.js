const data = 
[
    [
        [1,2,3],
        [4,5,6,7]
    ]
];
let xdm = SaxonJS.XPath.evaluate('count(array:get(.[1], 1))', data);
console.log(xdm);

const data2 = {
    data:[
        [1,2,3],
        [4,5,6]
    ]
}
xdm = SaxonJS.XPath.evaluate('array:size(.?data[1])', data2);
console.log(xdm);

fetch("share.xml")
.then(response=>response.text())
.then(text=>{
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");
    console.log(SaxonJS.XPath.evaluate("namespace-uri(/*) = 'yaohata-components' and local-name(/*) = 'template'", xml));
})
