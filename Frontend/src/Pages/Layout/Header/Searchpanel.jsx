// src/Pages/Layout/Header/Searchpanel.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiClock, FiX, FiTrendingUp } from "react-icons/fi";

import { popularSearches, trendingSearches } from "./Searchdata.js";
import {
  useDebouncedValue,
  highlightSegments,
  getSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
  useActiveIndex,
} from "./Searchutils.js";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

/**
 * SearchPanel
 * ------------------------------------------------------------------
 * One implementation shared by:
 *   - the desktop icon-triggered dropdown  (variant="dropdown")
 *   - the mobile drawer's inline search     (variant="inline")
 *   - the persistent inline search bar on the /search results page
 *     (variant="inline", pre-filled via `initialQuery`)
 *
 * It owns all search behaviour (history, live suggestions, keyboard
 * nav, highlighting) so callers only render <SearchPanel /> and stay
 * focused on layout — nothing about the existing header markup,
 * icon, or animations changes.
 *
 * ✅ LIVE SEARCH is wired to the real backend:
 *   GET /api/seller/products/search?q=<query>&limit=8
 * Requests are debounced (300ms), cancelled via AbortController on
 * every new keystroke so a slow older response can never overwrite a
 * newer one, and skipped entirely for an empty/whitespace-only query.
 *
 * ✅ ENTER-KEY SEMANTICS (important, matches standard e-commerce UX):
 *   - Enter with NO suggestion highlighted (the normal case — user
 *     just typed and pressed Enter) => commits a full-text SEARCH,
 *     never opens a single product. The typed text is treated purely
 *     as a query string, never as a product id/slug.
 *   - Enter while a suggestion IS highlighted (via ArrowUp/ArrowDown,
 *     an explicit selection) or a suggestion is clicked with the
 *     mouse => opens that ONE product's detail page. This is the only
 *     path that can navigate to /product/:slug.
 *
 * Props
 * ------
 * styles         CSS module object (Header.module.css, reused so
 *                every visual token stays identical wherever this is
 *                embedded — header dropdown, mobile drawer, or the
 *                search results page).
 * isOpen         Whether this panel is currently visible/active. Used
 *                to (re)load history and reset transient state.
 * onClose        Called on Escape / after a successful search (no-op
 *                is fine for a permanently-visible inline bar).
 * onSearchSubmit Called with the committed query string on a full-text
 *                search (Enter with nothing highlighted, the search
 *                icon/submit button, or clicking a history/popular/
 *                trending chip). If not provided, SearchPanel
 *                navigates to /search?q=<query> itself.
 * variant        "dropdown" | "inline" — toggles a couple of layout
 *                classes; all behaviour is identical either way.
 * autoFocus      Whether the <input> should grab focus when opened.
 * inputId        Optional id, for label/aria association.
 * initialQuery   Optional starting value for the input — used so the
 *                search bar on the /search results page shows the
 *                term the person actually searched for, instead of
 *                starting empty.
 * ------------------------------------------------------------------
 */
