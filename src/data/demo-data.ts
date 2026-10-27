import type { DemoCustomer, DemoOrder, Meal } from "@/types"

export const demoMeals: Meal[] = [
  {
    id: "meal-silpancho",
    name: "Silpancho de la casa",
    description: "Crocante, con arroz, papa dorada, huevo y llajua fresca.",
    price: 32,
    category: "Platos principales",
    image: "/images/solandre-hero.png",
    available: true,
    prepTime: 25,
    badge: "Favorito",
    calories: 680,
  },
  {
    id: "meal-pique",
    name: "Pique macho valluno",
    description: "Lomo salteado, papa, chorizo y una salsa hecha en casa.",
    price: 38,
    category: "Platos principales",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 30,
    badge: "Más pedido",
    calories: 740,
  },
  {
    id: "meal-trucha",
    name: "Trucha al limón",
    description: "Trucha a la plancha, quinoa real y vegetales de temporada.",
    price: 36,
    category: "Platos principales",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 24,
    calories: 510,
  },
  {
    id: "meal-quinoa",
    name: "Bowl andino de quinoa",
    description: "Quinoa real, palta, tomate cherry y aderezo de hierbas.",
    price: 28,
    category: "Ensaladas y bowls",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 15,
    badge: "Vegetariano",
    calories: 390,
  },
  {
    id: "meal-ensalada",
    name: "Ensalada del valle",
    description: "Hojas frescas, queso criollo, choclo y vinagreta cítrica.",
    price: 24,
    category: "Ensaladas y bowls",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 12,
    calories: 320,
  },
  {
    id: "meal-fideo",
    name: "Ají de fideo casero",
    description: "Un clásico reconfortante con ají amarillo y hierbas frescas.",
    price: 26,
    category: "Platos principales",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 20,
    calories: 560,
  },
  {
    id: "meal-limonada",
    name: "Limonada de hierbabuena",
    description: "Limón recién exprimido, hierbabuena y un toque de miel.",
    price: 10,
    category: "Bebidas",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 5,
  },
  {
    id: "meal-api",
    name: "Api morado con pastel",
    description: "Api tibio de maíz morado con pastel recién horneado.",
    price: 16,
    category: "Postres",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 8,
  },
  {
    id: "meal-brownie",
    name: "Brownie de cacao",
    description: "Cacao intenso, centro suave y una pizca de sal de Uyuni.",
    price: 12,
    category: "Postres",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85",
    available: true,
    prepTime: 6,
  },
]

const sampleOrderLine = (
  meal: Meal,
  quantity: number,
): DemoOrder["items"][number] => ({
  mealId: meal.id,
  name: meal.name,
  price: meal.price,
  image: meal.image,
  quantity,
})

const todayAt = (hour: number, minute: number) => {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export const demoOrders: DemoOrder[] = [
  {
    id: "ORD-1051",
    customerId: "client-demo",
    customerName: "Valeria Rojas",
    createdAt: todayAt(12, 28),
    items: [sampleOrderLine(demoMeals[0], 1), sampleOrderLine(demoMeals[6], 1)],
    total: 42,
    status: "PENDIENTE",
  },
  {
    id: "ORD-1050",
    customerId: "client-demo",
    customerName: "Valeria Rojas",
    createdAt: todayAt(12, 17),
    items: [sampleOrderLine(demoMeals[3], 1), sampleOrderLine(demoMeals[8], 1)],
    total: 40,
    status: "EN_PREPARACION",
  },
  {
    id: "ORD-1049",
    customerId: "client-02",
    customerName: "Mateo Flores",
    createdAt: todayAt(12, 6),
    items: [sampleOrderLine(demoMeals[1], 1), sampleOrderLine(demoMeals[7], 1)],
    total: 54,
    status: "LISTO",
  },
  {
    id: "ORD-1048",
    customerId: "client-03",
    customerName: "Andrea Camacho",
    createdAt: todayAt(11, 52),
    items: [sampleOrderLine(demoMeals[2], 1), sampleOrderLine(demoMeals[4], 1)],
    total: 60,
    status: "ENTREGADO",
  },
]

export const demoCustomers: DemoCustomer[] = [
  {
    id: "client-demo",
    name: "Valeria Rojas",
    email: "cliente@solandre.bo",
    phone: "+591 712 48 093",
    orders: 8,
    status: "Activo",
    joined: "12 oct 2026",
  },
  {
    id: "client-02",
    name: "Mateo Flores",
    email: "mateo.flores@email.bo",
    phone: "+591 720 15 442",
    orders: 5,
    status: "Activo",
    joined: "18 oct 2026",
  },
  {
    id: "client-03",
    name: "Andrea Camacho",
    email: "andrea.camacho@email.bo",
    phone: "+591 682 40 518",
    orders: 3,
    status: "Nuevo",
    joined: "21 oct 2026",
  },
  {
    id: "client-04",
    name: "Diego Salazar",
    email: "diego.salazar@email.bo",
    phone: "+591 706 33 127",
    orders: 2,
    status: "Activo",
    joined: "24 oct 2026",
  },
  {
    id: "client-05",
    name: "Lucía Vargas",
    email: "lucia.vargas@email.bo",
    phone: "+591 742 90 361",
    orders: 1,
    status: "Nuevo",
    joined: "26 oct 2026",
  },
]

export const mealCategories = [
  "Todos",
  "Platos principales",
  "Ensaladas y bowls",
  "Bebidas",
  "Postres",
] as const
