<?php

namespace App\Http\Controllers;

use App\Models\Weeklyhours;
use Laravel\Lumen\Routing\Controller as BaseController;

class CostHourController extends BaseController
{
    public function costHour($duration, $userId)
    {
        $cost = Weeklyhours::where('idUser', $userId)->first()->costHour;
        $costDecimal = $this->convertTimeToDecimal($duration);
        $trackCost = round($costDecimal * intval($cost)) ? round($costDecimal * intval($cost)) : 0 ;

        return $trackCost;
    }

    public function convertTimeToDecimal($value)
    {
        $time = explode(":",$value);
    	$horas = floatval($time[0]);
    	$minutes = floatval($time[1])/60;
    	$seconds = floatval($time[2])/3600;
    	$fraccionaria = $minutes + $seconds;
    	$decimal = floatval($horas+$fraccionaria);
    	return $decimal;
    }
}


