<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentRequestDetailMigration extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('PaymentRequestDetail', function (Blueprint $table) {
            $table->id();
            $table->integer('payment_request_id');
            $table->enum('concept', ['Benefits', 'Compensation', 'Closure']);
            $table->string('concept_description');
            $table->double('amount');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('PaymentRequestDetail');
    }
}
