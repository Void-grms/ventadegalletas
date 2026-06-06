export type BoxKey = "pequena" | "mediana" | "grande";

export interface Box {
  key: BoxKey;
  name: string;
  price: number;   // soles
  cookies: number;
  accent: string;
  accentDeep: string;
  featured: boolean;
  sub: string;
  features: string[];
  img: string;      // ruta en /public
}

export const BOXES: Box[] = [
  {
    key: "pequena", name: "Caja Pequeña", price: 3, cookies: 4,
    accent: "#C97E78", accentDeep: "#B5645E", featured: false,
    sub: "Para un antojo o un detalle bonito.",
    features: ["4 galletas artesanales", "Ideal para antojos o detalles pequeños", "Perfecta para regalar"],
    img: "/assets/box-pequena.png",
  },
  {
    key: "mediana", name: "Caja Mediana", price: 5, cookies: 8,
    accent: "#CC8A3C", accentDeep: "#B5752A", featured: true,
    sub: "El equilibrio perfecto entre cantidad y precio.",
    features: ["8 galletas artesanales", "Perfecta para compartir en pareja o familia", "Equilibrio entre cantidad y precio"],
    img: "/assets/box-mediana.png",
  },
  {
    key: "grande", name: "Caja Grande", price: 8, cookies: 14,
    accent: "#87894C", accentDeep: "#6F7140", featured: false,
    sub: "La mejor opción para compartir en grande.",
    features: ["14 galletas artesanales", "La mejor opción para compartir en grande", "Ideal para reuniones, cumpleaños o regalar"],
    img: "/assets/box-grande.png",
  },
];

export const getBox = (key: string): Box =>
  BOXES.find(b => b.key === key) ?? BOXES[1]; // default: mediana
