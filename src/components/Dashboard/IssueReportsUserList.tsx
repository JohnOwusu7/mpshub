import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../Api/apiConfig';
import ReactToPrint from 'react-to-print';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import debounce from 'lodash/debounce';

interface User {
    id: any;
    firstName: string;
    lastName: string;
    role: string;
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
    issue: string;
    location: string;
    tag: string;
    heavyEquipmentId: string;
}

const IssueReportsUserList: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [filters, setFilters] = useState<{
        startDate: string;
        endDate: string;
        progress: string;
        name: string;
        purpose:string;
    }>({
        startDate: '',
        endDate: '',
        progress: '',
        name: '',
        purpose: ''
    });

    // Fetch Users data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.list}`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching Users:', error);
                
            }
        };

        fetchUsers();
    },[]);

    const componentRef = useRef<HTMLDivElement>(null);
    const authenticatedUser = useSelector((state: IRootState) => state.user.user);

    const getUserRole = () => {
        return authenticatedUser?.role || 'guest';
    };

    const fetchReports = useCallback(async () => {
        try {
            const response = await axios.get<Report[]>(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.list}`);
            const userRole = getUserRole();

            let filteredResult = response.data.filter(issue => issue?.tag === userRole);

            if (userRole === 'DISPATCH') {
                const dispatchReportedIssues = response.data.filter(issue => (issue?.reportedBy as any)?.role === 'DISPATCH' && (issue?.reportedBy as any)?._id === (authenticatedUser as any)?._id);
                filteredResult = [...new Set([...filteredResult, ...dispatchReportedIssues])];
            } else if (userRole === 'BENEWISE') {
                const benewiseReportedIssues = response.data.filter(issue => (issue?.reportedBy as any)?.role === 'BENEWISE' && (issue?.reportedBy as any)?._id === (authenticatedUser as any)?._id);
                filteredResult = [...new Set([...filteredResult, ...benewiseReportedIssues])];
            }

            setReports(filteredResult);
            setFilteredReports(filteredResult);
        } catch (error) {
            setError('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    }, [authenticatedUser]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    useEffect(() => {
        filterReports();
    }, [filters, reports]);

    const filterReports = useCallback(debounce(() => {
        let filtered = reports.filter(report =>
            (!filters.startDate || new Date(report.createdAt) >= new Date(filters.startDate)) &&
            (!filters.endDate || new Date(report.createdAt) <= new Date(filters.endDate)) &&
            (!filters.progress || report.progress === filters.progress) &&
            (!filters.purpose || report.purpose === filters.purpose) &&
            (!filters.name || `${report.reportedBy.firstName} ${report.reportedBy.lastName}`.toLowerCase().includes(filters.name.toLowerCase()))
        );

        setFilteredReports(filtered);
    }, 300), [filters, reports]);

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
            <style>{`
                @media print {
                    body {
                        margin-top: 20mm;
                    }
                    .print-container {
                        width: 100%;
                        font-size: 10px;
                    }
                    .print-container table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .print-container th {
                        background-color: #4CAF50;
                        color: white;
                        padding: 5px;
                    }
                    .print-container td {
                        padding: 5px;
                        border: 1px solid #ddd;
                    }
                    .print-container th, .print-container td {
                        text-align: left;
                    }
                }
            `}</style>
            <h2 className="text-2xl font-bold mb-4">Submitted Reports</h2>
            <div className="mb-4 space-y-4">
                <input
                    type="text"
                    placeholder="Search by Reporter..."
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="mr-2 p-2 border border-gray-300"
                />
                <input
                    type="date"
                    name="startDate"
                    placeholder='Enter start date'
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="mr-2 p-2 border border-gray-300"
                />
                <input
                    type="date"
                    name="endDate"
                    placeholder='Enter end date...'
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
                    <option value="in-progress">In progress</option>
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
};

export default IssueReportsUserList;

