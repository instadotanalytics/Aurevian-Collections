// src/Pages/Seller/SellerAuth/SellerRegister.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerSeller, resendOTP } from '../../../redux/slices/sellerSlice';
import { 
  FiArrowLeft, 
  FiArrowRight, 
  FiCheck, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiShoppingBag, 
  FiMapPin, 
  FiCreditCard, 
  FiShield, 
  FiAward, 
  FiUpload,
  FiTrendingUp,
  FiUsers,
  FiStar
} from 'react-icons/fi';
import { FaGem } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './SellerRegister.module.css';
import Header from "../../Layout/Header/Header"
import Footer from "../../Layout/Footer/Footer"

// Import step images
import Step1Image from "../../..//assets/Aurevianlogo.png";
import Step2Image from "../../../assets/b1.png";
import Step3Image from "../../../assets/Aurevianlogo.png";
import Step4Image from "../../../assets/b1.png";
import Step5Image from "../../../assets/Aurevianlogo.png";

const SellerRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.seller);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Step images mapping
  const stepImages = {
    1: Step1Image,
    2: Step2Image,
    3: Step3Image,
    4: Step4Image,
    5: Step5Image,
  };

  // Step information
  const stepInfo = {
    1: {
      title: 'Personal Information',
      description: 'Fill your personal details',
      icon: <FiUser />,
    },
    2: {
      title: 'PAN Card Details',
      description: 'Enter your PAN card details',
      icon: <FiShield />,
    },
    3: {
      title: 'Aadhaar Card Details',
      description: 'Enter your Aadhaar card details',
      icon: <FiAward />,
    },
    4: {
      title: 'Store & GST Details',
      description: 'Tell us about your store',
      icon: <FiShoppingBag />,
    },
    5: {
      title: 'Review & Submit',
      description: 'Review your information',
      icon: <FiCheck />,
    },
  };

  // ============================================
  // FORM DATA
  // ============================================
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emailOTP: '',
    phoneOTP: '',
    emailVerified: false,
    phoneVerified: false,
    panNumber: '',
    panCard: null,
    panVerified: false,
    aadhaarNumber: '',
    aadhaarCard: null,
    aadhaarVerified: false,
    gstNumber: '',
    gstCertificate: null,
    storeName: '',
    brandName: '',
    businessDescription: '',
    productCategories: [],
    website: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: ''
    },
    businessAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'Switzerland'
    },
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    },
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [panPreview, setPanPreview] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [gstPreview, setGstPreview] = useState(null);

  const categoryOptions = [
    { value: 'jewelry', label: '💎 Jewelry' },
    { value: 'rings', label: '💍 Rings' },
    { value: 'necklaces', label: '📿 Necklaces' },
    { value: 'earrings', label: '✨ Earrings' },
    { value: 'bracelets', label: '📿 Bracelets' },
    { value: 'watches', label: '⌚ Watches' },
    { value: 'perfume', label: '🌸 Perfume' },
    { value: 'sunglasses', label: '🕶️ Sunglasses' },
    { value: 'bags', label: '👜 Bags' },
    { value: 'other', label: '📦 Other' },
  ];

  const trustFeatures = [
    {
      icon: <FiShield />,
      title: 'Trusted Platform',
      description: 'Secure & Reliable Marketplace'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Grow Your Business',
      description: 'Reach Luxury Customers Worldwide'
    },
    {
      icon: <FiStar />,
      title: 'More Sales, More Success',
      description: "We're here to help you grow"
    }
  ];

  // OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (name === 'panCard') {
        setFormData(prev => ({ ...prev, panCard: file }));
        setPanPreview(URL.createObjectURL(file));
      } else if (name === 'aadhaarCard') {
        setFormData(prev => ({ ...prev, aadhaarCard: file }));
        setAadhaarPreview(URL.createObjectURL(file));
      } else if (name === 'gstCertificate') {
        setFormData(prev => ({ ...prev, gstCertificate: file }));
        setGstPreview(URL.createObjectURL(file));
      }
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialLink = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const currentCategories = prev.productCategories;
      if (currentCategories.includes(category)) {
        return {
          ...prev,
          productCategories: currentCategories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          productCategories: [...currentCategories, category]
        };
      }
    });
  };

  // ============================================
  // VALIDATION
  // ============================================
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (step === 2) {
      if (!formData.panNumber) {
        newErrors.panNumber = 'PAN number is required';
      } else {
        const cleanPan = formData.panNumber.trim().toUpperCase().replace(/\s/g, '');
        if (cleanPan.length !== 10) {
          newErrors.panNumber = 'PAN number must be exactly 10 characters';
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
          newErrors.panNumber = 'Enter valid PAN (e.g., ABCDE1234F)';
        }
      }
      if (!formData.panCard) {
        newErrors.panCard = 'PAN card image is required';
      }
    }
    
    if (step === 3) {
      if (!formData.aadhaarNumber) {
        newErrors.aadhaarNumber = 'Aadhaar number is required';
      } else {
        const cleanAadhaar = formData.aadhaarNumber.trim().replace(/\s/g, '');
        if (cleanAadhaar.length !== 12) {
          newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
        } else if (!/^[0-9]{12}$/.test(cleanAadhaar)) {
          newErrors.aadhaarNumber = 'Enter valid 12-digit Aadhaar number';
        }
      }
      if (!formData.aadhaarCard) {
        newErrors.aadhaarCard = 'Aadhaar card image is required';
      }
    }
    
    if (step === 4) {
      if (!formData.storeName) newErrors.storeName = 'Store name is required';
      if (formData.productCategories.length === 0) {
        newErrors.productCategories = 'Select at least one category';
      }
    }
    
    if (step === 5) {
      if (!formData.businessAddress.street) newErrors['businessAddress.street'] = 'Street address is required';
      if (!formData.businessAddress.city) newErrors['businessAddress.city'] = 'City is required';
      if (!formData.businessAddress.state) newErrors['businessAddress.state'] = 'State is required';
      if (!formData.businessAddress.pincode) newErrors['businessAddress.pincode'] = 'Pincode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 5) {
      if (!formData.termsAccepted) {
        toast.error('Please accept the terms and conditions');
        return;
      }
      
      setLoading(true);
      try {
        const submitData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          storeName: formData.storeName.trim(),
          brandName: formData.brandName?.trim() || '',
          businessDescription: formData.businessDescription?.trim() || '',
          productCategories: formData.productCategories || [],
          website: formData.website?.trim() || '',
          socialLinks: formData.socialLinks || {},
          panNumber: formData.panNumber.trim().toUpperCase(),
          aadhaarNumber: formData.aadhaarNumber.trim(),
          gstNumber: formData.gstNumber?.trim().toUpperCase() || null,
          businessAddress: {
            street: formData.businessAddress?.street?.trim() || '',
            city: formData.businessAddress?.city?.trim() || '',
            state: formData.businessAddress?.state?.trim() || '',
            pincode: formData.businessAddress?.pincode?.trim() || '',
            country: formData.businessAddress?.country || 'Switzerland'
          },
          bankDetails: {
            accountHolderName: formData.bankDetails?.accountHolderName?.trim() || '',
            bankName: formData.bankDetails?.bankName?.trim() || '',
            accountNumber: formData.bankDetails?.accountNumber?.trim() || '',
            ifscCode: formData.bankDetails?.ifscCode?.trim() || '',
            upiId: formData.bankDetails?.upiId?.trim() || ''
          },
          termsAccepted: formData.termsAccepted
        };

        const result = await dispatch(registerSeller(submitData)).unwrap();
        
        if (result) {
          localStorage.setItem('sellerEmail', submitData.email);
          localStorage.setItem('sellerPhone', submitData.phone);
          
          toast.success('Registration successful! Please verify your email and phone.');
          navigate('/seller/verify-otp', { 
            state: { 
              email: submitData.email, 
              phone: submitData.phone 
            } 
          });
        }
      } catch (error) {
        console.error('❌ Registration error:', error);
        toast.error(error?.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      handleNext();
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { label: 'Personal', icon: <FiUser /> },
      { label: 'PAN', icon: <FiShield /> },
      { label: 'Aadhaar', icon: <FiAward /> },
      { label: 'Store', icon: <FiShoppingBag /> },
      { label: 'Review', icon: <FiCheck /> },
    ];
    return (
     
      <div className={styles.stepIndicator}>
        {steps.map((step, index) => (
          <div key={index} className={styles.stepItem}>
            <div className={`${styles.stepNumber} ${currentStep > index + 1 ? styles.completed : ''} ${currentStep === index + 1 ? styles.active : ''}`}>
              {currentStep > index + 1 ? <FiCheck /> : step.icon}
            </div>
            <span className={styles.stepLabel}>{step.label}</span>
            {index < steps.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderPanCard();
      case 3: return renderAadhaarCard();
      case 4: return renderStoreInfo();
      case 5: return renderReview();
      default: return null;
    }
  };

  // ============================================
  // STEP 1: PERSONAL INFORMATION
  // ============================================
  const renderPersonalInfo = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Personal Information</h2>
      <p className={styles.stepDesc}>Fill your personal details</p>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>First Name <span className={styles.required}>*</span></label>
          <input name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} className={errors.firstName ? styles.error : ''} />
          {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Last Name <span className={styles.required}>*</span></label>
          <input name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} className={errors.lastName ? styles.error : ''} />
          {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Email Address <span className={styles.required}>*</span></label>
        <input type="email" name="email" placeholder="seller@example.com" value={formData.email} onChange={handleChange} className={errors.email ? styles.error : ''} />
        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Phone Number <span className={styles.required}>*</span></label>
        <input type="tel" name="phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} className={errors.phone ? styles.error : ''} />
        {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Password <span className={styles.required}>*</span></label>
          <input type="password" name="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} className={errors.password ? styles.error : ''} />
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Confirm Password <span className={styles.required}>*</span></label>
          <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? styles.error : ''} />
          {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
        </div>
      </div>
    </div>
  );

  // ============================================
  // STEP 2: PAN CARD
  // ============================================
  const renderPanCard = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>PAN Card Details</h2>
      <p className={styles.stepDesc}>Enter your PAN card details for KYC</p>

      <div className={styles.formGroup}>
        <label>PAN Number <span className={styles.required}>*</span></label>
        <input
          name="panNumber"
          placeholder="ABCDE1234F"
          value={formData.panNumber}
          onChange={(e) => {
            const value = e.target.value.toUpperCase().replace(/\s/g, '');
            setFormData(prev => ({ ...prev, panNumber: value }));
            if (errors.panNumber) {
              setErrors(prev => ({ ...prev, panNumber: '' }));
            }
          }}
          className={errors.panNumber ? styles.error : ''}
          maxLength={10}
        />
        {errors.panNumber && <span className={styles.errorText}>{errors.panNumber}</span>}
        <small className={styles.hint}>Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)</small>
        {formData.panNumber && formData.panNumber.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber) && (
          <span className={styles.validText}>✅ Valid PAN format</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Upload PAN Card <span className={styles.required}>*</span></label>
        <div className={styles.fileUploadWrapper}>
          <div className={styles.fileUploadArea}>
            {panPreview ? (
              <div className={styles.filePreview}>
                <img src={panPreview} alt="PAN Card" />
                <button type="button" className={styles.removeFile} onClick={() => { setFormData(prev => ({ ...prev, panCard: null })); setPanPreview(null); }}>×</button>
              </div>
            ) : (
              <>
                <FiUpload className={styles.uploadIcon} />
                <p>Click to upload PAN card image</p>
                <span>JPG, PNG, PDF (Max 5MB)</span>
              </>
            )}
            <input type="file" name="panCard" accept="image/*,.pdf" onChange={handleChange} className={styles.fileInput} />
          </div>
        </div>
        {errors.panCard && <span className={styles.errorText}>{errors.panCard}</span>}
      </div>
    </div>
  );

  // ============================================
  // STEP 3: AADHAAR CARD
  // ============================================
  const renderAadhaarCard = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Aadhaar Card Details</h2>
      <p className={styles.stepDesc}>Enter your Aadhaar card details for KYC</p>

      <div className={styles.formGroup}>
        <label>Aadhaar Number <span className={styles.required}>*</span></label>
        <input
          name="aadhaarNumber"
          placeholder="123456789012"
          value={formData.aadhaarNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\s/g, '');
            setFormData(prev => ({ ...prev, aadhaarNumber: value }));
            if (errors.aadhaarNumber) {
              setErrors(prev => ({ ...prev, aadhaarNumber: '' }));
            }
          }}
          className={errors.aadhaarNumber ? styles.error : ''}
          maxLength={12}
        />
        {errors.aadhaarNumber && <span className={styles.errorText}>{errors.aadhaarNumber}</span>}
        <small className={styles.hint}>12-digit Aadhaar number</small>
        {formData.aadhaarNumber && formData.aadhaarNumber.length === 12 && /^[0-9]{12}$/.test(formData.aadhaarNumber) && (
          <span className={styles.validText}>✅ Valid Aadhaar format</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Upload Aadhaar Card <span className={styles.required}>*</span></label>
        <div className={styles.fileUploadWrapper}>
          <div className={styles.fileUploadArea}>
            {aadhaarPreview ? (
              <div className={styles.filePreview}>
                <img src={aadhaarPreview} alt="Aadhaar Card" />
                <button type="button" className={styles.removeFile} onClick={() => { setFormData(prev => ({ ...prev, aadhaarCard: null })); setAadhaarPreview(null); }}>×</button>
              </div>
            ) : (
              <>
                <FiUpload className={styles.uploadIcon} />
                <p>Click to upload Aadhaar card image</p>
                <span>JPG, PNG, PDF (Max 5MB)</span>
              </>
            )}
            <input type="file" name="aadhaarCard" accept="image/*,.pdf" onChange={handleChange} className={styles.fileInput} />
          </div>
        </div>
        {errors.aadhaarCard && <span className={styles.errorText}>{errors.aadhaarCard}</span>}
      </div>
    </div>
  );

  // ============================================
  // STEP 4: STORE INFORMATION
  // ============================================
  const renderStoreInfo = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Store & GST Details</h2>
      <p className={styles.stepDesc}>Tell us about your store (GST is optional)</p>

      <div className={styles.formGroup}>
        <label>Store Name <span className={styles.required}>*</span></label>
        <input name="storeName" placeholder="Your Brand Name" value={formData.storeName} onChange={handleChange} className={errors.storeName ? styles.error : ''} />
        {errors.storeName && <span className={styles.errorText}>{errors.storeName}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Brand Name</label>
        <input name="brandName" placeholder="Your Brand Name (optional)" value={formData.brandName} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>Business Description</label>
        <textarea name="businessDescription" placeholder="Tell us about your jewellery business..." value={formData.businessDescription} onChange={handleChange} rows={2} />
      </div>

      <div className={styles.formGroup}>
        <label>GST Number <span className={styles.optional}>(Optional)</span></label>
        <input
          name="gstNumber"
          placeholder="22AAAAA0000A1Z5"
          value={formData.gstNumber}
          onChange={(e) => {
            const value = e.target.value.toUpperCase().replace(/\s/g, '');
            setFormData(prev => ({ ...prev, gstNumber: value }));
          }}
        />
        <small className={styles.hint}>Enter GST number if you have one (optional)</small>
      </div>

      <div className={styles.formGroup}>
        <label>GST Certificate <span className={styles.optional}>(Optional)</span></label>
        <div className={styles.fileUploadWrapper}>
          <div className={styles.fileUploadArea}>
            {gstPreview ? (
              <div className={styles.filePreview}>
                <img src={gstPreview} alt="GST Certificate" />
                <button type="button" className={styles.removeFile} onClick={() => { setFormData(prev => ({ ...prev, gstCertificate: null })); setGstPreview(null); }}>×</button>
              </div>
            ) : (
              <>
                <FiUpload className={styles.uploadIcon} />
                <p>Click to upload GST certificate (optional)</p>
                <span>JPG, PNG, PDF (Max 5MB)</span>
              </>
            )}
            <input type="file" name="gstCertificate" accept="image/*,.pdf" onChange={handleChange} className={styles.fileInput} />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Categories <span className={styles.required}>*</span></label>
        <div className={styles.categoryGrid}>
          {categoryOptions.map((cat) => (
            <button key={cat.value} type="button" className={`${styles.categoryBtn} ${formData.productCategories.includes(cat.value) ? styles.selected : ''}`} onClick={() => handleCategoryToggle(cat.value)}>
              {cat.label}
            </button>
          ))}
        </div>
        {errors.productCategories && <span className={styles.errorText}>{errors.productCategories}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Website</label>
        <input name="website" placeholder="https://yourstore.com" value={formData.website} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>Social Links</label>
        <div className={styles.socialLinks}>
          <input placeholder="Facebook URL" value={formData.socialLinks.facebook} onChange={(e) => handleSocialLink('facebook', e.target.value)} />
          <input placeholder="Instagram URL" value={formData.socialLinks.instagram} onChange={(e) => handleSocialLink('instagram', e.target.value)} />
        </div>
      </div>
    </div>
  );

  // ============================================
  // STEP 5: REVIEW
  // ============================================
  const renderReview = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Review & Submit</h2>
      <p className={styles.stepDesc}>Please review your information before submitting</p>

      <div className={styles.reviewSection}>
        <h4>Personal Information</h4>
        <div className={styles.reviewGrid}>
          <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
          <div><strong>Email:</strong> {formData.email}</div>
          <div><strong>Phone:</strong> {formData.phone}</div>
        </div>
      </div>

      <div className={styles.reviewSection}>
        <h4>KYC Documents</h4>
        <div className={styles.reviewGrid}>
          <div><strong>PAN:</strong> {formData.panNumber}</div>
          <div><strong>Aadhaar:</strong> {formData.aadhaarNumber}</div>
          <div><strong>GST:</strong> {formData.gstNumber || 'Not provided'}</div>
        </div>
      </div>

      <div className={styles.reviewSection}>
        <h4>Store Information</h4>
        <div className={styles.reviewGrid}>
          <div><strong>Store:</strong> {formData.storeName}</div>
          <div><strong>Categories:</strong> {formData.productCategories.join(', ')}</div>
        </div>
      </div>

      <div className={styles.termsGroup}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} />
          <span>I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link></span>
        </label>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
     <>
    <Header/>
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Left Side - Image changes with step */}
          <div className={styles.leftPanel}>
            <div className={styles.imageWrapper}>
              <img 
                src={stepImages[currentStep]} 
                alt={`Step ${currentStep} - ${stepInfo[currentStep].title}`} 
                className={styles.sideImage} 
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className={styles.rightPanel}>
            <div className={styles.header}>
              <h1 className={styles.title}>Become a Seller</h1>
              <p className={styles.subtitle}>Complete your registration to start selling on Aurevian</p>
            </div>

            {renderStepIndicator()}

            <form onSubmit={handleSubmit} className={styles.form}>
              {renderStepContent()}

              <div className={styles.navigation}>
                {currentStep > 1 && (
                  <button type="button" onClick={handlePrevious} className={styles.prevBtn} disabled={loading}>
                    <FiArrowLeft /> Back
                  </button>
                )}

                <button type="submit" className={styles.nextBtn} disabled={loading}>
                  {loading ? 'Submitting...' : currentStep === 5 ? 'Submit Application' : 'Next Step'}
                  {currentStep < 5 && <FiArrowRight />}
                </button>
              </div>
            </form>

            {/* Trust Features */}
            {/* <div className={styles.trustFeatures}>
              <div className={styles.trustHeader}>
                <FaGem className={styles.trustHeaderIcon} />
                <span>Join 500+ successful sellers</span>
              </div>
              <p className={styles.trustSubtext}>and grow your jewellery business with Aurevian.</p>
              <div className={styles.trustGrid}>
                {trustFeatures.map((feature, index) => (
                  <div key={index} className={styles.trustItem}>
                    <div className={styles.trustItemIcon}>{feature.icon}</div>
                    <div>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            <div className={styles.footer}>
              <p>Already have an account? <Link to="/seller/login">Sign in here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
        </>
  );
};

export default SellerRegister;