<?php

namespace App\Http\Controllers;

use App\Models\Clients;
use Exception;
use Illuminate\Http\Request;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Response;

class ClientsController extends BaseController
{
    public function all($id = null) 
    {
        
        try{
            if(!empty($id)){
               return Clients::where('id', $id)->first(); 
            }

            return array('response' => Clients::all());
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "clients all"), 500));
        }
    }

    public function new(Request $request)
    {
        $this->validate($request, [
            "name" => "required",
            "company" => "required"
        ]);

        $client = $request->only(["name", "company"]);
        return Clients::create($client);
        try{
            
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "clients new"), 500));
        }

    }

    public function update(Request $request)
    {
        $this->validate($request, [
            "name" => "required",
            "company" => "required",
            "id" => "required|numeric|exists:clients"
        ]);
        
        try{
            $client = $request->only(["name", "company", "id"]);
            return Clients::where("id", $client['id'])->update(["name" => $client['name'], "company" => $client['company']]);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "clients update"), 500));
        }   
    }
}

