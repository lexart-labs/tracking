<?php

namespace App\Services;

use App\Models\Tracks;
use Illuminate\Support\Facades\DB;

class TrackReportService
{
    public function convertTimeToDecimal($value): float
    {
        if (!$value) return 0;

        $time = explode(":", $value);
        $hours = floatval($time[0] ?? 0);
        $minutes = floatval($time[1] ?? 0) / 60;
        $seconds = floatval($time[2] ?? 0) / 3600;

        return $hours + $minutes + $seconds;
    }

    public function durationToMinutes($value): int
    {
        if (!$value) return 0;

        $time = explode(":", $value);
        $hours = intval($time[0] ?? 0);
        $minutes = intval($time[1] ?? 0);
        $seconds = intval($time[2] ?? 0);

        return ($hours * 60) + $minutes + intval(round($seconds / 60));
    }

    public function calculateCosts($tracks)
    {
        foreach ($tracks as $track) {
            $duration = $track['durations'] ?? $track['duration'] ?? $track['trackDuration'] ?? null;
            $cost = floatval($track['costHour'] ?? 0);
            $track['trackCost'] = round($this->convertTimeToDecimal($duration) * $cost, 2);
        }

        return $tracks;
    }

    public function summarize($tracks): array
    {
        $totals = [];
        $projects = [];

        foreach ($tracks as $track) {
            $currency = $track['currency'] ?? 'USD';
            $projectId = $track['idProyecto'] ?? 'unknown';
            $projectKey = $currency . ':' . $projectId;
            $amount = floatval($track['trackCost'] ?? 0);
            $duration = $track['durations'] ?? $track['duration'] ?? $track['trackDuration'] ?? null;
            $minutes = $this->durationToMinutes($duration);

            if (!isset($totals[$currency])) {
                $totals[$currency] = [
                    'currency' => $currency,
                    'amount' => 0,
                    'minutes' => 0,
                ];
            }

            if (!isset($projects[$projectKey])) {
                $projects[$projectKey] = [
                    'idProyecto' => $projectId,
                    'projectName' => $track['projectName'] ?? '',
                    'currency' => $currency,
                    'amount' => 0,
                    'minutes' => 0,
                ];
            }

            $totals[$currency]['amount'] += $amount;
            $totals[$currency]['minutes'] += $minutes;
            $projects[$projectKey]['amount'] += $amount;
            $projects[$projectKey]['minutes'] += $minutes;
        }

        $totals = array_map(function ($total) {
            $total['amount'] = round($total['amount'], 2);
            return $total;
        }, array_values($totals));

        $projects = array_map(function ($project) {
            $project['amount'] = round($project['amount'], 2);
            return $project;
        }, array_values($projects));

        return [
            'totals' => $totals,
            'projects' => $projects,
        ];
    }

    public function buildReportResponse($tracks): array
    {
        $summary = $this->summarize($tracks);
        $firstTotal = count($summary['totals']) === 1 ? $summary['totals'][0] : null;

        return [
            'tracks' => $tracks,
            'amount' => $firstTotal ? $firstTotal['amount'] : (count($summary['totals']) === 0 ? 0 : null),
            'currency' => $firstTotal ? $firstTotal['currency'] : null,
            'totals' => $summary['totals'],
            'summary' => $summary,
        ];
    }

    public function getManualTracks(int|string $userId, string $startDate, ?string $endDate = null)
    {
        $query = Tracks::select(
            "Tracks.id",
            "Tracks.idTask",
            "Tracks.idUser",
            "Tracks.name",
            "Tracks.typeTrack",
            "Tracks.currency",
            "Tracks.idProyecto",
            "Tracks.startTime",
            "Tracks.endTime",
            DB::raw("Tasks.name AS taskName"),
            DB::raw("Projects.name AS projectName"),
            DB::raw("Clients.name AS clientName"),
            DB::raw("COALESCE(wh.costHour, (SELECT wh2.costHour FROM WeeklyHours wh2 WHERE wh2.idUser = Tracks.idUser AND wh2.valid_from <= DATE(Tracks.startTime) AND (wh2.valid_until IS NULL OR wh2.valid_until >= DATE(Tracks.startTime)) ORDER BY wh2.valid_from DESC LIMIT 1), (SELECT wh3.costHour FROM WeeklyHours wh3 WHERE wh3.idUser = Tracks.idUser AND wh3.borrado = '0' ORDER BY wh3.valid_from DESC LIMIT 1)) AS costHour"),
            DB::raw("TIMEDIFF(Tracks.endTime, Tracks.startTime) AS duration"),
            DB::raw("TIMEDIFF(Tracks.endTime, Tracks.startTime) AS trackDuration")
        )
            ->join("Tasks", DB::raw("Tracks.idTask"), "=", DB::raw("Tasks.id"))
            ->join("Projects", DB::raw("Projects.id"), "=", DB::raw("Tasks.idProject"))
            ->join("Clients", DB::raw("Clients.id"), "=", DB::raw("Projects.idClient"))
            ->leftJoin("WeeklyHours AS wh", "wh.id", "=", "Tracks.idWeeklyHour")
            ->where("Tracks.idUser", $userId)
            ->where("Tracks.startTime", ">=", $startDate)
            ->whereNotNull("Tracks.endTime")
            ->where("Tracks.typeTrack", "manual")
            ->where("Tasks.active", ">=", 1);

        if ($endDate) {
            $query = $query->where("Tracks.endTime", "<=", $endDate);
        }

        return $this->calculateCosts($query->get());
    }
}
