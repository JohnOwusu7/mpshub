import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
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

  useEffect(() => {
    const getIssuesAndCount = async () => {
      const issues = await fetchIssues();
      const count = issues.length;
      const completedTask = issues.filter((issue: { isComplete: any; }) => issue.isComplete).length;
      const notCompletedTask = issues.filter((issue: { isComplete: any; }) => !issue.isComplete).length;
      const newNotAssigned = issues.filter((issue: { isAssigned: boolean }) => !issue.isAssigned).length;
      const percentageComplete = (completedTask / count) * 100;
      const percentageNotComplete = 100 - percentageComplete;
      setTotalCount(count);
      setCompletedIssueCount(completedTask);
      setNotCompletedIssueCount(notCompletedTask);
      setNewUnassignedTask(newNotAssigned);
      setPercentComplete(percentageComplete);
      setPercentNotComplete(percentageNotComplete);
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
                            <div className="dropdown">
                                <Dropdown
                                    offset={[0, 5]}
                                    btnClassName="hover:text-primary"
                                    button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}
                                >
                                    <ul>
                                        <li>
                                            <button type="button">This Week</button>
                                        </li>
                                        <li>
                                            <button type="button">Last Week</button>
                                        </li>
                                        <li>
                                            <button type="button">This Month</button>
                                        </li>
                                        <li>
                                            <button type="button">Last Month</button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
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

                            <div className="dropdown">
                                <Dropdown
                                    offset={[0, 5]}
                                    btnClassName="hover:text-primary"
                                    button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}
                                >
                                    <ul>
                                        <li>
                                            <button type="button">This Week</button>
                                        </li>
                                        <li>
                                            <button type="button">Last Week</button>
                                        </li>
                                        <li>
                                            <button type="button">This Month</button>
                                        </li>
                                        <li>
                                            <button type="button">Last Month</button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        <div className=" text-[#e95f2b] text-3xl font-bold my-10">
                            <span>{notCompletedIssueCount}</span>
                            <span className="text-black text-sm dark:text-white-light ltr:mr-2 rtl:ml-2"> Not Completed</span>
                            <IconTrendingUp className="text-success inline" />
                        </div>
                        <div className="flex items-center justify-between mb-2 font-semibold">
                                <div className="flex items-center">
                                    <IconSquareCheck className="w-4 h-4 text-success" />
                                </div>
                                <p className="text-primary">{percentNotComplete.toFixed(0)}% Pending Activities</p>
                            </div>
                            <div className="rounded-full h-2.5 p-0.5 bg-dark-light dark:bg-dark-light/10 mb-5">
                                <div className="bg-gradient-to-r from-[#1e9afe] to-[#60dfcd] h-full rounded-full" style={{ width: `${percentComplete}%` }}></div>
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

                {/* Analytics 3 */}
                <DailyReportDashboard />
            </div>
        </div>
    );
};

export default Analytics;
