window.addEventListener("DOMContentLoaded",(e)=>{
    customElements.define("pie-chart",PieChart);
    customElements.define("line-graph",LineGraph);
    customElements.define("bar-graph",BarGraph);
    //customElements.define("h-bar",HBar);
});
class HBar extends HTMLElement {
	constructor() {
		super();
		const value = this.getAttribute("value");
		
		const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
		const root = d3.select(svg);
		root
		.data({value:value})
		.enter()
		.append("rect")
		.attr("x",(d)=>{return 0;})
		.attr("y",(d)=>{return 0;})
		.attr("width",(d)=>{
			
		})
		.attr("height",this.getAttribute("height"))
		.attr("fill","stillblue");
		this.replaceWith(svg);
	}
}
class PieChart extends HTMLElement {
    constructor() {
        super();
        const executor = function(arg) {
			console.log(arg.dataset);
            var width = arg.width; // グラフの幅
            var height = arg.height; // グラフの高さ
            var radius = Math.min(width, height) / 2 - 10;
            var color = d3.scaleOrdinal()
            .range(["#DC3912", "#3366CC", "#109618", "#FF9900", "#990099"]);
            
            const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");

            const circle = d3.select(svg)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox","0 0 "+width+" "+height);

            const g = circle.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            const pie = d3.pie()
            .value((d)=>d.value)
            .sort(null);

            const pieGroup = g.selectAll(".pie")
            .data(pie(arg.dataset))
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
            return svg;
            
		};
        const target = this;
        //
        const jsonE = this.querySelector("json");
        let json = null;
        console.log(jsonE);
        if(jsonE) {
			json = JSON.parse(jsonE.textContent);
			console.log(json);
			const arg = {
				width:this.getAttribute("width"),
				height:this.getAttribute("height"),
				dataset:json
			}
			const svg = executor(arg);
			const attributes = target.querySelector("attributes");
            if(attributes) {
                for(let name of attributes.getAttributeNames()) {
                    svg.setAttribute(name,attributes.getAttribute(name));
                }
            }
			target.replaceWith(svg);
		} else if(this.getAttribute("csv")) {
			const csvPath = this.getAttribute("csv");
			const col = this.getAttribute("col");
        	const row = this.getAttribute("row");
        	d3
	        .csv(csvPath)
	        .then((data)=>{
	            console.log(data);
	            let obj = [];
	            obj.push(data);
	            let xpath = 
	            ".[1]"
	            +"=>array:filter(function($a){$a?"+col+"='"+row+"'})"
	            +"=>array:head()"
	            //{'a':1,'b':2...}から任意の
	            +"=>map:remove('"+col+"')"
	            //[{'name':'a','value':1},{'name':'b','value':2}...
	            +"=>map:for-each(function($a,$b){map{'name':$a,'value':number($b)}})";
	            const dataset = SaxonJS.XPath.evaluate(xpath,obj);
	            console.log(dataset);
	            const arg = {
					width:this.getAttribute("width"),
					height:this.getAttribute("height"),
					dataset:dataset
				}
	            const svg = executor(arg);
	            const attributes = target.querySelector("attributes");
	            if(attributes) {
	                for(let name of attributes.getAttributeNames()) {
	                    svg.setAttribute(name,attributes.getAttribute(name));
	                }
	            }
	            target.replaceWith(svg);
	        })
		}
        
        
        
    }
}

class LineGraph extends HTMLElement {
    constructor() {
        super();
        const root = document.createElement("div");
        const target = this;
        const csvPath = this.getAttribute("csv");
        const max = this.getAttribute("max");
        const min = this.getAttribute("min");
        const x = this.getAttribute("x");
        const labelx = this.getAttribute("labelx");
        const labely = this.getAttribute("labely");
        console.log(x);
        d3
        .csv(csvPath)
        .then((data)=>{
            console.log(data);
            
            var width = 400; // グラフの幅
            var height = 300; // グラフの高さ
            var margin = { "top": 30, "bottom": 60, "right": 30, "left": 60 };
            var color = d3.scaleOrdinal()
            .range(["#DC3912", "#3366CC", "#109618", "#FF9900", "#990099"]);

            // 2. SVG領域の設定
            var svg = d3.select(root).append("svg").attr("width", width).attr("height", height);

            // 3. 軸スケールの設定
            var xScale = d3.scaleLinear()
                .domain([2000, 2020])
                .range([margin.left, width - margin.right]);
            
            var yScale = d3.scaleLinear()
                .domain([min, max])
                .range([height - margin.bottom, margin.top]);
            
            // 4. 軸の表示
            var axisx = d3.axisBottom(xScale).ticks(5);
            var axisy = d3.axisLeft(yScale).ticks(5);

            const lines = this.getElementsByTagName("line");
            for(let i = 0; i<lines.length; i++) {
                const line = lines[i];
                const name = line.getAttribute("col");

                // 5. ラインの表示
                svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", (d)=>color(i))
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x((d)=>xScale(d[x]))
                .y(function(d) {
                    console.log(d[name]);
                    return yScale(d[name]); }));

            }

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
                .text(labelx);
            
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
                .text(labely);
            

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
class ChartRace extends HTMLElement {
    constructor() {
        super();
        const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);
        const updateBars = bars(svg);
        const updateAxis = axis(svg);
        const updateLabels = labels(svg);
        const updateTicker = ticker(svg);
        const keyframes = [];
        let ka, a, kb, b;
        for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
            for (let i = 0; i < k; ++i) {
            const t = i / k;
            keyframes.push([
                new Date(ka * (1 - t) + kb * t),
                rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
            ]);
            }
        }
        keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);

        for (let keyframe of keyframes) {
            const transition = svg.transition()
                .duration(duration)
                .ease(d3.easeLinear);

            // Extract the top bar’s value.
            x.domain([0, keyframe[1][0].value]);

            updateAxis(keyframe, transition);
            updateBars(keyframe, transition);
            updateLabels(keyframe, transition);
            updateTicker(keyframe, transition);

            invalidation.then(() => svg.interrupt());
            transition.end();
        }
    }
    bars(svg) {
        let bar = svg.append("g")
            .attr("fill-opacity", 0.6)
            .selectAll("rect");
        
        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
            enter => enter.append("rect")
                .attr("fill", color)
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", d => y((prev.get(d) || d).rank))
                .attr("width", d => x((prev.get(d) || d).value) - x(0)),
            update => update,
            exit => exit.transition(transition).remove()
                .attr("y", d => y((next.get(d) || d).rank))
                .attr("width", d => x((next.get(d) || d).value) - x(0))
            )
            .call(bar => bar.transition(transition)
            .attr("y", d => y(d.rank))
            .attr("width", d => x(d.value) - x(0)));
    }
    labels(svg) {
    let label = svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text");
    
    return ([date, data], transition) => label = label
        .data(data.slice(0, n), d => d.name)
        .join(
        enter => enter.append("text")
            .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
            .attr("y", y.bandwidth() / 2)
            .attr("x", -6)
            .attr("dy", "-0.25em")
            .text(d => d.name)
            .call(text => text.append("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .attr("x", -6)
            .attr("dy", "1.15em")),
        update => update,
        exit => exit.transition(transition).remove()
            .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
            .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
        )
        .call(bar => bar.transition(transition)
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
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