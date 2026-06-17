import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AsaanRabta collects, uses, and protects your data, including WhatsApp Business messages processed via the Meta WhatsApp Cloud API.",
};

const UPDATED = "18 June 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-[var(--ink)]">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--ink-mute)]">
        Last updated: {UPDATED}
      </p>

      <div className="mt-8 space-y-8 text-[15px] leading-7 text-[var(--ink-soft)]">
        <section>
          <p>
            AsaanRabta (&quot;we&quot;, &quot;us&quot;) provides an AI-powered
            CRM that lets businesses manage customer conversations across
            messaging channels, including WhatsApp via the Meta WhatsApp
            Business Cloud API. This policy explains what we collect, how we use
            it, and the choices you have.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Information we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Account data:</strong> your name, email, business name,
              and workspace settings.
            </li>
            <li>
              <strong>WhatsApp Business data:</strong> when you connect a
              WhatsApp Business Account, we process messages, phone numbers,
              contact names, and media exchanged between your business and your
              customers, in order to display them in your inbox and generate
              AI-assisted replies.
            </li>
            <li>
              <strong>Connection credentials:</strong> the Meta access token for
              your WhatsApp Business Account, which is stored encrypted at rest.
            </li>
            <li>
              <strong>Usage data:</strong> log and analytics data about how the
              product is used.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            How we use information
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>To deliver and operate the CRM and its messaging features.</li>
            <li>
              To generate AI-assisted replies and summaries for your
              conversations.
            </li>
            <li>To secure, maintain, and improve the service.</li>
          </ul>
          <p className="mt-3">
            We do not sell your personal data. WhatsApp message content is used
            only to provide the service to your business and is not used for
            advertising.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Data sharing
          </h2>
          <p className="mt-3">
            We share data only with processors required to run the service —
            such as Meta (WhatsApp Cloud API), our cloud hosting and storage
            providers, and AI model providers — strictly to provide the features
            you use, and subject to their respective terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Data retention &amp; deletion
          </h2>
          <p className="mt-3">
            We retain data for as long as your account is active. You can
            disconnect WhatsApp at any time from the Channels page, which removes
            the stored credentials. To request deletion of your data, see our{" "}
            <a
              href="/data-deletion"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              Data Deletion
            </a>{" "}
            page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">Contact</h2>
          <p className="mt-3">
            For privacy questions or requests, contact{" "}
            <a
              href="mailto:privacy@asaanrabta.com"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              privacy@asaanrabta.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
