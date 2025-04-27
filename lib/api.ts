import type { HeroApiResponse } from "@/lib/types"

const API_BASE_URL = "https://api.opendota.com/api"
const HERO_IMAGE_BASE = "http://cdn.dota2.com"

export async function fetchHeroes(): Promise<HeroApiResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/heroStats`)
    console.log("Fetched heroes:", response)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json() as HeroApiResponse[]

    // Log the first hero's image paths to debug
    if (data.length > 0) {
      console.log("Raw hero image paths:", {
        id: data[0].id,
        name: data[0].localized_name,
        img: data[0].img,
        icon: data[0].icon,
      })
    }

    return data.map((hero: HeroApiResponse) => {
      // Special handling for hero ID 1 (Anti-Mage) which seems to have issues
      if (hero.id === 1) {
        console.log("Special handling for hero ID 1:", hero.localized_name)
        // Use a hardcoded path for Anti-Mage if that's hero ID 1
        return {
          ...hero,
          img: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/antimage.png?`,
          icon: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/icons/antimage.png?`,
        }
      }
      
      // Special handling for hero ID 15 (likely Razor) which has image loading issues
      if (hero.id === 15) {
        console.log("Special handling for hero ID 15:", hero.localized_name)
        return {
          ...hero,
          img: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/razor.png?`,
          icon: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/icons/razor.png?`,
        }
      }

      // Ensure the image URLs are properly formatted with the base URL
      // Check if the path already starts with http or if it's a relative path
      const imgPath = hero.img.startsWith("http") ? hero.img : `${HERO_IMAGE_BASE}${hero.img}`
      const iconPath = hero.icon.startsWith("http") ? hero.icon : `${HERO_IMAGE_BASE}${hero.icon}`

      return {
        ...hero,
        img: imgPath,
        icon: iconPath,
      }
    })
  } catch (error) {
    console.error("Error fetching heroes:", error)
    return []
  }
}
