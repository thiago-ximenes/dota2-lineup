import { NextResponse } from "next/server";
import { OpenDotaHeroRepository } from "@/src/infrastructure/repositories/opendota-hero-repository";
import { GetHeroesUseCase } from "@/src/application/use-cases/get-heroes-use-case";

// Tempo de cache configurado para 1 mês (em segundos)
// 30 dias * 24 horas * 60 minutos * 60 segundos
const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

export const GET = async () => {
  try {
    // Injetando as dependências manualmente (poderia usar um container DI também)
    const heroRepository = new OpenDotaHeroRepository();
    const getHeroesUseCase = new GetHeroesUseCase(heroRepository);
    
    // Executando o caso de uso
    const heroes = await getHeroesUseCase.execute();

    return NextResponse.json(heroes, {
      status: 200,
      headers: {
        // Configuração de cache para o Next.js 15
        "Cache-Control": `public, s-maxage=${ONE_MONTH_IN_SECONDS}, stale-while-revalidate`,
      },
    });
  } catch (error) {
    console.error("Error fetching heroes:", error);
    return NextResponse.json(
      { error: "Failed to fetch heroes" },
      { status: 500 }
    );
  }
}

// Configuração de cache para o Next.js 15
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = ONE_MONTH_IN_SECONDS;