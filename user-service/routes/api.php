<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
// Endpoint ini akan memiliki prefix /api secara default
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/test-dong', function() {
    return response()->json(['status' => 'User Service Terkoneksi!']);
});

Route::post('/test-post', function() {
    return response()->json(['status' => 'Post Berhasil!']);
});
// Contoh route yang diproteksi JWT
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});