<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReadingHistoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only authenticated readers can create their own history entries.
        // Or an admin can create for any reader.
        $user = $this->user();
        if (!$user) {
            return false; // Not authenticated
        }

        $isAdmin = $user->is_admin ?? false;
        $isReader = ($user->reader_id ?? null) !== null;

        // If user is admin, they can create for any reader_id.
        // If user is a reader, they can only create for their own reader_id.
        if ($isAdmin) {
            return true;
        } elseif ($isReader) {
            return $user->reader_id === $this->input('reader_id');
        }

        return false; // Not authorized
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reader_id' => ['required', 'uuid', 'exists:readers,reader_id'],
            'book_id' => ['required', 'uuid', 'exists:books,book_id'],
            'started_on' => ['nullable', 'date', 'before_or_equal:today'],
            'finished_on' => ['nullable', 'date', 'after_or_equal:started_on', 'before_or_equal:today'],
        ];
    }

    /**
     * Prepare the data for validation.
     * This is useful to set the reader_id from the authenticated user if not provided by admin.
     */
    protected function prepareForValidation(): void
    {
        $user = $this->user();
        $isAdmin = $user->is_admin ?? false;

        // If the user is a reader and not an admin, automatically set reader_id
        if (!$isAdmin && ($user->reader_id ?? null) !== null) {
            $this->merge([
                'reader_id' => $user->reader_id,
            ]);
        }

        // If started_on is not provided, default it to today
        if (!$this->has('started_on')) {
            $this->merge([
                'started_on' => now()->toDateString(),
            ]);
        }
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'reader_id.required' => 'The reader ID is required.',
            'reader_id.uuid' => 'The reader ID must be a valid UUID.',
            'reader_id.exists' => 'The specified reader does not exist.',
            'book_id.required' => 'The book ID is required.',
            'book_id.uuid' => 'The book ID must be a valid UUID.',
            'book_id.exists' => 'The specified book does not exist.',
            'started_on.date' => 'The started on date must be a valid date.',
            'started_on.before_or_equal' => 'The started on date cannot be in the future.',
            'finished_on.date' => 'The finished on date must be a valid date.',
            'finished_on.after_or_equal' => 'The finished on date cannot be before the started on date.',
            'finished_on.before_or_equal' => 'The finished on date cannot be in the future.',
        ];
    }
}