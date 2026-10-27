import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, CircleDollarSign, Clock3, PackageCheck, UtensilsCrossed } from "lucide-react"
import { Link } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button"
import { PageHeading, StatusBadge, formatMoney, formatTime } from "@/components/ui-primitives"
import { useRestaurant } from "@/context/restaurant-context"

export function ManagerDashboardPage() {
  const { meals, orders } = useRestaurant()
  const openOrders = orders.filter((order) => ["PENDIENTE", "EN_PREPARACION", "LISTO"].includes(order.status))
  const pendingOrders = orders.filter((order) => order.status === "PENDIENTE")
  const completedOrders = orders.filter((order) => order.status === "ENTREGADO")
  const totalSales = orders
    .filter((order) => order.status !== "CANCELADO")
    .reduce((total, order) => total + order.total, 0)
  const activeMeals = meals.filter((meal) => meal.available).length
  const latestOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)

  const metrics = [
    { label: "Ventas registradas", value: formatMoney(totalSales), note: "En esta sesión de demo", icon: CircleDollarSign, tone: "green" },
    { label: "Pedidos activos", value: String(openOrders.length).padStart(2, "0"), note: `${pendingOrders.length} esperando cocina`, icon: PackageCheck, tone: "orange" },
    { label: "Entregados hoy", value: String(completedOrders.length).padStart(2, "0"), note: "Servicio de mediodía", icon: Activity, tone: "sage" },
    { label: "Platos disponibles", value: String(activeMeals).padStart(2, "0"), note: `${meals.length} en el menú`, icon: UtensilsCrossed, tone: "blue" },
  ]

  return (
    <div className="manager-dashboard-page">
      <PageHeading
        description="Así va el servicio de hoy en Solandre."
        eyebrow="Martes · servicio de almuerzo"
        title="Un buen día en cocina."
        actions={<Link className={buttonVariants({ size: "lg", variant: "default" })} to="/gerente/pedidos">Ver pedidos <ArrowRight aria-hidden="true" data-icon="inline-end" /></Link>}
      />

      <section aria-label="Indicadores del día" className="metrics-grid">
        {metrics.map(({ label, value, note, icon: Icon, tone }, index) => (
          <article className={`metric-card metric-${tone}`} key={label}>
            <div className="metric-card-top"><span className="metric-icon"><Icon aria-hidden="true" /></span><span className="metric-index">0{index + 1}</span></div>
            <p>{label}</p><strong>{value}</strong><span className="metric-note">{note}</span>
          </article>
        ))}
      </section>

      <div className="manager-dashboard-grid">
        <section className="panel recent-orders-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Últimos movimientos</p><h2>Pedidos recientes</h2></div>
            <Link className="panel-link" to="/gerente/pedidos">Ver todos <ArrowRight aria-hidden="true" /></Link>
          </div>
          {latestOrders.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Hora</th><th>Total</th><th>Estado</th><th><span className="sr-only">Detalle</span></th></tr></thead>
                <tbody>
                  {latestOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong className="table-order-id">{order.id}</strong></td>
                      <td>{order.customerName}</td>
                      <td><span className="table-time"><Clock3 aria-hidden="true" /> {formatTime(order.createdAt)}</span></td>
                      <td><strong>{formatMoney(order.total)}</strong></td>
                      <td><StatusBadge status={order.status} /></td>
                      <td><Link aria-label={`Ver pedido ${order.id}`} className="table-arrow-link" to="/gerente/pedidos"><ArrowUpRight aria-hidden="true" /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="panel-empty"><PackageCheck aria-hidden="true" /><span>Aún no hay pedidos registrados.</span></div>
          )}
        </section>

        <aside className="manager-side-column">
          <section className="service-status-card">
            <div className="service-status-top"><span className="service-live-dot" /> Servicio activo <span>12:00</span></div>
            <h2>El almuerzo<br /><em>está en marcha.</em></h2>
            <p>El equipo está atendiendo el servicio de mediodía.</p>
            <div className="service-progress-track"><span style={{ width: `${Math.min(100, Math.max(16, (completedOrders.length / Math.max(1, orders.length)) * 100))}%` }} /></div>
            <div className="service-progress-label"><span>Pedidos entregados</span><strong>{completedOrders.length} de {orders.length}</strong></div>
          </section>
          <section className="quick-actions-panel">
            <div className="panel-heading"><div><p className="eyebrow">Atajos</p><h2>Acciones rápidas</h2></div><ArrowDownRight aria-hidden="true" /></div>
            <Link to="/gerente/comidas"><span className="quick-action-icon"><UtensilsCrossed aria-hidden="true" /></span><span><strong>Actualizar menú</strong><small>Edita platos y disponibilidad</small></span><ArrowRight aria-hidden="true" /></Link>
            <Link to="/gerente/pedidos"><span className="quick-action-icon quick-action-icon-orange"><PackageCheck aria-hidden="true" /></span><span><strong>Revisar pedidos</strong><small>{openOrders.length} en seguimiento</small></span><ArrowRight aria-hidden="true" /></Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
