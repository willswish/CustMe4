<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\Request as ModelsRequest;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Fetch notifications with their associated requests
        $notifications = Notification::with('request') // Eager load the associated requests
            ->where('user_id', $request->user()->id) // Filter by the authenticated user
            ->orderBy('created_at', 'desc') // Order by creation date
            ->get();

        // Transform the notifications to replace the status
        $notifications = $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'content' => $notification->content,
                'status' => $notification->request->status, // Replace with the status from the associated request
                'timestamp' => $notification->timestamp,
                'user_id' => $notification->user_id,
                'request_id' => $notification->request_id,
                'created_at' => $notification->created_at,
                'updated_at' => $notification->updated_at,
                'target_user_id' => $notification->request->target_user_id,
                // You can include more fields from the request if needed
            ];
        });

        // Return the transformed data as a JSON response
        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
