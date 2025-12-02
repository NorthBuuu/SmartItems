/**
 * 物品数据接口
 * @typedef {Object} Item
 * @property {string} id - 物品唯一标识符
 * @property {string} name - 物品名称
 * @property {number} price - 物品价格
 * @property {Date} purchaseDate - 购入日期
 * @property {number} daysUsed - 已使用天数
 * @property {number} dailyCost - 每日使用成本
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */

/**
 * 物品存储接口
 * @typedef {Object} ItemStore
 * @property {function(): Item[]} getAll - 获取所有物品
 * @property {function(Item): void} add - 添加物品
 * @property {function(string, Item): void} update - 更新物品
 * @property {function(string): void} delete - 删除物品
 * @property {function(string): Item|null} getById - 根据ID获取物品
 */

/**
 * 表单数据接口
 * @typedef {Object} ItemFormData
 * @property {string} name - 物品名称
 * @property {number} price - 物品价格
 * @property {string} dateType - 日期输入类型 ('date' 或 'days')
 * @property {string} purchaseDate - 购入日期字符串
 * @property {number} daysUsed - 已用天数
 */

/**
 * 导出类型定义
 */
// 这些注释仅用于提供类型信息，不实际导出任何内容
// 在JavaScript中，我们使用JSDoc来提供类型提示