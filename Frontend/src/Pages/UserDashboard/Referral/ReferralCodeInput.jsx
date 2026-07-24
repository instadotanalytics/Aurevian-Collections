// src/components/Checkout/ReferralCodeInput.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiGift, FiCheck, FiX, FiInfo, FiLoader } from "react-icons/fi";
import styles from "./ReferralCodeInput.module.css";
import { validateReferralCode, applyReferralCode } from "../../../redux/slices/checkoutSlice";
import toast from "react-hot-toast";

const ReferralCodeInput = ({ cartTotal, onDiscountApplied }) => {
  const dispatch = useDispatch();
  const { referralCode, loading, appliedDiscount, error } = useSelector(
    (state) => state.checkout
  );

  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  const MIN_CART_VALUE = 500;

  // Check if cart total meets minimum requirement
  const isEligible = cartTotal >= MIN_CART_VALUE;

  // Hide the component if not eligible
  if (!isEligible) {
    return (
      <div className={styles.referralContainer}>
        <div className={styles.notEligibleMessage}>
          <FiInfo className={styles.infoIcon} />
          <span>
            Referral and Promo Codes are available on orders above ₹{MIN_CART_VALUE}
          </span>
        </div>
      </div>
    );
  }

  const handleValidateCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await dispatch(
        validateReferralCode({ code: code.trim(), cartTotal })
      ).unwrap();

      if (result.success) {
        setValidationResult({
          valid: true,
          message: "Referral code is valid!",
          discount: result.data,
        });
        toast.success("Referral code validated successfully!");
        
        // Auto-apply the code
        await handleApplyCode();
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: error.message || "Invalid referral code",
      });
      toast.error(error.message || "Invalid referral code");
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyCode = async () => {
    if (!code.trim() || !validationResult?.valid) return;

    setIsValidating(true);

    try {
      const result = await dispatch(
        applyReferralCode({
          code: code.trim(),
          cartTotal,
        })
      ).unwrap();

      if (result.success) {
        setIsApplied(true);
        onDiscountApplied(result.data.discountAmount);
        toast.success("Referral code applied successfully! 🎉");
      }
    } catch (error) {
      toast.error(error.message || "Failed to apply referral code");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCode = () => {
    setCode("");
    setIsApplied(false);
    setValidationResult(null);
    onDiscountApplied(0);
    toast.success("Referral code removed");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleValidateCode();
    }
  };

  return (
    <div className={styles.referralContainer}>
      <div className={styles.referralHeader}>
        <FiGift className={styles.giftIcon} />
        <span className={styles.referralTitle}>Referral / Promo Code</span>
      </div>

      {!isApplied ? (
        <div className={styles.inputGroup}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.codeInput}
              placeholder="Enter referral code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={isValidating}
              maxLength={20}
            />
            <button
              className={styles.applyButton}
              onClick={handleValidateCode}
              disabled={!code.trim() || isValidating}
            >
              {isValidating ? (
                <FiLoader className={styles.spinner} />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {validationResult && (
            <div
              className={`${styles.validationMessage} ${
                validationResult.valid ? styles.success : styles.error
              }`}
            >
              {validationResult.valid ? (
                <FiCheck className={styles.messageIcon} />
              ) : (
                <FiX className={styles.messageIcon} />
              )}
              <span>{validationResult.message}</span>
            </div>
          )}

          {validationResult?.valid && validationResult.discount && (
            <div className={styles.discountPreview}>
              <div className={styles.discountDetail}>
                <span>Discount Type:</span>
                <span className={styles.highlight}>
                  {validationResult.discount.discountType === "percentage"
                    ? `${validationResult.discount.discountValue}%`
                    : `₹${validationResult.discount.discountValue}`}
                </span>
              </div>
              <div className={styles.discountDetail}>
                <span>Estimated Discount:</span>
                <span className={styles.highlight}>
                  ₹{validationResult.discount.discountAmount.toFixed(2)}
                </span>
              </div>
              {validationResult.discount.maxDiscount && (
                <div className={styles.discountDetail}>
                  <span>Max Discount:</span>
                  <span className={styles.highlight}>
                    ₹{validationResult.discount.maxDiscount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.appliedCode}>
          <div className={styles.appliedCodeContent}>
            <FiCheck className={styles.appliedIcon} />
            <span className={styles.appliedText}>
              Referral code applied successfully! 🎉
            </span>
          </div>
          <div className={styles.appliedCodeActions}>
            <span className={styles.codeTag}>{code}</span>
            <button
              className={styles.removeButton}
              onClick={handleRemoveCode}
            >
              <FiX size={16} />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCodeInput;