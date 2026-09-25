/**
 * stationsConfig.ts
 * Configuração das 8 Estações Interdimensionais com seus respectivos Biomas e Links customizáveis.
 * Você pode alterar facilmente os links, nomes, títulos, textos e o intervalo de distância aqui!
 */

import { BiomeType } from '../types/game';

export interface BiomeVisualConfig {
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  sunColor: number;
  sunIntensity: number;
  ambientColor: number;
  ambientIntensity: number;
  groundColor: number;
  ballastColor: number;
  railColor: number;
  railEmissive: number;
  tieColor: number;
  collectibleColor: number;
  collectibleEmissive: number;
  collectibleName: string;
  hasVintageFilter: boolean;
}

export interface StationData {
  id: number;
  biome: BiomeType;
  milestoneDistance: number; // Distância em metros para ativar esta estação
  nome: string;
  subtitulo: string;
  descricao: string;
  link: string;
  textoBotao: string;
  icone: string;
  badge: string;
  corTema: string;
  portalColor: number;
  visuals: BiomeVisualConfig;
}

/**
 * INTERVALO_ENTRE_ESTACOES (em metros)
 * Padrão: 500m (Ex: 500m, 1000m, 1500m, 2000m, 2500m, 3000m, 3500m, 4000m...)
 * Você pode alterar este valor livremente!
 */
export const INTERVALO_ENTRE_ESTACOES_METROS = 500;

/**
 * Definição visual completa para cada um dos 8 Biomas
 */
