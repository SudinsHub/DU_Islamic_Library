<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Request as LibraryRequest; // Alias to avoid conflict

class StoreLendingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only librarians/volunteers can create lendings
        // Example: return auth()->user()->hasRole('librarian') || auth()->user()->hasRole('volunteer');
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'volunteer_id' => ['required', 'uuid', 'exists:volunteers,volunteer_id'],
            'req_id' => [
                'required',
                'uuid',
                'exists:requests,req_id',
                // Ensure the request exists and is in a 'pending' state
                Rule::exists('requests', 'req_id')->where(function ($query) {
                    $query->where('status', 'pending');
                }),
                // Ensure the request is not already linked to a lending
                Rule::unique('requests', 'req_id')->where(function ($query) {
                    $query->whereNotNull('lending_id');
                })->ignore($this->req_id, 'req_id'), // Ignore itself if this is an update scenario (though store is for creation)
            ],
            'issue_date' => ['nullable', 'date'], // Default handled by migration, but allow override
            'return_date' => ['nullable', 'date', 'after_or_equal:issue_date'],
            'status' => ['nullable', Rule::in(['pending', 'returned', 'lost'])],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('issue_date')) {
            $this->merge([
                'issue_date' => now()->toDateString(),
            ]);
        }
        if (! $this->has('status')) {
            $this->merge([
                'status' => 'pending', // Default status for a new lending is 'pending'
            ]);
        }
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'req_id.exists' => 'The associated request does not exist or is not pending.',
            'req_id.unique' => 'This request has already been fulfilled and linked to a lending.',
        ];
    }
}