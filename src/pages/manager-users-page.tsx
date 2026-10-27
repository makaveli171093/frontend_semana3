import { UsersRound } from "lucide-react";
import { PageHeading } from "@/components/ui-primitives";

export function ManagerUsersPage() {
  return (
    <div>
      <PageHeading
        description="La gestión de clientes se habilitará cuando el backend exponga el listado administrativo."
        eyebrow="Gestión de usuarios"
        title="Clientes"
      />
      <section className="panel customer-management-panel">
        <div className="table-empty" role="status">
          <UsersRound aria-hidden="true" />
          <strong>Listado de clientes no disponible todavía.</strong>
          <span>No se muestran cuentas de ejemplo. Esta pantalla se conectará al endpoint administrativo real.</span>
        </div>
      </section>
    </div>
  );
}
