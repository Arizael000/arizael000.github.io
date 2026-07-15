document.addEventListener('DOMContentLoaded', function() {
    const projects = [
        { selector: '#qrScanProject', url: 'https://github.com/Arizael000/QR-Generator' },
        { selector: '#logisticPredictionProject', url: 'https://github.com/Arizael000/logisticPrediction' },
        { selector: '#qgisParameters', url: 'https://github.com/Arizael000/Parameters-Extraction-in-QGIS' },
        { selector: '#faultyMedicalDevicesProject', url: 'https://github.com/Arizael000/faulty-mdevices' },
    ];

    projects.forEach(function(project) {
        var card = document.querySelector(project.selector + ' .Pcard');
        if (card) {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                window.open(project.url, '_blank');
            });
        }
        var btn = document.querySelector(project.selector + ' .github-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.open(project.url, '_blank');
            });
        }
    });

    // Standalone GitHub buttons (not inside project sections)
    document.querySelectorAll('.btn-download.github-btn[data-repo]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://github.com/Arizael000/' + btn.dataset.repo, '_blank');
        });
    });

    // Tools "More" button → tools.html
    var toolsMore = document.querySelector('.tools-more');
    if (toolsMore) {
        toolsMore.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'tools.html';
        });
    }

    var cv = document.getElementById('cv');
    if(cv){
        cv.setAttribute('href', 'javascript:void(0)');
        cv.addEventListener("click", function(e){
            e.preventDefault();
            const link = document.createElement('a');
            link.href = "https://drive.google.com/uc?export=download&id=1Wl90OcFqx_9sAMBipGgoM46dAuETrmzV";
            link.setAttribute('download', 'CV_ArizaelGC.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});
