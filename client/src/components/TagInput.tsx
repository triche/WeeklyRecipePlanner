import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = inputValue.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number): void => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="tag-input-wrapper" data-testid={`tag-input-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button type="button" onClick={() => removeTag(index)} aria-label={`Remove ${tag}`}>×</button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
};

export default TagInput;
