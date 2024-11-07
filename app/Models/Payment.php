<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments'; // Specify the table name if it's different
    protected $primaryKey = 'payment_id'; // Specify the primary key

    protected $fillable = [
        'initial_payment_id', // Foreign key for linking to initial payments
        'user_id',
        'receiver_id',
        'amount',
        'status',
        'transaction_id',
        'payment_method',
    ];

    // Define the relationship to the InitialPayment model
    public function initialPayment()
    {
        return $this->belongsTo(InitialPayment::class, 'initial_payment_id');
    }

    // Define the relationship to the User model (payer)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Define the relationship to the User model (receiver)
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
