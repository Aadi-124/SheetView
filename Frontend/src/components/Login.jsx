import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userLogin } from "../services/BackendAPIs";
import { useSnackbar } from "notistack";
import { saveLocalAuth } from "../services/sessionStorageAuth";
import { getLocalAuth } from "../services/sessionStorageAuth";

/* ------------------------------------------------------------------ */
/*                   LocalStorage / SessionStorage helpers             */
/* ------------------------------------------------------------------ */

export const AUTH_KEY = "app.auth";

/** Get saved auth object safely from storage (session first if present) */
export function getStoredAuth() {
  try {
    const rawSession = sessionStorage.getItem(AUTH_KEY);
    const rawLocal = localStorage.getItem(AUTH_KEY);
    const raw = rawSession ?? rawLocal;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Save auth to storage, honoring `remember` */
export function saveStoredAuth(auth) {
  try {
    const serialized = JSON.stringify(auth);
    if (auth?.remember) {
      localStorage.setItem(AUTH_KEY, serialized);
      sessionStorage.removeItem(AUTH_KEY);
    } else {
      sessionStorage.setItem(AUTH_KEY, serialized);
      localStorage.removeItem(AUTH_KEY);
    }
    return true;
  } catch {
    return false;
  }
}

/** Clear saved auth from both storages */
export function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*                              Component                              */
/* ------------------------------------------------------------------ */

export default function Login() {
  const [userNameOrEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Local view of what's currently in storage
  const [savedAuth, setSavedAuth] = useState(() => getStoredAuth());

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Simple inline alert (for storage panel)
  const [alert, setAlert] = useState({
    type: "info", // "success" | "error" | "warning" | "info"
    message: "",
    show: false,
  });

  const showAlert = (type, message) => {
    setAlert({ type, message, show: true });
    setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 4000);
  };

  const AlertBanner = () =>
    !alert.show ? null : (
      <>
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
            display: "flex",
            gap: 10,
            alignItems: "center",
            borderRadius: 10,
            padding: "10px 14px",
            border: "1px solid",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            background:
              alert.type === "success"
                ? "#b7fbcb"
                : alert.type === "error"
                ? "#fef2f2"
                : alert.type === "warning"
                ? "#fffbeb"
                : "#eff6ff",
            color:
              alert.type === "success"
                ? "#166534"
                : alert.type === "error"
                ? "#991b1b"
                : alert.type === "warning"
                ? "#92400e"
                : "#1e3a8a",
            borderColor:
              alert.type === "success"
                ? "#bbf7d0"
                : alert.type === "error"
                ? "#fecaca"
                : alert.type === "warning"
                ? "#fde68a"
                : "#bfdbfe",
            transition: "all 200ms ease",
          }}
          role="status"
          aria-live="polite"
        >
          <strong style={{ textTransform: "capitalize" }}>{alert.type}</strong>
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert((p) => ({ ...p, show: false }))}
            style={{
              marginLeft: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
            }}
            aria-label="Close alert"
          >
            ×
          </button>
        </div>
      </>
    );

  const validate = () => {
    const e = {};
    if (!userNameOrEmail) {
      e.email = "Email/Username is required.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // -------- Hydrate from storage on mount + cross-tab sync --------
  useEffect(() => {
    const auth = getStoredAuth();
    setSavedAuth(auth || null);

    if (auth?.username) {
      // Prefill username if present
      setEmail(auth.username);
    }

    if (auth?.isLoggedIn) {
      // Since we removed Zustand, we just navigate home if already logged in
      navigate("/", { replace: true });
    }

    // Cross-tab synchronization: update local state when storage changes
    const onStorage = (e) => {
      if (e.key !== AUTH_KEY) return;
      const next = getStoredAuth();
      setSavedAuth(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      // Call your backend login
      const res = await userLogin(userNameOrEmail, password);
     
// Always convert to object safely
const parsed =
  (typeof res === "string")
    ? JSON.parse(res)     // if backend returned JSON string
    : res;                // if backend already returned object

console.log("RESSSSS =", parsed);

      // Derive a username
      const derivedUsername =
        res?.user?.username ??
        res?.data?.username ??
        res?.username ??
        userNameOrEmail;

      // Derive a userId (fallback to random UUID if not provided)
      const derivedUserId =
        res?.data?.userId ??
        res?.userId ??
        (window.crypto?.randomUUID?.() || String(Date.now()));

      // Build the object we will persist (DO NOT store password)
      const auth = {
        username: derivedUsername,
        userId: String(derivedUserId),
        isLoggedIn: true,
        remember: !!remember,
        loggedInAt: new Date().toISOString(),
      };

      console.log(derivedUserId+" THIS is ID");

      // Persist to storage
      const ok = saveStoredAuth(auth);
      saveLocalAuth(auth);
      console.log("saveLocalAuth(auth) = "+saveLocalAuth(auth));
      console.log("getLocalAuth() = "+getLocalAuth());
      const AUTHSample = getLocalAuth();
      console.log("AUTHSample = "+JSON.stringify(AUTHSample));
      if (!ok) {
        enqueueSnackbar("Could not save session locally.", { variant: "warning" });
      } else {
        setSavedAuth(auth); // update local view
      }

      enqueueSnackbar("Logged in successfully!", { variant: "success" });
      // Since Zustand is removed, we simply navigate
      navigate("/");
    } catch (err) {
      enqueueSnackbar("Invalid Email and Password", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReloadSaved = () => {
    const data = getStoredAuth();
    setSavedAuth(data);
    if (data) {
      showAlert("info", "Loaded saved session from storage.");
    } else {
      showAlert("warning", "No saved session found in storage.");
    }
  };

  const handleClearSaved = () => {
    const ok = clearStoredAuth();
    if (ok) {
      setSavedAuth(null);
      showAlert("success", "Cleared saved session.");
    } else {
      showAlert("error", "Unable to clear storage.");
    }
  };

  const prettySaved = useMemo(() => {
    if (!savedAuth) return "null";
    try {
      return JSON.stringify(savedAuth, null, 2);
    } catch {
      return "Invalid data";
    }
  }, [savedAuth]);

  return (
    <div style={styles.page}>
      {/* Alert */}
      <AlertBanner />

      <div className="card" style={inline.card}>
        <div className="brand" style={inline.brand}>
          <div className="logo" aria-hidden="true" style={inline.logo}>
            ✓
          </div>
          <div className="brand-text">
            <h1 className="title" style={inline.title}>
              Welcome Back
            </h1>
            <p className="subtitle" style={inline.subtitle}>
              Sign in to continue
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate style={inline.form}>
          {/* Email / Username */}
          <label htmlFor="email" className="label" style={inline.label}>
            Username or Email
          </label>
          <div
            className={`input-wrap ${errors.email ? "has-error" : ""}`}
            style={{
              ...inline.inputWrap,
              ...(errors.email ? inline.inputWrapError : {}),
            }}
          >
            <input
              id="email"
              name="email"
              type="text"
              placeholder="you@example.com or username"
              autoComplete="username"
              value={userNameOrEmail}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              style={inline.input}
            />
          </div>
          {errors.email && (
            <div id="email-error" className="error" style={inline.error}>
              {errors.email}
            </div>
          )}

          {/* Password */}
          <label htmlFor="password" className="label" style={inline.label}>
            Password
          </label>
          <div
            className={`input-wrap with-addon ${
              errors.password ? "has-error" : ""
            }`}
            style={{
              ...inline.inputWrap,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              ...(errors.password ? inline.inputWrapError : {}),
            }}
          >
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              style={{ ...inline.input, paddingRight: 72 }}
            />
            <button
              type="button"
              className="addon"
              onClick={() => setShowPwd(!showPwd)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              style={inline.addon}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <div id="password-error" className="error" style={inline.error}>
              {errors.password}
            </div>
          )}

          {/* Options */}
          <div className="row" style={inline.row}>
            <label className="checkbox" style={inline.checkbox}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={inline.checkboxInput}
              />
              <span>Remember me</span>
            </label>

            <a
              className="link"
              href="#forgot"
              onClick={(e) => e.preventDefault()}
              style={inline.link}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button className="btn" type="submit" disabled={submitting} style={inline.btn}>
            {submitting ? <span className="spinner" aria-hidden="true" /> : null}
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

       

        <p className="footnote" style={inline.footnote}>
          Don’t have an account?{" "}
          <Link className="link" to="/register" style={inline.link}>
            Create One
          </Link>
        </p>
      </div>

      <footer className="attribution" style={inline.attribution}>
        <span>Green &amp; White theme • React Single File</span>
      </footer>
    </div>
  );
}

/* ---------- Minimal Inline Styles (no CSS variables) ---------- */
const styles = {
  page: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, #f6fff7 0%, #f0fff4 30%, #ecfdf5 60%, #ffffff 100%)",
    padding: "24px",
  },
};

const inline = {
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    border: "1px solid #dcfce7",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(22,163,74,0.15)",
    padding: 28,
  },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    boxShadow: "0 6px 16px rgba(21,128,61,0.25)",
  },
  title: { margin: 0, fontSize: "1.4rem", color: "#15803d", letterSpacing: "-0.02em" },
  subtitle: { margin: "2px 0 0", fontSize: "0.95rem", color: "#64748b" },
  form: { marginTop: 12, display: "grid", gap: 10 },
  label: { fontSize: "0.9rem", fontWeight: 600, color: "#334155" },
  inputWrap: {
    position: "relative",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    background: "#fff",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  },
  inputWrapError: {
    borderColor: "#dc2626",
    boxShadow: "0 0 0 4px rgba(220,38,38,0.08)",
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 14px",
    fontSize: "0.975rem",
    color: "#334155",
  },
  addon: {
    marginRight: 6,
    border: "none",
    background: "#f0fdf4",
    color: "#15803d",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: { color: "#dc2626", fontSize: "0.85rem", marginTop: -4, marginBottom: 4 },
  row: { marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between" },
  checkbox: { display: "inline-flex", alignItems: "center", gap: 8, userSelect: "none", cursor: "pointer", fontSize: "0.95rem" },
  checkboxInput: { width: 16, height: 16, accentColor: "#16a34a" },
  link: { color: "#15803d", textDecoration: "none", fontWeight: 600 },
  btn: {
    marginTop: 10,
    width: "100%",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(21,128,61,0.25)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  footnote: { margin: "14px 0 0", fontSize: "0.95rem", color: "#64748b", textAlign: "center" },
  attribution: { marginTop: 18, textAlign: "center", color: "#14532d", fontSize: "0.85rem", opacity: 0.9 },

  // Debug panel
  debugCard: {
    marginTop: 16,
    border: "1px solid #dcfce7",
    background: "#f0fdf4",
    borderRadius: 12,
    padding: 12,
  },
  debugHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
    color: "#15803d",
  },
  debugActions: { display: "inline-flex", gap: 8 },
  chip: {
    border: "1px solid #bbf7d0",
    background: "#fff",
    color: "#15803d",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },
  chipDanger: {
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },
  debugPre: {
    margin: 0,
    padding: 10,
    background: "#ffffff",
    border: "1px dashed #bbf7d0",
    borderRadius: 8,
    fontSize: 12.5,
    lineHeight: 1.45,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
  },
  debugHint: { margin: "8px 0 0", fontSize: "0.85rem", color: "#64748b" },
};









