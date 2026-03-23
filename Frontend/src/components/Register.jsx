import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { userRegistration } from "../services/BackendAPIs";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const pwdScore = useMemo(() => scorePassword(pwd), [pwd]);
  const pwdStrength = useMemo(() => toStrength(pwdScore), [pwdScore]);
  const { enqueueSnackbar } = useSnackbar();



  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address.";
    if (!pwd) e.pwd = "Password is required.";
    else if (pwd.length < 8) e.pwd = "Password must be at least 8 characters.";
    if (!confirmPwd) e.confirmPwd = "Please confirm your password.";
    else if (pwd !== confirmPwd) e.confirmPwd = "Passwords do not match.";
    if (!agree) e.agree = "You must accept the Terms to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = {
  username: fullName,
  email: email,
  password: pwd,
  profilePic: profilePic,  // { base64, contentType }
};

userRegistration(data).then((res) => {
        enqueueSnackbar("Registration Successfull!", { variant: "success" });
        navigate("/login");
      }).catch((err) => {
        enqueueSnackbar("Registration Failed!", { variant: "error" });
      });
      setFullName("");
      setEmail("");
      setPwd("");
      setConfirmPwd("");
      setAgree(false);
      setErrors({});
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div className="card">
        <div className="brand">
          <div className="logo" aria-hidden="true">★</div>
          <div className="brand-text">
            <h1 className="title">Create your account</h1>
            <p className="subtitle">Join us in a minute</p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate>

          {/* Profile Picture */}
          <label className="label">Profile Picture</label>

          <div className="profile-upload">
            <div className="avatar">
              {profilePreview ? (
                <img src={profilePreview} alt="Preview" />
              ) : (
                <span className="avatar-placeholder">+</span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              id="profilePic"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfilePreview(reader.result);

                  setProfilePic({
                    base64: reader.result.split(",")[1],   // strips prefix
                    contentType: file.type,
                  });
                };

                reader.readAsDataURL(file);
              }}
            />

            <button
              type="button"
              className="btn-upload"
              onClick={() => document.getElementById("profilePic").click()}
            >
              Upload Image
            </button>
          </div>





          {/* Full Name */}
          <label htmlFor="fullName" className="label">Full name</label>
          <div className={`input-wrap ${errors.fullName ? "has-error" : ""}`}>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Aaditya Thakare"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "name-error" : undefined}
            />
          </div>
          {errors.fullName && (
            <div id="name-error" className="error">{errors.fullName}</div>
          )}

          {/* Email */}
          <label htmlFor="email" className="label">Email</label>
          <div className={`input-wrap ${errors.email ? "has-error" : ""}`}>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <div id="email-error" className="error">{errors.email}</div>
          )}

          {/* Password */}
          <label htmlFor="password" className="label">Password</label>
          <div className={`input-wrap with-addon ${errors.pwd ? "has-error" : ""}`}>
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              aria-invalid={!!errors.pwd}
              aria-describedby={errors.pwd ? "pwd-error" : "pwd-hint"}
            />
            <button
              type="button"
              className="addon"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {errors.pwd ? (
            <div id="pwd-error" className="error">{errors.pwd}</div>
          ) : (
            <div id="pwd-hint" className="hint">
              Use at least 8 characters with a mix of letters, numbers & symbols.
            </div>
          )}

          {/* Strength meter */}
          <div className="strength">
            <div className={`bar ${pwdStrength.className}`} style={{ width: `${pwdStrength.percent}%` }} />
            <span className={`strength-text ${pwdStrength.className}`}>
              {pwd ? pwdStrength.label : "Strength"}
            </span>
          </div>

          {/* Confirm Password */}
          <label htmlFor="confirmPwd" className="label">Confirm password</label>
          <div className={`input-wrap with-addon ${errors.confirmPwd ? "has-error" : ""}`}>
            <input
              id="confirmPwd"
              name="confirmPwd"
              type={showConfirmPwd ? "text" : "password"}
              placeholder="Re-enter password"
              autoComplete="new-password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              aria-invalid={!!errors.confirmPwd}
              aria-describedby={errors.confirmPwd ? "confirm-error" : undefined}
            />
            <button
              type="button"
              className="addon"
              onClick={() => setShowConfirmPwd((s) => !s)}
              aria-label={showConfirmPwd ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPwd ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPwd && (
            <div id="confirm-error" className="error">{errors.confirmPwd}</div>
          )}

          {/* Terms */}
          <div className="row terms">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <a
                  href="#terms"
                  className="link"
                  onClick={(e) => e.preventDefault()}
                >
                  Terms & Privacy
                </a>
              </span>
            </label>
          </div>
          {errors.agree && <div className="error">{errors.agree}</div>}

          {/* Submit */}
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? <span className="spinner" aria-hidden="true" /> : null}
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="footnote">
          Already have an account?{" "}

          <Link className="link" to={"/login"}>Sign in</Link>
        </p>
      </div>

      <footer className="attribution">
        <span>Green & White theme • React Single File</span>
      </footer>
    </div>
  );
}

/* ---------------- Password utils ---------------- */
function scorePassword(pwd) {
  if (!pwd) return 0;
  let score = 0;

  // length points
  score += Math.min(10, pwd.length) * 5; // up to 50

  // variety points
  const sets = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ].filter(Boolean).length;
  score += (sets - 1) * 15; // 0–45

  // bonus for no common patterns
  if (!/(1234|password|qwerty|letmein)/i.test(pwd)) score += 10;

  return Math.max(0, Math.min(100, score));
}

