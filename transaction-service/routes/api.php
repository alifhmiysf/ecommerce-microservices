<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// === ROUTE TRANSAKSI ===
Route::post('/transactions', [TransactionController::class, 'store']); // Bikin Pesanan
Route::get('/transactions', [TransactionController::class, 'index']); // Lihat Semua
Route::get('/transactions/{id}', [TransactionController::class, 'show']); // Lihat Detail