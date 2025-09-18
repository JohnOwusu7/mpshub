import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { addReport, ApiResponse } from '../../Api/api';
import IconSend from '../../components/Icon/IconSend';
import showMessage from '../../components/Alerts/showMessage';
import { IRootState } from '../../store';

interface ReportFormData {
    tasksAccomplished: string;
    ongoingTask: string;
    issuesConcerns: string;
    plansNextDay: string;
    additionalComments: string;
    shift: string;
}

const DailyReport: React.FC = () => {
    const authenticatedUser = useSelector((state: IRootState) => state.user.user);
    const user = authenticatedUser || { firstName: 'Guest', email: '' };

    const dispatch = useDispatch();
    const [formData, setFormData] = useState<ReportFormData>({
        tasksAccomplished: '',
        ongoingTask: '',
        issuesConcerns: '',
        plansNextDay: '',
        additionalComments: '',
        shift: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ReportFormData, string>>>({});
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        dispatch(setPageTitle('Daily Report'));
    }, [dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setValidationErrors(prevState => ({
            ...prevState,
            [name]: ''
        }));
    };

    const validateForm = () => {
        const errors: Partial<Record<keyof ReportFormData, string>> = {};
        if (!formData.tasksAccomplished) errors.tasksAccomplished = 'Completed Task is required';
        if (!formData.ongoingTask) errors.ongoingTask = 'Ongoing Task is required';
        if (!formData.issuesConcerns) errors.issuesConcerns = 'Issues and Concerns are required';
        if (!formData.plansNextDay) errors.plansNextDay = 'Next Step is required';
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }
        setLoading(true);

        try {
            const response: ApiResponse = await addReport(formData, token);
            if (response.success) {
                showMessage({success:true, message: response.message});
                setFormData({
                    tasksAccomplished: '',
                    ongoingTask: '',
                    issuesConcerns: '',
                    plansNextDay: '',
                    additionalComments: '',
                    shift: ''
                });
                setError(null);

            } else {
                setError('Failed to send report: ' + response.message);
            }
        } catch (error) {
            console.error('Error sending report:', error);
            setError('Error sending report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex xl:flex-row flex-col gap-2.5">
                <div className="panel px-0 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                    <div className="flex justify-between flex-wrap px-4">
                        <div className="mb-6 lg:w-1/2 w-full">
                            <div className="flex items-center text-black dark:text-white shrink-0">
                                <img src="/minesphere.png" alt="img" className="w-14" />
                            </div>
                            <div className="space-y-1 mt-6 text-gray-500 dark:text-gray-400">
                                <div>Mining Project and Systems</div>
                                <div>Daily Report</div>
                                <div></div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 w-full lg:max-w-fit">
                            <div className="flex items-center">
                                <label htmlFor="name" className="flex-1 ltr:mr-2 rtl:ml-2 mb-0">
                                    {user.firstName} {user.lastName}
                                </label>
                                </div>
                            <div className="flex items-center mt-4">
                                <label htmlFor="section" className="flex-1 ltr:mr-2 rtl:ml-2 mb-0">
                                {user.position}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
                    <div className="mt-8 px-4">
                        <div className="flex justify-between lg:flex-row flex-col">
                            <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                                <div className="text-lg">Report 101 :-</div>
                                <div className="mt-4">
                                    <label htmlFor="tasksAccomplished" className="ltr:mr-2 rtl:ml-2 mb-0 block">
                                        Today's Task
                                    </label>
                                    <input
                                        id="tasksAccomplished"
                                        type="text"
                                        name="tasksAccomplished"
                                        value={formData.tasksAccomplished}
                                        onChange={handleChange}
                                        className="form-input w-full"
                                        placeholder="Enter any completed tasks..."
                                    />
                                    {validationErrors.tasksAccomplished && <div className="text-red-500 mt-1">{validationErrors.tasksAccomplished}</div>}
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="ongoingTask" className="ltr:mr-2 rtl:ml-2 mb-0 block">
                                        Ongoing Task
                                    </label>
                                    <input
                                        id="ongoingTask"
                                        type="text"
                                        name="ongoingTask"
                                        value={formData.ongoingTask}
                                        onChange={handleChange}
                                        className="form-input w-full"
                                        placeholder="Enter Ongoing task..."
                                    />
                                    {validationErrors.ongoingTask && <div className="text-red-500 mt-1">{validationErrors.ongoingTask}</div>}
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="issuesConcerns" className="ltr:mr-2 rtl:ml-2 mb-0 block">
                                        Issues and Concerns
                                    </label>
                                    <input
                                        id="issuesConcerns"
                                        type="text"
                                        name="issuesConcerns"
                                        value={formData.issuesConcerns}
                                        onChange={handleChange}
                                        className="form-input w-full"
                                        placeholder="Any Issues and concerns during shift hours..."
                                    />
                                    {validationErrors.issuesConcerns && <div className="text-red-500 mt-1">{validationErrors.issuesConcerns}</div>}
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="plansNextDay" className="ltr:mr-2 rtl:ml-2 mb-0 block">
                                        Next Step
                                    </label>
                                    <input
                                        id="plansNextDay"
                                        type="text"
                                        name="plansNextDay"
                                        value={formData.plansNextDay}
                                        onChange={handleChange}
                                        className="form-input w-full"
                                        placeholder="What is the next step..."
                                    />
                                    {validationErrors.plansNextDay && <div className="text-red-500 mt-1">{validationErrors.plansNextDay}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 px-4">
                        <label htmlFor="additionalComments" className="block">Additional Comments</label>
                        <textarea
                            id="additionalComments"
                            name="additionalComments"
                            value={formData.additionalComments}
                            onChange={handleChange}
                            className="form-textarea w-full min-h-[130px]"
                            placeholder="Comments...."
                        ></textarea>
                    </div>
                </div>
                <div className="xl:w-96 w-full xl:mt-0 mt-6">
                    <div className="panel mb-5">
                        <div className="mt-4">
                            <label htmlFor="shift" className="block">Shift Monitoring</label>
                            <select
                                id="shift"
                                name="shift"
                                value={formData.shift}
                                onChange={handleChange}
                                className="form-select w-full"
                            >
                                <option value="">Select Shift</option>
                                <option value="SHIFT A">A</option>
                                <option value="SHIFT B">B</option>
                                <option value="SHIFT C">C</option>
                                <option value="STRAIGHT">Straight Day</option>
                            </select>
                            {validationErrors.shift && <div className="text-red-500 mt-1">{validationErrors.shift}</div>}
                        </div>
                    </div>
                    <div className="panel">
                        <div className="grid xl:grid-cols-1 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
                            <button type="submit" className="btn btn-info w-full gap-2">
                            {loading ? (
                                <>
                                <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>
                                Loading
                                </>
                                ) : (
                                  <>
                                <IconSend className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                Send Report</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default DailyReport;
