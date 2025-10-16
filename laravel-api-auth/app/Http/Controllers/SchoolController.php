<?php
namespace App\Http\Controllers;

use App\Http\Requests\SchoolRequest;
use App\Models\School;

class SchoolController extends Controller
{
    /**
     * Get all schools
     */
    public function index()
    {
        $schools = School::with(['students', 'employees'])
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $schools,
        ]);
    }

    /**
     * Create a new school
     */
    public function store(SchoolRequest $request)
    {
        $school = School::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'School created successfully',
            'data'    => $school,
        ], 201);
    }

    /**
     * Get a specific school
     */
    public function show($id)
    {
        $school = School::with(['students', 'employees'])->find($id);

        if (! $school) {
            return response()->json([
                'success' => false,
                'message' => 'School not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $school,
        ]);
    }

    /**
     * Update a school
     */
    public function update(SchoolRequest $request, $id)
    {
        $school = School::find($id);

        if (! $school) {
            return response()->json([
                'success' => false,
                'message' => 'School not found',
            ], 404);
        }

        $school->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'School updated successfully',
            'data'    => $school,
        ]);
    }

    /**
     * Delete a school
     */
    public function destroy($id)
    {
        $school = School::find($id);

        if (! $school) {
            return response()->json([
                'success' => false,
                'message' => 'School not found',
            ], 404);
        }

        // Check if school has students
        if ($school->students()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete school with existing students',
            ], 422);
        }

        $school->delete();

        return response()->json([
            'success' => true,
            'message' => 'School deleted successfully',
        ]);
    }
}
