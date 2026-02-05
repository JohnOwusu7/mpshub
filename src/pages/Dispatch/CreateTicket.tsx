import { useNavigate } from 'react-router-dom';
import CreateTicketModal from '../../components/CreateTicketModal';

/**
 * /ticket route: shows the Create Ticket modal immediately (e.g. when user clicks "Create ticket" in sidebar).
 * On close, redirects back to dashboard so there is no standalone "page" to click again.
 */
const CreateTicket = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate(-1);
        if (window.history.length <= 1) navigate('/');
    };

    return (
        <CreateTicketModal
            open={true}
            onClose={handleClose}
        />
    );
};

export default CreateTicket;
