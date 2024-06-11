d3.csv("cleaned_data.csv").then(csvData => {
    const data = csvData;
    d3.xml("world.svg").then(svgData => {
        const svgNode = svgData.documentElement;
        svgNode.setAttribute("viewBox", "0 0 2100 900");
        document.getElementById("stress-map-container").appendChild(svgNode);
        createVisualization2(data);
    });
});

function calculateStressLevel(countryData) {
    const totalResponses = countryData.length;
    if (totalResponses === 0) return 0; 
    const yesCount = countryData.filter(d => d.Growing_Stress.toLowerCase() === "yes").length;
    const stressLevel = (yesCount / totalResponses) * 100; 
    return stressLevel; 
}

function createVisualization2(data) {
    const svg = d3.select("#stress-map-container svg");
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const colorScale = d3.scaleThreshold()
        .domain([0.01, 33, 100]) 
        .range(["#fff", "#FFC0CB", "#C0392B"]); 

    const legendData = [
        { color: "#FFC0CB", label: "1% - 33%" },
        { color: "#C0392B", label: "Above 33%" }
    ];
    const legend = d3.select("#stress-map-container")
        .append("svg")
        .attr("width", 2100)
        .attr("height", 75) 
        .attr("id", "legend")
        .style("display", "block")
        .style("margin-left", "33%") 
        .style("text-align", "center");

    const legendGroup = legend.selectAll("g")
        .data(legendData)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(${i * 200}, 0)`);

    legendGroup.append("rect")
        .attr("width", 25)
        .attr("height", 25)
        .attr("y", 10)
        .style("fill", d => d.color);

    legendGroup.append("text")
        .attr("x", 40)
        .attr("y", 23) 
        .attr("dy", "0.35em")
        .style("font-size", "14px") 
        .style("fill", "#000") 
        .text(d => d.label);


    const countryStress = new Map();
    data.forEach(d => {
        const countryName = d.Country;
        if (!countryStress.has(countryName)) {
            countryStress.set(countryName, [d]);
        } else {
            countryStress.get(countryName).push(d);
        }
    });

    countryStress.forEach((value, key) => {
        const stressLevel = calculateStressLevel(value); 
        countryStress.set(key, stressLevel); 
    });

    svg.selectAll("path")
        .style("fill", function() {
            const countryName = d3.select(this).attr("class") || d3.select(this).attr("name");
            const stressLevel = countryStress.get(countryName) || 0;
            return colorScale(stressLevel); 
        })
        .on("mouseover", function(event) {
            const countryName = d3.select(this).attr("class") || d3.select(this).attr("name");
            const stressLevel = countryStress.get(countryName) || 0;
            d3.select(this).style("fill", d3.rgb(colorScale(stressLevel)).brighter(0.5));
            showTooltip(event, countryName, stressLevel);
        })
        .on("mouseout", function() {
            const countryName = d3.select(this).attr("class") || d3.select(this).attr("name");
            const stressLevel = countryStress.get(countryName) || 0;
            d3.select(this).style("fill", colorScale(stressLevel)); 
            hideTooltip();
        });

    function showTooltip(event, country, stressLevel) {
        tooltip.html(`<strong>${country}</strong><br>Stress Level: ${stressLevel.toFixed(2)}%`)
            .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px").style("visibility", "visible");
    }

    function hideTooltip() {
        tooltip.style("visibility", "hidden");
    }
}
