/**
 * 物品卡片组件
 */
import { Item } from '../types';
import { calculateDaysBetween, calculateDailyCost } from '../utils';
import { deleteItem, saveItem } from '../store';

/**
 * 创建物品卡片元素
 * @param {Item} item - 物品数据
 * @param {Function} onUpdate - 更新回调函数
 * @returns {HTMLElement} 物品卡片DOM元素
 */
export function createItemCard(item: Item, onUpdate: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'border border-gray-200 rounded-xl p-4 card';
  card.dataset.id = item.id;

  const daysUsed = calculateDaysBetween(item.purchaseDate);
  const dailyCost = calculateDailyCost(item.price, item.purchaseDate);

  card.innerHTML = `
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(item.name)}</h3>
        <p class="text-sm text-gray-500">购入于 ${new Date(item.purchaseDate).toLocaleDateString('zh-CN')}</p>
      </div>
      <div class="flex gap-2">
        <button class="edit-btn text-blue-600 hover:text-blue-800 transition-colors">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn text-red-600 hover:text-red-800 transition-colors">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p class="text-sm text-gray-600">总价格</p>
        <p class="text-xl font-bold text-gray-900">¥${item.price.toFixed(2)}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">已使用天数</p>
        <p class="text-xl font-bold text-gray-900">${daysUsed} 天</p>
      </div>
    </div>
    
    <div class="bg-indigo-50 rounded-lg p-3">
      <p class="text-sm text-gray-600 mb-1">每天使用成本</p>
      <p class="text-2xl font-bold text-indigo-600">¥${dailyCost.toFixed(2)}</p>
    </div>
    
    <!-- 编辑表单 (默认隐藏) -->
    <div class="edit-form hidden mt-4 space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">物品名称</label>
        <input type="text" class="edit-name w-full px-3 py-2 border border-gray-300 rounded-lg input-focus" value="${escapeHtml(item.name)}">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">价格 (¥)</label>
        <input type="number" step="0.01" class="edit-price w-full px-3 py-2 border border-gray-300 rounded-lg input-focus" value="${item.price}">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">购入日期</label>
        <input type="date" class="edit-date w-full px-3 py-2 border border-gray-300 rounded-lg input-focus" value="${item.purchaseDate}">
      </div>
      <div class="flex gap-2">
        <button class="save-edit-btn flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          保存
        </button>
        <button class="cancel-edit-btn flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
          取消
        </button>
      </div>
    </div>
  `;

  // 绑定事件
  bindCardEvents(card, item, onUpdate);

  return card;
}

/**
 * 绑定卡片事件
 * @param {HTMLElement} card - 卡片元素
 * @param {Item} item - 物品数据
 * @param {Function} onUpdate - 更新回调函数
 */
function bindCardEvents(card: HTMLElement, item: Item, onUpdate: () => void): void {
  const editBtn = card.querySelector('.edit-btn') as HTMLButtonElement;
  const deleteBtn = card.querySelector('.delete-btn') as HTMLButtonElement;
  const editForm = card.querySelector('.edit-form') as HTMLElement;
  const saveEditBtn = card.querySelector('.save-edit-btn') as HTMLButtonElement;
  const cancelEditBtn = card.querySelector('.cancel-edit-btn') as HTMLButtonElement;

  // 编辑按钮点击事件
  editBtn.addEventListener('click', () => {
    editForm.classList.remove('hidden');
  });

  // 取消编辑按钮点击事件
  cancelEditBtn.addEventListener('click', () => {
    editForm.classList.add('hidden');
  });

  // 保存编辑按钮点击事件
  saveEditBtn.addEventListener('click', () => {
    const editNameInput = card.querySelector('.edit-name') as HTMLInputElement;
    const editPriceInput = card.querySelector('.edit-price') as HTMLInputElement;
    const editDateInput = card.querySelector('.edit-date') as HTMLInputElement;

    const updatedItem: Item = {
      ...item,
      name: editNameInput.value.trim(),
      price: parseFloat(editPriceInput.value),
      purchaseDate: editDateInput.value,
      updatedAt: new Date().toISOString()
    };

    try {
      saveItem(updatedItem);
      onUpdate();
    } catch (error) {
      alert('保存失败，请重试');
      console.error('Failed to save updated item:', error);
    }
  });

  // 删除按钮点击事件
  deleteBtn.addEventListener('click', () => {
    if (confirm('确定要删除这个物品吗？')) {
      const success = deleteItem(item.id);
      if (success) {
        onUpdate();
      } else {
        alert('删除失败，请重试');
      }
    }
  });
}

/**
 * HTML转义函数
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}