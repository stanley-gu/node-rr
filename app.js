
/**
 * Module dependencies.
 */

var io = require('socket.io').listen(8003)
  , r = require('librr').librrc_api;

io.sockets.on('connection', function(s) {
  var rr = r.createRRInstance();
  r.setTempFolder(rr, '/tmp');
  s.on('run', function(data) {
    if (!data.noRRInstance) {
      data.params.unshift(rr);
    }
    var output;
    try {
      rrOutput = r[data.method].apply(this, data.params);

      if (data.method.indexOf('simulate') > -1) {
        // format simulation data
        var text = r.rrDataToString(rrOutput).split('\n');
        // remove empty entry at the end;
        text.pop();
        output = text.map(function(line) {
          return line.split('\t');
        }, this);

        // clear memory usage
        r.freeResult(rrOutput);
      } else if (data.postProcess) {
        // general steps for post processing output
        output = r[data.postProcess](rrOutput);
      } else {
        output = rrOutput;
      }

      if (data.freeMem) {
        r[data.freeMem](rrOutput);
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
