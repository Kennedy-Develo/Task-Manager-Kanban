<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    public function getAllProjects(): Collection
    {
        return Project::withCount('tasks')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createProject(array $data): Project
    {
        return Project::create($data);
    }

    public function deleteProject(Project $project): bool
    {
        return $project->delete();
    }

    public function findProject(int $id): ?Project
    {
        return Project::find($id);
    }
}
