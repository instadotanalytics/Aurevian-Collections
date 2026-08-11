
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
            Terms and Conditions
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.lastUpdated}>
            Last updated: August 6, 2026
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
              the Aurevian Collections website or placing an order. These
              Terms form a binding agreement between you and Aurevian
              Collections. By accessing this site, creating an account, or
              purchasing any product, you confirm that you have read,
              understood, and agree to be bound by the terms set out below. If
              you do not agree with any part of these Terms, please do not use
              the Site.
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
                Aurevian Collections website (the "Site") and any purchase
                made through it. Aurevian Collections ("we", "us", "our")
                reserves the right to update or modify these Terms at any time
                without prior notice. Continued use of the Site following any
                changes constitutes your acceptance of the revised Terms.
              </p>
              <p>
                These Terms apply to all visitors, users, and customers of the
                Site, whether browsing as a guest or a registered account
                holder. They apply equally to purchases made through our web
                storefront and any linked storefronts we may operate on
                third-party marketplaces or social platforms, unless those
                platforms' own terms expressly override specific provisions
                here.
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
                  <strong>"User", "You"</strong> refers to any person
                  browsing, registering on, or purchasing from the Site.
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>"Order"</strong> refers to a request placed by you
                  to purchase one or more Products through the Site.
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>"Account"</strong> refers to the personal profile
                  created by a User to access order history, wishlists, and
                  saved details.
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>"Content"</strong> refers to text, images, graphics,
                  reviews, and any other material displayed on or submitted to
                  the Site.
                </motion.li>
                <motion.li variants={fadeUp}>
                  <strong>"Promotion"</strong> refers to any discount code,
                  sale, gift card, or limited-time offer made available on the
                  Site.
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
                You must be at least 18 years of age, or be using the Site
                under the supervision of a parent or legal guardian, to place
                an order. By using this Site, you represent that you meet
                this requirement and that all information you provide is
                accurate and complete.
              </p>
              <p>
                We reserve the right to request proof of age or identity
                where necessary and to refuse service, terminate accounts, or
                cancel orders where we reasonably believe these eligibility
                requirements have not been met.
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
                credentials and for all activity that occurs under your
                account. Please notify us immediately of any unauthorised use
                of your account.
              </p>
              <p>
                We reserve the right to suspend or terminate accounts that
                remain inactive for an extended period, contain inaccurate
                information, or are used in violation of these Terms. You may
                request deletion of your account at any time by contacting
                us.
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
                All orders placed through the Site are subject to acceptance
                and availability. We reserve the right to refuse or cancel
                any order at our discretion, including in cases of suspected
                fraud, pricing errors, or stock unavailability. Payments are
                processed through secure third-party payment gateways; we do
                not store your full card details on our servers.
              </p>
              <p>
                An order confirmation email does not guarantee acceptance of
                your order; it is an acknowledgement that we have received
                your request. A contract is formed only once we confirm that
                the Product has been dispatched. We accept major debit and
                credit cards, UPI, net banking, and other payment methods
                displayed at checkout, and reserve the right to add or
                withdraw payment options at any time.
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
                All prices listed on the Site are in Indian Rupees (₹) and
                are inclusive of applicable taxes unless stated otherwise.
                While we make every effort to ensure pricing and product
                information is accurate, errors may occasionally occur. In
                such cases, we will contact you before processing your order
                and you may choose to proceed at the corrected price or
                cancel the order for a full refund.
              </p>
              <p>
                Product availability is displayed on a best-effort basis and
                is not guaranteed until an order is confirmed. Occasionally a
                Product may sell out between the time it is added to your
                cart and the time your order is placed; in that event we will
                notify you and offer a substitute, backorder, or full refund.
              </p>
            </motion.section>

            <motion.section
              id="promotions"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>7. Promotions, Discounts &amp; Gift Cards</h2>
              <p>
                Discount codes, seasonal sales, and other Promotions are
                offered at our discretion and may be modified, restricted, or
                withdrawn at any time without prior notice. Unless stated
                otherwise, Promotions cannot be combined, applied
                retroactively to past orders, or exchanged for cash.
              </p>
              <p>
                Gift cards issued by Aurevian Collections are non-refundable,
                non-transferable for cash, and valid for the period stated at
                the time of issue. Lost or stolen gift card codes cannot be
                replaced unless you can provide satisfactory proof of
                original purchase.
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
              <h2>8. Shipping &amp; Delivery</h2>
              <p>
                Orders above ₹2,000 qualify for free standard shipping.
                Estimated delivery timelines are provided at checkout and are
                not guaranteed, as they may be affected by courier delays,
                remote locations, or circumstances beyond our control. Risk
                of loss and title for Products pass to you upon delivery to
                the shipping address provided.
              </p>
              <p>
                It is your responsibility to provide a complete and accurate
                shipping address. We are not liable for delays or
                non-delivery caused by incorrect address details, and
                re-shipping costs arising from address errors may be charged
                to you. International shipping, where offered, may be subject
                to customs duties and import taxes payable by the recipient.
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
              <h2>9. Exchanges</h2>
              <p>
               

