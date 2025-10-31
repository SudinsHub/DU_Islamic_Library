<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\Admin;
use App\Models\PointHistory;
use App\Models\PointSystem;
use App\Models\Reader;
use App\Models\Volunteer;
use App\Services\MailService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
        protected $mailService;

    public function __construct(MailService $mailService)
    {
        $this->mailService = $mailService;
    }

    public function sendResetLink(Request $request)
    {
        // wrap with try-catch for error handling
        try {

            $request->validate(['email' => 'required|email',
                'userType' => 'required|in:admin,reader,volunteer'
            ]);

            $role  = $request->userType;
            $userModel = null;
            switch ($role) {
                case 'admin':
                    $userModel = Admin::class;
                    break;
                case 'reader':
                    $userModel = Reader::class;
                    break;
                case 'volunteer':
                    $userModel = Volunteer::class;
                    break;
            }

            $user = $userModel::where('email', $request->email)->first();
            if (!$user) {
                return response()->json(['message' => 'User with this email not found'], 404);
            }

            // Generate token and store
            $token = Str::random(60);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => $token, 'created_at' => Carbon::now()]
            );

            // Send mail using our MailService
            $resetLink = config('app.url')."/confirm-password?token=$token&userType=$role&email=" . urlencode($user->email);
            $mailData = [
                'name' => $user->name,
                'resetLink' => $resetLink,
            ];
            $this->mailService->sendMail(
                $user->email,
                'Password Reset Request',
                'emails.reset-password',
                $mailData
            );

            return response()->json(['message' => 'Reset link sent to your email.']);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error during sending reset link', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'message' => 'An error occurred while sending reset link.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    // add db transaction
    public function confirmPassword(Request $request)
    {
        try {
            DB::beginTransaction();
            $request->validate([
                'email' => 'required|email',
                'userType' => 'required|in:admin,reader,volunteer',
                'token' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $record = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('token', $request->token)
                ->first();

            if (!$record) {
                return response()->json(['message' => 'Invalid token or email.'], 400);
            }

            $role  = $request->userType;
            $userModel = null;
            switch ($role) {
                case 'admin':
                    $userModel = Admin::class;
                    break;
                case 'reader':
                    $userModel = Reader::class;
                    break;
                case 'volunteer':
                    $userModel = Volunteer::class;
                    break;
            }

            $user = $userModel::where('email', $request->email)->first();
            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            $user->password = Hash::make($request->password);
            $user->save();

            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            DB::commit();
            return response()->json(['message' => 'Password has been reset successfully.']);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error during password confirmation', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'message' => 'An error occurred while resetting password.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

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
                'email' => 'required|string|email|max:255|unique:admins,email',
                'contact' => 'nullable|string|max:255',
                'password' => 'required|string|min:8|confirmed',
            ]);

            return DB::transaction(function () use ($request) {
                $admin = Admin::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'contact' => $request->contact,
                    'password' => Hash::make($request->password),
                ]);

                $token = $admin->createToken('admin-token', ['actAsAdmin'])->plainTextToken;

                return response()->json([
                    'message' => 'Admin registered successfully.',
                    'user' => $admin,
                    'token' => $token,
                ], 201);
            });

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error during admin registration', [
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
                'registration_no' => 'nullable|string|max:255',
                'session' => 'nullable|string|max:255',
                'email' => 'required|string|email|max:255|unique:readers,email',
                'contact' => 'nullable|string|max:255',
                'hall_id' => 'required|uuid|exists:halls,hall_id',
                'dept_id' => 'required|uuid|exists:departments,dept_id',
                'gender' => 'nullable|in:male,female',
                'password' => 'required|string|min:8|confirmed',
            ]);

            return DB::transaction(function () use ($request) {
                $reader = Reader::create([
                    'name' => $request->name,
                    'registration_no' => $request->registration_no,
                    'session' => $request->session,
                    'email' => $request->email,
                    'contact' => $request->contact,
                    'hall_id' => $request->hall_id,
                    'dept_id' => $request->dept_id,
                    'gender' => $request->gender,
                    'password' => Hash::make($request->password),
                ]);

                $token = $reader->createToken('reader-token', ['actAsReader'])->plainTextToken;
                
                $pointSystem = PointSystem::where('activity_type', 'reader_registration')->firstOrFail();
                $reader->total_points += $pointSystem->points;
                $reader->save();
                
                PointHistory::create([
                    'reader_id' => $reader->reader_id,
                    'activity_type' => 'reader_registration',
                    'book_id' => null,
                ]);

                return response()->json([
                    'message' => 'Reader registered successfully.',
                    'user' => $reader,
                    'token' => $token,
                ], 201);
            });

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
                'registration_no' => 'nullable|string|max:255',
                'email' => 'required|string|email|max:255|unique:volunteers,email',
                'contact' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:255',
                'hall_id' => 'required|uuid|exists:halls,hall_id',
                'dept_id' => 'required|uuid|exists:departments,dept_id',
                'session' => 'nullable|string|max:255',
                'room_no' => 'nullable|integer',
                'password' => 'required|string|min:8|confirmed',
            ]);

            return DB::transaction(function () use ($request) {
                $volunteer = Volunteer::create([
                    'name' => $request->name,
                    'registration_no' => $request->registration_no,
                    'email' => $request->email,
                    'contact' => $request->contact,
                    'address' => $request->address,
                    'hall_id' => $request->hall_id,
                    'dept_id' => $request->dept_id,
                    'session' => $request->session,
                    'room_no' => $request->room_no,
                    'password' => Hash::make($request->password),
                ]);

                $token = $volunteer->createToken('volunteer-token', ['actAsVolunteer'])->plainTextToken;

                return response()->json([
                    'message' => 'Volunteer registered successfully.',
                    'user' => $volunteer,
                    'token' => $token,
                ], 201);
            });

        } catch (ValidationException $e) {
            Log::error('Validation error during volunteer registration', [
                'errors' => $e->errors(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error during volunteer registration', [
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

            return DB::transaction(function () use ($request) {
                $admin = Admin::where('email', $request->email)->first();

                if (!$admin || !Hash::check($request->password, $admin->password)) {
                    return response()->json(['message' => 'Invalid credentials.'], 401);
                }

                $token = $admin->createToken('admin-token', ['actAsAdmin'])->plainTextToken;

                return response()->json([
                    'message' => 'Admin logged in successfully.',
                    'user' => $admin,
                    'token' => $token,
                ]);
            });

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error during admin login', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);
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

            return DB::transaction(function () use ($request) {
                $reader = Reader::where('email', $request->email)->first();

                if (!$reader || !Hash::check($request->password, $reader->password)) {
                    return response()->json(['message' => 'Invalid credentials.'], 401);
                }

                $token = $reader->createToken('reader-token', ['actAsReader'])->plainTextToken;

                return response()->json([
                    'message' => 'Reader logged in successfully.',
                    'user' => $reader,
                    'token' => $token,
                ]);
            });

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error during reader login', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);
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

            return DB::transaction(function () use ($request) {
                $volunteer = Volunteer::where('email', $request->email)->first();

                if (!$volunteer || !Hash::check($request->password, $volunteer->password)) {
                    return response()->json(['message' => 'Invalid credentials.'], 401);
                }

                $token = $volunteer->createToken('volunteer-token', ['actAsVolunteer'])->plainTextToken;

                return response()->json([
                    'message' => 'Volunteer logged in successfully.',
                    'user' => $volunteer,
                    'token' => $token,
                ]);
            });

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error during volunteer login', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);
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
        try {
            return DB::transaction(function () use ($request) {
                $request->user()->currentAccessToken()->delete();

                return response()->json(['message' => 'Logged out successfully.'], 200);
            });
        } catch (\Exception $e) {
            Log::error('Error during logout', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'An error occurred during logout.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


}