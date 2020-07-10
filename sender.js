
const net = require('net');

async function test() {
  const socket = net.connect({port: 10001});
  socket.on('error', function() {
    console.log(...arguments);
  });
  let i = 0;
  const a = setInterval(() => {
    socket.write(Buffer.from([0x3,0x0, 0x0, 0x0, 0x9, 0x0, 0x0, 0x0, 0x1, i+1, 0x4]));
    i++ > 5 && (socket.end(), clearInterval(a));
  },1000)
}

test()