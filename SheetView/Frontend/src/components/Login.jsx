



// // import React, { useEffect, useMemo, useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import { userLogin } from "../services/BackendAPIs";
// // import { useSnackbar } from "notistack";
// // import { useStore } from "../services/state";

// // /* ------------------------------------------------------------------ */
// // /*                   LocalStorage helpers (exported)                   */
// // /* ------------------------------------------------------------------ */

// // export const AUTH_KEY = "app.auth";

// // /** Get saved auth object safely from localStorage */
// // export function getStoredAuth() {
// //   try {
// //     const raw = localStorage.getItem(AUTH_KEY);
// //     if (!raw) return null;
// //     return JSON.parse(raw);
// //   } catch {
// //     return null;
// //   }
// // }

// // /** Save auth to localStorage */
// // export function saveStoredAuth(auth) {
// //   try {
// //     localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
// //     return true;
// //   } catch {
// //     return false;
// //   }
// // }

// // /** Clear saved auth */
// // export function clearStoredAuth() {
// //   try {
// //     localStorage.removeItem(AUTH_KEY);
// //     return true;
// //   } catch {
// //     return false;
// //   }
// // }

// // /* ------------------------------------------------------------------ */
// // /*                              Component                              */
// // /* ------------------------------------------------------------------ */

// // export default function Login() {
// //   const [userNameOrEmail, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [showPwd, setShowPwd] = useState(false);
// //   const [remember, setRemember] = useState(false);
// //   const [errors, setErrors] = useState({});
// //   const [submitting, setSubmitting] = useState(false);

// //   // Local view of what's currently in localStorage
// //   const [savedAuth, setSavedAuth] = useState(() => getStoredAuth());

// //   const navigate = useNavigate();
// //   const { enqueueSnackbar } = useSnackbar();

// //   const login = useStore((state) => state.login);

// //   // Simple inline alert (kept from your original file)
// //   const [alert, setAlert] = useState({
// //     type: "info", // "success" | "error" | "warning" | "info"
// //     message: "",
// //     show: false,
// //   });

// //   const showAlert = (type, message) => {
// //     setAlert({ type, message, show: true });
// //     setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 4000);
// //   };

// //   const AlertBanner = () =>
// //     !alert.show ? null : (
// //       <>
// //         <div
// //           style={{
// //             position: "fixed",
// //             top: 16,
// //             right: 16,
// //             zIndex: 1000,
// //             display: "flex",
// //             gap: 10,
// //             alignItems: "center",
// //             borderRadius: 10,
// //             padding: "10px 14px",
// //             border: "1px solid",
// //             boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
// //             background:
// //               alert.type === "success"
// //                 ? "#b7fbcb"
// //                 : alert.type === "error"
// //                 ? "#fef2f2"
// //                 : alert.type === "warning"
// //                 ? "#fffbeb"
// //                 : "#eff6ff",
// //             color:
// //               alert.type === "success"
// //                 ? "#166534"
// //                 : alert.type === "error"
// //                 ? "#991b1b"
// //                 : alert.type === "warning"
// //                 ? "#92400e"
// //                 : "#1e3a8a",
// //             borderColor:
// //               alert.type === "success"
// //                 ? "#bbf7d0"
// //                 : alert.type === "error"
// //                 ? "#fecaca"
// //                 : alert.type === "warning"
// //                 ? "#fde68a"
// //                 : "#bfdbfe",
// //             transition: "all 200ms ease",
// //           }}
// //           role="status"
// //           aria-live="polite"
// //         >
// //           <strong style={{ textTransform: "capitalize" }}>{alert.type}</strong>
// //           <span>{alert.message}</span>
// //           <button
// //             onClick={() => setAlert((p) => ({ ...p, show: false }))}
// //             style={{
// //               marginLeft: 8,
// //               border: "none",
// //               background: "transparent",
// //               cursor: "pointer",
// //               fontSize: 16,
// //               lineHeight: 1,
// //             }}
// //             aria-label="Close alert"
// //           >
// //             ×
// //           </button>
// //         </div>
// //       </>
// //     );

// //   const validate = () => {
// //     const e = {};
// //     if (!userNameOrEmail) {
// //       e.email = "Email/Username is required.";
// //     }
// //     if (!password) {
// //       e.password = "Password is required.";
// //     } else if (password.length < 6) {
// //       e.password = "Password must be at least 6 characters.";
// //     }
// //     setErrors(e);
// //     return Object.keys(e).length === 0;
// //   };

