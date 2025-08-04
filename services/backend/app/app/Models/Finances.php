<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Finances extends Model
{
    use HasFactory;

    protected $table = 'Finances';

    public $timestamps = false;

    protected $fillable = ['id', 'description', 'concept', 'amount', 'type', 'currency', 'active', 'date', 'status', 'idUser'];

    protected $casts = [
        'id' => 'string',
        'amount' => 'string',
        'active' => 'string',
    ];
}
