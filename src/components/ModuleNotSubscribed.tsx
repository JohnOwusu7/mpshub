import React from 'react';
import IconInfoTriangle from './Icon/IconInfoTriangle';
import { Link } from 'react-router-dom';

interface ModuleNotSubscribedProps {
    /** Display name of the module (e.g. "Issues" or "Issue Reporting") */
    moduleName?: string;
    /** Optional custom message */
    message?: string;
    /** If true, render as a compact inline card; otherwise full-page style */
    compact?: boolean;
    className?: string;
}

const ModuleNotSubscribed: React.FC<ModuleNotSubscribedProps> = ({
    moduleName = 'Issues',
    message,
    compact = false,
    className = '',
}) => {
    const defaultMessage = `Your company is not subscribed to the ${moduleName} module.`;
    const displayMessage = message || defaultMessage;

    if (compact) {
        return (
            <div
                className={`rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 ${className}`}
                role="alert"
            >
                <div className="flex items-start gap-3">
                    <IconInfoTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{displayMessage}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Contact your company administrator or Super Admin to subscribe to this module.
                        </p>
                        <Link
                            to="/dashboard/home"
                            className="inline-block mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center ${className}`}
            role="alert"
        >
            <div className="max-w-md w-full rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-8 shadow-sm">
                <IconInfoTriangle className="w-16 h-16 mx-auto text-amber-500 dark:text-amber-400 mb-4" />
                <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Module not subscribed
                </h2>
                <p className="text-amber-800 dark:text-amber-200 mb-4">{displayMessage}</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-6">
                    Contact your company administrator or Super Admin to subscribe to this module and access this feature.
                </p>
                <Link
                    to="/dashboard/home"
                    className="btn btn-primary"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default ModuleNotSubscribed;
