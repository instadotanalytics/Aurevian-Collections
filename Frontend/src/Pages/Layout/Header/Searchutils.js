/**
 * searchUtils.js
 * ------------------------------------------------------------------
 * Pure, dependency-free helpers used by SearchPanel.jsx.
 * Kept separate from the component so:
 *   - they're independently testable
 *   - swapping the local array for a real API later only touches
 *     `getSuggestions()`, nothing else
 * ------------------------------------------------------------------
 */

import { useState, useEffect, useRef } from "react";

const HISTORY_KEY = "aurevian_search_history";
const HISTORY_LIMIT = 8;

/* ==========================================================
   DEBOUNCE HOOK
   Returns a debounced copy of `value` that only updates after
   `delay` ms of no further changes. Used so live suggestions
   don't refilter on every single keystroke.
   ========================================================== */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/* ==========================================================
   SUGGESTION MATCHING
   Case-insensitive. Prioritizes titles that START WITH the
   query (e.g. "neck" -> "Necklace" before "Gold Necklace"),
   falling back to titles that merely CONTAIN it, so autocomplete
   feels natural instead of alphabetical.
   ========================================================== */
export function getSuggestions(query, products, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const startsWith = [];
  const includes = [];

  for (const product of products) {
    const title = product.title.toLowerCase();
    if (title.startsWith(q)) {
      startsWith.push(product);
    } else if (title.includes(q)) {
      includes.push(product);
    }
  }

  return [...startsWith, ...includes].slice(0, limit);
}

/* ==========================================================
   HIGHLIGHT MATCHING TEXT
   Splits `text` into an array of { text, match } segments so the
   component can wrap matched runs in <mark> without dangerouslySetInnerHTML.
   Example: highlightSegments("Ring", "rin")
     -> [{ text: "Rin", match: true }, { text: "g", match: false }]
   ========================================================== */
export function highlightSegments(text, query) {
  const q = query.trim();
  if (!q) return [{ text, match: false }];

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return [{ text, match: false }];

  const segments = [];
  if (index > 0) segments.push({ text: text.slice(0, index), match: false });
  segments.push({ text: text.slice(index, index + q.length), match: true });
  if (index + q.length < text.length) {
    segments.push({ text: text.slice(index + q.length), match: false });
  }
  return segments;
}

/* ==========================================================
   SEARCH HISTORY (localStorage)
   - newest first
   - no duplicates (re-searching a term just moves it to the top)
   - capped at HISTORY_LIMIT entries
   All functions are safe to call during SSR / when localStorage
   is unavailable — they no-op / return [] instead of throwing.
   ========================================================== */
function isStorageAvailable() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function getSearchHistory() {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(term) {
  const trimmed = term.trim();
  if (!trimmed || !isStorageAvailable()) return getSearchHistory();

  const current = getSearchHistory();
  // Remove any existing case-insensitive duplicate, then push the
  // fresh term to the front so it reflects the latest search.
  const deduped = current.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase(),
  );
  const updated = [trimmed, ...deduped].slice(0, HISTORY_LIMIT);

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    /* storage full / blocked — fail silently, history is a nice-to-have */
  }
  return updated;
}

export function removeSearchHistoryItem(term) {
  if (!isStorageAvailable()) return getSearchHistory();
  const updated = getSearchHistory().filter((item) => item !== term);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  return updated;
}

export function clearSearchHistory() {
  if (!isStorageAvailable()) return [];
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
  return [];
}

/* ==========================================================
   KEYBOARD-NAVIGABLE LIST INDEX HOOK
   Small shared helper for moving an "active index" up/down through
   a list with wraparound, used for ArrowUp/ArrowDown navigation.
   ========================================================== */
export function useActiveIndex(listLength) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const prevLength = useRef(listLength);

  // Reset selection whenever the list itself changes (new query,
  // panel opened/closed) so a stale index can't point past the end.
  useEffect(() => {
    if (prevLength.current !== listLength) {
      setActiveIndex(-1);
      prevLength.current = listLength;
    }
  }, [listLength]);

  const moveDown = () => {
    if (listLength === 0) return;
    setActiveIndex((prev) => (prev + 1) % listLength);
  };

  const moveUp = () => {
    if (listLength === 0) return;
    setActiveIndex((prev) => (prev <= 0 ? listLength - 1 : prev - 1));
  };

  const reset = () => setActiveIndex(-1);

  return { activeIndex, moveDown, moveUp, reset, setActiveIndex };
}