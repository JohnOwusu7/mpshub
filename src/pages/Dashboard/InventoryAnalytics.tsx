import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import TransactionFilterForm from './../../components/Report/EquipmentReport';
import { useReactToPrint } from 'react-to-print';

interface TransactionFilterFormProps {
    onFilter: (filters: any) => Promise<void>;
    ondownload: () => void;
}

const InventoryAnalytics = () => {
    const componentPDF = useRef<HTMLDivElement>(null);

    const dispatch = useDispatch();
    const [leastEquipment, setLeastEquipment] = useState('');
    const [highestEquipment, setHighestEquipment] = useState('');
    const [mostUsedEquipment, setMostUsedEquipment] = useState('');
    const [equipmentLogs, setEquipmentLogs] = useState([]);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(setPageTitle('Inventory Dashboard'));
    }, [dispatch]);

    useEffect(() => {
        const fetchEquipmentData = async () => {
            try {
                const leastRes = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.leastQuantity}`);
                const highestRes = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.highQuantity}`);
                const mostUsedRes = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.mostUsed}`);
                const logsRes = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.transactions}`);

                console.log("Logs: ", logsRes);

                setLeastEquipment(leastRes.data.itemName);
                setHighestEquipment(highestRes.data.itemName);
                setMostUsedEquipment(mostUsedRes.data.itemName);
                setEquipmentLogs(logsRes.data);
            } catch (error: any) {
                console.error('Error fetching equipment data:', error.message);
            }
        };

        fetchEquipmentData();
    }, []);

    const fetchReportData = async (filters: any) => {
        console.log('filters', filters);
        try {
            setLoading(true);
            const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.transaction.endpoints.filter}`, { params: filters });
            setReportData(response.data);
            setLoading(false);
            setError(null);
            console.log('Getting', response.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
            setLoading(false);
            setError('Error fetching report data. Please try again.');
        }
    };

    useEffect(() => {
        fetchReportData({});
    }, []);

    const handleDownload = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: "Items Reports",
        pageStyle:"@page { size: A4; margin: 5mm; }"
    });

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="/" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Analytics</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
                    {/* Mostly Used */}
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Mostly Used Equipment</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> {mostUsedEquipment} </div>
                        </div>
                    </div>

                    {/* Low Stocks */}
                    <div className="panel bg-gradient-to-r from-red-500 to-red-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Low in Stock</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> {leastEquipment} </div>
                        </div>
                    </div>

                    {/*  Equipments with highest Stock */}
                    <div className="panel bg-gradient-to-r from-green-500 to-green-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">High in Stock</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> {highestEquipment} </div>
                        </div>
                    </div>

                    {/* View Inventory */}
                    <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Inventory Hub</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> loading </div>
                        </div>
                        <div className="flex items-center font-semibold mt-5">
                            <Link to={'/inventory'} className="btn btn-secondary btn-lg w-full border-0 bg-gradient-to-r from-[#3d38e1] to-[#1e9afe]">
                                View Inventory
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="mb-5 text-lg font-bold">Recent Equipment Transactions</div>
                    <div className="mb-5">
                        <TransactionFilterForm
                            onFilter={fetchReportData}
                            ondownload={() => {
                                try {
                                    throw new Error('Function not implemented.');
                                } catch (error) {
                                    console.error('Error in ondownload:', error);
                                }
                            }}
                        />
                    </div>

                    {loading ? (
                        <div>Loading .....</div>
                    ) : error ? (
                        <div>Error: {error}</div>
                    ) : (
                        <div className="table-responsive">
                    {reportData && reportData.length > 0 ? (
                        <div ref={componentPDF} className='w-full'>
                            <table className="min-w-full bg-white print:border-none print:min-w-0">
                                <thead className="print:bg-transparent">
                                    <tr>
                                        <th className="py-2 px-4 border-b print:border-none text-sm">Item No</th>
                                        <th className="py-2 px-4 border-b print:border-none text-sm">Equipment Name</th>
                                        <th className="py-2 px-4 border-b print:border-none text-sm">Quantity</th>
                                        <th className="py-2 px-4 border-b print:border-none text-sm">Transaction Type</th>
                                        <th className="py-2 px-4 border-b print:border-none text-sm">Last Update</th>
                                        <th className="py-2 px-4 border-b print:border-none text-sm">User</th>
                                        <th className="py-2 px-4 border-b print:border-none text-sm">Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((item: any) => (
                                        <tr key={item._id}>
                                            <td className="py-2 px-4 border-b print:border-none text-sm">{item.itemId.itemNo}</td>
                                            <td className="py-2 px-4 border-b print:border-none text-sm">{item.itemId.itemName}</td>
                                            <td className="py-2 px-4 border-b print:border-none text-sm">{item.quantity}</td>
                                            <td className="py-2 px-4 border-b print:border-none text-sm">{item.type}</td>
                                            <td className="py-2 px-4 border-b print:border-none text-sm">{new Date(item.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                            <td className="py-2 px-4 border-b print:border-none text-center text-sm">
                                                <span className="badge bg-success/20 text-info rounded-full hover:top-0">{item.userId}</span>
                                            </td>
                                            <td className="py-2 px-4 border-b print:border-none text-sm">{item.comment}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div>No data available</div>
                    )}
                </div>
                    )}
                    <div className="mt-5">
                        <button onClick={handleDownload} className="btn btn-primary">
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryAnalytics;
