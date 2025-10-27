<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Both reader and librarian/staff can cancel requests (with conditions)
        // Example: return auth()->user()->id === $this->route('request')->reader->user_id || auth()->user()->hasRole('librarian');
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // No specific input fields needed for cancellation, just the request ID.
        return [];
    }
}