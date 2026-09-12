
// src/Pages/SuperAdmin/components/ContactManagement/ContactManagement.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  FiMail,
  FiPhone,
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiMessageCircle,
  FiClock,
  FiCheckCircle,
  FiArchive,
  FiX,
  FiInbox,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./ContactManagement.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "responded", label: "Responded" },
  { id: "closed", label: "Closed" },
];

const STATUS_META = {
  new: { label: "New", className: "statusNew" },
  read: { label: "Read", className: "statusRead" },
  responded: { label: "Responded", className: "statusResponded" },
  closed: { label: "Closed", className: "statusClosed" },
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
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

// Skeleton loader — mirrors SellerRequests' skeleton row pattern so both
// admin screens feel like the same product while data is loading.
const SkeletonLoader = ({ count = 5 }) => (
  <div className={styles.skeletonList}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={styles.skeletonCard}>
        <div className={styles.skeletonAvatar}></div>
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLineShort}></div>
        </div>
        <div className={styles.skeletonBadge}></div>
      </div>
    ))}
  </div>
);

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingId, setSavingId] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(
        `${API_BASE}/super-admin/contacts?${params.toString()}`,
        { headers: getAuthHeaders(), credentials: "include" },
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load contact messages");
      }

      setContacts(data.data || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("❌ Fetch contacts error:", error);
      toast.error(error.message || "Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const toggleExpand = (contact) => {
    if (expandedId === contact._id) {
      setExpandedId(null);
      setNoteDraft("");
      return;
    }
    setExpandedId(contact._id);
    setNoteDraft(contact.adminNotes || "");

    // Optimistically mark "new" as "read" in the UI — backend also does
    // this automatically when the detail is fetched.
    if (contact.status === "new") {
      setContacts((prev) =>
        prev.map((c) => (c._id === contact._id ? { ...c, status: "read" } : c)),
      );
    }
  };

  const updateStatus = async (id, status) => {
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}/super-admin/contacts/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }
      setContacts((prev) => prev.map((c) => (c._id === id ? data.data : c)));
      toast.success("Status updated");
    } catch (error) {
      console.error("❌ Update contact status error:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  const saveNotes = async (id) => {
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}/super-admin/contacts/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ adminNotes: noteDraft }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save notes");
      }
      setContacts((prev) => prev.map((c) => (c._id === id ? data.data : c)));
      toast.success("Notes saved");
    } catch (error) {
      console.error("❌ Save contact notes error:", error);
      toast.error(error.message || "Failed to save notes");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact message? This can't be undone.")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/super-admin/contacts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete message");
      }
      setContacts((prev) => prev.filter((c) => c._id !== id));
      if (expandedId === id) setExpandedId(null);
      toast.success("Contact message deleted");
    } catch (error) {
      console.error("❌ Delete contact error:", error);
      toast.error(error.message || "Failed to delete message");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const hasActiveFilters = search || statusFilter !== "all";
  const showLoadingState = loading && contacts.length === 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Contact Messages</h1>
          <span className={styles.countPill}>
            {stats?.total ?? contacts.length} messages
          </span>
        </div>
        <div className={styles.headerRight}>
          {stats && (
            <div className={styles.statsBar}>
              <span className={styles.statsLabel}>
                <FiInbox size={14} />
                Overview:
              </span>
              <span className={styles.statsItem}>
                New: <strong className={styles.statNewValue}>{stats.new}</strong>
              </span>
              <span className={styles.statsItem}>
                Read: <strong>{stats.read}</strong>
              </span>
              <span className={styles.statsItem}>
                Responded: <strong>{stats.responded}</strong>
              </span>
              <span className={styles.statsItem}>
                Closed: <strong>{stats.closed}</strong>
              </span>
            </div>
          )}
          <button
            className={styles.refreshBtn}
            onClick={fetchContacts}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spinIcon : ""} />
            Refresh
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
            placeholder="Search by name, email, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
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

          {hasActiveFilters && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              <FiX size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {showLoadingState ? (
        <SkeletonLoader count={5} />
      ) : contacts.length === 0 ? (
        <div className={styles.emptyState}>
          <FiMessageCircle size={52} className={styles.emptyIcon} />
          <h3>No contact messages found</h3>
          <p>
            {hasActiveFilters
              ? "Try adjusting your filters or search terms"
              : "Messages submitted through the website's Contact page will show up here"}
          </p>
          {hasActiveFilters && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              <FiX size={18} />
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {contacts.map((contact) => {
            const meta = STATUS_META[contact.status] || STATUS_META.new;
            const isExpanded = expandedId === contact._id;
            const isSaving = savingId === contact._id;

            return (
              <div
                key={contact._id}
                className={`${styles.card} ${isExpanded ? styles.cardOpen : ""}`}
              >
                <button
                  className={styles.cardHeader}
                  onClick={() => toggleExpand(contact)}
                  aria-expanded={isExpanded}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.avatar}>
                      {getInitials(contact.name)}
                    </div>
                    <div className={styles.cardIdentity}>
                      <div className={styles.cardNameRow}>
                        <span className={styles.cardName}>{contact.name}</span>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[meta.className]
                          }`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <span className={styles.cardContact}>
                        <FiMail size={12} /> {contact.email}
                        {contact.phone && (
                          <>
                            <span className={styles.dot}>·</span>
                            <FiPhone size={12} /> {contact.phone}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardDate}>
                      <FiClock size={12} /> {formatDate(contact.createdAt)}
                    </span>
                    <span className={styles.chevron}>
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </div>
                </button>

                {!isExpanded && (
                  <p className={styles.cardPreview}>
                    {contact.message.length > 140
                      ? `${contact.message.slice(0, 140)}...`
                      : contact.message}
                  </p>
                )}

                {isExpanded && (
                  <div className={styles.cardExpanded}>
                    <p className={styles.fullMessage}>{contact.message}</p>

                    <div className={styles.actionsRow}>
                      <div className={styles.actionBtnGroup}>
                        <button
                          className={`${styles.actionIconBtn} ${styles.approveIconBtn}`}
                          disabled={isSaving}
                          onClick={() => updateStatus(contact._id, "responded")}
                        >
                          <FiCheckCircle size={14} />
                          <span>Mark Responded</span>
                        </button>
                        <button
                          className={styles.actionIconBtn}
                          disabled={isSaving}
                          onClick={() => updateStatus(contact._id, "closed")}
                        >
                          <FiArchive size={14} />
                          <span>Close</span>
                        </button>
                      </div>
                      <button
                        className={`${styles.actionIconBtn} ${styles.rejectIconBtn}`}
                        onClick={() => handleDelete(contact._id)}
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className={styles.notesBlock}>
                      <label htmlFor={`notes-${contact._id}`}>
                        Admin Notes
                      </label>
                      <textarea
                        id={`notes-${contact._id}`}
                        rows={3}
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Internal notes about this message..."
                      />
                      <button
                        className={styles.saveNotesBtn}
                        disabled={isSaving}
                        onClick={() => saveNotes(contact._id)}
                      >
                        {isSaving ? "Saving..." : "Save Notes"}
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

export default ContactManagement;