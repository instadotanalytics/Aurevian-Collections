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

// ✅ Dynamic category list for placeholder animation
const CATEGORY_PHRASES = [
  "earrings",
  "necklaces",
  "rings",
  "bracelets",
  "pendants",
  "anklets",
  "bangles",
  "maang tikka",
  "nose pins",
  "chains",
];

// ✅ Updated popular searches with required categories (20+)
const POPULAR_SEARCHES = [
  // Jewelry Types
  "Earrings",
  "Glasses",
  "Rings",
  "Bangles",
  "Bracelets",
  "Anklets",
  "Maang Tikka",
  "Nose Pins",
  "Pendants",
  "Chains",
  "Premium Set",
  // Additional Categories
  "Necklaces",
  "Necklace Sets",
  "Earring Sets",
  "Bracelet Sets",
  "Ring Sets",
  "Pendant Sets",
  "Choker Necklaces",
  "Chain Necklaces",
  "Stud Earrings",
  "Dangle Earrings",
  "Hoop Earrings",
  "Cuff Bracelets",
  "Bangle Bracelets",
  "Tennis Bracelets",
  "Engagement Rings",
  "Wedding Bands",
  "Promise Rings",
  "Gold Jewelry",
  "Silver Jewelry",
  "Diamond Jewelry",
  "Pearl Jewelry",
  "Gemstone Jewelry",
  "Wedding Jewelry",
  "Bridal Jewelry",
  "Party Wear Jewelry",
  "Daily Wear Jewelry",
  "Traditional Jewelry",
  "Modern Jewelry",
  "Handmade Jewelry",
  "Customized Jewelry",
  "Gift Sets",
  "Anniversary Gifts",
  "Birthday Gifts",
  "Mother's Day Gifts",
  "Valentine's Day Gifts",
  "Festive Collections",
  "Luxury Jewelry",
  "Affordable Jewelry",
  "Kids Jewelry",
  "Men's Jewelry",
  "Women's Jewelry",
];

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

  // ✅ Dynamic placeholder state
  const [placeholderCategory, setPlaceholderCategory] = useState(CATEGORY_PHRASES[0]);
  const [placeholderPrefix] = useState("Search for ");
  const placeholderIntervalRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // ✅ Live suggestion state (backend-driven)
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const abortControllerRef = useRef(null);

  // Debounce the raw keystrokes so we don't hit the API on every char.
  const debouncedQuery = useDebouncedValue(query, 300);
  const isTyping = debouncedQuery.trim().length > 0;

  // The "browse" list shown when the input is empty: history + popular
  // (trending removed)
  const browseList = useMemo(() => {
    if (isTyping) return [];
    return [
      ...history.map((term) => ({ type: "history", label: term })),
      ...POPULAR_SEARCHES.map((term) => ({ type: "popular", label: term })),
    ];
  }, [isTyping, history]);

  // Whichever list is currently on screen is the one Arrow keys move
  // through; Enter opens whatever is highlighted (or the raw query).
  const navigableList = isTyping ? suggestions : browseList;
  const { activeIndex, moveDown, moveUp, reset, setActiveIndex } =
    useActiveIndex(navigableList.length);

  // ✅ Dynamic placeholder animation - "Search for " prefix + rotating category
  // Categories appear from top to bottom slowly
  useEffect(() => {
    // Only run animation when panel is open and query is empty
    if (!isOpen || query.length > 0) {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
        placeholderIntervalRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      return;
    }

    let currentPhraseIdx = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    const animatePlaceholder = () => {
      const currentPhrase = CATEGORY_PHRASES[currentPhraseIdx];

      if (!isDeleting && !isPaused) {
        // ✅ Typing - characters appear from top to bottom (left to right)
        if (charIndex < currentPhrase.length) {
          const currentDisplayText = currentPhrase.substring(0, charIndex + 1);
          setPlaceholderCategory(currentDisplayText);
          charIndex++;
        } else {
          // ✅ Full word is typed - pause before deleting
          isPaused = true;
          animationTimeoutRef.current = setTimeout(() => {
            isPaused = false;
            isDeleting = true;
            animationTimeoutRef.current = null;
          }, 1500);
        }
      } else if (isDeleting) {
        // ✅ Deleting - characters disappear one by one
        if (charIndex > 0) {
          const currentDisplayText = currentPhrase.substring(0, charIndex - 1);
          setPlaceholderCategory(currentDisplayText);
          charIndex--;
        } else {
          // ✅ Completely deleted - move to next category
          isDeleting = false;
          currentPhraseIdx = (currentPhraseIdx + 1) % CATEGORY_PHRASES.length;
          charIndex = 0;
          // Small pause before starting next category
          animationTimeoutRef.current = setTimeout(() => {
            animationTimeoutRef.current = null;
            // Start typing next category
          }, 300);
        }
      }
    };

    // Start animation with interval (slower speed for smooth effect)
    placeholderIntervalRef.current = setInterval(animatePlaceholder, 80);

    return () => {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
        placeholderIntervalRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [isOpen, query]);

  // Reset placeholder when panel opens
  useEffect(() => {
    if (isOpen) {
      setPlaceholderCategory(CATEGORY_PHRASES[0]);
    }
  }, [isOpen]);

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

  // ✅ Full-text search commit — Navigates to /search?q= with the query
  const commitTextSearch = (term) => {
    const trimmed = (term || "").trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    
    // Add to search history
    setHistory(addSearchHistory(trimmed));
    setQuery(trimmed);
    reset();
    
    // Close the search panel
    onClose && onClose();
    
    // ✅ Navigate to search results page with the query
    // Use navigate with replace: false to allow browser back button
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
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
    onClose && onClose();
    navigate(`/product/${product.productSlug}`);
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

  // ✅ Get only first 20 popular searches to display
  const displayPopularSearches = POPULAR_SEARCHES.slice(0, 20);

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
          placeholder={`${placeholderPrefix}${placeholderCategory}`}
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
          /* ============== BROWSE STATE: history + popular (trending removed) ============== */
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
                {displayPopularSearches.map((term, i) => {
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
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;