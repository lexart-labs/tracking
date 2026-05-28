<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model representing a Client record in the database.
 *
 * @property int $id
 * @property string $name
 * @property string $company
 * @property bool $active
 */
class Clients extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $table = 'Clients';

    protected $fillable = ['name', 'company', 'active'];

}
