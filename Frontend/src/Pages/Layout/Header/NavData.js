/**
 * navData.js
 * ------------------------------------------------------------------
 * All navbar content lives here so the UI stays "dumb" and reusable.
 *
 * BACKEND INTEGRATION:
 * Replace any of these exports with data fetched from your API/CMS.
 * Example:
 *
 *   export const useNavData = () => {
 *     const [data, setData] = useState(null);
 *     useEffect(() => {
 *       fetch("/api/navigation")
 *         .then(res => res.json())
 *         .then(setData);
 *     }, []);
 *     return data;
 *   };
 *
 * Then in Navbar.jsx swap the static imports below for this hook's
 * output, falling back to these arrays while loading (skeleton state).
 * Keeping the shape identical (id, label, path, children[]) means the
 * Navbar component itself never needs to change.
 * ------------------------------------------------------------------
 */

// Top scrolling announcement/offer strip
export const announcements = [
  "✨ FLAT 20% OFF on your first order — use code WELCOME20",
  "🚚 Free shipping on all orders above ₹999",
  "💍 New Arrivals: Bridal Collection is here",
  "🎁 Buy 2 Get 1 Free on Earrings — limited time",
  "⭐ Rated 4.8/5 by 10,000+ happy customers",
];

// Primary nav (final premium navbar)
export const mainNav = [
  { id: "home", label: "Home", path: "/" },
  { id: "shop", label: "Shop", path: "/shop", hasMegaMenu: true },
  { id: "collections", label: "Collections", path: "/collections", hasDropdown: true },
  { id: "new-arrivals", label: "New Arrivals", path: "/new-arrivals" },
  { id: "gift-guide", label: "Gift Guide", path: "/gift-guide", hasMegaMenu: true },
  { id: "offers", label: "Offers", path: "/offers", hasDropdown: true },
  { id: "about", label: "About Us", path: "/about", hasDropdown: true },
];

// Shop mega menu — "Shop by Category" column
export const shopCategories = [
  { id: "earrings", label: "Earrings", path: "/shop/earrings" },
  { id: "necklace-sets", label: "Necklace Sets", path: "/shop/necklace-sets" },
  { id: "rings", label: "Rings", path: "/shop/rings" },
  { id: "bangles", label: "Bangles", path: "/shop/bangles" },
  { id: "bracelets", label: "Bracelets", path: "/shop/bracelets" },
  { id: "anklets", label: "Anklets", path: "/shop/anklets" },
  { id: "maang-tikka", label: "Maang Tikka", path: "/shop/maang-tikka" },
  { id: "nose-pins", label: "Nose Pins", path: "/shop/nose-pins" },
  { id: "pendants", label: "Pendants", path: "/shop/pendants" },
  { id: "chains", label: "Chains", path: "/shop/chains" },
];

// Shop mega menu — "Quick Links" column
export const shopQuickLinks = [
  { id: "all-jewellery", label: "All Jewellery", path: "/shop" },
  { id: "necklaces", label: "Necklaces", path: "/shop/necklaces" },
  { id: "earrings-q", label: "Earrings", path: "/shop/earrings" },
  { id: "rings-q", label: "Rings", path: "/shop/rings" },
  { id: "bracelets-q", label: "Bracelets", path: "/shop/bracelets" },
  { id: "bangles-q", label: "Bangles", path: "/shop/bangles" },
  { id: "anklets-q", label: "Anklets", path: "/shop/anklets" },
  { id: "pendant-sets", label: "Pendant Sets", path: "/shop/pendant-sets" },
  { id: "hair-accessories", label: "Hair Accessories", path: "/shop/hair-accessories" },
];

// Shop mega menu — "Shop by Style" column (from Categories list)
export const shopByStyle = [
  { id: "bridal", label: "Bridal Collection", path: "/collections/bridal" },
  { id: "party-wear", label: "Party Wear", path: "/collections/party-wear" },
  { id: "daily-wear", label: "Daily Wear", path: "/collections/daily-wear" },
  { id: "western", label: "Western Collection", path: "/collections/western" },
];

