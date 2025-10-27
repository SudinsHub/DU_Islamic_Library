<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only the reader who created the review, or an admin, can update it.
        $user = $this->user();
        if (!$user) {
            return false; // Not authenticated
        }

        // Option 1: Only the original reader can update
        // return $this->review->reader_id === ($user->reader_id ?? null);

        // Option 2: Original reader OR an admin can update
        $isAdmin = $user->admin_id ?? false; // Assuming 'is_admin' property on User model
        $isOriginalReader = $this->route('review')->reader_id === ($user->reader_id ?? null);

        return $isAdmin || $isOriginalReader;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // book_id and reader_id are typically not changed after creation
            'rating' => ['sometimes', 'required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
            // 'reviewed_on' => ['nullable', 'date'], // Not typically updated
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
            'rating.required' => 'A rating is required.',
            'rating.integer' => 'The rating must be an integer.',
            'rating.min' => 'The rating must be at least 1.',
            'rating.max' => 'The rating cannot be more than 5.',
            'comment.string' => 'The comment must be text.',
            'comment.max' => 'The comment may not be greater than 1000 characters.',
        ];
    }
}