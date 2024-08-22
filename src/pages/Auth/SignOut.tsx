import React from 'react';

/**
 * The sign out page.
 */
function SignOutPage() {
    return (
        <div className="relative min-h-screen">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img 
                    src="/assets/images/auth/bg-gradient.png" 
                    alt="Background Gradient" 
                    className="h-full w-full object-cover backdrop-brightness-50 bg-white/20" 
                />
            </div>

            {/* Main Content */}
            <div className="relative flex min-h-screen items-center justify-center bg-[url('/assets/images/auth/map.png')] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                {/* Floating Images */}
                <img 
                    src="/assets/images/auth/smart.png" 
                    alt="Smart Image" 
                    className="absolute left-0 top-2/3 h-full max-h-[423px] -translate-y-1/2 md:left-[5%]" 
                />
                <img 
                    src="/assets/images/auth/truck3.png" 
                    alt="Truck Image" 
                    className="absolute left-24 top-0 h-[350px] md:left-[5%]" 
                />
                <img 
                    src="/assets/images/auth/coming-soon-object3.png" 
                    alt="Coming Soon Object" 
                    className="absolute right-0 top-0 h-[300px]" 
                />
                <img 
                    src="/assets/images/auth/moving.png" 
                    alt="Moving Image" 
                    className="absolute top-[48%] right-[5%]" 
                />

                {/* Centered Content */}
                <div className="relative flex flex-col justify-center rounded-md bg-white/30 backdrop-blur-lg dark:bg-black/50 px-6 py-20 lg:min-h-[250px]">
                    {/* Logo */}
                    <img 
                        className="mx-auto w-48 mb-6" 
                        src="/logomain.png" 
                        alt="Logo" 
                    />

                    {/* Heading */}
                    <div className="text-center text-4xl font-extrabold leading-tight mb-4">
                        Mining Project and Systems HUB!
                    </div>

                    {/* Subheading */}
                    <div className="text-center text-3xl font-semibold leading-tight mb-6">
                        Welcome!
                    </div>

                    {/* Sign In Link */}
                    <a 
                        href='/auth' 
                        className='block text-center text-2xl font-semibold tracking-tight leading-tight mt-8'
                    >
                        Sign In...
                    </a>

                    {/* Optional Maintenance Image */}
                    {/* <div className='text-center mt-8'>
                        <img 
                            src="/maintanance.png" 
                            alt="Maintenance" 
                            className="w-30 h-30 object-cover mx-auto" 
                        />
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default SignOutPage;
