<?php

namespace App\Http\Controllers;

use Exception;
use App\Enums\PaymentRequestDetailConcepts;
use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\PaymentRequestDetail;
use App\Models\Tracks;
use App\Models\Weeklyhours;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\ValidationException;
use Laravel\Lumen\Routing\Controller as BaseController;
use PDOException;
use App\Models\User;

class PaymentRequestController extends BaseController
{
    private function applyFilters(Builder $query, Request $request)
    {
        $query->when($request->filled('concept'), function ($q) use ($request) {
            $concept = $request->input('concept');
            $q->whereHas('payment_request_details', function ($q) use ($concept) {
            $q->where(DB::raw('BINARY concept'), '=', $concept);
        });
        })
        ->when($request->filled('user.id'), function ($q) use ($request) {
            $q->where('user_id', (int)$request->input('user.id'));
        })
        ->when($request->filled('status'), function ($q) use ($request) {
            $q->where('status', $request->input('status'));
        })
        ->when($request->filled('currency'), function ($q) use ($request) {
            $q->where('currency', $request->input('currency'));
        })
        ->when($request->filled('startDate'), function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->input('startDate'));
        })
        ->when($request->filled('endDate'), function ($q) use ($request) {
            $q->whereDate('created_at', '<=', $request->input('endDate'));
        });

        return $query;
    }

    public function all(Request $request)
    {
        $operation = "Get payment Requests";
        $query = PaymentRequest::query();

        try {
            $query = $this->applyFilters($query, $request);
            $rows = $query->with([
                'user' => function ($q) {
                    $q->select('id', 'name');
                },
                'payment_request_details'
            ])->get();

            return new Response(['response' => $rows]);
        } catch (Exception $e) {
            return new Response(["Error" => INTERNAL_SERVER_ERROR, "Operation" => $operation], 500);
        }
    }

    public function updateConceptDescription(Request $request, $payment_request_id)
    {
        $operation = "Update Payment Request Detail";

        $user = User::find($request->user()->id);

        if (!$user || !$user->isAdmin()) {
            return new Response(["Error" => ACCESSES_FAILED, "Operation" => $operation], 403);
        }

        if (!is_numeric($payment_request_id)) {
            return new Response(["Error" => INVALID_NUMERIC_ID, "Operation" => $operation], 422);
        }

        $this->validate($request, [
            'concept_description' => 'required|string',
            'amount' => 'required|numeric|min:0'
        ]);

        try {
            $paymentRequestDetail = PaymentRequestDetail::where('payment_request_id', $payment_request_id)->firstOrFail();

            $paymentRequestDetail->concept_description = $request->input('concept_description');
            $paymentRequestDetail->amount = $request->input('amount');
            $paymentRequestDetail->save();

            return new Response(['response' => UPDATED], 201);
        } catch (ModelNotFoundException $ex) {
            return new Response(['Error' => PAYMENT_REQUEST_NOT_FOUND], 404);
        } catch (ValidationException $ex) {
            return new Response(['Error' => INVALID_DATA, 'errors' => $ex->errors()], 422);
        } catch (PDOException $ex) {
            return new Response(['Error' => INTERNAL_SERVER_ERROR, 'Operation' => $operation], 500);
        }
    }

    public function uploadFile(Request $request, $id)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        try {
            $operation = "Upload file Payment Request.";

            if (!$request->has('file')) {
                return response()->json(['Error' => NO_FILE_PROVIDED, "Operation" => $operation], 400);
            }
            if (!is_numeric($id)) {
                return response()->json(["Error" => INVALID_NUMERIC_ID, "Operation" => $operation], 422);
            }
            $base64data = $request->input('file');
            if (preg_match('/^data:([^;]+);base64,(.*)$/', $base64data, $matches)) {
                $type = $matches[1];
                $data = base64_decode($matches[2]);

                if ($data === false) {
                    return response()->json(['Error' => ERROR_DECODED, 'Operation' => $operation], 400);
                }


                $extension = '';
                switch ($type) {
                    case 'application/pdf':
                        $extension = 'pdf';
                        break;
                    case 'application/msword':
                        $extension = 'doc';
                        break;
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        $extension = 'docx';
                        break;
                    default:
                        return response()->json(['Error' => UNSUPPORTED_FILE, 'Operation' => $operation], 400);
                }

                $filename = "payment-request-{$id}." . $extension;
                $directoryPath = storage_path('uploads/payment-requests');

                if (!file_exists($directoryPath)) {
                    mkdir($directoryPath, 0755, true);
                }

                $path = $directoryPath . '/' . $filename;

                file_put_contents($path, $data);
                $paymentRequest = PaymentRequest::find($id);

                $paymentRequest->status = 'Paid';
                $paymentRequest->save();
                return response()->json(['response' => UPDATED, 'Operation' => $operation], 201);
            } else {
                return response()->json(['Error' => INVALID_FILE, 'Operation' => $operation], 400);
            }

        } catch (ModelNotFoundException $ex) {
            return response()->json(['Error' => PAYMENT_REQUEST_NOT_FOUND, 'Operation' => $operation], 404);
        } catch (ValidationException $ex) {
            return response()->json(['Error' => INVALID_DATA, 'Operation' => $operation], 422);
        } catch (Exception $ex) {
            return response()->json(['Error' => INTERNAL_SERVER_ERROR, 'Operation' => $operation], 500);
        }
    }

    public function create(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        $operation = "Create payment request";


        $this->validate($request, [
            'details' => 'required|array',
            'details.*.concept' => ['required', new Enum(PaymentRequestDetailConcepts::class)],
            'details.*.concept_description' => 'required|string',
            'details.*.amount' => 'required|numeric',
        ]);

        try {
            $user_id = $request->user()->id;
            $details = $request->input('details');

            $weekly_hours = Weeklyhours::where('idUser', $user_id)->latest('id')->first();
            if ($weekly_hours == null) return response()->json(["Error" => MISSING_WEEKLY_HOURS, "Operation" => $operation], 200);

            $payment_request_id = $this->persistNewPaymentRequest($user_id, $weekly_hours->currency, $details);

            if ($payment_request_id == null) {
                return response()->json(["Error" => INTERNAL_SERVER_ERROR, "Operation" => $operation], 500);
            }

            $payment_request = PaymentRequest::where('id', $payment_request_id)->first();
            $payment_request_details = PaymentRequestDetail::where('payment_request_id', $payment_request_id)->get();

            $payment_request->details = $payment_request_details;

            return response()->json(['response' => $payment_request], 201);
        } catch (Exception $e) {
            return response()->json(["Error" => INTERNAL_SERVER_ERROR, "Operation" => $operation], 500);
        }
    }



    public function update(Request $request, $payment_request)
    {
        $operation = "Update Payment Request";
        if (!is_numeric($payment_request)) return new Response(["Error" => INVALID_NUMERIC_ID], 422);
        if (empty($request->all())) return new Response(null, 304);

        try {
            $this->validate($request, [
                'status' => 'required|string|in:Pending,Canceled,Approved,Rejected',
            ]);

            $target = PaymentRequest::findOrFail($payment_request);
            $target->status = $request->status;
            $target->save();

            return response()->json(['response' => UPDATED], 200);
        } catch (ModelNotFoundException $ex) {
            return new Response(['Error' => PAYMENT_REQUEST_NOT_FOUND], 404);
        } catch (ValidationException $ex) {
            return new Response(['Error' => INVALID_DATA, 'errors' => $ex->errors()], 422);
        } catch (PDOException $ex) {
            return new Response(['Error' => INTERNAL_SERVER_ERROR, 'Operation' => $operation], 500);
        }
    }

    public function persistNewPaymentRequest(int|string $user_id, string $currency, $details): int|null
    {
        try {
            $attributes = [
                "user_id" => $user_id,
                "status" => PaymentRequestStatus::Pending,
                "currency" => $currency,
                "reply" => null
            ];

            DB::beginTransaction();

            $payment_request_id = DB::table('PaymentRequest')->insertGetId($attributes);

            foreach ($details as $detail) {
                $attributes = [
                    "payment_request_id" => $payment_request_id,
                    "concept" => PaymentRequestDetailConcepts::from($detail["concept"]),
                    "concept_description" => $detail["concept_description"],
                    "amount" => $detail["amount"]
                ];

                DB::table('PaymentRequestDetail')->insert($attributes);
            };

            DB::commit();

            return $payment_request_id;
        } catch (Exception $e) {
            DB::rollBack();
            return null;
        }
    }

    public function cancelPaymentRequest(Request $request)
    {
        try {
            $operation = 'Cancel payment request';
            $user_id = $request->user()->id;
            $payment_request_id = $request->route('payment_request_id');

            if (!is_numeric($payment_request_id)) {
                return new Response(array("Error" => INVALID_NUMERIC_ID, "Operation" => $operation), 400);
            }

            $payment_request = PaymentRequest::where('id', $payment_request_id)->where('user_id', $user_id)->first();

            if (!$payment_request) {
                return new Response(["Error" => PAYMENT_REQUEST_NOT_FOUND, "Operation" => $operation], 400);
            }

            $payment_request->status = PaymentRequestStatus::Canceled;

            $payment_request->save();

            return new Response(['response' => $payment_request]);
        } catch (Exception $e) {
            return new Response(["Error" => INTERNAL_SERVER_ERROR, "Operation" => $operation], 500);
        }
    }

    public function getBalanceSinceLastClosure(Request $request)
    {
        $operation = "Get balance since last closure";

        try {
            $user_id = $request->route('user_id');

            if (!is_numeric($user_id)) {
                return new Response(["Error" => INVALID_NUMERIC_ID, "Operation" => $operation], 400);
            }

            $weekly_hours = Weeklyhours::where('idUser', $user_id)->latest('id')->first();

            if ($weekly_hours == null) return new Response(['Error' => MISSING_WEEKLY_HOURS, "Operation" => $operation], 422);

            $last_closure = PaymentRequest::latest()
                ->whereHas('payment_request_details', function ($query) {
                    $query->where('concept', PaymentRequestDetailConcepts::Closure);
                })
                ->where('user_id', $user_id)
                ->first();

            if ($last_closure != null) $start_date = $last_closure->created_at;
            else $start_date = date("Y-m-01 00:00:00");

            $tracks = Tracks::join("Tasks", "Tracks.idTask", "=", "Tasks.id")
                ->where("Tracks.idUser", $user_id)
                ->where("Tracks.startTime", ">=", $start_date)
                ->whereNotNull("Tracks.endTime")
                ->select(
                    "Tracks.trackCost",
                    "Tasks.name AS taskName",
                    "Tracks.duracion AS trackDuration"
                )->get();

            $amount = 0;

            foreach ($tracks as $track) {
                $amount += $track->trackCost;
            };

            return new Response(['response' => [
                'tracks' => $tracks,
                'start_date' => $start_date,
                'amount' => $amount,
                'currency' => $weekly_hours->currency
            ]], 200);
        } catch (Exception $e) {
            // echo $e;
            return new Response(["Error" => INTERNAL_SERVER_ERROR, "Operation" => $operation], 500);
        }
    }

    public function getUserHistory(Request $request)
    {
        try {
            $operation = "Get user payment request history";

            $user_id = $request->route('user_id');

            if (!is_numeric($user_id)) {
                return new Response(["Error" => INVALID_NUMERIC_ID, "Operation" => $operation], 400);
            }

            $history = PaymentRequest::with("payment_request_details")->where("user_id", $user_id)->get();

            return new Response(['response' => $history], 200);
        } catch (Exception $e) {
            return new Response(["Error" => INTERNAL_SERVER_ERROR, "Operation" => $operation], 500);
        }
    }

    public function createPaymentRequestDetail(
        int $payment_request_id,
        PaymentRequestDetailConcepts $concept,
        string $concept_description,
        float $amount
    ) {
        $attributes = [
            "payment_request_id" => $payment_request_id,
            "concept" => $concept,
            "concept_description" => $concept_description,
            "amount" => $amount
        ];

        $payment_request_detail = PaymentRequestDetail::create($attributes);

        return $payment_request_detail;
    }
}
