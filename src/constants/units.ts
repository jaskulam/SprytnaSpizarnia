import { ProductUnit } from '../types/models';

export const PRODUCT_UNITS: Record<ProductUnit, {
  name: string;
  namePlural: string;
  abbreviation: string;
  type: 'count' | 'weight' | 'volume' | 'package';
}> = {
  pcs: {
    name: 'sztuka',
    namePlural: 'sztuki',
    abbreviation: 'szt.',
    type: 'count',
  },
  kg: {
    name: 'kilogram',
    namePlural: 'kilogramy',
    abbreviation: 'kg',
    type: 'weight',
  },
  g: {
    name: 'gram',
    namePlural: 'gramy',
    abbreviation: 'g',
    type: 'weight',
  },
  l: {
    name: 'litr',
    namePlural: 'litry',
    abbreviation: 'l',
    type: 'volume',
  },
  ml: {
    name: 'mililitr',
    namePlural: 'mililitry',
    abbreviation: 'ml',
    type: 'volume',
  },
  pack: {
    name: 'opakowanie',
    namePlural: 'opakowania',
    abbreviation: 'op.',
    type: 'package',
  },
  bottle: {
    name: 'butelka',
    namePlural: 'butelki',
    abbreviation: 'but.',
    type: 'package',
  },
  can: {
    name: 'puszka',
    namePlural: 'puszki',
    abbreviation: 'pusz.',
    type: 'package',
  },
  jar: {
    name: 'słoik',
    namePlural: 'słoiki',
    abbreviation: 'sł.',
    type: 'package',
  },
  box: {
    name: 'pudełko',
    namePlural: 'pudełka',
    abbreviation: 'pud.',
    type: 'package',
  },
  bag: {
    name: 'torebka',
    namePlural: 'torebki',
    abbreviation: 'tor.',
    type: 'package',
  },
};

export const getUnitDisplay = (unit: ProductUnit, quantity: number): string => {
  const unitInfo = PRODUCT_UNITS[unit];
  if (quantity === 1) {
    return unitInfo.abbreviation;
  } else {
    return unitInfo.abbreviation;
  }
};

export const UNIT_CONVERSIONS: Record<string, {
  to: ProductUnit;
  factor: number;
}> = {
  'kg_to_g': { to: 'g', factor: 1000 },
  'g_to_kg': { to: 'kg', factor: 0.001 },
  'l_to_ml': { to: 'ml', factor: 1000 },
  'ml_to_l': { to: 'l', factor: 0.001 },
};
