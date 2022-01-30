<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\AuthController;

class UserController extends BaseController
{
    public function login(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'password' => 'required|min:8|string',
        ]);

        $email = $request->input('email');
        $password = md5($request->input('password'));

        try {
            $user = User::where('email', $email)->where('password', $password)->first();
            if ($user) {
                $auth = new AuthController();
                return $auth->login($user);
            }

            return (new Response(array("Error" => INVALID_LOGIN, "Operation" => "login"), 400));
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "login"), 500));
        }
    }

    public function register(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|string',
            'password_confirm' => 'required|same:password|string',
            'role' => 'required'
        ]);

        $name = $request->input('name');
        $email = $request->input('email');
        $password = md5($request->input('password')); //REVER O METODO DE ENCRYPT
        $role = $request->input('role');

        try{
            User::create(array(
                "name" => $name,
                "email" => $email,
                "password" => $password,
                "role" => $role));
            
            return (new Response(array("status" => REGISTRED, "operation" => "register")));
        }catch(Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "login"), 500));
        }
    }

    public function all() {
        try{
            return json_encode(User::all());
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "login"), 500));
        }
    }
}
