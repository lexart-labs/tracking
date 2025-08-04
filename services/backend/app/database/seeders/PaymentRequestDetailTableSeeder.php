<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PaymentRequestDetailTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\PaymentRequestDetail::factory()->count(25)->create();
    }
}
