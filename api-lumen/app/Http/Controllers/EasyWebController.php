<?php

namespace App\Http\Controllers;

use App\Models\EasyWeb;
use Exception;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EasyWebController extends BaseController
{
    public function all(Request $request, $id = null)
    {
        try{
           

            if(!empty($id)){
                $request["id"] = $id;
    
                $this->validate($request, [
                    "id" => "exists:easyweb,id"
                ]);

                $easyWeb = EasyWeb::select("*");
                $easyWeb = $easyWeb->where("easyweb.id", $id)->first();

                return array("response" => $easyWeb);
            }

            $easyWebs = EasyWeb::select("easyweb.id", "easyweb.name", "easyweb.domain", "users.name AS developer")->join("users", "users.id", "=", "easyweb.idUser");
            $easyWebs = $easyWebs->get();

            return array("response" => $easyWebs);
        }catch(Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "hostings all"), 500));
        }
    }
}

