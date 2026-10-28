<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'product_id' => 'required|integer|min:1',
        'quantity' => 'required|integer|min:1',
        'fulfillment_method' => 'required|in:delivery,pickup',
        'payment_method' => 'required|in:cod,direct_transfer',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Data checkout tidak valid.',
            'errors' => $validator->errors(),
        ], 422);
    }

    $token = $request->bearerToken();

    if (!$token) {
        return response()->json([
            'message' => 'Silakan login terlebih dahulu.',
        ], 401);
    }

    try {
        // 1. Validasi pengguna ke User Service
        $userResponse = Http::withToken($token)
            ->timeout(10)
            ->get('http://127.0.0.1:8003/api/user');

        if ($userResponse->failed() || empty($userResponse->json('id'))) {
            return response()->json([
                'message' => 'Token tidak valid atau sudah kedaluwarsa.',
            ], 401);
        }

        $userData = $userResponse->json();

        // 2. Ambil produk dari Product Service
        $productResponse = Http::timeout(10)
            ->get('http://127.0.0.1:8001/api/products/' . $request->product_id);

        if ($productResponse->status() === 404) {
            return response()->json([
                'message' => 'Produk tidak ditemukan.',
            ], 404);
        }

        if ($productResponse->failed()) {
            return response()->json([
                'message' => 'Product Service gagal dihubungi.',
            ], 502);
        }

        $product = $productResponse->json();

        if (isset($product['data']) && is_array($product['data'])) {
            $product = $product['data'];
        }

        if (!isset($product['id'], $product['price'], $product['stock'])) {
            return response()->json([
                'message' => 'Format data produk tidak sesuai.',
            ], 502);
        }

        // Produk lama harus memiliki seller_id sebelum dapat dijual.
        if (empty($product['seller_id'])) {
            return response()->json([
                'message' => 'Produk belum memiliki pemilik. Seller perlu ditetapkan terlebih dahulu.',
            ], 422);
        }

        $quantity = (int) $request->quantity;

        if ($quantity > (int) $product['stock']) {
            return response()->json([
                'message' => 'Stok tidak cukup.',
                'available_stock' => (int) $product['stock'],
            ], 422);
        }

        $internalKey = config('services.internal.key');

        if (!$internalKey) {
            return response()->json([
                'message' => 'Konfigurasi kunci internal belum tersedia.',
            ], 500);
        }

        // 3. Kurangi stok dengan autentikasi internal
        $reduceStockResponse = Http::withHeaders([
            'X-Internal-Key' => $internalKey,
        ])->timeout(10)->post(
            'http://127.0.0.1:8001/api/products/'
                . $product['id'] . '/reduce-stock',
            ['quantity' => $quantity]
        );

        if ($reduceStockResponse->failed()) {
            return response()->json([
                'message' => 'Gagal mengurangi stok produk.',
                'details' => $reduceStockResponse->json('message')
                    ?? 'Product Service menolak permintaan.',
            ], 422);
        }

        // 4. Simpan informasi pembeli, seller, dan checkout
        try {
            $transaction = Transaction::create([
                'user_id' => $userData['id'],
                'seller_id' => $product['seller_id'],
                'product_id' => $product['id'],
                'quantity' => $quantity,
                'total_price' => (float) $product['price'] * $quantity,
                'status' => 'pending',
                'fulfillment_method' => $request->fulfillment_method,
                'payment_method' => $request->payment_method,
                'payment_status' => 'unpaid',
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Stok sudah dikurangi, tetapi transaksi gagal disimpan. Perlu pemeriksaan dan pemulihan stok oleh pengelola.',
            ], 500);
        }

        return response()->json([
            'message' => 'Transaksi berhasil dibuat.',
            'user' => $userData['name'] ?? null,
            'data' => $transaction,
        ], 201);

    } catch (\Illuminate\Http\Client\ConnectionException $e) {
        return response()->json([
            'message' => 'Tidak dapat terhubung ke User Service atau Product Service. Pastikan keduanya berjalan.',
        ], 502);
    }
}


        public function index(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Silakan login terlebih dahulu.',
            ], 401);
        }

        try {
            $userResponse = Http::withToken($token)
                ->timeout(10)
                ->get('http://127.0.0.1:8003/api/user');

            if ($userResponse->failed()) {
                return response()->json([
                    'message' => 'Token tidak valid atau sudah kedaluwarsa.',
                ], 401);
            }

            $userData = $userResponse->json();

            if (empty($userData['id'])) {
                return response()->json([
                    'message' => 'Data pengguna tidak valid.',
                ], 502);
            }

            $transactions = Transaction::where(
                'user_id',
                $userData['id']
            )->latest()->get();

            return response()->json($transactions);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'message' => 'User Service tidak dapat dihubungi.',
            ], 502);
        }
    }

    public function show(Request $request, $id)
{
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json([
            'message' => 'Silakan login terlebih dahulu.',
        ], 401);
    }

    try {
        $userResponse = Http::withToken($token)
            ->timeout(10)
            ->get('http://127.0.0.1:8003/api/user');

        if ($userResponse->failed()) {
            return response()->json([
                'message' => 'Token tidak valid atau sudah kedaluwarsa.',
            ], 401);
        }

        $userData = $userResponse->json();

        if (empty($userData['id'])) {
            return response()->json([
                'message' => 'Data pengguna tidak valid.',
            ], 502);
        }

        $transaction = Transaction::where('user_id', $userData['id'])
            ->where('id', $id)
            ->first();

        if (!$transaction) {
            return response()->json([
                'message' => 'Transaksi tidak ditemukan.',
            ], 404);
        }

        return response()->json($transaction);

    } catch (\Illuminate\Http\Client\ConnectionException $e) {
        return response()->json([
            'message' => 'User Service tidak dapat dihubungi.',
        ], 502);
    }
}


