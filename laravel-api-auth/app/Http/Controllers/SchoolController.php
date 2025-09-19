<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use Illuminate\Support\Facades\Validator;

class SchoolController extends Controller
{
    /**
     * Get all schools
     */
    public function index()
    {
        $schools = School::with(['students', 'employees'])
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $schools
        ]);
    }

    /**
     * Create a new school
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'teacher_name' => 'required|string|max:255',
            'teacher_email' => 'required|email|unique:schools,teacher_email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $school = School::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'School created successfully',
            'data' => $school
        ], 201);
    }

    /**
     * Get a specific school
     */
    public function show($id)
    {
        $school = School::with(['students', 'employees'])->find($id);

        if (!$school) {
            return response()->json([
                'success' => false,
                'message' => 'School not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $school
        ]);
    }

    /**
     * Update a school
     */
    public function update(Request $request, $id)
    {
        $school = School::find($id);

        if (!$school) {
            return response()->json([
                'success' => false,
                'message' => 'School not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'teacher_name' => 'required|string|max:255',
            'teacher_email' => 'required|email|unique:schools,teacher_email,' . $school->id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $school->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'School updated successfully',
            'data' => $school
        ]);
    }

    /**
     * Delete a school
     */
    public function destroy($id)
    {
        $school = School::find($id);

        if (!$school) {
            return response()->json([
                'success' => false,
                'message' => 'School not found'
            ], 404);
        }

        // Check if school has students
        if ($school->students()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete school with existing students'
            ], 422);
        }

        $school->delete();

        return response()->json([
            'success' => true,
            'message' => 'School deleted successfully'
        ]);
    }
}
