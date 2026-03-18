<?php

use App\Models\Clients;
use App\Models\Projects;
use App\Models\Tasks;
use App\Models\Tracks;
use App\Models\User;
use App\Models\Weeklyhours;
use Laravel\Lumen\Testing\DatabaseMigrations;

class TracksControllerTest extends TestCase
{
    use DatabaseMigrations;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function makeUser(string $role): User
    {
        return User::factory()->count(1)->create(['role' => $role, 'status' => 1])->first();
    }

    private function createTrackScenario(User $user, array $trackOverrides = []): array
    {
        $client = Clients::factory()->create();
        $project = Projects::factory()->create(['idClient' => $client->id]);
        $task = Tasks::factory()->create(['idProject' => $project->id, 'active' => 1]);
        $weeklyHour = Weeklyhours::factory()->create([
            'idUser' => $user->id,
            'costHour' => 50,
            'currency' => 'USD',
            'valid_from' => '2024-01-01',
            'borrado' => '0',
        ]);
        $track = Tracks::factory()->create(array_merge([
            'idUser' => $user->id,
            'idTask' => $task->id,
            'idProyecto' => $project->id,
            'idWeeklyHour' => $weeklyHour->id,
            'startTime' => '2024-03-01 09:00:00',
            'endTime' => '2024-03-01 10:00:00',
            'typeTrack' => 'manual',
            'currency' => 'USD',
            'trackCost' => 50,
        ], $trackOverrides));

        return compact('client', 'project', 'task', 'weeklyHour', 'track');
    }

    private function dateParams(): array
    {
        return [
            'startTime' => '2024-03-01 00:00:00',
            'endTime'   => '2024-03-31 23:59:59',
        ];
    }

    // -------------------------------------------------------------------------
    // POST /tracks/user/all  (pm:api)
    // -------------------------------------------------------------------------

    public function test_all_unauthenticated_returns_401()
    {
        $response = $this->post('/api/tracks/user/all', $this->dateParams());
        $response->seeStatusCode(401);
    }

    public function test_all_developer_blocked_by_pm_middleware()
    {
        $developer = $this->makeUser('developer');
        $this->actingAs($developer)->post('/api/tracks/user/all', $this->dateParams());
        $this->seeStatusCode(401);
    }

    public function test_all_missing_dates_returns_422()
    {
        $admin = $this->makeUser('admin');
        $this->actingAs($admin)->post('/api/tracks/user/all', []);
        $this->seeStatusCode(422);
    }

    public function test_admin_gets_all_tracks()
    {
        $admin = $this->makeUser('admin');
        $this->createTrackScenario($admin);

        $this->actingAs($admin)->post('/api/tracks/user/all', $this->dateParams());
        $this->seeStatusCode(200);
        $this->seeJsonStructure([
            'response' => [
                ['id', 'name', 'projectName', 'userName', 'clientName', 'duration', 'trackCost', 'currency'],
            ],
        ]);
    }

    public function test_pm_gets_all_tracks()
    {
        $pm = $this->makeUser('pm');
        $this->createTrackScenario($pm);

        $this->actingAs($pm)->post('/api/tracks/user/all', $this->dateParams());
        $this->seeStatusCode(200);
        $this->seeJsonStructure(['response' => [['id', 'projectName']]]);
    }

    public function test_admin_filters_tracks_by_user()
    {
        $admin = $this->makeUser('admin');
        $other = $this->makeUser('developer');
        $this->createTrackScenario($admin);
        $this->createTrackScenario($other);

        $this->actingAs($admin)->post('/api/tracks/user/' . $other->id, $this->dateParams());
        $this->seeStatusCode(200);

        $body = json_decode($this->response->getContent(), true);
        $ids = array_column($body['response'], 'idUser');
        foreach ($ids as $id) {
            $this->assertEquals($other->id, $id);
        }
    }

    // -------------------------------------------------------------------------
    // POST /tracks/user/current  (auth:api)
    // -------------------------------------------------------------------------

    public function test_current_unauthenticated_returns_401()
    {
        $response = $this->post('/api/tracks/user/current', $this->dateParams());
        $response->seeStatusCode(401);
    }

