<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarkLostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only librarians/volunteers can mark books as lost
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // No specific input fields needed, as it's an action on an existing lending
        return [];
    }
}