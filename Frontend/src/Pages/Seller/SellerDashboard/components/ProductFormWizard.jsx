// src/Pages/Seller/SellerDashboard/components/ProductFormWizard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiX,
  FiPlus,
  FiTrash2,
  FiSave,
  FiImage,
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiDollarSign,
  FiShoppingBag,
  FiTruck,
  FiSearch,
  FiInfo,
  FiCamera,
  FiSettings,
  FiPackage,
  FiTag,
  FiGrid,
  FiHeart,
  FiClock,
  FiStar,
  FiTrendingUp,
  FiZap,
  FiAward,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./ProductFormWizard.module.css";

import {
  createProduct,
  updateProduct,
  fetchCategories,
  fetchProducts,
  setSelectedProduct,
  clearSelectedProduct,
} from "../../../../redux/slices/sellerProductSlice";

// ============================================
// CONSTANTS
// ============================================
const MATERIALS = [
  "Gold",
  "Silver",
  "Platinum",
  "Rose Gold",
  "White Gold",
  "Sterling Silver",
  "Brass",
  "Copper",
  "Titanium",
  "Palladium",
  "Steel",
  "Other",
];

const PLATING_OPTIONS = [
  "Gold Plated",
  "Silver Plated",
  "Rhodium Plated",
  "Rose Gold Plated",
  "White Gold Plated",
  "None",
  "Other",
];

const STONE_TYPES = [
  "Diamond",
  "Ruby",
  "Emerald",
  "Sapphire",
  "Pearl",
  "Cubic Zirconia",
  "Moissanite",
  "Topaz",
  "Amethyst",
  "Garnet",
  "Opal",
  "Turquoise",
  "None",
  "Other",
];

const STONE_COLORS = [
  "White",
  "Yellow",
  "Blue",
  "Red",
  "Green",
  "Pink",
  "Purple",
  "Black",
  "Clear",
  "Champagne",
  "Rose",
  "Other",
];

const FINISH_OPTIONS = [
  "Polished",
  "Matte",
  "Brushed",
  "Hammered",
  "Textured",
  "Antique",
  "Mirror",
  "Satin",
  "Other",
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "Free Size",
  "Adjustable",
  "Custom",
  "Other",
];

const OCCASIONS = [
  "Wedding",
  "Engagement",
  "Anniversary",
  "Birthday",
  "Casual",
  "Party",
  "Festive",
  "Professional",
  "Gift",
  "Daily Wear",
  "Valentine",
  "Mother's Day",
  "Graduation",
  "Other",
];

const STYLES = [
  "Classic",
  "Modern",
  "Vintage",
  "Antique",
  "Minimalist",
  "Statement",
  "Bohemian",
  "Ethnic",
  "Contemporary",
  "Art Deco",
  "Victorian",
  "Romantic",
  "Geometric",
  "Floral",
  "Other",
];

const GENDERS = ["Men", "Women", "Unisex", "Kids"];
const AVAILABILITY_OPTIONS = ["In Stock", "Out of Stock", "Pre Order"];
const STATUS_OPTIONS = ["Draft", "Pending", "Published", "Scheduled"];
const WARRANTY_DURATIONS = [
  "1 Month",
  "3 Months",
  "6 Months",
  "1 Year",
  "2 Years",
  "5 Years",
  "Lifetime",
];

const PLACEMENT_OPTIONS = [
  { value: "shop", label: "Shop Page", icon: FiGrid },
  { value: "collections", label: "Collections", icon: FiPackage },
  { value: "gifts", label: "Gift Guide", icon: FiTag },
  { value: "offers", label: "Offers Page", icon: FiHeart },
];

const STEPS = [
  { id: 1, name: "Basic", icon: FiInfo },
  { id: 2, name: "Images", icon: FiCamera },
  { id: 3, name: "Pricing", icon: FiDollarSign },
  { id: 4, name: "Inventory", icon: FiShoppingBag },
  { id: 5, name: "Specs", icon: FiSettings },
  { id: 6, name: "Shipping", icon: FiTruck },
  { id: 7, name: "SEO", icon: FiSearch },
];

