# mio [![Build Status](https://img.shields.io/travis/mio/mio.svg?style=flat)](http://travis-ci.org/mio/mio) [![Coverage Status](https://img.shields.io/coveralls/mio/mio.svg?style=flat)](https://coveralls.io/r/mio/mio?branch=master) [![Bower version](https://img.shields.io/bower/v/mio.svg?style=flat)](http://badge.fury.io/bo/mio) [![NPM version](https://img.shields.io/npm/v/mio.svg?style=flat)](http://badge.fury.io/js/mio) [![Dependency Status](https://img.shields.io/david/mio/mio.svg?style=flat)](http://david-dm.org/mio/mio)

> Model RESTful resources using a simple, extensible, storage-agnostic prototype.

* **Small**: No dependencies and core is only ~200 SLOC.
* **Simple**: Plain enumerable attributes using ECMAScript getters and setters.
* **Observable**: Before and after hooks for CRUD operations and lifecycle events
* **Extensible**: Simple API for extending model prototypes with support
  for browser or server specific plugins.
* **Browser or Node.js**: Reuse code across the browser and server.

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

## Examples

### Define a resource

Define new resources by extending the base class. You can pass attribute
definitions to `.extend()` or use the chainable `.attr()`:

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

### Query for resources

```javascript
User.findOne(123, function(err, user) {
  // ...
});


User.findAll()
  .where({ active: true })
  .sort({ created_at: "desc" })
  .limit(10)
  .exec(function(err, users) {
    // ...
  });
```

### Middleware for validation and persistence

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

### Hook into CRUD operations

```javascript
User.before('create', function (resource, changed, next) {
  // do something before save such as validation
});

User.after('create update', function (resource, changed) {
  // do something after create or update
});
```

See the full list of [events](docs/API.md#Events).

### Relations

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

## Community

* [Plugins](https://github.com/mio/mio/wiki/Plugins/)
* [Wiki](https://github.com/mio/mio/wiki/)
* `##mio` on irc.freenode.net

## MIT Licensed
