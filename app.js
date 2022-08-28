(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
const {
  loadLangDictionary
} = require("./makeDictionary");

const languageNames = [
  "Thai",
  "Russian",
  "Arabic",
  "Korean",
  "Hindi",
  "Tibetan",
  "Hebrew",
  "Khmer",
  "Amharic",
  "Tamil",
  "Armenian",
  "Burmese",
  "Greek",
  "Georgian",
  "Sinhalese",
  "Romaji",
  "Hiragana",
];

const languages = {};

for (const languageName of languageNames) {
  const languageConfig = require("./languages/" + languageName.toLowerCase());
  let useAdditionalDictionary = false;
  let differentAtEndOfWord = false;
  if (languageConfig.useAdditionalDictionary) {
    useAdditionalDictionary = true;
  }
  if (languageConfig.differentAtEndOfWord) {
    differentAtEndOfWord = true;
  }
  languages[languageName] = {
    config: languageConfig,
    dictionaries: loadLangDictionary(languageName, useAdditionalDictionary, differentAtEndOfWord),
  }
}

module.exports = languages;

},{"./makeDictionary":29}],5:[function(require,module,exports){
module.exports = {"base":{"あ":"ኣ","い":"ኢ","う":"ኡ","え":"ኤ","お":"ኦ","ああ":"ኣኣ","いい":"ኢኢ","うう":"ኡኡ","ええ":"ኤኤ","おう":"ኦኦ","おお":"ኦኦ","えい":"ኤኢ","か":"ካ","き":"ኪ","く":"ኩ","け":"ኬ","こ":"ኮ","きゃ":"ኪያ","きゅ":"ኪዩ","きょ":"ኪዮ","かあ":"ካኣ","きい":"ኪኢ","くう":"ኩኡ","けえ":"ኬኤ","こう":"ኮኦ","こお":"ኮኦ","きゃあ":"ኪያኣ","きゅう":"ኪዩኡ","きょう":"ኪዮኦ","きょお":"ኪዮኦ","けい":"ኬኢ","が":"ጋ","ぎ":"ጊ","ぐ":"ጉ","げ":"ጌ","ご":"ጎ","ぎゃ":"ጊያ","ぎゅ":"ጊዩ","ぎょ":"ጊዮ","があ":"ጋኣ","ぎい":"ጊኢ","ぐう":"ጉኡ","げえ":"ጌኤ","ごう":"ጎኦ","ごお":"ጎኦ","ぎゃあ":"ጊያኣ","ぎゅう":"ጊዩኡ","ぎょう":"ጊዮኦ","ぎょお":"ጊዮኦ","げい":"ጌኢ","さ":"ሣ","すぃ":"ሢ","す":"ሡ","せ":"ሤ","そ":"ሦ","さあ":"ሣኣ","すぃい":"ሢኢ","すう":"ሡኡ","せえ":"ሤኤ","そう":"ሦኦ","そお":"ሦኦ","せい":"ሤኢ","しゃ":"ሻ","し":"ሺ","しゅ":"ሹ","しぇ":"ሼ","しょ":"ሾ","しゃあ":"ሻኣ","しい":"ሺኢ","しゅう":"ሹኡ","しぇえ":"ሼኤ","しょう":"ሾኦ","しょお":"ሾኦ","しぇい":"ሼኢ","ざ":"ዛ","ずぃ":"ዚ","ず":"ዙ","ぜ":"ዜ","ぞ":"ዞ","ざあ":"ዛኣ","ずぃい":"ዚኢ","ずう":"ዙኡ","ぜえ":"ዜኤ","ぞう":"ዞኦ","ぞお":"ዞኦ","ぜい":"ዜኢ","じゃ":"ዣ","じ":"ዢ","じゅ":"ዡ","じぇ":"ዤ","じょ":"ዦ","じゃあ":"ዣኣ","じい":"ዢኢ","じゅう":"ዡኡ","じぇえ":"ዤኤ","じょう":"ዦኦ","じょお":"ዦኦ","じぇい":"ዤኢ","た":"ታ","てぃ":"ቲ","とぅ":"ቱ","て":"ቴ","と":"ቶ","たあ":"ታኣ","てぃい":"ቲኢ","とぅう":"ቱኡ","てえ":"ቴኤ","とう":"ቶኦ","とお":"ቶኦ","てい":"ቴኢ","ちゃ":"ቻ","ち":"ቺ","ちゅ":"ቹ","ちぇ":"ቼ","ちょ":"ቾ","ちゃあ":"ቻኣ","ちい":"ቺኢ","ちゅう":"ቹኡ","ちぇえ":"ቼኤ","ちょう":"ቾኦ","ちょお":"ቾኦ","ちぇい":"ቼኢ","つぁ":"ፃ","つぃ":"ፂ","つ":"ፁ","つぇ":"ፄ","つぉ":"ፆ","つぁあ":"ፃኣ","つぃい":"ፂኢ","つう":"ፁኡ","つぇえ":"ፄኤ","つぉう":"ፆኦ","つぉお":"ፆኦ","つぇい":"ፄኢ","だ":"ዳ","でぃ":"ዲ","どぅ":"ዱ","で":"ዴ","ど":"ዶ","だあ":"ዳኣ","でぃい":"ዲኢ","どぅう":"ዱኡ","でえ":"ዴኤ","どう":"ዶኦ","どお":"ዶኦ","でい":"ዴኢ","ぢゃ":"ጃ","ぢ":"ጂ","ぢゅ":"ጁ","ぢぇ":"ጄ","ぢょ":"ጆ","ぢゃあ":"ጃኣ","ぢい":"ጂኢ","ぢゅう":"ጁኡ","ぢぇえ":"ጄኤ","ぢょう":"ጆኦ","ぢょお":"ጆኦ","ぢぇい":"ጄኢ","づ":"ዙ","づう":"ዙኡ","な":"ና","に":"ኒ","ぬ":"ኑ","ね":"ኔ","の":"ኖ","にゃ":"ኛ","にゅ":"ኙ","にょ":"ኞ","なあ":"ናኣ","にい":"ኒኢ","ぬう":"ኑኡ","ねえ":"ኔኤ","のう":"ኖኦ","のお":"ኖኦ","にゃあ":"ኛኣ","にゅう":"ኙኡ","にょう":"ኞኦ","にょお":"ኞኦ","ねい":"ኔኢ","は":"ሃ","ひ":"ሂ","へ":"ሄ","ほ":"ሆ","ひゃ":"ሂያ","ひゅ":"ሂዩ","ひょ":"ሂዮ","はあ":"ሃኣ","ひい":"ሂኢ","へえ":"ሄኤ","ほう":"ሆኦ","ほお":"ሆኦ","ひゃあ":"ሂያኣ","ひゅう":"ሂዩኡ","ひょう":"ሂዮኦ","ひょお":"ሂዮኦ","へい":"ሄኢ","ふぁ":"ፋ","ふぃ":"ፊ","ふ":"ፉ","ふぇ":"ፌ","ふぉ":"ፎ","ふぁあ":"","ふぃい":"","ふう":"ፉኡ","ふぇえ":"","ふぉう":"","ふぉお":"","ふぇい":"ፌኢ","ば":"ባ","び":"ቢ","ぶ":"ቡ","べ":"ቤ","ぼ":"ቦ","びゃ":"ቢያ","びゅ":"ቢዩ","びょ":"ቢዮ","ばあ":"ባኣ","びい":"ቢኢ","ぶう":"ቡኡ","べえ":"ቤኤ","ぼう":"ቦኦ","ぼお":"ቦኦ","びゃあ":"ቢያኣ","びゅう":"ቢዩኡ","びょう":"ቢዮኦ","びょお":"ቢዮኦ","べい":"ቤኢ","ぱ":"ፓ","ぴ":"ፒ","ぷ":"ፑ","ぺ":"ፔ","ぽ":"ፖ","ぴゃ":"ፒያ","ぴゅ":"ፒዩ","ぴょ":"ፒዮ","ぱあ":"ፓኣ","ぴい":"ፒኢ","ぷう":"ፑኡ","ぺえ":"ፔኤ","ぽう":"ፖኦ","ぽお":"ፖኦ","ぴゃあ":"ፒያኣ","ぴゅう":"ፒዩኡ","ぴょう":"ፒዮኦ","ぴょお":"ፒዮኦ","ぺい":"ፔኢ","ま":"ማ","み":"ሚ","む":"ሙ","め":"ሜ","も":"ሞ","みゃ":"ሚያ","みゅ":"ሚዩ","みょ":"ሚዮ","まあ":"ማኣ","みい":"ሚኢ","むう":"ሙኡ","めえ":"ሜኤ","もう":"ሞኦ","もお":"ሞኦ","みゃあ":"ሚያኣ","みゅう":"ሚዩኡ","みょう":"ሚዮኦ","みょお":"ሚዮኦ","めい":"ሜኢ","や":"ያ","ゆ":"ዩ","よ":"ዮ","やあ":"ያኣ","ゆう":"ዩኡ","よう":"ዮኦ","よお":"ዮኦ","ら":"ራ","り":"ሪ","る":"ሩ","れ":"ሬ","ろ":"ሮ","りゃ":"ሪያ","りゅ":"ሪዩ","りょ":"ሪዮ","らあ":"ራኣ","りい":"ሪኢ","るう":"ሩኡ","れえ":"ሬኤ","ろう":"ሮኦ","ろお":"ሮኦ","りゃあ":"ሪያኣ","りゅう":"ሪዩኡ","りょう":"ሪዮኦ","りょお":"ሪዮኦ","れい":"ሬኢ","わ":"ዋ","うぃ":"ዊ","うぇ":"ዌ","うぉ":"ዎ","わあ":"ዋኣ","うぃい":"ዊኢ","うぇえ":"ዌኤ","うぉう":"ዎኦ","うぉお":"ዎኦ","うぇい":"ዌኢ","ん":"ን","を":"ኦ","っ":"","んあ":"ንኣ","んい":"ንኢ","んう":"ንኡ","んえ":"ንኤ","んお":"ንኦ","んや":"ን","んゆ":"ን","んよ":"ን","んああ":"ንኣኣ","んいい":"ንኢኢ","んうう":"ንኡኡ","んええ":"ንኤኤ","んおう":"ንኦኦ","んおお":"ንኦኦ","んやあ":"ንኣ","んゆう":"ንኡ","んよう":"ንኦ","んよお":"ንኦ","んえい":"ንኤኢ","っか":"ካ","っき":"ኪ","っく":"ኩ","っけ":"ኬ","っこ":"ኮ","っきゃ":"ኪያ","っきゅ":"ኪዩ","っきょ":"ኪዮ","っかあ":"ካኣ","っきい":"ኪኢ","っくう":"ኩኡ","っけえ":"ኬኤ","っこう":"ኮኦ","っこお":"ኮኦ","っきゃあ":"ኪያኣ","っきゅう":"ኪዩኡ","っきょう":"ኪዮኦ","っきょお":"ኪዮኦ","っけい":"ኬኢ","っさ":"ሣ","っすぃ":"ሢ","っす":"ሡ","っせ":"ሤ","っそ":"ሦ","っさあ":"ሣኣ","っすぃい":"ሢኢ","っすう":"ሡኡ","っせえ":"ሤኤ","っそう":"ሦኦ","っそお":"ሦኦ","っせい":"ሤኢ","っしゃ":"ሻ","っし":"ሺ","っしゅ":"ሹ","っしぇ":"ሼ","っしょ":"ሾ","っしゃあ":"ሻኣ","っしい":"ሺኢ","っしゅう":"ሹኡ","っしぇえ":"ሼኤ","っしょう":"ሾኦ","っしょお":"ሾኦ","っしぇい":"ሼኢ","った":"ታ","ってぃ":"ቲ","っとぅ":"ቱ","って":"ቴ","っと":"ቶ","ったあ":"ታኣ","ってぃい":"ቲኢ","っとぅう":"ቱኡ","ってえ":"ቴኤ","っとう":"ቶኦ","っとお":"ቶኦ","ってい":"ቴኢ","っちゃ":"ቻ","っち":"ቺ","っちゅ":"ቹ","っちぇ":"ቼ","っちょ":"ቾ","っちゃあ":"ቻኣ","っちい":"ቺኢ","っちゅう":"ቹኡ","っちぇえ":"ቼኤ","っちょう":"ቾኦ","っちょお":"ቾኦ","っちぇい":"ቼኢ","っつぁ":"ፃ","っつぃ":"ፂ","っつ":"ፁ","っつぇ":"ፄ","っつぉ":"ፆ","っつぁあ":"ፃኣ","っつぃい":"ፂኢ","っつう":"ፁኡ","っつぇえ":"ፄኤ","っつぉう":"ፆኦ","っつぉお":"ፆኦ","っつぇい":"ፄኢ","っぱ":"ፓ","っぴ":"ፒ","っぷ":"ፑ","っぺ":"ፔ","っぽ":"ፖ","っぴゃ":"ፒያ","っぴゅ":"ፒዩ","っぴょ":"ፒዮ","っぱあ":"ፓኣ","っぴい":"ፒኢ","っぷう":"ፑኡ","っぺえ":"ፔኤ","っぽう":"ፖኦ","っぽお":"ፖኦ","っぴゃあ":"ፒያኣ","っぴゅう":"ፒዩኡ","っぴょう":"ፒዮኦ","っぴょお":"ፒዮኦ","っぺい":"ፔኢ","ぁ":"ኣ","ぃ":"ኢ","ぅ":"ኡ","ぇ":"ኤ","ぉ":"ኦ","ゃ":"ያ","ゅ":"ዩ","ょ":"ዮ","ぁあ":"ኣኣ","ぃい":"ኢኢ","ぅう":"ኡኡ","ぇえ":"ኤኤ","ぉう":"ኦኦ","ぉお":"ኦኦ","ゃあ":"ያኣ","ゅう":"ዩኡ","ょう":"ዮኦ","ょお":"ዮኦ","ぇい":"ኤኢ","ゔぁ":"ቫ","ゔぃ":"ቪ","ゔ":"ቩ","ゔぇ":"ቬ","ゔぉ":"ቮ","ゔぁあ":"ቫኣ","ゔぃい":"ቪኢ","ゔう":"ቩኡ","ゔぇえ":"ቬኤ","ゔぉう":"ቮኦ","ゔぉお":"ቮኦ","ゔぇい":"ቬኢ"},"additional":{},"endOfWord":{}}
},{}],6:[function(require,module,exports){
module.exports = {"base":{"あ":"أ","い":"إي","う":"أو","え":"إي","お":"أو","ああ":"أأ","いい":"إيإي","うう":"أوأو","ええ":"إيإي","おう":"أوأو","おお":"أوأو","えい":"إيي","か":"كا","き":"كي","く":"كو","け":"كي","こ":"كو","きゃ":"كيا","きゅ":"كيو","きょ":"كيو","かあ":"كاا","きい":"كيي","くう":"كوو","けえ":"كيي","こう":"كوو","こお":"كوو","きゃあ":"كياا","きゅう":"كيوو","きょう":"كيوو","きょお":"كيوو","けい":"كيي","が":"غا","ぎ":"غي","ぐ":"غو","げ":"غي","ご":"غو","ぎゃ":"غيا","ぎゅ":"غيو","ぎょ":"غيو","があ":"غاا","ぎい":"غيي","ぐう":"غوو","げえ":"غيي","ごう":"غوو","ごお":"غوو","ぎゃあ":"غياا","ぎゅう":"غيوو","ぎょう":"غيوو","ぎょお":"غيوو","げい":"غيي","さ":"سا","すぃ":"سي","す":"سو","せ":"سي","そ":"سو","さあ":"ساا","すぃい":"سيي","すう":"سوو","せえ":"سيي","そう":"سوو","そお":"سوو","せい":"سيي","しゃ":"شا","し":"شي","しゅ":"شو","しぇ":"شي","しょ":"شو","しゃあ":"شاا","しい":"شيي","しゅう":"شوو","しぇえ":"شيي","しょう":"شوو","しょお":"شوو","しぇい":"شيي","ざ":"زا","ずぃ":"زي","ず":"زو","ぜ":"زي","ぞ":"زو","ざあ":"زاا","ずぃい":"زيي","ずう":"زوو","ぜえ":"زيي","ぞう":"زوو","ぞお":"زوو","ぜい":"زيي","じゃ":"جا","じ":"جي","じゅ":"جو","じぇ":"جي","じょ":"جو","じゃあ":"جاا","じい":"جيي","じゅう":"جوو","じぇえ":"جيي","じょう":"جوو","じょお":"جوو","じぇい":"جيي","た":"تا","てぃ":"تي","とぅ":"تو","て":"تي","と":"تو","たあ":"تاا","てぃい":"تيي","とぅう":"توو","てえ":"تيي","とう":"توو","とお":"توو","てい":"تيي","ちゃ":"تشا","ち":"تشي","ちゅ":"تشو","ちぇ":"تشي","ちょ":"تشو","ちゃあ":"تشاا","ちい":"تشيي","ちゅう":"تشوو","ちぇえ":"تشيي","ちょう":"تشوو","ちょお":"تشوو","ちぇい":"تشيي","つぁ":"تسا","つぃ":"تسي","つ":"تسو","つぇ":"تسي","つぉ":"تسو","つぁあ":"تساا","つぃい":"تسيي","つう":"تسوو","つぇえ":"تسيي","つぉう":"تسوو","つぉお":"تسوو","つぇい":"تسيي","だ":"دا","でぃ":"دي","どぅ":"دو","で":"دي","ど":"دو","だあ":"داا","でぃい":"ديي","どぅう":"دوو","でえ":"ديي","どう":"دوو","どお":"دوو","でい":"ديي","ぢゃ":"جا","ぢ":"جي","ぢゅ":"جو","ぢぇ":"جي","ぢょ":"جو","ぢゃあ":"جاا","ぢい":"جيي","ぢゅう":"جوو","ぢぇえ":"جيي","ぢょう":"جوو","ぢょお":"جوو","ぢぇい":"جيي","づ":"زو","づう":"زوو","な":"نا","に":"ني","ぬ":"نو","ね":"ني","の":"نو","にゃ":"نيا","にゅ":"نيو","にょ":"نيو","なあ":"ناا","にい":"نيي","ぬう":"نوو","ねえ":"نيي","のう":"نوو","のお":"نوو","にゃあ":"نياا","にゅう":"نيوو","にょう":"نيوو","にょお":"نيوو","ねい":"نيي","は":"ها","ひ":"هي","へ":"هي","ほ":"هو","ひゃ":"هيا","ひゅ":"هيو","ひょ":"هيو","はあ":"هاا","ひい":"هيي","へえ":"هيي","ほう":"هوو","ほお":"هوو","ひゃあ":"هياا","ひゅう":"هيوو","ひょう":"هيوو","ひょお":"هيوو","へい":"هيي","ふぁ":"فا","ふぃ":"في","ふ":"فو","ふぇ":"في","ふぉ":"فو","ふぁあ":"فاا","ふぃい":"فيي","ふう":"فوو","ふぇえ":"فيي","ふぉう":"فوو","ふぉお":"فوو","ふぇい":"فيي","ば":"با","び":"بي","ぶ":"بو","べ":"بي","ぼ":"بو","びゃ":"بيا","びゅ":"بيو","びょ":"بيو","ばあ":"باا","びい":"بيي","ぶう":"بوو","べえ":"بيي","ぼう":"بوو","ぼお":"بوو","びゃあ":"بياا","びゅう":"بيوو","びょう":"بيوو","びょお":"بيوو","べい":"بيي","ぱ":"با","ぴ":"بي","ぷ":"بو","ぺ":"بي","ぽ":"بو","ぴゃ":"بيا","ぴゅ":"بيو","ぴょ":"بيو","ぱあ":"باا","ぴい":"بيي","ぷう":"بوو","ぺえ":"بيي","ぽう":"بوو","ぽお":"بوو","ぴゃあ":"بياا","ぴゅう":"بيوو","ぴょう":"بيوو","ぴょお":"بيوو","ぺい":"بيي","ま":"ما","み":"مي","む":"مو","め":"مي","も":"مو","みゃ":"ميا","みゅ":"ميو","みょ":"ميو","まあ":"ماا","みい":"ميي","むう":"موو","めえ":"ميي","もう":"موو","もお":"موو","みゃあ":"مياا","みゅう":"ميوو","みょう":"ميوو","みょお":"ميوو","めい":"ميي","や":"يا","ゆ":"يو","よ":"يو","やあ":"ياا","ゆう":"يوو","よう":"يوو","よお":"يوو","ら":"را","り":"ري","る":"رو","れ":"ري","ろ":"رو","りゃ":"ريا","りゅ":"ريو","りょ":"ريو","らあ":"راا","りい":"ريي","るう":"روو","れえ":"ريي","ろう":"روو","ろお":"روو","りゃあ":"رياا","りゅう":"ريوو","りょう":"ريوو","りょお":"ريوو","れい":"ريي","わ":"وا","うぃ":"وي","うぇ":"وي","うぉ":"وو","わあ":"واا","うぃい":"ويي","うぇえ":"ويي","うぉう":"ووو","うぉお":"ووو","うぇい":"ويي","ん":"ن","を":"أو","っ":"","んあ":"نها","んい":"نهي","んう":"نهو","んえ":"نهي","んお":"نهو","んや":"نهيا","んゆ":"نهيو","んよ":"نهيو","んああ":"نهاا","んいい":"نهيي","んうう":"نهوو","んええ":"نهيي","んおう":"نهوو","んおお":"نهوو","んやあ":"نهياا","んゆう":"نهيوو","んよう":"نهيوو","んよお":"نهيوو","んえい":"نهيي","っか":"كّا","っき":"كّي","っく":"كّو","っけ":"كّي","っこ":"كّو","っきゃ":"كّيا","っきゅ":"كّيو","っきょ":"كّيو","っかあ":"كّاا","っきい":"كّيي","っくう":"كّوو","っけえ":"كّيي","っこう":"كّوو","っこお":"كّوو","っきゃあ":"كّياا","っきゅう":"كّيوو","っきょう":"كّيوو","っきょお":"كّيوو","っけい":"كّيي","っさ":"سّا","っすぃ":"سّي","っす":"سّو","っせ":"سّي","っそ":"سّو","っさあ":"سّاا","っすぃい":"سّيي","っすう":"سّوو","っせえ":"سّيي","っそう":"سّوو","っそお":"سّوو","っせい":"سّيي","っしゃ":"شّا","っし":"شّي","っしゅ":"شّو","っしぇ":"شّي","っしょ":"شّو","っしゃあ":"شّاا","っしい":"شّيي","っしゅう":"شّوو","っしぇえ":"شّيي","っしょう":"شّوو","っしょお":"شّوو","っしぇい":"شّيي","った":"تّا","ってぃ":"تّي","っとぅ":"تّو","って":"تّي","っと":"تّو","ったあ":"تّاا","ってぃい":"تّيي","っとぅう":"تّوو","ってえ":"تّيي","っとう":"تّوو","っとお":"تّوو","ってい":"تّيي","っちゃ":"تّشا","っち":"تّشي","っちゅ":"تّشو","っちぇ":"تّشي","っちょ":"تّشو","っちゃあ":"تّشاا","っちい":"تّشيي","っちゅう":"تّشوو","っちぇえ":"تّشيي","っちょう":"تّشوو","っちょお":"تّشوو","っちぇい":"تّشيي","っつぁ":"تّسا","っつぃ":"تّسي","っつ":"تّسو","っつぇ":"تّسي","っつぉ":"تّسو","っつぁあ":"تّساا","っつぃい":"تّسيي","っつう":"تّسوو","っつぇえ":"تّسيي","っつぉう":"تّسوو","っつぉお":"تّسوو","っつぇい":"تّسيي","っぱ":"بّا","っぴ":"بّي","っぷ":"بّو","っぺ":"بّي","っぽ":"بّو","っぴゃ":"بّيا","っぴゅ":"بّيو","っぴょ":"بّيو","っぱあ":"بّاا","っぴい":"بّيي","っぷう":"بّوو","っぺえ":"بّيي","っぽう":"بّوو","っぽお":"بّوو","っぴゃあ":"بّياا","っぴゅう":"بّيوو","っぴょう":"بّيوو","っぴょお":"بّيوو","っぺい":"بّيي","ぁ":"ا","ぃ":"ي","ぅ":"و","ぇ":"ي","ぉ":"و","ゃ":"يا","ゅ":"يو","ょ":"يو","ぁあ":"اا","ぃい":"يي","ぅう":"وو","ぇえ":"يي","ぉう":"وو","ぉお":"وو","ゃあ":"ياا","ゅう":"يوو","ょう":"يوو","ょお":"يوو","ぇい":"يي","ゔぁ":"با","ゔぃ":"بي","ゔ":"بو","ゔぇ":"بي","ゔぉ":"بو","ゔぁあ":"باا","ゔぃい":"بيي","ゔう":"بوو","ゔぇえ":"بيي","ゔぉう":"بوو","ゔぉお":"بوو","ゔぇい":"بيي"},"additional":{},"endOfWord":{}}
},{}],7:[function(require,module,exports){
module.exports = {"base":{"あ":"ա","い":"ի","う":"ու","え":"ե","お":"ո","ああ":"աա","いい":"իի","うう":"ուու","ええ":"եե","おう":"ոո","おお":"ոո","えい":"եի","か":"քա","き":"քի","く":"քու","け":"քե","こ":"քո","きゃ":"քյա","きゅ":"քյու","きょ":"քյո","かあ":"քաա","きい":"քիի","くう":"քուու","けえ":"քեե","こう":"քոո","こお":"քոո","きゃあ":"քյայա","きゅう":"քյուու","きょう":"քյոո","きょお":"քյոո","けい":"քեի","が":"գա","ぎ":"գի","ぐ":"գու","げ":"գե","ご":"գո","ぎゃ":"գյա","ぎゅ":"գյու","ぎょ":"գյո","があ":"գաա","ぎい":"գիի","ぐう":"գուու","げえ":"գեե","ごう":"գոո","ごお":"գոո","ぎゃあ":"գյայա","ぎゅう":"գյուու","ぎょう":"գյոո","ぎょお":"գյոո","げい":"գեի","さ":"սա","すぃ":"սի","す":"սու","せ":"սե","そ":"սո","さあ":"սաա","すぃい":"սիի","すう":"սուու","せえ":"սեե","そう":"սոո","そお":"սոո","せい":"սեի","しゃ":"շա","し":"շի","しゅ":"շու","しぇ":"շե","しょ":"շո","しゃあ":"շաա","しい":"շիի","しゅう":"շուու","しぇえ":"շեե","しょう":"շոո","しょお":"շոո","しぇい":"շեի","ざ":"ձա","ずぃ":"ձի","ず":"ձու","ぜ":"ձե","ぞ":"ձո","ざあ":"ձաա","ずぃい":"ձիի","ずう":"ձուու","ぜえ":"ձեե","ぞう":"ձոո","ぞお":"ձոո","ぜい":"ձեի","じゃ":"զա","じ":"զի","じゅ":"զու","じぇ":"զե","じょ":"զո","じゃあ":"զաա","じい":"զիի","じゅう":"զուու","じぇえ":"զեե","じょう":"զոո","じょお":"զոո","じぇい":"զեի","た":"թա","てぃ":"թի","とぅ":"թու","て":"թե","と":"թո","たあ":"թաա","てぃい":"թիի","とぅう":"թուու","てえ":"թեե","とう":"թոո","とお":"թոո","てい":"թեի","ちゃ":"չա","ち":"չի","ちゅ":"չու","ちぇ":"չե","ちょ":"չո","ちゃあ":"չաա","ちい":"չիի","ちゅう":"չուու","ちぇえ":"չեե","ちょう":"չոո","ちょお":"չոո","ちぇい":"չեի","つぁ":"ցա","つぃ":"ցի","つ":"ցու","つぇ":"ցե","つぉ":"ցո","つぁあ":"ցաա","つぃい":"ցիի","つう":"ցուու","つぇえ":"ցեե","つぉう":"ցոո","つぉお":"ցոո","つぇい":"ցեի","だ":"դա","でぃ":"դի","どぅ":"դու","で":"դե","ど":"դո","だあ":"դաա","でぃい":"դիի","どぅう":"դուու","でえ":"դեե","どう":"դոո","どお":"դոո","でい":"դեի","ぢゃ":"զա","ぢ":"զի","ぢゅ":"զու","ぢぇ":"զե","ぢょ":"զո","ぢゃあ":"զաա","ぢい":"զիի","ぢゅう":"զուու","ぢぇえ":"զեե","ぢょう":"զոո","ぢょお":"զոո","ぢぇい":"զեի","づ":"ձու","づう":"ձուու","な":"նա","に":"նի","ぬ":"նու","ね":"նե","の":"նո","にゃ":"նյա","にゅ":"նյու","にょ":"նյո","なあ":"նաա","にい":"նիի","ぬう":"նուու","ねえ":"նեե","のう":"նոո","のお":"նոո","にゃあ":"նյայա","にゅう":"նյուու","にょう":"նյոո","にょお":"նյոո","ねい":"նեի","は":"հա","ひ":"հի","へ":"հե","ほ":"հո","ひゃ":"հյա","ひゅ":"հյու","ひょ":"հյո","はあ":"հաա","ひい":"հիի","へえ":"հեե","ほう":"հոո","ほお":"հոո","ひゃあ":"հյայա","ひゅう":"հյուու","ひょう":"հյոո","ひょお":"հյոո","へい":"հեի","ふぁ":"ֆա","ふぃ":"ֆի","ふ":"ֆու","ふぇ":"ֆե","ふぉ":"ֆո","ふぁあ":"ֆաա","ふぃい":"ֆիի","ふう":"ֆուու","ふぇえ":"ֆեե","ふぉう":"ֆոո","ふぉお":"ֆոո","ふぇい":"ֆեի","ば":"բա","び":"բի","ぶ":"բու","べ":"բե","ぼ":"բո","びゃ":"բյա","びゅ":"բյու","びょ":"բյո","ばあ":"բաա","びい":"բիի","ぶう":"բուու","べえ":"բեե","ぼう":"բոո","ぼお":"բոո","びゃあ":"բյայա","びゅう":"բյուու","びょう":"բյոո","びょお":"բյոո","べい":"բեի","ぱ":"փա","ぴ":"փի","ぷ":"փու","ぺ":"փե","ぽ":"փո","ぴゃ":"փյա","ぴゅ":"փյու","ぴょ":"փյո","ぱあ":"փաա","ぴい":"փիի","ぷう":"փուու","ぺえ":"փեե","ぽう":"փոո","ぽお":"փոո","ぴゃあ":"փյայա","ぴゅう":"փյուու","ぴょう":"փյոո","ぴょお":"փյոո","ぺい":"փեի","ま":"մա","み":"մի","む":"մու","め":"մե","も":"մո","みゃ":"մյա","みゅ":"մյու","みょ":"մյո","まあ":"մաա","みい":"միի","むう":"մուու","めえ":"մեե","もう":"մոո","もお":"մոո","みゃあ":"մյայա","みゅう":"մյուու","みょう":"մյոո","みょお":"մյոո","めい":"մեի","や":"յա","ゆ":"յու","よ":"յո","やあ":"յաա","ゆう":"յուու","よう":"յոո","よお":"յոո","ら":"րա","り":"րի","る":"րու","れ":"րե","ろ":"րո","りゃ":"րյա","りゅ":"րյու","りょ":"րյո","らあ":"րաա","りい":"րիի","るう":"րուու","れえ":"րեե","ろう":"րոո","ろお":"րոո","りゃあ":"րյայա","りゅう":"րյուու","りょう":"րյոո","りょお":"րյոո","れい":"րեի","わ":"ուա","うぃ":"ուի","うぇ":"ուե","うぉ":"ուո","わあ":"ուաա","うぃい":"ուիի","うぇえ":"ուեե","うぉう":"ուոո","うぉお":"ուոո","うぇい":"ուեի","ん":"ն","を":"ո","っ":"","んあ":"ն’ա","んい":"ն’ի","んう":"ն’ու","んえ":"ն’ե","んお":"ն’ո","んや":"ն’յա","んゆ":"ն’յու","んよ":"ն’յո","んああ":"ն’աա","んいい":"ն’իի","んうう":"ն’ուու","んええ":"ն’եե","んおう":"ն’ոո","んおお":"ն’ոո","んやあ":"ն’յայա","んゆう":"ն’յուու","んよう":"ն’յոո","んよお":"ն’յոո","んえい":"ն’եի","っか":"կա","っき":"կի","っく":"կու","っけ":"կե","っこ":"կո","っきゃ":"կյա","っきゅ":"կյու","っきょ":"կյո","っかあ":"կաա","っきい":"կիի","っくう":"կուու","っけえ":"կեե","っこう":"կոո","っこお":"կոո","っきゃあ":"կյայա","っきゅう":"կյուու","っきょう":"կյոո","っきょお":"կյոո","っけい":"կեի","っさ":"սսա","っすぃ":"սսի","っす":"սսու","っせ":"սսե","っそ":"սսո","っさあ":"սսաա","っすぃい":"սսիի","っすう":"սսուու","っせえ":"սսեե","っそう":"սսոո","っそお":"սսոո","っせい":"սսեի","っしゃ":"ծծա","っし":"ծծի","っしゅ":"ծծու","っしぇ":"ծծե","っしょ":"ծծո","っしゃあ":"ծծաա","っしい":"ծծիի","っしゅう":"ծծուու","っしぇえ":"ծծեե","っしょう":"ծծոո","っしょお":"ծծոո","っしぇい":"ծծեի","った":"տա","ってぃ":"տի","っとぅ":"տու","って":"տե","っと":"տո","ったあ":"տաա","ってぃい":"տիի","っとぅう":"տուու","ってえ":"տեե","っとう":"տոո","っとお":"տոո","ってい":"տեի","っちゃ":"չչա","っち":"չչի","っちゅ":"չչու","っちぇ":"չչե","っちょ":"չչո","っちゃあ":"չչաա","っちい":"չչիի","っちゅう":"չչուու","っちぇえ":"չչեե","っちょう":"չչոո","っちょお":"չչոո","っちぇい":"չչեի","っつぁ":"ցցա","っつぃ":"ցցի","っつ":"ցցու","っつぇ":"ցցե","っつぉ":"ցցո","っつぁあ":"ցցաա","っつぃい":"ցցիի","っつう":"ցցուու","っつぇえ":"ցցեե","っつぉう":"ցցոո","っつぉお":"ցցոո","っつぇい":"ցցեի","っぱ":"պա","っぴ":"պի","っぷ":"պու","っぺ":"պե","っぽ":"պո","っぴゃ":"պյա","っぴゅ":"պյու","っぴょ":"պյո","っぱあ":"պաա","っぴい":"պիի","っぷう":"պուու","っぺえ":"պեե","っぽう":"պոո","っぽお":"պոո","っぴゃあ":"պյայա","っぴゅう":"պյուու","っぴょう":"պյոո","っぴょお":"պյոո","っぺい":"պեի","ぁ":"ա","ぃ":"ի","ぅ":"ու","ぇ":"ե","ぉ":"ո","ゃ":"յա","ゅ":"յու","ょ":"յո","ぁあ":"աա","ぃい":"իի","ぅう":"ուու","ぇえ":"եե","ぉう":"ոո","ぉお":"ոո","ゃあ":"յաա","ゅう":"յուու","ょう":"յոո","ょお":"յոո","ぇい":"եի","ゔぁ":"վա","ゔぃ":"վի","ゔ":"վու","ゔぇ":"վե","ゔぉ":"վո","ゔぁあ":"վաա","ゔぃい":"վիի","ゔう":"վուու","ゔぇえ":"վեե","ゔぉう":"վոո","ゔぉお":"վոո","ゔぇい":"վեի"},"additional":{},"endOfWord":{}}
},{}],8:[function(require,module,exports){
module.exports = {"base":{"あ":"အာ","い":"အီ","う":"အူ","え":"အဲ","お":"အို","ああ":"အာအာ","いい":"အီအီ","うう":"အူအူ","ええ":"အဲအဲ","おう":"အိုအို","おお":"အိုအို","えい":"အဲအီ","か":"ကာ","き":"ကီ","く":"ကူ","け":"ကဲ","こ":"ကို","きゃ":"ကျာ","きゅ":"ကျူ","きょ":"ကျို","かあ":"ကာအာ","きい":"ကီအီ","くう":"ကူအူ","けえ":"ကဲအဲ","こう":"ကိုအို","こお":"ကိုအို","きゃあ":"ကျာအာ","きゅう":"ကျူအူ","きょう":"ကျိုအို","きょお":"ကျိုအို","けい":"ကဲအီ","が":"ဂါ","ぎ":"ဂီ","ぐ":"ဂူ","げ":"ဂဲ","ご":"ဂို","ぎゃ":"ဂျာ","ぎゅ":"ဂျူ","ぎょ":"ဂျို","があ":"ဂါအာ","ぎい":"ဂီအီ","ぐう":"ဂူအူ","げえ":"ဂဲအဲ","ごう":"ဂိုအို","ごお":"ဂိုအို","ぎゃあ":"ဂျာအာ","ぎゅう":"ဂျူအူ","ぎょう":"ဂျိုအို","ぎょお":"ဂျိုအို","げい":"ဂဲအီ","さ":"ဆာ","\u001bすぃ":"ဆီ","す":"ဆူ","せ":"ဆဲ","そ":"ဆို","さあ":"ဆာအာ","\u001bすぃい":"ဆီအီ","すう":"ဆူအူ","せえ":"ဆဲအဲ","そう":"ဆိုအို","そお":"ဆိုအို","せい":"ဆဲအီ","しゃ":"ရှာ","し":"ရှီ","しゅ":"ရှူ","しぇ":"ရှဲ","しょ":"ရှို","しゃあ":"ရှာအာ","しい":"ရှီအီ","しゅう":"ရှူအူ","しぇえ":"ရှဲအဲ","しょう":"ရှိုအို","しょお":"ရှိုအို","しぇい":"ရှဲအီ","ざ":"ဇာ","ずぃ":"ဇီ","ず":"ဇူ","ぜ":"ဇဲ","ぞ":"ဇို","ざあ":"ဇာအာ","ずぃい":"ဇီအီ","ずう":"ဇူအူ","ぜえ":"ဇဲအဲ","ぞう":"ဇိုအို","ぞお":"ဇိုအို","ぜい":"ဇဲအီ","じゃ":"ဂျာ","じ":"ဂျီ","じゅ":"ဂျူ","じぇ":"ဂျဲ","じょ":"ဂျို","じゃあ":"ဂျာအာ","じい":"ဂျီအီ","じゅう":"ဂျူအူ","じぇえ":"ဂျဲအဲ","じょう":"ဂျိုအို","じょお":"ဂျိုအို","じぇい":"ဂျဲအီ","た":"တာ","てぃ":"တီ","とぅ":"တူ","て":"တဲ","と":"တို","たあ":"တာအာ","てぃい":"တီအီ","とぅう":"တူအူ","てえ":"တဲအဲ","とう":"တိုအို","とお":"တိုအို","てい":"တဲအီ","ちゃ":"ဈာ","ち":"ဈီ","ちゅ":"ဈူ","ちぇ":"ဈဲ","ちょ":"ဈို","ちゃあ":"ဈာအာ","ちい":"ဈီအီ","ちゅう":"ဈူအူ","ちぇえ":"ဈဲအဲ","ちょう":"ဈိုအို","ちょお":"ဈိုအို","ちぇい":"ဈဲအီ","つぁ":"ဆာ","つぃ":"ဆီ","つ":"ဆူ","つぇ":"ဆဲ","つぉ":"ဆို","つぁあ":"ဆာအာ","つぃい":"ဆီအီ","つう":"ဆူအူ","つぇえ":"ဆဲအဲ","つぉう":"ဆိုအို","つぉお":"ဆိုအို","つぇい":"ဆဲအီ","だ":"ဒါ","でぃ":"ဒီ","どぅ":"ဒူ","で":"ဒဲ","ど":"ဒို","だあ":"ဒါအာ","でぃい":"ဒီအီ","どぅう":"ဒူအူ","でえ":"ဒဲအဲ","どう":"ဒိုအို","どお":"ဒိုအို","でい":"ဒဲအီ","ぢゃ":"ဂျာ","ぢ":"ဂျီ","ぢゅ":"ဂျူ","ぢぇ":"ဂျဲ","ぢょ":"ဂျို","ぢゃあ":"ဂျာအာ","ぢい":"ဂျီအီ","ぢゅう":"ဂျူအူ","ぢぇえ":"ဂျဲအဲ","ぢょう":"ဂျိုအို","ぢょお":"ဂျိုအို","ぢぇい":"ဂျဲအီ","づ":"ဇူ","づう":"ဇူအူ","な":"နာ","に":"နီ","ぬ":"နူ","ね":"နဲ","の":"နို","にゃ":"ညျာ","にゅ":"ညျူ","にょ":"ညျို","なあ":"နာအာ","にい":"နီအီ","ぬう":"နူအူ","ねえ":"နဲအဲ","のう":"နိုအို","のお":"နိုအို","にゃあ":"ညျာအာ","にゅう":"ညျူအူ","にょう":"ညျိုအို","にょお":"ညျိုအို","ねい":"နဲအီ","は":"ဟာ","ひ":"ဟီ","へ":"ဟဲ","ほ":"ဟို","ひゃ":"ဟယာ","ひゅ":"ဟယူ","ひょ":"ဟယို","はあ":"ဟာအာ","ひい":"ဟီအီ","へえ":"ဟဲအဲ","ほう":"ဟိုအို","ほお":"ဟိုအို","ひゃあ":"ဟယာအာ","ひゅう":"ဟယူအူ","ひょう":"ဟယိုအို","ひょお":"ဟယိုအို","へい":"ဟဲအီ","ふぁ":"ဖာ","ふぃ":"ဖီ","ふ":"ဖူ","ふぇ":"ဖဲ","ふぉ":"ဖို","ふぁあ":"ဖာအာ","ふぃい":"ဖီအီ","ふう":"","ふぇえ":"ဖဲအဲ","ふぉう":"ဖိုအို","ふぉお":"ဖိုအို","ふぇい":"ဖဲအီ","ば":"ဘာ","び":"ဘီ","ぶ":"ဘူ","べ":"ဘဲ","ぼ":"ဘို","びゃ":"ဘျာ","びゅ":"ဘျူ","びょ":"ဘျို","ばあ":"ဘာအာ","びい":"ဘီအီ","ぶう":"ဘူအူ","べえ":"ဘဲအဲ","ぼう":"ဘိုအို","ぼお":"ဘိုအို","びゃあ":"ဘျာအာ","びゅう":"ဘျူအူ","びょう":"ဘျိုအို","びょお":"ဘျိုအို","べい":"ဘဲအီ","ぱ":"ပါ","ぴ":"ပီ","ぷ":"ပူ","ぺ":"ပဲ","ぽ":"ပို","ぴゃ":"ပျာ","ぴゅ":"ပျူ","ぴょ":"ပျို","ぱあ":"ပါအာ","ぴい":"ပီအီ","ぷう":"ပူအူ","ぺえ":"ပဲအဲ","ぽう":"ပိုအို","ぽお":"ပိုအို","ぴゃあ":"ပျာအာ","ぴゅう":"ပျူအူ","ぴょう":"ပျိုအို","ぴょお":"ပျိုအို","ぺい":"ပဲအီ","ま":"မာ","み":"မီ","む":"မူ","め":"မဲ","も":"မို","みゃ":"မျာ","みゅ":"မျူ","みょ":"မျို","まあ":"မာအာ","みい":"မီအီ","むう":"မူအူ","めえ":"မဲအဲ","もう":"မိုအို","もお":"မိုအို","みゃあ":"မျာအာ","みゅう":"မျူအူ","みょう":"မျိုအို","みょお":"မျိုအို","めい":"မဲအီ","や":"ယာ","ゆ":"ယူ","よ":"ယို","やあ":"ယာအာ","ゆう":"ယူအူ","よう":"ယိုအို","よお":"ယိုအို","ら":"ရာ","り":"ရီ","る":"ရူ","れ":"ရဲ","ろ":"ရို","りゃ":"ရယာ","りゅ":"ရယူ","りょ":"ရယို","らあ":"ရာအာ","りい":"ရီအီ","るう":"ရူအူ","れえ":"ရဲအဲ","ろう":"ရိုအို","ろお":"ရိုအို","りゃあ":"ရယာအာ","りゅう":"ရယူအူ","りょう":"ရယိုအို","りょお":"ရယိုအို","れい":"ရဲအီ","わ":"ဝါ","うぃ":"ဝီ","うぇ":"ဝဲ","うぉ":"ဝို","わあ":"ဝါအာ","うぃい":"ဝီအီ","うぇえ":"ဝဲအဲ","うぉう":"ဝိုအို","うぉお":"ဝိုအို","うぇい":"ဝဲအီ","ん":"န်","を":"အို","っ":"","んあ":"န်အာ","んい":"န်အီ","んう":"န်အူ","んえ":"န်အဲ","んお":"န်အို","んや":"န်ယာ","んゆ":"န်အာယူ","んよ":"န်အီယို","んああ":"န်အာအာ","んいい":"န်အီအီ","んうう":"န်အူအူ","んええ":"န်အဲအဲ","んおう":"န်အိုအို","んおお":"န်အိုအို","んやあ":"န်ယာအာ","んゆう":"န်အာယူအူ","んよう":"န်အီယိုအို","んよお":"န်အီယိုအို","んえい":"န်အဲအီ","っか":"ကာ","っき":"ကီ","っく":"ကူ","っけ":"ကဲ","っこ":"ကို","っきゃ":"ကျာ","っきゅ":"ကျူ","っきょ":"ကျို","っかあ":"ကာအာ","っきい":"ကီအီ","っくう":"ကူအူ","っけえ":"ကဲအဲ","っこう":"ကိုအို","っこお":"ကိုအို","っきゃあ":"ကျာအာ","っきゅう":"ကျူအူ","っきょう":"ကျိုအို","っきょお":"ကျိုအို","っけい":"ကဲအီ","っさ":"ဆာ","っすぃ":"ဆီ","っす":"ဆူ","っせ":"ဆဲ","っそ":"ဆို","っさあ":"ဆာအာ","っすぃい":"ဆီအီ","っすう":"ဆူအူ","っせえ":"ဆဲအဲ","っそう":"ဆိုအို","っそお":"ဆိုအို","っせい":"ဆဲအီ","っしゃ":"ရှာ","っし":"ရှီ","っしゅ":"ရှူ","っしぇ":"ရှဲ","っしょ":"ရှို","っしゃあ":"ရှာအာ","っしい":"ရှီအီ","っしゅう":"ရှူအူ","っしぇえ":"ရှဲအဲ","っしょう":"ရှိုအို","っしょお":"ရှိုအို","っしぇい":"ရှဲအီ","った":"တာ","ってぃ":"တီ","っとぅ":"တူ","って":"တဲ","っと":"တို","ったあ":"တာအာ","ってぃい":"တီအီ","っとぅう":"တူအူ","ってえ":"တဲအဲ","っとう":"တိုအို","っとお":"တိုအို","ってい":"တဲအီ","っちゃ":"ဈာ","っち":"ဈီ","っちゅ":"ဈူ","っちぇ":"ဈဲ","っちょ":"ဈို","っちゃあ":"ဈာအာ","っちい":"ဈီအီ","っちゅう":"ဈူအူ","っちぇえ":"ဈဲအဲ","っちょう":"ဈိုအို","っちょお":"ဈိုအို","っちぇい":"ဈဲအီ","っつぁ":"ဆာ","っつぃ":"ဆီ","っつ":"ဆူ","っつぇ":"ဆဲ","っつぉ":"ဆို","っつぁあ":"ဆာအာ","っつぃい":"ဆီအီ","っつう":"ဆူအူ","っつぇえ":"ဆဲအဲ","っつぉう":"ဆိုအို","っつぉお":"ဆိုအို","っつぇい":"ဆဲအီ","っぱ":"ပာ","っぴ":"ပီ","っぷ":"ပူ","っぺ":"ပဲ","っぽ":"ပို","っぴゃ":"ပျာ","っぴゅ":"ပျူ","っぴょ":"ပျို","っぱあ":"ပာအာ","っぴい":"ပီအီ","っぷう":"ပူအူ","っぺえ":"ပဲအဲ","っぽう":"ပိုအို","っぽお":"ပိုအို","っぴゃあ":"ပျာအာ","っぴゅう":"ပျူအူ","っぴょう":"ပျိုအို","っぴょお":"ပျိုအို","っぺい":"ပဲအီ","ぁ":"အာ","ぃ":"အီ","ぅ":"အူ","ぇ":"အဲ","ぉ":"အို","ゃ":"ယာ","ゅ":"ယူ","ょ":"ယို","ぁあ":"အာအာ","ぃい":"အီအီ","ぅう":"အူအူ","ぇえ":"အဲအဲ","ぉう":"အိုအို","ぉお":"အိုအို","ゃあ":"ယာအာ","ゅう":"ယူအူ","ょう":"ယိုအို","ょお":"ယိုအို","ぇい":"အဲအီ","ゔぁ":"ဘာ","ゔぃ":"ဘီ","ゔ":"ဘူ","ゔぇ":"ဘဲ","ゔぉ":"ဘို","ゔぁあ":"ဘာအာ","ゔぃい":"ဘီအီ","ゔう":"ဘူအူ","ゔぇえ":"ဘဲအဲ","ゔぉう":"ဘိုအို","ゔぉお":"ဘိုအို","ゔぇい":"ဘဲအီ"},"additional":{},"endOfWord":{}}
},{}],9:[function(require,module,exports){
module.exports = {"base":{"あ":"ა","い":"ი","う":"უ","え":"ე","お":"ო","ああ":"აა","いい":"იი","うう":"უუ","ええ":"ეე","おう":"ოო","おお":"ოო","えい":"ეი","か":"კა","き":"კი","く":"კუ","け":"კე","こ":"კო","きゃ":"კია","きゅ":"კიუ","きょ":"კიო","かあ":"კაა","きい":"კიი","くう":"კუუ","けえ":"კეე","こう":"კოო","こお":"კოო","きゃあ":"კიაა","きゅう":"კიუუ","きょう":"კიოო","きょお":"კიოო","けい":"კეი","が":"გა","ぎ":"გი","ぐ":"გუ","げ":"გე","ご":"გო","ぎゃ":"გია","ぎゅ":"გიუ","ぎょ":"გიო","があ":"გაა","ぎい":"გიი","ぐう":"გუუ","げえ":"გეე","ごう":"გოო","ごお":"გოო","ぎゃあ":"გიაა","ぎゅう":"გიუუ","ぎょう":"გიოო","ぎょお":"გიოო","げい":"გეი","さ":"სა","すぃ":"სი","す":"სუ","せ":"სე","そ":"სო","さあ":"საა","すぃい":"სიი","すう":"სუუ","せえ":"სეე","そう":"სოო","そお":"სოო","せい":"სეი","しゃ":"შა","し":"ში","しゅ":"შუ","しぇ":"შე","しょ":"შო","しゃあ":"შაა","しい":"შიი","しゅう":"შუუ","しぇえ":"შეე","しょう":"შოო","しょお":"შოო","しぇい":"შეი","ざ":"ძა","ずぃ":"ძი","ず":"ძუ","ぜ":"ძე","ぞ":"ძო","ざあ":"ძაა","ずぃい":"ძიი","ずう":"ძუუ","ぜえ":"ძეე","ぞう":"ძოო","ぞお":"ძოო","ぜい":"ძეი","じゃ":"ჯა","じ":"ჯი","じゅ":"ჯუ","じぇ":"ჯე","じょ":"ჯო","じゃあ":"ჯაა","じい":"ჯიი","じゅう":"ჯუუ","じぇえ":"ჯეე","じょう":"ჯოო","じょお":"ჯოო","じぇい":"ჯეი","た":"ტა","てぃ":"ტი","とぅ":"ტუ","て":"ტე","と":"ტო","たあ":"ტაა","てぃい":"ტიი","とぅう":"ტუუ","てえ":"ტეე","とう":"ტოო","とお":"ტოო","てい":"ტეი","ちゃ":"ჩა","ち":"ჩი","ちゅ":"ჩუ","ちぇ":"ჩე","ちょ":"ჩო","ちゃあ":"ჩაა","ちい":"ჩიი","ちゅう":"ჩუუ","ちぇえ":"ჩეე","ちょう":"ჩოო","ちょお":"ჩოო","ちぇい":"ჩეი","つぁ":"ცა","つぃ":"ცი","つ":"ცუ","つぇ":"ცე","つぉ":"ცო","つぁあ":"ცაა","つぃい":"ციი","つう":"ცუუ","つぇえ":"ცეე","つぉう":"ცოო","つぉお":"ცოო","つぇい":"ცეი","だ":"და","でぃ":"დი","どぅ":"დუ","で":"დე","ど":"დო","だあ":"დაა","でぃい":"დიი","どぅう":"დუუ","でえ":"დეე","どう":"დოო","どお":"დოო","でい":"დეი","ぢゃ":"ჯა","ぢ":"ჯი","ぢゅ":"ჯუ","ぢぇ":"ჯე","ぢょ":"ჯო","ぢゃあ":"ჯაა","ぢい":"ჯიი","ぢゅう":"ჯუუ","ぢぇえ":"ჯეე","ぢょう":"ჯოო","ぢょお":"ჯოო","ぢぇい":"ჯეი","づ":"ძუ","づう":"ძუუ","な":"ნა","に":"ნი","ぬ":"ნუ","ね":"ნე","の":"ნო","にゃ":"ნია","にゅ":"ნიუ","にょ":"ნიო","なあ":"ნაა","にい":"ნიი","ぬう":"ნუუ","ねえ":"ნეე","のう":"ნოო","のお":"ნოო","にゃあ":"ნიაა","にゅう":"ნიუუ","にょう":"ნიოო","にょお":"ნიოო","ねい":"ნეი","は":"ჰა","ひ":"ჰი","へ":"ჰე","ほ":"ჰო","ひゃ":"ჰია","ひゅ":"ჰიუ","ひょ":"ჰიო","はあ":"ჰაა","ひい":"ჰიი","へえ":"ჰეე","ほう":"ჰოო","ほお":"ჰოო","ひゃあ":"ჰიაა","ひゅう":"ჰიუუ","ひょう":"ჰიოო","ひょお":"ჰიოო","へい":"ჰეი","ふぁ":"ჶა","ふぃ":"ჶი","ふ":"ჶუ","ふぇ":"ჶე","ふぉ":"ჶო","ふぁあ":"ჶაა","ふぃい":"ჶიი","ふう":"ჶუუ","ふぇえ":"ჶეე","ふぉう":"ჶოო","ふぉお":"ჶოო","ふぇい":"ჶეი","ば":"ბა","び":"ბი","ぶ":"ბუ","べ":"ბე","ぼ":"ბო","びゃ":"ბია","びゅ":"ბიუ","びょ":"ბიო","ばあ":"ბაა","びい":"ბიი","ぶう":"ბუუ","べえ":"ბეე","ぼう":"ბოო","ぼお":"ბოო","びゃあ":"ბიაა","びゅう":"ბიუუ","びょう":"ბიოო","びょお":"ბიოო","べい":"ბეი","ぱ":"ჴა","ぴ":"ჴი","ぷ":"ჴუ","ぺ":"ჴე","ぽ":"ჴო","ぴゃ":"ჴია","ぴゅ":"ჴიუ","ぴょ":"ჴიო","ぱあ":"ჴაა","ぴい":"ჴიი","ぷう":"ჴუუ","ぺえ":"ჴეე","ぽう":"ჴოო","ぽお":"ჴოო","ぴゃあ":"ჴიაა","ぴゅう":"ჴიუუ","ぴょう":"ჴიოო","ぴょお":"ჴიოო","ぺい":"ჴეი","ま":"მა","み":"მი","む":"მუ","め":"მე","も":"მო","みゃ":"მია","みゅ":"მიუ","みょ":"მიო","まあ":"მაა","みい":"მიი","むう":"მუუ","めえ":"მეე","もう":"მოო","もお":"მოო","みゃあ":"მიაა","みゅう":"მიუუ","みょう":"მიოო","みょお":"მიოო","めい":"მეი","や":"ია","ゆ":"იუ","よ":"იო","やあ":"იაა","ゆう":"იუუ","よう":"იოო","よお":"იოო","ら":"რა","り":"რი","る":"რუ","れ":"რე","ろ":"რო","りゃ":"რია","りゅ":"რიუ","りょ":"რიო","らあ":"რაა","りい":"რიი","るう":"რუუ","れえ":"რეე","ろう":"როო","ろお":"როო","りゃあ":"რიაა","りゅう":"რიუუ","りょう":"რიოო","りょお":"რიოო","れい":"რეი","わ":"უა","うぃ":"უი","うぇ":"უე","うぉ":"უო","わあ":"უაა","うぃい":"უიი","うぇえ":"უეე","うぉう":"უოო","うぉお":"უოო","うぇい":"უეი","ん":"ნ","を":"ო","っ":"","んあ":"ნ'ა","んい":"ნ'ი","んう":"ნ'უ","んえ":"ნ'ე","んお":"ნ'ო","んや":"ნ'ია","んゆ":"ნ'იუ","んよ":"ნ'იო","んああ":"ნ'აა","んいい":"ნ'იი","んうう":"ნ'უუ","んええ":"ნ'ეე","んおう":"ნ'ოო","んおお":"ნ'ოო","んやあ":"ნ'იაა","んゆう":"ნ'იუუ","んよう":"ნ'იოო","んよお":"ნ'იოო","んえい":"ნ'ეი","っか":"კკა","っき":"კკი","っく":"კკუ","っけ":"კკე","っこ":"კკო","っきゃ":"კკია","っきゅ":"კკიუ","っきょ":"კკიო","っかあ":"კკაა","っきい":"კკიი","っくう":"კკუუ","っけえ":"კკეე","っこう":"კკოო","っこお":"კკოო","っきゃあ":"კკიაა","っきゅう":"კკიუუ","っきょう":"კკიოო","っきょお":"კკიოო","っけい":"კკეი","っさ":"სსა","っすぃ":"სსი","っす":"სსუ","っせ":"სსე","っそ":"სსო","っさあ":"სსაა","っすぃい":"სსიი","っすう":"სსუუ","っせえ":"სსეე","っそう":"სსოო","っそお":"სსოო","っせい":"სსეი","っしゃ":"შშა","っし":"შში","っしゅ":"შშუ","っしぇ":"შშე","っしょ":"შშო","っしゃあ":"შშაა","っしい":"შშიი","っしゅう":"შშუუ","っしぇえ":"შშეე","っしょう":"შშოო","っしょお":"შშოო","っしぇい":"შშეი","った":"ტტა","ってぃ":"ტტი","っとぅ":"ტტუ","って":"ტტე","っと":"ტტო","ったあ":"ტტაა","ってぃい":"ტტიი","っとぅう":"ტტუუ","ってえ":"ტტეე","っとう":"ტტოო","っとお":"ტტოო","ってい":"ტტეი","っちゃ":"ჩჩა","っち":"ჩჩი","っちゅ":"ჩჩუ","っちぇ":"ჩჩე","っちょ":"ჩჩო","っちゃあ":"ჩჩაა","っちい":"ჩჩიი","っちゅう":"ჩჩუუ","っちぇえ":"ჩჩეე","っちょう":"ჩჩოო","っちょお":"ჩჩოო","っちぇい":"ჩჩეი","っつぁ":"პპა","っつぃ":"პპი","っつ":"პპუ","っつぇ":"პპე","っつぉ":"პპო","っつぁあ":"პპაა","っつぃい":"პპიი","っつう":"პპუუ","っつぇえ":"პპეე","っつぉう":"პპოო","っつぉお":"პპოო","っつぇい":"პპეი","っぱ":"ჴჴა","っぴ":"ჴჴი","っぷ":"ჴჴუ","っぺ":"ჴჴე","っぽ":"ჴჴო","っぴゃ":"ჴჴია","っぴゅ":"ჴჴიუ","っぴょ":"ჴჴიო","っぱあ":"ჴჴაა","っぴい":"ჴჴიი","っぷう":"ჴჴუუ","っぺえ":"ჴჴეე","っぽう":"ჴჴოო","っぽお":"ჴჴოო","っぴゃあ":"ჴჴიაა","っぴゅう":"ჴჴიუუ","っぴょう":"ჴჴიოო","っぴょお":"ჴჴიოო","っぺい":"ჴჴეი","ぁ":"ა","ぃ":"ი","ぅ":"უ","ぇ":"ე","ぉ":"ო","ゃ":"ია","ゅ":"იუ","ょ":"იო","ぁあ":"აა","ぃい":"იი","ぅう":"უუ","ぇえ":"ეე","ぉう":"ოო","ぉお":"ოო","ゃあ":"იაა","ゅう":"იუუ","ょう":"იოო","ょお":"იოო","ぇい":"ეი","ゔぁ":"ვა","ゔぃ":"ვი","ゔ":"ვუ","ゔぇ":"ვე","ゔぉ":"ვო","ゔぁあ":"ვაა","ゔぃい":"ვიი","ゔう":"ვუუ","ゔぇえ":"ვეე","ゔぉう":"ვოო","ゔぉお":"ვოო","ゔぇい":"ვეი"},"additional":{},"endOfWord":{}}
},{}],10:[function(require,module,exports){
module.exports = {"base":{"あ":"α","い":"ι","う":"ου","え":"ε","お":"ο","ああ":"αα","いい":"ιι","うう":"ουου","ええ":"εε","おう":"οο","おお":"οο","えい":"ει","か":"κα","き":"κι","く":"κου","け":"κε","こ":"κο","きゃ":"κια","きゅ":"κιου","きょ":"κιο","かあ":"καα","きい":"κιι","くう":"κουου","けえ":"κεε","こう":"κοο","こお":"κοο","きゃあ":"κια’α","きゅう":"κιου’ου","きょう":"κιο’ο","きょお":"κιο’ο","けい":"κει","が":"γκα","ぎ":"γκι","ぐ":"γκου","げ":"γκε","ご":"γκο","ぎゃ":"γκια","ぎゅ":"γκιου","ぎょ":"γκιο","があ":"γκαα","ぎい":"γκιι","ぐう":"γκουου","げえ":"γκεε","ごう":"γκοο","ごお":"γκοο","ぎゃあ":"γκια’α","ぎゅう":"γκιου’ου","ぎょう":"γκιο’ο","ぎょお":"γκιο’ο","げい":"γκει","さ":"σα","すぃ":"σι","す":"σου","せ":"σε","そ":"σο","さあ":"σαα","すぃい":"σιι","すう":"σουου","せえ":"σεε","そう":"σοο","そお":"σοο","せい":"σει","しゃ":"σια","し":"σιι","しゅ":"σιου","しぇ":"σιε","しょ":"σιο","しゃあ":"σιαα","しい":"σιιι","しゅう":"σιουου","しぇえ":"σιεε","しょう":"σιοο","しょお":"σιοο","しぇい":"σιει","ざ":"ζα","ずぃ":"ζι","ず":"ζου","ぜ":"ζε","ぞ":"ζο","ざあ":"ζαα","ずぃい":"ζιι","ずう":"ζουου","ぜえ":"ζεε","ぞう":"ζοο","ぞお":"ζοο","ぜい":"ζει","じゃ":"ζια","じ":"ζιι","じゅ":"ζιου","じぇ":"ζιε","じょ":"ζιο","じゃあ":"ζιαα","じい":"ζιιι","じゅう":"ζιουου","じぇえ":"ζιεε","じょう":"ζιοο","じょお":"ζιοο","じぇい":"ζιει","た":"τα","てぃ":"τι","とぅ":"του","て":"τε","と":"το","たあ":"ταα","てぃい":"τιι","とぅう":"τουου","てえ":"τεε","とう":"τοο","とお":"τοο","てい":"τει","ちゃ":"τια","ち":"τιι","ちゅ":"τιου","ちぇ":"τιε","ちょ":"τιο","ちゃあ":"τιαα","ちい":"τιιι","ちゅう":"τιουου","ちぇえ":"τιεε","ちょう":"τιοο","ちょお":"τιοο","ちぇい":"τιει","つぁ":"τσα","つぃ":"τσι","つ":"τσου","つぇ":"τσε","つぉ":"τσο","つぁあ":"τσαα","つぃい":"τσιι","つう":"τσουου","つぇえ":"τσεε","つぉう":"τσοο","つぉお":"τσοο","つぇい":"τσει","だ":"ντα","でぃ":"ντι","どぅ":"ντου","で":"ντε","ど":"ντο","だあ":"νταα","でぃい":"ντιι","どぅう":"ντουου","でえ":"ντεε","どう":"ντοο","どお":"ντοο","でい":"ντει","ぢゃ":"ζια","ぢ":"ζιι","ぢゅ":"ζιου","ぢぇ":"ζιε","ぢょ":"ζιο","ぢゃあ":"ζιαα","ぢい":"ζιιι","ぢゅう":"ζιουου","ぢぇえ":"ζιεε","ぢょう":"ζιοο","ぢょお":"ζιοο","ぢぇい":"ζιει","づ":"ζου","づう":"ζουου","な":"να","に":"νι","ぬ":"νου","ね":"νε","の":"νο","にゃ":"νια","にゅ":"νιου","にょ":"νιο","なあ":"ναα","にい":"νιι","ぬう":"νουου","ねえ":"νεε","のう":"νοο","のお":"νοο","にゃあ":"νια’α","にゅう":"νιου’ου","にょう":"νιο’ο","にょお":"νιο’ο","ねい":"νει","は":"χα","ひ":"χι","へ":"χε","ほ":"χο","ひゃ":"χια","ひゅ":"χιου","ひょ":"χιο","はあ":"χαα","ひい":"χιι","へえ":"χεε","ほう":"χοο","ほお":"χοο","ひゃあ":"χια’α","ひゅう":"χιου’ου","ひょう":"χιο’ο","ひょお":"χιο’ο","へい":"χει","ふぁ":"φα","ふぃ":"φι","ふ":"φου","ふぇ":"φε","ふぉ":"φο","ふぁあ":"φαα","ふぃい":"φιι","ふう":"φουου","ふぇえ":"φεε","ふぉう":"φοο","ふぉお":"φοο","ふぇい":"φει","ば":"μπα","び":"μπι","ぶ":"μπου","べ":"μπε","ぼ":"μπο","びゃ":"μπια","びゅ":"μπιου","びょ":"μπιο","ばあ":"μπαα","びい":"μπιι","ぶう":"μπουου","べえ":"μπεε","ぼう":"μποο","ぼお":"μποο","びゃあ":"μπια’α","びゅう":"μπιου’ου","びょう":"μπιο’ο","びょお":"μπιο’ο","べい":"μπει","ぱ":"πα","ぴ":"πι","ぷ":"που","ぺ":"πε","ぽ":"πο","ぴゃ":"πια","ぴゅ":"πιου","ぴょ":"πιο","ぱあ":"παα","ぴい":"πιι","ぷう":"πουου","ぺえ":"πεε","ぽう":"ποο","ぽお":"ποο","ぴゃあ":"πια’α","ぴゅう":"πιου’ου","ぴょう":"πιο’ο","ぴょお":"πιο’ο","ぺい":"πει","ま":"μα","み":"μι","む":"μου","め":"με","も":"μο","みゃ":"μια","みゅ":"μιου","みょ":"μιο","まあ":"μαα","みい":"μιι","むう":"μουου","めえ":"μεε","もう":"μοο","もお":"μοο","みゃあ":"μια’α","みゅう":"μιου’ου","みょう":"μιο’ο","みょお":"μιο’ο","めい":"μει","や":"ια","ゆ":"ιου","よ":"ιο","やあ":"ιαα","ゆう":"ιουου","よう":"ιοο","よお":"ιοο","ら":"ρα","り":"ρι","る":"ρου","れ":"ρε","ろ":"ρο","りゃ":"ρια","りゅ":"ριου","りょ":"ριο","らあ":"ραα","りい":"ριι","るう":"ρουου","れえ":"ρεε","ろう":"ροο","ろお":"ροο","りゃあ":"ρια’α","りゅう":"ριου’ου","りょう":"ριο’ο","りょお":"ριο’ο","れい":"ρει","わ":"βα","うぃ":"βι","うぇ":"βε","うぉ":"βο","わあ":"βαα","うぃい":"βιι","うぇえ":"βεε","うぉう":"βοο","うぉお":"βοο","うぇい":"βει","ん":"ν","を":"ο","っ":"","んあ":"ν’α","んい":"ν’ι","んう":"ν’ου","んえ":"ν’ε","んお":"ν’ο","んや":"να_ια","んゆ":"να_ιου","んよ":"να_ιο","んああ":"ν’αα","んいい":"ν’ιι","んうう":"ν’ουου","んええ":"ν’εε","んおう":"ν’οο","んおお":"ν’οο","んやあ":"ν’ια’α","んゆう":"ν’ιου’ου","んよう":"ν’ιο’ο","んよお":"ν’ιο’ο","んえい":"ν’ει","っか":"κκα","っき":"κκι","っく":"κκου","っけ":"κκε","っこ":"κκο","っきゃ":"κκια","っきゅ":"κκιου","っきょ":"κκιο","っかあ":"κκαα","っきい":"κκιι","っくう":"κκουου","っけえ":"κκεε","っこう":"κκοο","っこお":"κκοο","っきゃあ":"κκια’α","っきゅう":"κκιου’ου","っきょう":"κκιο’ο","っきょお":"κκιο’ο","っけい":"κκει","っさ":"σσα","っすぃ":"σσι","っす":"σσου","っせ":"σσε","っそ":"σσο","っさあ":"σσαα","っすぃい":"σσιι","っすう":"σσουου","っせえ":"σσεε","っそう":"σσοο","っそお":"σσοο","っせい":"σσει","っしゃ":"σσια","っし":"σσιι","っしゅ":"σσιου","っしぇ":"σσιε","っしょ":"σσιο","っしゃあ":"σσιαα","っしい":"σσιιι","っしゅう":"σσιουου","っしぇえ":"σσιεε","っしょう":"σσιοο","っしょお":"σσιοο","っしぇい":"σσιει","った":"ττα","ってぃ":"ττι","っとぅ":"ττου","って":"ττε","っと":"ττο","ったあ":"τταα","ってぃい":"ττιι","っとぅう":"ττουου","ってえ":"ττεε","っとう":"ττοο","っとお":"ττοο","ってい":"ττει","っちゃ":"ττια","っち":"ττιι","っちゅ":"ττιου","っちぇ":"ττιε","っちょ":"ττιο","っちゃあ":"ττιαα","っちい":"ττιιι","っちゅう":"ττιουου","っちぇえ":"ττιεε","っちょう":"ττιοο","っちょお":"ττιοο","っちぇい":"ττιει","っつぁ":"ζζα","っつぃ":"ζζι","っつ":"ζζου","っつぇ":"ζζε","っつぉ":"ζζο","っつぁあ":"ζζαα","っつぃい":"ζζιι","っつう":"ζζουου","っつぇえ":"ζζεε","っつぉう":"ζζοο","っつぉお":"ζζοο","っつぇい":"ζζει","っぱ":"ππα","っぴ":"ππι","っぷ":"ππου","っぺ":"ππε","っぽ":"ππο","っぴゃ":"ππια","っぴゅ":"ππιου","っぴょ":"ππιο","っぱあ":"ππαα","っぴい":"ππιι","っぷう":"ππουου","っぺえ":"ππεε","っぽう":"πποο","っぽお":"πποο","っぴゃあ":"ππια’α","っぴゅう":"ππιου’ου","っぴょう":"ππιο’ο","っぴょお":"ππιο’ο","っぺい":"ππει","ぁ":"α","ぃ":"ι","ぅ":"ου","ぇ":"ε","ぉ":"ο","ゃ":"ια","ゅ":"ιου","ょ":"ιο","ぁあ":"αα","ぃい":"ιι","ぅう":"ουου","ぇえ":"εε","ぉう":"οο","ぉお":"οο","ゃあ":"ια’α","ゅう":"ιου’ου","ょう":"ιο’ο","ょお":"ιο’ο","ぇい":"ει","ゔぁ":"βα","ゔぃ":"βι","ゔ":"βου","ゔぇ":"βε","ゔぉ":"βο","ゔぁあ":"βαα","ゔぃい":"βιι","ゔう":"βουου","ゔぇえ":"βεε","ゔぉう":"βοο","ゔぉお":"βοο","ゔぇい":"βει","あや":"α_ια","いや":"ι_ια","うや":"ου_ια","えや":"ε_ια","おや":"ο_ια","ああや":"αα_ια","いいや":"ιι_ια","ううや":"ουου_ια","ええや":"εε_ια","おうや":"οο_ια","おおや":"οο_ια","えいや":"ει_ια","かや":"κα_ια","きや":"κι_ια","くや":"κου_ια","けや":"κε_ια","こや":"κο_ια","かあや":"καα_ια","きいや":"κιι_ια","くうや":"κουου_ια","けえや":"κεε_ια","こうや":"κοο_ια","こおや":"κοο_ια","けいや":"κει_ια","がや":"γκα_ια","ぎや":"γκι_ια","ぐや":"γκου_ια","げや":"γκε_ια","ごや":"γκο_ια","があや":"γκαα_ια","ぎいや":"γκιι_ια","ぐうや":"γκουου_ια","げえや":"γκεε_ια","ごうや":"γκοο_ια","ごおや":"γκοο_ια","げいや":"γκει_ια","さや":"σα_ια","すぃや":"σι_ια","すや":"σου_ια","せや":"σε_ια","そや":"σο_ια","さあや":"σαα_ια","すぃいや":"σιι_ια","すうや":"σουου_ια","せえや":"σεε_ια","そうや":"σοο_ια","そおや":"σοο_ια","せいや":"σει_ια","しゃや":"σια_ια","しや":"σιι_ια","しゅや":"σιου_ια","しぇや":"σιε_ια","しょや":"σιο_ια","しゃあや":"σιαα_ια","しいや":"σιιι_ια","しゅうや":"σιουου_ια","しぇえや":"σιεε_ια","しょうや":"σιοο_ια","しょおや":"σιοο_ια","しぇいや":"σιει_ια","ざや":"ζα_ια","ずぃや":"ζι_ια","ずや":"ζου_ια","ぜや":"ζε_ια","ぞや":"ζο_ια","ざあや":"ζαα_ια","ずぃいや":"ζιι_ια","ずうや":"ζουου_ια","ぜえや":"ζεε_ια","ぞうや":"ζοο_ια","ぞおや":"ζοο_ια","ぜいや":"ζει_ια","じゃや":"ζια_ια","じや":"ζιι_ια","じゅや":"ζιου_ια","じぇや":"ζιε_ια","じょや":"ζιο_ια","じゃあや":"ζιαα_ια","じいや":"ζιιι_ια","じゅうや":"ζιουου_ια","じぇえや":"ζιεε_ια","じょうや":"ζιοο_ια","じょおや":"ζιοο_ια","じぇいや":"ζιει_ια","たや":"τα_ια","てぃや":"τι_ια","とぅや":"του_ια","てや":"τε_ια","とや":"το_ια","たあや":"ταα_ια","てぃいや":"τιι_ια","とぅうや":"τουου_ια","てえや":"τεε_ια","とうや":"τοο_ια","とおや":"τοο_ια","ていや":"τει_ια","ちゃや":"τια_ια","ちや":"τιι_ια","ちゅや":"τιου_ια","ちぇや":"τιε_ια","ちょや":"τιο_ια","ちゃあや":"τιαα_ια","ちいや":"τιιι_ια","ちゅうや":"τιουου_ια","ちぇえや":"τιεε_ια","ちょうや":"τιοο_ια","ちょおや":"τιοο_ια","ちぇいや":"τιει_ια","つぁや":"τσα_ια","つぃや":"τσι_ια","つや":"τσου_ια","つぇや":"τσε_ια","つぉや":"τσο_ια","つぁあや":"τσαα_ια","つぃいや":"τσιι_ια","つうや":"τσουου_ια","つぇえや":"τσεε_ια","つぉうや":"τσοο_ια","つぉおや":"τσοο_ια","つぇいや":"τσει_ια","だや":"ντα_ια","でぃや":"ντι_ια","どぅや":"ντου_ια","でや":"ντε_ια","どや":"ντο_ια","だあや":"νταα_ια","でぃいや":"ντιι_ια","どぅうや":"ντουου_ια","でえや":"ντεε_ια","どうや":"ντοο_ια","どおや":"ντοο_ια","でいや":"ντει_ια","ぢゃや":"ζια_ια","ぢや":"ζιι_ια","ぢゅや":"ζιου_ια","ぢぇや":"ζιε_ια","ぢょや":"ζιο_ια","ぢゃあや":"ζιαα_ια","ぢいや":"ζιιι_ια","ぢゅうや":"ζιουου_ια","ぢぇえや":"ζιεε_ια","ぢょうや":"ζιοο_ια","ぢょおや":"ζιοο_ια","ぢぇいや":"ζιει_ια","づや":"ζου_ια","づうや":"ζουου_ια","なや":"να_ια","にや":"νι_ια","ぬや":"νου_ια","ねや":"νε_ια","のや":"νο_ια","なあや":"ναα_ια","にいや":"νιι_ια","ぬうや":"νουου_ια","ねえや":"νεε_ια","のうや":"νοο_ια","のおや":"νοο_ια","ねいや":"νει_ια","はや":"χα_ια","ひや":"χι_ια","へや":"χε_ια","ほや":"χο_ια","はあや":"χαα_ια","ひいや":"χιι_ια","へえや":"χεε_ια","ほうや":"χοο_ια","ほおや":"χοο_ια","へいや":"χει_ια","ふぁや":"φα_ια","ふぃや":"φι_ια","ふや":"φου_ια","ふぇや":"φε_ια","ふぉや":"φο_ια","ふぁあや":"φαα_ια","ふぃいや":"φιι_ια","ふうや":"φουου_ια","ふぇえや":"φεε_ια","ふぉうや":"φοο_ια","ふぉおや":"φοο_ια","ふぇいや":"φει_ια","ばや":"μπα_ια","びや":"μπι_ια","ぶや":"μπου_ια","べや":"μπε_ια","ぼや":"μπο_ια","ばあや":"μπαα_ια","びいや":"μπιι_ια","ぶうや":"μπουου_ια","べえや":"μπεε_ια","ぼうや":"μποο_ια","ぼおや":"μποο_ια","べいや":"μπει_ια","ぱや":"πα_ια","ぴや":"πι_ια","ぷや":"που_ια","ぺや":"πε_ια","ぽや":"πο_ια","ぱあや":"παα_ια","ぴいや":"πιι_ια","ぷうや":"πουου_ια","ぺえや":"πεε_ια","ぽうや":"ποο_ια","ぽおや":"ποο_ια","ぺいや":"πει_ια","まや":"μα_ια","みや":"μι_ια","むや":"μου_ια","めや":"με_ια","もや":"μο_ια","まあや":"μαα_ια","みいや":"μιι_ια","むうや":"μουου_ια","めえや":"μεε_ια","もうや":"μοο_ια","もおや":"μοο_ια","めいや":"μει_ια","やや":"ια_ια","ゆや":"ιου_ια","よや":"ιο_ια","やあや":"ιαα_ια","ゆうや":"ιουου_ια","ようや":"ιοο_ια","よおや":"ιοο_ια","らや":"ρα_ια","りや":"ρι_ια","るや":"ρου_ια","れや":"ρε_ια","ろや":"ρο_ια","らあや":"ραα_ια","りいや":"ριι_ια","るうや":"ρουου_ια","れえや":"ρεε_ια","ろうや":"ροο_ια","ろおや":"ροο_ια","れいや":"ρει_ια","わや":"βα_ια","うぃや":"βι_ια","うぇや":"βε_ια","うぉや":"βο_ια","わあや":"βαα_ια","うぃいや":"βιι_ια","うぇえや":"βεε_ια","うぉうや":"βοο_ια","うぉおや":"βοο_ια","うぇいや":"βει_ια","をや":"νο_ια","んあや":"ν’α_ια","んいや":"ν’ι_ια","んうや":"ν’ου_ια","んえや":"ν’ε_ια","んおや":"ν’ο_ια","んああや":"ν’αα_ια","んいいや":"ν’ιι_ια","んううや":"ν’ουου_ια","んええや":"ν’εε_ια","んおうや":"ν’οο_ια","んおおや":"ν’οο_ια","んえいや":"ν’ει_ια","っかや":"κκα_ια","っきや":"κκι_ια","っくや":"κκου_ια","っけや":"κκε_ια","っこや":"κκο_ια","っかあや":"κκαα_ια","っきいや":"κκιι_ια","っくうや":"κκουου_ια","っけえや":"κκεε_ια","っこうや":"κκοο_ια","っこおや":"κκοο_ια","っけいや":"κκει_ια","っさや":"σσα_ια","っすぃや":"σσι_ια","っすや":"σσου_ια","っせや":"σσε_ια","っそや":"σσο_ια","っさあや":"σσαα_ια","っすぃいや":"σσιι_ια","っすうや":"σσουου_ια","っせえや":"σσεε_ια","っそうや":"σσοο_ια","っそおや":"σσοο_ια","っせいや":"σσει_ια","っしゃや":"σσια_ια","っしや":"σσιι_ια","っしゅや":"σσιου_ια","っしぇや":"σσιε_ια","っしょや":"σσιο_ια","っしゃあや":"σσιαα_ια","っしいや":"σσιιι_ια","っしゅうや":"σσιουου_ια","っしぇえや":"σσιεε_ια","っしょうや":"σσιοο_ια","っしょおや":"σσιοο_ια","っしぇいや":"σσιει_ια","ったや":"ττα_ια","ってぃや":"ττι_ια","っとぅや":"ττου_ια","ってや":"ττε_ια","っとや":"ττο_ια","ったあや":"τταα_ια","ってぃいや":"ττιι_ια","っとぅうや":"ττουου_ια","ってえや":"ττεε_ια","っとうや":"ττοο_ια","っとおや":"ττοο_ια","っていや":"ττει_ια","っちゃや":"ττια_ια","っちや":"ττιι_ια","っちゅや":"ττιου_ια","っちぇや":"ττιε_ια","っちょや":"ττιο_ια","っちゃあや":"ττιαα_ια","っちいや":"ττιιι_ια","っちゅうや":"ττιουου_ια","っちぇえや":"ττιεε_ια","っちょうや":"ττιοο_ια","っちょおや":"ττιοο_ια","っちぇいや":"ττιει_ια","っつぁや":"ζζα_ια","っつぃや":"ζζι_ια","っつや":"ζζου_ια","っつぇや":"ζζε_ια","っつぉや":"ζζο_ια","っつぁあや":"ζζαα_ια","っつぃいや":"ζζιι_ια","っつうや":"ζζουου_ια","っつぇえや":"ζζεε_ια","っつぉうや":"ζζοο_ια","っつぉおや":"ζζοο_ια","っつぇいや":"ζζει_ια","っぱや":"ππα_ια","っぴや":"ππι_ια","っぷや":"ππου_ια","っぺや":"ππε_ια","っぽや":"ππο_ια","っぱあや":"ππαα_ια","っぴいや":"ππιι_ια","っぷうや":"ππουου_ια","っぺえや":"ππεε_ια","っぽうや":"πποο_ια","っぽおや":"πποο_ια","っぺいや":"ππει_ια","ぁや":"α_ια","ぃや":"ι_ια","ぅや":"ου_ια","ぇや":"ε_ια","ぉや":"ο_ια","ぁあや":"αα_ια","ぃいや":"ιι_ια","ぅうや":"ουου_ια","ぇえや":"εε_ια","ぉうや":"οο_ια","ぉおや":"οο_ια","ぇいや":"ει_ια","ゔぁや":"βα_ια","ゔぃや":"βι_ια","ゔや":"βου_ια","ゔぇや":"βε_ια","ゔぉや":"βο_ια","ゔぁあや":"βαα_ια","ゔぃいや":"βιι_ια","ゔうや":"βουου_ια","ゔぇえや":"βεε_ια","ゔぉうや":"βοο_ια","ゔぉおや":"βοο_ια","ゔぇいや":"βει_ια","あゆ":"α_ιου","いゆ":"ι_ιου","うゆ":"ου_ιου","えゆ":"ε_ιου","おゆ":"ο_ιου","ああゆ":"αα_ιου","いいゆ":"ιι_ιου","ううゆ":"ουου_ιου","ええゆ":"εε_ιου","おうゆ":"οο_ιου","おおゆ":"οο_ιου","えいゆ":"ει_ιου","かゆ":"κα_ιου","きゆ":"κι_ιου","くゆ":"κου_ιου","けゆ":"κε_ιου","こゆ":"κο_ιου","かあゆ":"καα_ιου","きいゆ":"κιι_ιου","くうゆ":"κουου_ιου","けえゆ":"κεε_ιου","こうゆ":"κοο_ιου","こおゆ":"κοο_ιου","けいゆ":"κει_ιου","がゆ":"γκα_ιου","ぎゆ":"γκι_ιου","ぐゆ":"γκου_ιου","げゆ":"γκε_ιου","ごゆ":"γκο_ιου","があゆ":"γκαα_ιου","ぎいゆ":"γκιι_ιου","ぐうゆ":"γκουου_ιου","げえゆ":"γκεε_ιου","ごうゆ":"γκοο_ιου","ごおゆ":"γκοο_ιου","げいゆ":"γκει_ιου","さゆ":"σα_ιου","すぃゆ":"σι_ιου","すゆ":"σου_ιου","せゆ":"σε_ιου","そゆ":"σο_ιου","さあゆ":"σαα_ιου","すぃいゆ":"σιι_ιου","すうゆ":"σουου_ιου","せえゆ":"σεε_ιου","そうゆ":"σοο_ιου","そおゆ":"σοο_ιου","せいゆ":"σει_ιου","しゃゆ":"σια_ιου","しゆ":"σιι_ιου","しゅゆ":"σιου_ιου","しぇゆ":"σιε_ιου","しょゆ":"σιο_ιου","しゃあゆ":"σιαα_ιου","しいゆ":"σιιι_ιου","しゅうゆ":"σιουου_ιου","しぇえゆ":"σιεε_ιου","しょうゆ":"σιοο_ιου","しょおゆ":"σιοο_ιου","しぇいゆ":"σιει_ιου","ざゆ":"ζα_ιου","ずぃゆ":"ζι_ιου","ずゆ":"ζου_ιου","ぜゆ":"ζε_ιου","ぞゆ":"ζο_ιου","ざあゆ":"ζαα_ιου","ずぃいゆ":"ζιι_ιου","ずうゆ":"ζουου_ιου","ぜえゆ":"ζεε_ιου","ぞうゆ":"ζοο_ιου","ぞおゆ":"ζοο_ιου","ぜいゆ":"ζει_ιου","じゃゆ":"ζια_ιου","じゆ":"ζιι_ιου","じゅゆ":"ζιου_ιου","じぇゆ":"ζιε_ιου","じょゆ":"ζιο_ιου","じゃあゆ":"ζιαα_ιου","じいゆ":"ζιιι_ιου","じゅうゆ":"ζιουου_ιου","じぇえゆ":"ζιεε_ιου","じょうゆ":"ζιοο_ιου","じょおゆ":"ζιοο_ιου","じぇいゆ":"ζιει_ιου","たゆ":"τα_ιου","てぃゆ":"τι_ιου","とぅゆ":"του_ιου","てゆ":"τε_ιου","とゆ":"το_ιου","たあゆ":"ταα_ιου","てぃいゆ":"τιι_ιου","とぅうゆ":"τουου_ιου","てえゆ":"τεε_ιου","とうゆ":"τοο_ιου","とおゆ":"τοο_ιου","ていゆ":"τει_ιου","ちゃゆ":"τια_ιου","ちゆ":"τιι_ιου","ちゅゆ":"τιου_ιου","ちぇゆ":"τιε_ιου","ちょゆ":"τιο_ιου","ちゃあゆ":"τιαα_ιου","ちいゆ":"τιιι_ιου","ちゅうゆ":"τιουου_ιου","ちぇえゆ":"τιεε_ιου","ちょうゆ":"τιοο_ιου","ちょおゆ":"τιοο_ιου","ちぇいゆ":"τιει_ιου","つぁゆ":"τσα_ιου","つぃゆ":"τσι_ιου","つゆ":"τσου_ιου","つぇゆ":"τσε_ιου","つぉゆ":"τσο_ιου","つぁあゆ":"τσαα_ιου","つぃいゆ":"τσιι_ιου","つうゆ":"τσουου_ιου","つぇえゆ":"τσεε_ιου","つぉうゆ":"τσοο_ιου","つぉおゆ":"τσοο_ιου","つぇいゆ":"τσει_ιου","だゆ":"ντα_ιου","でぃゆ":"ντι_ιου","どぅゆ":"ντου_ιου","でゆ":"ντε_ιου","どゆ":"ντο_ιου","だあゆ":"νταα_ιου","でぃいゆ":"ντιι_ιου","どぅうゆ":"ντουου_ιου","でえゆ":"ντεε_ιου","どうゆ":"ντοο_ιου","どおゆ":"ντοο_ιου","でいゆ":"ντει_ιου","ぢゃゆ":"ζια_ιου","ぢゆ":"ζιι_ιου","ぢゅゆ":"ζιου_ιου","ぢぇゆ":"ζιε_ιου","ぢょゆ":"ζιο_ιου","ぢゃあゆ":"ζιαα_ιου","ぢいゆ":"ζιιι_ιου","ぢゅうゆ":"ζιουου_ιου","ぢぇえゆ":"ζιεε_ιου","ぢょうゆ":"ζιοο_ιου","ぢょおゆ":"ζιοο_ιου","ぢぇいゆ":"ζιει_ιου","づゆ":"ζου_ιου","づうゆ":"ζουου_ιου","なゆ":"να_ιου","にゆ":"νι_ιου","ぬゆ":"νου_ιου","ねゆ":"νε_ιου","のゆ":"νο_ιου","なあゆ":"ναα_ιου","にいゆ":"νιι_ιου","ぬうゆ":"νουου_ιου","ねえゆ":"νεε_ιου","のうゆ":"νοο_ιου","のおゆ":"νοο_ιου","ねいゆ":"νει_ιου","はゆ":"χα_ιου","ひゆ":"χι_ιου","へゆ":"χε_ιου","ほゆ":"χο_ιου","はあゆ":"χαα_ιου","ひいゆ":"χιι_ιου","へえゆ":"χεε_ιου","ほうゆ":"χοο_ιου","ほおゆ":"χοο_ιου","へいゆ":"χει_ιου","ふぁゆ":"φα_ιου","ふぃゆ":"φι_ιου","ふゆ":"φου_ιου","ふぇゆ":"φε_ιου","ふぉゆ":"φο_ιου","ふぁあゆ":"φαα_ιου","ふぃいゆ":"φιι_ιου","ふうゆ":"φουου_ιου","ふぇえゆ":"φεε_ιου","ふぉうゆ":"φοο_ιου","ふぉおゆ":"φοο_ιου","ふぇいゆ":"φει_ιου","ばゆ":"μπα_ιου","びゆ":"μπι_ιου","ぶゆ":"μπου_ιου","べゆ":"μπε_ιου","ぼゆ":"μπο_ιου","ばあゆ":"μπαα_ιου","びいゆ":"μπιι_ιου","ぶうゆ":"μπουου_ιου","べえゆ":"μπεε_ιου","ぼうゆ":"μποο_ιου","ぼおゆ":"μποο_ιου","べいゆ":"μπει_ιου","ぱゆ":"πα_ιου","ぴゆ":"πι_ιου","ぷゆ":"που_ιου","ぺゆ":"πε_ιου","ぽゆ":"πο_ιου","ぱあゆ":"παα_ιου","ぴいゆ":"πιι_ιου","ぷうゆ":"πουου_ιου","ぺえゆ":"πεε_ιου","ぽうゆ":"ποο_ιου","ぽおゆ":"ποο_ιου","ぺいゆ":"πει_ιου","まゆ":"μα_ιου","みゆ":"μι_ιου","むゆ":"μου_ιου","めゆ":"με_ιου","もゆ":"μο_ιου","まあゆ":"μαα_ιου","みいゆ":"μιι_ιου","むうゆ":"μουου_ιου","めえゆ":"μεε_ιου","もうゆ":"μοο_ιου","もおゆ":"μοο_ιου","めいゆ":"μει_ιου","やゆ":"ια_ιου","ゆゆ":"ιου_ιου","よゆ":"ιο_ιου","やあゆ":"ιαα_ιου","ゆうゆ":"ιουου_ιου","ようゆ":"ιοο_ιου","よおゆ":"ιοο_ιου","らゆ":"ρα_ιου","りゆ":"ρι_ιου","るゆ":"ρου_ιου","れゆ":"ρε_ιου","ろゆ":"ρο_ιου","らあゆ":"ραα_ιου","りいゆ":"ριι_ιου","るうゆ":"ρουου_ιου","れえゆ":"ρεε_ιου","ろうゆ":"ροο_ιου","ろおゆ":"ροο_ιου","れいゆ":"ρει_ιου","わゆ":"βα_ιου","うぃゆ":"βι_ιου","うぇゆ":"βε_ιου","うぉゆ":"βο_ιου","わあゆ":"βαα_ιου","うぃいゆ":"βιι_ιου","うぇえゆ":"βεε_ιου","うぉうゆ":"βοο_ιου","うぉおゆ":"βοο_ιου","うぇいゆ":"βει_ιου","をゆ":"νο_ιου","んあゆ":"ν’α_ιου","んいゆ":"ν’ι_ιου","んうゆ":"ν’ου_ιου","んえゆ":"ν’ε_ιου","んおゆ":"ν’ο_ιου","んああゆ":"ν’αα_ιου","んいいゆ":"ν’ιι_ιου","んううゆ":"ν’ουου_ιου","んええゆ":"ν’εε_ιου","んおうゆ":"ν’οο_ιου","んおおゆ":"ν’οο_ιου","んえいゆ":"ν’ει_ιου","っかゆ":"κκα_ιου","っきゆ":"κκι_ιου","っくゆ":"κκου_ιου","っけゆ":"κκε_ιου","っこゆ":"κκο_ιου","っかあゆ":"κκαα_ιου","っきいゆ":"κκιι_ιου","っくうゆ":"κκουου_ιου","っけえゆ":"κκεε_ιου","っこうゆ":"κκοο_ιου","っこおゆ":"κκοο_ιου","っけいゆ":"κκει_ιου","っさゆ":"σσα_ιου","っすぃゆ":"σσι_ιου","っすゆ":"σσου_ιου","っせゆ":"σσε_ιου","っそゆ":"σσο_ιου","っさあゆ":"σσαα_ιου","っすぃいゆ":"σσιι_ιου","っすうゆ":"σσουου_ιου","っせえゆ":"σσεε_ιου","っそうゆ":"σσοο_ιου","っそおゆ":"σσοο_ιου","っせいゆ":"σσει_ιου","っしゃゆ":"σσια_ιου","っしゆ":"σσιι_ιου","っしゅゆ":"σσιου_ιου","っしぇゆ":"σσιε_ιου","っしょゆ":"σσιο_ιου","っしゃあゆ":"σσιαα_ιου","っしいゆ":"σσιιι_ιου","っしゅうゆ":"σσιουου_ιου","っしぇえゆ":"σσιεε_ιου","っしょうゆ":"σσιοο_ιου","っしょおゆ":"σσιοο_ιου","っしぇいゆ":"σσιει_ιου","ったゆ":"ττα_ιου","ってぃゆ":"ττι_ιου","っとぅゆ":"ττου_ιου","ってゆ":"ττε_ιου","っとゆ":"ττο_ιου","ったあゆ":"τταα_ιου","ってぃいゆ":"ττιι_ιου","っとぅうゆ":"ττουου_ιου","ってえゆ":"ττεε_ιου","っとうゆ":"ττοο_ιου","っとおゆ":"ττοο_ιου","っていゆ":"ττει_ιου","っちゃゆ":"ττια_ιου","っちゆ":"ττιι_ιου","っちゅゆ":"ττιου_ιου","っちぇゆ":"ττιε_ιου","っちょゆ":"ττιο_ιου","っちゃあゆ":"ττιαα_ιου","っちいゆ":"ττιιι_ιου","っちゅうゆ":"ττιουου_ιου","っちぇえゆ":"ττιεε_ιου","っちょうゆ":"ττιοο_ιου","っちょおゆ":"ττιοο_ιου","っちぇいゆ":"ττιει_ιου","っつぁゆ":"ζζα_ιου","っつぃゆ":"ζζι_ιου","っつゆ":"ζζου_ιου","っつぇゆ":"ζζε_ιου","っつぉゆ":"ζζο_ιου","っつぁあゆ":"ζζαα_ιου","っつぃいゆ":"ζζιι_ιου","っつうゆ":"ζζουου_ιου","っつぇえゆ":"ζζεε_ιου","っつぉうゆ":"ζζοο_ιου","っつぉおゆ":"ζζοο_ιου","っつぇいゆ":"ζζει_ιου","っぱゆ":"ππα_ιου","っぴゆ":"ππι_ιου","っぷゆ":"ππου_ιου","っぺゆ":"ππε_ιου","っぽゆ":"ππο_ιου","っぱあゆ":"ππαα_ιου","っぴいゆ":"ππιι_ιου","っぷうゆ":"ππουου_ιου","っぺえゆ":"ππεε_ιου","っぽうゆ":"πποο_ιου","っぽおゆ":"πποο_ιου","っぺいゆ":"ππει_ιου","ぁゆ":"α_ιου","ぃゆ":"ι_ιου","ぅゆ":"ου_ιου","ぇゆ":"ε_ιου","ぉゆ":"ο_ιου","ぁあゆ":"αα_ιου","ぃいゆ":"ιι_ιου","ぅうゆ":"ουου_ιου","ぇえゆ":"εε_ιου","ぉうゆ":"οο_ιου","ぉおゆ":"οο_ιου","ぇいゆ":"ει_ιου","ゔぁゆ":"βα_ιου","ゔぃゆ":"βι_ιου","ゔゆ":"βου_ιου","ゔぇゆ":"βε_ιου","ゔぉゆ":"βο_ιου","ゔぁあゆ":"βαα_ιου","ゔぃいゆ":"βιι_ιου","ゔうゆ":"βουου_ιου","ゔぇえゆ":"βεε_ιου","ゔぉうゆ":"βοο_ιου","ゔぉおゆ":"βοο_ιου","ゔぇいゆ":"βει_ιου","あよ":"α_ιο","いよ":"ι_ιο","うよ":"ου_ιο","えよ":"ε_ιο","およ":"ο_ιο","ああよ":"αα_ιο","いいよ":"ιι_ιο","ううよ":"ουου_ιο","ええよ":"εε_ιο","おうよ":"οο_ιο","おおよ":"οο_ιο","えいよ":"ει_ιο","かよ":"κα_ιο","きよ":"κι_ιο","くよ":"κου_ιο","けよ":"κε_ιο","こよ":"κο_ιο","かあよ":"καα_ιο","きいよ":"κιι_ιο","くうよ":"κουου_ιο","けえよ":"κεε_ιο","こうよ":"κοο_ιο","こおよ":"κοο_ιο","けいよ":"κει_ιο","がよ":"γκα_ιο","ぎよ":"γκι_ιο","ぐよ":"γκου_ιο","げよ":"γκε_ιο","ごよ":"γκο_ιο","があよ":"γκαα_ιο","ぎいよ":"γκιι_ιο","ぐうよ":"γκουου_ιο","げえよ":"γκεε_ιο","ごうよ":"γκοο_ιο","ごおよ":"γκοο_ιο","げいよ":"γκει_ιο","さよ":"σα_ιο","すぃよ":"σι_ιο","すよ":"σου_ιο","せよ":"σε_ιο","そよ":"σο_ιο","さあよ":"σαα_ιο","すぃいよ":"σιι_ιο","すうよ":"σουου_ιο","せえよ":"σεε_ιο","そうよ":"σοο_ιο","そおよ":"σοο_ιο","せいよ":"σει_ιο","しゃよ":"σια_ιο","しよ":"σιι_ιο","しゅよ":"σιου_ιο","しぇよ":"σιε_ιο","しょよ":"σιο_ιο","しゃあよ":"σιαα_ιο","しいよ":"σιιι_ιο","しゅうよ":"σιουου_ιο","しぇえよ":"σιεε_ιο","しょうよ":"σιοο_ιο","しょおよ":"σιοο_ιο","しぇいよ":"σιει_ιο","ざよ":"ζα_ιο","ずぃよ":"ζι_ιο","ずよ":"ζου_ιο","ぜよ":"ζε_ιο","ぞよ":"ζο_ιο","ざあよ":"ζαα_ιο","ずぃいよ":"ζιι_ιο","ずうよ":"ζουου_ιο","ぜえよ":"ζεε_ιο","ぞうよ":"ζοο_ιο","ぞおよ":"ζοο_ιο","ぜいよ":"ζει_ιο","じゃよ":"ζια_ιο","じよ":"ζιι_ιο","じゅよ":"ζιου_ιο","じぇよ":"ζιε_ιο","じょよ":"ζιο_ιο","じゃあよ":"ζιαα_ιο","じいよ":"ζιιι_ιο","じゅうよ":"ζιουου_ιο","じぇえよ":"ζιεε_ιο","じょうよ":"ζιοο_ιο","じょおよ":"ζιοο_ιο","じぇいよ":"ζιει_ιο","たよ":"τα_ιο","てぃよ":"τι_ιο","とぅよ":"του_ιο","てよ":"τε_ιο","とよ":"το_ιο","たあよ":"ταα_ιο","てぃいよ":"τιι_ιο","とぅうよ":"τουου_ιο","てえよ":"τεε_ιο","とうよ":"τοο_ιο","とおよ":"τοο_ιο","ていよ":"τει_ιο","ちゃよ":"τια_ιο","ちよ":"τιι_ιο","ちゅよ":"τιου_ιο","ちぇよ":"τιε_ιο","ちょよ":"τιο_ιο","ちゃあよ":"τιαα_ιο","ちいよ":"τιιι_ιο","ちゅうよ":"τιουου_ιο","ちぇえよ":"τιεε_ιο","ちょうよ":"τιοο_ιο","ちょおよ":"τιοο_ιο","ちぇいよ":"τιει_ιο","つぁよ":"τσα_ιο","つぃよ":"τσι_ιο","つよ":"τσου_ιο","つぇよ":"τσε_ιο","つぉよ":"τσο_ιο","つぁあよ":"τσαα_ιο","つぃいよ":"τσιι_ιο","つうよ":"τσουου_ιο","つぇえよ":"τσεε_ιο","つぉうよ":"τσοο_ιο","つぉおよ":"τσοο_ιο","つぇいよ":"τσει_ιο","だよ":"ντα_ιο","でぃよ":"ντι_ιο","どぅよ":"ντου_ιο","でよ":"ντε_ιο","どよ":"ντο_ιο","だあよ":"νταα_ιο","でぃいよ":"ντιι_ιο","どぅうよ":"ντουου_ιο","でえよ":"ντεε_ιο","どうよ":"ντοο_ιο","どおよ":"ντοο_ιο","でいよ":"ντει_ιο","ぢゃよ":"ζια_ιο","ぢよ":"ζιι_ιο","ぢゅよ":"ζιου_ιο","ぢぇよ":"ζιε_ιο","ぢょよ":"ζιο_ιο","ぢゃあよ":"ζιαα_ιο","ぢいよ":"ζιιι_ιο","ぢゅうよ":"ζιουου_ιο","ぢぇえよ":"ζιεε_ιο","ぢょうよ":"ζιοο_ιο","ぢょおよ":"ζιοο_ιο","ぢぇいよ":"ζιει_ιο","づよ":"ζου_ιο","づうよ":"ζουου_ιο","なよ":"να_ιο","によ":"νι_ιο","ぬよ":"νου_ιο","ねよ":"νε_ιο","のよ":"νο_ιο","なあよ":"ναα_ιο","にいよ":"νιι_ιο","ぬうよ":"νουου_ιο","ねえよ":"νεε_ιο","のうよ":"νοο_ιο","のおよ":"νοο_ιο","ねいよ":"νει_ιο","はよ":"χα_ιο","ひよ":"χι_ιο","へよ":"χε_ιο","ほよ":"χο_ιο","はあよ":"χαα_ιο","ひいよ":"χιι_ιο","へえよ":"χεε_ιο","ほうよ":"χοο_ιο","ほおよ":"χοο_ιο","へいよ":"χει_ιο","ふぁよ":"φα_ιο","ふぃよ":"φι_ιο","ふよ":"φου_ιο","ふぇよ":"φε_ιο","ふぉよ":"φο_ιο","ふぁあよ":"φαα_ιο","ふぃいよ":"φιι_ιο","ふうよ":"φουου_ιο","ふぇえよ":"φεε_ιο","ふぉうよ":"φοο_ιο","ふぉおよ":"φοο_ιο","ふぇいよ":"φει_ιο","ばよ":"μπα_ιο","びよ":"μπι_ιο","ぶよ":"μπου_ιο","べよ":"μπε_ιο","ぼよ":"μπο_ιο","ばあよ":"μπαα_ιο","びいよ":"μπιι_ιο","ぶうよ":"μπουου_ιο","べえよ":"μπεε_ιο","ぼうよ":"μποο_ιο","ぼおよ":"μποο_ιο","べいよ":"μπει_ιο","ぱよ":"πα_ιο","ぴよ":"πι_ιο","ぷよ":"που_ιο","ぺよ":"πε_ιο","ぽよ":"πο_ιο","ぱあよ":"παα_ιο","ぴいよ":"πιι_ιο","ぷうよ":"πουου_ιο","ぺえよ":"πεε_ιο","ぽうよ":"ποο_ιο","ぽおよ":"ποο_ιο","ぺいよ":"πει_ιο","まよ":"μα_ιο","みよ":"μι_ιο","むよ":"μου_ιο","めよ":"με_ιο","もよ":"μο_ιο","まあよ":"μαα_ιο","みいよ":"μιι_ιο","むうよ":"μουου_ιο","めえよ":"μεε_ιο","もうよ":"μοο_ιο","もおよ":"μοο_ιο","めいよ":"μει_ιο","やよ":"ια_ιο","ゆよ":"ιου_ιο","よよ":"ιο_ιο","やあよ":"ιαα_ιο","ゆうよ":"ιουου_ιο","ようよ":"ιοο_ιο","よおよ":"ιοο_ιο","らよ":"ρα_ιο","りよ":"ρι_ιο","るよ":"ρου_ιο","れよ":"ρε_ιο","ろよ":"ρο_ιο","らあよ":"ραα_ιο","りいよ":"ριι_ιο","るうよ":"ρουου_ιο","れえよ":"ρεε_ιο","ろうよ":"ροο_ιο","ろおよ":"ροο_ιο","れいよ":"ρει_ιο","わよ":"βα_ιο","うぃよ":"βι_ιο","うぇよ":"βε_ιο","うぉよ":"βο_ιο","わあよ":"βαα_ιο","うぃいよ":"βιι_ιο","うぇえよ":"βεε_ιο","うぉうよ":"βοο_ιο","うぉおよ":"βοο_ιο","うぇいよ":"βει_ιο","をよ":"νο_ιο","んあよ":"ν’α_ιο","んいよ":"ν’ι_ιο","んうよ":"ν’ου_ιο","んえよ":"ν’ε_ιο","んおよ":"ν’ο_ιο","んああよ":"ν’αα_ιο","んいいよ":"ν’ιι_ιο","んううよ":"ν’ουου_ιο","んええよ":"ν’εε_ιο","んおうよ":"ν’οο_ιο","んおおよ":"ν’οο_ιο","んえいよ":"ν’ει_ιο","っかよ":"κκα_ιο","っきよ":"κκι_ιο","っくよ":"κκου_ιο","っけよ":"κκε_ιο","っこよ":"κκο_ιο","っかあよ":"κκαα_ιο","っきいよ":"κκιι_ιο","っくうよ":"κκουου_ιο","っけえよ":"κκεε_ιο","っこうよ":"κκοο_ιο","っこおよ":"κκοο_ιο","っけいよ":"κκει_ιο","っさよ":"σσα_ιο","っすぃよ":"σσι_ιο","っすよ":"σσου_ιο","っせよ":"σσε_ιο","っそよ":"σσο_ιο","っさあよ":"σσαα_ιο","っすぃいよ":"σσιι_ιο","っすうよ":"σσουου_ιο","っせえよ":"σσεε_ιο","っそうよ":"σσοο_ιο","っそおよ":"σσοο_ιο","っせいよ":"σσει_ιο","っしゃよ":"σσια_ιο","っしよ":"σσιι_ιο","っしゅよ":"σσιου_ιο","っしぇよ":"σσιε_ιο","っしょよ":"σσιο_ιο","っしゃあよ":"σσιαα_ιο","っしいよ":"σσιιι_ιο","っしゅうよ":"σσιουου_ιο","っしぇえよ":"σσιεε_ιο","っしょうよ":"σσιοο_ιο","っしょおよ":"σσιοο_ιο","っしぇいよ":"σσιει_ιο","ったよ":"ττα_ιο","ってぃよ":"ττι_ιο","っとぅよ":"ττου_ιο","ってよ":"ττε_ιο","っとよ":"ττο_ιο","ったあよ":"τταα_ιο","ってぃいよ":"ττιι_ιο","っとぅうよ":"ττουου_ιο","ってえよ":"ττεε_ιο","っとうよ":"ττοο_ιο","っとおよ":"ττοο_ιο","っていよ":"ττει_ιο","っちゃよ":"ττια_ιο","っちよ":"ττιι_ιο","っちゅよ":"ττιου_ιο","っちぇよ":"ττιε_ιο","っちょよ":"ττιο_ιο","っちゃあよ":"ττιαα_ιο","っちいよ":"ττιιι_ιο","っちゅうよ":"ττιουου_ιο","っちぇえよ":"ττιεε_ιο","っちょうよ":"ττιοο_ιο","っちょおよ":"ττιοο_ιο","っちぇいよ":"ττιει_ιο","っつぁよ":"ζζα_ιο","っつぃよ":"ζζι_ιο","っつよ":"ζζου_ιο","っつぇよ":"ζζε_ιο","っつぉよ":"ζζο_ιο","っつぁあよ":"ζζαα_ιο","っつぃいよ":"ζζιι_ιο","っつうよ":"ζζουου_ιο","っつぇえよ":"ζζεε_ιο","っつぉうよ":"ζζοο_ιο","っつぉおよ":"ζζοο_ιο","っつぇいよ":"ζζει_ιο","っぱよ":"ππα_ιο","っぴよ":"ππι_ιο","っぷよ":"ππου_ιο","っぺよ":"ππε_ιο","っぽよ":"ππο_ιο","っぱあよ":"ππαα_ιο","っぴいよ":"ππιι_ιο","っぷうよ":"ππουου_ιο","っぺえよ":"ππεε_ιο","っぽうよ":"πποο_ιο","っぽおよ":"πποο_ιο","っぺいよ":"ππει_ιο","ぁよ":"α_ιο","ぃよ":"ι_ιο","ぅよ":"ου_ιο","ぇよ":"ε_ιο","ぉよ":"ο_ιο","ぁあよ":"αα_ιο","ぃいよ":"ιι_ιο","ぅうよ":"ουου_ιο","ぇえよ":"εε_ιο","ぉうよ":"οο_ιο","ぉおよ":"οο_ιο","ぇいよ":"ει_ιο","ゔぁよ":"βα_ιο","ゔぃよ":"βι_ιο","ゔよ":"βου_ιο","ゔぇよ":"βε_ιο","ゔぉよ":"βο_ιο","ゔぁあよ":"βαα_ιο","ゔぃいよ":"βιι_ιο","ゔうよ":"βουου_ιο","ゔぇえよ":"βεε_ιο","ゔぉうよ":"βοο_ιο","ゔぉおよ":"βοο_ιο","ゔぇいよ":"βει_ιο"},"additional":{},"endOfWord":{}}
},{}],11:[function(require,module,exports){
module.exports = {"base":{"あ":"אָ","い":"אִי","う":"אוּ","え":"אֵ","お":"אוֹ","ああ":"אָאָ","いい":"אִיאִי","うう":"אוּאוּ","ええ":"אֵאֵ","おう":"אוֹאוֹ","おお":"אוֹאוֹ","えい":"אֵאִי","か":"קָ","き":"קִי","く":"קוּ","け":"קֵ","こ":"קוֹ","きゃ":"קיָ","きゅ":"קיוּ","きょ":"קיוֹ","かあ":"קָאָ","きい":"קִיאִי","くう":"קוּאוּ","けえ":"קֵאֵ","こう":"קוֹאוֹ","こお":"קוֹאוֹ","きゃあ":"קיָאָ","きゅう":"קיוּאוּ","きょう":"קיוֹאוֹ","きょお":"קיוֹאוֹ","けい":"קֵאִי","が":"גָ","ぎ":"גִי","ぐ":"גוּ","げ":"גֵ","ご":"גוֹ","ぎゃ":"גיָ","ぎゅ":"גיוּ","ぎょ":"גיוֹ","があ":"גָאָ","ぎい":"גִיאִי","ぐう":"גוּאוּ","げえ":"גֵאֵ","ごう":"גוֹאוֹ","ごお":"גוֹאוֹ","ぎゃあ":"גיָאָ","ぎゅう":"גיוּאוּ","ぎょう":"גיוֹאוֹ","ぎょお":"גיוֹאוֹ","げい":"גֵאִי","さ":"סָ","すぃ":"סִי","す":"סוּ","せ":"סֵ","そ":"סוֹ","さあ":"סָאָ","すぃい":"סִיאִי","すう":"סוּאוּ","せえ":"סֵאֵ","そう":"סוֹאוֹ","そお":"סוֹאוֹ","せい":"סֵאִי","しゃ":"שָ","し":"שִי","しゅ":"שוּ","しぇ":"שֵ","しょ":"שוֹ","しゃあ":"שָאָ","しい":"שִיאִי","しゅう":"שוּאוּ","しぇえ":"שֵאֵ","しょう":"שוֹאוֹ","しょお":"שוֹאוֹ","しぇい":"שֵאִי","ざ":"זָ","ずぃ":"זִי","ず":"זוּ","ぜ":"זֵ","ぞ":"זוֹ","ざあ":"זָאָ","ずぃい":"זִיאִי","ずう":"זוּאוּ","ぜえ":"זֵאֵ","ぞう":"זוֹאוֹ","ぞお":"זוֹאוֹ","ぜい":"זֵאִי","じゃ":"ג׳ָ","じ":"ג׳ִי","じゅ":"ג׳וּ","じぇ":"ג׳ֵ","じょ":"ג׳וֹ","じゃあ":"ג׳ָאָ","じい":"ג׳ִיאִי","じゅう":"ג׳וּאוּ","じぇえ":"ג׳ֵאֵ","じょう":"ג׳וֹאוֹ","じょお":"ג׳וֹאוֹ","じぇい":"ג׳ֵאִי","た":"טָ","てぃ":"טִי","とぅ":"טוּ","て":"טֵ","と":"טוֹ","たあ":"טָאָ","てぃい":"טִיאִי","とぅう":"טוּאוּ","てえ":"טֵאֵ","とう":"טוֹאוֹ","とお":"טוֹאוֹ","てい":"טֵאִי","ちゃ":"צ׳ָ","ち":"צ׳ִי","ちゅ":"צ׳וּ","ちぇ":"צ׳ֵ","ちょ":"צ׳וֹ","ちゃあ":"צ׳ָאָ","ちい":"צ׳ִיאִי","ちゅう":"צ׳וּאוּ","ちぇえ":"צ׳ֵאֵ","ちょう":"צ׳וֹאוֹ","ちょお":"צ׳וֹאוֹ","ちぇい":"צ׳ֵאִי","つぁ":"צָ","つぃ":"צִי","つ":"צוּ","つぇ":"צֵ","つぉ":"צוֹ","つぁあ":"צָאָ","つぃい":"צִיאִי","つう":"צוּאוּ","つぇえ":"צֵאֵ","つぉう":"צוֹאוֹ","つぉお":"צוֹאוֹ","つぇい":"צֵאִי","だ":"דָ","でぃ":"דִי","どぅ":"דוּ","で":"דֵ","ど":"דוֹ","だあ":"דָאָ","でぃい":"דִיאִי","どぅう":"דוּאוּ","でえ":"דֵאֵ","どう":"דוֹאוֹ","どお":"דוֹאוֹ","でい":"דֵאִי","ぢゃ":"ג׳ָ","ぢ":"ג׳ִי","ぢゅ":"ג׳וּ","ぢぇ":"ג׳ֵ","ぢょ":"ג׳וֹ","ぢゃあ":"ג׳ָאָ","ぢい":"ג׳ִיאִי","ぢゅう":"ג׳וּאוּ","ぢぇえ":"ג׳ֵאֵ","ぢょう":"ג׳וֹאוֹ","ぢょお":"ג׳וֹאוֹ","ぢぇい":"ג׳ִֵי","づ":"זוּ","づう":"זוּאוּ","な":"נָ","に":"נִי","ぬ":"נוּ","ね":"נֵ","の":"נוֹ","にゃ":"ניָ","にゅ":"ניוּ","にょ":"ניוֹ","なあ":"נָאָ","にい":"נִיאִי","ぬう":"נוּאוּ","ねえ":"נֵאֵ","のう":"נוֹאוֹ","のお":"נוֹאוֹ","にゃあ":"ניָאָ","にゅう":"ניוּאוּ","にょう":"ניוֹאוֹ","にょお":"ניוֹאוֹ","ねい":"נֵאִי","は":"הָ","ひ":"הִי","へ":"הֵ","ほ":"הוֹ","ひゃ":"היָ","ひゅ":"היוּ","ひょ":"היוֹ","はあ":"הָאָ","ひい":"הִיאִי","へえ":"הֵאֵ","ほう":"הוֹאוֹ","ほお":"הוֹאוֹ","ひゃあ":"היָאָ","ひゅう":"היוּאוּ","ひょう":"היוֹאוֹ","ひょお":"היוֹאוֹ","へい":"הֵאִי","ふぁ":"פָ","ふぃ":"פִי","ふ":"פוּ","ふぇ":"פֵ","ふぉ":"פוֹ","ふぁあ":"פָאָ","ふぃい":"פִיאִי","ふう":"פוּאוּ","ふぇえ":"פֵאֵ","ふぉう":"פוֹאוֹ","ふぉお":"פוֹאוֹ","ふぇい":"פֵאִי","ば":"בָּ","び":"בִּי","ぶ":"בּוּ","べ":"בֵּ","ぼ":"בּוֹ","びゃ":"בּיָ","びゅ":"בּיוּ","びょ":"בּיוֹ","ばあ":"בָּאָ","びい":"בִּיאִי","ぶう":"בּוּאוּ","べえ":"בֵּאֵ","ぼう":"בּוֹאוֹ","ぼお":"בּוֹאוֹ","びゃあ":"בּיָאָ","びゅう":"בּיוּאוּ","びょう":"בּיוֹאוֹ","びょお":"בּיוֹאוֹ","べい":"בֵּאִי","ぱ":"פָּ","ぴ":"פִּי","ぷ":"פּוּ","ぺ":"פֵּ","ぽ":"פּוֹ","ぴゃ":"פּיָ","ぴゅ":"פּיוּ","ぴょ":"פּיוֹ","ぱあ":"פָּאָ","ぴい":"פִּיאִי","ぷう":"פּוּאוּ","ぺえ":"פֵּאֵ","ぽう":"פּוֹאוֹ","ぽお":"פּוֹאוֹ","ぴゃあ":"פּיָאָ","ぴゅう":"פּיוּאוּ","ぴょう":"פּיוֹאוֹ","ぴょお":"פּיוֹאוֹ","ぺい":"פֵּאִי","ま":"מָ","み":"מִי","む":"מוּ","め":"מֵ","も":"מוֹ","みゃ":"מיָ","みゅ":"מיוּ","みょ":"מיוֹ","まあ":"מָאָ","みい":"מִיאִי","むう":"מוּאוּ","めえ":"מֵאֵ","もう":"מוֹאוֹ","もお":"מוֹאוֹ","みゃあ":"מיָאָ","みゅう":"מיוּאוּ","みょう":"מיוֹאוֹ","みょお":"מיוֹאוֹ","めい":"מֵאִי","や":"יָ","ゆ":"יוּ","よ":"יוֹ","やあ":"יָאָ","ゆう":"יוּאוּ","よう":"יוֹאוֹ","よお":"יוֹאוֹ","ら":"רָ","り":"רִי","る":"רוּ","れ":"רֵ","ろ":"רוֹ","りゃ":"ריָ","りゅ":"ריוּ","りょ":"ריוֹ","らあ":"רָאָ","りい":"רִיאִי","るう":"רוּאוּ","れえ":"רֵאֵ","ろう":"רוֹאוֹ","ろお":"רוֹאוֹ","りゃあ":"ריָאָ","りゅう":"ריוּאוּ","りょう":"ריוֹאוֹ","りょお":"ריוֹאוֹ","れい":"רֵאִי","わ":"ווָ","うぃ":"ווִי","うぇ":"ווֵ","うぉ":"וווֹ","わあ":"ווָאָ","うぃい":"ווִיאִי","うぇえ":"ווֵאֵ","うぉう":"וווֹאוֹ","うぉお":"וווֹאוֹ","うぇい":"ווֵאִי","ん":"נ","を":"אוֹ","っ":"","んあ":"נ'אָ","んい":"נ'אִי","んう":"נ'אוּ","んえ":"נ'אֵ","んお":"נ'אוֹ","んや":"נ'יָ","んゆ":"נ'יוּ","んよ":"נ'יוֹ","んああ":"נ'אָאָ","んいい":"נ'אִיאִי","んうう":"נ'אוּאוּ","んええ":"נ'אֵאֵ","んおう":"נ'אוֹאוֹ","んおお":"נ'אוֹאוֹ","んやあ":"נ'יָאָ","んゆう":"נ'יוּאוּ","んよう":"נ'יוֹאוֹ","んよお":"נ'יוֹאוֹ","んえい":"נ'אֵאֵ","っか":"קָ","っき":"קִי","っく":"קוּ","っけ":"קֵ","っこ":"קוֹ","っきゃ":"קיָ","っきゅ":"קיוּ","っきょ":"קיוֹ","っかあ":"קָאָ","っきい":"קִיאִי","っくう":"קוּאוּ","っけえ":"קֵאֵ","っこう":"קוֹאוֹ","っこお":"קוֹאוֹ","っきゃあ":"קיָאָ","っきゅう":"קיוּאוּ","っきょう":"קיוֹאוֹ","っきょお":"קיוֹאוֹ","っけい":"קֵאִי","っさ":"סָ","っすぃ":"סִי","っす":"סוּ","っせ":"סֵ","っそ":"סוֹ","っさあ":"סָאָ","っすぃい":"סִיאִי","っすう":"סוּאוּ","っせえ":"סֵאֵ","っそう":"סוֹאוֹ","っそお":"סוֹאוֹ","っせい":"סֵאִי","っしゃ":"שָ","っし":"שִי","っしゅ":"שוּ","っしぇ":"שֵ","っしょ":"שוֹ","っしゃあ":"שָאָ","っしい":"שִיאִי","っしゅう":"שוּאוּ","っしぇえ":"שֵאֵ","っしょう":"שוֹאוֹ","っしょお":"שוֹאוֹ","っしぇい":"שִֵי","った":"טָ","ってぃ":"טִי","っとぅ":"טוּ","って":"טֵ","っと":"טוֹ","ったあ":"טָאָ","ってぃい":"טִיאִי","っとぅう":"טוּאוּ","ってえ":"טֵאֵ","っとう":"טוֹאוֹ","っとお":"טוֹאוֹ","ってい":"טֵאִי","っちゃ":"צ׳ָ","っち":"צ׳ִי","っちゅ":"צ׳וּ","っちぇ":"צ׳ֵ","っちょ":"צ׳וֹ","っちゃあ":"צ׳ָאָ","っちい":"צ׳ִיאִי","っちゅう":"צ׳וּאוּ","っちぇえ":"צ׳ֵאֵ","っちょう":"צ׳וֹאוֹ","っちょお":"צ׳וֹאוֹ","っちぇい":"צ׳ִֵי","っつぁ":"צָ","っつぃ":"צִי","っつ":"צוּ","っつぇ":"צֵ","っつぉ":"צוֹ","っつぁあ":"צָאָ","っつぃい":"צִיאִי","っつう":"צוּאוּ","っつぇえ":"צֵאֵ","っつぉう":"צוֹאוֹ","っつぉお":"צוֹאוֹ","っつぇい":"צִֵי","っぱ":"פָּ","っぴ":"פִּי","っぷ":"פּוּ","っぺ":"פֵּ","っぽ":"פּוֹ","っぴゃ":"פּיָ","っぴゅ":"פּיוּ","っぴょ":"פּיוֹ","っぱあ":"פָּאָ","っぴい":"פִּיאִי","っぷう":"פּוּאוּ","っぺえ":"פֵּאֵ","っぽう":"פּוֹאוֹ","っぽお":"פּוֹאוֹ","っぴゃあ":"פּיָאָ","っぴゅう":"פּיוּאוּ","っぴょう":"פּיוֹאוֹ","っぴょお":"פּיוֹאוֹ","っぺい":"פֵּאִי","ぁ":"אָ","ぃ":"אִי","ぅ":"אוּ","ぇ":"אֵ","ぉ":"אוֹ","ゃ":"יָ","ゅ":"יוּ","ょ":"יוֹ","ぁあ":"אָאָ","ぃい":"אִיאִי","ぅう":"אוּאוּ","ぇえ":"אֵאֵ","ぉう":"אוֹאוֹ","ぉお":"אוֹאוֹ","ゃあ":"יָאָ","ゅう":"יוּאוּ","ょう":"יוֹאוֹ","ょお":"יוֹאוֹ","ぇい":"אֵאִי","ゔぁ":"בָ","ゔぃ":"בִי","ゔ":"בוּ","ゔぇ":"בֵ","ゔぉ":"בוֹ","ゔぁあ":"בָאָ","ゔぃい":"בִיאִי","ゔう":"בוּאוּ","ゔぇえ":"בֵאֵ","ゔぉう":"בוֹאוֹ","ゔぉお":"בוֹאוֹ","ゔぇい":"בֵאִי"},"additional":{},"endOfWord":{"あ":"אָה","い":"אִי","う":"אוּ","え":"אֵה","お":"אוֹ","ああ":"אָאָה","いい":"אִיאִי","うう":"אוּאוּ","ええ":"אֵאֵה","おう":"אוֹאוֹ","おお":"אוֹאוֹ","えい":"אֵאֵה","か":"קָה","き":"קִי","く":"קוּ","け":"קֵה","こ":"קוֹ","きゃ":"קיָה","きゅ":"קיוּ","きょ":"קיוֹ","かあ":"קָאָה","きい":"קִיאִי","くう":"קוּאוּ","けえ":"קֵאֵה","こう":"קוֹאוֹ","こお":"קוֹאוֹ","きゃあ":"קיָאָה","きゅう":"קיוּאוּ","きょう":"קיוֹאוֹ","きょお":"קיוֹאוֹ","けい":"קֵאֵה","が":"גָה","ぎ":"גִי","ぐ":"גוּ","げ":"גֵה","ご":"גוֹ","ぎゃ":"גיָה","ぎゅ":"גיוּ","ぎょ":"גיוֹ","があ":"גָאָה","ぎい":"גִיאִי","ぐう":"גוּאוּ","げえ":"גֵאֵה","ごう":"גוֹאוֹ","ごお":"גוֹאוֹ","ぎゃあ":"גיָאָה","ぎゅう":"גיוּאוּ","ぎょう":"גיוֹאוֹ","ぎょお":"גיוֹאוֹ","げい":"גֵאֵה","さ":"סָה","すぃ":"סִי","す":"סוּ","せ":"סֵה","そ":"סוֹ","さあ":"סָאָה","すぃい":"סִיאִי","すう":"סוּאוּ","せえ":"סֵאֵה","そう":"סוֹאוֹ","そお":"סוֹאוֹ","せい":"סֵאֵה","しゃ":"שָה","し":"שִי","しゅ":"שוּ","しぇ":"שֵה","しょ":"שוֹ","しゃあ":"שָאָה","しい":"שִיאִי","しゅう":"שוּאוּ","しぇえ":"שֵאֵה","しょう":"שוֹאוֹ","しょお":"שוֹאוֹ","しぇい":"שֵהִי","ざ":"זָה","ずぃ":"זִי","ず":"זוּ","ぜ":"זֵה","ぞ":"זוֹ","ざあ":"זָאָה","ずぃい":"זִיאִי","ずう":"זוּאוּ","ぜえ":"זֵאֵה","ぞう":"זוֹאוֹ","ぞお":"זוֹאוֹ","ぜい":"זֵאֵה","じゃ":"ג׳ָה","じ":"ג׳ִי","じゅ":"ג׳וּ","じぇ":"ג׳ֵה","じょ":"ג׳וֹ","じゃあ":"ג׳ָאָה","じい":"ג׳ִיאִי","じゅう":"ג׳וּאוּ","じぇえ":"ג׳ֵאֵה","じょう":"ג׳וֹאוֹ","じょお":"ג׳וֹאוֹ","じぇい":"ג׳ֵהִי","た":"טָה","てぃ":"טִי","とぅ":"טוּ","て":"טֵה","と":"טוֹ","たあ":"טָאָה","てぃい":"טִיאִי","とぅう":"טוּאוּ","てえ":"טֵאֵה","とう":"טוֹאוֹ","とお":"טוֹאוֹ","てい":"טֵאֵה","ちゃ":"צ׳ָה","ち":"צ׳ִי","ちゅ":"צ׳וּ","ちぇ":"צ׳ֵה","ちょ":"צ׳וֹ","ちゃあ":"צ׳ָאָה","ちい":"צ׳ִיאִי","ちゅう":"צ׳וּאוּ","ちぇえ":"צ׳ֵאֵה","ちょう":"צ׳וֹאוֹ","ちょお":"צ׳וֹאוֹ","ちぇい":"צ׳ֵהִי","つぁ":"צָה","つぃ":"צִי","つ":"צוּ","つぇ":"צֵה","つぉ":"צוֹ","つぁあ":"צָאָה","つぃい":"צִיאִי","つう":"צוּאוּ","つぇえ":"צֵאֵה","つぉう":"צוֹאוֹ","つぉお":"צוֹאוֹ","つぇい":"צֵהִי","だ":"דָה","でぃ":"דִי","どぅ":"דוּ","で":"דֵה","ど":"דוֹ","だあ":"דָאָה","でぃい":"דִיאִי","どぅう":"דוּאוּ","でえ":"דֵאֵה","どう":"דוֹאוֹ","どお":"דוֹאוֹ","でい":"דֵאֵה","ぢゃ":"ג׳ָה","ぢ":"ג׳ִי","ぢゅ":"ג׳וּ","ぢぇ":"ג׳ֵה","ぢょ":"ג׳וֹ","ぢゃあ":"ג׳ָאָה","ぢい":"ג׳ִיאִי","ぢゅう":"ג׳וּאוּ","ぢぇえ":"ג׳ֵאֵה","ぢょう":"ג׳וֹאוֹ","ぢょお":"ג׳וֹאוֹ","ぢぇい":"ג׳ֵהִי","づ":"זוּ","づう":"זוּאוּ","な":"נָה","に":"נִי","ぬ":"נוּ","ね":"נֵה","の":"נוֹ","にゃ":"ניָה","にゅ":"ניוּ","にょ":"ניוֹ","なあ":"נָאָה","にい":"נִיאִי","ぬう":"נוּאוּ","ねえ":"נֵאֵה","のう":"נוֹאוֹ","のお":"נוֹאוֹ","にゃあ":"ניָאָה","にゅう":"ניוּאוּ","にょう":"ניוֹאוֹ","にょお":"ניוֹאוֹ","ねい":"נֵאֵה","は":"הָה","ひ":"הִי","へ":"הֵה","ほ":"הוֹ","ひゃ":"היָה","ひゅ":"היוּ","ひょ":"היוֹ","はあ":"הָאָה","ひい":"הִיאִי","へえ":"הֵאֵה","ほう":"הוֹאוֹ","ほお":"הוֹאוֹ","ひゃあ":"היָאָה","ひゅう":"היוּאוּ","ひょう":"היוֹאוֹ","ひょお":"היוֹאוֹ","へい":"הֵאֵה","ふぁ":"פָה","ふぃ":"פִי","ふ":"פוּ","ふぇ":"פֵה","ふぉ":"פוֹ","ふぁあ":"פָאָה","ふぃい":"פִיאִי","ふう":"פוּאוּ","ふぇえ":"פֵאֵה","ふぉう":"פוֹאוֹ","ふぉお":"פוֹאוֹ","ふぇい":"פֵהִי","ば":"בָּה","び":"בִּי","ぶ":"בּוּ","べ":"בֵּה","ぼ":"בּוֹ","びゃ":"בּיָה","びゅ":"בּיוּ","びょ":"בּיוֹ","ばあ":"בָּאָה","びい":"בִּיאִי","ぶう":"בּוּאוּ","べえ":"בֵּאֵה","ぼう":"בּוֹאוֹ","ぼお":"בּוֹאוֹ","びゃあ":"בּיָאָה","びゅう":"בּיוּאוּ","びょう":"בּיוֹאוֹ","びょお":"בּיוֹאוֹ","べい":"בֵּאֵה","ぱ":"פָּה","ぴ":"פִּי","ぷ":"פּוּ","ぺ":"פֵּה","ぽ":"פּוֹ","ぴゃ":"פּיָה","ぴゅ":"פּיוּ","ぴょ":"פּיוֹ","ぱあ":"פָּאָה","ぴい":"פִּיאִי","ぷう":"פּוּאוּ","ぺえ":"פֵּאֵה","ぽう":"פּוֹאוֹ","ぽお":"פּוֹאוֹ","ぴゃあ":"פּיָאָה","ぴゅう":"פּיוּאוּ","ぴょう":"פּיוֹאוֹ","ぴょお":"פּיוֹאוֹ","ぺい":"פֵּאֵה","ま":"מָה","み":"מִי","む":"מוּ","め":"מֵה","も":"מוֹ","みゃ":"מיָה","みゅ":"מיוּ","みょ":"מיוֹ","まあ":"מָאָה","みい":"מִיאִי","むう":"מוּאוּ","めえ":"מֵאֵה","もう":"מוֹאוֹ","もお":"מוֹאוֹ","みゃあ":"מיָאָה","みゅう":"מיוּאוּ","みょう":"מיוֹאוֹ","みょお":"מיוֹאוֹ","めい":"מֵאֵה","や":"יָה","ゆ":"יוּ","よ":"יוֹ","やあ":"יָאָה","ゆう":"יוּאוּ","よう":"יוֹאוֹ","よお":"יוֹאוֹ","ら":"רָה","り":"רִי","る":"רוּ","れ":"רֵה","ろ":"רוֹ","りゃ":"ריָה","りゅ":"ריוּ","りょ":"ריוֹ","らあ":"רָאָה","りい":"רִיאִי","るう":"רוּאוּ","れえ":"רֵאֵה","ろう":"רוֹאוֹ","ろお":"רוֹאוֹ","りゃあ":"ריָאָה","りゅう":"ריוּאוּ","りょう":"ריוֹאוֹ","りょお":"ריוֹאוֹ","れい":"רֵאֵה","わ":"ווָה","うぃ":"ווִי","うぇ":"ווֵה","うぉ":"וווֹ","わあ":"ווָאָה","うぃい":"ווִיאִי","うぇえ":"ווֵאֵה","うぉう":"וווֹאוֹ","うぉお":"וווֹאוֹ","うぇい":"ווֵהִי","ん":"נ","を":"אוֹ","っ":"","んあ":"נ'אָה","んい":"נ'אִי","んう":"נ'אוּ","んえ":"נ'אֵה","んお":"נ'אוֹ","んや":"נ'יָה","んゆ":"נ'יוּ","んよ":"נ'יוֹ","んああ":"נ'אָהאָה","んいい":"נ'אִיאִי","んうう":"נ'אוּאוּ","んええ":"נ'אֵהאֵה","んおう":"נ'אוֹאוֹ","んおお":"נ'אוֹאוֹ","んやあ":"נ'יָהאָה","んゆう":"נ'יוּאוּ","んよう":"נ'יוֹאוֹ","んよお":"נ'יוֹאוֹ","んえい":"נ'אֵהאֵה","っか":"קָה","っき":"קִי","っく":"קוּ","っけ":"קֵה","っこ":"קוֹ","っきゃ":"קיָה","っきゅ":"קיוּ","っきょ":"קיוֹ","っかあ":"קָאָה","っきい":"קִיאִי","っくう":"קוּאוּ","っけえ":"קֵאֵה","っこう":"קוֹאוֹ","っこお":"קוֹאוֹ","っきゃあ":"קיָאָה","っきゅう":"קיוּאוּ","っきょう":"קיוֹאוֹ","っきょお":"קיוֹאוֹ","っけい":"קֵאֵה","っさ":"סָה","っすぃ":"סִי","っす":"סוּ","っせ":"סֵה","っそ":"סוֹ","っさあ":"סָאָה","っすぃい":"סִיאִי","っすう":"סוּאוּ","っせえ":"סֵאֵה","っそう":"סוֹאוֹ","っそお":"סוֹאוֹ","っせい":"סֵאֵה","っしゃ":"שָה","っし":"שִי","っしゅ":"שוּ","っしぇ":"שֵה","っしょ":"שוֹ","っしゃあ":"שָאָה","っしい":"שִיאִי","っしゅう":"שוּאוּ","っしぇえ":"שֵאֵה","っしょう":"שוֹאוֹ","っしょお":"שוֹאוֹ","っしぇい":"שֵהִי","った":"טָה","ってぃ":"טִי","っとぅ":"טוּ","って":"טֵה","っと":"טוֹ","ったあ":"טָאָה","ってぃい":"טִיאִי","っとぅう":"טוּאוּ","ってえ":"טֵאֵה","っとう":"טוֹאוֹ","っとお":"טוֹאוֹ","ってい":"טֵאֵה","っちゃ":"צ׳ָה","っち":"צ׳ִי","っちゅ":"צ׳וּ","っちぇ":"צ׳ֵה","っちょ":"צ׳וֹ","っちゃあ":"צ׳ָאָה","っちい":"צ׳ִיאִי","っちゅう":"צ׳וּאוּ","っちぇえ":"צ׳ֵאֵה","っちょう":"צ׳וֹאוֹ","っちょお":"צ׳וֹאוֹ","っちぇい":"צ׳ֵהִי","っつぁ":"צָה","っつぃ":"צִי","っつ":"צוּ","っつぇ":"צֵה","っつぉ":"צוֹ","っつぁあ":"צָאָה","っつぃい":"צִיאִי","っつう":"צוּאוּ","っつぇえ":"צֵאֵה","っつぉう":"צוֹאוֹ","っつぉお":"צוֹאוֹ","っつぇい":"צֵהִי","っぱ":"פָּה","っぴ":"פִּי","っぷ":"פּוּ","っぺ":"פֵּה","っぽ":"פּוֹ","っぴゃ":"פּיָה","っぴゅ":"פּיוּ","っぴょ":"פּיוֹ","っぱあ":"פָּאָה","っぴい":"פִּיאִי","っぷう":"פּוּאוּ","っぺえ":"פֵּאֵה","っぽう":"פּוֹאוֹ","っぽお":"פּוֹאוֹ","っぴゃあ":"פּיָאָה","っぴゅう":"פּיוּאוּ","っぴょう":"פּיוֹאוֹ","っぴょお":"פּיוֹאוֹ","っぺい":"פֵּאֵה","ぁ":"ָה","ぃ":"ִי","ぅ":"וּ","ぇ":"ֵה","ぉ":"וֹ","ゃ":"יָה","ゅ":"יוּ","ょ":"יוֹ","ぁあ":"ָאָה","ぃい":"ִיאִי","ぅう":"וּאוּ","ぇえ":"ֵאֵה","ぉう":"וֹאוֹ","ぉお":"וֹאוֹ","ゃあ":"יָאָה","ゅう":"יוּאוּ","ょう":"יוֹאוֹ","ょお":"יוֹאוֹ","ぇい":"ֵהִי","ゔぁ":"בָּה","ゔぃ":"בִּי","ゔ":"בּוּ","ゔぇ":"בֵּה","ゔぉ":"בּוֹ","ゔぁあ":"בָּאָה","ゔぃい":"בִּיאִי","ゔう":"בּוּאוּ","ゔぇえ":"בֵּאֵה","ゔぉう":"בּוֹאוֹ","ゔぉお":"בּוֹאוֹ","ゔぇい":"בֵּהִי"}}
},{}],12:[function(require,module,exports){
module.exports = {"base":{"あ":"अ","い":"इ","う":"उ","え":"ए","お":"ओ","ああ":"अअ","いい":"ई","うう":"उउ","ええ":"एए","おう":"ओओ","おお":"ओओ","えい":"एइ","か":"का","き":"कि","く":"कु","け":"के","こ":"को","きゃ":"क्या","きゅ":"क्यु","きょ":"क्यो","かあ":"काअ","きい":"की","くう":"कुउ","けえ":"केए","こう":"कोओ","こお":"कोओ","きゃあ":"क्याअ","きゅう":"क्युउ","きょう":"क्योओ","きょお":"क्योओ","けい":"केइ","が":"गा","ぎ":"गि","ぐ":"गु","げ":"गे","ご":"गो","ぎゃ":"ग्या","ぎゅ":"ग्यु","ぎょ":"ग्यो","があ":"गाअ","ぎい":"गी","ぐう":"गुउ","げえ":"गेए","ごう":"गोओ","ごお":"गोओ","ぎゃあ":"ग्याअ","ぎゅう":"ग्युउ","ぎょう":"ग्योओ","ぎょお":"ग्योओ","げい":"गेइ","さ":"सा","すぃ":"सि","す":"सु","せ":"से","そ":"सो","さあ":"साअ","すぃい":"सी","すう":"सुउ","せえ":"सेए","そう":"सोओ","そお":"सोओ","せい":"सेइ","しゃ":"शा","し":"शि","しゅ":"शु","しぇ":"शे","しょ":"शो","しゃあ":"शाअ","しい":"शी","しゅう":"शुउ","しぇえ":"शेए","しょう":"शोओ","しょお":"शोओ","しぇい":"शेि","ざ":"ज़ा","ずぃ":"ज़ि","ず":"ज़ु","ぜ":"ज़े","ぞ":"ज़ो","ざあ":"ज़ाअ","ずぃい":"ज़ी","ずう":"ज़ुउ","ぜえ":"ज़ेए","ぞう":"ज़ोओ","ぞお":"ज़ोओ","ぜい":"ज़ेइ","じゃ":"जा","じ":"जि","じゅ":"जु","じぇ":"जे","じょ":"जो","じゃあ":"जाअ","じい":"जी","じゅう":"जुउ","じぇえ":"जेए","じょう":"जोओ","じょお":"जोओ","じぇい":"जेि","た":"ता","てぃ":"ति","とぅ":"तु","て":"ते","と":"तो","たあ":"ताअ","てぃい":"ती","とぅう":"तुउ","てえ":"तेए","とう":"तोओ","とお":"तोओ","てい":"तेइ","ちゃ":"चा","ち":"चि","ちゅ":"चु","ちぇ":"चे","ちょ":"चो","ちゃあ":"चाअ","ちい":"ची","ちゅう":"चुउ","ちぇえ":"चेए","ちょう":"चोओ","ちょお":"चोओ","ちぇい":"चेि","つぁ":"त्सा","つぃ":"त्सि","つ":"त्सु","つぇ":"त्से","つぉ":"त्सो","つぁあ":"त्साअ","つぃい":"त्सी","つう":"त्सुउ","つぇえ":"त्सेए","つぉう":"त्सोओ","つぉお":"त्सोओ","つぇい":"त्सेि","だ":"दा","でぃ":"दि","どぅ":"दु","で":"दे","ど":"दो","だあ":"दाअ","でぃい":"दी","どぅう":"दुउ","でえ":"देए","どう":"दोओ","どお":"दोओ","でい":"देइ","ぢゃ":"जा","ぢ":"जि","ぢゅ":"जु","ぢぇ":"जे","ぢょ":"जो","ぢゃあ":"जाअ","ぢい":"जी","ぢゅう":"जुउ","ぢぇえ":"जेए","ぢょう":"जोओ","ぢょお":"जोओ","ぢぇい":"जेि","づ":"ज़ु","づう":"ज़ुउ","な":"ना","に":"नि","ぬ":"नु","ね":"ने","の":"नो","にゃ":"न्या","にゅ":"न्यु","にょ":"न्यो","なあ":"नाअ","にい":"नी","ぬう":"नुउ","ねえ":"नेए","のう":"नोओ","のお":"नोओ","にゃあ":"न्याअ","にゅう":"न्युउ","にょう":"न्योओ","にょお":"न्योओ","ねい":"नेइ","は":"हा","ひ":"हि","へ":"हे","ほ":"हो","ひゃ":"ह्या","ひゅ":"ह्यु","ひょ":"ह्यो","はあ":"हाअ","ひい":"ही","へえ":"हेए","ほう":"होओ","ほお":"होओ","ひゃあ":"ह्याअ","ひゅう":"ह्युउ","ひょう":"ह्योओ","ひょお":"ह्योओ","へい":"हेइ","ふぁ":"फ़ा","ふぃ":"फ़ि","ふ":"फ़ु","ふぇ":"फ़े","ふぉ":"फ़ो","ふぁあ":"फ़ाअ","ふぃい":"फ़ी","ふう":"फ़ुउ","ふぇえ":"फ़ेए","ふぉう":"फ़ोओ","ふぉお":"फ़ोओ","ふぇい":"फ़ेि","ば":"बा","び":"बि","ぶ":"बु","べ":"बे","ぼ":"बो","びゃ":"ब्या","びゅ":"ब्यु","びょ":"ब्यो","ばあ":"बाअ","びい":"बी","ぶう":"बुउ","べえ":"बेए","ぼう":"बोओ","ぼお":"बोओ","びゃあ":"ब्याअ","びゅう":"ब्युउ","びょう":"ब्योओ","びょお":"ब्योओ","べい":"बेइ","ぱ":"पा","ぴ":"पि","ぷ":"पु","ぺ":"पे","ぽ":"पो","ぴゃ":"प्या","ぴゅ":"प्यु","ぴょ":"प्यो","ぱあ":"पाअ","ぴい":"पी","ぷう":"पुउ","ぺえ":"पेए","ぽう":"पोओ","ぽお":"पोओ","ぴゃあ":"प्याअ","ぴゅう":"प्युउ","ぴょう":"प्योओ","ぴょお":"प्योओ","ぺい":"पेइ","ま":"मा","み":"मि","む":"मु","め":"मे","も":"मो","みゃ":"म्या","みゅ":"म्यु","みょ":"म्यो","まあ":"माअ","みい":"मी","むう":"मुउ","めえ":"मेए","もう":"मोओ","もお":"मोओ","みゃあ":"म्याअ","みゅう":"म्युउ","みょう":"म्योओ","みょお":"म्योओ","めい":"मेइ","や":"या","ゆ":"यु","よ":"यो","やあ":"याअ","ゆう":"युउ","よう":"योओ","よお":"योओ","ら":"रा","り":"रि","る":"रु","れ":"रे","ろ":"रो","りゃ":"र्या","りゅ":"र्यु","りょ":"र्यो","らあ":"राअ","りい":"री","るう":"रुउ","れえ":"रेए","ろう":"रोओ","ろお":"रोओ","りゃあ":"र्याअ","りゅう":"र्युउ","りょう":"र्योओ","りょお":"र्योओ","れい":"रेइ","わ":"वा","うぃ":"वि","うぇ":"वे","うぉ":"वो","わあ":"वाअ","うぃい":"वी","うぇえ":"वेए","うぉう":"वोओ","うぉお":"वोओ","うぇい":"वेि","ん":"न","を":"ओ","っ":"","っか":"क्का","っき":"क्कि","っく":"क्कु","っけ":"क्के","っこ":"क्को","っきゃ":"क्क्या","っきゅ":"क्क्यु","っきょ":"क्क्यो","っかあ":"क्काअ","っきい":"क्की","っくう":"क्कुउ","っけえ":"क्केए","っこう":"क्कोओ","っこお":"क्कोओ","っきゃあ":"क्क्याअ","っきゅう":"क्क्युउ","っきょう":"क्क्योओ","っきょお":"क्क्योओ","っけい":"क्केइ","っさ":"स्सा","っすぃ":"स्सि","っす":"स्सु","っせ":"स्से","っそ":"स्सो","っさあ":"स्साअ","っすぃい":"स्सी","っすう":"स्सुउ","っせえ":"स्सेए","っそう":"स्सोओ","っそお":"स्सोओ","っせい":"स्सेइ","っしゃ":"श्शा","っし":"श्शि","っしゅ":"श्शु","っしぇ":"श्शे","っしょ":"श्शो","っしゃあ":"श्शाअ","っしい":"श्शी","っしゅう":"श्शुउ","っしぇえ":"श्शेए","っしょう":"श्शोओ","っしょお":"श्शोओ","っしぇい":"श्शेि","った":"त्ता","ってぃ":"त्ति","っとぅ":"त्तु","って":"त्ते","っと":"त्तो","ったあ":"त्ताअ","ってぃい":"त्ती","っとぅう":"त्तुउ","ってえ":"त्तेए","っとう":"त्तोओ","っとお":"त्तोओ","ってい":"त्तेइ","っちゃ":"च्चा","っち":"च्चि","っちゅ":"च्चु","っちぇ":"च्चे","っちょ":"च्चो","っちゃあ":"च्चाअ","っちい":"च्ची","っちゅう":"च्चुउ","っちぇえ":"च्चेए","っちょう":"च्चोओ","っちょお":"च्चोओ","っちぇい":"च्चेि","っつぁ":"त्सा","っつぃ":"त्सि","っつ":"त्सु","っつぇ":"त्से","っつぉ":"त्सो","っつぁあ":"त्साअ","っつぃい":"त्सी","っつう":"त्सुउ","っつぇえ":"त्सेए","っつぉう":"त्सोओ","っつぉお":"त्सोओ","っつぇい":"त्सेि","っぱ":"प्पा","っぴ":"प्पि","っぷ":"प्पु","っぺ":"प्पे","っぽ":"प्पो","っぴゃ":"प्प्या","っぴゅ":"प्प्यु","っぴょ":"प्प्यो","っぱあ":"प्पाअ","っぴい":"प्पी","っぷう":"प्पुउ","っぺえ":"प्पेए","っぽう":"प्पोओ","っぽお":"प्पोओ","っぴゃあ":"प्प्याअ","っぴゅう":"प्प्युउ","っぴょう":"प्प्योओ","っぴょお":"प्प्योओ","っぺい":"प्पेइ","ぁ":"अ","ぃ":"इ","ぅ":"उ","ぇ":"ए","ぉ":"ओ","ゃ":"या","ゅ":"यु","ょ":"यो","ぁあ":"अअ","ぃい":"ई","ぅう":"उउ","ぇえ":"एए","ぉう":"ओओ","ぉお":"ओओ","ゃあ":"याअ","ゅう":"युउ","ょう":"योओ","ょお":"योओ","ぇい":"एइ","ゔぁ":"वा","ゔぃ":"वि","ゔ":"वु","ゔぇ":"वे","ゔぉ":"वो","ゔぁあ":"वाअ","ゔぃい":"वी","ゔう":"वुउ","ゔぇえ":"वेए","ゔぉう":"वोओ","ゔぉお":"वोओ","ゔぇい":"वेि","んが":"न्गा","んぎ":"न्गि","んぐ":"न्गु","んげ":"न्गे","んご":"न्गो","んがあ":"न्गाअ","んぎい":"न्गी","んぐう":"न्गुउ","んげえ":"न्गेए","んごう":"न्गोओ","んごお":"न्गोओ","んげい":"न्गेइ","んさ":"न्सा","んすぃ":"न्सि","んす":"न्सु","んせ":"न्से","んそ":"न्सो","んさあ":"न्साअ","んすぃい":"न्सी","んすう":"न्सुउ","んせえ":"न्सेए","んそう":"न्सोओ","んそお":"न्सोओ","んせい":"न्सेइ","んしゃ":"न्शा","んし":"न्शि","んしゅ":"न्शु","んしぇ":"न्शे","んしょ":"न्शो","んしゃあ":"न्शाअ","んしい":"न्शी","んしゅう":"न्शुउ","んしぇえ":"न्शेए","んしょう":"न्शोओ","んしょお":"न्शोओ","んしぇい":"न्शेइ","んざ":"न्जा","んずぃ":"न्जि","んず":"न्जु","んぜ":"न्जे","んぞ":"न्जो","んざあ":"न्जाअ","んずぃい":"न्जी","んずう":"न्जुउ","んぜえ":"न्जेए","んぞう":"न्जोओ","んぞお":"न्जोओ","んぜい":"न्जेइ","んじゃ":"न्जा","んじ":"न्जि","んじゅ":"न्जु","んじぇ":"न्जे","んじょ":"न्जो","んじゃあ":"न्जाअ","んじい":"न्जी","んじゅう":"न्जुउ","んじぇえ":"न्जेए","んじょう":"न्जोओ","んじょお":"न्जोओ","んじぇい":"न्जेइ","んた":"न्ता","んてぃ":"न्ति","んとぅ":"न्तु","んて":"न्ते","んと":"न्तो","んたあ":"न्ताअ","んてぃい":"न्ती","んとぅう":"न्तुउ","んてえ":"न्तेए","んとう":"न्तोओ","んとお":"न्तोओ","んてい":"न्तेइ","んちゃ":"न्चा","んち":"न्चि","んちゅ":"न्चु","んちぇ":"न्चे","んちょ":"न्चो","んちゃあ":"न्चाअ","んちい":"न्ची","んちゅう":"न्चुउ","んちぇえ":"न्चेए","んちょう":"न्चोओ","んちょお":"न्चोओ","んちぇい":"न्चेइ","んつぁ":"न्ता","んつぃ":"न्ति","んつ":"न्तु","んつぇ":"न्ते","んつぉ":"न्तो","んつぁあ":"न्ताअ","んつぃい":"न्ती","んつう":"न्तुउ","んつぇえ":"न्तेए","んつぉう":"न्तोओ","んつぉお":"न्तोओ","んつぇい":"न्तेइ","んだ":"न्दा","んでぃ":"न्दि","んどぅ":"न्दु","んで":"न्दे","んど":"न्दो","んだあ":"न्दाअ","んでぃい":"न्दी","んどぅう":"न्दुउ","んでえ":"न्देए","んどう":"न्दोओ","んどお":"न्दोओ","んでい":"न्देइ","んぢゅ":"न्जु","んぢゅう":"न्जुउ","んづ":"न्जु","んづう":"न्जुउ","んな":"न्ना","んに":"न्नि","んね":"न्ने","んの":"न्नो","んにゃ":"न्न्या","んにゅ":"न्न्यु","んにょ":"न्न्यो","んなあ":"न्नाअ","んにい":"न्नी","んねえ":"न्नेए","んのう":"न्नोओ","んのお":"न्नोओ","んにゃあ":"न्न्याअ","んにゅう":"न्न्युउ","んにょう":"न्न्योओ","んにょお":"न्न्योओ","んねい":"न्नेइ","んは":"न्ज्ञा","んひ":"न्ज्ञि","んへ":"न्ज्ञे","んほ":"न्ज्ञो","んはあ":"न्ज्ञाअ","んひい":"न्ज्ञी","んへえ":"न्ज्ञेए","んほう":"न्ज्ञोओ","んほお":"न्ज्ञोओ","んへい":"न्ज्ञेइ","んふぁ":"न्फा","んふぃ":"न्फि","んふ":"न्फु","んふぇ":"न्फे","んふぉ":"न्फो","んふぁあ":"न्फाअ","んふぃい":"न्फी","んふう":"न्फुउ","んふぇえ":"न्फेए","んふぉう":"न्फोओ","んふぉお":"न्फोओ","んふぇい":"न्फेइ","んば":"न्बा","んび":"न्बि","んぶ":"न्बु","んべ":"न्बे","んぼ":"न्बो","んびゃ":"न्ब्या","んびゅ":"न्ब्यु","んびょ":"न्ब्यो","んばあ":"न्बाअ","んびい":"न्बी","んぶう":"न्बुउ","んべえ":"न्बेए","んぼう":"न्बोओ","んぼお":"न्बोओ","んびゃあ":"न्ब्याअ","んびゅう":"न्ब्युउ","んびょう":"न्ब्योओ","んびょお":"न्ब्योओ","んべい":"न्बेइ","んぱ":"न्पा","んぴ":"न्पि","んぷ":"न्पु","んぺ":"न्पे","んぽ":"न्पो","んぴゃ":"न्प्या","んぴゅ":"न्प्यु","んぴょ":"न्प्यो","んぱあ":"न्पाअ","んぴい":"न्पी","んぷう":"न्पुउ","んぺえ":"न्पेए","んぽう":"न्पोओ","んぽお":"न्पोओ","んぴゃあ":"न्प्याअ","んぴゅう":"न्प्युउ","んぴょう":"न्प्योओ","んぴょお":"न्प्योओ","んぺい":"न्पेइ","んま":"न्मा","んむ":"न्मु","んも":"न्मो","んまあ":"न्माअ","んむう":"न्मुउ","んもう":"न्मोओ","んもお":"न्मोओ","んや":"न्या","んゆ":"न्यु","んよ":"न्यो","んやあ":"न्याअ","んゆう":"न्युउ","んよう":"न्योओ","んよお":"न्योओ","んら":"न्रा","んり":"न्रि","んれ":"न्रे","んろ":"न्रो","んらあ":"न्राअ","んりい":"न्री","んれえ":"न्रेए","んろう":"न्रोओ","んろお":"न्रोओ","んれい":"न्रेइ","んわ":"न्वा","んうぉ":"न्वो","んあ":"न’अ","んを":"न'ओ","んっ":"","んっさ":"न्ज्ञा","んっすぃ":"न्ज्ञि","んっす":"न्ज्ञु","んっせ":"न्ज्ञे","んっそ":"न्ज्ञो","んっさあ":"न्ज्ञाअ","んっすぃい":"न्ज्ञी","んっすう":"न्ज्ञुउ","んっせえ":"न्ज्ञेए","んっそう":"न्ज्ञोओ","んっそお":"न्ज्ञोओ","んっせい":"न्ज्ञेइ","んっしゃ":"न्शा","んっし":"न्शि","んっしゅ":"न्शु","んっしぇ":"न्शे","んっしょ":"न्शो","んっしゃあ":"न्शाअ","んっしい":"न्शी","んっしゅう":"न्शुउ","んっしぇえ":"न्शेए","んっしょう":"न्शोओ","んっしょお":"न्शोओ","んっしぇい":"न्शेइ","んった":"न्ता","んってぃ":"न्ति","んっとぅ":"न्तु","んって":"न्ते","んっと":"न्तो","んったあ":"न्ताअ","んってぃい":"न्ती","んっとぅう":"न्तुउ","んってえ":"न्तेए","んっとう":"न्तोओ","んっとお":"न्तोओ","んってい":"न्तेइ","んっちゃ":"न्चा","んっち":"न्चि","んっちゅ":"न्चु","んっちぇ":"न्चे","んっちょ":"न्चो","んっちゃあ":"न्चाअ","んっちい":"न्ची","んっちゅう":"न्चुउ","んっちぇえ":"न्चेए","んっちょう":"न्चोओ","んっちょお":"न्चोओ","んっちぇい":"न्चेइ","んっつぁ":"न्ता","んっつぃ":"न्ति","んっつ":"न्तु","んっつぇ":"न्ते","んっつぉ":"न्तो","んっつぁあ":"न्ताअ","んっつぃい":"न्ती","んっつう":"न्तुउ","んっつぇえ":"न्तेए","んっつぉう":"न्तोओ","んっつぉお":"न्तोओ","んっつぇい":"न्तेइ","んっぱ":"न्पा","んっぴ":"न्पि","んっぷ":"न्पु","んっぺ":"न्पे","んっぽ":"न्पो","んっぴゃ":"न्प्या","んっぴゅ":"न्प्यु","んっぴょ":"न्प्यो","んっぱあ":"न्पाअ","んっぴい":"न्पी","んっぷう":"न्पुउ","んっぺえ":"न्पेए","んっぽう":"न्पोओ","んっぽお":"न्पोओ","んっぴゃあ":"न्प्याअ","んっぴゅう":"न्प्युउ","んっぴょう":"न्प्योओ","んっぴょお":"न्प्योओ","んっぺい":"न्पेइ","んぁ":"न’अ","んぃ":"न’इ","んぅ":"न’उ","んぇ":"न’ए","んぉ":"न’ओ","んぁあ":"न’अअ","んぃい":"न’ई","んぅう":"न’उउ","んぇえ":"न’एए","んぉう":"न’ओओ","んぉお":"न’ओओ","んぇい":"न’एे"},"additional":{},"endOfWord":{}}
},{}],13:[function(require,module,exports){
module.exports = {"base":{"a":"あ","i":"い","u":"う","e":"え","o":"お","aa":"ああ","ii":"いい","uu":"うう","ee":"ええ","ou":"おう","oo":"おお","ei":"えい","ka":"か","ki":"き","ku":"く","ke":"け","ko":"こ","kya":"きゃ","kyu":"きゅ","kyo":"きょ","kaa":"かあ","kii":"きい","kuu":"くう","kee":"けえ","kou":"こう","koo":"こお","kyaa":"きゃあ","kyuu":"きゅう","kyou":"きょう","kyoo":"きょお","kei":"けい","ga":"が","gi":"ぎ","gu":"ぐ","ge":"げ","go":"ご","gya":"ぎゃ","gyu":"ぎゅ","gyo":"ぎょ","gaa":"があ","gii":"ぎい","guu":"ぐう","gee":"げえ","gou":"ごう","goo":"ごお","gyaa":"ぎゃあ","gyuu":"ぎゅう","gyou":"ぎょう","gyoo":"ぎょお","gei":"げい","sa":"さ","si":"すぃ","su":"す","se":"せ","so":"そ","saa":"さあ","sii":"スィー","suu":"すう","see":"せえ","sou":"そう","soo":"そお","sei":"せい","sha":"しゃ","shi":"し","shu":"しゅ","she":"しぇ","sho":"しょ","shaa":"しゃあ","shii":"しい","shuu":"しゅう","shee":"シェー","shou":"しょう","shoo":"しょお","shei":"しぇい","za":"ざ","zi":"ズィ","zu":"ず","ze":"ぜ","zo":"ぞ","zaa":"ざあ","zii":"ズィー","zuu":"ずう","zee":"ぜえ","zou":"ぞう","zoo":"ぞお","zei":"ぜい","ja":"じゃ","ji":"じ","ju":"じゅ","je":"じぇ","jo":"じょ","jaa":"じゃあ","jii":"じい","juu":"じゅう","jee":"ジェー","jou":"じょう","joo":"じょお","jei":"じぇい","ta":"た","ti":"ティ","tu":"トゥ","te":"て","to":"と","taa":"たあ","tii":"ティー","tuu":"トゥー","tee":"てえ","tou":"とう","too":"とお","tei":"てい","cha":"ちゃ","chi":"ち","chu":"ちゅ","che":"チェ","cho":"ちょ","chaa":"ちゃあ","chii":"ちい","chuu":"ちゅう","chee":"ちぇえ","chou":"ちょう","choo":"ちょお","chei":"ちぇい","tsa":"ツァ","tsi":"ツィ","tsu":"つ","tse":"ツェ","tso":"ツォ","tsaa":"ツァー","tsii":"ツィー","tsuu":"つう","tsee":"ツェー","tsou":"ツォウ","tsoo":"ツォー","tsei":"ツェイ","da":"だ","di":"ディ","du":"ドゥ","de":"で","do":"ど","daa":"だあ","dii":"ディー","duu":"ドゥー","dee":"でえ","dou":"どう","doo":"どお","dei":"でい","na":"な","ni":"に","nu":"ぬ","ne":"ね","no":"の","nya":"にゃ","nyu":"にゅ","nyo":"にょ","naa":"なあ","nii":"にい","nuu":"ぬう","nee":"ねえ","nou":"のう","noo":"のお","nyaa":"にゃあ","nyuu":"にゅう","nyou":"にょう","nyoo":"にょお","nei":"ねい","ha":"は","hi":"ひ","he":"へ","ho":"ほ","hya":"ひゃ","hyu":"ひゅ","hyo":"ひょ","haa":"はあ","hii":"ひい","hee":"へえ","hou":"ほう","hoo":"ほお","hyaa":"ひゃあ","hyuu":"ひゅう","hyou":"ひょう","hyoo":"ひょお","hei":"へい","fa":"ふぁ","fi":"ふぃ","fu":"ふ","fe":"ふぇ","fo":"ふぉ","faa":"ふぁあ","fii":"ふぃい","fuu":"ふう","fee":"ふぇえ","fou":"ふぉう","foo":"ふぉお","fei":"ふぇい","ba":"ば","bi":"び","bu":"ぶ","be":"べ","bo":"ぼ","bya":"びゃ","byu":"びゅ","byo":"びょ","baa":"ばあ","bii":"びい","buu":"ぶう","bee":"べえ","bou":"ぼう","boo":"ぼお","byaa":"びゃあ","byuu":"びゅう","byou":"びょう","byoo":"びょお","bei":"べい","pa":"ぱ","pi":"ぴ","pu":"ぷ","pe":"ぺ","po":"ぽ","pya":"ぴゃ","pyu":"ぴゅ","pyo":"ぴょ","paa":"ぱあ","pii":"ぴい","puu":"ぷう","pee":"ぺえ","pou":"ぽう","poo":"ぽお","pyaa":"ぴゃあ","pyuu":"ぴゅう","pyou":"ぴょう","pyoo":"ぴょお","pei":"ぺい","ma":"ま","mi":"み","mu":"む","me":"め","mo":"も","mya":"みゃ","myu":"みゅ","myo":"みょ","maa":"まあ","mii":"みい","muu":"むう","mee":"めえ","mou":"もう","moo":"もお","myaa":"みゃあ","myuu":"みゅう","myou":"みょう","myoo":"みょお","mei":"めい","ya":"や","yu":"ゆ","yo":"よ","yaa":"やあ","yuu":"ゆう","you":"よう","yoo":"よお","ra":"ら","ri":"り","ru":"る","re":"れ","ro":"ろ","rya":"りゃ","ryu":"りゅ","ryo":"りょ","raa":"らあ","rii":"りい","ruu":"るう","ree":"れえ","rou":"ろう","roo":"ろお","ryaa":"りゃあ","ryuu":"りゅう","ryou":"りょう","ryoo":"りょお","rei":"れい","wa":"わ","wi":"うぃ","we":"うぇ","wo":"お","waa":"わあ","wii":"うぃい","wee":"うぇえ","wou":"うぉう","woo":"うぉお","wei":"うぇい","n":"ん","n'a":"んあ","n'i":"んい","n'u":"んう","n'e":"んえ","n'o":"んお","n'ya":"んや","n'yu":"んゆ","n'yo":"んよ","n'aa":"んああ","n'ii":"んいい","n'uu":"んうう","n'ee":"んええ","n'ou":"んおう","n'oo":"んおお","n'yaa":"んやあ","n'yuu":"んゆう","n'you":"んよう","n'yoo":"んよお","n'ei":"んえい","kka":"っか","kki":"っき","kku":"っく","kke":"っけ","kko":"っこ","kkya":"っきゃ","kkyu":"っきゅ","kkyo":"っきょ","kkaa":"っかあ","kkii":"っきい","kkuu":"っくう","kkee":"っけえ","kkou":"っこう","kkoo":"っこお","kkyaa":"っきゃあ","kkyuu":"っきゅう","kkyou":"っきょう","kkyoo":"っきょお","kkei":"っけい","ssa":"っさ","ssi":"っすぃ","ssu":"っす","sse":"っせ","sso":"っそ","ssaa":"っさあ","ssii":"っすぃい","ssuu":"っすう","ssee":"っせえ","ssou":"っそう","ssoo":"っそお","ssei":"っせい","ssha":"っしゃ","sshi":"っし","sshu":"っしゅ","sshe":"っしぇ","ssho":"っしょ","sshaa":"っしゃあ","sshii":"っしい","sshuu":"っしゅう","sshee":"っしぇえ","sshou":"っしょう","sshoo":"っしょお","sshei":"っしぇい","tta":"った","tti":"ッティ","ttu":"ットゥ","tte":"って","tto":"っと","ttaa":"ったあ","ttii":"ッティー","ttuu":"ットゥー","ttee":"ってえ","ttou":"っとう","ttoo":"っとお","ttei":"ってい","ccha":"っちゃ","cchi":"っち","cchu":"っちゅ","cche":"ッチェ","ccho":"っちょ","cchaa":"っちゃあ","cchii":"っちい","cchuu":"っちゅう","cchee":"ッチェー","cchou":"っちょう","cchoo":"っちょお","cchei":"っちぇい","ttsa":"ッツァ","ttsi":"ッツィ","ttsu":"ッツ","ttse":"ッツェ","ttso":"ッツォ","ttsaa":"ッツァー","ttsii":"ッツィー","ttsuu":"ッツー","ttsee":"ッツェー","ttsou":"ッツォウ","ttsoo":"ッツォー","ttsei":"ッツェイ","ppa":"っぱ","ppi":"っぴ","ppu":"っぷ","ppe":"っぺ","ppo":"っぽ","ppya":"っぴゃ","ppyu":"っぴゅ","ppyo":"っぴょ","ppaa":"っぱあ","ppii":"っぴい","ppuu":"っぷう","ppee":"っぺえ","ppou":"っぽう","ppoo":"っぽお","ppyaa":"っぴゃあ","ppyuu":"っぴゅう","ppyou":"っぴょう","ppyoo":"っぴょお","ppei":"っぺい","va":"ヴァ","vi":"ヴィ","vu":"ヴ","ve":"ヴェ","vo":"ヴォ","vaa":"ヴァー","vii":"ヴィー","vuu":"ヴー","vee":"ヴェー","voo":"ヴォー","vei":"ヴェイ","â":"ああ","ā ":"ああ","ī":"いい","î ":"いい","ū":"うう","û":"うう","ê":"ええ","ē":"ええ","ō":"おお","ô":"おお","sya":"しゃ","syi":"し","syu":"しゅ","sye":"しぇ","syo":"しょ","tya":"ちゃ","tyi":"ち","tyu":"ちゅ","tye":"ちぇ","tyo":"ちょ","zya":"じゃ","zyi":"じ","zyu":"じゅ","zye":"じぇ","zyo":"じょ","syaa":"しゃあ","syii":"しい","syuu":"しゅう","syee":"しぇえ","syoo":"しょお","syou":"しょお","tyaa":"ちゃあ","tyii":"ちい","tyuu":"ちゅう","tyee":"ちぇえ","tyoo":"ちょお","tyou":"っちょお","zyaa":"じゃあ","zyii":"じい","zyuu":"じゅう","zyee":"じぇえ","zyoo":"じょお","zyou":"じょお","ssya":"っしゃ","ssyi":"っし","ssyu":"っしゅ","ssye":"っしぇ","ssyo":"っしょ","ttya":"っちゃ","ttyi":"っち","ttyu":"っちゅ","ttye":"っちぇ","ttyo":"っちょ","ssyaa":"っしゃあ","ssyii":"っしい","ssyuu":"っしゅう","ssyee":"っしぇえ","ssyoo":"っしょお","ssyou":"っしょお","ttyaa":"っちゃあ","ttyii":"っちい","ttyuu":"っちゅう","ttyee":"っちぇえ","ttyoo":"っちょお","kâ":"かあ","kyâ":"きゃあ","gâ":"があ","gyâ":"ぎゃあ","sâ":"さあ","shâ":"しゃあ","zâ":"ざあ","jâ":"じゃあ","tâ":"たあ","châ":"ちゃあ","tsâ":"ツァー","dâ":"だあ","nâ":"なあ","nyâ":"にゃあ","hâ":"はあ","hyâ":"ひゃあ","fâ":"ふぁあ","bâ":"ばあ","byâ":"びゃあ","pâ":"ぱあ","pyâ":"ぴゃあ","mâ":"まあ","myâ":"みゃあ","yâ":"やあ","râ":"らあ","ryâ":"りゃあ","wâ":"わあ","n'â":"んああ","n'yâ":"んやあ","kkâ":"っかあ","kkyâ":"っきゃあ","ssâ":"っさあ","sshâ":"っしゃあ","ttâ":"ったあ","cchâ":"っちゃあ","ttsâ":"ッツァー","ppâ":"っぱあ","ppyâ":"っぴゃあ","vâ":"ヴァー","syâ":"しゃあ","tyâ":"ちゃあ","zyâ":"じゃあ","ssyâ":"っしゃあ","ttyâ":"っちゃあ","kā":"かあ","kyā":"きゃあ","gā":"があ","gyā":"ぎゃあ","sā":"さあ","shā":"しゃあ","zā":"ざあ","jā":"じゃあ","tā":"たあ","chā":"ちゃあ","tsā":"ツァー","dā":"だあ","nā":"なあ","nyā":"にゃあ","hā":"はあ","hyā":"ひゃあ","fā":"ふぁあ","bā":"ばあ","byā":"びゃあ","pā":"ぱあ","pyā":"ぴゃあ","mā":"まあ","myā":"みゃあ","yā":"やあ","rā":"らあ","ryā":"りゃあ","wā":"わあ","n'ā":"んああ","n'yā":"んやあ","kkā":"っかあ","kkyā":"っきゃあ","ssā":"っさあ","sshā":"っしゃあ","ttā":"ったあ","cchā":"っちゃあ","ttsā":"ッツァー","ppā":"っぱあ","ppyā":"っぴゃあ","vā":"ヴァー","syā":"しゃあ","tyā":"ちゃあ","zyā":"じゃあ","ssyā":"っしゃあ","ttyā":"っちゃあ","kī":"きい","gī":"ぎい","sī":"スィー","shī":"しい","zī":"ズィー","jī":"じい","tī":"ティー","chī":"ちい","tsī":"ツィー","dī":"ディー","nī":"にい","hī":"ひい","fī":"ふぃい","bī":"びい","pī":"ぴい","mī":"みい","rī":"りい","wī":"うぃい","n'ī":"んいい","kkī":"っきい","ssī":"っすぃい","sshī":"っしい","ttī":"ッティー","cchī":"っちい","ttsī":"ッツィー","ppī":"っぴい","vī":"ヴィー","syī":"しい","tyī":"ちい","zyī":"じい","ssyī":"っしい","ttyī":"っちい","kî":"きい","gî":"ぎい","sî":"スィー","shî":"しい","zî":"ズィー","jî":"じい","tî":"ティー","chî":"ちい","tsî":"ツィー","dî":"ディー","nî":"にい","hî":"ひい","fî":"ふぃい","bî":"びい","pî":"ぴい","mî":"みい","rî":"りい","wî":"うぃい","n'î":"んいい","kkî":"っきい","ssî":"っすぃい","sshî":"っしい","ttî":"ッティー","cchî":"っちい","ttsî":"ッツィー","ppî":"っぴい","vî":"ヴィー","syî":"しい","tyî":"ちい","zyî":"じい","ssyî":"っしい","ttyî":"っちい","kū":"くう","kyū":"きゅう","gū":"ぐう","gyū":"ぎゅう","sū":"すう","shū":"しゅう","zū":"ずう","jū":"じゅう","tū":"トゥー","chū":"ちゅう","tsū":"つう","dū":"ドゥー","nū":"ぬう","nyū":"にゅう","hyū":"ひゅう","fū":"ふう","bū":"ぶう","byū":"びゅう","pū":"ぷう","pyū":"ぴゅう","mū":"むう","myū":"みゅう","yū":"ゆう","rū":"るう","ryū":"りゅう","n'ū":"んうう","n'yū":"んゆう","kkū":"っくう","kkyū":"っきゅう","ssū":"っすう","sshū":"っしゅう","ttū":"ットゥー","cchū":"っちゅう","ttsū":"ッツー","ppū":"っぷう","ppyū":"っぴゅう","vū":"ヴー","syū":"しゅう","tyū":"ちゅう","zyū":"じゅう","ssyū":"っしゅう","ttyū":"っちゅう","kû":"くう","kyû":"きゅう","gû":"ぐう","gyû":"ぎゅう","sû":"すう","shû":"しゅう","zû":"ずう","jû":"じゅう","tû":"トゥー","chû":"ちゅう","tsû":"つう","dû":"ドゥー","nû":"ぬう","nyû":"にゅう","hyû":"ひゅう","fû":"ふう","bû":"ぶう","byû":"びゅう","pû":"ぷう","pyû":"ぴゅう","mû":"むう","myû":"みゅう","yû":"ゆう","rû":"るう","ryû":"りゅう","n'û":"んうう","n'yû":"んゆう","kkû":"っくう","kkyû":"っきゅう","ssû":"っすう","sshû":"っしゅう","ttû":"ットゥー","cchû":"っちゅう","ttsû":"ッツー","ppû":"っぷう","ppyû":"っぴゅう","vû":"ヴー","syû":"しゅう","tyû":"ちゅう","zyû":"じゅう","ssyû":"っしゅう","ttyû":"っちゅう","kê":"けえ","gê":"げえ","sê":"せえ","shê":"シェー","zê":"ぜえ","jê":"ジェー","tê":"てえ","chê":"ちぇえ","tsê":"ツェー","dê":"でえ","nê":"ねえ","hê":"へえ","fê":"ふぇえ","bê":"べえ","pê":"ぺえ","mê":"めえ","rê":"れえ","wê":"うぇえ","n'ê":"んええ","kkê":"っけえ","ssê":"っせえ","sshê":"っしぇえ","ttê":"ってえ","cchê":"ッチェー","ttsê":"ッツェー","ppê":"っぺえ","vê":"ヴェー","syê":"しぇえ","tyê":"ちぇえ","zyê":"じぇえ","ssyê":"っしぇえ","ttyê":"っちぇえ","kē":"けえ","gē":"げえ","sē":"せえ","shē":"シェー","zē":"ぜえ","jē":"ジェー","tē":"てえ","chē":"ちぇえ","tsē":"ツェー","dē":"でえ","nē":"ねえ","hē":"へえ","fē":"ふぇえ","bē":"べえ","pē":"ぺえ","mē":"めえ","rē":"れえ","wē":"うぇえ","n'ē":"んええ","kkē":"っけえ","ssē":"っせえ","sshē":"っしぇえ","ttē":"ってえ","cchē":"ッチェー","ttsē":"ッツェー","ppē":"っぺえ","vē":"ヴェー","syē":"しぇえ","tyē":"ちぇえ","zyē":"じぇえ","ssyē":"っしぇえ","ttyē":"っちぇえ","kō":"こお","kyō":"きょお","gō":"ごお","gyō":"ぎょお","sō":"そお","shō":"しょお","zō":"ぞお","jō":"じょお","tō":"とお","chō":"ちょお","tsō":"ツォー","dō":"どお","nō":"のお","nyō":"にょお","hō":"ほお","hyō":"ひょお","fō":"ふぉお","bō":"ぼお","byō":"びょお","pō":"ぽお","pyō":"ぴょお","mō":"もお","myō":"みょお","yō":"よお","rō":"ろお","ryō":"りょお","wō":"うぉお","n'ō":"んおお","n'yō":"んよお","kkō":"っこお","kkyō":"っきょお","ssō":"っそお","sshō":"っしょお","ttō":"っとお","cchō":"っちょお","ttsō":"ッツォー","ppō":"っぽお","ppyō":"っぴょお","vō":"ヴォー","syō":"しょお","tyō":"ちょお","zyō":"じょお","ssyō":"っしょお","ttyō":"っちょお","kô":"こお","kyô":"きょお","gô":"ごお","gyô":"ぎょお","sô":"そお","shô":"しょお","zô":"ぞお","jô":"じょお","tô":"とお","chô":"ちょお","tsô":"ツォー","dô":"どお","nô":"のお","nyô":"にょお","hô":"ほお","hyô":"ひょお","fô":"ふぉお","bô":"ぼお","byô":"びょお","pô":"ぽお","pyô":"ぴょお","mô":"もお","myô":"みょお","yô":"よお","rô":"ろお","ryô":"りょお","wô":"うぉお","n'ô":"んおお","n'yô":"んよお","kkô":"っこお","kkyô":"っきょお","ssô":"っそお","sshô":"っしょお","ttô":"っとお","cchô":"っちょお","ttsô":"ッツォー","ppô":"っぽお","ppyô":"っぴょお","vô":"ヴォー","syô":"しょお","tyô":"ちょお","zyô":"じょお","ssyô":"っしょお","ttyô":"っちょお","mba":"んば","mbi":"んび","mbu":"んぶ","mbe":"んべ","mbo":"んぼ","mbya":"んびゃ","mbyu":"んびゅ","mbyo":"んびょ","mbaa":"んばあ","mbii":"んびい","mbuu":"んぶう","mbee":"んべえ","mboo":"んぼお","mbyaa":"んびゃあ","mbyuu":"んびゅう","mbyoo":"んびょお","mbei":"んべい","mpa":"んぱ","mpi":"んぴ","mpu":"んぷ","mpe":"んぺ","mpo":"んぽ","mpya":"んぴゃ","mpyu":"んぴゅ","mpyo":"んぴょ","mpaa":"んぱあ","mpii":"んぴい","mpuu":"んぷう","mpee":"んぺえ","mpoo":"んぽお","mpyaa":"んぴゃあ","mpyuu":"んぴゅう","mpyoo":"んぴょお","mpei":"んぺい","mma":"んま","mmi":"んみ","mmu":"んむ","mme":"んめ","mmo":"んも","mmya":"んみゃ","mmyu":"んみゅ","mmyo":"んみょ","mmaa":"んまあ","mmii":"んみい","mmuu":"んむう","mmee":"んめえ","mmoo":"んもお","mmyaa":"んみゃあ","mmyuu":"んみゅう","mmyoo":"んみょお","mmei":"んめい","mppa":"んっぱ","mppi":"んっぴ","mppu":"んっぷ","mppe":"んっぺ","mppo":"んっぽ","mppya":"んっぴゃ","mppyu":"んっぴゅ","mppyo":"んっぴょ","mppaa":"んっぱあ","mppii":"んっぴい","mppuu":"んっぷう","mppee":"んっぺえ","mppoo":"んっぽお","mppyaa":"んっぴゃあ","mppyuu":"んっぴゅう","mppyoo":"んっぴょお","mppei":"んっぺい","yen":"えん","tokyo":"とうきょお","osaka":"おおさか","kyoto":"きょおと","dzu":"ず","woshuretto":"うぉしゅれっと","woruto":"うぉると","worufu":"うぉるふ","won":"うぉん","wokka":"うぉっか","wokki":"うぉっき","wokku":"うぉっく","wokke":"うぉっけ","wokko":"うぉっこ","wossa":"うぉっさ","wosshi":"うぉっし","wossu":"うぉっす","wosse":"うぉっせ","wosso":"うぉっそ","wotta":"うぉった","wotchi":"うぉっち","wottsu":"うぉっつ","wotte":"うぉって","wotto":"うぉっと","woppa":"うぉっぱ","woppi":"うぉっぴ","woppu":"うぉっぷ","woppe":"うぉっぺ","woppo":"うぉっぽ","wokkya":"うぉっきゃ","wokkyu":"うぉっきゅ","wokkyo":"うぉっきょ","wossha":"うぉっしゃ","wosshu":"うぉっしゅ","wosshe":"うぉっしぇ","wossho":"うぉっしょ","wotcha":"うぉっちゃ","wotchu":"うぉっちゅ","wotche":"うぉっちぇ","wotcho":"うぉっちょ","woppya":"うぉっぴゃ","woppyu":"うぉっぴゅ","woppyo":"うぉっぴょ","wocchi":"うぉっち","woccha":"うぉっちゃ","wocchu":"うぉっちゅ","wocche":"うぉっちぇ","woccho":"うぉっちょ","tcha":"っちゃ","tchi":"っち","tchu":"っちゅ","tche":"ッチェ","tcho":"っちょ","tchaa":"っちゃあ","tchii":"っちい","tchuu":"っちゅう","tchee":"ッチェー","tchou":"っちょう","tchoo":"っちょお","tchei":"っちぇい","tchâ":"っちゃあ","tchā":"っちゃあ","tchī":"っちい","tchî":"っちい","tchū":"っちゅう","tchû":"っちゅう","tchê":"ッチェー","tchē":"ッチェー","tchō":"っちょお","tchô":"っちょお"},"additional":{},"endOfWord":{}}
},{}],14:[function(require,module,exports){
module.exports = {"base":{"あ":"អា","い":"អិ","う":"អឹ","え":"អិ","お":"អុ","ああ":"អាអា","いい":"អិអិ","うう":"អឹអឹ","ええ":"អិអិ","おう":"អុអុ","おお":"អុអុ","えい":"អិអិ","か":"កា","き":"កិ","く":"កឹ","け":"កិ","こ":"កុ","きゃ":"ក្យា","きゅ":"ក្សឹ","きょ":"ក្ញុ","かあ":"កាអា","きい":"កិអិ","くう":"កឹអឹ","けえ":"កិអិ","こう":"កុអុ","こお":"កុអុ","きゃあ":"ក្យាអា","きゅう":"ក្សឹអឹ","きょう":"ក្ញុអុ","きょお":"ក្ញុអុ","けい":"កិអិ","が":"ហា","ぎ":"ហិ","ぐ":"ហឹ","げ":"ហិ","ご":"ហុ","ぎゃ":"ហ្យា","ぎゅ":"ហ្សឹ","ぎょ":"ហ្ញុ","があ":"ហាអា","ぎい":"ហិអិ","ぐう":"ហឹអឹ","げえ":"ហិអិ","ごう":"ហុអុ","ごお":"ហុអុ","ぎゃあ":"ហ្យាអា","ぎゅう":"ហ្សឹអឹ","ぎょう":"ហ្ញុអុ","ぎょお":"ហ្ញុអុ","げい":"ហិអិ","さ":"សា","すぃ":"សិ","す":"សឹ","せ":"សិ","そ":"សុ","さあ":"សាអា","すぃい":"សិអិ","すう":"សឹអឹ","せえ":"សិអិ","そう":"សុអុ","そお":"សុអុ","せい":"សិអិ","しゃ":"សា","し":"សិ","しゅ":"សឹ","しぇ":"សិ","しょ":"សុ","しゃあ":"សាអា","しい":"សិអិ","しゅう":"សឹអឹ","しぇえ":"សិអិ","しょう":"សុអុ","しょお":"សុអុ","しぇい":"សិអិ","ざ":"ហ្សា","ずぃ":"ហ្សិ","ず":"ហ្សឹ","ぜ":"ហ្សិ","ぞ":"ហ្សុ","ざあ":"ហ្សាអា","ずぃい":"ហ្សិអិ","ずう":"ហ្សឹអឹ","ぜえ":"ហ្សិអិ","ぞう":"ហ្សុអុ","ぞお":"ហ្សុអុ","ぜい":"ហ្សិអិ","じゃ":"ហ្ចា","じ":"ហ្ចិ","じゅ":"ហ្ចឹ","じぇ":"ហ្ចិ","じょ":"ហ្ចុ","じゃあ":"ហ្ចាអា","じい":"ហ្ចិអិ","じゅう":"ហ្ចឹអឹ","じぇえ":"ហ្ចិអិ","じょう":"ហ្ចុអុ","じょお":"ហ្ចុអុ","じぇい":"ហ្ចិអិ","た":"តា","てぃ":"តិ","とぅ":"តឹ","て":"តិ","と":"តុ","たあ":"តាអា","てぃい":"តិអិ","とぅう":"តឹអឹ","てえ":"តិអិ","とう":"តុអុ","とお":"តុអុ","てい":"តិអិ","ちゃ":"ចា","ち":"ចិ","ちゅ":"ចឹ","ちぇ":"ចិ","ちょ":"ចុ","ちゃあ":"ចាអា","ちい":"ចិអិ","ちゅう":"ចឹអឹ","ちぇえ":"ចិអិ","ちょう":"ចុអុ","ちょお":"ចុអុ","ちぇい":"ចិអិ","つぁ":"ឡា","つぃ":"ឡិ","つ":"ឡឹ","つぇ":"ឡិ","つぉ":"ឡុ","つぁあ":"ឡាអា","つぃい":"ឡិអិ","つう":"ឡឹអឹ","つぇえ":"ឡិអិ","つぉう":"ឡុអុ","つぉお":"ឡុអុ","つぇい":"ឡិអិ","だ":"ដា","でぃ":"ដិ","どぅ":"ដឹ","で":"ដិ","ど":"ដុ","だあ":"ដាអា","でぃい":"ដិអិ","どぅう":"ដឹអឹ","でえ":"ដិអិ","どう":"ដុអុ","どお":"ដុអុ","でい":"ដិអិ","ぢゃ":"ហ្ចា","ぢ":"ហ្ចិ","ぢゅ":"ហ្ចឹ","ぢぇ":"ហ្ចិ","ぢょ":"ហ្ចុ","ぢゃあ":"ហ្ចាអា","ぢい":"ហ្ចិអិ","ぢゅう":"ហ្ចឹអឹ","ぢぇえ":"ហ្ចិអិ","ぢょう":"ហ្ចុអុ","ぢょお":"ហ្ចុអុ","ぢぇい":"ហ្ចិអិ","づ":"ហ្សឹ","づう":"ហ្សឹអឹ","な":"ណា","に":"ណិ","ぬ":"ណឹ","ね":"ណិ","の":"ណុ","にゃ":"ណ្យា","にゅ":"ណ្សឹ","にょ":"ណ្ញុ","なあ":"ណាអា","にい":"ណិអិ","ぬう":"ណឹអឹ","ねえ":"ណិអិ","のう":"ណុអុ","のお":"ណុអុ","にゃあ":"ណ្យាអា","にゅう":"ណ្សឹអឹ","にょう":"ណ្ញុអុ","にょお":"ណ្ញុអុ","ねい":"ណិអិ","は":"ហា","ひ":"ហិ","へ":"ហិ","ほ":"ហុ","ひゃ":"ហ្យា","ひゅ":"ហ្សឹ","ひょ":"ហ្ញុ","はあ":"ហាអា","ひい":"ហិអិ","へえ":"ហិអិ","ほう":"ហុអុ","ほお":"ហុអុ","ひゃあ":"ហ្យាអា","ひゅう":"ហ្សឹអឹ","ひょう":"ហ្ញុអុ","ひょお":"ហ្ញុអុ","へい":"ហិអិ","ふぁ":"ហ្វា","ふぃ":"ហ្វិ","ふ":"ហ្វឹ","ふぇ":"ហ្វិ","ふぉ":"ហ្វុ","ふぁあ":"ហ្វាអា","ふぃい":"ហ្វិអិ","ふう":"ហ្វឹអឹ","ふぇえ":"ហ្វិអិ","ふぉう":"ហ្វុអុ","ふぉお":"ហ្វុអុ","ふぇい":"ហ្វិអិ","ば":"បា","び":"បិ","ぶ":"បឹ","べ":"បិ","ぼ":"បុ","びゃ":"ប្យា","びゅ":"ប្សឹ","びょ":"ប្ញុ","ばあ":"បាអា","びい":"បិអិ","ぶう":"បឹអឹ","べえ":"បិអិ","ぼう":"បុអុ","ぼお":"បុអុ","びゃあ":"ប្យាអា","びゅう":"ប្សឹអឹ","びょう":"ប្ញុអុ","びょお":"ប្ញុអុ","べい":"បិអិ","ぱ":"ផា","ぴ":"ផិ","ぷ":"ផឹ","ぺ":"ផិ","ぽ":"ផុ","ぴゃ":"ផ្យា","ぴゅ":"ផ្សឹ","ぴょ":"ផ្ញុ","ぱあ":"ផាអា","ぴい":"ផិអិ","ぷう":"ផឹអឹ","ぺえ":"ផិអិ","ぽう":"ផុអុ","ぽお":"ផុអុ","ぴゃあ":"ផ្យាអា","ぴゅう":"ផ្សឹអឹ","ぴょう":"ផ្ញុអុ","ぴょお":"ផ្ញុអុ","ぺい":"ផិអិ","ま":"មា","み":"មិ","む":"មឹ","め":"មិ","も":"មុ","みゃ":"ម្យា","みゅ":"ម្សឹ","みょ":"ម្ញុ","まあ":"មាអា","みい":"មិអិ","むう":"មឹអឹ","めえ":"មិអិ","もう":"មុអុ","もお":"មុអុ","みゃあ":"ម្យាអា","みゅう":"ម្សឹអឹ","みょう":"ម្ញុអុ","みょお":"ម្ញុអុ","めい":"មិអិ","や":"យា","ゆ":"យឹ","よ":"យុ","やあ":"យាអា","ゆう":"យឹអឹ","よう":"យុអុ","よお":"យុអុ","ら":"រា","り":"រិ","る":"រឹ","れ":"រិ","ろ":"រុ","りゃ":"រ្យា","りゅ":"រ្សឹ","りょ":"រ្ញុ","らあ":"រាអា","りい":"រិអិ","るう":"រឹអឹ","れえ":"រិអិ","ろう":"រុអុ","ろお":"រុអុ","りゃあ":"រ្យាអា","りゅう":"រ្សឹអឹ","りょう":"រ្ញុអុ","りょお":"រ្ញុអុ","れい":"រិអិ","わ":"វា","うぃ":"វិ","うぇ":"វិ","うぉ":"វុ","わあ":"វាអា","うぃい":"វិអិ","うぇえ":"វិអិ","うぉう":"វុអុ","うぉお":"វុអុ","うぇい":"វិអិ","ん":"ន","を":"អុ","っ":"","んあ":"ន’អា","んい":"ន’អិ","んう":"ន’អឹ","んえ":"ន’អិ","んお":"ន’អុ","んや":"ន’យា","んゆ":"ន’យឹ","んよ":"ន’យុ","んああ":"ន’អាអា","んいい":"ន’អិអិ","んうう":"ន’អឹអឹ","んええ":"ន’អិអិ","んおう":"ន’អុអុ","んおお":"ន’អុអុ","んやあ":"ន’យាអា","んゆう":"ន’យឹអឹ","んよう":"ន’យុអុ","んよお":"ន’យុអុ","んえい":"ន’អិអិ","っか":"កា","っき":"កិ","っく":"កឹ","っけ":"កិ","っこ":"កុ","っきゃ":"ក្យា","っきゅ":"ក្សឹ","っきょ":"ក្ញុ","っかあ":"កាអា","っきい":"កិអិ","っくう":"កឹអឹ","っけえ":"កិអិ","っこう":"កុអុ","っこお":"កុអុ","っきゃあ":"ក្យាអា","っきゅう":"ក្សឹអឹ","っきょう":"ក្ញុអុ","っきょお":"ក្ញុអុ","っけい":"កិអិ","っさ":"សា","っすぃ":"សិ","っす":"សឹ","っせ":"សិ","っそ":"សុ","っさあ":"សាអា","っすぃい":"សិអិ","っすう":"សឹអឹ","っせえ":"សិអិ","っそう":"សុអុ","っそお":"សុអុ","っせい":"សិអិ","っしゃ":"សា","っし":"សិ","っしゅ":"សឹ","っしぇ":"សិ","っしょ":"សុ","っしゃあ":"សាអា","っしい":"សិអិ","っしゅう":"សឹអឹ","っしぇえ":"សិអិ","っしょう":"សុអុ","っしょお":"សុអុ","っしぇい":"សិអិ","った":"តា","ってぃ":"តិ","っとぅ":"តឹ","って":"តិ","っと":"តុ","ったあ":"តាអា","ってぃい":"តិអិ","っとぅう":"តឹអឹ","ってえ":"តិអិ","っとう":"តុអុ","っとお":"តុអុ","ってい":"តិអិ","っちゃ":"ចា","っち":"ចិ","っちゅ":"ចឹ","っちぇ":"ចិ","っちょ":"ចុ","っちゃあ":"ចាអា","っちい":"ចិអិ","っちゅう":"ចឹអឹ","っちぇえ":"ចិអិ","っちょう":"ចុអុ","っちょお":"ចុអុ","っちぇい":"ចិអិ","っつぁ":"ឡា","っつぃ":"ឡិ","っつ":"ឡឹ","っつぇ":"ឡិ","っつぉ":"ឡុ","っつぁあ":"ឡាអា","っつぃい":"ឡិអិ","っつう":"ឡឹអឹ","っつぇえ":"ឡិអិ","っつぉう":"ឡុអុ","っつぉお":"ឡុអុ","っつぇい":"ឡិអិ","っぱ":"ផា","っぴ":"ផិ","っぷ":"ផឹ","っぺ":"ផិ","っぽ":"ផុ","っぴゃ":"ផ្យា","っぴゅ":"ផ្សឹ","っぴょ":"ផ្ញុ","っぱあ":"ផាអា","っぴい":"ផិអិ","っぷう":"ផឹអឹ","っぺえ":"ផិអិ","っぽう":"ផុអុ","っぽお":"ផុអុ","っぴゃあ":"ផ្យាអា","っぴゅう":"ផ្សឹអឹ","っぴょう":"ផ្ញុអុ","っぴょお":"ផ្ញុអុ","っぺい":"ផិអិ","ぁ":"អា","ぃ":"អិ","ぅ":"អឹ","ぇ":"អិ","ぉ":"អុ","ゃ":"យា","ゅ":"យឹ","ょ":"យុ","ぁあ":"អាអា","ぃい":"អិអិ","ぅう":"អឹអឹ","ぇえ":"អិអិ","ぉう":"អុអុ","ぉお":"អុអុ","ゃあ":"យាអា","ゅう":"យឹអឹ","ょう":"យុអុ","ょお":"យុអុ","ぇい":"អិអិ","ゔぁ":"វា","ゔぃ":"វិ","ゔ":"វឹ","ゔぇ":"វិ","ゔぉ":"វុ","ゔぁあ":"វាអា","ゔぃい":"វិអិ","ゔう":"វឹអឹ","ゔぇえ":"វិអិ","ゔぉう":"វុអុ","ゔぉお":"វុអុ","ゔぇい":"វិអិ"},"additional":{},"endOfWord":{}}
},{}],15:[function(require,module,exports){
module.exports = {"base":{"あ":"아","い":"이","う":"우","え":"에","お":"오","ああ":"아아","いい":"이이","うう":"우우","ええ":"에에","おう":"오오","おお":"오오","えい":"에이","か":"카","き":"키","く":"쿠","け":"케","こ":"코","きゃ":"캬","きゅ":"큐","きょ":"쿄","かあ":"카아","きい":"키이","くう":"쿠우","けえ":"케에","こう":"코오","こお":"코오","きゃあ":"캬아","きゅう":"큐우","きょう":"쿄오","きょお":"쿄오","けい":"케이","が":"가","ぎ":"기","ぐ":"구","げ":"게","ご":"고","ぎゃ":"갸","ぎゅ":"규","ぎょ":"교","があ":"가아","ぎい":"기이","ぐう":"구우","げえ":"게에","ごう":"고오","ごお":"고오","ぎゃあ":"갸아","ぎゅう":"규우","ぎょう":"교오","ぎょお":"교오","げい":"게이","さ":"사","すぃ":"쉬","す":"스","せ":"세","そ":"소","さあ":"사아","すぃい":"쉬이","すう":"수우","せえ":"세에","そう":"소오","そお":"소오","せい":"세이","しゃ":"샤","し":"시","しゅ":"슈","しぇ":"셰","しょ":"쇼","しゃあ":"샤아","しい":"시이","しゅう":"슈우","しぇえ":"셰에","しょう":"쇼오","しょお":"쇼오","しぇい":"세이","ざ":"자","ずぃ":"쥐","ず":"즈","ぜ":"제","ぞ":"조","ざあ":"자아","ずぃい":"쥐이","ずう":"주우","ぜえ":"제에","ぞう":"조오","ぞお":"조오","ぜい":"제이","じゃ":"자","じ":"지","じゅ":"주","じぇ":"제","じょ":"조","じゃあ":"자아","じい":"지이","じゅう":"주우","じぇえ":"제에","じょう":"조오","じょお":"조오","じぇい":"제이","た":"타","てぃ":"티","とぅ":"투","て":"테","と":"토","たあ":"타아","てぃい":"티이","とぅう":"투우","てえ":"테에","とう":"토오","とお":"토오","てい":"테이","ちゃ":"차","ち":"치","ちゅ":"추","ちぇ":"체","ちょ":"초","ちゃあ":"차아","ちい":"치이","ちゅう":"추우","ちぇえ":"체에","ちょう":"초오","ちょお":"초오","ちぇい":"체이","つぁ":"촤","つぃ":"취","つ":"츠","つぇ":"췌","つぉ":"춰","つぁあ":"촤아","つぃい":"취이","つう":"츠우","つぇえ":"췌에","つぉう":"춰오","つぉお":"춰오","つぇい":"체이","だ":"다","でぃ":"디","どぅ":"두","で":"데","ど":"도","だあ":"다아","でぃい":"디이","どぅう":"두우","でえ":"데에","どう":"도오","どお":"도오","でい":"데이","ぢゃ":"자","ぢ":"지","ぢゅ":"주","ぢぇ":"제","ぢょ":"조","ぢゃあ":"자아","ぢい":"지이","ぢゅう":"주우","ぢぇえ":"제에","ぢょう":"조오","ぢょお":"조오","ぢぇい":"제이","づ":"즈","づう":"주우","な":"나","に":"니","ぬ":"누","ね":"네","の":"노","にゃ":"냐","にゅ":"뉴","にょ":"뇨","なあ":"나아","にい":"니이","ぬう":"누우","ねえ":"네에","のう":"노오","のお":"노오","にゃあ":"냐아","にゅう":"뉴우","にょう":"뇨오","にょお":"뇨오","ねい":"네이","は":"하","ひ":"히","へ":"헤","ほ":"호","ひゃ":"햐","ひゅ":"휴","ひょ":"효","はあ":"하아","ひい":"히이","へえ":"헤에","ほう":"호오","ほお":"호오","ひゃあ":"햐아","ひゅう":"휴우","ひょう":"효오","ひょお":"효오","へい":"헤이","ふぁ":"화","ふぃ":"휘","ふ":"후","ふぇ":"훼","ふぉ":"훠","ふぁあ":"화아","ふぃい":"휘이","ふう":"후우","ふぇえ":"훼에","ふぉう":"훠오","ふぉお":"훠오","ふぇい":"헤이","ば":"바","び":"비","ぶ":"부","べ":"베","ぼ":"보","びゃ":"뱌","びゅ":"뷰","びょ":"뵤","ばあ":"바아","びい":"비이","ぶう":"부우","べえ":"베에","ぼう":"보오","ぼお":"보오","びゃあ":"뱌아","びゅう":"뷰우","びょう":"뵤오","びょお":"뵤오","べい":"베이","ぱ":"파","ぴ":"피","ぷ":"푸","ぺ":"페","ぽ":"포","ぴゃ":"퍄","ぴゅ":"퓨","ぴょ":"표","ぱあ":"파아","ぴい":"피이","ぷう":"푸우","ぺえ":"페에","ぽう":"포오","ぽお":"포오","ぴゃあ":"퍄아","ぴゅう":"퓨우","ぴょう":"표오","ぴょお":"표오","ぺい":"페이","ま":"마","み":"미","む":"무","め":"메","も":"모","みゃ":"먀","みゅ":"뮤","みょ":"묘","まあ":"마아","みい":"미이","むう":"무우","めえ":"메에","もう":"모오","もお":"모오","みゃあ":"먀아","みゅう":"뮤우","みょう":"묘오","みょお":"묘오","めい":"메이","や":"야","ゆ":"유","よ":"요","やあ":"야아","ゆう":"유우","よう":"요오","よお":"요오","ら":"라","り":"리","る":"루","れ":"레","ろ":"로","りゃ":"랴","りゅ":"류","りょ":"료","らあ":"라아","りい":"리이","るう":"루우","れえ":"레에","ろう":"로오","ろお":"로오","りゃあ":"랴아","りゅう":"류우","りょう":"료오","りょお":"료오","れい":"레이","わ":"와","うぃ":"위","うぇ":"웨","うぉ":"워","わあ":"와아","うぃい":"위이","うぇえ":"웨에","うぉう":"워오","うぉお":"워오","うぇい":"웨이","ん":"ᄂ","を":"오","ぁ":"아","ぃ":"이","ぅ":"우","ぇ":"에","ぉ":"오","ゃ":"야","ゅ":"유","ょ":"요","ぁあ":"아아","ぃい":"이이","ぅう":"우우","ぇえ":"에에","ぉう":"오오","ぉお":"오오","ゃあ":"야아","ゅう":"유우","ょう":"요오","ょお":"요오","ぇい":"에이","ゔぁ":"봐","ゔぃ":"뷔","ゔ":"부","ゔぇ":"붸","ゔぉ":"붜","ゔぁあ":"봐아","ゔぃい":"뷔이","ゔう":"부우","ゔぇえ":"붸에","ゔぉう":"붜오","ゔぉお":"붜오","ゔぇい":"붸이","あっ":"앗","いっ":"잇","うっ":"웃","えっ":"엣","おっ":"옷","ああっ":"아앗","いいっ":"이잇","ううっ":"우웃","ええっ":"에엣","おうっ":"오옷","おおっ":"오옷","えいっ":"에잇","かっ":"캇","きっ":"킷","くっ":"쿳","けっ":"켓","こっ":"콧","きゃっ":"캿","きゅっ":"큣","きょっ":"쿗","かあっ":"카앗","きいっ":"키잇","くうっ":"쿠웃","けえっ":"케엣","こうっ":"코옷","こおっ":"코옷","きゃあっ":"캬앗","きゅうっ":"큐웃","きょうっ":"쿄옷","きょおっ":"쿄옷","けいっ":"케잇","がっ":"갓","ぎっ":"깃","ぐっ":"굿","げっ":"겟","ごっ":"곳","ぎゃっ":"걋","ぎゅっ":"귯","ぎょっ":"굣","があっ":"가앗","ぎいっ":"기잇","ぐうっ":"구웃","げえっ":"게엣","ごうっ":"고옷","ごおっ":"고옷","ぎゃあっ":"갸앗","ぎゅうっ":"규웃","ぎょうっ":"교옷","ぎょおっ":"교옷","げいっ":"게잇","さっ":"삿","すぃっ":"쉿","すっ":"슷","せっ":"셋","そっ":"솟","さあっ":"사앗","すぃいっ":"쉬잇","すうっ":"수웃","せえっ":"세엣","そうっ":"소옷","そおっ":"소옷","せいっ":"세잇","しゃっ":"샷","しっ":"싯","しゅっ":"슛","しぇっ":"솃","しょっ":"숏","しゃあっ":"샤앗","しいっ":"시잇","しゅうっ":"슈웃","しぇえっ":"셰엣","しょうっ":"쇼옷","しょおっ":"쇼옷","しぇいっ":"셰잇","ざっ":"잣","ずぃっ":"쥣","ずっ":"즛","ぜっ":"젯","ぞっ":"좃","ざあっ":"자앗","ずぃいっ":"쥐잇","ずうっ":"주웃","ぜえっ":"제엣","ぞうっ":"조옷","ぞおっ":"조옷","ぜいっ":"제잇","じゃっ":"잣","じっ":"짓","じゅっ":"줏","じぇっ":"젯","じょっ":"좃","じゃあっ":"자앗","じいっ":"지잇","じゅうっ":"주웃","じぇえっ":"제엣","じょうっ":"조옷","じょおっ":"조옷","じぇいっ":"제잇","たっ":"탓","てぃっ":"팃","とぅっ":"툿","てっ":"텟","とっ":"톳","たあっ":"타앗","てぃいっ":"티잇","とぅうっ":"투웃","てえっ":"테엣","とうっ":"토옷","とおっ":"토옷","ていっ":"테잇","ちゃっ":"찻","ちっ":"칫","ちゅっ":"춧","ちぇっ":"쳇","ちょっ":"촛","ちゃあっ":"차앗","ちいっ":"치잇","ちゅうっ":"추웃","ちぇえっ":"체엣","ちょうっ":"초옷","ちょおっ":"초옷","ちぇいっ":"체잇","つぁっ":"촷","つぃっ":"췻","つっ":"츳","つぇっ":"췟","つぉっ":"췃","つぁあっ":"촤앗","つぃいっ":"취잇","つうっ":"츠웃","つぇえっ":"췌엣","つぉうっ":"춰옷","つぉおっ":"춰옷","つぇいっ":"체잇","だっ":"닷","でぃっ":"딧","どぅっ":"둣","でっ":"뎃","どっ":"돗","だあっ":"다앗","でぃいっ":"디잇","どぅうっ":"두웃","でえっ":"데엣","どうっ":"도옷","どおっ":"도옷","でいっ":"데잇","ぢゃっ":"잣","ぢっ":"짓","ぢゅっ":"줏","ぢぇっ":"젯","ぢょっ":"좃","ぢゃあっ":"자앗","ぢいっ":"지잇","ぢゅうっ":"주웃","ぢぇえっ":"제엣","ぢょうっ":"조옷","ぢょおっ":"조옷","ぢぇいっ":"제잇","づっ":"줏","づうっ":"주웃","なっ":"낫","にっ":"닛","ぬっ":"눗","ねっ":"넷","のっ":"놋","にゃっ":"냣","にゅっ":"늇","にょっ":"뇻","なあっ":"나앗","にいっ":"니잇","ぬうっ":"누웃","ねえっ":"네엣","のうっ":"노옷","のおっ":"노옷","にゃあっ":"냐앗","にゅうっ":"뉴웃","にょうっ":"뇨옷","にょおっ":"뇨옷","ねいっ":"네잇","はっ":"핫","ひっ":"힛","へっ":"헷","ほっ":"홋","ひゃっ":"햣","ひゅっ":"흇","ひょっ":"횻","はあっ":"하앗","ひいっ":"히잇","へえっ":"헤엣","ほうっ":"호옷","ほおっ":"호옷","ひゃあっ":"햐앗","ひゅうっ":"휴웃","ひょうっ":"효옷","ひょおっ":"효옷","へいっ":"헤잇","ふぁっ":"홧","ふぃっ":"휫","ふっ":"훗","ふぇっ":"휏","ふぉっ":"훳","ふぁあっ":"화앗","ふぃいっ":"휘잇","ふうっ":"후웃","ふぇえっ":"훼엣","ふぉうっ":"훠옷","ふぉおっ":"훠옷","ふぇいっ":"훼잇","ばっ":"밧","びっ":"빗","ぶっ":"붓","べっ":"벳","ぼっ":"봇","びゃっ":"뱟","びゅっ":"븃","びょっ":"뵷","ばあっ":"바앗","びいっ":"비잇","ぶうっ":"부웃","べえっ":"베엣","ぼうっ":"보옷","ぼおっ":"보옷","びゃあっ":"뱌앗","びゅうっ":"뷰웃","びょうっ":"뵤옷","びょおっ":"뵤옷","べいっ":"베잇","ぱっ":"팟","ぴっ":"핏","ぷっ":"풋","ぺっ":"펫","ぽっ":"폿","ぴゃっ":"퍗","ぴゅっ":"퓻","ぴょっ":"푯","ぱあっ":"파앗","ぴいっ":"피잇","ぷうっ":"푸웃","ぺえっ":"페엣","ぽうっ":"포옷","ぽおっ":"포옷","ぴゃあっ":"퍄앗","ぴゅうっ":"퓨웃","ぴょうっ":"표옷","ぴょおっ":"표옷","ぺいっ":"페잇","まっ":"맛","みっ":"밋","むっ":"뭇","めっ":"멧","もっ":"못","みゃっ":"먓","みゅっ":"뮷","みょっ":"묫","まあっ":"마앗","みいっ":"미잇","むうっ":"무웃","めえっ":"메엣","もうっ":"모옷","もおっ":"모옷","みゃあっ":"먀앗","みゅうっ":"뮤웃","みょうっ":"묘옷","みょおっ":"묘옷","めいっ":"메잇","やっ":"얏","ゆっ":"윳","よっ":"욧","やあっ":"야앗","ゆうっ":"유웃","ようっ":"요옷","よおっ":"요옷","らっ":"랏","りっ":"릿","るっ":"룻","れっ":"렛","ろっ":"롯","りゃっ":"럇","りゅっ":"륫","りょっ":"룟","らあっ":"라앗","りいっ":"리잇","るうっ":"루웃","れえっ":"레엣","ろうっ":"로옷","ろおっ":"로옷","りゃあっ":"랴앗","りゅうっ":"류웃","りょうっ":"료옷","りょおっ":"료옷","れいっ":"레잇","わっ":"왓","うぃっ":"윗","うぇっ":"웻","うぉっ":"웟","わあっ":"와앗","うぃいっ":"위잇","うぇえっ":"웨엣","うぉうっ":"워옷","うぉおっ":"워옷","うぇいっ":"웨잇","んっ":"","をっ":"옷","ぁっ":"앗","ぃっ":"잇","ぅっ":"웃","ぇっ":"엣","ぉっ":"옷","ゃっ":"얏","ゅっ":"윳","ょっ":"욧","ぁあっ":"아앗","ぃいっ":"이잇","ぅうっ":"우웃","ぇえっ":"에엣","ぉうっ":"오옷","ぉおっ":"오옷","ゃあっ":"야앗","ゅうっ":"유웃","ょうっ":"요옷","ょおっ":"요옷","ぇいっ":"에잇","ゔぁっ":"봣","ゔぃっ":"뷧","ゔっ":"붓","ゔぇっ":"뷋","ゔぉっ":"붯","ゔぁあっ":"봐앗","ゔぃいっ":"뷔잇","ゔうっ":"부웃","ゔぇえっ":"붸엣","ゔぉうっ":"붜옷","ゔぉおっ":"붜옷","ゔぇいっ":"붸잇","あん":"안","いん":"인","うん":"운","えん":"엔","おん":"온","ああん":"아안","いいん":"이인","ううん":"우운","ええん":"에엔","おうん":"오운","おおん":"오온","えいん":"에인","かん":"칸","きん":"킨","くん":"쿤","けん":"켄","こん":"콘","きゃん":"캰","きゅん":"큔","きょん":"쿈","かあん":"카안","きいん":"키인","くうん":"쿠운","けえん":"케엔","こうん":"코운","こおん":"코온","きゃあん":"캬안","きゅうん":"큐운","きょうん":"쿄운","きょおん":"쿄온","けいん":"케인","がん":"간","ぎん":"긴","ぐん":"군","げん":"겐","ごん":"곤","ぎゃん":"갼","ぎゅん":"균","ぎょん":"굔","があん":"가안","ぎいん":"기인","ぐうん":"구운","げえん":"게엔","ごうん":"고운","ごおん":"고온","ぎゃあん":"갸안","ぎゅうん":"규운","ぎょうん":"교운","ぎょおん":"교온","げいん":"게인","さん":"산","すぃん":"쉰","すん":"슨","せん":"센","そん":"손","さあん":"사안","すぃいん":"쉬인","すうん":"수운","せえん":"세엔","そうん":"소운","そおん":"소온","せいん":"세인","しゃん":"샨","しん":"신","しゅん":"슌","しぇん":"셴","しょん":"숀","しゃあん":"샤안","しいん":"시인","しゅうん":"슈운","しぇえん":"셰엔","しょうん":"쇼온","しょおん":"소온","しぇいん":"셰인","ざん":"잔","ずぃん":"쥔","ずん":"즌","ぜん":"젠","ぞん":"존","ざあん":"자안","ずぃいん":"쥐인","ずうん":"주운","ぜえん":"제엔","ぞうん":"조운","ぞおん":"조온","ぜいん":"제인","じゃん":"잔","じん":"진","じゅん":"준","じぇん":"젠","じょん":"존","じゃあん":"자안","じいん":"지인","じゅうん":"주운","じぇえん":"제엔","じょうん":"조운","じょおん":"조온","じぇいん":"제인","たん":"탄","てぃん":"틴","とぅん":"툰","てん":"텐","とん":"톤","たあん":"타안","てぃいん":"티인","とぅうん":"투운","てえん":"테엔","とうん":"토운","とおん":"토온","ていん":"테인","ちゃん":"찬","ちん":"친","ちゅん":"춘","ちぇん":"첸","ちょん":"촌","ちゃあん":"차안","ちいん":"치인","ちゅうん":"추운","ちぇえん":"체엔","ちょうん":"초운","ちょおん":"초온","ちぇいん":"체인","つぁん":"촨","つぃん":"췬","つん":"츤","つぇん":"췐","つぉん":"춴","つぁあん":"촤안","つぃいん":"취인","つうん":"츠운","つぇえん":"췌엔","つぉうん":"춰온","つぉおん":"초온","つぇいん":"체인","だん":"단","でぃん":"딘","どぅん":"둔","でん":"덴","どん":"돈","だあん":"다안","でぃいん":"디인","どぅうん":"두운","でえん":"데엔","どうん":"도운","どおん":"도온","でいん":"데인","ぢゃん":"잔","ぢん":"진","ぢゅん":"준","ぢぇん":"젠","ぢょん":"존","ぢゃあん":"자안","ぢいん":"지인","ぢゅうん":"주운","ぢぇえん":"제엔","ぢょうん":"조운","ぢょおん":"조온","ぢぇいん":"제인","づん":"준","づうん":"주운","なん":"난","にん":"닌","ぬん":"눈","ねん":"넨","のん":"논","にゃん":"냔","にゅん":"뉸","にょん":"뇬","なあん":"나안","にいん":"니인","ぬうん":"누운","ねえん":"네엔","のうん":"노운","のおん":"노온","にゃあん":"냐안","にゅうん":"뉴운","にょうん":"뇨운","にょおん":"뇨온","ねいん":"네인","はん":"한","ひん":"힌","へん":"헨","ほん":"혼","ひゃん":"햔","ひゅん":"휸","ひょん":"횬","はあん":"하안","ひいん":"히인","へえん":"헤엔","ほうん":"호운","ほおん":"호온","ひゃあん":"햐안","ひゅうん":"휴운","ひょうん":"효운","ひょおん":"효온","へいん":"헤인","ふぁん":"환","ふぃん":"휜","ふん":"훈","ふぇん":"휀","ふぉん":"훤","ふぁあん":"화안","ふぃいん":"휘인","ふうん":"후운","ふぇえん":"훼엔","ふぉうん":"훠운","ふぉおん":"호온","ふぇいん":"훼인","ばん":"반","びん":"빈","ぶん":"분","べん":"벤","ぼん":"본","びゃん":"뱐","びゅん":"뷴","びょん":"뵨","ばあん":"바안","びいん":"비인","ぶうん":"부운","べえん":"베엔","ぼうん":"보운","ぼおん":"보온","びゃあん":"뱌안","びゅうん":"뷰운","びょうん":"뵤운","びょおん":"뵤온","べいん":"베인","ぱん":"판","ぴん":"핀","ぷん":"푼","ぺん":"펜","ぽん":"폰","ぴゃん":"퍈","ぴゅん":"퓬","ぴょん":"푠","ぱあん":"파안","ぴいん":"피인","ぷうん":"푸운","ぺえん":"페엔","ぽうん":"포운","ぽおん":"포온","ぴゃあん":"퍄안","ぴゅうん":"퓨운","ぴょうん":"표운","ぴょおん":"표온","ぺいん":"페인","まん":"만","みん":"민","むん":"문","めん":"멘","もん":"몬","みゃん":"먄","みゅん":"뮨","みょん":"묜","まあん":"마안","みいん":"미인","むうん":"무운","めえん":"메엔","もうん":"모운","もおん":"모온","みゃあん":"먀안","みゅうん":"뮤운","みょうん":"묘운","みょおん":"묘온","めいん":"메인","やん":"얀","ゆん":"윤","よん":"욘","やあん":"야안","ゆうん":"유운","ようん":"요운","よおん":"오온","らん":"란","りん":"린","るん":"룬","れん":"렌","ろん":"론","りゃん":"랸","りゅん":"륜","りょん":"룐","らあん":"라안","りいん":"리인","るうん":"루운","れえん":"레엔","ろうん":"로운","ろおん":"로온","りゃあん":"랴안","りゅうん":"류운","りょうん":"료운","りょおん":"료온","れいん":"레인","わん":"완","うぃん":"윈","うぇん":"웬","うぉん":"원","わあん":"와안","うぃいん":"위인","うぇえん":"웨엔","うぉうん":"워운","うぉおん":"오온","うぇいん":"웨인","をん":"온","ぁん":"안","ぃん":"인","ぅん":"운","ぇん":"엔","ぉん":"온","ゃん":"얀","ゅん":"윤","ょん":"욘","ぁあん":"아안","ぃいん":"이인","ぅうん":"우운","ぇえん":"에엔","ぉうん":"오운","ぉおん":"오온","ゃあん":"야안","ゅうん":"유운","ょうん":"요운","ょおん":"요운","ぇいん":"에인","ゔぁん":"봔","ゔぃん":"뷘","ゔん":"분","ゔぇん":"붼","ゔぉん":"붠","ゔぁあん":"봐안","ゔぃいん":"뷔인","ゔうん":"부운","ゔぇえん":"붸엔","ゔぉうん":"붜운","ゔぉおん":"붜운","ゔぇいん":"붸인"},"additional":{"あ":"아","い":"이","う":"우","え":"에","お":"오","ああ":"아아","いい":"이이","うう":"우우","ええ":"에에","おう":"오오","おお":"오오","えい":"에이","か":"카","き":"키","く":"쿠","け":"케","こ":"코","きゃ":"캬","きゅ":"큐","きょ":"쿄","かあ":"카아","きい":"키이","くう":"쿠우","けえ":"케에","こう":"코오","こお":"코오","きゃあ":"캬아","きゅう":"큐우","きょう":"쿄오","きょお":"쿄오","けい":"케이","が":"가","ぎ":"기","ぐ":"구","げ":"게","ご":"고","ぎゃ":"갸","ぎゅ":"규","ぎょ":"교","があ":"가아","ぎい":"기이","ぐう":"구우","げえ":"게에","ごう":"고오","ごお":"고오","ぎゃあ":"갸아","ぎゅう":"규우","ぎょう":"교오","ぎょお":"교오","げい":"게이","さ":"사","すぃ":"쉬","す":"스","せ":"세","そ":"소","さあ":"사아","すぃい":"쉬이","すう":"수우","せえ":"세에","そう":"소오","そお":"소오","せい":"세이","しゃ":"샤","し":"시","しゅ":"슈","しぇ":"셰","しょ":"쇼","しゃあ":"샤아","しい":"시이","しゅう":"슈우","しぇえ":"셰에","しょう":"쇼오","しょお":"쇼오","しぇい":"세이","ざ":"자","ずぃ":"쥐","ず":"즈","ぜ":"제","ぞ":"조","ざあ":"자아","ずぃい":"쥐이","ずう":"주우","ぜえ":"제에","ぞう":"조오","ぞお":"조오","ぜい":"제이","じゃ":"자","じ":"지","じゅ":"주","じぇ":"제","じょ":"조","じゃあ":"자아","じい":"지이","じゅう":"주우","じぇえ":"제에","じょう":"조오","じょお":"조오","じぇい":"제이","た":"타","てぃ":"티","とぅ":"투","て":"테","と":"토","たあ":"타아","てぃい":"티이","とぅう":"투우","てえ":"테에","とう":"토오","とお":"토오","てい":"테이","ちゃ":"차","ち":"치","ちゅ":"추","ちぇ":"체","ちょ":"초","ちゃあ":"차아","ちい":"치이","ちゅう":"추우","ちぇえ":"체에","ちょう":"초오","ちょお":"초오","ちぇい":"체이","つぁ":"촤","つぃ":"취","つ":"츠","つぇ":"췌","つぉ":"춰","つぁあ":"촤아","つぃい":"취이","つう":"츠우","つぇえ":"췌에","つぉう":"춰오","つぉお":"춰오","つぇい":"체이","だ":"다","でぃ":"디","どぅ":"두","で":"데","ど":"도","だあ":"다아","でぃい":"디이","どぅう":"두우","でえ":"데에","どう":"도오","どお":"도오","でい":"데이","ぢゃ":"자","ぢ":"지","ぢゅ":"주","ぢぇ":"제","ぢょ":"조","ぢゃあ":"자아","ぢい":"지이","ぢゅう":"주우","ぢぇえ":"제에","ぢょう":"조오","ぢょお":"조오","ぢぇい":"제이","づ":"즈","づう":"주우","な":"나","に":"니","ぬ":"누","ね":"네","の":"노","にゃ":"냐","にゅ":"뉴","にょ":"뇨","なあ":"나아","にい":"니이","ぬう":"누우","ねえ":"네에","のう":"노오","のお":"노오","にゃあ":"냐아","にゅう":"뉴우","にょう":"뇨오","にょお":"뇨오","ねい":"네이","は":"하","ひ":"히","へ":"헤","ほ":"호","ひゃ":"햐","ひゅ":"휴","ひょ":"효","はあ":"하아","ひい":"히이","へえ":"헤에","ほう":"호오","ほお":"호오","ひゃあ":"햐아","ひゅう":"휴우","ひょう":"효오","ひょお":"효오","へい":"헤이","ふぁ":"화","ふぃ":"휘","ふ":"후","ふぇ":"훼","ふぉ":"훠","ふぁあ":"화아","ふぃい":"휘이","ふう":"후우","ふぇえ":"훼에","ふぉう":"훠오","ふぉお":"훠오","ふぇい":"헤이","ば":"바","び":"비","ぶ":"부","べ":"베","ぼ":"보","びゃ":"뱌","びゅ":"뷰","びょ":"뵤","ばあ":"바아","びい":"비이","ぶう":"부우","べえ":"베에","ぼう":"보오","ぼお":"보오","びゃあ":"뱌아","びゅう":"뷰우","びょう":"뵤오","びょお":"뵤오","べい":"베이","ぱ":"파","ぴ":"피","ぷ":"푸","ぺ":"페","ぽ":"포","ぴゃ":"퍄","ぴゅ":"퓨","ぴょ":"표","ぱあ":"파아","ぴい":"피이","ぷう":"푸우","ぺえ":"페에","ぽう":"포오","ぽお":"포오","ぴゃあ":"퍄아","ぴゅう":"퓨우","ぴょう":"표오","ぴょお":"표오","ぺい":"페이","ま":"마","み":"미","む":"무","め":"메","も":"모","みゃ":"먀","みゅ":"뮤","みょ":"묘","まあ":"마아","みい":"미이","むう":"무우","めえ":"메에","もう":"모오","もお":"모오","みゃあ":"먀아","みゅう":"뮤우","みょう":"묘오","みょお":"묘오","めい":"메이","や":"야","ゆ":"유","よ":"요","やあ":"야아","ゆう":"유우","よう":"요오","よお":"요오","ら":"라","り":"리","る":"루","れ":"레","ろ":"로","りゃ":"랴","りゅ":"류","りょ":"료","らあ":"라아","りい":"리이","るう":"루우","れえ":"레에","ろう":"로오","ろお":"로오","りゃあ":"랴아","りゅう":"류우","りょう":"료오","りょお":"료오","れい":"레이","わ":"와","うぃ":"위","うぇ":"웨","うぉ":"워","わあ":"와아","うぃい":"위이","うぇえ":"웨에","うぉう":"워오","うぉお":"워오","うぇい":"웨이","ん":"ᄂ","を":"오","ぁ":"아","ぃ":"이","ぅ":"우","ぇ":"에","ぉ":"오","ゃ":"야","ゅ":"유","ょ":"요","ぁあ":"아아","ぃい":"이이","ぅう":"우우","ぇえ":"에에","ぉう":"오오","ぉお":"오오","ゃあ":"야아","ゅう":"유우","ょう":"요오","ょお":"요오","ぇい":"에이","ゔぁ":"봐","ゔぃ":"뷔","ゔ":"부","ゔぇ":"붸","ゔぉ":"붜","ゔぁあ":"봐아","ゔぃい":"뷔이","ゔう":"부우","ゔぇえ":"붸에","ゔぉう":"붜오","ゔぉお":"붜오","ゔぇい":"붸이","あっ":"앗","いっ":"잇","うっ":"웃","えっ":"엣","おっ":"옷","ああっ":"아앗","いいっ":"이잇","ううっ":"우웃","ええっ":"에엣","おうっ":"오옷","おおっ":"오옷","えいっ":"에잇","かっ":"캇","きっ":"킷","くっ":"쿳","けっ":"켓","こっ":"콧","きゃっ":"캿","きゅっ":"큣","きょっ":"쿗","かあっ":"카앗","きいっ":"키잇","くうっ":"쿠웃","けえっ":"케엣","こうっ":"코옷","こおっ":"코옷","きゃあっ":"캬앗","きゅうっ":"큐웃","きょうっ":"쿄옷","きょおっ":"쿄옷","けいっ":"케잇","がっ":"갓","ぎっ":"깃","ぐっ":"굿","げっ":"겟","ごっ":"곳","ぎゃっ":"걋","ぎゅっ":"귯","ぎょっ":"굣","があっ":"가앗","ぎいっ":"기잇","ぐうっ":"구웃","げえっ":"게엣","ごうっ":"고옷","ごおっ":"고옷","ぎゃあっ":"갸앗","ぎゅうっ":"규웃","ぎょうっ":"교옷","ぎょおっ":"교옷","げいっ":"게잇","さっ":"삿","すぃっ":"쉿","すっ":"슷","せっ":"셋","そっ":"솟","さあっ":"사앗","すぃいっ":"쉬잇","すうっ":"수웃","せえっ":"세엣","そうっ":"소옷","そおっ":"소옷","せいっ":"세잇","しゃっ":"샷","しっ":"싯","しゅっ":"슛","しぇっ":"솃","しょっ":"숏","しゃあっ":"샤앗","しいっ":"시잇","しゅうっ":"슈웃","しぇえっ":"셰엣","しょうっ":"쇼옷","しょおっ":"쇼옷","しぇいっ":"셰잇","ざっ":"잣","ずぃっ":"쥣","ずっ":"즛","ぜっ":"젯","ぞっ":"좃","ざあっ":"자앗","ずぃいっ":"쥐잇","ずうっ":"주웃","ぜえっ":"제엣","ぞうっ":"조옷","ぞおっ":"조옷","ぜいっ":"제잇","じゃっ":"잣","じっ":"짓","じゅっ":"줏","じぇっ":"젯","じょっ":"좃","じゃあっ":"자앗","じいっ":"지잇","じゅうっ":"주웃","じぇえっ":"제엣","じょうっ":"조옷","じょおっ":"조옷","じぇいっ":"제잇","たっ":"탓","てぃっ":"팃","とぅっ":"툿","てっ":"텟","とっ":"톳","たあっ":"타앗","てぃいっ":"티잇","とぅうっ":"투웃","てえっ":"테엣","とうっ":"토옷","とおっ":"토옷","ていっ":"테잇","ちゃっ":"찻","ちっ":"칫","ちゅっ":"춧","ちぇっ":"쳇","ちょっ":"촛","ちゃあっ":"차앗","ちいっ":"치잇","ちゅうっ":"추웃","ちぇえっ":"체엣","ちょうっ":"초옷","ちょおっ":"초옷","ちぇいっ":"체잇","つぁっ":"촷","つぃっ":"췻","つっ":"츳","つぇっ":"췟","つぉっ":"췃","つぁあっ":"촤앗","つぃいっ":"취잇","つうっ":"츠웃","つぇえっ":"췌엣","つぉうっ":"춰옷","つぉおっ":"춰옷","つぇいっ":"체잇","だっ":"닷","でぃっ":"딧","どぅっ":"둣","でっ":"뎃","どっ":"돗","だあっ":"다앗","でぃいっ":"디잇","どぅうっ":"두웃","でえっ":"데엣","どうっ":"도옷","どおっ":"도옷","でいっ":"데잇","ぢゃっ":"잣","ぢっ":"짓","ぢゅっ":"줏","ぢぇっ":"젯","ぢょっ":"좃","ぢゃあっ":"자앗","ぢいっ":"지잇","ぢゅうっ":"주웃","ぢぇえっ":"제엣","ぢょうっ":"조옷","ぢょおっ":"조옷","ぢぇいっ":"제잇","づっ":"줏","づうっ":"주웃","なっ":"낫","にっ":"닛","ぬっ":"눗","ねっ":"넷","のっ":"놋","にゃっ":"냣","にゅっ":"늇","にょっ":"뇻","なあっ":"나앗","にいっ":"니잇","ぬうっ":"누웃","ねえっ":"네엣","のうっ":"노옷","のおっ":"노옷","にゃあっ":"냐앗","にゅうっ":"뉴웃","にょうっ":"뇨옷","にょおっ":"뇨옷","ねいっ":"네잇","はっ":"핫","ひっ":"힛","へっ":"헷","ほっ":"홋","ひゃっ":"햣","ひゅっ":"흇","ひょっ":"횻","はあっ":"하앗","ひいっ":"히잇","へえっ":"헤엣","ほうっ":"호옷","ほおっ":"호옷","ひゃあっ":"햐앗","ひゅうっ":"휴웃","ひょうっ":"효옷","ひょおっ":"효옷","へいっ":"헤잇","ふぁっ":"홧","ふぃっ":"휫","ふっ":"훗","ふぇっ":"휏","ふぉっ":"훳","ふぁあっ":"화앗","ふぃいっ":"휘잇","ふうっ":"후웃","ふぇえっ":"훼엣","ふぉうっ":"훠옷","ふぉおっ":"훠옷","ふぇいっ":"훼잇","ばっ":"밧","びっ":"빗","ぶっ":"붓","べっ":"벳","ぼっ":"봇","びゃっ":"뱟","びゅっ":"븃","びょっ":"뵷","ばあっ":"바앗","びいっ":"비잇","ぶうっ":"부웃","べえっ":"베엣","ぼうっ":"보옷","ぼおっ":"보옷","びゃあっ":"뱌앗","びゅうっ":"뷰웃","びょうっ":"뵤옷","びょおっ":"뵤옷","べいっ":"베잇","ぱっ":"팟","ぴっ":"핏","ぷっ":"풋","ぺっ":"펫","ぽっ":"폿","ぴゃっ":"퍗","ぴゅっ":"퓻","ぴょっ":"푯","ぱあっ":"파앗","ぴいっ":"피잇","ぷうっ":"푸웃","ぺえっ":"페엣","ぽうっ":"포옷","ぽおっ":"포옷","ぴゃあっ":"퍄앗","ぴゅうっ":"퓨웃","ぴょうっ":"표옷","ぴょおっ":"표옷","ぺいっ":"페잇","まっ":"맛","みっ":"밋","むっ":"뭇","めっ":"멧","もっ":"못","みゃっ":"먓","みゅっ":"뮷","みょっ":"묫","まあっ":"마앗","みいっ":"미잇","むうっ":"무웃","めえっ":"메엣","もうっ":"모옷","もおっ":"모옷","みゃあっ":"먀앗","みゅうっ":"뮤웃","みょうっ":"묘옷","みょおっ":"묘옷","めいっ":"메잇","やっ":"얏","ゆっ":"윳","よっ":"욧","やあっ":"야앗","ゆうっ":"유웃","ようっ":"요옷","よおっ":"요옷","らっ":"랏","りっ":"릿","るっ":"룻","れっ":"렛","ろっ":"롯","りゃっ":"럇","りゅっ":"륫","りょっ":"룟","らあっ":"라앗","りいっ":"리잇","るうっ":"루웃","れえっ":"레엣","ろうっ":"로옷","ろおっ":"로옷","りゃあっ":"랴앗","りゅうっ":"류웃","りょうっ":"료옷","りょおっ":"료옷","れいっ":"레잇","わっ":"왓","うぃっ":"윗","うぇっ":"웻","うぉっ":"웟","わあっ":"와앗","うぃいっ":"위잇","うぇえっ":"웨엣","うぉうっ":"워옷","うぉおっ":"워옷","うぇいっ":"웨잇","んっ":"","をっ":"옷","ぁっ":"앗","ぃっ":"잇","ぅっ":"웃","ぇっ":"엣","ぉっ":"옷","ゃっ":"얏","ゅっ":"윳","ょっ":"욧","ぁあっ":"아앗","ぃいっ":"이잇","ぅうっ":"우웃","ぇえっ":"에엣","ぉうっ":"오옷","ぉおっ":"오옷","ゃあっ":"야앗","ゅうっ":"유웃","ょうっ":"요옷","ょおっ":"요옷","ぇいっ":"에잇","ゔぁっ":"봣","ゔぃっ":"뷧","ゔっ":"붓","ゔぇっ":"뷋","ゔぉっ":"붯","ゔぁあっ":"봐앗","ゔぃいっ":"뷔잇","ゔうっ":"부웃","ゔぇえっ":"붸엣","ゔぉうっ":"붜옷","ゔぉおっ":"붜옷","ゔぇいっ":"붸잇","あん":"앙","いん":"잉","うん":"웅","えん":"엥","おん":"옹","ああん":"아앙","いいん":"이잉","ううん":"우웅","ええん":"에엥","おうん":"오웅","おおん":"오옹","えいん":"에잉","かん":"캉","きん":"킹","くん":"쿵","けん":"켕","こん":"콩","きゃん":"컁","きゅん":"큥","きょん":"쿙","かあん":"카앙","きいん":"키잉","くうん":"쿠웅","けえん":"케엥","こうん":"코웅","こおん":"코옹","きゃあん":"캬앙","きゅうん":"큐웅","きょうん":"쿄웅","きょおん":"쿄옹","けいん":"케잉","がん":"강","ぎん":"깅","ぐん":"궁","げん":"겡","ごん":"공","ぎゃん":"걍","ぎゅん":"귱","ぎょん":"굥","があん":"가앙","ぎいん":"기잉","ぐうん":"구웅","げえん":"게엥","ごうん":"고웅","ごおん":"고옹","ぎゃあん":"갸앙","ぎゅうん":"규웅","ぎょうん":"교웅","ぎょおん":"교옹","げいん":"게잉","さん":"상","すぃん":"슁","すん":"승","せん":"셍","そん":"송","さあん":"사앙","すぃいん":"쉬잉","すうん":"수웅","せえん":"세엥","そうん":"소웅","そおん":"소옹","せいん":"세잉","しゃん":"샹","しん":"싱","しゅん":"슝","しぇん":"솅","しょん":"숑","しゃあん":"샤앙","しいん":"시잉","しゅうん":"슈웅","しぇえん":"셰엥","しょうん":"쇼웅","しょおん":"쇼웅","しぇいん":"셰잉","ざん":"장","ずぃん":"쥥","ずん":"증","ぜん":"젱","ぞん":"종","ざあん":"자앙","ずぃいん":"쥐잉","ずうん":"주웅","ぜえん":"제엥","ぞうん":"조웅","ぞおん":"조옹","ぜいん":"제잉","じゃん":"장","じん":"징","じゅん":"중","じぇん":"젱","じょん":"종","じゃあん":"자앙","じいん":"지잉","じゅうん":"주웅","じぇえん":"제엥","じょうん":"조웅","じょおん":"조옹","じぇいん":"제잉","たん":"탕","てぃん":"팅","とぅん":"퉁","てん":"텡","とん":"통","たあん":"타앙","てぃいん":"티잉","とぅうん":"투웅","てえん":"테엥","とうん":"토웅","とおん":"토옹","ていん":"테잉","ちゃん":"창","ちん":"칭","ちゅん":"충","ちぇん":"쳉","ちょん":"총","ちゃあん":"차앙","ちいん":"치잉","ちゅうん":"추웅","ちぇえん":"체엥","ちょうん":"초웅","ちょおん":"초옹","ちぇいん":"체잉","つぁん":"촹","つぃん":"췽","つん":"층","つぇん":"췡","つぉん":"췅","つぁあん":"촤앙","つぃいん":"취잉","つうん":"츠웅","つぇえん":"췌엥","つぉうん":"춰웅","つぉおん":"춰웅","つぇいん":"체잉","だん":"당","でぃん":"딩","どぅん":"둥","でん":"뎅","どん":"동","だあん":"다앙","でぃいん":"디잉","どぅうん":"두웅","でえん":"데엥","どうん":"도웅","どおん":"도옹","でいん":"데잉","ぢゃん":"장","ぢん":"징","ぢゅん":"중","ぢぇん":"젱","ぢょん":"종","ぢゃあん":"자앙","ぢいん":"지잉","ぢゅうん":"주웅","ぢぇえん":"제엥","ぢょうん":"조웅","ぢょおん":"조옹","ぢぇいん":"제잉","づん":"중","づうん":"주웅","なん":"낭","にん":"닝","ぬん":"눙","ねん":"넹","のん":"농","にゃん":"냥","にゅん":"늉","にょん":"뇽","なあん":"나앙","にいん":"니잉","ぬうん":"누웅","ねえん":"네엥","のうん":"노웅","のおん":"노옹","にゃあん":"냐앙","にゅうん":"뉴웅","にょうん":"뇨웅","にょおん":"뇨옹","ねいん":"네잉","はん":"항","ひん":"힝","へん":"헹","ほん":"홍","ひゃん":"향","ひゅん":"흉","ひょん":"횽","はあん":"하앙","ひいん":"히잉","へえん":"헤엥","ほうん":"호웅","ほおん":"호옹","ひゃあん":"햐앙","ひゅうん":"휴웅","ひょうん":"효웅","ひょおん":"효옹","へいん":"헤잉","ふぁん":"황","ふぃん":"휭","ふん":"훙","ふぇん":"휑","ふぉん":"훵","ふぁあん":"화앙","ふぃいん":"휘잉","ふうん":"후웅","ふぇえん":"훼엥","ふぉうん":"훠웅","ふぉおん":"훠웅","ふぇいん":"훼잉","ばん":"방","びん":"빙","ぶん":"붕","べん":"벵","ぼん":"봉","びゃん":"뱡","びゅん":"븅","びょん":"뵹","ばあん":"바앙","びいん":"비잉","ぶうん":"부웅","べえん":"베엥","ぼうん":"보웅","ぼおん":"보옹","びゃあん":"뱌앙","びゅうん":"뷰웅","びょうん":"뵤웅","びょおん":"뵤옹","べいん":"베잉","ぱん":"팡","ぴん":"핑","ぷん":"풍","ぺん":"펭","ぽん":"퐁","ぴゃん":"퍙","ぴゅん":"퓽","ぴょん":"푱","ぱあん":"파앙","ぴいん":"피잉","ぷうん":"푸웅","ぺえん":"페엥","ぽうん":"포웅","ぽおん":"포옹","ぴゃあん":"퍄앙","ぴゅうん":"퓨웅","ぴょうん":"표웅","ぴょおん":"표옹","ぺいん":"페잉","まん":"망","みん":"밍","むん":"뭉","めん":"멩","もん":"몽","みゃん":"먕","みゅん":"뮹","みょん":"묭","まあん":"마앙","みいん":"미잉","むうん":"무웅","めえん":"메엥","もうん":"모웅","もおん":"모옹","みゃあん":"먀앙","みゅうん":"뮤웅","みょうん":"묘웅","みょおん":"묘옹","めいん":"메잉","やん":"양","ゆん":"융","よん":"용","やあん":"야앙","ゆうん":"유웅","ようん":"요웅","よおん":"요웅","らん":"랑","りん":"링","るん":"룽","れん":"렝","ろん":"롱","りゃん":"량","りゅん":"륭","りょん":"룡","らあん":"라앙","りいん":"리잉","るうん":"루웅","れえん":"레엥","ろうん":"로웅","ろおん":"로옹","りゃあん":"랴앙","りゅうん":"류웅","りょうん":"료웅","りょおん":"료옹","れいん":"레잉","わん":"왕","うぃん":"윙","うぇん":"웽","うぉん":"웡","わあん":"와앙","うぃいん":"위잉","うぇえん":"웨엥","うぉうん":"워웅","うぉおん":"워웅","うぇいん":"웨잉","をん":"옹","ぁん":"앙","ぃん":"잉","ぅん":"웅","ぇん":"엥","ぉん":"옹","ゃん":"양","ゅん":"융","ょん":"용","ぁあん":"아앙","ぃいん":"이잉","ぅうん":"우웅","ぇえん":"에엥","ぉうん":"오웅","ぉおん":"오옹","ゃあん":"야앙","ゅうん":"유웅","ょうん":"요옹","ょおん":"요옹","ぇいん":"에잉","ゔぁん":"봥","ゔぃん":"뷩","ゔん":"붕","ゔぇん":"뷍","ゔぉん":"붱","ゔぁあん":"봐앙","ゔぃいん":"뷔잉","ゔうん":"부웅","ゔぇえん":"붸엥","ゔぉうん":"붜웅","ゔぉおん":"붜웅","ゔぇいん":"붸잉"},"endOfWord":{}}
},{}],16:[function(require,module,exports){
module.exports = {"base":{"あ":"a","い":"i","う":"u","え":"e","お":"o","ああ":"aa","いい":"ii","うう":"uu","ええ":"ee","おう":"oo","おお":"oo","えい":"ei","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko","きゃ":"kya","きゅ":"kyu","きょ":"kyo","かあ":"kaa","きい":"kii","くう":"kuu","けえ":"kee","こう":"koo","こお":"koo","きゃあ":"kyaa","きゅう":"kyuu","きょう":"kyoo","きょお":"kyoo","けい":"kei","が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go","ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo","があ":"gaa","ぎい":"gii","ぐう":"guu","げえ":"gee","ごう":"goo","ごお":"goo","ぎゃあ":"gyaa","ぎゅう":"gyuu","ぎょう":"gyoo","ぎょお":"gyoo","げい":"gei","さ":"sa","すぃ":"si","す":"su","せ":"se","そ":"so","さあ":"saa","すぃい":"sii","すう":"suu","せえ":"see","そう":"soo","そお":"soo","せい":"sei","しゃ":"sha","し":"shi","しゅ":"shu","しぇ":"she","しょ":"sho","しゃあ":"shaa","しい":"shii","しゅう":"shuu","しぇえ":"shee","しょう":"shoo","しょお":"shoo","しぇい":"shei","ざ":"za","ずぃ":"zi","ず":"zu","ぜ":"ze","ぞ":"zo","ざあ":"zaa","ずぃい":"zii","ずう":"zuu","ぜえ":"zee","ぞう":"zoo","ぞお":"zoo","ぜい":"zei","じゃ":"ja","じ":"ji","じゅ":"ju","じぇ":"je","じょ":"jo","じゃあ":"jaa","じい":"jii","じゅう":"juu","じぇえ":"jee","じょう":"joo","じょお":"joo","じぇい":"jei","た":"ta","てぃ":"ti","とぅ":"tu","て":"te","と":"to","たあ":"taa","てぃい":"tii","とぅう":"tuu","てえ":"tee","とう":"too","とお":"too","てい":"tei","ちゃ":"cha","ち":"chi","ちゅ":"chu","ちぇ":"che","ちょ":"cho","ちゃあ":"chaa","ちい":"chii","ちゅう":"chuu","ちぇえ":"chee","ちょう":"choo","ちょお":"choo","ちぇい":"chei","つぁ":"tsa","つぃ":"tsi","つ":"tsu","つぇ":"tse","つぉ":"tso","つぁあ":"tsaa","つぃい":"tsii","つう":"tsuu","つぇえ":"tsee","つぉう":"tsoo","つぉお":"tsoo","つぇい":"tsei","だ":"da","でぃ":"di","どぅ":"du","で":"de","ど":"do","だあ":"daa","でぃい":"dii","どぅう":"duu","でえ":"dee","どう":"doo","どお":"doo","でい":"dei","ぢゃ":"ja","ぢ":"ji","ぢゅ":"ju","ぢぇ":"je","ぢょ":"jo","ぢゃあ":"jaa","ぢい":"jii","ぢゅう":"juu","ぢぇえ":"jee","ぢょう":"joo","ぢょお":"joo","ぢぇい":"jei","づ":"zu","づう":"zuu","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no","にゃ":"nya","にゅ":"nyu","にょ":"nyo","なあ":"naa","にい":"nii","ぬう":"nuu","ねえ":"nee","のう":"noo","のお":"noo","にゃあ":"nyaa","にゅう":"nyuu","にょう":"nyoo","にょお":"nyoo","ねい":"nei","は":"ha","ひ":"hi","へ":"he","ほ":"ho","ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo","はあ":"haa","ひい":"hii","へえ":"hee","ほう":"hoo","ほお":"hoo","ひゃあ":"hyaa","ひゅう":"hyuu","ひょう":"hyoo","ひょお":"hyoo","へい":"hei","ふぁ":"fa","ふぃ":"fi","ふ":"fu","ふぇ":"fe","ふぉ":"fo","ふぁあ":"faa","ふぃい":"fii","ふう":"fuu","ふぇえ":"fee","ふぉう":"foo","ふぉお":"foo","ふぇい":"fei","ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo","びゃ":"bya","びゅ":"byu","びょ":"byo","ばあ":"baa","びい":"bii","ぶう":"buu","べえ":"bee","ぼう":"boo","ぼお":"boo","びゃあ":"byaa","びゅう":"byuu","びょう":"byoo","びょお":"byoo","べい":"bei","ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po","ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo","ぱあ":"paa","ぴい":"pii","ぷう":"puu","ぺえ":"pee","ぽう":"poo","ぽお":"poo","ぴゃあ":"pyaa","ぴゅう":"pyuu","ぴょう":"pyoo","ぴょお":"pyoo","ぺい":"pei","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo","みゃ":"mya","みゅ":"myu","みょ":"myo","まあ":"maa","みい":"mii","むう":"muu","めえ":"mee","もう":"moo","もお":"moo","みゃあ":"myaa","みゅう":"myuu","みょう":"myoo","みょお":"myoo","めい":"mei","や":"ya","ゆ":"yu","よ":"yo","やあ":"yaa","ゆう":"yuu","よう":"yoo","よお":"yoo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","りゃ":"rya","りゅ":"ryu","りょ":"ryo","らあ":"raa","りい":"rii","るう":"ruu","れえ":"ree","ろう":"roo","ろお":"roo","りゃあ":"ryaa","りゅう":"ryuu","りょう":"ryoo","りょお":"ryoo","れい":"rei","わ":"wa","うぃ":"wi","うぇ":"we","うぉ":"wo","わあ":"waa","うぃい":"wii","うぇえ":"wee","うぉう":"woo","うぉお":"woo","うぇい":"wei","ん":"n","を":"o","っ":"","んあ":"n'a","んい":"n'i","んう":"n'u","んえ":"n'e","んお":"n'o","んや":"n'ya","んゆ":"n'yu","んよ":"n'yo","んああ":"n'aa","んいい":"n'ii","んうう":"n'uu","んええ":"n'ee","んおう":"n'oo","んおお":"n'oo","んやあ":"n'yaa","んゆう":"n'yuu","んよう":"n'yoo","んよお":"n'yoo","んえい":"n'ei","っか":"kka","っき":"kki","っく":"kku","っけ":"kke","っこ":"kko","っきゃ":"kkya","っきゅ":"kkyu","っきょ":"kkyo","っかあ":"kkaa","っきい":"kkii","っくう":"kkuu","っけえ":"kkee","っこう":"kkoo","っこお":"kkoo","っきゃあ":"kkyaa","っきゅう":"kkyuu","っきょう":"kkyoo","っきょお":"kkyoo","っけい":"kkei","っさ":"ssa","っすぃ":"ssi","っす":"ssu","っせ":"sse","っそ":"sso","っさあ":"ssaa","っすぃい":"ssii","っすう":"ssuu","っせえ":"ssee","っそう":"ssoo","っそお":"ssoo","っせい":"ssei","っしゃ":"ssha","っし":"sshi","っしゅ":"sshu","っしぇ":"sshe","っしょ":"ssho","っしゃあ":"sshaa","っしい":"sshii","っしゅう":"sshuu","っしぇえ":"sshee","っしょう":"sshoo","っしょお":"sshoo","っしぇい":"sshei","った":"tta","ってぃ":"tti","っとぅ":"ttu","って":"tte","っと":"tto","ったあ":"ttaa","ってぃい":"ttii","っとぅう":"ttuu","ってえ":"ttee","っとう":"ttoo","っとお":"ttoo","ってい":"ttei","っちゃ":"tcha","っち":"tchi","っちゅ":"tchu","っちぇ":"tche","っちょ":"tcho","っちゃあ":"tchaa","っちい":"tchii","っちゅう":"tchuu","っちぇえ":"tchee","っちょう":"tchoo","っちょお":"tchoo","っちぇい":"tchei","っつぁ":"ttsa","っつぃ":"ttsi","っつ":"ttsu","っつぇ":"ttse","っつぉ":"ttso","っつぁあ":"ttsaa","っつぃい":"ttsii","っつう":"ttsuu","っつぇえ":"ttsee","っつぉう":"ttsoo","っつぉお":"ttsoo","っつぇい":"ttsei","っぱ":"ppa","っぴ":"ppi","っぷ":"ppu","っぺ":"ppe","っぽ":"ppo","っぴゃ":"ppya","っぴゅ":"ppyu","っぴょ":"ppyo","っぱあ":"ppaa","っぴい":"ppii","っぷう":"ppuu","っぺえ":"ppee","っぽう":"ppoo","っぽお":"ppoo","っぴゃあ":"ppyaa","っぴゅう":"ppyuu","っぴょう":"ppyoo","っぴょお":"ppyoo","っぺい":"ppei","ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o","ゃ":"ya","ゅ":"yu","ょ":"yo","ぁあ":"aa","ぃい":"ii","ぅう":"uu","ぇえ":"ee","ぉう":"oo","ぉお":"oo","ゃあ":"yaa","ゅう":"yuu","ょう":"yoo","ょお":"yoo","ぇい":"ei","ゔぁ":"va","ゔぃ":"vi","ゔ":"vu","ゔぇ":"ve","ゔぉ":"vo","ゔぁあ":"vaa","ゔぃい":"vii","ゔう":"vuu","ゔぇえ":"vee","ゔぉう":"voo","ゔぉお":"voo","ゔぇい":"vei","んば":"mba","んび":"mbi","んぶ":"mbu","んべ":"mbe","んぼ":"mbo","んびゃ":"mbya","んびゅ":"mbyu","んびょ":"mbyo","んばあ":"mbaa","んびい":"mbii","んぶう":"mbuu","んべえ":"mbee","んぼう":"mboo","んぼお":"mboo","んびゃあ":"mbyaa","んびゅう":"mbyuu","んびょう":"mbyoo","んびょお":"mbyoo","んべい":"mbei","んぱ":"mpa","んぴ":"mpi","んぷ":"mpu","んぺ":"mpe","んぽ":"mpo","んぴゃ":"mpya","んぴゅ":"mpyu","んぴょ":"mpyo","んぱあ":"mpaa","んぴい":"mpii","んぷう":"mpuu","んぺえ":"mpee","んぽう":"mpoo","んぽお":"mpoo","んぴゃあ":"mpyaa","んぴゅう":"mpyuu","んぴょう":"mpyoo","んぴょお":"mpyoo","んぺい":"mpei","んま":"mma","んみ":"mmi","んむ":"mmu","んめ":"mme","んも":"mmo","んみゃ":"mmya","んみゅ":"mmyu","んみょ":"mmyo","んまあ":"mmaa","んみい":"mmii","んむう":"mmuu","んめえ":"mmee","んもう":"mmoo","んもお":"mmoo","んみゃあ":"mmyaa","んみゅう":"mmyuu","んみょう":"mmyoo","んみょお":"mmyoo","んめい":"mmei","んっぱ":"mppa","んっぴ":"mppi","んっぷ":"mppu","んっぺ":"mppe","んっぽ":"mppo","んっぴゃ":"mppya","んっぴゅ":"mppyu","んっぴょ":"mppyo","んっぱあ":"mppaa","んっぴい":"mppii","んっぷう":"mppuu","んっぺえ":"mppee","んっぽう":"mppoo","んっぽお":"mppoo","んっぴゃあ":"mppyaa","んっぴゅう":"mppyuu","んっぴょう":"mppyoo","んっぴょお":"mppyoo","んっぺい":"mppei"},"additional":{},"endOfWord":{}}
},{}],17:[function(require,module,exports){
module.exports = {"base":{"あ":"а","い":"и","う":"у","え":"э","お":"о","ああ":"аa","いい":"ии","うう":"уу","ええ":"ээ","おう":"оо","おお":"оо","えい":"эи","か":"ка","き":"ки","く":"ку","け":"кэ","こ":"ко","きゃ":"кя","きゅ":"кю","きょ":"кё","かあ":"каa","きい":"кии","くう":"куу","けえ":"кээ","こう":"коо","こお":"коо","きゃあ":"кяa","きゅう":"кюу","きょう":"кёо","きょお":"кёо","けい":"кэи","が":"га","ぎ":"ги","ぐ":"гу","げ":"гэ","ご":"го","ぎゃ":"гя","ぎゅ":"гю","ぎょ":"гё","があ":"гаa","ぎい":"гии","ぐう":"гуу","げえ":"гээ","ごう":"гоо","ごお":"гоо","ぎゃあ":"гяa","ぎゅう":"гюу","ぎょう":"гёо","ぎょお":"гёо","げい":"гэи","さ":"са","すぃ":"си","す":"су","せ":"сэ","そ":"со","さあ":"саa","すぃい":"сии","すう":"суу","せえ":"сээ","そう":"соо","そお":"соо","せい":"сэи","しゃ":"ся","し":"си","しゅ":"сю","しぇ":"сэ","しょ":"сё","しゃあ":"сяa","しい":"сии","しゅう":"сюу","しぇえ":"сээ","しょう":"сёо","しょお":"сёо","しぇい":"сэи","ざ":"дза","ずぃ":"дзи","ず":"дзу","ぜ":"дзэ","ぞ":"дзо","ざあ":"дзаa","ずぃい":"дзии","ずう":"дзуу","ぜえ":"дзээ","ぞう":"дзоо","ぞお":"дзоо","ぜい":"дзэи","じゃ":"дзя","じ":"дзи","じゅ":"дзю","じぇ":"дзэ","じょ":"дзё","じゃあ":"дзяa","じい":"дзии","じゅう":"дзюу","じぇえ":"дзээ","じょう":"дзёо","じょお":"дзёо","じぇい":"дзэи","た":"та","てぃ":"ти","とぅ":"ту","て":"тэ","と":"то","たあ":"таa","てぃい":"тии","とぅう":"туу","てえ":"тээ","とう":"тоо","とお":"тоо","てい":"тэи","ちゃ":"тя","ち":"ти","ちゅ":"тю","ちぇ":"тэ","ちょ":"тё","ちゃあ":"тяa","ちい":"тии","ちゅう":"тюу","ちぇえ":"тээ","ちょう":"тёо","ちょお":"тёо","ちぇい":"тэи","つぁ":"ца","つぃ":"ци","つ":"цу","つぇ":"цэ","つぉ":"цо","つぁあ":"цаa","つぃい":"ции","つう":"цуу","つぇえ":"цээ","つぉう":"цоо","つぉお":"цоо","つぇい":"цэи","だ":"да","でぃ":"ди","どぅ":"ду","で":"дэ","ど":"до","だあ":"даa","でぃい":"дии","どぅう":"дуу","でえ":"дээ","どう":"доо","どお":"доо","でい":"дэи","ぢゃ":"дзя","ぢ":"дзи","ぢゅ":"дзю","ぢぇ":"дзэ","ぢょ":"дзё","ぢゃあ":"дзяa","ぢい":"дзии","ぢゅう":"дзюу","ぢぇえ":"дзээ","ぢょう":"дзёо","ぢょお":"дзёо","ぢぇい":"дзэи","づ":"дзу","づう":"дзуу","な":"на","に":"ни","ぬ":"ну","ね":"нэ","の":"но","にゃ":"ня","にゅ":"ню","にょ":"нё","なあ":"наa","にい":"нии","ぬう":"нуу","ねえ":"нээ","のう":"ноо","のお":"ноо","にゃあ":"няa","にゅう":"нюу","にょう":"нёо","にょお":"нёо","ねい":"нэи","は":"ха","ひ":"хи","へ":"хэ","ほ":"хо","ひゃ":"хя","ひゅ":"хю","ひょ":"хё","はあ":"хаa","ひい":"хии","へえ":"хээ","ほう":"хоо","ほお":"хоо","ひゃあ":"хяa","ひゅう":"хюу","ひょう":"хёо","ひょお":"хёо","へい":"хэи","ふぁ":"фа","ふぃ":"фи","ふ":"фу","ふぇ":"фэ","ふぉ":"фо","ふぁあ":"фаa","ふぃい":"фии","ふう":"фуу","ふぇえ":"фээ","ふぉう":"фоо","ふぉお":"фоо","ふぇい":"фэи","ば":"ба","び":"би","ぶ":"бу","べ":"бэ","ぼ":"бо","びゃ":"бя","びゅ":"бю","びょ":"бё","ばあ":"баa","びい":"бии","ぶう":"буу","べえ":"бээ","ぼう":"боо","ぼお":"боо","びゃあ":"бяa","びゅう":"бюу","びょう":"бёо","びょお":"бёо","べい":"бэи","ぱ":"па","ぴ":"пи","ぷ":"пу","ぺ":"пэ","ぽ":"по","ぴゃ":"пя","ぴゅ":"пю","ぴょ":"пё","ぱあ":"паa","ぴい":"пии","ぷう":"пуу","ぺえ":"пээ","ぽう":"поо","ぽお":"поо","ぴゃあ":"пяa","ぴゅう":"пюу","ぴょう":"пёо","ぴょお":"пёо","ぺい":"пэи","ま":"ма","み":"ми","む":"му","め":"мэ","も":"мо","みゃ":"мя","みゅ":"мю","みょ":"мё","まあ":"маa","みい":"мии","むう":"муу","めえ":"мээ","もう":"моо","もお":"моо","みゃあ":"мяa","みゅう":"мюу","みょう":"мёо","みょお":"мёо","めい":"мэи","や":"я","ゆ":"ю","よ":"ё","やあ":"яa","ゆう":"юу","よう":"ёо","よお":"ёо","ら":"ра","り":"ри","る":"ру","れ":"рэ","ろ":"ро","りゃ":"ря","りゅ":"рю","りょ":"рё","らあ":"раa","りい":"рии","るう":"руу","れえ":"рээ","ろう":"роо","ろお":"роо","りゃあ":"ряa","りゅう":"рюу","りょう":"рёо","りょお":"рёо","れい":"рэи","わ":"ва","うぃ":"ви","うぇ":"вэ","うぉ":"во","わあ":"ваa","うぃい":"вии","うぇえ":"вээ","うぉう":"воо","うぉお":"воо","うぇい":"вэи","ん":"н","を":"о","っ":"","んあ":"нъа","んい":"нъи","んう":"нъу","んえ":"нъэ","んお":"нъо","んや":"нъя","んゆ":"нъю","んよ":"нъё","んああ":"нъаa","んいい":"нъии","んうう":"нъуу","んええ":"нъээ","んおう":"нъоо","んおお":"нъоо","んやあ":"нъяa","んゆう":"нъюу","んよう":"нъёо","んよお":"нъёо","んえい":"нъэи","っか":"кка","っき":"кки","っく":"кку","っけ":"ккэ","っこ":"кко","っきゃ":"ккя","っきゅ":"ккю","っきょ":"ккё","っかあ":"ккаa","っきい":"ккии","っくう":"ккуу","っけえ":"ккээ","っこう":"ккоо","っこお":"ккоо","っきゃあ":"ккяa","っきゅう":"ккюу","っきょう":"ккёо","っきょお":"ккёо","っけい":"ккэи","っさ":"сса","っすぃ":"сси","っす":"ссу","っせ":"ссэ","っそ":"ссо","っさあ":"ссаa","っすぃい":"ссии","っすう":"ссуу","っせえ":"ссээ","っそう":"ссоо","っそお":"ссоо","っせい":"ссэи","っしゃ":"сся","っし":"сси","っしゅ":"ссю","っしぇ":"ссэ","っしょ":"ссё","っしゃあ":"ссяa","っしい":"ссии","っしゅう":"ссюу","っしぇえ":"ссээ","っしょう":"ссёо","っしょお":"ссёо","っしぇい":"ссэи","った":"тта","ってぃ":"тти","っとぅ":"тту","って":"ттэ","っと":"тто","ったあ":"ттаa","ってぃい":"ттии","っとぅう":"ттуу","ってえ":"ттээ","っとう":"ттоо","っとお":"ттоо","ってい":"ттэи","っちゃ":"ття","っち":"тти","っちゅ":"ттю","っちぇ":"ттэ","っちょ":"ттё","っちゃあ":"ттяa","っちい":"ттии","っちゅう":"ттюу","っちぇえ":"ттээ","っちょう":"ттёо","っちょお":"ттёо","っちぇい":"ттэи","っつぁ":"цца","っつぃ":"цци","っつ":"ццу","っつぇ":"ццэ","っつぉ":"ццо","っつぁあ":"ццаa","っつぃい":"цции","っつう":"ццуу","っつぇえ":"ццээ","っつぉう":"ццоо","っつぉお":"ццоо","っつぇい":"ццэи","っぱ":"ппа","っぴ":"ппи","っぷ":"ппу","っぺ":"ппэ","っぽ":"ппо","っぴゃ":"ппя","っぴゅ":"ппю","っぴょ":"ппё","っぱあ":"ппаa","っぴい":"ппии","っぷう":"ппуу","っぺえ":"ппээ","っぽう":"ппоо","っぽお":"ппоо","っぴゃあ":"ппяa","っぴゅう":"ппюу","っぴょう":"ппёо","っぴょお":"ппёо","っぺい":"ппэи","ぁ":"а","ぃ":"и","ぅ":"у","ぇ":"э","ぉ":"о","ゃ":"я","ゅ":"ю","ょ":"ё","ぁあ":"аa","ぃい":"ии","ぅう":"уу","ぇえ":"ээ","ぉう":"оо","ぉお":"оо","ゃあ":"яa","ゅう":"юу","ょう":"ёо","ょお":"ёо","ぇい":"эи","ゔぁ":"ва","ゔぃ":"ви","ゔ":"ву","ゔぇ":"вэ","ゔぉ":"во","ゔぁあ":"ваa","ゔぃい":"вии","ゔう":"вуу","ゔぇえ":"вээ","ゔぉう":"воо","ゔぉお":"воо","ゔぇい":"вэи"},"additional":{},"endOfWord":{"あ":"а","い":"й","う":"у","え":"э","お":"о","ああ":"аa","いい":"ий","うう":"уу","ええ":"ээ","おう":"оо","おお":"оо","えい":"эй","か":"ка","き":"кй","く":"ку","け":"кэ","こ":"ко","きゃ":"кя","きゅ":"кю","きょ":"кё","かあ":"каa","きい":"кий","くう":"куу","けえ":"кээ","こう":"коо","こお":"коо","きゃあ":"кяa","きゅう":"кюу","きょう":"кёо","きょお":"кёо","けい":"кэй","が":"га","ぎ":"гй","ぐ":"гу","げ":"гэ","ご":"го","ぎゃ":"гя","ぎゅ":"гю","ぎょ":"гё","があ":"гаa","ぎい":"гий","ぐう":"гуу","げえ":"гээ","ごう":"гоо","ごお":"гоо","ぎゃあ":"гяa","ぎゅう":"гюу","ぎょう":"гёо","ぎょお":"гёо","げい":"гэй","さ":"са","すぃ":"сй","す":"су","せ":"сэ","そ":"со","さあ":"саa","すぃい":"сий","すう":"суу","せえ":"сээ","そう":"соо","そお":"соо","せい":"сэй","しゃ":"ся","し":"сй","しゅ":"сю","しぇ":"сэ","しょ":"сё","しゃあ":"сяa","しい":"сий","しゅう":"сюу","しぇえ":"сээ","しょう":"сёо","しょお":"сёо","しぇい":"сэй","ざ":"дза","ずぃ":"дзй","ず":"дзу","ぜ":"дзэ","ぞ":"дзо","ざあ":"дзаa","ずぃい":"дзий","ずう":"дзуу","ぜえ":"дзээ","ぞう":"дзоо","ぞお":"дзоо","ぜい":"дзэй","じゃ":"дзя","じ":"дзй","じゅ":"дзю","じぇ":"дзэ","じょ":"дзё","じゃあ":"дзяa","じい":"дзий","じゅう":"дзюу","じぇえ":"дзээ","じょう":"дзёо","じょお":"дзёо","じぇい":"дзэй","た":"та","てぃ":"тй","とぅ":"ту","て":"тэ","と":"то","たあ":"таa","てぃい":"тий","とぅう":"туу","てえ":"тээ","とう":"тоо","とお":"тоо","てい":"тэй","ちゃ":"тя","ち":"тй","ちゅ":"тю","ちぇ":"тэ","ちょ":"тё","ちゃあ":"тяa","ちい":"тий","ちゅう":"тюу","ちぇえ":"тээ","ちょう":"тёо","ちょお":"тёо","ちぇい":"тэй","つぁ":"ца","つぃ":"цй","つ":"цу","つぇ":"цэ","つぉ":"цо","つぁあ":"цаa","つぃい":"ций","つう":"цуу","つぇえ":"цээ","つぉう":"цоо","つぉお":"цоо","つぇい":"цэй","だ":"да","でぃ":"дй","どぅ":"ду","で":"дэ","ど":"до","だあ":"даa","でぃい":"дий","どぅう":"дуу","でえ":"дээ","どう":"доо","どお":"доо","でい":"дэй","ぢゃ":"дзя","ぢ":"дзй","ぢゅ":"дзю","ぢぇ":"дзэ","ぢょ":"дзё","ぢゃあ":"дзяa","ぢい":"дзий","ぢゅう":"дзюу","ぢぇえ":"дзээ","ぢょう":"дзёо","ぢょお":"дзёо","ぢぇい":"дзэй","づ":"дзу","づう":"дзуу","な":"на","に":"нй","ぬ":"ну","ね":"нэ","の":"но","にゃ":"ня","にゅ":"ню","にょ":"нё","なあ":"наa","にい":"ний","ぬう":"нуу","ねえ":"нээ","のう":"ноо","のお":"ноо","にゃあ":"няa","にゅう":"нюу","にょう":"нёо","にょお":"нёо","ねい":"нэй","は":"ха","ひ":"хй","へ":"хэ","ほ":"хо","ひゃ":"хя","ひゅ":"хю","ひょ":"хё","はあ":"хаa","ひい":"хий","へえ":"хээ","ほう":"хоо","ほお":"хоо","ひゃあ":"хяa","ひゅう":"хюу","ひょう":"хёо","ひょお":"хёо","へい":"хэй","ふぁ":"фа","ふぃ":"фй","ふ":"фу","ふぇ":"фэ","ふぉ":"фо","ふぁあ":"фаa","ふぃい":"фий","ふう":"фуу","ふぇえ":"фээ","ふぉう":"фоо","ふぉお":"фоо","ふぇい":"фэй","ば":"ба","び":"бй","ぶ":"бу","べ":"бэ","ぼ":"бо","びゃ":"бя","びゅ":"бю","びょ":"бё","ばあ":"баa","びい":"бий","ぶう":"буу","べえ":"бээ","ぼう":"боо","ぼお":"боо","びゃあ":"бяa","びゅう":"бюу","びょう":"бёо","びょお":"бёо","べい":"бэй","ぱ":"па","ぴ":"пй","ぷ":"пу","ぺ":"пэ","ぽ":"по","ぴゃ":"пя","ぴゅ":"пю","ぴょ":"пё","ぱあ":"паa","ぴい":"пий","ぷう":"пуу","ぺえ":"пээ","ぽう":"поо","ぽお":"поо","ぴゃあ":"пяa","ぴゅう":"пюу","ぴょう":"пёо","ぴょお":"пёо","ぺい":"пэй","ま":"ма","み":"мй","む":"му","め":"мэ","も":"мо","みゃ":"мя","みゅ":"мю","みょ":"мё","まあ":"маa","みい":"мий","むう":"муу","めえ":"мээ","もう":"моо","もお":"моо","みゃあ":"мяa","みゅう":"мюу","みょう":"мёо","みょお":"мёо","めい":"мэй","や":"я","ゆ":"ю","よ":"ё","やあ":"яa","ゆう":"юу","よう":"ёо","よお":"ёо","ら":"ра","り":"рй","る":"ру","れ":"рэ","ろ":"ро","りゃ":"ря","りゅ":"рю","りょ":"рё","らあ":"раa","りい":"рий","るう":"руу","れえ":"рээ","ろう":"роо","ろお":"роо","りゃあ":"ряa","りゅう":"рюу","りょう":"рёо","りょお":"рёо","れい":"рэй","わ":"ва","うぃ":"вй","うぇ":"вэ","うぉ":"во","わあ":"ваa","うぃい":"вий","うぇえ":"вээ","うぉう":"воо","うぉお":"воо","うぇい":"вэй","ん":"н","を":"о","っ":"","んあ":"нъа","んい":"нъй","んう":"нъу","んえ":"нъэ","んお":"нъо","んや":"нъя","んゆ":"нъю","んよ":"нъё","んああ":"нъаa","んいい":"нъий","んうう":"нъуу","んええ":"нъээ","んおう":"нъоо","んおお":"нъоо","んやあ":"нъяa","んゆう":"нъюу","んよう":"нъёо","んよお":"нъёо","んえい":"нъэй","っか":"кка","っき":"ккй","っく":"кку","っけ":"ккэ","っこ":"кко","っきゃ":"ккя","っきゅ":"ккю","っきょ":"ккё","っかあ":"ккаa","っきい":"ккий","っくう":"ккуу","っけえ":"ккээ","っこう":"ккоо","っこお":"ккоо","っきゃあ":"ккяa","っきゅう":"ккюу","っきょう":"ккёо","っきょお":"ккёо","っけい":"ккэй","っさ":"сса","っすぃ":"ссй","っす":"ссу","っせ":"ссэ","っそ":"ссо","っさあ":"ссаa","っすぃい":"ссий","っすう":"ссуу","っせえ":"ссээ","っそう":"ссоо","っそお":"ссоо","っせい":"ссэй","っしゃ":"сся","っし":"ссй","っしゅ":"ссю","っしぇ":"ссэ","っしょ":"ссё","っしゃあ":"ссяa","っしい":"ссий","っしゅう":"ссюу","っしぇえ":"ссээ","っしょう":"ссёо","っしょお":"ссёо","っしぇい":"ссэй","った":"тта","ってぃ":"ттй","っとぅ":"тту","って":"ттэ","っと":"тто","ったあ":"ттаa","ってぃい":"ттий","っとぅう":"ттуу","ってえ":"ттээ","っとう":"ттоо","っとお":"ттоо","ってい":"ттэй","っちゃ":"ття","っち":"ттй","っちゅ":"ттю","っちぇ":"ттэ","っちょ":"ттё","っちゃあ":"ттяa","っちい":"ттий","っちゅう":"ттюу","っちぇえ":"ттээ","っちょう":"ттёо","っちょお":"ттёо","っちぇい":"ттэй","っつぁ":"цца","っつぃ":"ццй","っつ":"ццу","っつぇ":"ццэ","っつぉ":"ццо","っつぁあ":"ццаa","っつぃい":"цций","っつう":"ццуу","っつぇえ":"ццээ","っつぉう":"ццоо","っつぉお":"ццоо","っつぇい":"ццэй","っぱ":"ппа","っぴ":"ппй","っぷ":"ппу","っぺ":"ппэ","っぽ":"ппо","っぴゃ":"ппя","っぴゅ":"ппю","っぴょ":"ппё","っぱあ":"ппаa","っぴい":"ппий","っぷう":"ппуу","っぺえ":"ппээ","っぽう":"ппоо","っぽお":"ппоо","っぴゃあ":"ппяa","っぴゅう":"ппюу","っぴょう":"ппёо","っぴょお":"ппёо","っぺい":"ппэй","ぁ":"а","ぃ":"й","ぅ":"у","ぇ":"э","ぉ":"о","ゃ":"я","ゅ":"ю","ょ":"ё","ぁあ":"аa","ぃい":"ий","ぅう":"уу","ぇえ":"ээ","ぉう":"оо","ぉお":"оо","ゃあ":"яa","ゅう":"юу","ょう":"ёо","ょお":"ёо","ぇい":"эй","ゔぁ":"ва","ゔぃ":"вй","ゔ":"ву","ゔぇ":"вэ","ゔぉ":"во","ゔぁあ":"ваa","ゔぃい":"вий","ゔう":"вуу","ゔぇえ":"вээ","ゔぉう":"воо","ゔぉお":"воо","ゔぇい":"вэй"}}
},{}],18:[function(require,module,exports){
module.exports = {"base":{"あ":"ආ","い":"ඊ","う":"ඌ","え":"ඒ","お":"ඕ","ああ":"ආආ","いい":"ඊඊ","うう":"ඌඌ","ええ":"ඒඒ","おう":"ඕඕ","おお":"ඕඕ","えい":"ඒඊ","か":"ක","き":"කී","く":"කූ","け":"කේ","こ":"කෝ","きゃ":"කීආ","きゅ":"කීඌ","きょ":"කීඕ","かあ":"කාආ","きい":"කීඊ","くう":"කූඌ","けえ":"කේඒ","こう":"කෝඕ","こお":"කෝඕ","きゃあ":"කීආආ","きゅう":"කීඌඌ","きょう":"කීඕඕ","きょお":"කීඕඕ","けい":"කේඊ","が":"ග","ぎ":"ගී","ぐ":"ගූ","げ":"ගේ","ご":"ගෝ","ぎゃ":"ගීආ","ぎゅ":"ගීඌ","ぎょ":"ගීඕ","があ":"ගාආ","ぎい":"ගීඊ","ぐう":"ගූඌ","げえ":"ගේඒ","ごう":"ගෝඕ","ごお":"ගෝඕ","ぎゃあ":"ගීආආ","ぎゅう":"ගීඌඌ","ぎょう":"ගීඕඕ","ぎょお":"ගීඕඕ","げい":"ගේඊ","さ":"ස","すぃ":"සී","す":"සූ","せ":"සේ","そ":"සෝ","さあ":"සාආ","すぃい":"සීඊ","すう":"සූඌ","せえ":"සේඒ","そう":"සෝඕ","そお":"සෝඕ","せい":"සේඊ","しゃ":"ෂ","し":"ෂී","しゅ":"ෂූ","しぇ":"ෂේ","しょ":"ෂෝ","しゃあ":"ෂාආ","しい":"ෂීඊ","しゅう":"ෂූඌ","しぇえ":"ෂේඒ","しょう":"ෂෝඕ","しょお":"ෂෝඕ","しぇい":"ෂේඊ","ざ":"ජ","ずぃ":"ජී","ず":"ජූ","ぜ":"ජේ","ぞ":"ජෝ","ざあ":"ජාආ","ずぃい":"ජීඊ","ずう":"ජූඌ","ぜえ":"ජේඒ","ぞう":"ජෝඕ","ぞお":"ජෝඕ","ぜい":"ජේඊ","じゃ":"ජ","じ":"ජී","じゅ":"ජූ","じぇ":"ජේ","じょ":"ජෝ","じゃあ":"ජාආ","じい":"ජීඊ","じゅう":"ජූඌ","じぇえ":"ජේඒ","じょう":"ජෝඕ","じょお":"ජෝඕ","じぇい":"ජේඊ","た":"ට","てぃ":"ටී","とぅ":"ටූ","て":"ටේ","と":"ටෝ","たあ":"ටාආ","てぃい":"ටීඊ","とぅう":"ටූඌ","てえ":"ටේඒ","とう":"ටෝඕ","とお":"ටෝඕ","てい":"ටේඊ","ちゃ":"ච","ち":"චී","ちゅ":"චූ","ちぇ":"චේ","ちょ":"චෝ","ちゃあ":"චාආ","ちい":"චීඊ","ちゅう":"චූඌ","ちぇえ":"චේඒ","ちょう":"චෝඕ","ちょお":"චෝඕ","ちぇい":"චේඊ","つぁ":"ච","つぃ":"චී","つ":"චූ","つぇ":"චේ","つぉ":"චෝ","つぁあ":"චාආ","つぃい":"චීඊ","つう":"චූඌ","つぇえ":"චේඒ","つぉう":"චෝඕ","つぉお":"චෝඕ","つぇい":"චේී","だ":"ඩ","でぃ":"ඩී","どぅ":"ඩූ","で":"ඩේ","ど":"ඩෝ","だあ":"ඩාආ","でぃい":"ඩීඊ","どぅう":"ඩූඌ","でえ":"ඩේඒ","どう":"ඩෝඕ","どお":"ඩෝඕ","でい":"ඩේඊ","ぢゃ":"ජ","ぢ":"ජී","ぢゅ":"ජූ","ぢぇ":"ජේ","ぢょ":"ජෝ","ぢゃあ":"ජාආ","ぢい":"ජීඊ","ぢゅう":"ජූඌ","ぢぇえ":"ජේඒ","ぢょう":"ජෝඕ","ぢょお":"ජෝඕ","ぢぇい":"ජේඊ","づ":"ජූ","づう":"ජූඌ","な":"න","に":"නී","ぬ":"නූ","ね":"නේ","の":"නෝ","にゃ":"නීආ","にゅ":"නීඌ","にょ":"නීඕ","なあ":"නාආ","にい":"නීඊ","ぬう":"නූඌ","ねえ":"නේඒ","のう":"නෝඕ","のお":"නෝඕ","にゃあ":"නීආආ","にゅう":"නීඌඌ","にょう":"නීඕඕ","にょお":"නීඕඕ","ねい":"නේඊ","は":"හ","ひ":"හී","へ":"හේ","ほ":"හෝ","ひゃ":"හීආ","ひゅ":"හීඌ","ひょ":"හීඕ","はあ":"හාආ","ひい":"හීඊ","へえ":"හේඒ","ほう":"හෝඕ","ほお":"හෝඕ","ひゃあ":"හීආආ","ひゅう":"හීඌඌ","ひょう":"හීඕඕ","ひょお":"හීඕඕ","へい":"හේඊ","ふぁ":"හ","ふぃ":"හී","ふ":"හූ","ふぇ":"හේ","ふぉ":"හෝ","ふぁあ":"හාආ","ふぃい":"හීඊ","ふう":"හූඌ","ふぇえ":"හේඒ","ふぉう":"හෝඕ","ふぉお":"හෝඕ","ふぇい":"හේඊ","ば":"බ","び":"බී","ぶ":"බූ","べ":"බේ","ぼ":"බෝ","びゃ":"බීආ","びゅ":"බීඌ","びょ":"බීඕ","ばあ":"බාආ","びい":"බීඊ","ぶう":"බූඌ","べえ":"බේඒ","ぼう":"බෝඕ","ぼお":"බෝඕ","びゃあ":"බීආආ","びゅう":"බීඌඌ","びょう":"බීඕඕ","びょお":"බීඕඕ","べい":"බේඊ","ぱ":"ප","ぴ":"පී","ぷ":"පූ","ぺ":"පේ","ぽ":"පෝ","ぴゃ":"පීආ","ぴゅ":"පීඌ","ぴょ":"පීඕ","ぱあ":"පාආ","ぴい":"පීඊ","ぷう":"පූඌ","ぺえ":"පේඒ","ぽう":"පෝඕ","ぽお":"පෝඕ","ぴゃあ":"පීආආ","ぴゅう":"පීඌඌ","ぴょう":"පීඕඕ","ぴょお":"පීඕඕ","ぺい":"පේඊ","ま":"ම","み":"මී","む":"මූ","め":"මේ","も":"මෝ","みゃ":"මීආ","みゅ":"මීඌ","みょ":"මීඕ","まあ":"මාආ","みい":"මීඊ","むう":"මූඌ","めえ":"මේඒ","もう":"මෝඕ","もお":"මෝඕ","みゃあ":"මීආආ","みゅう":"මීඌඌ","みょう":"මීඕඕ","みょお":"මීඕඕ","めい":"මේඊ","や":"ය","ゆ":"යූ","よ":"යෝ","やあ":"යාආ","ゆう":"යූඌ","よう":"යෝඕ","よお":"යෝඕ","ら":"ර","り":"රී","る":"රූ","れ":"රේ","ろ":"රෝ","りゃ":"රීආ","りゅ":"රීඌ","りょ":"රීඕ","らあ":"රාආ","りい":"රීඊ","るう":"රූඌ","れえ":"රේඒ","ろう":"රෝඕ","ろお":"රෝඕ","りゃあ":"රීආආ","りゅう":"රීඌඌ","りょう":"රීඕඕ","りょお":"රීඕඕ","れい":"රේඊ","わ":"ව","うぃ":"වී","うぇ":"වේ","うぉ":"වෝ","わあ":"වාආ","うぃい":"වීඊ","うぇえ":"වේඒ","うぉう":"වෝඕ","うぉお":"වෝඕ","うぇい":"වේඊ","ん":" න්","を":"ඕ","っ":"","んあ":" න්ආ","んい":" න්ඊ","んう":" න්ඌ","んえ":" න්ඒ","んお":" න්ඕ","んや":" න්ය","んゆ":" න්යූ","んよ":" න්යෝ","んああ":" න්ආආ","んいい":" න්ඊඊ","んうう":" න්ඌඌ","んええ":" න්ඒඒ","んおう":" න්ඕඕ","んおお":" න්ඕඕ","んやあ":" න්යාආ","んゆう":" න්යූඌ","んよう":" න්යෝඕ","んよお":" න්යෝඕ","んえい":" න්ඒඊ","っか":" ක්ක","っき":" ක්කී","っく":" ක්කූ","っけ":" ක්කේ","っこ":" ක්කෝ","っきゃ":" ක්කීආ","っきゅ":" ක්කීඌ","っきょ":" ක්කීඕ","っかあ":" ක්කාආ","っきい":" ක්කීඊ","っくう":" ක්කූඌ","っけえ":" ක්කේඒ","っこう":" ක්කෝඕ","っこお":" ක්කෝඕ","っきゃあ":" ක්කීආආ","っきゅう":" ක්කීඌඌ","っきょう":" ක්කීඕඕ","っきょお":" ක්කීඕඕ","っけい":" ක්කේඊ","っさ":" ස්ස","っすぃ":" ස්සී","っす":" ස්සූ","っせ":" ස්සේ","っそ":" ස්සෝ","っさあ":" ස්සාආ","っすぃい":" ස්සීඊ","っすう":" ස්සූඌ","っせえ":" ස්සේඒ","っそう":" ස්සෝඕ","っそお":" ස්සෝඕ","っせい":" ස්සේඊ","っしゃ":" ෂ්ෂ","っし":" ෂ්ෂී","っしゅ":" ෂ්ෂූ","っしぇ":" ෂ්ෂේ","っしょ":" ෂ්ෂෝ","っしゃあ":" ෂ්ෂාආ","っしい":" ෂ්ෂීඊ","っしゅう":" ෂ්ෂූඌ","っしぇえ":" ෂ්ෂේඒ","っしょう":" ෂ්ෂෝඕ","っしょお":" ෂ්ෂෝඕ","っしぇい":" ෂ්ෂේඊ","った":" ට්ට","ってぃ":" ට්ටී","っとぅ":" ට්ටූ","って":" ට්ටේ","っと":" ට්ටෝ","ったあ":" ට්ටාආ","ってぃい":" ට්ටීඊ","っとぅう":" ට්ටූඌ","ってえ":" ට්ටේඒ","っとう":" ට්ටෝඕ","っとお":" ට්ටෝඕ","ってい":" ට්ටේඊ","っちゃ":" ච්ච","っち":" ච්චී","っちゅ":" ච්චූ","っちぇ":" ච්චේ","っちょ":" ච්චෝ","っちゃあ":" ච්චාආ","っちい":" ච්චීඊ","っちゅう":" ච්චූඌ","っちぇえ":" ච්චේඒ","っちょう":" ච්චෝඕ","っちょお":" ච්චෝඕ","っちぇい":" ච්චේඊ","っつぁ":"ජ්ච","っつぃ":"ජ්චී","っつ":"ජ්චූ","っつぇ":"ජ්චේ","っつぉ":"ජ්චෝ","っつぁあ":"ජ්චාආ","っつぃい":"ජ්චීඊ","っつう":"ජ්චූඌ","っつぇえ":"ජ්චේඒ","っつぉう":"ජ්චෝඕ","っつぉお":"ජ්චෝඕ","っつぇい":"ජ්චේඊ","っぱ":" ප්ප","っぴ":" ප්පී","っぷ":" ප්පූ","っぺ":" ප්පේ","っぽ":" ප්පෝ","っぴゃ":" ප්පීආ","っぴゅ":" ප්පීඌ","っぴょ":" ප්පීඕ","っぱあ":" ප්පාආ","っぴい":" ප්පීඊ","っぷう":" ප්පූඌ","っぺえ":" ප්පේඒ","っぽう":" ප්පෝඕ","っぽお":" ප්පෝඕ","っぴゃあ":" ප්පීආආ","っぴゅう":" ප්පීඌඌ","っぴょう":" ප්පීඕඕ","っぴょお":" ප්පීඕඕ","っぺい":" ප්පේඊ","ぁ":"ආ","ぃ":"ඊ","ぅ":"ඌ","ぇ":"ඒ","ぉ":"ඕ","ゃ":"ය","ゅ":"යූ","ょ":"යෝ","ぁあ":"ආආ","ぃい":"ඊඊ","ぅう":"ඌඌ","ぇえ":"ඒඒ","ぉう":"ඕඕ","ぉお":"ඕඕ","ゃあ":"යාආ","ゅう":"යූඌ","ょう":"යෝඕ","ょお":"යෝඕ","ぇい":"ඒඊ","ゔぁ":"ව","ゔぃ":"වී","ゔ":"වූ","ゔぇ":"වේ","ゔぉ":"වෝ","ゔぁあ":"වාආ","ゔぃい":"වීඊ","ゔう":"වූඌ","ゔぇえ":"වේඒ","ゔぉう":"වෝඕ","ゔぉお":"වෝඕ","ゔぇい":"වේඊ"},"additional":{},"endOfWord":{}}
},{}],19:[function(require,module,exports){
module.exports = {"base":{"あ":"ஆ","い":"ஈ","う":"ஊ","え":"ஏ","お":"ஓ","ああ":"ஆஆ","いい":"ஈஈ","うう":"ஊஊ","ええ":"ஏஏ","おう":"ஓஓ","おお":"ஓஓ","えい":"ஏஈ","か":"கா","き":"கீ","く":"கூ","け":"கே","こ":"கோ","きゃ":"கீயா","きゅ":"கீயூ","きょ":"கீயோ","かあ":"காஆ","きい":"கீஈ","くう":"கூஊ","けえ":"கேஏ","こう":"கோஓ","こお":"கோஓ","きゃあ":"கீயாஆ","きゅう":"கீயூஊ","きょう":"கீயோஓ","きょお":"கீயோஓ","けい":"கேஈ","が":"கா","ぎ":"கீ","ぐ":"கூ","げ":"கே","ご":"கோ","ぎゃ":"கீயா","ぎゅ":"கீயூ","ぎょ":"கீயோ","があ":"காஆ","ぎい":"கீஈ","ぐう":"கூஊ","げえ":"கேஏ","ごう":"கோஓ","ごお":"கோஓ","ぎゃあ":"கீயாஆ","ぎゅう":"கீயூஊ","ぎょう":"கீயோஓ","ぎょお":"கீயோஓ","げい":"கேஈ","さ":"ஸா","すぃ":"ஸீ","す":"ஸூ","せ":"ஸே","そ":"ஸோ","さあ":"ஸாஆ","すぃい":"ஸீஈ","すう":"ஸூஊ","せえ":"ஸேஏ","そう":"ஸோஓ","そお":"ஸோஓ","せい":"ஸேஈ","しゃ":"ஷா","し":"ஷீ","しゅ":"ஷூ","しぇ":"ஷே","しょ":"ஷோ","しゃあ":"ஷாஆ","しい":"ஷீஈ","しゅう":"ஷூஊ","しぇえ":"ஷேஏ","しょう":"ஷோஓ","しょお":"ஷோஓ","しぇい":"ஷேீ","ざ":"ஜா","ずぃ":"ஜீ","ず":"ஜூ","ぜ":"ஜே","ぞ":"ஜோ","ざあ":"ஜாஆ","ずぃい":"ஜீஈ","ずう":"ஜூஊ","ぜえ":"ஜேஏ","ぞう":"ஜோஓ","ぞお":"ஜோஓ","ぜい":"ஜேஈ","じゃ":"ஜா","じ":"ஜீ","じゅ":"ஜூ","じぇ":"ஜே","じょ":"ஜோ","じゃあ":"ஜாஆ","じい":"ஜீஈ","じゅう":"ஜூஊ","じぇえ":"ஜேஏ","じょう":"ஜோஓ","じょお":"ஜோஓ","じぇい":"ஜேஈ","た":"தா","てぃ":"தீ","とぅ":"தூ","て":"தே","と":"தோ","たあ":"தாஆ","てぃい":"தீஈ","とぅう":"தூஊ","てえ":"தேஏ","とう":"தோஓ","とお":"தோஓ","てい":"தேஈ","ちゃ":"சா","ち":"சீ","ちゅ":"சூ","ちぇ":"சே","ちょ":"சோ","ちゃあ":"சாஆ","ちい":"சீஈ","ちゅう":"சூஊ","ちぇえ":"சேஏ","ちょう":"சோஓ","ちょお":"சோஓ","ちぇい":"சேஈ","つぁ":"சா","つぃ":"சீ","つ":"சூ","つぇ":"சே","つぉ":"சோ","つぁあ":"சாஆ","つぃい":"சீஈ","つう":"சூஊ","つぇえ":"சேஏ","つぉう":"சோஓ","つぉお":"சோஓ","つぇい":"சேஈ","だ":"தா","でぃ":"தீ","どぅ":"தூ","で":"தே","ど":"தோ","だあ":"தாஆ","でぃい":"தீஈ","どぅう":"தூஊ","でえ":"தேஏ","どう":"தோஓ","どお":"தோஓ","でい":"தேஈ","ぢゃ":"ஜா","ぢ":"ஜீ","ぢゅ":"ஜூ","ぢぇ":"ஜே","ぢょ":"ஜோ","ぢゃあ":"ஜாஆ","ぢい":"ஜீஈ","ぢゅう":"ஜூஊ","ぢぇえ":"ஜேஏ","ぢょう":"ஜோஓ","ぢょお":"ஜோஓ","ぢぇい":"ஜேஈ","づ":"ஜூ","づう":"ஜூஊ","な":"நா","に":"நீ","ぬ":"நூ","ね":"நே","の":"நோ","にゃ":"நீயா","にゅ":"நீயூ","にょ":"நீயோ","なあ":"நாஆ","にい":"நீஈ","ぬう":"நூஊ","ねえ":"நேஏ","のう":"நோஓ","のお":"நோஓ","にゃあ":"நீயாஆ","にゅう":"நீயூஊ","にょう":"நீயோஓ","にょお":"நீயோஓ","ねい":"நேஈ","は":"ஹா","ひ":"ஹீ","へ":"ஹே","ほ":"ஹோ","ひゃ":"ஹீயா","ひゅ":"ஹீயூ","ひょ":"ஹீயோ","はあ":"ஹாஆ","ひい":"ஹீஈ","へえ":"ஹேஏ","ほう":"ஹோஓ","ほお":"ஹோஓ","ひゃあ":"ஹீயாஆ","ひゅう":"ஹீயூஊ","ひょう":"ஹீயோஓ","ひょお":"ஹீயோஓ","へい":"ஹேஈ","ふぁ":"ஹா","ふぃ":"ஹீ","ふ":"ஹூ","ふぇ":"ஹே","ふぉ":"ஹோ","ふぁあ":"ஹாஆ","ふぃい":"ஹீஈ","ふう":"ஹூஊ","ふぇえ":"ஹேஏ","ふぉう":"ஹோஓ","ふぉお":"ஹோஓ","ふぇい":"ஹேஈ","ば":"பா","び":"பீ","ぶ":"பூ","べ":"பே","ぼ":"போ","びゃ":"பீயா","びゅ":"பீயூ","びょ":"பீயோ","ばあ":"பாஆ","びい":"பீஈ","ぶう":"பூஊ","べえ":"பேஏ","ぼう":"போஓ","ぼお":"போஓ","びゃあ":"பீயாஆ","びゅう":"பீயூஊ","びょう":"பீயோஓ","びょお":"பீயோஓ","べい":"பேஈ","ぱ":"பா","ぴ":"பீ","ぷ":"பூ","ぺ":"பே","ぽ":"போ","ぴゃ":"பீயா","ぴゅ":"பீயூ","ぴょ":"பீயோ","ぱあ":"பாஆ","ぴい":"பீஈ","ぷう":"பூஊ","ぺえ":"பேஏ","ぽう":"போஓ","ぽお":"போஓ","ぴゃあ":"பீயாஆ","ぴゅう":"பீயூஊ","ぴょう":"பீயோஓ","ぴょお":"பீயோஓ","ぺい":"பேஈ","ま":"மா","み":"மீ","む":"மூ","め":"மே","も":"மோ","みゃ":"மீயா","みゅ":"மீயூ","みょ":"மீயோ","まあ":"மாஆ","みい":"மீஈ","むう":"மூஊ","めえ":"மேஏ","もう":"மோஓ","もお":"மோஓ","みゃあ":"மீயாஆ","みゅう":"மீயூஊ","みょう":"மீயோஓ","みょお":"மீயோஓ","めい":"மேஈ","や":"யா","ゆ":"யூ","よ":"யோ","やあ":"யாஆ","ゆう":"யூஊ","よう":"யோஓ","よお":"யோஓ","ら":"ரா","り":"ரீ","る":"ரூ","れ":"ரே","ろ":"ரோ","りゃ":"ரீயா","りゅ":"ரீயூ","りょ":"ரீயோ","らあ":"ராஆ","りい":"ரீஈ","るう":"ரூஊ","れえ":"ரேஏ","ろう":"ரோஓ","ろお":"ரோஓ","りゃあ":"ரீயாஆ","りゅう":"ரீயூஊ","りょう":"ரீயோஓ","りょお":"ரீயோஓ","れい":"ரேஈ","わ":"வா","うぃ":"வீ","うぇ":"வே","うぉ":"வோ","わあ":"வாஆ","うぃい":"வீஈ","うぇえ":"வேஏ","うぉう":"வோஓ","うぉお":"வோஓ","うぇい":"வேஈ","ん":"ந்","を":"ஓ","っ":"","んあ":"ந்ஆ","んい":"ந்ஈ","んう":"ந்ஊ","んえ":"ந்ஏ","んお":"ந்ஓ","んや":"ந்ஆ","んゆ":"ந்ஊ","んよ":"ந்ஓ","んああ":"ந்ஆஆ","んいい":"ந்ஈஈ","んうう":"ந்ஊஊ","んええ":"ந்ஏஏ","んおう":"ந்ஓஓ","んおお":"ந்ஓஓ","んやあ":"ந்யாஆ","んゆう":"ந்யூஊ","んよう":"ந்யோஓ","んよお":"ந்யோஓ","んえい":"ந்ஏஈ","っか":"கா","っき":"கீ","っく":"கூ","っけ":"கே","っこ":"கோ","っきゃ":"கீயா","っきゅ":"கீயூ","っきょ":"கீயோ","っかあ":"காஆ","っきい":"கீஈ","っくう":"கூஊ","っけえ":"கேஏ","っこう":"கோஓ","っこお":"கோஓ","っきゃあ":"கீயாஆ","っきゅう":"கீயூஊ","っきょう":"கீயோஓ","っきょお":"கீயோஓ","っけい":"கேஈ","っさ":"ஸா","っすぃ":"ஸீ","っす":"ஸூ","っせ":"ஸே","っそ":"ஸோ","っさあ":"ஸாஆ","っすぃい":"ஸீஈ","っすう":"ஸூஊ","っせえ":"ஸேஏ","っそう":"ஸோஓ","っそお":"ஸோஓ","っせい":"ஸேஈ","っしゃ":"ஷா","っし":"ஷீ","っしゅ":"ஷூ","っしぇ":"ஷே","っしょ":"ஷோ","っしゃあ":"ஷாஆ","っしい":"ஷீஈ","っしゅう":"ஷூஊ","っしぇえ":"ஷேஏ","っしょう":"ஷோஓ","っしょお":"ஷோஓ","っしぇい":"ஷேீ","った":"தா","ってぃ":"தீ","っとぅ":"தூ","って":"தே","っと":"தோ","ったあ":"தாஆ","ってぃい":"தீஈ","っとぅう":"தூஊ","ってえ":"தேஏ","っとう":"தோஓ","っとお":"தோஓ","ってい":"தேஈ","っちゃ":"சா","っち":"சீ","っちゅ":"சூ","っちぇ":"சே","っちょ":"சோ","っちゃあ":"சாஆ","っちい":"சீஈ","っちゅう":"சூஊ","っちぇえ":"சேஏ","っちょう":"சோஓ","っちょお":"சோஓ","っちぇい":"சேீ","っつぁ":"சா","っつぃ":"சீ","っつ":"சூ","っつぇ":"சே","っつぉ":"சோ","っつぁあ":"சாஆ","っつぃい":"சீஈ","っつう":"சூஊ","っつぇえ":"சேஏ","っつぉう":"சோஓ","っつぉお":"சோஓ","っつぇい":"சேீ","っぱ":"பா","っぴ":"பீ","っぷ":"பூ","っぺ":"பே","っぽ":"போ","っぴゃ":"பீயா","っぴゅ":"பீயூ","っぴょ":"பீயோ","っぱあ":"பாஆ","っぴい":"பீஈ","っぷう":"பூஊ","っぺえ":"பேஏ","っぽう":"போஓ","っぽお":"போஓ","っぴゃあ":"பீயாஆ","っぴゅう":"பீயூஊ","っぴょう":"பீயோஓ","っぴょお":"பீயோஓ","っぺい":"பேஈ","ぁ":"ஆ","ぃ":"ஈ","ぅ":"ஊ","ぇ":"ஏ","ぉ":"ஓ","ゃ":"யா","ゅ":"யூ","ょ":"யோ","ぁあ":"ஆஆ","ぃい":"ஈஈ","ぅう":"ஊஊ","ぇえ":"ஏஏ","ぉう":"ஓஓ","ぉお":"ஓஓ","ゃあ":"யாஆ","ゅう":"யூஊ","ょう":"யோஓ","ょお":"யோஓ","ぇい":"யோஓ","ゔぁ":"வா","ゔぃ":"வீ","ゔ":"வூ","ゔぇ":"வே","ゔぉ":"வோ","ゔぁあ":"வாஆ","ゔぃい":"வீஈ","ゔう":"வூஊ","ゔぇえ":"வேஏ","ゔぉう":"வோஓ","ゔぉお":"வோஓ","ゔぇい":"வேஈ"},"additional":{},"endOfWord":{}}
},{}],20:[function(require,module,exports){
module.exports = {"base":{"あ":"อา","い":"อิ","う":"อุ","え":"เอ","お":"โอ","ああ":"อาอา","いい":"อิอิ","うう":"อุอุ","ええ":"เอเอ","おう":"โอโอ","おお":"โอโอ","えい":"เออิ","か":"คา","き":"คิ","く":"คุ","け":"เค","こ":"โค","きゃ":"เคีย","きゅ":"คิว","きょ":"เคียว","かあ":"คาอา","きい":"คิอิ","くう":"คุอุ","けえ":"เคเอ","こう":"โคโอ","こお":"โคโอ","きゃあ":"เคียอา","きゅう":"คิวอุ","きょう":"เคียวโอ","きょお":"เคียวโอ","けい":"เคอิ","が":"กา","ぎ":"กิ","ぐ":"กุ","げ":"เก","ご":"โก","ぎゃ":"เกีย","ぎゅ":"กิว","ぎょ":"เกียว","があ":"กาอา","ぎい":"กิอิ","ぐう":"กุอุ","げえ":"เกเอ","ごう":"โกโอ","ごお":"โกโอ","ぎゃあ":"เกียอา","ぎゅう":"กิวอุ","ぎょう":"เกียวโอ","ぎょお":"เกียวโอ","げい":"เกอิ","さ":"ซา","すぃ":"ซิ","す":"ซุ","せ":"เซ","そ":"โซ","さあ":"ซาอา","すぃい":"ซิอิ","すう":"ซุอุ","せえ":"เซเอ","そう":"โซโอ","そお":"โซโอ","せい":"เซอิ","しゃ":"ชา","し":"ชิ","しゅ":"ชุ","しぇ":"เช","しょ":"โช","しゃあ":"ชาอา","しい":"ชิอิ","しゅう":"ชุอุ","しぇえ":"เชเอ","しょう":"โชโอ","しょお":"โชโอ","しぇい":"เชอิ","ざ":"ซา","ずぃ":"ซิ","ず":"ซุ","ぜ":"เซ","ぞ":"โซ","ざあ":"ซาอา","ずぃい":"ซิอิ","ずう":"ซุอุ","ぜえ":"เซเอ","ぞう":"โซโอ","ぞお":"โซโอ","ぜい":"เซอิ","じゃ":"จา","じ":"จิ","じゅ":"จุ","じぇ":"เจ","じょ":"โจ","じゃあ":"จาอา","じい":"จิอิ","じゅう":"จุอุ","じぇえ":"เจเอ","じょう":"โจโอ","じょお":"โจโอ","じぇい":"เจอิ","た":"ตา","てぃ":"ติ","とぅ":"ตุ","て":"เต","と":"โต","たあ":"ตาอา","てぃい":"ติอิ","とぅう":"ตุอุ","てえ":"เตเอ","とう":"โตโอ","とお":"โตโอ","てい":"เตอิ","ちゃ":"ชา","ち":"ชิ","ちゅ":"ชุ","ちぇ":"เช","ちょ":"โช","ちゃあ":"ชาอา","ちい":"ชิอิ","ちゅう":"ชุอุ","ちぇえ":"เชเอ","ちょう":"โชโอ","ちょお":"โชโอ","ちぇい":"เชอิ","つぁ":"ซา","つぃ":"ซิ","つ":"ซุ","つぇ":"เซ","つぉ":"โซ","つぁあ":"ซาอา","つぃい":"ซิอิ","つう":"ซุอุ","つぇえ":"เซเอ","つぉう":"โซโอ","つぉお":"โซโอ","つぇい":"เซอิ","だ":"ดา","でぃ":"ดิ","どぅ":"ดุ","で":"เด","ど":"โด","だあ":"ดาอา","でぃい":"ดิอิ","どぅう":"ดุอุ","でえ":"เดเอ","どう":"โดโอ","どお":"โดโอ","でい":"เดอิ","ぢゃ":"จา","ぢ":"จิ","ぢゅ":"จุ","ぢぇ":"เจ","ぢょ":"โจ","ぢゃあ":"จาอา","ぢい":"จิอิ","ぢゅう":"จุอุ","ぢぇえ":"เจเอ","ぢょう":"โจโอ","ぢょお":"โจโอ","ぢぇい":"เจอิ","づ":"ซุ","づう":"ซุอุ","な":"นา","に":"นิ","ぬ":"นุ","ね":"เน","の":"โน","にゃ":"เนีย","にゅ":"นิว","にょ":"เนียว","なあ":"นาอา","にい":"นิอิ","ぬう":"นุอุ","ねえ":"เนเอ","のう":"โนโอ","のお":"โนโอ","にゃあ":"เนียอา","にゅう":"นิวอุ","にょう":"เนียวโอ","にょお":"เนียวโอ","ねい":"เนอิ","は":"ฮา","ひ":"ฮิ","へ":"เฮ","ほ":"โฮ","ひゃ":"เฮีย","ひゅ":"ฮิว","ひょ":"เฮียว","はあ":"ฮาอา","ひい":"ฮิอิ","へえ":"เฮเอ","ほう":"โฮโอ","ほお":"โฮโอ","ひゃあ":"เฮียอา","ひゅう":"ฮิวอุ","ひょう":"เฮียวโอ","ひょお":"เฮียวโอ","へい":"เฮอิ","ふぁ":"ฟา","ふぃ":"ฟิ","ふ":"ฮุ","ふぇ":"เฟ","ふぉ":"โฟ","ふぁあ":"ฟาอา","ふぃい":"ฟิอิ","ふう":"ฮุอุ","ふぇえ":"เฟเอ","ふぉう":"โฟโอ","ふぉお":"โฟโอ","ふぇい":"เฟอิ","ば":"บา","び":"บิ","ぶ":"บุ","べ":"เบ","ぼ":"โบ","びゃ":"เบีย","びゅ":"บิว","びょ":"เบียว","ばあ":"บาอา","びい":"บิอิ","ぶう":"บุอุ","べえ":"เบเอ","ぼう":"โบโอ","ぼお":"โบโอ","びゃあ":"เบียอา","びゅう":"บิวอุ","びょう":"เบียวโอ","びょお":"เบียวโอ","べい":"เบอิ","ぱ":"ปา","ぴ":"ปิ","ぷ":"ปุ","ぺ":"เป","ぽ":"โป","ぴゃ":"เปีย","ぴゅ":"ปิว","ぴょ":"เปียว","ぱあ":"ปาอา","ぴい":"ปิอิ","ぷう":"ปุอุ","ぺえ":"เปเอ","ぽう":"โปโอ","ぽお":"โปโอ","ぴゃあ":"เปียอา","ぴゅう":"ปิวอุ","ぴょう":"เปียวโอ","ぴょお":"เปียวโอ","ぺい":"เปอิ","ま":"มา","み":"มิ","む":"มุ","め":"เม","も":"โม","みゃ":"เมีย","みゅ":"มิว","みょ":"เมียว","まあ":"มาอา","みい":"มิอิ","むう":"มุอุ","めえ":"เมเอ","もう":"โมโอ","もお":"โมโอ","みゃあ":"เมียอา","みゅう":"มิวอุ","みょう":"เมียวโอ","みょお":"เมียวโอ","めい":"เมอิ","や":"ยา","ゆ":"ยุ","よ":"โย","やあ":"ยาอา","ゆう":"ยุอุ","よう":"โยโอ","よお":"โยโอ","ら":"รา","り":"ริ","る":"รุ","れ":"เร","ろ":"โร","りゃ":"เรีย","りゅ":"ริว","りょ":"เรียว","らあ":"ราอา","りい":"ริอิ","るう":"รุอุ","れえ":"เรเอ","ろう":"โรโอ","ろお":"โรโอ","りゃあ":"เรียอา","りゅう":"ริวอุ","りょう":"เรียวโอ","りょお":"เรียวโอ","れい":"เรอิ","わ":"วา","うぃ":"วิ","うぇ":"เว","うぉ":"โว","わあ":"วาอา","うぃい":"วิอิ","うぇえ":"เวเอ","うぉう":"โวโอ","うぉお":"โวโอ","うぇい":"เวอิ","ん":"น","を":"โอ","っ":"","んあ":"น'อา","んい":"น'อิ","んう":"น'อุ","んえ":"น'เอ","んお":"น'โอ","んや":"น'ยา","んゆ":"น'ยุ","んよ":"น'โย","んああ":"น'อาอา","んいい":"น'อิอิ","んうう":"น'อุอุ","んええ":"น'เอเอ","んおう":"น'โอโอ","んおお":"น'โอโอ","んやあ":"น'ยาอา","んゆう":"น'ยุอุ","んよう":"น'โยโอ","んよお":"น'โยโอ","んえい":"น'เออิ","っか":"กคา","っき":"กคิ","っく":"กคุ","っけ":"กเค","っこ":"กโค","っきゃ":"กเคีย","っきゅ":"กคิว","っきょ":"กเคียว","っかあ":"กคาอา","っきい":"กคิอิ","っくう":"กคุอุ","っけえ":"กเคเอ","っこう":"กโคโอ","っこお":"กโคโอ","っきゃあ":"กเคียอา","っきゅう":"กคิวอุ","っきょう":"กเคียวโอ","っきょお":"กเคียวโอ","っけい":"กเคอิ","っさ":"ดซา","っすぃ":"ดซิ","っす":"ดซุ","っせ":"ดเซ","っそ":"ดโซ","っさあ":"ดซาอา","っすぃい":"ดซิอิ","っすう":"ดซุอุ","っせえ":"ดเซเอ","っそう":"ดโซโอ","っそお":"ดโซโอ","っせい":"ดเซอิ","っしゃ":"ดชา","っし":"ดชิ","っしゅ":"ดชุ","っしぇ":"ดเช","っしょ":"ดโช","っしゃあ":"ดชาอา","っしい":"ดชิอิ","っしゅう":"ดชุอุ","っしぇえ":"ดเชเอ","っしょう":"ดโชโอ","っしょお":"ดโชโอ","っしぇい":"ดเชอิ","った":"ดตา","ってぃ":"ดติ","っとぅ":"ดตุ","って":"ดเต","っと":"ดโต","ったあ":"ดตาอา","ってぃい":"ดติอิ","っとぅう":"ดตุอุ","ってえ":"ดเตเอ","っとう":"ดโตโอ","っとお":"ดโตโอ","ってい":"ดเตอิ","っちゃ":"ดชา","っち":"ดชิ","っちゅ":"ดชุ","っちぇ":"ดเช","っちょ":"ดโช","っちゃあ":"ดชาอา","っちい":"ดชิอิ","っちゅう":"ดชุอุ","っちぇえ":"ดเชเอ","っちょう":"ดโชโอ","っちょお":"ดโชโอ","っちぇい":"ดเชอิ","っつぁ":"ดซา","っつぃ":"ดซิ","っつ":"ดซุ","っつぇ":"ดเซ","っつぉ":"ดโซ","っつぁあ":"ดซาอา","っつぃい":"ดซิอิ","っつう":"ดซุอุ","っつぇえ":"ดเซเอ","っつぉう":"ดโซโอ","っつぉお":"ดโซโอ","っつぇい":"ดเซอิ","っぱ":"บปา","っぴ":"บปิ","っぷ":"บปุ","っぺ":"บเป","っぽ":"บโป","っぴゃ":"บเปีย","っぴゅ":"บปิว","っぴょ":"บเปียว","っぱあ":"บปาอา","っぴい":"บปิอิ","っぷう":"บปุอุ","っぺえ":"บเปเอ","っぽう":"บโปโอ","っぽお":"บโปโอ","っぴゃあ":"บเปียอา","っぴゅう":"บปิวอุ","っぴょう":"บเปียวโอ","っぴょお":"บเปียวโอ","っぺい":"บเปอิ","ぁ":"อา","ぃ":"อิ","ぅ":"อุ","ぇ":"เอ","ぉ":"โอ","ゃ":"ยา","ゅ":"ยุ","ょ":"โย","ぁあ":"อาอา","ぃい":"อิอิ","ぅう":"อุอุ","ぇえ":"เอเอ","ぉう":"โอโอ","ぉお":"โอโอ","ゃあ":"ยาอา","ゅう":"ยุอุ","ょう":"โยโอ","ょお":"โยโอ","ぇい":"เออิ","ゔぁ":"บา","ゔぃ":"บิ","ゔ":"บุ","ゔぇ":"เบ","ゔぉ":"โบ","ゔぁあ":"บาอา","ゔぃい":"บิอิ","ゔう":"บุอุ","ゔぇえ":"เบเอ","ゔぉう":"โบโอ","ゔぉお":"โบโอ","ゔぇい":"เบอิ","あい":"ไอ","かい":"ไค","がい":"ไก","さい":"ไซ","しゃい":"ไช","ざい":"ไซ","じゃい":"ไจ","たい":"ไต","ちゃい":"ไช","つぁい":"ไซ","だい":"ได","ぢゃい":"ไจ","ない":"ไน","はい":"ไฮ","ふぁい":"ไฟ","ばい":"ไบ","ぱい":"ไป","まい":"ไม","やい":"ไย","らい":"ไร","わい":"ไว","んあい":"น'ไอ","っかい":"กไค","っさい":"ดไซ","っしゃい":"ดไช","ったい":"ดไต","っちゃい":"ดไช","っつぁい":"ดไซ","っぱい":"บไป","ぁい":"ไอ","ゔぁい":"ไย"},"additional":{"あ":"อั","い":"อิ","う":"อุ","え":"เอ็","お":"โอ","ああ":"อาอั","いい":"อิอิ","うう":"อุอุ","ええ":"เอะเอ็","おう":"โอโอ","おお":"โอโอ","えい":"เอะอิ","か":"คั","き":"คิ","く":"คุ","け":"เค็","こ":"โค","きゃ":"เคีย","きゅ":"คิว","きょ":"เคียว","かあ":"คาอั","きい":"คิอิ","くう":"คุอุ","けえ":"เคะเอ็","こう":"โคโอ","こお":"โคโอ","きゃあ":"เคียอั","きゅう":"คิวอุ","きょう":"เคียวโอ","きょお":"เคียวโอ","けい":"เคะอิ","が":"กั","ぎ":"กิ","ぐ":"กุ","げ":"เก็","ご":"โก","ぎゃ":"เกีย","ぎゅ":"กิว","ぎょ":"เกียว","があ":"กาอั","ぎい":"กิอิ","ぐう":"กุอุ","げえ":"เกะเอ็","ごう":"โกโอ","ごお":"โกโอ","ぎゃあ":"เกียอั","ぎゅう":"กิวอุ","ぎょう":"เกียวโอ","ぎょお":"เกียวโอ","げい":"เกะอิ","さ":"ซั","すぃ":"ซิ","す":"ซุ","せ":"เซ็","そ":"โซ","さあ":"ซาอั","すぃい":"ซิอิ","すう":"ซุอุ","せえ":"เซะเอ็","そう":"โซโอ","そお":"โซโอ","せい":"เซะอิ","しゃ":"ชั","し":"ชิ","しゅ":"ชุ","しぇ":"เช็","しょ":"โช","しゃあ":"ชาอั","しい":"ชิอิ","しゅう":"ชุอุ","しぇえ":"เชะเอ็","しょう":"โชโอ","しょお":"โชโอ","しぇい":"เชะอิ","ざ":"ซั","ずぃ":"ซิ","ず":"ซุ","ぜ":"เซ็","ぞ":"โซ","ざあ":"ซาอั","ずぃい":"ซิอิ","ずう":"ซุอุ","ぜえ":"เซะเอ็","ぞう":"โซโอ","ぞお":"โซโอ","ぜい":"เซะอิ","じゃ":"จั","じ":"จิ","じゅ":"จุ","じぇ":"เจ็","じょ":"โจ","じゃあ":"จาอั","じい":"จิอิ","じゅう":"จุอุ","じぇえ":"เจะเอ็","じょう":"โจโอ","じょお":"โจโอ","じぇい":"เจะอิ","た":"ตั","てぃ":"ติ","とぅ":"ตุ","て":"เต็","と":"โต","たあ":"ตาอั","てぃい":"ติอิ","とぅう":"ตุอุ","てえ":"เตะเอ็","とう":"โตโอ","とお":"โตโอ","てい":"เตะอิ","ちゃ":"ชั","ち":"ชิ","ちゅ":"ชุ","ちぇ":"เช็","ちょ":"โช","ちゃあ":"ชาอั","ちい":"ชิอิ","ちゅう":"ชุอุ","ちぇえ":"เชะเอ็","ちょう":"โชโอ","ちょお":"โชโอ","ちぇい":"เชะอิ","つぁ":"ซั","つぃ":"ซิ","つ":"ซุ","つぇ":"เซ็","つぉ":"โซ","つぁあ":"ซาอั","つぃい":"ซิอิ","つう":"ซุอุ","つぇえ":"เซะเอ็","つぉう":"โซโอ","つぉお":"โซโอ","つぇい":"เซะอิ","だ":"ดั","でぃ":"ดิ","どぅ":"ดุ","で":"เด็","ど":"โด","だあ":"ดาอั","でぃい":"ดิอิ","どぅう":"ดุอุ","でえ":"เดะเอ็","どう":"โดโอ","どお":"โดโอ","でい":"เดะอิ","ぢゃ":"จั","ぢ":"จิ","ぢゅ":"จุ","ぢぇ":"เจ็","ぢょ":"โจ","ぢゃあ":"จาอั","ぢい":"จิอิ","ぢゅう":"จุอุ","ぢぇえ":"เจะเอ็","ぢょう":"โจโอ","ぢょお":"โจโอ","ぢぇい":"เจะอิ","づ":"ซุ","づう":"ซุอุ","な":"นั","に":"นิ","ぬ":"นุ","ね":"เน็","の":"โน","にゃ":"เนีย","にゅ":"นิว","にょ":"เนียว","なあ":"นาอั","にい":"นิอิ","ぬう":"นุอุ","ねえ":"เนะเอ็","のう":"โนโอ","のお":"โนโอ","にゃあ":"เนียอั","にゅう":"นิวอุ","にょう":"เนียวโอ","にょお":"เนียวโอ","ねい":"เนะอิ","は":"ฮั","ひ":"ฮิ","へ":"เฮ็","ほ":"โฮ","ひゃ":"เฮีย","ひゅ":"ฮิว","ひょ":"เฮียว","はあ":"ฮาอั","ひい":"ฮิอิ","へえ":"เฮะเอ็","ほう":"โฮโอ","ほお":"โฮโอ","ひゃあ":"เฮียอั","ひゅう":"ฮิวอุ","ひょう":"เฮียวโอ","ひょお":"เฮียวโอ","へい":"เฮะอิ","ふぁ":"ฟั","ふぃ":"ฟิ","ふ":"ฮุ","ふぇ":"เฟ็","ふぉ":"โฟ","ふぁあ":"ฟาอั","ふぃい":"ฟิอิ","ふう":"ฮุอุ","ふぇえ":"เฟะเอ็","ふぉう":"โฟโอ","ふぉお":"โฟโอ","ふぇい":"เฟะอิ","ば":"บั","び":"บิ","ぶ":"บุ","べ":"เบ็","ぼ":"โบ","びゃ":"เบีย","びゅ":"บิว","びょ":"เบียว","ばあ":"บาอั","びい":"บิอิ","ぶう":"บุอุ","べえ":"เบะเอ็","ぼう":"โบโอ","ぼお":"โบโอ","びゃあ":"เบียอั","びゅう":"บิวอุ","びょう":"เบียวโอ","びょお":"เบียวโอ","べい":"เบะอิ","ぱ":"ปั","ぴ":"ปิ","ぷ":"ปุ","ぺ":"เป็","ぽ":"โป","ぴゃ":"เปีย","ぴゅ":"ปิว","ぴょ":"เปียว","ぱあ":"ปาอั","ぴい":"ปิอิ","ぷう":"ปุอุ","ぺえ":"เปะเอ็","ぽう":"โปโอ","ぽお":"โปโอ","ぴゃあ":"เปียอั","ぴゅう":"ปิวอุ","ぴょう":"เปียวโอ","ぴょお":"เปียวโอ","ぺい":"เปะอิ","ま":"มั","み":"มิ","む":"มุ","め":"เม็","も":"โม","みゃ":"เมีย","みゅ":"มิว","みょ":"เมียว","まあ":"มาอั","みい":"มิอิ","むう":"มุอุ","めえ":"เมะเอ็","もう":"โมโอ","もお":"โมโอ","みゃあ":"เมียอั","みゅう":"มิวอุ","みょう":"เมียวโอ","みょお":"เมียวโอ","めい":"เมะอิ","や":"ยั","ゆ":"ยุ","よ":"โย","やあ":"ยาอั","ゆう":"ยุอุ","よう":"โยโอ","よお":"โยโอ","ら":"รั","り":"ริ","る":"รุ","れ":"เร็","ろ":"โร","りゃ":"เรีย","りゅ":"ริว","りょ":"เรียว","らあ":"ราอั","りい":"ริอิ","るう":"รุอุ","れえ":"เระเอ็","ろう":"โรโอ","ろお":"โรโอ","りゃあ":"เรียอั","りゅう":"ริวอุ","りょう":"เรียวโอ","りょお":"เรียวโอ","れい":"เระอิ","わ":"วั","うぃ":"วิ","うぇ":"เว็","うぉ":"โว","わあ":"วาอั","うぃい":"วิอิ","うぇえ":"เวะเอ็","うぉう":"โวโอ","うぉお":"โวโอ","うぇい":"เวะอิ","ん":"น","を":"โอ","っ":"","んあ":"น'อั","んい":"น'อิ","んう":"น'อุ","んえ":"น'เอ็","んお":"น'โอ","んや":"น'ยั","んゆ":"น'ยุ","んよ":"น'โย","んああ":"น'อาอั","んいい":"น'อิอิ","んうう":"น'อุอุ","んええ":"น'เอะเอ็","んおう":"น'โอโอ","んおお":"น'โอโอ","んやあ":"น'ยัอั","んゆう":"น'ยุอุ","んよう":"น'โยโอ","んよお":"น'โยโอ","んえい":"น'เอะอิ","っか":"กคั","っき":"กคิ","っく":"กคุ","っけ":"กเค็","っこ":"กโค","っきゃ":"กเคีย","っきゅ":"กคิว","っきょ":"กเคียว","っかあ":"กคาอั","っきい":"กคิอิ","っくう":"กคุอุ","っけえ":"กเคะเอ็","っこう":"กโคโอ","っこお":"กโคโอ","っきゃあ":"กเคียอั","っきゅう":"กคิวอุ","っきょう":"กเคียวโอ","っきょお":"กเคียวโอ","っけい":"กเคะอิ","っさ":"ดซั","っすぃ":"ดซิ","っす":"ดซุ","っせ":"ดเซ็","っそ":"ดโซ","っさあ":"ดซาอั","っすぃい":"ดซิอิ","っすう":"ดซุอุ","っせえ":"ดเซะเอ็","っそう":"ดโซโอ","っそお":"ดโซโอ","っせい":"ดเซะอิ","っしゃ":"ดชั","っし":"ดชิ","っしゅ":"ดชุ","っしぇ":"ดเช็","っしょ":"ดโช","っしゃあ":"ดชาอั","っしい":"ดชิอิ","っしゅう":"ดชุอุ","っしぇえ":"ดเชะเอ็","っしょう":"ดโชโอ","っしょお":"ดโชโอ","っしぇい":"ดเชะอิ","った":"ดตั","ってぃ":"ดติ","っとぅ":"ดตุ","って":"ดเต็","っと":"ดโต","ったあ":"ดตาอั","ってぃい":"ดติอิ","っとぅう":"ดตุอุ","ってえ":"ดเตะเอ็","っとう":"ดโตโอ","っとお":"ดโตโอ","ってい":"ดเตะอิ","っちゃ":"ดชั","っち":"ดชิ","っちゅ":"ดชุ","っちぇ":"ดเช็","っちょ":"ดโช","っちゃあ":"ดชาอั","っちい":"ดชิอิ","っちゅう":"ดชุอุ","っちぇえ":"ดเชะเอ็","っちょう":"ดโชโอ","っちょお":"ดโชโอ","っちぇい":"ดเชะอิ","っつぁ":"ดซั","っつぃ":"ดซิ","っつ":"ดซุ","っつぇ":"ดเซ็","っつぉ":"ดโซ","っつぁあ":"ดซาอั","っつぃい":"ดซิอิ","っつう":"ดซุอุ","っつぇえ":"ดเซะเอ็","っつぉう":"ดโซโอ","っつぉお":"ดโซโอ","っつぇい":"ดเซะอิ","っぱ":"บปั","っぴ":"บปิ","っぷ":"บปุ","っぺ":"บเป็","っぽ":"บโป","っぴゃ":"บเปีย","っぴゅ":"บปิว","っぴょ":"บเปียว","っぱあ":"บปาอั","っぴい":"บปิอิ","っぷう":"บปุอุ","っぺえ":"บเปะเอ็","っぽう":"บโปโอ","っぽお":"บโปโอ","っぴゃあ":"บเปียอั","っぴゅう":"บปิวอุ","っぴょう":"บเปียวโอ","っぴょお":"บเปียวโอ","っぺい":"บเปะอิ","ぁ":"อั","ぃ":"อิ","ぅ":"อุ","ぇ":"เอ็","ぉ":"โอ","ゃ":"ยั","ゅ":"ยุ","ょ":"โย","ぁあ":"อาอั","ぃい":"อิอิ","ぅう":"อุอุ","ぇえ":"เอะเอ็","ぉう":"โอโอ","ぉお":"โอโอ","ゃあ":"ยัอั","ゅう":"ยุอุ","ょう":"โยโอ","ょお":"โยโอ","ぇい":"เอ็อิ","ゔぁ":"บั","ゔぃ":"บิ","ゔ":"บุ","ゔぇ":"เบ็","ゔぉ":"โบ","ゔぁあ":"บาอั","ゔぃい":"บิอิ","ゔう":"บุอุ","ゔぇえ":"เบะเอ็","ゔぉう":"โบโบ","ゔぉお":"โบโบ","ゔぇい":"เบะอิ","あい":"ไอ","かい":"ไค","がい":"ไก","さい":"ไซ","しゃい":"ไช","ざい":"ไซ","じゃい":"ไจ","たい":"ไต","ちゃい":"ไช","つぁい":"ไซ","だい":"ได","ぢゃい":"ไจ","ない":"ไน","はい":"ไฮ","ふぁい":"ไฟ","ばい":"ไบ","ぱい":"ไป","まい":"ไม","やい":"ไย","らい":"ไร","わい":"ไว","んあい":"น'ไอ","っかい":"กไค","っさい":"ดไซ","っしゃい":"ดไช","ったい":"ดไต","っちゃい":"ดไช","っつぁい":"ดไซ","っぱい":"บไป","ぁい":"ไอ","ゔぁい":"ไย"},"endOfWord":{"あ":"อะ","い":"อิ","う":"อุ","え":"เอะ","お":"โอะ","ああ":"อาอะ","いい":"อิอิ","うう":"อุอุ","ええ":"เอะเอะ","おう":"โอโอะ","おお":"โอโอะ","えい":"เอะอิ","か":"คะ","き":"คิ","く":"คุ","け":"เคะ","こ":"โคะ","きゃ":"เคีย","きゅ":"คิว","きょ":"เคียว","かあ":"คาคะ","きい":"คิอิ","くう":"คุอุ","けえ":"เคะเอะ","こう":"โคโอะ","こお":"โคโอะ","きゃあ":"เคียอะ","きゅう":"คิวอุ","きょう":"เคียวโอะ","きょお":"เคียวโอะ","けい":"เคะอิ","が":"กะ","ぎ":"กิ","ぐ":"กุ","げ":"เกะ","ご":"โกะ","ぎゃ":"เกีย","ぎゅ":"กิว","ぎょ":"เกียว","があ":"กากะ","ぎい":"กิอิ","ぐう":"กุอุ","げえ":"เกะเอะ","ごう":"โกโอะ","ごお":"โกโอะ","ぎゃあ":"เกียอะ","ぎゅう":"กิวอุ","ぎょう":"เกียวโอะ","ぎょお":"เกียวโอะ","げい":"เกะอิ","さ":"ซะ","すぃ":"ซิ","す":"ซุ","せ":"เซะ","そ":"โซะ","さあ":"ซาซะ","すぃい":"ซิอิ","すう":"ซุอุ","せえ":"เซะเอะ","そう":"โซโอะ","そお":"โซโอะ","せい":"เซะอิ","しゃ":"ชะ","し":"ชิ","しゅ":"ชุ","しぇ":"เชะ","しょ":"โชะ","しゃあ":"ชาชะ","しい":"ชิอิ","しゅう":"ชุอุ","しぇえ":"เชะเอะ","しょう":"โชโอะ","しょお":"โชโอะ","しぇい":"เชะอิ","ざ":"ซะ","ずぃ":"ซิ","ず":"ซุ","ぜ":"เซะ","ぞ":"โซะ","ざあ":"ซาซะ","ずぃい":"ซิอิ","ずう":"ซุอุ","ぜえ":"เซะเอะ","ぞう":"โซโอะ","ぞお":"โซโอะ","ぜい":"เซะอิ","じゃ":"จะ","じ":"จิ","じゅ":"จุ","じぇ":"เจะ","じょ":"โจะ","じゃあ":"จาจะ","じい":"จิอิ","じゅう":"จุอุ","じぇえ":"เจะเอะ","じょう":"โจโอะ","じょお":"โจโอะ","じぇい":"เจะอิ","た":"ตะ","てぃ":"ติ","とぅ":"ตุ","て":"เตะ","と":"โตะ","たあ":"ตาตะ","てぃい":"ติอิ","とぅう":"ตุอุ","てえ":"เตะเอะ","とう":"โตโอะ","とお":"โตโอะ","てい":"เตะอิ","ちゃ":"ชะ","ち":"ชิ","ちゅ":"ชุ","ちぇ":"เชะ","ちょ":"โชะ","ちゃあ":"ชาชะ","ちい":"ชิอิ","ちゅう":"ชุอุ","ちぇえ":"เชะเอะ","ちょう":"โชโอะ","ちょお":"โชโอะ","ちぇい":"เชะอิ","つぁ":"ซะ","つぃ":"ซิ","つ":"ซุ","つぇ":"เซะ","つぉ":"โซะ","つぁあ":"ซาซะ","つぃい":"ซิอิ","つう":"ซุอุ","つぇえ":"เซะเอะ","つぉう":"โซโอะ","つぉお":"โซโอะ","つぇい":"เซะอิ","だ":"ดะ","でぃ":"ดิ","どぅ":"ดุ","で":"เดะ","ど":"โดะ","だあ":"ดาดะ","でぃい":"ดิอิ","どぅう":"ดุอุ","でえ":"เดะเอะ","どう":"โดโอะ","どお":"โดโอะ","でい":"เดะอิ","ぢゃ":"จะ","ぢ":"จิ","ぢゅ":"จุ","ぢぇ":"เจะ","ぢょ":"โจะ","ぢゃあ":"จาจะ","ぢい":"จิอิ","ぢゅう":"จุอุ","ぢぇえ":"เจะเอะ","ぢょう":"โจโอะ","ぢょお":"โจโอะ","ぢぇい":"เจะอิ","づ":"ซุ","づう":"ซุอุ","な":"นะ","に":"นิ","ぬ":"นุ","ね":"เนะ","の":"โนะ","にゃ":"เนีย","にゅ":"นิว","にょ":"เนียว","なあ":"นานะ","にい":"นิอิ","ぬう":"นุอุ","ねえ":"เนะเอะ","のう":"โนโอะ","のお":"โนโอะ","にゃあ":"เนียอะ","にゅう":"นิวอุ","にょう":"เนียวโอะ","にょお":"เนียวโอะ","ねい":"เนะอิ","は":"ฮะ","ひ":"ฮิ","へ":"เฮะ","ほ":"โฮะ","ひゃ":"เฮีย","ひゅ":"ฮิว","ひょ":"เฮียว","はあ":"ฮาฮะ","ひい":"ฮิอิ","へえ":"เฮะเอะ","ほう":"โฮโอะ","ほお":"โฮโอะ","ひゃあ":"เฮียอะ","ひゅう":"ฮิวอุ","ひょう":"เฮียวโอะ","ひょお":"เฮียวโอะ","へい":"เฮะอิ","ふぁ":"ฟะ","ふぃ":"ฟิ","ふ":"ฮุ","ふぇ":"เฟะ","ふぉ":"โฟะ","ふぁあ":"ฟาฟะ","ふぃい":"ฟิอิ","ふう":"ฮุอุ","ふぇえ":"เฟะเอะ","ふぉう":"โฟโอะ","ふぉお":"โฟโอะ","ふぇい":"เฟะอิ","ば":"บะ","び":"บิ","ぶ":"บุ","べ":"เบะ","ぼ":"โบะ","びゃ":"เบีย","びゅ":"บิว","びょ":"เบียว","ばあ":"บาบะ","びい":"บิอิ","ぶう":"บุอุ","べえ":"เบะเอะ","ぼう":"โบโอะ","ぼお":"โบโอะ","びゃあ":"เบียอะ","びゅう":"บิวอุ","びょう":"เบียวโอะ","びょお":"เบียวโอะ","べい":"เบะอิ","ぱ":"ปะ","ぴ":"ปิ","ぷ":"ปุ","ぺ":"เปะ","ぽ":"โปะ","ぴゃ":"เปีย","ぴゅ":"ปิว","ぴょ":"เปียว","ぱあ":"ปาปะ","ぴい":"ปิอิ","ぷう":"ปุอุ","ぺえ":"เปะเอะ","ぽう":"โปโอะ","ぽお":"โปโอะ","ぴゃあ":"เปียอะ","ぴゅう":"ปิวอุ","ぴょう":"เปียวโอะ","ぴょお":"เปียวโอะ","ぺい":"เปะอิ","ま":"มะ","み":"มิ","む":"มุ","め":"เมะ","も":"โมะ","みゃ":"เมีย","みゅ":"มิว","みょ":"เมียว","まあ":"มามะ","みい":"มิอิ","むう":"มุอุ","めえ":"เมะเอะ","もう":"โมโอะ","もお":"โมโอะ","みゃあ":"เมียอะ","みゅう":"มิวอุ","みょう":"เมียวโอะ","みょお":"เมียวโอะ","めい":"เมะอิ","や":"ยะ","ゆ":"ยุ","よ":"โยะ","やあ":"ยายะ","ゆう":"ยุอุ","よう":"โยโอะ","よお":"โยโอะ","ら":"ระ","り":"ริ","る":"รุ","れ":"เระ","ろ":"โระ","りゃ":"เรีย","りゅ":"ริว","りょ":"เรียว","らあ":"ราระ","りい":"ริอิ","るう":"รุอุ","れえ":"เระเอะ","ろう":"โรโอะ","ろお":"โรโอะ","りゃあ":"เรียอะ","りゅう":"ริวอุ","りょう":"เรียวโอะ","りょお":"เรียวโอะ","れい":"เระอิ","わ":"วะ","うぃ":"วิ","うぇ":"เวะ","うぉ":"โวะ","わあ":"วาวะ","うぃい":"วิอิ","うぇえ":"เวะเอะ","うぉう":"โวโอะ","うぉお":"โวโอะ","うぇい":"เวะอิ","ん":"น","を":"โอะ","っ":"","んあ":"น'อะ","んい":"น'อิ","んう":"น'อุ","んえ":"น'เอะ","んお":"น'โอะ","んや":"น'ยะ","んゆ":"น'ยุ","んよ":"น'โยะ","んああ":"น'อาอะ","んいい":"น'อิอิ","んうう":"น'อุอุ","んええ":"น'เอะเอะ","んおう":"น'โอะโอะ","んおお":"น'โอะโอะ","んやあ":"น'ยะอะ","んゆう":"น'ยุอุ","んよう":"น'โยะโอะ","んよお":"น'โยะโอะ","んえい":"น'เอะอิ","っか":"กคะ","っき":"กคิ","っく":"กคุ","っけ":"กเคะ","っこ":"กโคะ","っきゃ":"กเคีย","っきゅ":"กคิว","っきょ":"กเคียว","っかあ":"กคาอะ","っきい":"กคิอิ","っくう":"กคุอุ","っけえ":"กเคะเอะ","っこう":"กโคโอะ","っこお":"กโคโอะ","っきゃあ":"กเคียอะ","っきゅう":"กคิวอุ","っきょう":"กเคียวโอะ","っきょお":"กเคียวโอะ","っけい":"กเคะอิ","っさ":"ดซะ","っすぃ":"ดซิ","っす":"ดซุ","っせ":"ดเซะ","っそ":"ดโซะ","っさあ":"ดซาอะ","っすぃい":"ดซิอิ","っすう":"ดซุอุ","っせえ":"ดเซะเอะ","っそう":"ดโซโอะ","っそお":"ดโซโอะ","っせい":"ดเซะอิ","っしゃ":"ดชะ","っし":"ดชิ","っしゅ":"ดชุ","っしぇ":"ดเชะ","っしょ":"ดโชะ","っしゃあ":"ดชาอะ","っしい":"ดชิอิ","っしゅう":"ดชุอุ","っしぇえ":"ดเชะเอะ","っしょう":"ดโชโอะ","っしょお":"ดโชโอะ","っしぇい":"ดเชะอิ","った":"ดตะ","ってぃ":"ดติ","っとぅ":"ดตุ","って":"ดเตะ","っと":"ดโตะ","ったあ":"ดตาอะ","ってぃい":"ดติอิ","っとぅう":"ดตุอุ","ってえ":"ดเตะเอะ","っとう":"ดโตโอะ","っとお":"ดโตโอะ","ってい":"ดเตะอิ","っちゃ":"ดชะ","っち":"ดชิ","っちゅ":"ดชุ","っちぇ":"ดเชะ","っちょ":"ดโชะ","っちゃあ":"ดชาอะ","っちい":"ดชิอิ","っちゅう":"ดชุอุ","っちぇえ":"ดเชะเอะ","っちょう":"ดโชโอะ","っちょお":"ดโชโอะ","っちぇい":"ดเชะอิ","っつぁ":"ดซะ","っつぃ":"ดซิ","っつ":"ดซุ","っつぇ":"ดเซะ","っつぉ":"ดโซะ","っつぁあ":"ดซาอะ","っつぃい":"ดซิอิ","っつう":"ดซุอุ","っつぇえ":"ดเซะเอะ","っつぉう":"ดโซโอะ","っつぉお":"ดโซโอะ","っつぇい":"ดเซะอิ","っぱ":"บปะ","っぴ":"บปิ","っぷ":"บปุ","っぺ":"บเปะ","っぽ":"บโปะ","っぴゃ":"บเปีย","っぴゅ":"บปิว","っぴょ":"บเปียว","っぱあ":"บปาปะ","っぴい":"บปิอิ","っぷう":"บปุอุ","っぺえ":"บเปะเอะ","っぽう":"บโปโอะ","っぽお":"บโปโอะ","っぴゃあ":"บเปียอะ","っぴゅう":"บปิวอุ","っぴょう":"บเปียวโอะ","っぴょお":"บเปียวโอะ","っぺい":"บเปะอิ","ぁ":"อะ","ぃ":"อิ","ぅ":"อุ","ぇ":"เอะ","ぉ":"โอะ","ゃ":"ยะ","ゅ":"ยุ","ょ":"โยะ","ぁあ":"อาอะ","ぃい":"อิอิ","ぅう":"อุอุ","ぇえ":"เอะเอะ","ぉう":"โอโอะ","ぉお":"โอโอะ","ゃあ":"ยาอะ","ゅう":"ยุอุ","ょう":"โยโอะ","ょお":"โยโอะ","ぇい":"เอะอิ","ゔぁ":"บะ","ゔぃ":"บิ","ゔ":"บุ","ゔぇ":"เบะ","ゔぉ":"โบะ","ゔぁあ":"บาอะ","ゔぃい":"บิอิ","ゔう":"บุอุ","ゔぇえ":"เบะเอะ","ゔぉう":"โบะโอะ","ゔぉお":"โบะโอะ","ゔぇい":"เบะอิ","あい":"ไอ","かい":"ไค","がい":"ไก","さい":"ไซ","しゃい":"ไช","ざい":"ไซ","じゃい":"ไจ","たい":"ไต","ちゃい":"ไช","つぁい":"ไซ","だい":"ได","ぢゃい":"ไจ","ない":"ไน","はい":"ไฮ","ふぁい":"ไฟ","ばい":"ไบ","ぱい":"ไป","まい":"ไม","やい":"ไย","らい":"ไร","わい":"ไว","んあい":"น'ไอ","っかい":"กไค","っさい":"ดไซ","っしゃい":"ดไช","ったい":"ดไต","っちゃい":"ดไช","っつぁい":"ดไซ","っぱい":"บไป","ぁい":"ไอ","ゔぁい":"ไย"}}
},{}],21:[function(require,module,exports){
module.exports = {"base":{"あ":"ཨ་","い":"ཨི་","う":"ཨུ་","え":"ཨེ་","お":"ཨོ་","ああ":"ཨ་ཨ་","いい":"ཨི་ཨི་","うう":"ཨུ་ཨུ་","ええ":"ཨེ་ཨེ་","おう":"ཨོ་ཨོ་","おお":"ཨོ་ཨོ་","えい":"ཨེ་ཨི་","か":"ཁ་","き":"ཁི་","く":"ཁུ་","け":"ཁེ་","こ":"ཁོ་","きゃ":"ཁིཡཱ་","きゅ":"ཁིཡུ་","きょ":"ཁིཡོ་","かあ":"ཁ་ཨ་","きい":"ཁི་ཨི་","くう":"ཁུ་ཨུ་","けえ":"ཁེ་ཨེ་","こう":"ཁོ་ཨོ་","こお":"ཁོ་ཨོ་","きゃあ":"ཁིཡཱ་ཨ་","きゅう":"ཁིཡུ་ཨུ་","きょう":"ཁིཡོ་ཨོ་","きょお":"ཁིཡོ་ཨོ་","けい":"ཁེ་ཨི་","が":"རྒ་","ぎ":"རྒི་","ぐ":"རྒུ་","げ":"རྒེ་","ご":"རྒོ་","ぎゃ":"རྒིཡཱ་","ぎゅ":"རྒིཡུ་","ぎょ":"རྒིཡོ་","があ":"རྒ་ཨ་","ぎい":"རྒི་ཨི་","ぐう":"རྒུ་ཨུ་","げえ":"རྒེ་ཨེ་","ごう":"རྒོ་ཨོ་","ごお":"རྒོ་ཨོ་","ぎゃあ":"རྒིཡཱ་ཨ་","ぎゅう":"རྒིཡུ་ཨུ་","ぎょう":"རྒིཡོ་ཨོ་","ぎょお":"རྒིཡོ་ཨོ་","げい":"རྒེ་ཨི་","さ":"ས་","すぃ":"སི་","す":"སུ་","せ":"སེ་","そ":"སོ་","さあ":"ས་ཨ་","すぃい":"སི་ཨི་","すう":"སུ་ཨུ་","せえ":"སེ་ཨེ་","そう":"སོ་ཨོ་","そお":"སོ་ཨོ་","せい":"སེ་ཨི་","しゃ":"ཤ་","し":"ཤི་","しゅ":"ཤུ་","しぇ":"ཤེ་","しょ":"ཤོ་","しゃあ":"ཤ་ཨ་","しい":"ཤི་ཨི་","しゅう":"ཤུ་ཨུ་","しぇえ":"ཤེ་ཨེ་","しょう":"ཤོ་ཨོ་","しょお":"ཤོ་ཨོ་","しぇい":"ཤེ་ཨི་","ざ":"རྫ་","ずぃ":"རྫི་","ず":"རྫུ་","ぜ":"རྫེ་","ぞ":"རྫོ་","ざあ":"རྫ་ཨ་","ずぃい":"རྫི་ཨི་","ずう":"རྫུ་ཨུ་","ぜえ":"རྫེ་ཨེ་","ぞう":"རྫོ་ཨོ་","ぞお":"རྫོ་ཨོ་","ぜい":"རྫེ་ཨི་","じゃ":"རྗ་","じ":"རྗི་","じゅ":"རྗུ་","じぇ":"རྗེ་","じょ":"རྗོ་","じゃあ":"རྗ་ཨ་","じい":"རྗི་ཨི་","じゅう":"རྗུ་ཨུ་","じぇえ":"རྗེ་ཨེ་","じょう":"རྗོ་ཨོ་","じょお":"རྗོ་ཨོ་","じぇい":"རྗེ་ཨི་","た":"ཐ་","てぃ":"ཐི་","とぅ":"ཐུ་","て":"ཐེ་","と":"ཐོ་","たあ":"ཐ་ཨ་","てぃい":"ཐི་ཨི་","とぅう":"ཐུ་ཨུ་","てえ":"ཐེ་ཨེ་","とう":"ཐོ་ཨོ་","とお":"ཐོ་ཨོ་","てい":"ཐེ་ཨི་","ちゃ":"ཆ་","ち":"ཆི་","ちゅ":"ཆུ་","ちぇ":"ཆེ་","ちょ":"ཆོ་","ちゃあ":"ཆ་ཨ་","ちい":"ཆི་ཨི་","ちゅう":"ཆུ་ཨུ་","ちぇえ":"ཆེ་ཨེ་","ちょう":"ཆོ་ཨོ་","ちょお":"ཆོ་ཨོ་","ちぇい":"ཆེ་ཨི་","つぁ":"ཙ་","つぃ":"ཙི་","つ":"ཙུ་","つぇ":"ཙེ་","つぉ":"ཙོ་","つぁあ":"ཙ་ཨ་","つぃい":"ཙི་ཨི་","つう":"ཙུ་ཨུ་","つぇえ":"ཙེ་ཨེ་","つぉう":"ཙོ་ཨོ་","つぉお":"ཙོ་ཨོ་","つぇい":"ཙེ་ཨི་","だ":"རྡ་","でぃ":"རྡི་","どぅ":"རྡུ་","で":"རྡེ་","ど":"རྡོ་","だあ":"རྡ་ཨ་","でぃい":"རྡི་ཨི་","どぅう":"རྡུ་ཨུ་","でえ":"རྡེ་ཨེ་","どう":"རྡོ་ཨོ་","どお":"རྡོ་ཨོ་","でい":"རྡེ་ཨི་","ぢゃ":"རྗ་","ぢ":"རྗི་","ぢゅ":"རྗུ་","ぢぇ":"རྗེ་","ぢょ":"རྗོ་","ぢゃあ":"རྗ་ཨ་","ぢい":"རྗི་ཨི་","ぢゅう":"རྗུ་ཨུ་","ぢぇえ":"རྗེ་ཨེ་","ぢょう":"རྗོ་ཨོ་","ぢょお":"རྗོ་ཨོ་","ぢぇい":"རྗེ་ཨི་","づ":"རྫུ་","づう":"རྫུ་ཨུ་","な":"ན་","に":"ནི་","ぬ":"ནུ་","ね":"ནེ་","の":"ནོ་","にゃ":"ནིཡཱ་","にゅ":"ནིཡུ་","にょ":"ནིཡོ་","なあ":"ན་ཨ་","にい":"ནི་ཨི་","ぬう":"ནུ་ཨུ་","ねえ":"ནེ་ཨེ་","のう":"ནོ་ཨོ་","のお":"ནོ་ཨོ་","にゃあ":"ནིཡཱ་ཨ་","にゅう":"ནིཡུ་ཨུ་","にょう":"ནིཡོ་ཨོ་","にょお":"ནིཡོ་ཨོ་","ねい":"ནེ་ཨི་","は":"ཧ་","ひ":"ཧི་","へ":"ཧེ་","ほ":"ཧོ་","ひゃ":"ཧིཡཱ་","ひゅ":"ཧིཡུ་","ひょ":"ཧིཡོ་","はあ":"ཧ་ཨ་","ひい":"ཧི་ཨི་","へえ":"ཧེ་ཨེ་","ほう":"ཧོ་ཨོ་","ほお":"ཧོ་ཨོ་","ひゃあ":"ཧ","ひゅう":"ཧ","ひょう":"ཧ","ひょお":"ཧ","へい":"ཧེ་ཨི་","ふぁ":"ཧ་","ふぃ":"ཧི་","ふ":"ཧུ་","ふぇ":"ཧེ་","ふぉ":"ཧོ་","ふぁあ":"ཧ་ཨ་","ふぃい":"ཧི་ཨི་","ふう":"ཧུ་ཨུ་","ふぇえ":"ཧེ་ཨེ་","ふぉう":"ཧོ་ཨོ་","ふぉお":"ཧོ་ཨོ་","ふぇい":"ཧེ་ཨི་","ば":"རྦ་","び":"རྦི་","ぶ":"རྦུ་","べ":"རྦེ་","ぼ":"རྦོ་","びゃ":"རྦིཡཱ་","びゅ":"རྦིཡུ་","びょ":"རྦིཡོ་","ばあ":"རྦ་ཨ་","びい":"རྦི་ཨི་","ぶう":"རྦུ་ཨུ་","べえ":"རྦེ་ཨེ་","ぼう":"རྦོ་ཨོ་","ぼお":"རྦོ་ཨོ་","びゃあ":"རྦིཡཱ་ཨ་","びゅう":"རྦིཡུ་ཨུ་","びょう":"རྦིཡོ་ཨོ་","びょお":"རྦིཡོ་ཨོ་","べい":"རྦེ་ཨི་","ぱ":"རྦ་","ぴ":"རྦི་","ぷ":"རྦུ་","ぺ":"རྦེ་","ぽ":"རྦོ་","ぴゃ":"རྦིཡཱ་","ぴゅ":"རྦིཡུ་","ぴょ":"རྦིཡོ་","ぱあ":"རྦ་ཨ་","ぴい":"རྦི་ཨི་","ぷう":"རྦུ་ཨུ་","ぺえ":"རྦེ་ཨེ་","ぽう":"རྦོ་ཨོ་","ぽお":"རྦོ་ཨོ་","ぴゃあ":"རྦིཡཱ་ཨ་","ぴゅう":"རྦིཡུ་ཨུ་","ぴょう":"རྦིཡོ་ཨོ་","ぴょお":"རྦིཡོ་ཨོ་","ぺい":"རྦེ་ཨི་","ま":"མ་","み":"མི་","む":"མུ་","め":"མེ་","も":"མོ་","みゃ":"མིཡཱ་","みゅ":"མིཡུ་","みょ":"མིཡོ་","まあ":"མ་ཨ་","みい":"མི་ཨི་","むう":"མུ་ཨུ་","めえ":"མེ་ཨེ་","もう":"མོ་ཨོ་","もお":"མོ་ཨོ་","みゃあ":"མིཡཱ་ཨ་","みゅう":"མིཡུ་ཨུ་","みょう":"མིཡོ་ཨོ་","みょお":"མིཡོ་ཨོ་","めい":"མེ་ཨི་","や":"ཡ་","ゆ":"ཡུ་","よ":"ཡོ་","やあ":"ཡ་ཨ་","ゆう":"ཡུ་ཨུ་","よう":"ཡོ་ཨོ་","よお":"ཡོ་ཨོ་","ら":"ར་","り":"རི་","る":"རུ་","れ":"རེ་","ろ":"རོ་","りゃ":"རིཡཱ་","りゅ":"རིཡུ་","りょ":"རིཡོ་","らあ":"ར་ཨ་","りい":"རི་ཨི་","るう":"རུ་ཨུ་","れえ":"རེ་ཨེ་","ろう":"རོ་ཨོ་","ろお":"རོ་ཨོ་","りゃあ":"རིཡཱ་ཨ་","りゅう":"རིཡུ་ཨུ་","りょう":"རིཡོ་ཨོ་","りょお":"རིཡོ་ཨོ་","れい":"རེ་ཨི་","わ":"ཝ་","うぃ":"ཝི་","うぇ":"ཝེ་","うぉ":"ཝོ་","わあ":"ཝ་ཨ་","うぃい":"ཝི་ཨི་","うぇえ":"ཝེ་ཨེ་","うぉう":"ཝོ་ཨོ་","うぉお":"ཝོ་ཨོ་","うぇい":"ཝེ་ཨི་","ん":"ང","を":"ཨོ་","っ":"ག་","んあ":"ང'ཨ་","んい":"ང'ཨི་","んう":"ང'ཨུ་","んえ":"ང'ཨེ་","んお":"ང'ཨོ་","んや":"ང'ཡ་","んゆ":"ང'ཡུ་","んよ":"ང'ཡོ་","んああ":"ང'ཨ་ཨ་","んいい":"ང'ཨི་ཨི་","んうう":"ང'ཨུ་ཨུ་","んええ":"ང'ཨེ་ཨེ་","んおう":"ང'ཨོ་ཨོ་","んおお":"ང'ཨོ་ཨོ་","んやあ":"ང'ཡ་ཨ་","んゆう":"ང'ཡུ་ཨུ་","んよう":"ང'ཡོ་ཨོ་","んよお":"ང'ཡོ་ཨོ་","んえい":"ང'ེ་ཨི་","っか":"ག་ཁ་","っき":"ག་ཁི་","っく":"ག་ཁུ་","っけ":"ག་ཁེ་","っこ":"ག་ཁོ་","っきゃ":"ག་ཁིཡཱ་","っきゅ":"ག་ཁིཡུ་","っきょ":"ག་ཁིཡོ་","っかあ":"ག་ཁ་ཨ་","っきい":"ག་ཁི་ཨི་","っくう":"ག་ཁུ་ཨུ་","っけえ":"ག་ཁེ་ཨེ་","っこう":"ག་ཁོ་ཨོ་","っこお":"ག་ཁོ་ཨོ་","っきゃあ":"ག་ཁིཡཱ་ཨ་","っきゅう":"ག་ཁིཡུ་ཨུ་","っきょう":"ག་ཁིཡོ་ཨོ་","っきょお":"ག་ཁིཡོ་ཨོ་","っけい":"ག་ཁེ་ཨི་","っさ":"ག་ས་","っすぃ":"ག་སི་","っす":"ག་སུ་","っせ":"ག་སེ་","っそ":"ག་སོ་","っさあ":"ག་ས་ཨ་","っすぃい":"ག་སི་ཨི་","っすう":"ག་སུ་ཨུ་","っせえ":"ག་སེ་ཨེ་","っそう":"ག་སོ་ཨོ་","っそお":"ག་སོ་ཨོ་","っせい":"ག་སེ་ཨི་","っしゃ":"ག་ཤ་","っし":"ག་ཤི་","っしゅ":"ག་ཤུ་","っしぇ":"ག་ཤེ་","っしょ":"ག་ཤོ་","っしゃあ":"ག་ཤ་ཨ་","っしい":"ག་ཤི་ཨི་","っしゅう":"ག་ཤུ་ཨུ་","っしぇえ":"ག་ཤེ་ཨེ་","っしょう":"ག་ཤོ་ཨོ་","っしょお":"ག་ཤོ་ཨོ་","っしぇい":"ག་ཤེ་ཨི་","った":"ག་ཐ་","ってぃ":"ག་ཐི་","っとぅ":"ག་ཐུ་","って":"ག་ཐེ་","っと":"ག་ཐོ་","ったあ":"ག་ཐ་ཨ་","ってぃい":"ག་ཐི་ཨི་","っとぅう":"ག་ཐུ་ཨུ་","ってえ":"ག་ཐེ་ཨེ་","っとう":"ག་ཐོ་ཨོ་","っとお":"ག་ཐོ་ཨོ་","ってい":"ག་ཐེ་ཨི་","っちゃ":"ག་ཆ་","っち":"ག་ཆི་","っちゅ":"ག་ཆུ་","っちぇ":"ག་ཆེ་","っちょ":"ག་ཆོ་","っちゃあ":"ག་ཆ་ཨ་","っちい":"ག་ཆི་ཨི་","っちゅう":"ག་ཆུ་ཨུ་","っちぇえ":"ག་ཆེ་ཨེ་","っちょう":"ག་ཆོ་ཨོ་","っちょお":"ག་ཆོ་ཨོ་","っちぇい":"ག་ཆེ་ཨི་","っつぁ":"ག་ཙ་","っつぃ":"ག་ཙི་","っつ":"ག་ཙུ་","っつぇ":"ག་ཙེ་","っつぉ":"ག་ཙོ་","っつぁあ":"ག་ཙ་ཨ་","っつぃい":"ག་ཙི་ཨི་","っつう":"ག་ཙུ་ཨུ་","っつぇえ":"ག་ཙེ་ཨེ་","っつぉう":"ག་ཙོ་ཨོ་","っつぉお":"ག་ཙོ་ཨོ་","っつぇい":"ག་ཙེ་ཨི་","っぱ":"ག་རྦ་","っぴ":"ག་རྦི་","っぷ":"ག་རྦུ་","っぺ":"ག་རྦེ་","っぽ":"ག་རྦོ་","っぴゃ":"ག་རྦིཡཱ་","っぴゅ":"ག་རྦིཡུ་","っぴょ":"ག་རྦིཡོ་","っぱあ":"ག་རྦ་ཨ་","っぴい":"ག་རྦི་ཨི་","っぷう":"ག་རྦུ་ཨུ་","っぺえ":"ག་རྦེ་ཨེ་","っぽう":"ག་རྦོ་ཨོ་","っぽお":"ག་རྦོ་ཨོ་","っぴゃあ":"ག་རྦིཡཱ་ཨ་","っぴゅう":"ག་རྦིཡུ་ཨུ་","っぴょう":"ག་རྦིཡོ་ཨོ་","っぴょお":"ག་རྦིཡོ་ཨོ་","っぺい":"ག་རྦེ་ཨི་","ぁ":"ཨ་","ぃ":"ཨི་","ぅ":"ཨུ་","ぇ":"ཨེ་","ぉ":"ཨོ་","ゃ":"ཡ་","ゅ":"ཡུ་","ょ":"ཡོ་","ぁあ":"ཨ་ཨ་","ぃい":"ཨི་ཨི་","ぅう":"ཨུ་ཨུ་","ぇえ":"ཨེ་ཨེ་","ぉう":"ཨོ་ཨོ་","ぉお":"ཨོ་ཨོ་","ゃあ":"ཡ་ཨ་","ゅう":"ཡུ་ཨུ་","ょう":"ཡོ་ཨོ་","ょお":"ཡོ་ཨོ་","ぇい":"ེ་ཨི་","ゔぁ":"རྦ་","ゔぃ":"རྦི་","ゔ":"རྦུ་","ゔぇ":"རྦེ་","ゔぉ":"རྦོ་","ゔぁあ":"རྦ་ཨ་","ゔぃい":"རྦི་ཨི་","ゔう":"རྦུ་ཨུ་","ゔぇえ":"རྦེ་ཨེ་","ゔぉう":"རྦོ་ཨོ་","ゔぉお":"རྦོ་ཨོ་","ゔぇい":"རྦེ་ཨི་"},"additional":{},"endOfWord":{}}
},{}],22:[function(require,module,exports){
module.exports = {"あ":"あ","ぁ":"あ","い":"い","ぃ":"い","う":"う","ぅ":"う","え":"え","ぇ":"え","お":"お","ぉ":"お","か":"あ","が":"あ","き":"い","ぎ":"い","く":"う","ぐ":"う","け":"え","げ":"え","こ":"お","ご":"お","さ":"あ","ざ":"あ","し":"い","じ":"い","す":"う","ず":"う","せ":"え","ぜ":"え","そ":"お","ぞ":"お","た":"あ","だ":"あ","ち":"い","ぢ":"い","つ":"う","づ":"う","て":"え","で":"え","と":"お","ど":"お","な":"あ","に":"い","ぬ":"う","ね":"え","の":"お","は":"あ","ば":"あ","ぱ":"あ","ひ":"い","び":"い","ぴ":"い","ふ":"う","ぶ":"う","ぷ":"う","へ":"え","べ":"え","ぺ":"え","ほ":"お","ぼ":"お","ぽ":"お","ま":"あ","み":"い","む":"う","め":"え","も":"お","ゃ":"あ","や":"あ","ゅ":"う","ゆ":"う","ょ":"お","よ":"お","ら":"あ","り":"い","る":"う","れ":"え","ろ":"お","わ":"あ","を":"お","ん":""}
},{}],23:[function(require,module,exports){
module.exports = {"0":"ぜろ","1":"いち","2":"に","3":"さん","4":"よん","5":"ご","6":"ろく","7":"なな","8":"はち","9":"きゅう"}
},{}],24:[function(require,module,exports){
module.exports = {"1":{"yomi":"いち","floatYomi":"いってん"},"2":{"yomi":"に","floatYomi":"にてん"},"3":{"yomi":"さん","floatYomi":"さんてん"},"4":{"yomi":"よん","floatYomi":"よんてん"},"5":{"yomi":"ご","floatYomi":"ごてん"},"6":{"yomi":"ろく","floatYomi":"ろくてん"},"7":{"yomi":"なな","floatYomi":"ななてん"},"8":{"yomi":"はち","floatYomi":"はってん"},"9":{"yomi":"きゅう","floatYomi":"きゅうてん"},"10":{"yomi":"じゅう","floatYomi":"じゅってん"},"20":{"yomi":"にじゅう","floatYomi":"にじゅってん"},"30":{"yomi":"さんじゅう","floatYomi":"さんじゅってん"},"40":{"yomi":"よんじゅう","floatYomi":"よんじゅってん"},"50":{"yomi":"ごじゅう","floatYomi":"ごじゅってん"},"60":{"yomi":"ろくじゅう","floatYomi":"ろくじゅってん"},"70":{"yomi":"ななじゅう","floatYomi":"ななじゅってん"},"80":{"yomi":"はちじゅう","floatYomi":"はちじゅってん"},"90":{"yomi":"きゅうじゅう","floatYomi":"きゅうじゅってん"},"100":{"yomi":"ひゃく","floatYomi":"ひゃくてん"},"200":{"yomi":"にひゃく","floatYomi":"にひゃくてん"},"300":{"yomi":"さんびゃく","floatYomi":"さんびゃくてん"},"400":{"yomi":"よんひゃく","floatYomi":"よんひゃくてん"},"500":{"yomi":"ごひゃく","floatYomi":"ごひゃくてん"},"600":{"yomi":"ろっぴゃく","floatYomi":"ろっぴゃくてん"},"700":{"yomi":"ななひゃく","floatYomi":"ななひゃくてん"},"800":{"yomi":"はっぴゃく","floatYomi":"はっぴゃくてん"},"900":{"yomi":"きゅうひゃく","floatYomi":"きゅうひゃくてん"},"1000":{"yomi":"せん","floatYomi":"せんてん"},"2000":{"yomi":"にせん","floatYomi":"にせんてん"},"3000":{"yomi":"さんぜん","floatYomi":"さんぜんてん"},"4000":{"yomi":"よんせん","floatYomi":"よんせんてん"},"5000":{"yomi":"ごせん","floatYomi":"ごせんてん"},"6000":{"yomi":"ろくせん","floatYomi":"ろくせんてん"},"7000":{"yomi":"ななせん","floatYomi":"ななせんてん"},"8000":{"yomi":"はっせん","floatYomi":"はっせんてん"},"9000":{"yomi":"きゅうせん","floatYomi":"きゅうせんてん"},"10000":{"yomi":"いちまん","floatYomi":""},"20000":{"yomi":"にまん","floatYomi":""},"30000":{"yomi":"さんまん","floatYomi":""},"40000":{"yomi":"よんまん","floatYomi":""},"50000":{"yomi":"ごまん","floatYomi":""},"60000":{"yomi":"ろくまん","floatYomi":""},"70000":{"yomi":"ななまん","floatYomi":""},"80000":{"yomi":"はちまん","floatYomi":""},"90000":{"yomi":"きゅうまん","floatYomi":""},"100000":{"yomi":"じゅうまん","floatYomi":""},"200000":{"yomi":"にじゅうまん","floatYomi":""},"300000":{"yomi":"さんじゅうまん","floatYomi":""},"400000":{"yomi":"よんじゅうまん","floatYomi":""},"500000":{"yomi":"ごじゅうまん","floatYomi":""},"600000":{"yomi":"ろくじゅうまん","floatYomi":""},"700000":{"yomi":"ななじゅうまん","floatYomi":""},"800000":{"yomi":"はちじゅうまん","floatYomi":""},"900000":{"yomi":"きゅうじゅうまん","floatYomi":""},"1000000":{"yomi":"ひゃくまん","floatYomi":""},"2000000":{"yomi":"にひゃくまん","floatYomi":""},"3000000":{"yomi":"さんびゃくまん","floatYomi":""},"4000000":{"yomi":"よんひゃくまん","floatYomi":""},"5000000":{"yomi":"ごひゃくまん","floatYomi":""},"6000000":{"yomi":"ろっぴゃくまん","floatYomi":""},"7000000":{"yomi":"ななひゃくまん","floatYomi":""},"8000000":{"yomi":"はっぴゃくまん","floatYomi":""},"9000000":{"yomi":"きゅうひゃくまん","floatYomi":""},"10000000":{"yomi":"いっせんまん","floatYomi":""},"20000000":{"yomi":"にせんまん","floatYomi":""},"30000000":{"yomi":"さんぜんまん","floatYomi":""},"40000000":{"yomi":"よんせんまん","floatYomi":""},"50000000":{"yomi":"ごせんまん","floatYomi":""},"60000000":{"yomi":"ろくせんまん","floatYomi":""},"70000000":{"yomi":"ななせんまん","floatYomi":""},"80000000":{"yomi":"はっせんまん","floatYomi":""},"90000000":{"yomi":"きゅうせんまん","floatYomi":""},"100000000":{"yomi":"いちおく","floatYomi":""},"200000000":{"yomi":"におく","floatYomi":""},"300000000":{"yomi":"さんおく","floatYomi":""},"400000000":{"yomi":"よんおく","floatYomi":""},"500000000":{"yomi":"ごおく","floatYomi":""},"600000000":{"yomi":"ろくおく","floatYomi":""},"700000000":{"yomi":"ななおく","floatYomi":""},"800000000":{"yomi":"はちおく","floatYomi":""},"900000000":{"yomi":"きゅうおく","floatYomi":""},"1000000000":{"yomi":"じゅうおく","floatYomi":""},"2000000000":{"yomi":"にじゅうおく","floatYomi":""},"3000000000":{"yomi":"さんじゅうおく","floatYomi":""},"4000000000":{"yomi":"よんじゅうおく","floatYomi":""},"5000000000":{"yomi":"ごじゅうおく","floatYomi":""},"6000000000":{"yomi":"ろくじゅうおく","floatYomi":""},"7000000000":{"yomi":"ななじゅうおく","floatYomi":""},"8000000000":{"yomi":"はちじゅうおく","floatYomi":""},"9000000000":{"yomi":"きゅうじゅうおく","floatYomi":""},"10000000000":{"yomi":"ひゃくおく","floatYomi":""},"20000000000":{"yomi":"にひゃくおく","floatYomi":""},"30000000000":{"yomi":"さんびゃくおく","floatYomi":""},"40000000000":{"yomi":"よんひゃくおく","floatYomi":""},"50000000000":{"yomi":"ごひゃくおく","floatYomi":""},"60000000000":{"yomi":"ろっぴゃくおく","floatYomi":""},"70000000000":{"yomi":"ななひゃくおく","floatYomi":""},"80000000000":{"yomi":"はっぴゃくおく","floatYomi":""},"90000000000":{"yomi":"きゅうひゃくおく","floatYomi":""},"100000000000":{"yomi":"いっせんおく","floatYomi":""},"200000000000":{"yomi":"にせんおく","floatYomi":""},"300000000000":{"yomi":"さんぜんおく","floatYomi":""},"400000000000":{"yomi":"よんせんおく","floatYomi":""},"500000000000":{"yomi":"ごせんおく","floatYomi":""},"600000000000":{"yomi":"ろくせんおく","floatYomi":""},"700000000000":{"yomi":"ななせんおく","floatYomi":""},"800000000000":{"yomi":"はっせんおく","floatYomi":""},"900000000000":{"yomi":"きゅうせんおく","floatYomi":""}}
},{}],25:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"dup":24}],26:[function(require,module,exports){
module.exports = {"か":{"1":{"yomi":"いっ","nextChar":"1"},"2":{"yomi":"に","nextChar":"1"},"3":{"yomi":"さん","nextChar":"1"},"4":{"yomi":"よん","nextChar":"1"},"5":{"yomi":"ご","nextChar":"1"},"6":{"yomi":"ろっ","nextChar":"1"},"7":{"yomi":"なな","nextChar":"1"},"8":{"yomi":"はっ","nextChar":"1"},"9":{"yomi":"きゅう","nextChar":"1"},"10":{"yomi":"じゅっ","nextChar":"1"},"20":{"yomi":"にじゅっ","nextChar":"1"},"30":{"yomi":"さんじゅっ","nextChar":"1"},"40":{"yomi":"よんじゅっ","nextChar":"1"},"50":{"yomi":"ごじゅっ","nextChar":"1"},"60":{"yomi":"ろくじゅっ","nextChar":"1"},"70":{"yomi":"ななじゅっ","nextChar":"1"},"80":{"yomi":"はちじゅっ","nextChar":"1"},"90":{"yomi":"きゅうじゅっ","nextChar":"1"},"100":{"yomi":"ひゃっ","nextChar":"1"},"200":{"yomi":"にひゃっ","nextChar":"1"},"300":{"yomi":"さんびゃっ","nextChar":"1"},"400":{"yomi":"よんひゃっ","nextChar":"1"},"500":{"yomi":"ごひゃっ","nextChar":"1"},"600":{"yomi":"ろっぴゃっ","nextChar":"1"},"700":{"yomi":"ななひゃっ","nextChar":"1"},"800":{"yomi":"はっぴゃっ","nextChar":"1"},"900":{"yomi":"きゅうひゃっ","nextChar":"1"},"1000":{"yomi":"せん","nextChar":"1"},"2000":{"yomi":"にせん","nextChar":"1"},"3000":{"yomi":"さんぜん","nextChar":"1"},"4000":{"yomi":"よんせん","nextChar":"1"},"5000":{"yomi":"ごせん","nextChar":"1"},"6000":{"yomi":"ろくせん","nextChar":"1"},"7000":{"yomi":"ななせん","nextChar":"1"},"8000":{"yomi":"はっせん","nextChar":"1"},"9000":{"yomi":"きゅうせん","nextChar":"1"},"10000":{"yomi":"いちまん","nextChar":"1"},"20000":{"yomi":"にまん","nextChar":"1"},"30000":{"yomi":"さんまん","nextChar":"1"},"40000":{"yomi":"よんまん","nextChar":"1"},"50000":{"yomi":"ごまん","nextChar":"1"},"60000":{"yomi":"ろくまん","nextChar":"1"},"70000":{"yomi":"ななまん","nextChar":"1"},"80000":{"yomi":"はちまん","nextChar":"1"},"90000":{"yomi":"きゅうまん","nextChar":"1"},"100000":{"yomi":"じゅうまん","nextChar":"1"},"200000":{"yomi":"にじゅうまん","nextChar":"1"},"300000":{"yomi":"さんじゅうまん","nextChar":"1"},"400000":{"yomi":"よんじゅうまん","nextChar":"1"},"500000":{"yomi":"ごじゅうまん","nextChar":"1"},"600000":{"yomi":"ろくじゅうまん","nextChar":"1"},"700000":{"yomi":"ななじゅうまん","nextChar":"1"},"800000":{"yomi":"はちじゅうまん","nextChar":"1"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"1"},"1000000":{"yomi":"ひゃくまん","nextChar":"1"},"2000000":{"yomi":"にひゃくまん","nextChar":"1"},"3000000":{"yomi":"さんびゃくまん","nextChar":"1"},"4000000":{"yomi":"よんひゃくまん","nextChar":"1"},"5000000":{"yomi":"ごひゃくまん","nextChar":"1"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"1"},"7000000":{"yomi":"ななひゃくまん","nextChar":"1"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"1"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"1"},"10000000":{"yomi":"いっせんまん","nextChar":"1"},"20000000":{"yomi":"にせんまん","nextChar":"1"},"30000000":{"yomi":"さんぜんまん","nextChar":"1"},"40000000":{"yomi":"よんせんまん","nextChar":"1"},"50000000":{"yomi":"ごせんまん","nextChar":"1"},"60000000":{"yomi":"ろくせんまん","nextChar":"1"},"70000000":{"yomi":"ななせんまん","nextChar":"1"},"80000000":{"yomi":"はっせんまん","nextChar":"1"},"90000000":{"yomi":"きゅうせんまん","nextChar":"1"},"100000000":{"yomi":"いちおっ","nextChar":"1"},"200000000":{"yomi":"におっ","nextChar":"1"},"300000000":{"yomi":"さんおっ","nextChar":"1"},"400000000":{"yomi":"よんおっ","nextChar":"1"},"500000000":{"yomi":"ごおっ","nextChar":"1"},"600000000":{"yomi":"ろくおっ","nextChar":"1"},"700000000":{"yomi":"ななおっ","nextChar":"1"},"800000000":{"yomi":"はちおっ","nextChar":"1"},"900000000":{"yomi":"きゅうおっ","nextChar":"1"},"1000000000":{"yomi":"じゅうおっ","nextChar":"1"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"1"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"1"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"1"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"1"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"1"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"1"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"1"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"1"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"1"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"1"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"1"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"1"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"1"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"1"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"1"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"1"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"1"},"100000000000":{"yomi":"いっせんおっ","nextChar":"1"},"200000000000":{"yomi":"にせんおっ","nextChar":"1"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"1"},"400000000000":{"yomi":"よんせんおっ","nextChar":"1"},"500000000000":{"yomi":"ごせんおっ","nextChar":"1"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"1"},"700000000000":{"yomi":"ななせんおっ","nextChar":"1"},"800000000000":{"yomi":"はっせんおっ","nextChar":"1"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"1"}},"さ":{"1":{"yomi":"いっ","nextChar":"1"},"2":{"yomi":"に","nextChar":"1"},"3":{"yomi":"さん","nextChar":"1"},"4":{"yomi":"よん","nextChar":"1"},"5":{"yomi":"ご","nextChar":"1"},"6":{"yomi":"ろく","nextChar":"1"},"7":{"yomi":"なな","nextChar":"1"},"8":{"yomi":"はっ","nextChar":"1"},"9":{"yomi":"きゅう","nextChar":"1"},"10":{"yomi":"じゅっ","nextChar":"1"},"20":{"yomi":"にじゅっ","nextChar":"1"},"30":{"yomi":"さんじゅっ","nextChar":"1"},"40":{"yomi":"よんじゅっ","nextChar":"1"},"50":{"yomi":"ごじゅっ","nextChar":"1"},"60":{"yomi":"ろくじゅっ","nextChar":"1"},"70":{"yomi":"ななじゅっ","nextChar":"1"},"80":{"yomi":"はちじゅっ","nextChar":"1"},"90":{"yomi":"きゅうじゅっ","nextChar":"1"},"100":{"yomi":"ひゃっ","nextChar":"1"},"200":{"yomi":"にひゃっ","nextChar":"1"},"300":{"yomi":"さんびゃっ","nextChar":"1"},"400":{"yomi":"よんひゃっ","nextChar":"1"},"500":{"yomi":"ごひゃっ","nextChar":"1"},"600":{"yomi":"ろっぴゃっ","nextChar":"1"},"700":{"yomi":"ななひゃっ","nextChar":"1"},"800":{"yomi":"はっぴゃっ","nextChar":"1"},"900":{"yomi":"きゅうひゃっ","nextChar":"1"},"1000":{"yomi":"せん","nextChar":"1"},"2000":{"yomi":"にせん","nextChar":"1"},"3000":{"yomi":"さんぜん","nextChar":"1"},"4000":{"yomi":"よんせん","nextChar":"1"},"5000":{"yomi":"ごせん","nextChar":"1"},"6000":{"yomi":"ろくせん","nextChar":"1"},"7000":{"yomi":"ななせん","nextChar":"1"},"8000":{"yomi":"はっせん","nextChar":"1"},"9000":{"yomi":"きゅうせん","nextChar":"1"},"10000":{"yomi":"いちまん","nextChar":"1"},"20000":{"yomi":"にまん","nextChar":"1"},"30000":{"yomi":"さんまん","nextChar":"1"},"40000":{"yomi":"よんまん","nextChar":"1"},"50000":{"yomi":"ごまん","nextChar":"1"},"60000":{"yomi":"ろくまん","nextChar":"1"},"70000":{"yomi":"ななまん","nextChar":"1"},"80000":{"yomi":"はちまん","nextChar":"1"},"90000":{"yomi":"きゅうまん","nextChar":"1"},"100000":{"yomi":"じゅうまん","nextChar":"1"},"200000":{"yomi":"にじゅうまん","nextChar":"1"},"300000":{"yomi":"さんじゅうまん","nextChar":"1"},"400000":{"yomi":"よんじゅうまん","nextChar":"1"},"500000":{"yomi":"ごじゅうまん","nextChar":"1"},"600000":{"yomi":"ろくじゅうまん","nextChar":"1"},"700000":{"yomi":"ななじゅうまん","nextChar":"1"},"800000":{"yomi":"はちじゅうまん","nextChar":"1"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"1"},"1000000":{"yomi":"ひゃくまん","nextChar":"1"},"2000000":{"yomi":"にひゃくまん","nextChar":"1"},"3000000":{"yomi":"さんびゃくまん","nextChar":"1"},"4000000":{"yomi":"よんひゃくまん","nextChar":"1"},"5000000":{"yomi":"ごひゃくまん","nextChar":"1"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"1"},"7000000":{"yomi":"ななひゃくまん","nextChar":"1"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"1"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"1"},"10000000":{"yomi":"いっせんまん","nextChar":"1"},"20000000":{"yomi":"にせんまん","nextChar":"1"},"30000000":{"yomi":"さんぜんまん","nextChar":"1"},"40000000":{"yomi":"よんせんまん","nextChar":"1"},"50000000":{"yomi":"ごせんまん","nextChar":"1"},"60000000":{"yomi":"ろくせんまん","nextChar":"1"},"70000000":{"yomi":"ななせんまん","nextChar":"1"},"80000000":{"yomi":"はっせんまん","nextChar":"1"},"90000000":{"yomi":"きゅうせんまん","nextChar":"1"},"100000000":{"yomi":"いちおっ","nextChar":"1"},"200000000":{"yomi":"におっ","nextChar":"1"},"300000000":{"yomi":"さんおっ","nextChar":"1"},"400000000":{"yomi":"よんおっ","nextChar":"1"},"500000000":{"yomi":"ごおっ","nextChar":"1"},"600000000":{"yomi":"ろくおっ","nextChar":"1"},"700000000":{"yomi":"ななおっ","nextChar":"1"},"800000000":{"yomi":"はちおっ","nextChar":"1"},"900000000":{"yomi":"きゅうおっ","nextChar":"1"},"1000000000":{"yomi":"じゅうおっ","nextChar":"1"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"1"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"1"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"1"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"1"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"1"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"1"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"1"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"1"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"1"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"1"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"1"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"1"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"1"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"1"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"1"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"1"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"1"},"100000000000":{"yomi":"いっせんおっ","nextChar":"1"},"200000000000":{"yomi":"にせんおっ","nextChar":"1"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"1"},"400000000000":{"yomi":"よんせんおっ","nextChar":"1"},"500000000000":{"yomi":"ごせんおっ","nextChar":"1"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"1"},"700000000000":{"yomi":"ななせんおっ","nextChar":"1"},"800000000000":{"yomi":"はっせんおっ","nextChar":"1"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"1"}},"た":{"1":{"yomi":"いっ","nextChar":"1"},"2":{"yomi":"に","nextChar":"1"},"3":{"yomi":"さん","nextChar":"1"},"4":{"yomi":"よん","nextChar":"1"},"5":{"yomi":"ご","nextChar":"1"},"6":{"yomi":"ろっ","nextChar":"1"},"7":{"yomi":"なな","nextChar":"1"},"8":{"yomi":"はっ","nextChar":"1"},"9":{"yomi":"きゅう","nextChar":"1"},"10":{"yomi":"じゅっ","nextChar":"1"},"20":{"yomi":"にじゅっ","nextChar":"1"},"30":{"yomi":"さんじゅっ","nextChar":"1"},"40":{"yomi":"よんじゅっ","nextChar":"1"},"50":{"yomi":"ごじゅっ","nextChar":"1"},"60":{"yomi":"ろくじゅっ","nextChar":"1"},"70":{"yomi":"ななじゅっ","nextChar":"1"},"80":{"yomi":"はちじゅっ","nextChar":"1"},"90":{"yomi":"きゅうじゅっ","nextChar":"1"},"100":{"yomi":"ひゃっ","nextChar":"1"},"200":{"yomi":"にひゃっ","nextChar":"1"},"300":{"yomi":"さんびゃっ","nextChar":"1"},"400":{"yomi":"よんひゃっ","nextChar":"1"},"500":{"yomi":"ごひゃっ","nextChar":"1"},"600":{"yomi":"ろっぴゃっ","nextChar":"1"},"700":{"yomi":"ななひゃっ","nextChar":"1"},"800":{"yomi":"はっぴゃっ","nextChar":"1"},"900":{"yomi":"きゅうひゃっ","nextChar":"1"},"1000":{"yomi":"せん","nextChar":"1"},"2000":{"yomi":"にせん","nextChar":"1"},"3000":{"yomi":"さんぜん","nextChar":"1"},"4000":{"yomi":"よんせん","nextChar":"1"},"5000":{"yomi":"ごせん","nextChar":"1"},"6000":{"yomi":"ろくせん","nextChar":"1"},"7000":{"yomi":"ななせん","nextChar":"1"},"8000":{"yomi":"はっせん","nextChar":"1"},"9000":{"yomi":"きゅうせん","nextChar":"1"},"10000":{"yomi":"いちまん","nextChar":"1"},"20000":{"yomi":"にまん","nextChar":"1"},"30000":{"yomi":"さんまん","nextChar":"1"},"40000":{"yomi":"よんまん","nextChar":"1"},"50000":{"yomi":"ごまん","nextChar":"1"},"60000":{"yomi":"ろくまん","nextChar":"1"},"70000":{"yomi":"ななまん","nextChar":"1"},"80000":{"yomi":"はちまん","nextChar":"1"},"90000":{"yomi":"きゅうまん","nextChar":"1"},"100000":{"yomi":"じゅうまん","nextChar":"1"},"200000":{"yomi":"にじゅうまん","nextChar":"1"},"300000":{"yomi":"さんじゅうまん","nextChar":"1"},"400000":{"yomi":"よんじゅうまん","nextChar":"1"},"500000":{"yomi":"ごじゅうまん","nextChar":"1"},"600000":{"yomi":"ろくじゅうまん","nextChar":"1"},"700000":{"yomi":"ななじゅうまん","nextChar":"1"},"800000":{"yomi":"はちじゅうまん","nextChar":"1"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"1"},"1000000":{"yomi":"ひゃくまん","nextChar":"1"},"2000000":{"yomi":"にひゃくまん","nextChar":"1"},"3000000":{"yomi":"さんびゃくまん","nextChar":"1"},"4000000":{"yomi":"よんひゃくまん","nextChar":"1"},"5000000":{"yomi":"ごひゃくまん","nextChar":"1"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"1"},"7000000":{"yomi":"ななひゃくまん","nextChar":"1"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"1"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"1"},"10000000":{"yomi":"いっせんまん","nextChar":"1"},"20000000":{"yomi":"にせんまん","nextChar":"1"},"30000000":{"yomi":"さんぜんまん","nextChar":"1"},"40000000":{"yomi":"よんせんまん","nextChar":"1"},"50000000":{"yomi":"ごせんまん","nextChar":"1"},"60000000":{"yomi":"ろくせんまん","nextChar":"1"},"70000000":{"yomi":"ななせんまん","nextChar":"1"},"80000000":{"yomi":"はっせんまん","nextChar":"1"},"90000000":{"yomi":"きゅうせんまん","nextChar":"1"},"100000000":{"yomi":"いちおっ","nextChar":"1"},"200000000":{"yomi":"におっ","nextChar":"1"},"300000000":{"yomi":"さんおっ","nextChar":"1"},"400000000":{"yomi":"よんおっ","nextChar":"1"},"500000000":{"yomi":"ごおっ","nextChar":"1"},"600000000":{"yomi":"ろくおっ","nextChar":"1"},"700000000":{"yomi":"ななおっ","nextChar":"1"},"800000000":{"yomi":"はちおっ","nextChar":"1"},"900000000":{"yomi":"きゅうおっ","nextChar":"1"},"1000000000":{"yomi":"じゅうおっ","nextChar":"1"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"1"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"1"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"1"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"1"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"1"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"1"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"1"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"1"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"1"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"1"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"1"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"1"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"1"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"1"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"1"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"1"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"1"},"100000000000":{"yomi":"いっせんおっ","nextChar":"1"},"200000000000":{"yomi":"にせんおっ","nextChar":"1"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"1"},"400000000000":{"yomi":"よんせんおっ","nextChar":"1"},"500000000000":{"yomi":"ごせんおっ","nextChar":"1"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"1"},"700000000000":{"yomi":"ななせんおっ","nextChar":"1"},"800000000000":{"yomi":"はっせんおっ","nextChar":"1"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"1"}},"な":{"1":{"yomi":"いち","nextChar":"1"},"2":{"yomi":"に","nextChar":"1"},"3":{"yomi":"さん","nextChar":"1"},"4":{"yomi":"よ","nextChar":"1"},"5":{"yomi":"ご","nextChar":"1"},"6":{"yomi":"ろく","nextChar":"1"},"7":{"yomi":"なな","nextChar":"1"},"8":{"yomi":"はち","nextChar":"1"},"9":{"yomi":"く","nextChar":"1"},"10":{"yomi":"じゅう","nextChar":"1"},"20":{"yomi":"にじゅう","nextChar":"1"},"30":{"yomi":"さんじゅう","nextChar":"1"},"40":{"yomi":"よんじゅう","nextChar":"1"},"50":{"yomi":"ごじゅう","nextChar":"1"},"60":{"yomi":"ろくじゅう","nextChar":"1"},"70":{"yomi":"ななじゅう","nextChar":"1"},"80":{"yomi":"はちじゅう","nextChar":"1"},"90":{"yomi":"きゅうじゅう","nextChar":"1"},"100":{"yomi":"ひゃく","nextChar":"1"},"200":{"yomi":"にひゃく","nextChar":"1"},"300":{"yomi":"さんびゃく","nextChar":"1"},"400":{"yomi":"よんひゃく","nextChar":"1"},"500":{"yomi":"ごひゃく","nextChar":"1"},"600":{"yomi":"ろっぴゃく","nextChar":"1"},"700":{"yomi":"ななひゃく","nextChar":"1"},"800":{"yomi":"はっぴゃく","nextChar":"1"},"900":{"yomi":"きゅうひゃく","nextChar":"1"},"1000":{"yomi":"せん","nextChar":"1"},"2000":{"yomi":"にせん","nextChar":"1"},"3000":{"yomi":"さんぜん","nextChar":"1"},"4000":{"yomi":"よんせん","nextChar":"1"},"5000":{"yomi":"ごせん","nextChar":"1"},"6000":{"yomi":"ろくせん","nextChar":"1"},"7000":{"yomi":"ななせん","nextChar":"1"},"8000":{"yomi":"はっせん","nextChar":"1"},"9000":{"yomi":"きゅうせん","nextChar":"1"},"10000":{"yomi":"いちまん","nextChar":"1"},"20000":{"yomi":"にまん","nextChar":"1"},"30000":{"yomi":"さんまん","nextChar":"1"},"40000":{"yomi":"よんまん","nextChar":"1"},"50000":{"yomi":"ごまん","nextChar":"1"},"60000":{"yomi":"ろくまん","nextChar":"1"},"70000":{"yomi":"ななまん","nextChar":"1"},"80000":{"yomi":"はちまん","nextChar":"1"},"90000":{"yomi":"きゅうまん","nextChar":"1"},"100000":{"yomi":"じゅうまん","nextChar":"1"},"200000":{"yomi":"にじゅうまん","nextChar":"1"},"300000":{"yomi":"さんじゅうまん","nextChar":"1"},"400000":{"yomi":"よんじゅうまん","nextChar":"1"},"500000":{"yomi":"ごじゅうまん","nextChar":"1"},"600000":{"yomi":"ろくじゅうまん","nextChar":"1"},"700000":{"yomi":"ななじゅうまん","nextChar":"1"},"800000":{"yomi":"はちじゅうまん","nextChar":"1"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"1"},"1000000":{"yomi":"ひゃくまん","nextChar":"1"},"2000000":{"yomi":"にひゃくまん","nextChar":"1"},"3000000":{"yomi":"さんびゃくまん","nextChar":"1"},"4000000":{"yomi":"よんひゃくまん","nextChar":"1"},"5000000":{"yomi":"ごひゃくまん","nextChar":"1"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"1"},"7000000":{"yomi":"ななひゃくまん","nextChar":"1"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"1"},"9000000":{"yomi":"きゅうひゃくまん","nextChar":"1"},"10000000":{"yomi":"いっせんまん","nextChar":"1"},"20000000":{"yomi":"にせんまん","nextChar":"1"},"30000000":{"yomi":"さんぜんまん","nextChar":"1"},"40000000":{"yomi":"よんせんまん","nextChar":"1"},"50000000":{"yomi":"ごせんまん","nextChar":"1"},"60000000":{"yomi":"ろくせんまん","nextChar":"1"},"70000000":{"yomi":"ななせんまん","nextChar":"1"},"80000000":{"yomi":"はっせんまん","nextChar":"1"},"90000000":{"yomi":"きゅうせんまん","nextChar":"1"},"100000000":{"yomi":"いちおく","nextChar":"1"},"200000000":{"yomi":"におく","nextChar":"1"},"300000000":{"yomi":"さんおく","nextChar":"1"},"400000000":{"yomi":"よんおく","nextChar":"1"},"500000000":{"yomi":"ごおく","nextChar":"1"},"600000000":{"yomi":"ろくおく","nextChar":"1"},"700000000":{"yomi":"ななおく","nextChar":"1"},"800000000":{"yomi":"はちおく","nextChar":"1"},"900000000":{"yomi":"きゅうおく","nextChar":"1"},"1000000000":{"yomi":"じゅうおく","nextChar":"1"},"2000000000":{"yomi":"にじゅうおく","nextChar":"1"},"3000000000":{"yomi":"さんじゅうおく","nextChar":"1"},"4000000000":{"yomi":"よんじゅうおく","nextChar":"1"},"5000000000":{"yomi":"ごじゅうおく","nextChar":"1"},"6000000000":{"yomi":"ろくじゅうおく","nextChar":"1"},"7000000000":{"yomi":"ななじゅうおく","nextChar":"1"},"8000000000":{"yomi":"はちじゅうおく","nextChar":"1"},"9000000000":{"yomi":"きゅうじゅうおく","nextChar":"1"},"10000000000":{"yomi":"ひゃくおく","nextChar":"1"},"20000000000":{"yomi":"にひゃくおく","nextChar":"1"},"30000000000":{"yomi":"さんびゃくおく","nextChar":"1"},"40000000000":{"yomi":"よんひゃくおく","nextChar":"1"},"50000000000":{"yomi":"ごひゃくおく","nextChar":"1"},"60000000000":{"yomi":"ろっぴゃくおく","nextChar":"1"},"70000000000":{"yomi":"ななひゃくおく","nextChar":"1"},"80000000000":{"yomi":"はっぴゃくおく","nextChar":"1"},"90000000000":{"yomi":"きゅうひゃくおく","nextChar":"1"},"100000000000":{"yomi":"いっせんおく","nextChar":"1"},"200000000000":{"yomi":"にせんおく","nextChar":"1"},"300000000000":{"yomi":"さんぜんおく","nextChar":"1"},"400000000000":{"yomi":"よんせんおく","nextChar":"1"},"500000000000":{"yomi":"ごせんおく","nextChar":"1"},"600000000000":{"yomi":"ろくせんおく","nextChar":"1"},"700000000000":{"yomi":"ななせんおく","nextChar":"1"},"800000000000":{"yomi":"はっせんおく","nextChar":"1"},"900000000000":{"yomi":"きゅうせんおく","nextChar":"1"}},"じ":{"1":{"yomi":"いち","nextChar":"1"},"2":{"yomi":"に","nextChar":"1"},"3":{"yomi":"さん","nextChar":"1"},"4":{"yomi":"よ","nextChar":"1"},"5":{"yomi":"ご","nextChar":"1"},"6":{"yomi":"ろく","nextChar":"1"},"7":{"yomi":"なな","nextChar":"1"},"8":{"yomi":"はち","nextChar":"1"},"9":{"yomi":"く","nextChar":"1"},"10":{"yomi":"じゅう","nextChar":"1"},"20":{"yomi":"にじゅう","nextChar":"1"},"30":{"yomi":"さんじゅう","nextChar":"1"},"40":{"yomi":"よんじゅう","nextChar":"1"},"50":{"yomi":"ごじゅう","nextChar":"1"},"60":{"yomi":"ろくじゅう","nextChar":"1"},"70":{"yomi":"ななじゅう","nextChar":"1"},"80":{"yomi":"はちじゅう","nextChar":"1"},"90":{"yomi":"きゅうじゅう","nextChar":"1"},"100":{"yomi":"ひゃく","nextChar":"1"},"200":{"yomi":"にひゃく","nextChar":"1"},"300":{"yomi":"さんびゃく","nextChar":"1"},"400":{"yomi":"よんひゃく","nextChar":"1"},"500":{"yomi":"ごひゃく","nextChar":"1"},"600":{"yomi":"ろっぴゃく","nextChar":"1"},"700":{"yomi":"ななひゃく","nextChar":"1"},"800":{"yomi":"はっぴゃく","nextChar":"1"},"900":{"yomi":"きゅうひゃく","nextChar":"1"},"1000":{"yomi":"せん","nextChar":"1"},"2000":{"yomi":"にせん","nextChar":"1"},"3000":{"yomi":"さんぜん","nextChar":"1"},"4000":{"yomi":"よんせん","nextChar":"1"},"5000":{"yomi":"ごせん","nextChar":"1"},"6000":{"yomi":"ろくせん","nextChar":"1"},"7000":{"yomi":"ななせん","nextChar":"1"},"8000":{"yomi":"はっせん","nextChar":"1"},"9000":{"yomi":"きゅうせん","nextChar":"1"},"10000":{"yomi":"いちまん","nextChar":"1"},"20000":{"yomi":"にまん","nextChar":"1"},"30000":{"yomi":"さんまん","nextChar":"1"},"40000":{"yomi":"よんまん","nextChar":"1"},"50000":{"yomi":"ごまん","nextChar":"1"},"60000":{"yomi":"ろくまん","nextChar":"1"},"70000":{"yomi":"ななまん","nextChar":"1"},"80000":{"yomi":"はちまん","nextChar":"1"},"90000":{"yomi":"きゅうまん","nextChar":"1"},"100000":{"yomi":"じゅうまん","nextChar":"1"},"200000":{"yomi":"にじゅうまん","nextChar":"1"},"300000":{"yomi":"さんじゅうまん","nextChar":"1"},"400000":{"yomi":"よんじゅうまん","nextChar":"1"},"500000":{"yomi":"ごじゅうまん","nextChar":"1"},"600000":{"yomi":"ろくじゅうまん","nextChar":"1"},"700000":{"yomi":"ななじゅうまん","nextChar":"1"},"800000":{"yomi":"はちじゅうまん","nextChar":"1"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"1"},"1000000":{"yomi":"ひゃくまん","nextChar":"1"},"2000000":{"yomi":"にひゃくまん","nextChar":"1"},"3000000":{"yomi":"さんびゃくまん","nextChar":"1"},"4000000":{"yomi":"よんひゃくまん","nextChar":"1"},"5000000":{"yomi":"ごひゃくまん","nextChar":"1"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"1"},"7000000":{"yomi":"ななひゃくまん","nextChar":"1"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"1"},"9000000":{"yomi":"きゅうひゃくまん","nextChar":"1"},"10000000":{"yomi":"いっせんまん","nextChar":"1"},"20000000":{"yomi":"にせんまん","nextChar":"1"},"30000000":{"yomi":"さんぜんまん","nextChar":"1"},"40000000":{"yomi":"よんせんまん","nextChar":"1"},"50000000":{"yomi":"ごせんまん","nextChar":"1"},"60000000":{"yomi":"ろくせんまん","nextChar":"1"},"70000000":{"yomi":"ななせんまん","nextChar":"1"},"80000000":{"yomi":"はっせんまん","nextChar":"1"},"90000000":{"yomi":"きゅうせんまん","nextChar":"1"},"100000000":{"yomi":"いちおく","nextChar":"1"},"200000000":{"yomi":"におく","nextChar":"1"},"300000000":{"yomi":"さんおく","nextChar":"1"},"400000000":{"yomi":"よんおく","nextChar":"1"},"500000000":{"yomi":"ごおく","nextChar":"1"},"600000000":{"yomi":"ろくおく","nextChar":"1"},"700000000":{"yomi":"ななおく","nextChar":"1"},"800000000":{"yomi":"はちおく","nextChar":"1"},"900000000":{"yomi":"きゅうおく","nextChar":"1"},"1000000000":{"yomi":"じゅうおく","nextChar":"1"},"2000000000":{"yomi":"にじゅうおく","nextChar":"1"},"3000000000":{"yomi":"さんじゅうおく","nextChar":"1"},"4000000000":{"yomi":"よんじゅうおく","nextChar":"1"},"5000000000":{"yomi":"ごじゅうおく","nextChar":"1"},"6000000000":{"yomi":"ろくじゅうおく","nextChar":"1"},"7000000000":{"yomi":"ななじゅうおく","nextChar":"1"},"8000000000":{"yomi":"はちじゅうおく","nextChar":"1"},"9000000000":{"yomi":"きゅうじゅうおく","nextChar":"1"},"10000000000":{"yomi":"ひゃくおく","nextChar":"1"},"20000000000":{"yomi":"にひゃくおく","nextChar":"1"},"30000000000":{"yomi":"さんびゃくおく","nextChar":"1"},"40000000000":{"yomi":"よんひゃくおく","nextChar":"1"},"50000000000":{"yomi":"ごひゃくおく","nextChar":"1"},"60000000000":{"yomi":"ろっぴゃくおく","nextChar":"1"},"70000000000":{"yomi":"ななひゃくおく","nextChar":"1"},"80000000000":{"yomi":"はっぴゃくおく","nextChar":"1"},"90000000000":{"yomi":"きゅうひゃくおく","nextChar":"1"},"100000000000":{"yomi":"いっせんおく","nextChar":"1"},"200000000000":{"yomi":"にせんおく","nextChar":"1"},"300000000000":{"yomi":"さんぜんおく","nextChar":"1"},"400000000000":{"yomi":"よんせんおく","nextChar":"1"},"500000000000":{"yomi":"ごせんおく","nextChar":"1"},"600000000000":{"yomi":"ろくせんおく","nextChar":"1"},"700000000000":{"yomi":"ななせんおく","nextChar":"1"},"800000000000":{"yomi":"はっせんおく","nextChar":"1"},"900000000000":{"yomi":"きゅうせんおく","nextChar":"1"}},"は":{"1":{"yomi":"いっ","nextChar":"ぱ"},"2":{"yomi":"に","nextChar":"は"},"3":{"yomi":"さん","nextChar":"ば"},"4":{"yomi":"よん","nextChar":"は"},"5":{"yomi":"ご","nextChar":"は"},"6":{"yomi":"ろっ","nextChar":"ぱ"},"7":{"yomi":"なな","nextChar":"は"},"8":{"yomi":"はっ","nextChar":"ぱ"},"9":{"yomi":"きゅう","nextChar":"は"},"10":{"yomi":"じゅっ","nextChar":"ぱ"},"20":{"yomi":"にじゅっ","nextChar":"ぱ"},"30":{"yomi":"さんじゅっ","nextChar":"ぱ"},"40":{"yomi":"よんじゅっ","nextChar":"ぱ"},"50":{"yomi":"ごじゅっ","nextChar":"ぱ"},"60":{"yomi":"ろくじゅっ","nextChar":"ぱ"},"70":{"yomi":"ななじゅっ","nextChar":"ぱ"},"80":{"yomi":"はちじゅっ","nextChar":"ぱ"},"90":{"yomi":"きゅうじゅっ","nextChar":"ぱ"},"100":{"yomi":"ひゃっ","nextChar":"ぱ"},"200":{"yomi":"にひゃっ","nextChar":"ぱ"},"300":{"yomi":"さんびゃっ","nextChar":"ぱ"},"400":{"yomi":"よんひゃっ","nextChar":"ぱ"},"500":{"yomi":"ごひゃっ","nextChar":"ぱ"},"600":{"yomi":"ろっぴゃっ","nextChar":"ぱ"},"700":{"yomi":"ななひゃっ","nextChar":"ぱ"},"800":{"yomi":"はっぴゃっ","nextChar":"ぱ"},"900":{"yomi":"きゅうひゃっ","nextChar":"ぱ"},"1000":{"yomi":"せん","nextChar":"ば"},"2000":{"yomi":"にせん","nextChar":"ば"},"3000":{"yomi":"さんぜん","nextChar":"ば"},"4000":{"yomi":"よんせん","nextChar":"ば"},"5000":{"yomi":"ごせん","nextChar":"ば"},"6000":{"yomi":"ろくせん","nextChar":"ば"},"7000":{"yomi":"ななせん","nextChar":"ば"},"8000":{"yomi":"はっせん","nextChar":"ば"},"9000":{"yomi":"きゅうせん","nextChar":"ば"},"10000":{"yomi":"いちまん","nextChar":"ば"},"20000":{"yomi":"にまん","nextChar":"ば"},"30000":{"yomi":"さんまん","nextChar":"ば"},"40000":{"yomi":"よんまん","nextChar":"ば"},"50000":{"yomi":"ごまん","nextChar":"ば"},"60000":{"yomi":"ろくまん","nextChar":"ば"},"70000":{"yomi":"ななまん","nextChar":"ば"},"80000":{"yomi":"はちまん","nextChar":"ば"},"90000":{"yomi":"きゅうまん","nextChar":"ば"},"100000":{"yomi":"じゅうまん","nextChar":"ば"},"200000":{"yomi":"にじゅうまん","nextChar":"ば"},"300000":{"yomi":"さんじゅうまん","nextChar":"ば"},"400000":{"yomi":"よんじゅうまん","nextChar":"ば"},"500000":{"yomi":"ごじゅうまん","nextChar":"ば"},"600000":{"yomi":"ろくじゅうまん","nextChar":"ば"},"700000":{"yomi":"ななじゅうまん","nextChar":"ば"},"800000":{"yomi":"はちじゅうまん","nextChar":"ば"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"ば"},"1000000":{"yomi":"ひゃくまん","nextChar":"ば"},"2000000":{"yomi":"にひゃくまん","nextChar":"ば"},"3000000":{"yomi":"さんびゃくまん","nextChar":"ば"},"4000000":{"yomi":"よんひゃくまん","nextChar":"ば"},"5000000":{"yomi":"ごひゃくまん","nextChar":"ば"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"ば"},"7000000":{"yomi":"ななひゃくまん","nextChar":"ば"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"ば"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"ば"},"10000000":{"yomi":"いっせんまん","nextChar":"ば"},"20000000":{"yomi":"にせんまん","nextChar":"ば"},"30000000":{"yomi":"さんぜんまん","nextChar":"ば"},"40000000":{"yomi":"よんせんまん","nextChar":"ば"},"50000000":{"yomi":"ごせんまん","nextChar":"ば"},"60000000":{"yomi":"ろくせんまん","nextChar":"ば"},"70000000":{"yomi":"ななせんまん","nextChar":"ば"},"80000000":{"yomi":"はっせんまん","nextChar":"ば"},"90000000":{"yomi":"きゅうせんまん","nextChar":"ば"},"100000000":{"yomi":"いちおっ","nextChar":"ぱ"},"200000000":{"yomi":"におっ","nextChar":"ぱ"},"300000000":{"yomi":"さんおっ","nextChar":"ぱ"},"400000000":{"yomi":"よんおっ","nextChar":"ぱ"},"500000000":{"yomi":"ごおっ","nextChar":"ぱ"},"600000000":{"yomi":"ろくおっ","nextChar":"ぱ"},"700000000":{"yomi":"ななおっ","nextChar":"ぱ"},"800000000":{"yomi":"はちおっ","nextChar":"ぱ"},"900000000":{"yomi":"きゅうおっ","nextChar":"ぱ"},"1000000000":{"yomi":"じゅうおっ","nextChar":"ぱ"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"ぱ"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"ぱ"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"ぱ"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"ぱ"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"ぱ"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"ぱ"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"ぱ"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"ぱ"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"ぱ"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"ぱ"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"ぱ"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"ぱ"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"ぱ"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"ぱ"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"ぱ"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"ぱ"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"ぱ"},"100000000000":{"yomi":"いっせんおっ","nextChar":"ぱ"},"200000000000":{"yomi":"にせんおっ","nextChar":"ぱ"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"ぱ"},"400000000000":{"yomi":"よんせんおっ","nextChar":"ぱ"},"500000000000":{"yomi":"ごせんおっ","nextChar":"ぱ"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"ぱ"},"700000000000":{"yomi":"ななせんおっ","nextChar":"ぱ"},"800000000000":{"yomi":"はっせんおっ","nextChar":"ぱ"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"ぱ"}},"ひ":{"1":{"yomi":"いっ","nextChar":"ぴ"},"2":{"yomi":"に","nextChar":"ひ"},"3":{"yomi":"さん","nextChar":"び"},"4":{"yomi":"よん","nextChar":"ひ"},"5":{"yomi":"ご","nextChar":"ひ"},"6":{"yomi":"ろっ","nextChar":"ぴ"},"7":{"yomi":"なな","nextChar":"ひ"},"8":{"yomi":"はっ","nextChar":"ぴ"},"9":{"yomi":"きゅう","nextChar":"ひ"},"10":{"yomi":"じゅっ","nextChar":"ぴ"},"20":{"yomi":"にじゅっ","nextChar":"ぴ"},"30":{"yomi":"さんじゅっ","nextChar":"ぴ"},"40":{"yomi":"よんじゅっ","nextChar":"ぴ"},"50":{"yomi":"ごじゅっ","nextChar":"ぴ"},"60":{"yomi":"ろくじゅっ","nextChar":"ぴ"},"70":{"yomi":"ななじゅっ","nextChar":"ぴ"},"80":{"yomi":"はちじゅっ","nextChar":"ぴ"},"90":{"yomi":"きゅうじゅっ","nextChar":"ぴ"},"100":{"yomi":"ひゃっ","nextChar":"ぴ"},"200":{"yomi":"にひゃっ","nextChar":"ぴ"},"300":{"yomi":"さんびゃっ","nextChar":"ぴ"},"400":{"yomi":"よんひゃっ","nextChar":"ぴ"},"500":{"yomi":"ごひゃっ","nextChar":"ぴ"},"600":{"yomi":"ろっぴゃっ","nextChar":"ぴ"},"700":{"yomi":"ななひゃっ","nextChar":"ぴ"},"800":{"yomi":"はっぴゃっ","nextChar":"ぴ"},"900":{"yomi":"きゅうひゃっ","nextChar":"ぴ"},"1000":{"yomi":"せん","nextChar":"び"},"2000":{"yomi":"にせん","nextChar":"び"},"3000":{"yomi":"さんぜん","nextChar":"び"},"4000":{"yomi":"よんせん","nextChar":"び"},"5000":{"yomi":"ごせん","nextChar":"び"},"6000":{"yomi":"ろくせん","nextChar":"び"},"7000":{"yomi":"ななせん","nextChar":"び"},"8000":{"yomi":"はっせん","nextChar":"び"},"9000":{"yomi":"きゅうせん","nextChar":"び"},"10000":{"yomi":"いちまん","nextChar":"び"},"20000":{"yomi":"にまん","nextChar":"び"},"30000":{"yomi":"さんまん","nextChar":"び"},"40000":{"yomi":"よんまん","nextChar":"び"},"50000":{"yomi":"ごまん","nextChar":"び"},"60000":{"yomi":"ろくまん","nextChar":"び"},"70000":{"yomi":"ななまん","nextChar":"び"},"80000":{"yomi":"はちまん","nextChar":"び"},"90000":{"yomi":"きゅうまん","nextChar":"び"},"100000":{"yomi":"じゅうまん","nextChar":"び"},"200000":{"yomi":"にじゅうまん","nextChar":"び"},"300000":{"yomi":"さんじゅうまん","nextChar":"び"},"400000":{"yomi":"よんじゅうまん","nextChar":"び"},"500000":{"yomi":"ごじゅうまん","nextChar":"び"},"600000":{"yomi":"ろくじゅうまん","nextChar":"び"},"700000":{"yomi":"ななじゅうまん","nextChar":"び"},"800000":{"yomi":"はちじゅうまん","nextChar":"び"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"び"},"1000000":{"yomi":"ひゃくまん","nextChar":"び"},"2000000":{"yomi":"にひゃくまん","nextChar":"び"},"3000000":{"yomi":"さんびゃくまん","nextChar":"び"},"4000000":{"yomi":"よんひゃくまん","nextChar":"び"},"5000000":{"yomi":"ごひゃくまん","nextChar":"び"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"び"},"7000000":{"yomi":"ななひゃくまん","nextChar":"び"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"び"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"び"},"10000000":{"yomi":"いっせんまん","nextChar":"び"},"20000000":{"yomi":"にせんまん","nextChar":"び"},"30000000":{"yomi":"さんぜんまん","nextChar":"び"},"40000000":{"yomi":"よんせんまん","nextChar":"び"},"50000000":{"yomi":"ごせんまん","nextChar":"び"},"60000000":{"yomi":"ろくせんまん","nextChar":"び"},"70000000":{"yomi":"ななせんまん","nextChar":"び"},"80000000":{"yomi":"はっせんまん","nextChar":"び"},"90000000":{"yomi":"きゅうせんまん","nextChar":"び"},"100000000":{"yomi":"いちおっ","nextChar":"ぴ"},"200000000":{"yomi":"におっ","nextChar":"ぴ"},"300000000":{"yomi":"さんおっ","nextChar":"ぴ"},"400000000":{"yomi":"よんおっ","nextChar":"ぴ"},"500000000":{"yomi":"ごおっ","nextChar":"ぴ"},"600000000":{"yomi":"ろくおっ","nextChar":"ぴ"},"700000000":{"yomi":"ななおっ","nextChar":"ぴ"},"800000000":{"yomi":"はちおっ","nextChar":"ぴ"},"900000000":{"yomi":"きゅうおっ","nextChar":"ぴ"},"1000000000":{"yomi":"じゅうおっ","nextChar":"ぴ"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"ぴ"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"ぴ"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"ぴ"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"ぴ"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"ぴ"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"ぴ"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"ぴ"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"ぴ"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"ぴ"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"ぴ"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"ぴ"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"ぴ"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"ぴ"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"ぴ"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"ぴ"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"ぴ"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"ぴ"},"100000000000":{"yomi":"いっせんおっ","nextChar":"ぴ"},"200000000000":{"yomi":"にせんおっ","nextChar":"ぴ"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"ぴ"},"400000000000":{"yomi":"よんせんおっ","nextChar":"ぴ"},"500000000000":{"yomi":"ごせんおっ","nextChar":"ぴ"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"ぴ"},"700000000000":{"yomi":"ななせんおっ","nextChar":"ぴ"},"800000000000":{"yomi":"はっせんおっ","nextChar":"ぴ"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"ぴ"}},"ふ":{"1":{"yomi":"いっ","nextChar":"ぷ"},"2":{"yomi":"に","nextChar":"ふ"},"3":{"yomi":"さん","nextChar":"ぶ"},"4":{"yomi":"よん","nextChar":"ふ"},"5":{"yomi":"ご","nextChar":"ふ"},"6":{"yomi":"ろっ","nextChar":"ぷ"},"7":{"yomi":"なな","nextChar":"ふ"},"8":{"yomi":"はっ","nextChar":"ぷ"},"9":{"yomi":"きゅう","nextChar":"ふ"},"10":{"yomi":"じゅっ","nextChar":"ぷ"},"20":{"yomi":"にじゅっ","nextChar":"ぷ"},"30":{"yomi":"さんじゅっ","nextChar":"ぷ"},"40":{"yomi":"よんじゅっ","nextChar":"ぷ"},"50":{"yomi":"ごじゅっ","nextChar":"ぷ"},"60":{"yomi":"ろくじゅっ","nextChar":"ぷ"},"70":{"yomi":"ななじゅっ","nextChar":"ぷ"},"80":{"yomi":"はちじゅっ","nextChar":"ぷ"},"90":{"yomi":"きゅうじゅっ","nextChar":"ぷ"},"100":{"yomi":"ひゃっ","nextChar":"ぷ"},"200":{"yomi":"にひゃっ","nextChar":"ぷ"},"300":{"yomi":"さんびゃっ","nextChar":"ぷ"},"400":{"yomi":"よんひゃっ","nextChar":"ぷ"},"500":{"yomi":"ごひゃっ","nextChar":"ぷ"},"600":{"yomi":"ろっぴゃっ","nextChar":"ぷ"},"700":{"yomi":"ななひゃっ","nextChar":"ぷ"},"800":{"yomi":"はっぴゃっ","nextChar":"ぷ"},"900":{"yomi":"きゅうひゃっ","nextChar":"ぷ"},"1000":{"yomi":"せん","nextChar":"ぶ"},"2000":{"yomi":"にせん","nextChar":"ぶ"},"3000":{"yomi":"さんぜん","nextChar":"ぶ"},"4000":{"yomi":"よんせん","nextChar":"ぶ"},"5000":{"yomi":"ごせん","nextChar":"ぶ"},"6000":{"yomi":"ろくせん","nextChar":"ぶ"},"7000":{"yomi":"ななせん","nextChar":"ぶ"},"8000":{"yomi":"はっせん","nextChar":"ぶ"},"9000":{"yomi":"きゅうせん","nextChar":"ぶ"},"10000":{"yomi":"いちまん","nextChar":"ぶ"},"20000":{"yomi":"にまん","nextChar":"ぶ"},"30000":{"yomi":"さんまん","nextChar":"ぶ"},"40000":{"yomi":"よんまん","nextChar":"ぶ"},"50000":{"yomi":"ごまん","nextChar":"ぶ"},"60000":{"yomi":"ろくまん","nextChar":"ぶ"},"70000":{"yomi":"ななまん","nextChar":"ぶ"},"80000":{"yomi":"はちまん","nextChar":"ぶ"},"90000":{"yomi":"きゅうまん","nextChar":"ぶ"},"100000":{"yomi":"じゅうまん","nextChar":"ぶ"},"200000":{"yomi":"にじゅうまん","nextChar":"ぶ"},"300000":{"yomi":"さんじゅうまん","nextChar":"ぶ"},"400000":{"yomi":"よんじゅうまん","nextChar":"ぶ"},"500000":{"yomi":"ごじゅうまん","nextChar":"ぶ"},"600000":{"yomi":"ろくじゅうまん","nextChar":"ぶ"},"700000":{"yomi":"ななじゅうまん","nextChar":"ぶ"},"800000":{"yomi":"はちじゅうまん","nextChar":"ぶ"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"ぶ"},"1000000":{"yomi":"ひゃくまん","nextChar":"ぶ"},"2000000":{"yomi":"にひゃくまん","nextChar":"ぶ"},"3000000":{"yomi":"さんびゃくまん","nextChar":"ぶ"},"4000000":{"yomi":"よんひゃくまん","nextChar":"ぶ"},"5000000":{"yomi":"ごひゃくまん","nextChar":"ぶ"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"ぶ"},"7000000":{"yomi":"ななひゃくまん","nextChar":"ぶ"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"ぶ"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"ぶ"},"10000000":{"yomi":"いっせんまん","nextChar":"ぶ"},"20000000":{"yomi":"にせんまん","nextChar":"ぶ"},"30000000":{"yomi":"さんぜんまん","nextChar":"ぶ"},"40000000":{"yomi":"よんせんまん","nextChar":"ぶ"},"50000000":{"yomi":"ごせんまん","nextChar":"ぶ"},"60000000":{"yomi":"ろくせんまん","nextChar":"ぶ"},"70000000":{"yomi":"ななせんまん","nextChar":"ぶ"},"80000000":{"yomi":"はっせんまん","nextChar":"ぶ"},"90000000":{"yomi":"きゅうせんまん","nextChar":"ぶ"},"100000000":{"yomi":"いちおっ","nextChar":"ぷ"},"200000000":{"yomi":"におっ","nextChar":"ぷ"},"300000000":{"yomi":"さんおっ","nextChar":"ぷ"},"400000000":{"yomi":"よんおっ","nextChar":"ぷ"},"500000000":{"yomi":"ごおっ","nextChar":"ぷ"},"600000000":{"yomi":"ろくおっ","nextChar":"ぷ"},"700000000":{"yomi":"ななおっ","nextChar":"ぷ"},"800000000":{"yomi":"はちおっ","nextChar":"ぷ"},"900000000":{"yomi":"きゅうおっ","nextChar":"ぷ"},"1000000000":{"yomi":"じゅうおっ","nextChar":"ぷ"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"ぷ"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"ぷ"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"ぷ"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"ぷ"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"ぷ"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"ぷ"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"ぷ"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"ぷ"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"ぷ"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"ぷ"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"ぷ"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"ぷ"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"ぷ"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"ぷ"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"ぷ"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"ぷ"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"ぷ"},"100000000000":{"yomi":"いっせんおっ","nextChar":"ぷ"},"200000000000":{"yomi":"にせんおっ","nextChar":"ぷ"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"ぷ"},"400000000000":{"yomi":"よんせんおっ","nextChar":"ぷ"},"500000000000":{"yomi":"ごせんおっ","nextChar":"ぷ"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"ぷ"},"700000000000":{"yomi":"ななせんおっ","nextChar":"ぷ"},"800000000000":{"yomi":"はっせんおっ","nextChar":"ぷ"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"ぷ"}},"へ":{"1":{"yomi":"いっ","nextChar":"ぺ"},"2":{"yomi":"に","nextChar":"へ"},"3":{"yomi":"さん","nextChar":"べ"},"4":{"yomi":"よん","nextChar":"へ"},"5":{"yomi":"ご","nextChar":"へ"},"6":{"yomi":"ろっ","nextChar":"ぺ"},"7":{"yomi":"なな","nextChar":"へ"},"8":{"yomi":"はっ","nextChar":"ぺ"},"9":{"yomi":"きゅう","nextChar":"へ"},"10":{"yomi":"じゅっ","nextChar":"ぺ"},"20":{"yomi":"にじゅっ","nextChar":"ぺ"},"30":{"yomi":"さんじゅっ","nextChar":"ぺ"},"40":{"yomi":"よんじゅっ","nextChar":"ぺ"},"50":{"yomi":"ごじゅっ","nextChar":"ぺ"},"60":{"yomi":"ろくじゅっ","nextChar":"ぺ"},"70":{"yomi":"ななじゅっ","nextChar":"ぺ"},"80":{"yomi":"はちじゅっ","nextChar":"ぺ"},"90":{"yomi":"きゅうじゅっ","nextChar":"ぺ"},"100":{"yomi":"ひゃっ","nextChar":"ぺ"},"200":{"yomi":"にひゃっ","nextChar":"ぺ"},"300":{"yomi":"さんびゃっ","nextChar":"ぺ"},"400":{"yomi":"よんひゃっ","nextChar":"ぺ"},"500":{"yomi":"ごひゃっ","nextChar":"ぺ"},"600":{"yomi":"ろっぴゃっ","nextChar":"ぺ"},"700":{"yomi":"ななひゃっ","nextChar":"ぺ"},"800":{"yomi":"はっぴゃっ","nextChar":"ぺ"},"900":{"yomi":"きゅうひゃっ","nextChar":"ぺ"},"1000":{"yomi":"せん","nextChar":"べ"},"2000":{"yomi":"にせん","nextChar":"べ"},"3000":{"yomi":"さんぜん","nextChar":"べ"},"4000":{"yomi":"よんせん","nextChar":"べ"},"5000":{"yomi":"ごせん","nextChar":"べ"},"6000":{"yomi":"ろくせん","nextChar":"べ"},"7000":{"yomi":"ななせん","nextChar":"べ"},"8000":{"yomi":"はっせん","nextChar":"べ"},"9000":{"yomi":"きゅうせん","nextChar":"べ"},"10000":{"yomi":"いちまん","nextChar":"べ"},"20000":{"yomi":"にまん","nextChar":"べ"},"30000":{"yomi":"さんまん","nextChar":"べ"},"40000":{"yomi":"よんまん","nextChar":"べ"},"50000":{"yomi":"ごまん","nextChar":"べ"},"60000":{"yomi":"ろくまん","nextChar":"べ"},"70000":{"yomi":"ななまん","nextChar":"べ"},"80000":{"yomi":"はちまん","nextChar":"べ"},"90000":{"yomi":"きゅうまん","nextChar":"べ"},"100000":{"yomi":"じゅうまん","nextChar":"べ"},"200000":{"yomi":"にじゅうまん","nextChar":"べ"},"300000":{"yomi":"さんじゅうまん","nextChar":"べ"},"400000":{"yomi":"よんじゅうまん","nextChar":"べ"},"500000":{"yomi":"ごじゅうまん","nextChar":"べ"},"600000":{"yomi":"ろくじゅうまん","nextChar":"べ"},"700000":{"yomi":"ななじゅうまん","nextChar":"べ"},"800000":{"yomi":"はちじゅうまん","nextChar":"べ"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"べ"},"1000000":{"yomi":"ひゃくまん","nextChar":"べ"},"2000000":{"yomi":"にひゃくまん","nextChar":"べ"},"3000000":{"yomi":"さんびゃくまん","nextChar":"べ"},"4000000":{"yomi":"よんひゃくまん","nextChar":"べ"},"5000000":{"yomi":"ごひゃくまん","nextChar":"べ"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"べ"},"7000000":{"yomi":"ななひゃくまん","nextChar":"べ"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"べ"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"べ"},"10000000":{"yomi":"いっせんまん","nextChar":"べ"},"20000000":{"yomi":"にせんまん","nextChar":"べ"},"30000000":{"yomi":"さんぜんまん","nextChar":"べ"},"40000000":{"yomi":"よんせんまん","nextChar":"べ"},"50000000":{"yomi":"ごせんまん","nextChar":"べ"},"60000000":{"yomi":"ろくせんまん","nextChar":"べ"},"70000000":{"yomi":"ななせんまん","nextChar":"べ"},"80000000":{"yomi":"はっせんまん","nextChar":"べ"},"90000000":{"yomi":"きゅうせんまん","nextChar":"べ"},"100000000":{"yomi":"いちおっ","nextChar":"ぺ"},"200000000":{"yomi":"におっ","nextChar":"ぺ"},"300000000":{"yomi":"さんおっ","nextChar":"ぺ"},"400000000":{"yomi":"よんおっ","nextChar":"ぺ"},"500000000":{"yomi":"ごおっ","nextChar":"ぺ"},"600000000":{"yomi":"ろくおっ","nextChar":"ぺ"},"700000000":{"yomi":"ななおっ","nextChar":"ぺ"},"800000000":{"yomi":"はちおっ","nextChar":"ぺ"},"900000000":{"yomi":"きゅうおっ","nextChar":"ぺ"},"1000000000":{"yomi":"じゅうおっ","nextChar":"ぺ"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"ぺ"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"ぺ"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"ぺ"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"ぺ"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"ぺ"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"ぺ"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"ぺ"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"ぺ"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"ぺ"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"ぺ"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"ぺ"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"ぺ"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"ぺ"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"ぺ"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"ぺ"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"ぺ"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"ぺ"},"100000000000":{"yomi":"いっせんおっ","nextChar":"ぺ"},"200000000000":{"yomi":"にせんおっ","nextChar":"ぺ"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"ぺ"},"400000000000":{"yomi":"よんせんおっ","nextChar":"ぺ"},"500000000000":{"yomi":"ごせんおっ","nextChar":"ぺ"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"ぺ"},"700000000000":{"yomi":"ななせんおっ","nextChar":"ぺ"},"800000000000":{"yomi":"はっせんおっ","nextChar":"ぺ"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"ぺ"}},"ほ":{"1":{"yomi":"いっ","nextChar":"ぽ"},"2":{"yomi":"に","nextChar":"ほ"},"3":{"yomi":"さん","nextChar":"ぼ"},"4":{"yomi":"よん","nextChar":"ほ"},"5":{"yomi":"ご","nextChar":"ほ"},"6":{"yomi":"ろっ","nextChar":"ぽ"},"7":{"yomi":"なな","nextChar":"ほ"},"8":{"yomi":"はっ","nextChar":"ぽ"},"9":{"yomi":"きゅう","nextChar":"ほ"},"10":{"yomi":"じゅっ","nextChar":"ぽ"},"20":{"yomi":"にじゅっ","nextChar":"ぽ"},"30":{"yomi":"さんじゅっ","nextChar":"ぽ"},"40":{"yomi":"よんじゅっ","nextChar":"ぽ"},"50":{"yomi":"ごじゅっ","nextChar":"ぽ"},"60":{"yomi":"ろくじゅっ","nextChar":"ぽ"},"70":{"yomi":"ななじゅっ","nextChar":"ぽ"},"80":{"yomi":"はちじゅっ","nextChar":"ぽ"},"90":{"yomi":"きゅうじゅっ","nextChar":"ぽ"},"100":{"yomi":"ひゃっ","nextChar":"ぽ"},"200":{"yomi":"にひゃっ","nextChar":"ぽ"},"300":{"yomi":"さんびゃっ","nextChar":"ぽ"},"400":{"yomi":"よんひゃっ","nextChar":"ぽ"},"500":{"yomi":"ごひゃっ","nextChar":"ぽ"},"600":{"yomi":"ろっぴゃっ","nextChar":"ぽ"},"700":{"yomi":"ななひゃっ","nextChar":"ぽ"},"800":{"yomi":"はっぴゃっ","nextChar":"ぽ"},"900":{"yomi":"きゅうひゃっ","nextChar":"ぽ"},"1000":{"yomi":"せん","nextChar":"ぼ"},"2000":{"yomi":"にせん","nextChar":"ぼ"},"3000":{"yomi":"さんぜん","nextChar":"ぼ"},"4000":{"yomi":"よんせん","nextChar":"ぼ"},"5000":{"yomi":"ごせん","nextChar":"ぼ"},"6000":{"yomi":"ろくせん","nextChar":"ぼ"},"7000":{"yomi":"ななせん","nextChar":"ぼ"},"8000":{"yomi":"はっせん","nextChar":"ぼ"},"9000":{"yomi":"きゅうせん","nextChar":"ぼ"},"10000":{"yomi":"いちまん","nextChar":"ぼ"},"20000":{"yomi":"にまん","nextChar":"ぼ"},"30000":{"yomi":"さんまん","nextChar":"ぼ"},"40000":{"yomi":"よんまん","nextChar":"ぼ"},"50000":{"yomi":"ごまん","nextChar":"ぼ"},"60000":{"yomi":"ろくまん","nextChar":"ぼ"},"70000":{"yomi":"ななまん","nextChar":"ぼ"},"80000":{"yomi":"はちまん","nextChar":"ぼ"},"90000":{"yomi":"きゅうまん","nextChar":"ぼ"},"100000":{"yomi":"じゅうまん","nextChar":"ぼ"},"200000":{"yomi":"にじゅうまん","nextChar":"ぼ"},"300000":{"yomi":"さんじゅうまん","nextChar":"ぼ"},"400000":{"yomi":"よんじゅうまん","nextChar":"ぼ"},"500000":{"yomi":"ごじゅうまん","nextChar":"ぼ"},"600000":{"yomi":"ろくじゅうまん","nextChar":"ぼ"},"700000":{"yomi":"ななじゅうまん","nextChar":"ぼ"},"800000":{"yomi":"はちじゅうまん","nextChar":"ぼ"},"900000":{"yomi":"きゅうじゅうまん","nextChar":"ぼ"},"1000000":{"yomi":"ひゃくまん","nextChar":"ぼ"},"2000000":{"yomi":"にひゃくまん","nextChar":"ぼ"},"3000000":{"yomi":"さんびゃくまん","nextChar":"ぼ"},"4000000":{"yomi":"よんひゃくまん","nextChar":"ぼ"},"5000000":{"yomi":"ごひゃくまん","nextChar":"ぼ"},"6000000":{"yomi":"ろっぴゃくまん","nextChar":"ぼ"},"7000000":{"yomi":"ななひゃくまん","nextChar":"ぼ"},"8000000":{"yomi":"はっぴゃくまん","nextChar":"ぼ"},"9000000":{"yomi":"きゅうきゃくまん","nextChar":"ぼ"},"10000000":{"yomi":"いっせんまん","nextChar":"ぼ"},"20000000":{"yomi":"にせんまん","nextChar":"ぼ"},"30000000":{"yomi":"さんぜんまん","nextChar":"ぼ"},"40000000":{"yomi":"よんせんまん","nextChar":"ぼ"},"50000000":{"yomi":"ごせんまん","nextChar":"ぼ"},"60000000":{"yomi":"ろくせんまん","nextChar":"ぼ"},"70000000":{"yomi":"ななせんまん","nextChar":"ぼ"},"80000000":{"yomi":"はっせんまん","nextChar":"ぼ"},"90000000":{"yomi":"きゅうせんまん","nextChar":"ぼ"},"100000000":{"yomi":"いちおっ","nextChar":"ぽ"},"200000000":{"yomi":"におっ","nextChar":"ぽ"},"300000000":{"yomi":"さんおっ","nextChar":"ぽ"},"400000000":{"yomi":"よんおっ","nextChar":"ぽ"},"500000000":{"yomi":"ごおっ","nextChar":"ぽ"},"600000000":{"yomi":"ろくおっ","nextChar":"ぽ"},"700000000":{"yomi":"ななおっ","nextChar":"ぽ"},"800000000":{"yomi":"はちおっ","nextChar":"ぽ"},"900000000":{"yomi":"きゅうおっ","nextChar":"ぽ"},"1000000000":{"yomi":"じゅうおっ","nextChar":"ぽ"},"2000000000":{"yomi":"にじゅうおっ","nextChar":"ぽ"},"3000000000":{"yomi":"さんじゅうおっ","nextChar":"ぽ"},"4000000000":{"yomi":"よんじゅうおっ","nextChar":"ぽ"},"5000000000":{"yomi":"ごじゅうおっ","nextChar":"ぽ"},"6000000000":{"yomi":"ろくじゅうおっ","nextChar":"ぽ"},"7000000000":{"yomi":"ななじゅうおっ","nextChar":"ぽ"},"8000000000":{"yomi":"はちじゅうおっ","nextChar":"ぽ"},"9000000000":{"yomi":"きゅうじゅうおっ","nextChar":"ぽ"},"10000000000":{"yomi":"ひゃくおっ","nextChar":"ぽ"},"20000000000":{"yomi":"にひゃくおっ","nextChar":"ぽ"},"30000000000":{"yomi":"さんびゃくおっ","nextChar":"ぽ"},"40000000000":{"yomi":"よんひゃくおっ","nextChar":"ぽ"},"50000000000":{"yomi":"ごひゃくおっ","nextChar":"ぽ"},"60000000000":{"yomi":"ろっぴゃくおっ","nextChar":"ぽ"},"70000000000":{"yomi":"ななひゃくおっ","nextChar":"ぽ"},"80000000000":{"yomi":"はっぴゃくおっ","nextChar":"ぽ"},"90000000000":{"yomi":"きゅうひゃくおっ","nextChar":"ぽ"},"100000000000":{"yomi":"いっせんおっ","nextChar":"ぽ"},"200000000000":{"yomi":"にせんおっ","nextChar":"ぽ"},"300000000000":{"yomi":"さんぜんおっ","nextChar":"ぽ"},"400000000000":{"yomi":"よんせんおっ","nextChar":"ぽ"},"500000000000":{"yomi":"ごせんおっ","nextChar":"ぽ"},"600000000000":{"yomi":"ろくせんおっ","nextChar":"ぽ"},"700000000000":{"yomi":"ななせんおっ","nextChar":"ぽ"},"800000000000":{"yomi":"はっせんおっ","nextChar":"ぽ"},"900000000000":{"yomi":"きゅうせんおっ","nextChar":"ぽ"}}}
},{}],27:[function(require,module,exports){
module.exports = {"へと":"えと","への":"えの","へは":"えわ","へわ":"えわ","へが":"えが","へも":"えも","へか":"えか","へやら":"えやら","へなり":"えなり","へだの":"えだの","へばかり":"えばかり","へだけ":"えだけ","へまで":"えまで","へほど":"えほど","へなど":"えなど","へこそ":"えこそ","へでも":"えでも","へさえ":"えさえ","へだに":"えだに"}
},{}],28:[function(require,module,exports){
module.exports = {"qqa":"a","bqq":"b","chqq":"ch","cchqq":"cch","dqq":"d","qqe":"e","fqq":"f","gqq":"g","hqq":"h","qqi":"i","jqq":"j","kqq":"k","kkqq":"kk","mqq":"m","nqq":"n","qqo":"o","pqq":"p","ppqq":"pp","rqq":"r","sqq":"s","ssqq":"ss","shqq":"sh","sshqq":"ssh","tqq":"t","ttqq":"tt","tsqq":"ts","ttsqq":"tts","qqu":"u","wqq":"w","(a)qq":"(a)","yqq":"y","qqya":"ya","qqyo":"yo","qqyu":"yu","zqq":"z","(a)a":"あ","(a)i":"い","(a)u":"う","(a)e":"え","(a)o":"お","(a)ya":"(や)","(a)yu":"(ゆ)","(a)yo":"(よ)","ka":"か","ki":"き","ku":"く","ke":"け","ko":"こ","kya":"きゃ","kyu":"きゅ","kyo":"きょ","ga":"が","gi":"ぎ","gu":"ぐ","ge":"げ","go":"ご","gya":"ぎゃ","gyu":"ぎゅ","gyo":"ぎょ","sa":"さ","si":"スィ","su":"す","se":"せ","so":"そ","sya":"(しゃ)","syu":"(しゅ)","syo":"(しょ)","sha":"しゃ","shi":"し","shu":"しゅ","she":"シェ","sho":"しょ","shya":"(しゃ)","shyu":"(しゅ)","shyo":"(しょ)","za":"ざ","zi":"ズィ","zu":"ず","ze":"ぜ","zo":"ぞ","zya":"(じゃ)","zyu":"(じゅ)","zyo":"(じょ)","ja":"じゃ","ji":"じ","ju":"じゅ","je":"ジェ","jo":"じょ","jya":"(じゃ)","jyu":"(じゅ)","jyo":"(じょ)","ta":"た","ti":"ティ","tu":"トゥ","te":"て","to":"と","tya":"(ちゃ)","tyu":"(ちゅ)","tyo":"(ちょ)","cha":"ちゃ","chi":"ち","chu":"ちゅ","che":"チェ","cho":"ちょ","chya":"(ちゃ)","chyu":"(ちゅ)","chyo":"(ちょ)","tsa":"ツァ","tsi":"ツィ","tsu":"つ","tse":"ツェ","tso":"ツォ","tsya":"(ちゃ)","tsyu":"(ちゅ)","tsyo":"(ちょ)","da":"だ","di":"ディ","du":"ドゥ","de":"で","do":"ど","dya":"(じゃ)","dyu":"(じゅ)","dyo":"(じょ)","na":"な","ni":"に","nu":"ぬ","ne":"ね","no":"の","nya":"にゃ","nyu":"にゅ","nyo":"にょ","ha":"は","hi":"ひ","hu":"(ふ)","he":"へ","ho":"ほ","hya":"ひゃ","hyu":"ひゅ","hyo":"ひょ","ba":"ば","bi":"び","bu":"ぶ","be":"べ","bo":"ぼ","bya":"びゃ","byu":"びゅ","byo":"びょ","pa":"ぱ","pi":"ぴ","pu":"ぷ","pe":"ぺ","po":"ぽ","pya":"ぴゃ","pyu":"ぴゅ","pyo":"ぴょ","fa":"ファ","fi":"フィ","fu":"ふ","fe":"フェ","fo":"フォ","fya":"(ひゃ)","fyu":"(ひゅ)","fyo":"(ひょ)","ma":"ま","mi":"み","mu":"む","me":"め","mo":"も","mya":"みゃ","myu":"みゅ","myo":"みょ","ya":"や","yi":"(い)","yu":"ゆ","ye":"イェ","yo":"よ","yya":"(や)","yyu":"(ゆ)","yyo":"(よ)","ra":"ら","ri":"り","ru":"る","re":"れ","ro":"ろ","rya":"りゃ","ryu":"りゅ","ryo":"りょ","wa":"わ","wi":"ウィ","wu":"(う)","we":"ウェ","wo":"を","wya":"(--)","wyo":"(--)","wyu":"(--)","NNa":"んあ","NNi":"んい","NNu":"んう","NNe":"んえ","NNo":"んお","NNya":"んや","NNyu":"んゆ","NNyo":"んよ","NNan":"んあん","NNin":"んいん","NNun":"んうん","NNen":"んえん","NNon":"んおん","NNyan":"んやん","NNyun":"んゆん","NNyon":"んよん","NNatt":"んあっ","NNitt":"んいっ","NNutt":"んうっ","NNett":"んえっ","NNott":"んおっ","NNyatt":"んやっ","NNyutt":"んゆっ","NNyott":"んよっ","NNqq":"ん","qqqq":"","(a)ai":"あい","(a)yai":"(やい)","kai":"かい","kkai":"っかい","kyai":"きゃい","kkyai":"っきゃい","gai":"がい","gyai":"ぎゃい","sai":"さい","ssai":"っさい","syai":"(しゃい)","ssyai":"(っしゃい)","shai":"しゃい","sshai":"っしゃい","shyai":"(しゃい)","sshyai":"(っしゃい)","zai":"ざい","zyai":"(じゃい)","jai":"じゃい","jyai":"(じゃい)","tai":"たい","ttai":"ったい","chyai":"ちゃい","cchyai":"っちゃい","chai":"ちゃい","cchai":"っちゃい","tsai":"ツァイ","tsyai":"(ちゃい)","ttsai":"ッツァイ","ttsyai":"(っちゃい)","tyai":"(ちゃい)","ttyai":"(っちゃい)","dai":"だい","dyai":"(じゃい)","nai":"ない","nyai":"にゃい","hai":"はい","hyai":"ひゃい","bai":"ばい","byai":"びゃい","pai":"ぱい","ppai":"っぱい","pyai":"ぴゃい","ppyai":"っぴゃい","fai":"ファイ","fyai":"(ひゃい)","mai":"まい","myai":"みゃい","yai":"やい","yyai":"(やい)","rai":"らい","ryai":"りゃい","wai":"わい","NNai":"(-)","qqai":"ai","(a)an":"あん","(a)en":"えん","(a)in":"いん","(a)on":"おん","(a)un":"うん","(a)yan":"(やん)","(a)yon":"(よん)","(a)yun":"(ゆん)","kan":"かん","ken":"けん","kin":"きん","kon":"こん","kun":"くん","kyan":"きゃん","kyon":"きょん","kyun":"きゅん","gan":"がん","gen":"げん","gin":"ぎん","gon":"ごん","gun":"ぐん","gyan":"ぎゃん","gyon":"ぎょん","gyun":"ぎゅん","san":"さん","sin":"スィん","sun":"すん","sen":"せん","son":"そん","syan":"(しゃん)","syun":"(しゅん)","syon":"(しょん)","shan":"しゃん","shen":"シェン","shin":"しん","shon":"(しょん)","shun":"しゅん","shyan":"(しゃん)","shyon":"(しょん)","shyun":"(しゅん)","zan":"ざん","zen":"ぜん","zin":"ズィん","zon":"ぞん","zun":"ずん","zyan":"(じゃん)","zyon":"(じょん)","zyun":"(じゅん)","jan":"じゃん","jen":"ジェン","jin":"じん","jon":"じょん","jun":"じゅん","jyan":"(じゃん)","jyon":"(じょん)","jyun":"(じゅん)","tan":"たん","tin":"ティん","tun":"トゥン","ten":"てん","ton":"とん","tyan":"(ちゃん)","tyon":"(ちょん)","tyun":"(ちゅん)","chan":"ちゃん","chen":"チェン","chin":"ちん","chon":"ちょん","chun":"ちゅん","chyan":"ちゃん","chyon":"ちょん","chyun":"ちゅん","tsan":"ツァん","tsen":"ツェン","tsin":"ツィん","tson":"ツォン","tsun":"つん","tsyan":"(ちゃん)","tsyon":"(ちょん)","tsyun":"(ちゅん)","dan":"だん","den":"でん","din":"ディン","don":"どん","dun":"ドゥン","dyan":"(じゃん)","dyon":"(じょん)","dyun":"(じゅん)","nan":"なん","nen":"ねん","nin":"にん","non":"のん","nun":"ぬん","nyan":"にゃん","nyon":"にょん","nyun":"にゅん","han":"はん","hen":"へん","hin":"ひん","hon":"ほん","hun":"(ふん)","hyan":"ひゃん","hyon":"ひょん","hyun":"ひゅん","fan":"ファン","fen":"フェン","fin":"フィん","fon":"フォン","fun":"ふん","fyan":"(ひゃん)","fyon":"(ひょん)","fyun":"(ひゅん)","ban":"ばん","ben":"べん","bin":"びん","bon":"ぼん","bun":"ぶん","byan":"びゃん","byon":"びょん","byun":"びゅん","pan":"ぱん","pen":"ぺん","pin":"ぴん","pon":"ぽん","pun":"ぷん","pyan":"ぴゃん","pyon":"ぴょん","pyun":"ぴゅん","man":"まん","men":"めん","min":"みん","mon":"もん","mun":"むん","myan":"みゃん","myon":"みょん","myun":"みゅん","yan":"やん","yen":"(えん)","yin":"(いん)","yon":"よん","yun":"ゆん","yyan":"(やん)","yyon":"(よん)","yyun":"(ゆん)","ran":"らん","ren":"れん","rin":"りん","ron":"ろん","run":"るん","ryan":"りゃん","ryon":"りょん","ryun":"りゅん","wan":"わん","wen":"ウェン","win":"ウィん","won":"おん","wun":"(うん)","wyan":"(--)","wyun":"(--)","wyon":"(--)","(a)att":"あっ","(a)ett":"えっ","(a)itt":"いっ","(a)ott":"おっ","(a)utt":"うっ","(a)yatt":"(やっ)","(a)yott":"(よっ)","(a)yutt":"(ゆっ)","katt":"かっ","kett":"けっ","kitt":"きっ","kott":"こっ","kutt":"くっ","kyatt":"きゃっ","kyott":"きょっ","kyutt":"きゅっ","gatt":"がっ","gett":"げっ","gitt":"ぎっ","gott":"ごっ","gutt":"ぐっ","gyatt":"ぎゃっ","gyott":"ぎょっ","gyutt":"ぎゅっ","satt":"さっ","sitt":"スィっ","sutt":"すっ","sett":"せっ","sott":"そっ","syatt":"(しゃっ)","syott":"(しょっ)","syutt":"(しゅっ)","shatt":"しゃっ","shett":"シェっ","shitt":"しっ","shott":"(しょっ)","shutt":"しゅっ","shyatt":"(しゃっ)","shyott":"(しょっ)","shyutt":"(しゅっ)","zatt":"ざっ","zett":"ぜっ","zitt":"ズィっ","zott":"ぞっ","zutt":"ずっ","zyatt":"(じゃっ)","zyott":"(じょっ)","zyutt":"(じゅっ)","jatt":"じゃっ","jett":"ジェっ","jitt":"じっ","jott":"じょっ","jutt":"じゅっ","jyatt":"(じゃっ)","jyott":"(じょっ)","jyutt":"(じゅっ)","tatt":"たっ","titt":"ティっ","tutt":"トゥっ","tett":"てっ","tott":"とっ","tyatt":"(ちゃっ)","tyott":"(ちょっ)","tyutt":"(ちゅっ)","chatt":"ちゃっ","chett":"チェっ","chitt":"ちっ","chott":"ちょっ","chutt":"ちゅっ","chyatt":"ちゃっ","chyott":"ちょっ","chyutt":"ちゅっ","tsatt":"ツァっ","tsitt":"ツィっ","tsutt":"つっ","tsett":"ツェっ","tsott":"ツォっ","tsyatt":"(ちゃっ)","tsyott":"(ちょっ)","tsyutt":"(ちゅっ)","datt":"だっ","dett":"でっ","ditt":"ディっ","dott":"どっ","dutt":"ドゥっ","dyatt":"(じゃっ)","dyott":"(じょっ)","dyutt":"(じゅっ)","natt":"なっ","nett":"ねっ","nitt":"にっ","nott":"のっ","nutt":"ぬっ","nyatt":"にゃっ","nyott":"にょっ","nyutt":"にゅっ","hatt":"はっ","hett":"へっ","hitt":"ひっ","hott":"ほっ","hutt":"(ふっ)","hyatt":"ひゃっ","hyott":"ひょっ","hyutt":"ひゅっ","fatt":"ファっ","fett":"フェっ","fitt":"フィっ","fott":"フォっ","futt":"ふっ","fyatt":"(ひゃっ)","fyott":"(ひょっ)","fyutt":"(ひゅっ)","batt":"ばっ","bett":"べっ","bitt":"びっ","bott":"ぼっ","butt":"ぶっ","byatt":"びゃっ","byott":"びょっ","byutt":"びゅっ","patt":"ぱっ","pett":"ぺっ","pitt":"ぴっ","pott":"ぽっ","putt":"ぷっ","pyatt":"ぴゃっ","pyott":"ぴょっ","pyutt":"ぴゅっ","matt":"まっ","mett":"めっ","mitt":"みっ","mott":"もっ","mutt":"むっ","myatt":"みゃっ","myott":"みょっ","myutt":"みゅっ","yatt":"やっ","yett":"(えっ)","yitt":"(いっ)","yott":"よっ","yutt":"ゆっ","yyatt":"(やっ)","yyott":"(よっ)","yyutt":"(ゆっ)","ratt":"らっ","rett":"れっ","ritt":"りっ","rott":"ろっ","rutt":"るっ","ryatt":"りゃっ","ryott":"りょっ","ryutt":"りゅっ","watt":"わっ","wett":"ウェッ","witt":"ウィッ","wutt":"(--)","wott":"ウォッ","wyatt":"(--)","wyutt":"(--)","wyott":"(--)","kka":"っか","kki":"っき","kku":"っく","kke":"っけ","kko":"っこ","kkya":"っきゃ","kkyu":"っきゅ","kkyo":"っきょ","ssa":"っさ","ssi":"ッスィ","ssu":"っす","sse":"っせ","sso":"っそ","ssya":"(っしゃ)","ssyu":"(っしゅ)","ssyo":"(っしょ)","ssha":"っしゃ","sshi":"っし","sshu":"っしゅ","sshe":"ッシェ","ssho":"っしょ","sshya":"っしゃ","sshyu":"っしゅ","sshyo":"っしょ","tta":"った","tti":"ッティ","ttu":"ットゥ","tte":"って","tto":"っと","ttya":"(っちゃ)","ttyu":"(っちゅ)","ttyo":"(っちょ)","ccha":"っちゃ","cchi":"っち","cchu":"っちゅ","cche":"ッチェ","ccho":"っちょ","cchya":"(っちゃ)","cchyu":"(っちゅ)","cchyo":"(っちょ)","ttsa":"ッツァ","ttsi":"ッツィ","ttsu":"っつ","ttse":"ッツェ","ttso":"ッツォ","ttsya":"(っちゃ)","ttsyu":"(っちゅ)","ttsyo":"(っちょ)","ppa":"っぱ","ppi":"っぴ","ppu":"っぷ","ppe":"っぺ","ppo":"っぽ","ppya":"っぴゃ","ppyu":"っぴゅ","ppyo":"っぴょ"}
},{}],29:[function(require,module,exports){
const fs = require("fs");
const path = require("path");

const numberAndNextCharDictionary = require("./languages/dictionaries/number_and_nextchar.dict.js");

const languageDictionary = {};
const numberDictionary = require("./languages/dictionaries/number.dict.js");
const integerDictionary = require("./languages/dictionaries/integer.dict.js");
const otherDictionary = {};

otherDictionary["charToVowel.csv"] = require("./languages/dictionaries/charToVowel.csv.dict.js");
otherDictionary["float.csv"] = require("./languages/dictionaries/float.csv.dict.js");
otherDictionary["replacejoshi.csv"] = require("./languages/dictionaries/replacejoshi.csv.dict.js");
otherDictionary["romajiHira.csv"] = require("./languages/dictionaries/romajiHira.csv.dict.js");
otherDictionary["charToVowel.csv"] = require("./languages/dictionaries/charToVowel.csv.dict.js");

languageDictionary["Thai"] = require("./languages/dictionaries/Thai.dict.js");
languageDictionary["Russian"] = require("./languages/dictionaries/Russian.dict.js");
languageDictionary["Arabic"] = require("./languages/dictionaries/Arabic.dict.js");
languageDictionary["Korean"] = require("./languages/dictionaries/Korean.dict.js");
languageDictionary["Hindi"] = require("./languages/dictionaries/Hindi.dict.js");
languageDictionary["Tibetan"] = require("./languages/dictionaries/Tibetan.dict.js");
languageDictionary["Hebrew"] = require("./languages/dictionaries/Hebrew.dict.js");
languageDictionary["Khmer"] = require("./languages/dictionaries/Khmer.dict.js");
languageDictionary["Amharic"] = require("./languages/dictionaries/Amharic.dict.js");
languageDictionary["Tamil"] = require("./languages/dictionaries/Tamil.dict.js");
languageDictionary["Armenian"] = require("./languages/dictionaries/Armenian.dict.js");
languageDictionary["Burmese"] = require("./languages/dictionaries/Burmese.dict.js");
languageDictionary["Greek"] = require("./languages/dictionaries/Greek.dict.js");
languageDictionary["Georgian"] = require("./languages/dictionaries/Georgian.dict.js");
languageDictionary["Sinhalese"] = require("./languages/dictionaries/Sinhalese.dict.js");
languageDictionary["Romaji"] = require("./languages/dictionaries/Romaji.dict.js");
languageDictionary["Hiragana"] = require("./languages/dictionaries/Hiragana.dict.js");


function loadLangDictionary(name, includesAdditionalDictionary, differentAtEndOfWord) {
  return languageDictionary[name];
}

function loadAllNumberWithNextCharDictionaries(fileName) {
  return numberAndNextCharDictionary;
}

function loadNumberDictionary() {
  return numberDictionary;
}

function loadIntegerDictionary() {
  return integerDictionary;
}
function loadOtherDictionary(fileName) {
  return otherDictionary[fileName];
}

module.exports = {
  loadLangDictionary,
  loadOtherDictionary,
  loadAllNumberWithNextCharDictionaries,
  loadNumberDictionary,
  loadIntegerDictionary,
}

},{"./languages/dictionaries/Amharic.dict.js":5,"./languages/dictionaries/Arabic.dict.js":6,"./languages/dictionaries/Armenian.dict.js":7,"./languages/dictionaries/Burmese.dict.js":8,"./languages/dictionaries/Georgian.dict.js":9,"./languages/dictionaries/Greek.dict.js":10,"./languages/dictionaries/Hebrew.dict.js":11,"./languages/dictionaries/Hindi.dict.js":12,"./languages/dictionaries/Hiragana.dict.js":13,"./languages/dictionaries/Khmer.dict.js":14,"./languages/dictionaries/Korean.dict.js":15,"./languages/dictionaries/Romaji.dict.js":16,"./languages/dictionaries/Russian.dict.js":17,"./languages/dictionaries/Sinhalese.dict.js":18,"./languages/dictionaries/Tamil.dict.js":19,"./languages/dictionaries/Thai.dict.js":20,"./languages/dictionaries/Tibetan.dict.js":21,"./languages/dictionaries/charToVowel.csv.dict.js":22,"./languages/dictionaries/float.csv.dict.js":23,"./languages/dictionaries/integer.dict.js":24,"./languages/dictionaries/number.dict.js":25,"./languages/dictionaries/number_and_nextchar.dict.js":26,"./languages/dictionaries/replacejoshi.csv.dict.js":27,"./languages/dictionaries/romajiHira.csv.dict.js":28,"fs":1,"path":2}],30:[function(require,module,exports){
const {
  loadOtherDictionary,
  loadNumberDictionary,
  loadAllNumberWithNextCharDictionaries,
  loadIntegerDictionary,
} = require("../makeDictionary");

function toHankaku(text) {
  let result = text.slice();
  result = result.replaceAll("０", "0");
  result = result.replaceAll("１", "1");
  result = result.replaceAll("２", "2");
  result = result.replaceAll("３", "3");
  result = result.replaceAll("４", "4");
  result = result.replaceAll("５", "5");
  result = result.replaceAll("６", "6");
  result = result.replaceAll("７", "7");
  result = result.replaceAll("８", "8");
  result = result.replaceAll("９", "9");
  return result;
}

function numberToTsu(number) {
  if (n === 1) {
    return "ひと";
  }
  if (n === 2) {
    return "ふた";
  }
  if (n === 3) {
    return "みっ";
  }
  if (n === 4) {
    return "よっ";
  }
  if (n === 5) {
    return "いつ";
  }
  if (n === 6) {
    return "むっ";
  }
  if (n === 7) {
    return "なな";
  }
  if (n === 8) {
    return "やっ";
  }
  if (n === 9) {
    return "ここの";
  }
  return null;
}

const aList = ["あ", "い", "う", "え", "お"]
const kaList = ["か", "き", "く", "け", "こ"]
const saList = ["さ", "し", "す", "せ", "そ"]
const taList = ["た", "ち", "つ", "て", "と"]
const naList = ["な", "に", "ぬ", "ね", "の"]
const haList = ["は", "ひ", "ふ", "へ", "ほ"]
const maList = ["ま", "み", "む", "め", "も"]
const yaList = ["や", "ゆ", "よ"]
const raList = ["ら", "り", "る", "れ", "ろ"]
const waList = ["わ", "を", "ん"]
function toA(ch) {
  if (aList.includes(ch)) {
    return "あ";
  }
  if (kaList.includes(ch)) {
    return "か";
  }
  if (saList.includes(ch)) {
    return "さ";
  }
  if (taList.includes(ch)) {
    return "た";
  }
  if (naList.includes(ch)) {
    return "な";
  }
  if (haList.includes(ch)) {
    return "は";
  }
  if (maList.includes(ch)) {
    return "ま";
  }
  if (yaList.includes(ch)) {
    return "や";
  }
  if (raList.includes(ch)) {
    return "ら";
  }
  if (waList.includes(ch)) {
    return "わ";
  }
  return null;
}

function loadFloatDictionary() {
  const result = {}
  const dictionary = loadOtherDictionary("float.csv");
  return dictionary;
}


const integerDictionary = loadIntegerDictionary();
const floatDictionary = loadFloatDictionary();
const numberWithNextCharDictionaries = loadAllNumberWithNextCharDictionaries();
const numberDictionary = loadNumberDictionary();


function splitTextAndNumber(text) {
  let tempText = text.slice();
  const numbers = text.match(/\d{1,}\.\d{1,}|\d{1,}/gi);
  if (!numbers) {
    return [{
      type: "string",
      value: text
    }];
  }
  const result = [];
  for (const number of numbers) {
    const index = tempText.search(number);
    if (index === 0) {
      result.push({
        type: "number",
        value: number
      });
    } else {
      result.push({
        type: "string",
        value: tempText.slice(0, index)
      });
      result.push({
        type: "number",
        value: number
      });
    }
    tempText = tempText.slice(index + number.length);
  }
  if (tempText !== "") {
    result.push({
      type: "string",
      value: tempText,
    });
  }
  return result;
}

function getSen(number) {
  let result = "";
  let sen = number % 10000;
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(sen / (10 ** i)) * (10 ** i);
    if (String(n) in numberDictionary) {
      result += numberDictionary[n].yomi + " ";
    }
    sen -= n;
  }
  return result;
}
function getMan(number) {
  let result = "";
  let man = Math.floor(number / 10000.0) % 10000;
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(man / (10 ** i)) * (10 ** i);
    if (String(n) in numberDictionary) {
      result += numberDictionary[n].yomi + " ";
    }
    man -= n;
  }
  if (result !== "") {
    result += "まん ";
  }
  return result;
}

function getOku(number) {
  let result = "";
  let oku = Math.floor(number / 100000000.0) % 10000;
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(oku / (10 ** i)) * (10 ** i);
    if (String(n) in numberDictionary) {
      result += numberDictionary[n].yomi + " ";
    }
    oku -= n;
  }
  if (result !== "") {
    result += "おく ";
  }
  return result;
}

function searchNextChar(n, ch) {
  if (!(ch in numberWithNextCharDictionaries) || !(String(n) in numberWithNextCharDictionaries[ch])) {
    return null;
  }
  return numberWithNextCharDictionaries[ch][n];
}
function getYomi(n, ch) {
  if (["は", "ひ", "ふ", "へ", "ほ", "じ", "な"].includes(ch)) {
    const record = searchNextChar(n, ch);
    if (record) {
      return record.yomi;
    }
    return null;
  }
  const vowel = toA(ch);
  const record = searchNextChar(n, vowel);
  if (record) {
    return record.yomi;
  }
  return null;
}

function getFloat(numberString) {
  const index = numberString.indexOf(".");
  if (index === -1) {
    return "";
  }
  let result = "";
  const floatPart = numberString.slice(index + 1);
  for (let i = 0; i < floatPart.length; i++) {
    const ch = floatPart[i];
    if (i !== 0 && floatPart.length - 1 === i && ch === "0") {
      continue;
    }
    result += floatDictionary[ch] + " ";
  }
  return result;
}
function getNextChar(n, ch) {
  if (toA(ch) === "は") {
    const row = searchNextChar(n, ch)
    if (row) {
      return row.nextChar;
    }
    return ch;
  }
}

function getSenFromFloat(floatText) {
  let result = "";
  let integer = parseInt(floatText) % 10000;
  let digit = 0;
  if (integer % 1000 === 0) {
    digit = 3;
  } else if (integer % 100 === 0) {
    digit = 2;
  } else if (integer % 10 === 0) {
    digit = 1;
  }
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(integer / (10 ** i)) * (10 ** i);
    if (!(n in integerDictionary)) {
      continue;
    }
    const record = integerDictionary[n];
    if (i == digit) {
      result += record.floatYomi + " ";
    } else {
      result += record.yomi + " ";
    }
    integer = integer - n;
  }
  return result;
}

function convert(numberString) {
  const text = toHankaku(numberString);
  const number = parseInt(text);
  let result = "";
  if (text.includes(".")) {
    if (number >= 1000000000000) {
      return text;
    }
    const dotIndex = text.indexOf(".");
    const oku = getOku(text.slice(0, dotIndex));
    const man = getMan(text.slice(0, dotIndex));
    const sen = getSenFromFloat(text.slice(0, dotIndex));
    result += oku + man + sen;
    if (sen === "" && man === "" && oku === "") {
      result += "れいてん ";
    } else if (sen === "" && (man !== "" || oku !== "")) {
      result += "てん ";
    }
    result += getFloat(text);
    return result;
  }

  if (number >= 1000000000000) {
    return text;
  }
  const oku = getOku(text)
  const man = getMan(text)
  const sen = getSen(text)

  result = oku + man + sen;
  return result;
}


module.exports = {
  convert,
  numberToTsu,
  toHankaku,
  splitTextAndNumber,
  getYomi,
  getNextChar,
}

},{"../makeDictionary":29}],31:[function(require,module,exports){
const {
  loadOtherDictionary,
} = require("./makeDictionary");

const dictionary = loadOtherDictionary("charToVowel.csv");

function Onbiki(text) {
  const len = text.length;
  const result = text.slice();
  for (let i = len; i <= 1; i--) {
    if (result[i] === "ー" || result[i] == "ー") {
      result[i] = dictionary[result[i-1]];
    }
  }
  return result;
}

module.exports = Onbiki;

},{"./makeDictionary":29}],32:[function(require,module,exports){


const onbiki = require("./onbiki");
const languages = require("./language");
const {
  loadOtherDictionary,
} = require("./makeDictionary");

const {
  convert,
  numberToTsu,
  splitTextAndNumber,
  getYomi,
  getNextChar,
  toHankaku,
} = require("./number");

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

function convertSpecialJoshi(text) {
  let result = text.slice();
  let tmp = text.slice();
  let matched = tmp.match(/[へは][^\p{Hiragana}]/gi);
  while (matched) {
    tmp = tmp.replace(matched[0], "");
    if (matched[0][0] === "へ") {
      result = result.replace(matched[0], "え" + matched[0][1]);
    }
    if (matched[0][0] === "は") {
      result = result.replace(matched[0], "わ" + matched[0][1]);
    }
    matched = tmp.match(/[へは][^\p{Hiragana}]/gi)
  }
  result = result.replaceAll("を", "お");
  return result;
}

function isNumberCharacter(ch) {
  return ch === "." || ch === "1" || ch === "2" || ch === "3" || ch === "4" || ch === "5" || ch === "6" || ch === "7" || ch === "8" || ch === "9" || ch === "0" || ch === "１" || ch === "２" || ch === "３" || ch === "４" || ch === "５" || ch === "６" || ch === "７" || ch === "８" || ch === "９" || ch === "０";
}


function Transliterator() {
  const maxPrecedingCheckJP = 10;
	const maxPrecedingCheckOther = 8;
  const hiragana = languages.Hiragana;
  const joshiDictionary = loadOtherDictionary("replacejoshi.csv");
  const languageIds = Object.keys(languages);
  const sokuonLangs = languageIds.filter(languageId => {
    return languages[languageId].config.distinguishSokuon;
  });
  const romajiToHira = loadOtherDictionary("romajiHira.csv");
  const charToVowel = loadOtherDictionary("charToVowel.csv");
  this.replaceJoshi = function(text) {
    let result = text.slice();
    for (const key in joshiDictionary) {
      result = result.replaceAll(key, joshiDictionary[key]);
    }
    return result;
  }

  this.convertHiraganaToOtherLang = function(text, language) {
    let result = "";
    let tempChar = "";
    let i = 1;
    while (i <= text.length) {
      tempChar = this.convertHiraganaPart(text, language, i);
      if (tempChar) {
        result = result + tempChar.value;
        i += tempChar.nextReadingPosition;
      }
      i++;
    }
    result = result.trim();
    result = result.replaceAll("　", " ");
    return result;
  }

  this.convertHiraganaPart = function(text, language, readingPosition) {
    const remainTextLength = text.length - readingPosition + 1;
    const remainText = text.slice(readingPosition - 1, readingPosition - 1 + remainTextLength);
    let tempChar;
    let numLoop = remainTextLength;
    if (maxPrecedingCheckJP < remainTextLength) {
      numLoop = maxPrecedingCheckJP;
    }
    for (let i = numLoop; i >= 1; i--) {
      tempChar = text.slice(readingPosition - 1, readingPosition - 1 + i);
      if (tempChar === "っ") {
        return null;
      }
      let convertedChar = language.dictionaries.base[tempChar];
      if (!convertedChar) {
        continue;
      }
      if (readingPosition + i - 1 < text.length) {
        const nextChar = text.slice(readingPosition + i - 1, readingPosition + i);
        if (language.config.differentAtEndOfWord) {
          if (nextChar === " " || nextChar === "　") {
            convertedChar = language.dictionaries.endOfWord[tempChar];
          }
        } else {
          if (language.name === "Thai") {
            if (nextChar === "っ" || nextChar === "ん") {
              convertedChar = language.dictionaries.additional[tempChar];
            }
          } else if (language.name === "Korean") {
            if (nextChar === "あ" || nextChar === "い" || nextChar === "う" || nextChar === "え" || nextChar === "お") {
              convertedChar = language.dictionaries.additional[tempChar];
            }
          }
        }
      } else {
        if (language.config.differentAtEndOfWord) {
          convertedChar = language.dictionaries.endOfWord[tempChar]; 
        }
      }
      return {
        nextReadingPosition: i - 1,
        value: convertedChar,
      }
    }
    return {
      nextReadingPosition: 0,
      value: tempChar,
    }
  }
  this.convertNumberToHiragana = function(text) {
    const splitted = splitTextAndNumber(text);
    let words = splitted.map((word, index) => {
      if (word.type === "number") {
        const numberString = word.value.toString();
        if (index < splitted.length - 1) {
          const nextWord = splitted[index + 1];
          const nextChar = nextWord.value[0];
          if (word.value === 0) {
            return {
              value: "ぜろ"
            };
          }
          if (nextChar === "つ") {
            if (word.value === 0 || word.value >= 10) {
              return {
                value: convert(word.value.toString())
              }
            }
            const tsuWord = numberToTsu(word.value);
            return {
              value: tsuWord
            };
          }
          for (let i = numberString.length - 1; i >= 0; i--) {
            const n = 10 ** (numberString.length - 1 - i);
            if (numberString[i] !== "0") {
              const differentYomi = getYomi(parseInt(numberString[i]) * n, nextChar);
              if (!differentYomi) {
                return {
                  value: convert(numberString)
                };
              }
              return {
                value: differentYomi,
                next: getNextChar(numberString, nextChar),
              }
              
              break;
            }
          }
        }
        return {
          value: convert(numberString),
        }
      }
      return word;
    })

    words = words.map((word, index) => {
      if (word.type !== "string") {
        return word;
      }
      if (index === 0) {
        return word;
      }
      let value = words[index].value;
      if (words[index - 1].next) {
        value = value.replaceAt(0, words[index - 1].next);
        return {
          type: "string",
          value,
        }
      }
      return word;
    });
    return words.reduce((a, b) => {
      return a + b.value;
    }, "");
  }
  this.convertToHiragana = function(text) {
    let hiragana = toHankaku(text);
    hiragana = convertSpecialJoshi(hiragana);
    hiragana = this.convertNumberToHiragana(hiragana);
    hiragana = onbiki(hiragana);
    hiragana = this.replaceJoshi(hiragana);
    return hiragana;
  }
  this.convert = function(text, languageId) {
    const hiragana = this.convertToHiragana(text);
    const result = this.convertHiraganaToOtherLang(hiragana, languages[languageId]);
    return result;
  }
  this.convertAll = function(text) {
    const hiragana = this.convertToHiragana(text);
    const result = {};
    for (const languageId in languages) {
      result[languageId] = this.convertHiraganaToOtherLang(hiragana, languages[languageId]);
    }
    result["Hiragana"] = hiragana;
    return result;
  }

}

module.exports = Transliterator;

},{"./language":4,"./makeDictionary":29,"./number":30,"./onbiki":31}]},{},[32]);
