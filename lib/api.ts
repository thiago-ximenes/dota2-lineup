import type { HeroApiResponse } from "@/lib/types"

// Substituindo a chamada direta à OpenDota pela nossa API com cache
export async function fetchHeroes(): Promise<HeroApiResponse[]> {
  try {
    const response = await fetch('/api/heroes');
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching heroes:", error)
    return []
  }
}
