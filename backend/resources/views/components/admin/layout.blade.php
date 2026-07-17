<!DOCTYPE html>
<html lang="en" x-data="{ darkMode: false, sidebarToggle: false }" :class="{ 'dark': darkMode }">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
    <title>{{ $title ?? 'Card Setu Admin' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <!-- Alpine.js for lightweight state management -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-slate-50 dark:bg-boxdark-2 dark:text-bodydark font-sans antialiased text-gray-800">
    <div class="flex h-screen overflow-hidden">
        
        <!-- Sidebar -->
        <aside :class="sidebarToggle ? 'translate-x-0' : '-translate-x-full'" class="absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-gray-900 duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0">
            <div class="flex items-center justify-between gap-2 px-6 py-6">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center">
                    <img src="{{ asset('logo-dark.png') }}" alt="Card Setu" class="h-8 w-auto" />
                </a>
                <button @click="sidebarToggle = !sidebarToggle" class="block lg:hidden text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav class="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
                    <ul class="mb-6 flex flex-col gap-1.5">
                        <li>
                            <a class="group relative flex items-center gap-2.5 rounded-lg py-2.5 px-4 font-medium duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-strokedark {{ request()->routeIs('admin.dashboard') ? 'bg-primary/90 dark:bg-primary text-white shadow-lg' : 'text-gray-300' }}" href="{{ route('admin.dashboard') }}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a class="group relative flex items-center gap-2.5 rounded-lg py-2.5 px-4 font-medium duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-strokedark {{ request()->routeIs('admin.users.*') ? 'bg-primary/90 dark:bg-primary text-white shadow-lg' : 'text-gray-300' }}" href="{{ route('admin.users.index') }}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                Registered Users
                            </a>
                        </li>
                        <li>
                            <a class="group relative flex items-center gap-2.5 rounded-lg py-2.5 px-4 font-medium duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-strokedark {{ request()->routeIs('admin.categories.*') ? 'bg-primary/90 dark:bg-primary text-white shadow-lg' : 'text-gray-300' }}" href="{{ route('admin.categories.index') }}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                Categories
                            </a>
                        </li>
                        <li>
                            <a class="group relative flex items-center gap-2.5 rounded-lg py-2.5 px-4 font-medium duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-strokedark {{ request()->routeIs('admin.designations.*') ? 'bg-primary/90 dark:bg-primary text-white shadow-lg' : 'text-gray-300' }}" href="{{ route('admin.designations.index') }}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                Designations
                            </a>
                        </li>
                        <li>
                            <a class="group relative flex items-center gap-2.5 rounded-lg py-2.5 px-4 font-medium duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-strokedark {{ request()->routeIs('admin.plans.*') ? 'bg-primary/90 dark:bg-primary text-white shadow-lg' : 'text-gray-300' }}" href="{{ route('admin.plans.index') }}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                SaaS Plans
                            </a>
                        </li>
                        <li>
                            <a class="group relative flex items-center gap-2.5 rounded-lg py-2.5 px-4 font-medium duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-strokedark {{ request()->routeIs('admin.advertisings.*') ? 'bg-primary/90 dark:bg-primary text-white shadow-lg' : 'text-gray-300' }}" href="{{ route('admin.advertisings.index') }}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                                Advertisements
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>

        <!-- Content Area -->
        <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <!-- Header -->
            <header class="sticky top-0 z-40 flex w-full bg-white/80 backdrop-blur-md shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border-b border-gray-100 dark:bg-boxdark/90 dark:border-b dark:border-strokedark transition-all">
                <div class="flex flex-grow items-center justify-between py-4 px-4 md:px-6 2xl:px-11">
                    <div class="flex items-center gap-2 sm:gap-4 lg:hidden">
                        <button @click="sidebarToggle = !sidebarToggle" class="block rounded-sm border border-gray-200 bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-end w-full gap-4">
                        <button @click="darkMode = !darkMode" class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <svg x-show="!darkMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            <svg x-show="darkMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </button>

                        <!-- User Dropdown Area -->
                        <div class="relative" x-data="{ dropdownOpen: false }" @click.outside="dropdownOpen = false">
                            <button @click="dropdownOpen = !dropdownOpen" class="flex items-center gap-2 focus:outline-none">
                                <span class="hidden font-medium text-black dark:text-white sm:block">{{ auth()->user()->name ?? 'Admin' }}</span>
                                <svg class="hidden fill-current sm:block w-4 h-4 text-black dark:text-white transition" :class="dropdownOpen ? 'rotate-180' : ''" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <div x-show="dropdownOpen" 
                                 x-transition:enter="transition ease-out duration-200"
                                 x-transition:enter-start="opacity-0 translate-y-1"
                                 x-transition:enter-end="opacity-100 translate-y-0"
                                 x-transition:leave="transition ease-in duration-150"
                                 x-transition:leave-start="opacity-100 translate-y-0"
                                 x-transition:leave-end="opacity-0 translate-y-1"
                                 class="absolute right-0 mt-4 flex w-48 flex-col rounded border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark" 
                                 style="display: none;">
                                
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="flex w-full items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary text-black dark:text-white">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                        Log Out
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main>
                <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    {{ $slot }}
                </div>
            </main>
        </div>
    </div>
</body>
</html>
