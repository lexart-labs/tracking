<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTasksMigration extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('Tasks', function (Blueprint $table) {
            $table->id();
            $table->integer('idProject')->nullable();
            $table->string('name');
            $table->string('description');
            $table->string('comments')->nullable();
            $table->time('duration')->nullable();
            $table->string('users')->nullable();
            $table->string('type');
            $table->string('status');
            $table->tinyInteger('active');
            $table->date('startDate')->nullable();
            $table->date('endDate')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('Tasks');
    }
}
