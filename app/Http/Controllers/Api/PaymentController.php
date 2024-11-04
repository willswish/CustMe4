<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function initiatePayment(Request $request)
    {
        $amount = $request->input('amount') * 100; // Convert amount to centavos
        $client = new Client();

        $response = $client->post('https://api.paymongo.com/v1/sources', [
            'auth' => [env('PAYMONGO_SECRET_KEY'), ''],
            'json' => [
                'data' => [
                    'attributes' => [
                        'amount' => $amount,
                        'currency' => 'PHP',
                        'type' => 'gcash', // Can be 'gcash', 'card', etc.
                        'redirect' => [
                            'success' => route('payment.success'),
                            'failed' => route('payment.failed'),
                        ],
                    ],
                ],
            ],
        ]);

        $responseBody = json_decode($response->getBody(), true);
        return response()->json(['checkout_url' => $responseBody['data']['attributes']['redirect']['checkout_url']]);
    }

    public function paymentSuccess(Request $request)
    {
        DB::beginTransaction();

        try {
            // Assuming transaction ID is provided as a query parameter
            $transactionId = $request->query('transaction_id');

            // Find the payment by transaction ID
            $payment = Payment::where('transaction_id', $transactionId)->first();

            if ($payment) {
                // Update the payment status to 'completed'
                $payment->status = 'completed';
                $payment->save();

                // Update the associated request status to 'paid'
                $requestModel = $payment->request;
                $requestModel->status = 'paid';
                $requestModel->save();

                // Create a notification to inform the requester
                Notification::create([
                    'user_id' => $requestModel->user_id,
                    'request_id' => $requestModel->request_id,
                    'content' => 'Your payment was successfully completed for the request titled: ' . $requestModel->request_type,
                    'status' => 'unread'
                ]);

                // Commit the transaction since all operations were successful
                DB::commit();

                return view('payment.success');
            } else {
                // Payment not found, handle the error
                DB::rollBack();
                return view('payment.failed', ['message' => 'Payment not found.']);
            }
        } catch (\Exception $e) {
            // Rollback the transaction in case of any exception
            DB::rollBack();
            Log::error('Payment success processing error: ' . $e->getMessage());
            return view('payment.failed', ['message' => 'An error occurred while processing the payment.']);
        }
    }
    public function paymentFailed(Request $request)
    {
        DB::beginTransaction();

        try {
            // Assuming transaction ID is provided as a query parameter
            $transactionId = $request->query('transaction_id');

            // Find the payment by transaction ID
            $payment = Payment::where('transaction_id', $transactionId)->first();

            if ($payment) {
                // Update the payment status to 'failed'
                $payment->status = 'failed';
                $payment->save();

                // Create a notification to inform the requester
                $requestModel = $payment->request;

                Notification::create([
                    'user_id' => $requestModel->user_id,
                    'request_id' => $requestModel->request_id,
                    'content' => 'Unfortunately, your payment failed for the request titled: ' . $requestModel->request_type,
                    'status' => 'unread'
                ]);

                // Commit the transaction since all operations were successful
                DB::commit();

                return view('payment.failed', ['message' => 'Payment failed. Please try again.']);
            } else {
                // Payment not found, handle the error
                DB::rollBack();
                return view('payment.failed', ['message' => 'Payment not found.']);
            }
        } catch (\Exception $e) {
            // Rollback the transaction in case of any exception
            DB::rollBack();
            Log::error('Payment failure processing error: ' . $e->getMessage());
            return view('payment.failed', ['message' => 'An error occurred while processing the payment.']);
        }
    }
}
