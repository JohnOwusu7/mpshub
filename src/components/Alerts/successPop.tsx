import Swal from 'sweetalert2';

const showAlert = async (type: number) => {
    if (type === 2) {
        Swal.fire({
            icon: 'success',
            title: 'Good job!',
            text: 'You clicked the!',
            padding: '2em',
            customClass: 'sweet-alerts',
        });
    }
}

<div className="mb-5">
<div className="flex items-center justify-center">
    <button type="button" className="btn btn-primary" onClick={() => showAlert(1)}>
        Basic message
    </button>
</div>
</div>
