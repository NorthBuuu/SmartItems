/**
 * 智能物品成本管理工具 - 完整功能整合版
 */

// ==========================================
// 工具函数模块
// ==========================================

/**
 * 计算两个日期之间的天数差
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {number} 天数差
 */
function calculateDaysBetween(startDate, endDate) {
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
function calculatePurchaseDate(daysUsed) {
    const date = new Date();
    date.setDate(date.getDate() - daysUsed);
    return date;
}

/**
 * 格式化价格为人民币显示格式
 * @param {number} price - 价格
 * @returns {string} 格式化后的价格字符串
 */
function formatPrice(price) {
    return price.toFixed(2);
}

/**
 * 格式化日期为本地日期字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID字符串
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 计算每日使用成本
 * @param {number} price - 物品价格
 * @param {number} daysUsed - 已使用天数
 * @returns {number} 每日使用成本
 */
function calculateDailyCost(price, daysUsed) {
    // 避免除以0
    return daysUsed > 0 ? price / daysUsed : 0;
}

/**
 * 格式化每日成本显示
 * @param {number} dailyCost - 每日成本
 * @returns {string} 格式化后的每日成本
 */
function formatDailyCost(dailyCost) {
    // 如果每日成本小于0.01，则显示为0.01
    return dailyCost < 0.01 ? '0.01' : dailyCost.toFixed(2);
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD格式）
 * @returns {string} 今天的日期字符串
 */
function getTodayDateString() {
    return formatDate(new Date());
}

// ==========================================
// 数据存储模块
// ==========================================

/**
 * 物品存储类
 */
class ItemStore {
    constructor() {
        this.storageKey = 'smart-items-data';
    }

    /**
     * 从localStorage获取所有物品数据
     * @returns {Array} 物品数组
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
     * @param {Array} items - 物品数组
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
     * @returns {Object} 创建的物品
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
     * @returns {Object|null} 更新后的物品，如果找不到则返回null
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
     * @returns {Object|null} 物品对象，如果找不到则返回null
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

// 创建物品存储实例
const itemStore = new ItemStore();

// ==========================================
// 应用主逻辑
// ==========================================

// DOM 元素
const addItemForm = document.getElementById('addItemForm');
const editItemForm = document.getElementById('editItemForm');
const itemsContainer = document.getElementById('itemsContainer');
const emptyState = document.getElementById('emptyState');
const dateTypeSelect = document.getElementById('dateType');
const purchaseDateInput = document.getElementById('purchaseDate');
const daysUsedInput = document.getElementById('daysUsed');
const editModal = document.getElementById('editModal');
const editDateTypeSelect = document.getElementById('editDateType');
const editPurchaseDateInput = document.getElementById('editPurchaseDate');
const editDaysUsedInput = document.getElementById('editDaysUsed');
const cancelEditBtn = document.getElementById('cancelEdit');

/**
 * 初始化应用
 */
function initApp() {
    // 设置默认日期为今天
    purchaseDateInput.value = getTodayDateString();
    editPurchaseDateInput.value = getTodayDateString();
    
    // 初始化事件监听器
    setupEventListeners();
    
    // 加载并渲染物品列表
    renderItemsList();
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 添加物品表单提交
    addItemForm.addEventListener('submit', handleAddItemSubmit);
    
    // 编辑物品表单提交
    editItemForm.addEventListener('submit', handleEditItemSubmit);
    
    // 日期类型切换
    dateTypeSelect.addEventListener('change', handleDateTypeChange);
    editDateTypeSelect.addEventListener('change', handleEditDateTypeChange);
    
    // 日期和天数输入联动
    purchaseDateInput.addEventListener('change', handlePurchaseDateChange);
    daysUsedInput.addEventListener('change', handleDaysUsedChange);
    
    // 编辑模态框取消按钮
    cancelEditBtn.addEventListener('click', hideEditModal);
    
    // 点击模态框外部关闭
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            hideEditModal();
        }
    });
}

/**
 * 处理日期类型切换
 */
function handleDateTypeChange() {
    const isDateType = dateTypeSelect.value === 'date';
    purchaseDateInput.disabled = !isDateType;
    daysUsedInput.disabled = isDateType;
    
    if (!isDateType && daysUsedInput.value.trim() === '') {
        daysUsedInput.value = '1';
        updateDaysUsedFromPurchaseDate();
    }
}

/**
 * 处理编辑日期类型切换
 */
function handleEditDateTypeChange() {
    const isDateType = editDateTypeSelect.value === 'date';
    editPurchaseDateInput.disabled = !isDateType;
    editDaysUsedInput.disabled = isDateType;
}

/**
 * 处理购入日期变更
 */
function handlePurchaseDateChange() {
    updateDaysUsedFromPurchaseDate();
}

/**
 * 处理已用天数变更
 */
function handleDaysUsedChange() {
    if (daysUsedInput.value.trim() === '' || parseInt(daysUsedInput.value) < 1) {
        daysUsedInput.value = '1';
    }
    const daysUsed = parseInt(daysUsedInput.value);
    const purchaseDate = calculatePurchaseDate(daysUsed);
    purchaseDateInput.value = formatDate(purchaseDate);
}

/**
 * 根据购入日期更新已用天数
 */
function updateDaysUsedFromPurchaseDate() {
    const purchaseDate = new Date(purchaseDateInput.value);
    const today = new Date();
    const daysUsed = calculateDaysBetween(purchaseDate, today);
    daysUsedInput.value = Math.max(1, daysUsed).toString();
}

/**
 * 处理添加物品表单提交
 */
