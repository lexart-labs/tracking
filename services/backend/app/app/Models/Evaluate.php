<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluate extends Model
{
    use HasFactory;

    protected $table = 'Evaluate';

    public $timestamps = false;

    protected $fillable = ['idUser', "idAdmin", 'idTask', 'evaluacion', 'puntaje', 'fecha'];
}
