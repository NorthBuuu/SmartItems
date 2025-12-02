/**
 * 数据存储模块
 */
import { calculateDaysBetween, calculatePurchaseDate, calculateDailyCost, generateId, formatDate } from './utils.js';

/**
 * 物品存储类
 */
class ItemStore {
    constructor() {
        this.storageKey = 'smart-items-data';
    }

    /**
     * 从localStorage获取所有物品数据
     * @returns {Item[]} 物品数组
     */
    getAll() {
        try {
            const itemsJson = localStorage.getItem(this.storageKey);
            if (!itemsJson) {
                return [];
            }
            
            const items = JSON.parse(itemsJson);
            // 将字符串日期转换回Date对象
            return items.map(item => ({
                ...item,
                purchaseDate: new Date(item.purchaseDate),
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt)
            })).sort((a, b) => b.updatedAt - a.updatedAt); // 按更新时间倒序排序
        } catch (error) {
            console.error('Error loading items from storage:', error);
            return [];
        }
    }

    /**
     * 保存物品数据到localStorage
     * @param {Item[]} items - 物品数组
     */
    _saveItems(items) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving items to storage:', error);
            throw new Error('无法保存数据到本地存储');
        }
    }

    /**
     * 添加新物品
     * @param {Object} itemData - 物品数据
     * @param {string} itemData.name - 物品名称
     * @param {number} itemData.price - 物品价格
     * @param {Date} itemData.purchaseDate - 购入日期
     * @returns {Item} 创建的物品
     */
    add(itemData) {
        const items = this.getAll();
        const now = new Date();
        const daysUsed = calculateDaysBetween(itemData.purchaseDate, now);
        const dailyCost = calculateDailyCost(itemData.price, daysUsed);

        const newItem = {
            id: generateId(),
            name: itemData.name,
            price: itemData.price,
            purchaseDate: itemData.purchaseDate,
            daysUsed: daysUsed,
            dailyCost: dailyCost,
            createdAt: now,
            updatedAt: now
        };

        items.unshift(newItem); // 添加到数组开头
        this._saveItems(items);
        return newItem;
    }

    /**
     * 更新物品
     * @param {string} id - 物品ID
     * @param {Object} itemData - 更新的物品数据
     * @param {string} itemData.name - 物品名称
     * @param {number} itemData.price - 物品价格
     * @param {Date} itemData.purchaseDate - 购入日期
     * @returns {Item|null} 更新后的物品，如果找不到则返回null
     */
    update(id, itemData) {
        const items = this.getAll();
        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
            return null;
        }

        const now = new Date();
        const daysUsed = calculateDaysBetween(itemData.purchaseDate, now);
        const dailyCost = calculateDailyCost(itemData.price, daysUsed);

        const updatedItem = {
            ...items[index],
            name: itemData.name,
            price: itemData.price,
            purchaseDate: itemData.purchaseDate,
            daysUsed: daysUsed,
            dailyCost: dailyCost,
            updatedAt: now
        };

        items[index] = updatedItem;
        this._saveItems(items);
        return updatedItem;
    }

    /**
     * 删除物品
     * @param {string} id - 物品ID
     * @returns {boolean} 是否删除成功
     */
    delete(id) {
        const items = this.getAll();
        const initialLength = items.length;
        const filteredItems = items.filter(item => item.id !== id);
        
        if (filteredItems.length === initialLength) {
            return false; // 没有找到要删除的物品
        }

        this._saveItems(filteredItems);
        return true;
    }

    /**
     * 根据ID获取物品
     * @param {string} id - 物品ID
     * @returns {Item|null} 物品对象，如果找不到则返回null
     */
    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id) || null;
    }

    /**
     * 清空所有物品
     */
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error clearing items from storage:', error);
            throw new Error('无法清空本地存储');
        }
    }
}

// 创建并导出单例实例
export const itemStore = new ItemStore();