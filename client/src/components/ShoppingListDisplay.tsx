import React, { useState } from 'react';
import { ShoppingList as ShoppingListType } from '../types';

interface ShoppingListProps {
  shoppingList: ShoppingListType;
  numberOfPeople: number;
}

/**
 * Multiply a quantity string by a multiplier.
 * Handles numeric strings (e.g. "3") and fractional strings (e.g. "1.5").
 * Non-numeric strings are returned unchanged.
 */
const scaleQuantity = (qty: string, multiplier: number): string => {
  const num = parseFloat(qty);
  if (isNaN(num)) return qty;
  const scaled = num * multiplier;
  // Avoid ugly floating point artifacts: round to 2 decimal places, strip trailing zeros
  return parseFloat(scaled.toFixed(2)).toString();
};

const ShoppingListDisplay: React.FC<ShoppingListProps> = ({ shoppingList, numberOfPeople }) => {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string): void => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Group items by category
  const groupedItems = shoppingList.items.reduce<Record<string, typeof shoppingList.items>>(
    (acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.keys(groupedItems).sort();

  const toMarkdown = (): string => {
    let md = '# Shopping List\n\n';
    if (numberOfPeople > 1) {
      md += `> Scaled for ${numberOfPeople} people\n\n`;
    }
    for (const category of sortedCategories) {
      md += `## ${category}\n\n`;
      for (const item of groupedItems[category]) {
        md += `- [ ] ${item.name} — ${scaleQuantity(item.totalQuantity, numberOfPeople)} ${item.unit}\n`;
      }
      md += '\n';
    }
    return md;
  };

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(toMarkdown());
      showToast('Shopping list copied to clipboard!');
    } catch {
      showToast('Failed to copy to clipboard.');
    }
  };

  const downloadMarkdown = (): void => {
    const blob = new Blob([toMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Shopping list downloaded!');
  };

  return (
    <div className="shopping-list-section">
      <h2 className="section-title">🛒 Shopping List</h2>
      {numberOfPeople > 1 && (
        <p className="shopping-list-subtitle">Scaled for {numberOfPeople} people</p>
      )}

      <div className="shopping-list-actions">
        <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>
          📋 Copy to Clipboard
        </button>
        <button className="btn btn-secondary btn-sm" onClick={downloadMarkdown}>
          💾 Save as Markdown
        </button>
      </div>

      <div className="shopping-categories">
        {sortedCategories.map((category) => (
          <div key={category} className="category-card">
            <div className="category-header">{category}</div>
            <div className="category-items">
              {groupedItems[category].map((item, idx) => (
                <div key={idx} className="category-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">
                    {scaleQuantity(item.totalQuantity, numberOfPeople)} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default ShoppingListDisplay;
