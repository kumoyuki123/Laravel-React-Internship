<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get all users (only for superuser)
     */
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
                    ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Create a new user (only superuser can create HR admin, supervisor, leader)
     */
    public function store(UserRequest $request)
    {
        $user = User::create([
            'name'     => $request->validated()['name'],
            'email'    => $request->validated()['email'],
            'password' => Hash::make($request->validated()['password']),
            'role'     => $request->validated()['role'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data'    => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at
            ]
        ], 201);
    }

    /**
     * Update user
     */
    public function update(UserRequest $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->isSuperuser()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update superuser'
            ], 403);
        }

        $user->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data'    => $user
        ]);
    }

    /**
     * Delete user
     */
    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Prevent deleting superuser
        if ($user->isSuperuser()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete superuser'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
