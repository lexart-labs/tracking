<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeeklyhoursMigration extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('WeeklyHours', function (Blueprint $table) {
            $table->id();
            $table->integer('idUser')->nullable();
            $table->string('userName')->nullable();
            $table->float('costHour')->nullable();
            $table->float('workLoad')->nullable();
            $table->string('currency')->nullable();
            $table->tinyInteger('borrado')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('WeeklyHours');
    }
}
