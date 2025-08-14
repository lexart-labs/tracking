<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserExceptions extends Model
{
    use HasFactory;

    protected $table = 'UserExceptions';

    protected $fillable = [
        'user_exceptions_id', 'user_id', 'day', 'title', 'start', 'end', 'deleted_at', 'created_at', 'updated_at',
    ];

}
