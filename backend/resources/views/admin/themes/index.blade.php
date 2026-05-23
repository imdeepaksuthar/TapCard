<x-admin.layout title="Themes | Card Setu">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Theme Management
        </h2>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <!-- Left: Table -->
        <div class="col-span-2 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">
                    Available Themes
                </h3>
            </div>
            <div class="p-6.5">
                <div class="max-w-full overflow-x-auto">
                    <table class="w-full table-auto">
                        <thead>
                            <tr class="bg-gray-2 text-left dark:bg-meta-4">
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Name</th>
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Color</th>
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($themes as $theme)
                            <tr>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <h5 class="font-medium text-black dark:text-white">{{ $theme->name }}</h5>
                                </td>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <div class="w-6 h-6 rounded-full" style="background-color: {{ $theme->primary_color }}"></div>
                                </td>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <span class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                        {{ $theme->is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <!-- Delete Button -->
                                    <form action="{{ route('admin.themes.destroy', $theme) }}" method="POST" onsubmit="return confirm('Are you sure?')">
                                        @csrf
                                        @method('DELETE')
                                        <button class="text-danger hover:text-red-500">Delete</button>
                                    </form>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Right: Create Form -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">
                    Create New Theme
                </h3>
            </div>
            <form action="{{ route('admin.themes.store') }}" method="POST">
                @csrf
                <div class="p-6.5">
                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">Theme Name</label>
                        <input type="text" name="name" placeholder="Enter theme name" class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" required />
                    </div>

                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">Primary Color</label>
                        <input type="color" name="primary_color" class="w-full h-12 rounded border-[1.5px] border-stroke bg-transparent p-1 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" required />
                    </div>

                    <button class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Save Theme
                    </button>
                </div>
            </form>
        </div>
    </div>
</x-admin.layout>
