# mio

[![Build Status](https://secure.travis-ci.org/mio/mio.png)](http://travis-ci.org/mio/mio) 
[![Coverage Status](https://coveralls.io/repos/mio/mio/badge.png?branch=master)](https://coveralls.io/r/mio/mio?branch=master)
[![Bower version](https://badge.fury.io/bo/mio.png)](http://badge.fury.io/bo/mio)
[![NPM version](https://badge.fury.io/js/mio.png)](http://badge.fury.io/js/mio)
[![Dependency Status](https://david-dm.org/mio/mio.png)](http://david-dm.org/mio/mio)

Modern idiomatic models for the browser and node.js.

* **Simple**: Plain enumerable attributes using ECMAScript getters and setters.
* **Observable**: Events emitted for initialization, attribute changes, etc.
* **Extensible**: Simple API for extending model prototypes with support
  for browser or server specific plugins.
* **Browser or Node.js**: Reuse code across the browser and server.
* **Tested and open-source**: MIT licensed with full test coverage.

## Installation

Using [npm][0]:

```sh
npm install --save mio
```

Using [bower][2]:

```sh
bower install --save mio
```

## Example

```javascript
var User = require('mio').createModel('user');

User
  .attr('id', {
    primary: true
  })
  .attr('name')
  .attr('created_at', {
    default: function() {
      return new Date();
    }
  });

var user = new User({ name: 'alex' });
```

## Community

* [Plugins](https://github.com/mio/mio/wiki/Plugins/)
* [Wiki](https://github.com/mio/mio/wiki/)
* `##mio` on irc.freenode.net

## API

### mio.createModel(name[, options])

Create new model constructor with given `name` and `options`.

```javascript
var User = require('mio').createModel('user');
```

## Static Methods

### Model.attr(name[, options])

Define an attribute with given `name` and `options`.

```javascript
User.attr('created_at', {
  default: function() {
    return new Date();
  }
});
```

#### options

- `default` default value or function returning value.
- `filtered` if true prevents attribute from being enumerated
- `get` getter function returning attribute value
- `primary` use this attribute as primary key/id (must be unique)

### Model.use(fn)

Use a plugin function that extends the model. Function is called with `Model` as
the context and `Model` as the argument.

```javascript
User
  .use(require('example-plugin'))
  .browser(function() {
    this.use(require('mio-ajax'));
  })
  .server(function() {
    this.use(require('mio-mysql'));
  });
```

### Model.find(id|query, callback)

```javascript
User.find(123, function(err, user) {
  // ...
});
```

This method is also accessible using the `Model.get` alias.

### Model.findAll(query, callback)

```javascript
User.findAll({
  approved: true
}, function(err, collection) {
  console.log(collection);
  // => [user1, user2, user3, ...]
});
```

This method is also accessible using the `Model.all` alias.

### Model.count(query, callback)

```javascript
User.count(function(err, count) {
  console.log(count);
  // => 47
});
```

### Model.browser(fn)

Called when installed using bower or component.

### Model.server(fn)

Called when installed using npm.

### Model.before(ev)

Wrapper for `Model.on('before ev', fn)`.

### Model.after(ev)

Wrapper for `Model.on('after ev', fn)`.

### Model.type

```javascript
var User = mio.createModel('user');

console.log(User.type);
// => "User"
```

### Model.options

## Instance methods

Plugins should use this object to store options.

### Model#save(callback)

```javascript
user.save(function(err) {
  // ...
});
```

### Model#remove(callback)

```javascript
user.remove(function(err) {
  // ...
});
```

This method is also accessible using the `Model#destroy` alias.

### Model#[attr]

### Model#isNew()

### Model#isDirty()

Whether the model has attributes that have changed since last sav.

### Model#changed()

Return attributes changed since last save.

### Model#has(attribute)

### Model#extras

A mutable object for saving extra information pertaining to the model instance.

## Persistence

See [mio-ajax][1] and [mio-mysql][3] for examples of implementing a
persistent storage plugin.

Asynchronous events are used to implement storage adapters, as shown in the
following example.

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

### Events

All asynchronous events receive a `next` function as the last argument,
which must be called to continue.

#### Model events

##### Asynchronous

`before find`    Receives arguments `query` and `next(err, result)`.  
`before findAll` Receives arguments `query` and `next(err, result)`.  
`before count`   Receives arguments `query` and `next(err, result)`.  
`before remove`  Receives arguments `model` and `next(err)`.  
`before save`    Receives arguments `model`, `changed`, and `next(err)`.  

##### Synchronous

`after find`     Receives argument `model`.  
`after findAll`  Receives argument `collection`.  
`after count`    Receives argument `count`.  
`after remove`   Receives argument `model`.  
`after save`     Receives arguments `model` and `changed`.  
`attribute`      Receives arguments `name` and `params`.  
`change`         Receives arguments `model`, `name`, `value`, and `prev`.  
`change:[attr]`  Receives arguments `model`, `value`, and `prev`.  
`initializing`   Receives arguments `model` and `attributes`.  
`initialized`    Receives argument `model`.  
`setting`        Receives arguments `model` and `attributes`.  

#### Instance events

##### Asynchronous

`before remove`  Receives argument `next(err)`.  
`before save`    Receives arguments `changed` and `next(err)`.  

##### Synchronous

`after save`     Receives argument `changed`.  
`after remove`  
`change`         Receives arguments `name`, `value`, and `prev`.  
`change:[attr]`  Receives arguments `value`, and `prev`.  
`setting`        Receives argument `attributes`.  

## MIT Licensed

[0]: https://npmjs.org/
[1]: https://github.com/mio/ajax/
[2]: http://bower.io/
[3]: https://github.com/mio/mysql/
[4]: #stores
[5]: https://github.com/visionmedia/co/
[6]: https://github.com/cujojs/when/
