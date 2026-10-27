import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Order,
  User,
  Meal,
  MealDraft,
  OrderStatus,
} from "@/types";
import { platosService, type Plato } from "@/services/platos.service";
import { menuService } from "@/services/menu.service";

export interface CartItem {
  meal: Meal;
  quantity: number;
}

interface RestaurantContextValue {
  meals: Meal[];
  orders: Order[];
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  menuHoy: Meal[];
  addToCart: (meal: Meal) => void;
  setCartQuantity: (mealId: string, quantity: number) => void;
  removeFromCart: (mealId: string) => void;
  clearCart: () => void;
  createOrder: (user: User) => Order | null;
  saveMeal: (draft: MealDraft) => Promise<void>;
  toggleMealAvailability: (mealId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [menuHoy, setMenuHoy] = useState<Meal[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function cargarCatalogo() {
      try {
        setCatalogLoading(true);
        setCatalogError(null);

        const platos = await platosService.listarCatalogo();

        if (cancelled) return;

        setMeals((actuales) =>
          platos.map((plato) => {
            const existente = actuales.find(
              (meal) => meal.id === String(plato.plato_id),
            );

            return {
              id: String(plato.plato_id),
              name: plato.nombre,
              description: plato.descripcion ?? "",
              category: categoriaFrontend(plato.tipo),
              image: plato.imagen_url ?? "",
              price: existente?.price ?? 0,
              available: false,
              prepTime: existente?.prepTime ?? 0,
            };
          }),
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Error cargando el catálogo:", error);
          setCatalogError("No se pudo cargar el catálogo. Intenta nuevamente.");
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }

    void cargarCatalogo();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function cargarMenuHoy() {
      try {
        const menu = await menuService.obtenerMenuHoy();

        if (cancelled || !menu) return;

        const cantidad = Number(menu.cantidad_disponible);
        const precio = Number(menu.precio_menu);

        const meal: Meal = {
          id: String(menu.menu_dia_id),
          menuDiaId: menu.menu_dia_id,
          fechaMenu: menu.fecha,
          cantidadDisponible: cantidad,
          platoPrincipal: menu.plato_principal?.nombre ?? "",
          bebida: menu.bebida?.nombre ?? "",
          postre: menu.postre?.nombre ?? "",
          name: menu.plato_principal?.nombre
            ? `Menú del día: ${menu.plato_principal.nombre}`
            : "Menú del día",
          description: [
            menu.plato_principal?.descripcion,
            menu.bebida?.nombre ? `Bebida: ${menu.bebida.nombre}` : "",
            menu.postre?.nombre ? `Postre: ${menu.postre.nombre}` : "",
            menu.info_nutricional ?? "",
          ]
            .filter(Boolean)
            .join(" · "),
          price: Number.isFinite(precio) ? precio : 0,
          category: "Platos principales",
          image: menu.imagen_url || "/images/solandre-hero.png",
          available:
            menu.publicado === true &&
            Number.isFinite(cantidad) &&
            cantidad > 0,
          prepTime: 0,
        };

        setMenuHoy([meal]);
      } catch (error) {
        console.error("Error cargando el menú del día:", error);
        if (!cancelled) setMenuHoy([]);
      }
    }

    void cargarMenuHoy();

    return () => {
      cancelled = true;
    };
  }, []);


  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.meal.price * item.quantity,
    0,
  );

  const value = useMemo<RestaurantContextValue>(() => {
    return {
      meals,
      orders,
      cart,
      cartCount,
      cartTotal,
      menuHoy,
      addToCart(meal) {
        if (!meal.available) return;
        setCart((current) => {
          const existing = current.find((item) => item.meal.id === meal.id);
          if (!existing) return [...current, { meal, quantity: 1 }];
          return current.map((item) =>
            item.meal.id === meal.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        });
      },
      setCartQuantity(mealId, quantity) {
        setCart((current) => {
          if (quantity < 1)
            return current.filter((item) => item.meal.id !== mealId);
          return current.map((item) =>
            item.meal.id === mealId ? { ...item, quantity } : item,
          );
        });
      },
      removeFromCart(mealId) {
        setCart((current) => current.filter((item) => item.meal.id !== mealId));
      },
      clearCart() {
        setCart([]);
      },
      createOrder() {
        // El pedido real requiere zona, dirección y método de pago.
        // No generar pedidos locales ni simular una confirmación.
        return null;
      },

      async saveMeal(draft) {
        const idNumerico = draft.id ? Number(draft.id) : NaN;

        const payload = {
          nombre: draft.name.trim(),
          descripcion: draft.description.trim() || null,
          tipo: tipoBackend(draft.category),
          imagen_url: draft.image.trim() || null,
        };

        const plato =
          Number.isInteger(idNumerico) && idNumerico > 0
            ? await platosService.actualizar(idNumerico, payload)
            : await platosService.crear(payload);

        setMeals((actuales) => {
          const id = String(plato.plato_id);
          const anterior = actuales.find((meal) => meal.id === id);

          const actualizado: Meal = {
            id,
            name: plato.nombre,
            description: plato.descripcion ?? "",
            category: categoriaFrontend(plato.tipo),
            image: plato.imagen_url ?? "",
            price: 0,
            available: false,
            prepTime: 0,
          };

          return anterior
            ? actuales.map((meal) => (meal.id === id ? actualizado : meal))
            : [actualizado, ...actuales];
        });
      },

      toggleMealAvailability() {
        // La disponibilidad debe persistirse en el recurso de menú del backend.
        // Hasta conectar ese endpoint, no cambiarla solo en el navegador.
      },

      updateOrderStatus(orderId, status) {
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? { ...order, status } : order,
          ),
        );
      },
    };
  }, [cart, cartTotal, meals, menuHoy, orders]);

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant debe usarse dentro de RestaurantProvider");
  }
  return context;
}

function categoriaFrontend(tipo: Plato["tipo"]): Meal["category"] {
  switch (tipo) {
    case "Principal":
      return "Platos principales";
    case "Acompanamiento":
      return "Ensaladas y bowls";
    case "Bebida":
      return "Bebidas";
    case "Postre":
      return "Postres";
  }
}
function tipoBackend(categoria: Meal["category"]): Plato["tipo"] {
  switch (categoria) {
    case "Platos principales":
      return "Principal";
    case "Ensaladas y bowls":
      return "Acompanamiento";
    case "Bebidas":
      return "Bebida";
    case "Postres":
      return "Postre";
  }
}
