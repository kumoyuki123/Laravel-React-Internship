<?php
namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    // Role constants
    const ROLE_SUPERUSER  = 'superuser';
    const ROLE_HR_ADMIN   = 'hr_admin';
    const ROLE_SUPERVISOR = 'supervisor';
    const ROLE_LEADER     = 'leader';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    /**
     * Check if user is superuser
     */
    public function isSuperuser()
    {
        return $this->hasRole(self::ROLE_SUPERUSER);
    }

    /**
     * Check if user is HR admin
     */
    public function isHrAdmin()
    {
        return $this->hasRole(self::ROLE_HR_ADMIN);
    }

    /**
     * Check if user is supervisor
     */
    public function isSupervisor()
    {
        return $this->hasRole(self::ROLE_SUPERVISOR);
    }

    /**
     * Check if user is leader
     */
    public function isLeader()
    {
        return $this->hasRole(self::ROLE_LEADER);
    }

    /**
     * Check if user can create users (only superuser can create HR admins, supervisors, leaders)
     */
    public function canCreateUsers()
    {
        return $this->isSuperuser();
    }
}
