<?php
namespace App\Http\Controllers;

use App\Http\Requests\AttendanceRequest;
use App\Models\Attendence;

class AttendenceController extends Controller
{
    /**
     * Get all attendance records
     */
    public function index()
    {
        $attendances = Attendence::with(['student', 'student.school'])
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $attendances,
        ]);
    }

    /**
     * Create a new attendance record
     */
    public function store(AttendanceRequest $request)
    {
        $existingAttendance = Attendence::where('student_id', $request->student_id)
            ->where('date', $request->date)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record already exists for this student on this date',
            ], 422);
        }
        $attendance = Attendence::create($request->validated());
        $attendance->load(['student', 'student.school']);

        return response()->json([
            'success' => true,
            'message' => 'Attendance record created successfully',
            'data'    => $attendance,
        ], 201);
    }

    /**
     * Get a specific attendance record
     */
    public function show($id)
    {
        $attendance = Attendence::with(['student', 'student.school'])->find($id);

        if (! $attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $attendance,
        ]);
    }

    /**
     * Update an attendance record
     */
    public function update(AttendanceRequest $request, $id)
    {
        $attendance = Attendence::find($id);

        if (! $attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found',
            ], 404);
        }
        $attendance->update($request->validated());
        $attendance->load(['student', 'student.school']);

        return response()->json([
            'success' => true,
            'message' => 'Attendance record updated successfully',
            'data'    => $attendance,
        ]);
    }

    /**
     * Delete an attendance record
     */
    public function destroy($id)
    {
        $attendance = Attendence::find($id);

        if (! $attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found',
            ], 404);
        }

        $attendance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attendance record deleted successfully',
        ]);
    }

    /**
     * Get attendance records by student
     */
    public function getByStudent($studentId)
    {
        $attendances = Attendence::with(['student', 'student.school'])
            ->where('student_id', $studentId)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $attendances,
        ]);
    }

    /**
     * Get attendance records by date range
     */
    public function getByDateRange(AttendanceRequest $request)
    {
        $query = Attendence::with(['student', 'student.school'])
            ->whereBetween('date', [$request->start_date, $request->end_date]);

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $attendances,
        ]);
    }
}
