import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges | ASR Collections",
  description: "Learn about our return and exchange policies.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="font-heading text-3xl text-brand-plum md:text-4xl mb-8">
        Returns & Exchanges
      </h1>
      
      <div className="prose prose-brand text-brand-plum/80 space-y-8">
        <p className="text-lg">
          We take care in every piece we sell. If something is not right, we want
          to make it right — please reach out to us on WhatsApp within 48 hours
          of receiving your order and we will work through it with you personally.
        </p>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Conditions for return or exchange</h2>
          <p className="mb-3">
            A saree may be returned or exchanged only if it meets all of the
            following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The saree is in its original, unworn condition</li>
            <li>There are no stains, marks, perfume, or odour on the fabric</li>
            <li>The saree has not been washed, ironed, or altered in any way</li>
            <li>There are no new creases, pulls, or physical damage that were not present at the time of delivery</li>
            <li>The original packaging and any included accessories (blouse piece, fall, etc.) are intact and included</li>
            <li>You contact us within 48 hours of receiving the saree — requests after this window cannot be accepted</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Non-returnable items</h2>
          <p className="mb-3">
            The following cannot be returned or exchanged under any circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Sarees that have been worn, washed, or altered</li>
            <li>Items purchased during a sale or at a discounted price</li>
            <li>Custom or made-to-order pieces</li>
            <li>Items where the original tags or packaging have been removed</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">How to raise a return request</h2>
          <p className="mb-3">
            Contact us directly on WhatsApp with:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-3">
            <li>Your order reference number (e.g. ASR-1234)</li>
            <li>A clear photo of the saree as received</li>
            <li>A brief description of the issue</li>
          </ul>
          <p>
            We will respond within 24 hours with the next steps. Do not send the
            saree back before receiving confirmation from us.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Refunds</h2>
          <p className="bg-yellow-200/50 text-brand-plum px-2 py-1 rounded inline-block">
            [Fill in: store credit only / exchange only / refund to original payment
            method — whatever your real policy is. Since payment is arranged
            informally via WhatsApp, be honest about how refunds actually work for
            your shop]
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Damage in transit</h2>
          <p>
            If your saree arrives damaged due to packaging or courier handling,
            please photograph the packaging and the saree immediately and send it
            to us on WhatsApp. We will take full responsibility for transit damage.
          </p>
        </section>
      </div>
    </div>
  );
}
