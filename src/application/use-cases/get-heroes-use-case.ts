import { HeroRepository } from "../../domain/repositories/hero-repository";
import { HeroDTO } from "../../domain/value-objects/hero";

export class GetHeroesUseCase {
  constructor(private readonly heroRepository: HeroRepository) {}

  async execute(): Promise<HeroDTO[]> {
    // Retorna os heróis como DTOs (objetos planos) para serem utilizados pelo cliente
    return this.heroRepository.findAllDTO();
  }
}