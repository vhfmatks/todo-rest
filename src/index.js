
const getTodo = require('./get-todo.ctrl');
const insertTodo = require('./insert-todo.ctrl');
const updateTodo = require('./update-todo.ctrl');

const todos = (app, db) => {
    
    app.get('/todos', (req, res) => {
        getTodo(req, db)
        .then( (result)=>{
            res.json(result);
        })
        .catch( (err) => {
            res.json(err);
        });
    });
    app.post('/todos', (req, res)=>{
        insertTodo(req, db)
        .then( (result) => {
            res.json(result);
        })
        .catch( (err) => {
            res.json(err);
        });
    });
    app.put('/todos', (req, res)=>{
        updateTodo(req, db)
        .then( (result) => {
            res.json(result);
        })
        .catch( (err) => {
            res.json(err);
        });
    });
}
module.exports = todos;