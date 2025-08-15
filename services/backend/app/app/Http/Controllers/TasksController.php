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
                ->whereRaw('Projects.active = ?', 1)
                ->orderBy("Tasks.id", "DESC");

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
                                // var_dump($value);
                                $tasks = $tasks->whereRaw("Tasks.description LIKE ?", "%$value%");
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

            $response = Tasks::join('Projects', 'Tasks.idProject', '=', 'Projects.id')->select('Tasks.*', 'Projects.name as projectName')->where('idProject', $id)->get();
            return array('response' => $response);
        }catch(Exception $e){
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks projecs id"), 500));
        }
    }

    public function delete(Request $request)
    {
        $this->validate($request, ["id" => "required"]);

        $id = $request->input("id");

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
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tasks undelete id invalid"), 500));
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
            return Tasks::where('id', $id)->update($task);
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

        $task = $request->only(["name", "idProject", "comments", "duration", "users", "status", "startDate", "endDate", "description"]);
        $task["users"] = json_encode($task["users"]);

        try {
            $task = Tasks::create($task);

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
				if($keyName == "projectName"){
					$filter .= " AND Projects.name LIKE '%".$value[$keyName]."%'";
				}else if($keyName == "name"){
					$filter .= " AND Tasks.name LIKE '%".$value[$keyName]."%'";
				}
				else if($keyName == "description"){
					$filter .= " AND Tasks.description LIKE '%".$value[$keyName]."%'";
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
