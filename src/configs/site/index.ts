export const siteConfig = {
  name: "Inflow",
  title: "Inflow",
  description:
    "Inflow is a simple open source, fast, privacy-friendly self-hosted analytics platform.",
  url: "https://inflow.studio21.studio",
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://inflow.studio21.studio"
      : "http://localhost:3000",
  domain: "https://inflow.studio21.studio",
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
  copyright: `© ${new Date().getFullYear()} Inflow. All rights reserved.`,
  foundedYear: 2026,
} as const;

export type Site = typeof siteConfig;

export default siteConfig;
