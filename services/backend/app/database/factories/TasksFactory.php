<?php

namespace Database\Factories;

use App\Models\Tasks;
use DateTime;
use Illuminate\Database\Eloquent\Factories\Factory;

class TasksFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tasks::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $today = new DateTime('now');
        $yesterday = new DateTime('yesterday');

        return [
            'name' => $this->faker->name, 
            'description' => $this->faker->text(25), 
            'comments' => $this->faker->text(50),
            'duration' => null, 
            'users' => $this->faker->text(100), 
            'type' => 'manual', 
            'startDate' => $yesterday, 
            'endDate' => $today,
            'status' => 'doing', 
            'active' => '1',
        ];
    }
}
