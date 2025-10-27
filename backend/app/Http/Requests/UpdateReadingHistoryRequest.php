<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReadingHistoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only the reader who created the history entry, or an admin, can update it.
        $user = $this->user();
        if (!$user) {
            return false; // Not authenticated
        }

        $isAdmin = $user->is_admin ?? false;
        $isOriginalReader = $this->route('reading_history')->reader_id === ($user->reader_id ?? null);

        return $isAdmin || $isOriginalReader;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // reader_id and book_id are typically not changed after creation
        return [
            'started_on' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'finished_on' => ['nullable', 'date', 'after_or_equal:started_on', 'before_or_equal:today'],
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
            'started_on.date' => 'The started on date must be a valid date.',
            'started_on.required' => 'The started on date is required.',
            'started_on.before_or_equal' => 'The started on date cannot be in the future.',
            'finished_on.date' => 'The finished on date must be a valid date.',
            'finished_on.after_or_equal' => 'The finished on date cannot be before the started on date.',
            'finished_on.before_or_equal' => 'The finished on date cannot be in the future.',
        ];
    }
}