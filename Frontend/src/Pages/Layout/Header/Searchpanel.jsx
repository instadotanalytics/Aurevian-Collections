import React, { useState, useEffect, useMemo, useRef } from "react";
import { FiSearch, FiClock, FiX, FiTrendingUp } from "react-icons/fi";

import { searchableProducts, popularSearches, trendingSearches } from "./SearchData";
import {
  useDebouncedValue,
  getSuggestions,
  highlightSegments,
  getSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
  useActiveIndex,
} from "./searchUtils";

/**
 * SearchPanel
 * ------------------------------------------------------------------
 * One implementation shared by:
 *   - the desktop icon-triggered dropdown  (variant="dropdown")
 *   - the mobile drawer's inline search     (variant="inline")
 *
 * It owns all search behaviour (history, live suggestions, keyboard
 * nav, highlighting) so Header.jsx only has to render <SearchPanel />
 * in each spot and stays focused on layout/nav — nothing about the
 * existing header markup, icon, or animations changes.
 *
 * Props
 * ------
 * styles         CSS module object from Header.module.css (reused so
 *                every visual token — gold, ivory, radii, shadows —
 *                stays identical to the rest of the header).
 * isOpen         Whether this panel is currently visible. Used to
 *                reset transient state and (re)load history.
 * onClose        Called on Escape / after a successful search.
 * onSearchSubmit Same callback Header already accepts as a prop —
 *                called with the final search term.
 * variant        "dropdown" | "inline" — toggles a couple of layout
 *                classes; all behaviour is identical either way.
 * autoFocus      Whether the <input> should grab focus when opened.
 * inputId        Optional id, for label/aria association.
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
}) => {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  // Debounce the raw keystrokes so we don't re-filter on every char.
  const debouncedQuery = useDebouncedValue(query, 300);
  const isTyping = debouncedQuery.trim().length > 0;

  // Live suggestions (memoized so we don't recompute unless the
  // debounced query actually changes).
  const suggestions = useMemo(() => {
    if (!isTyping) return [];
    return getSuggestions(debouncedQuery, searchableProducts, 8);
  }, [debouncedQuery, isTyping]);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, autoFocus]);

  const commitSearch = (term) => {
    const trimmed = (term || "").trim();
    if (!trimmed) return;
    setHistory(addSearchHistory(trimmed));
    setQuery("");
    reset();
    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      // Fallback for demo purposes — replace with real search routing
      console.log("Search submitted:", trimmed);
    }
    onClose && onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && navigableList[activeIndex]) {
      const active = navigableList[activeIndex];
      commitSearch(isTyping ? active.title : active.label);
    } else {
      commitSearch(query);
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
      <form className={styles.searchForm} onSubmit={handleFormSubmit} role="search">
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
        <button type="submit" className={styles.searchIconBtn} aria-label="Submit search">
          <FiSearch />
        </button>
      </form>

      <div className={styles.searchResults}>
        {isTyping ? (
          /* ============== LIVE SUGGESTIONS ============== */
          suggestions.length > 0 ? (
            <ul className={styles.suggestionList} role="listbox">
              {suggestions.map((product, index) => (
                <li
                  key={product.id}
                  id={`search-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`${styles.suggestionItem} ${
                    index === activeIndex ? styles.suggestionItemActive : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commitSearch(product.title)}
                >
                  <FiSearch className={styles.suggestionIcon} aria-hidden="true" />
                  <span className={styles.suggestionText}>
                    {highlightSegments(product.title, debouncedQuery).map((seg, i) =>
                      seg.match ? (
                        <mark key={i} className={styles.highlight}>
                          {seg.text}
                        </mark>
                      ) : (
                        <React.Fragment key={i}>{seg.text}</React.Fragment>
                      ),
                    )}
                  </span>
                  <span className={styles.suggestionCategory}>{product.category}</span>
                </li>
              ))}
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
                      onClick={() => commitSearch(term)}
                    >
                      <FiClock className={styles.suggestionIcon} aria-hidden="true" />
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
                      onClick={() => commitSearch(term)}
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
                      onClick={() => commitSearch(term)}
                    >
                      <FiTrendingUp className={styles.trendingIcon} aria-hidden="true" />
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