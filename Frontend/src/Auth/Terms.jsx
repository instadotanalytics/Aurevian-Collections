
// Terms.jsx
import React from "react";
import { motion } from "framer-motion";
import styles from "./Terms.module.css";
import Header from "../Pages/Layout/Header/Header";
import Footer from "../Pages/Layout/Footer/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const viewportOnce = { once: true, amount: 0.2 };

export default function Terms() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.mainContent}>
        {/* Page Title */}
        <motion.section
          className={styles.pageTitle}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span variants={fadeUp} className={styles.pageKicker}>
            Aurevian Collections
          </motion.span>
          <motion.h1 variants={fadeUp} className={styles.pageHeading}>
            Terms &amp; Conditions
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.lastUpdated}>
            Last updated: August 4, 2026
          </motion.p>
        </motion.section>

        {/* Body */}
        <div className={styles.termsWrap}>
          <main className={styles.content}>
            <motion.p
              className={styles.intro}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              Please read these Terms &amp; Conditions carefully before using
              the Aurevian Collections website or placing an order. By accessing
              this site or purchasing any product, you agree to be bound by the
              terms set out below.
            </motion.p>

            <motion.section
              id="introduction"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>1. Introduction</h2>
              <p>
                These Terms &amp; Conditions ("Terms") govern your use of the
                Aurevian Collections website (the "Site") and any purchase made
                through it. Aurevian Collections ("we", "us", "our") reserves
                the right to update or modify these Terms at any time without
                prior notice. Continued use of the Site following any changes
                constitutes your acceptance of the revised Terms.
              </p>
            </motion.section>

            <motion.section
              id="definitions"
              className={styles.section}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <motion.h2 variants={fadeUp}>2. Definitions</motion.h2>
              <ul className={styles.bulletList}>
                <motion.li variants={fadeUp}>
                  <strong>"Products"</strong> refers to all jewellery items,
                  accessories and gift sets listed for sale on the Site.
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>"User", "You"</strong> refers to any person browsing,
                  registering on, or purchasing from the Site.
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>"Order"</strong> refers to a request placed by you to
                  purchase one or more Products through the Site.
                </motion.li>
              </ul>
            </motion.section>

            <motion.section
              id="eligibility"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>3. Eligibility</h2>
              <p>
                You must be at least 18 years of age, or be using the Site under
                the supervision of a parent or legal guardian, to place an
                order. By using this Site, you represent that you meet this
                requirement and that all information you provide is accurate and
                complete.
              </p>
            </motion.section>

            <motion.section
              id="account"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>4. Account Registration</h2>
              <p>
                Certain features of the Site, such as order tracking and
                wishlists, may require you to create an account. You are
                responsible for maintaining the confidentiality of your login
                credentials and for all activity that occurs under your account.
                Please notify us immediately of any unauthorised use of your
                account.
              </p>
            </motion.section>

            <motion.section
              id="orders"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>5. Orders &amp; Payments</h2>
              <p>
                All orders placed through the Site are subject to acceptance and
                availability. We reserve the right to refuse or cancel any order
                at our discretion, including in cases of suspected fraud,
                pricing errors, or stock unavailability. Payments are processed
                through secure third-party payment gateways; we do not store
                your full card details on our servers.
              </p>
            </motion.section>

            <motion.section
              id="pricing"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>6. Pricing &amp; Availability</h2>
              <p>
                All prices listed on the Site are in Indian Rupees (₹) and are
                inclusive of applicable taxes unless stated otherwise. While we
                make every effort to ensure pricing and product information is
                accurate, errors may occasionally occur. In such cases, we will
                contact you before processing your order and you may choose to
                proceed at the corrected price or cancel the order for a full
                refund.
              </p>
            </motion.section>

            <motion.section
              id="shipping"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>7. Shipping &amp; Delivery</h2>
              <p>
                Orders above ₹2,000 qualify for free standard shipping.
                Estimated delivery timelines are provided at checkout and are
                not guaranteed, as they may be affected by courier delays,
                remote locations, or circumstances beyond our control. Risk of
                loss and title for Products pass to you upon delivery to the
                shipping address provided.
              </p>
            </motion.section>

            <motion.section
              id="returns"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>8. Returns, Exchanges &amp; Refunds</h2>
              <p>
                We offer a 15-day exchange window from the date of delivery for
                unworn, unused items in their original packaging with tags
                intact. Earrings and other items classified as personal care
                products may not be eligible for return due to hygiene reasons,
                unless defective. Approved refunds are credited to the original
                payment method within 7–10 business days of us receiving the
                returned item.
              </p>
            </motion.section>

            <motion.section
              id="warranty"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>9. Product Care &amp; Warranty</h2>
              <p>
                Aurevian Collections jewellery is plated and finished by hand;
                natural variation in tone or texture is not considered a defect.
                We recommend keeping pieces away from water, perfume and direct
                sunlight to preserve the finish. Manufacturing defects reported
                within 30 days of delivery will be repaired or replaced at our
                discretion, free of charge.
              </p>
            </motion.section>

            <motion.section
              id="ip"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>10. Intellectual Property</h2>
              <p>
                All content on this Site, including but not limited to product
                photography, designs, logos, text and graphics, is the property
                of Aurevian Collections and is protected by applicable
                intellectual property laws. You may not reproduce, distribute,
                or create derivative works from any part of the Site without our
                prior written consent.
              </p>
            </motion.section>

            <motion.section
              id="conduct"
              className={styles.section}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <motion.h2 variants={fadeUp}>11. Prohibited Conduct</motion.h2>
              <motion.p variants={fadeUp}>You agree not to:</motion.p>
              <ul className={styles.bulletList}>
                <motion.li variants={fadeUp}>
                  Use the Site for any unlawful purpose
                </motion.li>
                <motion.li variants={fadeUp}>
                  Attempt to gain unauthorised access to our systems or another
                  user's account
                </motion.li>
                <motion.li variants={fadeUp}>
                  Submit false, misleading, or fraudulent information when
                  placing an order
                </motion.li>
                <motion.li variants={fadeUp}>
                  Interfere with the proper functioning of the Site, including
                  through malware or automated scraping
                </motion.li>
              </ul>
            </motion.section>

            <motion.section
              id="liability"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>12. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Aurevian Collections
                shall not be liable for any indirect, incidental, or
                consequential damages arising from your use of the Site or
                Products purchased through it. Our total liability for any claim
                arising from an order shall not exceed the amount paid for that
                order.
              </p>
            </motion.section>

            <motion.section
              id="privacy"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>13. Privacy</h2>
              <p>
                Your use of the Site is also governed by our Privacy Policy,
                which explains how we collect, use, and protect your personal
                information. By using the Site, you consent to the practices
                described in our Privacy Policy.
              </p>
            </motion.section>

            <motion.section
              id="changes"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>14. Changes to These Terms</h2>
              <p>
                We may revise these Terms from time to time to reflect changes
                in our business, legal requirements, or Site functionality. The
                "Last updated" date at the top of this page reflects the most
                recent revision. We encourage you to review these Terms
                periodically.
              </p>
            </motion.section>

            <motion.section
              id="governing-law"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>15. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the
                laws of India. Any disputes arising from these Terms or your use
                of the Site shall be subject to the exclusive jurisdiction of
                the courts located in Madhya Pradesh, India.
              </p>
            </motion.section>

            <motion.section
              id="contact"
              className={styles.section}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <motion.h2 variants={fadeUp}>16. Contact Us</motion.h2>
              <motion.p variants={fadeUp}>
                If you have any questions about these Terms &amp; Conditions,
                please reach out to us:
              </motion.p>
              <ul className={styles.contactList}>
                <motion.li variants={fadeUp}>
                  <strong>Email:</strong> info.aurevian.switzerland@gmail.com
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>Phone:</strong> +91 6261478315
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>Address:</strong> Indore, Madhya Pradesh, India
                </motion.li>
              </ul>
            </motion.section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}