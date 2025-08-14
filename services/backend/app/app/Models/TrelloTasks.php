<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrelloTasks extends Model
{
    use HasFactory;

    protected $table = 'TrelloTask';
    public $timestamps = false;

    protected $fillable = [
        'id', 'card_id', 'id_project', 'idProyecto', 'id_board', 'name',
        'project', 'description', 'comments', 'duration', 'users', 'type',
        'dateCreate', 'dateUpdate', 'startDate', 'endDate', 'status', 'client', 'active'
    ];

    protected $casts = [
        'id' => 'string',
        'idProyecto' => 'string',
        'id_project' => 'string',
        'active' => 'string'
    ];
}
