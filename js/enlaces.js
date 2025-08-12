document.addEventListener('DOMContentLoaded', function() {
    var qrscanProject = document.getElementById('qrScanProject');
    var logisticPredictionProject = document.getElementById('logisticPredictionProject');
    var hotelProject = document.getElementById('hotelProject');
    var qgisParameters = document.getElementById('qgisParameters');
    if(qrscanProject){
        qrscanProject.addEventListener("click", function(e){
            e.preventDefault(); // Previene el salto por el href
            window.open("https://github.com/Arizael000/QR-Generator", "_blank");
        });
    }
    if(logisticPredictionProject){
        logisticPredictionProject.addEventListener("click", function(e){
            e.preventDefault(); // Previene el salto por el href
            window.open("https://github.com/Arizael000/logisticPrediction", "_blank");
        });
    }

    if(hotelProject){
        hotelProject.addEventListener("click", function(e){
            e.preventDefault(); // Previene el salto por el href
            window.open("https://github.com/Arizael000/SG_Hotel", "_blank");
        });
    }
    if(qgisParameters){
        qgisParameters.addEventListener("click", function(e){
            e.preventDefault(); // Previene el salto por el href
            window.open("https://github.com/Arizael000/Parameters-Extraction-in-QGIS", "_blank");
        });
    }
});