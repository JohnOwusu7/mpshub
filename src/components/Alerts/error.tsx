import Swal from 'sweetalert2';

const showAlert = async (type: number) => {
    if (type === 13) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: '<a href="javascript:;">Why do I have this issue?</a>',
            padding: '2em',
            customClass: 'sweet-alerts',
        });
    }
}

<div className="mb-5">
    <div className="flex items-center justify-center">
        <button type="button" className="btn btn-dark" onClick={() => showAlert(13)}>
            With Footer
        </button>
    </div>
</div>
