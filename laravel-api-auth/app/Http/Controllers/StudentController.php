<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentRequest;
use App\Models\Student;
use App\Models\School;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StudentsExport;
use App\Imports\StudentsImport;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    /**
     * Get all students
     */
    public function index()
    {
        $students = Student::with(['school', 'employee', 'attendances'])
                          ->get();

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    /**
     * Create a new student
     */
    public function store(StudentRequest $request)
    {
        DB::beginTransaction();
        
        try {
            // Create student
            $student = Student::create($request->validated());

            // Auto-create employee if IQ score >= 60
            if ($student->iq_score >= 60) {
                Employee::create([
                    'student_id' => $student->id,
                    'school_id' => $student->school_id,
                    'iq_score' => $student->iq_score,
                    'jp_level' => null,
                    'skill_language' => null
                ]);
            }

            DB::commit();

            // Load relationships for response
            $student->load(['school', 'employee']);

            return response()->json([
                'success' => true,
                'message' => 'Student created successfully' . ($student->iq_score >= 60 ? ' and automatically added as employee' : ''),
                'data' => $student
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific student
     */
    public function show($id)
    {
        $student = Student::with(['school', 'employee', 'attendances'])->find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    /**
     * Update a student
     */
    public function update(StudentRequest $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        DB::beginTransaction();
        
        try {
            $oldIqScore = $student->iq_score;
            $newIqScore = $request->iq_score;
            
            // Update student
            $student->update($request->validated());

            // Handle employee creation/deletion based on IQ score change
            if ($oldIqScore < 60 && $newIqScore >= 60) {
                // Create employee if IQ score improved to pass level
                Employee::create([
                    'student_id' => $student->id,
                    'school_id' => $student->school_id,
                    'iq_score' => $student->iq_score,
                    'jp_level' => null,
                    'skill_language' => null
                ]);
            } elseif ($oldIqScore >= 60 && $newIqScore < 60) {
                // Remove employee if IQ score dropped below pass level
                Employee::where('student_id', $student->id)->delete();
            } elseif ($newIqScore >= 60 && $student->employee) {
                // Update existing employee's IQ score
                $student->employee->update(['iq_score' => $newIqScore]);
            }

            DB::commit();

            // Load relationships for response
            $student->load(['school', 'employee']);

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully',
                'data' => $student
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a student
     */
    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        DB::beginTransaction();
        
        try {
            // Delete related employee if exists
            if ($student->employee) {
                $student->employee->delete();
            }

            // Delete student (attendances will be deleted by cascade if set up)
            $student->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Student Data Export [Download]
     */
    public function export()
    {
        try {
            $filename = 'students_' . now()->format('Y-m-d') . '.xlsx';
            
            return Excel::download(new StudentsExport, $filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import students from Excel/CSV
     */
    public function import(Request $request)
    {
        // Validate the file
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $import = new StudentsImport();
            
            // Import the file
            Excel::import($import, $request->file('file'));
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Students imported successfully',
                'rows_imported' => $import->getRowCount(),
                'skipped_rows' => $import->getSkippedRows()
            ], 200);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Student import failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
