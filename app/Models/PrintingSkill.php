<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrintingSkill extends Model
{
    use HasFactory;

    protected $fillable = ['printing_skill_name'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_printing_skills', 'printing_skill_id', 'user_id');
    }

    public function getAllPrintingSkills()
    {
        return $this->all();
    }
}
