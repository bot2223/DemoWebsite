import { useState } from "react";
import { Building2, Languages, Home, Key, Loader2 } from "lucide-react";

const translations = {
  en: {
    lang: "🇬🇧 EN",
    eyebrow: "Premium Real Estate",
    h1: "Find Your Dream Home Today",
    subhead: "Tell us what you're looking for — we'll match you with the perfect agent.",
    labels: {
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      intent: "I'm Looking To",
      budget: "Budget",
      area: "Area",
      timing: "Timing",
    },
    placeholders: {
      fullName: "Alexandra Müller",
      email: "alex@example.com",
      phone: "+49 30 1234567",
      area: "e.g. Berlin Mitte",
    },
    intent: { buy: "Buy", sell: "Sell" },
    budget: {
      placeholder: "Select budget range",
      options: [
        { value: "under100", label: "Under €100k" },
        { value: "100_250", label: "€100k – €250k" },
        { value: "250_500", label: "€250k – €500k" },
        { value: "500_1m", label: "€500k – €1M" },
        { value: "over1m", label: "Over €1M" },
      ],
    },
    timing: {
      placeholder: "Select timeframe",
      options: [
        { value: "asap", label: "ASAP" },
        { value: "3mo", label: "Within 3 months" },
        { value: "6mo", label: "Within 6 months" },
        { value: "browsing", label: "Just browsing" },
      ],
    },
    submit: "Get Me An Agent",
    submitting: "Submitting…",
    privacy: "Your information is private and never shared without consent.",
    toast: "Thanks! An agent will be in touch shortly.",
    toastError: "Something went wrong. Please try again.",
    errors: {
      fullName: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid phone number.",
      budget: "Please select a budget range.",
      timing: "Please select a timeframe.",
    },
  },
  de: {
    lang: "🇩🇪 DE",
    eyebrow: "Premium Immobilien",
    h1: "Finden Sie Ihr Traumhaus",
    subhead: "Sagen Sie uns, was Sie suchen — wir finden den perfekten Makler für Sie.",
    labels: {
      fullName: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefonnummer",
      intent: "Ich möchte",
      budget: "Budget",
      area: "Region",
      timing: "Zeitrahmen",
    },
    placeholders: {
      fullName: "Alexandra Müller",
      email: "alex@example.com",
      phone: "+49 30 1234567",
      area: "z. B. Berlin Mitte",
    },
    intent: { buy: "Kaufen", sell: "Verkaufen" },
    budget: {
      placeholder: "Budget wählen",
      options: [
        { value: "under100", label: "Unter €100k" },
        { value: "100_250", label: "€100k – €250k" },
        { value: "250_500", label: "€250k – €500k" },
        { value: "500_1m", label: "€500k – €1M" },
        { value: "over1m", label: "Über €1M" },
      ],
    },
    timing: {
      placeholder: "Zeitrahmen wählen",
      options: [
        { value: "asap", label: "So schnell wie möglich" },
        { value: "3mo", label: "Innerhalb von 3 Monaten" },
        { value: "6mo", label: "Innerhalb von 6 Monaten" },
        { value: "browsing", label: "Nur schauen" },
      ],
    },
    submit: "Makler finden",
    submitting: "Wird gesendet…",
    privacy: "Ihre Daten sind privat und werden niemals ohne Ihre Zustimmung weitergegeben.",
    toast: "Danke! Ein Makler wird sich in Kürze bei Ihnen melden.",
    toastError: "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
    errors: {
      fullName: "Bitte geben Sie Ihren vollständigen Namen ein.",
      email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      phone: "Bitte geben Sie eine gültige Telefonnummer ein.",
      budget: "Bitte wählen Sie ein Budget.",
      timing: "Bitte wählen Sie einen Zeitrahmen.",
    },
  },
};

const AIRTABLE_BASE_ID = "YOUR_BASE_ID";
const AIRTABLE_TABLE_NAME = "Leads";
const AIRTABLE_API_KEY = "YOUR_API_KEY";

