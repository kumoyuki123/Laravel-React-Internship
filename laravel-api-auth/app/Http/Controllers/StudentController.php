<?php
namespace App\Http\Controllers;

use App\Exports\StudentsExport;
use App\Http\Requests\StudentRequest;
use App\Imports\StudentsImport;
use App\Models\Employee;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['school', 'employee', 'attendances'])->get();
        return response()->json(['success' => true, 'data' => $students]);
    }

    public function store(StudentRequest $request)
    {
        DB::beginTransaction();

        try {
            $student = Student::create($request->validated());

            if ($student->iq_score >= 60) {
                Employee::create([
                    'student_id'     => $student->id,
                    'school_id'      => $student->school_id,
                    'iq_score'       => $student->iq_score,
                    'jp_level'       => null,
                    'skill_language' => null,
                ]);
            }
            DB::commit();
            $student->load(['school', 'employee']);

            return response()->json([
                'success' => true,
                'message' => 'Student created successfully' . ($student->iq_score >= 60 ? ' and automatically added as employee' : ''),
                'data'    => $student,
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create student: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific student
     */
    public function show($id)
    {
        $student = Student::with(['school', 'employee', 'attendances'])->find($id);

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $student,
        ]);
    }

    /**
     * Update a student
     */
    public function update(StudentRequest $request, $id)
    {
        $student = Student::find($id);

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        DB::beginTransaction();

        try {
            $oldIqScore = $student->iq_score;
            $newIqScore = $request->iq_score;
            $student->update($request->validated());
            if ($oldIqScore < 60 && $newIqScore >= 60) {
                Employee::create([
                    'student_id'     => $student->id,
                    'school_id'      => $student->school_id,
                    'iq_score'       => $student->iq_score,
                    'jp_level'       => null,
                    'skill_language' => null,
                ]);
            } elseif ($oldIqScore >= 60 && $newIqScore < 60) {
                Employee::where('student_id', $student->id)->delete();
            } elseif ($newIqScore >= 60 && $student->employee) {
                $student->employee->update(['iq_score' => $newIqScore]);
            }

            DB::commit();
            $student->load(['school', 'employee']);

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully',
                'data'    => $student,
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update student: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a student
     */
    public function destroy($id)
    {
        $student = Student::find($id);

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        DB::beginTransaction();

        try {
            if ($student->employee) {
                $student->employee->delete();
            }
            $student->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete student: ' . $e->getMessage(),
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
                'message' => 'Export failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import students from Excel/CSV
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }
        DB::beginTransaction();
        try {
            $import = new StudentsImport();
            Excel::import($import, $request->file('file'));
            DB::commit();

            return response()->json([
                'success'      => true,
                'message'      => 'Students imported successfully',
                'skipped_rows' => $import->getSkippedRows(),
            ], 200);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Student import failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
