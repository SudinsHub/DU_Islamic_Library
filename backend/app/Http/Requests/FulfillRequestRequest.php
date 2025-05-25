<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Request as LibraryRequest; // Alias to avoid conflict with Illuminate\Http\Request
use App\Models\BookCollection;
use App\Models\Lending; // Assuming Lending model exists for new lendings

class FulfillRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only librarians/staff can fulfill requests
        // Example: return auth()->user()->hasRole('librarian');
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // This request doesn't take input fields directly for status or lending_id
        // but assumes these are handled by the controller's logic.
        // It might validate related data needed to create a Lending record.
        return [
            // If you need to create a new lending record as part of fulfillment,
            // you might add rules here for its properties (e.g., 'due_date').
            // 'due_date' => ['required', 'date', 'after_or_equal:today'],
        ];
    }
}