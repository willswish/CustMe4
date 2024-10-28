<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCertificate extends Model
{
    use HasFactory;

    protected $fillable = ['file_path', 'file_name'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
