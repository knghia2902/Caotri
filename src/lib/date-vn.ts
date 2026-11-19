/**
 * Tiện ích ngày giờ chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh, UTC+7 cố định, không DST).
 */

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh";
export const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export type FinancePeriod = "day" | "week" | "month";

export interface PeriodBucket {
  key: string; // "YYYY-MM-DD"
  label: string; // "DD/MM"
  start: Date;
  end: Date;
}

export interface PeriodRange {
  period: FinancePeriod;
  anchorKey: string;
  start: Date;
  end: Date;
  startKey: string;
  endKey: string;
  label: string;
  prevAnchorKey: string;
  nextAnchorKey: string;
  buckets: PeriodBucket[];
}

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DAYS_OF_WEEK_VI = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function isValidDateKey(value?: string | null): value is string {
  if (!value || !DATE_KEY_REGEX.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * Trả về chuỗi "YYYY-MM-DD" theo múi giờ Việt Nam (UTC+7)
 */
export function getVnDateKey(date: Date | string | number = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  const vn = new Date(d.getTime() + VN_OFFSET_MS);
  return `${vn.getUTCFullYear()}-${pad2(vn.getUTCMonth() + 1)}-${pad2(vn.getUTCDate())}`;
}

export function parseVnDateKey(dateKey: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

/**
 * 00:00:00.000 giờ Việt Nam (UTC+7) biểu diễn bằng UTC Date
 */
export function vnStartOfDay(dateKey: string): Date {
  const { year, month, day } = parseVnDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - VN_OFFSET_MS);
}

/**
 * 23:59:59.999 giờ Việt Nam (UTC+7) biểu diễn bằng UTC Date
 */
export function vnEndOfDay(dateKey: string): Date {
  const { year, month, day } = parseVnDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - VN_OFFSET_MS);
}

/**
 * Cộng/trừ số ngày trên dateKey ("YYYY-MM-DD")
 */
export function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const { year, month, day } = parseVnDateKey(dateKey);
  const dt = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

/**
 * Trả về thứ trong tuần theo giờ VN: 0 = Chủ Nhật, 1 = Thứ 2, ..., 6 = Thứ 7
 */
export function getVnDayOfWeek(dateKey: string): number {
  const { year, month, day } = parseVnDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getVnDayOfWeekLabel(dateKey: string, todayKey?: string): string {
  const currentToday = todayKey ?? getVnDateKey();
  if (dateKey === currentToday) return "Hôm nay";
  return DAYS_OF_WEEK_VI[getVnDayOfWeek(dateKey)];
}

export function formatVnShortDate(dateKey: string): string {
  const { month, day } = parseVnDateKey(dateKey);
  return `${pad2(day)}/${pad2(month)}`;
}

export function formatVnFullDate(dateKey: string): string {
  const { year, month, day } = parseVnDateKey(dateKey);
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

function buildDailyBuckets(startKey: string, count: number): PeriodBucket[] {
  const buckets: PeriodBucket[] = [];
  for (let i = 0; i < count; i++) {
    const key = addDaysToDateKey(startKey, i);
    buckets.push({
      key,
      label: formatVnShortDate(key),
      start: vnStartOfDay(key),
      end: vnEndOfDay(key),
    });
  }
  return buckets;
}

/**
 * Tính khoảng thời gian phân tích theo Ngày / Tuần (Thứ 2 - Chủ Nhật) / Tháng theo giờ VN (UTC+7).
 * - day: trả về phạm vi 1 ngày + 7 bucket ngày gần nhất kết thúc ở anchorDateKey để vẽ biểu đồ xu hướng.
 * - week: Thứ 2 -> Chủ Nhật + 7 bucket ngày.
 * - month: ngày 1 -> ngày cuối tháng + toàn bộ bucket ngày trong tháng.
 */
export function getPeriodRange(
  period: FinancePeriod,
  anchorDateKey?: string
): PeriodRange {
  const anchorKey = isValidDateKey(anchorDateKey)
    ? anchorDateKey
    : getVnDateKey(new Date());

  if (period === "day") {
    const startKey = anchorKey;
    const endKey = anchorKey;
    const rollingStartKey = addDaysToDateKey(anchorKey, -6);

    return {
      period: "day",
      anchorKey,
      start: vnStartOfDay(startKey),
      end: vnEndOfDay(endKey),
      startKey,
      endKey,
      label: `Ngày ${formatVnFullDate(anchorKey)}`,
      prevAnchorKey: addDaysToDateKey(anchorKey, -1),
      nextAnchorKey: addDaysToDateKey(anchorKey, 1),
      buckets: buildDailyBuckets(rollingStartKey, 7),
    };
  }

  if (period === "week") {
    const dow = getVnDayOfWeek(anchorKey); // 0 = CN, 1 = T2 ... 6 = T7
    const daysSinceMonday = dow === 0 ? 6 : dow - 1;
    const startKey = addDaysToDateKey(anchorKey, -daysSinceMonday);
    const endKey = addDaysToDateKey(startKey, 6);

    return {
      period: "week",
      anchorKey: startKey,
      start: vnStartOfDay(startKey),
      end: vnEndOfDay(endKey),
      startKey,
      endKey,
      label: `Tuần ${formatVnShortDate(startKey)} - ${formatVnFullDate(endKey)}`,
      prevAnchorKey: addDaysToDateKey(startKey, -7),
      nextAnchorKey: addDaysToDateKey(startKey, 7),
      buckets: buildDailyBuckets(startKey, 7),
    };
  }

  // period === "month"
  const { year, month } = parseVnDateKey(anchorKey);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startKey = `${year}-${pad2(month)}-01`;
  const endKey = `${year}-${pad2(month)}-${pad2(daysInMonth)}`;

  const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
  const prevAnchorKey = `${prevMonthDate.getUTCFullYear()}-${pad2(prevMonthDate.getUTCMonth() + 1)}-01`;

  const nextMonthDate = new Date(Date.UTC(year, month, 1));
  const nextAnchorKey = `${nextMonthDate.getUTCFullYear()}-${pad2(nextMonthDate.getUTCMonth() + 1)}-01`;

  return {
    period: "month",
    anchorKey: startKey,
    start: vnStartOfDay(startKey),
    end: vnEndOfDay(endKey),
    startKey,
    endKey,
    label: `Tháng ${pad2(month)}/${year}`,
    prevAnchorKey,
    nextAnchorKey,
    buckets: buildDailyBuckets(startKey, daysInMonth),
  };
}
