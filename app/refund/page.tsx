import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Refund Policy · Card Setu',
  description: 'Our policy on refunds for Card Setu subscriptions.',
};

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" updated="7 July 2026">
      <p>
        This Refund Policy applies to paid subscriptions purchased from Card Setu. Free accounts are not
        charged and are therefore not covered by this policy.
      </p>

      <h2>Refund window</h2>
      <p>
        If you are not satisfied with a paid plan, you may request a refund within <strong>7 days</strong> of the
        initial purchase. Refunds requested after this window, or for renewals, are provided at our discretion.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <a href="mailto:support@cardsetu.com">support@cardsetu.com</a> from the email address on your
        account with your order details. Approved refunds are issued to the original payment method within 5&ndash;10
        business days.
      </p>

      <h2>Non-refundable items</h2>
      <ul>
        <li>Physical NFC cards or other hardware that has been produced or shipped.</li>
        <li>Add-ons or usage that has already been consumed.</li>
        <li>Accounts terminated for violating our <a href="/terms">Terms of Service</a>.</li>
      </ul>

      <h2>Cancellations</h2>
      <p>
        You can cancel a subscription at any time; cancellation stops future renewals. You retain access to paid
        features until the end of the current billing period. Cancelling does not automatically trigger a refund
        for the current period.
      </p>

      <h2>Chargebacks</h2>
      <p>
        If you have a billing concern, please contact us first &mdash; we will work to resolve it. Initiating a
        chargeback without contacting us may result in suspension of your account.
      </p>
    </LegalLayout>
  );
}
