// 类型定义
/**
 * @typedef {Object} Item
 * @property {string} id - 物品唯一标识符
 * @property {string} name - 物品名称
 * @property {number} price - 物品价格
 * @property {Date} purchaseDate - 购入日期
 * @property {number} daysUsed - 使用天数
 * @property {number} dailyCost - 每日使用成本
 */

// 工具函数
const utils = {
    /**
     * 生成唯一标识符
     * @returns {string}
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * 计算从购入日期到今天的天数
     * @param {Date} purchaseDate - 购入日期
     * @returns {number}
     */
    calculateDaysUsed: (purchaseDate) => {
        const today = new Date();
        const diffTime = Math.abs(today - purchaseDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * 计算每日使用成本
     * @param {number} price - 物品价格
     * @param {number} daysUsed - 使用天数
     * @returns {number}
     */
    calculateDailyCost: (price, daysUsed) => {
        return parseFloat((price / daysUsed).toFixed(2));
    },

    /**
     * 格式化日期为 YYYY-MM-DD
     * @param {Date} date - 日期对象
     * @returns {string}
     */
    formatDate: (date) => {
        return date.toISOString().split('T')[0];
    },

    /**
     * 从 YYYY-MM-DD 字符串创建日期对象
     * @param {string} dateString - 日期字符串
     * @returns {Date}
     */
    parseDate: (dateString) => {
        return new Date(dateString);
    }
};

// Store 数据管理
const store = {
    /**
     * 从本地存储获取物品列表
     * @returns {Item[]}
     */
    getItems: () => {
        const items = localStorage.getItem('smart-items');
        return items ? JSON.parse(items).map(item => ({
            ...item,
            purchaseDate: new Date(item.purchaseDate)
        })) : [];
    },

    /**
     * 保存物品列表到本地存储
     * @param {Item[]} items - 物品列表
     */
    saveItems: (items) => {
        localStorage.setItem('smart-items', JSON.stringify(items));
    },

    /**
     * 添加新物品
     * @param {Object} itemData - 物品数据
     * @param {string} itemData.name - 物品名称
     * @param {number} itemData.price - 物品价格
     * @param {Date} itemData.purchaseDate - 购入日期
     * @returns {Item}
     */
    addItem: (itemData) => {
        const items = store.getItems();
        const daysUsed = utils.calculateDaysUsed(itemData.purchaseDate);
        const dailyCost = utils.calculateDailyCost(itemData.price, daysUsed);

        const newItem = {
            id: utils.generateId(),
            name: itemData.name,
            price: itemData.price,
            purchaseDate: itemData.purchaseDate,
            daysUsed,
            dailyCost
        };

        items.push(newItem);
        store.saveItems(items);
        return newItem;
    },

    /**
     * 更新物品
     * @param {string} id - 物品 ID
     * @param {Object} itemData - 新的物品数据
     * @returns {Item|null}
     */
    updateItem: (id, itemData) => {
        const items = store.getItems();
        const index = items.findIndex(item => item.id === id);

        if (index === -1) return null;

        const daysUsed = utils.calculateDaysUsed(itemData.purchaseDate);
        const dailyCost = utils.calculateDailyCost(itemData.price, daysUsed);

        const updatedItem = {
            ...items[index],
            ...itemData,
            daysUsed,
            dailyCost
        };

        items[index] = updatedItem;
        store.saveItems(items);
        return updatedItem;
    },

    /**
     * 删除物品
     * @param {string} id - 物品 ID
     * @returns {boolean}
     */
    deleteItem: (id) => {
        const items = store.getItems();
        const newItems = items.filter(item => item.id !== id);

        if (newItems.length === items.length) return false;

        store.saveItems(newItems);
        return true;
    }
};

// UI 组件
const ui = {
    /**
     * 初始化 UI
     */
    init: () => {
        ui.bindEvents();
        ui.renderItems();
    },

    /**
     * 绑定事件
     */
    bindEvents: () => {
        const form = document.getElementById('item-form');
        form.addEventListener('submit', ui.handleFormSubmit);

        // 购入日期和使用天数输入框的互斥逻辑
        const purchaseDateInput = document.getElementById('purchase-date');
        const purchaseDaysInput = document.getElementById('purchase-days');

        purchaseDateInput.addEventListener('input', () => {
            if (purchaseDateInput.value) {
                purchaseDaysInput.value = '';
            }
        });

        purchaseDaysInput.addEventListener('input', () => {
            if (purchaseDaysInput.value) {
                purchaseDateInput.value = '';
            }
        });
    },

    /**
     * 处理表单提交
     * @param {Event} e - 表单提交事件
     */
    handleFormSubmit: (e) => {
        e.preventDefault();

        const name = document.getElementById('item-name').value.trim();
        const price = parseFloat(document.getElementById('item-price').value);
        const purchaseDateInput = document.getElementById('purchase-date').value;
        const purchaseDaysInput = document.getElementById('purchase-days').value;

        let purchaseDate;

        if (purchaseDateInput) {
            purchaseDate = utils.parseDate(purchaseDateInput);
        } else if (purchaseDaysInput) {
            const days = parseInt(purchaseDaysInput);
            purchaseDate = new Date();
            purchaseDate.setDate(purchaseDate.getDate() - days);
        } else {
            alert('请选择购入日期或输入已使用天数');
            return;
        }

        // 添加物品
        const newItem = store.addItem({
            name,
            price,
            purchaseDate
        });

        // 重置表单
        e.target.reset();

        // 重新渲染物品列表
        ui.renderItems();
    },

    /**
     * 渲染物品列表
     */
    renderItems: () => {
        const itemsList = document.getElementById('items-list');
        const items = store.getItems();

        if (items.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <h3>暂无物品</h3>
                    <p>添加您的第一个物品来开始追踪每日使用成本</p>
                </div>
            `;
            return;
        }

        itemsList.innerHTML = items.map(item => ui.renderItem(item)).join('');

        // 绑定编辑和删除按钮事件
        items.forEach(item => {
            const editBtn = document.getElementById(`edit-${item.id}`);
            const deleteBtn = document.getElementById(`delete-${item.id}`);

            if (editBtn) {
                editBtn.addEventListener('click', () => ui.handleEditItem(item));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => ui.handleDeleteItem(item.id));
            }
        });
    },

    /**
     * 渲染单个物品卡片
     * @param {Item} item - 物品数据
     * @returns {string}
     */
    renderItem: (item) => {
        return `
            <div class="item-card" data-id="${item.id}">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">¥${item.price.toFixed(2)}</div>
                    <div class="item-days">已使用 ${item.daysUsed} 天</div>
                    <div class="item-daily-cost">¥${item.dailyCost}/天</div>
                </div>
                <div class="item-actions">
                    <button id="edit-${item.id}" class="btn-action btn-edit">编辑</button>
                    <button id="delete-${item.id}" class="btn-action btn-delete">删除</button>
                </div>
            </div>
        `;
    },

    /**
     * 处理编辑物品
     * @param {Item} item - 物品数据
     */
    handleEditItem: (item) => {
        const name = prompt('请输入新的物品名称:', item.name);
        if (name === null || name.trim() === '') return;

        const priceStr = prompt('请输入新的价格:', item.price.toFixed(2));
        if (priceStr === null) return;

        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
            alert('请输入有效的价格');
            return;
        }

        const dateStr = prompt('请输入新的购入日期 (YYYY-MM-DD):', utils.formatDate(item.purchaseDate));
        if (dateStr === null) return;

        const purchaseDate = utils.parseDate(dateStr);
        if (isNaN(purchaseDate.getTime())) {
            alert('请输入有效的日期');
            return;
        }

        // 更新物品
        const updatedItem = store.updateItem(item.id, {
            name: name.trim(),
            price,
            purchaseDate
        });

        if (updatedItem) {
            ui.renderItems();
        }
    },

    /**
     * 处理删除物品
     * @param {string} id - 物品 ID
     */
    handleDeleteItem: (id) => {
        if (confirm('确定要删除这个物品吗？')) {
            const success = store.deleteItem(id);
            if (success) {
                ui.renderItems();
            }
        }
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    ui.init();
});
