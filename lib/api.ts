import type { Hero } from "@/lib/types"

const API_BASE_URL = "https://api.opendota.com/api"
const HERO_IMAGE_BASE = "https://api.opendota.com"

export async function fetchHeroes(): Promise<Hero[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/heroStats`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data.map((hero: any) => ({
      ...hero,
      // Ensure the image URLs are properly formatted
      img: `${HERO_IMAGE_BASE}${hero.img}`,
      icon: `${HERO_IMAGE_BASE}${hero.icon}`,
    }))
  } catch (error) {
    console.error("Error fetching heroes:", error)
    return []
  }
}

export function getHeroImageUrl(path: string): string {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `${HERO_IMAGE_BASE}${path}`
}
