<?php

namespace Database\Factories;

use App\Models\Tracks;
use DateTime;
use Illuminate\Database\Eloquent\Factories\Factory;

class TracksFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tracks::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $date1 = date('Y-m-d H:m:s', strtotime("+1 days"));
        $date2 = date('Y-m-d H:m:s', strtotime("+2 days"));

        $date_diff = abs(strtotime($date2) - strtotime($date1))/3600;

        return [
            'name' => $this->faker->name,
            'typeTrack' => 'manual',
            'currency' => 'USD',
            'trackCost' => 100,
            'startTime' => $date1,
            'endTime' => $date2,
            'duracion' => $date_diff,
        ];
    }
}
