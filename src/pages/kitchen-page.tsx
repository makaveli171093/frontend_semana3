import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, ChefHat, Clock3, LogOut, PackageCheck, RefreshCw, Timer, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/site-shell";
import { PageHeading, StatusBadge, ToastNotice, formatTime } from "@/components/ui-primitives";
import { useAuth } from "@/context/auth-context";
import { pedidosService, type PedidoPendienteBackend, type EstadoPedidoBackend } from "@/services/pedidos.service";
import type { Order, OrderStatus } from "@/types";

const kitchenStages: Array<{ status: OrderStatus; title: string; description: string; action?: string; next?: OrderStatus; backendNext?: EstadoPedidoBackend; icon: typeof ChefHat }> = [
  { status: "PENDIENTE", title: "Por preparar", description: "Pedidos recién recibidos", action: "Iniciar preparación", next: "EN_PREPARACION", backendNext: "En Cocina", icon: Clock3 },
  { status: "EN_PREPARACION", title: "En cocina", description: "En manos del equipo", action: "Marcar listo", next: "LISTO", backendNext: "Listo para Entrega", icon: ChefHat },
  { status: "LISTO", title: "Listos para salir", description: "Esperando entrega", icon: PackageCheck },
];

function mapBackendOrder(pedido: PedidoPendienteBackend): Order {
  const createdAt = pedido.fecha_pedido;
  return {
    id: String(pedido.pedido_id),
    customerId: "",
    customerName: pedido.cliente_nombre || "Cliente",
    createdAt,
    total: 0,
    status: "PENDIENTE",
    items: pedido.items.map((item) => ({
      mealId: String(item.item_id),
      name: [item.plato_principal, item.bebida, item.postre].filter(Boolean).join(" · ") || "Detalle de menú",
      image: "",
      price: 0,
      quantity: item.cantidad,
    })),
  };
}

function KitchenOrderCard({ order, onAdvance, nextStatus, action, busy }: { order: Order; onAdvance: () => void; nextStatus?: OrderStatus; action?: string; busy: boolean }) {
  return (
    <article className="kitchen-order-card">
      <div className="kitchen-order-head"><strong>Pedido #{order.id}</strong><StatusBadge status={order.status} /></div>
      <div className="kitchen-order-customer"><span className="table-customer-avatar">{order.customerName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{order.customerName}</strong><span><Clock3 aria-hidden="true" /> {formatTime(order.createdAt)}</span></div></div>
      <div className="kitchen-order-lines">
        {order.items.map((item) => <div key={`${order.id}-${item.mealId}`}><span><strong>{item.quantity}×</strong> {item.name}</span></div>)}
      </div>
      <div className="kitchen-order-total"><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} productos</span></div>
      {action && nextStatus && <Button className="kitchen-advance-button" disabled={busy} onClick={onAdvance} size="lg" type="button">{busy ? "Actualizando..." : action}<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button>}
      {!action && <div className="kitchen-ready-note"><Check aria-hidden="true" /> Listo para entrega</div>}
    </article>
  );
}

