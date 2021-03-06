<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Section extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
    protected $table = 'sections';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'project_id', 'name'
    ];

    /**
     * Modal validation.
     * @var array
     */
    public $validation = [
        'name' => 'required'
    ];

    /**
     * Custom validation messages
     * @var array
     */
    public $messages = [
        'name.required' => 'Please provide a name for this section'
    ];


    /***********************
     * Eloquent Relationships
     **********************/

    /**
     * Get all section tasks.
     */
    public function tasks(){
        return $this->hasMany(Task::class, 'section_id', 'id' )->orderBy('tasks.sort_order');
    }
    /**
     * Get section project.
     */
    public function project(){
        return $this->belongsTo(Project::class, 'project_id','id');
    }

    /***********************
     * Methods
     **********************/

    /**
     * delete all the tasks within the section
     */
    public function deleteTasks(){

        return $this->tasks()->get()->each(function ($task){
            $task->delete();
        });
    }
}
