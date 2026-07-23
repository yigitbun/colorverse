import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-sm text-neutral-400 dark:text-[#64748B]">Last updated: May 2026</p>

      <LegalSection title="What we collect">
        <p>
          When you sign up for a free account, we collect your email address and the date
          you signed up. That's it. No tracking pixels, no third-party analytics
          currently, no behavioral profiling.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          Your email is used to unlock export formats (SCSS, JSON, Tailwind, hex) and to
          contact you if there's something important about your account. We don't sell
          it, share it, or use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Image extraction">
        <p>
          Images you upload to the Extract tool never leave your device. All color
          extraction runs locally in your browser using the Canvas API. No image data is
          sent to our servers.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use localStorage (not cookies) to remember your theme preference and account
          state. No third-party cookies.
        </p>
      </LegalSection>

      <LegalSection title="Data deletion">
        <p>
          Email us at{" "}
          <a
            href="mailto:hello@colorverse.app"
            className="underline hover:text-neutral-900 dark:hover:text-[#E2E8F0]"
          >
            hello@colorverse.app
          </a>{" "}
          and we'll delete your account data within 7 days.
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
