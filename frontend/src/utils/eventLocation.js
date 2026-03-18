const LOCATION_CACHE_KEY = "smartq-location-geocode-cache-v1";

const readCache = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(LOCATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage write errors so location lookup remains non-blocking.
  }
};

const normalizeLocationKey = (location) => String(location || "").trim().toLowerCase();

export const getDistanceFilterOptions = () => [
  { value: "", label: "Any distance" },
  { value: "5", label: "Under 5 km" },
  { value: "10", label: "Under 10 km" },
  { value: "25", label: "Under 25 km" }
];

export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Turn on location access to use the nearby filter."));
          return;
        }

        reject(new Error("Unable to detect your location right now."));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000
      }
    );
  });

export const geocodeLocation = async (location) => {
  const cache = readCache();
  const key = normalizeLocationKey(location);

  if (!key) {
    return null;
  }

  if (cache[key]) {
    return cache[key];
  }

  const query = encodeURIComponent(location);
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`,
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (!response.ok) {
    throw new Error("Unable to resolve event location.");
  }

  const results = await response.json();
  const firstResult = Array.isArray(results) ? results[0] : null;

  if (!firstResult?.lat || !firstResult?.lon) {
    cache[key] = null;
    writeCache(cache);
    return null;
  }

  const coordinates = {
    latitude: Number(firstResult.lat),
    longitude: Number(firstResult.lon)
  };

  cache[key] = coordinates;
  writeCache(cache);

  return coordinates;
};

export const calculateDistanceKm = (origin, destination) => {
  if (!origin || !destination) {
    return null;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const latitudeOne = toRadians(origin.latitude);
  const latitudeTwo = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(deltaLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const formatDistanceKm = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) {
    return null;
  }

  if (distanceKm < 1) {
    return `${distanceKm.toFixed(1)} km away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
};
