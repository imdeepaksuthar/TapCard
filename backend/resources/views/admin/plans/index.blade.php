<x-admin.layout title="Manage SaaS Plans | Card Setu">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            SaaS Plans Management
        </h2>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {{ session('success') }}
        </div>
    @endif

    <div class="grid grid-cols-1 gap-9 lg:grid-cols-2">
        
        <!-- Plans List -->
        <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">
                Existing Plans
            </h4>

            <div class="flex flex-col">
                <div class="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
                    <div class="p-2.5 xl:p-5">
                        <h5 class="text-sm font-medium uppercase xsm:text-base">Name</h5>
                    </div>
                    <div class="p-2.5 text-center xl:p-5">
                        <h5 class="text-sm font-medium uppercase xsm:text-base">Price</h5>
                    </div>
                    <div class="p-2.5 text-center xl:p-5">
                        <h5 class="text-sm font-medium uppercase xsm:text-base">Billing</h5>
                    </div>
                    <div class="hidden p-2.5 text-center sm:block xl:p-5">
                        <h5 class="text-sm font-medium uppercase xsm:text-base">Features</h5>
                    </div>
                    <div class="p-2.5 text-center xl:p-5">
                        <h5 class="text-sm font-medium uppercase xsm:text-base">Actions</h5>
                    </div>
                </div>

                @forelse($plans as $plan)
                    <div class="grid grid-cols-4 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
                        <div class="flex items-center gap-3 p-2.5 xl:p-5">
                            <p class="text-black dark:text-white">{{ $plan->name }}</p>
                        </div>

                        <div class="flex items-center justify-center p-2.5 xl:p-5">
                            <p class="text-meta-3">₹{{ number_format($plan->price, 2) }}</p>
                        </div>

                        <div class="flex items-center justify-center p-2.5 xl:p-5">
                            <p class="text-black dark:text-white capitalize">{{ $plan->billing_period }}</p>
                        </div>

                        <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ is_array($plan->features) ? count($plan->features) . ' features' : 'No features' }}
                            </p>
                        </div>

                        <div class="flex items-center justify-center gap-3 p-2.5 xl:p-5">
                            <a href="{{ route('admin.plans.edit', $plan) }}" class="hover:text-primary transition-colors flex items-center justify-center rounded-full border border-stroke bg-gray-100 p-2 dark:border-strokedark dark:bg-meta-4" title="Edit Plan">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </a>
                            <form action="{{ route('admin.plans.destroy', $plan) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this plan?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="hover:text-[#EB5757] transition-colors flex items-center justify-center rounded-full border border-stroke bg-gray-100 p-2 dark:border-strokedark dark:bg-meta-4" title="Delete Plan">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                @empty
                    <div class="p-5 text-center text-gray-500 dark:text-gray-400">
                        No plans created yet.
                    </div>
                @endforelse
            </div>
        </div>

        <!-- Create Plan Form -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">
                    Create New Plan
                </h3>
            </div>
            <form action="{{ route('admin.plans.store') }}" method="POST">
                @csrf
                <div class="p-6.5">
                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Plan Name <span class="text-meta-1">*</span>
                        </label>
                        <input type="text" name="name" required placeholder="e.g. Pro Plan"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                    </div>

                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Price (₹) <span class="text-meta-1">*</span>
                        </label>
                        <input type="number" name="price" step="0.01" required placeholder="e.g. 29.99"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                    </div>

                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Billing Period <span class="text-meta-1">*</span>
                        </label>
                        <div class="relative z-20 bg-transparent dark:bg-form-input">
                            <select name="billing_period" required
                                class="relative z-20 w-full appearance-none rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Features (One per line)
                        </label>
                        <textarea rows="5" name="features" placeholder="Unlimited Cards&#10;Custom Domain&#10;Analytics Dashboard"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"></textarea>
                    </div>

                    <button type="submit" class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
                        Create Plan
                    </button>
                </div>
            </form>
        </div>
    </div>
</x-admin.layout>
