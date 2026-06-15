<x-admin.layout>
    <x-slot name="title">Registered Users | Card Setu Admin</x-slot>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Registered Users
        </h2>

        <a href="{{ route('admin.users.create') }}" class="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
            <span>
                <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
            </span>
            Add New User
        </a>
    </div>

    @if(session('success'))
        <div class="mb-6 flex w-full border-l-6 border-[#34D399] bg-[#34D399] bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
            <div class="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-lg bg-[#34D399]">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L0.747959 6.59029L0.752701 6.59541L4.86742 11.0348C5.14445 11.3405 5.52858 11.5 5.89581 11.5C6.29242 11.5 6.65178 11.3355 6.92401 11.035L15.2162 2.11161C15.5833 1.74452 15.576 1.18615 15.2984 0.826822Z" fill="white" stroke="white"></path>
                </svg>
            </div>
            <div class="w-full">
                <h5 class="mb-1 text-lg font-bold text-black dark:text-[#34D399]">{{ session('success') }}</h5>
            </div>
        </div>
    @endif
    @if(session('error'))
        <div class="mb-6 flex w-full border-l-6 border-[#F87171] bg-[#F87171] bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
            <div class="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-lg bg-[#F87171]">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1112 12.2422 11.1111L7.62783 6.5024L12.2422 1.89369C12.5622 1.5736 12.5623 1.06079 12.2423 0.740502C12.2422 0.740428 12.2421 0.740354 12.242 0.74028C11.921 0.420658 11.408 0.420803 11.0874 0.740618C11.0873 0.740751 11.0872 0.740884 11.087 0.741018L6.4917 5.34971L1.8964 0.741018C1.57538 0.420803 1.06236 0.420658 0.741366 0.74028C0.420371 1.06079 0.420556 1.5736 0.74116 1.89369L5.35547 6.5024L0.74116 11.1111C0.421111 11.4317 0.420926 11.9445 0.741531 12.2645C0.890029 12.4128 1.10697 12.5 1.30933 12.5C1.51169 12.5 1.72863 12.4128 1.87713 12.2645L6.4917 7.65579Z" fill="#ffffff" stroke="#ffffff"></path>
                </svg>
            </div>
            <div class="w-full">
                <h5 class="mb-1 text-lg font-bold text-[#B45454]">{{ session('error') }}</h5>
            </div>
        </div>
    @endif

    <!-- Users Table -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="py-6 px-4 md:px-6 xl:px-7.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h4 class="text-xl font-bold text-black dark:text-white">
                User List
            </h4>
            
            <!-- Search Form -->
            <form action="{{ route('admin.users.index') }}" method="GET" class="w-full sm:w-1/3 relative">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by name, email, or phone..." class="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 pl-10 pr-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                <!-- Keep sort params when searching -->
                @if(request('sort')) <input type="hidden" name="sort" value="{{ request('sort') }}"> @endif
                @if(request('direction')) <input type="hidden" name="direction" value="{{ request('direction') }}"> @endif
                
                <button type="submit" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
            </form>
        </div>

        <div class="max-w-full overflow-x-auto">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-2 text-left dark:bg-meta-4">
                        <th class="py-4 px-4 font-medium text-black dark:text-white xl:px-7.5">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'name', 'direction' => $sortField === 'name' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Name
                                <svg class="w-3 h-3 {{ $sortField === 'name' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'name' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'email', 'direction' => $sortField === 'email' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Email
                                <svg class="w-3 h-3 {{ $sortField === 'email' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'email' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'role', 'direction' => $sortField === 'role' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Role
                                <svg class="w-3 h-3 {{ $sortField === 'role' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'role' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">Email Verified</th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">Card Status</th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'created_at', 'direction' => $sortField === 'created_at' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Joined
                                <svg class="w-3 h-3 {{ $sortField === 'created_at' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'created_at' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'status', 'direction' => $sortField === 'status' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Status
                                <svg class="w-3 h-3 {{ $sortField === 'status' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'status' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($users as $user)
                        <tr>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark xl:px-7.5">
                                <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0">
                                        @if($user->avatar)
                                            <img src="{{ $user->avatar }}" alt="{{ $user->name }}" class="h-10 w-10 rounded-full object-cover">
                                        @else
                                            <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold dark:bg-meta-4 dark:text-white">
                                                {{ strtoupper(substr($user->name, 0, 1)) }}
                                            </div>
                                        @endif
                                    </div>
                                    <p class="text-black dark:text-white">{{ $user->name }}</p>
                                </div>
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <p class="text-black dark:text-white">{{ $user->email }}</p>
                                @if($user->phone)
                                    <p class="text-sm text-gray-500">{{ $user->phone }}</p>
                                @endif
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <span class="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium {{ $user->role === 'super_admin' || $user->role === 'admin' ? 'bg-primary text-primary' : 'bg-success text-success' }}">
                                    {{ ucfirst(str_replace('_', ' ', $user->role)) }}
                                </span>
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                @if($user->email_verified_at)
                                    <span class="inline-flex items-center gap-1.5 text-sm font-medium text-[#219653]">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Verified
                                    </span>
                                @else
                                    <div class="flex flex-col gap-2 items-start">
                                        <span class="inline-flex items-center gap-1.5 text-sm font-medium text-[#EB5757]">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Unverified
                                        </span>
                                        <form action="{{ route('admin.users.send-verification', $user) }}" method="POST">
                                            @csrf
                                            <button type="submit" class="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:text-white dark:hover:bg-primary/30" title="Send Verification Email">
                                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                Send Link
                                            </button>
                                        </form>
                                    </div>
                                @endif
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                @if($user->businessCards->isNotEmpty())
                                    <div class="flex flex-col gap-1">
                                        <span class="inline-flex items-center gap-1.5 text-sm font-medium text-black dark:text-white mb-1">
                                            <svg class="w-4 h-4 text-[#219653]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Created ({{ $user->businessCards->count() }})
                                        </span>
                                        @foreach($user->businessCards as $card)
                                            <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:3000') }}/{{ $card->slug }}" target="_blank" class="text-xs text-primary hover:underline flex items-center gap-1 truncate max-w-[150px]" title="View {{ $card->slug }}">
                                                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                /{{ $card->slug }}
                                            </a>
                                        @endforeach
                                    </div>
                                @else
                                    <span class="inline-flex items-center gap-1.5 text-sm font-medium text-black dark:text-white">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Not Created
                                    </span>
                                @endif
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <p class="text-sm text-black dark:text-white" title="{{ $user->created_at->format('d M, Y h:i A') }}">
                                    {{ $user->created_at->diffForHumans() }}
                                </p>
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <form action="{{ route('admin.users.toggle-status', $user) }}" method="POST" class="inline-block relative">
                                    @csrf
                                    @method('PATCH')
                                    <label for="toggle-{{ $user->id }}" class="flex cursor-pointer select-none items-center">
                                        <div class="relative">
                                            <input type="checkbox" id="toggle-{{ $user->id }}" class="sr-only" onchange="this.form.submit()" {{ $user->status === 'active' ? 'checked' : '' }} {{ ($user->isSuperAdmin() && auth()->id() === $user->id) ? 'disabled' : '' }} />
                                            <div class="block h-8 w-14 rounded-full transition-colors {{ $user->status === 'active' ? 'bg-[#219653]' : 'bg-[#EB5757]' }}"></div>
                                            <div class="dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 transition-transform duration-300 {{ $user->status === 'active' ? 'translate-x-6' : '' }}">
                                                <span class="{{ $user->status === 'active' ? 'hidden' : '' }}">
                                                    <svg class="h-4 w-4 stroke-[#EB5757]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </span>
                                                <span class="{{ $user->status === 'active' ? '' : 'hidden' }}">
                                                    <svg class="h-4 w-4 stroke-[#219653]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                </form>
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <div class="flex items-center space-x-3.5">
                                    <form action="{{ route('admin.users.impersonate', $user) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="hover:text-primary transition-colors flex items-center justify-center rounded-full border border-stroke bg-gray-100 p-2 dark:border-strokedark dark:bg-meta-4" title="Login as User">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="py-5 px-4 text-center text-gray-500 dark:text-gray-400">
                                No registered users found.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        @if($users->hasPages())
            <div class="border-t border-[#eee] py-4 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                {{ $users->links() }}
            </div>
        @endif
    </div>
</x-admin.layout>
