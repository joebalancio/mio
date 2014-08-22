# mio

[![Build Status](https://secure.travis-ci.org/mio/mio.png)](http://travis-ci.org/mio/mio) 
[![Coverage Status](https://coveralls.io/repos/mio/mio/badge.png?branch=master)](https://coveralls.io/r/mio/mio?branch=master)
[![Bower version](https://badge.fury.io/bo/mio.png)](http://badge.fury.io/bo/mio)
[![NPM version](https://badge.fury.io/js/mio.png)](http://badge.fury.io/js/mio)
[![Dependency Status](https://david-dm.org/mio/mio.png)](http://david-dm.org/mio/mio)

Modern idiomatic models for the browser and node.js. Treat your models like
plain JavaScript objects.

* **Small**: No dependencies and only ~500 SLOC.
* **Simple**: Plain enumerable attributes using ECMAScript getters and setters.
* **Observable**: Events emitted for initialization, attribute changes, etc.
* **Extensible**: Simple API for extending model prototypes with support
  for browser or server specific plugins.
* **Browser or Node.js**: Reuse code across the browser and server.
* **Portable**: CommonJS, AMD, and global module patterns supported.
* **Tested and open-source**: MIT licensed with full test coverage.

## Installation

Using [npm](https://npmjs.org/):

```sh
npm install --save mio
```

Using [bower](http://bower.io/):

```sh
bower install --save mio
```

Using browser script tag and global (UMD wrapper):

```html
// Available via window.mio
<script src="dist/mio.js"></script>
```

## Overview

Define a model using `createModel()` and create instances with `new`:

```javascript
var User = mio.createModel('user');

User
  .attr('firstName')
  .attr('lastName')
  .attr('fullName', {
    // computed property
    get: function() {
      return [this.firstName, this.lastName].join(' ');
    }
  })
  .attr('created_at', {
    default: function() {
      return new Date();
    }
  });

var user = new User({ firstName: "Spike", lastName: "Spiegel" });

console.log(user.fullName);
// => "Spike Spiegel"
```

Extend the model with new methods via `use()`:

```javascript
Cat
  .use(validators)
  .use(mysql)
  .use({
    meow: function() { ... }
  });

var cat = new Cat();
cat.meow();
```

Persist data by utilizing asynchronous events:

```javascript
var User = mio.createModel('user').attr('id', { primary: true });

User.before('save', function(user, changed, next) {
  if (user.isNew()) {
    Database.insert('user', changed, function(err, id) {
      if (id) user.id = id;
      next(err);
    });
  }
  else {
    Database.update('user', user.id, changed, next);
  }
});
```

## API

See the full [API documentation](docs/API.md).

## Community

* [Plugins](https://github.com/mio/mio/wiki/Plugins/)
* [Wiki](https://github.com/mio/mio/wiki/)
* `##mio` on irc.freenode.net

## MIT Licensed
