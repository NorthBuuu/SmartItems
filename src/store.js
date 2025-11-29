/**
 * 本地存储管理
 */
import { Item } from './types';

const STORAGE_KEY = 'smart_items';

/**
 * 获取所有物品
 * @returns {Item[]} 物品列表
 */
export function getItems(): Item[] {
  try {
    const itemsJson = localStorage.getItem(STORAGE_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error('Failed to get items from localStorage:', error);
    return [];
  }
}

/**
 * 保存物品
 * @param {Item} item - 物品对象
 * @returns {Item} 保存后的物品对象
 */
export function saveItem(item: Item): Item {
  try {
    const items = getItems();
    const existingIndex = items.findIndex(i => i.id === item.id);
    
    if (existingIndex >= 0) {
      // 更新现有物品
      items[existingIndex] = item;
    } else {
      // 添加新物品
      items.push(item);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return item;
  } catch (error) {
    console.error('Failed to save item to localStorage:', error);
    throw error;
  }
}

/**
 * 删除物品
 * @param {string} id - 物品ID
 * @returns {boolean} 删除是否成功
 */
export function deleteItem(id: string): boolean {
  try {
    const items = getItems();
    const newItems = items.filter(item => item.id !== id);
    
    if (newItems.length === items.length) {
      return false; // 未找到物品
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    return true;
  } catch (error) {
    console.error('Failed to delete item from localStorage:', error);
    return false;
  }
}

/**
 * 清空所有物品
 */
export function clearItems(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear items from localStorage:', error);
  }
}