(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var Lexer, lexer, parser, pkg, stringifier, toString, whitelist;

  toString = Object.prototype.toString;

  whitelist = require('./whitelist');

  parser = require('./parser');

  stringifier = require('./stringifier');

  pkg = require('../package.json');

  Lexer = (function() {
    function Lexer(structure) {
      this.structure = structure;
      if (toString.call(this.structure) !== '[object Array]') {
        this.structure = [this.structure];
      }
    }

    Lexer.prototype.html = function() {
      return lexer.stringifier.toHtml(this.structure);
    };

    Lexer.prototype.text = function() {
      return lexer.stringifier.toText(this.structure);
    };

    Lexer.prototype.toJSON = function() {
      return this.structure;
    };

    Lexer.prototype.isValid = function() {
      return this.structure.every(function(obj) {
        return toString.call(obj) === '[object String]' || lexer.whitelist[obj != null ? obj.type : void 0];
      });
    };

    return Lexer;

  })();

  lexer = function(structure) {
    return new Lexer(structure);
  };

  lexer.name = 'lexer';

  lexer.version = pkg.version;

  lexer.whitelist = whitelist;

  lexer.parser = parser;

  lexer.stringifier = stringifier;

  lexer.createElement = function(type, text, props) {
    var ele, k, v;
    if (!whitelist[type]) {
      return text;
    }
    ele = {
      type: type,
      text: text
    };
    for (k in props) {
      v = props[k];
      ele[k] = v;
    }
    return ele;
  };

  lexer.parseDOM = function() {
    var structure;
    structure = lexer.parser.parseDOM.apply(lexer.parser, arguments);
    return new Lexer(structure);
  };

  module.exports = lexer;

  if (typeof window !== "undefined" && window !== null) {
    window.lexer = lexer;
  }

}).call(this);

},{"../package.json":5,"./parser":2,"./stringifier":3,"./whitelist":4}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var invalidNodeType, parseDOM, parserMap, toString, whitelist,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  whitelist = require('./whitelist');

  toString = Object.prototype.toString;

  invalidNodeType = [8];

  parserMap = {
    "default": function(node) {
      var nodeType, obj, tagName, textContent, _i, _ref, _ref1, _results;
      tagName = node.tagName, nodeType = node.nodeType, textContent = node.textContent;
      obj = {
        type: tagName.toLowerCase(),
        text: node.textContent
      };
      obj.data = {};
      (function() {
        _results = [];
        for (var _i = 0, _ref = (_ref1 = node.attributes) != null ? _ref1.length : void 0; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).forEach(function(i) {
        var attr, key, prefix, _ref;
        attr = node.attributes[i];
        _ref = attr.name.split('-'), prefix = _ref[0], key = _ref[1];
        if (prefix === 'data' && (key != null)) {
          return obj.data[key] = attr.value;
        }
      });
      return obj;
    },
    mention: function(node, opts) {
      var nodeType, sectionBuffer, structure, tagName, textContent;
      tagName = node.tagName, nodeType = node.nodeType, textContent = node.textContent;
      if (tagName === 'MENTION') {
        return parserMap["default"](node);
      }
      if (tagName) {
        return false;
      }
      structure = [];
      sectionBuffer = '';
      textContent.split('@').forEach(function(section, i) {
        var data, match, mention, opt;
        if (i === 0) {
          return sectionBuffer += section || '';
        }
        for (i in opts) {
          opt = opts[i];
          match = opt.match, data = opt.data;
          if (section.indexOf(match) === 0) {
            mention = {
              type: 'mention',
              text: "@" + match
            };
            if (data != null) {
              mention.data = data;
            }
            structure.push(sectionBuffer, mention);
            sectionBuffer = section.slice(match.length);
            return true;
          }
        }
        return sectionBuffer += "@" + section;
      });
      structure.push(sectionBuffer);
      return structure;
    },
    link: function(node, opts) {
      var classList, href, nodeType, tagName, textContent;
      tagName = node.tagName, nodeType = node.nodeType, classList = node.classList, href = node.href, textContent = node.textContent;
      classList || (classList = []);
      if (!(__indexOf.call(classList, 'lexer-link') >= 0 && tagName === 'A')) {
        return false;
      }
      return {
        type: 'link',
        href: href,
        text: textContent
      };
    },
    highlight: function(node, opts) {
      var classList, href, nodeType, tagName, textContent;
      tagName = node.tagName, nodeType = node.nodeType, classList = node.classList, href = node.href, textContent = node.textContent;
      classList || (classList = []);
      if (!(__indexOf.call(classList, 'lexer-highlight') >= 0 && tagName === 'EM')) {
        return false;
      }
      return {
        type: 'highlight',
        text: textContent
      };
    }
  };

  parseDOM = function(nodes, options) {
    var structure, _i, _ref, _results;
    if (options == null) {
      options = {};
    }
    structure = [];
    (function() {
      _results = [];
      for (var _i = 0, _ref = nodes.length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).forEach(function(i) {
      var judge, node, nodeType, tagName, text;
      node = nodes[i];
      nodeType = node.nodeType, tagName = node.tagName;
      if (__indexOf.call(invalidNodeType, nodeType) >= 0) {
        return;
      }
      if (tagName === 'BR') {
        return structure.push('\n');
      }
      judge = Object.keys(whitelist).some(function(parserKey) {
        var obj;
        if (typeof parserMap[parserKey] !== 'function') {
          return false;
        }
        obj = parserMap[parserKey](node, options[parserKey]);
        if (toString.call(obj) === '[object Array]') {
          structure = structure.concat(obj);
        } else if (obj) {
          structure.push(obj);
        }
        return obj;
      });
      if (!judge) {
        text = node.textContent;
        if (tagName === 'DIV') {
          text += '\n';
        }
        if (text.length) {
          return structure.push(text);
        } else {
          return false;
        }
      }
    });
    return structure;
  };

  module.exports = {
    parseDOM: parseDOM
  };

}).call(this);

},{"./whitelist":4}],3:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var stringifierMap, toHtml, toString, toText, whitelist, _entities, _markLink, _markNewline;

  whitelist = require('./whitelist');

  toString = Object.prototype.toString;

  _markLink = function(str) {
    return str.replace(/(http(s)?:\/\/[^\s]+)/ig, '<a href="$1" target="_blank">$1</a>');
  };

  _entities = function(str) {
    return str.replace(/[&<>"']/g, function(code) {
      return "&" + {
        "&": "amp",
        "<": "lt",
        ">": "gt",
        '"': "quot",
        "'": "apos"
      }[code] + ";";
    });
  };

  _markNewline = function(str) {
    return str.split('\n').join('<br>');
  };

  stringifierMap = {
    "default": function(node) {
      var attrs, data, k, text, type, v;
      type = node.type, text = node.text, data = node.data;
      data || (data = {});
      attrs = (function() {
        var _results;
        _results = [];
        for (k in data) {
          v = data[k];
          _results.push("data-" + k + "=\"" + v + "\"");
        }
        return _results;
      })();
      return "<" + type + " " + (attrs.join(' ')) + ">" + (_entities(text)) + "</" + type + ">";
    },
    mention: function(node) {
      return stringifierMap["default"](node);
    },
    link: function(node) {
      var href, text, type;
      type = node.type, href = node.href, text = node.text;
      return "<a href=\"" + href + "\" class=\"lexer-link\" rel=\"noreferrer\" target=\"_blank\">" + (_entities(text)) + "</a>";
    },
    highlight: function(node) {
      var text, type;
      type = node.type, text = node.text;
      return "<em class=\"lexer-highlight\">" + text + "</em>";
    },
    text: function(node) {
      var text;
      text = node.text || node;
      return _markLink(_markNewline(_entities(text)));
    }
  };

  toHtml = function(structure) {
    return structure.map(function(node) {
      var data, text, type;
      if (toString.call(node) === '[object String]') {
        return stringifierMap.text(node);
      }
      if (node == null) {
        return '';
      }
      type = node.type, text = node.text, data = node.data;
      if (!(whitelist[type] && typeof stringifierMap[type] === 'function')) {
        return '';
      }
      return stringifierMap[type](node);
    }).join('');
  };

  toText = function(structure) {
    return structure.map(function(node) {
      var data, text, type;
      if (toString.call(node) === '[object String]') {
        return node;
      }
      if (node == null) {
        return '';
      }
      type = node.type, text = node.text, data = node.data;
      if (!whitelist[type]) {
        return '';
      }
      return text || '';
    }).join('');
  };

  module.exports = {
    toHtml: toHtml,
    toText: toText
  };

}).call(this);

},{"./whitelist":4}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  module.exports = {
    mention: 1,
    link: 1,
    highlight: 1
  };

}).call(this);

},{}],5:[function(require,module,exports){
module.exports={
  "version": "0.1.9",
  "main": "./lib/lexer.js",
  "directories": {
    "test": "test"
  },
  "scripts": {
    "test": "make test"
  },
  "license": "MIT",
  "author": "teambition",
  "name": "lexer",
  "repository": {
    "type": "git",
    "url": "git@code.teambition.com:project/lexer.git"
  },
  "devDependencies": {
    "should": "^4.0.4",
    "mocha": "^1.21.4",
    "benchmark": "^1.0.0",
    "coffee-script": "^1.8.0",
    "gulp": "^3.8.7",
    "gulp-util": "^3.0.0"
  },
  "dependencies": {}
}
},{}]},{},[1]);
