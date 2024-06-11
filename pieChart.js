function callPieCharts() {
    makePieChart('self_employed', ['Yes', 'No'], ['#77DD77', '#FFB347'], "#pie-chart-container-1", "Self Employed");
    makePieChart('family_history', ['Yes', 'No'], ['#77DD77', '#FFB347'], "#pie-chart-container-2", "Family History");
    makePieChart('treatment', ['Yes', 'No'], ['#77DD77', '#FFB347'], "#pie-chart-container-3", "Treatment");
    makePieChart('Social_Weakness', ['Yes', 'Maybe', 'No'], ['#FF6961', '#FFB347', '#77DD77'], "#pie-chart-container-4", "Social Weakness");
    makePieChart('Work_Interest', ['Yes', 'Maybe', 'No'], ['#77DD77', '#FFB347', '#FF6961'], "#pie-chart-container-5", "Work Interest");
    makePieChart('Mood_Swings', ['High', 'Medium', 'Low'], ['#FF6961', '#FFB347', '#77DD77'], "#pie-chart-container-6", "Mood Swings");
}

function makePieChart(inputValue, inputsArray, colorsArray, containerId, title) {
    d3.csv("cleaned_data.csv").then(data => {
        const counts = d3.rollup(data, v => v.length, d => d[inputValue]);
        const total = d3.sum(Array.from(counts.values()));
        const pieData = Array.from(counts, ([key, value]) => ({ key, value, percentage: (value / total * 100).toFixed(2) }));

        pieData.sort((a, b) => inputsArray.indexOf(a.key) - inputsArray.indexOf(b.key));

        const width = 350;
        const height = 350;
        const radius = Math.min(width, height) / 2;
        const legendHeight = 50;
        const legendItemHeight = 20;
        const legendSpacing = 10;

        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", width)
            .attr("height", height + legendHeight + 40)  
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2 + 20})`); 

        d3.select(containerId)
            .select("svg")
            .append("text")
            .attr("x", width / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(title);

        const color = d3.scaleOrdinal()
            .domain(inputsArray)
            .range(colorsArray);

        const pie = d3.pie()
            .value(d => d.value);

        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const arcHover = d3.arc()
            .outerRadius(radius)
            .innerRadius(0);

        const g = svg.selectAll(".arc")
            .data(pie(pieData))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", d => color(d.data.key))
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arcHover)
                    .style("opacity", 0.7);

                const [x, y] = arc.centroid(d);

                svg.append("text")
                    .attr("class", "hover-text")
                    .attr("transform", `translate(${x}, ${y - 10})`)
                    .attr("text-anchor", "middle")
                    .text(`Respondents: ${d.data.value} (${d.data.percentage}%)`);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arc)
                    .style("opacity", 1);

                svg.selectAll(".hover-text").remove();
            });

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(-${width / 2}, ${radius + 20})`);

        const legendG = legend.selectAll(".legend")
            .data(pieData)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0, ${i * (legendItemHeight + legendSpacing)})`);

        legendG.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", d => color(d.key));

        legendG.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("class", "legend-text")
            .text(d => d.key);
    });
}
