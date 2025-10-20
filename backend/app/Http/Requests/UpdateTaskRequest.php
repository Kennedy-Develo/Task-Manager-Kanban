<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|string|max:255',
            'descricao' => 'sometimes|nullable|string',
            'status' => 'sometimes|string|in:pending,in_progress,completed',
            'project_id' => 'sometimes|exists:projects,id',
        ];
    }
}