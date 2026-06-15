<x-admin.layout>
    <x-slot name="title">Add New User | Card Setu Admin</x-slot>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Add New User
        </h2>

        <a href="{{ route('admin.users.index') }}"
            class="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-all duration-300 shadow-sm">
            <span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </span>
            Back to Users
        </a>
    </div>

    <!-- Create User Form -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
                User Details
            </h3>
        </div>
        <form action="{{ route('admin.users.store') }}" method="POST">
            @csrf
            <div class="p-6.5">
                <div class="mb-4.5 flex flex-col gap-6 sm:flex-row">
                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Full Name <span class="text-[#EB5757]">*</span>
                        </label>
                        <input type="text" name="name" value="{{ old('name') }}" placeholder="Enter full name"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary @error('name') border-[#EB5757] @enderror"
                            required>
                        @error('name')
                            <p class="mt-1 text-sm text-[#EB5757]">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Email Address <span class="text-[#EB5757]">*</span>
                        </label>
                        <input type="email" name="email" value="{{ old('email') }}" placeholder="Enter email address"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary @error('email') border-[#EB5757] @enderror"
                            required>
                        @error('email')
                            <p class="mt-1 text-sm text-[#EB5757]">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div class="mb-4.5 flex flex-col gap-6 sm:flex-row">
                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Phone Number
                        </label>
                        <input type="text" name="phone" value="{{ old('phone') }}" placeholder="Enter phone number"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary @error('phone') border-[#EB5757] @enderror">
                        @error('phone')
                            <p class="mt-1 text-sm text-[#EB5757]">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Role <span class="text-[#EB5757]">*</span>
                        </label>
                        <div class="relative z-20 bg-transparent dark:bg-form-input">
                            <select name="role"
                                class="relative z-20 w-full appearance-none rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary @error('role') border-[#EB5757] @enderror"
                                required>
                                <option value="user" {{ old('role') === 'user' ? 'selected' : '' }}>Standard User</option>
                                <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }}>Administrator
                                </option>
                                <option value="super_admin" {{ old('role') === 'super_admin' ? 'selected' : '' }}>Super
                                    Admin</option>
                            </select>
                            <span class="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g opacity="0.8">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill=""></path>
                                    </g>
                                </svg>
                            </span>
                        </div>
                        @error('role')
                            <p class="mt-1 text-sm text-[#EB5757]">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div class="mb-6 flex flex-col gap-6 sm:flex-row">
                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Password <span class="text-[#EB5757]">*</span>
                        </label>
                        <input type="password" name="password" placeholder="Enter password"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary @error('password') border-[#EB5757] @enderror"
                            required minlength="8">
                        @error('password')
                            <p class="mt-1 text-sm text-[#EB5757]">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="w-full sm:w-1/2">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Confirm Password <span class="text-[#EB5757]">*</span>
                        </label>
                        <input type="password" name="password_confirmation" placeholder="Re-enter password"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            required minlength="8">
                    </div>
                </div>

                <button type="submit"
                    class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 transition-all duration-300">
                    Create User
                </button>
            </div>
        </form>
    </div>
</x-admin.layout>