import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, } from 'react-redux';
import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconTrendingUp from '../../components/Icon/IconTrendingUp';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import { API_CONFIG } from '../../Api/apiConfig';
import axios from 'axios';
import DailyReportDashboard from './DailyReportDashboard';

const Analytics = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Analytics Admin'));
    });

    // Fetch issues from backend
const fetchIssues = async () => {
    try {
        const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.issues.endpoints.list}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching issues:', error.message);
      return [];
    }
  };

  const [totalCount, setTotalCount] = useState(0);
  const [completedIssueCount, setCompletedIssueCount] = useState(0);
  const [notCompletedIssueCount, setNotCompletedIssueCount] = useState(0);
  const [newUnassignedTask, setNewUnassignedTask] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);
  const [percentNotComplete, setPercentNotComplete] = useState(0);
  const [notCompleted, setNotCompleted] = useState<any[]>([]);
  const [viewPending, setViewPending] = useState<any>(false);

  useEffect(() => {
    const getIssuesAndCount = async () => {
      const issues = await fetchIssues();
      const count = issues.length;
      const completedTask = issues.filter((issue: { isComplete: any; }) => issue.isComplete).length;
      const notCompletedTask = issues.filter((issue: { isComplete: any; }) => !issue.isComplete).length;
      const newNotAssigned = issues.filter((issue: { isAssigned: boolean }) => !issue.isAssigned).length;
      const percentageComplete = (completedTask / count) * 100;
      const percentageNotComplete = 100 - percentageComplete;
      const pending = issues.filter((issue: {isComplete: any;}) => !issue.isComplete);
      setTotalCount(count);
      setCompletedIssueCount(completedTask);
      setNotCompletedIssueCount(notCompletedTask);
      setNewUnassignedTask(newNotAssigned);
      setPercentComplete(percentageComplete);
      setPercentNotComplete(percentageNotComplete);
      setNotCompleted(pending);
    };
    getIssuesAndCount();
  }, []);


    // totalActivitiesOptions
    const totalActivities: any = {
        series: [{ data: [21, 9, 36, 12, 44, 25, 59, 41, 66, 25] }],
        options: {
            chart: {
                height: 58,
                type: 'line',
                fontFamily: 'Nunito, sans-serif',
                sparkline: {
                    enabled: true,
                },
                dropShadow: {
                    enabled: true,
                    blur: 3,
                    color: '#009688',
                    opacity: 0.4,
                },
            },
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            colors: ['#009688'],
            grid: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
        },
    };
    // CompletedActivitiesOptions
    const completedActivities: any = {
        series: [{ data: [22, 19, 30, 47, 32, 44, 34, 55, 41, 69] }],
        options: {
            chart: {
                height: 58,
                type: 'line',
                fontFamily: 'Nunito, sans-serif',
                sparkline: {
                    enabled: true,
                },
                dropShadow: {
                    enabled: true,
                    blur: 3,
                    color: '#e2a03f',
                    opacity: 0.4,
                },
            },
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            colors: ['#e2a03f'],
            grid: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
        },
    };
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="panel h-full sm:col-span-2 lg:col-span-1">
                        {/* statistics */}
                        <div className="flex justify-between dark:text-white-light mb-5">
                            <h5 className="font-semibold text-lg ">Activity Statistics</h5>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-8 text-sm text-[#515365] font-bold">
                            <div>
                                <div>
                                    <div>Total Activities</div>
                                    <div className="text-[#f8538d] text-3xl font-bold">{totalCount}</div>
                                </div>

                                <ReactApexChart series={totalActivities.series} options={totalActivities.options} type="line" height={58} className="overflow-hidden" />
                            </div>

                            <div>
                                <div>
                                    <div>Completed Activities</div>
                                    <div className="text-[#f8538d] text-3xl font-bold">{completedIssueCount}</div>
                                </div>

                                <ReactApexChart series={completedActivities.series} options={completedActivities.options} type="line" height={58} className="overflow-hidden" />
                            </div>
                        </div>
                    </div>

                    <div className="panel h-full">
                        <div className="flex justify-between dark:text-white-light mb-5">
                            <h5 className="font-semibold text-lg ">Pending Jobs </h5>
                        </div>
                        <div className=" text-[#e95f2b] text-3xl font-bold my-10">
                            <span>{notCompletedIssueCount}</span>
                            <span className="text-black text-sm dark:text-white-light ltr:mr-2"> Not Completed</span>
                            <IconTrendingUp className="text-success inline" />
                        </div>
                        <div className="flex items-center justify-between font-semibold">
                                <div className="flex items-center">
                                    <IconSquareCheck className="w-4 h-4 text-success" />
                                </div>
                                <p className="text-primary">{percentNotComplete.toFixed(0)}% Pending Activities</p>
                            </div>
                            <div className="rounded-full h-2.5 p-0.5 bg-dark-light">
                                <div className="bg-gradient-to-r from-[#1e9afe] to-[#60dfcd] h-full rounded-full" style={{ width: `${percentComplete}%` }}></div>
                            </div>
                            <div className="w-full absolute bottom-0 flex items-center justify-between p-5 -mx-5">
                                <button  onClick={() => setViewPending(true)} className="btn btn-secondary btn-lg w-full border-0 bg-gradient-to-r from-[#3d38e1] to-[#1e9afe]" >
                                    View Pending jobs
                                </button>
                            </div>
                    </div>

                    <div className="panel h-full">
                        <div className="flex items-center justify-between border-b  border-white-light dark:border-[#1b2e4b] -m-5 mb-5 p-5">
                            <div className="flex">
                                <div className="media-aside align-self-start">

                                </div>
                                <div className="font-semibold flex flex-row items-center">
                                    <h6 className="mr-2">New Reported Activity</h6>
                                    <div className="mr-2 text-[#e95f2b] text-3xl font-bold">{newUnassignedTask}</div>
                                    <p className="text-xs text-white-dark mt-1">Unassigned Activities</p>
                                </div>

                            </div>
                        </div>
                        <div className="font-semibold text-center pb-8">
                            <div className="flex items-center justify-between mb-2 font-semibold">
                                <div className="flex items-center">
                                    <IconSquareCheck className="w-4 h-4 text-success" />
                                </div>
                                <p className="text-primary">{percentNotComplete.toFixed(0)}% Activities Not Completed</p>
                            </div>
                            <div className="flex items-center justify-between">

                            <div className="w-full rounded-full h-5 p-1 bg-dark-light overflow-hidden shadow-3xl dark:shadow-none dark:bg-dark-light/10">
                                <div
                                    className="bg-gradient-to-r from-[#1e9afe] to-[#60dfcd] h-full rounded-full"
                                    style={{ width: `${percentNotComplete}%` }}
                                ></div>

                            </div>
                        </div>
                            <div className="flex items-center justify-between mb-2 font-semibold">
                                <div className="flex items-center">
                                    <IconSquareCheck className="w-4 h-4 text-success" />

                                </div>
                                <p className="text-primary">{percentComplete.toFixed(0)}% Activities Completed</p>
                            </div>
                            <div className="w-full rounded-full h-5 p-1 bg-dark-light overflow-hidden mb-5 shadow-3xl dark:shadow-none dark:bg-dark-light/10">
                                <div
                                    className="bg-gradient-to-r from-[#1e9afe] to-[#60dfcd] h-full rounded-full"
                                    style={{ width: `${percentComplete}%` }}
                                ></div>

                            </div>

                            <div className="w-full absolute bottom-0 flex items-center justify-between p-5 -mx-5">
                                <Link to={'/task-manager'} className="btn btn-secondary btn-lg w-full border-0 bg-gradient-to-r from-[#3d38e1] to-[#1e9afe]">
                                    View Hub
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <Transition appear show={viewPending} as={Fragment}>
                    <Dialog as='div' open={viewPending} onClose={() => {setViewPending(false)}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="p-5">
                                    {/* <div className='pt-5'> */}
                                    <h2 className='text-[#cd1a1a] text-3xl font-bold pb-5 text-center'>{notCompletedIssueCount} Pending Jobs</h2>
                                        <table className='min-w-full bg-white border-gray-400'>
                                            <thead>
                                                <tr>
                                                    <th className='py-2 px-4 border-b'>Assignee</th>
                                                    <th className='py-2 px-4 border-b'>concern</th>
                                                    <th className='py-2 px-4 border-b'>Issued Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {notCompleted.map((notC, index) => (
                                                     <tr key={index}>
                                                        <td className='py-2 px-2 border-b'>{notC?.assignedTo ? `${notC?.assignedTo?.firstName} ${notC?.assignedTo?.lastName}` : notC.tag || 'No one'}</td>
                                                        <td className='py-2 px-4 border-b'>{notC.title}</td>
                                                        <td className='py-2 px-2 border-b'>{notC.progress}</td>
                                                     </tr> 
                                                ))} 
                                            </tbody>
                                        </table>
                                    {/* </div> */}
                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 mt-5" onClick={() => setViewPending(false)}>Close</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                    </Dialog>
                </Transition>

                {/* Analytics 3 */}
                <DailyReportDashboard />
            </div>
        </div>
    );
};

export default Analytics;
