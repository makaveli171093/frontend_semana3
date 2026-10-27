import { useMemo, useState } from "react"
import { ArrowUpRight, Clock3, PackageCheck, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderDetails } from "@/components/order-details"
import { PageHeading, StatusBadge, formatMoney, formatTime } from "@/components/ui-primitives"
import { useRestaurant } from "@/context/restaurant-context"
import type { Order, OrderStatus } from "@/types"

const orderStatusFilters: Array<{ value: "TODOS" | OrderStatus; label: string }> = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "EN_PREPARACION", label: "En preparación" },
  { value: "LISTO", label: "Listos" },
  { value: "ENTREGADO", label: "Entregados" },
]

export function ManagerOrdersPage() {
  const { orders, updateOrderStatus } = useRestaurant()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"TODOS" | OrderStatus>("TODOS")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const visibleOrders = useMemo(() => [...orders]
    .filter((order) => filter === "TODOS" || order.status === filter)
    .filter((order) => `${order.id} ${order.customerName}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [filter, orders, query])

  return (
    <div>
      <PageHeading
        description="Sigue cada pedido desde que llega hasta que se entrega."
        eyebrow="Servicio de hoy"
        title="Pedidos"
        actions={<span className="live-indicator"><span /> Actualizado en esta sesión</span>}
      />
      <section className="panel order-management-panel">
        <div className="management-toolbar order-toolbar">
          <label className="search-field management-search"><Search aria-hidden="true" /><span className="sr-only">Buscar por pedido o cliente</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pedido o cliente…" type="search" value={query} /></label>
          <div className="toolbar-filter-label"><SlidersHorizontal aria-hidden="true" /> Estado</div>
        </div>
        <div aria-label="Filtrar pedidos por estado" className="management-filter-row" role="group">
          {orderStatusFilters.map((item) => (
            <Button aria-pressed={filter === item.value} key={item.value} onClick={() => setFilter(item.value)} size="sm" type="button" variant={filter === item.value ? "default" : "outline"}>{item.label}</Button>
          ))}
        </div>
        <div className="table-scroll">
          <table className="data-table order-management-table">
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Detalle</th><th>Hora</th><th>Total</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong className="table-order-id">{order.id}</strong></td>
                  <td><div className="table-customer"><span className="table-customer-avatar">{order.customerName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><strong>{order.customerName}</strong></div></td>
                  <td><span className="table-item-summary">{order.items.reduce((count, item) => count + item.quantity, 0)} productos</span></td>
                  <td><span className="table-time"><Clock3 aria-hidden="true" /> {formatTime(order.createdAt)}</span></td>
                  <td><strong>{formatMoney(order.total)}</strong></td>
                  <td><StatusBadge status={order.status} /></td>
                  <td><Button aria-label={`Ver detalles del pedido ${order.id}`} onClick={() => setSelectedOrder(order)} size="icon-sm" type="button" variant="ghost"><ArrowUpRight aria-hidden="true" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleOrders.length && <div className="table-empty"><PackageCheck aria-hidden="true" /><strong>No hay pedidos que coincidan.</strong><span>Prueba con otro filtro o término de búsqueda.</span></div>}
        </div>
        <div className="table-footer-note"><span>{visibleOrders.length} pedidos</span><span>Los cambios de estado se reflejan también en cocina.</span></div>
      </section>
      <OrderDetails
        onClose={() => setSelectedOrder(null)}
        onStatusChange={(orderId, status) => {
          updateOrderStatus(orderId, status)
          setSelectedOrder((current) => current?.id === orderId ? { ...current, status } : current)
        }}
        open={Boolean(selectedOrder)}
        order={selectedOrder}
      />
    </div>
  )
}
