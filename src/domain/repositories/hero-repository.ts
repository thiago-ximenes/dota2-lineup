import { Hero, HeroDTO } from "../value-objects/hero";

export interface HeroRepository {
  findAll(): Promise<Hero[]>;
  findAllDTO(): Promise<HeroDTO[]>;
}