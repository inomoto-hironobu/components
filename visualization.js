window.addEventListener("DOMContentLoaded",(e)=>{
    customElements.define("pie-chart",PieChart);
    customElements.define("line-graph",LineGraph);
    customElements.define("bar-graph",BarGraph);
});

class PieChart extends HTMLElement {
    constructor() {
        super();
        const csvPath = this.getAttribute("csv");
        const col = this.getAttribute("col");
        const row = this.getAttribute("row");
        
        const root = document.createElement("div");
        const target = this;
        d3
        .csv(csvPath)
        .then((data)=>{
            console.log(data);
            const obj = data.filter((e)=>e[col]==row)[0];

            const xpath = 
            //{'a':1,'b':2...}から任意の
            "map:remove(.,'"+col+"')"
            //[{'name':'a','value':1},{'name':'b','value':2}...
            +"=>map:for-each(function($a,$b){map{'name':$a,'value':number($b)}})";
            const dataset = SaxonJS.XPath.evaluate(xpath,obj);
            console.log(dataset);
            var width = this.getAttribute("width"); // グラフの幅
            var height = this.getAttribute("height"); // グラフの高さ
            var radius = Math.min(width, height) / 2 - 10;
            var color = d3.scaleOrdinal()
            .range(["#DC3912", "#3366CC", "#109618", "#FF9900", "#990099"]);

            const circle = d3.select(root)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox","0 0 "+width+" "+height);
            const attributes = target.querySelector("attributes");
            for(let name of attributes.getAttributeNames()) {
                console.log(target.getAttribute(name));
                circle.attr(name,attributes.getAttribute(name));
            }

            const g = circle.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            const pie = d3.pie()
            .value((d)=>d.value)
            .sort(null);

            const pieGroup = g.selectAll(".pie")
            .data(pie(dataset))
            .enter()
            .append("g")
            .attr("class","pie");

            const text = d3.arc()
                .outerRadius(radius - 30)
                .innerRadius(radius - 30);
            
            const arc = d3.arc()
                .outerRadius(radius)
                .innerRadius(0);
             
            pieGroup.append("path")
                .attr("d", arc)
                .attr("fill", (d)=>color(d.index))
                .attr("opacity", 0.75)
                .attr("stroke", "white");
            
            pieGroup.append("text")
                .attr("fill", "black")
                .attr("transform", function(d) { return "translate(" + text.centroid(d) + ")"; })
                .attr("dy", "5px")
                .attr("font", "10px")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.data.name; });
            target.replaceWith(root);
        })
    }
}

class LineGraph extends HTMLElement {
    constructor() {
        super();
        const root = document.createElement("div");
        const target = this;
        const csvPath = this.getAttribute("csv");

        d3
        .csv(csvPath)
        .then((data)=>{
            console.log(data);
            
            var width = 400; // グラフの幅
            var height = 300; // グラフの高さ
            var margin = { "top": 30, "bottom": 60, "right": 30, "left": 60 };
            // 2. SVG領域の設定
            var svg = d3.select(root).append("svg").attr("width", width).attr("height", height);

            // 3. 軸スケールの設定
            var xScale = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return d['日付']; })])
                .range([margin.left, width - margin.right]);
            
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return ; })])
                .range([height - margin.bottom, margin.top]);
            
            // 4. 軸の表示
            var axisx = d3.axisBottom(xScale).ticks(5);
            var axisy = d3.axisLeft(yScale).ticks(5);

            const lines = this.getElementsByTagName("line");
            console.log(lines);
            for(let i = 0; i<lines.length; i++) {
                const line = lines[i];
                const dataset = [];
                const name = line.getAttribute("col");
                for(let j = 0; j<data.length; j++) {
                    dataset.push([j*10,parseInt(data[j][name])]);
                }
                console.log(dataset);
                
                
                // 5. ラインの表示
                svg.append("path")
                .datum(dataset)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) {
                    console.log(xScale(d[0]));
                     return xScale(d[0]); })
                .y(function(d) {
                    console.log(yScale(d[1]));
                     return yScale(d[1]); }));

            }
            
            console.log(dataset);
            

            
            svg.append("g")
                .attr("transform", "translate(" + 0 + "," + (height - margin.bottom) + ")")
                .call(axisx)
                .append("text")
                .attr("fill", "black")
                .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
                .attr("y", 35)
                .attr("text-anchor", "middle")
                .attr("font-size", "10pt")
                .attr("font-weight", "bold")
                .text("X Label");
            
            svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + 0 + ")")
                .call(axisy)
                .append("text")
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
                .attr("y", -35)
                .attr("transform", "rotate(-90)")
                .attr("font-weight", "bold")
                .attr("font-size", "10pt")
                .text("Y Label");
            

            target.replaceWith(root);
        });
    }
}

class BarGraph extends HTMLElement {
    constructor() {
        super();
        const csvPath = this.getAttribute("csv");
        const dataset = [1,2,3];
        d3
        .csv(csvPath)
        .then((data)=>{
            d3.select("body")
            .selectAll("p")
            .data(dataset)
            .enter()
            .append("p")
            .text("Hello!");
        });
    }
}

class StackedBarchart extends HTMLElement {
    constructor() {
        super();
        const csvPath = this.getAttribute("csv");
        const dataset = [1,2,3];
        d3
        .csv(csvPath)
        .then((data)=>{
            d3.select("body")
            .selectAll("p")
            .data(dataset)
            .enter()
            .append("p")
            .text("Hello!");
        });
    }
}