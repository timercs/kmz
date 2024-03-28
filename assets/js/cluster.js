//### variável que captura id para selecionar UF
let searchUF = document.getElementById('meuSelect');
let searchCell = document.getElementById('selectCell');
var pAchievement;
var pOcup;
var kmlContent;
var fillColor;
var fillColorARGB;

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
    const searchText = document.getElementById('searchInput').value;

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

    if (searchUF.value != 'UF') {
        //### Liberar Botão de Download
        document.getElementById('btnDownload').removeAttribute('disabled')
    }

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

                    //### Criando KML para download
                    kmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
                    kmlContent += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
                    kmlContent += '  <Document>\n';

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
                            pAchievement = row.achievement.replace(',', '.');
                            pOcup = row.ocup.replace(',', '.');

                            var cluster = row.cell_classification

                            if (cluster === 'OURO') {
                                fillColor = '#FFFF00';
                            } else if (cluster === 'PRATA') {
                                fillColor = '#c0c0c0';
                            } else if (cluster === 'BRONZE') {
                                fillColor = '#88540b';
                            } else if (cluster === 'N/I') {
                                fillColor = '#88540b';
                            }
                            

                            if(row.cell_status_sales === 'Bloqueado'){
                                fillColor = '#000000';
                            }

                            var popupContent = `
                            <strong>Célula: </strong>${row.cell}<br>
                            <strong>UF: </strong>${row.uf}<br>
                            <strong>Município: </strong>${row.city}<br>
                            <strong>Localidade: </strong>${row.locality}<br>
                            <strong>Estação: </strong>${row.station}<br>
                            <strong>Aging: </strong>${row.aging}<br>
                            <strong>Cluster Célula: </strong>${row.cell_classification}<br>
                            <strong>Status Venda Célula: </strong>${row.cell_status_sales}<br>
                            <strong>HC: </strong>${row.hc}<br>
                            <strong>HP: </strong>${row.hp}<br>
                            <strong>HP Viável: </strong>${row.hp_viable}<br>
                            <strong>HP Viável Total: </strong>${row.hp_viable_total}<br>
                            <strong>Ocup (%): </strong>${(pOcup * 100).toFixed(1)}%<br>
                            <strong>HC Esperado: </strong>${row.hc_expected}<br>
                            <strong>Atingimento/Meta (%): </strong>${(pAchievement * 100).toFixed(1)}%<br>
                            `;

                            //### Adicionando polígono ao mapa
                            L.polygon(coordinates, {
                                color: '#000000',
                                fillColor: fillColor,
                                fillOpacity: 0.6,
                                weight: 2
                            }).addTo(map).bindPopup(popupContent);


                            // Construir o conteúdo do polígono KML com estilo e informações do popup
                            var polygonKML = '<Placemark>\n';
                            polygonKML += '  <name>' + row.name + '</name>\n';
                            polygonKML += '  <description><![CDATA[' + getPopupContent(row) + ']]></description>\n'; // Adicionar informações do popup como descrição
                            polygonKML += '  <Style>\n';
                            polygonKML += '    <LineStyle>\n';
                            polygonKML += '      <color>99000000</color>\n'; // Converter cor para formato hexadecimal
                            polygonKML += '      <width>2</width>\n'; // Definir a largura da borda do polígono (substitua "2" pelo valor desejado)
                            polygonKML += '    </LineStyle>\n';
                            polygonKML += '    <PolyStyle>\n';
                            polygonKML += '      <color>99' + invertHexColor(getColorHex(fillColor)) + '</color>\n'; // Converter cor para formato hexadecimal
                            polygonKML += '    </PolyStyle>\n';
                            polygonKML += '  </Style>\n';
                            polygonKML += '  <Polygon>\n';
                            polygonKML += '    <outerBoundaryIs>\n';
                            polygonKML += '      <LinearRing>\n';
                            polygonKML += '        <coordinates>\n';
                            polygonKML += '          ' + row.coordinates + '\n';
                            polygonKML += '        </coordinates>\n';
                            polygonKML += '      </LinearRing>\n';
                            polygonKML += '    </outerBoundaryIs>\n';
                            polygonKML += '  </Polygon>\n';
                            polygonKML += '</Placemark>\n';

                            kmlContent += polygonKML;
                        }
                    });

                    kmlContent += '  </Document>\n';
                    kmlContent += '</kml>';
                }
            });
        })
        .catch(error => console.error('Erro ao buscar o arquivo CSV:', error));
}

// Função para construir o conteúdo do popup
function getPopupContent(row) {
    var popupContent = `
    <strong>Célula: </strong>${row.cell}<br>
    <strong>UF: </strong>${row.uf}<br>
    <strong>Município: </strong>${row.city}<br>
    <strong>Localidade: </strong>${row.locality}<br>
    <strong>Estação: </strong>${row.station}<br>
    <strong>Aging: </strong>${row.aging}<br>
    <strong>Cluster Célula: </strong>${row.cell_classification}<br>
    <strong>Status Venda Célula: </strong>${row.cell_status_sales}<br>
    <strong>HC: </strong>${row.hc}<br>
    <strong>HP: </strong>${row.hp}<br>
    <strong>HP Viável: </strong>${row.hp_viable}<br>
    <strong>HP Viável Total: </strong>${row.hp_viable_total}<br>
    <strong>Ocup (%): </strong>${(pOcup * 100).toFixed(1)}%<br>
    <strong>HC Esperado: </strong>${row.hc_expected}<br>
    <strong>Atingimento/Meta (%): </strong>${(pAchievement * 100).toFixed(1)}%<br>
    `;
    // Adicionar outras informações conforme necessário
    return popupContent;
}

// Função para efetuar o download do kml gerado
function downloadKML() {
    if (kmlContent) {
        var blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = searchUF.value + '.kml';
        link.click();
    } else {
        console.error('O conteúdo KML está vazio ou indefinido.');
    }
}

// Função para converter uma cor em formato RGB para hexadecimal
function getColorHex(color) {
    return color.substring(1); // Remover o caractere '#' do início da string
}

//### Função para inverter os caracteres de uma cor no formato hexadecimal
function invertHexColor(hexColor) {
    // Remover o caractere '#' se estiver presente
    hexColor = hexColor.replace('#', '');

    // Dividir a string em pares de caracteres
    var pairs = hexColor.match(/.{1,2}/g);

    // Inverter a ordem dos pares
    var invertedPairs = pairs.reverse();

    // Juntar os pares invertidos e retornar
    return invertedPairs.join('');
}











