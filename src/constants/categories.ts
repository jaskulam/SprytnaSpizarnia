import { ProductCategory } from '../types/models';

export const PRODUCT_CATEGORIES: Record<ProductCategory, {
  name: string;
  icon: string;
  color: string;
  defaultLocation: string;
  averageFreshnessDays: number;
}> = {
  'Nabiał': {
    name: 'Nabiał',
    icon: 'cow',
    color: '#FFF3E0',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 7,
  },
  'Mięso i ryby': {
    name: 'Mięso i ryby',
    icon: 'fish',
    color: '#FFEBEE',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 3,
  },
  'Warzywa i owoce': {
    name: 'Warzywa i owoce',
    icon: 'carrot',
    color: '#E8F5E9',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 5,
  },
  'Pieczywo': {
    name: 'Pieczywo',
    icon: 'bread-slice',
    color: '#EFEBE9',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 3,
  },
  'Przyprawy': {
    name: 'Przyprawy',
    icon: 'spice-rack',
    color: '#F3E5F5',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 365,
  },
  'Napoje': {
    name: 'Napoje',
    icon: 'bottle-wine',
    color: '#E1F5FE',
    defaultLocation: 'Lodówka',
    averageFreshnessDays: 30,
  },
  'Słodycze': {
    name: 'Słodycze',
    icon: 'candy',
    color: '#FFF9C4',
    defaultLocation: 'Kuchnia',
    averageFreshnessDays: 30,
  },
  'Konserwy': {
    name: 'Konserwy',
    icon: 'can',
    color: '#EFEBE9',
    defaultLocation: 'Spiżarnia',
    averageFreshnessDays: 180,
  },
  'Mrożonki': {
    name: 'Mrożonki',
    icon: 'snowflake',
    color: '#E3F2FD',
    defaultLocation: 'Zamrażarka',
    averageFreshnessDays: 90,
  },
  'Kosmetyki': {
    name: 'Kosmetyki',
    icon: 'lipstick',
    color: '#FCE4EC',
    defaultLocation: 'Łazienka',
    averageFreshnessDays: 365,
  },
  'Środki czystości': {
    name: 'Środki czystości',
    icon: 'spray-bottle',
    color: '#F5F5F5',
    defaultLocation: 'Łazienka',
    averageFreshnessDays: 730,
  },
  'Leki': {
    name: 'Leki',
    icon: 'pill',
    color: '#E8F5E9',
    defaultLocation: 'Łazienka',
    averageFreshnessDays: 365,
  },
  'Inne': {
    name: 'Inne',
    icon: 'package-variant',
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
  { name: 'Mleko', category: 'Nabiał', unit: 'l' },
  { name: 'Chleb', category: 'Pieczywo', unit: 'pcs' },
  { name: 'Jajka', category: 'Nabiał', unit: 'pcs' },
  { name: 'Masło', category: 'Nabiał', unit: 'g' },
  { name: 'Ser żółty', category: 'Nabiał', unit: 'g' },
  { name: 'Pomidory', category: 'Warzywa i owoce', unit: 'kg' },
  { name: 'Ziemniaki', category: 'Warzywa i owoce', unit: 'kg' },
  { name: 'Jabłka', category: 'Warzywa i owoce', unit: 'kg' },
  { name: 'Banany', category: 'Warzywa i owoce', unit: 'kg' },
  { name: 'Kurczak', category: 'Mięso i ryby', unit: 'kg' },
];