public function sellerOrders(Request $request)
{
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json([
            'message' => 'Silakan login terlebih dahulu.',
        ], 401);
    }

    try {
        $userResponse = Http::withToken($token)
            ->timeout(10)
            ->get('http://127.0.0.1:8003/api/user');

        if ($userResponse->failed()) {
            return response()->json([
                'message' => 'Token tidak valid atau sudah kedaluwarsa.',
            ], 401);
        }

        $userData = $userResponse->json();

        if (empty($userData['id'])) {
            return response()->json([
                'message' => 'Data pengguna tidak valid.',
            ], 502);
        }

        $transactions = Transaction::where(
            'seller_id',
            $userData['id']
        )->latest()->get();

        return response()->json($transactions);

    } catch (\Illuminate\Http\Client\ConnectionException $e) {
        return response()->json([
            'message' => 'User Service tidak dapat dihubungi.',
        ], 502);
    }
}

public function updateOrderStatus(Request $request, $id)
{
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json([
            'message' => 'Silakan login.',
        ], 401);
    }

    $userResponse = Http::withToken($token)
        ->timeout(10)
        ->get('http://127.0.0.1:8003/api/user');

    if ($userResponse->failed() || empty($userResponse->json('id'))) {
        return response()->json([
            'message' => 'Token tidak valid.',
        ], 401);
    }

    $userId = (int) $userResponse->json('id');

    $validated = $request->validate([
        'status' => 'required|in:processing,shipped,ready_for_pickup,rejected',
    ]);

    $transaction = Transaction::where('id', $id)
        ->where('seller_id', $userId)
        ->first();

    if (!$transaction) {
        return response()->json([
            'message' => 'Pesanan tidak ditemukan atau bukan milik tokomu.',
        ], 404);
    }

    $current = $transaction->status;
    $next = $validated['status'];

    $allowed = [
        'pending' => ['processing', 'rejected'],
        'processing' => [
            $transaction->fulfillment_method === 'delivery'
                ? 'shipped'
                : 'ready_for_pickup',
        ],
    ];

    if (!in_array($next, $allowed[$current] ?? [], true)) {
        return response()->json([
            'message' => 'Perubahan status tidak diizinkan.',
            'current_status' => $current,
        ], 422);
    }

    $transaction->status = $next;
    $transaction->save();

    return response()->json([
        'message' => 'Status pesanan berhasil diperbarui.',
        'data' => $transaction->fresh(),
    ]);
}

public function confirmReceived(Request $request, $id)
{
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json([
            'message' => 'Silakan login.',
        ], 401);
    }

    
try {
    $userResponse = Http::withToken($token)
        ->timeout(10)
        ->get('http://127.0.0.1:8003/api/user');
} catch (\Illuminate\Http\Client\ConnectionException $e) {
    return response()->json([
        'message' => 'User Service tidak dapat dihubungi.',
    ], 502);
}


    if ($userResponse->failed() || empty($userResponse->json('id'))) {
        return response()->json([
            'message' => 'Token tidak valid.',
        ], 401);
    }

    $userId = (int) $userResponse->json('id');

    $transaction = Transaction::where('id', $id)
        ->where('user_id', $userId)
        ->first();

    if (!$transaction) {
        return response()->json([
            'message' => 'Pesanan tidak ditemukan.',
        ], 404);
    }

    if (!in_array($transaction->status, [
        'shipped',
        'ready_for_pickup',
    ], true)) {
        return response()->json([
            'message' => 'Pesanan belum siap dikonfirmasi.',
        ], 422);
    }

    $transaction->status = 'completed';
    $transaction->save();

    return response()->json([
        'message' => 'Penerimaan barang berhasil dikonfirmasi.',
        'data' => $transaction->fresh(),
    ]);
}


}
