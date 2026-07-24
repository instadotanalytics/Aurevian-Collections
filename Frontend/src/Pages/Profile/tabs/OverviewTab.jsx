// src/Pages/Profile/tabs/OverviewTab.jsx

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiEdit2,
  FiSave,
  FiX,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiGlobe,
  FiShoppingBag,
  FiDollarSign,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiAward,
  FiAlertCircle,
  FiGift,
  FiCopy,
  FiShare2,
  FiUsers,
  FiTrendingUp,
  FiLoader,
  FiCheck, // ✅ Added
} from "react-icons/fi";
import { updateProfile } from "../../../redux/slices/profileSlice";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "../Profile.module.css";

const OverviewTab = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Referral state
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    rewardsEarned: 0,
    pendingRewards: 0,
  });
  const [loadingReferral, setLoadingReferral] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    gender: profile?.gender || "",
    dateOfBirth: profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : "",
    anniversary: profile?.anniversary
      ? new Date(profile.anniversary).toISOString().split("T")[0]
      : "",
    language: profile?.language || "en",
    country: profile?.country || "India",
    preferredCurrency: profile?.preferredCurrency || "INR",
    address: profile?.address || {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  // Fetch referral data on mount
  useEffect(() => {
    if (profile?._id) {
      fetchReferralData();
    }
  }, [profile?._id]);

  // Fetch referral data
  const fetchReferralData = async () => {
    setLoadingReferral(true);
    try {
      const codeResponse = await axios.get("/api/referrals/my-code", {
        withCredentials: true,
      });

      if (codeResponse.data.success) {
        setReferralCode(codeResponse.data.data.code);
      }

      const statsResponse = await axios.get("/api/referrals/my-stats", {
        withCredentials: true,
      });

      if (statsResponse.data.success) {
        setReferralStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      if (error.response?.status === 404) {
        setReferralCode("");
      }
    } finally {
      setLoadingReferral(false);
    }
  };

  // Generate referral code
  const generateReferralCode = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(
        "/api/referrals/generate",
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setReferralCode(response.data.data.code);
        toast.success("🎉 Referral code generated successfully!");
        await fetchReferralData();
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
      toast.error(error.response?.data?.message || "Failed to generate referral code");
    } finally {
      setGenerating(false);
    }
  };

  // Copy referral link
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("📋 Referral link copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  // Share referral link
  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareData = {
      title: "Join Aurevian Collections",
      text: `🎉 Use my referral code ${referralCode} and get exciting discounts on your first order!`,
      url: referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("✅ Shared successfully!");
      } else {
        copyReferralLink();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        toast.error("Failed to share");
      }
    }
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    const fields = [
      profile?.firstName,
      profile?.lastName,
      profile?.phone,
      profile?.gender,
      profile?.dateOfBirth,
      profile?.address?.street,
      profile?.address?.city,
      profile?.address?.state,
      profile?.address?.pincode,
      profile?.anniversary,
    ];
    const filled = fields.filter((f) => f && f !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = calculateCompletion();

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "zh", label: "Chinese" },
  ];

  const countries = [
    "India",
    "USA",
    "UK",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Switzerland",
  ];
  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "INR", label: "INR (₹)" },
  ];

  const validate = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.length > 40) {
      errors.firstName = "First name must be less than 40 characters";
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      errors.firstName = "First name should contain only alphabets";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.length > 40) {
      errors.lastName = "Last name must be less than 40 characters";
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
      errors.lastName = "Last name should contain only alphabets";
    }

    if (!formData.phone) {
      errors.phone = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = "Must be 10 digits";
    }

    if (!formData.gender) {
      errors.gender = "Please select a gender";
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      if (
        age < 13 ||
        (age === 13 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
      ) {
        errors.dateOfBirth = "You must be at least 13 years old";
      }
      if (dob > today) {
        errors.dateOfBirth = "Date of birth cannot be in the future";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUpdateProfile = async () => {
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setUpdateLoading(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      // Error handled in slice
    } finally {
      setUpdateLoading(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.overviewTab}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <FiShoppingBag className={styles.statIcon} />
          <div>
            <p className={styles.statValue}>{profile?.totalOrders || 0}</p>
            <p className={styles.statLabel}>Total Orders</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiDollarSign className={styles.statIcon} />
          <div>
            <p className={styles.statValue}>
              ₹{profile?.totalSpent?.toFixed(2) || "0.00"}
            </p>
            <p className={styles.statLabel}>Total Spent</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiStar className={styles.statIcon} />
          <div>
            <p className={styles.statValue}>{profile?.rewardPoints || 0}</p>
            <p className={styles.statLabel}>Reward Points</p>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className={styles.completionCard}>
        <div className={styles.completionHeader}>
          <h4>Profile Completion</h4>
          <span className={styles.completionPercentage}>{completion}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className={styles.completionText}>
          {completion < 100 ? (
            <>Complete your profile to get better recommendations</>
          ) : (
            <>
              <FiCheckCircle className={styles.completeIcon} /> Profile
              Complete!
            </>
          )}
        </p>
      </div>

      {/* ============================================
          REFERRAL SECTION
          ============================================ */}
      <div className={styles.referralCard}>
        <div className={styles.referralHeader}>
          <h3>
            <FiGift className={styles.sectionIcon} />
            Refer & Earn
          </h3>
          <span className={styles.referralBadge}>Active</span>
        </div>

        <p className={styles.referralSubtext}>
          Share your referral code and earn rewards when your friends make their
          first purchase! 🎉
        </p>

        {loadingReferral ? (
          <div className={styles.loadingReferral}>
            <FiLoader className={styles.spinner} />
            Loading referral code...
          </div>
        ) : (
          <>
            <div className={styles.referralCodeBox}>
              <div className={styles.codeDisplay}>
                <span className={styles.codeLabel}>Your Referral Code</span>
                <div className={styles.codeValue}>
                  {referralCode || "No code generated"}
                  {!referralCode && !generating && (
                    <button
                      className={styles.generateCodeBtn}
                      onClick={generateReferralCode}
                    >
                      Generate
                    </button>
                  )}
                  {generating && (
                    <span className={styles.generatingText}>
                      <FiLoader className={styles.spinnerSmall} /> Generating...
                    </span>
                  )}
                </div>
              </div>

              {referralCode && (
                <div className={styles.referralActions}>
                  <button
                    className={styles.copyBtn}
                    onClick={copyReferralLink}
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    className={styles.shareBtn}
                    onClick={shareReferralLink}
                  >
                    <FiShare2 />
                    Share
                  </button>
                </div>
              )}
            </div>

            <div className={styles.referralStats}>
              <div className={styles.statItem}>
                <FiUsers className={styles.statIcon} />
                <div>
                  <span className={styles.statLabel}>Total Referrals</span>
                  <span className={styles.statValue}>
                    {referralStats.totalReferrals || 0}
                  </span>
                </div>
              </div>
              <div className={styles.statItem}>
                <FiDollarSign className={styles.statIcon} />
                <div>
                  <span className={styles.statLabel}>Rewards Earned</span>
                  <span className={styles.statValue}>
                    ₹{referralStats.rewardsEarned || 0}
                  </span>
                </div>
              </div>
              <div className={styles.statItem}>
                <FiClock className={styles.statIcon} />
                <div>
                  <span className={styles.statLabel}>Pending Rewards</span>
                  <span className={styles.statValue}>
                    ₹{referralStats.pendingRewards || 0}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles.referralFooter}>
          <FiTrendingUp className={styles.footerIcon} />
          <span>
            Earn <strong>₹{profile?.referralReward || 50}</strong> for every
            friend who makes a purchase!
          </span>
        </div>
      </div>

      {/* Personal Information */}
      <div className={styles.infoCard}>
        <div className={styles.cardHeader}>
          <h3>Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editBtn}
            >
              <FiEdit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className={styles.cancelBtn}
            >
              <FiX size={16} />
              Cancel
            </button>
          )}
        </div>

        <div className={styles.infoGrid}>
          {/* First Name */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>First Name</span>
            {isEditing ? (
              <>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${styles.editInput} ${formErrors.firstName ? styles.errorInput : ""}`}
                  placeholder="First Name"
                  maxLength="40"
                />
                {formErrors.firstName && (
                  <span className={styles.errorMessage}>
                    <FiAlertCircle size={14} /> {formErrors.firstName}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.infoValue}>
                {profile?.firstName || "Not provided"}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Last Name</span>
            {isEditing ? (
              <>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${styles.editInput} ${formErrors.lastName ? styles.errorInput : ""}`}
                  placeholder="Last Name"
                  maxLength="40"
                />
                {formErrors.lastName && (
                  <span className={styles.errorMessage}>
                    <FiAlertCircle size={14} /> {formErrors.lastName}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.infoValue}>
                {profile?.lastName || "Not provided"}
              </span>
            )}
          </div>

          {/* Email - Read Only */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>
              <FiMail className={styles.infoIcon} />
              {profile?.email}
              <span className={styles.readOnlyBadge}>Read Only</span>
            </span>
          </div>

          {/* Phone */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mobile Number</span>
            {isEditing ? (
              <>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${styles.editInput} ${formErrors.phone ? styles.errorInput : ""}`}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
                {formErrors.phone && (
                  <span className={styles.errorMessage}>
                    <FiAlertCircle size={14} /> {formErrors.phone}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.infoValue}>
                <FiPhone className={styles.infoIcon} />
                {profile?.phone || "Not provided"}
              </span>
            )}
          </div>

          {/* Gender */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Gender</span>
            {isEditing ? (
              <>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`${styles.editSelect} ${formErrors.gender ? styles.errorInput : ""}`}
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && (
                  <span className={styles.errorMessage}>
                    <FiAlertCircle size={14} /> {formErrors.gender}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.infoValue}>
                {profile?.gender || "Not specified"}
              </span>
            )}
          </div>

          {/* Date of Birth */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date of Birth</span>
            {isEditing ? (
              <>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`${styles.editInput} ${formErrors.dateOfBirth ? styles.errorInput : ""}`}
                  max={
                    new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
                {formErrors.dateOfBirth && (
                  <span className={styles.errorMessage}>
                    <FiAlertCircle size={14} /> {formErrors.dateOfBirth}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.infoValue}>
                <FiCalendar className={styles.infoIcon} />
                {profile?.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </span>
            )}
          </div>

          {/* Anniversary */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Anniversary</span>
            {isEditing ? (
              <input
                type="date"
                name="anniversary"
                value={formData.anniversary}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              <span className={styles.infoValue}>
                <FiCalendar className={styles.infoIcon} />
                {profile?.anniversary
                  ? new Date(profile.anniversary).toLocaleDateString()
                  : "Not provided"}
              </span>
            )}
          </div>

          {/* Language */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Language</span>
            {isEditing ? (
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className={styles.editSelect}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.infoValue}>
                <FiGlobe className={styles.infoIcon} />
                {languages.find((l) => l.value === profile?.language)?.label ||
                  "English"}
              </span>
            )}
          </div>

          {/* Country */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Country</span>
            {isEditing ? (
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={styles.editSelect}
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.infoValue}>
                <FiMapPin className={styles.infoIcon} />
                {profile?.country || "India"}
              </span>
            )}
          </div>

          {/* Preferred Currency */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Preferred Currency</span>
            {isEditing ? (
              <select
                name="preferredCurrency"
                value={formData.preferredCurrency}
                onChange={handleChange}
                className={styles.editSelect}
              >
                {currencies.map((curr) => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.infoValue}>
                <FiDollarSign className={styles.infoIcon} />
                {currencies.find((c) => c.value === profile?.preferredCurrency)
                  ?.label || "INR (₹)"}
              </span>
            )}
          </div>

          {/* Member Since - Read Only */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Member Since</span>
            <span className={styles.infoValue}>
              <FiClock className={styles.infoIcon} />
              {profile?.memberSince
                ? new Date(profile.memberSince).toLocaleDateString()
                : "N/A"}
              <span className={styles.readOnlyBadge}>Read Only</span>
            </span>
          </div>

          {/* Last Login - Read Only */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Last Login</span>
            <span className={styles.infoValue}>
              <FiClock className={styles.infoIcon} />
              {profile?.lastLogin
                ? new Date(profile.lastLogin).toLocaleString()
                : "N/A"}
              <span className={styles.readOnlyBadge}>Read Only</span>
            </span>
          </div>

          {/* Reward Points - Read Only */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Reward Points</span>
            <span className={styles.infoValue}>
              <FiAward className={styles.infoIcon} />
              {profile?.rewardPoints || 0}
              <span className={styles.readOnlyBadge}>Read Only</span>
            </span>
          </div>

          {/* Account Status - Read Only */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Account Status</span>
            <span className={`${styles.infoValue} ${styles.accountStatus}`}>
              <span
                className={
                  profile?.isActive !== false
                    ? styles.statusActive
                    : styles.statusInactive
                }
              >
                {profile?.isActive !== false ? "Active" : "Inactive"}
              </span>
              <span className={styles.readOnlyBadge}>Read Only</span>
            </span>
          </div>
        </div>

        {/* Address Section */}
        <div className={styles.addressSection}>
          <h4>Address</h4>
          {isEditing ? (
            <div className={styles.addressForm}>
              <input
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={styles.editInput}
                placeholder="Street Address"
              />
              <div className={styles.addressRow}>
                <input
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder="City"
                />
                <input
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder="State"
                />
              </div>
              <div className={styles.addressRow}>
                <input
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder="Pincode"
                />
                <select
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className={styles.editSelect}
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className={styles.addressText}>
              {profile?.address?.street && (
                <>
                  {profile.address.street}, {profile.address.city},{" "}
                  {profile.address.state} - {profile.address.pincode}
                  <br />
                  {profile.address.country}
                </>
              )}
              {!profile?.address?.street && "No address added yet"}
            </p>
          )}
        </div>

        {isEditing && (
          <button
            onClick={handleUpdateProfile}
            disabled={updateLoading}
            className={styles.saveProfileBtn}
          >
            <FiSave size={16} />
            {updateLoading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;