<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Performance extends Model
{
    use HasFactory;

    protected $table = 'Performance';

    public $timestamps = false;

    protected $fillable = ['id', 'idUser', 'month', 'idMonth', 'year', 'costHour', "salary"];

}
