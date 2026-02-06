import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { fetchCompanyInfo } from '../../store/companySlice';
import CreateTicketModal from '../../components/CreateTicketModal';
import ModuleNotSubscribed from '../../components/ModuleNotSubscribed';

const ISSUE_REPORTING_MODULE = 'issueReporting';

/**
 * /ticket route: shows the Create Ticket modal immediately (e.g. when user clicks "Create ticket" in sidebar).
 * On close, redirects back to dashboard. If Issues module is not subscribed, shows ModuleNotSubscribed instead.
 */
const CreateTicket = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: IRootState) => state.user.user);
    const companyInfo = useSelector((state: IRootState) => state.company?.companyInfo);

    useEffect(() => {
        if (user?.companyId && !companyInfo) {
            dispatch(fetchCompanyInfo(user.companyId) as any);
        }
    }, [user?.companyId, companyInfo, dispatch]);

    const handleClose = () => {
        navigate(-1);
        if (window.history.length <= 1) navigate('/');
    };

    const subscribed = companyInfo?.subscribedModules ?? [];
    const issuesSubscribed = subscribed.includes(ISSUE_REPORTING_MODULE);

    if (companyInfo && !issuesSubscribed) {
        return <ModuleNotSubscribed moduleName="Issues" />;
    }

    return (
        <CreateTicketModal
            open={true}
            onClose={handleClose}
        />
    );
};

export default CreateTicket;
