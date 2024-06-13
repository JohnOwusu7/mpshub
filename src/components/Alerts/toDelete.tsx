import Swal from 'sweetalert2';

interface showDeleteOptions {
    message: string;
    success: boolean;
    result: string;
}

const showAlert = ({ message, success, result }: showDeleteOptions) => {
    const type = success ? 'success' : 'warning';

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-secondary',
            cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
            popup: 'sweet-alerts',
        },
        buttonsStyling: false,
    });

    return swalWithBootstrapButtons.fire({
        title: message,
        text: "You won't be able to revert this!",
        icon: type,
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
        padding: '2em',
    });
};

export default showAlert;
