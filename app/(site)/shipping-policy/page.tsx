import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery | ASR Collections",
  description: "Learn about our shipping and delivery processes.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="font-heading text-3xl text-brand-plum md:text-4xl mb-8">
        Shipping & Delivery
      </h1>
      
      <div className="prose prose-brand text-brand-plum/80 space-y-8">
        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">How delivery works</h2>
          <p>
            We deliver sarees directly to your doorstep. Once your order is
            confirmed over WhatsApp and payment is arranged, we will dispatch your
            saree and share the tracking details with you on the same WhatsApp
            conversation.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Delivery timeframes</h2>
          <ul className="list-disc pl-5 space-y-2 mb-3">
            <li>
              <strong>Local delivery (within [city/area]):</strong> <span className="bg-yellow-200/50 text-brand-plum px-1 rounded">[X] to [X] business days</span>
            </li>
            <li>
              <strong>Delivery across India:</strong> typically <span className="bg-yellow-200/50 text-brand-plum px-1 rounded">[X] to [X] business days</span> depending
              on your location
            </li>
          </ul>
          <p>
            We will always keep you informed over WhatsApp if there is any delay.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Packaging</h2>
          <p>
            Every saree is carefully folded and packed to ensure it reaches you
            in perfect condition, free from creases where possible.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Collection in person</h2>
          <p>
            You are also welcome to collect your saree directly from our shop.
            Please contact us on WhatsApp first to confirm availability and arrange
            a convenient time.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-brand-plum mb-3">Shipping charges</h2>
          <p className="bg-yellow-200/50 text-brand-plum px-2 py-1 rounded inline-block">
            [Fill in: free above a certain order value, flat rate, or charged
            at actuals — whatever your real policy is]
          </p>
        </section>
      </div>
    </div>
  );
}
