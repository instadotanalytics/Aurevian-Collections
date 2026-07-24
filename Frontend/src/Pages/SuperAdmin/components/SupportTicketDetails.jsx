// src/Pages/SuperAdmin/components/SupportManagement/SupportTicketDetails.jsx

import React, { useState } from "react";
import { FiX, FiMail, FiUser, FiClock, FiMessageSquare, FiReply, FiCheck, FiLoader, FiSend } from "react-icons/fi";
import styles from "./SupportTicketDetails.module.css";

const SupportTicketDetails = ({ ticket, onClose, onReply }) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    setSending(true);
    try {
      await onReply(ticket._id, replyMessage);
      setReplyMessage("");
    } catch (error) {
      // Error handled in parent
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{ticket.subject}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.ticketInfo}>
          <div className={styles.infoRow}>
            <FiUser />
            <span>
              <strong>{ticket.name}</strong>
              <span className={styles.email}>({ticket.email})</span>
            </span>
          </div>
          <div className={styles.infoRow}>
            <FiClock />
            <span>Submitted: {formatDate(ticket.createdAt)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={`${styles.statusBadge} ${styles[ticket.status]}`}>
              {ticket.status}
            </span>
            <span className={`${styles.priorityBadge} ${styles[ticket.priority]}`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        <div className={styles.messageSection}>
          <h4>Message</h4>
          <div className={styles.messageContent}>{ticket.message}</div>
        </div>

        {ticket.replies && ticket.replies.length > 0 && (
          <div className={styles.repliesSection}>
            <h4>Replies ({ticket.replies.length})</h4>
            {ticket.replies.map((reply, index) => (
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
            onClick={handleReply}
            disabled={sending || !replyMessage.trim()}
          >
            {sending ? (
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
  );
};

export default SupportTicketDetails;