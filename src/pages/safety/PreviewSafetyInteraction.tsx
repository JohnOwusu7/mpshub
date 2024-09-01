import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconEdit from '../../components/Icon/IconEdit';
import { useLocation } from 'react-router-dom';

interface ImprovementDescription {
    description: string;
    by: string;
    date: string;
}

interface SafetyInteractionRecord {
    date: string;
    areaDept: string;
    doneBy: string;
    interactionPersonnel: string;
    significantAspects?: string;
    issuesConcerns?: string;
    opportunitiesForImprovement?: string;
    improvementDescriptions: ImprovementDescription[];
}

const PreviewSafetyInteractionRecord = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { item } = location.state as { item: SafetyInteractionRecord };

    useEffect(() => {
        dispatch(setPageTitle('Safety Interaction Record Preview'));
    }, [dispatch]);

    const exportTable = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex items-center lg:justify-end justify-center flex-wrap gap-4 mb-6">
                <button type="button" className="btn btn-primary gap-2" onClick={exportTable}>
                    <IconPrinter />
                    Print {item.areaDept}
                </button>

                <Link to="/apps/safety-interaction/edit" className="btn btn-warning gap-2">
                    <IconEdit />
                    Edit
                </Link>
            </div>
            <div className="panel">
                <div className="flex justify-between flex-wrap gap-4 px-4">
                    <div className="text-2xl font-semibold uppercase">Safety Interaction Record</div>
                    <div className="shrink-0">
                        <img src="/logo1.png" alt="img" className="w-14 ltr:ml-auto rtl:mr-auto" />
                    </div>
                </div>
                <div className="ltr:text-right rtl:text-left px-4">
                    <div className="space-y-1 mt-6 text-white-dark">
                        <div>FORM NO.: IDP/HSE/F/013</div>
                        <div>{item.date}</div>
                        <div>{item.areaDept}</div>
                    </div>
                </div>

                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />

                {/* Section 2 */}
                <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap">
                    <div className="flex-1">
                        <div className="space-y-1 text-white-dark">
                            <div>Done By:</div>
                            <div className="text-black font-semibold">{item.doneBy}</div>
                            <div>Interaction Personnel:</div>
                            <div className="text-black font-semibold">{item.interactionPersonnel}</div>
                            {item.significantAspects && (
                                <>
                                    <div>Significant Aspects:</div>
                                    <div className="text-black font-semibold">{item.significantAspects}</div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between sm:flex-row flex-col gap-6 lg:w-2/3">
                        <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
                            {item.issuesConcerns && (
                                <div className="flex items-center w-full justify-between mb-2">
                                    <div className="text-white-dark">Issues/Concerns:</div>
                                    <div>{item.issuesConcerns}</div>
                                </div>
                            )}
                            {item.opportunitiesForImprovement && (
                                <div className="flex items-center w-full justify-between mb-2">
                                    <div className="text-white-dark">Opportunities for Improvement:</div>
                                    <div>{item.opportunitiesForImprovement}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />

                {/* Improvement Descriptions Section */}
                <h2>Improvement Descriptions</h2>
                <div className="mt-4 space-y-4">
                    {item.improvementDescriptions.map((improvement, index) => (
                        <div key={index} className="border-b pb-4">
                            <p><strong>Description:</strong> {improvement.description}</p>
                            <p><strong>By:</strong> {improvement.by}</p>
                            <p><strong>Date:</strong> {improvement.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreviewSafetyInteractionRecord;
