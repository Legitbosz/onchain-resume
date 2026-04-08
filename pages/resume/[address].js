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

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.loadingRing} />
      <p style={styles.loadingText}>Reading onchain activity...</p>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: "#f87171", fontFamily: "var(--font-mono)", marginBottom: 16 }}>
        {error}
      </p>
      <Link href="/" style={styles.backBtn}>← Try another address</Link>
    </div>
  );

  if (!data) return null;

  const { identity, activity, defi, nfts, tokens, score } = data;

  const firstTxDate = activity.firstTxDate
    ? new Date(activity.firstTxDate).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      })
    : "Unknown";

  return (
    <>
      <Head>
        <title>Onchain Resume — {shortAddress}</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />

        <div style={styles.container}>

          {/* ── Top Nav ── */}
          <nav className="fade-up" style={styles.nav}>
            <Link href="/" style={styles.backBtn}>← Onchain Resume</Link>
            <span style={styles.networkBadge}>⬤ Base Mainnet</span>
          </nav>

          {/* ── Header ── */}
          <header className="fade-up-1" style={styles.header}>
            <div style={styles.avatar}>
              {shortAddress.slice(0, 2).toUpperCase()}
            </div>
            <div>
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
              <StatCard label="Total Transactions" value={activity.totalTxCount.toLocaleString()} accent="#0af" />
              <StatCard label="Active Days" value={activity.activeDays} accent="#00e5a0" />
              <StatCard label="Days on Base" value={activity.daysSinceFirstTx} accent="#7c3aed" />
              <StatCard label="NFTs Held" value={nfts.totalNFTs.toLocaleString()} accent="#f59e0b" />
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
                    <div
                      style={{
                        ...styles.scoreBarFill,
                        width: `${(val / 35) * 100}%`,
                        background: key === "activity" ? "#0af"
                          : key === "defi" ? "#7c3aed"
                          : key === "nfts" ? "#f59e0b"
                          : key === "tokens" ? "#00e5a0"
                          : "#6b7280",
                      }}
                    />
                  </div>
                  <div style={styles.scoreItemLabel}>
                    <span style={{ textTransform: "capitalize" }}>{key}</span>
                    <span style={{ color: "#0af", fontFamily: "var(--font-mono)" }}>{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer style={styles.footer}>
            <p style={styles.footerText}>
              Generated {new Date(data.fetchedAt).toLocaleString()} · Verified by Base Mainnet
            </p>
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
  glow1: {
    position: "fixed",
    width: 700,
    height: 700,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,170,255,0.05) 0%, transparent 70%)",
    top: "-20%",
    right: "-10%",
    pointerEvents: "none",
    zIndex: 0,
  },
  glow2: {
    position: "fixed",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
    bottom: "-10%",
    left: "-10%",
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
  loadingRing: {
    width: 40,
    height: 40,
    border: "2px solid #1e1e35",
    borderTop: "2px solid #0af",
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
  backBtn: {
    color: "#6b7280",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    cursor: "pointer",
    transition: "color 0.2s",
  },
  networkBadge: {
    color: "#00e5a0",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "2.5rem",
    background: "#0f0f1a",
    border: "1px solid #1e1e35",
    borderRadius: 16,
    padding: "1.5rem",
    flexWrap: "wrap",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    background: "linear-gradient(135deg, #0af, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: 24,
    color: "#fff",
    flexShrink: 0,
  },
  name: {
    fontFamily: "var(--font-display)",
    fontSize: 28,
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
    color: "#0af",
    fontFamily: "var(--font-mono)",
  },
  scoreWrap: {
    marginLeft: "auto",
  },
  section: {
    marginBottom: "2rem",
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
  footerText: {
    color: "#6b7280",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
  },
};
