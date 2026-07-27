/**
 * searchData.js
 * ------------------------------------------------------------------
 * All search content (suggestions, popular terms, trending terms)
 * lives here so SearchPanel.jsx stays "dumb" and reusable — exactly
 * the same pattern already used by NavData.js for the navbar.
 *
 * FUTURE / BACKEND INTEGRATION (see section 13 of the brief):
 * Right now `searchableProducts` is a plain local array. To switch to
 * a live API later, you do NOT need to touch SearchPanel.jsx or any
 * UI code — only replace how the data gets INTO SearchPanel. Two easy
 * options:
 *
 *   1) Keep it synchronous-shaped: fetch once on app load, cache the
 *      result, and still pass it into <SearchPanel products={...} />.
 *
 *   2) Make searchUtils.getSuggestions() async and call your API
 *      (e.g. GET /api/search?q=ring) instead of filtering this local
 *      array. SearchPanel already calls getSuggestions() inside a
 *      useEffect, so swapping it for an async call + AbortController
 *      is a localized change.
 *
 * As long as each item keeps this shape — { id, title, category,
 * path } — nothing in the UI layer needs to change.
 * ------------------------------------------------------------------
 */

// The master list SearchPanel filters against for live suggestions,
// autocomplete, and highlight-matching.
export const searchableProducts = [
  // ---- Rings ----
  { id: "p-ring-1", title: "Ring", category: "Rings", path: "/shop/rings" },
  { id: "p-ring-2", title: "Rings", category: "Rings", path: "/shop/rings" },
  { id: "p-ring-3", title: "Rose Gold Ring", category: "Rings", path: "/shop/rings/rose-gold-ring" },
  { id: "p-ring-4", title: "Ruby Ring", category: "Rings", path: "/shop/rings/ruby-ring" },
  { id: "p-ring-5", title: "Ring Set", category: "Rings", path: "/shop/rings/ring-set" },
  { id: "p-ring-6", title: "Diamond Ring", category: "Rings", path: "/shop/rings/diamond-ring" },
  { id: "p-ring-7", title: "Engagement Ring", category: "Rings", path: "/shop/rings/engagement-ring" },
  { id: "p-ring-8", title: "Cocktail Ring", category: "Rings", path: "/shop/rings/cocktail-ring" },
  { id: "p-ring-9", title: "Adjustable Ring", category: "Rings", path: "/shop/rings/adjustable-ring" },
  { id: "p-ring-10", title: "Pearl Ring", category: "Rings", path: "/shop/rings/pearl-ring" },

  // ---- Necklaces ----
  { id: "p-neck-1", title: "Necklace", category: "Necklaces", path: "/shop/necklaces" },
  { id: "p-neck-2", title: "Necklace Set", category: "Necklaces", path: "/shop/necklace-sets" },
  { id: "p-neck-3", title: "Layered Necklace", category: "Necklaces", path: "/shop/necklaces/layered-necklace" },
  { id: "p-neck-4", title: "Gold Necklace", category: "Necklaces", path: "/shop/necklaces/gold-necklace" },
  { id: "p-neck-5", title: "Choker Necklace", category: "Necklaces", path: "/shop/necklaces/choker-necklace" },
  { id: "p-neck-6", title: "Pearl Necklace", category: "Necklaces", path: "/shop/necklaces/pearl-necklace" },
  { id: "p-neck-7", title: "Bridal Necklace Set", category: "Necklaces", path: "/shop/necklace-sets/bridal" },
  { id: "p-neck-8", title: "Temple Necklace", category: "Necklaces", path: "/shop/necklaces/temple-necklace" },

  // ---- Earrings ----
  { id: "p-ear-1", title: "Earrings", category: "Earrings", path: "/shop/earrings" },
  { id: "p-ear-2", title: "Stud Earrings", category: "Earrings", path: "/shop/earrings/stud-earrings" },
  { id: "p-ear-3", title: "Hoop Earrings", category: "Earrings", path: "/shop/earrings/hoop-earrings" },
  { id: "p-ear-4", title: "Jhumka Earrings", category: "Earrings", path: "/shop/earrings/jhumka" },
  { id: "p-ear-5", title: "Pearl Earrings", category: "Earrings", path: "/shop/earrings/pearl-earrings" },
  { id: "p-ear-6", title: "Drop Earrings", category: "Earrings", path: "/shop/earrings/drop-earrings" },
  { id: "p-ear-7", title: "Chandbali Earrings", category: "Earrings", path: "/shop/earrings/chandbali" },

  // ---- Bracelets & Bangles ----
  { id: "p-brac-1", title: "Bracelet", category: "Bracelets", path: "/shop/bracelets" },
  { id: "p-brac-2", title: "Charm Bracelet", category: "Bracelets", path: "/shop/bracelets/charm-bracelet" },
  { id: "p-brac-3", title: "Tennis Bracelet", category: "Bracelets", path: "/shop/bracelets/tennis-bracelet" },
  { id: "p-bang-1", title: "Bangles", category: "Bangles", path: "/shop/bangles" },
  { id: "p-bang-2", title: "Kada Bangle", category: "Bangles", path: "/shop/bangles/kada" },

  // ---- Anklets ----
  { id: "p-ank-1", title: "Anklet", category: "Anklets", path: "/shop/anklets" },
  { id: "p-ank-2", title: "Payal Anklet", category: "Anklets", path: "/shop/anklets/payal" },

  // ---- Mangalsutra ----
  { id: "p-mang-1", title: "Mangalsutra", category: "Mangalsutra", path: "/shop/mangalsutra" },
  { id: "p-mang-2", title: "Diamond Mangalsutra", category: "Mangalsutra", path: "/shop/mangalsutra/diamond" },

  // ---- Pendants & Chains ----
  { id: "p-pend-1", title: "Pendant", category: "Pendants", path: "/shop/pendants" },
  { id: "p-pend-2", title: "Heart Pendant", category: "Pendants", path: "/shop/pendants/heart-pendant" },
  { id: "p-chain-1", title: "Chain", category: "Chains", path: "/shop/chains" },
  { id: "p-chain-2", title: "Gold Chain", category: "Chains", path: "/shop/chains/gold-chain" },

  // ---- Nose Pins & Maang Tikka ----
  { id: "p-nose-1", title: "Nose Pin", category: "Nose Pins", path: "/shop/nose-pins" },
  { id: "p-tikka-1", title: "Maang Tikka", category: "Maang Tikka", path: "/shop/maang-tikka" },

  // ---- Collections / occasion terms ----
  { id: "p-col-1", title: "Bridal Collection", category: "Collections", path: "/collections/bridal" },
  { id: "p-col-2", title: "Party Wear Jewellery", category: "Collections", path: "/collections/party-wear" },
  { id: "p-col-3", title: "Daily Wear Jewellery", category: "Collections", path: "/collections/daily-wear" },
  { id: "p-col-4", title: "Minimal Jewellery", category: "Collections", path: "/collections/minimal" },
  { id: "p-col-5", title: "Festive Collection", category: "Collections", path: "/collections/festive" },
  { id: "p-col-6", title: "Rakhi Gifts", category: "Gift Guide", path: "/gift-guide/raksha-bandhan" },
];

// Shown under "Popular Searches" when the search box is empty.
export const popularSearches = [
  "Necklace",
  "Earrings",
  "Bracelet",
  "Mangalsutra",
  "Rings",
  "Pendant",
  "Anklet",
];

// Shown under "Trending Searches" — each gets a small flame/trending icon.
export const trendingSearches = [
  "Bridal Collection",
  "Rakhi Gifts",
  "Minimal Jewellery",
  "Pearl Earrings",
];