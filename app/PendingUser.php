<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
class PendingUser extends Model
{
    use Notifiable;
    protected $table = 'users_pending';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'team_id', 'token', 'email', 'created_by_id'
    ];

    /**
     * Modal validation.
     * @var array
     */
    public $validation = [
        'email' => 'required|email|unique:users',
    ];

    /**
     * Custom validation messages
     * @var array
     */
    public $messages = [
        'email.unique' => 'User already exists',
        'email.email' => 'That email address doesn\'t look quiet right',
    ];
}