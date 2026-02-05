import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import {
    PaymentTransaction,
    Company,
    getAllCompaniesApi,
    getAllPaymentTransactionsApi,
    createPaymentTransactionApi,
    confirmPaymentApi,
    updatePaymentTransactionApi,
    deletePaymentTransactionApi,
    getPaymentStatisticsApi,
} from '../../Api/api';
import showMessage from '../../components/Alerts/showMessage';
import IconPlus from '../../components/Icon/IconPlus';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconX from '../../components/Icon/IconX';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconBuilding from '../../components/Icon/IconBuilding';
import { IRootState } from '../../store';

const ALL_SYSTEM_MODULES = [
    { name: 'issueReporting', displayName: 'Issue Reporting' },
    { name: 'inventory', displayName: 'Inventory Management' },
    { name: 'safetyPJO', displayName: 'Safety PJO' },
    { name: 'prestartChecks', displayName: 'Prestart Checks' },
    { name: 'ipAddress', displayName: 'IP Address Management' },
    { name: 'reports', displayName: 'Reports' },
];

const SUBSCRIPTION_PERIODS = [
    { value: '1_month', label: '1 Month' },
    { value: '3_months', label: '3 Months' },
    { value: '6_months', label: '6 Months' },
    { value: '12_months', label: '12 Months' },
    { value: 'custom', label: 'Custom' },
];

const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' },
];

const CURRENCIES = ['USD', 'GHS', 'EUR', 'GBP'];

