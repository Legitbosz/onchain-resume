// ─── Scoring Weights ──────────────────────────────────────────────────────────
// Total max score = 100

const WEIGHTS = {
  activity: 35,  // Longevity, consistency, tx count
  defi:     25,  // Protocol diversity & interactions
  nfts:     20,  // NFT minting & collecting
  tokens:   10,  // Token diversity
  builder:  10,  // Reserved for contract deployments (future)
};

// ─── Activity Score (0–35) ────────────────────────────────────────────────────
function scoreActivity({ totalTxCount, activeDays, daysSinceFirstTx }) {
  let score = 0;

  // Tx count (0–12)
  if (totalTxCount >= 500) score += 12;
  else if (totalTxCount >= 200) score += 9;
  else if (totalTxCount >= 50)  score += 6;
  else if (totalTxCount >= 10)  score += 3;
  else                           score += 1;

  // Active days (0–13)
  if (activeDays >= 180) score += 13;
  else if (activeDays >= 60)  score += 9;
  else if (activeDays >= 20)  score += 6;
  else if (activeDays >= 5)   score += 3;
  else                        score += 1;

  // Longevity — days since first tx (0–10)
  if (daysSinceFirstTx >= 365) score += 10;
  else if (daysSinceFirstTx >= 180) score += 7;
  else if (daysSinceFirstTx >= 60)  score += 4;
  else if (daysSinceFirstTx >= 14)  score += 2;
  else                               score += 1;

  return Math.min(score, WEIGHTS.activity);
}

// ─── DeFi Score (0–25) ────────────────────────────────────────────────────────
function scoreDefi({ protocolCount }) {
  if (protocolCount >= 6) return 25;
  if (protocolCount >= 4) return 18;
  if (protocolCount >= 2) return 12;
  if (protocolCount >= 1) return 6;
  return 0;
}

// ─── NFT Score (0–20) ─────────────────────────────────────────────────────────
function scoreNFTs({ totalNFTs, mintedCollections, tradedCollections }) {
  let score = 0;

  // Total NFTs held (0–8)
  if (totalNFTs >= 20)  score += 8;
  else if (totalNFTs >= 10) score += 6;
  else if (totalNFTs >= 3)  score += 4;
  else if (totalNFTs >= 1)  score += 2;

  // Minting activity (0–7)
  if (mintedCollections >= 5)  score += 7;
  else if (mintedCollections >= 3) score += 5;
  else if (mintedCollections >= 1) score += 3;

  // Trading activity (0–5)
  if (tradedCollections >= 3)  score += 5;
  else if (tradedCollections >= 1) score += 3;

  return Math.min(score, WEIGHTS.nfts);
}

// ─── Token Score (0–10) ───────────────────────────────────────────────────────
function scoreTokens({ erc20Holdings }) {
  const count = erc20Holdings?.length || 0;
  if (count >= 8)  return 10;
  if (count >= 5)  return 7;
  if (count >= 3)  return 5;
  if (count >= 1)  return 3;
  return 0;
}

// ─── Label / Tier ─────────────────────────────────────────────────────────────
function getLabel(total) {
  if (total >= 85) return { label: "Base OG",         emoji: "🏆", tier: "legendary" };
  if (total >= 70) return { label: "Power User",      emoji: "⚡", tier: "elite"     };
  if (total >= 50) return { label: "Active Builder",  emoji: "🔨", tier: "advanced"  };
  if (total >= 30) return { label: "Explorer",        emoji: "🧭", tier: "mid"       };
  return                  { label: "Getting Started", emoji: "🌱", tier: "beginner"  };
}

// ─── Main Scorer ──────────────────────────────────────────────────────────────
export function scoreResume(resumeData) {
  const activityScore = scoreActivity(resumeData.activity);
  const defiScore     = scoreDefi(resumeData.defi);
  const nftScore      = scoreNFTs(resumeData.nfts);
  const tokenScore    = scoreTokens(resumeData.tokens);
  const builderScore  = 0; // Placeholder — contract deployment tracking coming next

  const total = activityScore + defiScore + nftScore + tokenScore + builderScore;

  return {
    total,
    breakdown: {
      activity: activityScore,
      defi:     defiScore,
      nfts:     nftScore,
      tokens:   tokenScore,
      builder:  builderScore,
    },
    maxPossible: 100,
    percentage: total,
    ...getLabel(total),
  };
}
