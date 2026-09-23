// src/Pages/SuperAdmin/SuperAdminDashboard/components/PayoutsManagement/PayoutsManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    FiRefreshCw,
    FiSearch,
    FiDownload,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiSlash,
    FiEye,
    FiX,
    FiSave,
} from "react-icons/fi";
import styles from "./PayoutsManagement.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = () => {
    const token = localStorage.getItem("superAdminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatINR = (n) =>
    `₹${(Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const TXN_STATUS_META = {
    pending: { label: "Pending", cls: "pending" },
    eligible: { label: "Eligible", cls: "eligible" },
    processing: { label: "Processing", cls: "processing" },
    paid: { label: "Paid", cls: "paidStatus" },
    failed: { label: "Failed", cls: "failedStatus" },
    cancelled: { label: "Cancelled", cls: "cancelledStatus" },
    reversed: { label: "Reversed", cls: "reversedStatus" },
    refunded: { label: "Refunded", cls: "refunded" },
};

const REQUEST_STATUS_META = {
    requested: { label: "Requested", cls: "pending", icon: FiClock },
    processing: { label: "Processing", cls: "processing", icon: FiRefreshCw },
    paid: { label: "Paid", cls: "paidStatus", icon: FiCheckCircle },
    rejected: { label: "Rejected", cls: "failedStatus", icon: FiXCircle },
};

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
    { id: "requests", label: "Payout Requests" },
];

const PayoutsManagement = () => {
    const [tab, setTab] = useState("overview");

    // ---- Overview ----
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [settingsForm, setSettingsForm] = useState({
        commissionPercent: "",
        minimumPayoutAmount: "",
    });
    const [settingsSaving, setSettingsSaving] = useState(false);

    // ---- Transactions tab ----
    const [txRows, setTxRows] = useState([]);
    const [txLoading, setTxLoading] = useState(true);
    const [txPagination, setTxPagination] = useState(null);
    const [txPage, setTxPage] = useState(1);
    const [txFilters, setTxFilters] = useState({
        order: "",
        product: "",
        status: "all",
        from: "",
        to: "",
    });

    // ---- Requests tab ----
    const [reqRows, setReqRows] = useState([]);
    const [reqLoading, setReqLoading] = useState(true);
    const [reqPagination, setReqPagination] = useState(null);
    const [reqPage, setReqPage] = useState(1);
    const [reqStatusFilter, setReqStatusFilter] = useState("all");

    // ---- Detail modal (transaction) ----
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState(null);

    // ---- Action modal (payout request) ----
    const [actionTarget, setActionTarget] = useState(null); // the payout row
    const [actionStatus, setActionStatus] = useState("processing");
    const [actionReason, setActionReason] = useState("");
    const [actionReference, setActionReference] = useState("");
    const [actionSubmitting, setActionSubmitting] = useState(false);

    const fetchSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const [summaryRes, settingsRes] = await Promise.all([
                axios.get(`${API_URL}/super-admin/payouts/summary`, {
                    headers: authHeader(),
                }),
                axios.get(`${API_URL}/super-admin/settings/platform`, {
                    headers: authHeader(),
                }),
            ]);
            if (summaryRes.data.success) setSummary(summaryRes.data.data);
            if (settingsRes.data.success) {
                setSettingsForm({
                    commissionPercent: settingsRes.data.data.commissionPercent,
                    minimumPayoutAmount: settingsRes.data.data.minimumPayoutAmount,
                });
            }
        } catch (error) {
            console.error("Error loading payout summary:", error);
            toast.error("Failed to load platform revenue summary");
        } finally {
            setSummaryLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async (page, filters) => {
        setTxLoading(true);
        try {
            const params = { page, limit: 20 };
            if (filters.status !== "all") params.status = filters.status;
            if (filters.order) params.order = filters.order;
            if (filters.product) params.product = filters.product;
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;

            const res = await axios.get(`${API_URL}/super-admin/payouts`, {
                headers: authHeader(),
                params,
            });
            if (res.data.success) {
                setTxRows(res.data.data);
                setTxPagination(res.data.pagination);
            }
        } catch (error) {
            console.error("Error loading payout transactions:", error);
            toast.error("Failed to load transactions");
        } finally {
            setTxLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(async (page, status) => {
        setReqLoading(true);
        try {
            const params = { page, limit: 20 };
            if (status !== "all") params.status = status;
            const res = await axios.get(`${API_URL}/super-admin/payouts/requests`, {
                headers: authHeader(),
                params,
            });
            if (res.data.success) {
                setReqRows(res.data.data);
                setReqPagination(res.data.pagination);
            }
        } catch (error) {
            console.error("Error loading payout requests:", error);
            toast.error("Failed to load payout requests");
        } finally {
            setReqLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        if (tab === "transactions") fetchTransactions(txPage, txFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, txPage, txFilters]);

    useEffect(() => {
        if (tab === "requests") fetchRequests(reqPage, reqStatusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, reqPage, reqStatusFilter]);

    const handleTxFilterChange = (key, value) => {
        setTxPage(1);
        setTxFilters((f) => ({ ...f, [key]: value }));
    };

    const openDetail = async (id) => {
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailData(null);
        try {
            const res = await axios.get(`${API_URL}/super-admin/payouts/${id}`, {
                headers: authHeader(),
            });
            if (res.data.success) setDetailData(res.data.data);
        } catch (error) {
            toast.error("Failed to load transaction detail");
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setDetailData(null);
    };

    const handleExport = async () => {
        try {
            const params = {};
            if (txFilters.status !== "all") params.status = txFilters.status;
            if (txFilters.order) params.order = txFilters.order;
            if (txFilters.product) params.product = txFilters.product;
            if (txFilters.from) params.from = txFilters.from;
            if (txFilters.to) params.to = txFilters.to;

            const res = await axios.get(`${API_URL}/super-admin/payouts/export`, {
                headers: authHeader(),
                params,
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `payout-ledger-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Failed to export CSV");
        }
    };

    const openAction = (payout, status) => {
        setActionTarget(payout);
        setActionStatus(status);
        setActionReason("");
        setActionReference("");
    };

    const closeAction = () => setActionTarget(null);

    const submitAction = async () => {
        if (actionStatus === "rejected" && !actionReason.trim()) {
            toast.error("A rejection reason is required");
            return;
        }
        if (actionStatus === "paid" && !actionReference.trim()) {
            toast.error("A payment reference (bank UTR / transaction id) is required");
            return;
        }
        setActionSubmitting(true);
        try {
            const res = await axios.patch(
                `${API_URL}/super-admin/payouts/requests/${actionTarget._id}/status`,
                {
                    status: actionStatus,
                    reason: actionReason || undefined,
                    paymentReferenceId: actionReference || undefined,
                },
                { headers: authHeader() },
            );
            if (res.data.success) {
                toast.success(res.data.message);
                closeAction();
                fetchRequests(reqPage, reqStatusFilter);
                fetchSummary();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update payout");
        } finally {
            setActionSubmitting(false);
        }
    };

    const saveSettings = async () => {
        setSettingsSaving(true);
        try {
            const res = await axios.patch(
                `${API_URL}/super-admin/settings/platform`,
                {
                    commissionPercent: Number(settingsForm.commissionPercent),
                    minimumPayoutAmount: Number(settingsForm.minimumPayoutAmount),
                },
                { headers: authHeader() },
            );
            if (res.data.success) {
                toast.success("Platform settings updated");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update settings",
            );
        } finally {
            setSettingsSaving(false);
        }
    };

    return (
        <div className={styles.payoutsManagement}>
            <div className={styles.tabs}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ============================================
          OVERVIEW TAB
          ============================================ */}
            {tab === "overview" && (
                <div className={styles.overviewPanel}>
                    {summaryLoading ? (
                        <div className={styles.loadingContainer}>
                            <FiRefreshCw className={styles.spinner} />
                            <p>Loading platform revenue...</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.statsRow}>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Total Gross Sales</span>
                                    <span className={styles.statValue}>
                                        {formatINR(summary?.totalGrossSales)}
                                    </span>
                                </div>
                                <div className={`${styles.statCard} ${styles.highlight}`}>
                                    <span className={styles.statLabel}>Platform Commission</span>
                                    <span className={styles.statValue}>
                                        {formatINR(summary?.totalPlatformCommission)}
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Total Seller Earnings</span>
                                    <span className={styles.statValue}>
                                        {formatINR(summary?.totalSellerEarnings)}
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Pending Seller Payouts</span>
                                    <span className={styles.statValue}>
                                        {formatINR(summary?.pendingSellerPayouts)}
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Completed Payouts</span>
                                    <span className={styles.statValue}>
                                        {formatINR(summary?.completedPayouts)}
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Failed Payouts</span>
                                    <span className={styles.statValue}>
                                        {formatINR(summary?.failedPayouts)}
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>
                                        Refunded / Reversed
                                    </span>
                                    <span className={styles.statValue}>
                                        {formatINR(summary?.refundedOrReversedAmount)}
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Transactions</span>
                                    <span className={styles.statValue}>
                                        {summary?.numberOfTransactions ?? 0}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.settingsCard}>
                                <h4>Platform Financial Settings</h4>
                                <p className={styles.settingsHint}>
                                    Commission is calculated server-side on every eligible sale.
                                    Changing the rate here only affects new sales going forward
                                    — historical transactions keep their original snapshot.
                                </p>
                                <div className={styles.settingsFields}>
                                    <label>
                                        Commission Rate (%)
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={settingsForm.commissionPercent}
                                            onChange={(e) =>
                                                setSettingsForm((f) => ({
                                                    ...f,
                                                    commissionPercent: e.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label>
                                        Minimum Payout Amount (₹)
                                        <input
                                            type="number"
                                            min="0"
                                            value={settingsForm.minimumPayoutAmount}
                                            onChange={(e) =>
                                                setSettingsForm((f) => ({
                                                    ...f,
                                                    minimumPayoutAmount: e.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <button
                                        className={styles.saveBtn}
                                        onClick={saveSettings}
                                        disabled={settingsSaving}
                                    >
                                        <FiSave size={14} />
                                        {settingsSaving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ============================================
          TRANSACTIONS TAB
          ============================================ */}
            {tab === "transactions" && (
                <div className={styles.panel}>
                    <div className={styles.toolbar}>
                        <div className={styles.filtersRow}>
                            <div className={styles.searchBox}>
                                <FiSearch className={styles.searchIcon} />
                                <input
                                    placeholder="Order #"
                                    value={txFilters.order}
                                    onChange={(e) => handleTxFilterChange("order", e.target.value)}
                                />
                            </div>
                            <div className={styles.searchBox}>
                                <FiSearch className={styles.searchIcon} />
                                <input
                                    placeholder="Product name"
                                    value={txFilters.product}
                                    onChange={(e) =>
                                        handleTxFilterChange("product", e.target.value)
                                    }
                                />
                            </div>
                            <select
                                className={styles.filterSelect}
                                value={txFilters.status}
                                onChange={(e) => handleTxFilterChange("status", e.target.value)}
                            >
                                <option value="all">All statuses</option>
                                {Object.keys(TXN_STATUS_META).map((s) => (
                                    <option key={s} value={s}>
                                        {TXN_STATUS_META[s].label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={txFilters.from}
                                onChange={(e) => handleTxFilterChange("from", e.target.value)}
                            />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={txFilters.to}
                                onChange={(e) => handleTxFilterChange("to", e.target.value)}
                            />
                        </div>
                        <button className={styles.exportBtn} onClick={handleExport}>
                            <FiDownload size={14} />
                            Export CSV
                        </button>
                    </div>

                    <div className={styles.tableWrapper}>
                        {txLoading ? (
                            <div className={styles.loadingContainer}>
                                <FiRefreshCw className={styles.spinner} />
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Seller</th>
                                        <th>Order</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Gross</th>
                                        <th>Fee</th>
                                        <th>Net</th>
                                        <th>Status</th>
                                        <th>Reference</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {txRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className={styles.emptyRow}>
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        txRows.map((tx) => {
                                            const meta = TXN_STATUS_META[tx.status] || {
                                                label: tx.status,
                                                cls: "pending",
                                            };
                                            return (
                                                <tr key={tx._id}>
                                                    <td>
                                                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                                                    </td>
                                                    <td>
                                                        {tx.seller?.storeInfo?.storeName ||
                                                            `${tx.seller?.firstName || ""} ${tx.seller?.lastName || ""}`.trim() ||
                                                            "—"}
                                                    </td>
                                                    <td className={styles.mono}>{tx.orderNumber}</td>
                                                    <td>{tx.productNameSnapshot}</td>
                                                    <td>{tx.quantity}</td>
                                                    <td>{formatINR(tx.grossAmount)}</td>
                                                    <td>{formatINR(tx.commissionAmount)}</td>
                                                    <td className={styles.netCell}>
                                                        {formatINR(tx.sellerNetAmount)}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`${styles.statusBadge} ${styles[meta.cls]}`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                    </td>
                                                    <td className={styles.mono}>
                                                        {tx.referenceId || "—"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={styles.iconBtn}
                                                            onClick={() => openDetail(tx._id)}
                                                        >
                                                            <FiEye size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {txPagination && txPagination.totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                disabled={txPage <= 1}
                                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                            >
                                Previous
                            </button>
                            <span>
                                Page {txPagination.currentPage} of {txPagination.totalPages} (
                                {txPagination.total} total)
                            </span>
                            <button
                                disabled={txPage >= txPagination.totalPages}
                                onClick={() => setTxPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================
          PAYOUT REQUESTS TAB
          ============================================ */}
            {tab === "requests" && (
                <div className={styles.panel}>
                    <div className={styles.toolbar}>
                        <div className={styles.filtersRow}>
                            <select
                                className={styles.filterSelect}
                                value={reqStatusFilter}
                                onChange={(e) => {
                                    setReqPage(1);
                                    setReqStatusFilter(e.target.value);
                                }}
                            >
                                <option value="all">All statuses</option>
                                {Object.keys(REQUEST_STATUS_META).map((s) => (
                                    <option key={s} value={s}>
                                        {REQUEST_STATUS_META[s].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        {reqLoading ? (
                            <div className={styles.loadingContainer}>
                                <FiRefreshCw className={styles.spinner} />
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Requested</th>
                                        <th>Seller</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Reference</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reqRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className={styles.emptyRow}>
                                                No payout requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        reqRows.map((r) => {
                                            const meta =
                                                REQUEST_STATUS_META[r.status] ||
                                                REQUEST_STATUS_META.requested;
                                            const Icon = meta.icon;
                                            return (
                                                <tr key={r._id}>
                                                    <td>
                                                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                                                    </td>
                                                    <td>
                                                        {r.seller?.storeInfo?.storeName ||
                                                            `${r.seller?.firstName || ""} ${r.seller?.lastName || ""}`.trim() ||
                                                            "—"}
                                                    </td>
                                                    <td className={styles.netCell}>
                                                        {formatINR(r.amount)}
                                                    </td>
                                                    <td>
                                                        {r.method?.type === "upi"
                                                            ? `UPI • ${r.method.upiId}`
                                                            : `Bank •••• ${r.method?.accountNumberMasked?.slice(-4) || ""}`}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`${styles.statusBadge} ${styles[meta.cls]}`}
                                                        >
                                                            <Icon size={12} /> {meta.label}
                                                        </span>
                                                    </td>
                                                    <td className={styles.mono}>
                                                        {r.paymentReferenceId || "—"}
                                                    </td>
                                                    <td className={styles.actionsCell}>
                                                        {r.status === "requested" && (
                                                            <>
                                                                <button
                                                                    className={styles.smallBtn}
                                                                    onClick={() => openAction(r, "processing")}
                                                                >
                                                                    Process
                                                                </button>
                                                                <button
                                                                    className={`${styles.smallBtn} ${styles.rejectBtn}`}
                                                                    onClick={() => openAction(r, "rejected")}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {(r.status === "requested" ||
                                                            r.status === "processing") && (
                                                                <button
                                                                    className={`${styles.smallBtn} ${styles.payBtn}`}
                                                                    onClick={() => openAction(r, "paid")}
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                        {r.status === "processing" && (
                                                            <button
                                                                className={`${styles.smallBtn} ${styles.rejectBtn}`}
                                                                onClick={() => openAction(r, "rejected")}
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {reqPagination && reqPagination.totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                disabled={reqPage <= 1}
                                onClick={() => setReqPage((p) => Math.max(1, p - 1))}
                            >
                                Previous
                            </button>
                            <span>
                                Page {reqPagination.currentPage} of {reqPagination.totalPages}
                            </span>
                            <button
                                disabled={reqPage >= reqPagination.totalPages}
                                onClick={() => setReqPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================
          TRANSACTION DETAIL MODAL
          ============================================ */}
            {detailOpen && (
                <div className={styles.modalOverlay} onClick={closeDetail}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Transaction Detail</h3>
                            <button className={styles.modalClose} onClick={closeDetail}>
                                <FiX size={18} />
                            </button>
                        </div>
                        {detailLoading ? (
                            <div style={{ padding: 32, textAlign: "center" }}>Loading...</div>
                        ) : (
                            detailData?.transaction && (
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailRow}>
                                        <span>Seller</span>
                                        <strong>
                                            {detailData.transaction.seller?.storeInfo?.storeName ||
                                                "—"}
                                        </strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Order</span>
                                        <strong>{detailData.transaction.orderNumber}</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Product</span>
                                        <strong>{detailData.transaction.productNameSnapshot}</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Quantity</span>
                                        <strong>{detailData.transaction.quantity}</strong>
                                    </div>
                                    <div className={styles.detailDivider} />
                                    <div className={styles.detailRow}>
                                        <span>Gross Amount</span>
                                        <strong>{formatINR(detailData.transaction.grossAmount)}</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>
                                            Commission (
                                            {detailData.transaction.commissionPercentSnapshot}%)
                                        </span>
                                        <strong>
                                            {formatINR(detailData.transaction.commissionAmount)}
                                        </strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Seller Net</span>
                                        <strong>
                                            {formatINR(detailData.transaction.sellerNetAmount)}
                                        </strong>
                                    </div>
                                    <div className={styles.detailDivider} />
                                    <div className={styles.detailRow}>
                                        <span>Status</span>
                                        <strong>{detailData.transaction.status}</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Reference</span>
                                        <strong>{detailData.transaction.referenceId || "—"}</strong>
                                    </div>
                                    {detailData.reversals?.length > 0 && (
                                        <>
                                            <div className={styles.detailDivider} />
                                            {detailData.reversals.map((rv) => (
                                                <div key={rv._id} className={styles.detailRow}>
                                                    <span>{rv.reversalReason || "Adjustment"}</span>
                                                    <strong>{formatINR(rv.sellerNetAmount)}</strong>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* ============================================
          PAYOUT ACTION MODAL
          ============================================ */}
            {actionTarget && (
                <div className={styles.modalOverlay} onClick={closeAction}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>
                                {actionStatus === "paid"
                                    ? "Mark Payout as Paid"
                                    : actionStatus === "rejected"
                                        ? "Reject Payout"
                                        : "Move to Processing"}
                            </h3>
                            <button className={styles.modalClose} onClick={closeAction}>
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className={styles.detailGrid}>
                            <div className={styles.detailRow}>
                                <span>Amount</span>
                                <strong>{formatINR(actionTarget.amount)}</strong>
                            </div>

                            {actionStatus === "paid" && (
                                <label className={styles.actionLabel}>
                                    Payment Reference (Bank UTR / Txn ID)
                                    <input
                                        type="text"
                                        value={actionReference}
                                        onChange={(e) => setActionReference(e.target.value)}
                                        placeholder="e.g. UTR123456789"
                                    />
                                </label>
                            )}

                            {actionStatus === "rejected" && (
                                <label className={styles.actionLabel}>
                                    Rejection Reason
                                    <textarea
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                        rows={3}
                                        placeholder="Why is this payout being rejected?"
                                    />
                                </label>
                            )}

                            <button
                                className={styles.saveBtn}
                                onClick={submitAction}
                                disabled={actionSubmitting}
                            >
                                {actionSubmitting ? "Saving..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayoutsManagement;