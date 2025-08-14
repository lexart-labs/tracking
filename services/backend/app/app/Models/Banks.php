<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banks extends Model
{
    use HasFactory;

    protected $table = 'Banks';

    public $timestamps = false;

    protected $fillable = ['id', 'name', "country", 'branchOffice', 'userId', 'type', 'currency', "identificationCard", "account", "priceUsd", "active", "borrado"];
}
