const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  
  if (!user){
    return response.status(404).json({ error: "User not found!" });
  }
     
  request.user = user;
  return next();
}

function checkExistsTodo(id, userTodos, response){
  const todo = userTodos.find(todo => todo.id === id);

  if (!todo){
    return response.status(404).json({ error: `Todo with id "${id}" was not found!` });
  }

  return todo;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;    

  const checksExistsUserAccount = users.some(
      (user) => user.username === username
  );

  if (checksExistsUserAccount){
    return response.status(400).json({ error: "Username is already in use!" });
  }

  const userData = {
    name,
    username, 
    id: uuidv4(),
    todos: []
  };

  users.push(userData);

  return response.status(201).json(userData);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;    
  const { user } = request;

  const todoData = { 
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todoData);

  return response.status(201).json(todoData);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;  
  const { title, deadline } = request.body;    
  const { user } = request;

  const todo = checkExistsTodo(id, user.todos, response);

  if (title){
    todo.title = title;
  }

  if (deadline){
    todo.deadline = new Date(deadline);
  }

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;  
  const { user } = request;

  const todo = checkExistsTodo(id, user.todos, response);

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;  
  const { user } = request;

  const todo = checkExistsTodo(id, user.todos, response);
  
  //splice
  user.todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;