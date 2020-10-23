
const net = require('net');
const { FSM, packet } = require('../protocol');

function test() {
  const socket = net.connect({port: 10001});
  socket.on('error', function() {
    console.log(...arguments);
  });
  const fsm = new FSM({
    cb: function() {
      console.log('receiver: ', ...arguments);
    }
  })
  socket.on('data', fsm.run.bind(fsm));
  let data = packet('1');
  let i = 0;
  const id = setInterval(() => {
      if (!data.length) {
        socket.end();
        return clearInterval(id);
      }
    const packet = data.slice(0, 1);
    socket.write(packet);
    data = data.slice(1);
  }, 500);
}

test()