<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'Pendente', 'slug' => 'pending', 'color' => 'bg-yellow-400', 'order' => 1],
            ['name' => 'Em Andamento', 'slug' => 'in_progress', 'color' => 'bg-blue-400', 'order' => 2],
            ['name' => 'Concluído', 'slug' => 'completed', 'color' => 'bg-green-400', 'order' => 3],
        ];

        foreach ($statuses as $status) {
            Status::updateOrCreate(
                ['slug' => $status['slug']],
                $status
            );
        }
    }
}