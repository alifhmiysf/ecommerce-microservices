<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'User berhasil didaftarkan!'], 201);
    }

    public function login(Request $request) {
        // 1. Validasi Input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Cari User secara manual (Cara Sanctum)
        $user = User::where('email', $request->email)->first();

        // 3. Cek Password secara manual
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Email atau Password salah'], 401);
        }

        // 4. Buat Token Sanctum (Bukan JWT)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}