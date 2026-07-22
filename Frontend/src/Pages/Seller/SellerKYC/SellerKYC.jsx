import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUploadCloud,
} from "react-icons/fi";
import toast from "react-hot-toast";

import {
  uploadSellerDocuments,
  fetchVerificationStatus,
} from "../../../redux/slices/sellerSlice";

import styles from "./SellerKYC.module.css";

const SellerKYC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { verificationStatus, isLoading } = useSelector((s) => s.seller);

  const [form, setForm] = useState({
    panNumber: "",
    aadhaarNumber: "",
    gstNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  const [files, setFiles] = useState({
    panCard: null,
    aadhaarCard: null,
    gstCertificate: null,
    cancelledCheque: null,
  });

  useEffect(() => {
    dispatch(fetchVerificationStatus());
  }, [dispatch]);

  // Prefill form once verification status arrives
  useEffect(() => {
    if (verificationStatus) {
      const { documents = {}, bankDetails = {} } = verificationStatus;
      setForm((prev) => ({
        ...prev,
        panNumber: documents.panNumber || "",
        aadhaarNumber: documents.aadhaarNumber || "",
        gstNumber: documents.gstNumber || "",
        accountHolderName: bankDetails.accountHolderName || "",
        bankName: bankDetails.bankName || "",
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        upiId: bankDetails.upiId || "",
      }));
    }
  }, [verificationStatus]);

  const kycStatus = verificationStatus?.kycStatus || "not_submitted";
  const isVerified = kycStatus === "verified";
  const isReadOnly =
    isVerified || kycStatus === "submitted" || kycStatus === "under_review";
  const isResubmission = kycStatus === "rejected";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.panNumber || !form.aadhaarNumber) {
      toast.error("PAN and Aadhaar numbers are required");
      return;
    }
    if (
      !form.accountHolderName ||
      !form.bankName ||
      !form.accountNumber ||
      !form.ifscCode
    ) {
      toast.error("Please fill all required bank details");
      return;
    }

    // Document upload is mandatory — block submission if missing
    if (!files.panCard) {
      toast.error("Please upload your PAN card");
      return;
    }
    if (!files.aadhaarCard) {
      toast.error("Please upload your Aadhaar card");
      return;
    }
    if (!files.cancelledCheque) {
      toast.error("Please upload a cancelled cheque or bank statement");
      return;
    }
    if (form.gstNumber && !files.gstCertificate) {
      toast.error(
        "You've entered a GST number — please upload the GST certificate too",
      );
      return;
    }

    const formData = new FormData();
    formData.append("panNumber", form.panNumber);
    formData.append("aadhaarNumber", form.aadhaarNumber);
    formData.append("gstNumber", form.gstNumber);
    formData.append(
      "bankDetails",
      JSON.stringify({
        accountHolderName: form.accountHolderName,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        upiId: form.upiId,
      }),
    );

    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    const result = await dispatch(uploadSellerDocuments(formData));
    if (uploadSellerDocuments.fulfilled.match(result)) {
      dispatch(fetchVerificationStatus());
    }
  };

  const statusBanner = () => {
    if (kycStatus === "verified") {
      return (
        <div className={`${styles.statusBanner} ${styles.verified}`}>
          <FiCheckCircle /> Your KYC is verified. You're all set to sell.
        </div>
      );
    }
    if (kycStatus === "submitted" || kycStatus === "under_review") {
      return (
        <div className={`${styles.statusBanner} ${styles.pending}`}>
          <FiClock /> Your KYC is under review. We'll notify you once it's
          approved (usually within 24 hours).
        </div>
      );
    }
    if (kycStatus === "rejected") {
      return (
        <div className={`${styles.statusBanner} ${styles.rejected}`}>
          <FiXCircle />
          <div>
            <p>Your KYC was rejected.</p>
            {verificationStatus?.kycRejectionReason && (
              <p className={styles.reasonText}>
                Reason: {verificationStatus.kycRejectionReason}
              </p>
            )}
            <p>
              Please correct the details below and resubmit, including all
              documents.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className={`${styles.statusBanner} ${styles.notSubmitted}`}>
        <FiClock /> Complete the form below to submit your KYC for verification.
      </div>
    );
  };

  const FileField = ({ name, label, required }) => (
    <div className={styles.field}>
      <label>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <label className={styles.fileDrop}>
        <input
          type="file"
          name={name}
          accept="image/*,.pdf"
          onChange={handleFile}
          className={styles.fileInput}
        />
        <span className={styles.fileDropText}>
          {files[name] ? files[name].name : "Click to upload (image or PDF)"}
        </span>
      </label>
    </div>
  );

  return (
    <div className={styles.kycPage}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/seller/dashboard")}
      >
        <FiArrowLeft /> Back to dashboard
      </button>

      <h1 className={styles.pageTitle}>KYC verification</h1>
      <p className={styles.pageSubtitle}>
        We need a few details to verify your identity and set up payouts.
      </p>

      {statusBanner()}

      {isResubmission && !isReadOnly && (
        <p className={styles.resubmitNote}>
          Note: for security reasons, previously uploaded documents can't be
          carried over — please re-upload all required files below.
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset disabled={isReadOnly} className={styles.fieldset}>
          <h3 className={styles.sectionTitle}>Identity documents</h3>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>
                PAN number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="panNumber"
                placeholder="ABCDE1234F"
                value={form.panNumber}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </div>
            <FileField name="panCard" label="Upload PAN card" required />

            <div className={styles.field}>
              <label>
                Aadhaar number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                placeholder="123456789012"
                value={form.aadhaarNumber}
                onChange={handleChange}
                maxLength={12}
                required
              />
            </div>
            <FileField
              name="aadhaarCard"
              label="Upload Aadhaar card"
              required
            />

            <div className={styles.field}>
              <label>GST number (optional)</label>
              <input
                type="text"
                name="gstNumber"
                placeholder="22AAAAA0000A1Z5"
                value={form.gstNumber}
                onChange={handleChange}
              />
            </div>
            <FileField
              name="gstCertificate"
              label="Upload GST certificate"
              required={!!form.gstNumber}
            />
          </div>

          <h3 className={styles.sectionTitle}>Bank details</h3>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>
                Account holder name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>
                Bank name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>
                Account number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>
                IFSC code <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>UPI ID (optional)</label>
              <input
                type="text"
                name="upiId"
                value={form.upiId}
                onChange={handleChange}
              />
            </div>
            <FileField
              name="cancelledCheque"
              label="Cancelled cheque / bank statement"
              required
            />
          </div>

          {!isReadOnly && (
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              <FiUploadCloud />
              {isLoading
                ? "Submitting..."
                : kycStatus === "rejected"
                  ? "Resubmit KYC"
                  : "Submit KYC"}
            </button>
          )}
        </fieldset>
      </form>
    </div>
  );
};

export default SellerKYC;
