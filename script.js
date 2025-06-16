// Controleren of de browser service workers ondersteunt
if ('serviceWorker' in navigator) {
  // Service worker registreren wanneer de pagina wordt geladen
  navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("Service worker is registered!")); // Typ dat de service worker is geregistreerd
}

// Wanneer de DOM volledig is geladen
document.addEventListener('DOMContentLoaded', function () {
  // Kaart met een standaard locatie en zoomniveau
  const map = L.map('map').setView([0, 0], 2);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Gebruikerslocatie ophalen wanneer deze gevonden wordt
  map.on('locationfound', function (e) {
      const radius = e.accuracy / 2; // De nauwkeurigheid van de locatie in meters
      if (this.locationMarker) map.removeLayer(this.locationMarker); // Verwijder de oude locatie-marker
      if (this.locationCircle) map.removeLayer(this.locationCircle); // Verwijder de oude locatie-cirkel

      // Voeg een nieuwe marker en cirkel toe voor de huidige locatie
      this.locationMarker = L.marker(e.latlng).addTo(map)
          .bindPopup(`You are within ${radius} meters from this point`).openPopup();
      this.locationCircle = L.circle(e.latlng, radius).addTo(map);
  });

  // Foutmelding als locatie niet gevonden kan worden
  map.on('locationerror', (e) => alert(e.message));
  
  map.locate({ setView: true, maxZoom: 16, watch: true });

  // Scroll-knoppen om naar verschillende secties van de pagina te scrollen
  document.querySelectorAll('.scroll-btn').forEach(btn => {
      btn.addEventListener('click', function () {
          const target = document.querySelector(`#${this.dataset.target}`);
          target.scrollIntoView({ behavior: 'smooth' });
      });
  });

  // Knop om de kaart en de camera te wisselen
  document.getElementById('add-post').addEventListener('click', function () {
      const mapElement = document.getElementById('map');
      const formElement = document.getElementById('form');
      mapElement.classList.toggle('hidden'); // Verberg de kaart
      formElement.classList.toggle('hidden'); // Toon het formulier
  });

  let videoPlayer = document.querySelector("#player");
  const img = document.querySelector("#imgCaptured");

  // Start de video 
  document.getElementById("selfieBtn").addEventListener("click", startVideo);

  // Maak een foto van de video
  document.getElementById("captureBtn").addEventListener("click", captureImage);

  // Toon de bestandskeuze voor het selecteren van een foto
  document.getElementById("pickImgBtn").addEventListener("click", () => document.getElementById("pickImage").style.display = "block");

  // Verwerk het geselecteerde bestand als afbeelding
  document.getElementById("imagePicker").addEventListener("change", captureImagePick);

  // Start de video
  function startVideo() {
      if (navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia({ video: true })
              .then(function (stream) {
                  videoPlayer.srcObject = stream;
                  document.getElementById("divSelfie").style.display = "block";
              })
              .catch(() => document.getElementById("pickImage").style.display = "block"); // Als er geen toegang is tot de camera, laat het bestand kies-formulier zien
      }
  }

  // Maak een foto van de video
  function captureImage() {
      if (videoPlayer.srcObject) {
          const stream = videoPlayer.srcObject;
          let mediaStreamTrack = stream.getVideoTracks()[0];
          let imageCapture = new ImageCapture(mediaStreamTrack);
          imageCapture.takePhoto()
              .then((blob) => {
                  img.src = URL.createObjectURL(blob); // Maak een URL van de foto
                  img.onload = () => URL.revokeObjectURL(img.src); // Verwijder de URL na het laden
              })
              .catch((error) => console.error("takePhoto() error:", error)); // Typ een fout als het maken van de foto mislukt
      }
  }

  // Toon geselecteerde afbeelding
  function captureImagePick(event) {
      let reader = new FileReader();
      reader.onload = function (e) {
          img.src = e.target.result; // Zet de geselecteerde afbeelding als de img-tag
      };
      reader.readAsDataURL(event.target.files[0]); // Lees het bestand als een Data URL
  }

  if ("Notification" in window) {
    const notificationButton = document.querySelector("#btnEnableNotifications");
    notificationButton.style.display = "block"; // Zorg ervoor dat de knop zichtbaar is
    notificationButton.addEventListener("click", askForNotificationPermission);
  }

  function askForNotificationPermission() {
    Notification.requestPermission().then(function (result) {
        if (result === "granted") {
            displayFirstNotification();
        }
    });
  }

  function displayFirstNotification() {
    document.querySelector("#btnEnableNotifications").style.display = "none"; // Verberg de knop als notificaties ingeschakeld zijn
    let options = {
        body: "You are successfully subscribed to new notifications!",
        icon: "/icon/SSI48.png",
        vibrate: [500, 110, 500] // Optioneel: trillingen voor de notificatie
    };
    navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification("Successfully subscribed!!", options); // Stuur notificatie
    });
  }
});