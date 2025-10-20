<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ) {}

    public function index(Project $project): JsonResponse
    {
        $tasks = $this->taskService->getTasksByProject($project);
        return response()->json($tasks);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());
        return response()->json($task, 201);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task = $this->taskService->updateTask($task, $request->validated());
        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->taskService->deleteTask($task);
        return response()->json(['message' => 'Tarefa deletada com sucesso.'], 200);
    }
}