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
  * [Resource.hasOne(attr, params)](#module_mio.Resource.hasOne)
  * [Resource.hasMany(attr, params)](#module_mio.Resource.hasMany)
  * [Resource.belongsTo(attr, params)](#module_mio.Resource.belongsTo)
  * [Resource.belongsToMany(attr, params)](#module_mio.Resource.belongsToMany)
  * [Resource.on(event, listener)](#module_mio.Resource.on)
  * [Resource.once(event, listener)](#module_mio.Resource.once)
  * [Resource.emit(event, ...)](#module_mio.Resource.emit)
  * [Resource.before(event, hook)](#module_mio.Resource.before)
  * [Resource.trigger(event, args, callback)](#module_mio.Resource.trigger)
  * [Resource.get(query, callback)](#module_mio.Resource.get)
  * [Resource.put(query, representation, callback)](#module_mio.Resource.put)
  * [Resource.patch(query, changes, callback)](#module_mio.Resource.patch)
  * [Resource.post(representation, callback)](#module_mio.Resource.post)
  * [Resource.delete(query, callback)](#module_mio.Resource.delete)
  * [resource.get(callback)](#module_mio.Resource#get)
  * [resource.put(callback)](#module_mio.Resource#put)
  * [resource.patch(callback)](#module_mio.Resource#patch)
  * [resource.post(callback)](#module_mio.Resource#post)
  * [resource.delete(callback)](#module_mio.Resource#delete)
  * [resource.isNew()](#module_mio.Resource#isNew)
  * [resource.isDirty(attr)](#module_mio.Resource#isDirty)
  * [resource.changed()](#module_mio.Resource#changed)
  * [resource.has(attr)](#module_mio.Resource#has)
  * [resource.set(attributes)](#module_mio.Resource#set)
  * [resource.reset(attributes)](#module_mio.Resource#reset)
  * [Resource.url([method])](#module_mio.Resource.url)
* [class: mio.Collection](#module_mio.Collection)
  * [new mio.Collection(resources)](#new_module_mio.Collection)
  * [collection.resources](#module_mio.Collection#resources)
  * [collection.length](#module_mio.Collection#length)
  * [collection.toArray](#module_mio.Collection#toArray)
  * [Collection.extend(prototype, statics)](#module_mio.Collection.extend)
  * [Collection.url([method])](#module_mio.Collection.url)
  * [collection.at(index)](#module_mio.Collection#at)
  * [collection.toJSON()](#module_mio.Collection#toJSON)
* [class: mio.Query](#module_mio.Query)
  * [new mio.Query(context, handler)](#new_module_mio.Query)
  * [query.where(where)](#module_mio.Query#where)
  * [query.sort(sort)](#module_mio.Query#sort)
  * [query.paginate(paginate)](#module_mio.Query#paginate)
  * [query.from(from)](#module_mio.Query#from)
  * [query.size(size)](#module_mio.Query#size)
  * [query.page(page)](#module_mio.Query#page)
  * [query.withRelated(relations)](#module_mio.Query#withRelated)
  * [query.exec(callback)](#module_mio.Query#exec)
  * [query.toJSON()](#module_mio.Query#toJSON)

## Events

* [event: "before:get"](#before_get)
* [event: "before:put"](#before_put)
* [event: "before:patch"](#before_patch)
* [event: "before:post"](#before_post)
* [event: "before:delete"](#before_delete)
* [event: "get"](#event_get)
* [event: "put"](#event_put)
* [event: "patch"](#event_patch)
* [event: "post"](#event_post)
* [event: "delete"](#event_delete)
* [event: "change"](#event_change)
* [event: "change:[attr]"](#change_[attr])
* [event: "initialize"](#event_initialize)
* [event: "create"](#event_create)
* [event: "attribute"](#event_attribute)
* [event: "set"](#event_set)
* [event: "reset"](#event_reset)


<a name="new_module_mio.Collection"></a>
#new mio.Collection(resources)

  A collection is the interface for working with multiple resources, and
exposes the same set of HTTP verbs as `Resource`.

All Array.prototype methods are available for collections, but a collection
is not an array. The array of resources is kept at `Collection#resources`.

**Params**

- resources `Array.<Resource>`  


  <a name="new_module_mio.Collection"></a>
##new mio.Collection(resources)
A collection is the interface for working with multiple resources, and
exposes the same set of HTTP verbs as `Resource`.

All Array.prototype methods are available for collections, but a collection
is not an array. The array of resources is kept at `Collection#resources`.

**Params**

- resources `Array.<Resource>`  

<a name="module_mio.Collection#resources"></a>
##collection.resources
**Type**: `Array.<Resource>`  
<a name="module_mio.Collection#length"></a>
##collection.length
**Type**: `Number`  
<a name="module_mio.Collection#toArray"></a>
##collection.toArray
Returns array of resources in collection.

**Returns**: `Array.<Resource>`  
<a name="module_mio.Collection.extend"></a>
##Collection.extend(prototype, statics)
Extend collection prototype or class.

**Params**

- prototype `Object`  
- statics `Object`  

**Returns**: `Collection`  
<a name="module_mio.Collection.url"></a>
##Collection.url([method])
Returns map of HTTP methods to collection URLs. If `method` is specified, the
URL for that `method` is returned.

**Params**

- \[method\] `String`  

**Returns**: `Object` | `String`  
<a name="module_mio.Collection#at"></a>
##collection.at(index)
Returns resource at given `index`.

**Params**

- index `Number`  

**Returns**: `Resource`  
<a name="module_mio.Collection#toJSON"></a>
##collection.toJSON()
Returns array of resources in collection.

**Returns**: `Array.<Resource>`  

<a name="new_module_mio.Query"></a>
#new mio.Query(context, handler)

  Compose queries functionally.

**Params**

- context `Object` - context to execute `handler` with  
- handler `function` - method to execute for Query#exec  

**Returns**: `Query`  
**Example**  
```javascript
User.Collection.get()
 .where({ active: true })
 .sort({ created_at: "desc" })
 .size(10)
 .exec(function(err, users) {
   // ...
 });
```


  <a name="new_module_mio.Query"></a>
##new mio.Query(context, handler)
Compose queries functionally.

**Params**

- context `Object` - context to execute `handler` with  
- handler `function` - method to execute for Query#exec  

**Returns**: `Query`  
**Example**  
```javascript
User.Collection.get()
 .where({ active: true })
 .sort({ created_at: "desc" })
 .size(10)
 .exec(function(err, users) {
   // ...
 });
```

<a name="module_mio.Query#where"></a>
##query.where(where)
Set `query.where` parameters.

**Params**

- where `Object`  

**Returns**: `Query`  
<a name="module_mio.Query#sort"></a>
##query.sort(sort)
Set `query.sort` parameters.

**Params**

- sort `Object`  

**Returns**: `Query`  
<a name="module_mio.Query#paginate"></a>
##query.paginate(paginate)
Set `query.paginate` parameters.

**Params**

- paginate `Object`  
  - \[from\] `Number`  
  - \[size\] `Number`  

**Returns**: `Query`  
<a name="module_mio.Query#from"></a>
##query.from(from)
Set `query.from` parameter.

**Params**

- from `Mixed` - treated as an offset if number  

**Returns**: `Query`  
<a name="module_mio.Query#size"></a>
##query.size(size)
Set `query.size` parameter.

**Params**

- size `Number`  

**Returns**: `Query`  
<a name="module_mio.Query#page"></a>
##query.page(page)
Set `query.page` parameter. Must be used after `query.size` is set.

**Params**

- page `Number` - first page is 1  

**Returns**: `Query`  
<a name="module_mio.Query#withRelated"></a>
##query.withRelated(relations)
Set `query.withRelated` parameter.

**Params**

- relations `String` | `Array.<String>`  

**Returns**: `Query`  
<a name="module_mio.Query#exec"></a>
##query.exec(callback)
Execute query.

**Params**

- callback `function`  

<a name="module_mio.Query#toJSON"></a>
##query.toJSON()
Return query object.

**Returns**: [query](#query)  

<a name="new_module_mio.Resource"></a>
#new mio.Resource(values)

  Values set using the constructor are not marked as dirty. Use `.set()`
after instantiation for hydration of dirty attributes.

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
Values set using the constructor are not marked as dirty. Use `.set()`
after instantiation for hydration of dirty attributes.

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
such as [module:mio.Resource.findOne](module:mio.Resource.findOne) or
[module:mio.Resource#save](module:mio.Resource#save), are asynchronous, and run in series.
Hooks receive a `next` function as the last argument, which must be called
to continue firing subsequent listeners. Subsequent hooks will not be run
if `next` receives any arguments. Arguments received by `next` are passed to
the callback of the method that fired the event.

**Params**

- event `String`  
- hook `function`  

<a name="module_mio.Resource.trigger"></a>
##Resource.trigger(event, args, callback)
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

**Returns**: `Resource`  
<a name="module_mio.Resource.get"></a>
##Resource.get(query, callback)
Get a resource with given `query`.

If `query` is a non-object it's transformed into `{ where: query }`.

**Params**

- query <code>[query](#query)</code>  
- callback <code>[getCallback](#getCallback)</code>  

**Fires**

- [before:get](#before_get)
- [get](#event_get)

**Returns**: `Resource`  
**Example**  
```javascript
User.get(123, function (err, user) {
  // ...
});
```

<a name="module_mio.Resource.put"></a>
##Resource.put(query, representation, callback)
Replace or create resource using given `query` and `representation`.

**Params**

- query <code>[query](#query)</code>  
- representation `Object`  
- callback <code>[putCallback](#putCallback)</code>  

**Fires**

- [before:put](#before_put)
- [put](#event_put)

**Returns**: `Resource`  
<a name="module_mio.Resource.patch"></a>
##Resource.patch(query, changes, callback)
Patch resource using given `query` and corresponding set of `changes`.

To patch multiple resources use `Resource.Collection.patch`.

**Params**

- query <code>[query](#query)</code>  
- changes `Object` | `Array`  
- callback <code>[patchCallback](#patchCallback)</code>  

**Fires**

- [before:patch](#before_patch)
- [patch](#event_patch)

**Returns**: `Resource`  
**Example**  
```javascript
User.patch({ active: true }, { active: false }, function(err) {
  // ...
});
```

<a name="module_mio.Resource.post"></a>
##Resource.post(representation, callback)
Post resource using given `representation`.

To post multiple resources use `Resource.Collection.post`.

**Params**

- representation `Object`  
- callback <code>[postCallback](#postCallback)</code>  

**Fires**

- [before:post](#before_post)
- [post](#event_post)

**Returns**: `Resource`  
<a name="module_mio.Resource.delete"></a>
##Resource.delete(query, callback)
Delete resource using given `query`.

To delete multiple resources use `Resource.Collection.delete`.

**Params**

- query <code>[query](#query)</code>  
- callback <code>[deleteCallback](#deleteCallback)</code>  

**Fires**

- [before:delete](#before_delete)
- [delete](#event_delete)

**Returns**: `Resource`  
<a name="module_mio.Resource#get"></a>
##resource.get(callback)
Refresh the resource instance with the representation passed to the last
hook's `next`.

**Params**

- callback <code>[getCallback](#getCallback)</code>  

**Fires**

- [before:get](#before_get)
- [get](#event_get)

**Returns**: `Resource`  
<a name="module_mio.Resource#put"></a>
##resource.put(callback)
Replace resource with instance representation.

**Params**

- callback <code>[putCallback](#putCallback)</code>  

**Fires**

- [before:put](#before_put)
- [put](#event_put)

**Returns**: `Resource`  
<a name="module_mio.Resource#patch"></a>
##resource.patch(callback)
Patch resource with diff of instance representation.

**Params**

- callback <code>[patchCallback](#patchCallback)</code>  

**Fires**

- [before:patch](#before_patch)
- [patch](#event_patch)

**Returns**: `Resource`  
<a name="module_mio.Resource#post"></a>
##resource.post(callback)
Post resource and update instance.

**Params**

- callback <code>[postCallback](#postCallback)</code>  

**Fires**

- [before:post](#before_post)
- [post](#event_post)

**Returns**: `Resource`  
<a name="module_mio.Resource#delete"></a>
##resource.delete(callback)
Delete resource.

**Params**

- callback <code>[deleteCallback](#deleteCallback)</code>  

**Fires**

- [before:delete](#before_delete)
- [delete](#event_delete)

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
Return dirty attributes (changed since last put/patch/post/reset).

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
Reset attributes for resource. Marks resource as clean. Instance attributes
not defined in `attributes` will be reset to `undefined`.

**Params**

- attributes `Object`  

**Fires**

- [reset](#event_reset)

**Returns**: `Resource`  
<a name="module_mio.Resource.url"></a>
##Resource.url([method])
Returns map of HTTP methods to resource URLs. If `method` is specified, the
URL for that `method` is returned.

**Params**

- \[method\] `String`  

**Returns**: `Object` | `String`  



<a name="event_change"></a>
#event: "change"
Fired whenever a resource attribute is changed.

**Params**

- resource `Resource`  
- name `String` - name of the attribute  
- value `Mixed`  
- prev `Mixed`  


<a name="before_get"></a>
#event: "before:get"
Runs before callback for `Resource.get` or `Resource#get`.


<a name="before_put"></a>
#event: "before:put"
Runs before callback for `Resource.put` or `Resource#put`.


<a name="before_patch"></a>
#event: "before:patch"
Runs before callback for `Resource.patch` or `Resource#patch`.


<a name="before_post"></a>
#event: "before:post"
Runs before callback for `Resource.patch` or `Resource#patch`.


<a name="before_delete"></a>
#event: "before:delete"
Runs before callback for `Resource.delete` or `Resource#delete`.


<a name="event_get"></a>
#event: "get"
Runs at the beginning of callback for `Resource.get` or `Resource#get`.


<a name="event_put"></a>
#event: "put"
Runs at the beginning of callback for `Resource.put` or `Resource#put`.


<a name="event_patch"></a>
#event: "patch"
Runs at the beginning of callback for `Resource.patch` or `Resource#patch`.


<a name="event_post"></a>
#event: "post"
Runs at the beginning of callback for `Resource.post` or `Resource#post`.


<a name="event_delete"></a>
#event: "delete"
Runs at the beginning of callback for `Resource.delete` or `Resource#delete`.


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




<a name="query"></a>
#type: query
**Properties**

- where `Object`  
- sort `Object`  
- from `Mixed`  
- size `Number`  
- withRelated `String` | `Array.<String>`  

**Type**: `Object`  

<a name="getCallback"></a>
#callback: getCallback
Receives arguments passed from the last hook's `next`.

**Params**

- err `Error`  

**Type**: `function`  

<a name="putCallback"></a>
#callback: putCallback
Receives arguments passed from the last hook's `next`.

**Params**

- err `Error`  

**Type**: `function`  

<a name="patchCallback"></a>
#callback: patchCallback
Receives arguments passed from the last hook's `next`.

**Params**

- err `Error`  

**Type**: `function`  

<a name="postCallback"></a>
#callback: postCallback
Receives arguments passed from the last hook's `next`.

**Params**

- err `Error`  

**Type**: `function`  

<a name="deleteCallback"></a>
#callback: deleteCallback
Receives arguments passed from the last hook's `next`.

**Params**

- err `Error`  

**Type**: `function`  

<a name="plugin"></a>
#callback: plugin
**Params**

- Resource `Resource`  

**Type**: `function`  