// ============================================
// MAIN COMPONENT
// ============================================
const ProductFormWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { categories, isLoading, selectedProduct, products, limitStatus } =
    useSelector((state) => state.sellerProduct);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productName: "",
    shortDescription: "",
    fullDescription: "",
    brand: "",
    categoryId: "",
    subCategoryId: "",
    placements: [],
    thumbnail: null,
    images: [],
    originalPrice: "",
    salePrice: "",
    currency: "INR",
    taxIncluded: true,
    stockQuantity: "",
    minOrderQty: 1,
    maxOrderQty: "",
    availability: "In Stock",
    material: "Gold",
    plating: "None",
    stoneType: "None",
    stoneColor: "Clear",
    finish: "Polished",
    weight: "",
    weightUnit: "g",
    size: "Free Size",
    adjustable: false,
    occasion: "Casual",
    style: "Modern",
    collection: "",
    gender: "Unisex",
    hasVariants: false,
    variants: [],
    shippingWeight: "",
    shippingWeightUnit: "g",
    shippingLength: "",
    shippingWidth: "",
    shippingHeight: "",
    shippingDimensionUnit: "cm",
    freeShipping: false,
    shippingType: "Customer Pays",
    returnAvailable: true,
    returnDays: 7,
    warrantyAvailable: false,
    warrantyDuration: "1 Year",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    featured: false,
    trending: false,
    bestSeller: false,
    newArrival: false,
    flashSale: false,
    status: "Draft",
  });

  // imagePreviews is the single source of truth for the gallery, both in
  // create and edit mode. Each entry is either:
  //   - { url, publicId, altText, isExisting: true }  — already on the product
  //   - { file, url (blob), isExisting: false }        — newly picked, not uploaded yet
  // formData.images/thumbnail are ONLY ever set to actual File objects the
  // seller just picked — never to existing product data — so the update
  // thunk can tell "no new file chosen" apart from "here's a replacement".
  const [imagePreviews, setImagePreviews] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const fileInputRef = useRef(null);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    fetchAttempted.current = false;
  }, [id]);

  useEffect(() => {
    if (!isEdit) return;

    if (selectedProduct && selectedProduct._id === id) {
      populateForm(selectedProduct);
      return;
    }

    const cached = products.find((p) => p._id === id);
    if (cached) {
      dispatch(setSelectedProduct(cached));
      return;
    }

    if (!fetchAttempted.current) {
      fetchAttempted.current = true;
      dispatch(fetchProducts({})).then((res) => {
        if (fetchProducts.fulfilled.match(res)) {
          const found = res.payload.products.find((p) => p._id === id);
          if (found) {
            dispatch(setSelectedProduct(found));
          } else {
            toast.error("Product not found");
            navigate("/seller/dashboard/products");
          }
        }
      });
    }
  }, [isEdit, id, selectedProduct, products, dispatch, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch]);

  const populateForm = (product) => {
    setFormData({
      productName: product.productName || "",
      shortDescription: product.shortDescription || "",
      fullDescription: product.fullDescription || "",
      brand: product.brand || "",
      categoryId: product.category?.categoryId || "",
      subCategoryId: product.category?.subCategoryId || "",
      placements: product.placements || [],
      thumbnail: null, // stays null until the seller picks a NEW file
      images: [],
      originalPrice: product.pricing?.originalPrice || "",
      salePrice: product.pricing?.salePrice || "",
      currency: product.pricing?.currency || "INR",
      taxIncluded:
        product.pricing?.taxIncluded !== undefined
          ? product.pricing.taxIncluded
          : true,
      stockQuantity: product.inventory?.stockQuantity || "",
      minOrderQty: product.inventory?.minOrderQty || 1,
      maxOrderQty: product.inventory?.maxOrderQty || "",
      availability: product.inventory?.availability || "In Stock",
      material: product.specifications?.material || "Gold",
      plating: product.specifications?.plating || "None",
      stoneType: product.specifications?.stoneType || "None",
      stoneColor: product.specifications?.stoneColor || "Clear",
      finish: product.specifications?.finish || "Polished",
      weight: product.specifications?.weight?.value || "",
      weightUnit: product.specifications?.weight?.unit || "g",
      size: product.specifications?.size || "Free Size",
      adjustable: product.specifications?.adjustable || false,
      occasion: product.specifications?.occasion || "Casual",
      style: product.specifications?.style || "Modern",
      collection: product.specifications?.collection || "",
      gender: product.specifications?.gender || "Unisex",
      hasVariants: product.hasVariants || false,
      variants: product.variants || [],
      shippingWeight: product.shipping?.weight?.value || "",
      shippingWeightUnit: product.shipping?.weight?.unit || "g",
      shippingLength: product.shipping?.dimensions?.length || "",
      shippingWidth: product.shipping?.dimensions?.width || "",
      shippingHeight: product.shipping?.dimensions?.height || "",
      shippingDimensionUnit: product.shipping?.dimensions?.unit || "cm",
      freeShipping: product.shipping?.freeShipping || false,
      shippingType: product.shipping?.shippingType || "Customer Pays",
      returnAvailable:
        product.returnPolicy?.returnAvailable !== undefined
          ? product.returnPolicy.returnAvailable
          : true,
      returnDays: product.returnPolicy?.returnDays || 7,
      warrantyAvailable: product.returnPolicy?.warrantyAvailable || false,
      warrantyDuration: product.returnPolicy?.warrantyDuration || "1 Year",
      seoTitle: product.seo?.title || "",
      seoDescription: product.seo?.description || "",
      seoKeywords: product.seo?.keywords?.join(", ") || "",
      canonicalUrl: product.seo?.canonicalUrl || "",
      featured: product.labels?.featured || false,
      trending: product.labels?.trending || false,
      bestSeller: product.labels?.bestSeller || false,
      newArrival: product.labels?.newArrival || false,
      flashSale: product.labels?.flashSale || false,
      status: product.status || "Draft",
    });

    if (product.images && product.images.length > 0) {
      setImagePreviews(
        product.images.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          altText: img.altText || "",
          isExisting: true,
        })),
      );
    } else {
      setImagePreviews([]);
    }

    if (product.thumbnail?.url) {
      setThumbnailPreview({
        url: product.thumbnail.url,
        publicId: product.thumbnail.publicId,
        altText: product.thumbnail.altText || "",
        isExisting: true,
      });
    } else {
      setThumbnailPreview(null);
    }

    const allSteps = new Set([1, 2, 3, 4, 5, 6, 7]);
    setCompletedSteps(allSteps);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePlacement = (value) => {
    setFormData((prev) => ({
      ...prev,
      placements: prev.placements.includes(value)
        ? prev.placements.filter((p) => p !== value)
        : [...prev.placements, value],
    }));
  };

  const toggleAllPlacements = () => {
    setFormData((prev) => ({
      ...prev,
      placements:
        prev.placements.length === PLACEMENT_OPTIONS.length
          ? []
          : PLACEMENT_OPTIONS.map((p) => p.value),
    }));
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    // Revoke the previous blob preview URL if the seller had already picked
    // (but not yet saved) a different replacement thumbnail
    if (thumbnailPreview && !thumbnailPreview.isExisting) {
      URL.revokeObjectURL(thumbnailPreview.url);
    }
    setFormData({ ...formData, thumbnail: file });
    setThumbnailPreview({
      url: URL.createObjectURL(file),
      isExisting: false,
    });
  };

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const invalidFiles = files.filter((f) => !f.type.startsWith("image/"));
    if (invalidFiles.length) {
      toast.error(`${invalidFiles.length} file(s) are not images`);
      return;
    }
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length) {
      toast.error(`${oversized.length} file(s) exceed 10MB limit`);
      return;
    }
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));
    // imagePreviews is the single source of truth — formData.images is
    // derived from it at submit time, so we don't maintain a second
    // parallel array here (that's what caused removeImage to delete the
    // wrong file previously).
    setImagePreviews((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed && !removed.isExisting && removed.url) {
        URL.revokeObjectURL(removed.url);
      }
      return next;
    });
  };

  const removeThumbnail = () => {
    if (thumbnailPreview && !thumbnailPreview.isExisting) {
      URL.revokeObjectURL(thumbnailPreview.url);
    }
    setThumbnailPreview(null);
    setFormData({ ...formData, thumbnail: null });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          sku: `V${Date.now().toString().slice(-6)}`,
          attributes: { color: "", size: "" },
          price: { originalPrice: "", salePrice: "" },
          stock: { quantity: 0 },
          images: [],
        },
      ],
    });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    const keys = field.split(".");
    if (keys.length === 1) {
      newVariants[index][field] = value;
    } else if (keys.length === 2) {
      newVariants[index][keys[0]][keys[1]] = value;
    } else if (keys.length === 3) {
      newVariants[index][keys[0]][keys[1]][keys[2]] = value;
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 7) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(currentStep);
      setCompletedSteps(newCompleted);
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.productName) {
          toast.error("Product name is required");
          return false;
        }
        if (!formData.brand) {
          toast.error("Brand is required");
          return false;
        }
        if (!formData.categoryId) {
          toast.error("Category is required");
          return false;
        }
        return true;
      case 2:
        // ✅ FIX: check thumbnailPreview, not formData.thumbnail.
        // formData.thumbnail is only ever set when the seller picks a NEW
        // file — in edit mode it's deliberately null until they replace
        // it. thumbnailPreview reflects the actual current thumbnail
        // (existing OR newly picked), which is what "is there a thumbnail
        // at all" should be checking.
        if (!thumbnailPreview) {
          toast.error("Thumbnail image is required");
          return false;
        }
        if (imagePreviews.length < 2) {
          toast.error("Minimum 2 product images are required");
          return false;
        }
        return true;
      case 3:
        if (!formData.originalPrice) {
          toast.error("Original price is required");
          return false;
        }
        if (parseFloat(formData.originalPrice) <= 0) {
          toast.error("Original price must be greater than 0");
          return false;
        }
        return true;
      case 4:
        if (!formData.stockQuantity) {
          toast.error("Stock quantity is required");
          return false;
        }
        if (parseInt(formData.stockQuantity) < 0) {
          toast.error("Stock quantity cannot be negative");
          return false;
        }
        return true;
      case 5:
        return true;
      case 6:
        if (!formData.shippingWeight) {
          toast.error("Shipping weight is required");
          return false;
        }
        if (
          !formData.shippingLength ||
          !formData.shippingWidth ||
          !formData.shippingHeight
        ) {
          toast.error("Shipping dimensions are required");
          return false;
        }
        return true;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    for (let step = 1; step <= 7; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    if (
      !isEdit &&
      limitStatus &&
      !limitStatus.isUnlimited &&
      limitStatus.remaining <= 0
    ) {
      toast.error(
        `Product limit reached. You have ${limitStatus.remaining} slots remaining.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = { ...formData };

      // ✅ FIX: derive the new-files-only image list from imagePreviews
      // (the single source of truth) instead of the old parallel
      // formData.images array, which could drift out of sync with
      // imagePreviews after adds/removes.
      const newImageFiles = imagePreviews
        .filter((img) => !img.isExisting && img.file)
        .map((img) => img.file);
      submitData.images = newImageFiles;

      // thumbnail: File if the seller picked a new one, otherwise null —
      // the update thunk only appends it to the request when it's an
      // actual File, so "null" here correctly means "keep the existing one"
      submitData.thumbnail = formData.thumbnail;

      // ✅ NEW: tell the backend exactly which existing images the seller
      // kept, so it can merge them with any new uploads instead of wiping
      // the whole gallery whenever new files are added.
      if (isEdit) {
        submitData.existingImages = imagePreviews
          .filter((img) => img.isExisting)
          .map((img) => ({
            url: img.url,
            publicId: img.publicId,
            altText: img.altText || "",
          }));
      }

      if (!submitData.salePrice) delete submitData.salePrice;
      if (!submitData.maxOrderQty) delete submitData.maxOrderQty;
      if (!submitData.weight) delete submitData.weight;
      if (!submitData.collection) delete submitData.collection;
      if (!submitData.seoTitle) delete submitData.seoTitle;
      if (!submitData.seoDescription) delete submitData.seoDescription;
      if (!submitData.seoKeywords) delete submitData.seoKeywords;
      if (!submitData.canonicalUrl) delete submitData.canonicalUrl;

      if (isEdit) {
        await dispatch(updateProduct({ id, productData: submitData })).unwrap();
        toast.success("Product updated successfully");
      } else {
        await dispatch(createProduct(submitData)).unwrap();
        toast.success("Product created successfully");
      }
      navigate("/seller/dashboard/products");
    } catch (error) {
      toast.error(error || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBasicInfo
            formData={formData}
            handleInputChange={handleInputChange}
            categories={categories}
            togglePlacement={togglePlacement}
            toggleAllPlacements={toggleAllPlacements}
          />
        );
      case 2:
        return (
          <StepImages
            formData={formData}
            handleInputChange={handleInputChange}
            thumbnailPreview={thumbnailPreview}
            imagePreviews={imagePreviews}
            handleThumbnailUpload={handleThumbnailUpload}
            handleImagesUpload={handleImagesUpload}
            removeThumbnail={removeThumbnail}
            removeImage={removeImage}
            fileInputRef={fileInputRef}
          />
        );
      case 3:
        return (
          <StepPricing
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <StepInventory
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 5:
        return (
          <StepSpecifications
            formData={formData}
            handleInputChange={handleInputChange}
            addVariant={addVariant}
            removeVariant={removeVariant}
            updateVariant={updateVariant}
          />
        );
      case 6:
        return (
          <StepShipping
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 7:
        return (
          <StepSEO formData={formData} handleInputChange={handleInputChange} />
        );
      default:
        return null;
    }
  };

  const renderProgressBar = () => {
    const progress = (currentStep / 7) * 100;
    return (
      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressSteps}>
          {STEPS.map((step) => {
            const isCompleted = completedSteps.has(step.id);
            const isActive = currentStep === step.id;
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`${styles.stepIndicator} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""}`}
                onClick={() => isCompleted && goToStep(step.id)}
              >
                <div className={styles.stepCircle}>
                  {isCompleted ? <FiCheck size={14} /> : <Icon size={14} />}
                </div>
                <span className={styles.stepLabel}>{step.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading && isEdit) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/seller/dashboard/products")}
        >
          <FiArrowLeft size={18} />
          Back
        </button>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          {limitStatus && !isEdit && (
            <span className={styles.limitInfo}>
              {limitStatus.isUnlimited ? "∞" : `${limitStatus.remaining} left`}
            </span>
          )}
        </div>
        <div className={styles.headerRight}>
          <span className={styles.stepBadge}>Step {currentStep}/7</span>
        </div>
      </div>

      {renderProgressBar()}

      <div className={styles.formContainer}>
        <div className={styles.stepContent}>{renderStepContent()}</div>
      </div>

      <div className={styles.navigation}>
        <button
          className={styles.prevBtn}
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <FiChevronLeft size={16} />
          Back
        </button>
        <div className={styles.navRight}>
          {currentStep === 7 ? (
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <FiSave size={16} />
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          ) : (
            <button className={styles.nextBtn} onClick={nextStep}>
              Next
              <FiChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFormWizard;

// ============================================
// STEP COMPONENTS
// ============================================

const StepBasicInfo = ({
  formData,
  handleInputChange,
  categories,
  togglePlacement,
  toggleAllPlacements,
}) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconWrapper}>
          <FiInfo size={22} />
        </div>
        <div>
          <h2>Basic Information</h2>
          <p>Product details and placement</p>
        </div>
      </div>

      <div className={styles.stepBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>
              Product Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="e.g. Diamond Pendant Necklace"
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              Brand <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g. Aurevian"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>
              Category <span className={styles.required}>*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          {formData.categoryId && (
            <div className={styles.formGroup}>
              <label>Sub Category</label>
              <select
                name="subCategoryId"
                value={formData.subCategoryId}
                onChange={handleInputChange}
              >
                <option value="">Select Sub Category</option>
                {categories
                  .filter((cat) => cat.id !== formData.categoryId)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Placements</label>
          <div className={styles.placementGrid}>
            <div className={styles.placementAll}>
              <input
                type="checkbox"
                checked={
                  formData.placements.length === PLACEMENT_OPTIONS.length
                }
                onChange={toggleAllPlacements}
                id="allPlacements"
              />
              <label htmlFor="allPlacements">All</label>
            </div>
            {PLACEMENT_OPTIONS.map((opt) => (
              <div key={opt.value} className={styles.placementItem}>
                <input
                  type="checkbox"
                  checked={formData.placements.includes(opt.value)}
                  onChange={() => togglePlacement(opt.value)}
                  id={`placement-${opt.value}`}
                />
                <label htmlFor={`placement-${opt.value}`}>
                  <opt.icon size={12} />
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
          <span className={styles.hint}>Always visible on category page</span>
        </div>

        <div className={styles.formGroup}>
          <label>Short Description</label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            placeholder="Brief description (max 500 chars)"
            maxLength={500}
            rows={2}
          />
          <span className={styles.charCount}>
            {formData.shortDescription?.length || 0}/500
          </span>
        </div>

        <div className={styles.formGroup}>
          <label>Full Description</label>
          <textarea
            name="fullDescription"
            value={formData.fullDescription}
            onChange={handleInputChange}
            placeholder="Detailed product description"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

const StepImages = ({
  formData,
  thumbnailPreview,
  imagePreviews,
  handleThumbnailUpload,
  handleImagesUpload,
  removeThumbnail,
  removeImage,
  fileInputRef,
}) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconWrapper}>
          <FiCamera size={22} />
        </div>
        <div>
          <h2>Product Images</h2>
          <p>Upload high-quality images</p>
        </div>
      </div>

      <div className={styles.stepBody}>
        <div className={styles.thumbnailSection}>
          <label>
            Thumbnail <span className={styles.required}>*</span>
          </label>
          <div className={styles.thumbnailUpload}>
            {thumbnailPreview ? (
              <div className={styles.thumbnailPreview}>
                <img src={thumbnailPreview.url} alt="Thumbnail" />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={removeThumbnail}
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div
                className={styles.uploadArea}
                onClick={() =>
                  document.getElementById("thumbnailInput").click()
                }
              >
                <FiImage size={32} />
                <p>Upload thumbnail</p>
                <span>JPG, PNG, WebP • Max 10MB</span>
              </div>
            )}
            <input
              id="thumbnailInput"
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className={styles.imagesSection}>
          <label>
            Product Images <span className={styles.required}>*</span>{" "}
            <span className={styles.hint}>(min 2)</span>
          </label>
          <div className={styles.imageGrid}>
            {imagePreviews.map((img, index) => (
              <div key={index} className={styles.imagePreview}>
                <img src={img.url} alt={`Product ${index + 1}`} />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => removeImage(index)}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
            <div
              className={styles.addImageBox}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiPlus size={24} />
              <span>Add</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
            style={{ display: "none" }}
          />
          <span className={styles.hint}>
            {imagePreviews.length} of min 2 uploaded
          </span>
        </div>
      </div>
    </div>
  );
};

const StepPricing = ({ formData, handleInputChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconWrapper}>
          <FiDollarSign size={22} />
        </div>
        <div>
          <h2>Pricing</h2>
          <p>Set product pricing</p>
        </div>
      </div>

      <div className={styles.stepBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>
              Original Price <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Sale Price</label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <span className={styles.hint}>Leave empty if not on sale</span>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="taxIncluded"
              checked={formData.taxIncluded}
              onChange={handleInputChange}
              id="taxIncluded"
            />
            <label htmlFor="taxIncluded">Tax included in price</label>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepInventory = ({ formData, handleInputChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconWrapper}>
          <FiShoppingBag size={22} />
        </div>
        <div>
          <h2>Inventory</h2>
          <p>Manage stock and availability</p>
        </div>
      </div>

      <div className={styles.stepBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>
              Stock Quantity <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Availability</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Minimum Order</label>
            <input
              type="number"
              name="minOrderQty"
              value={formData.minOrderQty}
              onChange={handleInputChange}
              min="1"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Maximum Order</label>
            <input
              type="number"
              name="maxOrderQty"
              value={formData.maxOrderQty}
              onChange={handleInputChange}
              min="1"
              placeholder="Unlimited"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StepSpecifications = ({
  formData,
  handleInputChange,
  addVariant,
  removeVariant,
  updateVariant,
}) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconWrapper}>
          <FiSettings size={22} />
        </div>
        <div>
          <h2>Specifications</h2>
          <p>Product details and variants</p>
        </div>
      </div>

      <div className={styles.stepBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Material</label>
            <select
              name="material"
              value={formData.material}
              onChange={handleInputChange}
            >
              {MATERIALS.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Plating</label>
            <select
              name="plating"
              value={formData.plating}
              onChange={handleInputChange}
            >
              {PLATING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Stone Type</label>
            <select
              name="stoneType"
              value={formData.stoneType}
              onChange={handleInputChange}
            >
              {STONE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Stone Color</label>
            <select
              name="stoneColor"
              value={formData.stoneColor}
              onChange={handleInputChange}
            >
              {STONE_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Finish</label>
            <select
              name="finish"
              value={formData.finish}
              onChange={handleInputChange}
            >
              {FINISH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Size</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
            >
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Weight</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Unit</label>
            <select
              name="weightUnit"
              value={formData.weightUnit}
              onChange={handleInputChange}
            >
              <option value="g">g</option>
              <option value="mg">mg</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Occasion</label>
            <select
              name="occasion"
              value={formData.occasion}
              onChange={handleInputChange}
            >
              {OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Style</label>
            <select
              name="style"
              value={formData.style}
              onChange={handleInputChange}
            >
              {STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Collection</label>
            <input
              type="text"
              name="collection"
              value={formData.collection}
              onChange={handleInputChange}
              placeholder="e.g. Bridal 2024"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            name="adjustable"
            checked={formData.adjustable}
            onChange={handleInputChange}
            id="adjustable"
          />
          <label htmlFor="adjustable">Adjustable</label>
        </div>

        <div className={styles.variantsSection}>
          <div className={styles.sectionHeader}>
            <label>Variants</label>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="hasVariants"
                checked={formData.hasVariants}
                onChange={handleInputChange}
                id="hasVariants"
              />
              <label htmlFor="hasVariants">Enable</label>
            </div>
          </div>

          {formData.hasVariants && (
            <>
              <button
                type="button"
                className={styles.addVariantBtn}
                onClick={addVariant}
              >
                <FiPlus size={14} /> Add Variant
              </button>
              {formData.variants.map((variant, index) => (
                <div key={index} className={styles.variantCard}>
                  <div className={styles.variantHeader}>
                    <span>Variant {index + 1}</span>
                    <button
                      type="button"
                      className={styles.removeVariantBtn}
                      onClick={() => removeVariant(index)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className={styles.variantFields}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                          placeholder="SKU"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Color</label>
                        <input
                          type="text"
                          value={variant.attributes.color}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "attributes.color",
                              e.target.value,
                            )
                          }
                          placeholder="Color"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Size</label>
                        <input
                          type="text"
                          value={variant.attributes.size}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "attributes.size",
                              e.target.value,
                            )
                          }
                          placeholder="Size"
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Price</label>
                        <input
                          type="number"
                          value={variant.price.originalPrice}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "price.originalPrice",
                              parseFloat(e.target.value),
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Sale Price</label>
                        <input
                          type="number"
                          value={variant.price.salePrice}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "price.salePrice",
                              parseFloat(e.target.value),
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Stock</label>
                        <input
                          type="number"
                          value={variant.stock.quantity}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "stock.quantity",
                              parseInt(e.target.value),
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StepShipping = ({ formData, handleInputChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconWrapper}>
          <FiTruck size={22} />
        </div>
        <div>
          <h2>Shipping</h2>
          <p>Weight, dimensions & policies</p>
        </div>
      </div>

      <div className={styles.stepBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>
              Weight <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              name="shippingWeight"
              value={formData.shippingWeight}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Unit</label>
            <select
              name="shippingWeightUnit"
              value={formData.shippingWeightUnit}
              onChange={handleInputChange}
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
              <option value="lb">lb</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>
              Length <span className={styles.required}>*</span> (cm)
            </label>
            <input
              type="number"
              name="shippingLength"
              value={formData.shippingLength}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              Width <span className={styles.required}>*</span> (cm)
            </label>
            <input
              type="number"
              name="shippingWidth"
              value={formData.shippingWidth}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              Height <span className={styles.required}>*</span> (cm)
            </label>
            <input
              type="number"
              name="shippingHeight"
              value={formData.shippingHeight}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="freeShipping"
              checked={formData.freeShipping}
              onChange={handleInputChange}
              id="freeShipping"
            />
            <label htmlFor="freeShipping">Free Shipping</label>
          </div>
          <div className={styles.formGroup}>
            <label>Shipping Type</label>
            <select
              name="shippingType"
              value={formData.shippingType}
              onChange={handleInputChange}
            >
              <option value="Customer Pays">Customer Pays</option>
              <option value="Seller Pays">Seller Pays</option>
            </select>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.formRow}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="returnAvailable"
              checked={formData.returnAvailable}
              onChange={handleInputChange}
              id="returnAvailable"
            />
            <label htmlFor="returnAvailable">Returns Available</label>
          </div>
          <div className={styles.formGroup}>
            <label>Return Days</label>
            <input
              type="number"
              name="returnDays"
              value={formData.returnDays}
              onChange={handleInputChange}
              min="0"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="warrantyAvailable"
              checked={formData.warrantyAvailable}
              onChange={handleInputChange}
              id="warrantyAvailable"
            />
            <label htmlFor="warrantyAvailable">Warranty Available</label>
          </div>
          <div className={styles.formGroup}>
            <label>Warranty Duration</label>
            <select
              name="warrantyDuration"
              value={formData.warrantyDuration}
              onChange={handleInputChange}
            >
              {WARRANTY_DURATIONS.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepSEO = ({ formData, handleInputChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconWrapper}>
          <FiSearch size={22} />
        </div>
        <div>
          <h2>SEO & Status</h2>
          <p>Optimize and publish</p>
        </div>
      </div>

      <div className={styles.stepBody}>
        <div className={styles.formGroup}>
          <label>SEO Title</label>
          <input
            type="text"
            name="seoTitle"
            value={formData.seoTitle}
            onChange={handleInputChange}
            placeholder="SEO Title (max 60 chars)"
            maxLength={60}
          />
          <span className={styles.charCount}>
            {formData.seoTitle?.length || 0}/60
          </span>
        </div>

        <div className={styles.formGroup}>
          <label>SEO Description</label>
          <textarea
            name="seoDescription"
            value={formData.seoDescription}
            onChange={handleInputChange}
            placeholder="SEO Description (max 160 chars)"
            maxLength={160}
            rows={2}
          />
          <span className={styles.charCount}>
            {formData.seoDescription?.length || 0}/160
          </span>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>SEO Keywords</label>
            <input
              type="text"
              name="seoKeywords"
              value={formData.seoKeywords}
              onChange={handleInputChange}
              placeholder="Comma separated"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Canonical URL</label>
            <input
              type="url"
              name="canonicalUrl"
              value={formData.canonicalUrl}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.labelsGrid}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              id="featured"
            />
            <label htmlFor="featured">
              <FiStar size={14} /> Featured
            </label>
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="trending"
              checked={formData.trending}
              onChange={handleInputChange}
              id="trending"
            />
            <label htmlFor="trending">
              <FiTrendingUp size={14} /> Trending
            </label>
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="bestSeller"
              checked={formData.bestSeller}
              onChange={handleInputChange}
              id="bestSeller"
            />
            <label htmlFor="bestSeller">
              <FiAward size={14} /> Best Seller
            </label>
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="newArrival"
              checked={formData.newArrival}
              onChange={handleInputChange}
              id="newArrival"
            />
            <label htmlFor="newArrival">
              <FiZap size={14} /> New Arrival
            </label>
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="flashSale"
              checked={formData.flashSale}
              onChange={handleInputChange}
              id="flashSale"
            />
            <label htmlFor="flashSale">
              <FiClock size={14} /> Flash Sale
            </label>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.formGroup}>
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
