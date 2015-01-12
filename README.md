# mio [![Build Status](https://img.shields.io/travis/mio/mio.svg?style=flat)](http://travis-ci.org/mio/mio) [![Coverage Status](https://img.shields.io/coveralls/mio/mio.svg?style=flat)](https://coveralls.io/r/mio/mio?branch=master) [![Bower version](https://img.shields.io/bower/v/mio.svg?style=flat)](http://badge.fury.io/bo/mio) [![NPM version](https://img.shields.io/npm/v/mio.svg?style=flat)](http://badge.fury.io/js/mio) [![Dependency Status](https://img.shields.io/david/mio/mio.svg?style=flat)](http://david-dm.org/mio/mio)

> RESTful resources for both client and server.

Mio provides a common model layer between client and server for building REST
APIs and web applications.

Mio provides a consistent API across client and server for querying,
manipulating, and persisting data. Create a REST API server from your mio
resources and interact with them from the browser using the same interface. No
need for any route handling or AJAX boilerplate.

Mio models are designed to be RESTful and avoid leaky abstractions for mapping
to HTTP methods. For example, providing `Resource.get()` instead of `findOne()`
and `Resource.post()` where most libraries would provide `create()`.

* Small readable core (only ~300 SLOC)
* Simple enumerable objects
* Hooks and events before and after CRUD operations and object lifecycle
* Backbone-style API for extending resources
* Modular. Plugins provide storage, validation, etc.
* Browser and node.js support

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

## API

See the full [API documentation](docs/API.md).

## Community

* [Plugins](https://github.com/mio/mio/wiki/Plugins/)
* [Wiki](https://github.com/mio/mio/wiki/)
* `##mio` on irc.freenode.net

## Examples

* [Resources](#resources)
* [Queries](#queries)
* [Plugins](#plugins)
* [Hooks](#hooks)
* [Relations](#relations)
* [REST API](#rest-api)

### Resources

Define new resources by extending the base `Resource` class. You can pass
attribute definitions to [`.extend()`](docs/API.md#module_mio.Resource.extend)
or use the chainable [`.attr()`](docs/API.md#module_mio.Resource.attr):

```javascript
var User = mio.Resource.extend({
  attributes: {
    id: { primary: true },
    name: { required: true },
    active: { default: false },
    created: {
      default: function() {
        return new Date();
      }
    }
  },
  sayHello: function() {
    return "Hello I'm " + this.name;
  }
});

var user = new User({ name: 'Mio' });

user.sayHello(); // => "Hello I'm Mio"
```

### Queries

Query methods provide a consistent interface for fetching resources.
Storage plugins use the asynchronous events provided for each method to fetch or
persist resources to a database.

Find one user:

```javascript
User.get(123, function(err, user) {
  // ...
});
```

Find all users matching a query:

```javascript
User.Collection.get({ active: true }, function (err, users) {
  // ...
});
```

Using a chainable query builder:

```javascript
User.Collection.get()
  .where({ active: true })
  .sort({ created_at: "desc" })
  .size(10)
  .exec(function(err, users) {
    // ...
  });
```

See the [API documentation](docs/API.md) for a complete list of query methods
and event information.

### Plugins

Resources may use plugin functions which extend them with functionality such
as validation, persistence, etc.

```javascript
var mio = require('mio');
var MongoDB = require('mio-mongo');
var User = mio.Resource.extend();

User.use(MongoDB({
  url: 'mongodb://db.example.net:2500'
}));
```

Browser or server specific plugins:

```javascript
User.browser(plugin);

User.server(plugin);
```

### Hooks

Before and after hooks are provided for CRUD operations and resource lifecycle
events. Hooks are asynchronous and execute in series.

```javascript
User.before('get', function (query, next) {
  // do something before save such as validation and then call next()
});

User.on('patch', function (query, changed) {
  // do something after update
});
```

See the full [documentation for events](docs/API.md#module_mio.Resource.before).

### Relations

Define relationships between resources in combination with a supporting storage
plugin.

```javascript
Author.hasMany('books', {
  target: Book,
  foreignKey: 'author_id'
});

Book.belongsTo('author', {
  target: Author,
  foreignKey: 'author_id'
});

// fetch book with related author included
Book.get(1).withRelated(['author']).exec(function(err, book) {
  console.log(book.author);
});
```

See the [relations API](docs/API.md#module_mio.Resource.belongsTo) for more
information.

### REST API

Create a REST API server from your resources and interact with them from the
browser using the same interface. No need for any route handling or AJAX
boilerplate. Automatic client-server communication is provided by
[mio-ajax](https://github.com/mio/ajax) in the browser and
[mio-express](https://github.com/mio/express) on the server.

Create a Resource definition shared between browser and server:

```javascript
var mio = require('mio');
var Validators = require('mio-validators');

var User = module.exports = mio.Resource.extend({
  attributes: {
    id: { primary: true },
    name: {
      required: true,
      constraints: [Validators.Assert.Type('string')]
    },
    created: {
      required: true,
      constraints: [Validators.Assert.Instance(Date)],
      default: function () {
        return new Date();
      }
    }
  }
}, {
  baseUrl: '/users'
});
```

Extend it on the server with server-specific plugins:

```javascript
var User = require('./models/User');
var MongoDB = require('mio-mongo');
var ExpressResource = require('mio-resource');
var express = require('express');

User
  .use(MongoDB({
    url: 'mongodb://db.example.net:2500'
  }))
  .use(ExpressResource.plugin());

var app = express();

// register routes provided by ExpressResource
app.use(User.router);

app.listen(3000);
```

And in the browser:

```javascript
var User = require('./models/User');
var Ajax = require('mio-ajax');

User.use(Ajax());

var user = User().set({ name: "alex" }).post(function(err) {
  // ...
});
```

## MIT Licensed
