<?php

namespace App\Console\Commands;

use App\Models\Tracks;
use App\Models\Weeklyhours;
use Illuminate\Console\Command;

class SyncTracksWeeklyHourCommand extends Command
{
    protected $signature = 'tracks:sync-weekly-hour {from? : Start date (Y-m-d)} {to? : End date (Y-m-d)} {--dry-run : Show changes without updating}';

    protected $description = 'Updates Tracks.idWeeklyHour using WeeklyHours by user/date (all tracks or date range)';

    public function handle()
    {
        $from = $this->argument('from');
        $to = $this->argument('to');
        $dryRun = (bool) $this->option('dry-run');

        $query = Tracks::query();

        if (($from && !$to) || (!$from && $to)) {
            $this->error('If you send dates, you must provide both: from and to.');
            return 1;
        }

        if ($from && $to) {
            if (!$this->isValidDate($from) || !$this->isValidDate($to)) {
                $this->error('Invalid date format. Use Y-m-d for both dates.');
                return 1;
            }

            if ($from > $to) {
                $this->error('The start date must be less than or equal to end date.');
                return 1;
            }

            $fromDateTime = $from . ' 00:00:00';
            $toDateTime = $to . ' 23:59:59';
            $query->whereBetween('startTime', [$fromDateTime, $toDateTime]);
        }

        $totalTracks = (clone $query)->count();

        if ($totalTracks === 0) {
            $this->info($from && $to ? 'No tracks found in that date range.' : 'No tracks found.');
            return 0;
        }

        $updated = 0;
        $skipped = 0;
        $withoutWeeklyHour = 0;
        $cache = [];

        $this->info('Tracks found: ' . $totalTracks);
        if ($from && $to) {
            $this->info('Date range: ' . $from . ' to ' . $to);
        } else {
            $this->info('Scope: all tracks');
        }
        $this->info($dryRun ? 'Running in dry-run mode.' : 'Applying updates.');

        $query->chunkById(500, function ($tracks) use (&$updated, &$skipped, &$withoutWeeklyHour, &$cache, $dryRun) {
            foreach ($tracks as $track) {
                if (empty($track->idUser)) {
                    $withoutWeeklyHour++;
                    continue;
                }

                $trackDate = substr((string) $track->startTime, 0, 10);
                $cacheKey = $track->idUser . '|' . $trackDate;

                if (!array_key_exists($cacheKey, $cache)) {
                    $weeklyHour = Weeklyhours::forDate((int) $track->idUser, $trackDate);
                    $cache[$cacheKey] = $weeklyHour ? (int) $weeklyHour->id : null;
                }

                $weeklyHourId = $cache[$cacheKey];

                if ($weeklyHourId === null) {
                    $withoutWeeklyHour++;
                    continue;
                }

                if ((int) $track->idWeeklyHour === $weeklyHourId) {
                    $skipped++;
                    continue;
                }

                if (!$dryRun) {
                    $track->idWeeklyHour = $weeklyHourId;
                    $track->save();
                }

                $updated++;
            }
        }, 'id');

        $this->info('Updated tracks: ' . $updated);
        $this->info('Skipped (already correct): ' . $skipped);
        $this->info('No WeeklyHours found: ' . $withoutWeeklyHour);

        return 0;
    }

    private function isValidDate(string $value): bool
    {
        $date = \DateTime::createFromFormat('Y-m-d', $value);
        return $date && $date->format('Y-m-d') === $value;
    }
}
