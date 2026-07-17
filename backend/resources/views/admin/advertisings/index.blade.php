<x-admin.layout>
    <x-slot name="title">Advertisements | Card Setu Admin</x-slot>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Advertisements Management
        </h2>

        <a href="{{ route('admin.advertisings.create') }}" class="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 py-2.5 px-6 text-center font-medium text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 lg:px-8 xl:px-10">
            <span>
                <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
            </span>
            Add New Ad
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

    <div class="rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div class="py-6 px-4 md:px-6 xl:px-7.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h4 class="text-xl font-bold text-black dark:text-white">
                Ads List
            </h4>
            
            <form action="{{ route('admin.advertisings.index') }}" method="GET" class="w-full sm:w-1/3 relative">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search ads..." class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
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
                    <tr class="bg-slate-50 border-b border-gray-100 text-left dark:bg-meta-4 dark:border-strokedark whitespace-nowrap">
                        <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                        <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'title', 'direction' => $sortField === 'title' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Title
                                <svg class="w-3 h-3 {{ $sortField === 'title' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'title' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'position', 'direction' => $sortField === 'position' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Position
                                <svg class="w-3 h-3 {{ $sortField === 'position' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'position' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Performance</th>
                        <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($advertisings as $ad)
                        <tr class="hover:bg-indigo-50/40 dark:hover:bg-meta-4/40 transition-colors">
                            <td class="border-b border-gray-100 py-3 px-4 dark:border-strokedark">
                                <a href="{{ asset('storage/' . $ad->image_path) }}" target="_blank">
                                    <img src="{{ asset('storage/' . $ad->image_path) }}" alt="{{ $ad->title }}" class="h-12 w-24 object-cover rounded shadow-sm border border-gray-200 dark:border-strokedark">
                                </a>
                            </td>
                            <td class="border-b border-gray-100 py-3 px-4 dark:border-strokedark">
                                <p class="text-sm font-semibold text-black dark:text-white">{{ $ad->title }}</p>
                                @if($ad->target_url)
                                    <a href="{{ $ad->target_url }}" target="_blank" class="text-xs text-indigo-500 hover:underline truncate max-w-[200px] block mt-0.5">{{ $ad->target_url }}</a>
                                @endif
                            </td>
                            <td class="border-b border-gray-100 py-3 px-4 dark:border-strokedark">
                                <span class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 dark:bg-meta-4 dark:text-gray-300">
                                    {{ ucfirst($ad->position) }}
                                </span>
                            </td>
                            <td class="border-b border-gray-100 py-3 px-4 dark:border-strokedark">
                                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium {{ $ad->status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' }}">
                                    {{ ucfirst($ad->status) }}
                                </span>
                                @if($ad->start_date || $ad->end_date)
                                    <div class="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
                                        {{ $ad->start_date ? $ad->start_date->format('M d, Y') : 'Any' }} - {{ $ad->end_date ? $ad->end_date->format('M d, Y') : 'Ongoing' }}
                                    </div>
                                @endif
                            </td>
                            <td class="border-b border-gray-100 py-3 px-4 dark:border-strokedark text-center">
                                <div class="flex items-center justify-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                                    <div class="flex flex-col items-center gap-0.5" title="Views">
                                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        <span>{{ number_format($ad->views) }}</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-0.5" title="Clicks">
                                        <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                                        <span>{{ number_format($ad->clicks) }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="border-b border-gray-100 py-3 px-4 dark:border-strokedark text-right">
                                <div class="flex items-center justify-end space-x-2">
                                    <a href="{{ route('admin.advertisings.edit', $ad) }}" class="flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-all dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3" title="Edit">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </a>
                                    <form action="{{ route('admin.advertisings.destroy', $ad) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete this ad?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-all dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3" title="Delete">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="py-10 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                No advertisements found. <a href="{{ route('admin.advertisings.create') }}" class="text-primary hover:underline">Create one</a>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($advertisings->hasPages())
            <div class="border-t border-gray-100 py-4 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                {{ $advertisings->links() }}
            </div>
        @endif
    </div>
</x-admin.layout>
