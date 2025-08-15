<?php

namespace App\Http\Controllers;

use App\Models\CostHour;
use Laravel\Lumen\Routing\Controller as BaseController;
use App\Models\Tracks;
use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Response;
use App\Models\TrelloTasks;
use App\Models\Tasks;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Weeklyhours;
use Illuminate\Support\Carbon;

class TracksController extends BaseController
{
    //Function all nao retorna uma em especifico somente a do usuario selecionado pelo id
    public function all(Request $request, $id = null)
    {
        $this->validate($request, [
            "startTime" => "required",
            "endTime" => "required"
        ]);

        $startTime = $request->input("startTime");
        $endTime = $request->input("endTime");

        $startTime = date('Y-m-d H:i:s',date(strtotime($startTime)));
        $endTime = date('Y-m-d H:i:s',date(strtotime($endTime)));

        $user_id = $id;
        $client_id = $request->input("idClient") ? $request->input("idClient") : null;
        $project_id = $request->input("idProject") ? $request->input("idProject") : null;


        try {
            $tracks = Tracks::select(
                "Tracks.*",
                DB::raw("Projects.name AS projectName"),
                DB::raw("WeeklyHours.costHour"),
                DB::raw("Tasks.name AS taskName"),
                DB::raw("Users.name AS userName"),
                DB::raw("Users.photo"),
                DB::raw("Clients.name AS clientName"),
                DB::raw("TIMEDIFF(Tracks.endTime, Tracks.startTime) AS duration")
            )
                ->join("Tasks", DB::raw("Tracks.idTask"), "=", DB::raw("Tasks.id"))
                ->join("Users", DB::raw("Tracks.idUser"), "=", DB::raw("Users.id"))
                ->join("Projects", DB::raw("Projects.id"), "=", DB::raw("Tasks.idProject"))
                ->join("Clients", DB::raw("Clients.id"), "=", DB::raw("Projects.idClient"))
                ->join("WeeklyHours", "WeeklyHours.idUser", "=", "Tracks.idUser")
                ->whereRaw("(Tracks.startTime >= ?)", [$startTime])
                ->whereRaw("(Tracks.endTime <= ?)", [$endTime])
                ->whereRaw("(Tracks.typeTrack = ?)", ['manual'])
                ->whereRaw("(Tasks.active >= ?)", [1]);

            if (!empty($user_id)) {
                $tracks = $tracks->whereRaw("(Tracks.idUser) = ?", [$user_id]);
                if (!empty($client_id)) {
                    $tracks = $tracks->whereRaw("(Projects.idClient) = ?", [$client_id]);

                    if (!empty($project_id)) {
                        $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();

                        $tracks = $this->calcCosto($tracks);

                        return array("response" => $tracks);
                    }

                    $tracks = $tracks->get();

                    $tracks = $this->calcCosto($tracks);

                    return array("response" => $tracks);
                }

                if (!empty($project_id)) {
                    $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();

                    $tracks = $this->calcCosto($tracks);

                    return array("response" => $tracks);
                }

                $tracks = $tracks->get();

                $tracks = $this->calcCosto($tracks);

                return array("response" => $tracks);
            }

            if (!empty($client_id)) {
                $tracks = $tracks->whereRaw("(Projects.idClient) = ?", [$client_id]);

                if (!empty($project_id)) {
                    $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();
                    $tracks = $this->calcCosto($tracks);

                    return array("response" => $tracks);
                }

                $tracks = $tracks->get();
                $tracks = $this->calcCosto($tracks);

                return array("response" => $tracks);
            }

            if (!empty($project_id)) {
                $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();
            }

            $tracks = $tracks->get();
            $tracks = $this->calcCosto($tracks);

            return array("response" => $tracks);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tracks all"), 500));
        }
    }

    public function current(Request $request)
    {

        $this->validate($request, [
            "startTime" => "string",
            "endTime" => "string",
        ]);

        $user_id = AuthController::current()->id;

        return $this->all($request, $user_id);
    }

    public function duracionDiff($start, $end)
    {
        $date1 = new \DateTime($start); //2022-02-04 15:21:19
        $date2 = new \DateTime($end);

        return $date2->diff($date1, true)->format("%H:%I:%S");;
    }

