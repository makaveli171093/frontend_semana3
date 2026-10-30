import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/site-shell";
import { useAuth } from "@/context/auth-context";
import { dashboardForRole } from "@/auth/roles";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phone, setPhone] = useState("");

  if (user) return <Navigate replace to={dashboardForRole(user.role)} />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isRegister && name.trim().length < 2) {
      setError("Escribe tu nombre para continuar.");
      return;
    }

    if (isRegister && phone.trim().length < 7) {
      setError("Ingresa un teléfono válido.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password, phone.trim());

        setSuccess("Cuenta creada correctamente. Ahora puedes iniciar sesión.");

        window.setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);

        return;
      }

      const authenticatedUser = await login(email.trim(), password);

      navigate(dashboardForRole(authenticatedUser.role), {
        replace: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={`auth-screen${isRegister ? " auth-screen-register" : ""}`}>
      <section aria-label="Solandre, cocina con origen" className="auth-story">
        <div className="auth-story-image" />
        <div className="auth-story-overlay" />
        <div className="auth-story-inner">
          <Brand light />
          <div className="auth-story-copy">
            <span className="auth-story-mark">
              <Leaf aria-hidden="true" />
            </span>
            <p className="eyebrow eyebrow-light">Cocina de origen</p>
            <h1>
              Un almuerzo
              <br />
              hecho <em>para ti.</em>
            </h1>
            <p>
              Ingredientes frescos, sabor de casa y un espacio solo para ti.
            </p>
          </div>
          <div className="auth-story-bottom">
            <span>01 — 03</span>
            <span>La Paz · Bolivia</span>
          </div>
        </div>
      </section>

      <section className="auth-form-side">
        <Link className="auth-back-link" to="/">
          <ArrowLeft aria-hidden="true" /> Volver a Solandre
        </Link>
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <Brand />
          </div>
          <span className="auth-step-label">
            {isRegister ? "UN NUEVO COMIENZO" : "QUÉ GUSTO VERTE"}
          </span>
          <h2>{isRegister ? "Crea tu espacio." : "Bienvenido de vuelta."}</h2>
          <p className="auth-intro">
            {isRegister
              ? "Unos datos y ya estás más cerca de tu próximo almuerzo."
              : "Ingresa a tu cuenta para continuar con tu pedido."}
          </p>

          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            {isRegister && (
              <label className="form-field">
                <span>Nombre completo</span>
                <span className="form-input-wrap">
                  <UserRound aria-hidden="true" />
                  <input
                    autoComplete="name"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Tu nombre"
                    required
                    value={name}
                  />
                </span>
              </label>
            )}
            {isRegister && (
              <label className="form-field">
                <span>Teléfono</span>
                <span className="form-input-wrap">
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Tu número de teléfono"
                    required
                    value={phone}
                  />
                </span>
              </label>
            )}
            <label className="form-field">
              <span>Correo electrónico</span>
              <span className="form-input-wrap">
                <Mail aria-hidden="true" />
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@correo.com"
                  required
                  type="email"
                  value={email}
                />
              </span>
            </label>
            <label className="form-field">
              <span>Contraseña</span>
              <span className="form-input-wrap">
                <LockKeyhole aria-hidden="true" />
                <input
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </button>
              </span>
            </label>

            {error && (
              <p className="form-message form-message-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="form-message form-message-success" role="status">
                {success}
              </p>
            )}

            <Button
              className="auth-submit"
              disabled={submitting}
              size="lg"
              type="submit"
            >
              {submitting
                ? "Un momento…"
                : isRegister
                  ? "Crear mi cuenta"
                  : "Ingresar a mi espacio"}
              {!submitting && (
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              )}
            </Button>
          </form>

          <p className="auth-switch">
            {isRegister ? "¿Ya tienes cuenta?" : "¿Todavía no tienes cuenta?"}{" "}
            <Link to={isRegister ? "/login" : "/registro"}>
              {isRegister ? "Ingresa aquí" : "Regístrate"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
