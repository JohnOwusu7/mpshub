import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import { login } from '../../store/userSlice';
import showMessage from '../../components/Alerts/showMessage';
import { hideLoading, showLoading } from '../../store/features/alertSlice';
import { IRootState, AppDispatch } from '../../store'; // Adjust import as per your setup
import { unwrapResult } from '@reduxjs/toolkit';

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [identityNo, setIdentityNo] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Auth'));
    }, [dispatch]);

    const { loading }: { loading: boolean } = useSelector((state: IRootState) => state.user);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            dispatch(showLoading());
            // Dispatch user login action from userSlice
            const response = await dispatch(login({ identityNo, password }));
            const result = unwrapResult(response);

            if (result.success) {
                dispatch(hideLoading());
                showMessage({ message: result.message, success: true });

                // Get user role from result
                const userRole = result.user.role;

                // Navigate each user to a specific page based on their role
                switch (userRole) {
                    case 'ADMIN':
                    case 'MANAGER':
                        navigate('/');
                        break;
                    case 'DISPATCH':
                    case 'SYSTEMS-ENGINEER':
                    case 'AFRIYIE':
                    case 'RAM-JACK':
                    case 'BENEWISE':
                        navigate('/dashboard');
                        break;
                    default:
                        navigate('/users/profile');
                }
            } else {
                dispatch(hideLoading());
                showMessage({ message: result.message, success: false });
            }
        } catch (error) {
            dispatch(hideLoading());
            showMessage({
                message: 'An error occurred while logging in. Please try again.',
                success: false,
            });
            console.error(error);
        }
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="w-full h-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
                    <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
                        <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
                        <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                            <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                                <img src="/assets/images/auth/login.svg" alt="Cover Image" className="w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
                        <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
                            <Link to="/" className="block w-8 lg:hidden">
                                <img src="/favicon.png" alt="Logo" className="mx-auto w-10" />
                            </Link>
                        </div>
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your Employee ID and password to login</p>
                            </div>
                            <form className="space-y-5 dark:text-white" onSubmit={handleLogin}>
                                <div>
                                    <label htmlFor="identityNo">ID</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="identityNo"
                                            type="text"
                                            placeholder="Enter user ID"
                                            onChange={(e) => setIdentityNo(e.target.value)}
                                            className="form-input ps-10 placeholder:text-white-dark" />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Enter Password"
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="form-input ps-10 placeholder:text-white-dark" />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    {loading ? <span className="animate-spin border-[3px] border-success border-l-transparent rounded-full w-6 h-6 inline-block align-middle m-auto mb-10"></span> : 'Sign In'}
                                </button>
                            </form>
                        </div>
                        <div className="text-center dark:text-white">
                            Forgotten Password?&nbsp;
                            <Link to="/auth/request-password" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                Request New
                            </Link>
                        </div>
                        <p className="absolute bottom-6 w-full text-center dark:text-white">© {new Date().getFullYear()}.EIS JohnCode All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
