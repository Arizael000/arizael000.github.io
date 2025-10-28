document.addEventListener('DOMContentLoaded', function() {
    var qrscanProject = document.getElementById('qrScanProject');
    var logisticPredictionProject = document.getElementById('logisticPredictionProject');
    var hotelProject = document.getElementById('hotelProject');
    var qgisParameters = document.getElementById('qgisParameters');
    const cv = document.getElementById('cv');
    if(qrscanProject){
        qrscanProject.setAttribute('href', 'javascript:void(0)');
        qrscanProject.addEventListener("click", function(e){
            e.preventDefault(); 
            window.open("https://github.com/Arizael000/QR-Generator", "_blank");
        });
    }
    if(logisticPredictionProject){
        logisticPredictionProject.setAttribute('href', 'javascript:void(0)');
        logisticPredictionProject.addEventListener("click", function(e){
            e.preventDefault(); 
            window.open("https://github.com/Arizael000/logisticPrediction", "_blank");
        });
    }

    if(hotelProject){
        hotelProject.setAttribute('href', 'javascript:void(0)');
        hotelProject.addEventListener("click", function(e){
            e.preventDefault(); 
            window.open("https://github.com/Arizael000/SG_Hotel", "_blank");
        });
    }
    if(qgisParameters){
        qgisParameters.setAttribute('href', 'javascript:void(0)');
        qgisParameters.addEventListener("click", function(e){
            e.preventDefault(); 
            window.open("https://github.com/Arizael000/Parameters-Extraction-in-QGIS", "_blank");
        });
    }
    if(cv){
        cv.setAttribute('href', 'javascript:void(0)');
        cv.addEventListener("click", function(e){
            e.preventDefault(); 
            const link = document.createElement('a');
            link.href = "https://drive.google.com/uc?export=download&id=1yxn_pme1sAEKMd9hC4s-pM1zKz0kkWoF";
            link.setAttribute('download', 'CV_ArizaelGC.pdf'); // Nombre del archivo a descargar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});