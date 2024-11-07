<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InitialPayment extends Model
{
    use HasFactory;

    protected $table = 'initial_payments'; // Specify the table name if it's different
    protected $primaryKey = 'initial_payment_id'; // Specify the primary key

    protected $fillable = [
        'post_id',
        'user_id',
        'amount',
        'status',
        'transaction_id',
        'payment_method',
    ];

    // Define the relationship to the Post model
    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    // Define the relationship to the User model
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
