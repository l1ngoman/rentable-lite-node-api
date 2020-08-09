// Video tutorial source: https://www.youtube.com/watch?v=blQ60skPzl0&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=2

const http = require('http');
const app = require('./app');

// SET THE PORT VIA ENV VARIABLE OR BACK UP WITH 3000
const port = process.env.PORT || 3001;
// CALL CREATE SERVER METHOD THAT TAKES A FUNCTION AS AN ARG THAT RUNS EVERYTIME WE MAKE A REQUEST
const server = http.createServer(app);
// ENVOKE THE SERVER TO RUN THE FUNCTION
server.listen(port);