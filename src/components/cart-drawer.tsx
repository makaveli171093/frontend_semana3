import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRestaurant } from "@/context/restaurant-context";
import { dashboardForRole } from "@/auth/roles";
import { formatMoney } from "@/components/ui-primitives";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    cartTotal,
    createOrder,
    removeFromCart,
    setCartQuantity,
  } = useRestaurant();
  const [message, setMessage] = useState("");

  if (!open) return null;

  const handleCheckout = async () => {
    if (!cart.length) return;

    if (!user) {
      onClose();
      navigate("/login", { state: { fromCart: true } });
      return;
    }

    if (user.role !== "CLIENTE") {
      setMessage(
        "Debes ingresar con una cuenta de cliente para realizar pedidos.",
      );
      return;
    }

    try {
      setMessage("Registrando tu pedido...");

      // Pendiente: pasar aquí los datos reales de zona,
      // dirección, ubicación y método de pago.
      const order = await createOrder(user);

      if (order) {
        onClose();
        navigate("/cliente/pedidos", {
          state: { orderPlaced: order.id },
        });
      } else {
        setMessage(
          "La confirmación de pedidos aún no está conectada. Tu carrito se conserva; vuelve a intentarlo cuando se habilite el formulario.",
        );
      }
    } catch (error) {
      console.error("Error al registrar el pedido:", error);
      setMessage(
        "No se pudo registrar el pedido. Verifica los datos e inténtalo nuevamente.",
      );
    }
  };

  return (
    <div
      className="drawer-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        aria-label="Tu pedido"
        aria-modal="true"
        className="cart-drawer"
        role="dialog"
      >
        <div className="cart-drawer-header">
          <div className="cart-title-wrap">
            <span className="cart-title-icon">
              <ShoppingBag aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">Tu selección</p>
              <h2>
                Mi pedido <span>({cartCount})</span>
              </h2>
            </div>
          </div>
          <Button
            aria-label="Cerrar carrito"
            className="icon-button"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        {cart.length ? (
          <>
            <div className="cart-items">
              {cart.map(({ meal, quantity }) => (
                <article className="cart-item" key={meal.id}>
                  <img alt="" src={meal.image} />
                  <div className="cart-item-copy">
                    <h3>{meal.name}</h3>
                    <span>{formatMoney(meal.price)}</span>
                    <div
                      className="quantity-control"
                      aria-label={`Cantidad de ${meal.name}`}
                    >
                      <Button
                        aria-label={`Quitar una porción de ${meal.name}`}
                        onClick={() => setCartQuantity(meal.id, quantity - 1)}
                        size="icon-xs"
                        type="button"
                        variant="outline"
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <span aria-live="polite">{quantity}</span>
                      <Button
                        aria-label={`Agregar una porción de ${meal.name}`}
                        onClick={() => setCartQuantity(meal.id, quantity + 1)}
                        size="icon-xs"
                        type="button"
                        variant="outline"
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    aria-label={`Eliminar ${meal.name} del pedido`}
                    className="remove-cart-item"
                    onClick={() => removeFromCart(meal.id)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </article>
              ))}
            </div>
            <div className="cart-drawer-summary">
              <div className="cart-total-line">
                <span>Subtotal</span>
                <strong>{formatMoney(cartTotal)}</strong>
              </div>
              <p>El envío se coordina al confirmar tu pedido.</p>
              {message && (
                <p className="form-message form-message-error" role="alert">
                  {message}
                </p>
              )}
              <Button
                className="cart-checkout-button"
                onClick={handleCheckout}
                size="lg"
                type="button"
              >
                {user?.role === "CLIENTE" ? "Confirmar pedido" : "Continuar"}
              </Button>
              {!user && (
                <p className="cart-login-hint">
                  ¿Aún no tienes cuenta?{" "}
                  <Link to="/registro" onClick={onClose}>
                    Crea una aquí
                  </Link>
                </p>
              )}
              {user && user.role !== "CLIENTE" && (
                <p className="cart-login-hint">
                  Sesión: {user.name} · {user.role.toLowerCase()}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="cart-empty">
            <span className="cart-empty-icon">
              <ShoppingBag aria-hidden="true" />
            </span>
            <h3>Tu pedido está vacío</h3>
            <p>Elige algo rico del menú y lo verás aquí.</p>
            <Button onClick={onClose} size="lg" type="button" variant="outline">
              Volver al menú
            </Button>
          </div>
        )}
        <span className="sr-only">
          Para salir del carrito, usa el botón Cerrar carrito.
        </span>
      </aside>
    </div>
  );
}