export function KitchenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyOrder, setBusyOrder] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const clearNotice = useCallback(() => setNotice(""), []);

  const loadOrders = useCallback(async (quiet = false) => {
    try {
      if (quiet) setRefreshing(true); else setLoading(true);
      setError("");
      const pending = await pedidosService.listarPendientes();
      setOrders((current) => {
        const mapped = pending.map(mapBackendOrder);
        // Preserve orders advanced during this screen session; the endpoint only returns pending orders.
        const serverIds = new Set(mapped.map((order) => order.id));
        const advanced = current.filter((order) => order.status !== "PENDIENTE" && !serverIds.has(order.id));
        return [...mapped, ...advanced];
      });
    } catch (err) {
      console.error("No se pudieron cargar los pedidos de cocina:", err);
      setError("No se pudieron cargar los pedidos desde el servidor. Comprueba la conexión y vuelve a intentar.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const activeCount = orders.filter((order) => ["PENDIENTE", "EN_PREPARACION"].includes(order.status)).length;

  async function advanceOrder(order: Order, nextStatus: OrderStatus, backendNext: EstadoPedidoBackend) {
    setBusyOrder(order.id);
    setError("");
    try {
      await pedidosService.actualizarEstado(Number(order.id), backendNext);
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: nextStatus } : item));
      setNotice(`Pedido #${order.id}: ${backendNext.toLowerCase()}.`);
    } catch (err) {
      console.error("No se pudo actualizar el estado del pedido:", err);
      setError("No se pudo actualizar el estado en el servidor. El pedido no se ha cambiado en pantalla.");
    } finally {
      setBusyOrder(null);
    }
  }

  return (
    <div className="kitchen-screen">
      <header className="kitchen-header">
        <Brand />
        <div className="kitchen-header-center"><span className="kitchen-live"><span /> PANEL DE COCINA</span><span>Pedidos sincronizados con el servidor</span></div>
        <div className="kitchen-user"><span className="kitchen-user-icon"><ChefHat aria-hidden="true" /></span><span>{user?.name}</span><Button aria-label="Cerrar sesión" onClick={() => { logout(); navigate("/"); }} size="icon" type="button" variant="ghost"><LogOut aria-hidden="true" /></Button></div>
      </header>
      <main className="kitchen-main mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeading
          description="Los cambios de estado se guardan en el servidor."
          eyebrow={`Pantalla de producción · ${activeCount} pedidos activos`}
          title="Cocina en marcha."
          actions={<div className="flex items-center gap-3"><span className="kitchen-current-time"><Timer aria-hidden="true" /> {new Intl.DateTimeFormat("es-BO", { hour: "2-digit", minute: "2-digit" }).format(new Date())}</span><Button disabled={refreshing} onClick={() => void loadOrders(true)} size="sm" type="button" variant="outline"><RefreshCw aria-hidden="true" /> Actualizar</Button></div>}
        />
        {error && <div className="form-message form-message-error mb-4" role="alert">{error}</div>}
        <section aria-label="Pedidos por etapa de preparación" className="kitchen-board">
          {kitchenStages.map((stage) => {
            const stageOrders = orders.filter((order) => order.status === stage.status).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
            const Icon = stage.icon;
            return (
              <section className={`kitchen-column kitchen-column-${stage.status.toLowerCase()}`} key={stage.status}>
                <div className="kitchen-column-heading"><span className="kitchen-column-icon"><Icon aria-hidden="true" /></span><div><h2>{stage.title}<span>{stageOrders.length}</span></h2><p>{stage.description}</p></div></div>
                <div className="kitchen-column-body">
                  {loading ? <div className="kitchen-column-empty"><p>Cargando pedidos...</p></div> : stageOrders.length ? stageOrders.map((order) => (
                    <KitchenOrderCard action={stage.action} key={order.id} nextStatus={stage.next} busy={busyOrder === order.id} onAdvance={() => { if (stage.next && stage.backendNext) void advanceOrder(order, stage.next, stage.backendNext); }} order={order} />
                  )) : (
                    <div className="kitchen-column-empty"><span><UtensilsCrossed aria-hidden="true" /></span><p>Sin pedidos por ahora</p><small>{stage.status === "PENDIENTE" ? "Los pedidos nuevos aparecerán aquí al actualizar." : "No hay pedidos en esta etapa en la sesión actual."}</small></div>
                  )}
                </div>
              </section>
            );
          })}
        </section>
        <div className="kitchen-footer-note"><span><span className="kitchen-live"><span /> API CONECTADA</span> Los estados se actualizan mediante el backend.</span><span>{refreshing ? "Actualizando..." : "Actualización manual disponible"}</span></div>
      </main>
      <ToastNotice message={notice} onClose={clearNotice} />
    </div>
  );
}
