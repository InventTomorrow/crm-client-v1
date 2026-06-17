import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion",
  description:
    "How to request deletion of your AsaanRabta account and WhatsApp Business data.",
};

export default function DataDeletionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-[var(--ink)]">
      <h1 className="text-3xl font-semibold">Data Deletion</h1>

      <div className="mt-8 space-y-8 text-[15px] leading-7 text-[var(--ink-soft)]">
        <section>
          <p>
            You can request deletion of your AsaanRabta account and all
            associated data, including any WhatsApp Business messages, contacts,
            and connection credentials we process on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Disconnect WhatsApp
          </h2>
          <p className="mt-3">
            To remove the stored credentials for a connected WhatsApp Business
            Account, open the <strong>Channels</strong> page in AsaanRabta and
            click <strong>Disconnect</strong>. This deletes the encrypted access
            token for that account immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Delete your account &amp; data
          </h2>
          <p className="mt-3">
            To permanently delete your account and all related data, email{" "}
            <a
              href="mailto:support@asaanrabta.com?subject=Data%20Deletion%20Request"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              support@asaanrabta.com
            </a>{" "}
            from the address associated with your account, with the subject
            &quot;Data Deletion Request&quot;. We will verify ownership and
            complete the deletion within 30 days, then confirm by email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            What gets deleted
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Your account, workspace, and profile information.</li>
            <li>
              Conversations, contacts, and media synced from connected channels.
            </li>
            <li>Stored WhatsApp Business access tokens and channel settings.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
