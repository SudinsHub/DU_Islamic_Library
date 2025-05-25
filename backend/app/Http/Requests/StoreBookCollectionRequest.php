<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
// No longer need Rule::unique for this scenario
// use Illuminate\Validation\Rule; 

class StoreBookCollectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'book_id' => [
                'required', 
                'uuid', 
                'exists:books,book_id', // Ensure book_id exists
            ],
            'hall_id' => [
                'required', 
                'uuid', 
                'exists:halls,hall_id', // Ensure hall_id exists
            ],
            'total_copies' => 'required|integer|min:0', // Min can be 0 if removing copies is possible
            'available_copies' => 'required|integer|min:0', // Min can be 0
            // We'll enforce available <= total in the controller
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'available_copies.required' => 'The number of available copies is required.',
            'total_copies.required' => 'The total number of copies is required.',
            'available_copies.min' => 'Available copies cannot be negative.',
            'total_copies.min' => 'Total copies cannot be negative.',
        ];
    }
}