<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use App\Models\InitialPayment;
use App\Models\Post;
use App\Models\Request as RequestModel;
use App\Events\NotificationEvent;
use App\Models\Notification;

class PaymentController extends Controller
{
    // Method to create a checkout session for product payment
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

            // Create an initial payment record in the database
            $initialPayment = InitialPayment::create([
                'post_id' => $postId,
                'user_id' => $userId,
                'amount' => $amount / 100, // Save amount in PHP (converting from centavos)
                'status' => 'initiated',
                'transaction_id' => null,
                'payment_method' => 'gcash',
            ]);

            // Create the request record in the database
            $userRequest = RequestModel::create([
                'post_id' => $postId,
                'user_id' => $userId,
                'target_user_id' => $request->input('target_user_id'), // Pass target user ID if applicable
                'request_type' => 'product_request',
                'status' => 'pending',
                'request_content' => $request->input('request_content'), // Request content from input
                'duration_days' => $request->input('duration_days') ?? null,
                'duration_minutes' => $request->input('duration_minutes') ?? null,
                'completion_deadline' => $this->calculateCompletionDeadline(
                    $request->input('duration_days') ?? 0,
                    $request->input('duration_minutes') ?? 0
                ),
            ]);

            // Log request creation for debugging
            Log::info('User request created:', $userRequest->toArray());

            $targetUserId = $request->input('target_user_id');

            // Check if target user ID is provided
            if (!$targetUserId) {
                Log::error('Target user ID is missing. Notification not created.');
                return response()->json(['error' => 'Target user ID is required to create a notification.'], 400);
            }


            // Create the notification after the request is created
            $notification = Notification::create([
                'content' => $request->user()->username . ' has requested for your service.', // Assuming you get this from the request
                'status' => 'unread',
                'user_id' => $request->input('target_user_id'),
                'request_id' => $userRequest->request_id, // Use the primary key of the created request
            ]);

            // Log the notification creation event
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
                            'redirect' => [
                                'success' => route('payment.success', ['initial_payment_id' => $initialPayment->initial_payment_id]),
                                'failed' => route('payment.failed', ['initial_payment_id' => $initialPayment->initial_payment_id])
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

            if (isset($responseBody['data']['attributes']['checkout_url'])) {
                return response()->json([
                    'checkout_url' => $responseBody['data']['attributes']['checkout_url'],
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



    // Method to handle successful payments
    public function paymentSuccess(Request $request)
    {
        $initialPaymentId = $request->input('initial_payment_id');
        $initialPayment = InitialPayment::find($initialPaymentId);

        if (!$initialPayment) {
            return redirect()->route('home')->with('error', 'Payment record not found.');
        }

        // Update the initial payment record
        $initialPayment->update([
            'status' => 'completed',
            'transaction_id' => $request->input('transaction_id'), // Transaction ID from PayMongo, if available
            'payment_method' => 'gcash' // Update based on the method actually used, if necessary
        ]);

        return redirect()->route('home')->with('success', 'Payment completed successfully.');
    }

    // Method to handle failed payments
    public function paymentFailed(Request $request)
    {
        $initialPaymentId = $request->input('initial_payment_id');
        $initialPayment = InitialPayment::find($initialPaymentId);

        if (!$initialPayment) {
            return redirect()->route('home')->with('error', 'Payment record not found.');
        }

        // Update the initial payment status to 'failed'
        $initialPayment->update([
            'status' => 'failed',
        ]);

        return redirect()->route('home')->with('error', 'Payment failed. Please try again.');
    }
}
