<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReturnBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only librarians/volunteers can mark books as returned
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // No specific input fields needed, as it's an action on an existing lending
            'return_date' => ['nullable', 'date', 'before_or_equal:today'], // Allow specific return date, default to today
        ];
    }
}