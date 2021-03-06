import Vuex from 'vuex';
import Project from '../core/Project';
import Section from '../core/Section';
import Task from '../core/Task';
import Team from '../core/Team';
import User from '../core/User';
import Notification from '../core/Notification';
const store = new Vuex.Store({
    state: {
        teams: [],/** all users teams */
        teamOverview: null, /** overview of status of tasks in all projects in team **/
        projects: [],/** all current teams projects */
        project: null,/** all current projects sections and tasks */
        task: null,/** Current task being displayed */
        taskIsLoading: false,/** loading state of task */
        notifications: [], /** Users notifications */
        myTasks: {},/** all tasks assigned to user */
        myTasksLoading: true, /** loading state for MyTask page, used when changing task filter to fade content in/out */
        myOverDue: {},/** all users tasks currently overDue */
        myWorkingOnIt: {},/** all users tasks flagged as working on it */
        user: new User({first_name: '', last_name : '', handle : '', email : '', password : ''}),/** user */
        formErrors: {},/** current form errors */
        modals:[],/** all app models */
        navVisible: false,/** is mobile navigation visible flag */
        profileVisible: false,/** is profile visible flag */
        switchTeamVisible:false,/** is switch team visible flag */
        isLoading:true/** AJAX spinning loader flag */
    },
    actions: {
        /***********************
         * Sign Up Actions
         **********************/
        REGISTER_USER:function ({ commit }, user) {
            axios.post('/api/user', user)
                .then((response) => {
                    console.log(response);
                    console.log(response.data.user);
                    commit('REGISTER_USER_PASS', { user: response.data.user})
                }, (error) => {
                    if(error.response.data){
                        console.log(error.response);
                        commit('REGISTER_USER_FAIL', { errors:  error.response.data });
                        return false;
                    }
                    commit('SERVER_ERROR');
                });
        },
        SIGN_UP_SUBMIT :function ({ commit, state }, team) {
            axios.post('/api/team' , team)
                .then((response) => {
                    commit('SIGN_UP_SUCCESS', { user: response.data.user})
                }, (error) => {
                    if(error.response.data){
                        commit('SIGN_UP_FAIL', { errors:  error.response.data });
                        return false;
                    }
                    commit('SERVER_ERROR');
                });
        },
        /***********************
         * User Actions
         **********************/
        LOAD_USER: function ({ commit }) {
            axios.get('/api/user')
            .then((response) => {
                commit('SET_USER', { user: response.data })
            }, () => {
                commit('SERVER_ERROR');
            });
        },
        STORE_USER: function ({ commit }, user) {
            axios.post('/api/user', user)
                .then((response) => {
                    commit('STORE_USER_SUCCESS', { user: response.data.user})
                }, (error) => {
                    if(error.response.data){
                        commit('STORE_USER_FAILURE', { errors:  error.response.data });
                        return false;
                    }
                    commit('SERVER_ERROR');
                });
        },
        UPDATE_USER: function ({ commit, state }, user) {
            axios.put('/api/user/'+state.user.id, user)
                .then((response) => {
                    commit('UPDATE_USER_SUCCESS', { user: response.data.user})
                }, (error) => {
                    if(error.response.data){
                        commit('UPDATE_USER_ERROR', { errors:  error.response.data });
                        return false;
                    }
                    commit('SERVER_ERROR');
                });
        },
        ADD_TEAM_MEMBER: function ({ commit, getters }, email) {
            axios.post('/api/team/'+getters.getActiveTeam.id+'/user', {email:email})
                .then((response) => {
                    /** clear button loading state */
                    commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addUser'});
                    /** check for errors */
                    if(!response.data.success){
                        /** check for errors */
                        commit('ADD_TEAM_MEMBER_ERROR', { message:  response.data.message });
                        return false;
                    }
                    /** close modal **/
                    commit('TOGGLE_MODAL_IS_VISIBLE', {name : 'addUser'});
                    /** if user is set in response then the user is already in the db and has been added to the team */
                    if (typeof response.data.user !== 'undefined') {
                        commit('ADD_TEAM_MEMBER_SUCCESS', { message:  response.data.message, user: response.data.user});
                        return false;
                    }
                    /** the user has been sent an email asking them to join and has been put in the pending users table */
                    commit('ADD_TEAM_PENDING_MEMBER_SUCCESS', { message:  response.data.message});
                }, (error) => {
                    /** clear button loading state */
                    commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addUser'});
                    /** check for error data */
                    if(error.response.data){
                        /** if error display feedback to user */
                        commit('ADD_TEAM_MEMBER_FAILURE', { errors:  error.response.data });
                        return false;
                    }
                    /** show default error */
                    commit('SERVER_ERROR');
                });
        },
        ADD_USER_AVATAR:function({commit, state}, base64 ){
            axios.post('/api/user/'+state.user.id+'/avatar', {base64 : base64})
                .then(function (response) {
                    /** call success */
                    commit('ADD_USER_AVATAR_SUCCESS');
                    /** close modal */
                    commit('TOGGLE_MODAL_IS_VISIBLE', {name : 'uploadAvatar'});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        GET_MY_TASKS:function({commit, state} ){
            axios.get('/api/user/'+state.user.id+'/tasks')
                .then(function (response) {
                    /** call success */
                    commit('GET_MY_TASKS_SUCCESS', {tasks : response.data});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        GET_MY_OVER_DUE:function({commit, state} ){
            axios.get('/api/user/'+state.user.id+'/tasks?filter=over-due')
                .then(function (response) {
                    /** call success */
                    commit('GET_OVER_DUE_SUCCESS', {tasks : response.data});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        GET_MY_WORKING_ON_IT:function({commit, state} ){
            axios.get('/api/user/'+state.user.id+'/tasks?filter=working-on-it')
                .then(function (response) {
                    /** call success */
                    commit('GET_WORKING_ON_IT_SUCCESS', {tasks : response.data});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        GET_NOTIFICATIONS:function({commit, state} ){
            axios.get('/api/user/'+state.user.id+'/notifications')
                .then(function (response) {
                    /** call success */
                    commit('GET_NOTIFICATIONS_SUCCESS', {notifications : response.data});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        NOTIFICATION_MARK_AS_READ:function({commit}, {id} ){
            axios.put('/api/notification/'+id)
                .then(function (response) {
                    /** call success get notifications success mutator to replace current notifications with remaining unread  */
                    commit('GET_NOTIFICATIONS_SUCCESS', {notifications : response.data.notifications});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        USER_CLEAR_INBOX:function({commit, state}){
            axios.put('/api/user/'+state.user.id+'/clear-notifications')
                .then(function (response) {
                    /** call success mutator to clear all notifications  */
                    commit('USER_CLEAR_INBOX_SUCCESS');
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        USER_CAN_ACCESS_TEAM:function({commit}, {teamId}){
            axios.get('/api/team/'+teamId+'/can-access')
                .then(function (response) {
                    /** call success */
                    commit('SWITCH_TEAM_SUCCESS', {teamId : teamId});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        USER_CAN_ACCESS_PROJECT:function({commit}, {teamId, projectId}){
            axios.get('/api/team/'+teamId+'/project/'+projectId+'/can-access')
                .then(function (response) {
                    if(!response.data.success){
                        commit('SERVER_ERROR');
                    }
                    /** call success */
                    commit('TAKE_USER_TO_PROJECT', {teamId : teamId, projectId:projectId} );
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        USER_CAN_ACCESS_TASK:function({commit}, {teamId, projectId, sectionId, taskId}){
            axios.get('/api/team/'+teamId+'/project/'+projectId+'/section/'+sectionId+'/task/'+taskId+'/can-access')
                .then(function (response) {
                    if(!response.data.success){
                        commit('SERVER_ERROR');
                    }
                    /** call success */
                    commit('TAKE_USER_TO_TASK', {teamId : teamId, projectId:projectId, sectionId : sectionId,  task:response.data.task} );
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        /***********************
         * Team Actions
         **********************/
        LOAD_TEAMS: function({commit ,state}){
            axios.get('/api/user/' + state.user.id + '/team')
                .then((response) => {
                    commit('SET_TEAM_LIST', { teams: response.data });
                    /** clear ajax loader **/
                    commit('CLEAR_IS_LOADING');
                }, () => {
                    commit('SERVER_ERROR');
                })
        },
        ADD_NEW_TEAM: function ({ commit, state }, {team}) {
            axios.post('/api/team/' ,team )
                .then((response) => {
                    commit('ADD_NEW_TEAM_SUCCESS', { team: response.data.team});
                    /** clear button loading state*/
                    commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addTeam'});
                    /** close modal */
                    commit('TOGGLE_MODAL_IS_VISIBLE', {name : 'addTeam'});
                }, (error) => {
                    if(error.response.data){
                        commit('ADD_NEW_TEAM_FAILURE', { errors:  error.response.data });
                        return false;
                    }
                    commit('ADD_NEW_TEAM_FAILURE', { errors:  error.response.data });
                });
        },
        UPDATE_TEAM: function({ commit, getters }, {team}){
            axios.put('/api/team/'+ getters.getActiveTeam.id, team )
                .then((response) => {
                    commit('UPDATE_TEAM_SUCCESS', { team: response.data.team})
                }, (error) => {
                    if(error.response.data){
                        commit('UPDATE_TEAM_FAILURE', { errors:  error.response.data });
                        return false;
                    }
                    commit('SERVER_ERROR');
                });
        },
        SWITCH_TEAM: function({ commit, state }, {teamId}){
            axios.put('/api/user/'+ state.user.id+'/team', {teamId :teamId} )
                .then(() => {
                    commit('SWITCH_TEAM_SUCCESS', { teamId: teamId})
                }, (error) => {
                    if(error.response.data){
                        commit('UPDATE_TEAM_FAILURE', { errors:  error.response.data });
                        return false;
                    }
                    commit('SERVER_ERROR');
                });
        },
        GET_TEAM_OVERVIEW: function({ commit, getters}){
            axios.get('/api/team/'+ getters.getActiveTeam.id +'/overview')
                .then((response) => {
                    commit('GET_TEAM_OVERVIEW_SUCCESS', { overview: response.data.overview});
                }, (error) => {
                    commit('SERVER_ERROR');
                });
        },
        /***********************
         * Project Actions
         **********************/
        GET_PROJECT:  function ({ commit, getters}, {id}) {
            axios.get('/api/team/' + getters.getActiveTeam.id + '/project/' + id )
                .then((response) => {
                    commit('SET_PROJECT', { project: response.data.project });
                }, () => {
                    commit('SERVER_ERROR');
            })
        },
        ADD_NEW_PROJECT: function ({ commit ,getters} , project) {
            axios.post('/api/team/'+getters.getActiveTeam.id+'/project', project)
            .then(function (response) {
                commit('ADD_PROJECT_SUCCESS', {project: response.data.project });
                /** clear button loading state */
                commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addProject'});
                /** close modal */
                commit('TOGGLE_MODAL_IS_VISIBLE', {name : 'addProject'});
            })
            .catch(function (error) {
                if(error.response.data){
                    commit('ADD_PROJECT_FAILURE', { errors:  error.response.data });
                }
                /** clear button loading state*/
                commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addProject'});
            });
        },
        UPDATE_PROJECT: function ({ commit, getters } ,{id, project}) {
            axios.put('/api/team/'+getters.getActiveTeam.id+'/project/' + id, project)
                .then(function (response) {
                    /**  **/
                    commit('UPDATE_PROJECT_SUCCESS', {project: response.data.project });
                })
                .catch(function (error) {
                   commit('UPDATE_PROJECT_FAILURE');
                });
        },
        DELETE_PROJECT: function ({ commit, getters } ,{id}) {
            axios.delete('/api/team/'+getters.getActiveTeam.id+'/project/' + id)
                .then(function (response) {
                    /**  **/
                    commit('DELETE_PROJECT_SUCCESS', {teamId: getters.getActiveTeam.id,id: id, message: response.data.message });
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        /***********************
         * Section Actions
         **********************/
        ADD_NEW_SECTION: function ({ commit, getters } ,{projectId, section}) {
            axios.post('/api/team/'+getters.getActiveTeam.id+'/project/'+ projectId +'/section', section)
            .then(function (response) {
                /**  **/
                commit('ADD_SECTION_SUCCESS', {section: response.data.section });
                /** clear button loading state*/
                commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addSection'});
                /** close modal */
                commit('TOGGLE_MODAL_IS_VISIBLE', {name : 'addSection'});
            })
            .catch(function (error) {
                if(error.response.data){
                    commit('ADD_SECTION_FAILURE', { errors:  error.response.data });
                }
                /** clear button loading state*/
                commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addSection'});
            });
        },
        UPDATE_SECTION_TASKS_SORT_ORDER: function ({ commit, state, getters } ,{section, tasks}) {
            axios.put('/api/team/'+getters.getActiveTeam.id+'/project/'+state.project.id+'/section/'+ section.id + '/tasks/reorder', {tasks : tasks})
                .then(function (response) {
                    commit('UPDATE_SECTION_TASKS_SORT_ORDER_SUCCESS', { section: section, tasks : tasks});
                })
                .catch(function (error) {
                    commit('SERVER_ERROR');
                });
        },
        UPDATE_SECTION: function ({ commit, state, getters } ,{id, section}) {
            axios.put('/api/team/'+getters.getActiveTeam.id+'/project/'+ state.project.id +'/section/' + id, section)
                .then(function (response) {
                    /**  **/
                    commit('UPDATE_SECTION_SUCCESS', { section: response.data.section });
                })
                .catch(function (error) {
                    commit('UPDATE_SECTION_FAILURE');
                });
        },
        DELETE_SECTION: function ({ commit, state, getters } ,{id}) {
            axios.delete('/api/team/'+getters.getActiveTeam.id+'/project/'+ state.project.id +'/section/' + id)
                .then(function (response) {
                    /**  **/
                    commit('DELETE_SECTION_SUCCESS', {id : id, message : response.data.message});
                })
                .catch(function () {
                    commit('UPDATE_SECTION_FAILURE');
                });
        },
        /***********************
         * Task Actions
         **********************/
        GET_TASK: function ({ commit, getters } ,{projectId , sectionId, id}) {
            axios.get('/api/team/'+getters.getActiveTeam.id+'/project/'+ projectId +'/section/' + sectionId + '/task/' + id)
                .then(function (response) {
                    /** call success mutation **/
                    commit('GET_TASK_SUCCESS', {task: response.data.task });
                    /** clear task loading state*/
                    commit('CLEAR_TASK_IS_LOADING');

                })
                .catch(function () {
                    commit('SERVER_ERROR');
                });
        },
        ADD_NEW_TASK: function ({ commit, state, getters } ,{sectionId, task}) {
            axios.post('/api/team/'+getters.getActiveTeam.id+'/project/'+ state.project.id +'/section/' + sectionId + '/task', task)
                .then(function (response) {
                    /** call success mutation **/
                    commit('ADD_TASK_SUCCESS', { sectionId: response.data.task.section_id,  task: response.data.task });
                    /** clear button loading state*/
                    commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addTask'});
                    /** close modal */
                    commit('TOGGLE_MODAL_IS_VISIBLE', {name : 'addTask'});
                })
                .catch(function (error) {
                    if(typeof  error.response.data !== 'undefined'){
                        commit('ADD_TASK_FAILURE', { errors:  error.response.data });
                    }
                    /** clear button loading state*/
                    commit('REMOVE_BUTTON_LOADING_STATE', {name : 'addTask'});
                });
        },
        UPDATE_TASK: function ({ commit, state, getters} ,{ projectId, sectionId, id, task}) {
            axios.put('/api/team/'+getters.getActiveTeam.id+'/project/'+  projectId +'/section/' + sectionId + '/task/' + id, task)
                .then(function (response) {
                    /** call success mutation **/
                    commit('UPDATE_TASK_SUCCESS', {sectionId: response.data.section_id, task: response.data.task });
                    /** clear button loading state*/
                    commit('REMOVE_BUTTON_LOADING_STATE', {name : 'editTask'});
                    /** close modal */
                    commit('TOGGLE_MODAL_IS_VISIBLE', {name : 'editTask'});
                })
                .catch(function (error) {
                    if(error.response.data){
                        commit('UPDATE_TASK_FAILURE', { errors:  error.response.data });
                    }
                });
        },
        ADD_COMMENT:function ({ commit, getters} ,{projectId, sectionId, id, comment}) {
            axios.post('/api/team/'+getters.getActiveTeam.id+'/project/'+ projectId +'/section/' + sectionId + '/task/' + id + '/comment', {comment:comment})
                .then(function (response) {
                    /** call success mutation **/
                    commit('ADD_COMMENT_SUCCESS', {comment: response.data.comment });
                })
                .catch(function (error) {
                    if(error.response.data){
                        commit('ADD_COMMENT_FAILURE', { errors:  error.response.data });
                    }
                });
        },
        TASK_SET_TO_DONE: function ({ commit, getters} ,{projectId, sectionId, id}) {
            axios.put('/api/team/'+getters.getActiveTeam.id+'/project/'+ projectId +'/section/' + sectionId + '/task/' + id + '/done')
                .then(function (response) {
                    /** all success mutation **/
                    commit('TASK_SET_TO_DONE_SUCCESS', {sectionId: sectionId, task: response.data.task });
                })
                .catch(function () {
                    commit('SERVER_ERROR');
                });
        },
        DELETE_TASK: function ({ commit, getters } ,{projectId, sectionId, id}) {
            axios.delete('/api/team/' + getters.getActiveTeam.id + '/project/'+ projectId +'/section/' + sectionId + '/task/' + id)
                .then(function (response) {
                    console.log(response);
                    /**  **/
                    commit('DELETE_TASK_SUCCESS', {projectId: projectId, sectionId : sectionId , id : id, message : response.data.message});
                })
                .catch(function () {
                    commit('SERVER_ERROR');
                });
        }
    },
    mutations: {
        /***********************
         * Sign up Mutations
         **********************/
        REGISTER_USER_PASS: (state, { user }) => {
            /** add user */
            state.user = user;
            /** take your to homepage */
            window.location = '/home';
            // Event.$emit('create-team-page','set-up-team');
        },
        REGISTER_USER_FAIL: (state, { errors }) => {
            /** add form errors */
            state.formErrors = errors;
        },
        SIGN_UP_SUCCESS: (state) => {
            /** take your to homepage */
            window.location = '/home';
        },
        SIGN_UP_FAIL: (state) => {
            /** take user to app route */
            window.location = '/';
        },
        /***********************
         * User Mutations
         **********************/
        SET_USER: (state, { user }) => {
            state.user = user;
        },
        ADD_USER_AVATAR_SUCCESS: (state) => {
            Event.$emit('notify','success', 'Success', 'Your avatar has been updated');
        },
        UPDATE_USER_SUCCESS: (state,  { user }) => {
            state.user = user;
        },
        UPDATE_USER_ERROR: (state,  { errors }) => {
            /** add form errors */
            state.formErrors = errors;
        },
        GET_MY_TASKS_SUCCESS:(state, {tasks}) => {
            /** group tasks into projects */
            let groupedProjects = _.groupBy(tasks, 'section.project_id');
            _.forEach(groupedProjects, function(project, key) {
                /** group tasks in projects into sections */
                groupedProjects[key] = _.values( _.groupBy(project, 'section_id') );
            });
            /** add tasks to myTasks */
            state.myTasks = groupedProjects;
            /** clear loading state on myTasks page */
            state.myTasksLoading = false;
        },
        GET_OVER_DUE_SUCCESS:(state, {tasks}) => {
            /** group tasks into projects */
            let groupedProjects = _.groupBy(tasks, 'section.project_id');
            _.forEach(groupedProjects, function(project, key) {
                /** group tasks in projects into sections */
                groupedProjects[key] = _.values( _.groupBy(project, 'section_id') );
            });
            /** add tasks to myTasks */
            state.myOverDue = groupedProjects;
            /** clear loading state on myTasks page */
            state.myTasksLoading = false;
        },
        GET_WORKING_ON_IT_SUCCESS:(state, {tasks}) => {
            /** group tasks into projects */
            let groupedProjects = _.groupBy(tasks, 'section.project_id');
            _.forEach(groupedProjects, function(project, key) {
                /** group tasks in projects into sections */
                groupedProjects[key] = _.values( _.groupBy(project, 'section_id') );
            });
            /** add tasks to myTasks */
            state.myWorkingOnIt = groupedProjects;
            /** clear loading state on myTasks page */
            state.myTasksLoading = false;
        },
        MY_TASKS_LOADING: (state) =>{
            state.myTasksLoading = true;
        },
        MY_TASKS_LOADING_CLEAR: (state) =>{
            state.myTasksLoading = false;
        },
        GET_NOTIFICATIONS_SUCCESS:(state, {notifications}) => {
            state.notifications = notifications;
        },
        NOTIFICATION_ADD: (state, {notification}) => {
            notification = new Notification(notification);
            state.notifications.unshift(notification);
            Event.$emit('notify','success', notification.data.user.full_name, notification.data.action);
        },
        USER_CLEAR_INBOX_SUCCESS:(state) => {
            state.notifications = {};
        },
        TAKE_USER_TO_PROJECT:(state, {teamId, projectId}) => {
            /** parse id to int */
            let tId = parseInt(teamId,10);
            /** update users current_team_id */
            state.user.current_team_id = tId;
            /** take user to project page */
            Event.$emit('changePage', '/project/'+projectId);
        },
        TAKE_USER_TO_TASK:(state, {teamId, projectId, sectionId, task}) => {
            /** parse id to int */
            let tId = parseInt(teamId,10);
            /** update users current_team_id */
            state.user.current_team_id = tId;
            /** take user to project page */
            Event.$emit('changePage', '/project/'+projectId);
            /** set task as current task */
            state.task = new Task(task);
            /** show tasks*/
            Event.$emit('showTask',projectId, sectionId,task.id);
        },
        /***********************
         * Team Mutations
         **********************/
        SET_TEAM_LIST: (state, { teams }) => {
            /** clear current teams **/
            state.teams = [];
            /** loop each new team and push to state.teams **/
            teams.forEach(function(team){
                state.teams.push( new Team(team));
            });
        },
        SET_ACTIVE_TEAM: (state, { team }) => {
            state.user.current_team_id = team.id;
        },
        ADD_NEW_TEAM_SUCCESS: (state, {team}) => {
            /** clear form errors */
            state.formErrors = {};
            /** add team */
            state.teams.push( new Team(team));
            /** set team as current team */
            state.teams.forEach(function(t){
                /** false active as false */
                t.active = false;
                /** if ids matches false as active */
                if(t.id === team.id){
                    t.active = true;
                }
            });
        },
        ADD_NEW_TEAM_FAILURE: (state, {errors}) => {
            /** add form errors */
            state.formErrors = errors;
        },
        ADD_TEAM_MEMBER_SUCCESS: (state, {message, user}) => {
            /** get current team index **/
            let tIdx = state.teams.map(team => team.id).indexOf(state.user.current_team_id);
            /** add new user to team object*/
            state.teams[tIdx].users.push(user);
            /** send user success message */
            Event.$emit('notify','success', 'Success', message);
        },
        ADD_TEAM_PENDING_MEMBER_SUCCESS: (state, {message}) => {
            /** send user success message */
            Event.$emit('notify','success', 'Success', message);
        },
        ADD_TEAM_MEMBER_ERROR: (state, {message}) => {
            /** send user error message */
            Event.$emit('notify','error', 'Whoops', message);
        },
        ADD_TEAM_MEMBER_FAILURE: (state, {errors}) => {
            /** add form errors */
            state.formErrors = errors;
        },
        SWITCH_TEAM_SUCCESS: (state, {teamId}) => {
            /** parse id to int */
            let tId = parseInt(teamId, 10);
            /** update users current_team_id */
            state.user.current_team_id = tId;
            /** get current team */
            let team = state.teams.find(team => team.id === state.user.current_team_id);
            /** take user to team dashboard */
            Event.$emit('changePage', '/team-dashboard/');
            /** display notification to user */
            Event.$emit('notify','success', 'Team has been switched', team.name);
        },
        UPDATE_TEAM_SUCCESS: (state, {team}) => {
            /** clear form errors */
            state.formErrors = {};
            /** get current team index **/
            let tIdx = state.teams.map(team => team.id).indexOf(state.user.current_team_id);
            /** update team name **/
            state.teams[tIdx].name = team.name;
        },
        UPDATE_TEAM_FAILURE: (state) => {
            Event.$emit('notify','error', 'Whoops', 'Team name couldn\'t be updated');
        },
        GET_TEAM_OVERVIEW_SUCCESS:(state, {overview}) => {
            /** set team overview */
            state.teamOverview = overview;
        },
        /***********************
         * Project Mutations
         **********************/
        SET_PROJECT: (state, { project }) =>{
            state.project = project;
            let idx = 0 ;
            state.project.sections.forEach(function(section){
                state.project.sections[idx] = new Section(section);
                idx++;
            });
        },
        CLEAR_PROJECT:(state) =>{
            state.project = null;
        },
        ADD_PROJECT_SUCCESS: (state, { project }) => {
            /** clear form errors */
            state.formErrors = {};
            /** get current team index **/
            let tIdx = state.teams.map(team => team.id).indexOf(state.user.current_team_id);
            /** add new project to data array*/
            state.teams[tIdx].projects.push(project);
            /** notify user of success **/
            Event.$emit('notify','success', 'Success', 'New project has been created');
        },
        ADD_PROJECT_FAILURE: (state, { errors }) => {
            /** add form errors */
            state.formErrors = errors;
        },
        UPDATE_PROJECT_SUCCESS: (state, {project}) => {
            /** get current team index **/
            let tIdx = state.teams.map(team => team.id).indexOf(state.user.current_team_id);
            /** get project index **/
            let pIdx = state.teams[tIdx].projects.map(p => p.id).indexOf(project.id);
            /** update project name **/
            state.teams[tIdx].projects[pIdx].name = project.name;
            /** notify user of success **/
            Event.$emit('notify','success', 'Success', 'Project name has been updated');
        },
        UPDATE_PROJECT_FAILURE: (state) => {
            Event.$emit('notify','error', 'Whoops', 'Project name couldn\'t be updated');
        },
        DELETE_PROJECT_SUCCESS:(state, {teamId, id, message}) => {
            /** cast id to int **/
            let pId = parseInt(id, 10);
            /** get team index **/
            let tIdx = state.teams.map(team => team.id).indexOf(teamId);
            /** remove deleted project from state.projects object**/
            state.teams[tIdx].projects = _.reject(state.teams[tIdx].projects , function(project) { return project.id === pId; });
            /** project no longer exists so move user from project page **/
            Event.$emit('changePage', '/inbox/');
            /** close are you sure modal **/
            Event.$emit('hideAreYouSure');
            /** notify user of section delete **/
            Event.$emit('notify','success', 'Success', message);
        },
        /***********************
         * Section Mutations
         **********************/
        ADD_SECTION_SUCCESS: (state, { section }) => {
            /** add section to currently loaded project **/
            state.project.sections.push( new Section(section) );
            /** notify user of success **/
            Event.$emit('notify','success', 'Success', 'New section has been created');
        },
        ADD_SECTION_FAILURE: (state, { errors }) => {
            /** add form errors */
            state.formErrors = errors;
        },
        UPDATE_SECTION_SUCCESS: (state, { section }) => {
            /** get section index **/
            let sIdx = state.project.sections.map(section => section.id).indexOf(section.id);
            /** update project name **/
            state.project.sections[sIdx].name = section.name;
            /** notify user of success **/
            Event.$emit('notify','success', 'Success', 'Section name has been updated');
        },
        UPDATE_SECTION_FAILURE: (state) => {
            Event.$emit('notify','error', 'Whoops', 'Section name couldn\'t be updated');
        },
        DELETE_SECTION_SUCCESS:(state, {id, message}) => {
            /** cast id to int **/
            let sId = parseInt(id, 10);
            /** remove deleted section from state.project.sections **/
            state.project.sections = _.reject(state.project.sections, function(section) { return section.id === sId; });
            /** close are you sure modal **/
            Event.$emit('hideAreYouSure');
            /** notify user of section delete **/
            Event.$emit('notify','success', 'Success', message);
        },
        /***********************
         * Task Mutations
         **********************/
        CLEAR_TASK:(state) =>{
            state.task = null;
            /** clear any form errors **/
            state.formErrors = {};
        },
        GET_TASK_SUCCESS: (state, { task }) => {
            /** add task to active task state **/
            console.log(task);
            state.task = new Task(task);
        },
        ADD_TASK_SUCCESS: (state, {sectionId, task }) => {
            /** cast id to int **/
            let sId = parseInt(sectionId ,10);
            /** get project index **/
            let sIdx = state.project.sections.map(section => section.id).indexOf(sId);
            /** add new task to data array **/
            state.project.sections[sIdx].tasks.push( new Task(task) );
            /** notify section component of update **/
            Event.$emit('section.'+sId+'.updated');
            /** notify user of success **/
            Event.$emit('notify','success', 'Success', 'New task has been added');
        },
        ADD_TASK_FAILURE: (state, { errors }) => {
            /** add form errors */
            state.formErrors = errors;
        },
        UPDATE_TASK_SUCCESS: (state, { sectionId, task }) => {
            /** clear any form errors **/
            state.formErrors = {};
            /** cast id to int **/
            let sId = parseInt(sectionId ,10);
            let tId = parseInt(task.id, 10);
            /** notify myTasks component of update **/
            Event.$emit('myTasks.updated');
            /** notify section component of update **/
            Event.$emit('section.'+sId+'.updated');
            Event.$emit('project.'+state.task.project.id+'.updated');
            /** go back to task **/
            Event.$emit('showTask', state.task.project.id, sId,tId);
        },
        UPDATE_TASK_FAILURE: (state, { errors }) => {
            /** add form errors */
            state.formErrors = errors;
        },
        ADD_COMMENT_SUCCESS: (state, { comment }) => {
            /** add new comment */
            state.task.comments.push(comment);
            /** Clear form errors */
            state.formErrors = {};
            /** notify section component of update **/
            Event.$emit('comment.success');
        },
        ADD_COMMENT_FAILURE: (state, { errors }) => {
            /** add form errors */
            state.formErrors = errors;
        },
        UPDATE_SECTION_TASKS_SORT_ORDER_SUCCESS: (state, { section, tasks }) => {
            /** get section index **/
            let sIdx = state.project.sections.map(section => section.id).indexOf(section.id);
            /** reorder tasks by sort_order and update project object **/
            state.project.sections[sIdx].tasks = _.sortBy(tasks, function(task) { return task.sort_order; });
        },
        TASK_SET_TO_DONE_SUCCESS: (state, { sectionId, task }) => {
            /** cast id to int **/
            let sId = parseInt(sectionId, 10);
            if(state.project){
                let sIdx = state.project.sections.map(section => section.id).indexOf(sId);
                if(sIdx >= 0){
                    let tIdx = state.project.sections[sIdx].tasks.map(task => task.id).indexOf(task.id);
                    /** update task to data array **/
                    state.project.sections[sIdx].tasks[tIdx].status_id = 1;
                }
            }
            /** notify myTasks component of update **/
            Event.$emit('myTasks.updated');
            /** notify section component of update **/
            Event.$emit('section.'+sId+'.updated');
            /** notify user of success **/
            Event.$emit('notify','success', 'Success', 'Task Completed');
        },
        DELETE_TASK_SUCCESS:(state, {projectId, sectionId, id, message}) => {
            /** cast id to int **/
            let sId = parseInt(sectionId, 10);
            /** get index of section **/
            let sectionIndex = state.project.sections.map(section => section.id).indexOf(sId);
            /** remove deleted section from state.project.sections **/
            state.project.sections[sectionIndex].tasks = _.reject(state.project.sections[sectionIndex].tasks, function(task) { return task.id === id; });
            /** notify section of update **/
            Event.$emit('section.'+sId+'.updated');
            /** notify project component of update **/
            Event.$emit('project.'+projectId+'.updated');
            /** close are you sure modal **/
            Event.$emit('hideAreYouSure');
            /** notify user of section delete **/
            Event.$emit('notify','success', 'Success', message);
        },
        /***********************
         * Modal Mutations
         **********************/
        ADD_MODAL: (state, { name }) => {
            state.modals.push({name : name, isVisible : false, isLoading : false});
        },
        TOGGLE_MODAL_IS_VISIBLE: (state,{name}) =>{
            let idx = state.modals.map(modal => modal.name).indexOf(name);
            state.modals[idx].isVisible = !state.modals[idx].isVisible;
            /** clear all form errors **/
            state.formErrors = {};
        },
        SET_BUTTON_TO_LOADING: (state,{name}) =>{
            let idx = state.modals.map(modal => modal.name).indexOf(name);
            state.modals[idx].isLoading = true;
        },
        REMOVE_BUTTON_LOADING_STATE: (state,{name}) =>{
            let idx = state.modals.map(modal => modal.name).indexOf(name);
            state.modals[idx].isLoading = false;
        },
        /***********************
         * Nav Mutations
         **********************/
        TOGGLE_NAV_IS_VISIBLE: (state) =>{
            state.navVisible = !state.navVisible;
        },
        /***********************
         * Profile Mutations
         **********************/
        TOGGLE_PROFILE_IS_VISIBLE:(state)=>{
            state.profileVisible = !state.profileVisible;
        },
        /***********************
         * Switch Team Mutations
         **********************/
        TOGGLE_SWITCH_TEAM_IS_VISIBLE:(state)=>{
            state.switchTeamVisible = !state.switchTeamVisible;
        },
        /***********************
         * Errors Mutations
         **********************/
        SERVER_ERROR:()=>{
            Event.$emit('notify','error', 'Whoops', 'Sorry somethings gone wrong here');
        },
        /***********************
         * AJAX loader Mutations
         **********************/
        SET_IS_LOADING:(state)=>{
            state.isLoading = true;
        },
        CLEAR_IS_LOADING:(state)=>{
            state.isLoading = false;
        },
        SET_TASK_IS_LOADING:(state)=>{
            state.taskIsLoading = true;
        },
        CLEAR_TASK_IS_LOADING:(state)=>{
            state.taskIsLoading = false;
        },
    },
    getters: {
        /***********************
         * Nofification Getters
         **********************/
        getNofificationsByDays:(state) => {
            /** group notifications by days **/
            let groupedDays = _.groupBy(state.notifications, (notification) => moment(notification['created_at'], 'YYYY-MM-DD').calendar(moment('YYYY-MM-DD')));
            return groupedDays;
        },
        /***********************
         * Team Getters
         **********************/
        /** returns current teams */
        getActiveTeam: (state) => {
            if(!state.teams){
                return false;
            }
            return  state.teams.find(team => team.id === state.user.current_team_id);
        },
        getTeamUser:(state, getters) => {
            if(!getters.getActiveTeam){
                return false;
            }
            return getters.getActiveTeam.users;
        },
        /***********************
         * Project Getters
         **********************/
        /** returns current teams projects */
        getProjects: (state, getters) => {
            if(!getters.getActiveTeam){
                return false;
            }
            return getters.getActiveTeam.projects;
        },
        /** returns current project */
        getProject: (state) => {
            if(!state.project){
                return false;
            }
            return state.project;
        },
        getProjectById: (state, getters) => (projectId) => {
            /** cast id to int **/
            let id = parseInt(projectId, 10);
            return state.projects.find(project => project.id === id)
        },
        getProjectOverviewById: (state, getters) => (projectId) => {
            /** cast id to int **/
            let id = parseInt(projectId, 10);
            /** if teamOverview not set return blank overview */
            if(!state.teamOverview){
                return {complete:0, not_started:0, over_due:0, working_on:0};
            }
            /** find project in team overview */
            let overview = state.teamOverview.find(overview => overview.project_id === id);
            /** if project not found in team overview return blank overview */
            if(!overview){
                return {complete:0, not_started:0, over_due:0, working_on:0};
            }
            /** return overview **/
            return  overview;
        },
        /***********************
         * Section Getters
         **********************/
        /** returns all project sections flattered into one array **/
        getSections: (state, getters) => {
            if(state.project){
                return _.flatten( state.project.sections);
            }
            return false;
        },
        getSectionById: (state, getters) => ({sectionId}) => {
            /** cast id to int **/
            let sId = parseInt(sectionId, 10);
            /** find and return section **/
            return state.project.sections.find(section => section.id === sId);
        },
        /***********************
         * Task Getters
         **********************/
        /** returns current task */
        getTask: (state) => {
            if(!state.task){
                return false;
            }
            return state.task;
        },
        /** returns a task **/
        getTaskById: (state, getters) => ({ sectionId, id}) => {
            /** cast ids to int **/
            let sId = parseInt(sectionId, 10);
            let tId = parseInt(id, 10);
            /** find object index of section **/
            let sIdx = state.project.sections.map(section => section.id).indexOf(sId);
            /** find and return task **/
            return state.project.sections[sIdx].tasks.find(task => task.id === tId);
        },
        /** all users tasks  **/
        getMyTasks: (state) => {
            return state.myTasks;
        },
        /** all users over due tasks **/
        getMyOverDue: (state) => {
            return state.myOverDue;
        },
        /** all users tasks flagged as working on it **/
        getMyWorkingOnIt: (state) => {
            return state.myWorkingOnIt;
        },
        /** filters getTasks() and returns tasks which deadlines are within the next week **/
        getUpComing: (state, getters) => {
           // let upComing = [];
           // let now = moment();
           // let nextWeek = moment().add(7, 'days');
           // return _.filter(getters.getTasks,  function(task) { return moment(task.due_date).isBetween(now, nextWeek) && task.status_id === null; });
        },
        /***********************
         * Modal Getters
         **********************/
        /** returns isVisible and isLoading states for modal my name **/
        getModalByName: (state, getters) => (name) => {
            return state.modals.find(modal => modal.name === name)
        },
        /** gets form errors by field name**/
        getFormErrors: (state, getters) => (fieldName) => {
            if (state.formErrors[fieldName]) {
                return state.formErrors[fieldName][0];
            }
        }
    }
});
export default store