document.addEventListener('DOMContentLoaded', function() {
    var qrscanProject = document.getElementById('qrScanProject');
    if(qrscanProject){
        qrscanProject.addEventListener("click", function(e){
            e.preventDefault(); // Previene el salto por el href
            window.open("https://github.com/Arizael000/QR-Generator", "_blank");
        });
    }
});