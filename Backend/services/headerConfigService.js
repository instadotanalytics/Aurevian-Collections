// backend/services/headerConfigService.js

import HeaderConfig from "../models/HeaderConfig.js";

const DEFAULT_CONFIG = {
  key: "active",
  announcements: [
    "✨ FLAT 20% OFF on your first order — use code WELCOME20",
    "🚚 Free shipping on all orders above ₹999",
    "💍 New Arrivals: Bridal Collection is here",
    "🎁 Buy 2 Get 1 Free on Earrings — limited time",
    "⭐ Rated 4.8/5 by 10,000+ happy customers",
  ],
  mainNav: [
    {
      id: "home",
      label: "Home",
      path: "/",
      hasDropdown: false,
      hasMegaMenu: false,
    },
    {
      id: "shop",
      label: "Shop",
      path: "/shop",
      hasDropdown: false,
      hasMegaMenu: true,
    },
    {
      id: "collections",
      label: "Collections",
      path: "/collections",
      hasDropdown: true,
      hasMegaMenu: false,
    },
    {
      id: "new-arrivals",
      label: "Become a Partner",
      path: "/become-a-partner",
      hasDropdown: false,
      hasMegaMenu: false,
    },
    {
      id: "gift-guide",
      label: "Gift Guide",
      path: "/gift-guide",
      hasDropdown: false,
      hasMegaMenu: true,
    },
    {
      id: "offers",
      label: "Offers",
      path: "/offers",
      hasDropdown: true,
      hasMegaMenu: false,
    },
    {
      id: "about",
      label: "About Us",
      path: "/about",
      hasDropdown: true,
      hasMegaMenu: false,
    },
  ],
  shopMegaMenu: {
    // ✅ Seeded with `image: ""` — go to Super Admin → Header Management →
    // Shop Mega Menu → Shop by Category and paste an image URL for each one
    // to make them show up on the homepage "Shop by Category" section.
    categories: [
      { id: "earrings", label: "Earrings", path: "/shop/earrings", image: "" },
      {
        id: "necklace-sets",
        label: "Necklace Sets",
        path: "/shop/necklace-sets",
        image: "",
      },
      { id: "rings", label: "Rings", path: "/shop/rings", image: "" },
      { id: "bangles", label: "Bangles", path: "/shop/bangles", image: "" },
      {
        id: "bracelets",
        label: "Bracelets",
        path: "/shop/bracelets",
        image: "",
      },
      { id: "anklets", label: "Anklets", path: "/shop/anklets", image: "" },
      {
        id: "maang-tikka",
        label: "Maang Tikka",
        path: "/shop/maang-tikka",
        image: "",
      },
      {
        id: "nose-pins",
        label: "Nose Pins",
        path: "/shop/nose-pins",
        image: "",
      },
      { id: "pendants", label: "Pendants", path: "/shop/pendants", image: "" },
      { id: "chains", label: "Chains", path: "/shop/chains", image: "" },
    ],
    quickLinks: [
      { id: "all-jewellery", label: "All Jewellery", path: "/shop" },
      { id: "necklaces", label: "Necklaces", path: "/shop/necklaces" },
      { id: "earrings-q", label: "Earrings", path: "/shop/earrings" },
      { id: "rings-q", label: "Rings", path: "/shop/rings" },
      { id: "bracelets-q", label: "Bracelets", path: "/shop/bracelets" },
      { id: "bangles-q", label: "Bangles", path: "/shop/bangles" },
      { id: "anklets-q", label: "Anklets", path: "/shop/anklets" },
      { id: "pendant-sets", label: "Pendant Sets", path: "/shop/pendant-sets" },
      {
        id: "hair-accessories",
        label: "Hair Accessories",
        path: "/shop/hair-accessories",
      },
    ],
    byStyle: [
      { id: "bridal", label: "Bridal Collection", path: "/collections/bridal" },
      {
        id: "party-wear",
        label: "Party Wear",
        path: "/collections/party-wear",
      },
      {
        id: "daily-wear",
        label: "Daily Wear",
        path: "/collections/daily-wear",
      },
      {
        id: "western",
        label: "Western Collection",
        path: "/collections/western",
      },
    ],
    fashionItems: [
      { id: "fi-1", label: "Perfumes", path: "/fashion/perfumes" },
      { id: "fi-2", label: "Watches", path: "/fashion/watches" },
      { id: "fi-3", label: "Sarees", path: "/fashion/sarees" },
      { id: "fi-4", label: "Sunglasses", path: "/fashion/sunglasses" },
      { id: "fi-5", label: "Handbags", path: "/fashion/handbags" },
      { id: "fi-6", label: "Wallets", path: "/fashion/wallets" },
      { id: "fi-7", label: "Belts", path: "/fashion/belts" },
    ],
    banner: {
      tag: "New Season",
      title: "Bridal & Festive Edit",
      offer: "Up to 40% Off",
      linkText: "Shop the edit →",
      linkPath: "/collections/bridal",
    },
  },
  giftGuideMegaMenu: {
    byRecipient: [
      { id: "gifts-her", label: "Gifts for Her", path: "/gift-guide/her" },
      { id: "gifts-mom", label: "Gifts for Mom", path: "/gift-guide/mom" },
      { id: "gifts-wife", label: "Gifts for Wife", path: "/gift-guide/wife" },
      {
        id: "gifts-sister",
        label: "Gifts for Sister",
        path: "/gift-guide/sister",
      },
      {
        id: "gifts-friends",
        label: "Gifts for Friends",
        path: "/gift-guide/friends",
      },
    ],
    byOccasion: [
      { id: "birthday", label: "Birthday", path: "/gift-guide/birthday" },
      {
        id: "anniversary",
        label: "Anniversary",
        path: "/gift-guide/anniversary",
      },
      { id: "wedding", label: "Wedding", path: "/gift-guide/wedding" },
      {
        id: "valentines",
        label: "Valentine's Day",
        path: "/gift-guide/valentines-day",
      },
      {
        id: "rakhi",
        label: "Raksha Bandhan",
        path: "/gift-guide/raksha-bandhan",
      },
      {
        id: "festive-gifts",
        label: "Festive Gifts",
        path: "/gift-guide/festive-gifts",
      },
    ],
    byBudget: [
      { id: "under-499", label: "Under ₹499", path: "/gift-guide/under-499" },
      { id: "under-999", label: "Under ₹999", path: "/gift-guide/under-999" },
      {
        id: "under-1999",
        label: "Under ₹1,999",
        path: "/gift-guide/under-1999",
      },
      {
        id: "premium-gifts",
        label: "Premium Collection",
        path: "/gift-guide/premium",
      },
    ],
  },
  collectionsDropdown: [
    { id: "bridal", label: "Bridal Collection", path: "/collections/bridal" },
    { id: "party-wear", label: "Party Wear", path: "/collections/party-wear" },
    { id: "daily-wear", label: "Daily Wear", path: "/collections/daily-wear" },
    {
      id: "office-wear",
      label: "Office Wear",
      path: "/collections/office-wear",
    },
    {
      id: "festive",
      label: "Festive Collection",
      path: "/collections/festive",
    },
    {
      id: "western",
      label: "Western Collection",
      path: "/collections/western",
    },
    {
      id: "traditional",
      label: "Traditional Collection",
      path: "/collections/traditional",
    },
    {
      id: "premium",
      label: "Premium Collection",
      path: "/collections/premium",
    },
  ],
  offersDropdown: [
    { id: "flash-sale", label: "Flash Sale", path: "/offers/flash-sale" },
    { id: "combo-edit", label: "Combo Edit", path: "/offers/combo-edit" },
    { id: "refer-earn", label: "Refer & Earn", path: "/offers/refer-and-earn" },
    {
      id: "loyalty-rewards",
      label: "Loyalty Rewards",
      path: "/offers/loyalty-rewards",
    },
    {
      id: "first-order-privilege",
      label: "First Order Privilege",
      path: "/offers/first-order-privilege",
    },
    {
      id: "seasonal-edit",
      label: "Seasonal Edit",
      path: "/offers/seasonal-edit",
    },
    {
      id: "corporate-gifting",
      label: "Corporate Gifting",
      path: "/offers/corporate-gifting",
    },
  ],
  aboutDropdown: [
    { id: "about-us", label: "About Us", path: "/about" },
    { id: "blogs", label: "Blogs", path: "/blog" },
    { id: "contact", label: "Contact", path: "/contact" },
    { id: "support", label: "Support", path: "/support" },
    { id: "stories", label: "Stories", path: "/stories" },
    { id: "franchise", label: "Franchise", path: "/franchise" },
  ],
};

export const initializeHeaderConfig = async () => {
  try {
    const existing = await HeaderConfig.findOne({ key: "active" });
    if (!existing) {
      await HeaderConfig.create(DEFAULT_CONFIG);
      console.log("✅ Seeded default header config");
    }
  } catch (error) {
    console.error("❌ Failed to seed header config:", error.message);
  }
};

export const getActiveHeaderConfig = async () => {
  return HeaderConfig.findOne({ key: "active" }).lean();
};
