# API

### mio.createModel(name[, options])

Create new model constructor with given `name` and `options`.

```javascript
var User = mio.createModel('user');
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

### Model.use(plugin)

Use a plugin function that extends the model. Function is called with `Model` as
the context and `Model` as the argument.

```javascript
User
  .use(function() {
    // ...
  })
  .browser(function() {
    this.use(browserPlugin);
  })
  .server(function() {
    this.use(serverPlugin);
  });
```

Extend the model by passing a map of prototype methods to add:

```javascript
Order.use({
  total: function() { ... }
});

var order = new Order();
order.total();
```

### Model.find(id|query, callback)

```javascript
User.find(123, function(err, user) {
  // ...
});
```

This method is also accessible using the `Model.get` or `Model.findOne` alias.

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

### Model.removeAll(query, callback)

```javascript
User.removeAll({
  created_at: { $lt: (new Date()) }
}, function(err) {
  // ...
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

Plugins should use this object to store options.

## Instance methods

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

## Events

All asynchronous events receive a `next` function as the last argument,
which must be called to continue.

`before find`, `before findAll`, and `before count` are unique in that
subsequent event handlers are ignored if `next` is passed a result.

### Persist data using asynchronous events

```javascript
var mio = require('mio');
var MongoClient = require('mongodb').MongoClient;
var User = mio.createModel('user');

User
  .attr('id', { primary: true })
  .attr('name');

User.before('save', function(user, changed, next) {
  MongoClient.connect('mongodb://127.0.0.01:27017/test', function(err, db) {
    if (!user.isNew()) changed._id = user.primary;

    db.collection('user').save(changed, function(err, docs) {
      if (docs) user.primary = docs[0]._id;
      next(err);
    });
  });
});
```

### Model events

#### Asynchronous

`before find`    Receives arguments `query` and `next(err, result)`. Stops on result.  
`before findAll` Receives arguments `query` and `next(err, result)`. Stops on result.  
`before count`   Receives arguments `query` and `next(err, result)`. Stops on result.  
`before remove`  Receives arguments `model` and `next(err)`.  
`before save`    Receives arguments `model`, `changed`, and `next(err)`.  

#### Synchronous

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

### Instance events

#### Asynchronous

`before remove`  Receives argument `next(err)`.  
`before save`    Receives arguments `changed` and `next(err)`.  

#### Synchronous

`after save`     Receives argument `changed`.  
`after remove`  
`change`         Receives arguments `name`, `value`, and `prev`.  
`change:[attr]`  Receives arguments `value`, and `prev`.  
`setting`        Receives argument `attributes`.  