    public function test_current_returns_only_own_tracks()
    {
        $developer = $this->makeUser('developer');
        $other = $this->makeUser('developer');
        $this->createTrackScenario($developer);
        $this->createTrackScenario($other);

        $this->actingAs($developer)->post('/api/tracks/user/current', $this->dateParams());
        $this->seeStatusCode(200);

        $body = json_decode($this->response->getContent(), true);
        $this->assertNotEmpty($body['response']);
        foreach ($body['response'] as $track) {
            $this->assertEquals($developer->id, $track['idUser']);
        }
    }

    // -------------------------------------------------------------------------
    // PUT /tracks/update  (pm:api)
    // -------------------------------------------------------------------------

    public function test_update_unauthenticated_returns_401()
    {
        $this->put('/api/tracks/update', []);
        $this->seeStatusCode(401);
    }

    public function test_update_developer_blocked_by_pm_middleware()
    {
        $developer = $this->makeUser('developer');
        $this->actingAs($developer)->put('/api/tracks/update', []);
        $this->seeStatusCode(401);
    }

    public function test_update_missing_fields_returns_422()
    {
        $admin = $this->makeUser('admin');
        $this->actingAs($admin)->put('/api/tracks/update', []);
        $this->seeStatusCode(422);
    }

    public function test_admin_update_track_succeeds()
    {
        $admin = $this->makeUser('admin');
        ['track' => $track] = $this->createTrackScenario($admin);

        $this->actingAs($admin)->put('/api/tracks/update', [
            'id'        => $track->id,
            'idUser'    => $admin->id,
            'startTime' => '2024-03-01 09:00:00',
            'endTime'   => '2024-03-01 11:00:00',
        ]);
        $this->seeStatusCode(200);
        $this->seeJsonStructure(['response' => [['id']]]);
    }

    // -------------------------------------------------------------------------
    // POST /tracks/export/csv  (auth:api)
    // -------------------------------------------------------------------------

    public function test_export_csv_unauthenticated_returns_401()
    {
        $this->post('/api/tracks/export/csv', $this->dateParams());
        $this->seeStatusCode(401);
    }

    public function test_export_csv_missing_dates_returns_422()
    {
        $admin = $this->makeUser('admin');
        $this->actingAs($admin)->post('/api/tracks/export/csv', []);
        $this->seeStatusCode(422);
    }

    public function test_admin_export_csv_includes_user_column()
    {
        $admin = $this->makeUser('admin');
        $this->createTrackScenario($admin);

        $this->actingAs($admin)->post('/api/tracks/export/csv', $this->dateParams());
        $this->seeStatusCode(200);

        $content = $this->response->getContent();
        $this->assertStringContainsString('User', $content);
        $this->assertStringContainsString('Project', $content);
        $this->assertStringContainsString('Duration', $content);
    }

    public function test_developer_export_csv_excludes_user_column()
    {
        $developer = $this->makeUser('developer');
        $this->createTrackScenario($developer);

        $this->actingAs($developer)->post('/api/tracks/export/csv', $this->dateParams());
        $this->seeStatusCode(200);

        $firstLine = strtok($this->response->getContent(), "\n");
        $this->assertStringNotContainsString('User', $firstLine);
        $this->assertStringContainsString('Project', $firstLine);
    }

    public function test_export_csv_returns_data_for_date_range()
    {
        $admin = $this->makeUser('admin');
        ['track' => $track] = $this->createTrackScenario($admin);

        $this->actingAs($admin)->post('/api/tracks/export/csv', $this->dateParams());
        $this->seeStatusCode(200);

        $content = $this->response->getContent();
        $lines = array_filter(explode("\n", trim($content)));
        // Header row + at least one data row
        $this->assertGreaterThanOrEqual(2, count($lines));
    }

    public function test_export_csv_empty_range_returns_only_headers()
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)->post('/api/tracks/export/csv', [
            'startTime' => '2020-01-01 00:00:00',
            'endTime'   => '2020-01-31 23:59:59',
        ]);
        $this->seeStatusCode(200);

        $content = $this->response->getContent();
        $lines = array_filter(explode("\n", trim($content)));
        $this->assertEquals(1, count($lines)); // only header row
    }
}
