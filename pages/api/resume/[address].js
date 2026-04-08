import { fetchWalletResume } from "../../../lib/resume/fetchActivity";
import { scoreResume } from "../../../lib/resume/score";
import { isAddress } from "ethers";

// ─── Simple in-memory cache (upgradeable to Redis later) ──────────────────────
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.query;

  // ── Validate address ─────────────────────────────────────────────────────
  if (!address || !isAddress(address)) {
    return res.status(400).json({
      error: "Invalid Ethereum address. Provide a valid 0x... address.",
    });
  }

  const normalizedAddress = address.toLowerCase();

  // ── Check cache ──────────────────────────────────────────────────────────
  const cached = cache.get(normalizedAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  // ── Fetch & score ────────────────────────────────────────────────────────
  try {
    const resumeData = await fetchWalletResume(normalizedAddress);
    const score = scoreResume(resumeData);

    const response = {
      ...resumeData,
      score,
      cached: false,
    };

    // Store in cache
    cache.set(normalizedAddress, {
      data: response,
      timestamp: Date.now(),
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error("[Resume API Error]", error);

    // Surface meaningful errors
    if (error.message?.includes("rate limit")) {
      return res.status(429).json({ error: "Rate limit hit. Try again shortly." });
    }

    return res.status(500).json({
      error: "Failed to fetch resume data.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
