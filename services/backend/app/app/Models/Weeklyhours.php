<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weeklyhours extends Model
{
    use HasFactory;

    protected $table = 'WeeklyHours';
    public $timestamps = false;

    protected $fillable = ['id', 'idUser', 'userName', 'costHour', 'workLoad', 'currency', 'borrado'];

    protected $casts = [
        'id' => 'string',
        'idUser' => 'string',
        'costHour' => 'string',
        'borrado' => 'string',
        'workLoad' => 'string'
    ];
}
