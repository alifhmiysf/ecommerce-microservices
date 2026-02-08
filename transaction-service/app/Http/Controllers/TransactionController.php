<?php

namespace App\Http\Controllers;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        // 1. validasi input
    $data = $request->validate([
        'user_id' => 'required|integer',
        'product_id' => 'required|integer',
        'quantity' => 'required|integer|min:1',
    ]);

    $response = Http::get("http://product-service:8000/api/products/{$request->product_id}");

    if($response->failed()){
        return response()->json (['message' => 'Produk tidak ditemukan di sistem!'],404);
    }

    // ambil data produk
    $product =$response->json();
    $realPrice = $product['price'];
    $total = $realPrice * $request-> quantity;

    // simpan transaksi
    $transaction = Transaction::create([
        'user_id' => $request->user_id,
        'product_id' => $request->product_id,
        'quantity' =>$request->quantity,
        'total_price'=> $total,
        'status' =>'pending'
    ]);

        // kembalikan respon JSON
        return response()->json([
            'message' => 'Transaksi berhasil dibuat!',
            'data' => $transaction
        ],201);
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
