import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="text-sm text-neutral-400 dark:text-[#64748B]">Last updated: May 2026</p>

      <LegalSection title="Using ColorVerse">
        <p>
          ColorVerse is a free tool for discovering and exporting color palettes. You may
          use it for personal and commercial projects. Don't use it to do anything
          illegal or to harm others.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          Images you upload for extraction are processed entirely in your browser and are
          never stored on our servers. You retain full ownership of any images you
          upload.
        </p>
      </LegalSection>

      <LegalSection title="Exported palettes">
        <p>
          Palettes you export from ColorVerse — whether curated or extracted — are yours
          to use however you like, including in commercial work. No attribution
          required.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          Free accounts are created with an email address. You're responsible for keeping
          your account details accurate. We can suspend or remove accounts that abuse the
          service.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          ColorVerse is provided as-is. We aim for high uptime but can't guarantee it.
          Features may change as the product evolves — we'll communicate significant
          changes.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions?{" "}
          <a
            href="mailto:hello@colorverse.app"
            className="underline hover:text-neutral-900 dark:hover:text-[#E2E8F0]"
          >
            hello@colorverse.app
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
