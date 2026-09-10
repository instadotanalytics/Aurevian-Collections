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
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import styles from "./LocationSettings.module.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://aurevian-collections.onrender.com/api";

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
                params: { page, limit: 10, onlyMissing: onlyMissing ? "true" : "false" },
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
    }, [page, onlyMissing]);

    useEffect(() => {
        setPage(1);
    }, [onlyMissing]);

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

    return (
        <div className={styles.page}>
            <div className={styles.headerBlock}>
                <h2 className={styles.title}>Location Ranking Settings</h2>
                <p className={styles.subtitle}>
                    Manage distance-based product ranking, showroom location coverage,
                    and thresholds. Exact user coordinates are never stored or shown
                    here.
                </p>
            </div>

            {/* Overview cards */}
            {overview && (
                <div className={styles.overviewGrid}>
                    <div className={styles.overviewCard}>
                        <FiUsers size={20} />
                        <div>
                            <span className={styles.overviewValue}>
                                {overview.sellersWithLocation}/{overview.totalSellers}
                            </span>
                            <span className={styles.overviewLabel}>
                                Sellers with showroom location ({coveragePct}%)
                            </span>
                        </div>
                    </div>
                    <div className={styles.overviewCard}>
                        <FiPackage size={20} />
                        <div>
                            <span className={styles.overviewValue}>
                                {overview.productsWithLocationRanking}/
                                {overview.totalPublishedProducts}
                            </span>
                            <span className={styles.overviewLabel}>
                                Published products eligible for location ranking
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings form */}
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

            {/* Sellers & Showrooms table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <div>
                        <h3 className={styles.tableTitle}>Sellers &amp; Showrooms</h3>
                        <p className={styles.tableSubtitle}>
                            Which sellers have configured a showroom location for ranking.
                        </p>
                    </div>
                    <label className={styles.missingFilter}>
                        <input
                            type="checkbox"
                            checked={onlyMissing}
                            onChange={(e) => setOnlyMissing(e.target.checked)}
                        />
                        Show only missing location
                    </label>
                </div>

                {sellersLoading ? (
                    <div className={styles.tableLoading}>
                        <FiLoader className={styles.spinner} />
                    </div>
                ) : sellers.length === 0 ? (
                    <div className={styles.tableEmpty}>
                        <FiMapPin size={28} />
                        <p>No sellers match this filter.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Seller</th>
                                        <th>Store</th>
                                        <th>City / State</th>
                                        <th>Location Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellers.map((s) => (
                                        <tr key={s._id}>
                                            <td>{s.sellerName}</td>
                                            <td>{s.storeName || "—"}</td>
                                            <td>
                                                {s.showroomCity || "—"}
                                                {s.showroomState ? `, ${s.showroomState}` : ""}
                                            </td>
                                            <td>
                                                {s.locationConfigured ? (
                                                    <span className={styles.badgeOk}>Configured</span>
                                                ) : (
                                                    <span className={styles.badgeMissing}>
                                                        Not Set
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <FiChevronLeft size={16} /> Previous
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next <FiChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LocationSettings;