// //   // You can preload username if you like (optional UX)
// //   useEffect(() => {
// //     if (savedAuth?.username) {
// //       // Example: prefill username if you want
// //       setEmail(savedAuth.username);
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   const onSubmit = async (ev) => {
// //     ev.preventDefault();
// //     if (!validate()) return;

// //     setSubmitting(true);

// //     try {
// //       /**
// //        * Assumptions about `userLogin` return shape:
// //        * It might return: { user: { id, username, email }, token, ... }
// //        * or { data: { userId, username } } etc.
// //        * We defensively derive the needed fields and fall back sensibly.
// //        */
// //       const res = await userLogin(userNameOrEmail, password);

// //       // Derive a username
// //       const derivedUsername =
// //         res?.user?.username ??
// //         res?.data?.username ??
// //         res?.username ??
// //         userNameOrEmail;

// //       // Derive a userId (fallback to random UUID if not provided)
// //       const derivedUserId =
// //         res?.user?.id ??
// //         res?.data?.userId ??
// //         res?.userId ??
// //         (window.crypto?.randomUUID?.() || String(Date.now()));

// //       // Build the object we will persist (DO NOT store password)
// //       const auth = {
// //         username: derivedUsername,
// //         userId: String(derivedUserId),
// //         isLoggedIn: true,
// //         remember: !!remember,
// //         loggedInAt: new Date().toISOString(),
// //       };

// //       // Persist to localStorage
// //       const ok = saveStoredAuth(auth);
// //       if (!ok) {
// //         enqueueSnackbar("Could not save session locally.", { variant: "warning" });
// //       } else {
// //         setSavedAuth(auth); // update local view
// //       }

// //       enqueueSnackbar("Logged in successfully!", { variant: "success" });
// //       // Sync with your global store (Zustand, etc.)
// //       login(derivedUsername);
// //       // Navigate to home (or wherever)
// //       navigate("/");
// //     } catch (err) {
// //       enqueueSnackbar("Invalid Email and Password", { variant: "error" });
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleReloadSaved = () => {
// //     const data = getStoredAuth();
// //     setSavedAuth(data);
// //     if (data) {
// //       showAlert("info", "Loaded saved session from localStorage.");
// //     } else {
// //       showAlert("warning", "No saved session found in localStorage.");
// //     }
// //   };

// //   const handleClearSaved = () => {
// //     const ok = clearStoredAuth();
// //     if (ok) {
// //       setSavedAuth(null);
// //       showAlert("success", "Cleared saved session.");
// //     } else {
// //       showAlert("error", "Unable to clear localStorage.");
// //     }
// //   };

// //   const prettySaved = useMemo(() => {
// //     if (!savedAuth) return "null";
// //     try {
// //       return JSON.stringify(savedAuth, null, 2);
// //     } catch {
// //       return "Invalid data";
// //     }
// //   }, [savedAuth]);

// //   return (
// //     <div style={styles.page}>
// //       <style>{css}</style>

// //       {/* Alert */}
// //       <AlertBanner />

// //       <div className="card">
// //         <div className="brand">
// //           <div className="logo" aria-hidden="true">
// //             ✓
// //           </div>
// //           <div className="brand-text">
// //             <h1 className="title">Welcome Back</h1>
// //             <p className="subtitle">Sign in to continue</p>
// //           </div>
// //         </div>

// //         <form onSubmit={onSubmit} noValidate>
// //           {/* Email / Username */}
// //           <label htmlFor="email" className="label">
// //             Username or Email
// //           </label>
// //           <div className={`input-wrap ${errors.email ? "has-error" : ""}`}>
// //             <input
// //               id="email"
// //               name="email"
// //               type="text"
// //               placeholder="you@example.com or username"
// //               autoComplete="username"
// //               value={userNameOrEmail}
// //               onChange={(e) => setEmail(e.target.value)}
// //               aria-invalid={!!errors.email}
// //               aria-describedby={errors.email ? "email-error" : undefined}
// //             />
// //           </div>
// //           {errors.email && (
// //             <div id="email-error" className="error">
// //               {errors.email}
// //             </div>
// //           )}

// //           {/* Password */}
// //           <label htmlFor="password" className="label">
// //             Password
// //           </label>
// //           <div
// //             className={`input-wrap with-addon ${
// //               errors.password ? "has-error" : ""
// //             }`}
// //           >
// //             <input
// //               id="password"
// //               name="password"
// //               type={showPwd ? "text" : "password"}
// //               placeholder="••••••••"
// //               autoComplete="current-password"
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               aria-invalid={!!errors.password}
// //               aria-describedby={errors.password ? "password-error" : undefined}
// //             />
// //             <button
// //               type="button"
// //               className="addon"
// //               onClick={() => setShowPwd(!showPwd)}
// //               aria-label={showPwd ? "Hide password" : "Show password"}
// //             >
// //               {showPwd ? "Hide" : "Show"}
// //             </button>
// //           </div>
// //           {errors.password && (
// //             <div id="password-error" className="error">
// //               {errors.password}
// //             </div>
// //           )}

// //           {/* Options */}
// //           <div className="row">
// //             <label className="checkbox">
// //               <input
// //                 type="checkbox"
// //                 checked={remember}
// //                 onChange={(e) => setRemember(e.target.checked)}
// //               />
// //               <span>Remember me</span>
// //             </label>

// //             <a className="link" href="#forgot" onClick={(e) => e.preventDefault()}>
// //               Forgot password?
// //             </a>
// //           </div>

// //           {/* Submit */}
// //           <button className="btn" type="submit" disabled={submitting}>
// //             {submitting ? <span className="spinner" aria-hidden="true" /> : null}
// //             {submitting ? "Signing in..." : "Sign in"}
// //           </button>
// //         </form>

        

// //         <p className="footnote">
// //           Don’t have an account?{" "}
// //           <Link className="link" to="/register">
// //             Create One
// //           </Link>
// //         </p>
// //       </div>

// //       <footer className="attribution">
// //         <span>Green &amp; White theme • React Single File</span>
// //       </footer>
// //     </div>
// //   );
// // }

// // /* ---------- Inline Styles ---------- */
// // const styles = {
// //   page: {
// //     minHeight: "100svh",
// //     display: "grid",
// //     placeItems: "center",
// //     background:
// //       "linear-gradient(135deg, #f6fff7 0%, #f0fff4 30%, #ecfdf5 60%, #ffffff 100%)",
// //     padding: "24px",
// //   },
// // };

// // /* ---------- Theme & Component CSS (Single file) ---------- */
// // const css = `
// //   :root {
// //     --green-600: #16a34a; /* primary */
// //     --green-700: #15803d;
// //     --green-50:  #f0fdf4;
// //     --green-100: #dcfce7;
// //     --green-200: #bbf7d0;
// //     --green-900: #14532d;
// //     --slate-700: #334155;
// //     --slate-500: #64748b;
// //     --slate-300: #cbd5e1;
// //     --white: #ffffff;
// //     --error: #dc2626;
// //     --shadow: 0 10px 30px rgba(22, 163, 74, 0.15);
// //     --radius-2xl: 20px;
// //   }

// //   * { box-sizing: border-box; }
// //   html, body, #root { height: 100%; }
// //   body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: var(--slate-700); }

// //   .card {
// //     width: 100%;
// //     max-width: 420px;
// //     background: var(--white);
// //     border: 1px solid var(--green-100);
// //     border-radius: var(--radius-2xl);
// //     box-shadow: var(--shadow);
// //     padding: 28px;
// //     animation: pop 320ms ease-out both;
// //   }

// //   @keyframes pop {
// //     from { opacity: 0; transform: translateY(8px) scale(0.98); }
// //     to   { opacity: 1; transform: translateY(0) scale(1); }
// //   }

// //   .brand {
// //     display: flex;
// //     align-items: center;
// //     gap: 12px;
// //     margin-bottom: 18px;
// //   }

// //   .logo {
// //     width: 44px;
// //     height: 44px;
// //     border-radius: 12px;
// //     background: linear-gradient(135deg, var(--green-600), var(--green-700));
// //     color: var(--white);
// //     display: grid;
// //     place-items: center;
// //     font-weight: 800;
// //     box-shadow: 0 6px 16px rgba(21, 128, 61, 0.25);
// //   }

// //   .brand-text .title {
// //     margin: 0;
// //     font-size: 1.4rem;
// //     color: var(--green-700);
// //     letter-spacing: -0.02em;
// //   }
// //   .brand-text .subtitle {
// //     margin: 2px 0 0;
// //     font-size: 0.95rem;
// //     color: var(--slate-500);
// //   }

// //   form {
// //     margin-top: 12px;
// //     display: grid;
// //     gap: 10px;
// //   }

// //   .label {
// //     font-size: 0.9rem;
// //     font-weight: 600;
// //     color: var(--slate-700);
// //   }

// //   .input-wrap {
// //     position: relative;
// //     border: 1px solid var(--slate-300);
// //     border-radius: 12px;
// //     background: var(--white);
// //     transition: border-color 150ms ease, box-shadow 150ms ease;
// //   }
// //   .input-wrap:focus-within {
// //     border-color: var(--green-600);
// //     box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
// //   }
// //   .input-wrap.has-error {
// //     border-color: var(--error);
// //     box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.08);
// //   }

// //   .input-wrap input {
// //     width: 100%;
// //     border: none;
// //     outline: none;
// //     background: transparent;
// //     padding: 12px 14px;
// //     font-size: 0.975rem;
// //     color: var(--slate-700);
// //   }

// //   .input-wrap.with-addon {
// //     display: grid;
// //     grid-template-columns: 1fr auto;
// //     align-items: center;
// //   }
// //   .input-wrap.with-addon input {
// //     padding-right: 72px;
// //   }
// //   .addon {
// //     margin-right: 6px;
// //     border: none;
// //     background: var(--green-50);
// //     color: var(--green-700);
// //     padding: 8px 12px;
// //     border-radius: 10px;
// //     font-weight: 600;
// //     cursor: pointer;
// //     transition: background 150ms ease, transform 80ms ease;
// //   }
// //   .addon:hover { background: var(--green-100); }
// //   .addon:active { transform: translateY(1px); }

// //   .error {
// //     color: var(--error);
// //     font-size: 0.85rem;
// //     margin-top: -4px;
// //     margin-bottom: 4px;
// //   }

// //   .row {
// //     margin-top: 6px;
// //     display: flex;
// //     align-items: center;
// //     justify-content: space-between;
// //   }

// //   .checkbox {
// //     display: inline-flex;
// //     align-items: center;
// //     gap: 8px;
// //     user-select: none;
// //     cursor: pointer;
// //     font-size: 0.95rem;
// //   }
// //   .checkbox input {
// //     width: 16px;
// //     height: 16px;
// //     accent-color: var(--green-600);
// //   }

// //   .link {
// //     color: var(--green-700);
// //     text-decoration: none;
// //     font-weight: 600;
// //   }
// //   .link:hover {
// //     text-decoration: underline;
// //   }

// //   .btn {
// //     margin-top: 10px;
// //     width: 100%;
// //     background: linear-gradient(135deg, var(--green-600), var(--green-700));
// //     color: var(--white);
// //     border: none;
// //     padding: 12px 16px;
// //     border-radius: 12px;
// //     font-weight: 700;
// //     font-size: 1rem;
// //     cursor: pointer;
// //     box-shadow: 0 8px 18px rgba(21, 128, 61, 0.25);
// //     display: inline-flex;
// //     align-items: center;
// //     justify-content: center;
// //     gap: 10px;
// //     transition: transform 80ms ease, filter 150ms ease, box-shadow 150ms ease;
// //   }
// //   .btn:hover { filter: brightness(1.05); }
// //   .btn:active { transform: translateY(1px); }
// //   .btn:disabled {
// //     opacity: 0.7;
// //     cursor: not-allowed;
// //     filter: none;
// //     box-shadow: none;
// //   }

// //   .spinner {
// //     width: 16px;
// //     height: 16px;
// //     border: 2.5px solid rgba(255,255,255,0.55);
// //     border-top-color: #fff;
// //     border-radius: 50%;
// //     animation: spin 0.9s linear infinite;
// //   }
// //   @keyframes spin { to { transform: rotate(360deg); } }

// //   .footnote {
// //     margin: 14px 0 0;
// //     font-size: 0.95rem;
// //     color: var(--slate-500);
// //     text-align: center;
// //   }

// //   .attribution {
// //     margin-top: 18px;
// //     text-align: center;
// //     color: var(--green-900);
// //     font-size: 0.85rem;
// //     opacity: 0.9;
// //   }

// //   /* Saved Session panel */
// //   .debug-card {
// //     margin-top: 16px;
// //     border: 1px solid var(--green-100);
// //     background: var(--green-50);
// //     border-radius: 12px;
// //     padding: 12px;
// //   }
// //   .debug-header {
// //     display: flex;
// //     align-items: center;
// //     justify-content: space-between;
// //     gap: 8px;
// //     margin-bottom: 8px;
// //     color: var(--green-700);
// //   }
// //   .debug-actions {
// //     display: inline-flex;
// //     gap: 8px;
// //   }
// //   .chip {
// //     border: 1px solid var(--green-200);
// //     background: #fff;
// //     color: var(--green-700);
// //     padding: 6px 10px;
// //     border-radius: 999px;
// //     font-weight: 600;
// //     cursor: pointer;
// //   }
// //   .chip:hover { background: var(--green-100); }
// //   .chip.danger {
// //     border-color: #fecaca;
// //     color: #991b1b;
// //   }
// //   .chip.danger:hover {
// //     background: #fee2e2;
// //   }
// //   .debug-pre {
// //     margin: 0;
// //     padding: 10px;
// //     background: #ffffff;
// //     border: 1px dashed var(--green-200);
// //     border-radius: 8px;
// //     font-size: 12.5px;
// //     line-height: 1.45;
// //     overflow-x: auto;
// //   }
// //   .debug-hint {
// //     margin: 8px 0 0;
// //     font-size: 0.85rem;
// //     color: var(--slate-500);
// //   }

// //   @media (max-width: 420px) {
// //     .card { padding: 22px; }
// //     .brand-text .title { font-size: 1.25rem; }
// //   }
// // `;









// import React, { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { userLogin } from "../services/BackendAPIs";
// import { useSnackbar } from "notistack";
// import { useStore } from "../services/state";

// /* ------------------------------------------------------------------ */
// /*                   LocalStorage / SessionStorage helpers             */
// /* ------------------------------------------------------------------ */

// export const AUTH_KEY = "app.auth";

// /** Get saved auth object safely from storage (session first if present) */
// export function getStoredAuth() {
//   try {
//     const rawSession = sessionStorage.getItem(AUTH_KEY);
//     const rawLocal = localStorage.getItem(AUTH_KEY);
//     const raw = rawSession ?? rawLocal;
//     if (!raw) return null;
//     return JSON.parse(raw);
//   } catch {
//     return null;
//   }
// }

// /** Save auth to storage, honoring `remember` */
// export function saveStoredAuth(auth) {
//   try {
//     const serialized = JSON.stringify(auth);
//     if (auth?.remember) {
//       localStorage.setItem(AUTH_KEY, serialized);
//       sessionStorage.removeItem(AUTH_KEY);
//     } else {
//       sessionStorage.setItem(AUTH_KEY, serialized);
//       localStorage.removeItem(AUTH_KEY);
//     }
//     return true;
//   } catch {
//     return false;
//   }
// }

// /** Clear saved auth from both storages */
// export function clearStoredAuth() {
//   try {
//     localStorage.removeItem(AUTH_KEY);
//     sessionStorage.removeItem(AUTH_KEY);
//     return true;
//   } catch {
//     return false;
//   }
// }

// /* ------------------------------------------------------------------ */
// /*                              Component                              */
// /* ------------------------------------------------------------------ */

// export default function Login() {
//   const [userNameOrEmail, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPwd, setShowPwd] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   // Local view of what's currently in storage
//   const [savedAuth, setSavedAuth] = useState(() => getStoredAuth());

//   const navigate = useNavigate();
//   const { enqueueSnackbar } = useSnackbar();

//   // Pull actions/selectors from your Zustand store
//   const login = useStore((state) => state.login);
//   const logout = useStore((state) => state.logout); // optional, if you have it

//   // Simple inline alert
//   const [alert, setAlert] = useState({
//     type: "info", // "success" | "error" | "warning" | "info"
//     message: "",
//     show: false,
//   });

//   const showAlert = (type, message) => {
//     setAlert({ type, message, show: true });
//     setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 4000);
//   };

//   const AlertBanner = () =>
//     !alert.show ? null : (
//       <>
//         <div
//           style={{
//             position: "fixed",
//             top: 16,
//             right: 16,
//             zIndex: 1000,
//             display: "flex",
//             gap: 10,
//             alignItems: "center",
//             borderRadius: 10,
//             padding: "10px 14px",
//             border: "1px solid",
//             boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//             background:
//               alert.type === "success"
//                 ? "#b7fbcb"
//                 : alert.type === "error"
//                 ? "#fef2f2"
//                 : alert.type === "warning"
//                 ? "#fffbeb"
//                 : "#eff6ff",
//             color:
//               alert.type === "success"
//                 ? "#166534"
//                 : alert.type === "error"
//                 ? "#991b1b"
//                 : alert.type === "warning"
//                 ? "#92400e"
//                 : "#1e3a8a",
//             borderColor:
//               alert.type === "success"
//                 ? "#bbf7d0"
//                 : alert.type === "error"
//                 ? "#fecaca"
//                 : alert.type === "warning"
//                 ? "#fde68a"
//                 : "#bfdbfe",
//             transition: "all 200ms ease",
//           }}
//           role="status"
//           aria-live="polite"
//         >
//           <strong style={{ textTransform: "capitalize" }}>{alert.type}</strong>
//           <span>{alert.message}</span>
//           <button
//             onClick={() => setAlert((p) => ({ ...p, show: false }))}
//             style={{
//               marginLeft: 8,
//               border: "none",
//               background: "transparent",
//               cursor: "pointer",
//               fontSize: 16,
//               lineHeight: 1,
//             }}
//             aria-label="Close alert"
//           >
//             ×
//           </button>
//         </div>
//       </>
//     );

//   const validate = () => {
//     const e = {};
//     if (!userNameOrEmail) {
//       e.email = "Email/Username is required.";
//     }
//     if (!password) {
//       e.password = "Password is required.";
//     } else if (password.length < 6) {
//       e.password = "Password must be at least 6 characters.";
//     }
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // -------- Hydrate from storage on mount + cross-tab sync --------
//   useEffect(() => {
//     const auth = getStoredAuth();
//     setSavedAuth(auth || null);

//     if (auth?.username) {
//       // Prefill username if present
//       setEmail(auth.username);
//     }

//     if (auth?.isLoggedIn) {
//       // Sync with global store and navigate home
//       login(auth.username);
//       navigate("/", { replace: true });
//     }

//     // Cross-tab synchronization
//     const onStorage = (e) => {
//       if (e.key !== AUTH_KEY) return;
//       const next = getStoredAuth();
//       setSavedAuth(next);
//       if (next?.isLoggedIn) {
//         login(next.username);
//       } else {
//         // If cleared elsewhere, reflect here
//         logout?.();
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onSubmit = async (ev) => {
//     ev.preventDefault();
//     if (!validate()) return;

//     setSubmitting(true);

//     try {
//       /**
//        * Assumptions about `userLogin` return shape:
//        * It might return: { user: { id, username, email }, token, ... }
//        * or { data: { userId, username } } etc.
//        * We defensively derive the needed fields and fall back sensibly.
//        */
//       const res = await userLogin(userNameOrEmail, password);

//       // Derive a username
//       const derivedUsername =
//         res?.user?.username ??
//         res?.data?.username ??
//         res?.username ??
//         userNameOrEmail;

//       // Derive a userId (fallback to random UUID if not provided)
//       const derivedUserId =
//         res?.user?.id ??
//         res?.data?.userId ??
//         res?.userId ??
//         (window.crypto?.randomUUID?.() || String(Date.now()));

//       // Build the object we will persist (DO NOT store password)
//       const auth = {
//         username: derivedUsername,
//         userId: String(derivedUserId),
//         isLoggedIn: true,
//         remember: !!remember,
//         loggedInAt: new Date().toISOString(),
//       };

//       // Persist to storage
//       const ok = saveStoredAuth(auth);
//       if (!ok) {
//         enqueueSnackbar("Could not save session locally.", { variant: "warning" });
//       } else {
//         setSavedAuth(auth); // update local view
//       }

//       enqueueSnackbar("Logged in successfully!", { variant: "success" });
//       // Sync with your global store (Zustand, etc.)
//       login(derivedUsername);
//       // Navigate to home (or wherever)
//       navigate("/");
//     } catch (err) {
//       enqueueSnackbar("Invalid Email and Password", { variant: "error" });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReloadSaved = () => {
//     const data = getStoredAuth();
//     setSavedAuth(data);
//     if (data) {
//       showAlert("info", "Loaded saved session from storage.");
//     } else {
//       showAlert("warning", "No saved session found in storage.");
//     }
//   };

//   const handleClearSaved = () => {
//     const ok = clearStoredAuth();
//     if (ok) {
//       setSavedAuth(null);
//       showAlert("success", "Cleared saved session.");
//     } else {
//       showAlert("error", "Unable to clear storage.");
//     }
//   };

//   const prettySaved = useMemo(() => {
//     if (!savedAuth) return "null";
//     try {
//       return JSON.stringify(savedAuth, null, 2);
//     } catch {
//       return "Invalid data";
//     }
//   }, [savedAuth]);

//   return (
//     <div style={styles.page}>
//       {/* (You asked to skip the CSS variables; keeping a minimal style only) */}

//       {/* Alert */}
//       <AlertBanner />

//       <div className="card" style={inline.card}>
//         <div className="brand" style={inline.brand}>
//           <div className="logo" aria-hidden="true" style={inline.logo}>
//             ✓
//           </div>
//           <div className="brand-text">
//             <h1 className="title" style={inline.title}>
//               Welcome Back
//             </h1>
//             <p className="subtitle" style={inline.subtitle}>
//               Sign in to continue
//             </p>
//           </div>
//         </div>

//         <form onSubmit={onSubmit} noValidate style={inline.form}>
//           {/* Email / Username */}
//           <label htmlFor="email" className="label" style={inline.label}>
//             Username or Email
//           </label>
//           <div
//             className={`input-wrap ${errors.email ? "has-error" : ""}`}
//             style={{
//               ...inline.inputWrap,
//               ...(errors.email ? inline.inputWrapError : {}),
//             }}
//           >
//             <input
//               id="email"
//               name="email"
//               type="text"
//               placeholder="you@example.com or username"
//               autoComplete="username"
//               value={userNameOrEmail}
//               onChange={(e) => setEmail(e.target.value)}
//               aria-invalid={!!errors.email}
//               aria-describedby={errors.email ? "email-error" : undefined}
//               style={inline.input}
//             />
//           </div>
//           {errors.email && (
//             <div id="email-error" className="error" style={inline.error}>
//               {errors.email}
//             </div>
//           )}

//           {/* Password */}
//           <label htmlFor="password" className="label" style={inline.label}>
//             Password
//           </label>
//           <div
//             className={`input-wrap with-addon ${
//               errors.password ? "has-error" : ""
//             }`}
//             style={{
//               ...inline.inputWrap,
//               display: "grid",
//               gridTemplateColumns: "1fr auto",
//               alignItems: "center",
//               ...(errors.password ? inline.inputWrapError : {}),
//             }}
//           >
//             <input
//               id="password"
//               name="password"
//               type={showPwd ? "text" : "password"}
//               placeholder="••••••••"
//               autoComplete="current-password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               aria-invalid={!!errors.password}
//               aria-describedby={errors.password ? "password-error" : undefined}
//               style={{ ...inline.input, paddingRight: 72 }}
//             />
//             <button
//               type="button"
//               className="addon"
//               onClick={() => setShowPwd(!showPwd)}
//               aria-label={showPwd ? "Hide password" : "Show password"}
//               style={inline.addon}
//             >
//               {showPwd ? "Hide" : "Show"}
//             </button>
//           </div>
//           {errors.password && (
//             <div id="password-error" className="error" style={inline.error}>
//               {errors.password}
//             </div>
//           )}

//           {/* Options */}
//           <div className="row" style={inline.row}>
//             <label className="checkbox" style={inline.checkbox}>
//               <input
//                 type="checkbox"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//                 style={inline.checkboxInput}
//               />
//               <span>Remember me</span>
//             </label>

//             <a
//               className="link"
//               href="#forgot"
//               onClick={(e) => e.preventDefault()}
//               style={inline.link}
//             >
//               Forgot password?
//             </a>
//           </div>

//           {/* Submit */}
//           <button className="btn" type="submit" disabled={submitting} style={inline.btn}>
//             {submitting ? <span className="spinner" aria-hidden="true" /> : null}
//             {submitting ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         {/* Saved session debug panel (optional) */}
//         <div className="debug-card" style={inline.debugCard}>
//           <div className="debug-header" style={inline.debugHeader}>
//             <strong>Saved Session</strong>
//             <div className="debug-actions" style={inline.debugActions}>
//               <button className="chip" onClick={handleReloadSaved} style={inline.chip}>
//                 Reload
//               </button>
//               <button className="chip danger" onClick={handleClearSaved} style={inline.chipDanger}>
//                 Clear
//               </button> 
//             </div>
//           </div>
//           <pre className="debug-pre" style={inline.debugPre}>
// {prettySaved}
//           </pre>
//           <div className="debug-hint" style={inline.debugHint}>
//             Storage honors “Remember me”: sessionStorage (unchecked) or localStorage (checked).
//           </div>
//         </div>

//         <p className="footnote" style={inline.footnote}>
//           Don’t have an account?{" "}
//           <Link className="link" to="/register" style={inline.link}>
//             Create One
//           </Link>
//         </p>
//       </div>

//       <footer className="attribution" style={inline.attribution}>
//         <span>Green &amp; White theme • React Single File</span>
//       </footer>
//     </div>
//   );
// }

// /* ---------- Minimal Inline Styles (no CSS variables) ---------- */
// const styles = {
//   page: {
//     minHeight: "100svh",
//     display: "grid",
//     placeItems: "center",
//     background:
//       "linear-gradient(135deg, #f6fff7 0%, #f0fff4 30%, #ecfdf5 60%, #ffffff 100%)",
//     padding: "24px",
//   },
// };

// const inline = {
//   card: {
//     width: "100%",
//     maxWidth: 420,
//     background: "#fff",
//     border: "1px solid #dcfce7",
//     borderRadius: 20,
//     boxShadow: "0 10px 30px rgba(22,163,74,0.15)",
//     padding: 28,
//   },
//   brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
//   logo: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     background: "linear-gradient(135deg, #16a34a, #15803d)",
//     color: "#fff",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 800,
//     boxShadow: "0 6px 16px rgba(21,128,61,0.25)",
//   },
//   title: { margin: 0, fontSize: "1.4rem", color: "#15803d", letterSpacing: "-0.02em" },
//   subtitle: { margin: "2px 0 0", fontSize: "0.95rem", color: "#64748b" },
//   form: { marginTop: 12, display: "grid", gap: 10 },
//   label: { fontSize: "0.9rem", fontWeight: 600, color: "#334155" },
//   inputWrap: {
//     position: "relative",
//     border: "1px solid #cbd5e1",
//     borderRadius: 12,
//     background: "#fff",
//     transition: "border-color 150ms ease, box-shadow 150ms ease",
//   },
//   inputWrapError: {
//     borderColor: "#dc2626",
//     boxShadow: "0 0 0 4px rgba(220,38,38,0.08)",
//   },
//   input: {
//     width: "100%",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     padding: "12px 14px",
//     fontSize: "0.975rem",
//     color: "#334155",
//   },
//   addon: {
//     marginRight: 6,
//     border: "none",
//     background: "#f0fdf4",
//     color: "#15803d",
//     padding: "8px 12px",
//     borderRadius: 10,
//     fontWeight: 600,
//     cursor: "pointer",
//   },
//   error: { color: "#dc2626", fontSize: "0.85rem", marginTop: -4, marginBottom: 4 },
//   row: { marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between" },
//   checkbox: { display: "inline-flex", alignItems: "center", gap: 8, userSelect: "none", cursor: "pointer", fontSize: "0.95rem" },
//   checkboxInput: { width: 16, height: 16, accentColor: "#16a34a" },
//   link: { color: "#15803d", textDecoration: "none", fontWeight: 600 },
//   btn: {
//     marginTop: 10,
//     width: "100%",
//     background: "linear-gradient(135deg, #16a34a, #15803d)",
//     color: "#fff",
//     border: "none",
//     padding: "12px 16px",
//     borderRadius: 12,
//     fontWeight: 700,
//     fontSize: "1rem",
//     cursor: "pointer",
//     boxShadow: "0 8px 18px rgba(21,128,61,0.25)",
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//   },
//   footnote: { margin: "14px 0 0", fontSize: "0.95rem", color: "#64748b", textAlign: "center" },
//   attribution: { marginTop: 18, textAlign: "center", color: "#14532d", fontSize: "0.85rem", opacity: 0.9 },

//   // Debug panel
//   debugCard: {
//     marginTop: 16,
//     border: "1px solid #dcfce7",
//     background: "#f0fdf4",
//     borderRadius: 12,
//     padding: 12,
//   },
//   debugHeader: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 8,
//     marginBottom: 8,
//     color: "#15803d",
//   },
//   debugActions: { display: "inline-flex", gap: 8 },
//   chip: {
//     border: "1px solid #bbf7d0",
//     background: "#fff",
//     color: "#15803d",
//     padding: "6px 10px",
//     borderRadius: 999,
//     fontWeight: 600,
//     cursor: "pointer",
//   },
//   chipDanger: {
//     border: "1px solid #fecaca",
//     background: "#fff",
//     color: "#991b1b",
//     padding: "6px 10px",
//     borderRadius: 999,
//     fontWeight: 600,
//     cursor: "pointer",
//   },
//   debugPre: {
//     margin: 0,
//     padding: 10,
//     background: "#ffffff",
//     border: "1px dashed #bbf7d0",
//     borderRadius: 8,
//     fontSize: 12.5,
//     lineHeight: 1.45,
//     overflowX: "auto",
//     whiteSpace: "pre-wrap",
//   },
//   debugHint: { margin: "8px 0 0", fontSize: "0.85rem", color: "#64748b" },
// };  





import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userLogin } from "../services/BackendAPIs";
import { useSnackbar } from "notistack";

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

      // Derive a username
      const derivedUsername =
        res?.user?.username ??
        res?.data?.username ??
        res?.username ??
        userNameOrEmail;

      // Derive a userId (fallback to random UUID if not provided)
      const derivedUserId =
        res?.user?.id ??
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

      // Persist to storage
      const ok = saveStoredAuth(auth);
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