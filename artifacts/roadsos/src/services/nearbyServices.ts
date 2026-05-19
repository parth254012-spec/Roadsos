export interface NearbyService {
  id: string;
  name: string;
  type: "hospital" | "police" | "fire_station" | "clinic" | "ambulance";
  lat: number;
  lng: number;
  phone?: string;
  distance?: number;
}

export async function getNearbyServices(
  lat: number,
  lng: number,
  radius = 6000
): Promise<NearbyService[]> {
  const query = `
[out:json];
(
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
  node["amenity"="police"](around:${radius},${lat},${lng});
  way["amenity"="police"](around:${radius},${lat},${lng});
  node["amenity"="fire_station"](around:${radius},${lat},${lng});
  node["amenity"="clinic"](around:${radius},${lat},${lng});
  way["amenity"="clinic"](around:${radius},${lat},${lng});
  node["emergency"="ambulance_station"](around:${radius},${lat},${lng});
);
out center;`;

  try {
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!resp.ok) throw new Error("Overpass API error");
    const data = await resp.json();

    const results: NearbyService[] = data.elements
      .filter((el: any) => {
        // For ways, center must exist
        if (el.type === "way") return el.center;
        return el.lat !== undefined;
      })
      .map((el: any) => {
        const elLat = el.type === "way" ? el.center.lat : el.lat;
        const elLng = el.type === "way" ? el.center.lon : el.lon;
        const amenity = el.tags?.amenity;
        const emergency = el.tags?.emergency;

        let type: NearbyService["type"] = "hospital";
        if (amenity === "police") type = "police";
        else if (amenity === "fire_station") type = "fire_station";
        else if (amenity === "clinic") type = "clinic";
        else if (emergency === "ambulance_station") type = "ambulance";

        return {
          id: String(el.id),
          name:
            el.tags?.name ||
            el.tags?.["name:en"] ||
            formatTypeName(type),
          type,
          lat: elLat,
          lng: elLng,
          phone: el.tags?.phone || el.tags?.["contact:phone"] || undefined,
          distance: haversineDistance(lat, lng, elLat, elLng),
        };
      })
      .sort(
        (a: NearbyService, b: NearbyService) =>
          (a.distance ?? 0) - (b.distance ?? 0)
      );

    return results;
  } catch (error) {
    console.error("Error fetching nearby services:", error);
    return [];
  }
}

function formatTypeName(type: NearbyService["type"]): string {
  const map: Record<NearbyService["type"], string> = {
    hospital: "Hospital",
    police: "Police Station",
    fire_station: "Fire Station",
    clinic: "Medical Clinic",
    ambulance: "Ambulance Station",
  };
  return map[type];
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
