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
  FiEye,
  FiCheckCircle,
  FiArchive,
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
      toast.success("Contact message deleted");
    } catch (error) {
      console.error("❌ Delete contact error:", error);
      toast.error(error.message || "Failed to delete message");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contact Messages</h1>
          <p className={styles.subtitle}>
            Messages submitted through the website's Contact page form
          </p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={fetchContacts}
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
            <span className={styles.statValue}>{stats.read}</span>
            <span className={styles.statLabel}>Read</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.responded}</span>
            <span className={styles.statLabel}>Responded</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.closed}</span>
            <span className={styles.statLabel}>Closed</span>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${statusFilter === tab.id ? styles.tabActive : ""}`}
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
            placeholder="Search by name, email, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading contact messages...</div>
      ) : contacts.length === 0 ? (
        <div className={styles.emptyState}>
          <FiMessageCircle size={36} />
          <p>No contact messages found</p>
        </div>
      ) : (
        <div className={styles.list}>
          {contacts.map((contact) => {
            const meta = STATUS_META[contact.status] || STATUS_META.new;
            const isExpanded = expandedId === contact._id;
            return (
              <div key={contact._id} className={styles.card}>
                <button
                  className={styles.cardHeader}
                  onClick={() => toggleExpand(contact)}
                >
                  <div className={styles.cardMain}>
                    <span className={`${styles.statusBadge} ${styles[meta.className]}`}>
                      {meta.label}
                    </span>
                    <div className={styles.cardIdentity}>
                      <span className={styles.cardName}>{contact.name}</span>
                      <span className={styles.cardEmail}>
                        <FiMail size={12} /> {contact.email}
                        {contact.phone && (
                          <>
                            {" "}
                            · <FiPhone size={12} /> {contact.phone}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardDate}>
                      <FiClock size={12} /> {formatDate(contact.createdAt)}
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </button>

                <p className={styles.cardPreview}>
                  {contact.message.length > 140
                    ? `${contact.message.slice(0, 140)}...`
                    : contact.message}
                </p>

                {isExpanded && (
                  <div className={styles.cardExpanded}>
                    <p className={styles.fullMessage}>{contact.message}</p>

                    <div className={styles.actionsRow}>
                      <div className={styles.statusActions}>
                        <button
                          className={styles.actionBtn}
                          disabled={savingId === contact._id}
                          onClick={() => updateStatus(contact._id, "responded")}
                        >
                          <FiCheckCircle size={14} /> Mark Responded
                        </button>
                        <button
                          className={styles.actionBtn}
                          disabled={savingId === contact._id}
                          onClick={() => updateStatus(contact._id, "closed")}
                        >
                          <FiArchive size={14} /> Close
                        </button>
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(contact._id)}
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
                        placeholder="Internal notes about this message..."
                      />
                      <button
                        className={styles.saveNotesBtn}
                        disabled={savingId === contact._id}
                        onClick={() => saveNotes(contact._id)}
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

export default ContactManagement;