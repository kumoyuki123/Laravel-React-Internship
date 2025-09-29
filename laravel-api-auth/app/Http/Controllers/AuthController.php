<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\AuthRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator; // Add this import

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(AuthRequest $request) {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => '認証に失敗しました。',
                'errors' => [
                    'email' => ['メールアドレスまたはパスワードが正しくありません。']
                ]
            ], 401);
        }
        $user = Auth::user();
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'ログインに成功しました。',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }

    /**
     * Logout user
     */
    public function logout(Request $request) // Changed from AuthRequest to Request
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user's profile
     */
    public function show(Request $request) // Changed from AuthRequest to Request
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()->makeHidden(['password'])
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request) // Changed from AuthRequest to Request
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user->makeHidden(['password'])
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        $validator = Validator::make(
            $request->all(),
            [
                'current_password' => 'required',
                'new_password' => 'required|min:6|confirmed',
                'new_password_confirmation' => 'required',
            ],
            [],
            [
                'current_password' => '現在のパスワード',
                'new_password' => '新しいパスワード',
                'new_password_confirmation' => '新しいパスワード（確認）',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => '現在のパスワードが正しくありません。'
            ], 422);
        }

        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => '新しいパスワードは現在のパスワードと同じにはできません。'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'パスワードが正常に変更されました。'
        ]);
    }

}