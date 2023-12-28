document.addEventListener('DOMContentLoaded', function() {
    var instagramSpan = document.getElementById("instagram");
    var linkedinSpan = document.getElementById('linkedin');
    var whatsappSpan = document.getElementById('whatsapp');
    var telegramSpan=document.getElementById('telegram');
    var facebookSpan=document.getElementById('facebook');
    var githubSpan=document.getElementById('facebook');
   
      instagramSpan.addEventListener("click", function() {
        window.open("https://instagram.com/arizogc000?igshid=OGQ5ZDc2ODk2ZA==", "_blank");
      });
      linkedinSpan.addEventListener("click", function(){
        window.open("https://www.linkedin.com/in/arizael-garc%C3%ADa-capote/", "_blank");
      });
      whatsappSpan.addEventListener("click", function(){
        window.open("https://wa.me/+5356215511", "_blank");
      });
      telegramSpan.addEventListener("click", function(){
        window.open("https://t.me/Arizael_000", "_blank");
      });
      facebookSpan.addEventListener("click", function(){
        window.open("https://www.facebook.com/arizael.garciacapote?mibextid=ZbWKwL", "_blank");
      });
      githubSpan.addEventListener("click", function(){
        window.open("https://github.com/Arizael000", "_blank");
      });
  });