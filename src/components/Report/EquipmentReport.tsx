import React, { useState } from 'react';

interface TransactionFilterFormProps {
  onFilter: (filters: Record<string, unknown>) => void;
  ondownload?: () => void;
}

const TransactionFilterForm: React.FC<TransactionFilterFormProps> = ({ onFilter, ondownload }) => {
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
      <button type="submit" className="btn btn-primary">
        Apply filters
      </button>
      {ondownload && (
        <button type="button" className="btn btn-outline-primary" onClick={ondownload}>
          Download
        </button>
      )}
    </form>
  );
};

export default TransactionFilterForm;
