import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of AsaanRabta, the AI-powered CRM for messaging channels.",
};

const UPDATED = "18 June 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-[var(--ink)]">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--ink-mute)]">
        Last updated: {UPDATED}
      </p>

      <div className="mt-8 space-y-8 text-[15px] leading-7 text-[var(--ink-soft)]">
        <section>
          <p>
            These terms govern your access to and use of AsaanRabta
            (&quot;the Service&quot;), an AI-powered CRM that manages customer
            conversations across messaging channels, including WhatsApp via the
            Meta WhatsApp Business Cloud API. By using the Service you agree to
            these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Use of the Service
          </h2>
          <p className="mt-3">
            You are responsible for the accounts and channels you connect, for
            obtaining any consent required to message your customers, and for
            complying with the{" "}
            <a
              href="https://www.whatsapp.com/legal/business-policy/"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              WhatsApp Business Messaging Policy
            </a>{" "}
            and applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Acceptable use
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>No spam, harassment, or unlawful content.</li>
            <li>
              No use that violates Meta&apos;s or WhatsApp&apos;s platform terms.
            </li>
            <li>No attempts to disrupt or reverse-engineer the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Data &amp; privacy
          </h2>
          <p className="mt-3">
            Your use of the Service is also governed by our{" "}
            <a
              href="/privacy-policy"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              Privacy Policy
            </a>
            . You can disconnect channels and request data deletion at any time
            via our{" "}
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
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Disclaimer &amp; liability
          </h2>
          <p className="mt-3">
            The Service is provided &quot;as is&quot; without warranties. To the
            extent permitted by law, AsaanRabta is not liable for indirect or
            consequential damages arising from use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">Contact</h2>
          <p className="mt-3">
            Questions about these terms? Email{" "}
            <a
              href="mailto:support@asaanrabta.com"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              support@asaanrabta.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
