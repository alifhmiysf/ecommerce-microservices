<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
// Endpoint ini akan memiliki prefix /api secara default
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Contoh route yang diproteksi JWT
Route::middleware('auth:api')->get('/me', function () {
    return auth()->user();
});