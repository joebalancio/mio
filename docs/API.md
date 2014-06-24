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

### Model.use(fn)

Use a plugin function that extends the model. Function is called with `Model` as
the context and `Model` as the argument.

```javascript
User
  .use(plugin)
  .browser(function() {
    this.use(browserPlugin);
  })
  .server(function() {
    this.use(serverPlugin);
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

## Events

All asynchronous events receive a `next` function as the last argument,
which must be called to continue.

### Model events

#### Asynchronous

`before find`    Receives arguments `query` and `next(err, result)`.  
`before findAll` Receives arguments `query` and `next(err, result)`.  
`before count`   Receives arguments `query` and `next(err, result)`.  
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
