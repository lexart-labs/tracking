<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class DropLegacyCatalogTables extends Migration
{
    public function up()
    {
        Schema::dropIfExists('Banks');
        Schema::dropIfExists('Bills');
        Schema::dropIfExists('Budgets');
        Schema::dropIfExists('EasyWeb');
        Schema::dropIfExists('Evaluate');
        Schema::dropIfExists('Finances');
        Schema::dropIfExists('Hosting');
        Schema::dropIfExists('HoursCost');
        Schema::dropIfExists('JiraBoards');
        Schema::dropIfExists('JiraTasks');
        Schema::dropIfExists('Performance');
        Schema::dropIfExists('Products');
        Schema::dropIfExists('Sales');
        Schema::dropIfExists('TaskAutomatic');
        Schema::dropIfExists('TrelloBoard');
        Schema::dropIfExists('TrelloTask');
        Schema::dropIfExists('UserExceptions');
        Schema::dropIfExists('UsersHours');
    }

    public function down()
    {
    }
}
