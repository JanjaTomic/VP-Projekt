document.addEventListener('DOMContentLoaded', function() {
    const mapSelect = document.getElementById('map-select');
    const mapContainer1 = document.getElementById('map-container');
    const mapContainer2 = document.getElementById('stress-map-container');
    const controlsDiv = document.getElementById('controls');

    mapSelect.addEventListener('change', function() {
        if (mapSelect.value === 'map1') {
            mapContainer1.style.display = 'block';
            mapContainer2.style.display = 'none';
            controlsDiv.style.display = 'block'; 
      
            createVisualization(data);
        } else if (mapSelect.value === 'map2') {
            mapContainer1.style.display = 'none';
            mapContainer2.style.display = 'block';
            controlsDiv.style.display = 'none'; 
     
            createVisualization2(data);
        }
    });
});
