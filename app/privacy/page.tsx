import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy · Card Setu',
  description: 'How Card Setu collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="7 July 2026">
      <p>
        This Privacy Policy explains how Card Setu (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses,
        and protects information when you use our digital business card platform and related services
        (the &ldquo;Service&rdquo;). By using the Service you agree to the practices described here.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account information</strong> — your name, email address, phone number, and password (stored hashed).</li>
        <li><strong>Card content</strong> — anything you add to your cards, including business details, products, services, images, payment details you choose to display, and links.</li>
        <li><strong>Contacts you receive</strong> — leads, enquiries, appointment bookings, and reviews submitted to your card by visitors.</li>
        <li><strong>Usage &amp; device data</strong> — a device identifier stored in your browser to de-duplicate card views and reviews, plus basic log data (IP address, browser type) for security and analytics.</li>
      </ul>

      <h2>How we use information</h2>
      <p>
        We use information to provide and operate the Service, create and display your public card, deliver
        leads and notifications to you, secure accounts, prevent abuse, and improve the product. We do not
        sell your personal information.
      </p>

      <h2>How information is shared</h2>
      <ul>
        <li><strong>Public cards</strong> — content you publish on a card is, by design, visible to anyone with the link.</li>
        <li><strong>Service providers</strong> — we use trusted third parties (e.g. hosting, email delivery, error monitoring) who process data only on our instructions.</li>
        <li><strong>Legal</strong> — we may disclose information where required by law or to protect our rights and users.</li>
      </ul>

      <h2>Data retention</h2>
      <p>
        We keep your information for as long as your account is active. When you delete your account, your
        cards, products, services, and leads are permanently removed; some records may be retained where
        required for legal, tax, or fraud-prevention purposes.
      </p>

      <h2>Your rights &amp; choices</h2>
      <p>
        You can view and update your profile in <a href="/dashboard/settings">Account Settings</a>, and you can
        permanently delete your account and associated data from the same page. To request a copy of your data
        or exercise other rights available under applicable law, contact us at{' '}
        <a href="mailto:support@cardsetu.com">support@cardsetu.com</a>.
      </p>

      <h2>Security</h2>
      <p>
        We use industry-standard measures to protect your data, including encrypted transport (HTTPS), hashed
        passwords, and access controls. No method of transmission or storage is completely secure, so we cannot
        guarantee absolute security.
      </p>

      <h2>Children</h2>
      <p>The Service is not directed to children under 13, and we do not knowingly collect their information.</p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be reflected by updating the
        &ldquo;Last updated&rdquo; date above and, where appropriate, by notifying you.
      </p>
    </LegalLayout>
  );
}
