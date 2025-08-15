<?php

namespace Database\Factories;

use App\Models\Projects;
use App\Models\Weeklyhours;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectsFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Projects::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'description' => $this->faker->text(50),
            'comments' => $this->faker->text(100),
            'duration' => $this->faker->time(),
            'tracked' => $this->faker->time(),
            'totalCost' => $this->faker->randomNumber(),
            'presupuesto' => $this->faker->randomNumber(),
            'externals' => 0,
            'active' => 1
        ];
    }
}