<?php

use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\LocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/current-user', [UserApiController::class, 'currentUser']);
    Route::get('/users', [UserApiController::class, 'getUsers']);
    Route::post('/logout', [UserApiController::class, 'logout']);
    Route::post('/updateUsers/{userId}', [UserApiController::class, 'acceptUser']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/allposts', [PostController::class, 'displayPost']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::put('/posts/{postId}', [PostController::class, 'updatePost']);
    Route::delete('/delete-posts/{post}', [PostController::class, 'destroy']);
    Route::post('/requests', [RequestController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/users/{id}/profile', [UserApiController::class, 'getUserProfile']);
    Route::get('/users/{id}/profile', [UserApiController::class, 'getOtherUserProfile']);
    Route::put('/users/{id}/profile', [UserApiController::class, 'updateUserProfile']);
    Route::get('/user/images', [PostController::class, 'getUserImages']);
    Route::get('/users/artist-and-printing-provider', [UserApiController::class, 'getArtistAndPrintingProvider']);




    Route::get('/stores', [StoreController::class, 'getAllStores']);
    Route::post('/stores', [StoreController::class, 'saveStore']);
    Route::put('/stores/{id}', [StoreController::class, 'updateStore']);
    Route::delete('/stores/{id}', [StoreController::class, 'deleteStore']);
    Route::get('/stores/{id}', [StoreController::class, 'getStore']);

    Route::get('/chats', [ChatController::class, 'getMessages']);
    Route::post('/send-message', [ChatController::class, 'sendMessage']);
    Route::get('/user-chat-list', [ChatController::class, 'getUserChatList']);

    Route::get('/myposts', [PostController::class, 'getMyPosts']);
    Route::get('/designerposts', [PostController::class, 'getGraphicDesignerPosts']);
    Route::get('/providerposts', [PostController::class, 'getPrintingProviderPosts']);
    Route::get('/clientposts', [PostController::class, 'getClientPosts']);
    Route::get('/allposts', [PostController::class, 'displayPost']);


    Route::post('/notifications/{requestId}/accept', [RequestController::class, 'accept']);
    Route::post('/notifications/{requestId}/decline', [RequestController::class, 'decline']);
});





Route::get('/roles', [UserApiController::class, 'roles']);

Route::post('/login', [UserApiController::class, 'login']);
Route::post('/register', [UserApiController::class, 'register']);
