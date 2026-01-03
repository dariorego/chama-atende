/**
 * Utilitários para parsing de URLs do Google Maps
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Extrai latitude e longitude de uma URL do Google Maps
 * 
 * Suporta formatos:
 * - https://www.google.com/maps/place/.../@-8.1189576,-34.903999,17z/...
 * - https://www.google.com/maps/place/...!3d-8.1189584!4d-34.9014259...
 * - https://www.google.com/maps?q=-8.1189576,-34.903999
 * - https://maps.google.com/...
 */
export function parseGoogleMapsUrl(url: string): LocationCoordinates | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Verificar se é uma URL do Google Maps
  if (!url.includes('google.com/maps') && !url.includes('maps.google.com')) {
    return null;
  }

  try {
    // Padrão 1: @lat,lng,zoom (mais comum em URLs de place)
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      const coords = {
        latitude: parseFloat(atMatch[1]),
        longitude: parseFloat(atMatch[2])
      };
      if (isValidCoordinates(coords)) {
        return coords;
      }
    }

    // Padrão 2: !3dlat!4dlng (formato de dados codificados)
    const dataMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (dataMatch) {
      const coords = {
        latitude: parseFloat(dataMatch[1]),
        longitude: parseFloat(dataMatch[2])
      };
      if (isValidCoordinates(coords)) {
        return coords;
      }
    }

    // Padrão 3: ?q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      const coords = {
        latitude: parseFloat(qMatch[1]),
        longitude: parseFloat(qMatch[2])
      };
      if (isValidCoordinates(coords)) {
        return coords;
      }
    }

    // Padrão 4: ll=lat,lng
    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) {
      const coords = {
        latitude: parseFloat(llMatch[1]),
        longitude: parseFloat(llMatch[2])
      };
      if (isValidCoordinates(coords)) {
        return coords;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Valida se as coordenadas estão dentro dos limites válidos
 */
export function isValidCoordinates(coords: LocationCoordinates): boolean {
  return (
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude) &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

/**
 * Verifica se uma URL é válida do Google Maps
 */
export function isGoogleMapsUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return url.includes('google.com/maps') || url.includes('maps.google.com');
}

/**
 * Gera uma URL do Google Maps a partir de coordenadas
 */
export function generateGoogleMapsUrl(coords: LocationCoordinates): string {
  return `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
}

/**
 * Formata coordenadas para exibição
 */
export function formatCoordinates(coords: LocationCoordinates): string {
  return `${coords.latitude.toFixed(7)}, ${coords.longitude.toFixed(7)}`;
}
