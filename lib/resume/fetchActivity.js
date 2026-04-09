import alchemy from "../alchemy/client";
import { Utils } from "alchemy-sdk";

// ─── Known Base Protocol Addresses ───────────────────────────────────────────
const KNOWN_PROTOCOLS = {
  "0x2626664c2603336E57B271c5C0b26F421741e481": "Uniswap V3",
  "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43": "Aerodrome",
  "0x6Cb3d9B1c2B1d2e8f6c5a4A3b2C1D0E9F8A7B6C5": "Morpho",
  "0x3154Cf16ccdb4C6d922629664174b904d80F2C35": "Base Bridge",
  "0x4200000000000000000000000000000000000006": "WETH (Base)",
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "USDC (Base)",
  "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": "USDbC",
};

// ─── Fetch All Outbound Transfers (paginated) ─────────────────────────────────
async function getAllTransfers(address) {
  const params = {
    fromAddress: address,
    category: ["external", "erc20", "erc721", "erc1155"],
    withMetadata: true,
    order: "asc",
  };

  let transfers = [];
  let pageKey = null;

  do {
    const res = await alchemy.core.getAssetTransfers({
      ...params,
      ...(pageKey && { pageKey }),
    });
    transfers = transfers.concat(res.transfers);
    pageKey = res.pageKey;
  } while (pageKey);

  return transfers;
}

// ─── Fetch Inbound Transfers ──────────────────────────────────────────────────
async function getInboundTransfers(address) {
  const res = await alchemy.core.getAssetTransfers({
    toAddress: address,
    category: ["external", "erc20", "erc721", "erc1155"],
    withMetadata: true,
  });
  return res.transfers;
}

