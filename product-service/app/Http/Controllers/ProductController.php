<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // 1. Ambil Semua Produk
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

    // 2. Tambah Produk Baru
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required',
            'price' => 'required|numeric',
            'stock' => 'required|integer'
        ]);

        // Simpan ke PostgreSQL
        $product = Product::create($request->all());

        return response()->json([
            'message' => 'Produk berhasil dibuat!',
            'data' => $product
        ], 201);
    }
    
    // 3. Lihat Detail 1 Produk
    public function show($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        return response()->json($product);
    }

    public function reduceStock(Request $request, $id){
        $product =Product::findOrFail($id);
        $quantity = $request->quantity;
        if($product->stock < $quantity){
            return response()->json(['message' => 'Stok tidak cukup'],400);
        }
        $product->decrement('stock', $quantity);
        return response()->json(['message' => 'Stok berhasil dikurangi', 'new_stock' => $product->stock]);
    }
}