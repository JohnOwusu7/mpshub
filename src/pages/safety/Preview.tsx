import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconEdit from '../../components/Icon/IconEdit';

interface EvaluationQuestion {
    answer: boolean;
    comment?: string;
}

interface Recommendation {
    answer: boolean;
    personResponsible?: string;
    signature?: string;
    date?: Date;
}

interface PlannedJobObservation {
    job: string;
    department: string;
    personObserving: string;
    personBeingObserved: string;
    reasons: string[];
    taskProcedures: string;
    compliant: string;
    reasonsForDeviation: string;
    evaluation: {
        recognizedHazards?: EvaluationQuestion;
        correctTools?: EvaluationQuestion;
        correctPPE?: EvaluationQuestion;
        workplaceSafe?: EvaluationQuestion;
        healthSafetyOthers?: EvaluationQuestion;
        goodHousekeeping?: EvaluationQuestion;
        safeLogicalSteps?: EvaluationQuestion;
    };
    recommendations: {
        writeNewProcedure?: Recommendation;
        modifyExistingProcedure?: Recommendation;
        repairEquipment?: Recommendation;
        rearrangeEquipment?: Recommendation;
        modifyHSERule?: Recommendation;
        retrainWorker?: Recommendation;
        ergonomicSurvey?: Recommendation;
        relocateWorker?: Recommendation;
    };
    observationsReviewed: boolean;
    signatureObserver: string;
    signatureObserved: string;
    observersGeneralComments: string;
    // status: string;
}

const Preview = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { item } = location.state as { item: PlannedJobObservation };

    useEffect(() => {
        dispatch(setPageTitle('Planned Job Preview'));
    }, [dispatch]);

    const exportTable = () => {
        window.print();
    };

    return (
        <div>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable, .printable * {
                        visibility: visible;
                    }
                    .printable {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                        page-break-before: always;
                        page-break-after: always;
                    }
                    @page {
                        size: auto; 
                        margin: 20mm;
                    }
                }
                `}
            </style>
            <div className="flex items-center lg:justify-end justify-center flex-wrap gap-4 mb-6">
                <button
                    type="button"
                    className="btn btn-primary gap-2"
                    onClick={exportTable}
                >
                    <IconPrinter />
                    Print {item.job}
                </button>
                <Link to="/apps/invoice/edit" className="btn btn-warning gap-2">
                    <IconEdit />
                    Edit
                </Link>
            </div>
            <div className="panel printable">
                <div className="flex justify-between flex-wrap gap-4 px-4">
                    <div className="text-2xl font-semibold uppercase">Planned Job Observation</div>
                    <div className="shrink-0">
                        <img src="/logo1.png" alt="Logo" className="w-14" />
                    </div>
                </div>
                <div className="px-4">
                    <div className="space-y-1 mt-6 text-white-dark">
                        <div>FORM NO.: IDP/HSE/F/012</div>
                        <div>{item.job}</div>
                        <div>{item.department}</div>
                    </div>
                </div>

                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />

                <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap">
                    <div className="flex-1">
                        <div className="space-y-1 text-white-dark">
                            <div>Person Observing</div>
                            <div className="text-black font-semibold">{item.personObserving}</div>
                            <div>Signature: {item.signatureObserver}</div>
                            <div>Person Being Observed</div>
                            <div className="text-black font-semibold">{item.personBeingObserved}</div>
                            <div>Signature: {item.signatureObserved}</div>
                        </div>
                    </div>
                    <div className="flex justify-between sm:flex-row flex-col gap-6 lg:w-2/3">
                        <div className="lg:w-2/5 sm:w-1/2">
                            <div className="mb-2">
                                <div className="text-white-dark">Reasons for Observing:</div>
                                <div>{item.reasons.join(', ')}</div>
                            </div>
                            <div className="mb-2">
                                <div className="text-white-dark">Task Procedure:</div>
                                <div className="whitespace-nowrap">{item.taskProcedures}</div>
                            </div>
                            <div className="mb-2">
                                <div className="text-white-dark">Reasons for Deviation:</div>
                                <div>{item.reasonsForDeviation}</div>
                            </div>
                        </div>
                        <div className="lg:w-2/5 sm:w-1/2">
                            <div className="mb-2">
                                <div className="text-white-dark">Compliant:</div>
                                <div>{item.compliant}</div>
                            </div>
                            <div className="mb-2">
                                <div className="text-white-dark">Observers General comments:</div>
                                <div>{item.observersGeneralComments}</div>
                            </div>
                            <div className="mb-2">
                                <div className="text-white-dark">Observations Reviewed</div>
                                <div>{item.observationsReviewed ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />

                <section>
                    <h2 className="text-xl font-semibold mb-4">Evaluation</h2>
                    <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap">
                        {Object.keys(item.evaluation).map((key) => {
                            const evalItem = item.evaluation[key as keyof typeof item.evaluation];
                            if (evalItem) {
                                return (
                                    <div key={key} className="flex-1">
                                        <h3 className="font-semibold">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                                        <p><strong>Answer:</strong> {evalItem.answer ? 'Yes' : 'No'}</p>
                                        {evalItem.comment && <p><strong>Comment:</strong> {evalItem.comment}</p>}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                    <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap">
                        {Object.keys(item.recommendations).map((key) => {
                            const recItem = item.recommendations[key as keyof typeof item.recommendations];
                            if (recItem) {
                                return (
                                    <div key={key} className="mb-4">
                                        <h3 className="font-semibold">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                                        <p><strong>Answer:</strong> {recItem.answer ? 'Yes' : 'No'}</p>
                                        {recItem.personResponsible && <p><strong>Person Responsible:</strong> {recItem.personResponsible}</p>}
                                        {recItem.signature && <p><strong>Signature:</strong> {recItem.signature}</p>}
                                        {recItem.date && <p><strong>Date:</strong> {recItem.date.toDateString()}</p>}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Preview;
