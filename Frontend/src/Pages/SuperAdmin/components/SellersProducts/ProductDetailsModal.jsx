// src/Pages/SuperAdmin/SuperAdminDashboard/components/SellersProducts/ProductDetailsModal.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiLoader,
  FiAlertCircle,
  FiTag,
  FiUser,
  FiMail,
  FiShoppingBag,
  FiHash,
  FiCalendar,
  FiRefreshCw,
  FiLink,
} from "react-icons/fi";
import styles from "./ProductDetailsModal.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ProductDetailsModal = ({ sellerId, productId, onClose }) => {
  const token = localStorage.getItem("superAdminToken");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_URL}/super-admin/sellers/${sellerId}/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!cancelled && response.data.success) {
          setProduct(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load product details.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [sellerId, productId, token]);

  const allImages = product
    ? [
        ...(product.thumbnail?.url
          ? [{ url: product.thumbnail.url, altText: product.thumbnail.altText }]
          : []),
        ...(product.images || []),
      ]
    : [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Product Details</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {loading && (
          <div className={styles.loadingContainer}>
            <FiLoader className={styles.spinner} />
            <p>Loading product...</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.errorContainer}>
            <FiAlertCircle className={styles.errorIcon} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && product && (
          <div className={styles.modalBody}>
            {/* Images */}
            <div className={styles.imageSection}>
              <div className={styles.mainImage}>
                {allImages.length > 0 ? (
                  <img
                    src={allImages[activeImage]?.url}
                    alt={allImages[activeImage]?.altText || product.productName}
                  />
                ) : (
                  <div className={styles.noImage}>No image available</div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className={styles.thumbRow}>
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumbBtn} ${idx === activeImage ? styles.thumbActive : ""}`}
                      onClick={() => setActiveImage(idx)}
                    >
                      <img src={img.url} alt={img.altText || ""} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core info */}
            <div className={styles.infoSection}>
              <div className={styles.titleRow}>
                <h2 className={styles.productTitle}>{product.productName}</h2>
                <span className={styles.statusChip}>{product.status}</span>
              </div>

              {product.shortDescription && (
                <p className={styles.description}>{product.shortDescription}</p>
              )}

              <div className={styles.priceBlock}>
                {product.pricing?.salePrice ? (
                  <>
                    <span className={styles.salePrice}>
                      ₹{product.pricing.salePrice}
                    </span>
                    <span className={styles.strikePrice}>
                      ₹{product.pricing.originalPrice}
                    </span>
                  </>
                ) : (
                  <span className={styles.salePrice}>
                    ₹{product.pricing?.originalPrice ?? 0}
                  </span>
                )}
              </div>

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <FiTag size={13} />
                  <span>
                    {product.category?.categoryData?.label || "Uncategorized"}
                    {product.category?.subCategoryData?.label
                      ? ` / ${product.category.subCategoryData.label}`
                      : ""}
                  </span>
                </div>
                {product.sku && (
                  <div className={styles.metaItem}>
                    <FiHash size={13} />
                    <span>SKU: {product.sku}</span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <span>Stock: {product.inventory?.stockQuantity ?? 0}</span>
                </div>
                <div className={styles.metaItem}>
                  <span>{product.inventory?.availability || "Unknown"}</span>
                </div>
              </div>
            </div>

            {/* Seller block */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <FiUser /> Seller
              </h4>
              <div className={styles.sectionContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Name</span>
                  <span className={styles.detailValue}>
                    {product.seller?.sellerName || "N/A"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiMail size={12} /> Email
                  </span>
                  <span className={styles.detailValue}>
                    {product.seller?.sellerEmail || "N/A"}
                  </span>
                </div>
                {product.seller?.storeName && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <FiShoppingBag size={12} /> Store
                    </span>
                    <span className={styles.detailValue}>
                      {product.seller.storeName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Specifications</h4>
                <div className={styles.specGrid}>
                  {product.specifications.material && (
                    <div className={styles.specItem}>
                      <span className={styles.detailLabel}>Material</span>
                      <span>{product.specifications.material}</span>
                    </div>
                  )}
                  {product.specifications.plating &&
                    product.specifications.plating !== "None" && (
                      <div className={styles.specItem}>
                        <span className={styles.detailLabel}>Plating</span>
                        <span>{product.specifications.plating}</span>
                      </div>
                    )}
                  {product.specifications.stoneType &&
                    product.specifications.stoneType !== "None" && (
                      <div className={styles.specItem}>
                        <span className={styles.detailLabel}>Stone</span>
                        <span>{product.specifications.stoneType}</span>
                      </div>
                    )}
                  {product.specifications.finish && (
                    <div className={styles.specItem}>
                      <span className={styles.detailLabel}>Finish</span>
                      <span>{product.specifications.finish}</span>
                    </div>
                  )}
                  {product.specifications.size && (
                    <div className={styles.specItem}>
                      <span className={styles.detailLabel}>Size</span>
                      <span>{product.specifications.size}</span>
                    </div>
                  )}
                  {product.specifications.occasion && (
                    <div className={styles.specItem}>
                      <span className={styles.detailLabel}>Occasion</span>
                      <span>{product.specifications.occasion}</span>
                    </div>
                  )}
                  {product.specifications.gender && (
                    <div className={styles.specItem}>
                      <span className={styles.detailLabel}>Gender</span>
                      <span>{product.specifications.gender}</span>
                    </div>
                  )}
                  {product.specifications.weight?.value ? (
                    <div className={styles.specItem}>
                      <span className={styles.detailLabel}>Weight</span>
                      <span>
                        {product.specifications.weight.value}
                        {product.specifications.weight.unit}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Variants */}
            {product.hasVariants &&
              Array.isArray(product.variants) &&
              product.variants.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    Variants ({product.variants.length})
                  </h4>
                  <div className={styles.variantList}>
                    {product.variants.map((v, idx) => (
                      <div key={v.sku || idx} className={styles.variantRow}>
                        <span>
                          {v.attributes?.color} · {v.attributes?.size}
                        </span>
                        <span>
                          ₹{v.price?.salePrice || v.price?.originalPrice}
                        </span>
                        <span>Qty: {v.stock?.quantity ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Product info */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Product Information</h4>
              <div className={styles.sectionContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiHash size={12} /> Product ID
                  </span>
                  <span className={styles.detailValue}>{product._id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiLink size={12} /> Slug
                  </span>
                  <span className={styles.detailValue}>
                    {product.productSlug}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiCalendar size={12} /> Created
                  </span>
                  <span className={styles.detailValue}>
                    {new Date(product.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiRefreshCw size={12} /> Updated
                  </span>
                  <span className={styles.detailValue}>
                    {new Date(product.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsModal;
