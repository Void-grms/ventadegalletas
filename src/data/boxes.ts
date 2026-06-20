export type BoxKey = "caja";

export interface Box {
  key: BoxKey;
  name: string;
  price: number;   // soles (precio de 1 caja)
  cookies: number;
  accent: string;
  accentDeep: string;
  featured: boolean;
  sub: string;
  features: string[];
  img: string;      // ruta en /public
}

// Precios: 1 caja S/6 · promo 2 cajas S/10
export const PRICING = {
  unit: 6,   // S/ por 1 caja
  pair: 10,  // S/ por 2 cajas (promo)
} as const;

export const BOXES: Box[] = [
  {
    key: "caja", name: "Caja de galletas", price: PRICING.unit, cookies: 6,
    accent: "#CC8A3C", accentDeep: "#B5752A", featured: true,
    sub: "6 galletas artesanales, recién horneadas con amor.",
    features: [
      "6 galletas artesanales",
      "Vainilla, chocolate o mixto",
      "Promo: 2 cajas por S/10",
    ],
    img: "/assets/box-mediana.png",
  },
];

// Solo hay una caja: getBox siempre devuelve la única presentación.
export const getBox = (_key?: string): Box => BOXES[0];
