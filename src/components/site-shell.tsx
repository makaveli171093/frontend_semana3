import { useState } from "react"
import {
  ArrowUpRight,
  ChefHat,
  CircleUserRound,
  Home,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  PackageCheck,
  ShoppingBag,
  UsersRound,
  UtensilsCrossed,
  X,
  ClipboardList,
} from "lucide-react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/context/auth-context"
import { useRestaurant } from "@/context/restaurant-context"
import { dashboardForRole } from "@/services/demo-auth"

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link aria-label="Solandre, volver al inicio" className={`brand${light ? " brand-light" : ""}`} to="/">
      <span className="brand-mark"><Leaf aria-hidden="true" /></span>
      <span className="brand-copy">
        <strong>SOLANDRE</strong>
        <span>COCINA CON ORIGEN</span>
      </span>
    </Link>
  )
}

export function PublicHeader({
  cartCount,
  onCartOpen,
}: {
  cartCount: number
  onCartOpen: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dashboard = user ? dashboardForRole(user.role) : "/login"

  const closeMenu = () => setMobileOpen(false)

  return (
    <header className="public-header">
      <div className="public-header-inner mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label="Navegación principal" className={`public-nav${mobileOpen ? " public-nav-open" : ""}`}>
          <Link onClick={closeMenu} to="/#menu">Menú</Link>
          <Link onClick={closeMenu} to="/#nosotros">Nuestra cocina</Link>
          <Link onClick={closeMenu} to="/#contacto">Contacto</Link>
          {user && (
            <Link className="mobile-only-link" onClick={closeMenu} to={dashboard}>Mi espacio</Link>
          )}
        </nav>
        <div className="public-header-actions">
          <Button
            aria-label={`Abrir carrito, ${cartCount} productos`}
            className="cart-trigger"
            onClick={onCartOpen}
            size="icon-lg"
            type="button"
            variant="outline"
          >
            <ShoppingBag aria-hidden="true" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Button>
          {user ? (
            <>
          <Link className={buttonVariants({ className: "header-dashboard", size: "lg", variant: "default" })} to={dashboard}>Mi espacio <ArrowUpRight aria-hidden="true" data-icon="inline-end" /></Link>

              <Button
                aria-label="Cerrar sesión"
                className="header-logout"
                onClick={() => { logout(); navigate("/") }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <LogOut aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
            <Link className={buttonVariants({ className: "header-login", size: "lg", variant: "ghost" })} to="/login">Ingresar</Link>
            <Link className={buttonVariants({ className: "header-register", size: "lg", variant: "default" })} to="/registro">Crear cuenta</Link>

            </>
          )}
          <Button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="mobile-menu-button"
            onClick={() => setMobileOpen((value) => !value)}
            size="icon"
            type="button"
            variant="ghost"
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="public-footer" id="contacto">
      <div className="footer-main mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_.7fr_.8fr] lg:px-8">
        <div className="footer-brand-block">
          <Brand light />
          <p>Almuerzos hechos con cariño, ingredientes de temporada y sabores que se sienten como casa.</p>
          <a className="footer-social" href="https://wa.me/59170000000" rel="noreferrer" target="_blank">
            Escríbenos por WhatsApp <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div>
          <h3>Explora</h3>
          <a href="/#menu">Menú de hoy</a>
          <a href="/#nosotros">Nuestra cocina</a>
          <Link to="/login">Mi cuenta</Link>
        </div>
        <div>
          <h3>Visítanos</h3>
          <p>La Paz, Bolivia</p>
          <p>Lun a vie · 11:30 a 15:00</p>
          <a href="tel:+59171248093">+591 712 48 093</a>
        </div>
      </div>
      <div className="footer-bottom mx-auto flex w-full max-w-7xl flex-col justify-between gap-2 px-4 sm:px-6 md:flex-row lg:px-8">
        <span>© 2026 Solandre. Hecho con ingredientes locales.</span>
        <span>Una experiencia de demostración · La Paz, Bolivia</span>
      </div>
    </footer>
  )
}

const clientLinks = [
  { to: "/cliente", label: "Descubrir menú", icon: Home, end: true },
  { to: "/cliente/pedidos", label: "Mis pedidos", icon: ClipboardList },
  { to: "/cliente/perfil", label: "Mi perfil", icon: CircleUserRound },
]

const managerLinks = [
  { to: "/gerente", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/gerente/comidas", label: "Comidas", icon: UtensilsCrossed },
  { to: "/gerente/pedidos", label: "Pedidos", icon: PackageCheck },
  { to: "/gerente/usuarios", label: "Usuarios", icon: UsersRound },
]

const workspaceTitles: Record<string, string> = {
  "/cliente": "Descubrir menú",
  "/cliente/pedidos": "Mis pedidos",
  "/cliente/perfil": "Mi perfil",
  "/gerente": "Resumen del día",
  "/gerente/comidas": "Menú y comidas",
  "/gerente/pedidos": "Pedidos",
  "/gerente/usuarios": "Clientes",
}

export function WorkspaceShell({ role }: { role: "CLIENTE" | "GERENTE" }) {
  const { user, logout } = useAuth()
  const { cartCount } = useRestaurant()
  const location = useLocation()
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)
  const links = role === "CLIENTE" ? clientLinks : managerLinks
  const roleLabel = role === "CLIENTE" ? "Espacio cliente" : "Administración"
  const currentTitle = workspaceTitles[location.pathname] ?? roleLabel

  return (
    <div className={`workspace workspace-${role.toLowerCase()}`}>
      <aside className="workspace-sidebar">
        <div className="sidebar-brand-row">
          <Brand />
          <span className="workspace-role-label">{roleLabel}</span>
        </div>
        <nav aria-label={`Navegación de ${roleLabel}`} className="workspace-nav">
          {links.map(({ to, label, icon: Icon, ...linkProps }) => (
            <NavLink className={({ isActive }) => `workspace-nav-link${isActive ? " active" : ""}`} key={to} to={to} {...linkProps}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {to === "/cliente/pedidos" && <span className="nav-link-indicator" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="sidebar-note-icon"><ChefHat aria-hidden="true" /></span>
          <strong>Hecho cada día</strong>
          <span>Fresco, local y con mucho cariño.</span>
        </div>
        <div className="sidebar-user">
          <span className="user-avatar">{user?.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          <div className="sidebar-user-copy">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <Button
            aria-label="Cerrar sesión"
            className="sidebar-logout"
            onClick={() => { logout(); navigate("/") }}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <LogOut aria-hidden="true" />
          </Button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-topbar-title">
            <span>Solandre <span aria-hidden="true">/</span> {roleLabel}</span>
            <h1>{currentTitle}</h1>
          </div>
          <div className="workspace-topbar-actions">
            <span className="today-label">{new Intl.DateTimeFormat("es-BO", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span>
            {role === "CLIENTE" && (
              <Button
                aria-label={`Abrir carrito, ${cartCount} productos`}
                className="workspace-cart-button"
                onClick={() => setCartOpen(true)}
                size="lg"
                type="button"
                variant="outline"
              >
                <ShoppingBag aria-hidden="true" />
                Pedido <span className="cart-count-inline">{cartCount}</span>
              </Button>
            )}
          </div>
        </header>
        <div className="workspace-content"><Outlet /></div>
      </main>
      {role === "CLIENTE" && <CartDrawer onClose={() => setCartOpen(false)} open={cartOpen} />}
    </div>
  )
}
