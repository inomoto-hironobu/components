function getColor() {
	return d3.scaleOrdinal(d3.schemeCategory10);
}

class VBar extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({mode:"open"});
	}
	static get observedAttributes() {
		return ["notdraw"];
	}
    attributeChangedCallback(attr, oldVal, newVal) {
		console.log("changed");
		this.notdraw = this.getAttribute("notdraw");
		if(this.notdraw == null) {
			
			this.width = this.getAttribute("width");
			//もし設定されていないなら親の幅を適用する
			if(!this.width) this.width = this.parentElement.offsetWidth;
	        this.height = this.getAttribute("height");
	        this.rowName = this.getAttribute("row");
	        this.colName = this.getAttribute("col");
	        this.var = this.getAttribute("var");
	        if(this.getAttribute("total")) {
				this.total = Number.parseFloat(this.getAttribute("total"));
			}
			this.exec();
		} else {
			console.log("not draw");
		}
        
	}
	index(table,content) {
		const val = table[0].indexOf(content);
		if(val == -1) {
			return null;
		} else {
			return val;
		}
	}
	exec() {
		const baseData = window.ycv[this.var];
		console.log(baseData);
		const coredata = [2];
		coredata[0] = baseData[0].slice(1,baseData[0].length);
		coredata[1] = baseData[1].slice(1,baseData[1].length);
		const index = this.index(coredata, this.colName);
		
		const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
		const root = d3.select(svg);
		attributes(this, svg);
		const margin = { top: 20, right: 40, bottom: 40, left: 40 };
		//const colors = ["#DC3912", "#3366CC", "#109618", "#FF9900", "#990099"];
		const color = d3.scaleOrdinal(d3.schemeCategory10).domain(coredata[0]);
	    console.log(coredata[1]);
	    
	    const max = d3.max(coredata[1]);
	    const sum = d3.sum(coredata[1]);
	    console.log(max);
	    console.log(sum);
	    const x = d3.scaleLinear()
                .domain([0, max])
	            .nice()
	            .range([0, max/sum*this.width]);
	   	console.log(x(coredata[1][index]));
	   	console.log(index);
	   	
	   	
	   	let v = color(this.colName);
	   	console.log(v);
		root
		.attr('width', this.width)
        .attr('height', this.height)
		.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("width",(d)=>x(coredata[1][index]))
		.attr("height",this.height)
		.attr("fill",v);
		this.shadow.append(svg);
	}
}

class PieChart extends HTMLElement {

