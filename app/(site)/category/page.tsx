import Link from "next/link";
import { Gem, Heart, Leaf, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

const categoryIcons: Record<string, React.ElementType> = {
  kanjivaram: Sparkles,
  banarasi: Gem,
  cotton: Leaf,
  "wedding-edit": Heart,
};

export default async function CategoryIndexPage() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-3xl text-brand-plum text-center sm:text-4xl mb-8">
        Shop by Category
      </h1>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(categories || []).map(({ name, slug }) => {
          const Icon = categoryIcons[slug] || Sparkles;
          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="flex flex-col items-center rounded-lg border border-brand-blushDark bg-brand-white px-4 py-8 transition-shadow hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-brand-mauve" strokeWidth={1.5} />
              <span className="mt-4 text-center text-base font-medium text-brand-plum">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
