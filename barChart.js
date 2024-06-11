document.addEventListener('DOMContentLoaded', function() {
    const margin = {top: 20, right: 150, bottom: 0, left: 40};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#barchart-container")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const hoverColor = d3.scaleOrdinal()
                         .range(d3.schemeCategory10.map(color => d3.color(color).brighter()));

    const xAxis = svg.append("g")
                     .attr("transform", `translate(0,${height})`);

    const yAxis = svg.append("g");

    svg.append("g")
       .attr("class", "legend")
       .attr("transform", `translate(${width + 20},0)`);

    function updateData(column, gender) {
        d3.csv("cleaned_data.csv").then(data => {
            const filteredData = data.filter(d => d.Gender === gender);
            const total = filteredData.length;
            const counts = d3.rollup(filteredData, v => v.length, d => d[column]);
            const percentages = [...counts].map(([key, count]) => ({
                key: key || "No Response",
                percentage: count / total * 100
            }));

            x.domain(percentages.map(d => d.key));
            y.domain([0, d3.max(percentages, d => d.percentage)]);

            xAxis.call(d3.axisBottom(x).tickSize(0));
            yAxis.call(d3.axisLeft(y));

            const bars = svg.selectAll(".bar")
                            .data(percentages, d => d.key);

            bars.enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.key))
                .attr("width", x.bandwidth())
                .attr("y", height)
                .attr("height", 0)
                .merge(bars)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill", hoverColor(d.key));
                })
                .on("mouseout", function(event, d) {
                    d3.select(this).attr("fill", color(d.key));
                })
                .transition()
                .duration(1000)
                .attr("x", d => x(d.key))
                .attr("width", x.bandwidth())
                .attr("y", d => y(d.percentage))
                .attr("height", d => height - y(d.percentage))
                .attr("fill", d => color(d.key));

            bars.exit().remove();

            const legend = svg.select(".legend");
            legend.selectAll("g").remove();

            legend.selectAll("g")
                  .data(percentages)
                  .enter().append("g")
                  .attr("transform", (d, i) => `translate(0,${i * 20})`)
                  .call(g => g.append("rect")
                              .attr("x", 0)
                              .attr("y", 0)
                              .attr("width", 18)
                              .attr("height", 18)
                              .attr("fill", d => color(d.key)))
                  .call(g => g.append("text")
                              .attr("x", 24)
                              .attr("y", 9)
                              .attr("dy", "0.35em")
                              .text(d => d.key));
        });
    }

    const categoryDropdown = d3.select("#category-dropdown");
    const genderDropdown = d3.select("#gender-dropdown");

    function updateChart() {
        const selectedCategory = categoryDropdown.property("value");
        const selectedGender = genderDropdown.property("value");
        updateData(selectedCategory, selectedGender);
    }

    categoryDropdown.on("change", updateChart);
    genderDropdown.on("change", updateChart);

    updateChart();
});
