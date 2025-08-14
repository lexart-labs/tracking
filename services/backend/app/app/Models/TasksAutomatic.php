<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskAutomatic extends Model
{
    use HasFactory;

    protected $table = 'TaskAutomatic';

    public $timestamps = false;

    protected $fillable = [
        'id', 'idProyecto', 'idClient', 'error', 'project', 'line',
        'column', 'file', 'origin', 'url', 'dateCapture', 'dateCreate',
        'dateUpdate', 'comments', 'duration', 'users', 'type', 'startDate',
        'endDate', 'status', 'client', 'active'];
}
