<?php

namespace App\Http\Controllers;

use App\Models\Products;
use Exception;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;

class ProductsController extends BaseController
{
    public function all(Request $request, $id = null)
    {
        try{
            $products = Products::select();

            if(!empty($id)){
                $request["id"] = $id;

                $this->validate($request, [
                    "id" => "exists:Hosting,id"
                ]);

                $products = $products->where("id", $id);
            }

            $products = $products->where("borrado", 0)->get();

            return array("response" => $products);
        }catch(Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "products all"), 500));
        }
    }
}


