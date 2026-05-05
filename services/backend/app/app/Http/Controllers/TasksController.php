<?php

namespace App\Http\Controllers;

use Exception;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Tasks;
use Illuminate\Support\Facades\DB;

class TasksController extends BaseController
{
    public function all(Request $request, $id = null)
    {
        $request["id"] = $id;

        $this->validate($request, [
            "filter" => "array",
            "limit" => "numeric",
            "offset" => "numeric",
        ]);

        $offset = $request->input("offset");
        $limit = $request->input("limit");
        $filters = $request->input("filter");

        try {
            $tasks = Tasks::join('Projects', 'Tasks.idProject', '=', 'Projects.id')
                ->select(
                    'Tasks.id',
                    'Tasks.idProject',
                    'Tasks.name',
                    'Tasks.description',
                    'Tasks.comments',
                    'Tasks.duration',
                    'Tasks.type',
                    'Tasks.status',
                    'Tasks.active',
                    'Tasks.startDate',
                    'Tasks.endDate',
                    'Projects.name as projectName'
                )
                ->selectRaw('IFNULL(Tasks.users, "[]") AS users')
                ->whereRaw('Projects.active = ?', 1);

            $user = AuthController::current();
            if ($user && $user->role != 'admin' && $user->role != 'pm') {
                $tasks->where('Tasks.users', 'LIKE', '%{"idUser":"' . $user->id . '"}%');
            }

            $tasks->orderBy("Tasks.id", "DESC");

            $count = Tasks::select("*");

            $tasks = $tasks->offset(empty($offset) ? 0 : $offset);
            $tasks = $tasks->limit(empty($limit) ? 15 : $limit);
            if(!empty($filters)){
                if (count($filters) > 0) {
                    foreach ($filters as $filter) {

                        $key = array_keys($filter)[0];
                        $value = $filter[$key];

                        switch ($key) {
                            case "projectName":
                                $tasks = $tasks->whereRaw("Projects.name LIKE ?", "%$value%");
                                break;
                            case "name":
                                $tasks = $tasks->whereRaw("Tasks.name LIKE ?", "%$value%");
                                break;
                            case "description":
                                $tasks = $tasks->whereRaw("Tasks.description LIKE ?", "%$value%");
                                break;
                            case "status":
                                $tasks = $tasks->whereRaw("Tasks.status = ?", $value);
                                break;
                            case "active":
                                $tasks = $tasks->whereRaw("Tasks.active = ?", $value);
                                break;
                        }
                    }
                }
            }

            if (!empty($id)) {
                $this->validate($request, ["id" => "numeric|exists:Tasks,id"]);
                $tasks = $tasks->whereRaw("Tasks.id = ?", $id);
                $count = $count->whereRaw("Tasks.id = ?", $id);
                $task = $tasks->first();
                return array("response" => $task);
            }

            $tasks = $tasks->get();
            $count = $count->get();

            $countTasks = strval(count($count));

            return array("response" => array(
                "count" => "$countTasks",
                "task" => $tasks
            ));
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "Tasks all"), 500));
        }
    }

    public function project($id)
    {
        try {
            if (empty($id)) {
                return (new Response(array("Error" => ID_INVALID, "Operation" => "tasks projecs id"), 500));
            }

            $user = AuthController::current();
            $query = Tasks::join('Projects', 'Tasks.idProject', '=', 'Projects.id')
                ->select('Tasks.*', 'Projects.name as projectName')
                ->where('idProject', $id);

            // Security check: non-admins only see tasks assigned to them
            if ($user->role !== 'admin' && $user->role !== 'pm') {
                $model_like = '%{"idUser":"' . $user->id . '"}%';
                $query->where('Tasks.users', 'LIKE', $model_like);
            }

            $response = $query->get();
            return array('response' => $response);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks projecs id"), 500));
        }
    }

    public function delete(Request $request, $id = null)
    {
        if (!$id) {
            $id = $request->input("id");
        }

        $this->validate($request, ["id" => "numeric"]);

        try {
            $tasks = Tasks::where('id', $id)->where('active', 1)->first();

            if (!$tasks) {
                return (new Response(array("Error" => ID_INVALID, "Operation" => "tasks delete id invalid"), 500));
            }

            return Tasks::where('id', $id)->update(["active" => 0]);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks delete id invalid"), 500));
        }
    }

    public function undelete(Request $request)
    {
        $this->validate($request, ["id" => "required"]);

        $id = $request->input("id");

        try {
            $tasks = Tasks::where('id', $id)->where('active', 0)->first();

            if (!$tasks) {
                return (new Response(array("Error" => ID_INVALID, "Operation" => "tasks undelete id invalid"), 500));
            }

            return Tasks::where('id', $id)->update(["active" => 1]);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks undelete id invalid"), 500));
        }
    }

    public function userId($id, Request $request)
    {

        $request["id"] = $id;

        $this->validate($request, [
            "filter" => "array",
            "limit" => "numeric",
            "offset" => "numeric",
            "id" => "exists:Users"
        ]);

        $offset = $request->input("offset");
        $limit = $request->input("limit");
        $filters = $request->input("filter");

        try{
            $model_like = '%{"idUser":"'.$id.'"}%'; //LIKE TO JSON USERS
            $tasks = Tasks::join('Projects', 'Tasks.idProject', '=', 'Projects.id')->select('Tasks.*', 'Projects.name as projectName');

            $tasks = $tasks->offset(empty($offset) ? 0 : $offset);
            $tasks = $tasks->limit(empty($limit) ? 15 : $limit);

            if (count($filters) > 0) {
                foreach ($filters as $filter) {
                    $key = array_keys($filter)[0];
                    $value = $filter[$key];

                        switch ($key) {
                            case "projectName":
                                $tasks = $tasks->whereRaw("Projects.name LIKE ?", "%$value%");
                                break;
                            case "name":
                                $tasks = $tasks->whereRaw("Tasks.name LIKE ?", "%$value%");
                                break;
                            case "description":
                                $tasks = $tasks->whereRaw("Tasks.description LIKE ?", "%$value%");
                                break;
                            case "status":
                                $tasks = $tasks->whereRaw("Tasks.status = ?", $value);
                                break;
                            case "active":
                                $tasks = $tasks->whereRaw("Tasks.active = ?", $value);
                                break;
                        }
                    }
                }

            $tasks = $tasks->where('users', 'LIKE', $model_like)->get();
            $countTasks = strval(count($tasks));

            return array("response" => array(
                "count" => $countTasks,
                "task" => $tasks
            ));
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks userId error"), 500));
        }
    }

    public function currentUser(Request $request)
    {
        $user_id = AuthController::current()->id;

        if (!$user_id) {
            return (new Response(array("Error" => ID_INVALID, "Operation" => "tasks current user id"), 500));
        }

        return $this->userId($user_id, $request);
    }

    public function update(Request $request)
    {
        $this->validate($request, [
            "name" => "required|string",
            "idProject" => "required|numeric|exists:Projects,id",
            "comments" => "string|string",
            "duration" => "required|string|",
            "users" => "array",
            "status" => "required|string",
            "id" => "required|exists:Tasks,id"
        ]);

        $id = $request->input("id");
        $task = $request->only(["name", "idProject", "comments", "duration", "users", "status", "description"]);

        try {
            Tasks::where('id', $id)->update($task);
            $updatedTask = Tasks::where('id', $id)->first();
            return array("response" => $updatedTask);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks update"), 500));
        }
    }

    public function create(Request $request)
    {
        $startDate = $request->input("startDate");
        $endDate = $request->input("endDate");

        $request["startDate"] = explode("T", $startDate)[0];
        $request["endDate"] = explode("T", $endDate)[0];

        $this->validate($request, [
            "name" => "required|string",
            "idProject" => "required|numeric|exists:Projects,id",
            "comments" => "string",
            "duration" => "required|string",
            "users" => "array",
            "status" => "required|string",
            "startDate" => "required|date_format:Y-m-d",
            "endDate" => "required|date_format:Y-m-d|after:startDate"
        ]);

        $taskData = $request->only(["name", "idProject", "comments", "duration", "users", "status", "startDate", "endDate", "description"]);
        
        $user = AuthController::current();
        if ($user->role != 'admin' && $user->role != 'pm') {
            // Check if user is assigned to this project (has at least one task in it)
            $projectAssigned = Tasks::where('idProject', $taskData['idProject'])
                ->where('users', 'LIKE', '%{"idUser":"' . $user->id . '"}%')
                ->exists();
            
            if (!$projectAssigned) {
                return (new Response(array("Error" => "Unauthorized: You are not assigned to this project"), 403));
            }

            // Force assignment to current user for non-admin/pm
            $taskData["users"] = [
                [
                    "idUser" => (string)$user->id,
                    "idTask" => 0,
                    "nameUser" => $user->name
                ]
            ];
        } else {
            // Normalize users format for admin/pm if they provide it
            if (isset($taskData["users"]) && is_array($taskData["users"])) {
                $normalizedUsers = [];
                foreach ($taskData["users"] as $u) {
                    $normalizedUsers[] = [
                        "idUser" => (string)($u['idUser'] ?? $u['id'] ?? ''),
                        "idTask" => 0,
                        "nameUser" => $u['nameUser'] ?? $u['name'] ?? ''
                    ];
                }
                $taskData["users"] = $normalizedUsers;
            }
        }

        $taskData["users"] = json_encode($taskData["users"] ?? []);

        try {
            $task = Tasks::create($taskData);

            return array("response" => $task);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks create invalid"), 500));
        }
    }

    public function getTasksByUserFilter(Request $request, $idUser)
    {
		$filter = "";
        $limit  = $request->input('limit');
        $offset  = $request->input('offset');
        $filter_params  = $request->input('filter');
        $user = '%{"idUser":"'.$idUser.'"}%';

        // Filters
        if (count($filter_params) > 0) {
			foreach ($filter_params as $key => $value) {
				$keyName = array_keys($filter_params[$key])[0];
                $val = $filter_params[$key][$keyName];
				if($keyName == "projectName"){
					$filter .= " AND Projects.name LIKE '%".$val."%'";
				}else if($keyName == "name"){
					$filter .= " AND Tasks.name LIKE '%".$val."%'";
				}
				else if($keyName == "description"){
					$filter .= " AND Tasks.description LIKE '%".$val."%'";
				}
                else if($keyName == "status"){
                    $filter .= " AND Tasks.status = '".$val."'";
                }
                else if($keyName == "active"){
                    $filter .= " AND Tasks.active = ".$val;
                }
			}
		}

        $d = Tasks::join('Projects', 'Tasks.idProject', '=', 'Projects.id')
            ->select('Tasks.*', 'Projects.name AS projectName')
            ->where("Tasks.users", 'LIKE', $user)
            ->where('Projects.active', '=', 1)
            ->where("Tasks.active", '=', 1)
            ->orderByRaw("projectName");

        if(!empty($filter)) {
            $d->whereRaw($filter);
        }

        $d_count = $d->get();

        if (!empty($offset) && isset($offset)) {
            $d->offset($offset);
        }
        if (!empty($limit) && isset($limit)) {
            $d->limit($limit);
        }

        $d = $d->get();

		// CALLBACK
		if(!empty($d)){
			return (new Response(array("response" => array("task"=>$d, "count"=>count($d_count)))));
		} else {
			return (new Response(array("Error" => "Error: no existen tareas.")));
		}
    }
}