    constructor() {
        super();
        
        this.shadow = this.attachShadow({mode:"open"});
        /*
        this.width = this.getAttribute("width");
        this.height = this.getAttribute("height");
        this.rowName = this.getAttribute("row");
        if(this.getAttribute("total")) {
			this.total = Number.parseFloat(this.getAttribute("total"));
		}
        if(this.getAttribute("threshold")) {
			this.threshold = Number.parseFloat(this.getAttribute("threshold"));
		}
        
        this.exec();*/
    }
	static get observedAttributes() {
		return ["src"];
	}
    attributeChangedCallback(attr, oldVal, newVal) {
		console.log("changed");
        this.width = this.getAttribute("width");
        this.height = this.getAttribute("height");
        this.rowName = this.getAttribute("row");
        if(this.getAttribute("total")) {
			this.total = Number.parseFloat(this.getAttribute("total"));
		}
        if(this.getAttribute("threshold")) {
			this.threshold = Number.parseFloat(this.getAttribute("threshold"));
		}
		this.exec();
	}
	exec() {

		while(this.shadow.firstChild) {this.shadow.removeChild(this.shadow.firstChild);}
		console.log(this.shadow);
		try {
	        getData(this)
	        .then((data)=>{
	            console.log(data);
	            const header = data[0];
	            let row;
	            if(this.rowName) {
					let rows = SaxonJS.XPath.evaluate(
						"let $size := array:size(.[1][1])"
						+" return array:filter(.[1], function($r) {$r = $rowName})"
						, [data], {params:{rowName:rowName}});
					console.log(rows);
		            if(rows.length !== 1) {
		                throw new Error("rowsの数："+rows.length);
		            }
		            row = rows[0].slice(1, rows[0].length);
				} else {
					row = data[1].slice(1, data[1].length);
				}
				const total = d3.sum(row);
	            console.log(row);
	            var radius = Math.min(this.width, this.height) / 2 - 10;
	            var color = d3.scaleOrdinal(d3.schemeCategory10).domain(header.slice(1, header.length));
	            
	            const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
	            attributes(this, svg);
	            const main = d3.select(svg)
	            .attr("width", this.width)
	            .attr("height", this.height)
	            .attr("viewBox","0 0 "+this.width+" "+this.height);
	
	            const g = main.append("g")
	            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
	
	            const pie = d3.pie()
	            .value((d)=>{ return d;})
	            .sort(null);
	
	            const pieGroup = g.selectAll(".pie")
	            .data(pie(row))
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
	                .attr("fill", (d)=>color(header[d.index + 1]))
	                .attr("opacity", 0.75)
	                .attr("stroke", "white");
	                
	            pieGroup.append("text")
	                .attr("fill", "black")
	                .attr("transform", function(d) { return "translate(" + text.centroid(d) + ")"; })
	                .attr("dy", "5px")
	                .attr("font", "10px")
	                .attr("text-anchor", "middle")
	                .text((d)=>{
						if(this.threshold !== undefined && (d.value / total) > this.threshold) {
							return header[d.index + 1];
						} else {
							return '';
						}
					});
				this.shadow.append(svg);
	        });
        } catch(e) {
			console.log(e);
		}
	}

}
class BubbleChart extends HTMLElement {
    constructor() {
        super();
        // グラフの設定
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const self = this;
        getData(this)
        .then((data)=>{
            console.log(data);
            const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            attributes(self, svg);
            // SVG要素を作成
            const main = d3.select(svg)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // データの日付をパース
            const parseDate = d3.timeParse('%Y-%m-%d');
            data.forEach(d => {
                d.date = parseDate(d.date);
            });

            // x軸のスケール
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            // y軸のスケール
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .nice()
                .range([height, 0]);

            // ラインジェネレータ
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value));

            // ラインを描画
            main.append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('d', line);

            // x軸の描画
            main.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x));

            // y軸の描画
            main.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(y));
        });
    }
}
class RaderChart extends HTMLElement {
    constructor() {
        super();
        // グラフの設定
        const width = 400;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.bottom);
        const self = this;
        getData(this)
        .then((data)=>{
            console.log(data);
            const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            attributes(self, svg);
            // SVG要素を作成
            const main = d3.select(svg)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

            // レーダーチャートの角度スケール
            const angleScale = d3.scalePoint()
            .range([0, 2 * Math.PI])
            .domain(data.map(d => d.category));

            // レーダーチャートの半径スケール
            const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([0, radius]);

            // レーダーチャートのパスを生成
            const radarLine = d3.lineRadial()
            .curve(d3.curveLinearClosed)
            .angle(d => angleScale(d.category))
            .radius(d => radiusScale(d.value));

            // レーダーチャートの背景円を描画
            main.selectAll('.radar-circle')
            .data([1, 2, 3, 4, 5])
            .enter()
            .append('circle')
            .attr('class', 'radar-circle')
            .attr('r', d => radius * (d / 5));

            // レーダーチャートのデータパスを描画
            main.append('path')
            .datum(data)
            .attr('class', 'radar-path')
            .attr('d', radarLine)
            .attr('fill', 'rgba(0, 0, 255, 0.5)');

            // カテゴリーラベルを描画
            main.selectAll('.category-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'category-label')
            .text(d => d.category)
            .attr('x', 10)
            .attr('y', -10);

            this.replaceWith(svg);
        });
        
    }
}
class CandlestickChart extends HTMLElement {
    constructor() {
        super();
        // グラフの設定
        const width = 800;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        getData(this)
        .then((data)=>{
            console.log(data);
            const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            // SVG要素を作成
            const main = d3.select(svg)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

            // レンジのスケール設定
            const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right]);

            const yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
            .nice()
            .range([height - margin.bottom, margin.top]);

            // キャンドルスティックを描画
            main.selectAll('line')
            .data(data)
            .enter()
            .append('line')
            .attr('x1', d => xScale(d.date))
            .attr('x2', d => xScale(d.date))
            .attr('y1', d => yScale(d.high))
            .attr('y2', d => yScale(d.low))
            .attr('stroke', 'black');

            main.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.date) - 5)
            .attr('y', d => yScale(Math.max(d.open, d.close)))
            .attr('width', 10)
            .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)))
            .attr('fill', d => (d.open > d.close) ? 'red' : 'green');

            // x軸の描画
            main.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

            // y軸の描画
            main.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));

            this.replaceWith(this);
        });
        
    }
}
class DistributionChart extends HTMLElement {
    constructor() {
        super();
        // データ（ランダムなデータを生成）
        const data = d3.range(1000).map(d3.randomNormal(50, 15));

        // グラフの設定
        const width = 600;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };

