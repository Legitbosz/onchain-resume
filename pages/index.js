import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      setError("No wallet detected. Install MetaMask or paste an address below.");
      return;
    }
    try {
      setConnecting(true);
      setError("");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      router.push(`/resume/${accounts[0]}`);
    } catch {
      setError("Wallet connection cancelled.");
      setConnecting(false);
    }
  }

  function handleLookup(e) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError("Please enter a valid 0x wallet address.");
      return;
    }
    router.push(`/resume/${trimmed}`);
  }

  return (
    <>
      <Head>
        <title>Onchain Resume — Base</title>
        <meta name="description" content="Your verified onchain identity on Base" />
      </Head>

      <main style={styles.page}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />
        <div style={styles.grid} />

        <div style={styles.container}>

          {/* Base Logo + Nav */}
          <nav className="fade-up" style={styles.nav}>
            <div style={styles.baseLogo}>
              <svg width="28" height="28" viewBox="0 0 111 111" fill="none">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.003 0 2.12 22.58 0 51.893H72.787V58.142H0C2.12 87.455 26.003 110.034 54.921 110.034Z" fill="#0052FF"/>
              </svg>
              <span style={styles.baseLogoText}>Base Resume</span>
            </div>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}
            >
              base.org ↗
            </a>
          </nav>

          {/* Hero */}
          <div style={styles.hero}>
            <div className="fade-up" style={styles.badge}>
              <span style={styles.badgeDot} />
              Live on Base Mainnet
            </div>

            <h1 className="fade-up-1" style={styles.heading}>
              YOUR ONCHAIN<br />
              <span style={styles.headingAccent}>RESUME</span>
            </h1>

            <p className="fade-up-2" style={styles.subtext}>
              Connect your wallet to generate a verified, shareable resume<br />
              built entirely from your onchain activity on Base.
            </p>
          </div>

          {/* CTA */}
          <div className="fade-up-3" style={styles.ctaGroup}>
            <button
              onClick={connectWallet}
              disabled={connecting}
              style={{
                ...styles.connectBtn,
                opacity: connecting ? 0.7 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 111 111" fill="none" style={{ flexShrink: 0 }}>
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.003 0 2.12 22.58 0 51.893H72.787V58.142H0C2.12 87.455 26.003 110.034 54.921 110.034Z" fill="white"/>
              </svg>
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or look up any wallet</span>
              <span style={styles.dividerLine} />
            </div>

            <form onSubmit={handleLookup} style={styles.form}>
              <input
                type="text"
                placeholder="0x... wallet address"
                value={address}
                onChange={e => { setAddress(e.target.value); setError(""); }}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#0052FF"}
                onBlur={e => e.target.style.borderColor = "#1e1e35"}
              />
              <button type="submit" style={styles.lookupBtn}>
                View →
              </button>
            </form>

            {error && <p style={styles.error}>{error}</p>}
          </div>

          {/* Stats strip */}
          <div className="fade-up-4" style={styles.statsStrip}>
            {[
              { label: "Chain", value: "Base Mainnet" },
              { label: "Data Source", value: "Alchemy + Basescan" },
              { label: "Verified By", value: "Onchain Activity" },
            ].map(s => (
              <div key={s.label} style={styles.stat}>
                <span style={styles.statValue}>{s.value}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

        </div>
      </main>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: "2rem",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `linear-gradient(rgba(0,82,255,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,82,255,0.03) 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  glow1: {
    position: "fixed",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,82,255,0.1) 0%, transparent 70%)",
    top: "-10%",
    left: "-10%",
    pointerEvents: "none",
    zIndex: 0,
  },
  glow2: {
    position: "fixed",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,82,255,0.06) 0%, transparent 70%)",
    bottom: "-5%",
    right: "-5%",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: 600,
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3rem",
  },
  baseLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  baseLogoText: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    letterSpacing: "0.05em",
    color: "#e2e8f0",
  },
  navLink: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#6b7280",
    transition: "color 0.2s",
  },
  hero: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(0,82,255,0.08)",
    border: "1px solid rgba(0,82,255,0.25)",
    borderRadius: 100,
    padding: "6px 16px",
    fontSize: 12,
    color: "#0052FF",
    fontFamily: "var(--font-mono)",
    marginBottom: "1.5rem",
    letterSpacing: "0.05em",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#0052FF",
    display: "inline-block",
    animation: "pulse-ring 2s infinite",
  },
  heading: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(56px, 10vw, 96px)",
    lineHeight: 0.95,
    letterSpacing: "0.02em",
    color: "#e2e8f0",
    marginBottom: "1.5rem",
  },
  headingAccent: {
    color: "#0052FF",
  },
  subtext: {
    color: "#6b7280",
    fontSize: 16,
    lineHeight: 1.7,
    fontWeight: 300,
  },
  ctaGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "3rem",
  },
  connectBtn: {
    background: "#0052FF",
    border: "none",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    maxWidth: 400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: "0.02em",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 400,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#1e1e35",
  },
  dividerText: {
    color: "#6b7280",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    whiteSpace: "nowrap",
  },
  form: {
    display: "flex",
    gap: 8,
    width: "100%",
    maxWidth: 400,
  },
  input: {
    flex: 1,
    background: "#0f0f1a",
    border: "1px solid #1e1e35",
    borderRadius: 8,
    padding: "12px 16px",
    color: "#e2e8f0",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    outline: "none",
    transition: "border-color 0.2s",
  },
  lookupBtn: {
    background: "#16162a",
    border: "1px solid #1e1e35",
    color: "#e2e8f0",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  error: {
    color: "#f87171",
    fontSize: 13,
    fontFamily: "var(--font-mono)",
  },
  statsStrip: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    borderTop: "1px solid #1e1e35",
    paddingTop: "2rem",
    flexWrap: "wrap",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e8f0",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
};
