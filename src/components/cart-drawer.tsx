import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRestaurant } from "@/context/restaurant-context";
import { formatMoney } from "@/components/ui-primitives";
import { pedidosService, type MetodoPago } from "@/services/pedidos.service";
import { zonasService, type ZonaEntrega } from "@/services/zonas.service";

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
    clearCart,
    removeFromCart,
    setCartQuantity,
  } = useRestaurant();
  const [message, setMessage] = useState("");
  const [zones, setZones] = useState<ZonaEntrega[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<MetodoPago>("Efectivo");
  const [loadingZones, setLoadingZones] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingZones(true);
    zonasService.listar().then((result) => { if (!cancelled) setZones(result); }).catch((error) => {
      console.error("Error cargando zonas de entrega:", error);
      if (!cancelled) setMessage("No se pudieron cargar las zonas de entrega. Cierra y vuelve a abrir el carrito.");
    }).finally(() => { if (!cancelled) setLoadingZones(false); });
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  const handleCheckout = async () => {
    if (!cart.length || submitting) return;
    if (!user) {
      onClose();
      navigate("/login", { state: { fromCart: true } });
      return;
    }
    if (user.role !== "CLIENTE") {
      setMessage("Debes ingresar con una cuenta de cliente para realizar pedidos.");
      return;
    }
    const zona = Number(zoneId);
    if (!Number.isInteger(zona) || zona <= 0) {
      setMessage("Selecciona una zona de entrega.");
      return;
    }
    if (!address.trim()) {
      setMessage("Escribe una dirección o referencia de entrega.");
      return;
    }
    if (cart.some(({ meal }) => !meal.menuDiaId)) {
      setMessage("El carrito contiene un elemento que no corresponde al menú diario publicado. Vacía el carrito y vuelve a seleccionar el menú.");
      return;
    }
    try {
      setSubmitting(true);
      setMessage("Registrando tu pedido...");
      const pedido = await pedidosService.crear({
        zona_id: zona,
        google_maps_link: null,
        latitud: null,
        longitud: null,
        direccion_referencia: address.trim(),
        metodo_pago: payment,
        items: cart.map(({ meal, quantity }) => ({
          menu_dia_id: meal.menuDiaId as number,
          cantidad: quantity,
          exclusiones: [],
        })),
      });
      clearCart();
      onClose();
      navigate("/cliente/pedidos", {
        state: { orderPlaced: String(pedido.pedido_id), pickupToken: pedido.token_recoger, orderStatus: pedido.estado },
      });
    } catch (error) {
      console.error("Error al registrar el pedido:", error);
      setMessage("No se pudo registrar el pedido en el servidor. Tu carrito se conserva; revisa los datos e inténtalo nuevamente.");
    } finally {
      setSubmitting(false);
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
              <div className="grid gap-3 py-3">
                <label className="grid gap-1 text-sm font-medium">
                  Zona de entrega
                  <select className="w-full rounded-md border bg-background px-3 py-2" value={zoneId} onChange={(event) => setZoneId(event.target.value)} disabled={loadingZones || submitting} required>
                    <option value="">{loadingZones ? "Cargando zonas..." : "Selecciona una zona"}</option>
                    {zones.map((zone) => <option key={zone.zona_id} value={zone.zona_id}>{zone.nombre_zona}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Dirección o referencia
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Calle, edificio, oficina o referencia" maxLength={250} required disabled={submitting} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Método de pago
                  <select className="w-full rounded-md border bg-background px-3 py-2" value={payment} onChange={(event) => setPayment(event.target.value as MetodoPago)} disabled={submitting}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="QR">QR</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </label>
                <p className="text-xs text-muted-foreground">La ubicación de Google Maps es opcional; por ahora registramos la dirección de referencia.</p>
              </div>
              {message && (
                <p className="form-message form-message-error" role="alert">
                  {message}
                </p>
              )}
              <Button
                className="cart-checkout-button"
                disabled={submitting || loadingZones || !zones.length}
                onClick={handleCheckout}
                size="lg"
                type="button"
              >
                {submitting ? "Enviando pedido..." : user?.role === "CLIENTE" ? "Confirmar pedido" : "Continuar"}
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
