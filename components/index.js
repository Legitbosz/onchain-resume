// ─── Score Ring ───────────────────────────────────────────────────────────────
export function ScoreRing({ score, label, emoji }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: 110, height: 110 }}>
        <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="55" cy="55" r={radius} fill="none" stroke="#1e1e35" strokeWidth="8" />
          <circle
            cx="55" cy="55" r={radius}
            fill="none"
            stroke="#0af"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#e2e8f0", lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#6b7280" }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#0af" }}>
        {emoji} {label}
      </span>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, accent = "#0af" }) {
  return (
    <div style={{
      background: "#16162a",
      border: "1px solid #1e1e35",
      borderRadius: 12,
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: 32,
        color: accent,
        lineHeight: 1,
        letterSpacing: "0.02em",
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── Protocol Badge ───────────────────────────────────────────────────────────
export function ProtocolBadge({ name }) {
  return (
    <span style={{
      background: "rgba(0,170,255,0.08)",
      border: "1px solid rgba(0,170,255,0.2)",
      color: "#0af",
      borderRadius: 100,
      padding: "6px 14px",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: "0.03em",
    }}>
      {name}
    </span>
  );
}

// ─── NFT Grid ─────────────────────────────────────────────────────────────────
export function NFTGrid({ collections }) {
  if (!collections?.length) {
    return <p style={{ color: "#6b7280", fontFamily: "var(--font-mono)", fontSize: 13 }}>No NFTs found.</p>;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: 10,
    }}>
      {collections.map(col => (
        <div key={col.address} style={{
          background: "#16162a",
          border: "1px solid #1e1e35",
          borderRadius: 10,
          overflow: "hidden",
        }}>
          {col.image ? (
            <img src={col.image} alt={col.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: "100%", aspectRatio: "1",
              background: "linear-gradient(135deg, #16162a, #1e1e35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>🖼</div>
          )}
          <div style={{ padding: "8px 10px" }}>
            <p style={{
              fontSize: 11,
              color: "#e2e8f0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 500,
            }}>
              {col.name}
            </p>
            <p style={{ fontSize: 10, color: "#6b7280", fontFamily: "var(--font-mono)" }}>
              ×{col.count}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Token List ───────────────────────────────────────────────────────────────
export function TokenList({ tokens }) {
  if (!tokens?.length) {
    return <p style={{ color: "#6b7280", fontFamily: "var(--font-mono)", fontSize: 13 }}>No ERC-20 tokens found.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tokens.slice(0, 8).map(t => (
        <div key={t.contractAddress} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#16162a",
          border: "1px solid #1e1e35",
          borderRadius: 10,
          padding: "10px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #0af22, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
              flexShrink: 0,
            }}>
              {t.symbol?.[0] || "?"}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{t.symbol}</p>
              <p style={{ fontSize: 11, color: "#6b7280", fontFamily: "var(--font-mono)" }}>
                {t.name?.slice(0, 24)}
              </p>
            </div>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "#00e5a0",
          }}>
            {t.balance > 1e9
              ? `${(t.balance / 1e9).toFixed(2)}B`
              : t.balance > 1e6
              ? `${(t.balance / 1e6).toFixed(2)}M`
              : t.balance > 1e3
              ? `${(t.balance / 1e3).toFixed(2)}K`
              : t.balance.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Default export for convenience
export default { ScoreRing, StatCard, ProtocolBadge, NFTGrid, TokenList };
