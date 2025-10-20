<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Project;
use App\Models\Status;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function getTasksByProject(Project $project): Collection
    {
        return $project->tasks()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createTask(array $data): Task
    {
        // Define status padrão se não fornecido (busca o primeiro status da tabela)
        if (!isset($data['status'])) {
            $firstStatus = Status::orderBy('order')->first();
            $data['status'] = $firstStatus ? $firstStatus->slug : 'pending';
        }

        return Task::create($data);
    }

    public function updateTask(Task $task, array $data): Task
    {
        $task->update($data);
        return $task->fresh();
    }

    public function deleteTask(Task $task): bool
    {
        return $task->delete();
    }
}
