import { Navigate, Outlet, Route, Routes, Link } from "react-router-dom"
import { ArrowLeft, Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { dashboardForRole } from "@/auth/roles"
import type { UserRole } from "@/types"
import { AuthPage } from "@/pages/auth-page"
import { CustomerHomePage, CustomerOrdersPage, CustomerProfilePage } from "@/pages/customer-pages"
import { HomePage } from "@/pages/home-page"
import { KitchenPage } from "@/pages/kitchen-page"
import { ManagerDashboardPage } from "@/pages/manager-dashboard-page"
import { ManagerMealsPage } from "@/pages/manager-meals-page"
import { ManagerDailyMenuPage } from "@/pages/manager-daily-menu-page"
import { ManagerOrdersPage } from "@/pages/manager-orders-page"
import { ManagerUsersPage } from "@/pages/manager-users-page"
import { WorkspaceShell } from "@/components/site-shell"

function RequireRole({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate replace to="/login" />
  if (!allowedRoles.includes(user.role)) {
    return <Navigate replace to={dashboardForRole(user.role)} />
  }
  return <Outlet />
}

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <span className="not-found-icon"><Home aria-hidden="true" /></span>
      <p className="eyebrow">404 · Plato fuera de carta</p>
      <h1>Esta página no está<br /><em>en el menú.</em></h1>
      <p>Puede que la dirección haya cambiado o que el enlace ya no esté disponible.</p>
      <Link className={buttonVariants({ size: "lg", variant: "default" })} to="/"><ArrowLeft aria-hidden="true" data-icon="inline-start" /> Volver al inicio</Link>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<AuthPage mode="login" />} path="/login" />
      <Route element={<AuthPage mode="register" />} path="/registro" />

      <Route element={<RequireRole allowedRoles={["CLIENTE"]} />}>
        <Route element={<WorkspaceShell role="CLIENTE" />} path="/cliente">
          <Route element={<CustomerHomePage />} index />
          <Route element={<CustomerOrdersPage />} path="pedidos" />
          <Route element={<CustomerProfilePage />} path="perfil" />
        </Route>
      </Route>

      <Route element={<RequireRole allowedRoles={["GERENTE"]} />}>
        <Route element={<WorkspaceShell role="GERENTE" />} path="/gerente">
          <Route element={<ManagerDashboardPage />} index />
          <Route element={<ManagerMealsPage />} path="comidas" />
          <Route element={<ManagerDailyMenuPage />} path="menu-diario" />
          <Route element={<ManagerOrdersPage />} path="pedidos" />
          <Route element={<ManagerUsersPage />} path="usuarios" />
        </Route>
      </Route>

      <Route element={<RequireRole allowedRoles={["COCINERO"]} />}>
        <Route element={<KitchenPage />} path="/cocina" />
      </Route>

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}
