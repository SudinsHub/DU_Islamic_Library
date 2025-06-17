<?php

namespace App\Http\Controllers;

use App\Models\Reader;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use App\Models\Hall; // Assuming you have a Hall model
use App\Models\Department; // Assuming you have a Department model

class ReaderController extends Controller
{
    /**
     * Display a listing of the readers with pagination.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10); // Default 10 items per page
        $readers = Reader::with(['hall', 'department'])->paginate($perPage);

        return response()->json($readers);
    }

    /**
     * Update the specified reader in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Reader  $reader
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Reader $reader)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'registration_no' => 'nullable|string|max:255',
            'session' => 'nullable|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('readers')->ignore($reader->reader_id, 'reader_id'),
            ],
            'contact' => 'nullable|string|max:255',
            'hall_id' => 'required|uuid|exists:halls,hall_id',
            'dept_id' => 'required|uuid|exists:departments,dept_id',
            'isVerified' => 'boolean',
            'total_points' => 'integer|min:0',
            'gender' => 'nullable|in:male,female',
            // Password update should ideally be handled separately for security
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Handle password update if provided
        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            // Remove password from validated data if not provided to prevent hashing null
            unset($validatedData['password']);
        }

        $reader->update($validatedData);

        return response()->json([
            'message' => 'Reader updated successfully!',
            'reader' => $reader->load(['hall', 'department'])
        ]);
    }

    /**
     * Remove the specified reader from storage.
     *
     * @param  \App\Models\Reader  $reader
     * @return \Illuminate\Http\Response
     */
    public function destroy(Reader $reader)
    {
        $reader->delete();

        return response()->json(['message' => 'Reader deleted successfully!']);
    }
}
