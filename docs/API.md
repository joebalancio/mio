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
  * [Resource.remove(query, callback)](#module_mio.Resource.remove)
  * [Resource.Query#where(where)](#module_mio.Resource.Query#where)
  * [Resource.Query#sort(sort)](#module_mio.Resource.Query#sort)
  * [Resource.Query#paginate(paginate)](#module_mio.Resource.Query#paginate)
  * [Resource.Query#from(from)](#module_mio.Resource.Query#from)
  * [Resource.Query#size(size)](#module_mio.Resource.Query#size)
  * [Resource.Query#page(page)](#module_mio.Resource.Query#page)
  * [Resource.Query#with(relations)](#module_mio.Resource.Query#with)
  * [Resource.Query#exec(callback)](#module_mio.Resource.Query#exec)
  * [Resource.hasOne(attr, params)](#module_mio.Resource.hasOne)
  * [Resource.hasMany(attr, params)](#module_mio.Resource.hasMany)
  * [Resource.belongsTo(attr, params)](#module_mio.Resource.belongsTo)
  * [Resource.belongsToMany(attr, params)](#module_mio.Resource.belongsToMany)
  * [Resource.on(event, listener)](#module_mio.Resource.on)
  * [Resource.once(event, listener)](#module_mio.Resource.once)
  * [Resource.emit(event, ...)](#module_mio.Resource.emit)
  * [Resource.before(event, hook)](#module_mio.Resource.before)
  * [Resource.trigger(event, args, callback, [defaultResult])](#module_mio.Resource.trigger)
  * [resource.save(callback)](#module_mio.Resource#save)
  * [resource.remove(callback)](#module_mio.Resource#remove)
  * [resource.isNew()](#module_mio.Resource#isNew)
  * [resource.isDirty(attr)](#module_mio.Resource#isDirty)
  * [resource.changed()](#module_mio.Resource#changed)
  * [resource.has(attr)](#module_mio.Resource#has)
  * [resource.set(attributes)](#module_mio.Resource#set)
  * [resource.reset(attributes)](#module_mio.Resource#reset)

## Events

* [event: "before:findOne"](#before_findOne)
* [event: "before:find"](#before_find)
* [event: "before:count"](#before_count)
* [event: "before:save"](#before_save)
* [event: "before:save:new"](#before_save_new)
* [event: "before:save:update"](#before_save_update)
* [event: "before:remove"](#before_remove)
* [event: "before:updateMany"](#before_updateMany)
* [event: "before:removeMany"](#before_removeMany)
* [event: "findOne"](#event_findOne)
* [event: "find"](#event_find)
* [event: "count"](#event_count)
* [event: "save"](#event_save)
* [event: "save:new"](#save_new)
* [event: "save:update"](#save_update)
* [event: "remove"](#event_remove)
* [event: "updateMany"](#event_updateMany)
* [event: "removeMany"](#event_removeMany)
* [event: "initialize"](#event_initialize)
* [event: "create"](#event_create)
* [event: "attribute"](#event_attribute)
* [event: "change"](#event_change)
* [event: "change:[attr]"](#change_[attr])
* [event: "reset"](#event_reset)
* [event: "set"](#event_set)


<a name="new_module_mio.Resource"></a>
#new mio.Resource(values)

  Create new `Resource` instance. Values set using the constructor are not
marked as dirty. Use `.set()` after instantiation for hydration of dirty
attributes.

**Params**

- values `Object` - optional  

**Fires**

- [initialize](#event_initialize)
- [create](#event_create)

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

- [initialize](#event_initialize)
- [create](#event_create)

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

**Fires**

- [attribute](#event_attribute)

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

**Fires**

- [before:findOne](#before_findOne)
- [findOne](#event_findOne)

**Returns**: `Resource`  
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

**Fires**

- [before:find](#before_find)
- [find](#event_find)

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
 .size(10)
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

**Fires**

- [before:count](#before_count)
- [count](#event_count)

**Returns**: `Resource`  
<a name="module_mio.Resource.update"></a>
##Resource.update(query, changes, callback)
Update all resources using given `query` and corresponding set of `changes`.

**Params**

- query `Object`  
- changes `Object` | `Array`  
- callback <code>[updateCallback](#updateCallback)</code>  

**Fires**

- [before:updateMany](#before_updateMany)
- [updateMany](#event_updateMany)

**Returns**: `Resource`  
**Example**  
```javascript
User.update({ active: true }, { active: false }, function(err) {
  // ...
});
```

<a name="module_mio.Resource.remove"></a>
##Resource.remove(query, callback)
Destroy many resources using given `query`.

**Params**

- query `Object`  
- callback <code>[removeManyCallback](#removeManyCallback)</code>  

**Fires**

- [before:removeMany](#before_removeMany)
- [removeMany](#event_removeMany)

**Returns**: `Resource`  
<a name="module_mio.Resource.Query#where"></a>
##Resource.Query#where(where)
Set `query.where` parameters.

**Params**

- where `Object`  

**Returns**: `Resource.Query`  
<a name="module_mio.Resource.Query#sort"></a>
##Resource.Query#sort(sort)
Set `query.sort` parameters.

**Params**

- sort `Object`  

**Returns**: `Resource.Query`  
<a name="module_mio.Resource.Query#paginate"></a>
##Resource.Query#paginate(paginate)
Set `query.paginate` parameters.

**Params**

- paginate `Object`  
  - \[from\] `Number`  
  - \[size\] `Number`  

**Returns**: `Resource.Query`  
<a name="module_mio.Resource.Query#from"></a>
##Resource.Query#from(from)
Set `query.from` parameter.

**Params**

- from `Mixed` - treated as an offset if number  

**Returns**: `Resource.Query`  
<a name="module_mio.Resource.Query#size"></a>
##Resource.Query#size(size)
Set `query.size` parameter.

**Params**

- size `Number`  

**Returns**: `Resource.Query`  
<a name="module_mio.Resource.Query#page"></a>
##Resource.Query#page(page)
Set `query.page` parameter. Must be used after `query.size` is set.

**Params**

- page `Number` - first page is 1  

**Returns**: `Resource.Query`  
<a name="module_mio.Resource.Query#with"></a>
##Resource.Query#with(relations)
Set `query.withRelations` parameter.

**Params**

- relations `String` | `Array.<String>`  

**Returns**: `Resource.Query`  
<a name="module_mio.Resource.Query#exec"></a>
##Resource.Query#exec(callback)
Execute query.

**Params**

- callback `function`  

**Returns**: `Resource`  
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
##Resource.on(event, listener)
Register `listener` to be called when `event` is emitted.

**Params**

- event `String`  
- listener `function`  

**Returns**: `Resource`  
<a name="module_mio.Resource.once"></a>
##Resource.once(event, listener)
Register `listener` to be called once when `event` is next emitted.

**Params**

- event `String`  
- listener `function`  

**Returns**: `Resource`  
<a name="module_mio.Resource.emit"></a>
##Resource.emit(event, ...)
Emit `event` and call listeners.

**Params**

- event `String`  
- ... `Mixed`  

**Returns**: `Resource`  
<a name="module_mio.Resource.before"></a>
##Resource.before(event, hook)
Register `hook` to be called before `event`.

Hooks are [trigger](#module_mio.Resource.trigger) by various methods
such as [findOne](#module_mio.Resource.findOne) or
[save](#module_mio.Resource#save), are asynchronous, and run in series.
Hooks receive a `next` function as the last argument, which must be called
to continue firing subsequent listeners. Subsequent hooks will not be run
if `next` receives any arguments. Arguments received by `next` are passed to
the callback of the method that fired the event.

**Params**

- event `String`  
- hook `function`  

<a name="module_mio.Resource.trigger"></a>
##Resource.trigger(event, args, callback, [defaultResult])
Run [before](#module_mio.Resource.before) hooks for given `event`.

Hooks registered with [before](#module_mio.Resource.before) are asynchronous and
run in series. Hooks receive a `next` function as the last argument, which
must be called to continue firing subsequent listeners. Arguments received by
`next` are passed to the callback of the method that fired the event. If
`next` receives any arguments, subsequent hooks will not be run.

**Params**

- event `String`  
- args `Mixed` - multiple arguments can be passed  
- callback `function`  
- \[defaultResult\] `Mixed`  

**Returns**: `Resource`  
<a name="module_mio.Resource#save"></a>
##resource.save(callback)
Persist resource to storage. Runs "save" event handlers registered by
persistence plugins.

**Params**

- callback <code>[saveInstanceCallback](#saveInstanceCallback)</code>  

**Fires**

- [before:save](#before_save)
- [before:save:new](#before_save_new)
- [before:save:update](#before_save_update)
- [save](#event_save)
- [save:new](#save_new)
- [save:update](#save_update)

**Returns**: `Resource`  
<a name="module_mio.Resource#remove"></a>
##resource.remove(callback)
Remove resource from storage. Runs "remove" event handlers registered by
persistence plugins.

**Params**

- callback <code>[removeCallback](#removeCallback)</code>  

**Fires**

- [before:remove](#before_remove)
- [remove](#event_remove)

**Returns**: `Resource`  
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
##resource.set(attributes)
Set given resource `attributes`.

**Params**

- attributes `Object`  

**Fires**

- [set](#event_set)

**Returns**: `Resource`  
<a name="module_mio.Resource#reset"></a>
##resource.reset(attributes)
Reset attributes for resource. Marks resource as clean.

**Params**

- attributes `Object`  

**Fires**

- [reset](#event_reset)

**Returns**: `Resource`  



<a name="event_change"></a>
#event: "change"
Fired whenever a resource attribute is changed.

**Params**

- resource `Resource`  
- name `String` - name of the attribute  
- value `Mixed`  
- prev `Mixed`  


<a name="before_findOne"></a>
#event: "before:findOne"
Runs before [findOne](#module_mio.Resource.findOne) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next` **or a value as the second**, subsequent hooks are
**not** executed and `next` arguments are passed to the callback
for [findOne](#module_mio.Resource.findOne).

**Params**

- query `Object`  
- next `function`  


<a name="event_findOne"></a>
#event: "findOne"
Run at the beginning of [findOne](#module_mio.Resource.findOne)'s callback.

**Params**

- query `Object`  
- resource `Resource`  


<a name="before_find"></a>
#event: "before:find"
Runs before [find](#module_mio.Resource.find) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next` **or a value as the second**, subsequent hooks are
**not** executed and `next` arguments are passed to the callback
for [find](#module_mio.Resource.find).

**Params**

- query `Object`  
- next `function`  


<a name="event_find"></a>
#event: "find"
Runs at the beginning of [find](#module_mio.Resource.find)'s callback.

**Params**

- query `Object`  
- collection `Array.<Resource>`  


<a name="before_count"></a>
#event: "before:count"
Runs before [count](#module_mio.Resource.count) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next` **or a value as the second**, subsequent hooks are
**not** executed and the `next` arguments are passed to the callback
for [count](#module_mio.Resource.count).

**Params**

- query `Object`  
- next `function`  


<a name="event_count"></a>
#event: "count"
Run at the beginning of [count](#module_mio.Resource.count)'s callback.

**Params**

- query `Object`  
- count `Number`  


<a name="before_updateMany"></a>
#event: "before:updateMany"
Runs before [update](#module_mio.Resource.update) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent hooks are not executed and the `next`
arguments are passed to the callback for
[update](#module_mio.Resource.update).

**Params**

- query `Object`  
- changes `Object` | `Array`  
- next `function`  


<a name="event_updateMany"></a>
#event: "updateMany"
Run at the beginning of [update](#module_mio.Resource.update)'s callback.

**Params**

- query `Object`  
- changes `Object` | `Array`  


<a name="before_removeMany"></a>
#event: "before:removeMany"
Runs before [remove](#module_mio.Resource.remove) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent hooks are not executed and the `next`
arguments are passed to the callback for
[remove](#module_mio.Resource.remove).

**Params**

- query `Object`  
- next `function`  


<a name="event_removeMany"></a>
#event: "removeMany"
Run at the beginning of [remove](#module_mio.Resource.remove)'s callback.

**Params**

- query `Object`  


<a name="before_save"></a>
#event: "before:save"
Runs before [save](#module_mio.Resource#save) callback for new or previously
saved resources.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent hooks are not executed and the `next`
arguments are passed to the callback for
[save](#module_mio.Resource#save).

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  
- next `function`  


<a name="before_save_new"></a>
#event: "before:save:new"
Runs before [save](#module_mio.Resource#save) callback for new resources
that have not been saved.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent hooks are not executed and the `next`
arguments are passed to the callback for
[save](#module_mio.Resource#save).

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  
- next `function`  


<a name="before_save_update"></a>
#event: "before:save:update"
Runs before [save](#module_mio.Resource#save) callback for resources that
have been successfully saved.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent hooks are not executed and the `next`
arguments are passed to the callback for
[save](#module_mio.Resource#save).

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  
- next `function`  


<a name="event_save"></a>
#event: "save"
Run at the beginning of [save](#module_mio.Resource#save)'s callback for
new or previously saved resources.

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  


<a name="save_new"></a>
#event: "save:new"
Run at the beginning of [save](#module_mio.Resource#save)'s callback for
new resources that have not been saved.

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  


<a name="before_remove"></a>
#event: "before:remove"
Runs before [remove](#module_mio.Resource#remove) callback.

Asynchronous. Listeners run in series. If an error is passed as the first
argument to `next`, subsequent hooks are not executed and the `next`
arguments are passed to the callback for
[remove](#module_mio.Resource#remove).

**Params**

- resource `Resource`  
- next `function`  


<a name="event_initialize"></a>
#event: "initialize"
Run at the beginning of resource constructor.

**Params**

- resource `Resource`  
- values `Object` - values passed to constructor  


<a name="change_[attr]"></a>
#event: "change:[attr]"
Fired whenever [attr] is changed.

**Params**

- resource `Resource`  
- value `Mixed`  
- prev `Mixed`  


<a name="event_create"></a>
#event: "create"
Run at the end of resource constructor.

**Note:** This event is not the same as `save`.

**Params**

- resource `Resource`  


<a name="event_attribute"></a>
#event: "attribute"
**Params**

- name `String` - attribute name  
- options `Object` - attribute options  


<a name="save_update"></a>
#event: "save:update"
Run at the beginning of [save](#module_mio.Resource#save)'s callback for
resources that have been successfully saved.

**Params**

- resource `Resource`  
- changed `Object` - map of dirty attributes  


<a name="event_remove"></a>
#event: "remove"
Run at the beginning of [remove](#module_mio.Resource#remove)'s callback.

**Params**

- resource `Resource`  


<a name="event_set"></a>
#event: "set"
**Params**

- resource `Resource`  
- attributes `Object`  


<a name="event_reset"></a>
#event: "reset"
**Params**

- resource `Resource`  
- attributes `Object`  




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

<a name="removeManyCallback"></a>
#callback: removeManyCallback
Callback for [remove](#module_mio.Resource.remove).

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

<a name="removeCallback"></a>
#callback: removeCallback
Callback for [remove](#module_mio.Resource#remove).

**Params**

- err `Error`  

**Type**: `function`  


