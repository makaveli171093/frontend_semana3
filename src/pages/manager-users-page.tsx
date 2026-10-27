import { useMemo, useState } from "react"
import { ArrowUpRight, Mail, Search, UserRound, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeading } from "@/components/ui-primitives"
import { demoCustomers } from "@/data/demo-data"

export function ManagerUsersPage() {
  const [query, setQuery] = useState("")
  const customers = useMemo(() => demoCustomers.filter((customer) =>
    `${customer.name} ${customer.email}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")),
  ), [query])
  const totalOrders = demoCustomers.reduce((total, customer) => total + customer.orders, 0)

  return (
    <div>
      <PageHeading
        description="Una vista clara de las personas que disfrutan de la cocina Solandre."
        eyebrow="Comunidad Solandre"
        title="Clientes"
        actions={<span className="customer-count-pill"><UsersRound aria-hidden="true" /> {demoCustomers.length} cuentas</span>}
      />
      <section className="user-stats-row">
        <div className="user-stat-card"><span className="user-stat-icon"><UsersRound aria-hidden="true" /></span><div><strong>{demoCustomers.length}</strong><span>Clientes registrados</span></div><span className="user-stat-footnote">En esta demo</span></div>
        <div className="user-stat-card"><span className="user-stat-icon user-stat-icon-orange"><UserRound aria-hidden="true" /></span><div><strong>{demoCustomers.filter((customer) => customer.status === "Nuevo").length}</strong><span>Nuevos esta semana</span></div><span className="user-stat-footnote">Últimos 7 días</span></div>
        <div className="user-stat-card"><span className="user-stat-icon user-stat-icon-sage"><Mail aria-hidden="true" /></span><div><strong>{totalOrders}</strong><span>Pedidos realizados</span></div><span className="user-stat-footnote">Historial de prueba</span></div>
      </section>
      <section className="panel customer-management-panel">
        <div className="management-toolbar">
          <div><p className="eyebrow">Base de clientes</p><h2>Personas registradas</h2></div>
          <label className="search-field management-search"><Search aria-hidden="true" /><span className="sr-only">Buscar clientes</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente…" type="search" value={query} /></label>
        </div>
        <div className="table-scroll">
          <table className="data-table customer-management-table">
            <thead><tr><th>Cliente</th><th>Contacto</th><th>Pedidos</th><th>Se unió</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><div className="table-customer"><span className="table-customer-avatar">{customer.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><strong>{customer.name}</strong></div></td>
                  <td><a className="customer-contact" href={`mailto:${customer.email}`}><Mail aria-hidden="true" /> {customer.email}</a><span className="customer-phone">{customer.phone}</span></td>
                  <td><span className="customer-order-count">{customer.orders} pedidos</span></td>
                  <td>{customer.joined}</td>
                  <td><span className={`customer-state customer-state-${customer.status.toLowerCase()}`}><span />{customer.status}</span></td>
                  <td><Button aria-label={`Ver cuenta de ${customer.name}`} onClick={() => window.alert(`Cuenta de demostración: ${customer.name}\n${customer.email}\n${customer.orders} pedidos`)} size="icon-sm" type="button" variant="ghost"><ArrowUpRight aria-hidden="true" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!customers.length && <div className="table-empty"><UsersRound aria-hidden="true" /><strong>No hay clientes con ese nombre.</strong><span>Revisa la búsqueda e intenta de nuevo.</span></div>}
        </div>
        <div className="table-footer-note"><span>Mostrando {customers.length} de {demoCustomers.length} clientes</span><span>La información es ficticia y solo existe durante esta sesión.</span></div>
      </section>
    </div>
  )
}
