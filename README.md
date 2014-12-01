# mio [![Build Status](https://img.shields.io/travis/mio/mio.svg?style=flat)](http://travis-ci.org/mio/mio) [![Coverage Status](https://img.shields.io/coveralls/mio/mio.svg?style=flat)](https://coveralls.io/r/mio/mio?branch=master) [![Bower version](https://img.shields.io/bower/v/mio.svg?style=flat)](http://badge.fury.io/bo/mio) [![NPM version](https://img.shields.io/npm/v/mio.svg?style=flat)](http://badge.fury.io/js/mio) [![Dependency Status](https://img.shields.io/david/mio/mio.svg?style=flat)](http://david-dm.org/mio/mio)

> Model RESTful resources using a simple, extensible, storage-agnostic prototype.

* No dependencies and core is only ~200 SLOC
* Plain enumerable attributes using ECMAScript getters and setters
* Hooks before and after CRUD operations and lifecycle events
* Simple Backbone-style API for extending resources
* Runs in the browser or on the server with node.js

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
* [Middleware](#middleware)
* [Hooks](#hooks)
* [Relations](#relations)
* [REST API](#rest-api)

### Resources

Define new resources by extending the base `Resource` class. You can pass
attribute definitions to `.extend()` or use the chainable `.attr()`:

```javascript
var User = mio.Resource.extend();

User
  .attr('id', { primary: true })
  .attr('name')
  .attr('active', {
    default: false
  })
  .attr('created', {
    default: function () {
      return new Date();
    }
  });

var user = new User({ name: 'alex' });
```

### Queries

Query methods are used in combination with hooks for fetching resources from a
database, such as provided by various storage plugins.

Find one user:

```javascript
User.findOne(123, function(err, user) {
  // ...
});
```

Find all users matching a query:

```javascript
User.findAll({ active: true }, function (err, users) {
  // ...
});
```

Using a chainable query builder:

```javascript
User.findAll()
  .where({ active: true })
  .sort({ created_at: "desc" })
  .limit(10)
  .exec(function(err, users) {
    // ...
  });
```

### Middleware

Resources can use middleware functions which extend the them with various
functionality such as validation, persistence, etc.

Persistence:

```javascript
var MongoDB = require('mio-mongo');

User
  .attr('id', { primary: true })
  .attr('name')
  .use(MongoDB({
    url: 'mongodb://db.example.net:2500'
  }));

var user = new User({ name: 'alex' });

// persist to mongodb
user.save(function(err) {
  // ...
});

// fetch from mongodb
User.findOne({ name: 'alex' }, function (err, user) {
  // remove from mongodb
  user.destroy(function (err) {
    // ...
  });
});
```

Validation:

```javascript
var Validators = require('mio-validators');

User
  .attr('id', { primary: true })
  .attr('name', {
    constraints: [
      Validators.Assert.Type('string'),
      Validators.Assert.Length({ min: 2, max: 32 })
    ]
  })
  .use(Validators);

var user = new User();

user.name = 123;

user.save(function (err) {
  console.log(err);
  // { [Error: Validation(s) failed.]
  //   violations: { name: [ '`123` is not of type string' ] }
  // }
});
```

### Hooks

Before and after hooks are provided for CRUD operations and resource lifecycle
events. Certain hooks, such as "before create" are asynchronous and execute in
series. Others such as "after update" are synchronous and run in parallel.

```javascript
User.before('create', function (resource, changed, next) {
  // do something before save such as validation and then call next()
});

User.after('create update', function (resource, changed) {
  // do something after create or update
});
```

See the full [documentation for events](docs/API.md#Events).

### Relations

Define relationships between resources in combination with a supporting storage
adapter.

```javascript
Author.hasMany('books', {
  model: Book,

  foreignKey: 'author_id'
});

Book.belongsTo('author', {
  model: Author,
  foreignKey: 'author_id'
});

// fetch book with related author included
Book.findOne(1).withRelated(['author']).exec(function(err, book) {
  console.log(book.author);
});

// fetch author for book
book.related('author', function(err, author) {
  // ...
});

// fetch books for author
author.related('books').where({ published: true }).exec(function(err, books) {
  // ...
});
```

See the [relations API](docs/API.md#module_mio.hasOne) for more information.

### REST API

Create a REST API server from your models and interact with them from the
browser using the same interface.

Shared between browser and server:

```javascript
var mio = require('mio');
var Validators = require('mio-validators');

var User = module.exports = mio.Resource.extend({
  id: { primary: true },
  name: {
    constraints: [Validators.Assert.Type('string')]
  },
  created: {
    constraints: [Validators.Assert.Instance(Date)],
    default: function () {
      return new Date();
    }
  }
});
```

On the server:

```javascript
var User = require('./models/User');
var MongoDB = require('mio-mongo');
var Resource = require('mio-resource');
var express = require('express');

User
  .use(MongoDB({
    url: ,
  }))
  .use(Resource({
    url: {
      collection: '/users',
      resource: '/users/:id'
    }
  }));

var app = express();

app
  .use(User.middleware())
  .listen(3000);
```

In the browser:

```javascript
var User = require('./models/User');
var Ajax = require('mio-ajax');

User
  .use(Ajax({
    url: {
      collection: '/users',
      resource: '/users/:id'
    }
  }));

var user = User().set({ name: "alex" }).save(function(err) {
  // ...
});
```

## MIT Licensed
