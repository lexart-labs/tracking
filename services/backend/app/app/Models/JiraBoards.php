<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JiraBoards extends Model
{
    use HasFactory;

    protected $table = 'JiraBoards';

    public $timestamps = false;

    protected $fillable = ['id', 'idBoard', 'keyProject', 'idProyecto', 'name', 'projectName'];
}
