import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SortField, SORT_FIELD_LABELS, SortDirection } from '@/types';

const SortControl = () => {
  const { sort, setSort, toggleSortDirection } = useStore();

  const sortFields: SortField[] = ['discoveredDate', 'weight', 'id', 'saleStatus'];

  const handleFieldChange = (field: SortField) => {
    if (sort.field === field) {
      toggleSortDirection();
    } else {
      const defaultDirection: SortDirection = 
        field === 'weight' || field === 'discoveredDate' ? 'desc' : 'asc';
      setSort(field, defaultDirection);
    }
  };

  const DirectionIcon = () => {
    if (sort.direction === 'asc') {
      return <ArrowUp className="w-3 h-3 ml-1" />;
    }
    return <ArrowDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 text-archive-gold mr-1">
        <ArrowUpDown className="w-4 h-4" />
        <span className="text-sm font-medium">排序</span>
      </div>
      <div className="flex bg-archive-card archive-border rounded-lg p-1">
        {sortFields.map((field) => (
          <button
            key={field}
            onClick={() => handleFieldChange(field)}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              sort.field === field
                ? 'bg-archive-gold text-archive-bg shadow-md'
                : 'text-archive-cream/60 hover:text-archive-cream hover:bg-archive-gold/10'
            }`}
          >
            <span>{SORT_FIELD_LABELS[field]}</span>
            {sort.field === field && <DirectionIcon />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortControl;
