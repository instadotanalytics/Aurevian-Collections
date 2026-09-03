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
  contacted: { label: "Contacted", className: "statusContacted" },
  qualified: { label: "Qualified", className: "statusQualified" },
  converted: { label: "Converted", className: "statusConverted" },
  rejected: { label: "Rejected", className: "statusRejected" },
  archived: { label: "Archived", className: "statusArchived" },
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
      console.error("❌ Fetch franchises error:", error);
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
      console.error("❌ Update franchise status error:", error);
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
      console.error("❌ Save franchise notes error:", error);
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
      const res = await fetch(
        `${API_BASE}/super-admin/franchises/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete inquiry");
      }
      setFranchises((prev) => prev.filter((f) => f._id !== id));
      toast.success("Franchise inquiry deleted");
    } catch (error) {
      console.error("❌ Delete franchise error:", error);
      toast.error(error.message || "Failed to delete inquiry");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Franchise Inquiries</h1>
          <p className={styles.subtitle}>
            Partnership requests submitted through the website's Franchise page
          </p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={fetchFranchises}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? styles.spinIcon : ""} />
          Refresh
        </button>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.statCard} ${styles.statNew}`}>
            <span className={styles.statValue}>{stats.new}</span>
            <span className={styles.statLabel}>New</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.contacted}</span>
            <span className={styles.statLabel}>Contacted</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.qualified}</span>
            <span className={styles.statLabel}>Qualified</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.converted}</span>
            <span className={styles.statLabel}>Converted</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.rejected}</span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
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
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading franchise inquiries...</div>
      ) : franchises.length === 0 ? (
        <div className={styles.emptyState}>
          <FiBriefcase size={36} />
          <p>No franchise inquiries found</p>
        </div>
      ) : (
        <div className={styles.list}>
          {franchises.map((item) => {
            const meta = STATUS_META[item.status] || STATUS_META.new;
            const isExpanded = expandedId === item._id;
            return (
              <div key={item._id} className={styles.card}>
                <button
                  className={styles.cardHeader}
                  onClick={() => toggleExpand(item)}
                >
                  <div className={styles.cardMain}>
                    <span
                      className={`${styles.statusBadge} ${styles[meta.className]}`}
                    >
                      {meta.label}
                    </span>
                    <div className={styles.cardIdentity}>
                      <span className={styles.cardName}>{item.name}</span>
                      <span className={styles.cardMetaRow}>
                        <FiMail size={12} /> {item.email}
                        {" · "}
                        <FiPhone size={12} /> {item.phone}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardDate}>
                      <FiClock size={12} /> {formatDate(item.createdAt)}
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </button>

                <div className={styles.cardPreview}>
                  <span className={styles.previewTag}>
                    <FiMapPin size={12} /> {item.city}, {item.state}
                  </span>
                  {item.budget && (
                    <span className={styles.previewTag}>
                      <FiDollarSign size={12} /> {item.budget}
                    </span>
                  )}
                  {item.experience && (
                    <span className={styles.previewTag}>
                      <FiBriefcase size={12} /> {item.experience}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className={styles.cardExpanded}>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>
                          <FiUser size={12} /> Full Name
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
                        <p>{item.city}</p>
                      </div>
                      <div className={styles.detailItem}>
                        <label>
                          <FiLayers size={12} /> State
                        </label>
                        <p>{item.state}</p>
                      </div>
                      <div className={styles.detailItem}>
                        <label>
                          <FiDollarSign size={12} /> Budget
                        </label>
                        <p>{item.budget || "—"}</p>
                      </div>
                      <div className={styles.detailItem}>
                        <label>
                          <FiHome size={12} /> Store Size
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
                          className={styles.actionBtn}
                          disabled={savingId === item._id}
                          onClick={() =>
                            updateStatus(item._id, "contacted")
                          }
                        >
                          <FiCheckCircle size={14} /> Mark Contacted
                        </button>
                        <button
                          className={styles.actionBtn}
                          disabled={savingId === item._id}
                          onClick={() =>
                            updateStatus(item._id, "qualified")
                          }
                        >
                          <FiCheckCircle size={14} /> Mark Qualified
                        </button>
                        <button
                          className={styles.actionBtn}
                          disabled={savingId === item._id}
                          onClick={() =>
                            updateStatus(item._id, "converted")
                          }
                        >
                          <FiCheckCircle size={14} /> Mark Converted
                        </button>
                        <button
                          className={styles.actionBtn}
                          disabled={savingId === item._id}
                          onClick={() =>
                            updateStatus(item._id, "rejected")
                          }
                        >
                          <FiXCircle size={14} /> Reject
                        </button>
                        <button
                          className={styles.actionBtn}
                          disabled={savingId === item._id}
                          onClick={() =>
                            updateStatus(item._id, "archived")
                          }
                        >
                          <FiArchive size={14} /> Archive
                        </button>
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(item._id)}
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>

                    <div className={styles.notesBlock}>
                      <label>Admin Notes</label>
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
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FranchiseManagement;