<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tasks extends Model
{
    use HasFactory;

    protected $table = 'Tasks';
    public $timestamps = false;

    protected $fillable = [
        'id', 'idProject', 'name', 'description', 'comments',
        'duration', 'users', 'type', 'startDate', 'endDate',
        'status', 'active'
    ];

    protected $casts = [
        'id' => 'string',
        'idProject' => 'string',
        'active' => 'string'
    ];

}