const SearchPanel = ({
  styles,
  isOpen,
  onClose,
  onSearchSubmit,
  variant = "dropdown",
  autoFocus = false,
  inputId = "aurevian-search-input",
  initialQuery = "",
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  // ✅ Live suggestion state (backend-driven)
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const abortControllerRef = useRef(null);

  // Debounce the raw keystrokes so we don't hit the API on every char.
  const debouncedQuery = useDebouncedValue(query, 300);
  const isTyping = debouncedQuery.trim().length > 0;

  // The "browse" list shown when the input is empty: history +
  // popular + trending, flattened into one array so keyboard
  // navigation can move through all of them in visual order.
  const browseList = useMemo(() => {
    if (isTyping) return [];
    return [
      ...history.map((term) => ({ type: "history", label: term })),
      ...popularSearches.map((term) => ({ type: "popular", label: term })),
      ...trendingSearches.map((term) => ({ type: "trending", label: term })),
    ];
  }, [isTyping, history]);

  // Whichever list is currently on screen is the one Arrow keys move
  // through; Enter opens whatever is highlighted (or the raw query).
  const navigableList = isTyping ? suggestions : browseList;
  const { activeIndex, moveDown, moveUp, reset, setActiveIndex } =
    useActiveIndex(navigableList.length);

  // Reload history + clear transient state every time the panel opens.
  useEffect(() => {
    if (isOpen) {
      setHistory(getSearchHistory());
    } else {
      setQuery("");
      reset();
      setSuggestions([]);
      setSearchError(null);
      setIsSearching(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, autoFocus]);

  // ✅ Fetch live suggestions from the real product search API whenever
  // the debounced query changes. Cancels any in-flight request first
  // so an older, slower response can never overwrite a newer one.
  useEffect(() => {
    if (!isTyping) {
      setSuggestions([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const q = debouncedQuery.trim().replace(/\s+/g, " ");
    if (!q) {
      setSuggestions([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    setSearchError(null);

    axios
      .get(`${API_URL}/seller/products/search`, {
        params: { q, limit: 8 },
        signal: controller.signal,
      })
      .then((res) => {
        setSuggestions(res.data?.data?.products || []);
        setIsSearching(false);
      })
      .catch((err) => {
        // Aborted requests are expected (superseded by a newer
        // keystroke) — not a real error, ignore silently.
        if (
          axios.isCancel(err) ||
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }
        setSearchError("Something went wrong. Please try again.");
        setSuggestions([]);
        setIsSearching(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, isTyping]);

  // ✅ Full-text search commit — Enter with nothing highlighted, the
  // search icon/submit button, or clicking a history/popular/trending
  // chip. This is the ONLY path used when the person just types a
  // query and hits Enter: it always goes to the dedicated search
  // results page with the raw query string, and NEVER treats that
  // text as a product id/slug.
  const commitTextSearch = (term) => {
    const trimmed = (term || "").trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    setHistory(addSearchHistory(trimmed));
    setQuery(trimmed);
    reset();
    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    onClose && onClose();
  };

  // ✅ Opening one specific live-suggestion product — goes straight to
  // its existing product detail page instead of the listing page.
  // Only reachable via an explicit selection: mouse click, or Enter
  // while a suggestion is keyboard-highlighted.
  const openProduct = (product) => {
    if (!product?.productSlug) return;
    const trimmed = query.trim();
    if (trimmed) {
      setHistory(addSearchHistory(trimmed));
    }
    reset();
    navigate(`/product/${product.productSlug}`);
    onClose && onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Only an EXPLICITLY highlighted suggestion (via ArrowUp/ArrowDown)
    // opens a single product on Enter. Plain typing + Enter (the
    // default, activeIndex === -1) always commits a full-text search.
    if (activeIndex >= 0 && navigableList[activeIndex]) {
      const active = navigableList[activeIndex];
      if (isTyping) {
        openProduct(active);
      } else {
        commitTextSearch(active.label);
      }
    } else {
      commitTextSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveDown();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveUp();
    } else if (e.key === "Escape") {
      onClose && onClose();
    }
  };

  const handleRemoveHistoryItem = (e, term) => {
    e.stopPropagation(); // don't trigger the row's own click-to-search
    setHistory(removeSearchHistoryItem(term));
  };

  const handleClearAllHistory = () => {
    setHistory(clearSearchHistory());
  };

  const panelClass = `${styles.searchPanelBody} ${
    variant === "inline" ? styles.searchPanelInline : styles.searchPanelDropdown
  }`;

  return (
    <div className={panelClass}>
      <form
        className={styles.searchForm}
        onSubmit={handleFormSubmit}
        role="search"
      >
        <FiSearch className={styles.searchFormLeadIcon} aria-hidden="true" />
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          placeholder="Search for earrings, necklaces, rings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={navigableList.length > 0}
          aria-activedescendant={
            activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
          }
          role="combobox"
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <button
          type="submit"
          className={styles.searchIconBtn}
          aria-label="Submit search"
        >
          <FiSearch />
        </button>
      </form>

      <div className={styles.searchResults}>
        {isTyping ? (
          /* ============== LIVE SUGGESTIONS (from real product search API) ============== */
          isSearching ? (
            <p className={styles.noResults}>Searching...</p>
          ) : searchError ? (
            <p className={styles.noResults}>{searchError}</p>
          ) : suggestions.length > 0 ? (
            <ul className={styles.suggestionList} role="listbox">
              {suggestions.map((product, index) => {
                const displayPrice =
                  product.pricing?.salePrice || product.pricing?.originalPrice;
                return (
                  <li
                    key={product._id}
                    id={`search-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`${styles.suggestionItem} ${
                      index === activeIndex ? styles.suggestionItemActive : ""
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openProduct(product)}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {product.thumbnail?.url ? (
                      <img
                        src={product.thumbnail.url}
                        alt={product.productName}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <FiSearch
                        className={styles.suggestionIcon}
                        aria-hidden="true"
                      />
                    )}
                    <span className={styles.suggestionText}>
                      {highlightSegments(
                        product.productName,
                        debouncedQuery,
                      ).map((seg, i) =>
                        seg.match ? (
                          <mark key={i} className={styles.highlight}>
                            {seg.text}
                          </mark>
                        ) : (
                          <React.Fragment key={i}>{seg.text}</React.Fragment>
                        ),
                      )}
                    </span>
                    <span className={styles.suggestionCategory}>
                      {product.category?.categoryData?.label || ""}
                    </span>
                    {displayPrice ? (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontWeight: 600,
                          fontSize: "0.85em",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        ₹{displayPrice.toLocaleString()}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.noResults}>No products found.</p>
          )
        ) : (
          /* ============== BROWSE STATE: history + popular + trending ============== */
          <>
            {history.length > 0 && (
              <div className={styles.searchSection}>
                <div className={styles.searchSectionHeader}>
                  <h4>Recent Searches</h4>
                  <button
                    type="button"
                    className={styles.clearHistoryBtn}
                    onClick={handleClearAllHistory}
                  >
                    Clear All History
                  </button>
                </div>
                <ul className={styles.historyList} role="listbox">
                  {history.map((term, index) => (
                    <li
                      key={term}
                      id={`search-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      className={`${styles.suggestionItem} ${
                        index === activeIndex ? styles.suggestionItemActive : ""
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commitTextSearch(term)}
                    >
                      <FiClock
                        className={styles.suggestionIcon}
                        aria-hidden="true"
                      />
                      <span className={styles.suggestionText}>{term}</span>
                      <button
                        type="button"
                        className={styles.removeHistoryBtn}
                        aria-label={`Remove "${term}" from history`}
                        onClick={(e) => handleRemoveHistoryItem(e, term)}
                      >
                        <FiX />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.searchSection}>
              <h4>Popular Searches</h4>
              <div className={styles.chipRow}>
                {popularSearches.map((term, i) => {
                  const listIndex = history.length + i;
                  return (
                    <button
                      key={term}
                      type="button"
                      id={`search-option-${listIndex}`}
                      className={`${styles.searchChip} ${
                        listIndex === activeIndex ? styles.searchChipActive : ""
                      }`}
                      onMouseEnter={() => setActiveIndex(listIndex)}
                      onClick={() => commitTextSearch(term)}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.searchSection}>
              <h4>Trending Searches</h4>
              <div className={styles.chipRow}>
                {trendingSearches.map((term, i) => {
                  const listIndex = history.length + popularSearches.length + i;
                  return (
                    <button
                      key={term}
                      type="button"
                      id={`search-option-${listIndex}`}
                      className={`${styles.searchChip} ${styles.trendingChip} ${
                        listIndex === activeIndex ? styles.searchChipActive : ""
                      }`}
                      onMouseEnter={() => setActiveIndex(listIndex)}
                      onClick={() => commitTextSearch(term)}
                    >
                      <FiTrendingUp
                        className={styles.trendingIcon}
                        aria-hidden="true"
                      />
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
