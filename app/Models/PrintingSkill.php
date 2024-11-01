<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrintingSkill extends Model
{
    use HasFactory;
    protected $primaryKey = 'printing_skill_id';


    protected $fillable = ['printing_skill_name'];

    public function getAllPrintingSkills()
    {
        return $this->all();
    }
}
