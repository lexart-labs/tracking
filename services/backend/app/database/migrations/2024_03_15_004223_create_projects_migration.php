<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectsMigration extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('Projects', function (Blueprint $table) {
            $table->id();
            $table->integer('idClient')->nullable();
            $table->string('name');
            $table->string('description');
            $table->string('comments')->nullable();
            $table->time('duration')->nullable();
            $table->time('tracked');
            $table->integer('totalCost');
            $table->integer('presupuesto');
            $table->binary('externals')->nullable();
            $table->integer('active');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('Projects');
    }
}
