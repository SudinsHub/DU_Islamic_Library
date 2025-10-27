<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Assuming only Admins & volunteer can create/update books
        $user = $this->user();
        return $user && (($user->volunteer_id || $user->admin_id) ?? false); 
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $bookId = $this->route('book')->book_id; // Get the book_id from the route model binding

        return [
            'publisher_id' => ['sometimes', 'required', 'uuid', 'exists:publishers,publisher_id'],
            'author_id' => ['sometimes', 'required', 'uuid', 'exists:authors,author_id'],
            'category_id' => ['sometimes', 'required', 'uuid', 'exists:categories,category_id'],
            'title' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('books', 'title')->ignore($bookId, 'book_id')], // Unique title, ignore current book
            'description' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'], // <--- Add this
            // 'image_url' => ['nullable', 'url', 'max:2048'], // Use this if clients send a URL directly
        ];
    }
}