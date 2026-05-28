<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weeklyhours extends Model
{
    use HasFactory;

    protected $table = 'WeeklyHours';
    public $timestamps = false;

    protected $fillable = ['id', 'idUser', 'userName', 'costHour', 'workLoad', 'currency', 'borrado', 'valid_from', 'valid_until'];

    protected $casts = [
        'id' => 'string',
        'idUser' => 'string',
        'costHour' => 'string',
        'borrado' => 'string',
        'workLoad' => 'string',
        'valid_from' => 'date:Y-m-d',
        'valid_until' => 'date:Y-m-d',
    ];

    public static function forDate(int $userId, string $date): ?self
    {
        return static::where('idUser', $userId)
            ->where('borrado', '0')
            ->where('valid_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>=', $date);
            })
            ->orderBy('valid_from', 'desc')
            ->first();
    }
}
