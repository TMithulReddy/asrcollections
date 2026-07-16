import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | ASR Collections",
  description: "Learn about ASR Collections, our heritage, and our curated collection of premium sarees.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="font-heading text-3xl text-brand-plum md:text-4xl mb-8">
        About ASR Collections
      </h1>
      
      <div className="prose prose-brand text-brand-plum/80 space-y-6">
        <p>
          ASR Collections is a family-run saree boutique bringing you handpicked
          silk and cotton sarees — pieces chosen for their craftsmanship, not
          their quantity. Every saree in our collection is selected personally,
          which means when you find something you love here, it is truly one of
          a kind.
        </p>

        <p>
          We carry Kanchipuram silks, Banarasi weaves, lightweight cottons, and
          curated wedding collections — each photographed exactly as it is, with
          no filters or alterations, so what you see is genuinely what you receive.
        </p>

        <p>
          We believe buying a saree should feel personal, not transactional.
          That is why every order goes directly through WhatsApp — so you can ask
          questions, see more angles, and feel confident before your piece is
          confirmed.
        </p>

        <div className="mt-10 p-6 bg-brand-blush rounded-lg border border-brand-blushDark">
          <p className="font-medium text-brand-plum m-0">
            For any questions, reach us directly on WhatsApp — the number is on
            every product page.
          </p>
        </div>
      </div>
    </div>
  );
}
