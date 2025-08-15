<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tracks extends Model
{
    use HasFactory;

    protected $table = 'Tracks';
    public $timestamps = false;

    protected $fillable = [
        'id', 'idTask', 'idUser', 'name', 'typeTrack',
        'currency', 'trackCost', 'idProyecto', 'startTime', 'endTime', 'duracion'
    ];

    protected $casts = [
        'id' => 'string',
        'idUser' => 'string',
        'idProyecto' => 'string',
        'duracion' => 'string',
        'idTask' => 'string',
        'costHour' => 'string'
    ];

}
