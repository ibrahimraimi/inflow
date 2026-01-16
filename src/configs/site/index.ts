export const siteConfig = {
  name: "Inflow",
  title: "Inflow",
  description:
    "Inflow is a simple open source, fast, privacy-friendly self-hosted analytics platform.",
  url:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  baseUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  domain:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
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
