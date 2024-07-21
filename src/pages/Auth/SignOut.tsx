import React from 'react';

/**
 * The sign out page.
 */
function SignOutPage() {
    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover backdrop-brightness-50 bg-white/2" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/smart.png" alt="image" className="absolute left-0 top-2/3 h-full max-h-[423px] -translate-y-1/2" />
                <img src="/assets/images/auth/truck3.png" alt="image" className="absolute left-24 top-0 h-[300px] md:left-[15%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/moving.png" alt="image" className="absolute top-[48%] end-[20%]" />
                <div >
                    <div className="relative flex flex-col justify-center rounded-md bg-white/30 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[250px] py-20">
                    <img
                        className="mx-auto w-48"
                        src="/logomain.png"
                        alt="logo"
                    />
                    <div className="mt-25 text-center text-4xl font-extrabold leading-tight">
                         Mining Project and Systems HUB!
                     </div>
                    <div className="mt-5 text-center text-4xl font-extra leading-tight tracking-tight">
                         Welcome!
                     </div>
                     {/* <a href='/auth' className='text-center mt-10 text-2xl tracking-tight leading-tight'>Sign In...</a> */}
                     <div className='text-3xl'>
                {/* <button className="btn btn-primary" type="button" onClick={() => createTicketFunction()}> */}
                    {/* Create A ticket */}
                    SYSTEM UNDER MAINTENANCE, YOU WILL GET NOTICED SOON - BY EDWIN ODURO
                {/* </button> */}
                <img src="/maintanance.png" alt="image" className="w-30 h-30 object-cover" />
            </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignOutPage;
