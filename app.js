
/**
 * Module dependencies.
 */

var io = require('socket.io').listen(8003)
  , r = require('librr').librrc_api;

io.sockets.on('connection', function(s) {
  var rr = r.createRRInstance();
  r.setTempFolder(rr, '/tmp');
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
  s.on('disconnect', function() {
    r.freeRRInstance(rr);
  })
});
