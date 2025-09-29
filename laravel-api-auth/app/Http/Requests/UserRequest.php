<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserRequest extends FormRequest
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
        $userId = $this->route('id');
        $rules = [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'role'     => ['required', 'in:hr_admin,supervisor,leader'],
        ];

        if ($this->isMethod('post')) {
            $rules['password'] = ['required', 'string', 'min:6'];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['email'][3] = 'unique:users,email,' . $userId;
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
