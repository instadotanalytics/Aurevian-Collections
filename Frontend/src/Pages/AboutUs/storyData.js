/**
 * storyData.js
 * ---------------------------------------------------------------------------
 * Single source of truth for every string and image used in the "Our Story"
 * section. Nothing in Story.jsx is hardcoded — the component only maps over
 * this shape, so the entire section can later be served from a CMS or an
 * API endpoint (e.g. GET /api/content/our-story) without touching a single
 * line of JSX.
 *
 * IMAGE FIELDS: image values are plain URL strings on purpose (not static
 * `import`s). That is what makes them swappable at runtime — a bundler
 * `import` bakes the file into the build, a string does not. When Aurevian's
 * backend is ready, replace these strings with the URLs it returns (e.g.
 * `https://cdn.aurevian.com/story/hero.jpg`) or point them at files in
 * `src/assets/story/` if you prefer to keep them local for now:
 *
 *   import heroImage from "../../assets/story/hero.jpg";
 *
 * The Unsplash URLs below are placeholders only, standing in for real
 * campaign photography.
 * ---------------------------------------------------------------------------
 */

export const storyData = {
  meta: {
    sectionLabel: "Our Story",
  },

  // ------------------------------------------------------------------ HERO
  hero: {
    backgroundImage:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=2400&q=80",
    backgroundAlt:
      "Close-up of a gold ring resting on dark velvet, softly lit",
    brand: "AUREVIAN",
    tagline: "Where Light Becomes Legacy",
    scrollLabel: "Scroll",
  },

  // ---------------------------------------------------------- EDITORIAL QUOTE
  editorialQuote: {
    lines: ["True luxury is not worn.", "It is lived."],
  },

  // -------------------------------------------------------------- OUR STORY
  ourStory: {
    eyebrow: "Since the First Spark",
    heading: "A House Built on Light",
    paragraphs: [
      "Aurevian began not as a business plan, but as a conviction: that fine jewelry should feel less like an accessory and more like an heirloom in waiting — something a person chooses to carry through every version of their life.",
      "Every piece is conceived in small batches, considered from every angle, and finished by hand. We work slowly on purpose, in an industry that rewards speed, because permanence cannot be rushed.",
      "What began as a single collection, sketched over months rather than days, has become a language — one written in gold, in restraint, and in the quiet confidence of things made to last.",
    ],
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Artisan hands shaping a gold jewelry setting on a workbench",
  },

  // --------------------------------------------------------------- JOURNEY
  // A genuine sequence — each stage depends on the one before it — which is
  // why this is the one place in the section that carries ordinal numbering.
  journey: [
    {
      id: "dream",
      order: "01",
      title: "Dream",
      description:
        "A single idea, sketched in the margins — jewelry that outlives trend and holds meaning for the person who wears it.",
    },
    {
      id: "vision",
      order: "02",
      title: "Vision",
      description:
        "The idea becomes intention. Materials are chosen not for cost, but for character — recycled gold, ethically sourced stones, forms with nothing to hide behind.",
    },
    {
      id: "craftsmanship",
      order: "03",
      title: "Craftsmanship",
      description:
        "Every setting is shaped, filed, and polished by hand across dozens of small passes — patience made visible in metal.",
    },
    {
      id: "purpose",
      order: "04",
      title: "Purpose",
      description:
        "A piece is only finished when it means something — a promise kept, a milestone marked, a quiet moment made permanent.",
    },
    {
      id: "legacy",
      order: "05",
      title: "Legacy",
      description:
        "Passed from one hand to the next, worn into new stories. This is the only measure of luxury that matters to us.",
    },
  ],

    journeyMedia: {
    image:
      "https://plus.unsplash.com/premium_photo-1732706751229-7ff87d2cf31d?q=80&w=421&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Gold jewelry pieces arranged on dark velvet, softly lit",
    caption: "Five stages. One philosophy.",
  },
  

  // ---------------------------------------------------------- CRAFTSMANSHIP
  craftsmanship: {
    eyebrow: "The Making",
    heading: "Patience, Measured in Millimetres",
    paragraphs: [
      "Behind every Aurevian piece is a bench, not a factory line. Our artisans train for years before they are trusted with a single setting — because a stone set a fraction of a degree off catches light differently, and we can tell.",
      "We favour the slower, harder way whenever it produces a better result: hand-polishing over machine buffing, individual quality checks over batch sampling, small runs over mass production.",
    ],
    image:
      "https://images.unsplash.com/photo-1709971422634-288a0ae25cce?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Jeweler's hands setting a gemstone under a loupe light",
    features: [
      {
        id: "hand-set",
        icon: "diamond",
        label: "Hand-Set, Stone by Stone",
      },
      {
        id: "ethical",
        icon: "leaf",
        label: "Responsibly Sourced Materials",
      },
      {
        id: "care",
        icon: "heart",
        label: "Lifetime Care & Restoration",
      },
    ],
  },

  // -------------------------------------------------------------- GALLERY
  gallery: [
    {
      id: "gallery-1",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
      alt: "Gold necklace draped over marble surface",
      caption: "The Aurelia Collection",
    },
    {
      id: "gallery-2",
      image:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80",
      alt: "Model wearing minimal gold hoop earrings",
      caption: "Studio, Autumn Campaign",
    },
    {
      id: "gallery-3",
      image:
        "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=434&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Close-up of hands wearing layered gold rings",
      caption: "Everyday Layering",
    },
    {
      id: "gallery-4",
      image:
        "https://images.unsplash.com/photo-1708221382684-6f2493e7167d?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Gold bracelet on wrist against neutral background",
      caption: "The Lumen Cuff",
    },
    {
      id: "gallery-5",
      image:
        "https://plus.unsplash.com/premium_photo-1709033404514-c3953af680b4?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Jewelry atelier workbench with tools and gold wire",
      caption: "Inside the Atelier",
    },
  ],

  // --------------------------------------------------------- FOUNDER QUOTE
  founder: {
    quote:
      "I didn't want to build another jewelry brand. I wanted to build the pieces I couldn't find — the ones you keep, not just wear.",
    name: "Jeetendra Sahu",
    title: "Founder & Creative Director",
  },

  // --------------------------------------------------------------- LEGACY
  legacy: {
    eyebrow: "Beyond the Season",
    heading: "Made to Be Inherited",
    paragraphs: [
      "A trend lasts a season. A house lasts generations. Aurevian is built for the second kind of time — pieces designed to be worn thin at the edges, repaired rather than replaced, and handed down with a story attached.",
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