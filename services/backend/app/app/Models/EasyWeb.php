<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EasyWeb extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $table = 'Easyweb';

    protected $fillable = [
        'id', 'name', 'domain', 'description', 'jsonMenu', 'jsonSections', 'jsonSliders', 'jsonForm', 'jsonFooter', 'active',
        'idUser', 'connectToken'
    ];

    protected $casts = [
        'jsonMenu' => "json",
        'jsonSections' => "json",
        'jsonSliders' => "json",
        'jsonForm' => "json",
        'jsonFooter' => "json",
    ];
}
