import { Product } from '../types/models';
import { PRODUCT_UNITS, getUnitDisplay } from '../constants/units';
import {
	getDaysUntilExpiry as baseGetDaysUntilExpiry,
	getExpiryColor,
	getExpiryMessage as baseGetExpiryMessage,
} from './dateHelpers';

// Re-export to keep imports stable across the app
export const getDaysUntilExpiry = (expiryDate?: Date) => baseGetDaysUntilExpiry(expiryDate);

export const getFreshnessColor = (expiryDate?: Date): string => {
	return getExpiryColor(expiryDate);
};

export const getExpiryMessage = (expiryDate?: Date): string => {
	return baseGetExpiryMessage(expiryDate);
};

// Formats quantity and optional unit into a compact display string
export const formatProductQuantity = (
	quantity?: string | number,
	unit?: string,
): string => {
	if (quantity === undefined && !unit) return '';

	const qtyNum = typeof quantity === 'string' ? Number(quantity.replace(',', '.')) : quantity;

	// If unit matches our known units, use their abbreviations; otherwise fall back to raw unit
	if (unit && (unit in PRODUCT_UNITS)) {
		const q = Number.isFinite(qtyNum) && (qtyNum as number) > 0 ? (qtyNum as number) : 1;
		const abbr = getUnitDisplay(unit as keyof typeof PRODUCT_UNITS, q);
		return quantity ? `${quantity} ${abbr}` : abbr;
	}

	// If unit is unknown string, just concatenate
	if (unit) {
		return quantity ? `${quantity} ${unit}` : unit;
	}

	// No unit, just return quantity as string
	return quantity !== undefined ? String(quantity) : '';
};

// Returns products that will expire within thresholdDays (including today), excluding already expired
export const getExpiringProducts = (products: Product[], thresholdDays = 3): Product[] => {
	return products
		.filter((p) => {
			const days = baseGetDaysUntilExpiry(p.expiryDate);
			return days >= 0 && days <= thresholdDays;
		})
		.sort((a, b) => baseGetDaysUntilExpiry(a.expiryDate) - baseGetDaysUntilExpiry(b.expiryDate));
};

