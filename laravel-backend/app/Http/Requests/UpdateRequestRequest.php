<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Typically, only an admin or specific roles can update requests arbitrarily
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'reader_id' => ['sometimes', 'required', 'uuid', 'exists:readers,reader_id'],
            'book_id' => ['sometimes', 'required', 'uuid', 'exists:books,book_id'],
            'hall_id' => ['sometimes', 'required', 'uuid', 'exists:halls,hall_id'],
            'request_date' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', 'required', Rule::in(['pending', 'fulfilled', 'cancelled'])],
        ];
    }
}