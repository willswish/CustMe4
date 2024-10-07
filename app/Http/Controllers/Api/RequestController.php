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
}
