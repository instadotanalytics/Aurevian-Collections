// src/Pages/Seller/SellerDashboard/components/ProductForm.jsx

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiUpload,
  FiX,
  FiPlus,
  FiTrash2,
  FiSave,
  FiImage,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./ProductForm.module.css";

import {
  createProduct,
  updateProduct,
  fetchCategories,
  fetchProducts,
} from "../../../../redux/slices/sellerProductSlice";

// ============================================
// CONSTANTS
// ============================================
const MATERIALS = [
  'Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold',
  'Sterling Silver', 'Brass', 'Copper', 'Titanium', 'Palladium', 'Steel', 'Other'
];

const PLATING_OPTIONS = [
  'Gold Plated', 'Silver Plated', 'Rhodium Plated', 'Rose Gold Plated',
  'White Gold Plated', 'None', 'Other'
];

const STONE_TYPES = [
  'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Cubic Zirconia',
  'Moissanite', 'Topaz', 'Amethyst', 'Garnet', 'Opal', 'Turquoise', 'None', 'Other'
];

const STONE_COLORS = [
  'White', 'Yellow', 'Blue', 'Red', 'Green', 'Pink', 'Purple', 'Black',
  'Clear', 'Champagne', 'Rose', 'Other'
];

const FINISH_OPTIONS = [
  'Polished', 'Matte', 'Brushed', 'Hammered', 'Textured', 'Antique', 'Mirror', 'Satin', 'Other'
];

const SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12',
  'Free Size', 'Adjustable', 'Custom', 'Other'
];

const OCCASIONS = [
  'Wedding', 'Engagement', 'Anniversary', 'Birthday', 'Casual', 'Party',
  'Festive', 'Professional', 'Gift', 'Daily Wear', 'Valentine',
  'Mother\'s Day', 'Graduation', 'Other'
];

const STYLES = [
  'Classic', 'Modern', 'Vintage', 'Antique', 'Minimalist', 'Statement',
  'Bohemian', 'Ethnic', 'Contemporary', 'Art Deco', 'Victorian',
  'Romantic', 'Geometric', 'Floral', 'Other'
];

const GENDERS = ['Men', 'Women', 'Unisex', 'Kids'];

const AVAILABILITY_OPTIONS = ['In Stock', 'Out of Stock', 'Pre Order'];

const STATUS_OPTIONS = ['Draft', 'Pending', 'Published', 'Scheduled'];

const WARRANTY_DURATIONS = [
  '1 Month', '3 Months', '6 Months', '1 Year', '2 Years', '5 Years', 'Lifetime'
];

