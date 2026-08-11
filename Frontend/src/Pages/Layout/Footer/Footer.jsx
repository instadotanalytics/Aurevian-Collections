
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import styles from "./Footer.module.css";
import logo from "../../../assets/newlogo1.png";

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

const PinterestIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    {...props}
  >
    <path d="M12 3.5a8.5 8.5 0 0 0-3.1 16.4c-.1-1.4 0-3 .35-4.3l1.1-4.6s-.28-.57-.28-1.4c0-1.3.76-2.28 1.7-2.28.8 0 1.18.6 1.18 1.32 0 .8-.5 2-.75 3.1-.22.93.47 1.69 1.4 1.69 1.68 0 2.98-1.77 2.98-4.32 0-2.26-1.62-3.84-3.94-3.84-2.68 0-4.25 2.01-4.25 4.09 0 .81.31 1.68.7 2.15.08.1.09.19.07.3l-.26 1.06c-.04.17-.14.21-.32.13-1.2-.56-1.95-2.3-1.95-3.7 0-3.01 2.19-5.78 6.31-5.78 3.31 0 5.88 2.36 5.88 5.51 0 3.29-2.07 5.94-4.94 5.94-.97 0-1.88-.5-2.19-1.09l-.6 2.27c-.22.83-.82 1.87-1.22 2.5.92.28 1.89.43 2.9.43A8.5 8.5 0 1 0 12 3.5Z" />
  </svg>
);

const WhatsappIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    {...props}
  >
    <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
    <path d="M8.5 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.5c.1.2.1.4-.1.6l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.4.2-.9.3-1.4.2-2.7-.5-5.7-3.5-6.2-6.2-.1-.5 0-1 .2-1.4Z" />
  </svg>
);


const socialIcons = [
  {
    Icon: InstagramIcon,
    href: "https://www.instagram.com/aureviancollections.in?igsh=MWs4a2diMjF0MTA2Yg==",
  },
  {
    Icon: FacebookIcon,
    href: "https://www.facebook.com/profile.php?id=61592830934451",
  },
  {
    Icon: YoutubeIcon,
    href: "https://www.youtube.com/@AurevianCollections",
  },
  {
    Icon: PinterestIcon,
    href: "https://pin.it/7a79gBqeR",
  },
  {
    Icon: WhatsappIcon,
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