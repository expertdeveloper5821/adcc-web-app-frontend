import React from 'react';

interface CategorySelectorProps {
  selectedCategories: string[];
  onToggle: (category: string) => void;
  error?: string;
  availableCategories: string[];
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onToggle,
  error,
  availableCategories,
}) => {
  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: '#666' }}>
        Category (multi-select) *
      </label>
      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {availableCategories.map(category => (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            className="px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              backgroundColor: selectedCategories.includes(category) ? '#C12D32' : '#F3F4F6',
              color: selectedCategories.includes(category) ? '#fff' : '#666',
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};