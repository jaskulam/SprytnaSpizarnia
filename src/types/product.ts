export type ProductLocation = 
  | 'Lodówka' 
  | 'Spiżarnia' 
  | 'Kuchnia' 
  | 'Piwnica' 
  | 'Szafka z przyprawami'
  | string; // Custom location for PRO users

export interface Product {
  id: string;
  name: string;
  quantity: string;
  expiryDate: Date;
  location: ProductLocation;
  ownerId: string;
  createdAt: Date;
  barcode?: string;
  brand?: string;
  category?: string;
  notes?: string;
  imageUrl?: string;
  sharedWith?: string[]; // Family member IDs
}

export interface ProductFormData {
  name: string;
  quantity: string;
  expiryDate: string;
  location: ProductLocation;
  notes?: string;
}
