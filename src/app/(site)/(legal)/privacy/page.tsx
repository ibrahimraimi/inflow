import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Privacy Policy for Inflow Analytics",
  title: "Privacy Policy for Inflow Analytics",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-7xl py-20">
      <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-4">
        <strong>Last updated: January 13, 2026</strong>
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Introduction</h2>
      <p className="mb-4">
        Welcome to Inflow (“we”, “our”, “us”). Inflow is a privacy-focused
        website analytics platform built to help you understand how visitors use
        your website without compromising their privacy.
      </p>
      <p className="mb-4">
        This Privacy Policy explains how we collect, use, and protect your
        information when you use our website and services.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Our Privacy Principles</h2>
      <ul className="mb-4 list-inside list-disc">
        <li>We do not sell your data</li>
        <li>We do not use advertising trackers</li>
        <li>We do not build user profiles</li>
        <li>We collect only what is necessary to run the service</li>
        <li>Your analytics data belongs to you</li>
      </ul>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Information We Collect</h2>

      <h3 className="mt-4 mb-2 text-xl font-bold">Account Information</h3>
      <p className="mb-4">When you create an Inflow account, we may collect:</p>
      <ul className="mb-4 list-inside list-disc">
        <li>Email address</li>
        <li>Name (optional)</li>
        <li>Password (stored in encrypted form)</li>
        <li>Billing information (handled by our payment provider)</li>
      </ul>

      <h3 className="mt-4 mb-2 text-xl font-bold">Usage Information</h3>
      <p className="mb-4">
        When you use our dashboard and services, we may automatically collect:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>IP address</li>
        <li>Browser type</li>
        <li>Device type</li>
        <li>Operating system</li>
        <li>Country (derived from IP)</li>
        <li>Pages viewed within the Inflow app</li>
        <li>Timestamps and performance logs</li>
      </ul>

      <p className="mb-4">
        This data is used strictly for security, debugging, and improving the
        product.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Website Analytics Data</h2>
      <p className="mb-4">
        When you install the Inflow tracking script on your website, we collect
        anonymous usage data on your behalf.
      </p>

      <ul className="mb-4 list-inside list-disc">
        <li>No cookies are used</li>
        <li>No personal identities are tracked</li>
        <li>No names, emails, or fingerprints are collected</li>
        <li>No cross-site tracking is performed</li>
      </ul>

      <p className="mb-4">The analytics data we collect may include:</p>

      <ul className="mb-4 list-inside list-disc">
        <li>Page views</li>
        <li>Referrer URLs</li>
        <li>Country</li>
        <li>Device type</li>
        <li>Browser</li>
        <li>Visit duration</li>
      </ul>

      <p className="mb-4">
        All analytics data belongs to you, the website owner.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">
        How We Use Your Information
      </h2>
      <ul className="mb-4 list-inside list-disc">
        <li>To provide and operate the Inflow service</li>
        <li>To create and manage your account</li>
        <li>To process payments</li>
        <li>To provide customer support</li>
        <li>To improve and optimize the platform</li>
        <li>To prevent fraud and abuse</li>
      </ul>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Payments</h2>
      <p className="mb-4">
        Payments are processed by a third-party payment provider. We do not
        store your credit card or payment details on our servers.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Data Retention</h2>
      <p className="mb-4">
        We retain your personal data only for as long as your account remains
        active.
      </p>
      <p className="mb-4">
        When you delete your account, all associated data is permanently deleted
        from our systems within a reasonable timeframe.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Data Security</h2>
      <ul className="mb-4 list-inside list-disc">
        <li>HTTPS encryption for all connections</li>
        <li>Secure servers and access controls</li>
        <li>Encrypted password storage</li>
        <li>Regular security updates and monitoring</li>
      </ul>

      <p className="mb-4">
        While we take strong precautions, no system can be guaranteed 100%
        secure.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Your Rights</h2>
      <p className="mb-4">
        Depending on your location, you may have the right to:
      </p>

      <ul className="mb-4 list-inside list-disc">
        <li>Access your personal data</li>
        <li>Correct your data</li>
        <li>Delete your data</li>
        <li>Export your data</li>
        <li>Restrict processing</li>
      </ul>

      <p className="mb-4">You can exercise these rights by contacting us.</p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Children’s Privacy</h2>
      <p className="mb-4">
        Inflow is not intended for use by children under the age of 18. We do
        not knowingly collect personal data from children.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Updates to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be
        posted on this page.
      </p>

      <h2 className="mt-6 mb-2 text-2xl font-bold">Contact</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy or our data
        practices, please contact us at:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>hello@inflow.com</li>
      </ul>
    </div>
  );
}
