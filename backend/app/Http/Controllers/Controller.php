<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    public function index(): JsonResponse
    {
        $projects = $this->projectService->getAllProjects();
        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject($request->validated());
        return response()->json($project, 201);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->projectService->deleteProject($project);
        return response()->json(['message' => 'Projeto deletado com sucesso.'], 200);
    }
}
