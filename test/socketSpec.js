var http = require('http').Server;
var io = require('socket.io').listen;
var ioc = require('socket.io-client');
var request = require('supertest');
var expect = require('expect.js');

// creates a socket.io client for the given server

function client(srv, nsp, opts) {
  if ('object' == typeof nsp) {
    opts = nsp;
    nsp = null;
  }
  var addr = srv.address();
  if (!addr) addr = srv.listen().address();
  var url = 'ws://' + addr.address + ':' + addr.port + (nsp || '');
  return ioc.connect(url, opts);
}

describe('socket', function() {
  it('should receive events', function(done) {
    var srv = http();
    var sio = io(srv);
    srv.listen(function() {
      var socket = client(srv);
      sio.on('connection', function(s) {
        s.on('random', function(a, b, c) {
          expect(a).to.be(1);
          expect(b).to.be('2');
          expect(c).to.eql([3]);
          done();
        });
      });
      socket.emit('random', 1, '2', [3]);
    });
  });

  it('should receive message events through `send`', function(done) {
    var srv = http();
    var sio = io(srv);
    srv.listen(function() {
      var socket = client(srv);
      sio.on('connection', function(s) {
        s.on('message', function(a) {
          expect(a).to.be('1337');
          done();
        });
      });
      socket.send(1337);
    });
  });
});
