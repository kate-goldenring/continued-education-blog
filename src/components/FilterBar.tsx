import { Category } from '../types/BlogPost';

interface FilterBarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hiking', label: 'Hiking' },
  { key: 'travel', label: 'Travel' },
  { key: 'food', label: 'Food' },
  { key: 'mountaineering', label: 'Mountaineering' },
  { key: 'lifestyle', label: 'Lifestyle' }
];

export default function FilterBar({ activeCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {categories.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onCategoryChange(key)}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
            activeCategory === key
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}