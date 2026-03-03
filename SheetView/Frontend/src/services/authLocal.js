
// // export function getStoredAuth() {
// //   try {
// //     const raw = localStorage.getItem(AUTH_KEY);
// //     return raw ? JSON.parse(raw) : null;
// //   } catch {
// //     return null;
// //   }
// // }

// // export function clearStoredAuth() {
// //   try {
// //     localStorage.removeItem(AUTH_KEY);
// //     return true;
// //   } catch {
// //     return false;
// //   }
// // }



// // src/services/authLocal.js
// export const AUTH_KEY = "app.auth";
// // export const AUTH_KEY = "app.auth";

// export function getStoredAuth() {
//   try {
//     const raw = localStorage.getItem(AUTH_KEY);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

// export function saveStoredAuth(auth) {
//   try {
//     localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
//     // Make same-tab listeners (like NavBar) update immediately
//     window.dispatchEvent(new Event("auth-changed"));
//     return true;
//   } catch {
//     return false;
//   }
// }

// export function clearStoredAuth() {
//   try {
//     localStorage.removeItem(AUTH_KEY);
//     // Make same-tab listeners update immediately
//     window.dispatchEvent(new Event("auth-changed"));
//     return true;
//   } catch {
//     return false;
//   }
// }





export const AUTH_KEY = "app.auth";

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