
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import styles from "./Footer.module.css";
import logo from "../../../assets/newlogo1.png";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaPinterestP,
  FaWhatsapp,
} from "react-icons/fa";

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


const socialIcons = [
  {
    Icon: FaInstagram,
    href: "https://www.instagram.com/aureviancollections.in?igsh=MWs4a2diMjF0MTA2Yg==",
  },
  {
    Icon: FaFacebookF,
    href: "https://www.facebook.com/profile.php?id=61592830934451",
  },
  {
    Icon: FaYoutube,
    href: "https://www.youtube.com/@AurevianCollections",
  },
  {
    Icon: FaPinterestP,
    href: "https://pin.it/7a79gBqeR",
  },
  {
    Icon: FaWhatsapp,
    href: "https://wa.link/gui67i",
  },
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
  return (
    <footer className={styles.footer}>
      

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
          <div className={`${styles.linkCol} ${styles.shopCol}`}>
            <FooterHeading>Shop</FooterHeading>
            <ul className={styles.linkList}>
              {shopCategories.map((item) => (
                <FooterLink key={item.id} href={item.path}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div className={`${styles.linkCol} ${styles.collectionsCol}`}>
            <FooterHeading>Collections</FooterHeading>
            <ul className={styles.linkList}>
              {collectionsDropdown.map((item) => (
                <FooterLink key={item.id} href={item.path}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div className={`${styles.linkCol} ${styles.giftCol}`}>
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
      

      {/* bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Aurevian. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
}