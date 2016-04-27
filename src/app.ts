///<reference path="../typings/angularjs/angular.d.ts" />

(function() {
    function MainController($scope: any, $http: any, jwtHelper: any) {
        var self = this;
        self.currentUser = null;
        self.editingTodo = false;
        self.addingTodo = false;
        class Todo {
            text: string;
            priorities: any;
            date: Date;
            done: boolean;
            public constructor(){
            this.text = '';
            this.priorities = {
                options: [
                    { id: '0', name: 'Save the World!' },
                    { id: '1', name: 'Important' },
                    { id: '2', name: 'Worth doing' },
                    { id: '3', name: 'Ehh, maybe, maybe' }
                ],
                selectedOption: { id: '2', name: 'Worth doing' }
            };
            this.date = new Date();
            this.done = false;
            }
        };
        self.todos = {
            list: [],
            newTodo: new Todo()
        };
        self.predicate = 'date';
        self.reverse = false;
        self.order = function(predicate: any) {
          self.reverse = (self.predicate === predicate) ? !self.reverse : false;
          self.predicate = predicate;
        };
        self.doneFilter = {
            options: [
                { id: '0', done: undefined, name: 'All' },
                { id: '1', done: true, name: 'Done' },
                { id: '2', done: false, name: 'Actual' }
            ],
            selectedOption: { id: '0', done: undefined, name: 'All' }
        };
        self.donePredicate = { done: self.doneFilter.selectedOption.done };
        self.showAddForm = function() {
            self.addingTodo = true;
            self.editingTodo = true;
        };
        self.hideAddForm = function() {
            self.addingTodo = false;
            self.editingTodo = false;
            self.todos.newTodo = new Todo();
        };
        self.editTodo = function(todo: any) {
            self.editingTodo = true;
            todo.editing = true;
        };
        self.saveTodo = function(todo: any) {
            self.updateTodo(todo, function() {
                self.editingTodo = false;
            });
        };
        self.cancelTodoEditing = function(todo: any) {
            self.loadTodos();
            self.editingTodo = false;
        };
        self.doTodo = function(todo: any) {
            todo.done = true;
            self.updateTodo(todo, function() {});
        };
        self.undoTodo = function(todo:any) {
            todo.done = false;
            self.updateTodo(todo, function() {});
        }
        self.deleteTodo = function(todo: any) {
            $http.post('/deletetodo', {
                todo: todo
            }).then(function() {
                self.loadTodos();
            });
            self.editingTodo = false;
        };
        self.login = function() {
            return $http({
                url: '/login',
                method: 'POST',
                skipAuthorization: true,
                data: {
                    username: self.username,
                    password: self.password
                }
            }).then(function(res: any) {
                if (!res.data.success) {
                    self.errorMessage = res.data.message;
                } else {
                    self.clearCredentials();
                    localStorage['id_token'] = res.data.token;
                    self.recoverUserData();
                }
            });
        };
        self.register = function() {
            return $http({
                url: '/register',
                method: 'POST',
                skipAuthorization: true,
                data: {
                    username: self.username,
                    password: self.password,
                    password_repeat: self.passwordRepeat
                }
            }).then(function(res: any) {
                if (!res.data.success) {
                    self.errorMessage = res.data.message;
                } else {
                    self.clearCredentials();
                    localStorage['id_token'] = res.data.token;
                    self.recoverUserData();
                }
            });
        };
        self.loadTodos = function() {
            $http.get('/loadtodos').then(function(res: any) {
                self.todos.list = res.data.todos;
                for (let todo of self.todos.list) {
                    todo.date = new Date(todo.date);
                    todo.editing = false;
                }
            });
        };
        self.updateTodo = function(todo: any, callback: any) {
            $http.post('/updatetodo', {
                todo: todo
            }).then(function(res: any) {
                self.loadTodos();
                callback();
            });
        };
        self.logout = function() {
            self.clearCredentials();
            self.currentUser = null;
            delete localStorage['id_token'];
        };
        self.signUp = function() {
            self.clearCredentials();
            self.signingUp = true;
        };
        self.signIn = function() {
            self.clearCredentials();
            self.signingUp = false;
        };
        self.isAuthed = function() {
            return self.currentUser !== null;
        };
        self.recoverUserData = function() {
            var idToken = localStorage['id_token'];
            if (idToken && !jwtHelper.isTokenExpired(idToken)) {
                return $http.get('/user')
                            .then(function(res: any) {
                                self.currentUser = res.data;
                                self.loadTodos();
                            });
            }
        };
        self.clearCredentials = function() {
            self.username = '';
            self.password = '';
            self.passwordRepeat = '';
            self.errorMessage = '';
        };
        self.addTodo = function() {
            if (self.todos.newTodo.text) {
                $http.post('/addtodo', {
                    todo: self.todos.newTodo
                }).then(function (res: any) {
                    self.loadTodos();
                    self.hideAddForm();
                });
            }
        };
        $scope.$watch(function() {
            return self.currentUser;
        }, function() {
            self.recoverUserData();
        }, true);
        $scope.$watch(function() {
            return self.doneFilter;
        }, function() {
            self.donePredicate.done = self.doneFilter.selectedOption.done;
        }, true);
    }

    angular.module("ToDoDo", ['angular-jwt'])
        .controller('MainController', MainController)
        .config(function ($httpProvider: any, jwtInterceptorProvider: any) {
            jwtInterceptorProvider.tokenGetter = ['jwtHelper', function(jwtHelper: any) {
                var idToken = localStorage['id_token'];
                if (idToken && !jwtHelper.isTokenExpired(idToken)) {
                    return idToken;
                }
            }];
            $httpProvider.interceptors.push('jwtInterceptor');
        });
})();
