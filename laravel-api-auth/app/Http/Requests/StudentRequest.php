<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StudentRequest extends FormRequest
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
        $rules = [
            'school_id' => ['required', 'exists:schools,id'],
            'roll_no' => ['required', 'string', 'max:50', 'unique:students,roll_no'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:students,email'],
            'nrc_no' => ['required', 'string', 'max:100', 'unique:students,nrc_no'],
            'phone' => ['required', 'string', 'max:20'],
            'major' => ['required', 'string', 'max:100'],
            'year' => ['required', 'string', 'max:50'],
            'iq_score' => ['required', 'integer', 'min:0', 'max:100'],
        ];

        // If update, exclude current student from unique rules
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $studentId = $this->route('id');
            $rules['roll_no'][3] = 'unique:students,roll_no,' . $studentId;
            $rules['email'][2] = 'unique:students,email,' . $studentId;
            $rules['nrc_no'][3] = 'unique:students,nrc_no,' . $studentId;
        }

        return $rules;
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
