export interface Restaurant {
  id: string;
  name: string;
  category: string;
  address: string;
  district: string;
  imageUrl?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
}
