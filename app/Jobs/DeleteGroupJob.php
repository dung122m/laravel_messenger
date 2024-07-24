<?php

namespace App\Jobs;

use App\Events\GroupDeleted;
use App\Models\Group;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DeleteGroupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Group $group)
    {
        //
    }

    public function handle(): void
    {
        try {
            $id = $this->group->id;
            $name = $this->group->name;
            $this->group->last_message_id = null;
            $this->group->save();
            $this->group->messages->each->delete();
            $this->group->users()->detach();
            $this->group->delete();
            GroupDeleted::dispatch($id, $name);
        } catch (\Exception $e) {
            \Log::error('Error in DeleteGroupJob: ' . $e->getMessage());
        }
    }
}

