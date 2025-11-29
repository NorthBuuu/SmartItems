/**
 * 主应用逻辑
 */
import { Item, ItemFormData } from './types';
import { generateId, getPurchaseDateFromDays, formatDate } from './utils';
import { getItems, saveItem } from './store';
import { createItemCard } from './components/ItemCard';

// DOM 元素
const itemForm = document.getElementById('itemForm') as HTMLFormElement;
const itemsList = document.getElementById('itemsList') as HTMLDivElement;
const emptyState = document.getElementById('emptyState') as HTMLDivElement;
const itemNameInput = document.getElementById('itemName') as HTMLInputElement;
const itemPriceInput = document.getElementById('itemPrice') as HTMLInputElement;
const purchaseDateInput = document.getElementById('purchaseDate') as HTMLInputElement;
const purchaseDaysInput = document.getElementById('purchaseDays') as HTMLInputElement;

/**
 * 初始化应用
 */
function initApp(): void {
  // 绑定表单提交事件
  itemForm.addEventListener('submit', handleFormSubmit);
  
  // 绑定购入天数输入事件（自动计算购入日期）
  purchaseDaysInput.addEventListener('input', handlePurchaseDaysInput);
  
  // 渲染初始物品列表
  renderItems();
}

/**
 * 处理表单提交
 * @param {Event} e - 表单提交事件
 */
function handleFormSubmit(e: Event): void {
  e.preventDefault();
  
  // 获取表单数据
  const formData: ItemFormData = {
    name: itemNameInput.value.trim(),
    price: parseFloat(itemPriceInput.value),
    purchaseDate: purchaseDateInput.value,
    purchaseDays: purchaseDaysInput.value ? parseInt(purchaseDaysInput.value) : undefined
  };
  
  // 验证表单数据
  if (!validateFormData(formData)) {
    return;
  }
  
  // 确定购入日期
  let purchaseDate: string;
  if (formData.purchaseDays) {
    purchaseDate = getPurchaseDateFromDays(formData.purchaseDays);
  } else if (formData.purchaseDate) {
    purchaseDate = formData.purchaseDate;
  } else {
    purchaseDate = formatDate(new Date());
  }
  
  // 创建新物品
  const newItem: Item = {
    id: generateId(),
    name: formData.name,
    price: formData.price,
    purchaseDate: purchaseDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // 保存物品
    saveItem(newItem);
    
    // 重置表单
    resetForm();
    
    // 重新渲染物品列表
    renderItems();
    
    alert('物品添加成功！');
  } catch (error) {
    alert('添加失败，请重试');
    console.error('Failed to add item:', error);
  }
}

/**
 * 验证表单数据
 * @param {ItemFormData} formData - 表单数据
 * @returns {boolean} 验证是否通过
 */
function validateFormData(formData: ItemFormData): boolean {
  if (!formData.name) {
    alert('请输入物品名称');
    itemNameInput.focus();
    return false;
  }
  
  if (isNaN(formData.price) || formData.price <= 0) {
    alert('请输入有效的价格');
    itemPriceInput.focus();
    return false;
  }
  
  if (formData.purchaseDays && (isNaN(formData.purchaseDays) || formData.purchaseDays <= 0)) {
    alert('请输入有效的购入天数');
    purchaseDaysInput.focus();
    return false;
  }
  
  return true;
}

/**
 * 处理购入天数输入
 * @param {Event} e - 输入事件
 */
function handlePurchaseDaysInput(e: Event): void {
  const days = (e.target as HTMLInputElement).value;
  if (days) {
    const purchaseDate = getPurchaseDateFromDays(parseInt(days));
    purchaseDateInput.value = purchaseDate;
  } else {
    purchaseDateInput.value = '';
  }
}

/**
 * 重置表单
 */
function resetForm(): void {
  itemForm.reset();
}

/**
 * 渲染物品列表
 */
function renderItems(): void {
  // 获取所有物品
  const items = getItems();
  
  // 清空当前列表
  itemsList.innerHTML = '';
  
  // 显示/隐藏空状态
  if (items.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }
  
  // 按购入日期倒序排序
  items.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  
  // 渲染每个物品卡片
  items.forEach(item => {
    const card = createItemCard(item, renderItems);
    itemsList.appendChild(card);
  });
}

// 初始化应用
initApp();