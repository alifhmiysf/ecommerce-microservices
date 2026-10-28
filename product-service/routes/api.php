
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Daftar dan pembuatan produk
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);

// Produk milik seller yang sedang login
Route::get('/products/my', [ProductController::class, 'myProducts']);

// Ubah dan hapus produk milik seller
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::patch('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// Detail produk
Route::get('/products/{id}', [ProductController::class, 'show']);

// Endpoint internal untuk pengurangan stok
Route::post('/products/{id}/reduce-stock', [ProductController::class, 'reduceStock']);

Route::get('/test', fn () => 'Product Service OK');
