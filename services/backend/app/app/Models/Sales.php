<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    use HasFactory;

    protected $table = 'Sales';
    public $timestamps = false;

    protected $fillable = ['id', 'description', 'concept', 'amount', 'type', 'currency', 'active', 'date', 'status', 'client', 'idClient', 'seller', 'payType', 'card', 'idUser'];
}
