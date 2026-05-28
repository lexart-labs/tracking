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

        $startTime = date('Y-m-d H:i:s', strtotime($startTime));
        $endTime = date('Y-m-d H:i:s', strtotime($endTime));

        $user_id = $id;
        $client_id = $request->input("idClient") ? $request->input("idClient") : null;
        $project_id = $request->input("idProject") ? $request->input("idProject") : null;


        try {
            $tracks = Tracks::select(
                "Tracks.*",
                DB::raw("Projects.name AS projectName"),
                DB::raw("COALESCE(wh.costHour, (SELECT wh2.costHour FROM WeeklyHours wh2 WHERE wh2.idUser = Tracks.idUser AND wh2.valid_from <= DATE(Tracks.startTime) AND (wh2.valid_until IS NULL OR wh2.valid_until >= DATE(Tracks.startTime)) ORDER BY wh2.valid_from DESC LIMIT 1), (SELECT wh3.costHour FROM WeeklyHours wh3 WHERE wh3.idUser = Tracks.idUser AND wh3.borrado = '0' ORDER BY wh3.valid_from DESC LIMIT 1)) AS costHour"),
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
                ->leftJoin("WeeklyHours AS wh", "wh.id", "=", "Tracks.idWeeklyHour")
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
            $startDate = date('Y-m-d', strtotime($request->input("startTime") ?? 'now'));
            $weeklyHour = Weeklyhours::forDate($user_id, $startDate);
            $request["currency"] = $weeklyHour ? $weeklyHour->currency : 'USD';
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
        $trackCost = null;

        try {
            if ($typeTrack == "trello") {
                $task = TrelloTasks::where('id', $idTask)->first();
            } else {
                $task = Tasks::where('id', $idTask)->first();
                if (!$task) {
                    $task = TrelloTasks::where('id', $idTask)->first();
                }
            }

            if (!$task) {
                return (new Response(array("Error" => "TASK_INVALID", "Operation" => "tracks new"), 500));
            }

            if (isset($task->active) && $task->active < 1) {
                return (new Response(array("Error" => "TASK_INACTIVE", "Operation" => "tracks new"), 403));
            }

            $startDate = date('Y-m-d', strtotime($startTime));
            $weeklyHourRecord = Weeklyhours::forDate((int)$idUser, $startDate);

            $track = $this->arrayTracks($currency, $idProyecto, $idTask, $idUser, $name, $startTime, $typeTrack, $endTime);

            if ($weeklyHourRecord) {
                $track['idWeeklyHour'] = $weeklyHourRecord->id;
            }

            // Calculate track cost if endTime is provided
            if (!empty($endTime) && $weeklyHourRecord) {
                $duracion = $this->duracionDiff($startTime, $endTime);
                $costHour = $weeklyHourRecord->costHour;
                if ($costHour && $duracion) {
                    $timeParts = explode(':', $duracion);
                    $hours = (int)$timeParts[0];
                    $minutes = (int)$timeParts[1];
                    $seconds = (int)$timeParts[2];
                    $totalHours = $hours + ($minutes / 60) + ($seconds / 3600);
                    $track['trackCost'] = round($totalHours * $costHour, 2);
                }
            }

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
        $fromReports = $request->input("trace") === "reports";

        try {
            if ($fromReports) {
                $existingTrack = Tracks::where("id", $id)->first();
                $weeklyHourRecord = ($existingTrack && $existingTrack->idWeeklyHour)
                    ? Weeklyhours::find($existingTrack->idWeeklyHour)
                    : null;
            } else {
                $startDate = date('Y-m-d', strtotime($startTime));
                $weeklyHourRecord = Weeklyhours::forDate((int)$idUser, $startDate);
            }

            $costHour = $weeklyHourRecord ? $weeklyHourRecord->costHour : null;

            $trackCost = 0;
            if ($costHour && $duracion) {
                $timeParts = explode(':', $duracion);
                $hours = (int)$timeParts[0];
                $minutes = isset($timeParts[1]) ? (int)$timeParts[1] : 0;
                $seconds = isset($timeParts[2]) ? (int)$timeParts[2] : 0;
                $totalHours = $hours + ($minutes / 60) + ($seconds / 3600);
                $trackCost = round($totalHours * $costHour, 2);
            }

            $update = empty($duracion)
                ? ["endTime" => $endTime, "startTime" => $startTime, "trackCost" => $trackCost]
                : ["duracion" => 0, "endTime" => $endTime, "startTime" => $startTime, "trackCost" => $trackCost];

            if (!$fromReports) {
                $update["idWeeklyHour"] = $weeklyHourRecord ? $weeklyHourRecord->id : null;
            }

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
                DB::raw("COALESCE(wh.costHour, (SELECT wh2.costHour FROM WeeklyHours wh2 WHERE wh2.idUser = Tracks.idUser AND wh2.valid_from <= DATE(Tracks.startTime) AND (wh2.valid_until IS NULL OR wh2.valid_until >= DATE(Tracks.startTime)) ORDER BY wh2.valid_from DESC LIMIT 1), (SELECT wh3.costHour FROM WeeklyHours wh3 WHERE wh3.idUser = Tracks.idUser AND wh3.borrado = '0' ORDER BY wh3.valid_from DESC LIMIT 1)) AS costHour"),
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
                ->leftJoin("WeeklyHours AS wh", "wh.id", "=", "Tracks.idWeeklyHour")
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
            $cost = floatval($track['costHour']);
            $costDecimal = $this->ConvertTimeToDecimal($track['durations'] ? $track['durations'] : $track['duration']);
            $track['trackCost'] = round($costDecimal * $cost, 2);
        }

        return $tracks;
    }

    private function getExportTracks(Request $request)
    {
        $this->validate($request, [
            "startTime" => "required",
            "endTime" => "required",
        ]);

        $currentUser = AuthController::current();
        $isAdminOrPm = in_array($currentUser->role, ['admin', 'pm']);

        $startTime = date('Y-m-d H:i:s', strtotime($request->input("startTime")));
        $endTime = date('Y-m-d H:i:s', strtotime($request->input("endTime")));
        $idUser = $isAdminOrPm ? ($request->input("idUser") ?: null) : $currentUser->id;
        $idClient = $request->input("idClient") ?: null;
        $idProject = $request->input("idProject") ?: null;

        $query = Tracks::select(
            "Tracks.*",
            DB::raw("Projects.name AS projectName"),
            DB::raw("COALESCE(wh.costHour, (SELECT wh2.costHour FROM WeeklyHours wh2 WHERE wh2.idUser = Tracks.idUser AND wh2.valid_from <= DATE(Tracks.startTime) AND (wh2.valid_until IS NULL OR wh2.valid_until >= DATE(Tracks.startTime)) ORDER BY wh2.valid_from DESC LIMIT 1), (SELECT wh3.costHour FROM WeeklyHours wh3 WHERE wh3.idUser = Tracks.idUser AND wh3.borrado = '0' ORDER BY wh3.valid_from DESC LIMIT 1)) AS costHour"),
            DB::raw("Tasks.name AS taskName"),
            DB::raw("Users.name AS userName"),
            DB::raw("Clients.name AS clientName"),
            DB::raw("TIMEDIFF(Tracks.endTime, Tracks.startTime) AS duration")
        )
            ->join("Tasks", DB::raw("Tracks.idTask"), "=", DB::raw("Tasks.id"))
            ->join("Users", DB::raw("Tracks.idUser"), "=", DB::raw("Users.id"))
            ->join("Projects", DB::raw("Projects.id"), "=", DB::raw("Tasks.idProject"))
            ->join("Clients", DB::raw("Clients.id"), "=", DB::raw("Projects.idClient"))
            ->leftJoin("WeeklyHours AS wh", "wh.id", "=", "Tracks.idWeeklyHour")
            ->whereRaw("(Tracks.startTime >= ?)", [$startTime])
            ->whereRaw("(Tracks.endTime <= ?)", [$endTime])
            ->whereRaw("(Tracks.typeTrack = ?)", ['manual'])
            ->whereRaw("(Tasks.active >= ?)", [1]);

        if ($idUser) $query = $query->whereRaw("(Tracks.idUser) = ?", [$idUser]);
        if ($idClient) $query = $query->whereRaw("(Projects.idClient) = ?", [$idClient]);
        if ($idProject) $query = $query->whereRaw("(Projects.id) = ?", [$idProject]);

        $tracks = $query->orderBy("Tracks.idProyecto")->get();
        return $this->calcCosto($tracks);
    }

    private function formatDuration($duration)
    {
        if (!$duration) return '00:00';
        $parts = explode(':', $duration);
        $h = (int)($parts[0] ?? 0);
        $m = (int)($parts[1] ?? 0);
        $s = (int)($parts[2] ?? 0);
        return $this->minutesToHhmm($h * 60 + $m + (int)round($s / 60));
    }

    private function minutesToHhmm($totalMinutes)
    {
        $totalMinutes = max(0, (int)$totalMinutes);
        return str_pad((int)floor($totalMinutes / 60), 2, '0', STR_PAD_LEFT) . ':' . str_pad($totalMinutes % 60, 2, '0', STR_PAD_LEFT);
    }

    private function formatDatetimeExport($datetime)
    {
        if (!$datetime) return '';
        $parts = explode(' ', $datetime);
        $d = explode('-', $parts[0]);
        $time = isset($parts[1]) ? substr($parts[1], 0, 5) : '';
        return ($d[2] ?? '') . '/' . ($d[1] ?? '') . '/' . ($d[0] ?? '') . ($time ? ' ' . $time : '');
    }

    public function exportCsv(Request $request)
    {
        try {
            $tracks = $this->getExportTracks($request);
            $currentUser = AuthController::current();
            $isAdminOrPm = in_array($currentUser->role, ['admin', 'pm']);

            $buf = fopen('php://temp', 'r+');
            $headers = ['Project', 'Client', 'Task', 'Start', 'End', 'Duration', 'Cost/Hour', 'Cost'];
            if ($isAdminOrPm) array_unshift($headers, 'User');
            fputcsv($buf, $headers);

            foreach ($tracks as $track) {
                $cur = $track['currency'] ?? 'USD';
                $row = [
                    $track['projectName'] ?? '',
                    $track['clientName'] ?? '',
                    $track['name'] ?? '',
                    $this->formatDatetimeExport($track['startTime']),
                    $this->formatDatetimeExport($track['endTime']),
                    $this->formatDuration($track['duration']),
                    $cur . ' ' . number_format((float)($track['costHour'] ?? 0), 2),
                    $cur . ' ' . number_format((float)($track['trackCost'] ?? 0), 2),
                ];
                if ($isAdminOrPm) array_unshift($row, $track['userName'] ?? '');
                fputcsv($buf, $row);
            }

            rewind($buf);
            $csv = chr(0xEF) . chr(0xBB) . chr(0xBF) . stream_get_contents($buf);
            fclose($buf);

            return response($csv, 200, [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="tracks.csv"',
            ]);
        } catch (Exception $e) {
            return new Response(['Error' => 'Export failed'], 500);
        }
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
            DB::raw("Projects.name AS projectName"),
            DB::raw("Tasks.idProject AS projectId"),
            DB::raw("Tasks.name AS taskName"),
            DB::raw("Tasks.status AS status"),
            DB::raw("Tasks.active AS isActive"),
            DB::raw("Users.name AS userName"),
            DB::raw("Users.photo"),
            DB::raw("TIMEDIFF( Tracks.endTime, Tracks.startTime ) AS duration")
        )
        ->leftJoin("Tasks", "Tracks.idTask", "=", "Tasks.id")
        ->join("Users", "Tracks.idUser", "=", "Users.id")
        ->join("Projects", function($join) {
            $join
                ->on('Projects.id', '=', 'Tasks.idProject')
                ->orOn('Projects.id', '=', 'Tracks.idProyecto');
        })
        ->whereRaw("Tracks.idUser = ?", [$user_id])
        ->where("Tracks.typeTrack", "manual")
        ->orderBy("Tracks.id", "DESC")
        ->distinct("Tracks.idTask")
        ->limit(20)
        ->get();

        return array("response" => $tracksHistory);
    }
}
