<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use App\Models\TrelloBoard;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
class BoardTrelloController extends BaseController
{
    public function all($id = null)
    {
        try{
            if(!empty($id)){
                return array('response' => TrelloBoard::where('id', $id)->where('active', 1)->first());
            }
            return array('response' => TrelloBoard::where('active', 1)->get());
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tracks trello boards all"), 500));
        }
    }

    public function new(Request $request)
    {
        $this->validate($request, [
            "idBoard" => "required|unique:TrelloBoard,tablero_id",
            "project" => "required|exists:Projects,id",
            "url" => "required",
        ]);

        $board = array(
            "tablero_id" => $request->input("idBoard"),
            "proyecto_id" => $request->input("project"),
            "url" => $request->input("url"),
            "activo" => 1,
        );

        try{
            $board = TrelloBoard::create($board);

            return array("response" => $board);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tracks trello boards new"), 500));
        }
    }
}


