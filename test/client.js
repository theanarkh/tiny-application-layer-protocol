
const net = require('net');
const { FSM, packet } = require('../protocol');
async function test() {
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
  let i = 0;
  const timer = setInterval(() => {
    socket.write(packet(String(i+1)));
    i++ > 5 && (socket.end(), clearInterval(timer));
  },1000)
}

test()