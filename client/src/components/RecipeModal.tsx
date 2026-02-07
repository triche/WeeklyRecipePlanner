import React, { useEffect, useCallback } from 'react';
import { RecipeResponse } from '../types';

interface RecipeModalProps {
  recipe: RecipeResponse | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, isLoading, error, onClose }) => {
  const [toast, setToast] = React.useState<string | null>(null);

  const showToast = (message: string): void => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const toMarkdown = (): string => {
    if (!recipe) return '';
    let md = `# ${recipe.mealName}\n\n`;

    md += `## Ingredients\n\n`;
    for (const ing of recipe.ingredients) {
      const notes = ing.notes ? ` _(${ing.notes})_` : '';
      md += `- ${ing.quantity} ${ing.unit} ${ing.name}${notes}\n`;
    }

    md += `\n## Instructions\n\n`;
    recipe.instructions.forEach((step, i) => {
      md += `${i + 1}. ${step}\n`;
    });

    if (recipe.tips) {
      md += `\n## Tips\n\n${recipe.tips}\n`;
    }

    return md;
  };

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(toMarkdown());
      showToast('Recipe copied to clipboard!');
    } catch {
      showToast('Failed to copy to clipboard.');
    }
  };

  const downloadMarkdown = (): void => {
    const blob = new Blob([toMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (recipe?.mealName || 'recipe').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    a.download = `${safeName}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Recipe downloaded!');
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="recipe-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="recipe-modal">
        <div className="recipe-modal-header">
          <h2>{isLoading ? 'Loading Recipe...' : recipe?.mealName || 'Recipe'}</h2>
          <button className="recipe-modal-close" onClick={onClose} aria-label="Close recipe modal">
            ✕
          </button>
        </div>

        <div className="recipe-modal-body">
          {isLoading && (
            <div className="recipe-loading">
              <div className="spinner" />
              <p>Generating recipe with AI...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="recipe-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          {recipe && !isLoading && !error && (
            <>
              <div className="recipe-modal-actions">
                <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>
                  📋 Copy to Clipboard
                </button>
                <button className="btn btn-secondary btn-sm" onClick={downloadMarkdown}>
                  💾 Save as Markdown
                </button>
              </div>

              <div className="recipe-section">
                <h3>🥘 Ingredients</h3>
                <ul className="recipe-ingredients">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <span className="recipe-ing-qty">
                        {ing.quantity} {ing.unit}
                      </span>{' '}
                      <span className="recipe-ing-name">{ing.name}</span>
                      {ing.notes && <span className="recipe-ing-notes"> — {ing.notes}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recipe-section">
                <h3>📝 Instructions</h3>
                <ol className="recipe-instructions">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {recipe.tips && (
                <div className="recipe-section">
                  <h3>💡 Tips</h3>
                  <p className="recipe-tips">{recipe.tips}</p>
                </div>
              )}
            </>
          )}
        </div>

        {toast && <div className="toast recipe-toast">{toast}</div>}
      </div>
    </div>
  );
};

export default RecipeModal;
