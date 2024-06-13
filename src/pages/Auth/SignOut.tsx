import React from 'react';

/**
 * The sign out page.
 */
function SignOutPage() {
    return (
        // <div className="flex items-center justify-center min-h-screen">
        //     <div className="flex flex-col items-center">
        //         <div className="w-full max-w-320 px-16 py-32 bg-white rounded-lg shadow-md">
        //             <img
        //                 className="mx-auto w-48"
        //                 src="public/logo1.png"
        //                 alt="logo"
        //             />

        //             <div className="mt-25 text-center text-4xl font-extrabold leading-tight tracking-tight">
        //                 You have been signed out!
        //             </div>
        //             <a href='/auth' className='mt-10 text-4l leading-tight'>Sign In...</a>
        //         </div>
        //     </div>
        // </div>
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                    <img
                        className="mx-auto w-48"
                        src="/logomain.png"
                        alt="logo"
                    />
                    <div className="mt-25 text-center font-extra leading-tight">
                         Mining Project and Systems HUB!
                     </div>
                    <div className="mt-25 text-center text-4xl font-extrabold leading-tight tracking-tight">
                         You have been signed out!
                     </div>
                     <a href='/auth' className='text-center mt-10 text-4l leading-tight'>Sign In...</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignOutPage;