const emptyForm = { fullName: "", email: "", phone: "", intent: "buy", budget: "", area: "", timing: "" };

function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-().+]/g, "");
  return /^\d{7,15}$/.test(cleaned);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function MaisonCo() {
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const t = translations[lang];

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t.errors.fullName;
    if (!validateEmail(form.email)) e.email = t.errors.email;
    if (!validatePhone(form.phone)) e.phone = t.errors.phone;
    if (!form.budget) e.budget = t.errors.budget;
    if (!form.timing) e.timing = t.errors.timing;
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
          body: JSON.stringify({
            fields: {
              "Full Name": form.fullName,
              "Email": form.email,
              "Phone": form.phone,
              "Intent": form.intent === "buy" ? "Buying" : "Selling",
              "Budget": form.budget,
              "Area": form.area,
              "Timing": form.timing,
              "Language": lang.toUpperCase(),
              "Submitted At": new Date().toISOString(),
            },
          }),
        }
      );
      if (!res.ok) throw new Error("Airtable error");
      showToast(t.toast, "success");
      setForm(emptyForm);
    } catch {
      showToast(t.toastError, "error");
    } finally {
      setLoading(false);
    }
  }

  function field(key, value) { setForm(p => ({ ...p, [key]: value })); }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
        :root {
          --navy: oklch(0.18 0.05 260);
          --navy-mid: oklch(0.24 0.06 260);
          --gold: oklch(0.78 0.13 75);
          --gold-dark: oklch(0.65 0.13 75);
          --off-white: oklch(0.97 0.01 80);
          --card-bg: #ffffff;
          --muted: oklch(0.52 0.02 260);
          --border: oklch(0.88 0.01 260);
          --error: #c0392b;
          --gradient-primary: linear-gradient(160deg, oklch(0.14 0.07 260) 0%, oklch(0.22 0.05 260) 100%);
          --gradient-gold: linear-gradient(135deg, oklch(0.82 0.14 80) 0%, oklch(0.72 0.15 68) 100%);
          --shadow-elegant: 0 20px 60px -12px rgba(15,23,42,0.25), 0 8px 24px -8px rgba(15,23,42,0.12);
          --shadow-soft: 0 4px 16px -4px rgba(15,23,42,0.10);
          font-family: 'Inter', sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--off-white); min-height: 100vh; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp 0.7s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-card { animation: fadeUp 0.8s 0.4s ease both; }

        header {
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background: rgba(255,255,255,0.72);
          border-bottom: 1px solid rgba(255,255,255,0.4);
          box-shadow: var(--shadow-soft);
        }
        .header-inner { max-width: 1120px; margin: 0 auto; padding: 0 2rem; height: 68px; display: flex; align-items: center; justify-content: space-between; }
        .brand { display: flex; align-items: center; gap: 10px; font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 600; color: var(--navy); text-decoration: none; letter-spacing: -0.01em; }
        .brand svg { color: var(--gold); }
        .lang-toggle { display: flex; align-items: center; gap: 4px; background: var(--navy); border-radius: 100px; padding: 4px; }
        .lang-btn { border: none; background: transparent; color: rgba(255,255,255,0.55); font-size: 0.8rem; font-weight: 500; font-family: 'Inter', sans-serif; padding: 5px 14px; border-radius: 100px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .lang-btn.active { background: var(--gold); color: var(--navy); font-weight: 600; }
        .lang-btn:hover:not(.active) { color: rgba(255,255,255,0.85); }

        .hero {
          position: relative; min-height: 60vh; min-height: max(60vh, 460px);
          display: flex; align-items: flex-end; justify-content: center;
          overflow: hidden;
        }
        .hero-img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          object-position: center 40%;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(12,20,44,0.55) 0%, rgba(12,20,44,0.8) 55%, var(--off-white) 100%);
        }
        .hero-content { position: relative; z-index: 2; text-align: center; padding: 5rem 2rem 4rem; max-width: 720px; }
        .eyebrow { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 1.1rem; }
        .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 5vw, 3.75rem); font-weight: 700; color: #fff; line-height: 1.12; letter-spacing: -0.02em; margin-bottom: 1rem; }
        .hero-sub { font-size: 1.05rem; font-weight: 300; color: rgba(255,255,255,0.75); line-height: 1.65; }

        .card-wrap { max-width: 760px; margin: -80px auto 0; position: relative; z-index: 10; padding: 0 1.25rem 5rem; }
        .card {
          background: var(--card-bg); border-radius: 20px;
          box-shadow: var(--shadow-elegant);
          padding: 2.75rem 2.5rem 2.25rem;
          border: 1px solid rgba(255,255,255,0.8);
        }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } .card { padding: 2rem 1.5rem 1.75rem; } }
        .field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1.25rem; }
        label { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
        input[type=text], input[type=email], input[type=tel], select {
          height: 48px; border: 1.5px solid var(--border); border-radius: 10px;
          padding: 0 14px; font-size: 0.95rem; font-family: 'Inter', sans-serif;
          color: var(--navy); background: #fff; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s; width: 100%;
        }
        input:focus, select:focus { border-color: var(--navy-mid); box-shadow: 0 0 0 3px rgba(30,50,100,0.09); }
        input.error, select.error { border-color: var(--error); }
        .err-msg { font-size: 0.74rem; color: var(--error); margin-top: 2px; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23667'  stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 40px; cursor: pointer; }
        select option[value=""] { color: #aaa; }

        .toggle-group { display: flex; gap: 10px; }
        .toggle-btn {
          flex: 1; height: 48px; border: 1.5px solid var(--border); border-radius: 10px;
          font-size: 0.92rem; font-weight: 500; font-family: 'Inter', sans-serif;
          background: #fff; color: var(--muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.18s;
        }
        .toggle-btn:hover { border-color: var(--navy-mid); color: var(--navy); }
        .toggle-btn.active { background: var(--navy); border-color: var(--navy); color: #fff; }
        .toggle-btn svg { width: 16px; height: 16px; }

        .submit-btn {
          width: 100%; height: 54px; border: none; border-radius: 12px;
          background: var(--gradient-gold); color: var(--navy);
          font-size: 1rem; font-weight: 700; font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em; cursor: pointer; margin-top: 0.5rem;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 18px -4px rgba(200,155,60,0.4);
        }
        .submit-btn:hover:not(:disabled) { transform: scale(1.015); box-shadow: 0 6px 24px -4px rgba(200,155,60,0.5); }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.75; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.75s linear infinite; }

        .privacy { font-size: 0.75rem; color: var(--muted); text-align: center; margin-top: 1rem; line-height: 1.5; }

        .toast {
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
          z-index: 9999; padding: 14px 22px; border-radius: 12px;
          font-size: 0.92rem; font-weight: 500; font-family: 'Inter', sans-serif;
          box-shadow: 0 8px 32px -6px rgba(15,23,42,0.28);
          animation: fadeUp 0.35s ease both;
          display: flex; align-items: center; gap: 10px; white-space: nowrap;
        }
        .toast.success { background: var(--navy); color: #fff; }
        .toast.error { background: var(--error); color: #fff; }
        .toast-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
        .toast.error .toast-dot { background: #ffaaaa; }

        .section-divider { height: 1px; background: var(--border); margin: 0.25rem 0 1.25rem; }
      `}</style>

      <header>
        <div className="header-inner">
          <a href="#" className="brand" aria-label="Maison & Co. home">
            <Building2 size={22} />
            Maison & Co.
          </a>
          <div className="lang-toggle" role="group" aria-label="Language selection">
            {["en", "de"].map(l => (
              <button key={l} className={`lang-btn${lang === l ? " active" : ""}`} onClick={() => setLang(l)} aria-pressed={lang === l}>
                {translations[l].lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-label="Hero">
          <img
            className="hero-img"
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1800&q=80"
            alt="Luxury villa at golden hour with pool terrace"
          />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow fade-up-1">{t.eyebrow}</p>
            <h1 className="fade-up-2">{t.h1}</h1>
            <p className="hero-sub fade-up-3">{t.subhead}</p>
          </div>
        </section>

        <div className="card-wrap">
          <div className="card fade-up-card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid-2">
                <div className="field-group">
                  <label htmlFor="fullName">{t.labels.fullName}</label>
                  <input id="fullName" type="text" placeholder={t.placeholders.fullName}
                    value={form.fullName} onChange={e => field("fullName", e.target.value)}
                    className={errors.fullName ? "error" : ""} autoComplete="name" />
                  {errors.fullName && <span className="err-msg" role="alert">{errors.fullName}</span>}
                </div>
                <div className="field-group">
                  <label htmlFor="email">{t.labels.email}</label>
                  <input id="email" type="email" placeholder={t.placeholders.email}
                    value={form.email} onChange={e => field("email", e.target.value)}
                    className={errors.email ? "error" : ""} autoComplete="email" />
                  {errors.email && <span className="err-msg" role="alert">{errors.email}</span>}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="phone">{t.labels.phone}</label>
                <input id="phone" type="tel" placeholder={t.placeholders.phone}
                  value={form.phone} onChange={e => field("phone", e.target.value)}
                  className={errors.phone ? "error" : ""} autoComplete="tel" />
                {errors.phone && <span className="err-msg" role="alert">{errors.phone}</span>}
              </div>

              <div className="field-group">
                <label>{t.labels.intent}</label>
                <div className="toggle-group" role="group">
                  <button type="button" className={`toggle-btn${form.intent === "buy" ? " active" : ""}`}
                    onClick={() => field("intent", "buy")} aria-pressed={form.intent === "buy"}>
                    <Home size={16} />{t.intent.buy}
                  </button>
                  <button type="button" className={`toggle-btn${form.intent === "sell" ? " active" : ""}`}
                    onClick={() => field("intent", "sell")} aria-pressed={form.intent === "sell"}>
                    <Key size={16} />{t.intent.sell}
                  </button>
                </div>
              </div>

              <div className="section-divider" />

              <div className="grid-2">
                <div className="field-group">
                  <label htmlFor="budget">{t.labels.budget} <span style={{ color: "var(--error)" }}>*</span></label>
                  <select id="budget" value={form.budget}
                    onChange={e => field("budget", e.target.value)}
                    className={errors.budget ? "error" : ""} required>
                    <option value="">{t.budget.placeholder}</option>
                    {t.budget.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.budget && <span className="err-msg" role="alert">{errors.budget}</span>}
                </div>
                <div className="field-group">
                  <label htmlFor="timing">{t.labels.timing} <span style={{ color: "var(--error)" }}>*</span></label>
                  <select id="timing" value={form.timing}
                    onChange={e => field("timing", e.target.value)}
                    className={errors.timing ? "error" : ""} required>
                    <option value="">{t.timing.placeholder}</option>
                    {t.timing.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.timing && <span className="err-msg" role="alert">{errors.timing}</span>}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="area">{t.labels.area}</label>
                <input id="area" type="text" placeholder={t.placeholders.area}
                  value={form.area} onChange={e => field("area", e.target.value)} />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <><Loader2 size={18} className="spinner" />{t.submitting}</>
                ) : t.submit}
              </button>

              <p className="privacy">{t.privacy}</p>
            </form>
          </div>
        </div>
      </main>

      {toast && (
        <div className={`toast ${toast.type}`} role="status" aria-live="polite">
          <span className="toast-dot" aria-hidden="true" />
          {toast.message}
        </div>
      )}
    </>
  );
}
