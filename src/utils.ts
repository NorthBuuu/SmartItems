/**
 * 生成唯一ID
 * @returns {string} 唯一ID字符串
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 计算两个日期之间的天数差
 * @param {string} startDate - 开始日期 (ISO 字符串)
 * @param {string} endDate - 结束日期 (ISO 字符串，默认当前日期)
 * @returns {number} 天数差
 */
export function calculateDaysBetween(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  // 重置时间为00:00:00以确保准确的天数计算
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * 格式化日期为YYYY-MM-DD
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 根据购入天数计算购入日期
 * @param {number} days - 购入天数
 * @returns {string} 购入日期 (ISO 字符串)
 */
export function getPurchaseDateFromDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

/**
 * 计算每天使用成本
 * @param {number} price - 物品价格
 * @param {string} purchaseDate - 购入日期
 * @returns {number} 每天使用成本 (保留两位小数)
 */
export function calculateDailyCost(price: number, purchaseDate: string): number {
  const daysUsed = calculateDaysBetween(purchaseDate);
  if (daysUsed <= 0) return 0;
  return parseFloat((price / daysUsed).toFixed(2));
}