function handleAddItemSubmit(event) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('itemName').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value);
        const purchaseDate = new Date(purchaseDateInput.value);
        
        // 验证表单数据
        if (!name) {
            alert('请输入物品名称');
            return;
        }
        
        if (isNaN(price) || price < 0) {
            alert('请输入有效的价格');
            return;
        }
        
        if (isNaN(purchaseDate.getTime())) {
            alert('请选择有效的购入日期');
            return;
        }
        
        // 添加物品到存储
        itemStore.add({
            name,
            price,
            purchaseDate
        });
        
        // 重置表单
        addItemForm.reset();
        purchaseDateInput.value = getTodayDateString();
        updateDaysUsedFromPurchaseDate();
        
        // 重新渲染列表
        renderItemsList();
    } catch (error) {
        console.error('Error adding item:', error);
        alert('添加物品失败: ' + error.message);
    }
}

/**
 * 处理编辑物品表单提交
 */
function handleEditItemSubmit(event) {
    event.preventDefault();
    
    try {
        const id = document.getElementById('editItemId').value;
        const name = document.getElementById('editItemName').value.trim();
        const price = parseFloat(document.getElementById('editItemPrice').value);
        const purchaseDate = new Date(editPurchaseDateInput.value);
        
        // 验证表单数据
        if (!name) {
            alert('请输入物品名称');
            return;
        }
        
        if (isNaN(price) || price < 0) {
            alert('请输入有效的价格');
            return;
        }
        
        if (isNaN(purchaseDate.getTime())) {
            alert('请选择有效的购入日期');
            return;
        }
        
        // 更新物品
        const updated = itemStore.update(id, {
            name,
            price,
            purchaseDate
        });
        
        if (!updated) {
            alert('找不到要更新的物品');
            return;
        }
        
        // 隐藏模态框并重新渲染列表
        hideEditModal();
        renderItemsList();
    } catch (error) {
        console.error('Error updating item:', error);
        alert('更新物品失败: ' + error.message);
    }
}

/**
 * 显示编辑物品模态框
 */
function showEditModal(item) {
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemPrice').value = formatPrice(item.price);
    editPurchaseDateInput.value = formatDate(item.purchaseDate);
    editDaysUsedInput.value = item.daysUsed.toString();
    
    // 根据当前数据设置日期类型
    const today = new Date();
    const daysFromToday = calculateDaysBetween(item.purchaseDate, today);
    editDateTypeSelect.value = daysFromToday === item.daysUsed ? 'date' : 'days';
    
    // 更新日期类型状态
    handleEditDateTypeChange();
    
    // 设置为flex布局并显示
    editModal.style.display = 'flex';
    editModal.style.alignItems = 'center';
    editModal.style.justifyContent = 'center';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

/**
 * 隐藏编辑物品模态框
 */
function hideEditModal() {
    editModal.style.display = 'none';
    document.body.style.overflow = '';
}

/**
 * 处理物品编辑
 */
function handleEditItem(id) {
    const item = itemStore.getById(id);
    if (item) {
        showEditModal(item);
    }
}

/**
 * 处理物品删除
 */
function handleDeleteItem(id) {
    if (confirm('确定要删除这个物品吗？此操作不可撤销。')) {
        try {
            const deleted = itemStore.delete(id);
            if (deleted) {
                renderItemsList();
            } else {
                alert('找不到要删除的物品');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('删除物品失败: ' + error.message);
        }
    }
}

/**
 * 渲染物品列表
 */
function renderItemsList() {
    const items = itemStore.getAll();
    
    // 清空容器
    itemsContainer.innerHTML = '';
    
    // 显示空状态或物品列表
    if (items.length === 0) {
        const emptyStateEl = document.createElement('div');
        emptyStateEl.className = 'status-message status-empty';
        emptyStateEl.textContent = '还没有添加任何物品，开始添加吧！';
        itemsContainer.appendChild(emptyStateEl);
    } else {
        // 创建物品卡片
        items.forEach(item => {
            const itemCard = createItemCard(item);
            itemsContainer.appendChild(itemCard);
        });
    }
}

/**
 * 创建物品卡片元素
 */
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    // 计算日期显示
    const isRecentItem = item.daysUsed <= 30;
    const dateDisplay = isRecentItem ? 
        `${item.daysUsed} 天前` : 
        formatDate(item.purchaseDate);
    
    card.innerHTML = `
        <div class="item-info">
            <h3 class="item-name">${escapeHTML(item.name)}</h3>
            <div class="item-meta">
                <div class="meta-item">
                    <span class="meta-label">价格</span>
                    <span class="meta-value">¥${formatPrice(item.price)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">购入日期</span>
                    <span class="meta-value">${dateDisplay}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">已用天数</span>
                    <span class="meta-value">${item.daysUsed} 天</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">每日成本</span>
                    <span class="meta-value" style="color: var(--primary-color);">¥${formatDailyCost(item.dailyCost)}</span>
                </div>
            </div>
        </div>
        <div class="item-actions">
            <button class="btn btn-secondary edit-btn" data-id="${item.id}">编辑</button>
            <button class="btn btn-danger delete-btn" data-id="${item.id}">删除</button>
        </div>
    `;
    
    // 添加事件监听器
    card.querySelector('.edit-btn').addEventListener('click', () => handleEditItem(item.id));
    card.querySelector('.delete-btn').addEventListener('click', () => handleDeleteItem(item.id));
    
    return card;
}

/**
 * HTML转义函数，防止XSS攻击
 */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 初始化应用
 */
document.addEventListener('DOMContentLoaded', initApp);