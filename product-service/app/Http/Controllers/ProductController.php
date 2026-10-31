<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    private function authenticatedUser(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return null;
        }

        $response = Http::withToken($token)
            ->timeout(10)
            ->get('http://127.0.0.1:8003/api/user');

        if ($response->failed()) {
            return null;
        }

        $user = $response->json();

        return !empty($user['id']) ? $user : null;
    }

    private function categories(): array
    {
        return [
            'audio',
            'elektronik',
            'aksesori',
            'fashion',
            'lainnya',
        ];
    }

    public function index()
    {
        return response()->json(
            Product::where('stock', '>=', 0)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $user = $this->authenticatedUser($request);

        if (!$user) {
            return response()->json([
                'message' => 'Silakan login terlebih dahulu.',
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => [
                'required',
                'string',
                Rule::in($this->categories()),
            ],
            'description' => 'nullable|string|max:5000',
            'price' => 'required|numeric|min:0.01',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create([
            'seller_id' => $user['id'],
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'stock' => $validated['stock'],
        ]);

        return response()->json([
            'message' => 'Produk berhasil dibuat.',
            'data' => $product,
        ], 201);
    }

    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan.',
            ], 404);
        }

        return response()->json($product);
    }

    public function myProducts(Request $request)
    {
        $user = $this->authenticatedUser($request);

        if (!$user) {
            return response()->json([
                'message' => 'Token tidak valid.',
            ], 401);
        }

        return response()->json(
            Product::where('seller_id', $user['id'])
                ->latest()
                ->get()
        );
    }

    public function update(Request $request, $id)
    {
        $user = $this->authenticatedUser($request);

        if (!$user) {
            return response()->json([
                'message' => 'Token tidak valid.',
            ], 401);
        }

        $product = Product::where('id', $id)
            ->where('seller_id', $user['id'])
            ->first();

        if (!$product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan atau bukan milikmu.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => [
                'sometimes',
                'required',
                'string',
                Rule::in($this->categories()),
            ],
            'description' => 'sometimes|nullable|string|max:5000',
            'price' => 'sometimes|required|numeric|min:0.01',
            'stock' => 'sometimes|required|integer|min:0',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => $product->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $this->authenticatedUser($request);

        if (!$user) {
            return response()->json([
                'message' => 'Token tidak valid.',
            ], 401);
        }

        $product = Product::where('id', $id)
            ->where('seller_id', $user['id'])
            ->first();

        if (!$product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan atau bukan milikmu.',
            ], 404);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    public function reduceStock(Request $request, $id)
    {
        // Endpoint internal: hanya Transaction Service yang boleh memanggil.
        $internalKey = config('services.internal.key');

        if (
            !$internalKey ||
            !hash_equals(
                $internalKey,
                (string) $request->header('X-Internal-Key')
            )
        ) {
            return response()->json([
                'message' => 'Akses internal ditolak.',
            ], 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $quantity = $validated['quantity'];

        $updated = DB::table('products')
            ->where('id', $id)
            ->where('stock', '>=', $quantity)
            ->decrement('stock', $quantity);

        if (!$updated) {
            return response()->json([
                'message' => 'Produk tidak ditemukan atau stok tidak cukup.',
            ], 422);
        }

        return response()->json([
            'message' => 'Stok berhasil dikurangi.',
            'new_stock' => Product::find($id)?->stock,
        ]);
    }
}