
import React, { useCallback, useEffect, useState } from "react";
import {
  FiMail,
  FiPhone,
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiBriefcase,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiHome,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiArchive,
  FiMessageSquare,
  FiLayers,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./FranchiseManagement.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "converted", label: "Converted" },
  { id: "rejected", label: "Rejected" },
  { id: "archived", label: "Archived" },
];

const STATUS_META = {
  new: { label: "New", className: "statusNew" },
  contacted: { label: "Contacted", className: "statusPending" },
  qualified: { label: "Qualified", className: "statusSuspended" },
  converted: { label: "Converted", className: "statusApproved" },
  rejected: { label: "Rejected", className: "statusRejected" },
  archived: { label: "Archived", className: "statusNeutral" },
};

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

// Skeleton loader — mirrors the card-row skeleton used across the admin
const SkeletonLoader = ({ count = 6 }) => (
  <div className={styles.skeletonContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={styles.skeletonRow}>
        <div className={styles.skeletonIndex}></div>
        <div className={styles.skeletonName}>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLineShort}></div>
        </div>
        <div className={styles.skeletonContact}></div>
        <div className={styles.skeletonStatus}></div>
        <div className={styles.skeletonStatus}></div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonIcon}></div>
          <div className={styles.skeletonIcon}></div>
        </div>
      </div>
    ))}
  </div>
);

