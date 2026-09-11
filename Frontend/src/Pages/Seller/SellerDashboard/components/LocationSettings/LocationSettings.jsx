
// src/Pages/SuperAdmin/SuperAdminDashboard/components/LocationSettings.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    FiMapPin,
    FiSave,
    FiToggleLeft,
    FiToggleRight,
    FiLoader,
    FiAlertCircle,
    FiUsers,
    FiPackage,
    FiSearch,
    FiX,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import styles from "./LocationSettings.module.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://aurevian-collections.onrender.com/api";

// Skeleton Loader Component (mirrors SellerRequests' SkeletonLoader)
const SkeletonLoader = ({ count = 8 }) => {
    return (
        <div className={styles.skeletonContainer}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={styles.skeletonRow}>
                    <div className={styles.skeletonIndex}></div>
                    <div className={styles.skeletonName}>
                        <div className={styles.skeletonLine}></div>
                        <div className={styles.skeletonLineShort}></div>
                    </div>
                    <div className={styles.skeletonStore}></div>
                    <div className={styles.skeletonStatus}></div>
                </div>
            ))}
        </div>
    );
};

const LocationSettings = () => {
    const token = localStorage.getItem("superAdminToken");
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const [settings, setSettings] = useState(null);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        locationRankingEnabled: true,
        nearbyRadiusKm: 5,
        fartherRadiusKm: 20,
        farRadiusKm: 50,
    });

    // Sellers table (location coverage)
    const [sellers, setSellers] = useState([]);
    const [sellersLoading, setSellersLoading] = useState(true);
    const [onlyMissing, setOnlyMissing] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAll = async () => {
        try {
            setLoading(true);
            setError(null);
            const [settingsRes, overviewRes] = await Promise.all([
                axios.get(`${API_URL}/super-admin/location/settings`, authHeader),
                axios.get(`${API_URL}/super-admin/location/overview`, authHeader),
            ]);
            if (settingsRes.data.success) {
                setSettings(settingsRes.data.data);
                setForm({
                    locationRankingEnabled: settingsRes.data.data.locationRankingEnabled,
                    nearbyRadiusKm: settingsRes.data.data.nearbyRadiusKm,
                    fartherRadiusKm: settingsRes.data.data.fartherRadiusKm,
                    farRadiusKm: settingsRes.data.data.farRadiusKm,
                });
            }
            if (overviewRes.data.success) {
                setOverview(overviewRes.data.data);
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Unable to load location settings. Please try again.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSellers = async () => {
        try {
            setSellersLoading(true);
            const res = await axios.get(`${API_URL}/super-admin/location/sellers`, {
                ...authHeader,
                params: {
                    page,
                    limit: 10,
                    onlyMissing: onlyMissing ? "true" : "false",
                    search,
                },
            });
            if (res.data.success) {
                setSellers(res.data.data);
                setTotalPages(res.data.pagination.pages);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to load seller locations",
            );
        } finally {
            setSellersLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchSellers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, onlyMissing, search]);

    useEffect(() => {
        setPage(1);
    }, [onlyMissing, search]);

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const n1 = Number(form.nearbyRadiusKm);
        const n2 = Number(form.fartherRadiusKm);
        const n3 = Number(form.farRadiusKm);

        if (!(n1 < n2 && n2 < n3)) {
            toast.error(
                "Thresholds must be strictly increasing: nearby < farther < far",
            );
            return;
        }

        try {
            setSaving(true);
            const res = await axios.put(
                `${API_URL}/super-admin/location/settings`,
                {
                    locationRankingEnabled: form.locationRankingEnabled,
                    nearbyRadiusKm: n1,
                    fartherRadiusKm: n2,
                    farRadiusKm: n3,
                },
                authHeader,
            );
            if (res.data.success) {
                setSettings(res.data.data);
                toast.success("Location settings updated");
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update location settings",
            );
        } finally {
            setSaving(false);
        }
    };

    const getSerialNumber = (index) => (page - 1) * 10 + index + 1;

    const renderEmptyState = () => (
        <div className={styles.emptyState}>
            <FiMapPin size={60} className={styles.emptyIcon} />
            <h3>No sellers found</h3>
            <p>
                {search || onlyMissing
                    ? "Try adjusting your filters or search terms"
                    : "Seller showroom locations will show up here once configured"}
            </p>
            {(search || onlyMissing) && (
                <button
                    className={styles.clearFiltersBtn}
                    onClick={() => {
                        setSearch("");
                        setOnlyMissing(false);
                        setPage(1);
                    }}
                >
                    <FiX size={18} />
                    Clear All Filters
                </button>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <FiLoader className={styles.spinner} />
                <p>Loading location settings...</p>
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className={styles.errorContainer}>
                <FiAlertCircle className={styles.errorIcon} />
                <p>{error}</p>
                <button className={styles.retryBtn} onClick={fetchAll}>
                    Retry
                </button>
            </div>
        );
    }

    const coveragePct = overview
        ? overview.totalSellers > 0
            ? Math.round(
                (overview.sellersWithLocation / overview.totalSellers) * 100,
            )
            : 0
        : 0;

    const showLoadingState = sellersLoading && sellers.length === 0;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Location Ranking Settings</h1>
                    <span className={styles.countPill}>
                        {overview ? overview.totalSellers : 0} sellers
                    </span>
                </div>
                {overview && (
                    <div className={styles.headerRight}>
                        <div className={styles.statsBar}>
                            <span className={styles.statsLabel}>
                                <FiUsers size={14} />
                                Overview:
                            </span>
                            <span className={styles.statsItem}>
                                Location set: <strong>{overview.sellersWithLocation}</strong>/
                                {overview.totalSellers} ({coveragePct}%)
                            </span>
                            <span className={styles.statsItem}>
                                Products eligible:{" "}
                                <strong>{overview.productsWithLocationRanking}</strong>/
                                {overview.totalPublishedProducts}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <p className={styles.pageSubtitle}>
                Manage distance-based product ranking, showroom location coverage,
                and thresholds. Exact user coordinates are never stored or shown
                here.
            </p>

            {/* Settings card */}
            <form className={styles.settingsCard} onSubmit={handleSave}>
                <div className={styles.toggleRow}>
                    <div>
                        <span className={styles.toggleLabel}>
                            Enable Location-Based Ranking
                        </span>
                        <p className={styles.toggleHint}>
                            When off, products and search results ignore location entirely,
                            regardless of what the storefront sends.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.toggleBtn}
                        onClick={() =>
                            handleFieldChange(
                                "locationRankingEnabled",
                                !form.locationRankingEnabled,
                            )
                        }
                    >
                        {form.locationRankingEnabled ? (
                            <FiToggleRight size={34} className={styles.toggleOn} />
                        ) : (
                            <FiToggleLeft size={34} className={styles.toggleOff} />
                        )}
                    </button>
                </div>

                <div className={styles.thresholdGrid}>
                    <div className={styles.field}>
                        <label>Nearby radius (km)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={form.nearbyRadiusKm}
                            onChange={(e) =>
                                handleFieldChange("nearbyRadiusKm", e.target.value)
                            }
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Farther radius (km)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={form.fartherRadiusKm}
                            onChange={(e) =>
                                handleFieldChange("fartherRadiusKm", e.target.value)
                            }
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Far radius (km)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={form.farRadiusKm}
                            onChange={(e) =>
                                handleFieldChange("farRadiusKm", e.target.value)
                            }
                        />
                    </div>
                </div>
                <p className={styles.thresholdHint}>
                    Products beyond the "far" radius are labeled "very far" but are
                    never hidden — they still appear, ranked after closer matches.
                    Thresholds must be strictly increasing.
                </p>

                <button type="submit" className={styles.saveBtn} disabled={saving}>
                    <FiSave size={15} />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </form>

            {/* Sellers & Showrooms */}
            <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>Sellers &amp; Showrooms</h2>
                <p className={styles.sectionSubtitle}>
                    Which sellers have configured a showroom location for ranking.
                </p>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchWrapper}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search sellers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.missingFilter}>
                        <input
                            type="checkbox"
                            checked={onlyMissing}
                            onChange={(e) => setOnlyMissing(e.target.checked)}
                        />
                        Show only missing location
                    </label>

                    {(search || onlyMissing) && (
                        <button
                            className={styles.clearFiltersBtn}
                            onClick={() => {
                                setSearch("");
                                setOnlyMissing(false);
                                setPage(1);
                            }}
                        >
                            <FiX size={16} />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            {showLoadingState ? (
                <div className={styles.tableContainer}>
                    <SkeletonLoader count={8} />
                </div>
            ) : sellers.length === 0 ? (
                renderEmptyState()
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.sellerTable}>
                        <thead>
                            <tr>
                                <th className={styles.indexCell}>#</th>
                                <th className={styles.sellerCell}>Seller</th>
                                <th className={styles.storeCell}>Store</th>
                                <th className={styles.cityCell}>City / State</th>
                                <th className={styles.statusCell}>Location Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellers.map((s, index) => (
                                <tr key={s._id} className={styles.tableRow}>
                                    <td className={styles.indexCell} data-label="#">
                                        <span className={styles.indexNumber}>
                                            {getSerialNumber(index)}
                                        </span>
                                    </td>
                                    <td className={styles.sellerCell} data-label="Seller">
                                        <div className={styles.sellerInfo}>
                                            <div className={styles.sellerAvatar}>
                                                <span>
                                                    {s.sellerName
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase() || "S"}
                                                </span>
                                            </div>
                                            <div className={styles.sellerName}>
                                                {s.sellerName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.storeCell} data-label="Store">
                                        {s.storeName || "—"}
                                    </td>
                                    <td className={styles.cityCell} data-label="City / State">
                                        {s.showroomCity || "—"}
                                        {s.showroomState ? `, ${s.showroomState}` : ""}
                                    </td>
                                    <td
                                        className={styles.statusCell}
                                        data-label="Location Status"
                                    >
                                        {s.locationConfigured ? (
                                            <span
                                                className={`${styles.statusBadge} ${styles.statusApproved}`}
                                            >
                                                Configured
                                            </span>
                                        ) : (
                                            <span
                                                className={`${styles.statusBadge} ${styles.statusRejected}`}
                                            >
                                                Not Set
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!showLoadingState && sellers.length > 0 && totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.paginationBtn}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <FiChevronLeft size={18} />
                    </button>

                    <div className={styles.paginationPages}>
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            const isActive = p === page;
                            const isNearCurrent = Math.abs(p - page) <= 2;
                            const isFirst = p === 1;
                            const isLast = p === totalPages;

                            if (isNearCurrent || isFirst || isLast) {
                                return (
                                    <button
                                        key={p}
                                        className={`${styles.pageBtn} ${
                                            isActive ? styles.activePage : ""
                                        }`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                );
                            }

                            if (
                                (p === page - 3 && page > 4) ||
                                (p === page + 3 && page < totalPages - 3)
                            ) {
                                return (
                                    <span key={p} className={styles.pageDots}>
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <button
                        className={styles.paginationBtn}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        <FiChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default LocationSettings;