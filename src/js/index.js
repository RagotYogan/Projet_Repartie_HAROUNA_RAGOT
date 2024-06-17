document.addEventListener("DOMContentLoaded", function () {

    var map = L.map('map').setView([48.6921, 6.1844], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Chargement des stations VélOStan
    velibStations(map);
});
function velibStations(map) {
    // Remplacement de l'URL par celle du proxy
    fetch("http://localhost:8000/systemInformation")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Échec de la récupération des données: ' + response.status);
            }
        })
        .then(data => {
            // Pas de modification nécessaire ici car la structure de réponse est supposée être identique
            const stationInfo = 'http://localhost:8000/stationInformation'; // URL proxy pour les informations de station
            const stationStatus = 'http://localhost:8000/stationStatus'; // URL proxy pour le statut des stations

            Promise.all([
                fetch(stationInfo).then(res => res.json()),
                fetch(stationStatus).then(res => res.json())
            ])
                .then(([infoData, statusData]) => {
                    const stations = infoData.data.stations.map(station => {
                        const status = statusData.data.stations.find(s => s.station_id === station.station_id);
                        return {
                            station_id: station.station_id,
                            name: station.name,
                            address: station.address,
                            lat: station.lat,
                            lon: station.lon,
                            num_bikes_available: status.num_bikes_available || 0,
                            num_docks_available: status.num_docks_available || 0
                        };
                    });

                    stations.forEach(station => {
                        const { address, lat, lon, name, num_bikes_available, num_docks_available } = station;
                        const latLng = [lat, lon];

                        // Création du marqueur
                        const marker = L.marker(latLng).addTo(map);
                        const popup = `
                            <strong>Nom: </strong>${name}<br>
                            <strong>Adresse:</strong> ${address}<br>
                            <strong>Vélos disponibles:</strong> ${num_bikes_available}<br>
                            <strong>Places libres:</strong> ${num_docks_available}   
                    `;
                        marker.bindPopup(popup);
                    });
                })
                .catch(error => console.error('Erreur lors de la récupération des données:', error));
        })
        .catch(error => console.error('Erreur lors de la récupération des données:', error));
}
