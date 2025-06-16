// Lijst van bestanden in de cache
let cacheBestanden = [ 
    '/', 
    '/index.html', 
    '/script.js', 
    '/css/styles.css', 
    '/icon/SSI48.png', // 48x48 icoon
    '/icon/SSI128.png', // 128x128 icoon
    '/icon/SSI192.png', // 192x192 icoon
    '/icon/SSI512.png' // 512x512 icoon
];

// Naam voor de cache 
let statischeCache = 'worldlyCache'; 

// Installatie van de service worker
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  
  // Zorg ervoor dat de cachebestanden worden toegevoegd wanneer de service worker wordt geïnstalleerd
  event.waitUntil(
    caches.open(statischeCache)  // Open de cache met de naam 'worldlyCache'
      .then(function(cache){
        console.log("precaching the app shell"); // Toon dat we de app-bestanden aan het cachen zijn
        cache.addAll(cacheBestanden); // Voeg de bestanden toe aan de cache
      })
  );
});

// Het ophalen van bestanden wanneer de gebruiker ze opvraagt
self.addEventListener('fetch', function(event) {
  console.log('[Service Worker] Fetching something ....', event);
  
  // Kijk of het gevraagde bestand al in de cache staat
  event.respondWith(
    caches.match(event.request)
        .then(function(response){
            if(response){
                // Als het bestand in de cache staat, geef het dan terug
                return response;
            } else {
                // Als het bestand niet in de cache staat, haal het dan van het netwerk
                return fetch(event.request);
            }
        })
    );
});

// Activeren van de nieuwe service worker
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating new service worker...');
  
  // Definieer de caches die we willen behouden
  let dezeCacheBewaren = [statischeCache];

  event.waitUntil(
    caches.keys().then(function(cacheNamen) {
      // Verwijder oude caches die we niet willen behouden
      return Promise.all(
        cacheNamen.map(function(cacheNaam) {
          if (dezeCacheBewaren.indexOf(cacheNaam) === -1) {
            // Verwijder de cache als deze niet in onze lijst staat
            return caches.delete(cacheNaam);
          }
        })
      );
    })
  );
});