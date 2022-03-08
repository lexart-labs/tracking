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

Route::get('/', function ($router) {
    return $router->app->version();
});

Route::group(['prefix' => 'api'], function ($router) {

    //User
    Route::group(['prefix' => 'user'], function () {
        Route::post('login', 'UserController@login');
        
        Route::group(['middleware' => 'auth:api'], function () {

            Route::get('all', 'UserController@all');

            //Current
            Route::get('current', 'UserController@current');
            Route::get('current/hours', 'UserController@currentHours');
            Route::get('current/exceptions/{date}', 'UserController@currentExceptions');

            //Performances
            Route::group(['prefix' => 'performance'], function() {
                Route::post('current', 'PerformanceController@current');
                Route::post('current/save', 'PerformanceController@saveCurrent');
            });
        });
        
        Route::group(['middleware' => 'admin:api'], function () {
            Route::post('register', 'UserController@register');
            Route::delete('delete', 'UserController@delete');
            Route::post('undelete', 'UserController@undelete');
            Route::get('all-admin', 'UserController@allAdmin');
            Route::get('{id}', 'UserController@userById');
            

            //Hours
            Route::get('{id}/hours', 'UserController@hours');

            //Exceptions
            Route::get('{id}/exceptions/{date}', 'UserController@exceptions');

            //Performances
            Route::get('{id}/performance', 'PerformanceController@userId');

            Route::group(['prefix' => 'performance'], function() {
                Route::get('all', 'PerformanceController@all');
                Route::post('save', 'PerformanceController@save');
            });
        });
    });
    
    //Projects
    Route::group(['prefix' => 'projects', 'middleware' => 'auth:api'], function() {
        Route::get('all', 'ProjectsController@all');
        Route::get('{id}', 'ProjectsController@all');

        Route::get('client/{id}', 'ProjectsController@client');

        //Tasks
        Route::group(['prefix' => 'tasks'], function() {
            Route::get('all', 'TasksController@all');
            Route::get('{id}', 'TasksController@all');
            Route::delete('delete', 'TasksController@delete');
            Route::post('undelete', 'TasksController@undelete');
            Route::put('update', 'TasksController@update');
            Route::post('create', 'TasksController@create');
            
            //Tasks / Project
            Route::get('project/{id}', 'TasksController@project');
            
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
    });

    //Tracks
    Route::group(['prefix' => 'tracks', 'middleware' => 'auth:api'], function() {
        Route::post('new', 'TracksController@new');
        Route::put('update', 'TracksController@update');
        
        //User tracks
        Route::group(['prefix' => 'user'], function(){
            Route::get('current', 'TracksController@current');
            Route::get('current/last', 'TracksController@currentUserLastTrack');
            Route::post('current/date', 'TracksController@currentUserDate');
            Route::get('current/calendar/{fecha}', 'TracksController@currentCalendar');
            Route::post('current/month', 'TracksController@currentMonth');

            Route::post('current/all', 'TracksController@currentAll');
            Route::post('current/trello', 'TracksController@trelloTracksCurrent');
        });
        
        //User tracks - admin
        Route::group(['prefix' => 'user', 'middleware' => 'admin:api'], function () {
            Route::post('all', 'TracksController@all');
            Route::post('{id}/all', 'TracksController@all');
            
            Route::get('{id}', 'TracksController@all');

            Route::get('{id}/calendar/{fecha}', 'TracksController@calendar');
        });
    });

    //Weeklyhours
    Route::group(['prefix' => 'weeklyhours', 'middleware' => 'auth:api'], function(){
        Route::get('all', 'WeeklyhoursController@all');
        Route::get('{id}', 'WeeklyhoursController@all');

        Route::put('update', 'WeeklyhoursController@update');
        Route::post('new', 'WeeklyhoursController@new');

        //User weeklyhours
        Route::group(['prefix' => 'user'], function(){
            Route::get('current', 'WeeklyhoursController@current');
            Route::get('{id}', 'WeeklyhoursController@user'); 
        });
    });

    //Clients
    Route::group(['prefix' => 'clients', 'middleware' => 'admin:api'], function(){
        Route::get('all', 'ClientsController@all');
        Route::get('{id}', 'ClientsController@all');
        
        Route::put('update', 'ClientsController@update');
        Route::post('new', 'ClientsController@new');
    });

    //Sales
    Route::group(['prefix' => 'sales', 'middleware' => 'auth:api'], function(){
        Route::get('all', 'SalesController@all');
        Route::get('{id}', 'SalesController@all');

        Route::post('new', 'SalesController@new');
        Route::put('update', 'SalesController@update');
        Route::delete('delete', 'SalesController@delete');
        Route::post('undelete', 'SalesController@undelete');
    });
});