We offer a 15-day exchange window from the date of delivery for unworn, unused items in their original packaging with tags intact. Earrings and other items classified as personal care products may not be eligible for exchange due to hygiene reasons, unless defective.

To initiate an exchange, please contact our support team with your order number and reason for the exchange. Items showing signs of wear, missing original packaging, or not meeting our exchange conditions may be declined. Customised or made-to-order pieces are not eligible for exchange unless defective.

              </p>
              <p>
                To initiate a return or exchange, contact our support team
                with your order number and reason for return. Items returned
                without prior authorisation, showing signs of wear, or
                missing original packaging may be declined and sent back to
                you. Customised or made-to-order pieces are final sale unless
                defective.
              </p>
            </motion.section>

            <motion.section
              id="cancellation"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>10. Order Cancellation</h2>
              <p>
                You may request cancellation of an order free of charge
                before it has been dispatched. Once an order has been
                dispatched, it cannot be cancelled and must instead follow
                our standard return process outlined above. We reserve the
                right to cancel orders on our end due to pricing errors,
                suspected fraudulent activity, or inability to fulfil the
                order, in which case a full refund will be issued.
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
              <h2>11. Product Care &amp; Warranty</h2>
              <p>
                Aurevian Collections jewellery is plated and finished by
                hand; natural variation in tone or texture is not considered
                a defect. We recommend keeping pieces away from water,
                perfume and direct sunlight to preserve the finish.
                Manufacturing defects reported within 30 days of delivery
                will be repaired or replaced at our discretion, free of
                charge.
              </p>
              <p>
                This warranty does not cover damage resulting from normal
                wear and tear, improper storage, accidental damage, or
                unauthorised repair attempts. Proof of purchase is required
                for all warranty claims.
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
              <h2>12. Intellectual Property</h2>
              <p>
                All content on this Site, including but not limited to
                product photography, designs, logos, text and graphics, is
                the property of Aurevian Collections and is protected by
                applicable intellectual property laws. You may not reproduce,
                distribute, or create derivative works from any part of the
                Site without our prior written consent.
              </p>
              <p>
                The Aurevian Collections name and logo are trademarks of
                Aurevian Collections. Nothing in these Terms grants you any
                licence or right to use our trademarks, trade dress, or brand
                assets for commercial purposes.
              </p>
            </motion.section>

            <motion.section
              id="reviews"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>13. User Content &amp; Reviews</h2>
              <p>
                If you submit a review, photo, comment, or other content to
                the Site, you grant us a non-exclusive, royalty-free,
                worldwide licence to use, reproduce, and display that content
                in connection with our marketing and the operation of the
                Site. You confirm that any content you submit is your own
                work and does not infringe on the rights of any third party.
              </p>
              <p>
                We reserve the right to remove or decline to publish any
                user-submitted content that we consider inappropriate,
                misleading, or in breach of these Terms.
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
              <motion.h2 variants={fadeUp}>14. Prohibited Conduct</motion.h2>
              <motion.p variants={fadeUp}>You agree not to:</motion.p>
              <ul className={styles.bulletList}>
                <motion.li variants={fadeUp}>
                  Use the Site for any unlawful purpose
                </motion.li>
                <motion.li variants={fadeUp}>
                  Attempt to gain unauthorised access to our systems or
                  another user's account
                </motion.li>
                <motion.li variants={fadeUp}>
                  Submit false, misleading, or fraudulent information when
                  placing an order
                </motion.li>
                <motion.li variants={fadeUp}>
                  Interfere with the proper functioning of the Site,
                  including through malware or automated scraping
                </motion.li>
                <motion.li variants={fadeUp}>
                  Resell Products purchased from the Site for commercial
                  purposes without our prior written consent
                </motion.li>
                <motion.li variants={fadeUp}>
                  Post or transmit any content that is defamatory, obscene,
                  or infringes on the rights of others
                </motion.li>
              </ul>
            </motion.section>

            <motion.section
              id="third-party"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>15. Third-Party Links &amp; Services</h2>
              <p>
                The Site may contain links to third-party websites, payment
                processors, or delivery partners that are not owned or
                controlled by Aurevian Collections. We are not responsible
                for the content, privacy practices, or terms of any
                third-party sites, and your interactions with them are solely
                between you and that third party.
              </p>
            </motion.section>

            <motion.section
              id="disclaimer"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>16. Disclaimer of Warranties</h2>
              <p>
                The Site and its Content are provided on an "as is" and "as
                available" basis without warranties of any kind, whether
                express or implied, including implied warranties of
                merchantability, fitness for a particular purpose, or
                non-infringement, except as expressly stated in these Terms
                or required by applicable law.
              </p>
            </motion.section>

            <motion.section
              id="liability"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>17. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Aurevian Collections
                shall not be liable for any indirect, incidental, or
                consequential damages arising from your use of the Site or
                Products purchased through it. Our total liability for any
                claim arising from an order shall not exceed the amount paid
                for that order.
              </p>
            </motion.section>

            <motion.section
              id="indemnity"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>18. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Aurevian Collections,
                its officers, employees, and partners from any claim, loss, or
                demand, including reasonable legal fees, arising out of your
                breach of these Terms or your misuse of the Site.
              </p>
            </motion.section>

            <motion.section
              id="force-majeure"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>19. Force Majeure</h2>
              <p>
                We shall not be held responsible for any delay or failure to
                perform our obligations under these Terms where such delay or
                failure results from causes beyond our reasonable control,
                including natural disasters, strikes, courier disruptions,
                government restrictions, or other events of force majeure.
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
              <h2>20. Privacy &amp; Cookies</h2>
              <p>
                Your use of the Site is also governed by our Privacy Policy,
                which explains how we collect, use, and protect your personal
                information. By using the Site, you consent to the practices
                described in our Privacy Policy.
              </p>
              <p>
                We use cookies and similar technologies to improve your
                browsing experience, remember your preferences, and analyse
                Site traffic. You can manage or disable cookies through your
                browser settings, though this may affect certain Site
                features.
              </p>
            </motion.section>

            <motion.section
              id="dispute"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>21. Dispute Resolution</h2>
              <p>
                In the event of any dispute arising from these Terms or your
                use of the Site, we encourage you to first contact our
                support team so that we may attempt to resolve the matter
                informally. If a resolution cannot be reached, the dispute
                shall be referred to arbitration in accordance with
                applicable Indian law, with the seat of arbitration in
                Indore, Madhya Pradesh.
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
              <h2>22. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with
                the laws of India. Any disputes arising from these Terms or
                your use of the Site shall be subject to the exclusive
                jurisdiction of the courts located in Madhya Pradesh, India.
              </p>
            </motion.section>

            <motion.section
              id="severability"
              className={styles.section}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2>23. Severability &amp; Entire Agreement</h2>
              <p>
                If any provision of these Terms is found to be invalid or
                unenforceable, that provision shall be limited or eliminated
                to the minimum extent necessary, and the remaining provisions
                shall remain in full force and effect. These Terms, together
                with our Privacy Policy, constitute the entire agreement
                between you and Aurevian Collections regarding your use of
                the Site.
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
              <h2>24. Changes to These Terms</h2>
              <p>
                We may revise these Terms from time to time to reflect
                changes in our business, legal requirements, or Site
                functionality. The "Last updated" date at the top of this
                page reflects the most recent revision. We encourage you to
                review these Terms periodically.
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
              <motion.h2 variants={fadeUp}>25. Contact Us</motion.h2>
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