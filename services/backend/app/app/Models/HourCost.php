<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HoursCost extends Model
{
    use HasFactory;

    protected $table = 'HoursCost';

    public $timestamps = false;

    protected $fillable = ['id', 'idUser', 'idClient', 'costUser', 'costClient', 'currencyClient', 'currencyUser', 'date', 'active'];
}
