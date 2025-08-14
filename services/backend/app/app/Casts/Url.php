<?php
 
namespace App\Casts;
 
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
 
class Url implements CastsAttributes
{
    
    public function get($model, $key, $value, $attributes)
    {
        return urldecode($value);
    }
 
    public function set($model, $key, $value, $attributes)
    {
        return urlencode($value);
    }
}