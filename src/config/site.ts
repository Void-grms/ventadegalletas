export const WA_NUMBER = "51970642671";        // +51 970 642 671
export const WA_LINK = `https://wa.me/${WA_NUMBER}`;
export const WA_DISPLAY = "+51 970 642 671";  // formato legible para mostrar

export const BRAND = {
  name: "Galletas",
  tagline: "Hechas con amor",
};

export const NAV = [
  { label: "Inicio", href: "/", key: "home" },
  { label: "Las cajas", href: "/cajas", key: "cajas" },
  { label: "Por qué", href: "/nosotros", key: "nosotros" },
  { label: "Cómo pedir", href: "/como-pedir", key: "como" },
] as const;
