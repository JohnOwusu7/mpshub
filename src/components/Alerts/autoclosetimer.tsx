import Swal from 'sweetalert2';

const showAlert = async (type: number) => {
    if (type === 7) {
        let timerInterval: string | number | NodeJS.Timer | undefined;
        Swal.fire({
            title: 'Auto close alert!',
            html: 'I will close in <b></b> milliseconds.',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                //   Swal.showLoading();
                const b: any = Swal.getHtmlContainer()?.querySelector('b');
                timerInterval = setInterval(() => {
                    b.textContent = Swal.getTimerLeft();
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            },
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log('I was closed by the timer');
            }
        });
    }
}

<div className="mb-5">
    <div className="flex items-center justify-center">
        <button type="button" className="btn btn-primary" onClick={() => showAlert(7)}>
            Message timer
        </button>
    </div>
</div>
