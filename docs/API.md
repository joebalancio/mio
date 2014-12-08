# API

`Resource` is available via `mio.Resource`.

<a name="exp_module_mio"></a>
##class: Resource ⏏
**Members**

* [class: Resource ⏏](#exp_module_mio)
  * [new Resource(values)](#exp_new_module_mio)
  * [Resource.extend(prototype, [statics])](#module_mio.extend)
  * [Resource.attr(name, [options])](#module_mio.attr)
  * [Resource.use(fn)](#module_mio.use)
  * [Resource.browser(fn)](#module_mio.browser)
  * [Resource.server(fn)](#module_mio.server)
  * [Resource.create(attrs)](#module_mio.create)
  * [Resource.findOne(query, callback)](#module_mio.findOne)
  * [Resource.find(query, callback)](#module_mio.find)
  * [Resource.count(query, callback)](#module_mio.count)
  * [Resource.update(query, changes, callback)](#module_mio.update)
  * [Resource.destroy(query, callback)](#module_mio.destroy)
  * [Resource.hasOne(attr, params)](#module_mio.hasOne)
  * [Resource.hasMany(attr, params)](#module_mio.hasMany)
  * [Resource.belongsTo(attr, params)](#module_mio.belongsTo)
  * [Resource.belongsToMany(attr, params)](#module_mio.belongsToMany)
  * [Resource.on(ev, fn)](#module_mio.on)
  * [Resource.once(ev, fn)](#module_mio.once)
  * [Resource.before()](#module_mio.before)
  * [Resource.after()](#module_mio.after)
  * [resource.save(callback)](#module_mio#save)
  * [resource.destroy(callback)](#module_mio#destroy)
  * [resource.isNew()](#module_mio#isNew)
  * [resource.isDirty(attr)](#module_mio#isDirty)
  * [resource.changed()](#module_mio#changed)
  * [resource.has(attr)](#module_mio#has)
  * [resource.set(attrs)](#module_mio#set)
  * [resource.reset(attrs)](#module_mio#reset)

<a name="exp_new_module_mio"></a>
###new Resource(values)
Create new `Resource` instance. Values set using the constructor are not
marked as dirty. Use `.set()` after instantiation for hydration of dirty
attributes.

**Params**

- values `Object` - optional  

**Returns**: `Resource`  
**Example**  
```javascript
var user = new User({ name: "alex" });
```

<a name="module_mio.extend"></a>
###Resource.extend(prototype, [statics])
Extend `Resource` with attributes, prototype, or static properties.

**Params**

- prototype `Object` - extend resource prototype  
  - attributes `Object` - attribute definitions passed to `attr()`  
- \[statics\] `Object` - extend resource with static properties or methods  
  - \[use\] `Array` - array of plugins to use  
  - \[browser\] `Array` - array of browser plugins to use  
  - \[server\] `Array` - array of server plugins to use  

**Returns**: `Resource`  
**Example**  
```javascript
var User = mio.Resource.extend({
  attributes: {
    id: { primary: true }
  },
}, {
  use: [
    Validators,
    MongoDB(...)
  ]
});
```

<a name="module_mio.attr"></a>
###Resource.attr(name, [options])
Define a resource attribute with the given `name` and `options`.

**Params**

- name `String`  
- \[options\] `Object`  
  - \[default\] `Mixed` - default value or function that returns value  
  - \[enumerable\] `Boolean` - attribute is enumerable (default: true)  
  - \[serializable\] `Boolean` - include in JSON (default: true)  
  - \[get\] `function` - accessor function  
  - \[primary\] `Boolean` - use attribute as primary key  

**Returns**: `Resource`  
**Example**  
```javascript
  User
    .attr('id', { primary: true })
    .attr('name')
    .attr('created', {
      default: function() {
        return new Date();
      }
    });
```

<a name="module_mio.use"></a>
###Resource.use(fn)
Call the given plugin `fn` with the Resource as both argument and context.

**Params**

- fn `function`  

**Returns**: `Resource`  
**Example**  
```javascript
User
  .use(require('example-plugin'))
  .server(function() {
    this.use(require('mio-mysql'));
  })
  .browser(function() {
    this.use(require('mio-ajax'));
  });
```

<a name="module_mio.browser"></a>
###Resource.browser(fn)
Use given `fn` only in browser.

**Params**

- fn `function`  

**Returns**: `Resource`  
<a name="module_mio.server"></a>
###Resource.server(fn)
Use given `fn` only in node.

**Params**

- fn `function`  

**Returns**: `Resource`  
<a name="module_mio.create"></a>
###Resource.create(attrs)
Create a new resource and hydrate with given `attrs`,
or if `attrs` is already a resource return it.

This is simply sugar for `new Resource(attrs)`.

**Params**

- attrs `Object`  

**Returns**: `Resource`  
<a name="module_mio.findOne"></a>
###Resource.findOne(query, callback)
Find a resource with given `id` or `query`.

**Params**

- query `Number` | `Object`  
- callback `function`  

**Returns**: `Resource`  
**Example**  
```javascript
User.findOne(123, function (err, user) {
  // ...
})
```

<a name="module_mio.find"></a>
###Resource.find(query, callback)
Find collection of resources using given `query`.

**Params**

- query `Object`  
- callback `function`  

**Returns**: `Resource`  
**Example**  
```javascript
User.find({ active: true }, function (err, users) {
  // ...
});
```

Queries can also be composed using chainable methods:

```javascript
User.find()
 .where({ active: true })
 .sort({ created_at: "desc" })
 .limit(10)
 .exec(function(err, users) {
   // ...
 });
```

<a name="module_mio.count"></a>
###Resource.count(query, callback)
Count resources using given `query`.

**Params**

- query `Object`  
- callback `function`  

**Returns**: `Resource`  
<a name="module_mio.update"></a>
###Resource.update(query, changes, callback)
Update all resources using given `query` and corresponding set of `changes`.

**Params**

- query `Object`  
- changes `Object` | `Array` - array of updates or patch to be applied  
- callback `function`  

**Returns**: `Resource`  
**Example**  
```javascript
User.update({ active: true }, { active: false }, function(err) {
  // ...
});
```

<a name="module_mio.destroy"></a>
###Resource.destroy(query, callback)
Destroy resources using given `query`.

**Params**

- query `Object`  
- callback `function`  

**Returns**: `Resource`  
<a name="module_mio.hasOne"></a>
###Resource.hasOne(attr, params)
A one-to-one relation, where the resource has exactly one of the specified
target resource, referenced by a foreign key on the target resource.

**Params**

- attr `String` - name of the attribute populated with target resource  
- params `Object` - additional parameters passed to `.attr()`  
  - target `Resource`  
  - foreignKey `String` - foreign key on target resource. defaults to
resource table name appended with `_id`.  
  - nested `Boolean` - whether to always include (default: false)  

**Returns**: `Resource`  
**Example**  
```javascript
Patient.hasOne('record', {
  target: Record,
  foreignKey: 'patient_id'
});
```

<a name="module_mio.hasMany"></a>
###Resource.hasMany(attr, params)
The `hasMany` relationship is for a resource with a one-to-many
relationship with the target resource. The resource is referenced by a
foreign key on the target resource.

**Params**

- attr `String` - name of the attribute populated with target resource  
- params `Object` - additional parameters passed to `.attr()`  
  - target `Resource`  
  - foreignKey `String` - foreign key on target resource. defaults to
resource table name appended with `_id`.  
  - nested `Boolean` - always include relation in queries (default: false)  

**Returns**: `Resource`  
**Example**  
```javascript
Author.hasMany('books', {
  target: Book,
  foreignKey: 'author_id'
});
```

<a name="module_mio.belongsTo"></a>
###Resource.belongsTo(attr, params)
The `belongsTo` relationship is used when a resource is a member of another
target resource. It can be used in a one-to-one association as the inverse of
`hasOne`, or in a one-to-many association as the inverse of a `hasMany`.
In both cases, the `belongsTo` relationship is referenced by a
foreign key on the current resource.

**Params**

- attr `String` - name of the attribute populated with target resource  
- params `Object` - additional parameters passed to `.attr()`  
  - target `Resource` | `function` - can be a function that returns
constructor to avoid circular reference issues  
  - foreignKey `String` - foreign key on current resource. defaults
to `params.target` table name appended with `_id`  
  - nested `Boolean` - whether to always include (default: false)  

**Returns**: `Resource`  
**Example**  
```javascript
Book.belongsTo('author', {
  target: Author,
  foreignKey: 'author_id'
}):
```

<a name="module_mio.belongsToMany"></a>
###Resource.belongsToMany(attr, params)
The `belongsToMany` relationship is for many-to-many relations, where the
current resource is joined to one or more of a target resource through
another table (or resource).

**Params**

- attr `String` - name of the attribute populated with target resource  
- params `Object` - additional parameters passed to `.attr()`  
  - target `Resource` | `function` - can be a function that returns
constructor to avoid circular reference issues  
  - through `String` | `Resource` - table or resource for association  
  - foreignKey `String` - foreign key of the target resource.
defaults to `params.target` table name appended with `_id`  
  - throughKey `String` - foreign key of the current resource.
defaults to resource table name appended with `_id`  
  - nested `Boolean` - whether to always include (default: false)  

**Returns**: `Resource`  
**Example**  
```javascript
Post.belongsToMany('tags', {
  target: Tag,
  foreignKey: 'tag_id',
  throughKey: 'post_id',
  through: 'post_tag'
});
```

<a name="module_mio.on"></a>
###Resource.on(ev, fn)
Register `fn` to be called when `ev` is emitted.

**Params**

- ev `String`  
- fn `function`  

**Returns**: `Resource`  
<a name="module_mio.once"></a>
###Resource.once(ev, fn)
Register `fn` to be called once when `ev` is next emitted.

**Params**

- ev `String`  
- fn `function`  

**Returns**: `Resource`  
<a name="module_mio.before"></a>
###Resource.before()
Alias for `Resource.on('before EVENT')`

<a name="module_mio.after"></a>
###Resource.after()
Alias for `Resource.on('after EVENT')`

<a name="module_mio#save"></a>
###resource.save(callback)
Persist resource to storage. Runs "create" or "update" event
handlers registered by persistence plugins.

**Params**

- callback `function`  

**Returns**: `Resource`  
<a name="module_mio#destroy"></a>
###resource.destroy(callback)
Remove resource from storage. Runs "destroy" event handlers registered by
persistence plugins.

**Params**

- callback `function`  

**Returns**: `Resource`  
<a name="module_mio#isNew"></a>
###resource.isNew()
Check if resource is new and has not been saved.

**Returns**: `Boolean`  
<a name="module_mio#isDirty"></a>
###resource.isDirty(attr)
Check if resource is dirty (has any changed attributes).
If an attribute name is specified, check if that attribute is dirty.

**Params**

- attr `String` - optional attribute to check if dirty  

**Returns**: `Boolean`  
<a name="module_mio#changed"></a>
###resource.changed()
Return dirty attributes (changed since last save).

**Returns**: `Object`  
<a name="module_mio#has"></a>
###resource.has(attr)
Check if resource has given `attr`.

**Params**

- attr `String`  

**Returns**: `Boolean`  
<a name="module_mio#set"></a>
###resource.set(attrs)
Set given resource `attrs`.

**Params**

- attrs `Object`  

**Returns**: `Resource`  
<a name="module_mio#reset"></a>
###resource.reset(attrs)
Reset attributes for resource. Marks resource as clean.

**Params**

- attrs `Object`  

**Returns**: `Resource`  
## Events

All asynchronous events receive a `next` function as the last argument,
which must be called to continue.

`before find one`, `before find many`, and `before count` are unique in that
subsequent event handlers are ignored if `next` is passed a result.

### Persist data using asynchronous events

```javascript
var mio = require('mio');
var MongoClient = require('mongodb').MongoClient;
var User = mio.createModel('user');

User
  .attr('id', { primary: true })
  .attr('name');

User.before('create', function(user, changed, next) {
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

`before find one`     Receives arguments `query` and `next(err, result)`. Stops on result.  
`before find many`    Receives arguments `query` and `next(err, result)`. Stops on result.  
`before count`        Receives arguments `query` and `next(err, result)`. Stops on result.  
`before create`       Receives arguments `resource`, `changed`, and `next(err)`.  
`before update`       Receives arguments `resource`, `changed`, and `next(err)`.  
`before update many`  Receives arguments `query`, `changes`, and `next(err)`.  
`before destroy`      Receives arguments `resource` and `next(err)`.  
`before destroy many` Receives arguments `query` and `next(err)`.

#### Synchronous

`after find one`      Receives argument `query` and `resource`.  
`after find many`     Receives argument `query` and `collection`.  
`after count`         Receives argument `query` and `count`.  
`after create`        Receives arguments `resource` and `changed`.  
`after update`        Receives arguments `resource` and `changed`.  
`after update many`   Receives arguments `query` and `changes`.  
`after destroy`       Receives argument `resource`.  
`after destroy many`  Receives argument `query`.  
`attribute`           Receives arguments `name` and `params`.  
`change`              Receives arguments `resource`, `name`, `value`, and `prev`.  
`change:[attr]`       Receives arguments `resource`, `value`, and `prev`.  
`initializing`        Receives arguments `resource` and `attributes`.  
`initialized`         Receives argument `resource`.  
`setting`             Receives arguments `resource` and `attributes`.  
`reset`               Receives arguments `resource` and `attributes`.

### Instance events

#### Asynchronous

`before create`  Receives arguments `changed` and `next(err)`.  
`before update`  Receives arguments `changed` and `next(err)`.  
`before destroy` Receives argument `next(err)`.

#### Synchronous

`after create`   Receives argument `changed`.  
`after update`   Receives argument `changed`.  
`after destroy`  
`change`         Receives arguments `name`, `value`, and `prev`.  
`change:[attr]`  Receives arguments `value`, and `prev`.  
`setting`        Receives argument `attributes`.  
`reset`          Receives argument `attributes`.  
