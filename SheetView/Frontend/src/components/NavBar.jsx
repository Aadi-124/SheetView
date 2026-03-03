


// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// // import { getStoredAuth, clearStoredAuth } from "../services/authLocal";





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


// export default function NavBar() {
//   const [open, setOpen] = useState(false);
//   const [auth, setAuth] = useState(() => getStoredAuth());
//   const navigate = useNavigate();

//   const [AUTH,setAUTH] = useState();

//   // Hydrate once on mount
//   useEffect(() => {
//       const auth = getStoredAuth();
//         setAuth(auth || null);
//         console.log("ASDASD");
//         console.log(auth);
//         if (auth?.username) {
//         console.log(auth?.username);
//         }
    
//         if (auth?.isLoggedIn) {
//             console.log(auth?.isLoggedIn);
//         }
    
//         // Cross-tab synchronization: update local state when storage changes
//         const onStorage = (e) => {
//           if (e.key !== AUTH_KEY) return;
//           const next = getStoredAuth();
//           setSavedAuth(next);
//         };
//         window.addEventListener("storage", onStorage);
//         return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // Keep in sync across tabs AND same tab (with custom event)
//   useEffect(() => {
//     const syncAuth = () => setAuth(getStoredAuth() ?? null);

//     window.addEventListener("storage", syncAuth);       // other tabs
//     window.addEventListener("auth-changed", syncAuth);  // same tab (custom)

//     return () => {
//       window.removeEventListener("storage", syncAuth);
//       window.removeEventListener("auth-changed", syncAuth);
//     };
//   }, []);

//   const isLoggedIn = Boolean(auth?.isLoggedIn);
//   const username = auth?.username;

//   const handleLogout = () => {
//     console.log(auth?.isLoggedIn);
//     const ok = clearStoredAuth();
//     console.log(ok);
//    if (ok) {

//     setAuth(null);
//     console.log("Logged OUT!");
//     } else {
//       console.log("ERRRIRIRIRI!");
//     }
//     setOpen(false);

//     // Let same-tab listeners update immediately
//     window.dispatchEvent(new Event("auth-changed"));

//     // Force navigation to login
//     navigate("/login", { replace: true });
//   };

//   return (
//     <>
//       <style>{css}</style>

//       <nav className="nav">
//         <div className="nav-container">

//           {/* Logo */}
//           <div className="nav-logo">
//             <Link to="/" className="nav-brand">
//               <span className="brand-icon">✓</span> SheetView
//             </Link>
//           </div>

//           {/* Desktop Links */}
//           <ul className="nav-links">
//             <li><Link to="/" className="nav-link">Home</Link></li>
//             <li><Link to="/features" className="nav-link">Features</Link></li>
//             <li><Link to="/about" className="nav-link">About</Link></li>
//             <li><Link to="/contact" className="nav-link">Contact</Link></li>
//           </ul>

//           {/* Desktop Auth Section */}
//           <div className="nav-auth">
//             {/* {isLoggedIn ? (
//               <>
//                 <Link to="/profile" className="auth-btn login-btn">{username || "Profile"}</Link>
//                 <button
//                   className="auth-btn logout-btn"
//                   onClick={handleLogout}
//                   type="button"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link to="/login" className="auth-btn login-btn">Login</Link>
//                 <Link to="/register" className="auth-btn register-btn">Register</Link>
//               </>
//             )} */}
//             {!auth?.isLoggedIn && <>  <Link to="/profile" className="auth-btn login-btn">{username || "Profile"}</Link>
//                <button
//                   className="auth-btn logout-btn"
//                   onClick={handleLogout}
//                   type="button"
//                 >
//                   Logout
//                 </button></>
//             } 

//             {!auth?.isLoggedIn && <>
//                 <Link to="/login" className="">Login</Link>
//                 <Link to="/register" className="">Register</Link>
//               </> }

           
//           </div>

//           {/* Mobile Toggle */}
//           <button
//             className="nav-toggle"
//             onClick={() => setOpen(!open)}
//             type="button"
//           >
//             {open ? "✕" : "☰"}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {open && (
//           <ul className="mobile-menu">
//             <li>
//               <Link to="/" className="mobile-link" onClick={() => setOpen(false)}>
//                 Home
//               </Link>
//             </li>
//             <li>
//               <Link to="/features" className="mobile-link" onClick={() => setOpen(false)}>
//                 Features
//               </Link>
//             </li>
//             <li>
//               <Link to="/about" className="mobile-link" onClick={() => setOpen(false)}>
//                 About
//               </Link>
//             </li>
//             <li>
//               <Link to="/contact" className="mobile-link" onClick={() => setOpen(false)}>
//                 Contact
//               </Link>
//             </li>

