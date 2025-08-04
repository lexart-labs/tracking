<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsersHours extends Model
{
    use HasFactory;

    protected $table = 'UsersHours';
    public $timestamps = false;

    protected $fillable = [
        'user_hour_id', 'user_id', 'day', 'title', 'start', 'end', 'deleted_at', 'created_at', 'updated_at',
    ];

}
