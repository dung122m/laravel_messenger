<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


/**
 * @mixin Builder
 */
class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id1',
        'user_id2',
        'last_message_id'
    ];

    public static function getConversationForSideBar(User $user)
    {
        $users = User::getUsersExceptUser($user);
        $groups = Group::getGroupsForUser($user);
        return $users->map(function (User $user) {
            return $user->toConversationArray();
        })->concat($groups->map(function (Group $group) {
            return $group->toConversationArray();
        }));
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function user1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id1');
    }

    public function user2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id2');
    }

    public static function updateConversationWithMessage(int $userId1, int $userId2, Model|Message $message)
    {
        $conversation = Conversation::where(function ($query) use ($userId1, $userId2) {
            $query
                ->where('user_id1', $userId1)
                ->where('user_id2', $userId2);
        })->orWhere(function ($query) use ($userId1, $userId2) {
            $query
                ->where('user_id1', $userId2)
                ->where('user_id2', $userId1);
        })->first();

        if ($conversation) {
            $conversation->update(['last_message_id' => $message->id]);
        } else {
            (new Conversation)->create([
                'user_id1' => $userId1,
                'user_id2' => $userId2,
                'last_message_id' => $message->id
            ]);
        }
    }
}
