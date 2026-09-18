/**
 * storyData.js
 * ---------------------------------------------------------------------------
 * Single source of truth for every string and image used in the "Our Story"
 * section. Aurevian is a modern ACCESSORIES BRAND — belts, wallets,
 * sunglasses, watches, bags, and perfumes — for men and women alike.
 *
 * IMAGES: All image values are plain URLs on purpose, so they can be
 * swapped at any time without touching the JSX.
 * ---------------------------------------------------------------------------
 */

export const storyData = {
  meta: {
    sectionLabel: "Our Story",
  },

  // ------------------------------------------------------------------ HERO
  hero: {
    backgroundImage:
      "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=2400&q=80",
    backgroundAlt:
      "Dusty-rose silk fabric with warm gold accents and dried botanicals",
    brand: "AUREVIAN",
    tagline: "Essentials for the Everyday",
    scrollLabel: "Scroll",
  },

  // ---------------------------------------------------------- EDITORIAL QUOTE
  editorialQuote: {
    lines: ["True style is not worn.", "It is carried."],
  },

  // -------------------------------------------------------------- OUR STORY
  ourStory: {
    eyebrow: "Since the First Stitch",
    heading: "A House Built on Detail",
    paragraphs: [
      "Aurevian began not as a business plan, but as a conviction: that accessories should feel less like a purchase and more like the pieces you reach for without thinking — belt, wallet, watch, day after day.",
      "Every piece is developed in small runs, considered from every angle, and finished by hand. We work slowly on purpose, in an industry that rewards speed, because a piece that lasts cannot be rushed.",
      "What began as a single collection, sketched over months rather than days, has become a language — one written in full-grain leather, brushed metal, and the quiet confidence of things made to be carried.",
    ],
    image:
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1600&q=80",
    imageAlt:
      "Delicate gold chain coiled in fine detail on a warm neutral surface",
  },

  // --------------------------------------------------------------- JOURNEY
  journey: [
    {
      id: "dream",
      order: "01",
      title: "Dream",
      description:
        "A single idea, sketched in the margins — accessories that outlive trend and hold meaning for the person who carries them.",
    },
    {
      id: "vision",
      order: "02",
      title: "Vision",
      description:
        "The idea becomes intention. Materials are chosen not for cost, but for character — full-grain leather, brushed metals, and finishes with nothing to hide behind.",
    },
    {
      id: "craftsmanship",
      order: "03",
      title: "Craftsmanship",
      description:
        "Every piece is cut, stitched, and finished by hand across dozens of small passes — patience made visible in the details.",
    },
    {
      id: "purpose",
      order: "04",
      title: "Purpose",
      description:
        "A piece is only finished when it fits into a rotation, not a trend cycle — made to be worn on repeat, carried daily, and lived in.",
    },
    {
      id: "legacy",
      order: "05",
      title: "Legacy",
      description:
        "Passed from one owner to the next, worn into new stories. This is the only measure of quality that matters to us.",
    },
  ],

  journeyMedia: {
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=80",
    imageAlt:
      "From First Spark to Lasting Legacy — warm gold accent in soft editorial light",
    caption: "Five stages. One philosophy.",
  },

  // ---------------------------------------------------------- CRAFTSMANSHIP
  craftsmanship: {
    eyebrow: "The Making",
    heading: "Patience, Measured in Millimetres",
    paragraphs: [
      "Behind every Aurevian piece is a workroom, not a factory line. Our craftsmen train for years before they are trusted with a single pattern — because a belt edge finished a fraction of a millimetre off sits differently, and we can tell.",
      "We favour the slower, harder way whenever it produces a better result: hand-burnished edges over machine finishing, individual quality checks over batch sampling, small runs over mass production.",
    ],
    image:
      "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?auto=format&fit=crop&w=1600&q=80",
    imageAlt:
      "Patience measured in millimetres — hand-finished gold chain on soft dusty-rose silk",
    features: [
      {
        id: "hand-finished",
        icon: "diamond",
        label: "Hand-Finished Detailing",
      },
      {
        id: "responsibly-sourced",
        icon: "leaf",
        label: "Responsibly Sourced Materials",
      },
      {
        id: "care",
        icon: "heart",
        label: "Repair & Care Programme",
      },
    ],
  },

  // -------------------------------------------------------------- GALLERY
  // Updated: Gallery 3, 4, 5 now feature men's leather accessories,
  // watches, and editorial still-life.
   gallery: [
    {
      id: "gallery-1",
      image:
        "https://plus.unsplash.com/premium_photo-1681276168422-ebd2d7e95340?q=80&w=1200&auto=format&fit=crop",
      alt: "Warm editorial still-life — signature accessories on a soft neutral surface",
      caption: "The Signature Frame",
    },
    {
      id: "gallery-2",
      image:
        "https://i.pinimg.com/736x/dc/29/1f/dc291f33faa82564820a77fb01fa1621.jpg",
      alt: "Men's leather accessories styled in warm editorial light",
      caption: "The Everyday Edit",
    },
    {
      id: "gallery-3",
      image:
        "https://i.pinimg.com/1200x/4f/2c/03/4f2c03ef58f4d0b8c25570f30443bd87.jpg",
      alt: "Signature accessory detail in warm natural lighting",
      caption: "The Detail Study",
    },
    {
      id: "gallery-4",
      image:
        "https://i.pinimg.com/1200x/ed/ce/f5/edcef5c2bd47e316cefa64f2002165dd.jpg",
      alt: "Layered accessories styled on a warm neutral backdrop",
      caption: "The Layered Frame",
    },
    {
      id: "gallery-5",
      image:
        "https://i.pinimg.com/1200x/ac/82/b5/ac82b5ca8e5e95e18032c1cb7c59ddb2.jpg",
      alt: "Signature piece in warm editorial composition",
      caption: "In Frame",
    },
  ],

  // --------------------------------------------------------- FOUNDER QUOTE
  founder: {
    quote:
      "I didn't want to build another accessories label. I wanted to build the pieces I couldn't find — the ones you keep, not just carry.",
    name: "Jeetendra Sahu",
    title: "Founder & Creative Director",
  },

  // --------------------------------------------------------------- LEGACY
  legacy: {
    eyebrow: "Beyond the Season",
    heading: "Made to Be Carried",
    paragraphs: [
      "A trend lasts a season. A good belt lasts years. Aurevian is built for the second kind of time — pieces designed to soften at the edges, be repaired rather than replaced, and be handed down with a story attached.",
    ],
  },

  // ----------------------------------------------------------------- CTA
  cta: {
    heading: "Discover the Collection",
    buttonLabel: "Discover the Collection",
    buttonHref: "/collections",
  },
};

export default storyData;