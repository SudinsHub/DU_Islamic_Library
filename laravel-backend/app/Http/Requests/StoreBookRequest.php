<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookRequest extends FormRequest
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
        return [
            'publisher_id' => ['required', 'uuid', 'exists:publishers,publisher_id'],
            'author_id' => ['required', 'uuid', 'exists:authors,author_id'],
            'category_id' => ['required', 'uuid', 'exists:categories,category_id'],
            'title' => ['required', 'string', 'max:255', Rule::unique('books', 'title')], // Ensure unique title
            'description' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:6000'], 
            // 'image_url' => ['nullable', 'url', 'max:2048'], // Use this if clients send a URL directly
        ];
    }
}