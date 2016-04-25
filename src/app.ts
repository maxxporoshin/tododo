///<reference path="../typings/angularjs/angular.d.ts" />

(function() {
    function authInterceptor(API: any, auth: any) {
        return {
            request: function(config: any) {
                var token = auth.getToken();
                if (config.url.indexOf(API) === 0 && token) {
                    config.headers.Authorization = 'Bearer' + token;
                }
                return config;
            },
            response: function(res: any) {
                console.log(res);
                if (res.config.url.indexOf(API) === 0 && res.data.token) {
                    auth.saveToken(res.data.token);
                }
                return res;
            }
        }
    }

    function authService($window: any) {
        var self = this;
        self.parseJWT = function(token: any) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
        };
        self.saveToken = function(token: any) {
            $window.localStorage['jwtToken'] = token;
        };
        self.getToken = function() {
            return $window.localStorage['jwtToken'];
        };
        self.isAuthed = function() {
            var token = self.getToken();
            if (token) {
                var params = self.parseJWT(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        };
        self.logout = function() {
            $window.localStorage.removeItem('jwtToken');
        }
    }

    function userService($http: any, API: any, auth: any) {
        var self = this;
        self.getQuote = function() {
            return $http.get(API + '/auth/quote');
        };
        self.register = function(username: any, password: any) {
            return $http.post(API + '/auth/register', {
                username: username,
                password: password
            });
        };
        self.login = function(username: any, password: any) {
            return $http.post(API + '/auth/login', {
                username: username,
                password: password
            });
        };

    }

    function AuthController(user: any, auth: any) {
        var self = this;
        self.logging = false;
        function handleRequest(res: any) {
            var token = res.data ? res.data.token : null;
            if (token) { console.log('JWT:', token); }
            self.message = res.data.message;
        }
        self.login = function() {
            user.login(self.username, self.password)
                .then(handleRequest, handleRequest);
        };
        self.register = function() {
            user.register(self.username, self.password)
                .then(handleRequest, handleRequest);
        };
        self.getQuote = function() {
            user.getQuote()
                .then(handleRequest, handleRequest);
        };
        self.logout = function() {
            auth.logout && auth.logout();
        };
        self.isAuthed = function() {
            return auth.isAuthed() ? auth.isAuthed() : false;
        };
        self.showLoginForm = function() {
            self.logging = true;
        };
    }
    function TodoListController() {
        var todoList = this;
        todoList.todos = [];
        todoList.addTodo = function() {
            if (todoList.todoText) {
                todoList.todos.push({text: todoList.todoText, done: false});
                todoList.todoText = '';
            }
        };
    }
    var app = angular.module("ToDoDo", []);

    app.controller("TodoListController", TodoListController);
    app.factory('authInterceptor', authInterceptor);
    app.service('user', userService);
    app.service('auth', authService);
    app.constant('API', '');
    app.config(function($httpProvider: any) {
        $httpProvider.interceptors.push('authInterceptor');
    });
    app.controller('AuthController', AuthController);
})();
