# API

## mio.Resource

* [class: mio.Resource](#module_mio.Resource)
  * [new mio.Resource(values)](#new_module_mio.Resource)
  * [Resource.extend(prototype, [statics])](#module_mio.Resource.extend)
  * [Resource.attr(name, [options])](#module_mio.Resource.attr)
  * [Resource.use(plugin)](#module_mio.Resource.use)
  * [Resource.browser(fn)](#module_mio.Resource.browser)
  * [Resource.server(fn)](#module_mio.Resource.server)
  * [Resource.create(attrs)](#module_mio.Resource.create)
  * [Resource.findOne(query, callback)](#module_mio.Resource.findOne)
  * [Resource.find(query, callback)](#module_mio.Resource.find)
  * [Resource.count(query, callback)](#module_mio.Resource.count)
  * [Resource.update(query, changes, callback)](#module_mio.Resource.update)
  * [Resource.destroy(query, callback)](#module_mio.Resource.destroy)
  * [Resource.hasOne(attr, params)](#module_mio.Resource.hasOne)
  * [Resource.hasMany(attr, params)](#module_mio.Resource.hasMany)
  * [Resource.belongsTo(attr, params)](#module_mio.Resource.belongsTo)
  * [Resource.belongsToMany(attr, params)](#module_mio.Resource.belongsToMany)
  * [Resource.on(ev, fn)](#module_mio.Resource.on)
  * [Resource.once(ev, fn)](#module_mio.Resource.once)
  * [Resource.before()](#module_mio.Resource.before)
  * [Resource.after()](#module_mio.Resource.after)
  * [resource.save(callback)](#module_mio.Resource#save)
  * [resource.destroy(callback)](#module_mio.Resource#destroy)
  * [resource.isNew()](#module_mio.Resource#isNew)
  * [resource.isDirty(attr)](#module_mio.Resource#isDirty)
  * [resource.changed()](#module_mio.Resource#changed)
  * [resource.has(attr)](#module_mio.Resource#has)
  * [resource.set(attrs)](#module_mio.Resource#set)
  * [resource.reset(attrs)](#module_mio.Resource#reset)

## Events

* [event: "after find one"](#event_after find one)
* [event: "after find many"](#event_after find many)
* [event: "after count"](#event_after count)
* [event: "after create"](#event_after create)
* [event: "after update"](#event_after update)
* [event: "after destroy"](#event_after destroy)
* [event: "after update many"](#event_after update many)
* [event: "after destroy many"](#event_after destroy many)
* [event: "attribute"](#event_attribute)
* [event: "before find one"](#event_before find one)
* [event: "before find many"](#event_before find many)
* [event: "before count"](#event_before count)
* [event: "before create"](#event_before create)
* [event: "before update"](#event_before update)
* [event: "before destroy"](#event_before destroy)
* [event: "before update many"](#event_before update many)
* [event: "before destroy many"](#event_before destroy many)
* [event: "change"](#event_change)
* [event: "change:[attr]"](#change_[attr])
* [event: "initialized"](#event_initialized)
* [event: "initializing"](#event_initializing)
* [event: "reset"](#event_reset)
* [event: "setting"](#event_setting)

### Hooks

Before and after hooks are provided for CRUD operations and resource lifecycle
events. Certain hooks, such as "before create" are asynchronous and execute in
series. Others such as "after update" are synchronous and run in parallel.

```javascript
User.before('create', function (resource, changed, next) {
  // do something before save such as validation and then call next()
});

User.after('update', function (resource, changed) {
  // do something after update
});
```

Events prefixed with `before` are asynchronous hooks and run in series.
Asynchronous hooks receive a `next` function as the last argument, which must
be called to continue firing subsequent listeners. Arguments received by
`next` are passed to the callback of the method that fired the event. If the
first argument received by `next` is an error subsequent hooks will not be run.
Similarly for find and count events, if the second argument received by next
is non-null subsequent hooks will not be run.

<a name="new_module_mio.Resource"></a>
#new mio.Resource(values)

  Create new `Resource` instance. Values set using the constructor are not
marked as dirty. Use `.set()` after instantiation for hydration of dirty
attributes.

**Params**

- values `Object` - optional  

**Fires**

[initializing](#event_initializing)
[initialized](#event_initialized)

**Example**  
```javascript
var user = new User({ name: "alex" });
```


  <a name="new_module_mio.Resource"></a>
##new mio.Resource(values)
Create new `Resource` instance. Values set using the constructor are not
marked as dirty. Use `.set()` after instantiation for hydration of dirty
attributes.

**Params**

- values `Object` - optional  

**Fires**

[initializing](#event_initializing)
[initialized](#event_initialized)

**Example**  
```javascript
var user = new User({ name: "alex" });
```

<a name="module_mio.Resource.extend"></a>
##Resource.extend(prototype, [statics])
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

<a name="module_mio.Resource.attr"></a>
##Resource.attr(name, [options])
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
**Fires**

[attribute](#event_attribute)

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

<a name="module_mio.Resource.use"></a>
##Resource.use(plugin)
Call the given plugin `fn` with the Resource as both argument and context.

**Params**

- plugin <code>[plugin](#plugin)</code>  

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

<a name="module_mio.Resource.browser"></a>
##Resource.browser(fn)
Use given `fn` only in browser.

**Params**

- fn <code>[plugin](#plugin)</code>  

**Returns**: `Resource`  
<a name="module_mio.Resource.server"></a>
##Resource.server(fn)
Use given `fn` only in node.

**Params**

- fn <code>[plugin](#plugin)</code>  

**Returns**: `Resource`  
<a name="module_mio.Resource.create"></a>
##Resource.create(attrs)
Create a new resource and hydrate with given `attrs`,
or if `attrs` is already a resource return it.

This is simply sugar for `new Resource(attrs)`.

**Params**

- attrs `Object`  

**Returns**: `Resource`  
<a name="module_mio.Resource.findOne"></a>
##Resource.findOne(query, callback)
Find a resource with given `id` or `query`.

**Params**

- query `Number` | `Object`  
- callback <code>[findOneCallback](#findOneCallback)</code>  

**Returns**: `Resource`  
**Fires**

[before find one](#event_before find one)
[after find one](#event_after find one)

**Example**  
```javascript
User.findOne(123, function (err, user) {
  // ...
})
```

<a name="module_mio.Resource.find"></a>
##Resource.find(query, callback)
Find collection of resources using given `query`.

**Params**

- query `Object`  
- callback <code>[findCallback](#findCallback)</code>  

**Returns**: `Resource`  
**Fires**

[before find many](#event_before find many)
[after find many](#event_after find many)

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

<a name="module_mio.Resource.count"></a>
##Resource.count(query, callback)
Count resources using given `query`.

**Params**

- query `Object`  
- callback <code>[countCallback](#countCallback)</code>  

**Returns**: `Resource`  
**Fires**

[before count](#event_before count)
[after count](#event_after count)

<a name="module_mio.Resource.update"></a>
##Resource.update(query, changes, callback)
Update all resources using given `query` and corresponding set of `changes`.

**Params**

- query `Object`  
- changes `Object` | `Array`  
- callback <code>[updateCallback](#updateCallback)</code>  

**Returns**: `Resource`  
**Fires**

[before update many](#event_before update many)
[after update many](#event_after update many)

**Example**  
```javascript
User.update({ active: true }, { active: false }, function(err) {
  // ...
});
```

<a name="module_mio.Resource.destroy"></a>
##Resource.destroy(query, callback)
Destroy resources using given `query`.

**Params**

- query `Object`  
- callback <code>[destroyCallback](#destroyCallback)</code>  

**Returns**: `Resource`  
**Fires**

[before destroy many](#event_before destroy many)
[after destroy many](#event_after destroy many)

<a name="module_mio.Resource.hasOne"></a>
##Resource.hasOne(attr, params)
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

<a name="module_mio.Resource.hasMany"></a>
##Resource.hasMany(attr, params)
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

<a name="module_mio.Resource.belongsTo"></a>
##Resource.belongsTo(attr, params)
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

<a name="module_mio.Resource.belongsToMany"></a>
##Resource.belongsToMany(attr, params)
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

<a name="module_mio.Resource.on"></a>
##Resource.on(ev, fn)
Register `fn` to be called when `ev` is emitted.

**Params**

- ev `String`  
- fn `function`  

**Returns**: `Resource`  
<a name="module_mio.Resource.once"></a>
##Resource.once(ev, fn)
Register `fn` to be called once when `ev` is next emitted.

**Params**

- ev `String`  
- fn `function`  

**Returns**: `Resource`  
<a name="module_mio.Resource.before"></a>
##Resource.before()
Alias for `Resource.on('before EVENT')`

<a name="module_mio.Resource.after"></a>
##Resource.after()
Alias for `Resource.on('after EVENT')`

<a name="module_mio.Resource#save"></a>
##resource.save(callback)
Persist resource to storage. Runs "create" or "update" event
handlers registered by persistence plugins.

**Params**

- callback <code>[saveInstanceCallback](#saveInstanceCallback)</code>  

**Returns**: `Resource`  
**Fires**

[before create](#event_before create)
[before update](#event_before update)
[after create](#event_after create)
[after update](#event_after update)

<a name="module_mio.Resource#destroy"></a>
##resource.destroy(callback)
Remove resource from storage. Runs "destroy" event handlers registered by
persistence plugins.

**Params**

- callback <code>[destroyInstanceCallback](#destroyInstanceCallback)</code>  

**Returns**: `Resource`  
**Fires**

[before destroy](#event_before destroy)
[after destroy](#event_after destroy)

<a name="module_mio.Resource#isNew"></a>
##resource.isNew()
Check if resource is new and has not been saved.

**Returns**: `Boolean`  
<a name="module_mio.Resource#isDirty"></a>
##resource.isDirty(attr)
Check if resource is dirty (has any changed attributes).
If an attribute name is specified, check if that attribute is dirty.

**Params**

- attr `String` - optional attribute to check if dirty  

**Returns**: `Boolean`  
<a name="module_mio.Resource#changed"></a>
##resource.changed()
Return dirty attributes (changed since last save).

**Returns**: `Object`  
<a name="module_mio.Resource#has"></a>
##resource.has(attr)
Check if resource has given `attr`.

**Params**

- attr `String`  

**Returns**: `Boolean`  
<a name="module_mio.Resource#set"></a>
##resource.set(attrs)
Set given resource `attrs`.

**Params**

- attrs `Object`  

**Returns**: `Resource`  
**Fires**

[setting](#event_setting)

<a name="module_mio.Resource#reset"></a>
##resource.reset(attrs)
Reset attributes for resource. Marks resource as clean.

**Params**

- attrs `Object`  

**Returns**: `Resource`  
**Fires**

[reset](#event_reset)




<a name="event_change"></a>
#event: "change"
**Params**

- resource `Resource`  
- name `String`  
- value `Mixed`  
- prev `Mixed`  

**Type**: `function`  

<a name="event_before find one"></a>
#event: "before find one"
Runs before [findOne](#module_mio.Resource.findOne) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next` **or a value as the second**, subsequent listeners are
**not** executed and `next` arguments are passed to the callback
for [findOne](#module_mio.Resource.findOne).

**Params**

- query `Object`  
- next `function`  

**Type**: `function`  

<a name="event_after find one"></a>
#event: "after find one"
Run after [findOne](#module_mio.Resource.findOne) at the beginning of its
callback.

**Params**

- query `Object`  
- resource `Resource`  

**Type**: `function`  

<a name="event_before find many"></a>
#event: "before find many"
Runs before [find](#module_mio.Resource.find) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next` **or a value as the second**, subsequent listeners are
**not** executed and `next` arguments are passed to the callback
for [find](#module_mio.Resource.find).

**Params**

- query `Object`  
- next `function`  

**Type**: `function`  

<a name="event_after find many"></a>
#event: "after find many"
Runs at the beginning of [find](#module_mio.Resource.find) callback.

**Params**

- query `Object`  
- collection `Array.<Resource>`  

**Type**: `function`  

<a name="event_before count"></a>
#event: "before count"
Runs before [count](#module_mio.Resource.count) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next` **or a value as the second**, subsequent listeners are
**not** executed and the `next` arguments are passed to the callback
for [count](#module_mio.Resource.count).

**Params**

- query `Object`  
- next `function`  

**Type**: `function`  

<a name="event_after count"></a>
#event: "after count"
Run after [count](#module_mio.Resource.count) at the beginning of its
callback.

**Params**

- query `Object`  
- count `Number`  

**Type**: `function`  

<a name="event_before update many"></a>
#event: "before update many"
Runs before [update](#module_mio.Resource.update) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent listeners are not executed and the `next`
arguments are passed to the callback for
[update](#module_mio.Resource.update).

**Params**

- query `Object`  
- changes `Object` | `Array`  
- next `function`  

**Type**: `function`  

<a name="event_after update many"></a>
#event: "after update many"
Run after [update](#module_mio.Resource.update) at the beginning of its
callback.

**Params**

- query `Object`  
- changes `Object` | `Array`  

**Type**: `function`  

<a name="event_before destroy many"></a>
#event: "before destroy many"
Runs before [destroy](#module_mio.Resource.destroy) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent listeners are not executed and the `next`
arguments are passed to the callback for
[destroy](#module_mio.Resource.destroy).

**Params**

- query `Object`  
- next `function`  

**Type**: `function`  

<a name="event_after destroy many"></a>
#event: "after destroy many"
Run after [destroy](#module_mio.Resource.destroy) at the beginning of its
callback.

**Params**

- query `Object`  

**Type**: `function`  

<a name="event_before create"></a>
#event: "before create"
Runs before [save](#module_mio.Resource#save) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent listeners are not executed and the `next`
arguments are passed to the callback for
[save](#module_mio.Resource#save).

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  
- next `function`  

**Type**: `function`  

<a name="event_after create"></a>
#event: "after create"
Run after [save](#module_mio.Resource#save) at the beginning of its
callback.

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  

**Type**: `function`  

<a name="event_before update"></a>
#event: "before update"
Runs before [save](#module_mio.Resource#save) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent listeners are not executed and the `next`
arguments are passed to the callback for
[save](#module_mio.Resource#save).

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  
- next `function`  

**Type**: `function`  

<a name="event_before destroy"></a>
#event: "before destroy"
Runs before [destroy](#module_mio.Resource#destroy) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent listeners are not executed and the `next`
arguments are passed to the callback for
[destroy](#module_mio.Resource#destroy).

**Params**

- resource `Resource`  
- next `function`  

**Type**: `function`  

<a name="event_initializing"></a>
#event: "initializing"
**Params**

- resource `Resource`  
- values `Object` - values passed to constructor  

**Type**: `function`  

<a name="change_[attr]"></a>
#event: "change:[attr]"
**Params**

- resource `Resource`  
- value `Mixed`  
- prev `Mixed`  

**Type**: `function`  

<a name="event_initialized"></a>
#event: "initialized"
**Params**

- resource `Resource`  

**Type**: `function`  

<a name="event_attribute"></a>
#event: "attribute"
**Params**

- name `String` - attribute name  
- options `Object` - attribute options  

**Type**: `function`  

<a name="event_after update"></a>
#event: "after update"
Run after [save](#module_mio.Resource#save) at the beginning of its
callback.

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  

**Type**: `function`  

<a name="event_after destroy"></a>
#event: "after destroy"
Run after [destroy](#module_mio.Resource#destroy) at the beginning of its
callback.

**Params**

- resource `Resource`  

**Type**: `function`  

<a name="event_setting"></a>
#event: "setting"
**Params**

- resource `Resource`  
- attributes `Object`  

**Type**: `function`  

<a name="event_reset"></a>
#event: "reset"
**Params**

- resource `Resource`  
- attributes `Object`  

**Type**: `function`  



<a name="findOneCallback"></a>
#callback: findOneCallback
Callback for [findOne](#module_mio.Resource.findOne).

**Params**

- err `Error`  
- resource `Resource`  

**Type**: `function`  

<a name="findCallback"></a>
#callback: findCallback
Callback for [find](#module_mio.Resource.find).

**Params**

- err `Error`  
- resources `Array.<Resource>`  

**Type**: `function`  

<a name="countCallback"></a>
#callback: countCallback
Callback for [count](#module_mio.Resource.count).

**Params**

- err `Error`  
- count `Number`  

**Type**: `function`  

<a name="plugin"></a>
#callback: plugin
**Params**

- Resource `Resource`  

**Type**: `function`  

<a name="updateCallback"></a>
#callback: updateCallback
Callback for [update](#module_mio.Resource.update).

**Params**

- err `Error`  
- query `Object`  
- changes `Object` | `Array`  

**Type**: `function`  

<a name="destroyCallback"></a>
#callback: destroyCallback
Callback for [destroy](#module_mio.Resource.destroy).

**Params**

- err `Error`  
- query `Object`  

**Type**: `function`  

<a name="saveInstanceCallback"></a>
#callback: saveInstanceCallback
Callback for [module:mio.Resource.prototype.save](module:mio.Resource.prototype.save).

**Params**

- err `Error`  

**Type**: `function`  

<a name="destroyInstanceCallback"></a>
#callback: destroyInstanceCallback
Callback for [module:mio.Resource.prototype.destroy](module:mio.Resource.prototype.destroy).

**Params**

- err `Error`  

**Type**: `function`  


