export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
  modelPath: string;
  features: string[];
  attribution: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "quantum-mug",
    name: "Quantum Mug",
    price: 24.99,
    description: "Keeps coffee hot through dimension shifts. Self-heating ceramic.",
    emoji: "☕",
    modelPath: "/mug.glb",
    features: [
      "Self-heating ceramic",
      "Dimension-shift resistant",
      "Quantum insulation layer",
      "Dishwasher safe (most dimensions)",
      "Made on Earth",
    ],
    attribution: '"Car Mug 1" (https://skfb.ly/KErN) by VirtualBG — CC BY-NC 4.0',
  },
  {
    id: "neural-headphones",
    name: "Neural Headphones",
    price: 189.0,
    description: "Plays the music you were about to think of. ANC + precognition.",
    emoji: "🎧",
    modelPath: "/headset.glb",
    features: [
      "Active noise cancellation",
      "Precognitive track selection",
      "Neural lace interface",
      "40-hour battery (subjective time)",
      "Made on Earth",
    ],
    attribution: '"David Clark Pilot Headset" (https://skfb.ly/o8Vs9) by simon_fischer — CC BY 4.0',
  },
  {
    id: "gravity-bottle",
    name: "Gravity Bottle",
    price: 34.5,
    description: "Water stays inside no matter which way is down. Zero-G tested.",
    emoji: "🥤",
    modelPath: "/bottle.glb",
    features: [
      "Zero-G sealed valve",
      "Insulated for 12 hours",
      "Titanium alloy shell",
      "Fits any cup holder (any dimension)",
      "Made on Earth",
    ],
    attribution: '"Vacuum Bottle" (https://skfb.ly/KLIJ) by VirtualBG — CC BY-NC 4.0',
  },
  {
    id: "photon-lamp",
    name: "Photon Lamp",
    price: 79.99,
    description: "Adjustable color temperature from candle to supernova. USB-C.",
    emoji: "💡",
    modelPath: "/lamp.glb",
    features: [
      "Color temp: candle to supernova",
      "USB-C fast charge",
      "Adjustable photon beam angle",
      "Aluminum chassis",
      "Made on Earth",
    ],
    attribution: '"Desk lamp" (https://skfb.ly/6XZwF) by HASSAN — CC BY 4.0',
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
