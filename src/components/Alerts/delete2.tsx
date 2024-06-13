import Swal from 'sweetalert2';

const showAlert = async (type: number) => {
    if (type === 10) {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                Swal.fire({ title: 'Deleted!', text: 'Your file has been deleted.', icon: 'success', customClass: 'sweet-alerts' });
            }
        });
    }
}

<div className="mb-5">
    <div className="flex items-center justify-center">
        <button type="button" className="btn btn-success" onClick={() => showAlert(10)}>
            Confirm
        </button>
    </div>
</div>
