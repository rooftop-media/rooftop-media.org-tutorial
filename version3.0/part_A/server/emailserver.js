// let net = require('net');

// let emailSocket = net.createConnection(465, 'smtp.gmail.com', () => {
//   console.log("New email request");
//   emailSocket.write("HELO gmail \r\n");
//   emailSocket.write("MAIL FROM: <ben@rooftop.com>\r\n");
//   emailSocket.write('RCPT TO: <benholland1024@gmail.com>\r\n');

//   emailSocket.write('DATA\r\n');
//   emailSocket.write('FROM: <ethan.arrowood@gmail.com>\r\n');
//   emailSocket.write('TO: <ethan.arrowood@gmail.com>\r\n');
//   emailSocket.write('SUBJECT: Testing\r\n');
//   emailSocket.write('This is cool!\r\n');

//   emailSocket.write('.\r\n')
//   emailSocket.write('QUIT\r\n')
// }) 
// emailSocket.on('data', (data) => {
//   console.log(data.toString());
//   // emailSocket.end();
// });

const net     = require('net');
const process = require('process');
const tls     = require('tls'); // for tls.getCiphers()

const commands = [
  'EHLO 93.sub-75-209-98.myvzw.com\r\n',
  
  // 'STARTTLS\r\n',
  // ''
  // `{Version: 1.2 0x0303, Random: 4020480408091909, CipherSuites: ['tls_aes_128_ccm_8_sha256', 'tls_aes_128_ccm_sha256']} ClientHello\r\n`,
  
  'MAIL FROM: <ben@93.sub-75-209-98.myvzw.com>\r\n',
  'RCPT TO: <kallie.rohan29@ethereal.email>\r\n',
  'DATA\r\n',
  'FROM: <ben@93.sub-75-209-98.myvzw.com>\r\nTO: <kallie.rohan29@ethereal.email>\r\nSUBJECT: Test 7\r\n',
  '<p>This is cool!</p>\r\n<p>Blah blah blah...</p>\r\n.\r\n',
  'QUIT\r\n'
]

let i = 0

const socket = net.createConnection(25, 'smtp.ethereal.email', () => console.log('===== \n Connected to ethereal SMTP server.'))

//  Fires on each response
socket.on('data', buff => {
  const res = buff.toString()
  process.stdout.write(`\x1b[31mS:\x1b[0m ${res}`)
  
  if (res.includes('221')) {
    socket.destroy();
    process.exit();

  } else if (i < commands.length) {
    console.log("\x1b[90mPress enter to send next message...\x1b[0m")
    
  } else {
    console.log('Ran out of commands but did not receive 221 response from SMTP server')
    socket.destroy()
  }
})

//  Manually send responses
var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', function(key) {
  //  Exit on ctrl-c
  if (key === '\u0003') {
    socket.destroy()
    process.exit();

  } else if (key == '\u000D') {
    process.stdout.write(`\x1b[34mC:\x1b[0m ${commands[i]}`)
    socket.write(commands[i]);
    i++;
  } else {
//process.stdout.write(key);
  }
  
});