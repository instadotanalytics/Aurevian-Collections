// src/Pages/SuperAdmin/components/HeaderManagement/HeaderManagement.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminHeaderConfig,
  updateHeaderConfig,
  clearHeaderConfigError,
} from "../../../../redux/slices/headerConfigSlice";
import styles from "./HeaderManagement.module.css";
import toast from "react-hot-toast";

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// ============================================
// Reusable editor for a simple { id, label, path } list
// ============================================
const LinkListEditor = ({ title, items, onChange }) => {
  const update = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    if (field === "label" && !next[index]._touchedId) {
      next[index].id = slugify(value);
    }
    onChange(next);
  };

  const add = () => {
    onChange([...items, { id: `item-${Date.now()}`, label: "", path: "" }]);
  };

  const remove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.subSection}>
      <div className={styles.subSectionHeader}>
        <h4>{title}</h4>
        <button type="button" className={styles.addSmallBtn} onClick={add}>
          + Add
        </button>
      </div>
      {items.length === 0 && <p className={styles.emptyHint}>No items yet</p>}
      {items.map((item, index) => (
        <div key={index} className={styles.linkRow}>
          <input
            type="text"
            placeholder="Label"
            value={item.label}
            onChange={(e) => update(index, "label", e.target.value)}
            className={styles.linkLabelInput}
          />
          <input
            type="text"
            placeholder="/path"
            value={item.path}
            onChange={(e) => update(index, "path", e.target.value)}
            className={styles.linkPathInput}
          />
          <button
            type="button"
            className={styles.removeSmallBtn}
            onClick={() => remove(index)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// ============================================
// Section component - MOVED OUTSIDE HeaderManagement
// Stable across renders - no remount on keystroke
// ============================================
const Section = ({ id, title, openSection, onToggle, children }) => (
  <div className={styles.section}>
    <button
      type="button"
      className={styles.sectionHeader}
      onClick={() => onToggle(id)}
    >
      <span>{title}</span>
      <span
        className={openSection === id ? styles.chevronOpen : styles.chevron}
      >
        ▾
      </span>
    </button>
    {openSection === id && <div className={styles.sectionBody}>{children}</div>}
  </div>
);

const HeaderManagement = () => {
  const dispatch = useDispatch();
  const { adminConfig, isLoading, isSaving, error } = useSelector(
    (state) => state.headerConfig,
  );

  const [form, setForm] = useState(null);
  const [openSection, setOpenSection] = useState("announcements");

  useEffect(() => {
    dispatch(fetchAdminHeaderConfig());
  }, [dispatch]);

  useEffect(() => {
    if (adminConfig) {
      setForm(adminConfig);
    }
  }, [adminConfig]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearHeaderConfigError());
    }
  }, [error, dispatch]);

  if (isLoading || !form) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading header configuration...</p>
      </div>
    );
  }

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  // ---- Announcements ----
  const updateAnnouncement = (index, value) => {
    const next = [...form.announcements];
    next[index] = value;
    setForm({ ...form, announcements: next });
  };
  const addAnnouncement = () => {
    setForm({ ...form, announcements: [...form.announcements, ""] });
  };
  const removeAnnouncement = (index) => {
    setForm({
      ...form,
      announcements: form.announcements.filter((_, i) => i !== index),
    });
  };

  // ---- Main Nav ----
  const updateNavItem = (index, field, value) => {
    const next = [...form.mainNav];
    next[index] = { ...next[index], [field]: value };
    if (field === "label" && !next[index]._touchedId) {
      next[index].id = slugify(value);
    }
    setForm({ ...form, mainNav: next });
  };
  const addNavItem = () => {
    setForm({
      ...form,
      mainNav: [
        ...form.mainNav,
        {
          id: `nav-${Date.now()}`,
          label: "",
          path: "",
          hasDropdown: false,
          hasMegaMenu: false,
        },
      ],
    });
  };
  const removeNavItem = (index) => {
    setForm({ ...form, mainNav: form.mainNav.filter((_, i) => i !== index) });
  };

  // ---- Nested mega-menu / dropdown setters ----
  const setShopField = (field, value) => {
    setForm({
      ...form,
      shopMegaMenu: { ...form.shopMegaMenu, [field]: value },
    });
  };
  const setShopBannerField = (field, value) => {
    setForm({
      ...form,
      shopMegaMenu: {
        ...form.shopMegaMenu,
        banner: { ...form.shopMegaMenu.banner, [field]: value },
      },
    });
  };
  const setGiftField = (field, value) => {
    setForm({
      ...form,
      giftGuideMegaMenu: { ...form.giftGuideMegaMenu, [field]: value },
    });
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updateHeaderConfig({
          announcements: form.announcements.filter((a) => a.trim()),
          mainNav: form.mainNav,
          shopMegaMenu: form.shopMegaMenu,
          giftGuideMegaMenu: form.giftGuideMegaMenu,
          collectionsDropdown: form.collectionsDropdown,
          offersDropdown: form.offersDropdown,
          aboutDropdown: form.aboutDropdown,
        }),
      ).unwrap();
      toast.success("Header updated — live on the storefront now");
    } catch (err) {
      toast.error(err || "Failed to save header");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Header Management</h1>
          <p className={styles.subtitle}>
            Edit the announcement bar, navigation, and mega menus shown across
            the site
          </p>
        </div>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <Section
        id="announcements"
        title="📢 Announcement Bar"
        openSection={openSection}
        onToggle={toggleSection}
      >
        {form.announcements.map((text, index) => (
          <div key={index} className={styles.linkRow}>
            <input
              type="text"
              value={text}
              onChange={(e) => updateAnnouncement(index, e.target.value)}
              placeholder="✨ FLAT 20% OFF..."
              className={styles.fullWidthInput}
            />
            <button
              type="button"
              className={styles.removeSmallBtn}
              onClick={() => removeAnnouncement(index)}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addSmallBtn}
          onClick={addAnnouncement}
        >
          + Add Announcement
        </button>
      </Section>

      <Section
        id="mainNav"
        title="🧭 Main Navigation"
        openSection={openSection}
        onToggle={toggleSection}
      >
        {form.mainNav.map((item, index) => (
          <div key={index} className={styles.navRow}>
            <input
              type="text"
              placeholder="Label"
              value={item.label}
              onChange={(e) => updateNavItem(index, "label", e.target.value)}
              className={styles.linkLabelInput}
            />
            <input
              type="text"
              placeholder="/path"
              value={item.path}
              onChange={(e) => updateNavItem(index, "path", e.target.value)}
              className={styles.linkPathInput}
            />
            <label className={styles.inlineCheckbox}>
              <input
                type="checkbox"
                checked={item.hasDropdown}
                onChange={(e) =>
                  updateNavItem(index, "hasDropdown", e.target.checked)
                }
              />
              Dropdown
            </label>
            <label className={styles.inlineCheckbox}>
              <input
                type="checkbox"
                checked={item.hasMegaMenu}
                onChange={(e) =>
                  updateNavItem(index, "hasMegaMenu", e.target.checked)
                }
              />
              Mega Menu
            </label>
            <button
              type="button"
              className={styles.removeSmallBtn}
              onClick={() => removeNavItem(index)}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addSmallBtn}
          onClick={addNavItem}
        >
          + Add Nav Item
        </button>
        <p className={styles.hint}>
          The item id in the URL (e.g. "shop", "gift-guide") is what wires a nav
          item to the mega-menu sections below — keep those two labels ("Shop",
          "Gift Guide") if you want their mega menus to keep working.
        </p>
      </Section>

      <Section
        id="shop"
        title="🛍️ Shop Mega Menu"
        openSection={openSection}
        onToggle={toggleSection}
      >
        <LinkListEditor
          title="Shop by Category"
          items={form.shopMegaMenu.categories}
          onChange={(v) => setShopField("categories", v)}
        />
        <LinkListEditor
          title="Quick Links"
          items={form.shopMegaMenu.quickLinks}
          onChange={(v) => setShopField("quickLinks", v)}
        />
        <LinkListEditor
          title="Shop by Style"
          items={form.shopMegaMenu.byStyle}
          onChange={(v) => setShopField("byStyle", v)}
        />
        <LinkListEditor
          title="Fashion Items"
          items={form.shopMegaMenu.fashionItems}
          onChange={(v) => setShopField("fashionItems", v)}
        />

        <div className={styles.subSection}>
          <h4>Promo Banner (right column)</h4>
          <div className={styles.bannerGrid}>
            <input
              type="text"
              placeholder="Tag (e.g. New Season)"
              value={form.shopMegaMenu.banner.tag}
              onChange={(e) => setShopBannerField("tag", e.target.value)}
            />
            <input
              type="text"
              placeholder="Title"
              value={form.shopMegaMenu.banner.title}
              onChange={(e) => setShopBannerField("title", e.target.value)}
            />
            <input
              type="text"
              placeholder="Offer text (e.g. Up to 40% Off)"
              value={form.shopMegaMenu.banner.offer}
              onChange={(e) => setShopBannerField("offer", e.target.value)}
            />
            <input
              type="text"
              placeholder="Link text"
              value={form.shopMegaMenu.banner.linkText}
              onChange={(e) => setShopBannerField("linkText", e.target.value)}
            />
            <input
              type="text"
              placeholder="Link path"
              value={form.shopMegaMenu.banner.linkPath}
              onChange={(e) => setShopBannerField("linkPath", e.target.value)}
            />
          </div>
        </div>
      </Section>

      <Section
        id="giftGuide"
        title="🎁 Gift Guide Mega Menu"
        openSection={openSection}
        onToggle={toggleSection}
      >
        <LinkListEditor
          title="By Recipient"
          items={form.giftGuideMegaMenu.byRecipient}
          onChange={(v) => setGiftField("byRecipient", v)}
        />
        <LinkListEditor
          title="By Occasion"
          items={form.giftGuideMegaMenu.byOccasion}
          onChange={(v) => setGiftField("byOccasion", v)}
        />
        <LinkListEditor
          title="By Budget"
          items={form.giftGuideMegaMenu.byBudget}
          onChange={(v) => setGiftField("byBudget", v)}
        />
      </Section>

      <Section
        id="collections"
        title="📚 Collections Dropdown"
        openSection={openSection}
        onToggle={toggleSection}
      >
        <LinkListEditor
          title="Items"
          items={form.collectionsDropdown}
          onChange={(v) => setForm({ ...form, collectionsDropdown: v })}
        />
      </Section>

      <Section
        id="offers"
        title="🏷️ Offers Dropdown"
        openSection={openSection}
        onToggle={toggleSection}
      >
        <LinkListEditor
          title="Items"
          items={form.offersDropdown}
          onChange={(v) => setForm({ ...form, offersDropdown: v })}
        />
      </Section>

      <Section
        id="about"
        title="ℹ️ About Us Dropdown"
        openSection={openSection}
        onToggle={toggleSection}
      >
        <LinkListEditor
          title="Items"
          items={form.aboutDropdown}
          onChange={(v) => setForm({ ...form, aboutDropdown: v })}
        />
      </Section>

      <div className={styles.bottomSaveBar}>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default HeaderManagement;
