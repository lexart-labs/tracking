<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JiraTasks extends Model
{
    use HasFactory;

    protected $table = 'JiraTasks';

    public $timestamps = false;

    protected $fillable = ['id', 'idTask', 'keyTask', 'idBoard', 'idProyecto', 'name', 'project', 'status', 'priority', 'reporter', 'users', 'description', 'comments', 'active', 'type'];
}
