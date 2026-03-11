<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddDateRangeToWeeklyhours extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('WeeklyHours', 'valid_from')) {
            Schema::table('WeeklyHours', function (Blueprint $table) {
                $table->date('valid_from')->nullable();
                $table->date('valid_until')->nullable();
            });
        }

        DB::statement("UPDATE WeeklyHours SET valid_from = CURDATE() WHERE valid_from IS NULL");

        Schema::table('WeeklyHours', function (Blueprint $table) {
            $table->date('valid_from')->nullable(false)->change();
        });
    }

    public function down()
    {
        Schema::table('WeeklyHours', function (Blueprint $table) {
            $table->dropColumn(['valid_from', 'valid_until']);
        });
    }
}
