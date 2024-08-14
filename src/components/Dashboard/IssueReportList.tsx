import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import ReactToPrint from 'react-to-print';

interface User {
  firstName: string;
  lastName: string;
  position: string;
}

interface Report {
  title: string;
  completedBy: User;
  purpose: string;
  assignedTo: User;
  priority: string;
  progress: string;
  createdAt: string;
  updatedAt: string;
  reportedBy: User;
  heavyEquipmentId: string;
  tag: string;
}

const IssueReportsList: React.FC = () => {

    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{
        startDate: string;
        endDate: string;
        progress: string;
        position: string;
        name: string;
    }>({
        startDate: '',
        endDate: '',
        progress: '',
        position: '',
        name: ''
    });

    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.list}`);
                setReports(response.data);
                setFilteredReports(response.data);
            } catch (error) {
                setError('Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    useEffect(() => {
        filterReports();
    }, [filters, reports]);

    const filterReports = () => {
        let filtered = reports.filter(report =>
            (!filters.startDate || new Date(report.createdAt) >= new Date(filters.startDate)) &&
            (!filters.endDate || new Date(report.createdAt) <= new Date(filters.endDate)) &&
            (!filters.progress || report.progress === filters.progress) &&
            (!filters.position || report.reportedBy.position.toLowerCase().includes(filters.position.toLowerCase())) &&
            (!filters.name || `${report.reportedBy.firstName} ${report.reportedBy.lastName}`.toLowerCase().includes(filters.name.toLowerCase()))
        );

        setFilteredReports(filtered);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

  return (
    <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Submitted Reports</h2>
        <div className="mb-4 space-y-4">
            <input
                type="text"
                placeholder="Name..."
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="mr-2 p-2 border border-gray-300"
            />
            <input
                type="text"
                placeholder="Employee Position..."
                name="position"
                value={filters.position}
                onChange={handleFilterChange}
                className="mr-2 p-2 border border-gray-300"
            />
            <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mr-2 p-2 border border-gray-300"
            />
            <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mr-2 p-2 border border-gray-300"
            />
            <select
                name="progress"
                value={filters.progress}
                onChange={handleFilterChange}
                className="mr-2 p-2 border border-gray-300"
            >
                <option value="">All Progress</option>
                <option value="new">New</option>
                <option value="in-progress">Inprogress</option>
                <option value="complete">Complete</option>
            </select>
        </div>
        <ReactToPrint
            trigger={() => <button className="btn btn-primary mb-4">Print Reports</button>}
            content={() => componentRef.current}
            pageStyle="@page { size: A4; margin: 10mm; }"
        />
        <div ref={componentRef} className="print-container">
                {filteredReports.length === 0 ? (
                    <p>No reports available</p>
                ) : (
                    <table className="min-w-full bg-white border border-gray-300 print:border-none print:min-w-0">
                        <thead className="print:bg-transparent">
                            <tr>
                                <th className="py-2 px-4 border-b print:border-none">Reported By</th>
                                <th className="py-2 px-4 border-b print:border-none">Issue Concerns</th>
                                <th className="py-2 px-4 border-b print:border-none">Assigned To</th>
                                <th className="py-2 px-4 border-b print:border-none">Completed By</th>
                                <th className="py-2 px-4 border-b print:border-none">Purpose</th>
                                <th className="py-2 px-4 border-b print:border-none">Priority</th>
                                <th className="py-2 px-4 border-b print:border-none">Progress</th>
                                <th className="py-2 px-4 border-b print:border-none">Issued Date</th>
                                <th className="py-2 px-4 border-b print:border-none">Completed Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b print:border-none">{`${report?.reportedBy?.firstName} ${report?.reportedBy?.lastName}`}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.heavyEquipmentId ? `${report.heavyEquipmentId} Reporting on ${report.issue} Issues` : report.title || `${report.issue} critical issue at ${report.location}`}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report?.assignedTo ? `${report?.assignedTo?.firstName} ${report?.assignedTo?.lastName}` : report.tag || 'No one'}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report?.completedBy ? `${report?.completedBy?.firstName} ${report?.completedBy?.lastName}` : 'No one'}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.purpose}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.priority}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.progress}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{new Date(report.createdAt).toLocaleString('en-US', { dateStyle: 'medium' })}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{new Date(report.updatedAt).toLocaleString('en-US', { dateStyle: 'medium' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
    </div>
);
}
export default IssueReportsList;
