const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const userExists = users.find(user => user.username === username)

  if(!userExists){
    return response.status(404).json({ message: 'Usuário não encontrado' })
  }

  request.user = userExists

  return next()
}


app.post('/users', (request, response) => {
  const { name, username } = request.body
  const newUser = {
    id: uuid(),
    name,
    username,
    todos: []
  }
  
  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/users', (request, response) => {
  return response.json(users)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todosOperation = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todosOperation)

  return response.status(201).json({ message: 'To-do Criado com sucesso' })
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body
  
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return response.status(404).json({ message: 'To-do não encontrado' })
  }
  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json({ message: 'To-do alterado com sucesso'})
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return response.status(404).json({ message: 'To-do não encontrado' })
  }

  todo.done = true

  return response.json({ message: 'To-do alterado como finalizado com sucesso' })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.findIndex(todo => todo.id === id)

  if(todo === -1) {
    return response.status(404).json({ message: 'To-do não encontrado' })
  }

  user.todos.splice(todo, 1 )
  return response.json({ message: 'To-do removido com sucesso' })
});




module.exports = app;