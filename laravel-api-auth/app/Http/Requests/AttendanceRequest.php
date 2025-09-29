<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        if ($this->is('api/attendances/date-range')) {
            return [
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
                'student_id' => ['nullable', 'exists:students,id'],
            ];
        }

        return [
            'student_id' => ['required', 'exists:students,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:present,absent,late'],
            'check_in_time' => ['nullable', 'date_format:H:i'], // Accept both H:i and H:i:s
        ];
    }

    /**
     * Prepare the data for validation (convert H:i to H:i:s if needed)
     */
    protected function prepareForValidation()
    {
        if ($this->check_in_time) {
            if (strlen($this->check_in_time) === 5) {
                $this->merge([
                    'check_in_time' => $this->check_in_time . ':00'
                ]);
            }

            if (strlen($this->check_in_time) === 8) {
                $this->merge([
                    'check_in_time' => substr($this->check_in_time, 0, 5)
                ]);
            }
        }
    }


    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return trans('validation.attributes');
    }

    /**
     * Handle failed validation with JSON response
     */
    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed. Please check your input.',
            'errors' => $validator->errors()
        ], 422));
    }
}