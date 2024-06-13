import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';

interface Transaction {
  itemId: any;
  _id: string;
  userId: string;
  itemName: string;
}

interface TransactionFilters {
  userId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  type?: string; // Retained the 'type' field
  itemName?: string;
}

interface TransactionFilterFormProps {
  onFilter: (filters: TransactionFilters) => void;
  ondownload: () => void;
}

const TransactionFilterForm: React.FC<TransactionFilterFormProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.transactions}`);
        setTransactions(response.data);
        console.log('response', response.data)
      } catch (error: any) {
        console.error('Error fetching transaction data:', error.message);
      }
    };

    fetchTransactionData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | null, field: string) => {
    setFilters({ ...filters, [field]: date });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert dates to Date objects
    const formattedFilters = {
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : null,
      endDate: filters.endDate ? new Date(filters.endDate) : null
    };

    console.log('Form data:', formattedFilters); // Log the form data
    onFilter(formattedFilters);
  };



  const uniqueUserIds = [...new Set(transactions.map((transaction) => transaction.userId))];
  const uniqueItems = [...new Set(transactions.map((transaction) => transaction.itemId.itemName))];

  return (
    <form className="bg-white shadow-md rounded-md p-4 space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center">
        <div className="w-full sm:w-auto">
          <label htmlFor="userId" className="text-sm text-gray-600">User ID</label>
          <select id="userId" name="userId" value={filters.userId || ''} onChange={handleChange} className="mt-1 p-2 w-full sm:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400">
            <option value="">Select User ID</option>
            {uniqueUserIds.map((userId) => (
              <option key={userId} value={userId}>{userId}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 px-12">
          <label htmlFor="itemName" className="text-sm text-gray-600">Item Name</label>
          <select id="itemName" name="itemName" value={filters.itemName || ''} onChange={handleChange} className="mt-1 p-2 w-full sm:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400">
            <option value="">Select Item Name</option>
            {uniqueItems.map((itemName) => (
              <option key={itemName} value={itemName}>{itemName}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          <label className="text-sm text-gray-600">Start Date</label>
          <DatePicker
            selected={filters.startDate}
            onChange={(date: any) => handleDateChange(date, 'startDate')}
            placeholderText="Start Date"
            className="mt-1 p-2 w-full sm:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 px-12">
          <label className="text-sm text-gray-600">End Date</label>
          <DatePicker
            selected={filters.endDate}
            onChange={(date: any) => handleDateChange(date, 'endDate')}
            placeholderText="End Date"
            className="mt-1 p-2 w-full sm:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          <label htmlFor="type" className="text-sm text-gray-600">Type</label>
          <select id="type" name="type" value={filters.type || ''} onChange={handleChange} className="mt-1 p-2 w-full sm:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400">
            <option value="">Select Type</option>
            <option value="use">Use</option>
            <option value="replaced">Replaced</option>
          </select>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 pt-8 mx-10">
          <button type="submit" className="px-10 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400 mt-12 sm:mt-0">Apply</button>
        </div>
      </div>
    </form>
  );
};

export default TransactionFilterForm;
