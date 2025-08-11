document.addEventListener('DOMContentLoaded', function() {
    var qrscanProject = document.getElementById('qrScanProject');
    var logisticPredictionProject = document.getElementById('logisticPredictionProject');
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
});