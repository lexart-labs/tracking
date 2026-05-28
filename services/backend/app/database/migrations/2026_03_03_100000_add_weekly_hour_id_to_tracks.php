<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWeeklyHourIdToTracks extends Migration
{
    public function up()
    {
        Schema::table('Tracks', function (Blueprint $table) {
            $table->unsignedBigInteger('idWeeklyHour')->nullable()->after('currency');
        });
    }

    public function down()
    {
        Schema::table('Tracks', function (Blueprint $table) {
            $table->dropColumn('idWeeklyHour');
        });
    }
}