    public function new(Request $request)
    {

        $user_id = AuthController::current()->id;

        if(!empty($user_id)){
            $request["currency"] = Weeklyhours::select("currency")->where("idUser", $user_id)->limit(1)->first()->currency;
        }

        $this->validate($request, [
            "currency" => "required",
            "idProyecto" => "required|numeric|exists:Projects,id",
            "idTask" => "required|numeric",
            "idUser" => "required|numeric|exists:Users,id",
            "name" => "required",
            "startTime" => "required|date",
            "typeTrack" => "required",
        ]);

        $idTask = $request->input("idTask");
        $currency = $request->input("currency");
        $idProyecto = $request->input("idProyecto");
        $idUser = $request->input("idUser");
        $name = $request->input("name");
        $startTime = $request->input("startTime");
        $endTime = $request->input("endTime");
        $typeTrack = $request->input("typeTrack");

        try {
            if ($typeTrack == "manual") {
                $task_manual = Tasks::where('id', $idTask)->get();

                if (!$task_manual) {
                    $task_trello = TrelloTasks::where('id', $idTask)->get();

                    if (!$task_trello) {
                        return (new Response(array("Error" => TASK_INVALID, "Operation" => "tracks new"), 500));
                    }
                }
            }

            $track = $this->arrayTracks($currency, $idProyecto, $idTask, $idUser, $name, $startTime, $typeTrack, $endTime);

            return array("response" => array(Tracks::create($track)));
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tracks new"), 500));
        }
    }

