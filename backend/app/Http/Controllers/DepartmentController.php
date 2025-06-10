<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController
{
    public function index(Request $request)
    {
        $departments = Department::all();
        return response()->json($departments);
    }
    public function show($id)
    {
        $department = Department::findOrFail($id);
        return response()->json($department);
    }
    public function store(Request $request)
    {
        $department = Department::create($request->all());
        return response()->json($department, 201);
    }
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $department->update($request->all());
        return response()->json($department);
    }
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $department->delete();
        return response()->json(null, 204);
    }
    public function search(Request $request)
    {
        $query = $request->input('query');
        $departments = Department::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->get();
        return response()->json($departments);
    }
}
