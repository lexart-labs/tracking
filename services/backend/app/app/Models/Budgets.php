<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budgets extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $table = 'Budgets';

    protected $fillable = ['idClient', 'idUser', 'concept', 'amount', 'currency', 'active', 'date', 'description', 'hoursTotal', 'hoursPayable', 'status'];
}