        // SVG要素を作成
        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // ヒストグラム用のスケール設定
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .nice()
            .range([margin.left, width - margin.right]);

        const histogram = d3.histogram()
            .value(d => d)
            .domain(xScale.domain())
            .thresholds(xScale.ticks(20));

        const bins = histogram(data);

        // ヒストグラムの棒グラフを描画
        svg.selectAll('rect')
            .data(bins)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.x0) + 1)
            .attr('y', d => height - margin.bottom - d.length)
            .attr('width', d => xScale(d.x1) - xScale(d.x0) - 1)
            .attr('height', d => d.length)
            .attr('fill', 'steelblue');

        // x軸の描画
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        // y軸の描画
        svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).nice()));

    }
}

class LineGraph extends HTMLElement {
    constructor() {
        super();
        const width = this.getAttribute("width");
        const height = this.getAttribute("height");
        const tox = this.getAttribute("to-x");
        const fromx = this.getAttribute("from-x");
        const toy = this.getAttribute("to-y");
        const fromy = this.getAttribute("from-y");
        if(!(width && height && tox && fromx && fromy && toy)) {
            throw new Error("必須属性が設定されていない");
        }
        const labelx = this.getAttribute("labelx");
        const labely = this.getAttribute("labely");
        const self = this;
        getData(this)
        .then(data=>{
            var margin = { "top": 30, "bottom": 60, "right": 30, "left": 60 };
            var color = d3.scaleOrdinal()
            .range(["#DC3912", "#3366CC", "#109618", "#FF9900", "#990099"]);
            const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            attributes(self, svg);
            // 2. SVG領域の設定
            const main = d3.select(svg)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);
    
            // 3. 軸スケールの設定
            var xScale = d3.scaleLinear()
                .domain([fromx, tox])
                .range([margin.left, width - margin.right]);
            
            var yScale = d3.scaleLinear()
                .domain([fromy, toy])
                .range([height - margin.bottom, margin.top]);
            
            // 4. 軸の表示
            var axisx = d3.axisBottom(xScale).ticks(5);
            var axisy = d3.axisLeft(yScale).ticks(5);

            const size = data[0].length;
            for(let i = 1; i < size; i++) {
                const name = data[0][i];
                console.log(name);

                const line = d3.line()
                .x((d)=>xScale(d[0]))
                .y((d)=>{
                    return yScale(d[i]); 
                });

                // 5. ラインの表示
                main.append("path")
                .datum(data.slice(1, data.length))
                .attr("fill", "none")
                .attr("stroke", (d)=>color(i))
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x((d)=>xScale(d[0]))
                    .y((d)=>{
                        return yScale(d[i]); 
                    })
                );

                // ラベルを表示する位置のオフセット
                const labelOffsetX = 10;
                const labelOffsetY = 10;

                // ラベルを描画
                main.append("text")
                    .datum(data)
                    .attr("x", d => xScale(d[data.length - 1][0]) + labelOffsetX)
                    .attr("y", d => yScale(d[data.length - 1][i]) + labelOffsetY)
                    .attr("font-size", "12px")
                    .text(d => name)
                    .attr("fill", (d, i) => d3.schemeCategory10[i]);
            }
            
            main.append("g")
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
            
            main.append("g")
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

            
    
            this.replaceWith(svg);
        });
        
    }
}

