import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The sign out page.
 */
function SignOutPage() {
    return (
        <div className="relative min-h-screen min-w-0 overflow-x-hidden">
            <div className="absolute inset-0 min-h-full min-w-full">
                <img
                    src="/assets/images/auth/bg-gradient.png"
                    alt=""
                    className="h-full w-full min-h-full min-w-full object-cover object-center"
                />
            </div>

            <div className="relative flex min-h-screen min-w-0 items-center justify-center overflow-x-hidden overflow-y-auto bg-[url('/assets/images/auth/map.png')] bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6 sm:py-10 md:px-16 dark:bg-[#060818]">
                <img src="/assets/images/auth/smart.png" alt="" className="absolute left-0 top-2/3 hidden h-full max-h-[423px] -translate-y-1/2 md:block md:left-[5%]" />
                <img src="/assets/images/auth/truck3.png" alt="" className="absolute left-24 top-0 hidden h-[350px] md:block md:left-[5%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="" className="absolute right-0 top-0 hidden h-[300px] md:block" />
                <img src="/assets/images/auth/moving.png" alt="" className="absolute top-[48%] right-[5%] hidden md:block" />

                <div className="relative z-10 w-full max-w-md min-w-0 px-0 sm:px-2">
                    <div className="rounded-2xl bg-white shadow-2xl border border-gray-100 px-5 py-8 text-center sm:px-6 sm:py-10">
                        <img
                            className="mx-auto w-40 mb-6"
                            src="/minesphere.png"
                            alt="MineSphere"
                        />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            MineSphere
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            You have been successfully signed out.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-95 transition-opacity"
                        >
                            Return to login
                        </Link>
                    </div>
                    <p className="mt-6 text-center text-gray-500 text-xs">
                        © {new Date().getFullYear()} MineSphere. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignOutPage;
