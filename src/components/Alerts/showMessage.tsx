import Swal from "sweetalert2";

interface ShowMessageOptions {
  message: string;
  success: boolean;
  duration?: number;
}

const showMessage = ({ message, success, duration = 3000 }: ShowMessageOptions) => {
  const type = success ? 'success' : 'error';

  const toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: duration,
    customClass: { container: 'toast' },
  });

  toast.fire({
    icon: type,
    title: message,
    padding: '10px 20px',
  });
};

export default showMessage;
