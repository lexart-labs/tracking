<?php

namespace App\Http\Controllers;

use App\Models\Weeklyhours;
use Exception;
use Illuminate\Http\Request;
use Laravel\Lumen\Routing\Controller as BaseController;
use App\Models\Finances;

class FinancesController extends BaseController
{
    public function all(Request $request, $firstDate, $lastDate)
    {
        $request["firstDate"] = $firstDate;
        $request["lastDate"] = $lastDate;

        try{
            $finances = Finances::select("Finances.*", "Users.name AS userName")->join("Users", "Finances.idUser", "=", "Users.id")->whereRaw("date >= ?", [$firstDate])->whereRaw("date <= (? + INTERVAL 1 DAY)", [$lastDate])->get();
            $finances = $this->responseOld($finances);

            return array("response" => $finances);
        }catch(Exception $e){

        }
    }

    public function responseOld($d)
    {
        $gastos 		= array();
        $gastosProg 	= array();
        $cobros 		= array();
        $cobrosEst 		= array();
        $deudas 			 = array();

        $totalCharges 		= array();
        $totalDeuda 	= array();
        $totalExpenses		= array();
        $totalEstimatedCharges 		= array();
        $totalScheduledExpenses 			 = array();

        for ($i=0; $i < count($d) ; $i++) {
            // GASTOS
            if($d[$i]["type"] == "GASTO"){
                $gastos[] = $d[$i];
            }

            // GASTOS PROGRAMADOS
            if($d[$i]["type"] == "GASTO_PROG"){
                $gastosProg[] = $d[$i];
            }

            if($d[$i]["type"] == "COBROS"){
                $cobros[] 	= $d[$i];
            }

            if($d[$i]["type"] == "COBROS_EST"){
                $cobrosEst[] 	= $d[$i];
            }
            if($d[$i]["type"] == "DEUDA"){
                $deudas[] 	= $d[$i];
            }
        }

        $key 						= "amount";

        $totalExpenses 				= $this->totalAmount($gastos,$key);
        $totalScheduledExpenses 	= $this->totalAmount($gastosProg,$key);
        $totalCharges 				= $this->totalAmount($cobros,$key);
        $totalEstimatedCharges 		= $this->totalAmount($cobrosEst,$key);
        $totalDeuda						= $this->totalAmount($deudas,$key);
        $cotizacion = $this->getCotizacion();
        $this->cotizacionDolar=$cotizacion->dolar->sell;
        $res = array(
            // GASTOS
            "expenses" => $gastos,
            "totalExpenses" => $totalExpenses,

            // GASTOS PROGRAMADOS
            "scheduledExpenses" => $gastosProg,
            "totalScheduledExpenses" => $totalScheduledExpenses,

            // PAGOS
            "charges" => $cobros,
            "totalCharges" => $totalCharges,

            // PAGOS ESTIMADOS
            "estimatedCharges" => $cobrosEst,
            "totalEstimatedCharges" => $totalEstimatedCharges,

            // Deuda

            "debts" => $deudas,
            "totalDebts" => $totalDeuda,

            //cotizacion
            "cotizacion" => $cotizacion->dolar,

            // CAJA

            "realCash" => (float) (($totalCharges["totalPesos"]+ $totalCharges["totalDolares"]*$this->cotizacionDolar) - ($totalExpenses["totalPesos"] + $totalExpenses["totalDolares"]*$this->cotizacionDolar)),

            // CAJA Estiamda

            "estimatedCash" => (float) (($totalEstimatedCharges["totalPesos"]  + $totalEstimatedCharges["totalDolares"]*$this->cotizacionDolar)),

            // SALDO Real

            "realBalance" => (float) (($totalCharges["totalPesos"]+ $totalCharges["totalDolares"]*$this->cotizacionDolar) - ($totalScheduledExpenses["totalPesos"] + $totalScheduledExpenses["totalDolares"]*$this->cotizacionDolar + $totalExpenses["totalPesos"]+$totalExpenses["totalDolares"]*$this->cotizacionDolar)),

            // Saldo Estimado

            "chargesBalance" => (float) ( ($totalEstimatedCharges["totalPesos"] + $totalEstimatedCharges["totalDolares"]*$this->cotizacionDolar)-($totalCharges["totalPesos"] + $totalCharges["totalDolares"]*$this->cotizacionDolar)),

            //total Cobros

            "allCharges" => (float)($totalCharges["totalPesos"]+ $totalCharges["totalDolares"]*$this->cotizacionDolar)
        );

        return $res;
    }

    public function totalAmount($arr,$key){
		$totalDolares = 0;
		$totalPesos = 0;
		for ($i=0; $i < count($arr) ; $i++) {
			if ($arr[$i]["currency"]=="$") {
				$totalPesos = $totalPesos + (float) $arr[$i][$key];
			}else {
				$totalDolares=$totalDolares +(float) $arr[$i][$key];
			}
		}

		return array("totalPesos" => $totalPesos,"totalDolares" =>  $totalDolares);
	}

    public function getCotizacion(){
		return json_decode(file_get_contents('https://api.lexart.com.uy/gp-beta/algorithm/scrap/ine.php'));
	}
}


