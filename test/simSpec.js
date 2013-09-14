var http = require('http').Server;
var io = require('socket.io').listen;
var ioc = require('socket.io-client');
var request = require('supertest');
var expect = require('expect.js');

var fs = require('fs');
var r = require('librr').librrc_api;
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

describe('simulator', function() {
  it('should load a model', function(done) {
    var srv = http();
    var sio = io(srv);
    srv.listen(function() {
      var socket = client(srv);
      sio.on('connection', function(s) {
        var rr = r.createRRInstance();
        r.setTempFolder(rr, '/tmp');
        expect(r.getAPIVersion()).to.be('0.99');
        s.on('run', function(data) {
          if (!data.noInstance) {
            data.params.unshift(rr);
          }
          var output;
          try {
            output = r[data.method].apply(this, data.params);
            //console.log(output);
            if (data.method.indexOf('simulate') > -1) {
              // format simulation data
              var text = r.rrDataToString(output).split('\n');
              // remove empty entry at the end;
              text.pop();
              output = text.map(function(line) {
                return line.split('\t');
              }, this);
            }
          } catch(e) {
            output = e;
          } finally {
            s.emit('response', {
              method: data.method,
              output: output});
          }
        });
      });
      var model = fs.readFileSync('test/feedback.xml', 'utf8');

      socket.emit('run', {
        method: 'getTempFolder',
        params: []
      })
      socket.emit('run', {
        method: 'loadSBML',
        params: [model]
      });
      socket.emit('run', {
        method: 'getSBML',
        params: []
      });
      socket.emit('run', {
        method: 'simulateEx',
        params: [0, 100, 100]
      });
      socket.on('response', function(data) {
        if(data.method.indexOf('simulate') > -1) {
          done();
        }
      });
    });
  });

});