class BarGraph extends HTMLElement {
    constructor() {
        super();
        const csvPath = this.getAttribute("csv");
        const dataset = [1,2,3];
        // グラフの設定
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        getData(this)
        .then((data)=>{
            console.log(data);
            const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            // SVG要素を作成
            const main = d3.select(svg)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // x軸のスケール
            const x = d3.scaleBand()
                .domain(data.map(d => d.label))
                .range([0, width])
                .padding(0.1);

            // y軸のスケール
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .nice()
                .range([height, 0]);

            // バーチャートの描画
            main.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.label))
                .attr('y', d => y(d.value))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d.value));

            // x軸の描画
            main.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x));

            // y軸の描画
            main.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(y));

            this.replaceWith(svg);
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
class StackedbarChart extends HTMLElement {
    constructor() {
        super();
        console.log("const");
        this.shadow = this.attachShadow({mode:"open"});
        this.width = this.getAttribute("width");
        if(!this.width) this.width = this.parentElement.offsetWidth;
        this.height = this.getAttribute("height");
        this.rowName = this.getAttribute("row");
        if(this.getAttribute("threshold")) {
			this.threshold = Number.parseFloat(this.getAttribute("threshold"));
		}
    }
    h() {
		this.shadow.childNodes.forEach(n=>this.shadow.removeChild(n));
		console.log("v");
		// チャートのサイズとマージンを定義
        const margin = { top: 20, right: 30, bottom: 40, left: 60 }
		// チャートのSVG要素を作成
		const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
        attributes(this, svg);
        
		getData(this)
        .then((data)=>{
            console.log(data);
            
            // スケールの設定
	        const xScale = d3.scaleBand()
	            .domain(data.slice(1, data.length).map(d => d[0]))
	            .range([margin.left, this.width - margin.right])
	            .padding(0.1);
	
	        const yScale = d3.scaleLinear()
	            .domain([0, d3.max(data, d => d3.sum(d.slice(1, d.length)))])
	            .nice()
	            .range([this.height - margin.bottom, margin.top]);
	
	        // スタックデータを作成
	        const stack = d3.stack()
	            .keys([0, 1, 2])
	            .order(d3.stackOrderNone)
	            .offset(d3.stackOffsetNone);
	
	        const series = stack(data.map(d => d.slice(1, d.length)));
	
	        // カラースケールを設定
	        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(data[0].slice(1,data[0].length))
	
			const main = d3.select(svg)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox","0 0 "+this.width+" "+this.height);
            
	        // 積み上げ棒グラフを描画
	        main.selectAll("g")
	            .data(series)
	            .join("g")
	            .attr("fill", (d, i) => color(data[0][i + 1]))
	            .selectAll("rect")
	            .data(d => {return d;})
	            .join("rect")
	            .attr("x", (d, i) => {return xScale(data[i][0])})
	            .attr("y", d => yScale(d[1]))
	            .attr("height", d => {
					//console.log(d);
					return yScale(d[0]) - yScale(d[1])})
	            .attr("width", xScale.bandwidth());
	
	        // X軸を描画
	        main.append("g")
	            .attr("class", "x-axis")
	            .attr("transform", `translate(0,${this.height - margin.bottom})`)
	            .call(d3.axisBottom(xScale));
	
	        // Y軸を描画
	        main.append("g")
	            .attr("class", "y-axis")
	            .attr("transform", `translate(${margin.left},0)`)
	            .call(d3.axisLeft(yScale));
	        this.shadow.append(svg);
	     });
	}
    v() {
		while(this.shadow.firstChild) {this.shadow.removeChild(this.shadow.firstChild)}
		console.log("v");
		// チャートのサイズとマージンを定義
        const margin = { top: 20, right: 30, bottom: 40, left: 100 }
		// チャートのSVG要素を作成
		const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
        attributes(this, svg);
        
		getData(this)
        .then((data)=>{
            console.log(data);
            let coredata = data.slice(1, data.length).map(d=>d.slice(1, d.length));
            console.log(coredata);
            // スケールの設定
            
            const xScale = d3.scaleLinear()
	            .domain([0, d3.max(coredata, d => d3.sum(d))])
	            .nice()
	            .range([margin.left, this.width - margin.right]);
	            
	        const yScale = d3.scaleBand()
	            .domain(data.slice(1, data.length).map(d => d[0]))
	            .range([margin.top, this.height - margin.bottom])
	            .padding(0.1);
	
	        // スタックデータを作成
	        let array = [];
	        
	        for(let i = 0; i < data[0].length - 1; i++) {
				array.push(i);
			}
	        const stack = d3.stack()
	            .keys(array)
	            .order(d3.stackOrderNone)
	            .offset(d3.stackOffsetNone);
	
	        const series = stack(coredata);
	
	        // カラースケールを設定
	        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(data[0].slice(1,data[0].length))
	
			const main = d3.select(svg)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox","0 0 "+this.width+" "+this.height);
            
	        // 積み上げ棒グラフを描画
	        main.selectAll("g")
	            .data(series)
	            .join("g")
	            .attr("fill", (d, i) => color(data[0][i + 1]))
	            .selectAll("rect")
	            .data(d => d)
	            .join("rect")
	            .attr("x", d => xScale(d[0]))
	            .attr("y", (d, i) => yScale(data[i + 1][0]))
	            .attr("height", yScale.bandwidth())
	            .attr("width", d => {
					return xScale(d[1]) - xScale(d[0])}
				);
	
	        // X軸を描画
	        main.append("g")
	            .attr("class", "x-axis")
	            .attr("transform", `translate(0,${this.height - margin.bottom})`)
	            .call(d3.axisBottom(xScale));
	
	        // Y軸を描画
	        main.append("g")
	            .attr("class", "y-axis")
	            .attr("transform", `translate(${margin.left},0)`)
	            .call(d3.axisLeft(yScale));
	        this.shadow.append(svg);
        });
    }
    static get observedAttributes() {
		return ["src"];
	}
    attributeChangedCallback(attr, oldVal, newVal) {
		console.log("changed");
        this.width = this.getAttribute("width");
        if(!this.width) this.width = this.parentElement.offsetWidth;
        this.height = this.getAttribute("height");
        this.rowName = this.getAttribute("row");
        if(this.getAttribute("threshold")) {
			this.threshold = Number.parseFloat(this.getAttribute("threshold"));
		}
		if(this.getAttribute("order") == "v") {
			this.v();
		} else if(this.getAttribute("order") == "h") {
			this.h();
		}
	}
}