//             {!isLoggedIn ? (
//               <>
//                 <li>
//                   <Link to="/login" className="mobile-link" onClick={() => setOpen(false)}>
//                     Login
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="/register" className="mobile-link" onClick={() => setOpen(false)}>
//                     Register
//                   </Link>
//                 </li>
//               </>
//             ) : (
//               <>
//                 <li>
//                   <Link to="/profile" className="mobile-link" onClick={() => setOpen(false)}>
//                     {username || "Profile"}
//                   </Link>
//                 </li>
//                 <li>
//                   <button
//                     className="mobile-link logout-mobile"
//                     onClick={handleLogout}
//                     type="button"
//                   >
//                     Logout
//                   </button>
//                 </li>
//               </>
//             )}
//           </ul>
//         )}
//       </nav>
//     </>
//   );
// }

// const css = `
//   :root {
//     --green-600: #16a34a;
//     --green-700: #15803d;
//     --green-50: #f0fdf4;
//     --white: #ffffff;
//     --slate-700: #334155;
//     --slate-500: #64748b;
//   }

//   .nav {
//     background: var(--white);
//     border-bottom: 1px solid #e4e4e4;
//     padding: 10px 0;
//     position: sticky;
//     top: 0;
//     z-index: 50;
//   }

//   .nav-container {
//     width: 90%;
//     max-width: 1100px;
//     margin: auto;
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//   }

//   .nav-brand {
//     text-decoration: none;
//     font-size: 1.4rem;
//     font-weight: bold;
//     color: var(--green-700);
//     display: flex;
//     align-items: center;
//     gap: 6px;
//   }

//   .brand-icon {
//     background: linear-gradient(135deg, var(--green-600), var(--green-700));
//     color: white;
//     padding: 6px 8px;
//     border-radius: 8px;
//   }

//   .nav-links {
//     list-style: none;
//     display: flex;
//     gap: 24px;
//   }

//   .nav-link {
//     text-decoration: none;
//     font-size: 1rem;
//     color: var(--slate-700);
//     font-weight: 500;
//   }

//   .nav-link:hover {
//     color: var(--green-700);
//   }

//   .nav-auth {
//     display: flex;
//     gap: 12px;
//   }

//   .auth-btn {
//     text-decoration: none;
//     padding: 8px 14px;
//     font-size: 0.9rem;
//     border-radius: 8px;
//     font-weight: 600;
//   }

//   .login-btn {
//     border: 1px solid var(--green-600);
//     color: var(--green-700);
//   }

//   .register-btn {
//     background: linear-gradient(135deg, var(--green-600), var(--green-700));
//     color: white;
//   }

//   .logout-btn {
//     border: 1px solid var(--green-600);
//     background: #fff;
//     color: var(--green-700);
//     cursor: pointer;
//   }

//   .nav-toggle {
//     display: none;
//     font-size: 1.6rem;
//     background: none;
//     border: none;
//     cursor: pointer;
//   }

//   .mobile-menu {
//     list-style: none;
//     background: var(--white);
//     padding: 16px;
//     border-bottom: 1px solid #ddd;
//     display: none;
//     flex-direction: column;
//     gap: 14px;
//   }

//   .mobile-link {
//     text-decoration: none;
//     font-size: 1.1rem;
//     font-weight: 500;
//     color: var(--slate-700);
//     background: none;
//     border: none;
//     text-align: left;
//     cursor: pointer;
//   }

//   .mobile-link:hover {
//     color: var(--green-700);
//   }

//   .logout-mobile {
//     color: #ef4444;
//   }

//   @media (max-width: 768px) {
//     .nav-links,
//     .nav-auth {
//       display: none;
//     }

//     .nav-toggle {
//       display: block;
//     }

//     .mobile-menu {
//       display: flex;
//     }
//   }
// `;





import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredAuth, clearStoredAuth, AUTH_KEY } from "../services/authLocal";
/* ------------------------------------------------------------------ */
/*                   Local auth helpers (file-local)                   */
/*   (If you already have ../services/authLocal, import from there)    */
/* ------------------------------------------------------------------ */

// const AUTH_KEY = "app.auth";

// export function getStoredAuth() {
//   try {
//     // Session first (for non-remembered logins), then Local
//     const rawSession = sessionStorage.getItem(AUTH_KEY);
//     const rawLocal = localStorage.getItem(AUTH_KEY);
//     const raw = rawSession ?? rawLocal;
//     if (!raw) return null;
//     return JSON.parse(raw);
//   } catch {
//     return null;
//   }
// }

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
//     // notify same-tab listeners (NavBar) to update immediately
//     window.dispatchEvent(new Event("auth-changed"));
//     return true;
//   } catch {
//     return false;
//   }
// }

// export function clearStoredAuth() {
//   try {
//     localStorage.removeItem(AUTH_KEY);
//     sessionStorage.removeItem(AUTH_KEY);
//     // notify same-tab listeners (NavBar) to update immediately
//     window.dispatchEvent(new Event("auth-changed"));
//     return true;
//   } catch {
//     return false;
//   }
// }

