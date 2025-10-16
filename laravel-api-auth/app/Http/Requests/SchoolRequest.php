<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SchoolRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'teacher_name' => ['required', 'string', 'max:255'],
            'teacher_email' => ['required', 'email', 'unique:schools,teacher_email'],
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $schoolId = $this->route('id');
            $rules['teacher_email'][2] = 'unique:schools,teacher_email,' . $schoolId;
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
