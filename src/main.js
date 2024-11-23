import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Env } from './env.js'


const env = new Env()
env.injectLinkContent('.contact-mail', 'mailto:', '', env.contactMail, 'E-Mail')


const center = [54.79443515, 9.43205485]

let currentLayer = null

var map = L.map('map', {
  zoomControl: false
}).setView(center, 13)

var zoomControl = L.control.zoom({
  position: 'bottomright'
}).addTo(map)


function formatPlaceName(placeName) {
  return placeName.replace(', Stadt', '')
}


function formatDateString(dateString) {
  const date = new Date(dateString)

  const germanDate = date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return germanDate
}


function formatToHectar(number) {
  let hectar = Number(number) / 10000

  hectar = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(hectar)

  return hectar
}


function renderBiotopeMeta(data) {
  if (currentLayer) {
    map.removeLayer(currentLayer)
  }

  const geoJsonData = {
    'type': 'FeatureCollection',
    'features': [{
      'type': 'Feature',
      'geometry': {
        'type': data['geojson']['type'],
        'coordinates': data['geojson']['coordinates']
      },
      'properties': {}
    }]
  }

  currentLayer = L.geoJSON(geoJsonData, {
    style: {
      color: '#333',
      weight: 2,
      fillOpacity: 0.1
    }
  }).addTo(map)

  map.fitBounds(currentLayer.getBounds())

  let detailOutput = ''

  if (data['designation'].length > 1) {
    detailOutput += `<li><strong>${data['code']}</strong><br>${data['designation']}</li>`
  }

  if (data['description'] !== null) {
    detailOutput += `<li><strong>Bemerkung</strong><br>${data['description']}</li>`
  }

  if (data['mapping_date'] !== null) {
    const dateString = formatDateString(data['mapping_date'])

    detailOutput += `<li><strong>Kartierdatum</strong><br>${dateString}</li>`
  }

  if (data['mapping_origin'] !== null && data['mapping_origin_description'] === null) {
    detailOutput += `<li><strong>Herkunft</strong><br>${data['mapping_origin']}</li>`
  }
  else if (data['mapping_origin'] !== null && data['mapping_origin_description'] !== null) {
    detailOutput += `<li><strong>Herkunft (${data['mapping_origin']})</strong><br>${data['mapping_origin_description']}</li>`
  }

  if (data['place_name'] !== null && data['place_name'].length > 1) {
    const placeNamesArray = data['place_name'].split(';')
    const placeNamesEntries = placeNamesArray.length
    let placeNameKey = 'Gemeinde'
    let placeNamesOutput = ''

    placeNamesArray.forEach((placeName) => {
      if (placeNamesEntries > 1) {
        placeNamesOutput += `<li class="ml-4 list-dash">${formatPlaceName(placeName)}</li>`
      }
      else {
        placeNamesOutput = `<li>${formatPlaceName(placeName)}</li>`
      }
    })

    if (placeNamesEntries > 1) {
      placeNameKey += 'n'
    }

    detailOutput += `<li><strong>${placeNameKey}</strong><br><ul>${placeNamesOutput}</ul></li>`
  }

  if (data['shape_area'] > 0) {
    const hectar = formatToHectar(data['shape_area'])
    detailOutput += `<li><strong>Fläche</strong><br>${hectar} ha</li>`
  }

  const detailList = document.querySelector('#detailList')
  const ribbonValuableBiotope = document.querySelector('#ribbonElement')

  if (ribbonValuableBiotope) {
    ribbonValuableBiotope.remove()
  }

  if (data['valuable_biotope'] !== undefined && data['valuable_biotope'] === 1) {
    const ribbonElement = document.createElement('div')
    const ribbonTextNode = document.createTextNode('Wertbiotop')

    ribbonElement.id = 'ribbonElement'
    ribbonElement.append(ribbonTextNode)
    ribbonElement.classList.add('ribbon', 'top-2', 'absolute', 'text-base', 'text-zinc-900', 'font-mono', 'bg-emerald-200', 'tracking-normal', 'ps-2.5', 'pe-3.5')
    detailList.parentNode.insertBefore(ribbonElement, detailList)
  }

  detailList.innerHTML = detailOutput
  document.querySelector('#sidebar').classList.remove('hidden')
  document.querySelector('#sidebar').classList.add('absolute')
  document.querySelector('#about').classList.add('hidden')
  document.querySelector('#sidebarContent').classList.remove('hidden')
}


