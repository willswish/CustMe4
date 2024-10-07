<?php

namespace App\Events;

use App\Models\Chat; // Import the Chat model
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chat;

    /**
     * Create a new event instance.
     *
     * @param  Chat  $chat
     * @return void
     */
    public function __construct(Chat $chat)
    {
        $this->chat = $chat; // Store the chat message that will be broadcasted
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        // Define a private channel for the chat based on the receiver's ID
        Log::info("Broadcasting message to private-chat." . $this->chat->receiver_id);
        return new PrivateChannel('private-chat.' . $this->chat->receiver_id);
    }

    /**
     * Customize the broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'message-sent';
    }

    /**
     * The data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->chat->id,
            'content' => $this->chat->content,
            'sender_id' => $this->chat->sender_id,
            'receiver_id' => $this->chat->receiver_id,
            'created_at' => $this->chat->created_at,
        ];
    }
}
