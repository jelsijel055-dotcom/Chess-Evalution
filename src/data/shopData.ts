import { SkinItem, Quest } from '../types/chess';

export const BOARD_SKINS: SkinItem[] = [
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Neon',
    type: 'board',
    priceGold: 0,
    colors: {
      light: '#1e293b', // slate-800
      dark: '#0f172a', // slate-900
      accent: '#06b6d4', // cyan-500
      border: '#0284c7', // sky-600
    },
    description: 'Papan futuristik bertenaga neon holografik dengan aksen grid digital biru safir.',
  },
  {
    id: 'obsidian_gold',
    name: 'Obsidian & Gold Imperial',
    type: 'board',
    priceGold: 1500,
    colors: {
      light: '#27272a', // zinc-800
      dark: '#18181b', // zinc-900
      accent: '#eab308', // yellow-500
      border: '#ca8a04', // yellow-600
    },
    description: 'Batu obsidian hitam pekat dengan lempengan emas murni standar kejuaraan kaisar.',
  },
  {
    id: 'classic_wood',
    name: 'Turnamen Kayu Oak',
    type: 'board',
    priceGold: 1000,
    colors: {
      light: '#fde68a', // amber-200
      dark: '#b45309', // amber-700
      accent: '#d97706', // amber-600
      border: '#78350f', // amber-900
    },
    description: 'Tekstur kayu kenari dan oak klasik untuk pencinta nuansa catur tradisional.',
  },
  {
    id: 'emerald_realm',
    name: 'Emerald Dragon',
    type: 'board',
    priceGold: 2200,
    colors: {
      light: '#dcfce7', // green-100
      dark: '#15803d', // green-700
      accent: '#10b981', // emerald-500
      border: '#064e3b', // green-950
    },
    description: 'Batu zamrud berkilau dengan aura naga mistis dan permata hijau tua.',
  },
  {
    id: 'volcanic_inferno',
    name: 'Inferno Volkanik VIP',
    type: 'board',
    priceGems: 400,
    isPremium: true,
    colors: {
      light: '#450a0a', // red-950
      dark: '#1c1917', // stone-900
      accent: '#ef4444', // red-500
      border: '#dc2626', // red-600
    },
    description: 'Papan lava aktif berdenyut dengan retakan magma panas khusus pemegang Evolution Pass VIP.',
  },
];

export const PIECE_SKINS: SkinItem[] = [
  {
    id: 'cyber_mecha',
    name: 'Cyber Mecha Core',
    type: 'piece',
    priceGold: 0,
    description: 'Desain robotik masa depan berbalut pelindung titanium dan lampu indikator LED.',
  },
  {
    id: 'imperial_mythic',
    name: 'Imperial Mythic Royal',
    type: 'piece',
    priceGold: 1800,
    description: 'Ukiran megah kerajaan dengan mahkota berukir zamrud dan perisai permata.',
  },
  {
    id: 'vector_holo',
    name: 'Vector Hologram Minimal',
    type: 'piece',
    priceGold: 1200,
    description: 'Siluet vektor minimalis bergaris neon bersih, presisi tinggi dan sangat kontras.',
  },
  {
    id: 'astral_monarch',
    name: 'Astral Void VIP',
    type: 'piece',
    priceGems: 500,
    isPremium: true,
    description: 'Bidak kosmik bermaterikan bintang gelap dengan aura galaksi berpijar.',
  },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    titleIndo: 'Uji Coba Evolusi',
    titleEng: 'Evolution Trial',
    descriptionIndo: 'Selesaikan 1 pertandingan dalam Mode Evolution.',
    descriptionEng: 'Complete 1 game in Evolution Mode.',
    rewardGold: 250,
    rewardGems: 15,
    current: 0,
    max: 1,
    completed: false,
    claimed: false,
  },
  {
    id: 'q2',
    titleIndo: 'Kekuatan Spesial',
    titleEng: 'Special Power Unleashed',
    descriptionIndo: 'Gunakan 3 kemampuan spesial bidak saat bertanding.',
    descriptionEng: 'Use 3 piece special abilities in any battle.',
    rewardGold: 350,
    rewardGems: 25,
    current: 0,
    max: 3,
    completed: false,
    claimed: false,
  },
  {
    id: 'q3',
    titleIndo: 'Raja Kemenangan',
    titleEng: 'Victory King',
    descriptionIndo: 'Raih 1 kemenangan melawan AI atau Lawan Online.',
    descriptionEng: 'Achieve 1 victory against AI or Online opponent.',
    rewardGold: 500,
    rewardGems: 50,
    current: 0,
    max: 1,
    completed: false,
    claimed: false,
  },
];

export const BATTLE_PASS_TIERS = [
  { tier: 1, xpRequired: 100, freeReward: '150 Koin Emas', vipReward: '100 Permata Ungu' },
  { tier: 2, xpRequired: 250, freeReward: 'Badge Rookie', vipReward: 'Aura Ksatria Pegasus' },
  { tier: 3, xpRequired: 450, freeReward: '300 Koin Emas', vipReward: 'Title: Komandan Taktik' },
  { tier: 4, xpRequired: 700, freeReward: 'Emote GG', vipReward: 'Avatar GM Cassandra' },
  { tier: 5, xpRequired: 1000, freeReward: '500 Koin Emas', vipReward: 'Skin Papan Obsidian' },
  { tier: 6, xpRequired: 1400, freeReward: '50 Permata', vipReward: 'Efek Serangan Nova' },
  { tier: 7, xpRequired: 1850, freeReward: '750 Koin Emas', vipReward: '200 Permata Ekstra' },
  { tier: 8, xpRequired: 2400, freeReward: 'Title: Penakluk Papan', vipReward: 'Aura Mahkota Emas' },
  { tier: 9, xpRequired: 3000, freeReward: '1000 Koin Emas', vipReward: 'Skin Bidak Astral Void' },
  { tier: 10, xpRequired: 3800, freeReward: 'Piala Master', vipReward: 'Skin Ratu Mythic Mecha Emas' },
];
