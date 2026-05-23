<x-admin.layout title="Dashboard | Card Setu">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        
        <!-- Metric Item 1: User Growth -->
        <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg class="fill-blue-600 dark:fill-blue-300 w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="currentColor"/>
                    <path d="M21 21H3V19C3 15.6863 5.68629 13 9 13H15C18.3137 13 21 15.6863 21 19V21Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="mt-4 flex items-end justify-between">
                <div>
                    <h4 class="text-title-md font-bold text-black dark:text-white">{{ number_format($totalUsers) }}</h4>
                    <span class="text-sm font-medium">Total Registered Users</span>
                </div>
                <span class="flex items-center gap-1 text-sm font-medium text-green-500">
                    {{ number_format($activeUsers) }} Active
                </span>
            </div>
        </div>

        <!-- Metric Item 2: Subscription Earnings -->
        <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg class="fill-green-600 dark:fill-green-300 w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="mt-4 flex items-end justify-between">
                <div>
                    <h4 class="text-title-md font-bold text-black dark:text-white">₹{{ number_format($totalEarnings, 2) }}</h4>
                    <span class="text-sm font-medium">Total Active MRR</span>
                </div>
            </div>
        </div>

        <!-- Metric Item 3: NFC Queue -->
        <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <svg class="fill-orange-600 dark:fill-orange-300 w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" fill="currentColor"/>
                    <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="mt-4 flex items-end justify-between">
                <div>
                    <h4 class="text-title-md font-bold text-black dark:text-white">{{ number_format($pendingNfcCount) }}</h4>
                    <span class="text-sm font-medium">Pending NFC Orders</span>
                </div>
            </div>
        </div>

    </div>

    <!-- Global SaaS Plan Creation Settings (Placeholder) -->
    <div class="mt-8 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
                Global SaaS Plans
            </h3>
        </div>
        <div class="p-6.5">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Manage global subscription plans and tier configurations here.
            </p>
            <div class="mt-4">
                <a href="{{ route('admin.plans.index') }}" class="inline-flex items-center justify-center rounded-md bg-primary px-10 py-3 text-center font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Manage Plans
                </a>
            </div>
        </div>
    </div>
</x-admin.layout>