const PaymentManagement: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
    const [statistics, setStatistics] = useState<any>(null);

    // Filters
    const [filterCompany, setFilterCompany] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');

    // Calculate initial end date
    const getInitialEndDate = () => {
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + 6); // 6 months default
        return end.toISOString().split('T')[0];
    };

    // Form state
    const [formData, setFormData] = useState({
        companyId: '',
        amount: '',
        currency: 'USD',
        paymentMethod: 'bank_transfer',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        subscriptionPeriod: '6_months',
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionEndDate: getInitialEndDate(),
        modules: [] as string[],
        notes: '',
    });

    useEffect(() => {
        dispatch(setPageTitle('Payment Management'));
        if (user?.roleName === 'SUPER-ADMIN') {
            fetchData();
        } else {
            setLoading(false);
            showMessage({ message: 'Unauthorized Access', success: false });
        }
    }, [dispatch, user?.roleName]);

    useEffect(() => {
        fetchPayments();
        fetchStatistics();
    }, [filterCompany, filterStatus, filterStartDate, filterEndDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [companiesData] = await Promise.all([
                getAllCompaniesApi(),
            ]);
            setCompanies(companiesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            showMessage({ message: 'Failed to load data.', success: false });
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        try {
            const filters: any = {};
            if (filterCompany) filters.companyId = filterCompany;
            if (filterStatus) filters.status = filterStatus;
            if (filterStartDate) filters.startDate = filterStartDate;
            if (filterEndDate) filters.endDate = filterEndDate;

            const data = await getAllPaymentTransactionsApi(filters);
            setPayments(data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            showMessage({ message: 'Failed to load payment transactions.', success: false });
        }
    };

    const fetchStatistics = async () => {
        try {
            const filters: any = {};
            if (filterStartDate) filters.startDate = filterStartDate;
            if (filterEndDate) filters.endDate = filterEndDate;

            const stats = await getPaymentStatisticsApi(filters);
            setStatistics(stats);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        }
    };

    const calculateEndDate = (startDate: string, period: string) => {
        if (!startDate || period === 'custom') return '';
        const start = new Date(startDate);
        const months = period === '1_month' ? 1 : period === '3_months' ? 3 : period === '6_months' ? 6 : 12;
        const end = new Date(start);
        end.setMonth(end.getMonth() + months);
        return end.toISOString().split('T')[0];
    };

    const handlePeriodChange = (period: string) => {
        setFormData(prev => {
            const endDate = calculateEndDate(prev.subscriptionStartDate, period);
            return { ...prev, subscriptionPeriod: period, subscriptionEndDate: endDate };
        });
    };

    const handleStartDateChange = (date: string) => {
        setFormData(prev => {
            const endDate = calculateEndDate(date, prev.subscriptionPeriod);
            return { ...prev, subscriptionStartDate: date, subscriptionEndDate: endDate };
        });
    };

    const handleModuleToggle = (moduleName: string) => {
        setFormData(prev => {
            const modules = prev.modules.includes(moduleName)
                ? prev.modules.filter(m => m !== moduleName)
                : [...prev.modules, moduleName];
            return { ...prev, modules };
        });
    };

    const handleCreatePayment = async () => {
        if (!formData.companyId || !formData.amount || formData.modules.length === 0) {
            showMessage({ message: 'Please fill in all required fields and select at least one module.', success: false });
            return;
        }

        try {
            const paymentData = {
                ...formData,
                amount: parseFloat(formData.amount),
                subscriptionStartDate: new Date(formData.subscriptionStartDate).toISOString(),
                subscriptionEndDate: new Date(formData.subscriptionEndDate).toISOString(),
                paymentDate: new Date(formData.paymentDate).toISOString(),
            };

            await createPaymentTransactionApi(paymentData);
            showMessage({ message: 'Payment transaction created successfully.', success: true });
            setShowCreateModal(false);
            resetForm();
            fetchPayments();
            fetchStatistics();
        } catch (error: any) {
            showMessage({ message: error.response?.data?.message || 'Failed to create payment transaction.', success: false });
        }
    };

    const handleConfirmPayment = async (paymentId: string) => {
        if (!confirm('Are you sure you want to confirm this payment? This will update the company subscription.')) {
            return;
        }

        try {
            await confirmPaymentApi(paymentId);
            showMessage({ message: 'Payment confirmed and company subscription updated.', success: true });
            fetchPayments();
            fetchStatistics();
        } catch (error: any) {
            showMessage({ message: error.response?.data?.message || 'Failed to confirm payment.', success: false });
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        if (!confirm('Are you sure you want to delete this payment transaction?')) {
            return;
        }

        try {
            await deletePaymentTransactionApi(paymentId);
            showMessage({ message: 'Payment transaction deleted successfully.', success: true });
            fetchPayments();
            fetchStatistics();
        } catch (error: any) {
            showMessage({ message: error.response?.data?.message || 'Failed to delete payment transaction.', success: false });
        }
    };

    const resetForm = () => {
        const startDate = new Date().toISOString().split('T')[0];
        setFormData({
            companyId: '',
            amount: '',
            currency: 'USD',
            paymentMethod: 'bank_transfer',
            paymentReference: '',
            paymentDate: startDate,
            subscriptionPeriod: '6_months',
            subscriptionStartDate: startDate,
            subscriptionEndDate: calculateEndDate(startDate, '6_months'),
            modules: [],
            notes: '',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-success';
            case 'pending':
                return 'bg-warning';
            case 'failed':
                return 'bg-danger';
            case 'refunded':
                return 'bg-secondary';
            default:
                return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block"></span>
                <span className="ltr:ml-2 rtl:mr-2">Loading...</span>
            </div>
        );
    }

    if (user?.roleName !== 'SUPER-ADMIN') {
        return <div className="panel">Access Denied. Only Super-Admins can manage payments.</div>;
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl mb-2">
                        Payment Management
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Process and manage subscription payments</p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                >
                    <IconPlus className="w-5 h-5 mr-2" />
                    Record Payment
                </button>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="panel">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Total Transactions</p>
                                <h3 className="text-2xl font-bold">{statistics.totals?.totalTransactions || 0}</h3>
                            </div>
                            <IconDollarSign className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div className="panel">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                                <h3 className="text-2xl font-bold">${statistics.totals?.totalAmount?.toFixed(2) || '0.00'}</h3>
                            </div>
                            <IconDollarSign className="w-8 h-8 text-success" />
                        </div>
                    </div>
                    <div className="panel">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Confirmed Amount</p>
                                <h3 className="text-2xl font-bold">${statistics.totals?.confirmedAmount?.toFixed(2) || '0.00'}</h3>
                            </div>
                            <IconSquareCheck className="w-8 h-8 text-success" />
                        </div>
                    </div>
                    <div className="panel">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Pending Amount</p>
                                <h3 className="text-2xl font-bold">
                                    ${((statistics.totals?.totalAmount || 0) - (statistics.totals?.confirmedAmount || 0)).toFixed(2)}
                                </h3>
                            </div>
                            <IconCalendar className="w-8 h-8 text-warning" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="panel mb-6">
                <h5 className="font-semibold text-lg mb-4">Filters</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="form-label">Company</label>
                        <select
                            className="form-select"
                            value={filterCompany}
                            onChange={(e) => setFilterCompany(e.target.value)}
                        >
                            <option value="">All Companies</option>
                            {companies.map((company) => (
                                <option key={company._id} value={company._id}>
                                    {company.companyName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="panel">
                <h5 className="font-semibold text-lg mb-4">Payment Transactions</h5>
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Receipt #</th>
                                <th>Company</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Payment Date</th>
                                <th>Period</th>
                                <th>Modules</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-8 text-gray-500">
                                        No payment transactions found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td>
                                            {payment.receiptNumber || (
                                                <span className="text-gray-400">Pending</span>
                                            )}
                                        </td>
                                        <td>{payment.companyName}</td>
                                        <td>
                                            {payment.currency} {payment.amount.toFixed(2)}
                                        </td>
                                        <td>
                                            {PAYMENT_METHODS.find(m => m.value === payment.paymentMethod)?.label || payment.paymentMethod}
                                        </td>
                                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                        <td>
                                            {SUBSCRIPTION_PERIODS.find(p => p.value === payment.subscriptionPeriod)?.label || payment.subscriptionPeriod}
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {payment.modules.slice(0, 2).map((module) => (
                                                    <span key={module} className="badge bg-primary">
                                                        {ALL_SYSTEM_MODULES.find(m => m.name === module)?.displayName || module}
                                                    </span>
                                                ))}
                                                {payment.modules.length > 2 && (
                                                    <span className="badge bg-gray-500">+{payment.modules.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusColor(payment.status)}`}>
                                                {payment.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {payment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleConfirmPayment(payment._id)}
                                                        >
                                                            <IconSquareCheck className="w-4 h-4" />
                                                            Confirm
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeletePayment(payment._id)}
                                                        >
                                                            <IconTrash className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Payment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Record New Payment</h3>
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                            >
                                <IconX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Company *</label>
                                <select
                                    className="form-select"
                                    value={formData.companyId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                                    required
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company._id} value={company._id}>
                                            {company.companyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Amount *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Currency</label>
                                    <select
                                        className="form-select"
                                        value={formData.currency}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                    >
                                        {CURRENCIES.map((curr) => (
                                            <option key={curr} value={curr}>
                                                {curr}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Payment Method *</label>
                                    <select
                                        className="form-select"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                                        required
                                    >
                                        {PAYMENT_METHODS.map((method) => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Payment Reference</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.paymentReference}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                                        placeholder="Transaction/Reference number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Payment Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.paymentDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <label className="form-label">Subscription Period *</label>
                                <select
                                    className="form-select"
                                    value={formData.subscriptionPeriod}
                                    onChange={(e) => handlePeriodChange(e.target.value)}
                                    required
                                >
                                    {SUBSCRIPTION_PERIODS.map((period) => (
                                        <option key={period.value} value={period.value}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Subscription Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.subscriptionStartDate}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Subscription End Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.subscriptionEndDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subscriptionEndDate: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Modules *</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {ALL_SYSTEM_MODULES.map((module) => (
                                        <label key={module.name} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.modules.includes(module.name)}
                                                onChange={() => handleModuleToggle(module.name)}
                                                className="form-checkbox"
                                            />
                                            <span>{module.displayName}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreatePayment}
                                >
                                    Record Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;

