<x-admin.layout title="NFC Printing Queue | Card Setu">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            NFC Card Printing Queue
        </h2>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {{ session('success') }}
        </div>
    @endif

    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">
            NFC Orders
        </h4>

        <div class="flex flex-col">
            <div class="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
                <div class="p-2.5 xl:p-5">
                    <h5 class="text-sm font-medium uppercase xsm:text-base">User</h5>
                </div>
                <div class="p-2.5 text-center xl:p-5">
                    <h5 class="text-sm font-medium uppercase xsm:text-base">Card Slug</h5>
                </div>
                <div class="p-2.5 text-center xl:p-5">
                    <h5 class="text-sm font-medium uppercase xsm:text-base">Status</h5>
                </div>
                <div class="hidden p-2.5 text-center sm:block xl:p-5">
                    <h5 class="text-sm font-medium uppercase xsm:text-base">Tracking</h5>
                </div>
                <div class="p-2.5 text-center xl:p-5">
                    <h5 class="text-sm font-medium uppercase xsm:text-base">Action</h5>
                </div>
            </div>

            @forelse($nfcCards as $card)
                <div class="grid grid-cols-4 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
                    <div class="flex items-center gap-3 p-2.5 xl:p-5">
                        <p class="text-black dark:text-white">{{ $card->businessCard->user->name ?? 'Unknown' }}</p>
                    </div>

                    <div class="flex items-center justify-center p-2.5 xl:p-5">
                        <p class="text-black dark:text-white">{{ $card->businessCard->slug ?? 'N/A' }}</p>
                    </div>

                    <div class="flex items-center justify-center p-2.5 xl:p-5">
                        <span class="rounded-full py-1 px-3 text-xs font-medium 
                            {{ $card->order_status === 'pending' ? 'bg-warning/10 text-warning' : '' }}
                            {{ $card->order_status === 'printed' ? 'bg-primary/10 text-primary' : '' }}
                            {{ $card->order_status === 'shipped' ? 'bg-success/10 text-success' : '' }}
                            {{ $card->order_status === 'active' ? 'bg-success/20 text-success' : '' }}">
                            {{ ucfirst($card->order_status) }}
                        </span>
                    </div>

                    <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ $card->tracking_number ?? 'Not available' }}
                        </p>
                    </div>

                    <div class="flex items-center justify-center p-2.5 xl:p-5">
                        <form action="{{ route('admin.nfc.update', $card->id) }}" method="POST" class="flex items-center gap-2">
                            @csrf
                            @method('PUT')
                            <select name="order_status" class="rounded border border-stroke py-1 px-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-form-input">
                                <option value="pending" {{ $card->order_status === 'pending' ? 'selected' : '' }}>Pending</option>
                                <option value="printed" {{ $card->order_status === 'printed' ? 'selected' : '' }}>Printed</option>
                                <option value="shipped" {{ $card->order_status === 'shipped' ? 'selected' : '' }}>Shipped</option>
                                <option value="active" {{ $card->order_status === 'active' ? 'selected' : '' }}>Active</option>
                            </select>
                            <button type="submit" class="rounded bg-primary py-1 px-2 text-xs text-white hover:bg-opacity-90">
                                Update
                            </button>
                        </form>
                    </div>
                </div>
            @empty
                <div class="p-5 text-center text-gray-500 dark:text-gray-400">
                    No NFC cards in the queue.
                </div>
            @endforelse
        </div>
    </div>
</x-admin.layout>
