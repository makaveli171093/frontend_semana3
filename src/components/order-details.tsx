import { Check, ChevronRight, Clock3, MapPin, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMoney, formatTime, Modal, StatusBadge } from "@/components/ui-primitives"
import type { DemoOrder, OrderStatus } from "@/types"

const orderSteps: OrderStatus[] = ["PENDIENTE", "EN_PREPARACION", "LISTO", "ENTREGADO"]
const stepLabels: Record<string, string> = {
  PENDIENTE: "Recibido",
  EN_PREPARACION: "En cocina",
  LISTO: "Listo para ti",
  ENTREGADO: "Entregado",
}

export function OrderDetails({
  order,
  open,
  onClose,
  onStatusChange,
}: {
  order: DemoOrder | null
  open: boolean
  onClose: () => void
  onStatusChange?: (orderId: string, status: OrderStatus) => void
}) {
  return (
    <Modal
      description="Detalle del pedido y su estado actual."
      onClose={onClose}
      open={open && Boolean(order)}
      title={order ? `Pedido ${order.id}` : "Detalle del pedido"}
      wide
    >
      {order && (
        <div className="order-detail-layout">
          <div className="order-detail-main">
            <div className="order-detail-summary">
              <div>
                <p className="eyebrow">{order.customerName}</p>
                <p className="order-detail-time"><Clock3 aria-hidden="true" /> Recibido hoy a las {formatTime(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="order-detail-lines">
              <h3>Tu pedido</h3>
              {order.items.map((item) => (
                <div className="order-detail-line" key={`${order.id}-${item.mealId}`}>
                  <img alt="" src={item.image} />
                  <div><strong>{item.quantity} × {item.name}</strong><span>{formatMoney(item.price)} c/u</span></div>
                  <strong>{formatMoney(item.price * item.quantity)}</strong>
                </div>
              ))}
              <div className="order-total-row"><span>Total del pedido</span><strong>{formatMoney(order.total)}</strong></div>
            </div>

            <div className="delivery-note"><MapPin aria-hidden="true" /><span>Entrega coordinada en La Paz, Bolivia</span></div>
          </div>

          <aside className="order-detail-aside">
            <div className="order-tracking-heading"><span className="tracking-icon"><PackageCheck aria-hidden="true" /></span><div><strong>Seguimiento</strong><span>Tu almuerzo, paso a paso</span></div></div>
            {order.status === "CANCELADO" ? (
              <div className="cancelled-note"><strong>Pedido cancelado</strong><span>Este pedido ya no se encuentra en preparación.</span></div>
            ) : (
              <ol className="order-timeline" aria-label="Estado del pedido">
                {orderSteps.map((step, index) => {
                  const currentIndex = orderSteps.indexOf(order.status)
                  const complete = currentIndex >= index
                  const current = currentIndex === index
                  return (
                    <li className={`${complete ? "timeline-complete" : ""}${current ? " timeline-current" : ""}`} key={step}>
                      <span className="timeline-marker">{complete ? <Check aria-hidden="true" /> : index + 1}</span>
                      <span><strong>{stepLabels[step]}</strong><small>{current ? "Estado actual" : complete ? "Completado" : "Próximo paso"}</small></span>
                      {index < orderSteps.length - 1 && <span className="timeline-line" aria-hidden="true" />}
                    </li>
                  )
                })}
              </ol>
            )}
            {onStatusChange && (
              <label className="form-field order-status-control">
                <span>Actualizar estado</span>
                <select onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)} value={order.status}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PREPARACION">En preparación</option>
                  <option value="LISTO">Listo</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </label>
            )}
            <Button className="order-detail-close" onClick={onClose} size="lg" type="button" variant="outline">
              Cerrar <ChevronRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          </aside>
        </div>
      )}
    </Modal>
  )
}
