<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hosting extends Model
{
    use HasFactory;

    protected $table = 'Hosting';

    public $timestamps = false;

    protected $fillable = ['id', 'fullName', "account", 'serviceNumber', 'finalClient', 'company', 'accountStatus', "serviceDescription", "serviceCost",
     "contractType", "billingAddress", "businessName", "contact", "rut", "document", "phone", "email", "products", "startDate", "borrado"];


    protected $casts = [
        "contact" => "json",
        "products" => "json"
    ];
}
