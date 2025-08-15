<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\AuthController;
use App\Models\UserExceptions;
use App\Models\UsersHours;
use App\Models\Weeklyhours;
use Laravel\Ui\Presets\React;
use Illuminate\Support\Facades\DB;
use WeeklyHour;
use Illuminate\Validation\Rule;
use App\Helpers\FileHelper;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseController
{

    public function login(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = $request->input('email');
        $password = $request->input('password');

        try {

            $user = User::where('email', $email)->where('status', 1)->first();

            if (!$user) {
                return (new Response(array("Error" => INVALID_LOGIN, "Operation" => "login"), 400));
            }

            // Try bcrypt first, then fallback to MD5 for legacy passwords
            $passwordValid = false;

            if (Hash::check($password, $user->password)) {
                $passwordValid = true;
            } elseif ($user->password === md5($password)) {
                // Fallback to MD5 for legacy passwords
                $passwordValid = true;

                // Upgrade the password to bcrypt
                User::where('id', $user->id)->update([
                    'password' => Hash::make($password)
                ]);
            }

            if (!$passwordValid) {
                return (new Response(array("Error" => INVALID_LOGIN, "Operation" => "login"), 400));
            }

            $auth = new AuthController();
            return array('response' => json_decode($auth->login($user)));

        } catch (Exception $e) {
            return (new Response(array("error" => $e->getMessage(), "Operation" => "login"), 500));
        }
    }

    public function register(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:Users',
            'password' => 'required|min:8|string',
            'role' => 'required'
        ]);

        $name = $request->input('name');
        $email = $request->input('email');
        $password = Hash::make($request->input('password')); // Use bcrypt instead of MD5
        $role = $request->input('role');

        $user = $request->only(["name", "email", "password", "role", "idSlack"]);

        try {
            $user["password"] = $password;
            $image_base= $request->input('image_base');
            if(!empty($image_base)){
                $photoSaved = FileHelper::saveFile($image_base);
                $user['photo'] = $photoSaved;
            }
            $user = User::create($user);
            $id = $user->id;

            if(!empty($id)){
                Weeklyhours::create(array(
                    "idUser" => $id,
                    "userName" => $name,
                    "costHour" => 1,
                    "workLoad" => 40,
                    "currency" => "USD",
                    "borrado" => 0
                ));
            }

            return array("response" => array("status" => REGISTRED, "operation" => "register"));
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "register"), 500));
        }
    }

    public function all(Request $request)
    {
        try {
            return array("response" => json_decode(User::get(['id', 'name'])));
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "all"), 500));
        }
    }

    public function allAdmin(Request $request)
    {
        $role = AuthController::current()->role;

        try {
            $users = new User;

            if($role != "admin"){
                $users = $users->where("role", "!=", "admin");
            }

            $users = $users->get();

            return array("response" => $users);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "all-admin"), 500));
        }
    }

    public function userById(Request $request, $id)
    {

        $request["id"] = $id;

        $this->validate($request, [
            "id" => "exists:Users"
        ]);

        try {
            $user = User::where('id', $id)->first();

            return array("response" => $user);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "user by id"), 500));
        }
    }

    public function current(Request $request)
    {
        $auth_code = $request->header()['authorization'][0];

        $current = AuthController::current();
        $current->token = $auth_code;
        return array('response' => $current);
    }

    public function delete(Request $request)
    {
        $this->validate($request, [
            "id" => "required|exists:Users,id",
        ]);

        $id = $request->input("id");

        try{
            return User::where("id", $id)->update(["status" => 1]);
        }catch (Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "delete"), 500));
        }
    }

    public function undelete(Request $request)
    {
        $this->validate($request, [
            "id" => "required",
        ]);

        $id = $request->input("id");

        try{
            $user = User::where("id", $id)->where("status", 1)->first();

            if(!$user) {
                return (new Response(array("Error" => USER_NOT, "Operation" => "undelete"), 400));
            }

            return User::where("id", $id)->update(["status" => 0]);
        }catch (Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "undelete"), 500));
        }
    }

    public function update(Request $request, $id)
    {
        $request["id"] = $id;
        $this->role = AuthController::current()->role;

        $this->validate($request, [
            "id" => ["required", Rule::exists("Users", "id")->where(function($query) {
                if($this->role != "admin") $query->where("role", "!=", "admin");
            })],
            "email" => "email",
            "password" => "string",
            "role" => "string",
            "name" => "string"
        ]);

        $update = $request->only(['email', 'password', 'name', 'idSlack']);

        if($this->role == "admin") {
            $update["role"] = $request->input('role');
        }

        try{
            $user = User::where('id', $request->id)->first();

            // Only update password if it's provided and different
            if($request->has('password') && !empty($request->input('password'))) {
                $newPassword = $request->input('password');

                $passwordChanged = false;
                // check new psw hashing
                if (Hash::check($newPassword, $user->password)) {
                    $passwordChanged = false;
                // check old psw hashing
                } elseif ($user->password === md5($newPassword)) {
                    $passwordChanged = false;
                } else {
                    $passwordChanged = true;
                }

                if ($passwordChanged) {
                    $update['password'] = Hash::make($newPassword);
                }
            }

            $image_base= $request->input('image_base');
            if(!empty($image_base)){
                $photoSaved = FileHelper::saveFile($image_base);
                $update['photo'] = $photoSaved;
            }

            $user = User::where("id", $id)->update($update);

            return array("response" => $user);
        }catch(Exception $e) {
            return array('response' => 'Update User', "error" => $e->getMessage());
        }
    }

    public function hours(Request $request, $userId)
    {
        try{
            $hours = new UsersHours;
            if($userId != 0) {
                $request["userId"] = $userId;
                $this->validate($request, ["userId" => "required|exists:Users,id"]);

                $hours = $hours->where('user_id', $userId);
            }

            $hours = $hours->get();

            if(count($hours) == 0) {
                return array('response' => 'Error al asignar proyecto');
            }

            return array('response' => $hours);
        }catch(Exception $e) {

        }
    }

    public function currentHours(Request $request)
    {
        $user_id = AuthController::current()->id;

        return $this->hours($request, $user_id);
    }

    public function exceptions(Request $request, $userId, $date)
    {

        $fullDate = explode("-", $date);

		$month = $fullDate[0];
		$year = $fullDate[1];

        try{
            $userExceptions = new UserExceptions;

            if($userId != 0) {
                $request["user_id"] = $userId;
                $this->validate($request, ["user_id" => "required|exists:Users,id"]);

                $userExceptions = $userExceptions->where("user_id", $userId);
            }

            $userExceptions = $userExceptions->whereRaw("MONTH(start) = ?", [$month])
                ->whereRaw("YEAR(start) = ?", [$year])
            ->get();

            return array('response' => $userExceptions);
        }catch(Exception $e){

        }
    }

    public function currentExceptions(Request $request, $date)
    {
        $user_id = AuthController::current()->id;

        return $this->exceptions($request, $user_id, $date);
    }

    public function createException(Request $request, $id, $date)
    {
        try {
            //Delete older exception
            UserExceptions::where('user_id', '=', $id)
                ->whereRaw('DAY(start) = DAY(?) AND Month(start) = Month(?) AND Year(start) = Year(?)', [$date, $date, $date])
                ->delete();

            $payload = $request->all();

            foreach ($payload as $param) {
                if($param) {
                    UserExceptions::create(array(
                        'user_id' => $param['user_id'],
                        'day' => $param['day'],
                        'title' => $param['title'],
                        'start' => $param['start'],
                        'end'  => $param['end']
                    ));
                }
            };

            return array("response" => array("status" => REGISTRED, "operation" => "createException"));

        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "createException"), 500));
        }
    }

    public function upsertFixed(Request $request, $id) {
        {
            try {
                $payload = $request->all();
                UsersHours::where('user_id', '=', $id)->delete();

                foreach ($payload as $days) {
                    if(!empty($days['horarios'])) {
                        foreach($days['horarios'] as $hour) {
                            UsersHours::create(array(
                                'user_id' => $days['user_id'],
                                'day' => $days['name'],
                                'start' => $hour['desde'],
                                'end'  => $hour['hasta']
                            ));
                        }
                    }
                };

                return array("response" => array("status" => REGISTRED, "operation" => "upsertFixed"));

            } catch (Exception $e) {
                return (new Response(array("Error" => BAD_REQUEST, "Operation" => "upsertFixed", "message"=> $e->getMessage()), 500));
            }
        }
    }
}
