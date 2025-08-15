<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Casts\Url;

class TrelloBoard extends Model
{
    use HasFactory;

    protected $table = 'TrelloBoard';
    public $timestamps = false;

    protected $fillable = ['id', 'tablero_id', 'proyecto_id', 'url', 'activo', 'dateCreate', 'dateUpdate', 'active'];

    protected $hidden = ['active'];

    protected $casts = [
        "id" => "string",
        "proyecto_id" => "string",
        "url" => Url::class,
    ];
}
