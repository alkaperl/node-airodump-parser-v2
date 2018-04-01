var debug = true;
var jsonp = function(url, callback) {
  var obj = {
    url: url + '&callback=' + callback,
    insert: function() {
      var element = document.createElement('script');
      element.setAttribute('src', this.url);
      element.setAttribute('type','text/javascript');
      document.getElementsByTagName('head')[0].appendChild(element);
    }
  };

  document.addEventListener(
    'jsonpCleanup', function() {
      document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName('script')[0]);
    }
  );

  return obj;
}

var jsonpResponseToEvent = function(data) {
  document.dispatchEvent(
    new CustomEvent('writeOut', {detail:data})
  );
  document.dispatchEvent(
    new CustomEvent('jsonpCleanup', {detail:data})
  );
};

(function(DEBUG, jsonp) {
  'use strict';
  var jsonp = jsonp;
  var historyModule = {
    data: [],
    offset: 0,
    add: function(input) {
      this.data.push(input);
      this.offsetRewind();
    },
    get: function(offset) {
      return this.offsetExists(offset)
      ? this.data[offset] : undefined;
    },
    getPrevious: function() {
      if(this.data.length === 0) {

        return '';
      }
      ++this.offset;
      var previous = this.get(this.data.length - this.offset);
      if(previous === undefined) {
        this.offsetRewind();

        return this.getPrevious();
      }

      return previous;
    },
    getNext: function() {
      if(this.data.length === 0) {

        return '';
      }
      --this.offset;
      var next = this.get(this.data.length - this.offset);
      if(next === undefined) {
        this.offset = this.data.length +1;

        return this.getNext();
      }

      return next;
    },
    offsetExists: function(offset) {
      return (offset in this.data);
    },
    offsetRewind: function() {
      this.offset = 0;
    }
  };

  var stdin = (function(element, history) {
    var obj = {
      history: history,
      element: element,
      setFocus: function() {
        this.element.focus();
      },
      setFocusOnEndCaret: function() {
        var range = document.createRange();
        var selection = window.getSelection();
        try {
          range.setStart(element, 1);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          this.setFocus();
        } catch(exception) {
          // ignore exception..
        }
      },
      feedline: function() {
        this.history.add(
           this.element.innerHTML.trimRight()
        );
        document.dispatchEvent(
          new CustomEvent('writeOut', {detail:this.element.innerHTML.trimRight()})
        );
        this.setFocus();
      },
      clear: function() {
        this.element.innerHTML = '';
      }
    };

    // escaping some design controls
   obj.element.addEventListener('keypress', function(event) {
      switch(event.keyCode) {
        // ENTER
        case 13:
          event.preventDefault();
      }
    });
    // stdin input events
    obj.element.addEventListener('keyup', function(event) {
      switch(event.keyCode) {
        // ENTER
        case 13:
          obj.feedline();
          obj.clear();
          break;
        // ARROW UP
        case 38:
          obj.element.innerHTML = obj.history.getPrevious();
          obj.setFocusOnEndCaret();
          break;
        case 40:
          obj.element.innerHTML = obj.history.getNext();
          obj.setFocusOnEndCaret();
          break;
      }
    });

    window.addEventListener('load', function() {
      if(DEBUG === false) {
        obj.setFocus();
      }
    });

    return obj;
  })(document.querySelector('#stdin'), historyModule);

  var stdout = (function(element) {
    var obj = {
      element: element,
      clear: function() {
        this.element.innerHTML = '&nbsp;';
      },
      send: function(text) {
        if(this.element.innerHTML === '&nbsp;') {
          this.element.innerHTML = text;
        } else {
          this.element.innerHTML += '<br>' + text;
        }
        this.element.scrollTop = this.element.scrollHeight;

        return this;
      }
    };
    // event @ECHO TEST
    document.addEventListener('writeOut', function(writeEvent) {
      if(typeof(writeEvent.detail) === 'object') {
        // @todo remove hack..
        var wiki = writeEvent.detail.query.pages[Object.getOwnPropertyNames(writeEvent.detail.query.pages)].extract;
        var div = document.createElement("div");
        div.innerHTML = wiki;
        var output = (div.textContent || div.innerText || "").replace('\"', "");
        obj.send('>' + (output));
        console.log(output);
      } else {
        obj.send('> ' + writeEvent.detail);
      }
    });

    return obj;
  })(document.querySelector('#stdout'));

  var jsEvaluatorWrap = {
    eval: function(input) {
      try {
        var result = eval(input);
      } catch(exception) {
        console.log(exception);
        var result = 'Failure: ' + exception.message;
      }

      return result;
    }
  };

  var wiki = function(title, jsonp) {
    var url = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=' + title + '&format=json';

    var obj = {
      request: jsonp(url, 'jsonpResponseToEvent').insert()
    };

    return obj;
  };

  var checkAgainst = function (haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
};
Array.prototype.diff = function(allowed) {
    var ret = [];
    for(var i in this) {
        if(allowed.indexOf( this[i] ) > -1){
            ret.push( this[i] );
        }
    }
    return ret;
}



  var inputAnalyzer = (function() {
    var command = ['nav', 'check', 'easter', 'clear', 'help'];
    var dispatch = function(command, args) {
      switch(command) {
        case 'clear':
          stdout.clear();
          break;

        case 'help':
          stdout
            .send('<b>Commands:</b>')
            .send('nav &lt;page&gt; -  projects, about, services, blog, contact, cv')
            .send('clear')
            .send('help')
          break;

        case 'nav':
            // console.log(args[0]);
            var allowed = ['projects', 'about', 'services', 'blog', 'contact', 'cv'];

            if(checkAgainst(args, allowed)) {
                // console.log(args);
                location = args.diff(allowed)[0]
            } else {}

            break;

        case 'js':
          stdout.send(
            jsEvaluatorWrap.eval(args.join(" "))
          );
          break;

        case 'wiki':
          var search = (args.length > 1) ?
              args.join("%20") : args[0];
          wiki(search, jsonp);
          break;
      }
    };
    var evaluate = function(input) {
      var argument = input.split(" ");
      var head = argument.shift();
      var argumentCount = head.length;
      var commandExists = false;
      for(var i = 0; i < this.command.length; ++i) {
        if(this.command[i].indexOf(head) == 0) {
          commandExists = true;
          (argumentCount > 1) ? dispatch(head, argument) : dispatch(head);
        }
      }
    };

    var obj = {
      command: command,
      evaluate: evaluate,
    };

    document.addEventListener('writeOut', function(writeEvent) {
      if(typeof(writeEvent.detail) === 'object') {
      } else {
        obj.evaluate(writeEvent.detail);
      }
    });

    return obj;
  }());
 })(debug, jsonp);
delete debug;
