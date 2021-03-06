<?php

namespace Tests\Feaure\Task;

use App\UserTask;
use App\UserTeam;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Notification;
use App\Notifications\UserAssignedToTask;
use Laravel\Passport\Passport;
use App\Team;
use App\User;
use App\Project;
use App\Section;
use App\Task;
use Faker\Factory as Faker;
use Auth;

class TaskGetTest extends TestCase
{
    use DatabaseTransactions;
    protected $team;
    protected $project;
    protected $section;
    protected $task;

    protected function setUp(){
        parent::setUp();
        /** create and act as user */
        Passport::actingAs(
            factory(User::class)->create()
        );
        /** set up new team */
        $this->team = factory(Team::class)->create();
        /** add user to team */
        factory(UserTeam::class)->create([
            'user_id' => Auth::user()->id,
            'team_id' => $this->team->id,
        ]);
        /** create new project */
        $this->project = factory(Project::class)->create([
            'team_id' => $this->team->id
        ]);
        /** create new project section */
        $this->section = factory(Section::class)->create([
            'project_id' => $this->project->id
        ]);
        /** create new task and add to section */
        $this->task = factory(Task::class)->create([
            'section_id' => $this->section->id,
            'sort_order' => 1
        ]);
    }

    /**
     * Tests Route task.show
     *
     * @test
     */
    public function can_get_task()
    {
        /** Act */
        $response = $this->json('GET', "/api/team/".$this->team->id."/project/".$this->project->id."/section/".$this->section->id."/task/".$this->task->id);
        /** Assert response is correct */
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'task has been found',
                'task' => [
                    "id"=> $this->task->id,
                    "priority_id"=> $this->task->priority_id,
                    "section_id"=> $this->task->section_id,
                    "name"=>  $this->task->name,
                    "note"=>  $this->task->note,
                    "sort_order"=>  $this->task->sort_order,
                    "status_id"=>  $this->task->status_id,
                    "due_date"=>  $this->task->due_date,
                    "due_time"=>  $this->task->due_time,
                    "created_by_id"=>  $this->task->created_by_id,
                    "created_at"=>  $this->task->created_at->format('Y-m-d H:i:s'),
                    "updated_at"=>  $this->task->updated_at->format('Y-m-d H:i:s'),
                    "deleted_at"=>   null,
                    "assigned_users"=>[]
                ]
            ]);
    }

    /**
     * Tests Route task.show
     *
     * @test
     */
    public function can_get_task_with_assigned_users()
    {
        /** Arrange */
        /** create user and add to team */
        $user = factory(User::class)->create();
        factory(UserTeam::class)->create([
            'user_id' => $user->id,
            'team_id' => $this->team->id,
        ]);
        /** assign user to task */
        factory(UserTask::class)->create([
            'user_id' => $user->id,
            'task_id' => $this->task->id,
        ]);
        /** Act */
        $response = $this->json('GET', "/api/team/".$this->team->id."/project/".$this->project->id."/section/".$this->section->id."/task/".$this->task->id);
        /** Assert response is correct */
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'task has been found',
                'task' => [
                    "id"=> $this->task->id,
                    "priority_id"=> $this->task->priority_id,
                    "section_id"=> $this->task->section_id,
                    "name"=>  $this->task->name,
                    "note"=>  $this->task->note,
                    "sort_order"=>  $this->task->sort_order,
                    "status_id"=>  $this->task->status_id,
                    "due_date"=>  $this->task->due_date,
                    "due_time"=>  $this->task->due_time,
                    "created_by_id"=>  $this->task->created_by_id,
                    "created_at"=>  $this->task->created_at->format('Y-m-d H:i:s'),
                    "updated_at"=>  $this->task->updated_at->format('Y-m-d H:i:s'),
                    "deleted_at"=>   null,
                    "assigned_users"=>[0=>$user->toArray()]
                ]
            ]);
    }

    /**
     * Tests Route task.show
     *
     * @test
     */
    public function user_not_in_team_cannot_create_get_task()
    {
        /** Arrange */
        /** create new user and don't add to team*/
        Passport::actingAs(
            factory(User::class)->create()
        );
        /** Act */
        $response = $this->json('GET', "/api/team/".$this->team->id."/project/".$this->project->id."/section/".$this->section->id."/task/".$this->task->id);
        /** Assert 403 status code */
        $response->assertStatus(403);
    }
}
