import { HeroRepository } from "../../domain/repositories/hero-repository";
import { Hero, HeroDTO } from "../../domain/value-objects/hero";

// Constantes para URLs
const API_BASE_URL = "https://api.opendota.com/api";
const HERO_IMAGE_BASE = "http://cdn.dota2.com";

// Tipo para a resposta da API
interface OpenDotaHeroResponse {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  base_health: number;
  base_mana: number;
  base_str: number;
  base_agi: number;
  base_int: number;
  [key: string]: any; // Para outros campos que possam existir na API
}

export class OpenDotaHeroRepository implements HeroRepository {
  private processHeroImage(hero: OpenDotaHeroResponse): OpenDotaHeroResponse {
    // Correções especiais para heróis com problemas de imagem
    if (hero.id === 1) {
      return {
        ...hero,
        img: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/antimage.png?`,
        icon: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/icons/antimage.png?`,
      };
    }
    
    if (hero.id === 15) {
      return {
        ...hero,
        img: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/razor.png?`,
        icon: `${HERO_IMAGE_BASE}/apps/dota2/images/dota_react/heroes/icons/razor.png?`,
      };
    }

    // Garante que as URLs de imagem estejam formatadas corretamente
    const imgPath = hero.img.startsWith("http") ? hero.img : `${HERO_IMAGE_BASE}${hero.img}`;
    const iconPath = hero.icon.startsWith("http") ? hero.icon : `${HERO_IMAGE_BASE}${hero.icon}`;

    return {
      ...hero,
      img: imgPath,
      icon: iconPath,
    };
  }

  async fetchHeroesFromAPI(): Promise<OpenDotaHeroResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/heroStats`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const heroes = await response.json() as OpenDotaHeroResponse[];
      return heroes.map(hero => this.processHeroImage(hero));
    } catch (error) {
      console.error("Error fetching heroes from OpenDota API:", error);
      return [];
    }
  }

  async findAll(): Promise<Hero[]> {
    const heroesData = await this.fetchHeroesFromAPI();
    return heroesData.map(hero => Hero.create(hero));
  }

  async findAllDTO(): Promise<HeroDTO[]> {
    const heroes = await this.findAll();
    return heroes.map(hero => hero.toJSON());
  }
}