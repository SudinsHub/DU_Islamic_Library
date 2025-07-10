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

        // Explicitly select columns to return. Adjust this list based on what is truly "necessary" for the frontend table.
        // Keeping 'isVerified' in select for now as it's in migration, but it's removed from frontend display.
        $query = Reader::select([
            'reader_id',
            'name',
            'registration_no',
            'email',
            'contact',
            'hall_id',
            'dept_id',
            'session',
            'isVerified', // Kept for backend data, can be removed if not needed at all
            'total_points',
            'gender',
            'created_at',
            'updated_at',
        ])->with(['hall', 'department']);

        // Filter by name
        if ($request->has('name') && $request->input('name') !== '') {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        // Filter by hall_id
        if ($request->has('hall_id') && $request->input('hall_id') !== '') {
            $query->where('hall_id', $request->input('hall_id'));
        }

        // Filter by dept_id
        if ($request->has('dept_id') && $request->input('dept_id') !== '') {
            $query->where('dept_id', $request->input('dept_id'));
        }

        // Note: isVerified filter removed as per request to remove frontend column.
        // If you need to filter by isVerified on the backend without displaying it,
        // you would add:
        // if ($request->has('isVerified') && $request->boolean('isVerified')) {
        //     $query->where('isVerified', true);
        // }


        $readers = $query->paginate($perPage);

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
        ]);

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
