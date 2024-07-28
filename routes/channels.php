<?php

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('online', function (User $user) {
    return $user ? new UserResource($user) : null;
});
Broadcast::channel('message.user.{userId1}-{userId2}', function (User $user, $userId1, $userId2) {
    return $user->id === (int) $userId1 || $user->id === (int) $userId2 ? new UserResource($user) : null;
});

Broadcast::channel('message.group.{groupId}', function (User $user, $groupId) {
    return $user->groups->contains('id', $groupId) ? $user : null;

});
Broadcast::channel('group.deleted.{groupId}', function (User $user, $groupId) {
    return $user->groups->contains('id', $groupId);

});
