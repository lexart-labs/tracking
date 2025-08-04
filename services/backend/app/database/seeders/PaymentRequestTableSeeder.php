<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PaymentRequestTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\PaymentRequest::factory()->count(10)->create();
    }
}
