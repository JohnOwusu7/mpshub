import React, { useEffect, useState, useRef } from 'react';
import { fetchReports } from '../../Api/api';
import ReactToPrint from 'react-to-print';

interface User {
    firstName: string;
    lastName: string;
    role: string;
}

interface Report {
    tasksAccomplished: string;
    ongoingTask: string;
    issuesConcerns: string;
    plansNextDay: string;
    additionalComments: string;
    shift: string;
    date: string;
    user: User;
}

const ReportsList: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [shift, setShift] = useState<string>('');
    const [section, setSection] = useState<string>('');
    const [name, setName] = useState<string>('');

    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getReports = async () => {
            try {
                const reportsData: any = await fetchReports();
                setReports(reportsData);
                setFilteredReports(reportsData);
            } catch (error) {
                setError('Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };

        getReports();
    }, []);

    useEffect(() => {
        filterReports();
    }, [startDate, endDate, shift, section, name, reports]);

    const filterReports = () => {
        let filtered = reports;

        if (startDate) {
            filtered = filtered.filter(report => new Date(report.date) >= new Date(startDate));
        }

        if (endDate) {
            filtered = filtered.filter(report => new Date(report.date) <= new Date(endDate));
        }

        if (shift) {
            filtered = filtered.filter(report => report.shift === shift);
        }

        if (section) {
            filtered = filtered.filter(report => report.user.role.toLowerCase().includes(section.toLowerCase()));
        }

        if (name) {
            filtered = filtered.filter(report => `${report.user.firstName} ${report.user.lastName}`.toLowerCase().includes(name.toLowerCase()));
        }

        setFilteredReports(filtered);
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mr-2 p-2 border border-gray-300"
                />
                <input
                    type="text"
                    placeholder="Section..."
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="mr-2 p-2 border border-gray-300"
                />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mr-2 p-2 border border-gray-300"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mr-2 p-2 border border-gray-300"
                />
                <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="mr-2 p-2 border border-gray-300"
                >
                    <option value="">All Shifts</option>
                    <option value="SHIFT A">SHIFT A</option>
                    <option value="SHIFT B">SHIFT B</option>
                    <option value="SHIFT C">SHIFT C</option>
                    <option value="STRAIGHT">Straight Day</option>
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
                                <th className="py-2 px-4 border-b print:border-none">Name</th>
                                <th className="py-2 px-4 border-b print:border-none">Section</th>
                                <th className="py-2 px-4 border-b print:border-none">Tasks Accomplished</th>
                                <th className="py-2 px-4 border-b print:border-none">Ongoing Task</th>
                                <th className="py-2 px-4 border-b print:border-none">Issues Concerns</th>
                                <th className="py-2 px-4 border-b print:border-none">Plans Next Day</th>
                                <th className="py-2 px-4 border-b print:border-none">Additional Comments</th>
                                <th className="py-2 px-4 border-b print:border-none">Shift</th>
                                <th className="py-2 px-4 border-b print:border-none">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b print:border-none">{`${report.user.firstName} ${report.user.lastName}`}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report?.user?.role}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.tasksAccomplished}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.ongoingTask}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.issuesConcerns}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.plansNextDay}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.additionalComments}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{report.shift}</td>
                                    <td className="py-2 px-4 border-b print:border-none">{new Date(report.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReportsList;
