<?php

use App\Models\Projects;
use App\Models\Tasks;
use App\Models\User;
use Laravel\Lumen\Testing\DatabaseMigrations;

class TasksAndProjectsSecurityTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * Helper to create a user with a specific role.
     */
    private function makeUser(string $role): User
    {
        return User::factory()->count(1)->create(['role' => $role, 'status' => 1])->first();
    }

    // -------------------------------------------------------------------------
    // GET /api/projects/all
    // -------------------------------------------------------------------------

    public function test_projects_all_admin_sees_all_projects()
    {
        $admin = $this->makeUser('admin');
        Projects::factory()->count(3)->create(['active' => 1]);

        $this->actingAs($admin)->get('/api/projects/all');
        $this->seeStatusCode(200);
        $body = json_decode($this->response->getContent(), true);
        $this->assertCount(3, $body['response']);
    }

    public function test_projects_all_developer_sees_only_assigned_projects()
    {
        $developer = $this->makeUser('developer');
        $project1 = Projects::factory()->create(['active' => 1]);
        $project2 = Projects::factory()->create(['active' => 1]);
        
        // Task assigned to developer in project 1
        Tasks::factory()->create([
            'idProject' => $project1->id,
            'active' => 1,
            'users' => json_encode([['idUser' => strval($developer->id)]])
        ]);

        // Task in project 2 NOT assigned to developer
        Tasks::factory()->create([
            'idProject' => $project2->id,
            'active' => 1,
            'users' => json_encode([['idUser' => '999']])
        ]);

        $this->actingAs($developer)->get('/api/projects/all');
        $this->seeStatusCode(200);
        $body = json_decode($this->response->getContent(), true);
        
        // Should only see project 1
        $this->assertCount(1, $body['response']);
        $this->assertEquals($project1->id, $body['response'][0]['id']);
    }

    // -------------------------------------------------------------------------
    // GET /api/projects/tasks/project/{id}
    // -------------------------------------------------------------------------

    public function test_tasks_project_admin_sees_all_tasks()
    {
        $admin = $this->makeUser('admin');
        $project = Projects::factory()->create(['active' => 1]);
        Tasks::factory()->count(2)->create(['idProject' => $project->id, 'active' => 1]);

        $this->actingAs($admin)->get('/api/projects/tasks/project/' . $project->id);
        $this->seeStatusCode(200);
        $body = json_decode($this->response->getContent(), true);
        $this->assertCount(2, $body['response']);
    }

    public function test_tasks_project_developer_sees_only_assigned_tasks()
    {
        $developer = $this->makeUser('developer');
        $project = Projects::factory()->create(['active' => 1]);
        
        // Task assigned to developer
        $assignedTask = Tasks::factory()->create([
            'idProject' => $project->id,
            'active' => 1,
            'users' => json_encode([['idUser' => strval($developer->id)]])
        ]);

        // Task NOT assigned to developer
        Tasks::factory()->create([
            'idProject' => $project->id,
            'active' => 1,
            'users' => json_encode([['idUser' => '999']])
        ]);

        $this->actingAs($developer)->get('/api/projects/tasks/project/' . $project->id);
        $this->seeStatusCode(200);
        $body = json_decode($this->response->getContent(), true);
        
        // Should only see the assigned task
        $this->assertCount(1, $body['response']);
        $this->assertEquals($assignedTask->id, $body['response'][0]['id']);
    }

    public function testDeveloperCanCreateTaskInAssignedProject()
    {
        // 1. Create a project and a task assigned to developer
        $project = DB::table('Projects')->insertGetId(['name' => 'Dev Project', 'active' => 1]);
        $devId = DB::table('Users')->where('role', 'developer')->value('id');
        $devName = DB::table('Users')->where('id', $devId)->value('name');
        
        DB::table('Tasks')->insert([
            'idProject' => $project,
            'name' => 'Existing Task',
            'users' => json_encode([['idUser' => (string)$devId, 'nameUser' => $devName]]),
            'active' => 1,
            'status' => 'Done',
            'duration' => '1.0'
        ]);

        // 2. Developer tries to create a NEW task in this project
        $this->actingAs($this->developer);
        $response = $this->post('/api/projects/tasks/new', [
            'idProject' => $project,
            'name' => 'New Dev Task',
            'description' => 'Created by dev',
            'duration' => '2.0',
            'startDate' => date('Y-m-d'),
            'endDate' => date('Y-m-d', strtotime('+1 day')),
            'status' => 'To-do',
            'comments' => 'test'
        ]);

        $response->assertResponseStatus(200);
        $this->seeInDatabase('Tasks', ['name' => 'New Dev Task', 'idProject' => $project]);
        
        // 3. Verify they are automatically assigned even if they didn't send users
        $task = DB::table('Tasks')->where('name', 'New Dev Task')->first();
        $users = json_decode($task->users, true);
        $this->assertEquals($devId, $users[0]['idUser']);
    }

    public function testDeveloperCannotCreateTaskInUnassignedProject()
    {
        // Project with NO tasks for developer
        $project = DB::table('Projects')->insertGetId(['name' => 'Private Project', 'active' => 1]);

        $this->actingAs($this->developer);
        $response = $this->post('/api/projects/tasks/new', [
            'idProject' => $project,
            'name' => 'Illegal Task',
            'duration' => '1.0',
            'startDate' => date('Y-m-d'),
            'endDate' => date('Y-m-d', strtotime('+1 day')),
            'status' => 'To-do'
        ]);

        $response->assertResponseStatus(403);
    }
}
