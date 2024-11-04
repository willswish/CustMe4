<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments'; // Specify the table if it differs from the model name
    protected $primaryKey = 'payment_id'; // Specify the primary key if different

    protected $fillable = [
        'request_id',
        'amount',
        'status',
        'transaction_id',
        'payment_method',
    ];

    // Define the relationship to the Request model
    public function request()
    {
        return $this->belongsTo(Request::class, 'request_id');
    }
}
