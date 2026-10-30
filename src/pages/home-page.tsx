import { useCallback, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Clock3,
  Leaf,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { MealCatalog } from "@/components/meal-catalog";
import { Brand, PublicFooter, PublicHeader } from "@/components/site-shell";
import { ToastNotice } from "@/components/ui-primitives";
import { useRestaurant } from "@/context/restaurant-context";
import type { Meal } from "@/types";

const kitchenPillars = [
  {
    number: "01",
    title: "Del mercado a tu mesa",
    description:
      "Elegimos ingredientes de productores locales y cocinamos con lo que está en su mejor momento.",
  },
  {
    number: "02",
    title: "Sabores con historia",
    description:
      "Recetas de aquí, ingredientes de aquí y ese toque de casa que no se puede apurar.",
  },
  {
    number: "03",
    title: "A tu ritmo",
    description:
      "Pide en unos pasos y recibe un almuerzo recién hecho, listo para disfrutar.",
  },
];

export function HomePage() {
  const { addToCart, cartCount, menuHoy } = useRestaurant();
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const clearNotice = useCallback(() => setNotice(""), []);
  const availableMeals = menuHoy.filter((meal) => meal.available);

  const handleAdd = (meal: Meal) => {
    addToCart(meal);
    setNotice(`${meal.name} se agregó a tu pedido.`);
    setCartOpen(true);
  };

  return (
    <div className="public-site">
      <PublicHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
      />
      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div
            className="hero-image"
            role="img"
            aria-label="Silpancho boliviano preparado con ingredientes frescos"
          />
          <div className="hero-content mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
            <div className="hero-copy">
              <p className="hero-kicker">
                <span /> Almuerzos de temporada · La Paz
              </p>
              <h1 id="hero-title">
                La pausa que
                <br />
                <em>te hace bien.</em>
              </h1>
              <p className="hero-description">
                Cocina honesta, ingredientes frescos y sabores bolivianos
                preparados cada día para ti.
              </p>
              <div className="hero-actions">
                <a
                  className={buttonVariants({
                    size: "lg",
                    variant: "secondary",
                    className: "hero-primary-button",
                  })}
                  href="#menu"
                >
                  Ver menú de hoy{" "}
                  <ArrowDownRight aria-hidden="true" data-icon="inline-end" />
                </a>
                <a className="hero-text-link" href="#nosotros">
                  Conoce nuestra cocina <ArrowRight aria-hidden="true" />
                </a>
              </div>
              <div className="hero-proof">
                <span className="hero-proof-mark" aria-hidden="true"><Leaf /></span>
                <div>
                  <strong>Hecho con cariño</strong>
                  <span>por manos paceñas</span>
                </div>
              </div>
            </div>
            <div className="hero-note">
              <span className="hero-note-icon">
                <Leaf aria-hidden="true" />
              </span>
              <div>
                <strong>Fresco, siempre</strong>
                <span>Cocinamos cada mañana</span>
              </div>
              <span className="hero-note-check">
                <Check aria-hidden="true" />
              </span>
            </div>
            <div className="hero-index" aria-hidden="true">
              <span>01</span>
              <span className="hero-index-line" />
              <span>03</span>
            </div>
          </div>
        </section>

        <section className="service-strip" aria-label="Información de servicio">
          <div className="service-strip-inner mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
            <div>
              <span className="service-strip-icon">
                <Clock3 aria-hidden="true" />
              </span>
              <p>
                <strong>Menú del día</strong>
                <span>Consulta la disponibilidad actual</span>
              </p>
            </div>
            <div>
              <span className="service-strip-icon">
                <MapPin aria-hidden="true" />
              </span>
              <p>
                <strong>La Paz, Bolivia</strong>
                <span>Entrega en zonas seleccionadas</span>
              </p>
            </div>
            <div>
              <span className="service-strip-icon">
                <Sparkles aria-hidden="true" />
              </span>
              <p>
                <strong>Ingredientes reales</strong>
                <span>Estacionales y de origen local</span>
              </p>
            </div>
          </div>
        </section>

        <section className="menu-section page-section" id="menu">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow-line" /> Lo de hoy
                </p>
                <h2>
                  Un menú hecho
                  <br />
                  <em>para disfrutar.</em>
                </h2>
              </div>
              <div className="section-heading-aside">
                <p>
                  Cada plato tiene su propio ritmo. Elige el tuyo y nosotros nos
                  encargamos del resto.
                </p>
                <span className="menu-date">
                  <span className="menu-date-dot" /> Carta de temporada
                </span>
              </div>
            </div>
            <MealCatalog meals={availableMeals} onAdd={handleAdd} />
          </div>
        </section>

        <section className="origin-section page-section" id="nosotros">
          <div className="origin-card mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
            <div className="origin-copy">
              <p className="eyebrow eyebrow-light">
                <span className="eyebrow-line" /> Nuestra forma de cocinar
              </p>
              <h2>
                Lo local sabe
                <br />
                <em>a algo más.</em>
              </h2>
              <p className="origin-description">
                Solandre nace de una idea sencilla: comer rico, cuidar lo que
                nos hace bien y celebrar los sabores que tenemos cerca.
              </p>
              <Link className="origin-link" to="/registro">
                Pide tu primer almuerzo <ArrowRight aria-hidden="true" />
              </Link>
              <div className="origin-checks">
                <span>
                  <Check aria-hidden="true" /> Proveedores locales
                </span>
                <span>
                  <Check aria-hidden="true" /> Cocina diaria y sin apuro
                </span>
              </div>
            </div>
            <div className="origin-image-wrap">
              <img
                alt="Silpancho preparado con arroz, papa, huevo y ensalada fresca"
                loading="lazy"
                src="/images/solandre-hero.png"
              />
              <div className="origin-image-caption">
                <span>La Paz, Bolivia</span>
                <strong>Con sabor a casa</strong>
              </div>
              <span className="origin-stamp">
                <Leaf aria-hidden="true" />
                <span>
                  Hecho aquí
                  <br />
                  con cariño
                </span>
              </span>
            </div>
          </div>
        </section>

        <section className="pillars-section page-section">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="pillars-heading">
              <p className="eyebrow">
                <span className="eyebrow-line" /> Lo que nos mueve
              </p>
              <h2>
                Una cocina con
                <br />
                <em>sentido.</em>
              </h2>
            </div>
            <div className="pillars-grid">
              {kitchenPillars.map((pillar) => (
                <article className="pillar-card" key={pillar.number}>
                  <span className="pillar-number">{pillar.number}</span>
                  <span className="pillar-mark">
                    <Leaf aria-hidden="true" />
                  </span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-cta">
          <div className="closing-cta-inner mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="eyebrow eyebrow-light">
                <span className="eyebrow-line" /> Un buen almuerzo cambia el día
              </p>
              <h2>
                ¿Qué se te antoja
                <br />
                <em>hoy?</em>
              </h2>
            </div>
            <Link className="closing-cta-link" to="/registro">
              Arma tu pedido <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
      <CartDrawer onClose={() => setCartOpen(false)} open={cartOpen} />
      <ToastNotice message={notice} onClose={clearNotice} />
    </div>
  );
}
