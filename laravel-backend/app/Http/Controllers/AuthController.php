<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
// use Illuminate\Support\Str; // No longer needed as HasUuids trait handles UUID generation
use App\Models\Admin; // Assuming these are in App\Models
use App\Models\PointHistory;
use App\Models\PointSystem;
use App\Models\Reader;
use App\Models\Volunteer;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Register a new Admin user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerAdmin(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:admins,email', // Ensure unique for admins table
                'contact' => 'nullable|string|max:255', // Added from migration
                'password' => 'required|string|min:8|confirmed',
            ]);

            $admin = Admin::create([
                // 'admin_id' => Str::uuid(), // Removed: HasUuids trait handles UUID generation automatically
                'name' => $request->name,
                'email' => $request->email,
                'contact' => $request->contact, // Added from migration
                'password' => Hash::make($request->password),
            ]);

            // Create a token with 'actAsAdmin' ability for the new admin
            $token = $admin->createToken('admin-token', ['actAsAdmin'])->plainTextToken;

            return response()->json([
                'message' => 'Admin registered successfully.',
                'user' => $admin,
                'token' => $token,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during registration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Register a new Reader user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerReader(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'registration_no' => 'nullable|string|max:255', // Added from migration
                'session' => 'nullable|string|max:255', // Added from migration
                'email' => 'required|string|email|max:255|unique:readers,email', // Ensure unique for readers table
                'contact' => 'nullable|string|max:255', // Added from migration
                'hall_id' => 'required|uuid|exists:halls,hall_id', // Added from migration, assuming required for registration
                'dept_id' => 'required|uuid|exists:departments,dept_id', // Added from migration, assuming required for registration
                'gender' => 'nullable|in:male,female', // Added from migration
                'password' => 'required|string|min:8|confirmed',
            ]);

            $reader = Reader::create([
                // 'reader_id' => Str::uuid(), // Removed: HasUuids trait handles UUID generation automatically
                'name' => $request->name,
                'registration_no' => $request->registration_no, // Added from migration
                'session' => $request->session, // Added from migration
                'email' => $request->email,
                'contact' => $request->contact, // Added from migration
                'hall_id' => $request->hall_id, // Added from migration
                'dept_id' => $request->dept_id, // Added from migration
                'gender' => $request->gender, // Added from migration
                'password' => Hash::make($request->password),
                // 'isVerified' and 'total_points' have defaults in migration, no need to set explicitly unless overriding
            ]);

            // Create a token with 'actAsReader' ability for the new reader
            $token = $reader->createToken('reader-token', ['actAsReader'])->plainTextToken;
            $pointSystem = PointSystem::where('activity_type', 'reader_registration')->firstOrFail(); // Ensure the point system exists
            $reader->total_points += $pointSystem->points; // Add points for registration
            $reader->save();
            PointHistory::create([
                'reader_id' => $reader->reader_id,
                'activity_type' => 'reader_registration',
                'book_id' => null, // No book associated with registration
            ]);

            return response()->json([
                'message' => 'Reader registered successfully.',
                'user' => $reader,
                'token' => $token,
            ], 201);

        } catch (ValidationException $e) {
            Log::error('Validation error during reader registration', [
                'errors' => $e->errors(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error during reader registration', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'message' => 'An error occurred during registration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Register a new Volunteer user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerVolunteer(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'registration_no' => 'nullable|string|max:255', // Added from migration
                'email' => 'required|string|email|max:255|unique:volunteers,email', // Ensure unique for volunteers table
                'contact' => 'nullable|string|max:255', // Added from migration
                'address' => 'nullable|string|max:255', // Added from migration
                'hall_id' => 'required|uuid|exists:halls,hall_id', // Added from migration, assuming required for registration
                'dept_id' => 'required|uuid|exists:departments,dept_id', // Added from migration, assuming required for registration
                'session' => 'nullable|string|max:255', // Added from migration
                'room_no' => 'nullable|integer', // Added from migration
                'password' => 'required|string|min:8|confirmed',
            ]);

            $volunteer = Volunteer::create([
                // 'volunteer_id' => Str::uuid(), // Removed: HasUuids trait handles UUID generation automatically
                'name' => $request->name,
                'registration_no' => $request->registration_no, // Added from migration
                'email' => $request->email,
                'contact' => $request->contact, // Added from migration
                'address' => $request->address, // Added from migration
                'hall_id' => $request->hall_id, // Added from migration
                'dept_id' => $request->dept_id, // Added from migration
                'session' => $request->session, // Added from migration
                'room_no' => $request->room_no, // Added from migration
                'password' => Hash::make($request->password),
                // 'isAvailable' and 'isVerified' have defaults in migration, no need to set explicitly unless overriding
            ]);

            // Create a token with 'actAsVolunteer' ability for the new volunteer
            $token = $volunteer->createToken('volunteer-token', ['actAsVolunteer'])->plainTextToken;

            return response()->json([
                'message' => 'Volunteer registered successfully.',
                'user' => $volunteer,
                'token' => $token,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during registration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Authenticate an Admin user and issue a token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function loginAdmin(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            $admin = Admin::where('email', $request->email)->first();

            if (!$admin || !Hash::check($request->password, $admin->password)) {
                return response()->json(['message' => 'Invalid credentials.'], 401);
            }

            // Create a token with 'actAsAdmin' ability for the authenticated admin
            $token = $admin->createToken('admin-token', ['actAsAdmin'])->plainTextToken;

            return response()->json([
                'message' => 'Admin logged in successfully.',
                'user' => $admin,
                'token' => $token,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during login.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Authenticate a Reader user and issue a token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function loginReader(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            $reader = Reader::where('email', $request->email)->first();

            if (!$reader || !Hash::check($request->password, $reader->password)) {
                return response()->json(['message' => 'Invalid credentials.'], 401);
            }

            // Create a token with 'actAsReader' ability for the authenticated reader
            $token = $reader->createToken('reader-token', ['actAsReader'])->plainTextToken;

            return response()->json([
                'message' => 'Reader logged in successfully.',
                'user' => $reader,
                'token' => $token,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during login.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Authenticate a Volunteer user and issue a token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function loginVolunteer(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            $volunteer = Volunteer::where('email', $request->email)->first();

            if (!$volunteer || !Hash::check($request->password, $volunteer->password)) {
                return response()->json(['message' => 'Invalid credentials.'], 401);
            }

            // Create a token with 'actAsVolunteer' ability for the authenticated volunteer
            $token = $volunteer->createToken('volunteer-token', ['actAsVolunteer'])->plainTextToken;

            return response()->json([
                'message' => 'Volunteer logged in successfully.',
                'user' => $volunteer,
                'token' => $token,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during login.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the authenticated user's details.
     * This endpoint will work for any authenticated user (Admin, Reader, Volunteer)
     * as long as they have a valid Sanctum token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        // The authenticated user is available via $request->user()
        // Laravel Sanctum automatically handles which guard (and thus which user model)
        // is authenticated based on the token.
        return response()->json($request->user());
    }

    /**
     * Log out the authenticated user by revoking their current token.
     * This endpoint will work for any authenticated user (Admin, Reader, Volunteer).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Delete the current token being used for authentication
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.'], 200);
    }


}
