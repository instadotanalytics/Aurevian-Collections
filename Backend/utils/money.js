// backend/utils/money.js
//
// This project stores monetary amounts as plain rupee Numbers everywhere
// (Order.itemsTotal, JewelleryProduct.pricing.originalPrice, etc — never
// paise). To stay consistent with that convention we keep storage in
// rupees, but every commission calculation is done internally in integer
// paise and converted back, so repeated 10%-of-10%-of... style floating
// point errors never accumulate into wrong ledger numbers.

export const toPaise = (rupees) => Math.round((Number(rupees) || 0) * 100);
export const toRupees = (paise) => Math.round(paise) / 100;

/**
 * Splits a gross rupee amount into platform commission + seller net,
 * using integer-paise math so results are always exact to the paisa.
 * @param {number} grossAmountRupees
 * @param {number} commissionPercent - e.g. 10 for 10%
 */
export function calculateCommissionSplit(grossAmountRupees, commissionPercent) {
  const grossPaise = toPaise(grossAmountRupees);
  const pct = Number(commissionPercent) || 0;
  const commissionPaise = Math.round((grossPaise * pct) / 100);
  const netPaise = grossPaise - commissionPaise;
  return {
    grossAmount: toRupees(grossPaise),
    commissionAmount: toRupees(commissionPaise),
    sellerNetAmount: toRupees(netPaise),
  };
}

export const formatINR = (rupees) =>
  `₹${(Number(rupees) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
