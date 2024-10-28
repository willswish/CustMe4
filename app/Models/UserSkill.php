<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class UserSkill extends Pivot
{
    use HasFactory;

    protected $table = 'user_skills';

    protected $fillable = ['user_id', 'skill_id'];
}
