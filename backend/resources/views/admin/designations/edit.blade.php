<x-admin.layout>
    <x-slot name="title">Edit Designation | Card Setu Admin</x-slot>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Edit Designation
        </h2>

        <a href="{{ route('admin.designations.index') }}" class="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-all duration-300 shadow-sm">
            <span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </span>
            Back to Designations
        </a>
    </div>

    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
                Designation Details
            </h3>
        </div>
        <form action="{{ route('admin.designations.update', $designation->id) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="p-6.5">
                <div class="mb-4.5 flex flex-col gap-6 sm:flex-row">
                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Designation Name <span class="text-[#EB5757]">*</span>
                        </label>
                        <input type="text" name="name" value="{{ old('name', $designation->name) }}" class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary @error('name') border-[#EB5757] @enderror" required>
                        @error('name')
                            <p class="mt-1 text-sm text-[#EB5757]">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Status <span class="text-[#EB5757]">*</span>
                        </label>
                        <div class="relative z-20 bg-transparent dark:bg-form-input">
                            <select name="status" class="relative z-20 w-full appearance-none rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary @error('status') border-[#EB5757] @enderror" required>
                                <option value="active" {{ old('status', $designation->status) === 'active' ? 'selected' : '' }}>Active</option>
                                <option value="inactive" {{ old('status', $designation->status) === 'inactive' ? 'selected' : '' }}>Inactive</option>
                            </select>
                            <span class="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g opacity="0.8">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill=""></path>
                                    </g>
                                </svg>
                            </span>
                        </div>
                        @error('status')
                            <p class="mt-1 text-sm text-[#EB5757]">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <button type="submit" class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 transition-all duration-300">
                    Update Designation
                </button>
            </div>
        </form>
    </div>
</x-admin.layout>
