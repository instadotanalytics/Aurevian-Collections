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
  FiFilter,
  FiChevronDown,
  FiEye,
  FiSend,
  FiLoader,
  FiUser,
  FiMessageSquare,
  FiCalendar,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiX,
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
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Tickets", color: "#6b7280" },
    { value: "pending", label: "Pending", color: "#f59e0b" },
    { value: "in-progress", label: "In Progress", color: "#3b82f6" },
    { value: "resolved", label: "Resolved", color: "#22c55e" },
    { value: "closed", label: "Closed", color: "#6b7280" },
  ];

  useEffect(() => {
    fetchTickets();
    fetchStats();
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
      
      toast.success("✅ Reply sent successfully!");
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
      pending: { label: "Pending", icon: <FiClock />, className: styles.statusPending },
      "in-progress": { label: "In Progress", icon: <FiLoader />, className: styles.statusInProgress },
      resolved: { label: "Resolved", icon: <FiCheckCircle />, className: styles.statusResolved },
      closed: { label: "Closed", icon: <FiXCircle />, className: styles.statusClosed },
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

  return (
    <div className={styles.supportManagement}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "#6366f1" }}>
            <FiMail />
          </div>
          <div>
            <p className={styles.statValue}>{stats?.total || 0}</p>
            <p className={styles.statLabel}>Total Tickets</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "#f59e0b" }}>
            <FiClock />
          </div>
          <div>
            <p className={styles.statValue}>{stats?.pending || 0}</p>
            <p className={styles.statLabel}>Pending</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "#3b82f6" }}>
            <FiLoader />
          </div>
          <div>
            <p className={styles.statValue}>{stats?.inProgress || 0}</p>
            <p className={styles.statLabel}>In Progress</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "#22c55e" }}>
            <FiCheckCircle />
          </div>
          <div>
            <p className={styles.statValue}>{stats?.resolved || 0}</p>
            <p className={styles.statLabel}>Resolved</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "#ef4444" }}>
            <FiAlertCircle />
          </div>
          <div>
            <p className={styles.statValue}>{stats?.urgent || 0}</p>
            <p className={styles.statLabel}>Urgent</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tickets by name, email, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <button
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            <FiChevronDown className={showFilters ? styles.rotated : ""} />
          </button>

          <div className={styles.sortControls}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <button className={styles.refreshBtn} onClick={() => {
            fetchTickets();
            fetchStats();
            toast.success("Refreshed");
          }}>
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGroup}>
            <label>Filter by Status</label>
            <div className={styles.statusFilterButtons}>
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  className={`${styles.statusFilterBtn} ${
                    filterStatus === status.value ? styles.active : ""
                  }`}
                  onClick={() => setFilterStatus(status.value)}
                >
                  <span
                    className={styles.statusDot}
                    style={{ background: status.color }}
                  />
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className={styles.ticketsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>Ticket</div>
          <div className={styles.headerCell}>Customer</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Priority</div>
          <div className={styles.headerCell}>Date</div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <FiLoader className={styles.spinner} />
            <p>Loading tickets...</p>
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className={styles.emptyState}>
            <FiMail className={styles.emptyIcon} />
            <h3>No Tickets Found</h3>
            <p>There are no support tickets matching your criteria.</p>
          </div>
        ) : (
          sortedTickets.map((ticket) => {
            const status = getStatusBadge(ticket.status);
            const priority = getPriorityBadge(ticket.priority);
            const hasReplies = ticket.replies && ticket.replies.length > 0;

            return (
              <div key={ticket._id} className={styles.tableRow}>
                <div className={styles.ticketInfo}>
                  <div className={styles.ticketSubject}>{ticket.subject}</div>
                  <div className={styles.ticketPreview}>
                    {ticket.message.substring(0, 60)}
                    {ticket.message.length > 60 && "..."}
                  </div>
                </div>

                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>
                    <FiUser />
                    {ticket.name}
                  </div>
                  <div className={styles.customerEmail}>
                    <FiMail />
                    {ticket.email}
                  </div>
                </div>

                <div className={styles.statusCell}>
                  <span className={`${styles.statusBadge} ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <div className={styles.priorityCell}>
                  <span className={`${styles.priorityBadge} ${priority.className}`}>
                    {priority.label}
                  </span>
                </div>

                <div className={styles.dateCell}>
                  <FiCalendar />
                  {formatDate(ticket.createdAt)}
                  {hasReplies && (
                    <span className={styles.replyCount}>
                      <FiMessageSquare />
                      {ticket.replies.length}
                    </span>
                  )}
                </div>

                <div className={styles.actionsCell}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleViewTicket(ticket)}
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowReplyBox(ticket._id);
                      setReplyMessage("");
                      setReplyStatus("");
                    }}
                    title="Reply"
                  >
                    <FiSend /> {/* ✅ Changed from FiReply to FiSend */}
                  </button>
                  <div className={styles.statusDropdown}>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Reply Box */}
                {showReplyBox === ticket._id && (
                  <div className={styles.replyBox}>
                    <textarea
                      placeholder="Write your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className={styles.replyTextarea}
                      rows="3"
                    />
                    <div className={styles.replyActions}>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value)}
                        className={styles.replyStatusSelect}
                      >
                        <option value="">Keep Current Status</option>
                        <option value="pending">Set to Pending</option>
                        <option value="in-progress">Set to In Progress</option>
                        <option value="resolved">Set to Resolved</option>
                        <option value="closed">Set to Closed</option>
                      </select>
                      <div className={styles.replyButtons}>
                        <button
                          className={styles.cancelReplyBtn}
                          onClick={() => setShowReplyBox(null)}
                        >
                          <FiX />
                          Cancel
                        </button>
                        <button
                          className={styles.sendReplyBtn}
                          onClick={() => handleReply(ticket._id)}
                          disabled={sendingReply || !replyMessage.trim()}
                        >
                          {sendingReply ? (
                            <>
                              <FiLoader className={styles.spinnerSmall} />
                              Sending...
                            </>
                          ) : (
                            <>
                              <FiSend />
                              Send Reply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <FiArrowUp />
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
            <FiArrowDown />
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
                <FiX />
              </button>
            </div>

            <div className={styles.ticketInfo}>
              <div className={styles.infoRow}>
                <FiUser />
                <span>
                  <strong>{selectedTicket.name}</strong>
                  <span className={styles.email}>({selectedTicket.email})</span>
                </span>
              </div>
              <div className={styles.infoRow}>
                <FiClock />
                <span>Submitted: {formatDate(selectedTicket.createdAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={`${styles.statusBadge} ${styles[selectedTicket.status]}`}>
                  {selectedTicket.status}
                </span>
                <span className={`${styles.priorityBadge} ${styles[selectedTicket.priority]}`}>
                  {selectedTicket.priority}
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
                        <FiUser />
                        {reply.adminName || "Admin"}
                      </span>
                      <span className={styles.replyDate}>
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <div className={styles.replyMessage}>{reply.message}</div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.replySection}>
              <h4>Reply to Ticket</h4>
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
                    <FiLoader className={styles.spinner} />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Send Reply
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