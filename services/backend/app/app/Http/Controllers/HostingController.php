<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Hosting;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator as Validator;

class HostingController extends BaseController
{
    public function all(Request $request, $id = null)
    {
        try{
            $hostings = Hosting::select();

            if(!empty($id)){
                $request["id"] = $id;

                $this->validate($request, [
                    "id" => "exists:Hosting,id"
                ]);

                $hosting = $hostings->where("id", $id)->where("borrado", 0)->first();

                return array("response" => $hosting);
            }

            $hostings = $hostings->where("borrado", 0)->get();

            return array("response" => $hostings);
        }catch(Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "hostings all"), 500));
        }
    }

    public function update(Request $request)
    {
        $this->validate($request, [
            "accountStatus" => "required",
            "billingAddress" => "required",
            "borrado" => "required|numeric",
            "businessName" => "required",
            "company" => "required|numeric",
            "fullName" => "required",
            "id" => "required|exists:Hosting,id",
            "rut" => "required",
            "serviceCost" => "required|numeric",
            "serviceNumber" => "required",
            "startDate" => "required",
            //Arrays
            "contact" => "required|array",
            "contact.*.name" => "required",
            "contact.*.email" => "required|email",
            "contact.*.phone" => "required|numeric",
            "contact.*.type.name" => "required",""
        ]);

        $update = $request->only([
            "account",
            "accountStatus",
            "billingAddress",
            "borrado",
            "businessName",
            "company",
            "contact",
            "contractType",
            "document",
            "email",
            "finalClient",
            "fullName",
            "id",
            "phone",
            "products",
            "rut",
            "serviceCost",
            "serviceDescription",
            "serviceNumber",
            "startDate"
        ]);

        try{
            return $update;
        }catch(Exception $e) {

        }
    }
}


