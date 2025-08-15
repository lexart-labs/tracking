<?php

namespace App\Http\Controllers;

use Exception;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Sales;

class SalesController extends BaseController
{
    public function all($id = null)
    {
        try{
            if(!empty($id)){

                $sales = Sales::where('id', $id)->where("active", 1)->first();

                return array("response" => $sales);
            }

            $sales = Sales::where("active", 1)->get();
            return array("response" => $sales);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "sales all"), 500));
        }
    }

    public function new(Request $request)
    {
        $this->validate($request, [
            "description" => "required",
            "concept" => "required",
            "amount" => "required|numeric",
            "type" => "required",
            "currency" => "required",
            "active" => "required|numeric",
            "date" => "required|date",
            "status" => "string",
            "client" => "required",
            "idClient" => "required|numeric|exists:Clients,id",
            "seller" => "required",
            "payType" => "date",
            "card" =>  "",
            "idUser" => "required|numeric|exists:Users,id"
        ]);

        $sales = $request->only([
            "description",
            "concept",
            "amount",
            "type",
            "currency",
            "active",
            "date",
            "status",
            "client",
            "idClient",
            "seller",
            "payType",
            "card",
            "idUser"
        ]);

        try{
            return Sales::create($sales);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "sales all"), 500));
        }
    }

    public function update(Request $request)
    {
        $this->validate($request, [
            "id" => "required|exists:Sales",
            "description" => "required",
            "concept" => "required",
            "amount" => "required|numeric",
            "type" => "required",
            "currency" => "required",
            "active" => "required|numeric",
            "date" => "required",
            "status" => "string",
            "client" => "required",
            "idClient" => "required|numeric|exists:Clients,id",
            "seller" => "required",
            "idUser" => "required|numeric|exists:Users,id"
        ]);

        if($request->input("payType") != null) {
            $this->validate($request, ["payType" => "date"]);
        }

        $sale = $request->only([
            "id",
            "description",
            "concept",
            "amount",
            "type",
            "currency",
            "active",
            "date",
            "status",
            "client",
            "idClient",
            "seller",
            "payType",
            "card",
            "idUser"
        ]);

        try{

            $id = $sale["id"];

            $saleWhere = Sales::where("id", $id)->first();

            if(!$saleWhere){
                return (new Response(array("Error" => ID_INVALID, "Operation" => "sales update"), 400));
            }

            return Sales::where("id", $id)->update($sale);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "sales update"), 500));
        }
    }

    public function delete(Request $request)
    {
        $this->validate($request, ["id" => "required|numeric|exists:Sales,id"]);

        $id = $request->input("id");

        try{
            $sale = Sales::where("id", $id)->first();

            if(!$sale){
                return (new Response(array("Error" => ID_INVALID, "Operation" => "sales update"), 400));
            }

            return sales::where("id", $id)->update(["active" => "0"]);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "sales update"), 500));
        }
    }

    public function undelete(Request $request)
    {
        $this->validate($request, ["id" => "required|numeric|exists:Sales,id"]);

        $id = $request->input("id");

        try{
            $sale = Sales::where("id", $id)->first();

            if(!$sale){
                return (new Response(array("Error" => ID_INVALID, "Operation" => "sales undelete"), 400));
            }

            return Sales::where("id", $id)->update(["active" => "1"]);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "sales undelete"), 500));
        }
    }

    public function getAllSaelsByMonth(Request $request, $dateIni, $dateEnd, $idUser = null)
    {

        $request["idUser"] = $idUser;

        try{
            $sales = Sales::whereRaw("date >= ?", [$dateIni])->whereRaw("date <= (? + INTERVAL 1 DAY)", [$dateEnd]);

            if(!empty($idUser)){
                $this->validate($request, [
                    "idUser" => "exists:Users,id"
                ]);

                $sales = $sales->where("idUser", $idUser);
            }

            $sales = $sales->get();
            $totalSales = $this->addAmountsToCurrency($sales);

            return array("response" => array("sales" => $sales, "totalSales" => $totalSales));
        }catch(Exception $e){

        }
    }

    public function addAmountsToCurrency($sales)
    {

        $totalPesos = 0;
        $totalDolares = 0;
        $totalReales = 0;

        foreach($sales as $sale) {
            if($sale->currency === "R$" ){
                $totalReales += floatval($sale->amount);
            }

            if($sale->currency === "USD" ){
                $totalDolares += floatval($sale->amount);
            }

            if($sale->currency === "$" ){
                $totalPesos += floatval($sale->amount);
            }
        }

        return array(
            "totalPesos" => $totalPesos,
            "totalDolares" => $totalDolares,
            "totalReales" => $totalReales
        );
    }

    //Isso deveria ter uma tabela
    public function concepts()
    {
        $concepts = array(
            array("concept" => "WEB"),
            array("concept" => "SOFTWARE"),
            array("concept" => "INFRAESTRUCTURA"),
            array("concept" => "ASESORAMIENTO"),
        );

        return array("response" => $concepts);
    }

    //Isso deveria ter uma tabela
    public function types()
    {
        $types = array(
            array("type" => "RE_SELLING", 		"name" => "REVENTA"),
            array("type" => "NEW_SELL", 	"name" => "NUEVA VENTA"),
            array("type" => "PAYMENT" ,		"name" => "PAGO"),
        );

        return array("response" => $types);
    }
}
