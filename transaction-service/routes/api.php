<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Riwayat dan detail transaksi pembeli
Route::get('/transactions', [TransactionController::class, 'index']);
Route::get('/transactions/{id}', [TransactionController::class, 'show']);

// Daftar pesanan masuk untuk penjual
Route::get(
    '/seller/transactions',
    [TransactionController::class, 'sellerOrders']
);

Route::patch(
    '/transactions/{id}/status',
    [TransactionController::class, 'updateOrderStatus']
);

Route::patch(
    '/transactions/{id}/confirm-received',
    [TransactionController::class, 'confirmReceived']
);

// Checkout
Route::post('/transactions', [TransactionController::class, 'store']);

// Cek layanan
Route::get('/test', function () {
    return 'Service Transaksi OK';
});
