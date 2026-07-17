<x-admin.layout>
    <x-slot name="title">Edit Advertisement | Card Setu Admin</x-slot>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Edit Advertisement
        </h2>

        <a href="{{ route('admin.advertisings.index') }}"
            class="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white border border-gray-200 py-2.5 px-6 text-center font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all duration-300 dark:bg-meta-4 dark:border-strokedark dark:text-white dark:hover:bg-meta-3">
            <span>
                <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clip-rule="evenodd" />
                </svg>
            </span>
            Back to List
        </a>
    </div>

    <div class="rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-gray-100 py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-semibold text-black dark:text-white">
                Advertisement Details
            </h3>
        </div>

        <form action="{{ route('admin.advertisings.update', $advertising) }}" method="POST"
            enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="p-6.5">
                <!-- Title -->
                <div class="mb-4.5">
                    <label class="mb-2.5 block text-black dark:text-white">
                        Title <span class="text-meta-1">*</span>
                    </label>
                    <input type="text" name="title" value="{{ old('title', $advertising->title) }}"
                        placeholder="Enter campaign title"
                        class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required />
                    @error('title')
                        <p class="text-meta-1 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Banner Image -->
                <div class="mb-4.5">
                    <label class="mb-2.5 block text-black dark:text-white">
                        Banner Image (Leave empty to keep current)
                    </label>
                    @if($advertising->image_path)
                        <div class="mb-3">
                            <p class="text-sm text-gray-500 mb-2">Current Image:</p>
                            <img src="{{ asset('storage/' . $advertising->image_path) }}" alt="Current Banner"
                                class="h-32 object-cover rounded shadow-sm border border-gray-200 dark:border-strokedark">
                        </div>
                    @endif
                    <input type="file" name="image" accept="image/*"
                        class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                    @error('image')
                        <p class="text-meta-1 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Target URL -->
                <div class="mb-4.5">
                    <label class="mb-2.5 block text-black dark:text-white">
                        Target URL
                    </label>
                    <input type="url" name="target_url" value="{{ old('target_url', $advertising->target_url) }}"
                        placeholder="https://example.com"
                        class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                    @error('target_url')
                        <p class="text-meta-1 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Position & Status -->
                <div class="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div class="w-full xl:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Position <span class="text-meta-1">*</span>
                        </label>
                        <select name="position"
                            class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            required>
                            <option value="top" {{ old('position', $advertising->position) == 'top' ? 'selected' : '' }}>
                                Top (Leaderboard · 728×90)</option>
                            <option value="right" {{ old('position', $advertising->position) == 'right' ? 'selected' : '' }}>Right (Skyscraper · 300×600)</option>
                            <option value="bottom" {{ old('position', $advertising->position) == 'bottom' ? 'selected' : '' }}>Bottom (Medium Rectangle · 300×250)</option>
                        </select>
                        @error('position')
                            <p class="text-meta-1 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="w-full xl:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Status <span class="text-meta-1">*</span>
                        </label>
                        <select name="status"
                            class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            required>
                            <option value="active" {{ old('status', $advertising->status) == 'active' ? 'selected' : '' }}>Active</option>
                            <option value="inactive" {{ old('status', $advertising->status) == 'inactive' ? 'selected' : '' }}>Inactive</option>
                        </select>
                        @error('status')
                            <p class="text-meta-1 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Dates -->
                <div class="mb-5.5 flex flex-col gap-6 xl:flex-row">
                    <div class="w-full xl:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Start Date (Optional)
                        </label>
                        <input type="date" name="start_date"
                            value="{{ old('start_date', $advertising->start_date ? $advertising->start_date->format('Y-m-d') : '') }}"
                            class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                        @error('start_date')
                            <p class="text-meta-1 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="w-full xl:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            End Date (Optional)
                        </label>
                        <input type="date" name="end_date"
                            value="{{ old('end_date', $advertising->end_date ? $advertising->end_date->format('Y-m-d') : '') }}"
                            class="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                        @error('end_date')
                            <p class="text-meta-1 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <button type="submit"
                    class="flex w-full justify-center rounded-xl bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                    Update Advertisement
                </button>
            </div>
        </form>
    </div>
</x-admin.layout>