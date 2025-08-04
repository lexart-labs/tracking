<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTracksMigration extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('Tracks', function (Blueprint $table) {
            $table->id();
            $table->integer('idTask')->nullable();
            $table->integer('idUser')->nullable();
            $table->string('name');
            $table->string('typeTrack');
            $table->string('currency')->nullable();
            $table->integer('trackCost')->nullable();
            $table->integer('idProyecto')->nullable();
            $table->integer('duracion');
            $table->dateTime('startTime');
            $table->dateTime('endTime');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('Tracks');
    }
}
