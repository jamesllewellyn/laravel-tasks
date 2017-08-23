<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

/** create new account form */
Route::get('/create', function () {
    return view('auth.create-account');
});

/** user invite */
Route::get('/invite', 'HomeController@invite')->name('user.invite');
Route::post('/invite', 'UserController@invite')->name('user.invite');

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

