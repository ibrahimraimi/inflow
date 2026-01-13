import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Inflow",
  description: "Terms of Service for Inflow analytics platform",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-20">
      <h1 className="mb-4 text-3xl font-bold">Terms of Service</h1>

      <p className="mb-6 text-sm text-muted-foreground">
        <strong>Last updated:</strong> January 13, 2026
      </p>

      {/* Introduction */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">1. Introduction</h2>
      <p className="mb-4">
        Welcome to <strong>Inflow</strong>. These Terms of Service ("Terms")
        govern your access to and use of the Inflow website analytics platform,
        dashboard, tracking script, and related services (collectively, the
        "Service").
      </p>
      <p className="mb-4">
        By creating an account or using Inflow, you agree to be bound by these
        Terms. If you do not agree, do not use the Service.
      </p>

      {/* Service */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">2. The Service</h2>
      <p className="mb-4">
        Inflow provides a privacy-focused website analytics platform that helps
        you understand how visitors use your website. The Service works by
        installing a JavaScript tracking script on your website which collects
        anonymous usage data.
      </p>

      <ul className="mb-4 list-inside list-disc space-y-1">
        <li>We do not use cookies by default</li>
        <li>We do not track personal identities</li>
        <li>We do not sell visitor data</li>
        <li>We provide aggregated and anonymized analytics</li>
      </ul>

      {/* Account */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">3. Accounts</h2>
      <p className="mb-4">
        You must create an account to use the Service. You are responsible for:
      </p>

      <ul className="mb-4 list-inside list-disc space-y-1">
        <li>Maintaining the confidentiality of your login credentials</li>
        <li>All activity that occurs under your account</li>
        <li>Ensuring your account information is accurate</li>
      </ul>

      {/* Customer Responsibilities */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">
        4. Your Responsibilities
      </h2>
      <p className="mb-2">When using Inflow on your website, you agree that:</p>

      <ul className="mb-4 list-inside list-disc space-y-1">
        <li>You have the legal right to track analytics on your website</li>
        <li>
          You are responsible for informing your visitors about analytics
          tracking
        </li>
        <li>
          You will comply with privacy laws applicable to your website (GDPR,
          CCPA, etc.)
        </li>
        <li>You will not use Inflow to track illegal or abusive content</li>
        <li>You will not attempt to misuse or overload our infrastructure</li>
      </ul>

      {/* Data Ownership */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">5. Data Ownership</h2>
      <p className="mb-4">
        You own all analytics data collected from your websites. We act only as
        a data processor to provide the Service.
      </p>

      <p className="mb-4">
        We may process and store analytics data solely for the purpose of
        providing and improving the Service.
      </p>

      {/* Payments */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">
        6. Subscriptions and Payments
      </h2>
      <p className="mb-4">
        Some features of Inflow require a paid subscription. By subscribing, you
        agree to pay the applicable fees on a monthly or yearly basis.
      </p>

      <ul className="mb-4 list-inside list-disc space-y-1">
        <li>Subscriptions renew automatically unless cancelled</li>
        <li>You may cancel at any time</li>
        <li>Fees are non-refundable except where required by law</li>
      </ul>

      {/* Fair Use */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">7. Fair Usage</h2>
      <p className="mb-4">
        You agree not to use the Service in a way that may disrupt, damage, or
        degrade the platform, including excessive traffic, abuse, or attempts to
        bypass usage limits.
      </p>

      {/* Availability */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">8. Availability</h2>
      <p className="mb-4">
        We aim to provide a reliable Service but do not guarantee uninterrupted
        availability. Downtime may occur for maintenance or technical reasons.
      </p>

      {/* Disclaimer */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">
        9. Disclaimer of Warranties
      </h2>
      <p className="mb-4">
        The Service is provided on an "as is" and "as available" basis. We make
        no warranties of any kind, express or implied.
      </p>

      {/* Liability */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">
        10. Limitation of Liability
      </h2>
      <p className="mb-4">
        To the maximum extent permitted by law, Inflow shall not be liable for
        any indirect, incidental, special, or consequential damages, including
        loss of data, profits, or business interruption.
      </p>

      <p className="mb-4">
        Our total liability is limited to the amount paid by you for the Service
        in the twelve (12) months preceding the claim.
      </p>

      {/* Termination */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">11. Termination</h2>
      <p className="mb-4">
        You may stop using the Service at any time. We may suspend or terminate
        your account if you violate these Terms.
      </p>

      {/* Changes */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">
        12. Changes to These Terms
      </h2>
      <p className="mb-4">
        We may update these Terms from time to time. Continued use of the
        Service after changes take effect constitutes acceptance of the revised
        Terms.
      </p>

      {/* Contact */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold">13. Contact</h2>
      <p className="mb-4">
        If you have any questions about these Terms, contact us at:
      </p>
      <p className="font-medium">hello@iflow.com</p>
    </div>
  );
}
