export interface Restaurant {
  id: number;
  name: string;
  category: string;
  address: string;
  district: string;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
}