export const BIOME_CONFIGS: Record<BiomeType, BiomeVisualConfig> = {
  WESTERN: {
    skyColor: 0xd68953, // Warm Sunset Orange
    fogColor: 0xd68953,
    fogDensity: 0.012,
    sunColor: 0xffeedd,
    sunIntensity: 2.2,
    ambientColor: 0x73482a,
    ambientIntensity: 0.8,
    groundColor: 0xc49666, // Red Canyon Sand
    ballastColor: 0x6e5d4f,
    railColor: 0x858994,
    railEmissive: 0x000000,
    tieColor: 0x422a1d,
    collectibleColor: 0xffcc00,
    collectibleEmissive: 0x443300,
    collectibleName: 'Moedas de Ouro',
    hasVintageFilter: true,
  },
  GALAXY: {
    skyColor: 0x080214, // Deep Cosmic Space
    fogColor: 0x0d0422,
    fogDensity: 0.008,
    sunColor: 0x38bdf8, // Cool illuminated starlight
    sunIntensity: 2.2, // Increased for sharper specular highlights on obstacles
    ambientColor: 0x3b1d6e, // Brighter nebula ambient
    ambientIntensity: 1.35, // Clear ambient illumination for obstacles
    groundColor: 0x12082b, // Asteroid Dust / Star grid
    ballastColor: 0x1e1045,
    railColor: 0x00ffff, // Glowing Neon Cyan
    railEmissive: 0x0088aa,
    tieColor: 0x3b186b,
    collectibleColor: 0x38bdf8, // Star Crystals
    collectibleEmissive: 0x0284c7,
    collectibleName: 'Cristais Estelares',
    hasVintageFilter: false,
  },
  UNICORN: {
    skyColor: 0xf5b5d8, // Pastel Rainbow Candy Sky
    fogColor: 0xf8d7ec,
    fogDensity: 0.011,
    sunColor: 0xfff0fa,
    sunIntensity: 2.4,
    ambientColor: 0xe9a8d0,
    ambientIntensity: 1.0,
    groundColor: 0x86efac, // Mint green fairy meadow
    ballastColor: 0xfbcfe8, // Strawberry cream gravel
    railColor: 0xf472b6, // Rainbow pink rails
    railEmissive: 0x831843,
    tieColor: 0xfde047,
    collectibleColor: 0xf43f5e, // Prismatic Hearts / Gems
    collectibleEmissive: 0xbe123c,
    collectibleName: 'Gemas Arco-Íris',
    hasVintageFilter: false,
  },
  VOLCANO: {
    skyColor: 0x220503, // Burning Ash Crimson
    fogColor: 0x450a0a,
    fogDensity: 0.013,
    sunColor: 0xff5511,
    sunIntensity: 2.5,
    ambientColor: 0x551105,
    ambientIntensity: 0.9,
    groundColor: 0x1c1917, // Scorched basalt rock with lava veins
    ballastColor: 0x292524,
    railColor: 0xf97316, // Incandescent molten rails
    railEmissive: 0x9a3412,
    tieColor: 0x18181b,
    collectibleColor: 0xef4444, // Lava Rubies
    collectibleEmissive: 0x7f1d1d,
    collectibleName: 'Rubis de Lava',
    hasVintageFilter: false,
  },
  ICE_AGE: {
    skyColor: 0x0c2738, // Polar Twilight Glacial Sky
    fogColor: 0x7dd3fc,
    fogDensity: 0.012,
    sunColor: 0xbae6fd,
    sunIntensity: 2.0,
    ambientColor: 0x0369a1,
    ambientIntensity: 1.1,
    groundColor: 0xe0f2fe, // Glacial Snow & Pack Ice
    ballastColor: 0x38bdf8,
    railColor: 0x7dd3fc, // Frosted Blue Steel
    railEmissive: 0x0369a1,
    tieColor: 0x1e3a5f,
    collectibleColor: 0x67e8f9, // Frost Shards
    collectibleEmissive: 0x0891b2,
    collectibleName: 'Fragmentos de Gelo',
    hasVintageFilter: false,
  },
  CYBERPUNK: {
    skyColor: 0x05040d, // Neo Tokyo Dystopian Night
    fogColor: 0x2e1065,
    fogDensity: 0.011,
    sunColor: 0xf43f5e,
    sunIntensity: 2.1,
    ambientColor: 0x064e3b,
    ambientIntensity: 1.2,
    groundColor: 0x09090b, // Wet Dark Asphalt with LED lines
    ballastColor: 0x18181b,
    railColor: 0x06b6d4, // Cyber Neon Cyan
    railEmissive: 0x0e7490,
    tieColor: 0x831843, // Neon Magenta sleepers
    collectibleColor: 0xfacc15, // Holographic Credits
    collectibleEmissive: 0xa16207,
    collectibleName: 'Nano Créditos',
    hasVintageFilter: false,
  },
  UNDERWATER: {
    skyColor: 0x042f2e, // Deep Oceanic Abyss
    fogColor: 0x0e7490,
    fogDensity: 0.014,
    sunColor: 0x2dd4bf,
    sunIntensity: 2.0,
    ambientColor: 0x0f766e,
    ambientIntensity: 1.2,
    groundColor: 0x155e75, // Seabed Coral Sediment
    ballastColor: 0x134e4a,
    railColor: 0x14b8a6, // Sunken Bronze with Aqua Bioluminescence
    railEmissive: 0x0f766e,
    tieColor: 0x064e3b,
    collectibleColor: 0xa7f3d0, // Glowing Ocean Pearls
    collectibleEmissive: 0x059669,
    collectibleName: 'Pérolas do Oceano',
    hasVintageFilter: false,
  },
  CANDY_LAND: {
    skyColor: 0xfecdd3, // Cotton Candy Rose Sky
    fogColor: 0xfda4af,
    fogDensity: 0.012,
    sunColor: 0xfff1f2,
    sunIntensity: 2.3,
    ambientColor: 0xf472b6,
    ambientIntensity: 1.0,
    groundColor: 0xfef08a, // Waffle Biscuit Ground
    ballastColor: 0x451a03, // Chocolate Cookie Crumbles
    railColor: 0xef4444, // Peppermint Candy Cane Stripes
    railEmissive: 0x991b1b,
    tieColor: 0xffffff,
    collectibleColor: 0xf59e0b, // Golden Bonbons / Candies
    collectibleEmissive: 0xb45309,
    collectibleName: 'Doces Dourados',
    hasVintageFilter: false,
  },
};

/**
 * 8 Estações Interdimensionais com links customizáveis
 */
