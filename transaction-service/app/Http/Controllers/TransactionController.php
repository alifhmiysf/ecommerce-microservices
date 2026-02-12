<?php

namespace App\Http\Controllers;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TransactionController extends Controller
{
    public function store(Request $request)
{
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json(['message' => 'Token tidak ditemukan! Anda harus login.'], 401);
    }

    // VALIDASI USER
    $userResponse = Http::withToken($token)
        ->get("http://user-service:8000/api/user");

    if ($userResponse->failed()) {
        return response()->json(['message' => 'Token tidak valid atau sudah expired!'], 401);
    }

    $userData = $userResponse->json();
    $userId = $userData['id'];

    // AMBIL PRODUK
    $productResponse = Http::get("http://product-service:8000/api/products/{$request->product_id}");

    if ($productResponse->failed()) {
        return response()->json(['message' => 'Produk tidak ditemukan!'], 404);
    }

    $product = $productResponse->json();

    // CEK STOK
    if ($product['stock'] < $request->quantity) {
        return response()->json(['message' => 'Stok tidak cukup!'], 400);
    }

    $total = $product['price'] * $request->quantity;

    // KURANGI STOK DI PRODUCT SERVICE
    $reduceStockResponse = Http::post(
        "http://product-service:8000/api/products/{$request->product_id}/reduce-stock",
        [
            'quantity' => $request->quantity
        ]
    );

    if ($reduceStockResponse->failed()) {
        return response()->json(['message' => 'Gagal mengurangi stok!'], 500);
    }

    // SIMPAN TRANSAKSI
    $transaction = Transaction::create([
        'user_id' => $userId,
        'product_id' => $request->product_id,
        'quantity' => $request->quantity,
        'total_price' => $total,
        'status' => 'pending'
    ]);

    return response()->json([
        'message' => 'Transaksi Berhasil dengan Auth!',
        'user' => $userData['name'],
        'data' => $transaction
    ], 201);
}

    public function index()
    {
        return response()->json(Transaction::all());
    }

    public function show($id)
    {
        return response()->json(Transaction::find($id));
    }
}
