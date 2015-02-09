# mio [![Build Status](https://img.shields.io/travis/mio/mio.svg?style=flat)](http://travis-ci.org/mio/mio) [![Coverage Status](https://img.shields.io/coveralls/mio/mio.svg?style=flat)](https://coveralls.io/r/mio/mio?branch=master) [![NPM version](https://img.shields.io/npm/v/mio.svg?style=flat)](http://badge.fury.io/js/mio) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mio/mio?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![Tips](https://img.shields.io/gratipay/alexmingoia.svg?style=flat)](https://www.gratipay.com/alexmingoia/)

Create a REST API and interact with it in the browser using the same interface.
*No need for any route handling or AJAX boilerplate.*

Mio provides a common model layer between client and server for building REST
APIs and web applications. REST is a first-class citizen with Mio's API, where
`get()` is used instead of `findOne()`, and `patch()` where most libraries
would provide `save()`.

* RESTful models and collections
* Simple enumerable objects
* Hooks and events for object lifecycle
* Backbone-style API for extending resources
* Modular. Plugins provide storage, validation, etc.
* Browser and node.js support

### [API Documentation](docs/API.md)

### [Plugins](https://github.com/mio/mio/wiki/Plugins/)

### Guide

- [Installation](#installation)
- [Resources](#resources)
- [Collections](#collections)
- [Actions and Queries](#actions-and-queries)
- [Hooks and Events](#hooks-and-events)
- [Relations](#relations)
- [Plugins](#plugins)
- [REST API](#rest-api)

### Installation

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

It is recommended to use [browserify](https://github.com/substack/node-browserify)
when using mio in the browser and on the server. Platform-specific code can be
wrapped in [`Resource.server()`](docs/API.md#module_mio.Resource.server) or
[`Resource.browser()`](docs/API.md#module_mio.Resource.browser) and server code
excluded in the client build.

### Resources

New resources are defined by extending the base resource class using
[`mio.Resource.extend()`](docs/API.md#module_mio.Resource.extend).

```javascript
var User = mio.Resource.extend();
```

Attributes can be defined by extending the prototype:

```javascript
var User = mio.Resource.extend({
  attributes: {
    id: {
      primary: true
    }
  }
});
```

Attributes can also be defined using the chainable
[`attr()`](docs/API.md#module_mio.Resource.attr) method:

```javasciprt
var User = mio.Resource.extend();

User
  .attr('id', {
    primary: true
  })
  .attr('name')
  .attr('email');
```

Resources can be extended with prototype or static properties and methods:

```javascript
var User = mio.Resource.extend({
  sayHello: function () {
    return 'hello';
  }
}, {
  type: 'User'
});

console.log(User.type); // => "User"

var user = new User();

user.sayHello(); // => "hello"
```

### Collections

Each Resource has an associated collection. Actions that return multiple
resources return instances of
[`Resource.Collection`](docs/API.md#module_mio.Collection). Collections have
REST actions just as resources do.

For example, to fetch a collection of user resources:

```javascript
User.Collection.get().exec(function (err, users) {...});
```

Array.prototype methods are available for collections, *but a collection
is not an array*. The array of resources is kept at `Collection#resources`.
Methods such as `map()` return arrays instead of the collection.

```javascript
var resource1 = new Resource();
var collection = new Resource.Collection([resource]);

collection.push(new Resource());
collection.splice(1, 1, new Resource());

collection.at(0) === resource; // => true
collection.length === 2;       // => true
collection.indexOf(resource);  // => 0
```

### Actions and Queries

Mio resource and collection methods map directly to REST actions and HTTP
verbs. Instead of `find()` you use `get()`. Instead of `save()` you use `put()`,
`post()`, or `patch()`.

The actions `get`, `put`, `patch`, `post`, and `delete` exist for the resource
class and instances. Collections also support a subset of these methods.

Storage plugins use event [hooks](#hooks-and-events) provided for
each method to fetch or persist resources to a database.

#### Fetching

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

#### Pagination

All queries are paginated using a common interface provided by the Query and
Collection classes. Both queries and collections maintain `from` and `size`
properties. The default and maximum page size are set by
`Resource.defaultPageSize` and `Resource.maxPageSize` properties.

See the [query](docs/API.md#module_mio.Query) documentation for more
information.

#### Creating and updating

Creating or updating resources is accomplished with `put`, `patch`, and `post`:

```javascript
var user = User.create({ name: 'Bob' });

user.post(function (err) {
  // ...
});
```

`User.create()` is just functional sugar for `new User()`.

All instance actions are available as class actions:

```javascript
User.post({ name: 'Bob' }, function (err, user) {
  // ...
});
```

Update a resource:

```javascript
var user = User.create();

user
  .set({
    name: 'alex'
  }).patch(function(err) {
    // ...
  });
```

See the [API documentation](docs/API.md) for a complete list of actions.

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

### Hooks and Events

Asynchronous hooks are provided for CRUD operations and lifecycle events.
They run in series before `get`, `put`, `patch`, `post`, and `delete` methods.

Hooks are used to implement validation, persistence, and other business logic.

Hooks receive a `next` function as the last argument, which must be called
to continue firing subsequent listeners. Subsequent hooks will not be run
if `next` receives any arguments. Arguments received by `next` are passed to
the callback of the method that fired the event.

```javascript
User.hook('get', function (query, next) {
  // retrieve user from storage using query
  db.getUser(query, next);
});
```

Collection hooks are prefixed with `collection:`:

```javascript
User.hook('collection:get', function (query, next) {
  // ...
});
```

See the full [documentation for hooks](docs/API.md#module_mio.Resource.hook).

In addition to hooks, synchronous events are fired after resource actions and
other resource events like attribute changes.

```javascript
User
  .on('patch', function (query, changed) {
    // do something after update
  })
  .on('change:name', function (user, value, prev) {
    // ...
  });
```

See the full [documentation for events](docs/API.md#module_mio.Resource.on).

Hooks and events can also be registered when extending a resource:

```javascript
var User = mio.Resource.extend({
  attributes: {
    id: {
      primary: true
    }
  }
}, {
  hooks: {
    'post': [function (representation, next) {
      // ...
    }]
  },
  events: {
    'initialize': [function (resource, attributes) {
      // ...
    }]
  }
});
```

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

// fetch book by related author
Boook.get().where({
  'author.name': 'alex'
}).exec(function(function (err, book) {...});
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
