<x-admin.layout title="Edit SaaS Plan | Card Setu">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Edit SaaS Plan
        </h2>

        <a href="{{ route('admin.plans.index') }}" class="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 transition-all duration-300 shadow-sm">
            <span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </span>
            Back to Plans
        </a>
    </div>

    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mx-auto max-w-3xl">
        <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
                Plan Details
            </h3>
        </div>

        @if ($errors->any())
            <div class="p-6.5 pb-0">
                <div class="mb-4 flex w-full border-l-6 border-[#F87171] bg-[#F87171] bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
                    <div class="w-full">
                        <ul class="list-disc pl-5 text-[#B45454]">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        @endif

        <form action="{{ route('admin.plans.update', $plan) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="p-6.5">
                <div class="mb-4.5">
                    <label class="mb-2.5 block text-black dark:text-white">
                        Plan Name <span class="text-meta-1">*</span>
                    </label>
                    <input type="text" name="name" value="{{ old('name', $plan->name) }}" required placeholder="e.g. Pro Plan"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                </div>

                <div class="mb-4.5">
                    <label class="mb-2.5 block text-black dark:text-white">
                        Price (₹) <span class="text-meta-1">*</span>
                    </label>
                    <input type="number" name="price" value="{{ old('price', $plan->price) }}" step="0.01" required placeholder="e.g. 29.99"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
                </div>

                <div class="mb-4.5">
                    <label class="mb-2.5 block text-black dark:text-white">
                        Billing Period <span class="text-meta-1">*</span>
                    </label>
                    <div class="relative z-20 bg-transparent dark:bg-form-input">
                        <select name="billing_period" required
                            class="relative z-20 w-full appearance-none rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                            <option value="monthly" {{ old('billing_period', $plan->billing_period) === 'monthly' ? 'selected' : '' }}>Monthly</option>
                            <option value="yearly" {{ old('billing_period', $plan->billing_period) === 'yearly' ? 'selected' : '' }}>Yearly</option>
                            <option value="lifetime" {{ old('billing_period', $plan->billing_period) === 'lifetime' ? 'selected' : '' }}>Lifetime</option>
                        </select>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="mb-2.5 block text-black dark:text-white">
                        Features (One per line)
                    </label>
                    <textarea rows="7" name="features" placeholder="Unlimited Cards&#10;Custom Domain&#10;Analytics Dashboard"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">{{ old('features', is_array($plan->features) ? implode("\n", $plan->features) : '') }}</textarea>
                </div>

                <button type="submit" class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
                    Update Plan
                </button>
            </div>
        </form>
    </div>
</x-admin.layout>
