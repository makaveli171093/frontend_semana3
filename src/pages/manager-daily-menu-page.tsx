import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { Check, CirclePlus, RefreshCw, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, PageHeading, ToastNotice } from "@/components/ui-primitives";
import { menuService, type ActualizarMenuPayload, type CrearMenuPayload, type MenuAdmin } from "@/services/menu.service";
import { platosService, type Plato } from "@/services/platos.service";

type MenuForm = {
  fecha: string;
  plato_principal_id: string;
  bebida_id: string;
  postre_id: string;
  info_nutricional: string;
  imagen_url: string;
  cantidad_disponible: string;
  precio_menu: string;
  publicado: boolean;
};

const today = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { detail?: unknown; message?: unknown; error?: unknown; errors?: unknown }
      | string
      | undefined;
    if (typeof data === "string" && data.trim()) return `${fallback} (${status ?? "sin respuesta"}): ${data}`;
    if (data && typeof data === "object") {
      const detail = data.detail ?? data.message ?? data.error ?? data.errors;
      if (typeof detail === "string" && detail.trim()) return `${fallback} (${status ?? "API"}): ${detail}`;
      if (detail !== undefined) return `${fallback} (${status ?? "API"}): ${JSON.stringify(detail)}`;
    }
    if (status) return `${fallback} (HTTP ${status}). Revisa los datos enviados y los permisos de gerente.`;
    if (error.code === "ERR_NETWORK") return "No se pudo conectar con el backend. Verifica la API y vuelve a intentar.";
  }
  return fallback;
}

const emptyForm = (): MenuForm => ({
  fecha: today(),
  plato_principal_id: "",
  bebida_id: "",
  postre_id: "",
  info_nutricional: "",
  imagen_url: "",
  cantidad_disponible: "50",
  precio_menu: "",
  publicado: true,
});

