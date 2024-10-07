<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PersonalInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserApiController extends Controller
{
    protected $roleModel;
    protected $userModel;
    protected $personalInfoModel;

    function __construct()
    {
        $this->userModel = new User();
        $this->roleModel = new Role();
        $this->personalInfoModel = new PersonalInformation();
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if (!$user->verified) {
                Auth::logout();
                return response()->json(['error' => 'Your account is not verified.'], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Eager load the role relationship
            $user->load('role');

            // Debugging: Log the user and role data
            Log::info('User logged in:', ['user' => $user, 'role' => $user->role, 'token' => $token]);

            return response()->json(['user' => $user, 'token' => $token, 'message' => 'Login successful'], 200);
        }

        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    public function currentUser(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $user->load('role', 'personalInformation');
            return response()->json(['user' => $user]);
        }
        return response()->json(['error' => 'Not authenticated'], 401);
    }

    public function logout(Request $request)
    {
        Auth::user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }

    public function roles()
    {
        return response()->json(['data' => $this->roleModel->getRoles()], 200);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,roleid',
            'verified' => 'boolean',
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'profilepicture' => 'nullable|string',
            'coverphoto' => 'nullable|string',
            'zipcode' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $this->userModel->create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'verified' => $request->has('verified') ? $request->verified : false,
        ]);


        $this->personalInfoModel->create([
            'user_id' => $user->id,
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'profilepicture' => $request->profilepicture,
            'coverphoto' => $request->coverphoto,
            'zipcode' => $request->zipcode,
        ]);

        return response()->json(['message' => 'User registered successfully'], 201);
    }

    public function getUserProfile($id)
    {
        try {
            // Eager load stores with their locations
            $user = User::with(['personalInformation', 'stores.location'])->findOrFail($id);

            Log::info('User Data:', $user->toArray());

            return response()->json(['user' => $user], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching user profile:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function updateUserProfile(Request $request, $id)
    {
        Log::info('Incoming request data for updating user profile:', [
            'id' => $id,
            'request_data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'profilepicture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Adjusted for image validation
            'coverphoto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            Log::error('Validation errors:', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);

        Log::info('User found, updating profile:', ['user_id' => $user->id]);

        $user->personalInformation()->update([
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'profilepicture' => $user->personalInformation->profilepicture, // Default current value
            'coverphoto' => $user->personalInformation->coverphoto, // Default current value
        ]);

        // Handle file uploads
        if ($request->hasFile('profilepicture')) {
            $profilePicturePath = $request->file('profilepicture')->store('images', 'public');
            $user->personalInformation()->update(['profilepicture' => $profilePicturePath]);
        }

        if ($request->hasFile('coverphoto')) {
            $coverPhotoPath = $request->file('coverphoto')->store('images', 'public');
            $user->personalInformation()->update(['coverphoto' => $coverPhotoPath]);
        }

        Log::info('Profile updated successfully for user:', ['user_id' => $user->id]);

        return response()->json(['message' => 'Profile updated successfully']);
    }


    public function getUsers(Request $request)
    {
        $currentUser = Auth::user();
        $users = User::where('id', '!=', $currentUser->id)->with('role')->paginate(5);
        return response()->json(['users' => $users]);
    }

    public function acceptUser(Request $request, $userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $status = $request->input('verified', false);
        $user->setVerified($status);

        return response()->json(['message' => 'User accepted and verified'], 200);
    }
}
