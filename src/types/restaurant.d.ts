export interface Restaurant {
  id: string;
  name: string;
  category: string;
  address?: string | null;
  district?: string | null;
  imageUrl?: string;
  description?: string | null;
}

export interface Category {
  id: string;
  name: string;
}
