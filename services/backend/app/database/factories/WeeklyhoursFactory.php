<?php

namespace Database\Factories;

use App\Models\Weeklyhours;
use Illuminate\Database\Eloquent\Factories\Factory;

class WeeklyhoursFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Weeklyhours::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'userName' => $this->faker->name,
            'costHour' => $this->faker->randomNumber(2),
            'workLoad' => 40,
            'currency' => 'USD',
            'borrado' => 0
        ];
    }
}
