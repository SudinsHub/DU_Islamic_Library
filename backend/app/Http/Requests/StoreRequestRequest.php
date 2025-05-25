<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Define your authorization logic here.
        // E.g., auth()->check() to ensure a logged-in user.
        // Or if the reader can only request for themselves:
        return $this->user()->reader_id === $this->reader_id;
        // return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'reader_id' => ['required', 'uuid', 'exists:readers,reader_id'],
            'book_id' => ['required', 'uuid', 'exists:books,book_id'],
            'hall_id' => ['required', 'uuid', 'exists:halls,hall_id'],
            'request_date' => ['nullable', 'date'], // Default handled by migration, but allow override
            'status' => ['nullable', Rule::in(['pending', 'fulfilled', 'cancelled'])],
        ];
    }

    /**
     * Prepare the data for validation.
     * This ensures 'pending' status if not provided, aligning with migration default.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('status')) {
            $this->merge([
                'status' => 'pending',
            ]);
        }
        if (! $this->has('request_date')) {
            $this->merge([
                'request_date' => now()->toDateString(),
            ]);
        }
    }
}