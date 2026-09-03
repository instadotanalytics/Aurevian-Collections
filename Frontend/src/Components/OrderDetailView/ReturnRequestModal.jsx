// src/Components/OrderDetailView/ReturnRequestModal.jsx
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import * as returnApi from "../../api/returnApi.js";
import styles from "./ReturnRequestModal.module.css";

const REASONS = [
  "Size / Fit Issue",
  "Changed My Mind",
  "Product Damaged",
  "Wrong Item Delivered",
  "Quality Not As Expected",
  "Product Not As Described",
  "Better Price Available Elsewhere",
  "Other",
];

const MAX_IMAGES = 5;

const ReturnRequestModal = ({ order, item, onClose, onSubmitted }) => {
  const [requestType, setRequestType] = useState("return");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const combined = [...images, ...files].slice(0, MAX_IMAGES);
    setImages(combined);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("orderId", order._id);
      formData.append("productId", item.productId);
      formData.append("requestType", requestType);
      formData.append("reason", reason);
      formData.append("notes", notes);
      formData.append("quantity", item.quantity);
      images.forEach((file) => formData.append("images", file));

      const res = await returnApi.createReturnRequest(formData);
      if (res.success) {
        toast.success(res.message || "Request submitted");
        onSubmitted();
      } else {
        toast.error(res.message || "Failed to submit request");
        submitLockRef.current = false;
        setSubmitting(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Return / Exchange</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <p className={styles.productLine}>{item.productName}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Request Type</label>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${
                  requestType === "return" ? styles.typeBtnActive : ""
                }`}
                onClick={() => setRequestType("return")}
              >
                Return
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${
                  requestType === "exchange" ? styles.typeBtnActive : ""
                }`}
                onClick={() => setRequestType("exchange")}
              >
                Exchange
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="return-reason">
              Reason *
            </label>
            <select
              id="return-reason"
              className={styles.select}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Select a reason</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="return-notes">
              Additional Details (optional)
            </label>
            <textarea
              id="return-notes"
              className={styles.textarea}
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us more about the issue..."
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Photos (optional, up to {MAX_IMAGES})
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.fileInput}
              onChange={handleFileSelect}
              disabled={images.length >= MAX_IMAGES}
            />
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
            >
              <FiUpload size={14} /> Add Photos
            </button>

            {images.length > 0 && (
              <div className={styles.imagePreviewRow}>
                {images.map((file, idx) => (
                  <div className={styles.imagePreview} key={idx}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={() => removeImage(idx)}
                      aria-label="Remove image"
                    >
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelActionBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !reason}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestModal;
