<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use App\Models\InitialPayment;
use App\Models\Request as RequestModel;
use App\Models\Post;

use App\Events\NotificationEvent;
use App\Models\Notification;
use Illuminate\Http\Request as HttpRequest;

class PaymentController extends Controller
{
    public function createRequest(Request $request)
    {
        $postId = $request->input('post_id');
        $userId = auth()->id(); // Assuming the user is authenticated
        $postModel = Post::find($postId);

        if (!$postModel) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        try {
            // Create the request record in the database
            $userRequest = RequestModel::create([
                'post_id' => $postId,
                'user_id' => $userId,
                'target_user_id' => $request->input('target_user_id'),
                'request_type' => 'product_request',
                'status' => 'pending',
                'request_content' => $request->input('request_content'),
            ]);

            Log::info('User request created:', $userRequest->toArray());
            $initialPayment = InitialPayment::create([
                'post_id' => $postId,
                'user_id' => $userId,
                'request_id' => $userRequest->request_id,
                'amount' => 0, // Save amount in PHP (converting from centavos)
                'status' => 'pending',
                'transaction_id' => null, // Initial transaction ID will be null
                'payment_method' => 'gcash',
            ]);

            // Create the notification for the target user
            $targetUserId = $request->input('target_user_id');
            if (!$targetUserId) {
                Log::error('Target user ID is missing. Notification not created.');
                return response()->json(['error' => 'Target user ID is required to create a notification.'], 400);
            }

            $notification = Notification::create([
                'content' => $request->user()->username . ' has requested for your service.',
                'status' => 'unread',
                'user_id' => $targetUserId,
                'request_id' => $userRequest->request_id,
            ]);

            Log::info('Notification created:', $notification->toArray());
            broadcast(new NotificationEvent($notification));

            return response()->json([
                'message' => 'Request created successfully.',
                'request' => $userRequest,
                'notification' => $notification,
            ]);
        } catch (\Exception $e) {
            Log::error('Request creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Request creation failed'], 500);
        }
    }

    public function payForProduct(Request $request)
    {
        $postId = $request->input('post_id');
        $userId = auth()->id(); // Assuming the user is authenticated
        $postModel = Post::find($postId);

        if (!$postModel) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        // Calculate 20% of the product price in centavos (PHP currency)
        $amount = $postModel->price * 0.20 * 100; // Amount in centavos

        try {
            $client = new Client();

            // Create the request record in the database
            $userRequest = RequestModel::create([
                'post_id' => $postId,
                'user_id' => $userId,
                'target_user_id' => $request->input('target_user_id'),
                'request_type' => 'product_request',
                'status' => 'pending',
                'request_content' => $request->input('request_content'),
            ]);

            // Create the initial payment record with the transaction_id (which will be the checkout_session_id)
            $initialPayment = InitialPayment::create([
                'post_id' => $postId,
                'user_id' => $userId,
                'request_id' => $userRequest->request_id,
                'amount' => $amount / 100, // Save amount in PHP (converting from centavos)
                'status' => 'pending',
                'transaction_id' => null, // This will be updated later with checkout_session_id
                'payment_method' => 'gcash',
            ]);

            Log::info('User request created:', $userRequest->toArray());

            $targetUserId = $request->input('target_user_id');
            if (!$targetUserId) {
                Log::error('Target user ID is missing. Notification not created.');
                return response()->json(['error' => 'Target user ID is required to create a notification.'], 400);
            }

            $notification = Notification::create([
                'content' => $request->user()->username . ' has requested for your service.',
                'status' => 'unread',
                'user_id' => $targetUserId,
                'request_id' => $userRequest->request_id,
            ]);
            Log::info('Notification created:', $notification->toArray());
            broadcast(new NotificationEvent($notification));


            // Send a request to PayMongo to create a checkout session
            $response = $client->post('https://api.paymongo.com/v1/checkout_sessions', [
                'json' => [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount,
                            'currency' => 'PHP',
                            'description' => 'Initial Payment for Post ' . $postId,
                            'send_email_receipt' => true,
                            'line_items' => [
                                [
                                    'name' => 'Product Purchase',
                                    'description' => 'Initial 20% Payment for Post ' . $postId,
                                    'amount' => $amount,
                                    'currency' => 'PHP',
                                    'quantity' => 1
                                ]
                            ],
                            'payment_method_types' => ['gcash', 'card']
                        ]
                    ]
                ],
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode(config('services.paymongo.secret_key') . ':'),
                    'Content-Type' => 'application/json',
                ],
            ]);

            $responseBody = json_decode($response->getBody(), true);

            if (isset($responseBody['data']['id'])) {
                // Retrieve the checkout session ID from PayMongo's response
                $checkoutSessionId = $responseBody['data']['id']; // This is the unique session ID
                $checkoutUrl = $responseBody['data']['attributes']['checkout_url'];

                // Update the initial payment record with the checkout session ID in the transaction_id
                $initialPayment->update([
                    'transaction_id' => $checkoutSessionId, // Store the checkout_session_id in transaction_id
                    'status' => 'pending', // Set status as pending, or you can update as needed
                ]);

                return response()->json([
                    'checkout_url' => $checkoutUrl,
                    'message' => 'Checkout session created successfully.',
                ]);
            } else {
                Log::error('Failed to create checkout session: ' . json_encode($responseBody));
                return response()->json(['error' => 'Failed to create checkout session'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Checkout session creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Payment initiation failed'], 500);
        }
    }

    public function payForProduct80(Request $request, $requestId)
    {
        // Get the request record using requestId
        $userRequest = RequestModel::find($requestId); // Assuming RequestModel holds the data related to the payment

        if (!$userRequest) {
            return response()->json(['error' => 'Request not found'], 404);
        }

        $postId = $userRequest->post_id;  // Use post_id from the request record
        $userId = auth()->id(); // Get the currently authenticated user ID
        $postModel = Post::find($postId);

        if (!$postModel) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        // Calculate 80% of the product price in centavos (PHP currency)
        $amount = $postModel->price * 0.80 * 100; // Amount in centavos (80% of the total price)

        try {
            // Check if the user has already made the initial payment
            $initialPayment = $userRequest->initialPayments()->where('user_id', $userId)->first();

            if (!$initialPayment || $initialPayment->status !== 'initiated') {
                return response()->json(['error' => 'Initial payment not yet completed or initiated'], 400);
            }

            // Update the initial payment amount (add 80% to the existing amount)
            $updatedAmount = $initialPayment->amount + ($amount / 100); // Convert centavos to PHP (divide by 100)

            // Update the initial payment with the new 80% amount
            $initialPayment->update([
                'status' => 'completed', // Set the status to 'completed' after the payment
                'amount' => $updatedAmount, // Updated amount with 80% added
            ]);

            // Optionally, you can log or handle any additional tasks here
            Log::info('Initial payment updated with remaining 80% amount:', $initialPayment->toArray());

            // Create the PayMongo payment link for the remaining 80% payment
            $client = new \GuzzleHttp\Client();

            // Send a request to PayMongo to create the payment link
            $response = $client->post('https://api.paymongo.com/v1/links', [
                'body' => json_encode([
                    'data' => [
                        'attributes' => [
                            'amount' => $amount, // 80% of the total amount
                            'description' => '80% Payment for Post ' . $postId,
                        ]
                    ]
                ]),
                'headers' => [
                    'accept' => 'application/json',
                    'authorization' => 'Basic ' . base64_encode(config('services.paymongo.secret_key') . ':'),
                    'content-type' => 'application/json',
                ],
            ]);

            // Get the response body from PayMongo
            $responseBody = json_decode($response->getBody(), true);

            if (isset($responseBody['data']['attributes']['checkout_url'])) {
                // Retrieve the checkout URL from PayMongo's response
                $checkoutUrl = $responseBody['data']['attributes']['checkout_url'];

                return response()->json([
                    'checkout_url' => $checkoutUrl,
                    'message' => 'Checkout link for 80% payment created successfully.',
                ]);
            } else {
                Log::error('Failed to create checkout link: ' . json_encode($responseBody));
                return response()->json(['error' => 'Failed to create checkout link'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error processing the payment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process the payment'], 500);
        }
    }

    public function getRequestsWithPayments(HttpRequest $request, $userId)
    {
        // Query for requests where user_id or target_user_id matches the provided $userId
        $requests = RequestModel::where(function ($query) use ($userId) {
            $query->where('user_id', $userId)  // Include requests where the user is the initiator
                ->orWhere('target_user_id', $userId); // Include requests where the user is the recipient
        })
            ->with('initialPayments')  // Include initial payments (if the user is the initiator)
            ->with(['targetUserPayments' => function ($query) use ($userId) {
                // Filter to return payments where the user is the target user (recipient)
                $query->where('user_id', $userId);
            }])
            ->get();

        // Check if there are any requests found
        if ($requests->isEmpty()) {
            return response()->json(['message' => 'No requests found for this user.'], 404);
        }

        return response()->json($requests, 200);
    }
}
