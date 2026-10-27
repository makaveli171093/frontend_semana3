export type UserRole = "GERENTE" | "CLIENTE" | "COCINERO";

export type MealCategory =
  | "Platos principales"
  | "Ensaladas y bowls"
  | "Bebidas"
  | "Postres";

export type OrderStatus =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "LISTO"
  | "ENTREGADO"
  | "CANCELADO";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DemoAccount {
  user: DemoUser;
  password: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MealCategory;
  image: string;
  available: boolean;
  prepTime: number;
  badge?: string;
  calories?: number;

  menuDiaId?: number;
  fechaMenu?: string;
  cantidadDisponible?: number;
  platoPrincipal?: string;
  bebida?: string;
  postre?: string;
}

export type MealDraft = Omit<Meal, "id"> & { id?: string };

export interface OrderLine {
  mealId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface DemoOrder {
  id: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  items: OrderLine[];
  total: number;
  status: OrderStatus;
}

export interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  status: "Activo" | "Nuevo";
  joined: string;
}
