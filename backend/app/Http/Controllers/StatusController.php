<?php

namespace App\Http\Controllers;

use App\Services\StatusService;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    public function __construct(
        private StatusService $statusService
    ) {}

    public function index(): JsonResponse
    {
        $statuses = $this->statusService->getAllStatuses();
        return response()->json($statuses);
    }
}
