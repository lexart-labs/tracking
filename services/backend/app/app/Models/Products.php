<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    use HasFactory;

    protected $table = 'Products';

    public $timestamps = false;

    protected $fillable = ['id', 'name', 'type', 'cpu', 'hdd', 'transfer', 'memory', 'diskSpace', 'ammountEmails', 'amountDataBase', 'domain',
        'expiration', 'provider', 'placeAccommodation', 'accessData', 'link', 'ip', 'note', 'price', 'databaseAccess', 'status', 'borrado'];


}
