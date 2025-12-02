/**
 * 工具函数模块
 */

/**
 * 计算两个日期之间的天数差
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {number} 天数差
 */
export function calculateDaysBetween(startDate, endDate) {
    // 转换为时间戳（毫秒）并计算差值
    const diffTime = Math.abs(endDate - startDate);
    // 转换为天数并取整
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 根据已用天数计算购入日期
 * @param {number} daysUsed - 已用天数
 * @returns {Date} 计算得出的购入日期
 */
export function calculatePurchaseDate(daysUsed) {
    const date = new Date();
    date.setDate(date.getDate() - daysUsed);
    return date;
}

/**
 * 格式化价格为人民币显示格式
 * @param {number} price - 价格
 * @returns {string} 格式化后的价格字符串
 */
export function formatPrice(price) {
    return price.toFixed(2);
}

/**
 * 格式化日期为本地日期字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
export function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID字符串
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 计算每日使用成本
 * @param {number} price - 物品价格
 * @param {number} daysUsed - 已使用天数
 * @returns {number} 每日使用成本
 */
export function calculateDailyCost(price, daysUsed) {
    // 避免除以0
    return daysUsed > 0 ? price / daysUsed : 0;
}

/**
 * 格式化每日成本显示
 * @param {number} dailyCost - 每日成本
 * @returns {string} 格式化后的每日成本
 */
export function formatDailyCost(dailyCost) {
    // 如果每日成本小于0.01，则显示为0.01
    return dailyCost < 0.01 ? '0.01' : dailyCost.toFixed(2);
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD格式）
 * @returns {string} 今天的日期字符串
 */
export function getTodayDateString() {
    return formatDate(new Date());
}