const FranchiseManagement = () => {
  const [franchises, setFranchises] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingId, setSavingId] = useState(null);

  const fetchFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(
        `${API_BASE}/super-admin/franchises?${params.toString()}`,
        { headers: getAuthHeaders(), credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load franchise inquiries");
      }

      setFranchises(data.data || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Fetch franchises error:", error);
      toast.error(error.message || "Failed to load franchise inquiries");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchFranchises();
  }, [fetchFranchises]);

  const toggleExpand = (item) => {
    if (expandedId === item._id) {
      setExpandedId(null);
      setNoteDraft("");
      return;
    }
    setExpandedId(item._id);
    setNoteDraft(item.adminNotes || "");
  };

  const updateStatus = async (id, status) => {
    setSavingId(id);
    try {
      const res = await fetch(
        `${API_BASE}/super-admin/franchises/${id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }
      setFranchises((prev) =>
        prev.map((f) => (f._id === id ? data.data : f))
      );
      toast.success("Status updated");
    } catch (error) {
      console.error("Update franchise status error:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  const saveNotes = async (id) => {
    setSavingId(id);
    try {
      const res = await fetch(
        `${API_BASE}/super-admin/franchises/${id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ adminNotes: noteDraft }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save notes");
      }
      setFranchises((prev) =>
        prev.map((f) => (f._id === id ? data.data : f))
      );
      toast.success("Notes saved");
    } catch (error) {
      console.error("Save franchise notes error:", error);
      toast.error(error.message || "Failed to save notes");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Delete this franchise inquiry? This can't be undone.")
    ) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/super-admin/franchises/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete inquiry");
      }
      setFranchises((prev) => prev.filter((f) => f._id !== id));
      if (expandedId === id) {
        setExpandedId(null);
        setNoteDraft("");
      }
      toast.success("Franchise inquiry deleted");
    } catch (error) {
      console.error("Delete franchise error:", error);
      toast.error(error.message || "Failed to delete inquiry");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiBriefcase size={60} className={styles.emptyIcon} />
      <h3>No franchise inquiries found</h3>
      <p>
        {search || statusFilter !== "all"
          ? "Try adjusting your filters or search terms"
          : "Partnership requests submitted through the website will show up here"}
      </p>
      {(search || statusFilter !== "all") && (
        <button className={styles.clearFiltersBtn} onClick={clearFilters}>
          <FiX size={16} />
          Clear all filters
        </button>
      )}
    </div>
  );

  const showLoadingState = loading && franchises.length === 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h1 className={styles.title}>Franchise Inquiries</h1>
            <p className={styles.subtitle}>
              Partnership requests submitted through the website's Franchise page
            </p>
          </div>
          <span className={styles.countPill}>{stats?.total ?? 0} inquiries</span>
        </div>
        <div className={styles.headerRight}>
          {stats && (
            <div className={styles.statsBar}>
              <span className={styles.statsLabel}>
                <FiBriefcase size={14} />
                Overview:
              </span>
              <span className={styles.statsItem}>
                New: <strong>{stats.new}</strong>
              </span>
              <span className={styles.statsItem}>
                Contacted: <strong>{stats.contacted}</strong>
              </span>
              <span className={styles.statsItem}>
                Qualified: <strong>{stats.qualified}</strong>
              </span>
              <span className={styles.statsItem}>
                Converted: <strong>{stats.converted}</strong>
              </span>
              <span className={`${styles.statsItem} ${styles.statsItemMuted}`}>
                Rejected: <strong>{stats.rejected}</strong>
              </span>
            </div>
          )}
          <button
            className={styles.refreshBtn}
            onClick={fetchFranchises}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw size={15} className={loading ? styles.spinIcon : ""} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.tabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${
                statusFilter === tab.id ? styles.tabActive : ""
              }`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {showLoadingState ? (
        <div className={styles.tableContainer}>
          <SkeletonLoader count={6} />
        </div>
      ) : franchises.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.franchiseTable}>
            <thead>
              <tr>
                <th className={styles.indexCell}>#</th>
                <th className={styles.inquiryCell}>Inquiry</th>
                <th className={styles.contactCell}>Contact</th>
                <th className={styles.locationCell}>Location</th>
                <th className={styles.budgetCell}>Budget / Experience</th>
                <th className={styles.statusCellHead}>Status</th>
                <th className={styles.dateCell}>Date</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {franchises.map((item, index) => {
                const meta = STATUS_META[item.status] || STATUS_META.new;
                const isExpanded = expandedId === item._id;

                return (
                  <React.Fragment key={item._id}>
                    <tr
                      className={`${styles.tableRow} ${isExpanded ? styles.tableRowActive : ""}`}
                    >
                      <td className={styles.indexCell} data-label="#">
                        <span className={styles.indexNumber}>{index + 1}</span>
                      </td>

                      <td className={styles.inquiryCell} data-label="Inquiry">
                        <div className={styles.inquiryInfo}>
                          <div className={styles.inquiryAvatar}>
                            {getInitials(item.name)}
                          </div>
                          <div className={styles.inquiryTextWrap}>
                            <div className={styles.inquiryName}>{item.name}</div>
                            <div className={styles.inquiryEmail}>{item.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className={styles.contactCell} data-label="Contact">
                        <div className={styles.contactInfo}>
                          <div title={item.email}>
                            <FiMail size={12} />
                            <span>{item.email}</span>
                          </div>
                          <div title={item.phone}>
                            <FiPhone size={12} />
                            <span>{item.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.locationCell} data-label="Location">
                        <div className={styles.locationInfo}>
                          <FiMapPin size={12} />
                          <span>
                            {item.city}
                            {item.state ? `, ${item.state}` : ""}
                          </span>
                        </div>
                      </td>

                      <td className={styles.budgetCell} data-label="Budget / Experience">
                        <div className={styles.budgetInfo}>
                          <span className={styles.budgetLine}>
                            <FiDollarSign size={12} /> {item.budget || "—"}
                          </span>
                          <span className={styles.experienceLine}>
                            <FiBriefcase size={12} /> {item.experience || "—"}
                          </span>
                        </div>
                      </td>

                      <td className={styles.statusCell} data-label="Status">
                        <span
                          className={`${styles.statusBadge} ${styles[meta.className]}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className={styles.dateCell} data-label="Date">
                        <div className={styles.dateInfo}>
                          <FiClock size={12} />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </td>

                      <td className={styles.actionsCell} data-label="Actions">
                        <div className={styles.actions}>
                          <button
                            className={styles.actionIconBtn}
                            onClick={() => toggleExpand(item)}
                            title={isExpanded ? "Collapse" : "View details"}
                          >
                            {isExpanded ? (
                              <FiChevronUp size={14} />
                            ) : (
                              <FiChevronDown size={14} />
                            )}
                            <span className={styles.actionBtnLabel}>
                              {isExpanded ? "Close" : "View"}
                            </span>
                          </button>
                          <button
                            className={`${styles.actionIconBtn} ${styles.deleteIconBtn}`}
                            onClick={() => handleDelete(item._id)}
                            title="Delete inquiry"
                          >
                            <FiTrash2 size={14} />
                            <span className={styles.actionBtnLabel}>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className={styles.expandRow}>
                        <td colSpan={8} className={styles.expandRowCell}>
                          <div className={styles.expandBox}>
                            <div className={styles.detailGrid}>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiUser size={12} /> Full name
                                </label>
                                <p>{item.name}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiPhone size={12} /> Phone
                                </label>
                                <p>{item.phone}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiMail size={12} /> Email
                                </label>
                                <p>{item.email}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiMapPin size={12} /> City
                                </label>
                                <p>{item.city || "—"}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiLayers size={12} /> State
                                </label>
                                <p>{item.state || "—"}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiDollarSign size={12} /> Budget
                                </label>
                                <p>{item.budget || "—"}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiHome size={12} /> Store size
                                </label>
                                <p>{item.size || "—"}</p>
                              </div>
                              <div className={styles.detailItem}>
                                <label>
                                  <FiBriefcase size={12} /> Experience
                                </label>
                                <p>{item.experience || "—"}</p>
                              </div>
                            </div>

                            {item.message && (
                              <div className={styles.messageBlock}>
                                <label>
                                  <FiMessageSquare size={12} /> Message
                                </label>
                                <p className={styles.fullMessage}>{item.message}</p>
                              </div>
                            )}

                            <div className={styles.actionsRow}>
                              <div className={styles.statusActions}>
                                <button
                                  className={styles.statusActionBtn}
                                  disabled={savingId === item._id}
                                  onClick={() => updateStatus(item._id, "contacted")}
                                >
                                  <FiCheckCircle size={13} /> Mark contacted
                                </button>
                                <button
                                  className={styles.statusActionBtn}
                                  disabled={savingId === item._id}
                                  onClick={() => updateStatus(item._id, "qualified")}
                                >
                                  <FiCheckCircle size={13} /> Mark qualified
                                </button>
                                <button
                                  className={styles.statusActionBtn}
                                  disabled={savingId === item._id}
                                  onClick={() => updateStatus(item._id, "converted")}
                                >
                                  <FiCheckCircle size={13} /> Mark converted
                                </button>
                                <button
                                  className={`${styles.statusActionBtn} ${styles.rejectActionBtn}`}
                                  disabled={savingId === item._id}
                                  onClick={() => updateStatus(item._id, "rejected")}
                                >
                                  <FiXCircle size={13} /> Reject
                                </button>
                                <button
                                  className={styles.statusActionBtn}
                                  disabled={savingId === item._id}
                                  onClick={() => updateStatus(item._id, "archived")}
                                >
                                  <FiArchive size={13} /> Archive
                                </button>
                              </div>
                            </div>

                            <div className={styles.notesBlock}>
                              <label>Admin notes</label>
                              <textarea
                                rows={3}
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                placeholder="Internal notes about this lead..."
                              />
                              <button
                                className={styles.saveNotesBtn}
                                disabled={savingId === item._id}
                                onClick={() => saveNotes(item._id)}
                              >
                                Save notes
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FranchiseManagement;