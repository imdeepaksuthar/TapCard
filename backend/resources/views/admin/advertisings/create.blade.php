<x-admin.layout>
    <x-slot name="title">Create Advertisement | Card Setu Admin</x-slot>

    <!-- Header Section -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 class="text-title-md2 font-bold text-black dark:text-white tracking-tight">
                Create Advertisement
            </h2>
            <p class="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">Launch a new ad campaign across the platform.</p>
        </div>

        <a href="{{ route('admin.advertisings.index') }}"
            class="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white border border-stroke py-2.5 px-6 text-center font-medium text-black shadow-sm hover:bg-gray-50 transition-all duration-300 dark:bg-meta-4 dark:border-strokedark dark:text-white dark:hover:bg-meta-3">
            <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to List
        </a>
    </div>

    <!-- Form Section -->
    <form action="{{ route('admin.advertisings.store') }}" method="POST" enctype="multipart/form-data" class="w-full" novalidate>
        @csrf

        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 w-full">
            
            <!-- Left Column: Main Info -->
            <div class="xl:col-span-8 space-y-6 xl:space-y-8 w-full min-w-0">
                
                <!-- General Info Card -->
                <div class="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full">
                    <div class="border-b border-stroke py-4 px-6 dark:border-strokedark flex items-center gap-3">
                        <div class="text-primary">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 class="font-semibold text-black dark:text-white truncate">General Information</h3>
                    </div>

                    <div class="p-6 space-y-6 w-full">
                        <!-- Title -->
                        <div class="w-full">
                            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                Campaign Title <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="title" value="{{ old('title') }}" placeholder="e.g., Summer Sale 2026"
                                class="w-full block box-border rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                required />
                            @error('title')
                                <p class="text-red-500 text-sm mt-2 font-medium">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Target URL -->
                        <div class="w-full">
                            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                Target URL (Optional)
                            </label>
                            
                            <!-- Robust Flex Input Wrapper -->
                            <div class="flex items-center w-full box-border rounded-xl border-[1.5px] border-stroke bg-transparent focus-within:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus-within:border-primary transition overflow-hidden">
                                <div class="pl-5 pr-3 text-gray-400 shrink-0">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                </div>
                                <input type="url" name="target_url" value="{{ old('target_url') }}"
                                    placeholder="https://example.com/landing-page"
                                    class="w-full block bg-transparent py-3 pr-5 font-medium outline-none text-black dark:text-white min-w-0" />
                            </div>
                            
                            @error('target_url')
                                <p class="text-red-500 text-sm mt-2 font-medium">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-2">Where users will be redirected when they click the ad.</p>
                        </div>
                    </div>
                </div>

                <!-- Media Card -->
                <div class="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full">
                    <div class="border-b border-stroke py-4 px-6 dark:border-strokedark flex items-center gap-3">
                        <div class="text-primary">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 class="font-semibold text-black dark:text-white truncate">Banner Media</h3>
                    </div>

                    <div class="p-6 w-full">
                        <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                            Upload Advertisement Image <span class="text-red-500">*</span>
                        </label>
                        <div class="relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-primary/30 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3 cursor-pointer overflow-hidden group box-border">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none px-4 text-center">
                                <div class="bg-white p-3 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform text-black shrink-0">
                                    <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                </div>
                                <p class="mb-1 text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-normal"><span class="text-primary font-semibold">Click to upload</span> or drag and drop</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 whitespace-normal">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                            </div>
                            <input type="file" name="image" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required onchange="previewImage(this)" />
                            
                            <!-- Preview Image Container (Hidden by default) -->
                            <img id="image-preview" src="#" alt="Preview" class="absolute inset-0 w-full h-full object-contain bg-black/5 hidden z-10 pointer-events-none" />
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <p id="file-size-display" class="text-sm text-primary font-medium hidden"></p>
                            <button type="button" id="remove-image-btn" class="hidden text-sm text-red-500 hover:text-red-700 font-medium transition-colors" onclick="removeImage()">Remove file</button>
                        </div>
                        @error('image')
                            <p class="text-red-500 text-sm mt-2 font-medium">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

            </div>

            <!-- Right Column: Settings -->
            <div class="xl:col-span-4 space-y-6 xl:space-y-8 w-full min-w-0">
                
                <!-- Display Settings -->
                <div class="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full">
                    <div class="border-b border-stroke py-4 px-6 dark:border-strokedark flex items-center gap-3">
                        <div class="text-primary">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <h3 class="font-semibold text-black dark:text-white truncate">Settings</h3>
                    </div>

                    <div class="p-6 space-y-5 w-full">
                        <!-- Position -->
                        <div class="w-full">
                            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                Ad Position <span class="text-red-500">*</span>
                            </label>
                            <select name="position"
                                class="w-full block box-border rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input font-medium"
                                required>
                                <option value="" disabled {{ old('position') ? '' : 'selected' }}>Select Ad Position</option>
                                <option value="top" {{ old('position') == 'top' ? 'selected' : '' }}>Top (Leaderboard · 728×90)</option>
                                <option value="right" {{ old('position') == 'right' ? 'selected' : '' }}>Right (Skyscraper · 300×600)</option>
                                <option value="bottom" {{ old('position') == 'bottom' ? 'selected' : '' }}>Bottom (Medium Rectangle)</option>
                            </select>
                            @error('position')
                                <p class="text-red-500 text-sm mt-2 font-medium">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Status -->
                        <div class="w-full">
                            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                Campaign Status <span class="text-red-500">*</span>
                            </label>
                            <select name="status"
                                class="w-full block box-border rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input font-medium"
                                required>
                                <option value="" disabled {{ old('status') ? '' : 'selected' }}>Select Campaign Status</option>
                                <option value="active" {{ old('status') == 'active' ? 'selected' : '' }}>Active (Visible)</option>
                                <option value="inactive" {{ old('status') == 'inactive' ? 'selected' : '' }}>Inactive (Hidden)</option>
                            </select>
                            @error('status')
                                <p class="text-red-500 text-sm mt-2 font-medium">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Schedule Card -->
                <div class="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full">
                    <div class="border-b border-stroke py-4 px-6 dark:border-strokedark flex items-center gap-3">
                        <div class="text-primary">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 class="font-semibold text-black dark:text-white truncate">Schedule</h3>
                    </div>

                    <div class="p-6 space-y-5 w-full">
                        <!-- Start Date -->
                        <div class="w-full">
                            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">Start Date <span class="text-red-500">*</span></label>
                            <input type="date" name="start_date" value="{{ old('start_date') }}" required
                                class="w-full block box-border rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input" />
                            @error('start_date')
                                <p class="text-red-500 text-sm mt-1 font-medium">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- End Date -->
                        <div class="w-full">
                            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">End Date <span class="text-red-500">*</span></label>
                            <input type="date" name="end_date" value="{{ old('end_date') }}" required
                                class="w-full block box-border rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input" />
                            @error('end_date')
                                <p class="text-red-500 text-sm mt-1 font-medium">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Submit Button Area -->
        <div class="mt-8 flex justify-end gap-4 w-full">
            <a href="{{ route('admin.advertisings.index') }}" class="py-3 px-7 rounded-xl border border-stroke font-medium text-black hover:bg-gray-50 transition-colors dark:border-strokedark dark:text-white dark:hover:bg-meta-4">
                Cancel
            </a>
            <button type="submit" class="flex items-center gap-2 py-3 px-7 rounded-xl bg-primary font-medium text-white hover:bg-opacity-90 transition-all duration-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Publish Advertisement
            </button>
        </div>
    </form>
    
    <!-- Image Preview Script -->
    <script>
        function removeImage() {
            var input = document.querySelector('input[type="file"][name="image"]');
            var preview = document.getElementById('image-preview');
            var sizeDisplay = document.getElementById('file-size-display');
            var removeBtn = document.getElementById('remove-image-btn');
            
            if (input) input.value = '';
            if (preview) {
                preview.src = '#';
                preview.classList.add('hidden');
            }
            if (sizeDisplay) sizeDisplay.classList.add('hidden');
            if (removeBtn) removeBtn.classList.add('hidden');
        }

        function previewImage(input) {
            if (input.files && input.files[0]) {
                var file = input.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
                    var preview = document.getElementById('image-preview');
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');

                    var img = new Image();
                    img.onload = function() {
                        var sizeDisplay = document.getElementById('file-size-display');
                        var removeBtn = document.getElementById('remove-image-btn');
                        if (sizeDisplay) {
                            var sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                            sizeDisplay.innerText = "Selected File: " + sizeInMB + " MB (" + img.width + "×" + img.height + " px)";
                            sizeDisplay.classList.remove('hidden');
                        }
                        if (removeBtn) removeBtn.classList.remove('hidden');
                    };
                    img.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        }
    </script>
</x-admin.layout>