// Collections dropdown
export const collectionsDropdown = [
  { id: "bridal", label: "Bridal Collection", path: "/collections/bridal" },
  { id: "party-wear", label: "Party Wear", path: "/collections/party-wear" },
  { id: "daily-wear", label: "Daily Wear", path: "/collections/daily-wear" },
  { id: "office-wear", label: "Office Wear", path: "/collections/office-wear" },
  { id: "festive", label: "Festive Collection", path: "/collections/festive" },
  { id: "western", label: "Western Collection", path: "/collections/western" },
  { id: "traditional", label: "Traditional Collection", path: "/collections/traditional" },
  { id: "premium", label: "Premium Collection", path: "/collections/premium" },
];

// Gift Guide mega menu
export const giftGuide = {
  byRecipient: [
    { id: "gifts-her", label: "Gifts for Her", path: "/gift-guide/her" },
    { id: "gifts-mom", label: "Gifts for Mom", path: "/gift-guide/mom" },
    { id: "gifts-wife", label: "Gifts for Wife", path: "/gift-guide/wife" },
    { id: "gifts-sister", label: "Gifts for Sister", path: "/gift-guide/sister" },
    { id: "gifts-friends", label: "Gifts for Friends", path: "/gift-guide/friends" },
  ],
  byOccasion: [
    { id: "birthday", label: "Birthday", path: "/gift-guide/birthday" },
    { id: "anniversary", label: "Anniversary", path: "/gift-guide/anniversary" },
    { id: "wedding", label: "Wedding", path: "/gift-guide/wedding" },
    { id: "valentines", label: "Valentine's Day", path: "/gift-guide/valentines-day" },
    { id: "rakhi", label: "Raksha Bandhan", path: "/gift-guide/raksha-bandhan" },
    { id: "festive-gifts", label: "Festive Gifts", path: "/gift-guide/festive-gifts" },
  ],
  byBudget: [
    { id: "under-499", label: "Under ₹499", path: "/gift-guide/under-499" },
    { id: "under-999", label: "Under ₹999", path: "/gift-guide/under-999" },
    { id: "under-1999", label: "Under ₹1,999", path: "/gift-guide/under-1999" },
    { id: "premium-gifts", label: "Premium Collection", path: "/gift-guide/premium" },
  ],
};

/**
 * Offers dropdown — reworked to feel like a jewellery-house perks
 * menu rather than a generic "% off / under-price" discount list.
 * Each entry is a distinct program/experience, not a price slab.
 */
export const offersDropdown = [
  { id: "flash-sale", label: "Flash Sale", path: "/offers/flash-sale" },
  { id: "combo-edit", label: "Combo Edit", path: "/offers/combo-edit" },
  // { id: "old-gold-exchange", label: "Old Gold Exchange", path: "/offers/old-gold-exchange" },
  { id: "refer-earn", label: "Refer & Earn", path: "/offers/refer-and-earn" },
  { id: "loyalty-rewards", label: "Loyalty Rewards", path: "/offers/loyalty-rewards" },
  { id: "first-order-privilege", label: "First Order Privilege", path: "/offers/first-order-privilege" },
  { id: "seasonal-edit", label: "Seasonal Edit", path: "/offers/seasonal-edit" },
  { id: "corporate-gifting", label: "Corporate Gifting", path: "/offers/corporate-gifting" },
];

// Account dropdown (shown when user is logged in — pass `user` prop to Navbar)
export const accountDropdown = [
  { id: "profile", label: "My Profile", path: "/account/profile" },
  { id: "orders", label: "My Orders", path: "/account/orders" },
  { id: "wishlist", label: "My Wishlist", path: "/account/wishlist" },
  { id: "addresses", label: "My Addresses", path: "/account/addresses" },
  { id: "change-password", label: "Change Password", path: "/account/change-password" },
  { id: "logout", label: "Logout", path: "/logout", isAction: true },
];

// About Us dropdown
export const aboutDropdown = [
  { id: "about-us", label: "About Us", path: "/about" },
  { id: "blogs", label: "Blogs", path: "/blogs" },
  { id: "contact", label: "Contact", path: "/contact" },
  { id: "support", label: "Support", path: "/support" },
  { id: "stories", label: "Stories", path: "/stories" },
  { id: "franchise", label: "Franchise", path: "/franchise" },
  
];