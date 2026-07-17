import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Terms of Service · Card Setu',
  description: 'The terms that govern your use of Card Setu.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="7 July 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Card Setu (the
        &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these Terms.
      </p>

      <h2>Eligibility &amp; accounts</h2>
      <p>
        You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Service.
        You are responsible for the accuracy of your account information and for keeping your credentials
        secure. You are responsible for all activity under your account.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>publish unlawful, misleading, infringing, or harmful content;</li>
        <li>impersonate any person or business, or misrepresent your affiliation;</li>
        <li>send spam or harvest data about other users; or</li>
        <li>attempt to disrupt, reverse-engineer, or gain unauthorised access to the Service.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You retain ownership of the content you publish on your cards. You grant us a licence to host, display,
        and distribute that content as needed to operate the Service. You are solely responsible for your
        content and for ensuring you have the rights to use it.
      </p>

      <h2>Payments between you and your customers</h2>
      <p>
        Card Setu lets you display payment details (such as UPI IDs or bank information) so your customers can
        pay you directly. Any such transaction is solely between you and your customer &mdash; Card Setu is not a
        party to it, does not process those funds, and is not responsible for them.
      </p>

      <h2>Subscription &amp; fees</h2>
      <p>
        Paid plans, where offered, are billed in advance on the cycle shown at checkout. Fees are exclusive of
        applicable taxes unless stated. Refunds are governed by our{' '}
        <a href="/refund">Refund Policy</a>.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We may suspend or terminate access
        if you violate these Terms or use the Service in a way that creates risk or legal exposure.
      </p>

      <h2>Disclaimers &amp; limitation of liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent
        permitted by law, Card Setu will not be liable for indirect, incidental, or consequential damages, and
        our total liability will not exceed the amount you paid us in the twelve months before the claim.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of India, and any disputes are subject to the exclusive
        jurisdiction of the courts located in India.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes take effect
        constitutes acceptance of the updated Terms.
      </p>
    </LegalLayout>
  );
}
