<x-admin.layout title="Products | Card Setu">
    <div x-data="{ editing: null, openEdit(product) { this.editing = product; } }" class="space-y-6">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-title-md2 font-bold text-black dark:text-white">
            Product Management
        </h2>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {{ session('success') }}
        </div>
    @endif

    @if($errors->any())
        <div class="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            <ul class="list-disc list-inside text-sm">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <!-- Left: Product List -->
        <div class="col-span-2 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">
                    Existing Products ({{ $products->count() }})
                </h3>
            </div>
            <div class="p-6.5">
                <div class="max-w-full overflow-x-auto">
                    <table class="w-full table-auto">
                        <thead>
                            <tr class="bg-gray-2 text-left dark:bg-meta-4">
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Image</th>
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Name</th>
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Price</th>
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                                <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($products as $product)
                            <tr>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    @if($product->image)
                                        <img src="{{ asset('storage/' . $product->image) }}" alt="{{ $product->name }}" class="w-14 h-14 rounded object-cover" />
                                    @else
                                        <div class="w-14 h-14 rounded bg-gray-200 dark:bg-strokedark flex items-center justify-center text-xs text-gray-500">No image</div>
                                    @endif
                                </td>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <h5 class="font-medium text-black dark:text-white">{{ $product->name }}</h5>
                                    <p class="text-xs text-gray-500 line-clamp-2 max-w-xs">{{ $product->description }}</p>
                                </td>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <p class="text-meta-3 font-medium">₹{{ number_format($product->price, 2) }}</p>
                                </td>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    @if($product->is_active)
                                        <span class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Active</span>
                                    @else
                                        <span class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">Inactive</span>
                                    @endif
                                </td>
                                <td class="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <div class="flex items-center gap-3">
                                        <button
                                            type="button"
                                            @click='openEdit(@json([
                                                "id" => $product->id,
                                                "name" => $product->name,
                                                "description" => $product->description,
                                                "price" => $product->price,
                                                "image" => $product->image ? asset("storage/" . $product->image) : null,
                                                "is_active" => (bool) $product->is_active,
                                                "update_url" => route("admin.products.update", $product),
                                            ]))'
                                            class="text-primary hover:text-blue-700 font-medium">
                                            Edit
                                        </button>
                                        <form action="{{ route('admin.products.destroy', $product) }}" method="POST" onsubmit="return confirm('Delete this product?')">
                                            @csrf
                                            @method('DELETE')
                                            <button class="text-danger hover:text-red-500">Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="py-8 text-center text-gray-500">No products created yet.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Right: Create Form -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">
                    Add New Product
                </h3>
            </div>
            <form action="{{ route('admin.products.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="p-6.5">
                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Product Name <span class="text-meta-1">*</span>
                        </label>
                        <input type="text" name="name" required placeholder="Enter product name"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                    </div>

                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Price (₹) <span class="text-meta-1">*</span>
                        </label>
                        <input type="number" step="0.01" name="price" required placeholder="e.g. 49.99"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                    </div>

                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Description
                        </label>
                        <textarea rows="4" name="description" placeholder="Short product description"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"></textarea>
                    </div>

                    <div class="mb-4.5">
                        <label class="mb-2.5 block text-black dark:text-white">
                            Product Image
                        </label>
                        <input type="file" name="image" accept="image/*"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                    </div>

                    <div class="mb-6 flex items-center gap-3">
                        <input type="checkbox" name="is_active" value="1" checked id="is_active" class="w-4 h-4" />
                        <label for="is_active" class="text-black dark:text-white">Active (visible on public dashboard)</label>
                    </div>

                    <button type="submit" class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Save Product
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Product Modal -->
    <div
        x-show="editing"
        x-cloak
        @keydown.escape.window="editing = null"
        class="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4"
        style="display: none;">
        <div @click.outside="editing = null" class="w-full max-w-lg rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="flex items-center justify-between border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">Edit Product</h3>
                <button type="button" @click="editing = null" class="text-gray-500 hover:text-black dark:hover:text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <template x-if="editing">
                <form :action="editing.update_url" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')
                    <div class="p-6.5">
                        <div class="mb-4.5">
                            <label class="mb-2.5 block text-black dark:text-white">
                                Product Name <span class="text-meta-1">*</span>
                            </label>
                            <input type="text" name="name" required x-model="editing.name"
                                class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>

                        <div class="mb-4.5">
                            <label class="mb-2.5 block text-black dark:text-white">
                                Price (₹) <span class="text-meta-1">*</span>
                            </label>
                            <input type="number" step="0.01" name="price" required x-model="editing.price"
                                class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                        </div>

                        <div class="mb-4.5">
                            <label class="mb-2.5 block text-black dark:text-white">Description</label>
                            <textarea rows="4" name="description" x-model="editing.description"
                                class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"></textarea>
                        </div>

                        <div class="mb-4.5">
                            <label class="mb-2.5 block text-black dark:text-white">Current Image</label>
                            <template x-if="editing.image">
                                <img :src="editing.image" class="w-24 h-24 rounded object-cover mb-2" />
                            </template>
                            <template x-if="!editing.image">
                                <p class="text-xs text-gray-500 mb-2">No image uploaded.</p>
                            </template>
                            <label class="mb-2.5 block text-black dark:text-white">Replace Image</label>
                            <input type="file" name="image" accept="image/*"
                                class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                        </div>

                        <div class="mb-6 flex items-center gap-3">
                            <input type="hidden" name="is_active" value="0" />
                            <input type="checkbox" name="is_active" value="1" :checked="editing.is_active" id="edit_is_active" class="w-4 h-4" />
                            <label for="edit_is_active" class="text-black dark:text-white">Active (visible on public dashboard)</label>
                        </div>

                        <div class="flex items-center justify-end gap-3">
                            <button type="button" @click="editing = null"
                                class="rounded border border-stroke py-2 px-5 font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-strokedark">
                                Cancel
                            </button>
                            <button type="submit" class="rounded bg-primary py-2 px-5 font-medium text-white bg-blue-600 hover:bg-blue-700">
                                Update Product
                            </button>
                        </div>
                    </div>
                </form>
            </template>
        </div>
    </div>
    </div>
</x-admin.layout>