function cleanBiotopeMeta() {
  if (currentLayer) {
    map.removeLayer(currentLayer)
  }

  const detailList = document.querySelector('#detailList')
  const ribbonValuableBiotope = document.querySelector('#ribbonElement')

  if (ribbonValuableBiotope) {
    ribbonValuableBiotope.remove()
  }

  detailList.innerHTML = ''
  document.querySelector('#sidebar').classList.add('hidden')
  document.querySelector('#sidebar').classList.remove('absolute')
  document.querySelector('#about').classList.remove('hidden')
  document.querySelector('#sidebarContent').classList.add('hidden')
}


function fetchBiotopeMeta(lat, lng) {
  const url = `https://api.oklabflensburg.de/biotope/v1/point?lat=${lat}&lng=${lng}`

  try {
    fetch(url, {
      method: 'GET'
    }).then((response) => response.json()).then((data) => {
      renderBiotopeMeta(data)
    }).catch(function (error) {
      cleanBiotopeMeta()
    })
  }
  catch {
    cleanBiotopeMeta()
  }
}


function updateScreen(screen) {
  const title = 'Biotopkartierung Schleswig-Holstein'

  if (screen === 'home') {
    document.querySelector('title').innerHTML = title
    document.querySelector('meta[property="og:title"]').setAttribute('content', title)
  }
}


function handleWindowSize() {
  const innerWidth = window.innerWidth

  if (innerWidth >= 1024) {
    map.removeControl(zoomControl)

    zoomControl = L.control.zoom({
      position: 'topleft'
    }).addTo(map)
  }
  else {
    map.removeControl(zoomControl)
  }
}


document.addEventListener('DOMContentLoaded', function () {
  L.tileLayer('https://tiles.oklabflensburg.de/sgm/{z}/{x}/{y}.png', {
    maxZoom: 20,
    tileSize: 256,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="dc:rights">OpenStreetMap</a> contributors'
  }).addTo(map)

  L.tileLayer('https://tiles.oklabflensburg.de/bksh/{z}/{x}/{y}.png', {
    opacity: 0.8,
    maxZoom: 20,
    maxNativeZoom: 20,
    attribution: 'Daten &copy; <a href="https://www.schleswig-holstein.de/DE/landesregierung/ministerien-behoerden/LFU" target="_blank" rel="dc:rights">LfU SH</a>/<a href="https://www.govdata.de/dl-de/by-2-0" target="_blank" rel="dc:rights">dl-de/by-2-0</a>'
  }).addTo(map)

  map.on('click', function (e) {
    const lat = e.latlng.lat
    const lng = e.latlng.lng

    fetchBiotopeMeta(lat, lng)
  })

  document.querySelector('#sidebarContentCloseButton').addEventListener('click', function (e) {
    e.preventDefault()

    cleanBiotopeMeta()
  })

  document.querySelector('#sidebarCloseButton').addEventListener('click', function (e) {
    e.preventDefault()

    document.querySelector('#sidebar').classList.add('sm:h-dvh')
    document.querySelector('#sidebar').classList.remove('absolute', 'h-dvh')
    document.querySelector('#sidebarCloseWrapper').classList.add('hidden')

    history.replaceState({ screen: 'home' }, '', '/')
  })


  const layers = {
    'layer1': L.tileLayer('https://tiles.oklabflensburg.de/nksh/{z}/{x}/{y}.png', {
      opacity: 0.7,
      maxZoom: 20,
      maxNativeZoom: 20
    })
  }

  window.toggleLayer = function (element) {
    const layerName = element.id
    const layer = layers[layerName]

    if (element.checked && !map.hasLayer(layer)) {
      map.addLayer(layer)
    }
    else if (map.hasLayer(layer)) {
      map.removeLayer(layer)
    }
  }
})


window.onload = () => {
  if (!history.state) {
    history.replaceState({ screen: 'home' }, '', '/')
  }
}

// Handle popstate event when navigating back/forward in the history
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.screen === 'home') {
    document.querySelector('#sidebar').classList.add('sm:h-dvh')
    document.querySelector('#sidebar').classList.remove('absolute', 'h-dvh')
    document.querySelector('#sidebarCloseWrapper').classList.add('hidden')
  }
  else {
    updateScreen('home')
  }
})


// Attach the resize event listener, but ensure proper function reference
window.addEventListener('resize', handleWindowSize)

// Trigger the function initially to handle the initial screen size
handleWindowSize()