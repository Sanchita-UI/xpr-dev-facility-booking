import React, { useEffect, useState } from 'react'
import './MapThumbnail.css'

const MapThumbnail = ({ address }) => {
  const [mapSrc, setMapSrc] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Helper function to load map tile
  const loadMapTile = (lat, lon) => {
    const zoom = 15
    const n = Math.pow(2, zoom)
    const x = Math.floor((lon + 180) / 360 * n)
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n)
    
    const cartoUrl = `https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/${zoom}/${x}/${y}.png`
    const osmUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
    
    const testImg = new Image()
    testImg.crossOrigin = 'anonymous'
    testImg.onload = () => {
      console.log('Map tile loaded successfully')
      setMapSrc(cartoUrl)
      setIsLoading(false)
    }
    testImg.onerror = () => {
      console.log('CartoDB failed, trying OpenStreetMap')
      const testOsm = new Image()
      testOsm.onload = () => {
        setMapSrc(osmUrl)
        setIsLoading(false)
      }
      testOsm.onerror = () => {
        console.error('All tile servers failed')
        setHasError(true)
        setIsLoading(false)
      }
      testOsm.src = osmUrl
    }
    testImg.src = cartoUrl
  }

  // Helper function for city center fallback
  const tryCityCenterFallback = (addressText) => {
    const cityMatch = addressText.match(/Vancouver|Toronto|Montreal|Calgary|Ottawa|Edmonton|Winnipeg|Quebec/i)
    if (cityMatch) {
      const cityName = cityMatch[0]
      console.log('Using city center fallback for:', cityName)
      
      const cityCoords = {
        'Vancouver': { lat: 49.2827, lon: -123.1207 },
        'Toronto': { lat: 43.6532, lon: -79.3832 },
        'Montreal': { lat: 45.5017, lon: -73.5673 },
        'Calgary': { lat: 51.0447, lon: -114.0719 },
        'Ottawa': { lat: 45.4215, lon: -75.6972 },
        'Edmonton': { lat: 53.5461, lon: -113.4938 },
        'Winnipeg': { lat: 49.8951, lon: -97.1384 },
        'Quebec': { lat: 46.8139, lon: -71.2080 }
      }
      
      const coords = cityCoords[cityName]
      if (coords) {
        loadMapTile(coords.lat, coords.lon)
        return true
      }
    }
    
    // If no city match, use Vancouver as default
    console.log('No city match found, using Vancouver as default')
    loadMapTile(49.2827, -123.1207)
    return true
  }

  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHasError(false)

    const cleanAddress = address.trim()
    console.log('Geocoding address:', cleanAddress)

    // Check if we can use city center fallback immediately (skip geocoding for known cities)
    if (tryCityCenterFallback(cleanAddress)) {
      // City center fallback was used, don't proceed with geocoding
      return
    }

    // Geocode address using OpenStreetMap Nominatim
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}&limit=5&addressdetails=1`
    
    fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'ContractManagementApp/1.0',
        'Accept-Language': 'en'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Geocoding failed with status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0]
          const lat = parseFloat(result.lat)
          const lon = parseFloat(result.lon)
          
          if (!isNaN(lat) && !isNaN(lon)) {
            console.log('Coordinates found:', { lat, lon })
            loadMapTile(lat, lon)
          } else {
            throw new Error('Invalid coordinates received')
          }
        } else {
          // No geocoding results, use city center fallback
          console.log('No geocoding results, using city center fallback')
          tryCityCenterFallback(cleanAddress)
        }
      })
      .catch(error => {
        console.error('Error geocoding address:', error)
        // On error, try city center fallback
        tryCityCenterFallback(cleanAddress)
      })
  }, [address])

  if (isLoading) {
    return <div className="map-thumbnail-container map-thumbnail-loading"></div>
  }

  if (hasError || !mapSrc) {
    return <div className="map-thumbnail-container map-thumbnail-error"></div>
  }

  return (
    <div className="map-thumbnail-container">
      <img 
        src={mapSrc} 
        alt={`Map of ${address}`}
        className="map-thumbnail-image"
        onError={(e) => {
          console.error('Map image failed to load')
          setHasError(true)
          e.target.style.display = 'none'
        }}
        onLoad={() => {
          setIsLoading(false)
        }}
      />
    </div>
  )
}

export default MapThumbnail
