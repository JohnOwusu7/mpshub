import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionFilterForm from '../../components/Report/EquipmentReport'; // Import the updated filter form
import { API_CONFIG } from '../../Api/apiConfig';

const ReportPage: React.FC = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async (filters: any) => {
    console.log('filters', filters);
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.transaction.endpoints.filter}`, { params: filters });
      setReportData(response.data);
      setLoading(false);
      setError(null); // Clear any previous errors
      console.log('Getting', response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setLoading(false);
      setError('Error fetching report data. Please try again.'); // Set error message
    }
  };

  useEffect(() => {
    // Fetch report data when the component mounts
    fetchReportData({});
  }, []);

  return (
    <div>
      <h2>Report</h2>
      <TransactionFilterForm onFilter={fetchReportData} ondownload={() => {
        try {
          throw new Error('Function not implemented.');
        } catch (error) {
          console.error('Error in ondownload:', error);
        }
      }} /> {/* Use the updated filter form */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div> // Display error message if there's an error
      ) : (
        <div>
          {/* Render report data here */}
          {reportData && reportData.length > 0 ? (
            <ul>
              {reportData.map((item) => (
                <li key={item._id}>
                  <div>Item ID: {item.itemId}</div>
                  <div>Quantity: {item.quantity}</div>
                  <div>Type: {item.type}</div>
                  <div>User ID: {item.userId}</div>
                  <div>Timestamp: {item.timestamp}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div>No data available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
