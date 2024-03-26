//### variável que captura id para selecionar UF
let searchUF = document.getElementById('meuSelect');
let searchCell = document.getElementById('selectCell');

var map = L.map('map').setView([-21.061122, -57.355898], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);


//### função que ativa a localização do usuário
map.locate({ setView: true, maxZoom: 15 })

function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("Você está a  " + radius + " metros deste ponto.").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

//### função que Adiciona um evento de mousemove ao mapa
map.on('click', function (e) {
    var latlng = e.latlng; // Obtem o objeto LatLng do evento
    var latitude = latlng.lat.toFixed(6); // Obtém a latitude com 6 casas decimais
    var longitude = latlng.lng.toFixed(6); // Obtém a longitude com 6 casas decimais

    //### Exibe as coordenadas de latitude e longitude em tempo real
    //console.log('Latitude:', latitude, 'Longitude:', longitude);
});

//### Funcao que seleciona área de cada UF
function selecionaArea() {

    if (searchUF.value === 'AC') {
        map.flyTo([-9.980685, -67.821007], 12);
    } else if (searchUF.value === 'DF') {
        map.flyTo([-15.79, -47.84], 10);
    } else if (searchUF.value === 'GO') {
        map.flyTo([-16.485171, -49.314644], 10);
    } else if (searchUF.value === 'MS') {
        map.flyTo([-20.375768, -56.054876], 7);
    } else if (searchUF.value === 'MT') {
        map.flyTo([-13.573902, -55.464816], 7);
    } else if (searchUF.value === 'PR') {
        map.flyTo([-24.372087, -51.363347], 8);
    } else if (searchUF.value === 'RO') {
        map.flyTo([-10.435862, -62.003264], 8);
    } else if (searchUF.value === 'RS') {
        map.flyTo([-29.473087, -53.562250], 8);
    } else if (searchUF.value === 'SC') {
        map.flyTo([-27.292730, -50.322588], 8);
    } else if (searchUF.value === 'TO') {
        map.flyTo([-10.573403, -48.410903], 8);
    } else {
        map.flyTo([-21.061122, -57.355898], 4);
    }
}


//### Função para buscar endereço

function searchAddress() {
    var searchText = document.getElementById('searchInput').value;

    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + searchText)
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            var result = data[0];
            var lat = result.lat;
            var lon = result.lon;

            map.setView([lat, lon], 15);
            L.marker([lat, lon]).addTo(map)
                .bindPopup(searchText)
                .openPopup();
        } else {
            alert('Endereço não encontrado');
        }
    })
    .catch(error => {
        console.error('Erro ao buscar endereço:', error);
        alert('Erro ao buscar endereço');
    });
}

//### Função que converte csv para um kml com seus poligonos
function convertCSVtoLeaflet() {
    const local = searchUF.value
    const url = 'https://raw.githubusercontent.com/timercs/kmz/main/csv/' + local + '.csv'

    fetch(url)
        .then(response => response.text())
        .then(csvData => {
            // Parse do CSV usando Papa Parse

            //### utilizando papaparse
            Papa.parse(csvData, {
                //download: true,
                header: true,
                delimiter: ',',
                complete: function (results) {
                    
                    //### Contabiliza o total de células ativas
                    const totalCells = results.data.length

                    const infoCelulas = document.getElementById('countCells');
                    infoCelulas.textContent = 'Foram encontrados ' + totalCells + ' células ativas em ' + searchUF.value + '!'

                    results.data.forEach(function (row) {

                        if (row.coordinates && row.uf === searchUF.value) {
                            var coordinates = row.coordinates.split(' ').map(function (coord) {
                                var latlng = coord.split(',');
                                return [parseFloat(latlng[1]), parseFloat(latlng[0])];
                            });

                            //### Definindo a cor com base no percentual de ocupação
                            var cluster = row.cell_classification
                            var fillColor;

                            if (cluster === 'OURO') {
                                fillColor = '#daa520';
                            } else if (cluster === 'PRATA') {
                                fillColor = '#c0c0c0';
                            } else if (cluster === 'BRONZE') {
                                fillColor = '#88540b';
                            }

                            if(row.cell_status_sales === 'Bloqueado'){
                                fillColor = '#000';
                            }
                            
                            var popupContent = `
                            <strong>Célula: </strong>${row.cell}<br>
                            <strong>UF: </strong>${row.uf}<br>
                            <strong>Município: </strong>${row.city}<br>
                            <strong>Localidade: </strong>${row.locality}<br>
                            <strong>Estação: </strong>${row.station}<br>
                            <strong>Aging: </strong>${row.aging}<br>
                            <strong>Cluster Célula: </strong>${row.cell_classification}<br>
                            <strong>Status Célula Venda: </strong>${row.cell_status_sales}<br>
                            <strong>HC: </strong>${row.hc}<br>
                            <strong>HP: </strong>${row.hp}<br>
                            <strong>HP Viável: </strong>${row.hp_viable}<br>
                            <strong>HP Viável Total: </strong>${row.hp_viable_total}<br>
                            <strong>Ocup (%): </strong>${(row.ocup * 100).toFixed(1)}%<br>
                            <strong>HC Esperado: </strong>${row.hc_expected}<br>
                            <strong>Atingimento/Meta (%): </strong>${(row.achievement * 100).toFixed(1)}%<br>
                            `;

                            //### Adicionando polígono ao mapa
                            L.polygon(coordinates, {
                                color: '#444',
                                fillColor: fillColor,
                                fillOpacity: 0.6,
                                weight: 2
                            }).addTo(map).bindPopup(popupContent);
                        }
                    });                    
                }
            });
        })
        .catch(error => console.error('Erro ao buscar o arquivo CSV:', error));
}

