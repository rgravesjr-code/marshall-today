import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// TypeScript types matching our database schema
// ============================================================

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  display_order: number;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  google_business_url: string | null;
  facebook_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  is_claimed: boolean;
  is_featured: boolean;
  is_published: boolean;
  plan_tier: 'free' | 'spotlight' | 'ultimate';
  hours: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  // Joined data
  categories?: Category[];
};

export type BusinessWithCategories = Business & {
  business_categories: {
    categories: Category;
  }[];
};

export type Claim = {
  id: string;
  business_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
  message: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
};

// ============================================================
// Data fetching helpers
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

export async function getBusinesses(options?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}): Promise<Business[]> {
  let query = supabase
    .from('businesses')
    .select(`
      *,
      business_categories (
        categories (*)
      )
    `)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('name');

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,description.ilike.%${options.search}%,short_description.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  // Flatten categories from join
  return (data || []).map((b: any) => ({
    ...b,
    categories: b.business_categories?.map((bc: any) => bc.categories).filter(Boolean) || [],
  }));
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      business_categories (
        categories (*)
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching business:', error);
    return null;
  }

  return {
    ...data,
    categories: data.business_categories?.map((bc: any) => bc.categories).filter(Boolean) || [],
  };
}

export async function getBusinessesByCategory(categorySlug: string): Promise<Business[]> {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  const { data, error } = await supabase
    .from('business_categories')
    .select(`
      businesses (
        *,
        business_categories (
          categories (*)
        )
      )
    `)
    .eq('category_id', category.id);

  if (error) {
    console.error('Error fetching businesses by category:', error);
    return [];
  }

  return (data || [])
    .map((bc: any) => bc.businesses)
    .filter(Boolean)
    .filter((b: any) => b.is_published)
    .map((b: any) => ({
      ...b,
      categories: b.business_categories?.map((bc: any) => bc.categories).filter(Boolean) || [],
    }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function submitClaim(claim: {
  business_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  message?: string;
}): Promise<boolean> {
  const { error } = await supabase.from('claims').insert(claim);
  return !error;
}

export async function submitBusiness(business: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  category_ids?: string[];
}): Promise<boolean> {
  const slug = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      name: business.name,
      slug: slug + '-' + Date.now().toString(36),
      description: business.description,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website,
      is_published: false, // needs admin approval
    })
    .select()
    .single();

  if (error || !data) return false;

  // Link categories
  if (business.category_ids?.length) {
    await supabase.from('business_categories').insert(
      business.category_ids.map((cid) => ({
        business_id: data.id,
        category_id: cid,
      }))
    );
  }

  return true;
}
