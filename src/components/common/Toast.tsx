import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast(message, { type, autoClose: type === 'success' ? 3000 : 6000 });
};

export const ToastProvider = () => (
    <ToastContainer position="bottom-right" newestOnTop closeOnClick pauseOnHover draggable />
);
