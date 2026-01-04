export const siteConfig = {
  name: "Inflow",
  title: "Inflow",
  description:
    "Inflow is a simple, fast, privacy-friendly alternative to Google Analytics.",
  url: "https://inflow.com",
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://inflow.com"
      : "http://localhost:3000",
  domain: "https://inflow.com",
  keywords: [],
  author: {
    name: "Ibrahim Raimi",
    email: "ibrahimraimi.tech@gmail.com",
    url: "https://ibrahimraimi.com",
  },
  social: {
    twitter: "https://twitter.com/inflow",
    twitterHandle: "@inflow",
    github: "https://github.com/inflow",
    linkedin: "https://linkedin.com/in/inflow",
    facebook: "https://facebook.com/inflow",
    instagram: "https://instagram.com/inflow",
  },
  ogImage: "/opengraph-image.png",
  twitterCard: "summary_large_image",
  contact: {
    email: "contact@inflow.com",
    phone: "+2348035431536",
    address: "Lagos, Nigeria",
  },
  locale: "en-US",
  language: "en",
  copyright: `© ${new Date().getFullYear()} Your Site Name. All rights reserved.`,
  foundedYear: 2026,
} as const;

export type Site = typeof siteConfig;

export default siteConfig;
