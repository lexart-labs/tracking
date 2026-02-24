<?php

namespace App\Http\Controllers;

use App\Models\Clients;
use Exception;
use Illuminate\Http\Request;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Response;

/**
 * Controller for managing Client operations.
 * Handles CRUD for clients and their active status.
 */
class ClientsController extends BaseController
{
    /**
     * Retrieves all clients or a specific client by ID.
     *
     * @param Request $request
     * @param int|null $id Optional client ID
     * @return array|Response
     */
    public function all(Request $request, $id = null)
    {
        try {
            if (!empty($id)) {
                return array('response' => Clients::where('id', $id)->first());
            }

            // Return all clients (active and inactive) for the React list view
            return array('response' => Clients::all());
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "clients all"), 500));
        }
    }

    /**
     * Creates a new client.
     *
     * @param Request $request
     * @return Clients
     */
    public function new(Request $request)
    {
        $this->validate($request, [
            "name" => "required",
            "company" => "required",
            "active" => "boolean"
        ]);

        $client = $request->only(["name", "company", "active"]);
        if (!isset($client['active'])) {
            $client['active'] = 1;
        }

        return Clients::create($client);
    }

    /**
     * Updates an existing client.
     *
     * @param Request $request
     * @param int $id The client ID
     * @return int|Response
     */
    public function update(Request $request, $id)
    {
        $request["id"] = $id;

        $this->validate($request, [
            "name" => "required",
            "company" => "required",
            "active" => "boolean",
            "id" => "required|numeric|exists:Clients"
        ]);

        try {
            $client = $request->only(["name", "company", "id", "active"]);
            $updateData = [
                "name" => $client['name'],
                "company" => $client['company']
            ];

            if (isset($client['active'])) {
                $updateData['active'] = $client['active'];
            }

            return Clients::where("id", $client['id'])->update($updateData);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "clients update"), 500));
        }
    }

    /**
     * Retrieves a list of current clients (id and name only).
     *
     * @param Request $request
     * @return array|Response
     */
    public function current(Request $request)
    {
        try {
            $clients = Clients::select("id", "name")->get();
            return array("response" => $clients);
        } catch (Exception $e) {
            return (new Response(array("Error" => BAD_REQUEST, "Operation" => "clients current"), 500));
        }
    }
}