function toStrength(score) {
  if (score >= 80) return { label: "Strong", percent: score, className: "strong" };
  if (score >= 55) return { label: "Good", percent: score, className: "good" };
  if (score >= 30) return { label: "Weak", percent: score, className: "weak" };
  return { label: "Very weak", percent: score, className: "very-weak" };
}

/* ---------------- Inline Styles ---------------- */
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

/* ---------------- Theme & Component CSS ---------------- */
const css = `
  :root {
    --green-600: #16a34a; /* primary */
    --green-700: #15803d;
    --green-50:  #f0fdf4;
    --green-100: #dcfce7;
    --green-200: #bbf7d0;
    --green-900: #14532d;
    --slate-700: #334155;
    --slate-500: #64748b;
    --slate-300: #cbd5e1;
    --white: #ffffff;
    --error: #dc2626;
    --shadow: 0 10px 30px rgba(22, 163, 74, 0.15);
    --radius-2xl: 20px;
  }

  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: var(--slate-700); }

  .card {
    width: 100%;
    max-width: 480px;
    background: var(--white);
    border: 1px solid var(--green-100);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow);
    padding: 28px;
    animation: pop 320ms ease-out both;
  }

  @keyframes pop {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--green-600), var(--green-700));
    color: var(--white);
    display: grid;
    place-items: center;
    font-weight: 800;
    box-shadow: 0 6px 16px rgba(21, 128, 61, 0.25);
  }

  .brand-text .title {
    margin: 0;
    font-size: 1.4rem;
    color: var(--green-700);
    letter-spacing: -0.02em;
  }
  .brand-text .subtitle {
    margin: 2px 0 0;
    font-size: 0.95rem;
    color: var(--slate-500);
  }

  form {
    margin-top: 12px;
    display: grid;
    gap: 10px;
  }

  .label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--slate-700);
  }

  .input-wrap {
    position: relative;
    border: 1px solid var(--slate-300);
    border-radius: 12px;
    background: var(--white);
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }
  .input-wrap:focus-within {
    border-color: var(--green-600);
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
  }
  .input-wrap.has-error {
    border-color: var(--error);
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.08);
  }

  .input-wrap input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 12px 14px;
    font-size: 0.975rem;
    color: var(--slate-700);
  }

  .input-wrap.with-addon {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
  }
  .input-wrap.with-addon input {
    padding-right: 72px;
  }
  .addon {
    margin-right: 6px;
    border: none;
    background: var(--green-50);
    color: var(--green-700);
    padding: 8px 12px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: background 150ms ease, transform 80ms ease;
  }
  .addon:hover { background: var(--green-100); }
  .addon:active { transform: translateY(1px); }

  .hint {
    font-size: 0.85rem;
    color: var(--slate-500);
    margin-top: -4px;
    margin-bottom: 4px;
  }

  .error {
    color: var(--error);
    font-size: 0.85rem;
    margin-top: -4px;
    margin-bottom: 4px;
  }

  .row {
    margin-top: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .terms { margin-top: 2px; }

  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    user-select: none;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .checkbox input {
    width: 16px;
    height: 16px;
    accent-color: var(--green-600);
  }

  .link {
    color: var(--green-700);
    text-decoration: none;
    font-weight: 600;
  }
  .link:hover {
    text-decoration: underline;
  }

  .strength {
    position: relative;
    height: 8px;
    background: var(--green-50);
    border: 1px solid var(--green-100);
    border-radius: 999px;
    overflow: hidden;
    margin: 4px 0 8px;
  }
  .strength .bar {
    height: 100%;
    transition: width 220ms ease;
    background: var(--green-200);
  }
  .strength .bar.very-weak { background: #fecaca; } /* red-200 */
  .strength .bar.weak { background: #fde68a; }      /* amber-200 */
  .strength .bar.good { background: #bbf7d0; }      /* green-200 */
  .strength .bar.strong { background: #86efac; }    /* green-300 */

  .strength-text {
    display: inline-block;
    margin-top: 4px;
    font-size: 0.85rem;
    color: var(--slate-500);
  }
  .strength-text.very-weak { color: #b91c1c; }
  .strength-text.weak { color: #b45309; }
  .strength-text.good { color: #166534; }
  .strength-text.strong { color: #065f46; }

  .btn {
    margin-top: 10px;
    width: 100%;
    background: linear-gradient(135deg, var(--green-600), var(--green-700));
    color: var(--white);
    border: none;
    padding: 12px 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(21, 128, 61, 0.25);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform 80ms ease, filter 150ms ease, box-shadow 150ms ease;
  }
  .btn:hover { filter: brightness(1.05); }
  .btn:active { transform: translateY(1px); }
  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    filter: none;
    box-shadow: none;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2.5px solid rgba(255,255,255,0.55);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .footnote {
    margin: 14px 0 0;
    font-size: 0.95rem;
    color: var(--slate-500);
    text-align: center;
  }

  .attribution {
    margin-top: 18px;
    text-align: center;
    color: var(--green-900);
    font-size: 0.85rem;
    opacity: 0.9;
  }

  @media (max-width: 480px) {
    .card { padding: 22px; }
    .brand-text .title { font-size: 1.25rem; }
  }
`;