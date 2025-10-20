<?php

namespace App\Services;

use App\Models\Status;
use Illuminate\Database\Eloquent\Collection;

class StatusService
{
    public function getAllStatuses(): Collection
    {
        return Status::orderBy('order')->get();
    }
}
