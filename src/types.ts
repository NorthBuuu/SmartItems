/**
 * 物品数据类型定义
 */
export interface Item {
  /** 唯一标识符 */
  id: string;
  /** 物品名称 */
  name: string;
  /** 物品价格 (元) */
  price: number;
  /** 购入日期 (ISO 日期字符串) */
  purchaseDate: string;
  /** 创建时间 (ISO 日期字符串) */
  createdAt: string;
  /** 更新时间 (ISO 日期字符串) */
  updatedAt: string;
}

/**
 * 表单数据类型定义
 */
export interface ItemFormData {
  /** 物品名称 */
  name: string;
  /** 物品价格 (元) */
  price: number;
  /** 购入日期 (ISO 日期字符串 或 空) */
  purchaseDate?: string;
  /** 购入天数 (可选) */
  purchaseDays?: number;
}