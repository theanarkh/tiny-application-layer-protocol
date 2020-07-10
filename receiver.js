
const net = require('net');
const parse = require('./machine');
net.createServer(function(socket) {
  socket.on('data', function() {
    console.log('receiver: ', ...arguments)
    parse(...arguments);
  });
  socket.on('error', function() {
    console.log(...arguments)
  })
}).listen(10001);

