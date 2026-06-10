export const CURRENCY = "Rs.";

export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `${CURRENCY} ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
