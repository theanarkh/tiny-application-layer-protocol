
const net = require('net');
const { FSM, packet } = require('../protocol');

net.createServer(function(socket) {
  const fsm = new FSM({
    cb: function() {
      console.log('receiver: ', ...arguments);
      socket.write(packet('ok'));
    }
  })
  socket.on('data', fsm.run.bind(fsm));
  socket.on('error', function() {
    console.log(...arguments)
  })
}).listen(10001);

