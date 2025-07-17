<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

//ROUTES

Route::get('/', function () {
    // return Route::version();
    return "test";
});

Route::group(['prefix' => 'api'], function () {

    //User
    Route::group(['prefix' => 'user'], function () {
        Route::post('login', 'UserController@login');

        Route::group(['middleware' => 'auth:api'], function () {

            Route::get('all', 'UserController@all');

            //Current
            Route::get('current', 'UserController@current');
            Route::get('current/hours', 'UserController@currentHours');
            Route::get('current/exceptions/{date}', 'UserController@currentExceptions');
            Route::post('exceptions/{id}/{date}', 'UserController@createException');
            Route::post('/fixeds/{id}', 'UserController@upsertFixed');
            Route::put('update/{id}', 'UserController@update');

            //Performances
            Route::group(['prefix' => 'performance'], function() {
                Route::post('current', 'PerformanceController@current');
                Route::post('current/save', 'PerformanceController@saveCurrent');
            });
        });

        Route::group(['middleware' => 'pm:api'], function () {
            Route::post('register', 'UserController@register');
            //Route::delete('delete', 'UserController@delete');
            //Route::post('undelete', 'UserController@undelete');
            Route::get('all-admin', 'UserController@allAdmin');
            Route::get('{id}', 'UserController@userById');


            //Hours
            Route::get('{userId}/hours', 'UserController@hours');

            //Exceptions
            Route::get('{userId}/exceptions/{date}', 'UserController@exceptions');

            //Performances
            Route::post('{id}/performance', 'PerformanceController@userId');

            Route::group(['prefix' => 'performance'], function() {
                Route::get('all', 'PerformanceController@all');
                Route::post('{id}/save', 'PerformanceController@save');
            });
        });
    });

    //Projects
    Route::group(['prefix' => 'projects', 'middleware' => 'auth:api'], function() {
        Route::get('all', 'ProjectsController@all');
        Route::get('{id}', 'ProjectsController@all');

        Route::get('client/{id}', 'ProjectsController@client');

        Route::group(['middleware' => 'pm:api'], function() {
            Route::post('new', 'ProjectsController@new');
            Route::put('update', ["middleware" => "pm:api", "uses" => 'ProjectsController@update']);
        });

        //Tasks
        Route::group(['prefix' => 'tasks', 'middleware' => 'pm:api'], function() {
            Route::post('all', 'TasksController@all');
            Route::get('{id}', 'TasksController@all');
            Route::delete('delete', 'TasksController@delete');
            Route::post('undelete', 'TasksController@undelete');
            Route::put('update', 'TasksController@update');
            Route::post('new', 'TasksController@create');

            Route::get('project/{id}', 'TasksController@project');
            Route::post('id-user/{idUser}', 'TasksController@getTasksByUserFilter');

            //User
            Route::group(['prefix' => 'user'], function(){
                Route::post('current', 'TasksController@currentUser'); //POST POR CAUSA DA API ANTIGA
                Route::get('{id}', 'TasksController@userId');
            });

            //Tasks trello
            Route::group(['prefix' => 'trello'], function (){
                Route::get('all', 'TrelloTasksController@all');
                Route::get('allOld', 'TrelloTasksController@allOld');
                Route::get('{id}', 'TrelloTasksController@all');

                Route::post('new', 'TrelloTasksController@new');

                Route::post('newOld', 'TrelloTasksController@taskNewFrontOld');

                Route::put('update', 'TrelloTasksController@update');

                Route::group(['prefix' => 'boards'], function (){
                    Route::get('all', 'BoardTrelloController@all');
                    Route::get('{id}', 'BoardTrelloController@all');

                    Route::post('new', 'BoardTrelloController@new');
                });
            });
        });

        Route::group(['prefix' => 'tasks'], function() {
            Route::post('all', 'TasksController@all');

            Route::group(['prefix' => 'user'], function(){
                Route::post('current', 'TasksController@currentUser'); //POST POR CAUSA DA API ANTIGA
                Route::get('{id}', 'TasksController@userId');
            });

            Route::group(['prefix' => 'trello'], function (){
                Route::get('all', 'TrelloTasksController@all');
                Route::get('allOld', 'TrelloTasksController@allOld');
                Route::get('{id}', 'TrelloTasksController@all');

                Route::post('new', 'TrelloTasksController@new');

                Route::post('newOld', 'TrelloTasksController@taskNewFrontOld');

                Route::group(['prefix' => 'boards'], function (){
                    Route::get('all', 'BoardTrelloController@all');
                    Route::get('{id}', 'BoardTrelloController@all');

                    Route::post('new', 'BoardTrelloController@new');
                });
            });
        });
    });

    //Tracks
    Route::group(['prefix' => 'tracks', 'middleware' => 'auth:api'], function() {

        Route::post('new', 'TracksController@new');

        Route::group(['middleware' => 'pm:api'], function(){
            Route::get('tracking', 'TracksController@endlessTracks');
            Route::post('{id}/month', 'TracksController@month');

            //Perguntar a rodri
            Route::get('all', 'TracksController@all');
            Route::get('{id}', 'TracksController@all');
            Route::get('tracks-by-year/{idUser}/{year}', 'TracksController@getUserHoursByYear');

            //New tracks and update

            Route::put('update', 'TracksController@update');
        });

        Route::group(['prefix' => 'user'], function(){
            Route::post('current', 'TracksController@current');
            Route::get('current/last', 'TracksController@currentUserLastTrack');
            Route::post('current/date', 'TracksController@currentUserDate');
            Route::get('current/calendar/{fecha}', 'TracksController@currentCalendar');
            Route::post('current/month', 'TracksController@currentMonth');
            Route::get('history', 'TracksController@historyByUser');

            //New tracks and update
            Route::put('current/update', 'TracksController@currentUpdate');

            //Tracks - reportes
            Route::post('current/all', 'TracksController@current');
            Route::post('current/trello', 'TracksController@trelloTracksCurrent');
        });

        Route::group(['prefix' => 'user', 'middleware' => 'pm:api'], function() {

            //Calendario
            Route::get('{id}/calendar/{fecha}', 'TracksController@calendar');

            Route::post('all', 'TracksController@all');
            Route::post('{id}', 'TracksController@all');

            Route::post('trello/all', 'TracksController@trelloTracks');
            Route::post('trello/{id}', 'TracksController@trelloTracks');

        });
    });

    //Weeklyhours
    Route::group(['prefix' => 'weeklyhours', 'middleware' => 'auth:api'], function(){
        //User weeklyhours
        Route::group(['prefix' => 'user'], function(){
            Route::get('current', 'WeeklyhoursController@current');
        });

        Route::group(['middleware' => 'pm:api'], function () {
            Route::get('all', 'WeeklyhoursController@all');
            Route::get('{id}', 'WeeklyhoursController@all');

            Route::put('update', 'WeeklyhoursController@update');
            Route::post('new', 'WeeklyhoursController@new');

            //User weeklyhours admin
            Route::group(['prefix' => 'user'], function(){

                Route::get('{id}', 'WeeklyhoursController@user');
            });
        });
    });

    //Clients
    Route::group(['prefix' => 'clients'], function(){

        Route::get('current', 'ClientsController@current');

        Route::group(['middleware' => 'pm:api'], function(){
            Route::get('all', 'ClientsController@all');
            Route::get('{id}', 'ClientsController@all');

            Route::put('update', 'ClientsController@update');
            Route::put('update/{id}', 'ClientsController@update'); //Somiente para PM
            Route::post('new', 'ClientsController@new');
        });
    });

    // Sales
    Route::group(['prefix' => 'sales', 'middleware' => 'pm:api'], function(){
        Route::get('all', 'SalesController@all');
        Route::get('{id}', 'SalesController@all');

        Route::get('all/by-date/{dateIni}/{dateEnd}', 'SalesController@getAllSaelsByMonth');
        Route::get('all/by-date/{dateIni}/{dateEnd}/{idUser}', 'SalesController@getAllSaelsByMonth');

        Route::post('new', 'SalesController@new');
        Route::put('update', 'SalesController@update');
        Route::delete('delete', 'SalesController@delete');
        Route::post('undelete', 'SalesController@undelete');
    });

    //Banks
    Route::group(['prefix' => 'Banks', 'middleware' => 'auth:api'], function(){

        Route::group(['prefix' => 'user'], function(){
            Route::get('current', 'BanksController@current');

            Route::post('new', 'BanksController@new');

            Route::group(['prefix' => 'current'], function(){
                Route::delete('delete/{id}', 'BanksController@currentDelete');
                Route::get('undelete/{id}', 'BanksController@currentUndelete');

                Route::put('update', 'BanksController@updateCurrent');

                Route::get('active/{id}', 'BanksController@currentActive');
                Route::get('deactive/{id}', 'BanksController@currentDeActive');
            });
        });

        Route::group(['middleware' => 'admin:api'], function(){
            Route::get('all', 'BanksController@all');
            Route::get('{id}', 'BanksController@all');
        });

        Route::group(['prefix' => 'user', 'middleware' => 'pm:api'], function(){
            Route::get('{id}', ["middleware" => "admin:api", "uses" => "BanksController@user"]);
            Route::put('update', ["middleware" => "admin:api", "uses" => "BanksController@update"]);

            Route::delete('{userID}/delete/{id}', 'BanksController@delete');
            Route::get('{userID}/undelete/{id}', 'BanksController@undelete');

            Route::get('{userID}/active/{id}', 'BanksController@active');
            Route::get('{userID}/deactive/{id}', 'BanksController@deActive');
        });
    });

    //Finanzas
    Route::group(['prefix' => 'finances', 'middleware' => 'admin:api'], function(){

        Route::get("all/date/{firstDate}/{lastDate}", 'FinancesController@all');
    });

    //Housting
    Route::group(['prefix' => 'hosting', 'middleware' => 'admin:api'], function() {

        Route::get('all', 'HostingController@all');
        Route::put('update', 'HostingController@update');
        Route::get('{id}', 'HostingController@all');
    });

    //Productos
    Route::group(['prefix' => 'products', 'middleware' => 'admin:api'], function(){

        Route::get('all', 'ProductsController@all');
        Route::get('{id}', 'ProductsController@all');
    });

    //EasyWeb

    Route::group(['prefix' => 'easy-web', 'middleware' => 'admin:api'], function(){

        Route::get('all', 'EasyWebController@all');
        Route::get('{id}', 'EasyWebController@all');
    });

    Route::group(['prefix' => 'payment_requests', 'middleware' => 'auth:api'], function () {
        Route::get('all', 'PaymentRequestController@all');
        Route::put('update/{payment_request}', 'PaymentRequestController@update');
        Route::post('create', 'PaymentRequestController@create');
        Route::put('{payment_request_id}/cancel', 'PaymentRequestController@cancelPaymentRequest');
        Route::get('{user_id}', 'PaymentRequestController@getUserHistory');
        Route::get('closure/{user_id}', 'PaymentRequestController@getBalanceSinceLastClosure');
        Route::put('{payment_request_id}/update_detail', 'PaymentRequestController@updateConceptDescription');
        Route::post('{id}/upload', 'PaymentRequestController@uploadFile');
    });
});
