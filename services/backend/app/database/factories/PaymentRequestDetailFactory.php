<?php

namespace Database\Factories;

use App\Models\PaymentRequest;
use App\Models\PaymentRequestDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentRequestDetailFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PaymentRequestDetail::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'concept_description' => "mock",
            'payment_request_id' => PaymentRequest::all()->random()->id,
            'concept' => $this->faker->randomElement([
                'Benefits',
                'Compensation',
                'Closure',
                ]),
            'concept_description' => $this->faker->paragraph(1),
            'amount' => 100,
        ];
    }
}
