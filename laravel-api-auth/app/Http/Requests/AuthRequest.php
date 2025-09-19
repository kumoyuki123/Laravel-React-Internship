<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AuthRequest extends FormRequest
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
        if ($this->is('api/login')) {
            return [
                'email' => 'required|email',
                'password' => 'required|string|min:6|max:8',
            ];
        }
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|max:8|confirmed',
            'password_confirmation' => 'required|string|min:6|max:8',
        ];
    }

    /**
     * Handle failed validation with JSON response
     */
    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '入力内容にエラーがあります。',
            'errors' => $validator->errors()
        ], 422));
    }
}