import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ScoreRing, StatCard, ProtocolBadge, NFTGrid, TokenList } from "../../components/index";

export default function ResumePage() {
  const router = useRouter();
  const { address } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(null);

  // Check if this is the connected wallet
  useEffect(() => {
    if (window.ethereum && address) {
      window.ethereum.request({ method: "eth_accounts" }).then(accounts => {
        if (accounts[0]?.toLowerCase() === address?.toLowerCase()) {
          setConnectedWallet(accounts[0]);
        }
      });
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/resume/${address}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [address]);

  async function disconnect() {
    router.push("/");
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.loadingWrap}>
        <svg width="32" height="32" viewBox="0 0 111 111" fill="none">
          <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.003 0 2.12 22.58 0 51.893H72.787V58.142H0C2.12 87.455 26.003 110.034 54.921 110.034Z" fill="#0052FF"/>
        </svg>
        <div style={styles.loadingRing} />
      </div>
      <p style={styles.loadingText}>Reading onchain activity...</p>
    </div>
  );

  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: "#f87171", fontFamily: "var(--font-mono)", marginBottom: 16 }}>{error}</p>
      <Link href="/" style={styles.ghostBtn}>← Try another address</Link>
    </div>
  );

  if (!data) return null;

  const { identity, activity, defi, nfts, tokens, score } = data;

  const firstTxDate = activity.firstTxDate
    ? new Date(activity.firstTxDate).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "Unknown";

  return (
    <>
      <Head>
        <title>Onchain Resume — {shortAddress}</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.glow1} />
        <div style={styles.grid} />

        <div style={styles.container}>

          {/* ── Nav ── */}
          <nav className="fade-up" style={styles.nav}>
            <Link href="/" style={styles.logoWrap}>
              <svg width="22" height="22" viewBox="0 0 111 111" fill="none">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.003 0 2.12 22.58 0 51.893H72.787V58.142H0C2.12 87.455 26.003 110.034 54.921 110.034Z" fill="#0052FF"/>
              </svg>
              <span style={styles.logoText}>Base Resume</span>
            </Link>

            <div style={styles.navRight}>
              <button onClick={copyLink} style={styles.ghostBtn}>
                Share ↗
              </button>
              {connectedWallet && (
                <button onClick={disconnect} style={styles.disconnectBtn}>
                  Disconnect
                </button>
              )}
            </div>
          </nav>

          {/* ── Header ── */}
          <header className="fade-up-1" style={styles.header}>
            <div style={styles.avatar}>
              <svg width="28" height="28" viewBox="0 0 111 111" fill="none">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.003 0 2.12 22.58 0 51.893H72.787V58.142H0C2.12 87.455 26.003 110.034 54.921 110.034Z" fill="white"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={styles.name}>
                {identity.basename || shortAddress}
              </h1>
              <p style={styles.addressText}>{address}</p>
              <p style={styles.since}>On Base since {firstTxDate}</p>
            </div>
            <div style={styles.scoreWrap}>
              <ScoreRing score={score.total} label={score.label} emoji={score.emoji} />
            </div>
          </header>

          {/* ── Activity Stats ── */}
          <section className="fade-up-2" style={styles.section}>
            <h2 style={styles.sectionTitle}>Activity</h2>
            <div style={styles.statsGrid}>
              <StatCard label="Total Transactions" value={activity.totalTxCount.toLocaleString()} accent="#0052FF" />
              <StatCard label="Active Days" value={activity.activeDays} accent="#00e5a0" />
              <StatCard label="Days on Base" value={activity.daysSinceFirstTx} accent="#7c3aed" />
              <StatCard label="NFTs Held" value={nfts.totalNFTs.toLocaleString()} accent="#f59e0b" />
              <StatCard label="Longest Streak" value={`${activity.longestStreak}d`} accent="#f43f5e" />
              <StatCard label="ETH Balance" value={tokens.ethBalance} accent="#00e5a0" />
            </div>
          </section>

          {/* ── DeFi Protocols ── */}
          <section className="fade-up-3" style={styles.section}>
            <h2 style={styles.sectionTitle}>DeFi Protocols</h2>
            {defi.protocolsInteracted.length > 0 ? (
              <div style={styles.badgeGroup}>
                {defi.protocolsInteracted.map(p => (
                  <ProtocolBadge key={p} name={p} />
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>No known protocol interactions recorded yet.</p>
            )}
          </section>

          {/* ── NFT Collections ── */}
          <section className="fade-up-3" style={styles.section}>
            <h2 style={styles.sectionTitle}>
              NFT Collections
              <span style={styles.sectionCount}>{nfts.collections.length} shown</span>
            </h2>
            <NFTGrid collections={nfts.collections} />
          </section>

          {/* ── Token Holdings ── */}
          <section className="fade-up-4" style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Token Holdings
              <span style={styles.sectionCount}>ETH: {tokens.ethBalance}</span>
            </h2>
            <TokenList tokens={tokens.erc20Holdings} />
          </section>

          {/* ── Score Breakdown ── */}
          <section className="fade-up-5" style={styles.section}>
            <h2 style={styles.sectionTitle}>Score Breakdown</h2>
            <div style={styles.scoreGrid}>
              {Object.entries(score.breakdown).map(([key, val]) => (
                <div key={key} style={styles.scoreItem}>
                  <div style={styles.scoreBar}>
                    <div style={{
                      ...styles.scoreBarFill,
                      width: `${(val / 35) * 100}%`,
                      background: key === "activity" ? "#0052FF"
                        : key === "defi" ? "#7c3aed"
                        : key === "nfts" ? "#f59e0b"
                        : key === "tokens" ? "#00e5a0"
                        : "#6b7280",
                    }} />
                  </div>
                  <div style={styles.scoreItemLabel}>
                    <span style={{ textTransform: "capitalize" }}>{key}</span>
                    <span style={{ color: "#0052FF", fontFamily: "var(--font-mono)" }}>{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer style={styles.footer}>
            <div style={styles.footerLogo}>
              <svg width="16" height="16" viewBox="0 0 111 111" fill="none">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.632 85.359 0 54.921 0C26.003 0 2.12 22.58 0 51.893H72.787V58.142H0C2.12 87.455 26.003 110.034 54.921 110.034Z" fill="#0052FF"/>
              </svg>
              <span style={styles.footerText}>
                Generated {new Date(data.fetchedAt).toLocaleString()} · Verified by Base Mainnet
              </span>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "2rem",
    position: "relative",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `linear-gradient(rgba(0,82,255,0.025) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,82,255,0.025) 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  glow1: {
    position: "fixed",
    width: 700,
    height: 700,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,82,255,0.07) 0%, transparent 70%)",
    top: "-20%",
    right: "-10%",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: 760,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  centered: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingWrap: {
    position: "relative",
    width: 60,
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingRing: {
    position: "absolute",
    inset: 0,
    border: "2px solid #1e1e35",
    borderTop: "2px solid #0052FF",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#6b7280",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #1e1e35",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    letterSpacing: "0.05em",
    color: "#e2e8f0",
  },
  navRight: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #1e1e35",
    color: "#6b7280",
    padding: "8px 16px",
    borderRadius: 8,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    cursor: "pointer",
  },
  disconnectBtn: {
    background: "rgba(244,63,94,0.08)",
    border: "1px solid rgba(244,63,94,0.25)",
    color: "#f43f5e",
    padding: "8px 16px",
    borderRadius: 8,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    cursor: "pointer",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "2rem",
    background: "#0f0f1a",
    border: "1px solid #1e1e35",
    borderRadius: 16,
    padding: "1.5rem",
    flexWrap: "wrap",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    background: "#0052FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  name: {
    fontFamily: "var(--font-display)",
    fontSize: 26,
    letterSpacing: "0.02em",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  addressText: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
    wordBreak: "break-all",
  },
  since: {
    fontSize: 12,
    color: "#0052FF",
    fontFamily: "var(--font-mono)",
  },
  scoreWrap: { marginLeft: "auto" },
  section: {
    marginBottom: "1.5rem",
    background: "#0f0f1a",
    border: "1px solid #1e1e35",
    borderRadius: 16,
    padding: "1.5rem",
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    letterSpacing: "0.05em",
    color: "#e2e8f0",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sectionCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 400,
    letterSpacing: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
  },
  badgeGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyText: {
    color: "#6b7280",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
  },
  scoreGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  scoreItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  scoreBar: {
    height: 6,
    background: "#16162a",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 1s ease",
  },
  scoreItemLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#6b7280",
  },
  footer: {
    textAlign: "center",
    paddingTop: "1rem",
    paddingBottom: "2rem",
  },
  footerLogo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: "#6b7280",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
  },
};