    public function update(Request $request, $idUser = null)
    {
        if(!empty($idUser)) {
            $request["idUser"] = $idUser;
        }

        $this->validate($request, [
            "duracion" => "regex:/(\d+\:\d+)/",
            "endTime" => "required|date",
            "startTime" => "required|date",
            "id" => "required|numeric",
            "idUser" => "required|exists:Users,id"
        ]);

        $endTime = $request->input("endTime");
        $startTime = $request->input("startTime");
        $id = $request->input("id");
        $idUser = $request->input("idUser");

        $duracion = $this->duracionDiff($startTime, $endTime);

        try {
            $trackWhere = Tracks::select(
                DB::raw("Tracks.*"),
                DB::raw("TIMEDIFF(Tracks.endTime, Tracks.startTime) AS duration"),
                DB::raw("WeeklyHours.costHour")
            )
                ->join("WeeklyHours", "WeeklyHours.idUser", "=", "Tracks.idUser")
                ->whereRaw("Tracks.id = ?", [$id])
                ->whereRaw("Tracks.idUser = ?", [$idUser])
                ->get();

            if(count($trackWhere) > 0){
                $trackWhere[0]->duration = $duracion;
                $trackCost = $this->calcCosto($trackWhere)[0]->trackCost;
            }else{
                $trackCost =0;
            }

            $update = empty($duracion) ?
                ["endTime" => $endTime, "startTime" => $startTime, "trackCost" => $trackCost] :
                ["duracion" => 0, "endTime" => $endTime, "startTime" => $startTime, "trackCost" => $trackCost];

            Tracks::where("id", $id)->update($update);
            $track = Tracks::where("id", $id)->get();

            return array("response" => $track);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "track update"), 500));
        }
    }

    public function arrayTracks($currency, $idProyecto, $idTask, $idUser, $name, $startTime, $typeTrack, $endTime)
    {
        $result = array(
            "currency" => $currency,
            "idProyecto" => $idProyecto,
            "idTask" => $idTask,
            "idUser" => $idUser,
            "name" => $name,
            "startTime" => $startTime,
            "typeTrack" => $typeTrack
        );

        if($endTime) {
            $result['endTime'] = $endTime;
        }

        return $result;
    }

    public function currentUserLastTrack()
    {
        $user_id = AuthController::current()->id;


            $tracks = Tracks::whereRaw('Tracks.idUser = ?', [$user_id])
                ->orderBy("Tracks.id", 'DESC')->limit(1)
                ->first();

            if(empty($tracks)){
                return $tracks;
            }

            $handler = array(
                "trello" => function ($user_id) {
                    return Tracks::select(
                        DB::raw("Tracks.*"),
                        DB::raw("Projects.name AS projectName"),
                        DB::raw("TrelloTask.name AS taskName"),
                        DB::raw("Users.name AS userName"),
                        DB::raw("Users.photo"),
                        DB::raw("TIMEDIFF( Tracks.endTime, Tracks.startTime ) AS duration")
                    )
                        ->join("TrelloTask", "Tracks.idTask", "=", "TrelloTask.id")
                        ->join("Users", "Tracks.idUser", "=", "Users.id")
                        ->join("Projects", "Projects.id", "=", "TrelloTask.idProyecto")
                        ->whereRaw("Tracks.idUser = ?", [$user_id])
                        ->whereRaw("TrelloTask.active = ?", [1])
                        ->orderBy("Tracks.id", "DESC")
                        ->limit(1)
                        ->first();
                },
                "manual" => function ($user_id) {
                    return Tracks::select(
                        DB::raw("Tracks.*"),
                        DB::raw("Projects.name AS projectName"),
                        DB::raw("Tasks.name AS taskName"),
                        DB::raw("Users.name AS userName"),
                        DB::raw("Users.photo"),
                        DB::raw("TIMEDIFF( Tracks.endTime, Tracks.startTime ) AS duration")
                    )
                        ->join("Tasks", "Tracks.idTask", "=", "Tasks.id")
                        ->join("Users", "Tracks.idUser", "=", "Users.id")
                        ->join("Projects", "Projects.id", "=", "Tasks.idProject")
                        ->whereRaw("Tracks.idUser = ?", [$user_id])
                        ->whereRaw("Tasks.active = ?", [1])
                        ->orderBy("Tracks.id", "DESC")
                        ->limit(1)
                        ->first();
                }
            );

            return array("response" => $handler[$tracks["typeTrack"]]($user_id));
    }

    public function calendar(Request $request, $id, $fecha)
    {
        try {
            $calendar = Tracks::select("id AS id_track", "name AS title", "startTime AS start", "endTime AS end");

            if($id != 0) {
                $request["id"] = $id;
                $this->validate($request, ["id" => "required|exists:Users,id"]);

                $calendar = $calendar->where("idUser", $id);
            }

            $calendar = $calendar->whereRaw("Month(startTime) = Month(?)", [$fecha])
                ->whereRaw("Year(startTime) = Year(?)", [$fecha])
            ->get();

            return array("response" => $calendar);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tracks current calendar"), 500));
        }
    }

    public function currentCalendar(Request $request, $fecha)
    {
        $user_id = AuthController::current()->id;

        return $this->calendar($request, $user_id, $fecha);
    }

    public function month(Request $request, $id) {
        $this->validate($request, [
            "idMonth" => "required|numeric",
            "year" => "required|numeric"
        ]);

        $user_id = $id;
        $idMonth = $request->input("idMonth");
        $year = $request->input("year");

        try {
            $tracks = DB::select("SELECT SUM(trackCost) AS salary FROM Tracks WHERE month(endTime) = $idMonth AND year(endTime) = $year AND Tracks.idUser = $user_id AND Tracks.trackCost IS NOT NULL");
            $tracks[0]->salary = $tracks[0]->salary == null ? 0 : $tracks[0]->salary;

            return array('response' => $tracks);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tracks current calendar"), 500));
        }
    }

    public function currentMonth(Request $request)
    {
        $user_id = AuthController::current()->id;
        return $this->month($request, $user_id);
    }

    public function trelloTracks(Request $request, $id = null)
    {
        try {
            $user_id = $id;
            $client_id = $request->input("idClient") ? $request->input("idClient") : null;
            $project_id = $request->input("idProject") ? $request->input("idProject") : null;

            $startTime = $request->input("startTime");
            $endTime = $request->input("endTime");

            $tracks = Tracks::select(
                "Tracks.id",
                "Tracks.idTask",
                "Tracks.idUser",
                "Tracks.name",
                "Tracks.typeTrack",
                "Tracks.currency",
                "Tracks.idProyecto",
                "Tracks.duracion",
                "Tracks.startTime",
                "Tracks.endTime",
                DB::raw("WeeklyHours.costHour AS costHour"),
                DB::raw("Users.name AS usersName"),
                DB::raw("Users.photo"),
                DB::raw("TrelloTask.name AS taskName"),
                DB::raw("TrelloTask.project AS projectName"),
                DB::raw("Clients.name AS client"),
                DB::raw("TIMEDIFF( Tracks.endTime, Tracks.startTime ) AS durations")
            )
                ->join("Users", DB::raw("Tracks.idUser"), "=", DB::raw("Users.id"))
                ->join("TrelloTask", DB::raw("Tracks.idTask"), "=", DB::raw("TrelloTask.id"))
                ->join("Projects", DB::raw("Projects.id"), "=", DB::raw("TrelloTask.idProyecto"))
                ->join("Clients", DB::raw("Clients.id"), "=", DB::raw("Projects.idClient"))
                ->join("WeeklyHours", "WeeklyHours.idUser", "=", "Tracks.idUser")
                ->where("startTime", ">=", $startTime)
                ->where("endTime", "<=", $endTime)
                ->where("typeTrack", "trello")
                ->whereRaw("TrelloTask.active = 1");

            if (!empty($user_id)) {
                $tracks = $tracks->where("Tracks.idUser", $user_id);

                if (!empty($client_id)) {
                    $tracks = $tracks->whereRaw("(Projects.idClient) = ?", [$client_id]);

                    if (!empty($project_id)) {
                        $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();

                        $tracks = $this->calcCosto($tracks);

                        return array("response" => $tracks);
                    }

                    $tracks = $tracks->get();
                    $tracks = $this->calcCosto($tracks);

                    return array("response" => $tracks);
                }

                if (!empty($project_id)) {
                    $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();

                    $tracks = $this->calcCosto($tracks);

                    return array("response" => $tracks);
                }

                $tracks = $tracks->get();
                $tracks = $this->calcCosto($tracks);

                return array("response" => $tracks);
            }

            if (!empty($client_id)) {
                $tracks = $tracks->whereRaw("(Projects.idClient) = ?", [$client_id]);

                if (!empty($project_id)) {
                    $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();

                    $tracks = $this->calcCosto($tracks);

                    return array("response" => $tracks);
                }

                $tracks = $tracks->get();

                $tracks = $this->calcCosto($tracks);

                return array("response" => $tracks);
            }

            if (!empty($project_id)) {
                $tracks = $tracks->whereRaw("(Projects.id) = ?", [$project_id])->get();

                $tracks = $this->calcCosto($tracks);

                return array("response" => $tracks);
            }

            $tracks = $tracks->get();
            $tracks = $this->calcCosto($tracks);

            return array("response" => $tracks);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "tracks trello"), 500));
        }
    }

    public function trelloTracksCurrent(Request $request)
    {
        $user_id = AuthController::current()->id;

        return $this->trelloTracks($request, $user_id);
    }

    public function convertTimeToDecimal($value)
    {
        $time = explode(":", $value);
        $horas = floatval($time[0]);
        $minutes = floatval($time[1]) / 60;
        $seconds = floatval($time[2]) / 3600;
        $fraccionaria = $minutes + $seconds;
        $decimal = floatval($horas + $fraccionaria);
        return $decimal;
    }

    public function calcCosto($tracks)
    {
        foreach ($tracks as $track) {
            $cost = $track['costHour'];
            $costDecimal = $this->ConvertTimeToDecimal($track['durations'] ? $track['durations'] : $track['duration']);
            $track['trackCost'] = round(round(($costDecimal * ($cost)), 2) ? round(($costDecimal * ($cost)), 2) : 0);
        }

        return $tracks;
    }

    public function endlessTracks(Request $request)
    {
        try {
            $endTime = date('Y-m-d H:i:s');
            $limitTime = date('Y-m-d H:i:s', strtotime('-24 hours'));
            $tracks = Tracks::whereRaw("Tracks.endTime IS NULL")
            ->whereRaw("Tracks.startTime < ?", [$limitTime])
            ->update(['endTime'=>$endTime]);

            $endlessManual = Tracks::select(
                    "Tracks.*",
                    DB::raw("Projects.name AS projectName"),
                    DB::raw("Tasks.name AS taskName"),
                    DB::raw("Users.name AS userName"),
                    DB::raw("Users.photo"),
                    DB::raw("TIMEDIFF( Tracks.endTime, Tracks.startTime ) AS duration")
                )->join("Tasks", "Tracks.idTask", "=", "Tasks.id")
                ->join("Users", "Tracks.idUser", "=", "Users.id")
                ->join("Projects", "Projects.id", "=", "Tasks.idProject")
                ->whereRaw("endTime IS NULL")
                #->orWhereRaw("Tracks.endTime = ?", ["0000-00-00 00:00:00"])
                ->whereRaw("Tasks.active = ?", [1])
                ->whereRaw("Tracks.typeTrack = ?", ["manual"])
            ->get();

            $endlessTrello = Tracks::select(
                    "Tracks.*",
                    DB::raw("Projects.name AS projectName"),
                    DB::raw("TrelloTask.id_project AS TrelloProyect"),
                    DB::raw("TrelloTask.name AS taskName"),
                    DB::raw("Users.name AS userName"),
                    DB::raw("Users.photo"),
                    DB::raw("TIMEDIFF( Tracks.endTime, Tracks.startTime ) AS duration")
                )->join("TrelloTask", "Tracks.idTask", "=", "TrelloTask.id")
                ->join("Users", "Tracks.idUser", "=", "Users.id")
                ->join("Projects", "Projects.id", "=", "TrelloTask.id_project")
                ->whereRaw("endTime IS NULL")
                #->orWhereRaw("Tracks.endTime = ?", ["0000-00-00 00:00:00"])
                ->whereRaw("TrelloTask.active = ?", [1])
                ->whereRaw("Tracks.typeTrack = ?", ["trello"])
            ->get();

            $endless = array();

            foreach ($endlessTrello as $value) {
                array_push($endless, $value);
            }

            foreach ($endlessManual as $value) {
                array_push($endless, $value);
            }

            return array("response" => $endless);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "endless tracks"), 500));
        }
    }

    public function currentUpdate(Request $request)
    {
        $user_id = AuthController::current()->id;

        return $this->update($request, $user_id);
    }

    public function historyByUser(Request $request)
    {
        $user_id = AuthController::current()->id;
        $tracksHistory = Tracks::select(
            "Tracks.*",
            DB::raw("
                (CASE
                    WHEN Tracks.typeTrack='trello' THEN TrelloTask.project
                    ELSE Projects.name
                END) as projectName"),
            DB::raw("
                (CASE
                    WHEN Tracks.typeTrack='trello' THEN TrelloTask.idProyecto
                    ELSE Tasks.idProject
                END) as projectId"),
            DB::raw("
                (CASE
                    WHEN Tracks.typeTrack='trello' THEN TrelloTask.name
                    ELSE Tasks.name
                END) as taskName"),
            DB::raw("
                (CASE
                    WHEN Tracks.typeTrack='trello' THEN TrelloTask.status
                    ELSE Tasks.status
                END) as status"),
            DB::raw("Users.name AS userName"),
            DB::raw("Users.photo"),
            DB::raw("TIMEDIFF( Tracks.endTime, Tracks.startTime ) AS duration")
        )
        ->leftJoin("Tasks", function($join) {
            $join
                ->on("Tracks.idTask", "=", "Tasks.id")
                ->where('Tasks.active', '=', 1);
        })
        ->leftJoin("TrelloTask", "Tracks.idTask", "=", "TrelloTask.id")
        ->join("Users", "Tracks.idUser", "=", "Users.id")
        ->join("Projects", function($join) {
            $join
                ->on('Projects.id', '=', 'Tasks.idProject')
                ->orOn('Projects.id', '=', 'Tracks.idProyecto');
        })
        ->whereRaw("Tracks.idUser = ?", $user_id)
        ->orderBy("Tracks.id", "DESC")
        ->distinct("Tracks.idTask")
        ->limit(20)
        ->get();

        return array("response" => $tracksHistory);
    }
}