/* ------------------------------------------------------------------ */
/*                              Component                              */
/* ------------------------------------------------------------------ */

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(() => getStoredAuth());
  const navigate = useNavigate();

  // Hydrate + keep in sync across tabs and same tab
  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAuth());

    // Hydrate once
    syncAuth();

    // Other tabs (native)
    window.addEventListener("storage", (e) => {
      // Only react to our key; on some browsers "clear" can pass null key
      if (e.key && e.key !== AUTH_KEY) return;
      syncAuth();
    });

    // Same-tab (custom event from save/clear helpers)
    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      // NOTE: We cannot remove the inline storage listener above by ref,
      // so we keep storage handler simple; alternatively, define it named:
      // const onStorage = (e) => { if (!e.key || e.key === AUTH_KEY) syncAuth(); };
      // and add/remove that exact function.
    };
  }, []);

  const isLoggedIn = Boolean(auth?.isLoggedIn);
  const username = auth?.username;

  const handleLogout = () => {
    const ok = clearStoredAuth();
    if (ok) {
      setAuth(null);
      setOpen(false);
      navigate("/login", { replace: true });
    } else {
      // Optional: surface an error UI/snackbar
      console.error("Failed to clear auth from storage.");
    }
  };

  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <div className="nav-container">

          {/* Logo */}
          <div className="nav-logo">
            <Link to="/" className="nav-brand">
              <span className="brand-icon">✓</span> SheetView
            </Link>
          </div>

          {/* Desktop Links */}
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/features" className="nav-link">Features</Link></li>
            <li><Link to="/about" className="nav-link">About</Link></li>
            <li><Link to="/contact" className="nav-link">Contact</Link></li>
          </ul>

          {/* Desktop Auth Section */}
          <div className="nav-auth">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="auth-btn login-btn">
                  {username || "Profile"}
                </Link>
                <button
                  className="auth-btn logout-btn"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="auth-btn login-btn">Login</Link>
                <Link to="/register" className="auth-btn register-btn">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="nav-toggle"
            onClick={() => setOpen(!open)}
            type="button"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <ul className="mobile-menu">
            <li>
              <Link to="/" className="mobile-link" onClick={() => setOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/features" className="mobile-link" onClick={() => setOpen(false)}>
                Features
              </Link>
            </li>
            <li>
              <Link to="/about" className="mobile-link" onClick={() => setOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="mobile-link" onClick={() => setOpen(false)}>
                Contact
              </Link>
            </li>

            {!isLoggedIn ? (
              <>
                <li>
                  <Link to="/login" className="mobile-link" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="mobile-link" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/profile" className="mobile-link" onClick={() => setOpen(false)}>
                    {username || "Profile"}
                  </Link>
                </li>
                <li>
                  <button
                    className="mobile-link logout-mobile"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        )}
      </nav>
    </>
  );
}

const css = `
  :root {
    --green-600: #16a34a;
    --green-700: #15803d;
    --green-50: #f0fdf4;
    --white: #ffffff;
    --slate-700: #334155;
    --slate-500: #64748b;
  }

  .nav {
    background: var(--white);
    border-bottom: 1px solid #e4e4e4;
    padding: 10px 0;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .nav-container {
    width: 90%;
    max-width: 1100px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-brand {
    text-decoration: none;
    font-size: 1.4rem;
    font-weight: bold;
    color: var(--green-700);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .brand-icon {
    background: linear-gradient(135deg, var(--green-600), var(--green-700));
    color: white;
    padding: 6px 8px;
    border-radius: 8px;
  }

  .nav-links {
    list-style: none;
    display: flex;
    gap: 24px;
  }

  .nav-link {
    text-decoration: none;
    font-size: 1rem;
    color: var(--slate-700);
    font-weight: 500;
  }

  .nav-link:hover {
    color: var(--green-700);
  }

  .nav-auth {
    display: flex;
    gap: 12px;
  }

  .auth-btn {
    text-decoration: none;
    padding: 8px 14px;
    font-size: 0.9rem;
    border-radius: 8px;
    font-weight: 600;
  }

  .login-btn {
    border: 1px solid var(--green-600);
    color: var(--green-700);
  }

  .register-btn {
    background: linear-gradient(135deg, var(--green-600), var(--green-700));
    color: white;
  }

  .logout-btn {
    border: 1px solid var(--green-600);
    background: #fff;
    color: var(--green-700);
    cursor: pointer;
  }

  .nav-toggle {
    display: none;
    font-size: 1.6rem;
    background: none;
    border: none;
    cursor: pointer;
  }

  .mobile-menu {
    list-style: none;
    background: var(--white);
    padding: 16px;
    border-bottom: 1px solid #ddd;
    display: none;
    flex-direction: column;
    gap: 14px;
  }

  .mobile-link {
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--slate-700);
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
  }

  .mobile-link:hover {
    color: var(--green-700);
  }

  .logout-mobile {
    color: #ef4444;
  }

  @media (max-width: 768px) {
    .nav-links,
    .nav-auth {
      display: none;
    }

    .nav-toggle {
      display: block;
    }

    .mobile-menu {
      display: flex;
    }
  }
`;