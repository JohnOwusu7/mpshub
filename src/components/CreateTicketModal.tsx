import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import IconX from './Icon/IconX';
import { API_CONFIG } from '../Api/apiConfig';
import axiosInstance from '../Api/axiosInstance';
import { getAllServicesApi } from '../Api/api';
import type { IService, OnboardingStep } from '../Api/api';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import ModuleNotSubscribed from './ModuleNotSubscribed';

const ISSUE_REPORTING_MODULE = 'issueReporting';

const defaultParams = {
    title: '',
    description: '',
    priority: '',
    location: '',
    serviceId: '',
};

interface CreateTicketModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateTicketModal = ({ open, onClose, onSuccess }: CreateTicketModalProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [params, setParams] = useState(defaultParams);
    const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<IService[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);

    const selectedService = services.find((s) => s._id === params.serviceId);
    const hasGuidedForm =
        !!selectedService?.onboardingTemplate?.steps?.length;

    const authenticatedUser = useSelector((state: IRootState) => state.user.user);
    const companyInfo = useSelector((state: IRootState) => state.company?.companyInfo);
    const companyId = authenticatedUser?.companyId;
    const issuesModuleSubscribed = (companyInfo?.subscribedModules ?? []).includes(ISSUE_REPORTING_MODULE);

    useEffect(() => {
        if (!open) return;
        setParams({ ...defaultParams });
        setGuidedAnswers({});
    }, [open]);

    useEffect(() => {
        if (!params.serviceId) setGuidedAnswers({});
    }, [params.serviceId]);

    useEffect(() => {
        if (!companyId) {
            setServicesLoading(false);
            return;
        }
        setServicesLoading(true);
        getAllServicesApi(companyId)
            .then(setServices)
            .catch(() => setServices([]))
            .finally(() => setServicesLoading(false));
    }, [companyId]);

    useEffect(() => {
        if (!open) return;
        const form = formRef.current;
        const handler = (e: KeyboardEvent) => {
            const el = e.target as HTMLInputElement | HTMLTextAreaElement;
            if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return;
            if (!form?.contains(el)) return;
            if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation();
                e.preventDefault();
                const char = e.key === ' ' ? ' ' : '\n';
                const start = el.selectionStart ?? el.value.length;
                const end = el.selectionEnd ?? el.value.length;
                const newVal = el.value.slice(0, start) + char + el.value.slice(end);
                el.value = newVal;
                el.selectionStart = el.selectionEnd = start + 1;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };
        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, [open]);

    const buildGuidedTitleAndDescription = (): { title: string; descriptionText: string } => {
        const steps = selectedService?.onboardingTemplate?.steps ?? [];
        const parts = steps.map((s) => {
            const answer = (guidedAnswers[s.key] || '').trim();
            const otherText = (guidedAnswers[s.key + '_other'] || '').trim();
            const fullAnswer = otherText ? `${answer || '—'}\n${otherText}` : (answer || '—');
            return `${s.question}\n${fullAnswer}`;
        });
        const descriptionText = parts.join('\n\n');
        const firstAnswer = steps.length ? (guidedAnswers[steps[0].key] || '').trim() : '';
        const title = firstAnswer || (selectedService ? `Guided: ${selectedService.name}` : 'Guided ticket');
        return { title, descriptionText };
    };

    const handleSubmit = async () => {
        if (!params.serviceId) {
            showMessage('Please select a service so your ticket is routed to the right team.', 'error');
            return;
        }

        let title: string;
        let descriptionText: string | undefined;
        if (hasGuidedForm) {
            const built = buildGuidedTitleAndDescription();
            title = built.title;
            descriptionText = built.descriptionText;
        } else {
            const titleTrimmed = (params.title || '').trim();
            if (!titleTrimmed) {
                showMessage('Title is required.', 'error');
                return;
            }
            title = titleTrimmed;
            descriptionText = params.description;
        }

        const payload = {
            title,
            descriptionText,
            priority: params.priority || undefined,
            location: params.location || undefined,
            serviceId: params.serviceId,
        };

        try {
            setLoading(true);
            await axiosInstance.post(API_CONFIG.issues.endpoints.add, payload);
            showMessage('Ticket created successfully. It has been routed to the right team.');
            setParams({ ...defaultParams });
            setGuidedAnswers({});
            onSuccess?.();
            onClose();
        } catch (error: any) {
            if (error?.response?.data?.code === 'MODULE_NOT_SUBSCRIBED') {
                showMessage('Your company is not subscribed to the Issues module. Contact your administrator.', 'error');
            } else {
                const msg = error.response?.data?.error || error.message || 'Failed to create ticket. Please try again.';
                showMessage(msg, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { value, id } = e.target;
        setParams((prev) => ({ ...prev, [id]: value }));
    };

    const setGuidedAnswer = (key: string, value: string) => {
        setGuidedAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3500,
            customClass: { container: 'toast' },
        });
        toast.fire({ icon: type, title: msg, padding: '10px 20px' });
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" open={open} onClose={onClose} className="relative z-[51]">
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
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    Create a ticket
                                </div>
                                <div className="p-5">
                                    {companyInfo && !issuesModuleSubscribed ? (
                                        <ModuleNotSubscribed moduleName="Issues" compact />
                                    ) : (
                                        <>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Choose a service and the system will route your ticket to the right department and team.
                                    </p>
                                    <form
                                        ref={formRef}
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSubmit();
                                        }}
                                    >
                                        <div className="mb-5">
                                            <label htmlFor="serviceId">Service <span className="text-danger">*</span></label>
                                            <select
                                                id="serviceId"
                                                className="form-select"
                                                value={params.serviceId}
                                                onChange={changeValue}
                                                required
                                                disabled={servicesLoading}
                                            >
                                                <option value="">Select service</option>
                                                {services
                                                    .filter((s) => s.isActive !== false)
                                                    .map((s) => (
                                                        <option key={s._id} value={s._id}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            {!servicesLoading && services.length === 0 && (
                                                <p className="text-xs text-warning mt-1">No services configured. Ask your administrator to add services in Service Management.</p>
                                            )}
                                            {hasGuidedForm && (
                                                <p className="text-xs text-primary mt-1">This service uses a guided form. Answer the questions below.</p>
                                            )}
                                        </div>

                                        {hasGuidedForm ? (
                                            /* Guided form: onboarding template steps only */
                                            <div className="space-y-4 mb-5">
                                                {(selectedService?.onboardingTemplate?.steps ?? []).map((step: OnboardingStep) => (
                                                    <div key={step.key} className="mb-5">
                                                        <label htmlFor={`guided-${step.key}`}>{step.question}</label>
                                                        {step.inputType === 'textarea' ? (
                                                            <textarea
                                                                id={`guided-${step.key}`}
                                                                rows={3}
                                                                className="form-textarea resize-none min-h-[80px] mt-1 block w-full"
                                                                placeholder={step.question}
                                                                value={guidedAnswers[step.key] ?? ''}
                                                                onChange={(e) => setGuidedAnswer(step.key, e.target.value)}
                                                            />
                                                        ) : step.inputType === 'select' && step.options?.length ? (
                                                            <>
                                                            <select
                                                                id={`guided-${step.key}`}
                                                                className="form-select mt-1 block w-full"
                                                                value={guidedAnswers[step.key] ?? ''}
                                                                onChange={(e) => {
                                                                    const v = e.target.value;
                                                                    setGuidedAnswer(step.key, v);
                                                                    if (!v.toLowerCase().includes('other')) setGuidedAnswer(step.key + '_other', '');
                                                                }}
                                                            >
                                                                <option value="">Select...</option>
                                                                {step.options.map((opt) => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                            {(guidedAnswers[step.key] ?? '').toLowerCase().includes('other') && (
                                                                <input
                                                                    type="text"
                                                                    className="form-input mt-2 block w-full"
                                                                    placeholder="Please specify (you can write a sentence)"
                                                                    value={guidedAnswers[step.key + '_other'] ?? ''}
                                                                    onChange={(e) => setGuidedAnswer(step.key + '_other', e.target.value)}
                                                                />
                                                            )}
                                                            </>
                                                        ) : (
                                                            <input
                                                                id={`guided-${step.key}`}
                                                                type="text"
                                                                className="form-input mt-1 block w-full"
                                                                placeholder={step.question}
                                                                value={guidedAnswers[step.key] ?? ''}
                                                                onChange={(e) => setGuidedAnswer(step.key, e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Default free-text form: Title and Description */
                                            <>
                                        <div className="mb-5">
                                            <label htmlFor="title">Title <span className="text-danger">*</span></label>
                                            <input
                                                id="title"
                                                type="text"
                                                placeholder="Short summary of the issue"
                                                className="form-input"
                                                value={params.title}
                                                onChange={changeValue}
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="description">Description</label>
                                            <textarea
                                                id="description"
                                                rows={3}
                                                className="form-textarea resize-none min-h-[100px]"
                                                placeholder="Describe the issue"
                                                value={params.description}
                                                onChange={changeValue}
                                            />
                                        </div>
                                            </>
                                        )}

                                        {!hasGuidedForm && (
                                            <div className="mb-5">
                                                <label htmlFor="location">Location</label>
                                                <input
                                                    id="location"
                                                    type="text"
                                                    placeholder="Enter Location"
                                                    className="form-input"
                                                    value={params.location}
                                                    onChange={changeValue}
                                                />
                                            </div>
                                        )}
                                        <div className="mb-5">
                                            <label htmlFor="priority">Priority</label>
                                            <select id="priority" className="form-select" value={params.priority} onChange={changeValue}>
                                                <option value="">Select priority</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end items-center mt-8 gap-2">
                                            <button type="button" className="btn btn-outline-danger" onClick={onClose}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                {loading ? 'Creating…' : 'Create ticket'}
                                            </button>
                                        </div>
                                    </form>
                                        </>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CreateTicketModal;