// ============================================
// PRODUCT FORM COMPONENT
// ============================================
const ProductForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { categories, isLoading, selectedProduct, limitStatus } = useSelector(
    (state) => state.sellerProduct
  );

  const [formData, setFormData] = useState({
    productName: "",
    shortDescription: "",
    fullDescription: "",
    brand: "",
    categoryId: "",
    subCategoryId: "",
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

  const [imagePreviews, setImagePreviews] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // If edit, fetch product data
  useEffect(() => {
    if (isEdit) {
      // We'll get product from the list or fetch it
      if (!selectedProduct) {
        dispatch(fetchProducts({}));
      } else {
        populateForm(selectedProduct);
      }
    }
  }, [isEdit, selectedProduct]);

  const populateForm = (product) => {
    setFormData({
      productName: product.productName || "",
      shortDescription: product.shortDescription || "",
      fullDescription: product.fullDescription || "",
      brand: product.brand || "",
      categoryId: product.category?.categoryId || "",
      subCategoryId: product.category?.subCategoryId || "",
      thumbnail: null,
      images: [],
      originalPrice: product.pricing?.originalPrice || "",
      salePrice: product.pricing?.salePrice || "",
      currency: product.pricing?.currency || "INR",
      taxIncluded: product.pricing?.taxIncluded !== undefined ? product.pricing.taxIncluded : true,
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
      returnAvailable: product.returnPolicy?.returnAvailable !== undefined ? product.returnPolicy.returnAvailable : true,
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

    // Set image previews
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        altText: img.altText || "",
        isExisting: true,
      })));
    }

    if (product.thumbnail) {
      setThumbnailPreview({
        url: product.thumbnail.url,
        publicId: product.thumbnail.publicId,
        altText: product.thumbnail.altText || "",
        isExisting: true,
      });
    }
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle thumbnail upload
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

    setFormData({ ...formData, thumbnail: file });
    setThumbnailPreview({
      url: URL.createObjectURL(file),
      isExisting: false,
    });
  };

  // Handle multiple images upload
  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const invalidFiles = files.filter(f => !f.type.startsWith("image/"));
    if (invalidFiles.length) {
      toast.error(`${invalidFiles.length} file(s) are not images`);
      return;
    }

    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length) {
      toast.error(`${oversized.length} file(s) exceed 10MB limit`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImagePreviews([...imagePreviews, ...newImages]);
    setFormData({
      ...formData,
      images: [...formData.images, ...files],
    });

    // Reset input
    e.target.value = "";
  };

  // Remove image
  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    const removed = newPreviews.splice(index, 1)[0];
    
    // Revoke URL if it's a blob
    if (!removed.isExisting && removed.url) {
      URL.revokeObjectURL(removed.url);
    }

    setImagePreviews(newPreviews);
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    if (thumbnailPreview && !thumbnailPreview.isExisting) {
      URL.revokeObjectURL(thumbnailPreview.url);
    }
    setThumbnailPreview(null);
    setFormData({ ...formData, thumbnail: null });
  };

  // Handle variant management
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

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.productName) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.brand) {
      toast.error("Brand is required");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Category is required");
      return;
    }
    if (!formData.thumbnail) {
      toast.error("Thumbnail image is required");
      return;
    }
    if (imagePreviews.length < 2) {
      toast.error("Minimum 2 product images are required");
      return;
    }
    if (!formData.originalPrice) {
      toast.error("Original price is required");
      return;
    }
    if (!formData.stockQuantity) {
      toast.error("Stock quantity is required");
      return;
    }

    // Check product limit
    if (!isEdit && limitStatus && !limitStatus.isUnlimited && limitStatus.remaining <= 0) {
      toast.error(`Product limit reached. You have ${limitStatus.remaining} slots remaining.`);
      return;
    }

    try {
      // Create form data for submission
      const submitData = { ...formData };
      submitData.images = formData.images; // Files
      submitData.thumbnail = formData.thumbnail; // File

      // Clean up empty values
      if (!submitData.salePrice) delete submitData.salePrice;
      if (!submitData.maxOrderQty) delete submitData.maxOrderQty;
      if (!submitData.weight) delete submitData.weight;
      if (!submitData.collection) delete submitData.collection;
      if (!submitData.seoTitle) delete submitData.seoTitle;
      if (!submitData.seoDescription) delete submitData.seoDescription;
      if (!submitData.seoKeywords) delete submitData.seoKeywords;
      if (!submitData.canonicalUrl) delete submitData.canonicalUrl;

      let result;
      if (isEdit) {
        result = await dispatch(updateProduct({
          id,
          productData: submitData,
        })).unwrap();
        toast.success("Product updated successfully");
      } else {
        result = await dispatch(createProduct(submitData)).unwrap();
        toast.success("Product created successfully");
      }

      navigate("/seller/dashboard/products");
    } catch (error) {
      toast.error(error || "Failed to save product");
    }
  };

  if (isLoading && isEdit) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
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
          <FiArrowLeft size={20} />
          Back to Products
        </button>
        <h1 className={styles.title}>
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        {limitStatus && !isEdit && (
          <span className={styles.limitInfo}>
            {limitStatus.isUnlimited ? (
              "Unlimited products"
            ) : (
              `${limitStatus.remaining} slots remaining`
            )}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h2>Basic Information</h2>
              <div className={styles.formGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="e.g. Diamond Pendant Necklace"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g. Aurevian Collection"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Short Description</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief description (max 500 characters)"
                  maxLength={500}
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Full Description</label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  placeholder="Detailed product description"
                  rows={5}
                />
              </div>
            </div>

            {/* Category */}
            <div className={styles.section}>
              <h2>Category</h2>
              <div className={styles.formGroup}>
                <label>Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
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
                      .filter(cat => cat.id !== formData.categoryId)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Product Images */}
            <div className={styles.section}>
              <h2>Product Images</h2>
              
              <div className={styles.thumbnailSection}>
                <label>Thumbnail Image *</label>
                <div className={styles.thumbnailUpload}>
                  {thumbnailPreview ? (
                    <div className={styles.thumbnailPreview}>
                      <img src={thumbnailPreview.url} alt="Thumbnail" />
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={removeThumbnail}
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={styles.uploadArea}
                      onClick={() => document.getElementById("thumbnailInput").click()}
                    >
                      <FiImage size={40} />
                      <p>Click to upload thumbnail</p>
                      <span>JPG, PNG, WebP (Max 10MB)</span>
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
                <label>Product Images * (Min 2)</label>
                <div className={styles.imageGrid}>
                  {imagePreviews.map((img, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <img src={img.url} alt={`Product ${index + 1}`} />
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => removeImage(index)}
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <div
                    className={styles.addImageBox}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiPlus size={30} />
                    <span>Add Image</span>
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
                <p className={styles.hint}>
                  {imagePreviews.length} of minimum 2 images uploaded
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Pricing */}
            <div className={styles.section}>
              <h2>Pricing</h2>
              <div className={styles.formGroup}>
                <label>Original Price * (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sale Price (₹)</label>
                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

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
                />
                <label>Tax Included in Price</label>
              </div>
            </div>

            {/* Inventory */}
            <div className={styles.section}>
              <h2>Inventory</h2>
              <div className={styles.formGroup}>
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Minimum Order Quantity</label>
                <input
                  type="number"
                  name="minOrderQty"
                  value={formData.minOrderQty}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Maximum Order Quantity</label>
                <input
                  type="number"
                  name="maxOrderQty"
                  value={formData.maxOrderQty}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Unlimited"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                >
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Jewellery Specifications */}
            <div className={styles.section}>
              <h2>Jewellery Specifications</h2>
              
              <div className={styles.formGroup}>
                <label>Material *</label>
                <select
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  required
                >
                  {MATERIALS.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
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
                  {PLATING_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Stone Type</label>
                <select
                  name="stoneType"
                  value={formData.stoneType}
                  onChange={handleInputChange}
                >
                  {STONE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
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
                  {STONE_COLORS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Finish</label>
                <select
                  name="finish"
                  value={formData.finish}
                  onChange={handleInputChange}
                >
                  {FINISH_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
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

              <div className={styles.formGroup}>
                <label>Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                >
                  {SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="adjustable"
                  checked={formData.adjustable}
                  onChange={handleInputChange}
                />
                <label>Adjustable</label>
              </div>

              <div className={styles.formGroup}>
                <label>Occasion</label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleInputChange}
                >
                  {OCCASIONS.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
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
                  {STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Collection</label>
                <input
                  type="text"
                  name="collection"
                  value={formData.collection}
                  onChange={handleInputChange}
                  placeholder="e.g. Bridal Collection 2024"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  {GENDERS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Variants */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Product Variants</h2>
                <label className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="hasVariants"
                    checked={formData.hasVariants}
                    onChange={handleInputChange}
                  />
                  <span>Enable Variants</span>
                </label>
              </div>

              {formData.hasVariants && (
                <>
                  <button
                    type="button"
                    className={styles.addVariantBtn}
                    onClick={addVariant}
                  >
                    <FiPlus size={16} />
                    Add Variant
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
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <div className={styles.variantFields}>
                        <div className={styles.row}>
                          <div className={styles.formGroup}>
                            <label>SKU</label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, "sku", e.target.value)}
                              placeholder="SKU"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Color</label>
                            <input
                              type="text"
                              value={variant.attributes.color}
                              onChange={(e) => updateVariant(index, "attributes.color", e.target.value)}
                              placeholder="Color"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Size</label>
                            <input
                              type="text"
                              value={variant.attributes.size}
                              onChange={(e) => updateVariant(index, "attributes.size", e.target.value)}
                              placeholder="Size"
                            />
                          </div>
                        </div>

                        <div className={styles.row}>
                          <div className={styles.formGroup}>
                            <label>Original Price</label>
                            <input
                              type="number"
                              value={variant.price.originalPrice}
                              onChange={(e) => updateVariant(index, "price.originalPrice", parseFloat(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Sale Price</label>
                            <input
                              type="number"
                              value={variant.price.salePrice}
                              onChange={(e) => updateVariant(index, "price.salePrice", parseFloat(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Stock</label>
                            <input
                              type="number"
                              value={variant.stock.quantity}
                              onChange={(e) => updateVariant(index, "stock.quantity", parseInt(e.target.value))}
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

            {/* Shipping */}
            <div className={styles.section}>
              <h2>Shipping</h2>
              <p className={styles.note}>
                Shipping charges are calculated dynamically via Shiprocket API.
              </p>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Weight *</label>
                  <input
                    type="number"
                    name="shippingWeight"
                    value={formData.shippingWeight}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
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

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Length * (cm)</label>
                  <input
                    type="number"
                    name="shippingLength"
                    value={formData.shippingLength}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Width * (cm)</label>
                  <input
                    type="number"
                    name="shippingWidth"
                    value={formData.shippingWidth}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Height * (cm)</label>
                  <input
                    type="number"
                    name="shippingHeight"
                    value={formData.shippingHeight}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="freeShipping"
                  checked={formData.freeShipping}
                  onChange={handleInputChange}
                />
                <label>Free Shipping</label>
              </div>

              <div className={styles.formGroup}>
                <label>Shipping Type</label>
                <select
                  name="shippingType"
                  value={formData.shippingType}
                  onChange={handleInputChange}
                >
                  <option value="Seller Pays">Seller Pays</option>
                  <option value="Customer Pays">Customer Pays</option>
                </select>
              </div>
            </div>

            {/* Return Policy */}
            <div className={styles.section}>
              <h2>Return Policy</h2>
              
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="returnAvailable"
                  checked={formData.returnAvailable}
                  onChange={handleInputChange}
                />
                <label>Returns Available</label>
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

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="warrantyAvailable"
                  checked={formData.warrantyAvailable}
                  onChange={handleInputChange}
                />
                <label>Warranty Available</label>
              </div>

              <div className={styles.formGroup}>
                <label>Warranty Duration</label>
                <select
                  name="warrantyDuration"
                  value={formData.warrantyDuration}
                  onChange={handleInputChange}
                >
                  {WARRANTY_DURATIONS.map(dur => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SEO */}
            <div className={styles.section}>
              <h2>SEO</h2>
              <p className={styles.note}>
                Optimize your product for search engines.
              </p>

              <div className={styles.formGroup}>
                <label>SEO Title</label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="SEO Title (max 60 characters)"
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
                  placeholder="SEO Description (max 160 characters)"
                  maxLength={160}
                  rows={2}
                />
                <span className={styles.charCount}>
                  {formData.seoDescription?.length || 0}/160
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>SEO Keywords</label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleInputChange}
                  placeholder="Comma separated keywords"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Canonical URL</label>
                <input
                  type="url"
                  name="canonicalUrl"
                  value={formData.canonicalUrl}
                  onChange={handleInputChange}
                  placeholder="https://aureviancollections.in/product/..."
                />
              </div>
            </div>

            {/* Product Labels */}
            <div className={styles.section}>
              <h2>Product Labels</h2>
              <div className={styles.labelsGrid}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  <label>⭐ Featured</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="trending"
                    checked={formData.trending}
                    onChange={handleInputChange}
                  />
                  <label>🔥 Trending</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="bestSeller"
                    checked={formData.bestSeller}
                    onChange={handleInputChange}
                  />
                  <label>🏆 Best Seller</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="newArrival"
                    checked={formData.newArrival}
                    onChange={handleInputChange}
                  />
                  <label>✨ New Arrival</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="flashSale"
                    checked={formData.flashSale}
                    onChange={handleInputChange}
                  />
                  <label>⚡ Flash Sale</label>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className={styles.section}>
              <h2>Status</h2>
              <div className={styles.formGroup}>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate("/seller/dashboard/products")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            <FiSave size={18} />
            {isLoading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;