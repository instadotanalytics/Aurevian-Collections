
import React, { useState } from "react";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import styles from "./Footer.module.css";
import logo from "../../../assets/Aurevianlogo.png";

/* ------------------------------------------------------------------
 * Data (mirrors navData.js shape — swap for your real imports:
 *   import { shopCategories, collectionsDropdown, giftGuide, aboutDropdown } from "./navData";
 * ------------------------------------------------------------------ */
const shopCategories = [
  { id: "earrings", label: "Earrings", path: "/shop/earrings" },
  { id: "necklace-sets", label: "Necklace Sets", path: "/shop/necklace-sets" },
  { id: "rings", label: "Rings", path: "/shop/rings" },
  { id: "bangles", label: "Bangles", path: "/shop/bangles" },
  { id: "bracelets", label: "Bracelets", path: "/shop/bracelets" },
  { id: "chains", label: "Chains", path: "/shop/chains" },
];

const collectionsDropdown = [
  { id: "bridal", label: "Bridal Collection", path: "/collections/bridal" },
  { id: "party-wear", label: "Party Wear", path: "/collections/party-wear" },
  { id: "daily-wear", label: "Daily Wear", path: "/collections/daily-wear" },
  { id: "festive", label: "Festive Collection", path: "/collections/festive" },
  { id: "western", label: "Western Collection", path: "/collections/western" },
  { id: "premium", label: "Premium Collection", path: "/collections/premium" },
];

const giftGuide = {
  byOccasion: [
    { id: "birthday", label: "Birthday", path: "/gift-guide/birthday" },
    { id: "anniversary", label: "Anniversary", path: "/gift-guide/anniversary" },
    { id: "wedding", label: "Wedding", path: "/gift-guide/wedding" },
    { id: "valentines", label: "Valentine's Day", path: "/gift-guide/valentines-day" },
  ],
  byBudget: [
    { id: "under-999", label: "Under ₹999", path: "/gift-guide/under-999" },
    { id: "under-1999", label: "Under ₹1,999", path: "/gift-guide/under-1999" },
  ],
};

const aboutDropdown = [
  { id: "about-us", label: "About Us", path: "/about" },
  { id: "stories", label: "Our Stories", path: "/stories" },
  { id: "blogs", label: "Blogs", path: "/blogs" },
  { id: "support", label: "Support", path: "/support" },
  { id: "contact", label: "Contact Us", path: "/contact" },
];

const policyLinks = [
  { id: "shipping", label: "Shipping Policy", path: "/policies/shipping" },
  { id: "returns", label: "Returns & Exchange", path: "/policies/returns" },
  { id: "privacy", label: "Privacy Policy", path: "/policies/privacy" },
  { id: "terms", label: "Terms of Service", path: "/policies/terms" },
];

/* ------------------------------------------------------------------
 * Social icons as plain inline SVGs.
 * NOTE: some lucide-react versions dropped brand icons (Facebook,
 * Instagram, Youtube, Twitter/X). Using local SVGs avoids the
 * "does not provide an export" crash regardless of the installed
 * lucide-react version.
 * ------------------------------------------------------------------ */
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M14 9h2V6h-2c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14V9.5c0-.28.22-.5.5-.5H14z" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <rect x="2.5" y="6" width="19" height="12" rx="3" />
    <path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
  </svg>
);

const socialIcons = [
  {
    Icon: InstagramIcon,
    href: "https://www.instagram.com/aureviancollections?igsh=bDc1NHBlcWJxeG5o&utm_source=qr",
  },
  { Icon: FacebookIcon, href: "#" },
  { Icon: YoutubeIcon, href: "#" },
];

function ChainDivider() {
  const links = Array.from({ length: 40 });
  return (
    <div className={styles.chainRow} aria-hidden="true">
      {links.map((_, i) => (
        <span
          key={i}
          className={`${styles.chainLink} ${i % 5 === 0 ? styles.bright : styles.dim}`}
        />
      ))}
    </div>
  );
}

function FooterHeading({ children }) {
  return <h4 className={styles.heading}>{children}</h4>;
}

function FooterLink({ href, children }) {
  return (
    <li className={styles.linkItem}>
      <a href={href}>{children}</a>
    </li>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.topLine} />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand column */}
          <div className={styles.brandCol}>
            <a href="/" className={styles.logoRow}>
              <img src={logo} alt="Aurevian" className={styles.logoImage} />
            </a>
            <p className={styles.tagline}>
              Fine jewellery crafted for every story worth telling — timeless
              gold, modern lines, made to be handed down.
            </p>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <Phone size={14} />
                <span>+91 6261478315</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={14} />
                <span>info.aurevian.switzerland@gmail.com</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={14} />
                <span>Indore, Madhya Pradesh, India</span>
              </div>
            </div>

            <div className={styles.socialRow}>
              {socialIcons.map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className={styles.linkCol}>
            <FooterHeading>Shop</FooterHeading>
            <ul className={styles.linkList}>
              {shopCategories.map((item) => (
                <FooterLink key={item.id} href={item.path}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div className={styles.linkCol}>
            <FooterHeading>Collections</FooterHeading>
            <ul className={styles.linkList}>
              {collectionsDropdown.map((item) => (
                <FooterLink key={item.id} href={item.path}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div className={styles.linkCol}>
            <FooterHeading>Gift Guide</FooterHeading>
            <ul className={styles.linkList}>
              {giftGuide.byOccasion.map((item) => (
                <FooterLink key={item.id} href={item.path}>
                  {item.label}
                </FooterLink>
              ))}
              {giftGuide.byBudget.map((item) => (
                <FooterLink key={item.id} href={item.path}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.linkCol}>
            <FooterHeading>Stay In Touch</FooterHeading>
            <p className={styles.newsletterText}>New arrivals, first look.</p>
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className={styles.emailInput}
              />
              <button type="submit" className={styles.subscribeBtn}>
                {subscribed ? "Subscribed" : "Subscribe"}
                {!subscribed && <ArrowRight size={13} />}
              </button>
            </form>
          </div>
        </div>

        {/* About / policy row */}
        <div className={styles.metaRow}>
          <div className={styles.metaLinks}>
            {aboutDropdown.map((item) => (
              <a key={item.id} href={item.path}>
                {item.label}
              </a>
            ))}
          </div>
          <div className={styles.metaLinks}>
            {policyLinks.map((item) => (
              <a key={item.id} href={item.path}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* decorative chain link divider */}
      <div className={styles.chainStrip}>
        <ChainDivider />
      </div>

      {/* bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Aurevian. All rights reserved.
          </p>
          <div className={styles.paymentRow}>
            {["Visa", "Mastercard", "UPI", "RuPay"].map((method) => (
              <span key={method} className={styles.paymentTag}>
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}