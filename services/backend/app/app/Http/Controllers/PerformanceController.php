<?php

namespace App\Http\Controllers;

use App\Models\Performance;
use Exception;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Response;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;


class PerformanceController extends BaseController
{
    public function userId(Request $request, $id)
    {
        $this->validate($request, [
            "idMonth" => "required",
            "year" => "required"
        ]);

        $idMonth = $request->input("idMonth");
        $year = $request->input("year");

        try{
            $performance = Performance::where('idUser', $id)->where('idMonth', $idMonth)->where('year', $year)->get();
            if(!$performance) {
                return (new Response(array("Error" => PERFORMANCE_NOT, "Operation" => "performance"), 400));
            }

            return array('response' => $performance);
        }catch (Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "performance"), 500));
        }
    }

    public function all()
    {
        try{
            $performance = Performance::all();
            return json_encode($performance);
        }catch(Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "performance"), 500));
        }
    }

    public function current(Request $request)
    {
        $user_id = AuthController::current()->id;

        return $this->userId($request, $user_id);
    }

    public function save(Request $request, $id)
    {

        if(!empty($id)) $request["idUser"] = $id;

        $this->validate($request, [
            "idUser" => "required|numeric|exists:Users,id",
            "year" => "required|numeric",
            "idMonth" => "required|numeric",
            "month" => "required",
            "salary" => "required|numeric",
            "costHour" => "required|numeric",
        ]);

        try{
            $performance = $request->only(["idUser", "year", "idMonth", "month", "salary", "costHour"]);

            $performance = Performance::create($performance);
            return array("response" => $performance);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "performance new"), 500));
        }

    }

    public function saveCurrent(Request $request)
    {
        $this->validate($request, [
            "year" => "required|numeric",
            "idMonth" => "required|numeric",
            "month" => "required",
            "salary" => "required|numeric",
            "costHour" => "required|numeric",
        ]);

        $user_id = AuthController::current()->id;
        $only = $request->only(["year", "idMonth", "month", "salary", "costHour"]);

        $only['idUser'] = $user_id;

        try{
            $performance = $only;
            Performance::create($performance);
            return array('response' => 'Salario actualizado correctamente.');
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "performance new"), 500));
        }
    }
}