// ─── Fetch True Tx Count from Basescan ───────────────────────────────────────
async function getBasescanTxCount(address) {
  try {
    const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${process.env.BASESCAN_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result.length;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Parse Activity Stats ─────────────────────────────────────────────────────
function parseActivityStats(transfers, txCount) {
  if (!transfers.length) {
    return { firstTxDate: null, activeDays: 0, totalTxCount: txCount || 0 };
  }

  const uniqueDays = new Set();
  const uniqueTxHashes = new Set();

  transfers.forEach((tx) => {
    if (tx.metadata?.blockTimestamp) {
      const day = tx.metadata.blockTimestamp.split("T")[0];
      uniqueDays.add(day);
    }
    if (tx.hash) uniqueTxHashes.add(tx.hash);
  });

  const firstTxDate = transfers[0]?.metadata?.blockTimestamp
    ? new Date(transfers[0].metadata.blockTimestamp)
    : null;

  return {
    firstTxDate,
    activeDays: uniqueDays.size,
    totalTxCount: txCount || Math.max(uniqueTxHashes.size, 0),
  };
}

// ─── Calculate Longest Streak ─────────────────────────────────────────────────
function calcLongestStreak(transfers) {
  const days = new Set();

  transfers.forEach((tx) => {
    if (tx.metadata?.blockTimestamp) {
      days.add(tx.metadata.blockTimestamp.split("T")[0]);
    }
  });

  if (!days.size) return 0;

  const sorted = Array.from(days).sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

// ─── Parse Protocol Interactions ─────────────────────────────────────────────
function parseProtocols(transfers) {
  const interacted = new Set();

  transfers.forEach((tx) => {
    const to = tx.to?.toLowerCase();
    for (const [addr, name] of Object.entries(KNOWN_PROTOCOLS)) {
      if (to === addr.toLowerCase()) {
        interacted.add(name);
      }
    }
  });

  return Array.from(interacted);
}

// ─── Parse NFT Activity ───────────────────────────────────────────────────────
function parseNFTActivity(transfers) {
  const minted = new Set();
  const traded = new Set();

  transfers.forEach((tx) => {
    if (tx.category === "erc721" || tx.category === "erc1155") {
      if (tx.from === "0x0000000000000000000000000000000000000000") {
        minted.add(tx.rawContract?.address);
      } else {
        traded.add(tx.rawContract?.address);
      }
    }
  });

  return {
    mintedCollections: minted.size,
    tradedCollections: traded.size,
  };
}

// ─── Parse ERC-20 Token Activity ──────────────────────────────────────────────
function parseTokenActivity(transfers) {
  const tokens = new Map();

  transfers.forEach((tx) => {
    if (tx.category === "erc20" && tx.asset) {
      if (!tokens.has(tx.asset)) {
        tokens.set(tx.asset, {
          symbol: tx.asset,
          contractAddress: tx.rawContract?.address,
          txCount: 0,
        });
      }
      tokens.get(tx.asset).txCount += 1;
    }
  });

  return Array.from(tokens.values()).sort((a, b) => b.txCount - a.txCount);
}

// ─── Fetch Current Token Balances ─────────────────────────────────────────────
async function getTokenBalances(address) {
  const balances = await alchemy.core.getTokenBalances(address);

  const nonZero = balances.tokenBalances.filter(
    (t) => t.tokenBalance && t.tokenBalance !== "0x0"
  );

  const enriched = await Promise.all(
    nonZero.slice(0, 10).map(async (t) => {
      try {
        const meta = await alchemy.core.getTokenMetadata(t.contractAddress);
        const decimals = meta.decimals || 18;
        const rawBalance = BigInt(t.tokenBalance);
        const formatted = Number(rawBalance) / Math.pow(10, decimals);

        return {
          symbol: meta.symbol,
          name: meta.name,
          balance: parseFloat(formatted.toFixed(4)),
          logo: meta.logo,
          contractAddress: t.contractAddress,
        };
      } catch {
        return null;
      }
    })
  );

  return enriched.filter(Boolean);
}

// ─── Fetch NFTs Held ──────────────────────────────────────────────────────────
async function getNFTsHeld(address) {
  const nfts = await alchemy.nft.getNftsForOwner(address, {
    pageSize: 100,
    excludeFilters: [],
    omitMetadata: false,
  });

  const collections = new Map();
  nfts.ownedNfts.forEach((nft) => {
    const key = nft.contract.address;
    if (!collections.has(key)) {
      collections.set(key, {
        name: nft.contract.name || "Unknown Collection",
        address: key,
        count: 0,
        image: nft.image?.thumbnailUrl || null,
      });
    }
    collections.get(key).count += 1;
  });

  return {
    totalNFTs: nfts.totalCount,
    collections: Array.from(collections.values()).slice(0, 8),
  };
}

// ─── Fetch ETH Balance ────────────────────────────────────────────────────────
async function getETHBalance(address) {
  const balance = await alchemy.core.getBalance(address);
  return parseFloat(Utils.formatEther(balance)).toFixed(4);
}

// ─── Resolve Basename / ENS ──────────────────────────────────────────────────
async function resolveIdentity(address) {
  try {
    const ens = await alchemy.core.lookupAddress(address);
    return { basename: ens || null };
  } catch {
    return { basename: null };
  }
}

// ─── Main Aggregator ──────────────────────────────────────────────────────────
export async function fetchWalletResume(address) {
  const normalizedAddress = address.toLowerCase();

  const [
    outboundTransfers,
    inboundTransfers,
    ethBalance,
    nftsHeld,
    tokenBalances,
    identity,
    txCount,
    basescanCount,
  ] = await Promise.all([
    getAllTransfers(normalizedAddress),
    getInboundTransfers(normalizedAddress),
    getETHBalance(normalizedAddress),
    getNFTsHeld(normalizedAddress),
    getTokenBalances(normalizedAddress),
    resolveIdentity(normalizedAddress),
    alchemy.core.getTransactionCount(normalizedAddress),
    getBasescanTxCount(normalizedAddress),
  ]);

  const allTransfers = [...outboundTransfers, ...inboundTransfers];

  const activityStats = parseActivityStats(allTransfers, basescanCount || txCount);
  const longestStreak = calcLongestStreak(allTransfers);
  const protocols = parseProtocols(outboundTransfers);
  const nftActivity = parseNFTActivity(outboundTransfers);
  const tokenActivity = parseTokenActivity(outboundTransfers);

  return {
    address,
    identity: {
      ...identity,
      address,
    },
    activity: {
      firstTxDate: activityStats.firstTxDate,
      totalTxCount: activityStats.totalTxCount,
      activeDays: activityStats.activeDays,
      longestStreak,
      daysSinceFirstTx: activityStats.firstTxDate
        ? Math.floor(
            (Date.now() - new Date(activityStats.firstTxDate)) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
    },
    defi: {
      protocolsInteracted: protocols,
      protocolCount: protocols.length,
    },
    nfts: {
      ...nftsHeld,
      mintedCollections: nftActivity.mintedCollections,
      tradedCollections: nftActivity.tradedCollections,
    },
    tokens: {
      ethBalance,
      erc20Holdings: tokenBalances,
      topTokensByActivity: tokenActivity.slice(0, 5),
    },
    fetchedAt: new Date().toISOString(),
  };
}
