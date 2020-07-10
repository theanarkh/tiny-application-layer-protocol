
const net = require('net');

async function test() {
  const socket = net.connect({port: 10001});
  socket.on('error', function() {
    console.log(...arguments);
  });
  let data = Buffer.from([0x3,0x0, 0x0, 0x0, 0x9, 0x0, 0x0, 0x0, 0x1, 0x1, 0x4]);
  let i = 0;
  const id = setInterval(() => {
      if (!data.length) {
        socket.end();
        return clearInterval(id);
      }
    const packet = data.slice(0, 1);
    console.log(packet)
    socket.write(packet);
    data = data.slice(1);
  }, 500);
}

test()