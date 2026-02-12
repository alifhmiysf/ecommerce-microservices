<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// === ROUTE CRUD PRODUK ===
Route::get('/products', [ProductController::class, 'index']); // Lihat Semua
Route::post('/products', [ProductController::class, 'store']); // Tambah Baru
Route::get('/products/{id}', [ProductController::class, 'show']); // Lihat Detail
Route::post('/products/{id}/reduce-stock', [ProductController::class, 'reduceStock']);
