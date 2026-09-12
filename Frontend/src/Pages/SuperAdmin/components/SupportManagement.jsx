
// src/Pages/SuperAdmin/components/SupportManagement/index.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMail,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSearch,
  FiEye,
  FiSend,
  FiLoader,
  FiUser,
  FiMessageSquare,
  FiCalendar,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiInbox,
} from "react-icons/fi";
import {
  getAllTickets,
  replyToTicket,
  updateTicketStatus,
  getTicketStats,
  clearSupportError,
  clearSupportSuccess,
} from "../../../redux/slices/supportSlice";
import toast from "react-hot-toast";
import styles from "./SupportManagement.module.css";

// Skeleton loader — mirrors the card-row skeleton used on Seller Requests
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

const SupportManagement = () => {
  const dispatch = useDispatch();
  const { allTickets, stats, loading, error, success, pagination } = useSelector(
    (state) => state.support
  );

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  useEffect(() => {
    fetchTickets();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, currentPage, sortBy]);

  useEffect(() => {
    if (success) {
      dispatch(clearSupportSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearSupportError());
    }
  }, [success, error, dispatch]);

  const fetchTickets = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(filterStatus !== "all" && { status: filterStatus }),
      };
      await dispatch(getAllTickets(params)).unwrap();
    } catch (err) {
      toast.error("Failed to fetch tickets");
    }
  };

  const fetchStats = async () => {
    try {
      await dispatch(getTicketStats()).unwrap();
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
    setShowReplyBox(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTicket(null);
    fetchTickets();
    fetchStats();
  };

  const handleReply = async (ticketId) => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setSendingReply(true);
    try {
      await dispatch(
        replyToTicket({
          ticketId,
          message: replyMessage,
          status: replyStatus || undefined,
        })
      ).unwrap();

      toast.success("Reply sent successfully");
      setReplyMessage("");
      setReplyStatus("");
      setShowReplyBox(null);
      fetchTickets();
      fetchStats();

      if (showDetails) {
        setShowDetails(false);
        setTimeout(() => setShowDetails(true), 100);
      }
    } catch (err) {
      toast.error(err || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await dispatch(
        updateTicketStatus({ ticketId, status: newStatus })
      ).unwrap();
      toast.success(`Status updated to ${newStatus}`);
      fetchTickets();
      fetchStats();
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Pending", icon: <FiClock size={11} />, className: styles.statusPending },
      "in-progress": { label: "In Progress", icon: <FiLoader size={11} />, className: styles.statusSuspended },
      resolved: { label: "Resolved", icon: <FiCheckCircle size={11} />, className: styles.statusApproved },
      closed: { label: "Closed", icon: <FiXCircle size={11} />, className: styles.statusNeutral },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      urgent: { label: "Urgent", className: styles.priorityUrgent },
      high: { label: "High", className: styles.priorityHigh },
      medium: { label: "Medium", className: styles.priorityMedium },
      low: { label: "Low", className: styles.priorityLow },
    };
    return priorityMap[priority] || priorityMap.medium;
  };

  const formatDate = (date) => {
    const now = new Date();
    const ticketDate = new Date(date);
    const diff = now - ticketDate;
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (days < 7) return `${Math.floor(days)}d ago`;
    return ticketDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const filteredTickets = allTickets.filter((ticket) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.name.toLowerCase().includes(searchLower) ||
      ticket.email.toLowerCase().includes(searchLower) ||
      ticket.subject.toLowerCase().includes(searchLower) ||
      ticket.message.toLowerCase().includes(searchLower)
    );
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === "priority") {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    }
    return 0;
  });

  const getSerialNumber = (index) => (currentPage - 1) * 20 + index + 1;
  const showLoadingState = loading && allTickets.length === 0;

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiInbox size={60} className={styles.emptyIcon} />
      <h3>No tickets found</h3>
      <p>
        {searchTerm || filterStatus !== "all"
          ? "Try adjusting your filters or search terms"
          : "Support tickets will show up here once submitted"}
      </p>
      {(searchTerm || filterStatus !== "all") && (
        <button
          className={styles.clearFiltersBtn}
          onClick={() => {
            setSearchTerm("");
            setFilterStatus("all");
            setCurrentPage(1);
          }}
        >
          <FiX size={16} />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Support Tickets</h1>
          <span className={styles.countPill}>{stats?.total ?? 0} tickets</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.statsBar}>
            <span className={styles.statsLabel}>
              <FiMail size={14} />
              Overview:
            </span>
            <span className={styles.statsItem}>
              Pending: <strong>{stats?.pending ?? 0}</strong>
            </span>
            <span className={styles.statsItem}>
              In progress: <strong>{stats?.inProgress ?? 0}</strong>
            </span>
            <span className={styles.statsItem}>
              Resolved: <strong>{stats?.resolved ?? 0}</strong>
            </span>
            <span className={`${styles.statsItem} ${styles.statsItemUrgent}`}>
              Urgent: <strong>{stats?.urgent ?? 0}</strong>
            </span>
          </div>
          <button
            className={styles.refreshBtn}
            onClick={() => {
              fetchTickets();
              fetchStats();
              toast.success("Refreshed");
            }}
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
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => {
              setCurrentPage(1);
              setFilterStatus(e.target.value);
            }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">By priority</option>
          </select>

          {(searchTerm || filterStatus !== "all") && (
            <button
              className={styles.clearFiltersBtn}
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setCurrentPage(1);
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
          <SkeletonLoader count={6} />
        </div>
      ) : sortedTickets.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.ticketTable}>
            <thead>
              <tr>
                <th className={styles.indexCell}>#</th>
                <th className={styles.ticketCell}>Ticket</th>
                <th className={styles.contactCell}>Customer</th>
                <th className={styles.statusCell}>Status</th>
                <th className={styles.priorityCellHead}>Priority</th>
                <th className={styles.dateCell}>Date</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTickets.map((ticket, index) => {
                const status = getStatusBadge(ticket.status);
                const priority = getPriorityBadge(ticket.priority);
                const hasReplies = ticket.replies && ticket.replies.length > 0;
                const isReplying = showReplyBox === ticket._id;

                return (
                  <React.Fragment key={ticket._id}>
                    <tr className={styles.tableRow}>
                      <td className={styles.indexCell} data-label="#">
                        <span className={styles.indexNumber}>
                          {getSerialNumber(index)}
                        </span>
                      </td>

                      <td className={styles.ticketCell} data-label="Ticket">
                        <div className={styles.ticketInfo}>
                          <div className={styles.ticketAvatar}>
                            {getInitials(ticket.name)}
                          </div>
                          <div className={styles.ticketTextWrap}>
                            <div className={styles.ticketSubject}>
                              {ticket.subject}
                            </div>
                            <div className={styles.ticketPreview}>
                              {ticket.message.substring(0, 70)}
                              {ticket.message.length > 70 && "…"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className={styles.contactCell} data-label="Customer">
                        <div className={styles.contactInfo}>
                          <div title={ticket.name}>
                            <FiUser size={12} />
                            <span>{ticket.name}</span>
                          </div>
                          <div title={ticket.email}>
                            <FiMail size={12} />
                            <span>{ticket.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.statusCell} data-label="Status">
                        <span className={`${styles.statusBadge} ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {hasReplies && (
                          <div className={styles.replyCount}>
                            <FiMessageSquare size={10} />
                            {ticket.replies.length} repl{ticket.replies.length === 1 ? "y" : "ies"}
                          </div>
                        )}
                      </td>

                      <td className={styles.priorityCell} data-label="Priority">
                        <span className={`${styles.priorityBadge} ${priority.className}`}>
                          {priority.label}
                        </span>
                      </td>

                      <td className={styles.dateCell} data-label="Date">
                        <div className={styles.dateInfo}>
                          <FiCalendar size={12} />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </td>

                      <td className={styles.actionsCell} data-label="Actions">
                        <div className={styles.actions}>
                          <button
                            className={styles.actionIconBtn}
                            onClick={() => handleViewTicket(ticket)}
                            title="View details"
                          >
                            <FiEye size={14} />
                            <span className={styles.actionBtnLabel}>View</span>
                          </button>
                          <button
                            className={`${styles.actionIconBtn} ${styles.replyIconBtn}`}
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowReplyBox(isReplying ? null : ticket._id);
                              setReplyMessage("");
                              setReplyStatus("");
                            }}
                            title="Reply"
                          >
                            <FiSend size={14} />
                            <span className={styles.actionBtnLabel}>Reply</span>
                          </button>
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                            className={styles.rowStatusSelect}
                            title="Change status"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </td>
                    </tr>

                    {isReplying && (
                      <tr className={styles.replyRow}>
                        <td colSpan={7} className={styles.replyRowCell}>
                          <div className={styles.replyBox}>
                            <textarea
                              placeholder="Write your reply..."
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              className={styles.replyTextarea}
                              rows="3"
                              autoFocus
                            />
                            <div className={styles.replyActions}>
                              <select
                                value={replyStatus}
                                onChange={(e) => setReplyStatus(e.target.value)}
                                className={styles.replyStatusSelect}
                              >
                                <option value="">Keep current status</option>
                                <option value="pending">Set to pending</option>
                                <option value="in-progress">Set to in progress</option>
                                <option value="resolved">Set to resolved</option>
                                <option value="closed">Set to closed</option>
                              </select>
                              <div className={styles.replyButtons}>
                                <button
                                  className={styles.cancelReplyBtn}
                                  onClick={() => setShowReplyBox(null)}
                                >
                                  <FiX size={14} />
                                  Cancel
                                </button>
                                <button
                                  className={styles.sendReplyBtn}
                                  onClick={() => handleReply(ticket._id)}
                                  disabled={sendingReply || !replyMessage.trim()}
                                >
                                  {sendingReply ? (
                                    <>
                                      <FiLoader size={14} className={styles.spinIcon} />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <FiSend size={14} />
                                      Send reply
                                    </>
                                  )}
                                </button>
                              </div>
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

      {/* Pagination */}
      {!showLoadingState && pagination && pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <FiChevronLeft size={18} />
          </button>

          <div className={styles.paginationPages}>
            {[...Array(pagination.pages)].map((_, i) => {
              const p = i + 1;
              const isActive = p === currentPage;
              const isNearCurrent = Math.abs(p - currentPage) <= 2;
              const isFirst = p === 1;
              const isLast = p === pagination.pages;

              if (isNearCurrent || isFirst || isLast) {
                return (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${isActive ? styles.activePage : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              }

              if (
                (p === currentPage - 3 && currentPage > 4) ||
                (p === currentPage + 3 && currentPage < pagination.pages - 3)
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
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className={styles.modalOverlay} onClick={handleCloseDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedTicket.subject}</h2>
              <button className={styles.closeBtn} onClick={handleCloseDetails}>
                <FiX size={20} />
              </button>
            </div>

            <div className={styles.modalMeta}>
              <div className={styles.infoRow}>
                <FiUser size={14} />
                <span>
                  <strong>{selectedTicket.name}</strong>
                  <span className={styles.email}>({selectedTicket.email})</span>
                </span>
              </div>
              <div className={styles.infoRow}>
                <FiClock size={14} />
                <span>Submitted {formatDate(selectedTicket.createdAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span
                  className={`${styles.statusBadge} ${getStatusBadge(selectedTicket.status).className}`}
                >
                  {getStatusBadge(selectedTicket.status).icon}
                  {getStatusBadge(selectedTicket.status).label}
                </span>
                <span
                  className={`${styles.priorityBadge} ${getPriorityBadge(selectedTicket.priority).className}`}
                >
                  {getPriorityBadge(selectedTicket.priority).label}
                </span>
              </div>
            </div>

            <div className={styles.messageSection}>
              <h4>Message</h4>
              <div className={styles.messageContent}>{selectedTicket.message}</div>
            </div>

            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <div className={styles.repliesSection}>
                <h4>Replies ({selectedTicket.replies.length})</h4>
                {selectedTicket.replies.map((reply, index) => (
                  <div key={index} className={styles.replyItem}>
                    <div className={styles.replyHeader}>
                      <span className={styles.replyAdmin}>
                        <FiUser size={12} />
                        {reply.adminName || "Admin"}
                      </span>
                      <span className={styles.replyDate}>{formatDate(reply.createdAt)}</span>
                    </div>
                    <div className={styles.replyMessage}>{reply.message}</div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.replySection}>
              <h4>Reply to ticket</h4>
              <textarea
                placeholder="Write your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className={styles.replyTextarea}
                rows="4"
              />
              <button
                className={styles.sendReplyBtn}
                onClick={() => handleReply(selectedTicket._id)}
                disabled={sendingReply || !replyMessage.trim()}
              >
                {sendingReply ? (
                  <>
                    <FiLoader size={14} className={styles.spinIcon} />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend size={14} />
                    Send reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;