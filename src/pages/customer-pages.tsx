import { useMemo, useState, useCallback } from "react"
import { ArrowRight, BadgeCheck, CalendarDays, ChevronRight, CircleUserRound, Clock3, PackageCheck, ShoppingBag } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { MealCatalog } from "@/components/meal-catalog"
import { OrderDetails } from "@/components/order-details"
import { PageHeading, RoleBadge, StatusBadge, ToastNotice, formatFullDate, formatMoney, formatTime } from "@/components/ui-primitives"
import { useAuth } from "@/context/auth-context"
import { useRestaurant } from "@/context/restaurant-context"
import type { Order, OrderStatus } from "@/types"

const orderFilters: Array<{ value: "TODOS" | OrderStatus; label: string }> = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "EN_PREPARACION", label: "En cocina" },
  { value: "LISTO", label: "Listos" },
  { value: "ENTREGADO", label: "Entregados" },
]

export function CustomerHomePage() {
  const { user } = useAuth()
  const { meals, orders, addToCart } = useRestaurant()
  const [notice, setNotice] = useState("")
  const clearNotice = useCallback(() => setNotice(""), [])
  const availableMeals = meals.filter((meal) => meal.available)
  const nextOrder = orders.find(
    (order) => order.customerId === user?.id && ["PENDIENTE", "EN_PREPARACION", "LISTO"].includes(order.status),
  )

  const handleAdd = (meal: (typeof meals)[number]) => {
    addToCart(meal)
    setNotice(`${meal.name} se agregó a tu pedido.`)
  }

  return (
    <div className="customer-home-page">
      <section className="customer-welcome-card">
        <div className="customer-welcome-copy">
          <span className="welcome-kicker"><span /> Tu pausa favorita</span>
          <h2>Hola, {user?.name.split(" ")[0]}.<br /><em>¿Qué se te antoja?</em></h2>
          <p>Hay algo recién hecho esperándote. Elige tu almuerzo de hoy.</p>
          <a className={buttonVariants({ size: "lg", variant: "secondary", className: "welcome-menu-link" })} href="#catalogo">
            Explorar menú <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </a>
        </div>
        <div className="customer-welcome-image" role="img" aria-label="Un almuerzo fresco servido en un plato" />
        <div className="welcome-note"><span><Clock3 aria-hidden="true" /></span><div><strong>Menú del día</strong><small>Disponibilidad según publicación</small></div></div>
      </section>

      <div className="customer-quick-stats">
        <div><span className="quick-stat-icon"><ShoppingBag aria-hidden="true" /></span><div><strong>{orders.filter((order) => order.customerId === user?.id).length}</strong><span>Pedidos en tu cuenta</span></div></div>
        <div><span className="quick-stat-icon quick-stat-icon-sage"><BadgeCheck aria-hidden="true" /></span><div><strong>{nextOrder ? "En camino" : "Todo listo"}</strong><span>{nextOrder ? `${nextOrder.id} · ${nextOrder.status === "LISTO" ? "listo para ti" : "en proceso"}` : "Sin pedidos pendientes"}</span></div></div>
        <Link to="/cliente/pedidos">Ver mis pedidos <ArrowRight aria-hidden="true" /></Link>
      </div>

      <section className="customer-catalog" id="catalogo">
        <PageHeading
          description="Platos hechos con ingredientes frescos y el sabor de casa."
          eyebrow="Recién salido de cocina"
          title="El menú de hoy"
        />
        <MealCatalog meals={availableMeals} onAdd={handleAdd} />
      </section>
      <ToastNotice message={notice} onClose={clearNotice} />
    </div>
  )
}

