<x-admin.layout>
    <x-slot name="title">Designations | Card Setu Admin</x-slot>

    <div x-data="{ showDeleteModal: false, deleteUrl: '' }">
        <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-title-md2 font-bold text-black dark:text-white">
                Designations
            </h2>

            <a href="{{ route('admin.designations.create') }}"
                class="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 py-2.5 px-6 text-center font-medium text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </span>
                Add Designation
            </a>
        </div>

        @if(session('success'))
            <div
                class="mb-6 flex w-full border-l-6 border-[#34D399] bg-[#34D399] bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
                <div class="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-lg bg-[#34D399]">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L0.747959 6.59029L0.752701 6.59541L4.86742 11.0348C5.14445 11.3405 5.52858 11.5 5.89581 11.5C6.29242 11.5 6.65178 11.3355 6.92401 11.035L15.2162 2.11161C15.5833 1.74452 15.576 1.18615 15.2984 0.826822Z"
                            fill="white" stroke="white"></path>
                    </svg>
                </div>
                <div class="w-full">
                    <h5 class="mb-1 text-lg font-bold text-black dark:text-[#34D399]">{{ session('success') }}</h5>
                </div>
            </div>
        @endif
        @if(session('error'))
            <div
                class="mb-6 flex w-full border-l-6 border-[#F87171] bg-[#F87171] bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
                <div class="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-lg bg-[#F87171]">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1112 12.2422 11.1111L7.62783 6.5024L12.2422 1.89369C12.5622 1.5736 12.5623 1.06079 12.2423 0.740502C12.2422 0.740428 12.2421 0.740354 12.242 0.74028C11.921 0.420658 11.408 0.420803 11.0874 0.740618C11.0873 0.740751 11.0872 0.740884 11.087 0.741018L6.4917 5.34971L1.8964 0.741018C1.57538 0.420803 1.06236 0.420658 0.741366 0.74028C0.420371 1.06079 0.420556 1.5736 0.74116 1.89369L5.35547 6.5024L0.74116 11.1111C0.421111 11.4317 0.420926 11.9445 0.741531 12.2645C0.890029 12.4128 1.10697 12.5 1.30933 12.5C1.51169 12.5 1.72863 12.4128 1.87713 12.2645L6.4917 7.65579Z"
                            fill="#ffffff" stroke="#ffffff"></path>
                    </svg>
                </div>
                <div class="w-full">
                    <h5 class="mb-1 text-lg font-bold text-[#B45454]">{{ session('error') }}</h5>
                </div>
            </div>
        @endif

        <link href="https://cdn.jsdelivr.net/npm/simple-datatables@latest/dist/style.css" rel="stylesheet"
            type="text/css">
        <style>
            .dataTable-wrapper.no-footer .dataTable-container {
                border-bottom: 1px solid #f3f4f6;
            }

            .dark .dataTable-wrapper.no-footer .dataTable-container {
                border-bottom: 1px solid #2E3A47;
            }

            .dataTable-input {
                border: 1px solid #E2E8F0;
                border-radius: 0.75rem;
                padding: 0.5rem 1rem;
                background-color: transparent;
                color: inherit;
            }

            .dark .dataTable-input {
                border-color: #3D4D60;
                background-color: #1d2a39;
                color: #fff;
            }

            .dataTable-selector {
                border: 1px solid #E2E8F0;
                border-radius: 0.5rem;
                padding: 0.375rem 2rem 0.375rem 0.75rem;
                background-color: transparent;
                color: inherit;
            }

            .dark .dataTable-selector {
                border-color: #3D4D60;
                background-color: #1d2a39;
                color: #fff;
            }

            .dataTable-info {
                color: #64748B;
            }

            .dark .dataTable-info {
                color: #8A99AF;
            }

            .dataTable-pagination a {
                color: #1C2434;
            }

            .dark .dataTable-pagination a {
                color: #fff;
            }

            .dataTable-pagination .active a,
            .dataTable-pagination .active a:focus,
            .dataTable-pagination .active a:hover {
                background-color: #3C50E0;
            }
        </style>

        <div
            class="rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-strokedark dark:bg-boxdark p-4 sm:p-6 xl:p-7.5 overflow-hidden">
            <h4 class="text-xl font-bold text-black dark:text-white mb-6">
                Designations List
            </h4>

            <div class="max-w-full overflow-x-auto">
                <table id="designationsTable" class="w-full table-auto">
                    <thead>
                        <tr
                            class="bg-slate-50 border-b border-gray-100 text-left dark:bg-meta-4 dark:border-strokedark">
                            <th
                                class="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider xl:px-7.5">
                                Name</th>
                            <th class="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status
                            </th>
                            <th class="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($designations as $designation)
                            <tr class="hover:bg-slate-50/50 dark:hover:bg-meta-4/20 transition-colors">
                                <td class="border-b border-gray-100 py-4 px-4 dark:border-strokedark xl:px-7.5">
                                    <p class="text-black dark:text-white">{{ $designation->name }}</p>
                                </td>
                                <td class="border-b border-gray-100 py-4 px-4 dark:border-strokedark">
                                    <span
                                        class="inline-flex rounded-full py-1 px-3 text-xs font-semibold {{ $designation->status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' }}">
                                        {{ ucfirst($designation->status) }}
                                    </span>
                                </td>
                                <td class="border-b border-gray-100 py-4 px-4 dark:border-strokedark">
                                    <div class="flex items-center space-x-3.5">
                                        <a href="{{ route('admin.designations.edit', $designation->id) }}"
                                            class="hover:text-primary transition-colors">
                                            <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24">
                                                <path
                                                    d="M5 19h1.414l9.707-9.707-1.414-1.414L5 17.586V19zm15.707-11.293a1 1 0 000-1.414l-2.293-2.293a1 1 0 00-1.414 0l-1.586 1.586 3.707 3.707 1.586-1.586zM3 21v-4.243L16.435 3.322a3 3 0 014.243 0l2.293 2.293a3 3 0 010 4.243L9.243 21H3z" />
                                            </svg>
                                        </a>
                                        <button
                                            type="button"
                                            @click="showDeleteModal = true; deleteUrl = '{{ route('admin.designations.destroy', $designation->id) }}'"
                                            class="hover:text-[#EB5757] transition-colors text-gray-500">
                                            <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path
                                                    d="M9 3h6v2H9V3zm10 4H5v14a2 2 0 002 2h10a2 2 0 002-2V7zm-8 12H9v-8h2v8zm4 0h-2v-8h2v8zm1-14V3a2 2 0 00-2-2H9a2 2 0 00-2 2v2H3v2h18V5h-5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/simple-datatables@latest" type="text/javascript"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                const dataTable = new simpleDatatables.DataTable("#designationsTable", {
                    searchable: true,
                    fixedHeight: false,
                    perPage: 10,
                });
            });
        </script>

        <!-- Alpine Delete Modal -->
        <div x-show="showDeleteModal" style="display: none;"
            class="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 px-4 py-4"
            x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0"
            x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-200"
            x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0">

            <div @click.outside="showDeleteModal = false"
                class="relative w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-boxdark"
                x-transition:enter="transition ease-out duration-300 transform"
                x-transition:enter-start="opacity-0 translate-y-4 scale-95"
                x-transition:enter-end="opacity-100 translate-y-0 scale-100"
                x-transition:leave="transition ease-in duration-200 transform"
                x-transition:leave-start="opacity-100 translate-y-0 scale-100"
                x-transition:leave-end="opacity-0 translate-y-4 scale-95">

                <div
                    class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EB5757]/20 text-[#EB5757]">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                        </path>
                    </svg>
                </div>

                <h3 class="mb-4 text-2xl font-bold text-black dark:text-white">Confirm Deletion</h3>
                <p class="mb-6 text-gray-500 dark:text-gray-400">Are you sure you want to delete this designation? This
                    action cannot be undone.</p>

                <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button @click="showDeleteModal = false"
                        class="block rounded-md border border-stroke px-6 py-2.5 font-medium text-black transition hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4">
                        Cancel
                    </button>
                    <form :action="deleteUrl" method="POST" class="inline-block">
                        @csrf
                        @method('DELETE')
                        <button type="submit"
                            class="block w-full rounded-md bg-[#EB5757] px-6 py-2.5 font-medium text-white transition hover:bg-opacity-90 sm:w-auto">
                            Yes, Delete It
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-admin.layout>