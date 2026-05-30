<x-admin.layout>
    <x-slot name="title">Categories | Card Setu Admin</x-slot>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Categories Management
        </h2>

        <a href="{{ route('admin.categories.create') }}" class="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-all duration-300 shadow-sm lg:px-8 xl:px-10">
            <span>
                <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
            </span>
            Add New Category
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

    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="py-6 px-4 md:px-6 xl:px-7.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h4 class="text-xl font-bold text-black dark:text-white">
                Category List
            </h4>
            
            <form action="{{ route('admin.categories.index') }}" method="GET" class="w-full sm:w-1/3 relative">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by name, slug, or type..." class="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 pl-10 pr-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
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
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'slug', 'direction' => $sortField === 'slug' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Slug
                                <svg class="w-3 h-3 {{ $sortField === 'slug' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'slug' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'type', 'direction' => $sortField === 'type' && $sortDirection === 'asc' ? 'desc' : 'asc']) }}" class="flex items-center gap-1.5 hover:text-primary transition-colors">
                                Type
                                <svg class="w-3 h-3 {{ $sortField === 'type' ? 'text-primary' : 'text-gray-400' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!! $sortField === 'type' && $sortDirection === 'desc' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' !!}
                                </svg>
                            </a>
                        </th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">Hierarchy</th>
                        <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($categories as $category)
                        <tr>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark xl:px-7.5">
                                <p class="text-black dark:text-white font-medium">{{ $category->name }}</p>
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <p class="text-black dark:text-white">{{ $category->slug }}</p>
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <span class="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium bg-primary text-primary">
                                    {{ $category->type ? ucfirst($category->type) : 'Generic' }}
                                </span>
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                @if($category->parent)
                                    <span class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                        Subcategory of: <strong>{{ $category->parent->name }}</strong>
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1.5 text-sm font-medium text-[#219653]">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                        Main Category ({{ $category->children->count() }} sub)
                                    </span>
                                @endif
                            </td>
                            <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <div class="flex items-center space-x-3.5">
                                    <a href="{{ route('admin.categories.edit', $category) }}" class="hover:text-primary transition-colors flex items-center justify-center rounded-full border border-stroke bg-gray-100 p-2 dark:border-strokedark dark:bg-meta-4" title="Edit Category">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </a>
                                    
                                    <form action="{{ route('admin.categories.destroy', $category) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this category?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="hover:text-[#EB5757] transition-colors flex items-center justify-center rounded-full border border-stroke bg-gray-100 p-2 dark:border-strokedark dark:bg-meta-4" title="Delete Category">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="py-5 px-4 text-center text-gray-500 dark:text-gray-400">
                                No categories found.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        @if($categories->hasPages())
            <div class="border-t border-[#eee] py-4 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                {{ $categories->links() }}
            </div>
        @endif
    </div>
</x-admin.layout>
