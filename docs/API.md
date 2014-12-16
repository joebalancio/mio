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
  * [Resource.Query#where(where)](#module_mio.Resource.Query#where)
  * [Resource.Query#sort(sort)](#module_mio.Resource.Query#sort)
  * [Resource.Query#paginate(paginate)](#module_mio.Resource.Query#paginate)
  * [Resource.Query#from(from)](#module_mio.Resource.Query#from)
  * [Resource.Query#size(size)](#module_mio.Resource.Query#size)
  * [Resource.Query#page(page)](#module_mio.Resource.Query#page)
  * [Resource.Query#withRelated(relations)](#module_mio.Resource.Query#withRelated)
  * [Resource.Query#exec(callback)](#module_mio.Resource.Query#exec)
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
## Events

* [event: "change"](#event_change)
* [event: "initialize"](#event_initialize)
* [event: "change:[attr]"](#change_[attr])
* [event: "create"](#event_create)
* [event: "attribute"](#event_attribute)
* [event: "set"](#event_set)
* [event: "reset"](#event_reset)


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
<a name="module_mio.Resource.Query#withRelated"></a>
##Resource.Query#withRelated(relations)
Set `query.withRelated` parameter.

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
Get a resource with given `id` or `query`.

**Params**

- query `Number` | `Object`  
- callback `getCallback`  

**Fires**

- [before:get](before:get)
- [event:get](event:get)

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

- query `Object`  
- representation `Object`  
- callback `putCallback`  

**Fires**

- [before:put](before:put)
- [event:put](event:put)

**Returns**: `Resource`  
<a name="module_mio.Resource.patch"></a>
##Resource.patch(query, changes, callback)
Patch resource using given `query` and corresponding set of `changes`.

**Params**

- query `Object`  
- changes `Object` | `Array`  
- callback `patchCallback`  

**Fires**

- [before:patch](before:patch)
- [event:patch](event:patch)

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

**Params**

- representation `Object`  
- callback `postCallback`  

**Fires**

- [before:post](before:post)
- [event:post](event:post)

**Returns**: `Resource`  
<a name="module_mio.Resource.delete"></a>
##Resource.delete(query, callback)
Delete resource using given `query`.

**Params**

- query `Object`  
- callback `deleteCallback`  

**Fires**

- [before:delete](before:delete)
- [event:delete](event:delete)

**Returns**: `Resource`  
<a name="module_mio.Resource#get"></a>
##resource.get(callback)
Refresh the resource instance.

**Params**

- callback `getCallback`  

**Fires**

- [before:get](before:get)
- [event:get](event:get)

**Returns**: `Resource`  
<a name="module_mio.Resource#put"></a>
##resource.put(callback)
Replace resource with instance representation.

**Params**

- callback `putCallback`  

**Fires**

- [before:put](before:put)
- [event:put](event:put)

**Returns**: `Resource`  
<a name="module_mio.Resource#patch"></a>
##resource.patch(callback)
Patch resource with diff of instance representation.

**Params**

- callback `patchCallback`  

**Fires**

- [before:patch](before:patch)
- [event:patch](event:patch)

**Returns**: `Resource`  
<a name="module_mio.Resource#post"></a>
##resource.post(callback)
Post resource and update instance.

**Params**

- callback `postCallback`  

**Fires**

- [before:post](before:post)
- [event:post](event:post)

**Returns**: `Resource`  
<a name="module_mio.Resource#delete"></a>
##resource.delete(callback)
Delete resource.

**Params**

- callback `deleteCallback`  

**Fires**

- [before:delete](before:delete)
- [event:delete](event:delete)

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




<a name="plugin"></a>
#callback: plugin
**Params**

- Resource `Resource`  

**Type**: `function`  


