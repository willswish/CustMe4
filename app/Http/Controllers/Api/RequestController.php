<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Request as UserRequest;
use App\Models\Notification;
use App\Events\NotificationEvent;
use Illuminate\Support\Facades\Log;

class RequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'target_user_id' => 'required|exists:users,id',
            'post_id' => 'required|exists:posts,post_id',
            'content' => 'required|string',
        ]);

        $userRequest = UserRequest::create([
            'user_id' => $validated['user_id'],
            'target_user_id' => $validated['target_user_id'],
            'request_type' => 'product_request',
            'status' => 'pending',
        ]);

        $notification = Notification::create([
            'content' => $validated['content'],
            'status' => 'unread',
            'user_id' => $validated['target_user_id'],
            'request_id' => $userRequest->request_id,
        ]);

        Log::info('Event fired: ' . json_encode($notification));
        event(new NotificationEvent($notification));

        return response()->json(['message' => 'Request created and notification sent.'], 201);
    }
    public function accept(Request $request, $requestId)
    {
        try {
            // Find the request by ID
            $userRequest = UserRequest::findOrFail($requestId);
            $userRequest->status = 'accepted'; // Update the status
            $userRequest->save();

            // Create a notification for the sender
            $notification = Notification::create([
                'content' => 'User @' . $request->user()->username . ' has accepted your request.',
                'status' => 'unread',
                'user_id' => $userRequest->user_id, // Notify the original sender
                'request_id' => $userRequest->request_id,
            ]);

            // Log notification creation and event firing
            Log::info('Accepted request and created notification: ' . json_encode($notification));

            // Fire the event
            event(new NotificationEvent($notification));

            Log::info('NotificationEvent successfully fired for request ID: ' . $requestId);

            return response()->json([
                'message' => 'Request accepted, sender notified in real time.',
                'event' => 'NotificationEvent fired successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in accept method: ' . $e->getMessage());
            return response()->json(['error' => 'Could not process request'], 500);
        }
    }

    public function decline(Request $request, $requestId)
    {
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
        event(new NotificationEvent($notification)); // Fire event to notify real-time

        return response()->json(['message' => 'Request declined and sender notified.'], 200);
    }
}
