import { ProductCategory } from '../types/models';

export const PRODUCT_CATEGORIES: Record<ProductCategory, {
  name: string;
  icon: string;
  color: string;
  defaultLocation: string;
  averageFreshnessDays: number;
}> = {
  dairy: {
    name: 'Nabiał',
    icon: 'cheese',
    color: '#FFF3E0',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 7,
  },
  meat: {
    name: 'Mięso',
    icon: 'food-steak',
    color: '#FFEBEE',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 3,
  },
  vegetables: {
    name: 'Warzywa',
    icon: 'carrot',
    color: '#E8F5E9',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 5,
  },
  fruits: {
    name: 'Owoce',
    icon: 'food-apple',
    color: '#FFF8E1',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 5,
  },
  bakery: {
    name: 'Pieczywo',
    icon: 'bread-slice',
    color: '#EFEBE9',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 3,
  },
  pantry: {
    name: 'Spiżarnia',
    icon: 'pasta',
    color: '#F3E5F5',
    defaultLocation: 'Spiżarnia',
    averageFreshnessDays: 180,
  },
  beverages: {
    name: 'Napoje',
    icon: 'bottle-soda',
    color: '#E1F5FE',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 30,
  },
  frozen: {
    name: 'Mrożonki',
    icon: 'snowflake',
    color: '#E3F2FD',
    defaultLocation: 'Zamrażarka',
    averageFreshnessDays: 90,
  },
  condiments: {
    name: 'Przyprawy',
    icon: 'shaker',
    color: '#FCE4EC',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 365,
  },
  snacks: {
    name: 'Przekąski',
    icon: 'cookie',
    color: '#FFF9C4',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 30,
  },
  household: {
    name: 'Art. gospodarcze',
    icon: 'spray-bottle',
    color: '#F5F5F5',
    defaultLocation: 'Łazienka',
    averageFreshnessDays: 730,
  },
  other: {
    name: 'Inne',
    icon: 'dots-horizontal',
    color: '#EEEEEE',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 30,
  },
};

export const STORAGE_LOCATIONS = [
  'Lodówka',
  'Zamrażarka',
  'Spiżarnia',
  'Kuchnia',
  'Szafka',
  'Piwnica',
  'Łazienka',
  'Garaż',
  'Szafka z przyprawami',
  'Inne',
];

export const QUICK_ADD_SUGGESTIONS = [
  { name: 'Mleko', category: 'dairy', unit: 'l' },
  { name: 'Chleb', category: 'bakery', unit: 'pcs' },
  { name: 'Jajka', category: 'dairy', unit: 'pcs' },
  { name: 'Masło', category: 'dairy', unit: 'g' },
  { name: 'Ser żółty', category: 'dairy', unit: 'g' },
  { name: 'Pomidory', category: 'vegetables', unit: 'kg' },
  { name: 'Ziemniaki', category: 'vegetables', unit: 'kg' },
  { name: 'Jabłka', category: 'fruits', unit: 'kg' },
  { name: 'Banany', category: 'fruits', unit: 'kg' },
  { name: 'Kurczak', category: 'meat', unit: 'kg' },
];
