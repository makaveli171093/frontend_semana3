import { useCallback, useState } from "react"
import { ArrowRight, Check, ChefHat, Clock3, LogOut, PackageCheck, Timer, UtensilsCrossed } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Brand } from "@/components/site-shell"
import { PageHeading, StatusBadge, ToastNotice, formatMoney, formatTime } from "@/components/ui-primitives"
import { useAuth } from "@/context/auth-context"
import { useRestaurant } from "@/context/restaurant-context"
import type { Order, OrderStatus } from "@/types"

const kitchenStages: Array<{ status: OrderStatus; title: string; description: string; action?: string; next?: OrderStatus; icon: typeof ChefHat }> = [
  { status: "PENDIENTE", title: "Por preparar", description: "Pedidos recién recibidos", action: "Iniciar preparación", next: "EN_PREPARACION", icon: Clock3 },
  { status: "EN_PREPARACION", title: "En cocina", description: "En manos del equipo", action: "Marcar listo", next: "LISTO", icon: ChefHat },
  { status: "LISTO", title: "Listos para salir", description: "Esperando entrega", icon: PackageCheck },
]

function KitchenOrderCard({
  order,
  onAdvance,
  nextStatus,
  action,
}: {
  order: Order
  onAdvance: () => void
  nextStatus?: OrderStatus
  action?: string
}) {
  return (
    <article className="kitchen-order-card">
      <div className="kitchen-order-head"><strong>{order.id}</strong><StatusBadge status={order.status} /></div>
      <div className="kitchen-order-customer"><span className="table-customer-avatar">{order.customerName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{order.customerName}</strong><span><Clock3 aria-hidden="true" /> {formatTime(order.createdAt)}</span></div></div>
      <div className="kitchen-order-lines">
        {order.items.map((item) => <div key={`${order.id}-${item.mealId}`}><span><strong>{item.quantity}×</strong> {item.name}</span><span>{formatMoney(item.price * item.quantity)}</span></div>)}
      </div>
      <div className="kitchen-order-total"><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} productos</span><strong>{formatMoney(order.total)}</strong></div>
      {action && nextStatus && <Button className="kitchen-advance-button" onClick={onAdvance} size="lg" type="button">{action}<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button>}
      {!action && <div className="kitchen-ready-note"><Check aria-hidden="true" /> Pedido completo</div>}
    </article>
  )
}

export function KitchenPage() {
  const { user, logout } = useAuth()
  const { orders, updateOrderStatus } = useRestaurant()
  const navigate = useNavigate()
  const [notice, setNotice] = useState("")
  const clearNotice = useCallback(() => setNotice(""), [])
  const activeCount = orders.filter((order) => ["PENDIENTE", "EN_PREPARACION"].includes(order.status)).length

  return (
    <div className="kitchen-screen">
      <header className="kitchen-header">
        <Brand />
        <div className="kitchen-header-center"><span className="kitchen-live"><span /> PANEL DE COCINA</span><span>Pedidos del backend pendientes de conexión</span></div>
        <div className="kitchen-user"><span className="kitchen-user-icon"><ChefHat aria-hidden="true" /></span><span>{user?.name}</span><Button aria-label="Cerrar sesión" onClick={() => { logout(); navigate("/") }} size="icon" type="button" variant="ghost"><LogOut aria-hidden="true" /></Button></div>
      </header>
      <main className="kitchen-main mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeading
          description="Cada pedido, en el momento justo."
          eyebrow={`Pantalla de producción · ${activeCount} pedidos activos`}
          title="Cocina en marcha."
          actions={<span className="kitchen-current-time"><Timer aria-hidden="true" /> {new Intl.DateTimeFormat("es-BO", { hour: "2-digit", minute: "2-digit" }).format(new Date())}</span>}
        />
        <section aria-label="Pedidos por etapa de preparación" className="kitchen-board">
          {kitchenStages.map((stage) => {
            const stageOrders = orders.filter((order) => order.status === stage.status).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            const Icon = stage.icon
            return (
              <section className={`kitchen-column kitchen-column-${stage.status.toLowerCase()}`} key={stage.status}>
                <div className="kitchen-column-heading"><span className="kitchen-column-icon"><Icon aria-hidden="true" /></span><div><h2>{stage.title}<span>{stageOrders.length}</span></h2><p>{stage.description}</p></div></div>
                <div className="kitchen-column-body">
                  {stageOrders.length ? stageOrders.map((order) => (
                    <KitchenOrderCard
                      action={stage.action}
                      key={order.id}
                      nextStatus={stage.next}
                      onAdvance={() => {
                        if (!stage.next) return
                        updateOrderStatus(order.id, stage.next)
                        setNotice(`${order.id} pasó a ${stage.next === "EN_PREPARACION" ? "cocina" : "listo para salir"}.`)
                      }}
                      order={order}
                    />
                  )) : (
                    <div className="kitchen-column-empty"><span><UtensilsCrossed aria-hidden="true" /></span><p>Sin pedidos por ahora</p><small>Los nuevos pedidos aparecerán aquí.</small></div>
                  )}
                </div>
              </section>
            )
          })}
        </section>
        <div className="kitchen-footer-note"><span><span className="kitchen-live"><span /> EN VIVO</span> La sincronización con clientes y gerencia se habilitará al conectar la API.</span><span>Sincronización pendiente</span></div>
      </main>
      <ToastNotice message={notice} onClose={clearNotice} />
    </div>
  )
}
