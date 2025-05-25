<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Assuming only authenticated readers can submit reviews
        // You might check if auth()->user()->reader_id is present
        return $this->user() !== null && ($this->user()->reader_id ?? null) !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // reader_id should be automatically set from the authenticated user, not provided by the client
            // 'reader_id' => ['required', 'uuid', 'exists:readers,reader_id'],
            'book_id' => ['required', 'uuid', 'exists:books,book_id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'], // Allowing empty comments
            // reviewed_on will default to now(), so not typically required in request
            // 'reviewed_on' => ['nullable', 'date'],
        ];
    }

    /**
     * Prepare the data for validation.
     * This is useful to set the reader_id from the authenticated user.
     */
    protected function prepareForValidation(): void
    {
        // Set the reader_id from the authenticated user if it's not already present.
        // This ensures the review is linked to the logged-in reader.
        if (! $this->has('reader_id') && ($this->user()->reader_id ?? null) !== null) {
            $this->merge([
                'reader_id' => $this->user()->reader_id,
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
            'book_id.required' => 'The book ID is required.',
            'book_id.uuid' => 'The book ID must be a valid UUID.',
            'book_id.exists' => 'The specified book does not exist.',
            'rating.required' => 'A rating is required.',
            'rating.integer' => 'The rating must be an integer.',
            'rating.min' => 'The rating must be at least 1.',
            'rating.max' => 'The rating cannot be more than 5.',
            'comment.string' => 'The comment must be text.',
            'comment.max' => 'The comment may not be greater than 1000 characters.',
        ];
    }
}