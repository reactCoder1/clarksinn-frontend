const COUPON_PDF_SIZE_KEY = "couponPdfSize";

const DEFAULT_PDF_SIZE = {
  widthIn: 200,
  heightIn: 50,
};

const toValidSize = (value, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }
  return number;
};

export const readCouponPdfSize = () => {
  if (typeof window === "undefined") {
    return DEFAULT_PDF_SIZE;
  }

  try {
    const raw = window.localStorage.getItem(COUPON_PDF_SIZE_KEY);
    if (!raw) {
      return DEFAULT_PDF_SIZE;
    }
    const parsed = JSON.parse(raw);
    return {
      widthIn: toValidSize(parsed?.widthIn, DEFAULT_PDF_SIZE.widthIn),
      heightIn: toValidSize(parsed?.heightIn, DEFAULT_PDF_SIZE.heightIn),
    };
  } catch {
    return DEFAULT_PDF_SIZE;
  }
};

export const writeCouponPdfSize = ({ widthIn, heightIn }) => {
  if (typeof window === "undefined") {
    return;
  }

  const safeSize = {
    widthIn: toValidSize(widthIn, DEFAULT_PDF_SIZE.widthIn),
    heightIn: toValidSize(heightIn, DEFAULT_PDF_SIZE.heightIn),
  };

  window.localStorage.setItem(COUPON_PDF_SIZE_KEY, JSON.stringify(safeSize));
};
