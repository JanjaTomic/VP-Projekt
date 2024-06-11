d3.csv("cleaned_data.csv").then(csvData => {
    const data = csvData;
    d3.xml("world.svg").then(svgData => {
        const svgNode = svgData.documentElement;
        svgNode.setAttribute("viewBox", "0 0 2100 900");
        document.getElementById("map-container").appendChild(svgNode);
        createVisualization(data);
    });
});

function createVisualization(data) {
    const svg = d3.select("#map-container svg");
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");
    const lightestBlue = "#bdd7e7"; 
    const darkestBlue = "#08519c"; 
    let isFirstSpecificDate = true; 

    setupSlider(data);
    updateMap(data, 'all');

    function setupSlider(data) {
        const slider = document.getElementById('time-slider');
        let dates = Array.from(new Set(data.map(d => d.Timestamp.split(" ")[0])));
        dates = dates.sort((a, b) => new Date(a) - new Date(b));
        noUiSlider.create(slider, {
            start: [0],
            range: { 'min': 0, 'max': dates.length - 1 },
            step: 1,
            tooltips: true,
            format: { to: value => dates[Math.round(value)], from: value => dates[Math.round(value)] }
        });

        slider.noUiSlider.on('update', (values, handle) => updateMap(data, values[handle]));
        slider.setAttribute('disabled', true);
    }

    function updateMap(data, selectedDate) {
        const filteredData = selectedDate === "all" ? data : data.filter(d => d.Timestamp.split(" ")[0] === selectedDate);
        const countryCounts = d3.rollup(filteredData, v => v.length, d => d.Country);

        const maxCount = d3.max(Array.from(countryCounts.values()));

        const colorScale = d3.scaleSequential(d3.interpolateRgb(lightestBlue, darkestBlue))
                            .domain([0, maxCount]);

        svg.selectAll("path")
            .transition().duration(750)
            .style("fill", function() {
                const countryName = d3.select(this).attr("class") || d3.select(this).attr("name");
                const count = countryCounts.get(countryName) || 0;
                return count ? colorScale(count) : "#fff";
            });

        svg.selectAll("path")
            .on("mouseover", function(event) {
                const countryName = d3.select(this).attr("class") || d3.select(this).attr("name");
                const count = countryCounts.get(countryName) || 0;
                d3.select(this).style("fill", d3.rgb(colorScale(count)).brighter(0.5));
                showTooltip(event, countryName, count);
            })
            .on("mouseout", function() {
                const countryName = d3.select(this).attr("class") || d3.select(this).attr("name");
                const count = countryCounts.get(countryName) || 0;
                d3.select(this).style("fill", count ? colorScale(count) : "#fff");
                hideTooltip();
            });
    }

    function showTooltip(event, country, value) {
        tooltip.html(`<strong>${country}</strong><br>Number of Participants: ${value}`)
            .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px").style("visibility", "visible");
    }
    
    function hideTooltip() {
        tooltip.style("visibility", "hidden");
    }

    document.querySelectorAll('input[name="time-option"]').forEach(input => {
        input.addEventListener('change', function() {
            const selectedDate = this.value === 'all' ? 'all' : document.getElementById('time-slider').noUiSlider.get();
            const slider = document.getElementById('time-slider');
            selectedDate === 'all' ? (slider.noUiSlider.set(0), slider.setAttribute('disabled', true)) : slider.removeAttribute('disabled');

            if (selectedDate !== 'all' && isFirstSpecificDate) {
                isFirstSpecificDate = false;
                updateMap(data, selectedDate);
            }

            updateMap(data, selectedDate);
        });
    });
}
