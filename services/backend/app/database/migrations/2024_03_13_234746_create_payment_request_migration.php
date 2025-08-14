<?php

use App\Enums\PaymentRequestStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentRequestMigration extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('PaymentRequest', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Canceled']);
            $table->string('currency');
            $table->string('reply')->nullable();
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
        Schema::dropIfExists('PaymentRequest');
    }
}
