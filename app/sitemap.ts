import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Determine base URL, fallback to https://asrcollections.in
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asrcollections.in';

  // Fetch products and categories
  const { data: products } = await supabase.from('products').select('slug, updated_at, created_at');
  const { data: categories } = await supabase.from('categories').select('slug, created_at');

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : (product.created_at ? new Date(product.created_at) : new Date()),
    priority: 0.8,
  }));

  const categoryUrls = (categories || []).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.created_at ? new Date(category.created_at) : new Date(),
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseUrl}/sarees`,
      lastModified: new Date(),
      priority: 0.9,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
