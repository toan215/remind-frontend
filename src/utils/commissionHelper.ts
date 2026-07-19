export const COMMISSION_RATE_KEY = "remind_admin_commission_rate";
export const COMMISSION_RATE_EVENT = "remind_commission_rate_updated";

export const getStoredCommissionRate = (): number => {
  if (typeof window === "undefined") return 15;
  const val = localStorage.getItem(COMMISSION_RATE_KEY);
  if (!val) return 15;
  const parsed = Number(val);
  return isNaN(parsed) || parsed < 0 ? 15 : parsed;
};

export const setStoredCommissionRate = (rate: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMISSION_RATE_KEY, String(rate));
  window.dispatchEvent(new CustomEvent(COMMISSION_RATE_EVENT, { detail: rate }));
};
