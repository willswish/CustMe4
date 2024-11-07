<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Request as UserRequest;
use App\Models\Notification;
use App\Models\Timer;
use App\Events\NotificationEvent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Services\TimerService;



class RequestController extends Controller
{
    public function store(Request $request)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'target_user_id' => 'required|exists:users,id',
            'post_id' => 'required|exists:posts,post_id',
            'content' => 'required|string', // This will be for the notification content
            'request_content' => 'required|string', // Validate request content for the requests table
            'duration_days' => 'nullable|integer|min:0', // Validate duration days
            'duration_minutes' => 'nullable|integer|min:0', // Validate duration minutes

        ]);

        // Debug log the validated input
        Log::info('Validated request data:', $validated);

        // Calculate the completion deadline based on duration
        $completionDeadline = $this->calculateCompletionDeadline(
            $validated['duration_days'] ?? 0,
            $validated['duration_minutes'] ?? 0
        );

        // Log the payload that will be sent to the database
        Log::info('UserRequest payload:', [
            'user_id' => $validated['user_id'],
            'post_id' => $validated['post_id'],
            'target_user_id' => $validated['target_user_id'],
            'request_content' => $validated['request_content'],
            'duration_days' => $validated['duration_days'] ?? null,
            'duration_minutes' => $validated['duration_minutes'] ?? null,
            'completion_deadline' => $completionDeadline,
        ]);

        // Create the user request and include duration information
        $userRequest = UserRequest::create([
            'user_id' => $validated['user_id'],
            'post_id' => $validated['post_id'],
            'target_user_id' => $validated['target_user_id'],
            'request_type' => 'product_request',
            'status' => 'pending',
            'request_content' => $validated['request_content'], // Store the request content here
            'duration_days' => $validated['duration_days'] ?? null,
            'duration_minutes' => $validated['duration_minutes'] ?? null,
            'completion_deadline' => $completionDeadline, // Set the completion deadline

        ]);

        // Log the created user request for debugging
        Log::info('Created user request:', $userRequest->toArray());

        // Create a notification for the target user
        $notification = Notification::create([
            'content' => $validated['content'], // Notification content
            'status' => 'unread',
            'user_id' => $validated['target_user_id'],
            'request_id' => $userRequest->request_id,
        ]);

        // Log the notification creation event
        Log::info('Notification created:', $notification->toArray());
        broadcast(new NotificationEvent($notification));

        return response()->json(['message' => 'Request created and notification sent.'], 201);
    }

    // Function to calculate completion deadline
    private function calculateCompletionDeadline($days = 0, $minutes = 0)
    {
        $now = new \DateTime(); // Use the leading backslash to indicate the global namespace
        if ($days > 0) {
            $now->modify("+{$days} days");
        }
        if ($minutes > 0) {
            $now->modify("+{$minutes} minutes");
        }
        return $now->format('Y-m-d H:i:s'); // Ensure correct format for MySQL
    }


    public function accept(Request $request, $requestId, $notificationId)
    {
        Log::info('Accept request method called with requestId: ' . $requestId . ' and notificationId: ' . $notificationId);
        try {
            // Find the request by ID
            $userRequest = UserRequest::findOrFail($requestId);
            $userRequest->status = 'accepted';
            $userRequest->save();

            // Create a notification for the sender
            $notification = Notification::create([
                'content' => $request->user()->username . ' has accepted your request.',
                'status' => 'accepted',
                'user_id' => $userRequest->user_id,
                'request_id' => $userRequest->request_id,
            ]);

            Log::info('Accepted request and created notification: ' . json_encode($notification));
            event(new NotificationEvent($notification));

            return response()->json([
                'message' => 'Request accepted, sender notified in real time.',
                'notification' => $notification,  // Return the notification data
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in accept method: ' . $e->getMessage());
            return response()->json(['error' => 'Could not process request'], 500);
        }
    }

    public function decline(Request $request, $requestId, $notificationId)
    {
        Log::info('Decline request method called with requestId: ' . $requestId . ' and notificationId: ' . $notificationId);
        try {
            // Find the request by ID
            $userRequest = UserRequest::findOrFail($requestId);
            $userRequest->status = 'declined'; // Update the status
            $userRequest->save();

            // Create a notification for the sender
            $notification = Notification::create([
                'content' => 'User @' . $request->user()->username . ' has declined your request.',
                'status' => 'unread',
                'user_id' => $userRequest->user_id, // Notify the original sender
                'request_id' => $userRequest->request_id,
            ]);

            Log::info('Declined request: ' . json_encode($notification));
            event(new NotificationEvent($notification)); // Fire event to notify in real-time

            return response()->json(['message' => 'Request declined and sender notified.'], 200);
        } catch (\Exception $e) {
            Log::error('Error in decline method: ' . $e->getMessage());
            return response()->json(['error' => 'Could not process request'], 500);
        }
    }
    public function getAllRequests(Request $request)
    {
        // Get the logged-in user
        $user = Auth::user();

        // Fetch all requests related to the current user
        // You can modify this to fit your application's requirement: e.g. only requests for specific roles
        $requests = UserRequest::where('target_user_id', $user->id)
            ->orWhere('user_id', $user->id)
            ->with('user', 'targetUser') // Load relationships if needed
            ->get();

        // Return the requests with necessary details
        return response()->json([
            'requests' => $requests,
        ]);
    }
}
