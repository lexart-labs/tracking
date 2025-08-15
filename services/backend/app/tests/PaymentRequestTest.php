<?php

use App\Enums\PaymentRequestDetailConcepts;
use App\Enums\PaymentRequestStatus;
use App\Models\Clients;
use App\Models\PaymentRequest;
use App\Models\PaymentRequestDetail;
use App\Models\Projects;
use App\Models\Tasks;
use App\Models\Tracks;
use App\Models\User;
use App\Models\Weeklyhours;
use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Testing\DatabaseMigrations;

class PaymentRequestTest extends TestCase
{
    private string $token = '';
    use DatabaseMigrations;

    public function test_create_payment_request_should_return_unauthorized()
    {
        $response = $this->post('/api/payment_requests/create');

        $response->seeStatusCode(401);
        $response->seeJsonEquals(["message" => "Unauthorized"]);
    }

    public function test_create_payment_request_should_return_details_missing()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        $this->actingAs($user);

        $response = $this->post('/api/payment_requests/create', ['details' => []]);

        $response->seeStatusCode(422);
        $response->seeJsonEquals([
            "details" => [
                "The details field is required."
            ]
        ]);
    }

    public function test_create_payment_request_should_return_details_properties_missing()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        $this->actingAs($user);

        $response = $this->post('/api/payment_requests/create', ['details' => ['']]);

        $response->seeStatusCode(422);
        $response->seeJsonEquals([
            "details.0.concept" => [
                "The details.0.concept field is required."
            ],
            "details.0.concept_description" => [
                "The details.0.concept_description field is required."
            ],
            "details.0.amount" => [
                "The details.0.amount field is required."
            ]
        ]);
    }

    public function test_create_payment_request_should_not_save_when_rollback_transaction() {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        Weeklyhours::factory()->count(1)->create(['idUser' => $user->id])->first();

        $this->actingAs($user);

        $data = [
            "details" => [
                [
                    "concept" => "Closure",
                    "concept_description" => "Some description",
                    "amount" => 1
                ]
            ]
        ];

        // Here we modify the table to force error in database transaction
        DB::statement('ALTER TABLE `PaymentRequestDetail` MODIFY COLUMN concept tinyint');

        $response = $this->post('/api/payment_requests/create', $data);

        $response->seeStatusCode(500);
        $this->assertEquals(0, count(PaymentRequest::get()));
        $this->assertEquals(0, count(PaymentRequestDetail::get()));
    }

    public function test_create_payment_request_returns_success()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        Weeklyhours::factory()->count(1)->create(['idUser' => $user->id])->first();
        Weeklyhours::factory()->count(1)->create(['idUser' => $user->id])->first();

        $this->actingAs($user);

        $data = [
            "details" => [
                [
                    "concept" => "Closure",
                    "concept_description" => "Some description",
                    "amount" => 19900.98
                ]
            ]
        ];

        $response = $this->post('/api/payment_requests/create', $data);

        $response->seeStatusCode(201);
        $this->assertEquals(1, count(PaymentRequest::get()));
        $this->assertEquals(1, count(PaymentRequestDetail::get()));
        $response->seeJsonStructure(([
            'response' => [
                'user_id',
                'status',
                'currency',
                'reply',
                'updated_at',
                'created_at',
                'id',
                'details' => [
                    '*' => [
                        'payment_request_id',
                        'concept',
                        'concept_description',
                        'amount',
                        'id',
                    ],
                ],
            ],
        ]));
    }

    public function test_read_user_payment_request_history_should_return_invalid_id()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        $this->actingAs($user);

        $response = $this->get("/api/payment_requests/non_numerical_id");

        $response->seeStatusCode(400);
        $response->seeJsonContains([
            "Error" => INVALID_NUMERIC_ID,
        ]);
    }

    public function test_read_user_payment_request_history()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        $payment_request = PaymentRequest::factory()->count(1)->create(['user_id' => $user->id])->first();
        $payment_request_detail = PaymentRequestDetail::factory()->count(1)
            ->create([
                'payment_request_id' => $payment_request->id,
                'concept' => PaymentRequestDetailConcepts::Closure
            ])->first();

        $this->actingAs($user);

        $response = $this->get("/api/payment_requests/$user->id");
        $payment_request->payment_request_details = [$payment_request_detail];

        $response->seeStatusCode(200);
        $response->seeJsonEquals(['response' => [$payment_request]]);
    }

    public function test_cancel_payment_request_should_return_not_found()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();

        $this->actingAs($user);

        $response = $this->put("/api/payment_requests/1/cancel");

        $response->seeStatusCode(400);
        $response->seeJsonContains([
            "Error" => PAYMENT_REQUEST_NOT_FOUND,
        ]);
    }

    public function test_cancel_payment_request_should_return_invalid_id_error()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();

        $this->actingAs($user);

        $response = $this->put("/api/payment_requests/NON_NUMERIC_ID/cancel");

        $response->seeStatusCode(400);
        $response->seeJsonContains([
            "Error" => INVALID_NUMERIC_ID,
        ]);
    }

    public function test_cancel_payment_request_returns_success()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        $payment_request = PaymentRequest::factory()->count(1)->create(['user_id' => $user->id])->first();

        $this->actingAs($user);

        $response = $this->put("/api/payment_requests/$payment_request->id/cancel");

        $response->seeStatusCode(200);
        $response->seeJsonStructure([
            'response' => [
                'id',
                'user_id',
                'status',
                'reply',
                'created_at',
                'updated_at'
            ]
        ]);
        $response->seeJsonContains([
            'status' => PaymentRequestStatus::Canceled
        ]);
    }

    public function test_get_balance_since_last_closure_should_return_invalid_id_error()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();

        $this->actingAs($user);

        $response = $this->get("/api/payment_requests/closure/INVALID_ID");

        $response->seeStatusCode(400);
        $response->seeJsonContains([
            "Error" => INVALID_NUMERIC_ID,
        ]);
    }

    public function test_get_balance_since_last_closure_should_return_missing_weekly_hours()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();

        $this->actingAs($user);

        $response = $this->get("/api/payment_requests/closure/$user->id");

        $response->seeStatusCode(422);
        $response->seeJsonContains([
            "Error" => MISSING_WEEKLY_HOURS,
        ]);
    }

    public function test_get_balance_since_last_closure_should_return_the_first_month_day()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        Weeklyhours::factory()->count(1)->create(['idUser' => $user->id])->first();

        $this->actingAs($user);

        $response = $this->get("/api/payment_requests/closure/$user->id");

        $response->seeStatusCode(200);
        $response->seeJsonContains([
            "start_date" => date("Y-m-01 00:00:00"),
        ]);
    }

    public function test_get_balance_since_last_closure_should_return_empty_array_when_there_are_no_tracks()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();
        Weeklyhours::factory()->count(1)->create(['idUser' => $user->id])->first();

        $this->actingAs($user);

        $response = $this->get("/api/payment_requests/closure/$user->id");

        $response->seeStatusCode(200);
        $response->seeJsonContains([
            "tracks" => [],
            "amount" => 0
        ]);
    }

    public function test_get_balance_since_last_closure_returns_success()
    {
        $user = User::factory()->count(1)->create(['role' => 'employee', 'status' => 1])->first();

        $payment_request = PaymentRequest::factory()->count(1)->create(['user_id' => $user->id])->first();
        PaymentRequestDetail::factory()->count(1)
            ->create([
                'concept' => PaymentRequestDetailConcepts::Closure,
                'payment_request_id' => $payment_request->id
            ])->first();

        Weeklyhours::factory()->count(1)->create(['idUser' => $user->id])->first();

        $client = Clients::factory()->count(1)->create()->first();
        $project = Projects::factory()->count(1)->create(['idClient' => $client->id])->first();
        $task = Tasks::factory()->count(1)->create(['idProject' => $project->id])->first();
        Tracks::factory()->count(1)->create(['idUser' => $user->id, 'idTask' => $task->id])->first();

        $this->actingAs($user);

        $response = $this->get("/api/payment_requests/closure/$user->id");

        $response->seeStatusCode(200);
        $response->seeJsonStructure([
            'response' => [
                'amount',
                'currency',
                'tracks' => [
                    '*' => [
                        'taskName',
                        'trackDuration',
                        'trackCost'
                    ]
                ]
            ],
        ]);
    }

    // UPDATE ROUTE
    public function test_update_payment_requests_should_return_unauthorized()
    {
        $response = $this->put('/api/payment_requests/update/1');
        $response->seeStatusCode(401);
        $response->seeJsonEquals(["message" => "Unauthorized"]);
    }

    public function test_update_payment_requests_should_return_not_modified()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();
        $response = $this->actingAs($user)->put('/api/payment_requests/update/1');
        $response->seeStatusCode(304);
    }

    public function test_update_payment_requests_should_return_not_found()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();

        $response = $this->actingAs($user)->put(
            '/api/payment_requests/update/99',
            ['status' => 'Approved']
         );
        $response->seeStatusCode(404);
    }

    public function test_update_payment_requests_with_invalid_value_should_return_unprocessable()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();
        PaymentRequest::factory()->count(1)->create(['id' => 1]);
        $response = $this->actingAs($user)->put(
            '/api/payment_requests/update/1',
            ['status' => 'mock']
         );
        $response->seeStatusCode(422);
        $response->seeJsonEquals([
            'Error' => "Invalid data",
            'errors' => ['status' => ['The selected status is invalid.']]
        ]);
    }

    public function test_update_payment_requests_should_return_ok()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();
        PaymentRequest::factory()->count(1)->create(['id' => 1]);
        $response = $this->actingAs($user)->put(
            '/api/payment_requests/update/1',
            ['status' => 'Approved']
         );
        $response->seeStatusCode(200);
        $response->seeJsonEquals([
            'response' => "Successfully updated",
        ]);

        $updated = PaymentRequest::find(1);
        $this->assertEquals(PaymentRequestStatus::Approved, $updated->status);
    }

    public function it_returns_500_if_internal_server_error_occurs()
    {
        try {
            // Error cause
            DB::statement('ALTER TABLE `PaymentRequest` RENAME COLUMN `status` TO `make_error`;');
            $attributes = ['role' => 'employee', 'status' => 1];
            $user = User::factory()->count(1)->create($attributes)->first();

            $response = $this->actingAs($user)->put(
                "/api/payment_requests/1",
                ['status' => 'Approved']
            );
            $response->seeStatusCode(500)
                    ->seeJsonEquals(['Error' => INTERNAL_SERVER_ERROR]);

            // undo error cause
            DB::statement('ALTER TABLE `PaymentRequest` RENAME COLUMN `make_error` TO `status`;');

        } catch (PDOException $e) {
            $this->fail('QueryException thrown: ' . $e->getMessage());
        }
    }


    // GET ALL ROUTE
    public function test_get_all_payment_requests_should_return_unauthorized()
    {
        $response = $this->get('/api/payment_requests/all');

        $response->seeStatusCode(401);
        $response->seeJsonEquals(["message" => "Unauthorized"]);
    }

    public function test_get_all_payment_requests_should_return_no_data()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();
        $response = $this->actingAs($user)->get('/api/payment_requests/all?user=9999');

        $response->seeStatusCode(200);
        $response->seeJsonEquals([ 'response' => []]);
    }

    public function test_get_all_payment_requests_should_return_data_with_no_filters()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();
        $paymentRequests = PaymentRequest::factory()->count(5)->create(['user_id' => $user->id]);

        foreach ($paymentRequests as $paymentRequest) {
            $paymentRequestDetail = PaymentRequestDetail::factory()->create([
                'payment_request_id' => $paymentRequest->id,
                'concept' => PaymentRequestDetailConcepts::Closure
            ]);
            $paymentRequest->payment_request_details = [$paymentRequestDetail];
            $paymentRequest->user = ['id' => $user->id, 'name' => $user->name];

        }
        $response = $this->actingAs($user)->get('/api/payment_requests/all');
        $response->seeStatusCode(200);
        $response->seeJsonEquals([ 'response' => $paymentRequests->toArray()]);
    }

    public function test_get_all_payment_requests_with_status_filter()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();
        $paymentRequestsByStatus = [];

        // create for all posssible status
        $statuses = ['Rejected', 'Canceled', 'Approved', 'Pending'];
        foreach ($statuses as $status) {
            $paymentRequests = PaymentRequest::factory()->count(3)->create([
                'user_id' => $user->id,
                'status' => $status,
            ]);
            // create mock details
            foreach ($paymentRequests as $paymentRequest) {
                $paymentRequestDetail = PaymentRequestDetail::factory()->create([
                    'payment_request_id' => $paymentRequest->id,
                    'concept' => PaymentRequestDetailConcepts::Closure
                ]);
                $paymentRequest->payment_request_details = [$paymentRequestDetail];
                $paymentRequest->user = ['id' => $user->id, 'name' => $user->name];
            }
            $paymentRequestsByStatus[$status] = $paymentRequests;
        }

        // tests all the possibles status filters
        foreach ($statuses as $status) {
            $response = $this->actingAs($user)->get("/api/payment_requests/all?status=$status");
            $response->seeStatusCode(200);
            foreach ($paymentRequestsByStatus[$status] as $paymentRequest) {
                $response->seeJsonEquals([ 'response' => $paymentRequestsByStatus[$status]->toArray()]);
            }
        }
    }

    public function test_get_all_payment_requests_with_user_filter()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $users = User::factory()->count(2)->create($attributes);

        $user1 = $users->first();
        $user2 = $users->last();

        //create for booth users
        $paymentRequestsUser1 = PaymentRequest::factory()->count(3)->create(['user_id' => $user1->id]);
        $paymentRequestsUser2 = PaymentRequest::factory()->count(2)->create(['user_id' => $user2->id]);

        //details
        foreach ($paymentRequestsUser1 as $paymentRequest) {
            $details = PaymentRequestDetail::factory(1)->create([
                'payment_request_id' => $paymentRequest->id,
                'concept' => PaymentRequestDetailConcepts::Closure,
            ])->first();
            $paymentRequest->payment_request_details = [$details];
            $paymentRequest->user = ['id' => $user1->id, 'name' => $user1->name];
        }
        foreach ($paymentRequestsUser2 as $paymentRequest) {
            $details = PaymentRequestDetail::factory(1)->create([
                'payment_request_id' => $paymentRequest->id,
                'concept' => PaymentRequestDetailConcepts::Closure,
            ])->first();
            $paymentRequest->payment_request_details = [$details];
            $paymentRequest->user = ['id' => $user2->id, 'name' => $user2->name];

        }

        // user 1
        $responseUser1 = $this->actingAs($user1)->get("/api/payment_requests/all?user=$user1->id");
        $responseUser1->seeStatusCode(200);
        $responseUser1->seeJsonEquals([ 'response' => $paymentRequestsUser1->toArray()]);

        // user 2
        $responseUser2 = $this->actingAs($user2)->get("/api/payment_requests/all?user=$user2->id");
        $responseUser2->seeStatusCode(200);
        $responseUser2->seeJsonEquals([ 'response' => $paymentRequestsUser2->toArray()]);
    }

    public function test_get_all_payment_requests_with_concept_filter()
    {
        $attributes = ['role' => 'employee', 'status' => 1];
        $user = User::factory()->count(1)->create($attributes)->first();
        $paymentRequestsByConcept = [];

        // create for all posssible concepts
        $concepts = ['Benefits', 'Closure', 'Compensation'];
        foreach ($concepts as $concept) {
            $paymentRequests = PaymentRequest::factory()->count(3)->create([
                'user_id' => $user->id,
                'status' => "Pending",
            ]);
            // details
            foreach ($paymentRequests as $paymentRequest) {
                $paymentRequestDetail = PaymentRequestDetail::factory()->create([
                    'payment_request_id' => $paymentRequest->id,
                    'concept' => $concept,
                ]);
                $paymentRequest->payment_request_details = [$paymentRequestDetail];
                $paymentRequest->user = ['id' => $user->id, 'name' => $user->name];

            }
            $paymentRequestsByConcept[$concept] = $paymentRequests;
        }

        // tests all the possibles concept filters
        foreach ($concepts as $concept) {
            $response = $this->actingAs($user)->get("/api/payment_requests/all?concept=$concept");
            $response->seeStatusCode(200);
            foreach ($paymentRequestsByConcept[$concept] as $paymentRequest) {
                $response->seeJsonEquals([ 'response' => $paymentRequestsByConcept[$concept]->toArray()]);
            }
        }
    }
}