export function CustomerOrdersPage() {
  const { user } = useAuth()
  const { orders } = useRestaurant()
  const location = useLocation()
  const [filter, setFilter] = useState<"TODOS" | OrderStatus>("TODOS")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const customerOrders = useMemo(
    () => orders
      .filter((order) => order.customerId === user?.id)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [orders, user?.id],
  )
  const filteredOrders = customerOrders.filter((order) => filter === "TODOS" || order.status === filter)
  const placedOrderId = (location.state as { orderPlaced?: string } | null)?.orderPlaced

  return (
    <div>
      <PageHeading
        description="Revisa el estado de tus pedidos y vuelve a encontrar tus favoritos."
        eyebrow="Tu historial"
        title="Mis pedidos"
      />
      {placedOrderId && (
        <div className="order-success-banner" role="status"><span><BadgeCheck aria-hidden="true" /></span><div><strong>¡Pedido enviado a cocina!</strong><p>{placedOrderId} ya está en preparación. Puedes seguirlo desde aquí.</p></div></div>
      )}
      <div aria-label="Filtrar pedidos por estado" className="order-filter-tabs" role="group">
        {orderFilters.map((item) => (
          <Button
            aria-pressed={filter === item.value}
            className="order-filter-tab"
            key={item.value}
            onClick={() => setFilter(item.value)}
            size="sm"
            type="button"
            variant={filter === item.value ? "default" : "outline"}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {filteredOrders.length ? (
        <div className="customer-order-list">
          {filteredOrders.map((order) => (
            <article className="customer-order-card" key={order.id}>
              <div className="customer-order-topline">
                <div><span className="order-number-label">Pedido</span><h2>{order.id}</h2></div>
                <StatusBadge status={order.status} />
              </div>
              <div className="customer-order-meta"><span><CalendarDays aria-hidden="true" /> {formatFullDate(order.createdAt)}</span><span><Clock3 aria-hidden="true" /> {formatTime(order.createdAt)}</span><span><ShoppingBag aria-hidden="true" /> {order.items.reduce((sum, item) => sum + item.quantity, 0)} productos</span></div>
              <div className="customer-order-items">
                {order.items.slice(0, 2).map((item) => <span key={item.mealId}>{item.quantity} × {item.name}</span>)}
                {order.items.length > 2 && <span>+ {order.items.length - 2} más</span>}
              </div>
              <div className="customer-order-bottom"><strong>{formatMoney(order.total)}</strong><Button onClick={() => setSelectedOrder(order)} size="sm" type="button" variant="outline">Ver seguimiento <ChevronRight aria-hidden="true" data-icon="inline-end" /></Button></div>
            </article>
          ))}
        </div>
      ) : (
        <div className="workspace-empty">
          <span className="workspace-empty-icon"><PackageCheck aria-hidden="true" /></span>
          <h2>{customerOrders.length ? "No hay pedidos en este estado" : "Tu primer pedido te espera"}</h2>
          <p>{customerOrders.length ? "Prueba con otro filtro para ver tu historial." : "Cuando confirmes un almuerzo, podrás seguirlo desde este espacio."}</p>
          {!customerOrders.length && <Link className={buttonVariants({ size: "lg", variant: "default" })} to="/cliente">Descubrir menú <ArrowRight aria-hidden="true" data-icon="inline-end" /></Link>}
        </div>
      )}
      <OrderDetails onClose={() => setSelectedOrder(null)} open={Boolean(selectedOrder)} order={selectedOrder} />
    </div>
  )
}

export function CustomerProfilePage() {
  const { user } = useAuth()
  const { orders } = useRestaurant()
  const orderCount = orders.filter((order) => order.customerId === user?.id).length

  return (
    <div>
      <PageHeading
        description="Tu cuenta de Solandre y algunos datos para tener a mano."
        eyebrow="Tu espacio personal"
        title="Mi perfil"
      />
      <section className="profile-overview-card">
        <div className="profile-cover" />
        <div className="profile-overview-body">
          <span className="profile-avatar">{user?.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          <div className="profile-name-block"><h2>{user?.name}</h2><p>{user?.email}</p></div>
          <RoleBadge role="CLIENTE" />
        </div>
      </section>
      <div className="profile-details-grid">
        <section className="profile-info-card">
          <div className="card-heading"><div><p className="eyebrow">Cuenta demo</p><h2>Tu información</h2></div><CircleUserRound aria-hidden="true" /></div>
          <dl className="profile-data-list">
            <div><dt>Nombre</dt><dd>{user?.name}</dd></div>
            <div><dt>Correo electrónico</dt><dd>{user?.email}</dd></div>
            <div><dt>Tipo de cuenta</dt><dd>Cliente Solandre</dd></div>
            <div><dt>Pedidos en esta sesión</dt><dd>{orderCount}</dd></div>
          </dl>
          <p className="profile-demo-note">Esta pantalla usa datos de demostración. La información no se guarda en un servidor.</p>
        </section>
        <section className="profile-perks-card">
          <span className="profile-perk-icon"><BadgeCheck aria-hidden="true" /></span>
          <p className="eyebrow">Tu mesa, tu ritmo</p>
          <h2>Un buen almuerzo también es un buen hábito.</h2>
          <p>Prueba un plato nuevo, guarda tus favoritos y deja que la cocina se encargue del resto.</p>
          <Link to="/cliente" className="profile-perk-link">Ver menú de hoy <ArrowRight aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  )
}
