import './bootstrap';
import router from './app-routes';
import store from './store/index';

import AddProject from './components/modals/AddProject.vue';
import AddTeam from './components/modals/AddTeam.vue';
import Modal from './components/Modal.vue';
import areYouSure from './components/AreYouSureModal.vue';
import Task from './components/Task.vue';
import Profile from './components/Profile.vue';
import Navigation from './components/Nav.vue';
import Spinner from 'vue-simple-spinner'
import EditTask from './components/modals/EditTask.vue';

window.Event = new Vue();
import { mapState, mapGetters } from 'vuex'
const app = new Vue({
    el: '#app',
    router,
    store,
    computed:
        mapState([
           'user', 'navVisible', 'profileVisible', 'teams', 'isLoading'
         ])
    ,
    components : {
        Task, Modal, AddProject, Navigation , Profile, Spinner, AddTeam, areYouSure, EditTask
    },
    methods: {
        /** listens to Echo channels */
        listen(){
            Echo.private('App.User.' + this.user.id)
                .notification((notification) => {
                    console.log(notification);
                    this.$store.commit('NOTIFICATION_ADD', {notification:notification});
                });
        },
        /** trigger event method */
        triggerEvent: function(eventName, payload){
            Event.$emit(eventName, payload);
        }
    },
    watch: {
        user () {
            /** wait for user data before fetching users teams **/
            if(this.user){
                /** get users teams */
                this.$store.dispatch('LOAD_TEAMS');
                /** get user notifications */
                this.$store.dispatch('GET_NOTIFICATIONS');
                /** listen to users Echo channels */
                this.listen();
            }
        }
    },
    mounted: function () {
        /** show ajax loader */
        this.$store.commit('SET_IS_LOADING');
        /** Call method to get user data */
        this.$store.dispatch('LOAD_USER');
        /** listen for modal toggle events */
        Event.$on('toggleModal', function(modalName) {
            store.commit('TOGGLE_MODAL_IS_VISIBLE', {name : modalName});
        });
        /** listen for notifications */
        Event.$on('notify', function(type, title, text) {
            if (typeof text === 'undefined') {
                text = '';
            }
            this.$notify({
                type: type,
                title: title,
                text: text
            });
        });
        /** listen for toggle navigation events */
        Event.$on('toggleNav', function() {
            store.commit('TOGGLE_NAV_IS_VISIBLE');
        });
        /** listen for toggle profile events */
        Event.$on('toggleProfile', function() {
            store.commit('TOGGLE_PROFILE_IS_VISIBLE');
        });
        /** listen for force change page events */
        Event.$on('changePage', function($route) {
            router.push($route);
        });
        /** listen log out event */
        Event.$on('logout', function() {
            window.location.href = "/logout";
        });
        /** Toggle profile and mobile nav */
        Event.$on('profileHandler', function(){
            Event.$emit('toggleProfile');
            Event.$emit('toggleNav');
        });
    }
});