export function ManagerDailyMenuPage() {
  const [menus, setMenus] = useState<MenuAdmin[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [editing, setEditing] = useState<MenuAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [menuRows, catalog] = await Promise.all([
        menuService.listarAdmin(),
        platosService.listarAdmin(),
      ]);
      setMenus(menuRows.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)));
      setPlatos(catalog);
    } catch (error) {
      console.error("Error cargando menús diarios:", error);
      setLoadError("No se pudieron cargar los menús. Verifica tu sesión de gerente y vuelve a intentar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const principales = useMemo(() => platos.filter((p) => p.tipo === "Principal"), [platos]);
  const bebidas = useMemo(() => platos.filter((p) => p.tipo === "Bebida"), [platos]);
  const postres = useMemo(() => platos.filter((p) => p.tipo === "Postre"), [platos]);
  const platoPorId = useMemo(() => new Map(platos.map((p) => [p.plato_id, p])), [platos]);

  const updateForm = <K extends keyof MenuForm>(key: K, value: MenuForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const duplicate = menus.find((menu) => menu.fecha === form.fecha);
    if (duplicate) {
      setNotice(`Ya existe un menú para el ${form.fecha}. Puedes editarlo desde “Menús registrados” o elegir otra fecha.`);
      return;
    }
    const principal = Number(form.plato_principal_id);
    const bebida = Number(form.bebida_id);
    const postre = Number(form.postre_id);
    const stock = Number(form.cantidad_disponible);
    const precio = Number(form.precio_menu);

    if (![principal, bebida, postre].every((id) => Number.isInteger(id) && id > 0)) {
      setNotice("Selecciona un plato principal, una bebida y un postre del catálogo.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0 || !Number.isFinite(precio) || precio <= 0) {
      setNotice("El stock debe ser un entero igual o mayor que cero y el precio debe ser mayor que cero.");
      return;
    }

    const payload: CrearMenuPayload = {
      fecha: form.fecha,
      plato_principal_id: principal,
      bebida_id: bebida,
      postre_id: postre,
      info_nutricional: form.info_nutricional.trim(),
      imagen_url: form.imagen_url.trim(),
      cantidad_disponible: stock,
      precio_menu: precio,
      publicado: form.publicado,
    };

    try {
      setSaving(true);
      await menuService.crear(payload);
      setForm(emptyForm());
      setNotice("Menú diario creado correctamente.");
      await loadData();
    } catch (error) {
      console.error("Error creando menú diario:", error);
      setNotice(getApiErrorMessage(error, "No se pudo crear el menú."));
    } finally {
      setSaving(false);
    }
  };

  const submitUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || saving) return;
    const stock = Number(form.cantidad_disponible);
    const precio = Number(form.precio_menu);
    if (!Number.isInteger(stock) || stock < 0 || !Number.isFinite(precio) || precio <= 0) {
      setNotice("El stock debe ser un entero igual o mayor que cero y el precio debe ser mayor que cero.");
      return;
    }
    const payload: ActualizarMenuPayload = {
      cantidad_disponible: stock,
      precio_menu: precio,
      imagen_url: form.imagen_url.trim(),
      publicado: form.publicado,
    };
    try {
      setSaving(true);
      await menuService.actualizar(editing.menu_dia_id, payload);
      setEditing(null);
      setNotice("Menú actualizado correctamente.");
      await loadData();
    } catch (error) {
      console.error("Error actualizando menú diario:", error);
      setNotice(getApiErrorMessage(error, "No se pudo actualizar el menú."));
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (menu: MenuAdmin) => {
    setEditing(menu);
    setForm({
      ...emptyForm(),
      fecha: menu.fecha,
      cantidad_disponible: String(menu.cantidad_disponible),
      precio_menu: String(menu.precio_menu),
      imagen_url: menu.imagen_url ?? "",
      publicado: menu.publicado,
    });
  };

  const closeEditor = () => { setEditing(null); setForm(emptyForm()); };

  return (
    <div>
      <PageHeading
        eyebrow="Administración de Solandre"
        title="Menú diario"
        description="Combina platos existentes del catálogo, define precio y stock y controla qué oferta ven los clientes."
        actions={<Button onClick={() => void loadData()} size="lg" type="button" variant="outline"><RefreshCw aria-hidden="true" data-icon="inline-start" /> Actualizar</Button>}
      />

      <section className="panel meal-management-panel">
        <div className="management-toolbar">
          <div>
            <h2>Crear oferta para un día</h2>
            <p>Los platos se cargan desde el backend. Crear un menú no crea platos nuevos.</p>
          </div>
        </div>
        {loadError && <div role="alert" className="form-error">{loadError}</div>}
        <form className="meal-editor-form" onSubmit={submitCreate}>
          <div className="meal-editor-fields">
            <label className="form-field">
              <span>Fecha del menú</span>
              <input type="date" required value={form.fecha} onChange={(e) => updateForm("fecha", e.target.value)} />
            </label>
            <label className="form-field">
              <span>Precio (Bs)</span>
              <input type="number" min="0.01" step="0.01" required value={form.precio_menu} onChange={(e) => updateForm("precio_menu", e.target.value)} placeholder="Ej. 25" />
            </label>
            <label className="form-field">
              <span>Plato principal</span>
              <select required value={form.plato_principal_id} onChange={(e) => updateForm("plato_principal_id", e.target.value)}>
                <option value="">Seleccionar plato</option>
                {principales.map((p) => <option key={p.plato_id} value={p.plato_id}>{p.nombre}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Bebida</span>
              <select required value={form.bebida_id} onChange={(e) => updateForm("bebida_id", e.target.value)}>
                <option value="">Seleccionar bebida</option>
                {bebidas.map((p) => <option key={p.plato_id} value={p.plato_id}>{p.nombre}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Postre</span>
              <select required value={form.postre_id} onChange={(e) => updateForm("postre_id", e.target.value)}>
                <option value="">Seleccionar postre</option>
                {postres.map((p) => <option key={p.plato_id} value={p.plato_id}>{p.nombre}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Stock disponible</span>
              <input type="number" min="0" step="1" required value={form.cantidad_disponible} onChange={(e) => updateForm("cantidad_disponible", e.target.value)} />
            </label>
            <label className="form-field field-span-two">
              <span>URL de imagen (opcional)</span>
              <input type="url" value={form.imagen_url} onChange={(e) => updateForm("imagen_url", e.target.value)} placeholder="https://..." />
            </label>
            <label className="form-field field-span-two">
              <span>Información nutricional (opcional)</span>
              <textarea rows={2} value={form.info_nutricional} onChange={(e) => updateForm("info_nutricional", e.target.value)} placeholder="Información nutricional del menú" />
            </label>
            <label className="form-field field-span-two" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={form.publicado} onChange={(e) => updateForm("publicado", e.target.checked)} />
              <span>Publicar menú al crearlo</span>
            </label>
          </div>
          <div className="modal-footer form-footer">
            <Button disabled={saving || loading || !platos.length} type="submit"><CirclePlus aria-hidden="true" data-icon="inline-start" />{saving ? "Guardando..." : "Crear menú diario"}</Button>
          </div>
          {!loading && (!principales.length || !bebidas.length || !postres.length) && (
            <p role="status">Para crear un menú deben existir en el catálogo platos de tipo Principal, Bebida y Postre.</p>
          )}
        </form>
      </section>

      <section className="panel meal-management-panel" style={{ marginTop: 24 }}>
        <div className="management-toolbar">
          <div><h2>Menús registrados</h2><p>Editar permite cambiar stock, precio, imagen y publicación; los platos y la fecha se mantienen.</p></div>
          <span>{menus.length} menús</span>
        </div>
        {loading ? <div className="table-empty"><span>Cargando menús del backend…</span></div> : (
          <div className="table-scroll">
            <table className="data-table meal-management-table">
              <thead><tr><th>Fecha</th><th>Plato principal</th><th>Bebida y postre</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {menus.map((menu) => (
                  <tr key={menu.menu_dia_id}>
                    <td>{menu.fecha}</td>
                    <td>{platoPorId.get(menu.plato_principal_id)?.nombre ?? `Plato #${menu.plato_principal_id}`}</td>
                    <td><div><strong>{platoPorId.get(menu.bebida_id)?.nombre ?? `Bebida #${menu.bebida_id}`}</strong><br /><span>{platoPorId.get(menu.postre_id)?.nombre ?? `Postre #${menu.postre_id}`}</span></div></td>
                    <td>Bs {Number(menu.precio_menu).toFixed(2)}</td>
                    <td>{menu.cantidad_disponible}</td>
                    <td><span className={`status-pill ${menu.publicado && menu.cantidad_disponible > 0 ? "status-active" : "status-muted"}`}>{menu.publicado ? "Publicado" : "No publicado"}</span></td>
                    <td><Button onClick={() => startEditing(menu)} size="sm" type="button" variant="outline">Editar</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!menus.length && <div className="table-empty"><UtensilsCrossed aria-hidden="true" /><strong>No hay menús registrados.</strong><span>Crea la primera oferta usando el formulario.</span></div>}
          </div>
        )}
      </section>

      <Modal
        description="Solo se actualizarán los campos admitidos por el backend: stock, precio, imagen y publicación."
        onClose={closeEditor}
        open={Boolean(editing)}
        title={editing ? `Editar menú del ${editing.fecha}` : "Editar menú"}
        wide
      >
        {editing && <form className="meal-editor-form" onSubmit={submitUpdate}>
          <div className="meal-editor-fields">
            <label className="form-field"><span>Fecha (solo lectura)</span><input type="date" disabled value={editing.fecha} /></label>
            <label className="form-field"><span>Precio (Bs)</span><input type="number" min="0.01" step="0.01" required value={form.precio_menu} onChange={(e) => updateForm("precio_menu", e.target.value)} /></label>
            <label className="form-field"><span>Stock disponible</span><input type="number" min="0" step="1" required value={form.cantidad_disponible} onChange={(e) => updateForm("cantidad_disponible", e.target.value)} /></label>
            <label className="form-field field-span-two"><span>URL de imagen</span><input type="url" value={form.imagen_url} onChange={(e) => updateForm("imagen_url", e.target.value)} /></label>
            <label className="form-field field-span-two" style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={form.publicado} onChange={(e) => updateForm("publicado", e.target.checked)} /><span>Menú publicado</span></label>
          </div>
          <div className="modal-footer form-footer">
            <Button onClick={closeEditor} type="button" variant="outline">Cancelar</Button>
            <Button disabled={saving} type="submit"><Check aria-hidden="true" data-icon="inline-start" />{saving ? "Guardando..." : "Guardar cambios"}</Button>
          </div>
        </form>}
      </Modal>
      <ToastNotice message={notice} onClose={() => setNotice("")} />
    </div>
  );
}