export const ESTACOES_CONFIG: StationData[] = [
  {
    id: 1,
    biome: 'WESTERN',
    milestoneDistance: 500,
    nome: 'Estação Velho Oeste',
    subtitulo: 'Portal 1 · Canyons & Saloon da Fronteira',
    descricao: 'Bem-vindo ao Velho Oeste original! Visite a nossa loja oficial para conferir as novidades e produtos dos pioneiros.',
    link: 'https://SEU-LINK-1.com',
    textoBotao: 'Visitar Loja Oficial',
    icone: '🤠',
    badge: '1ª Parada · 500m',
    corTema: 'from-amber-700 via-amber-800 to-amber-950',
    portalColor: 0xd97706,
    visuals: BIOME_CONFIGS.WESTERN,
  },
  {
    id: 2,
    biome: 'GALAXY',
    milestoneDistance: 1000,
    nome: 'Estação Galáctica',
    subtitulo: 'Portal 2 · Trilhos Cósmicos & Nebulosa',
    descricao: 'Você viajou no tempo para as estrelas! Entre no nosso Discord oficial da comunidade e conheça tripulantes de toda a galáxia.',
    link: 'https://SEU-LINK-2.com',
    textoBotao: 'Entrar no Discord Galáctico',
    icone: '🚀',
    badge: '2ª Parada · 1.000m',
    corTema: 'from-indigo-900 via-purple-900 to-slate-950',
    portalColor: 0x818cf8,
    visuals: BIOME_CONFIGS.GALAXY,
  },
  {
    id: 3,
    biome: 'UNICORN',
    milestoneDistance: 1500,
    nome: 'Estação dos Unicórnios',
    subtitulo: 'Portal 3 · Castelo das Nuvens & Arco-Íris',
    descricao: 'Bem-vindo ao reino mágico dos unicórnios e nuvens de algodão doce! Participe dos nossos sorteios e eventos mágicos.',
    link: 'https://SEU-LINK-3.com',
    textoBotao: 'Acessar Clube Encantado',
    icone: '🦄',
    badge: '3ª Parada · 1.500m',
    corTema: 'from-pink-600 via-purple-600 to-rose-900',
    portalColor: 0xf472b6,
    visuals: BIOME_CONFIGS.UNICORN,
  },
  {
    id: 4,
    biome: 'VOLCANO',
    milestoneDistance: 2000,
    nome: 'Estação Terra do Fogo',
    subtitulo: 'Portal 4 · Rios de Lava & Basalto Fumegante',
    descricao: 'O calor é extremo nas forjas vulcânicas! Confira nossas ofertas em chamas e pacotes quentes exclusivos.',
    link: 'https://SEU-LINK-4.com',
    textoBotao: 'Ver Ofertas Incandescentes',
    icone: '🌋',
    badge: '4ª Parada · 2.000m',
    corTema: 'from-red-700 via-orange-800 to-stone-950',
    portalColor: 0xf97316,
    visuals: BIOME_CONFIGS.VOLCANO,
  },
  {
    id: 5,
    biome: 'ICE_AGE',
    milestoneDistance: 2500,
    nome: 'Estação Era Glacial',
    subtitulo: 'Portal 5 · Cavernas de Gelo & Montanhas Congeladas',
    descricao: 'Neve pura e cavernas milenares sob a aurora boreal. Baixe nossos papéis de parede em alta definição e guias do sobrevivente.',
    link: 'https://SEU-LINK-5.com',
    textoBotao: 'Baixar Pacote Congelado',
    icone: '❄️',
    badge: '5ª Parada · 2.500m',
    corTema: 'from-cyan-800 via-sky-900 to-slate-950',
    portalColor: 0x38bdf8,
    visuals: BIOME_CONFIGS.ICE_AGE,
  },
  {
    id: 6,
    biome: 'CYBERPUNK',
    milestoneDistance: 3000,
    nome: 'Estação Cyberpunk 2099',
    subtitulo: 'Portal 6 · Megalópole Neon & Trilhos Magnéticos',
    descricao: 'Conectando ao ciberespaço do ano 2099. Acesse nosso canal de tecnologia, podcasts e inovações futuristas.',
    link: 'https://SEU-LINK-6.com',
    textoBotao: 'Conectar no Canal Tech',
    icone: '⚡',
    badge: '6ª Parada · 3.000m',
    corTema: 'from-violet-900 via-fuchsia-950 to-black',
    portalColor: 0x06b6d4,
    visuals: BIOME_CONFIGS.CYBERPUNK,
  },
  {
    id: 7,
    biome: 'UNDERWATER',
    milestoneDistance: 3500,
    nome: 'Estação Subaquática',
    subtitulo: 'Portal 7 · Recifes de Coral & Cidade Submersa',
    descricao: 'Viajando sob o oceano azul com cardumes e ruínas antigas. Descubra nossas iniciativas ambientais e projetos marinhos.',
    link: 'https://SEU-LINK-7.com',
    textoBotao: 'Apoiar Projeto Oceano',
    icone: '🌊',
    badge: '7ª Parada · 3.500m',
    corTema: 'from-teal-800 via-cyan-900 to-slate-950',
    portalColor: 0x2dd4bf,
    visuals: BIOME_CONFIGS.UNDERWATER,
  },
  {
    id: 8,
    biome: 'CANDY_LAND',
    milestoneDistance: 4000,
    nome: 'Estação Mundo Doce',
    subtitulo: 'Portal 8 · Pirulitos Gigantes & Rios de Confeito',
    descricao: 'Você alcançou a confeitaria mágica dos sonhos! Resgate um cupom de desconto doce e adoce o seu dia.',
    link: 'https://SEU-LINK-8.com',
    textoBotao: 'Resgatar Cupom Doce',
    icone: '🍭',
    badge: '8ª Parada · 4.000m',
    corTema: 'from-pink-600 via-rose-700 to-amber-950',
    portalColor: 0xf43f5e,
    visuals: BIOME_CONFIGS.CANDY_LAND,
  },
];