class StackedareaChart extends HTMLElement {
    constructor() {
        super();
    }
}
class SunburstChart extends HTMLElement {
    constructor() {
        super();
        // チャートのサイズとマージンを定義
        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2;

        // チャートのSVG要素を作成
        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // サンバーストチャート用のデータを作成
        const data = {
            name: "root",
            children: [
                {
                    name: "A",
                    children: [
                        { name: "A1", value: 10 },
                        { name: "A2", value: 20 }
                    ]
                },
                {
                    name: "B",
                    children: [
                        { name: "B1", value: 15 },
                        { name: "B2", value: 25 }
                    ]
                }
            ]
        };

        // パイレイアウトを作成
        const partition = data => {
            const root = d3.hierarchy(data)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);
            return d3.partition()
                .size([2 * Math.PI, root.height + 1])
                (root);
        };

        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

        const root = partition(data);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        svg.selectAll("path")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("fill", d => {
                while (d.depth > 1) d = d.parent;
                return color(d.data.name);
            })
            .attr("d", arc);
    }
}

/**
 * 
 * @param {HTMLElement} element 
 */
async function getData(element) {
    let dataString;
    let type;
    
    const dataElement = element.querySelector("data");

    if(dataElement && dataElement.getAttribute("type")) {
        dataString = dataElement.textContent;
        switch(dataElement.getAttribute("type")) {
            case "json":
                type = "json";
                break;
            case "csv":
                type = "csv";
                break;
            default:
				throw new Error("");
        }
    } else if(element.getAttribute("src") && element.getAttribute("type")) {
       switch(element.getAttribute("type")) {
            case "json":
                type = "json";
                break;
            case "csv":
                type = "csv";
                break;
            default:
				throw new Error("");
        }
        dataString = await d3.text(element.getAttribute("src"));
    } else {
        throw new Error("適切な値が設定されていない"+data+""+element);
    }

    if(!dataString && !type) {
        throw new Error("八百幡コンポーネンツ：設定が不足している");
    }
    let baseData;
    if(type === "json") {
        baseData = JSON.parse(dataString);
    } else if(type === "csv") {
        baseData = d3.csvParseRows(dataString);
    } else {
        throw new Error(type+"、typeの値はjsonかcsvのみ");
    }
    //
    let xpath;
    const xpathElement = element.querySelector("xpath");
    if(xpathElement) {
        xpath = xpathElement.textContent;
    }
    if(xpath) {
        return SaxonJS.XPath.evaluate(xpath, baseData);
    } else {
        return baseData;
    }
}

function attributes(element, svg) {
    const attributes = element.querySelector("attributes");
    if(attributes) {
        for(let name of attributes.getAttributeNames()) {
            svg.setAttribute(name, attributes.getAttribute(name));
        }
    }
}