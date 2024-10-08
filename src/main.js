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


function renderBiotopeMeta(data) {
  if (currentLayer) {
    map.removeLayer(currentLayer)
  }

  const feature = JSON.parse(data['geojson'])

  currentLayer = L.geoJSON(feature, {
    style: {
      'color': '#333',
      'weight': 2,
      'fillOpacity': 0.1
    }
  }).addTo(map)

  map.fitBounds(currentLayer.getBounds())

  let biotopeMeta = ''

  if (data['designation'].length > 1) {
    biotopeMeta = `<h3 class="text-xl font-bold px-3">${data['designation']}</h3>`
  }

  document.querySelector('#biotopeMeta').innerHTML = biotopeMeta
}


function cleanBiotopeMeta() {
  document.querySelector('#biotopeMeta').innerHTML = ''
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
  const title = 'Stadtplan der Denkmalliste Flensburg'

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
    attribution: '&copy; <a href="https://www.schleswig-holstein.de/DE/landesregierung/ministerien-behoerden/LFU" target="_blank">LfU SH</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
  }).addTo(map)

  L.tileLayer('https://tiles.oklabflensburg.de/bksh/{z}/{x}/{y}.png', {
    opacity: 0.8,
    maxZoom: 20,
    maxNativeZoom: 20
  }).addTo(map)

  map.on('click', function (e) {
    const lat = e.latlng.lat
    const lng = e.latlng.lng

    fetchBiotopeMeta(lat, lng)
  })

  document.querySelector('#sidebarCloseButton').addEventListener('click', function (e) {
    e.preventDefault()

    document.querySelector('#sidebar').classList.add('sm:h-screen')
    document.querySelector('#sidebar').classList.remove('absolute', 'h-screen')
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
    document.querySelector('#sidebar').classList.add('sm:h-screen')
    document.querySelector('#sidebar').classList.remove('absolute', 'h-screen')
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