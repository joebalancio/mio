# API


* [mio](#module_mio)
  * [class: .Resource](#module_mio.Resource)
    * [new Resource(values)](#new_module_mio.Resource_new)
    * _instance_
      * [.get(callback)](#module_mio.Resource#get) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.put(callback)](#module_mio.Resource#put) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.patch(callback)](#module_mio.Resource#patch) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.post(callback)](#module_mio.Resource#post) ⇒ <code>resource</code>
      * [.delete(callback)](#module_mio.Resource#delete) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.isNew()](#module_mio.Resource#isNew) ⇒ <code>Boolean</code>
      * [.isDirty(attr)](#module_mio.Resource#isDirty) ⇒ <code>Boolean</code>
      * [.changed()](#module_mio.Resource#changed) ⇒ <code>Object</code>
      * [.has(attr)](#module_mio.Resource#has) ⇒ <code>Boolean</code>
      * [.set(attributes)](#module_mio.Resource#set) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.reset(attributes)](#module_mio.Resource#reset) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.url([method])](#module_mio.Resource#url) ⇒ <code>Object</code> \| <code>String</code>
    * _static_
      * [.hook](#module_mio.Resource.hook)
        * ["get" (query, next, resource)](#module_mio.Resource.hook.event_get)
        * ["put" (query, representationresentation, next, resource)](#module_mio.Resource.hook.event_put)
        * ["patch" (query, patch, next, resource)](#module_mio.Resource.hook.event_patch)
        * ["post" (query, representation, next, resource)](#module_mio.Resource.hook.event_post)
        * ["delete" (query, next, resource)](#module_mio.Resource.hook.event_delete)
        * ["collection:get" (query, next, collection)](#module_mio.Resource.hook.collection_get)
        * ["collection:put" (query, resources, next, collection)](#module_mio.Resource.hook.collection_put)
        * ["collection:patch" (query, patch, next, collection)](#module_mio.Resource.hook.collection_patch)
        * ["collection:post" (query, resources, next, collection)](#module_mio.Resource.hook.collection_post)
        * ["collection:delete" (query, next, collection)](#module_mio.Resource.hook.collection_delete)
      * [.extend(prototype, [statics], baseUrl)](#module_mio.Resource.extend) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.attr(name, [options])](#module_mio.Resource.attr) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.use(plugin)](#module_mio.Resource.use) ⇒ <code>[Resource](#module_mio.Resource)</code>
        * [callback: .plugin](#module_mio.Resource.use.plugin) → <code>function</code>
      * [.browser(plugin)](#module_mio.Resource.browser) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.server(plugin)](#module_mio.Resource.server) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.create(attributes)](#module_mio.Resource.create) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.get(query, callback)](#module_mio.Resource.get) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
        * [callback: .get](#module_mio.Resource.get.get) → <code>function</code>
      * [.put(query, representation, callback)](#module_mio.Resource.put) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
        * [callback: .put](#module_mio.Resource.put.put) → <code>function</code>
      * [.patch(query, changes, callback)](#module_mio.Resource.patch) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
        * [callback: .patch](#module_mio.Resource.patch.patch) → <code>function</code>
      * [.post(representation, callback)](#module_mio.Resource.post) ⇒ <code>[Resource](#module_mio.Resource)</code>
        * [callback: .post](#module_mio.Resource.post.post) → <code>function</code>
      * [.delete(query, callback)](#module_mio.Resource.delete) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[query](#query)</code>
        * [callback: .delete](#module_mio.Resource.delete.delete) → <code>function</code>
      * [.belongsTo(attr, params)](#module_mio.Resource.belongsTo) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.hasOne(attr, params)](#module_mio.Resource.hasOne) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.hasMany(attr, params)](#module_mio.Resource.hasMany) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.on(event, listener)](#module_mio.Resource.on) ⇒ <code>[Resource](#module_mio.Resource)</code>
        * ["initialize" (resource, values)](#module_mio.Resource.on.event_initialize)
        * ["change" (resource, name, value, prev)](#module_mio.Resource.on.event_change)
        * ["change:[attr]" (resource, value, prev)](#module_mio.Resource.on.change_[attr])
        * ["create" (resource)](#module_mio.Resource.on.event_create)
        * ["attribute" (name, options)](#module_mio.Resource.on.event_attribute)
        * ["get" (query, resource)](#module_mio.Resource.on.event_get)
        * ["put" (query, representationresentation, resource)](#module_mio.Resource.on.event_put)
        * ["patch" (query, patch, resource)](#module_mio.Resource.on.event_patch)
        * ["post" (query, representation, resource)](#module_mio.Resource.on.event_post)
        * ["delete" (query, resource)](#module_mio.Resource.on.event_delete)
        * ["set" (resource, attributes)](#module_mio.Resource.on.event_set)
        * ["reset" (resource, attributes)](#module_mio.Resource.on.event_reset)
        * ["collection:get" (query, collection)](#module_mio.Resource.on.collection_get)
        * ["collection:put" (query, resources, collection)](#module_mio.Resource.on.collection_put)
        * ["collection:patch" (query, patch, collection)](#module_mio.Resource.on.collection_patch)
        * ["collection:post" (query, resources, collection)](#module_mio.Resource.on.collection_post)
        * ["collection:delete" (query, collection)](#module_mio.Resource.on.collection_delete)
      * [.once(event, listener)](#module_mio.Resource.once) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.emit(event, ...)](#module_mio.Resource.emit) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.trigger(event, args, callback)](#module_mio.Resource.trigger) ⇒ <code>[Resource](#module_mio.Resource)</code>
        * [callback: .next](#module_mio.Resource.trigger.next) → <code>function</code>
      * [.url([method])](#module_mio.Resource.url) ⇒ <code>Object</code> \| <code>String</code>
  * [class: .Query](#module_mio.Query)
    * [new Query(settings)](#new_module_mio.Query_new)
  * [class: .Resource.Collection](#module_mio.Resource.Collection)
    * [new Collection(resources, [options])](#new_module_mio.Resource.Collection_new)
    * _instance_
      * [.length](#module_mio.Resource.Collection#length) → <code>Number</code>
      * [.from](#module_mio.Resource.Collection#from) → <code>Number</code>
      * [.size](#module_mio.Resource.Collection#size) → <code>Number</code>
      * [.total](#module_mio.Resource.Collection#total) → <code>Number</code>
      * [.toArray](#module_mio.Resource.Collection#toArray) ⇒ <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code>
      * [.get(callback)](#module_mio.Resource.Collection#get) ⇒ <code>module:mio.Collection</code>
      * [.put(callback)](#module_mio.Resource.Collection#put) ⇒ <code>module:mio.Collection</code>
      * [.patch(callback)](#module_mio.Resource.Collection#patch) ⇒ <code>module:mio.Collection</code>
      * [.post(callback)](#module_mio.Resource.Collection#post) ⇒ <code>module:mio.Collection</code>
      * [.delete(callback)](#module_mio.Resource.Collection#delete) ⇒ <code>module:mio.Collection</code>
      * [.reset(resources)](#module_mio.Resource.Collection#reset) ⇒ <code>module:mio.Collection</code>
      * [.url([method])](#module_mio.Resource.Collection#url) ⇒ <code>Object</code> \| <code>String</code>
      * [.at(index)](#module_mio.Resource.Collection#at) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [.nextPage(number)](#module_mio.Resource.Collection#nextPage) ⇒ <code>[Query](#module_mio.Query)</code>
      * [.page(page)](#module_mio.Resource.Collection#page) ⇒ <code>[Query](#module_mio.Query)</code>
      * [.toJSON()](#module_mio.Resource.Collection#toJSON) ⇒ <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code>
      * [.[ArrayMethod]()](#module_mio.Resource.Collection#[ArrayMethod])
    * _static_
      * [.create(resources)](#module_mio.Resource.Collection.create) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
      * [.extend(prototype, statics)](#module_mio.Resource.Collection.extend) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
      * [.get(query, callback)](#module_mio.Resource.Collection.get) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
      * [.put(query, representation, callback)](#module_mio.Resource.Collection.put) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
      * [.patch(query, changes, callback)](#module_mio.Resource.Collection.patch) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
      * [.post(representations, callback)](#module_mio.Resource.Collection.post) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
      * [.delete(query, callback)](#module_mio.Resource.Collection.delete) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
      * [.url([method])](#module_mio.Resource.Collection.url) ⇒ <code>Object</code> \| <code>String</code>

<a name="module_mio.Resource"></a>
###class: mio.Resource
**Emits**: <code>[initialize](#module_mio.Resource.on.event_initialize)</code>, <code>[create](#module_mio.Resource.on.event_create)</code>  

* [class: .Resource](#module_mio.Resource)
  * [new Resource(values)](#new_module_mio.Resource_new)
  * _instance_
    * [.get(callback)](#module_mio.Resource#get) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.put(callback)](#module_mio.Resource#put) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.patch(callback)](#module_mio.Resource#patch) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.post(callback)](#module_mio.Resource#post) ⇒ <code>resource</code>
    * [.delete(callback)](#module_mio.Resource#delete) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.isNew()](#module_mio.Resource#isNew) ⇒ <code>Boolean</code>
    * [.isDirty(attr)](#module_mio.Resource#isDirty) ⇒ <code>Boolean</code>
    * [.changed()](#module_mio.Resource#changed) ⇒ <code>Object</code>
    * [.has(attr)](#module_mio.Resource#has) ⇒ <code>Boolean</code>
    * [.set(attributes)](#module_mio.Resource#set) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.reset(attributes)](#module_mio.Resource#reset) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.url([method])](#module_mio.Resource#url) ⇒ <code>Object</code> \| <code>String</code>
  * _static_
    * [.hook](#module_mio.Resource.hook)
      * ["get" (query, next, resource)](#module_mio.Resource.hook.event_get)
      * ["put" (query, representationresentation, next, resource)](#module_mio.Resource.hook.event_put)
      * ["patch" (query, patch, next, resource)](#module_mio.Resource.hook.event_patch)
      * ["post" (query, representation, next, resource)](#module_mio.Resource.hook.event_post)
      * ["delete" (query, next, resource)](#module_mio.Resource.hook.event_delete)
      * ["collection:get" (query, next, collection)](#module_mio.Resource.hook.collection_get)
      * ["collection:put" (query, resources, next, collection)](#module_mio.Resource.hook.collection_put)
      * ["collection:patch" (query, patch, next, collection)](#module_mio.Resource.hook.collection_patch)
      * ["collection:post" (query, resources, next, collection)](#module_mio.Resource.hook.collection_post)
      * ["collection:delete" (query, next, collection)](#module_mio.Resource.hook.collection_delete)
    * [.extend(prototype, [statics], baseUrl)](#module_mio.Resource.extend) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.attr(name, [options])](#module_mio.Resource.attr) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.use(plugin)](#module_mio.Resource.use) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [callback: .plugin](#module_mio.Resource.use.plugin) → <code>function</code>
    * [.browser(plugin)](#module_mio.Resource.browser) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.server(plugin)](#module_mio.Resource.server) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.create(attributes)](#module_mio.Resource.create) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.get(query, callback)](#module_mio.Resource.get) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
      * [callback: .get](#module_mio.Resource.get.get) → <code>function</code>
    * [.put(query, representation, callback)](#module_mio.Resource.put) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
      * [callback: .put](#module_mio.Resource.put.put) → <code>function</code>
    * [.patch(query, changes, callback)](#module_mio.Resource.patch) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
      * [callback: .patch](#module_mio.Resource.patch.patch) → <code>function</code>
    * [.post(representation, callback)](#module_mio.Resource.post) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [callback: .post](#module_mio.Resource.post.post) → <code>function</code>
    * [.delete(query, callback)](#module_mio.Resource.delete) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[query](#query)</code>
      * [callback: .delete](#module_mio.Resource.delete.delete) → <code>function</code>
    * [.belongsTo(attr, params)](#module_mio.Resource.belongsTo) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.hasOne(attr, params)](#module_mio.Resource.hasOne) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.hasMany(attr, params)](#module_mio.Resource.hasMany) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.on(event, listener)](#module_mio.Resource.on) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * ["initialize" (resource, values)](#module_mio.Resource.on.event_initialize)
      * ["change" (resource, name, value, prev)](#module_mio.Resource.on.event_change)
      * ["change:[attr]" (resource, value, prev)](#module_mio.Resource.on.change_[attr])
      * ["create" (resource)](#module_mio.Resource.on.event_create)
      * ["attribute" (name, options)](#module_mio.Resource.on.event_attribute)
      * ["get" (query, resource)](#module_mio.Resource.on.event_get)
      * ["put" (query, representationresentation, resource)](#module_mio.Resource.on.event_put)
      * ["patch" (query, patch, resource)](#module_mio.Resource.on.event_patch)
      * ["post" (query, representation, resource)](#module_mio.Resource.on.event_post)
      * ["delete" (query, resource)](#module_mio.Resource.on.event_delete)
      * ["set" (resource, attributes)](#module_mio.Resource.on.event_set)
      * ["reset" (resource, attributes)](#module_mio.Resource.on.event_reset)
      * ["collection:get" (query, collection)](#module_mio.Resource.on.collection_get)
      * ["collection:put" (query, resources, collection)](#module_mio.Resource.on.collection_put)
      * ["collection:patch" (query, patch, collection)](#module_mio.Resource.on.collection_patch)
      * ["collection:post" (query, resources, collection)](#module_mio.Resource.on.collection_post)
      * ["collection:delete" (query, collection)](#module_mio.Resource.on.collection_delete)
    * [.once(event, listener)](#module_mio.Resource.once) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.emit(event, ...)](#module_mio.Resource.emit) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.trigger(event, args, callback)](#module_mio.Resource.trigger) ⇒ <code>[Resource](#module_mio.Resource)</code>
      * [callback: .next](#module_mio.Resource.trigger.next) → <code>function</code>
    * [.url([method])](#module_mio.Resource.url) ⇒ <code>Object</code> \| <code>String</code>

<a name="new_module_mio.Resource_new"></a>
####new Resource(values)
Values set using the constructor are not marked as dirty. Use `.set()`
after instantiation for hydration of dirty attributes.

| Param | Type | Description |
| ----- | ---- | ----------- |
| values | <code>Object</code> | optional |

**Example**  
```javascript
var user = new User({ name: "alex" });
```
<a name="module_mio.Resource#get"></a>
####resource.get(callback) ⇒ <code>[Resource](#module_mio.Resource)</code>
Refresh the resource instance with the representation passed to the last
hook's `next()`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[get](#module_mio.Resource.get.get)</code> |  |

**Emits**: <code>[get](#module_mio.Resource.hook.event_get)</code>, <code>[get](#module_mio.Resource.on.event_get)</code>  
<a name="module_mio.Resource#put"></a>
####resource.put(callback) ⇒ <code>[Resource](#module_mio.Resource)</code>
Replace resource with instance representation.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[put](#module_mio.Resource.put.put)</code> |  |

**Emits**: <code>[put](#module_mio.Resource.hook.event_put)</code>, <code>[put](#module_mio.Resource.on.event_put)</code>  
<a name="module_mio.Resource#patch"></a>
####resource.patch(callback) ⇒ <code>[Resource](#module_mio.Resource)</code>
Patch resource with diff of instance representation.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[patch](#module_mio.Resource.patch.patch)</code> |  |

**Emits**: <code>[patch](#module_mio.Resource.hook.event_patch)</code>, <code>[patch](#module_mio.Resource.on.event_patch)</code>  
<a name="module_mio.Resource#post"></a>
####resource.post(callback) ⇒ <code>resource</code>
Post resource and update instance.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>postCallback</code> |  |

**Emits**: <code>[post](#module_mio.Resource.hook.event_post)</code>, <code>[post](#module_mio.Resource.on.event_post)</code>  
<a name="module_mio.Resource#delete"></a>
####resource.delete(callback) ⇒ <code>[Resource](#module_mio.Resource)</code>
Delete resource.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[delete](#module_mio.Resource.delete.delete)</code> |  |

**Emits**: <code>[delete](#module_mio.Resource.hook.event_delete)</code>, <code>[delete](#module_mio.Resource.on.event_delete)</code>  
<a name="module_mio.Resource#isNew"></a>
####resource.isNew() ⇒ <code>Boolean</code>
Check if resource is new and has not been saved.

<a name="module_mio.Resource#isDirty"></a>
####resource.isDirty(attr) ⇒ <code>Boolean</code>
Check if resource is dirty (has any changed attributes).
If an attribute name is specified, check if that attribute is dirty.

| Param | Type | Description |
| ----- | ---- | ----------- |
| attr | <code>String</code> | optional attribute to check if dirty |

<a name="module_mio.Resource#changed"></a>
####resource.changed() ⇒ <code>Object</code>
Return dirty attributes (changed since last put/patch/post/reset).

<a name="module_mio.Resource#has"></a>
####resource.has(attr) ⇒ <code>Boolean</code>
Check if resource has given `attr`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| attr | <code>String</code> |  |

<a name="module_mio.Resource#set"></a>
####resource.set(attributes) ⇒ <code>[Resource](#module_mio.Resource)</code>
Set given resource `attributes`.

Alternatively, set a key-value pair.

| Param | Type | Description |
| ----- | ---- | ----------- |
| attributes | <code>Object</code> |  |

**Emits**: <code>[set](#module_mio.Resource.on.event_set)</code>  
<a name="module_mio.Resource#reset"></a>
####resource.reset(attributes) ⇒ <code>[Resource](#module_mio.Resource)</code>
Reset attributes for resource. Marks resource as clean. Instance attributes
not defined in `attributes` will be reset to `undefined`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| attributes | <code>Object</code> |  |

**Emits**: <code>[reset](#module_mio.Resource.on.event_reset)</code>  
<a name="module_mio.Resource#url"></a>
####resource.url([method]) ⇒ <code>Object</code> \| <code>String</code>
Returns map of HTTP methods to resource URLs. If `method` is specified, the
URL for that `method` is returned.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[method\] | <code>String</code> |  |

<a name="module_mio.Resource.hook"></a>
####Resource.hook
Register `hook` to be called before `event`.

Hooks are [triggered](#module_mio.Resource.trigger) by various methods
such as [get](#module_mio.Resource.get) or
[post](#module_mio.Resource#post), are asynchronous, and run in series.
Hooks receive a `next` function as the last argument, which must be called
to continue firing subsequent listeners. Subsequent hooks will not be run
if `next` receives any arguments. Arguments received by `next` are passed to
the callback of the method that fired the event.

| Param | Type | Description |
| ----- | ---- | ----------- |
| event | <code>String</code> |  |
| hook | <code>function</code> |  |

**Example**  
```javascript
User.hook('get', function (query, next) {
  // do something before save such as validation and then call next()
});
```

* [.hook](#module_mio.Resource.hook)
  * ["get" (query, next, resource)](#module_mio.Resource.hook.event_get)
  * ["put" (query, representationresentation, next, resource)](#module_mio.Resource.hook.event_put)
  * ["patch" (query, patch, next, resource)](#module_mio.Resource.hook.event_patch)
  * ["post" (query, representation, next, resource)](#module_mio.Resource.hook.event_post)
  * ["delete" (query, next, resource)](#module_mio.Resource.hook.event_delete)
  * ["collection:get" (query, next, collection)](#module_mio.Resource.hook.collection_get)
  * ["collection:put" (query, resources, next, collection)](#module_mio.Resource.hook.collection_put)
  * ["collection:patch" (query, patch, next, collection)](#module_mio.Resource.hook.collection_patch)
  * ["collection:post" (query, resources, next, collection)](#module_mio.Resource.hook.collection_post)
  * ["collection:delete" (query, next, collection)](#module_mio.Resource.hook.collection_delete)

<a name="module_mio.Resource.hook.event_get"></a>
#####event: "get" (query, next, resource)
Runs before callback for `Resource.get` or `Resource#get`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.event_put"></a>
#####event: "put" (query, representationresentation, next, resource)
Runs before callback for `Resource.put` or `Resource#put`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| representationresentation | <code>Object</code> \| <code>[Resource](#module_mio.Resource)</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.event_patch"></a>
#####event: "patch" (query, patch, next, resource)
Runs before callback for `Resource.patch` or `Resource#patch`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| patch | <code>Object</code> \| <code>Array.&lt;Object&gt;</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.event_post"></a>
#####event: "post" (query, representation, next, resource)
Runs before callback for `Resource.post` or `Resource#post`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| representation | <code>Object</code> \| <code>[Resource](#module_mio.Resource)</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.event_delete"></a>
#####event: "delete" (query, next, resource)
Runs before callback for `Resource.delete` or `Resource#delete`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.collection_get"></a>
#####event: "collection:get" (query, next, collection)
Runs before callback for `Resource.Collection.get`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.collection_put"></a>
#####event: "collection:put" (query, resources, next, collection)
Runs before callback for `Resource.Collection.put`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| resources | <code>Array.&lt;(Object\|module:mio.Resource)&gt;</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.collection_patch"></a>
#####event: "collection:patch" (query, patch, next, collection)
Runs before callback for `Resource.Collection.patch`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| patch | <code>Object</code> \| <code>Array.&lt;Object&gt;</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.collection_post"></a>
#####event: "collection:post" (query, resources, next, collection)
Runs before callback for `Resource.Collection.post`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| resources | <code>Array.&lt;Object&gt;</code> \| <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.hook.collection_delete"></a>
#####event: "collection:delete" (query, next, collection)
Runs before callback for `Resource.Collection.delete`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| next | <code>[next](#module_mio.Resource.trigger.next)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.extend"></a>
####Resource.extend(prototype, [statics], baseUrl) ⇒ <code>[Resource](#module_mio.Resource)</code>
Extend `Resource` attributes and prototype or class properties.

| Param | Type | Description |
| ----- | ---- | ----------- |
| prototype | <code>Object</code> | extend resource prototype |
| prototype.attributes | <code>Object</code> | attribute definitions passed to [Resource.attr](Resource.attr) |
| \[statics\] | <code>Object</code> | extend resource with static properties or methods |
| baseUrl | <code>String</code> | used by [Resource#url](Resource#url) to construct URLs |
| \[statics.use\] | <code>Array</code> | array of plugins passed to [Resource.use](Resource.use) |
| \[statics.browser\] | <code>Array</code> | array of browser plugins to use |
| \[statics.server\] | <code>Array</code> | array of server plugins to use |

**Example**  
```javascript
var User = mio.Resource.extend({
  attributes: {
    id: { primary: true }
  },
}, {
  baseUrl: '/users'
});
```
<a name="module_mio.Resource.attr"></a>
####Resource.attr(name, [options]) ⇒ <code>[Resource](#module_mio.Resource)</code>
Define a resource attribute with the given `name` and `options`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| name | <code>String</code> |  |
| \[options\] | <code>Object</code> |  |
| \[options.default\] | <code>Mixed</code> | default value or function that returns value |
| \[options.enumerable\] | <code>Boolean</code> | attribute is enumerable (default: true) |
| \[options.serializable\] | <code>Boolean</code> | include in JSON (default: true) |
| \[options.get\] | <code>function</code> | accessor function |
| \[options.primary\] | <code>Boolean</code> | use attribute as primary key |

**Emits**: <code>[attribute](#module_mio.Resource.on.event_attribute)</code>  
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

Passing a non-object for `options` sets that value as the default:

```javascript
User.attr('created', function () {
  return new Date();
});
```
<a name="module_mio.Resource.use"></a>
####Resource.use(plugin) ⇒ <code>[Resource](#module_mio.Resource)</code>
Call the given `plugin` function with the Resource as both argument and
context.

| Param | Type | Description |
| ----- | ---- | ----------- |
| plugin | <code>[plugin](#module_mio.Resource.use.plugin)</code> |  |

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
<a name="module_mio.Resource.use.plugin"></a>
#####callback: use.plugin → <code>function</code>
Called with Resource as argument and context.

| Param | Type | Description |
| ----- | ---- | ----------- |
| Resource | <code>[Resource](#module_mio.Resource)</code> |  |

<a name="module_mio.Resource.browser"></a>
####Resource.browser(plugin) ⇒ <code>[Resource](#module_mio.Resource)</code>
Use given `plugin` only in browser.

| Param | Type | Description |
| ----- | ---- | ----------- |
| plugin | <code>[plugin](#module_mio.Resource.use.plugin)</code> |  |

<a name="module_mio.Resource.server"></a>
####Resource.server(plugin) ⇒ <code>[Resource](#module_mio.Resource)</code>
Use given `plugin` only in node.

| Param | Type | Description |
| ----- | ---- | ----------- |
| plugin | <code>[plugin](#module_mio.Resource.use.plugin)</code> |  |

<a name="module_mio.Resource.create"></a>
####Resource.create(attributes) ⇒ <code>[Resource](#module_mio.Resource)</code>
Create a new resource and hydrate with given `attributes`,
or if `attributes` is already a resource return it.

This is simply sugar for `new Resource(attributes)`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| attributes | <code>Object</code> |  |

<a name="module_mio.Resource.get"></a>
####Resource.get(query, callback) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
Get a resource with given `query`.

If `query` is a non-object (such as an ID) it's transformed into
`{ where: { primary: query } }`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| callback | <code>[get](#module_mio.Resource.get.get)</code> |  |

**Emits**: <code>[get](#module_mio.Resource.hook.event_get)</code>, <code>[get](#module_mio.Resource.on.event_get)</code>  
**Example**  
```javascript
User.get(123, function (err, user) {
  // ...
});
```
<a name="module_mio.Resource.get.get"></a>
#####callback: get.get → <code>function</code>
Receives arguments passed from the last hook's `next`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| err | <code>Error</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> |  |

<a name="module_mio.Resource.put"></a>
####Resource.put(query, representation, callback) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
Replace or create resource using given `query` and `representation`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| representation | <code>Object</code> |  |
| callback | <code>[put](#module_mio.Resource.put.put)</code> |  |

**Emits**: <code>[put](#module_mio.Resource.hook.event_put)</code>, <code>[put](#module_mio.Resource.on.event_put)</code>  
<a name="module_mio.Resource.put.put"></a>
#####callback: put.put → <code>function</code>
Receives arguments passed from the last hook's `next`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| err | <code>Error</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> |  |

<a name="module_mio.Resource.patch"></a>
####Resource.patch(query, changes, callback) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[Query](#module_mio.Query)</code>
Patch resource using given `query` and corresponding set of `changes`.

To patch multiple resources use `Resource.Collection.patch`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| changes | <code>Object</code> \| <code>Array</code> |  |
| callback | <code>[patch](#module_mio.Resource.patch.patch)</code> |  |

**Emits**: <code>[patch](#module_mio.Resource.hook.event_patch)</code>, <code>[patch](#module_mio.Resource.on.event_patch)</code>  
**Example**  
```javascript
User.patch({ active: true }, { active: false }, function(err) {
  // ...
});
```
<a name="module_mio.Resource.patch.patch"></a>
#####callback: patch.patch → <code>function</code>
Receives arguments passed from the last hook's `next`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| err | <code>Error</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> |  |

<a name="module_mio.Resource.post"></a>
####Resource.post(representation, callback) ⇒ <code>[Resource](#module_mio.Resource)</code>
Post resource using given `representation`.

To post multiple resources use `Resource.Collection.post`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| representation | <code>Object</code> |  |
| callback | <code>[post](#module_mio.Resource.post.post)</code> |  |

**Emits**: <code>[post](#module_mio.Resource.hook.event_post)</code>, <code>[post](#module_mio.Resource.on.event_post)</code>  
<a name="module_mio.Resource.post.post"></a>
#####callback: post.post → <code>function</code>
Receives arguments passed from the last hook's `next`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| err | <code>Error</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> |  |

<a name="module_mio.Resource.delete"></a>
####Resource.delete(query, callback) ⇒ <code>[Resource](#module_mio.Resource)</code> \| <code>[query](#query)</code>
Delete resource using given `query`.

To delete multiple resources use `Resource.Collection.delete`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| callback | <code>[delete](#module_mio.Resource.delete)</code> |  |

**Emits**: <code>[delete](#module_mio.Resource.hook.event_delete)</code>, <code>[delete](#module_mio.Resource.on.event_delete)</code>  
<a name="module_mio.Resource.delete.delete"></a>
#####callback: delete.delete → <code>function</code>
Receives arguments passed from the last hook's `next`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| err | <code>Error</code> |  |

<a name="module_mio.Resource.belongsTo"></a>
####Resource.belongsTo(attr, params) ⇒ <code>[Resource](#module_mio.Resource)</code>
The `belongsTo` relationship is used when a resource is a member of another
target resource. It can be used in a one-to-one association as the inverse of
`hasOne`, or in a one-to-many association as the inverse of a `hasMany`.
In both cases, the `belongsTo` relationship is referenced by a
foreign key on the current resource.

| Param | Type | Description |
| ----- | ---- | ----------- |
| attr | <code>String</code> | name of the attribute populated with target resource |
| params | <code>Object</code> | additional parameters passed to `.attr()` |
| params.target | <code>[Resource](#module_mio.Resource)</code> \| <code>function</code> | can be a function that returns constructor to avoid circular reference issues |
| params.foreignKey | <code>String</code> | foreign key on current resource. |
| params.nested | <code>Boolean</code> | whether to always include (default: false) |

**Example**  
```javascript
Book.belongsTo('author', {
  target: Author,
  foreignKey: 'author_id'
}):

Book.get(1).withRelated('author').exec(function (err, book) {
  assert(book.author instanceof Author);
});
```
<a name="module_mio.Resource.hasOne"></a>
####Resource.hasOne(attr, params) ⇒ <code>[Resource](#module_mio.Resource)</code>
A one-to-one relation, where the resource has exactly one of the specified
target resource, referenced by a foreign key on the target resource.

| Param | Type | Description |
| ----- | ---- | ----------- |
| attr | <code>String</code> | name of the attribute populated with target resource |
| params | <code>Object</code> | additional parameters passed to `.attr()` |
| params.target | <code>[Resource](#module_mio.Resource)</code> |  |
| params.foreignKey | <code>String</code> | foreign key on target resource. |
| params.nested | <code>Boolean</code> | whether to always include (default: false) |

**Example**  
```javascript
Patient.hasOne('record', {
  target: Record,
  foreignKey: 'patient_id'
});

Patent.get(1).withRelated('record').exec(function (err, patient) {
  assert(patient.record instanceof Record);
});
```
<a name="module_mio.Resource.hasMany"></a>
####Resource.hasMany(attr, params) ⇒ <code>[Resource](#module_mio.Resource)</code>
The `hasMany` relationship is for a resource with a one-to-many
relationship with the target resource. The resource is referenced by a
foreign key on the target resource.

```javascript
Organization.hasMany('members', {
  target: User,
  foreignKey: 'organization_id'
});

Organization.get(1).withRelated('members').exec(function (err, organization)
  organization.members.forEach(function (member) {
    assert(member instanceof User);
  });
});
```

Many-to-many relationships can be modeled using an intermediary resource,
where the current resource is joined to the target resources through an
intermediary resource.

```javascript
Membership
  .belongsTo('organization', {
    target: Organization,
    foreignKey: 'organization_id'
  })
  .belongsTo('user', {
    target: User,
    foreignKey: 'user_id'
  });

Organization.hasMany('memberships', {
  target: Membership,
  foreignKey: 'organization_id'
});

Organization.get(1)
  .withRelated('memberships'
  .exec(function (err, organization) {
    organization.memberships.forEach(function (member) {
      assert(membership.member instanceof User);
      assert(membership.organization instanceof Organization);
    });
  });
```

While this strategy may seem verbose, it is robust and allows for
relationships that keep state such as a membership role, or the date a post
was tagged. Sometimes you need both the intermediary resource and the
resources it relates, and other times you need solely the relationship
(intermediary resource).

| Param | Type | Description |
| ----- | ---- | ----------- |
| attr | <code>String</code> | name of the attribute populated with target resource |
| params | <code>Object</code> | additional parameters passed to `.attr()` |
| params.target | <code>[Resource](#module_mio.Resource)</code> \| <code>function</code> | can be a function that returns constructor to avoid circular reference issues |
| params.foreignKey | <code>String</code> | foreign key on target resource. |
| params.nested | <code>Boolean</code> | always include relation in queries (default: false) |

<a name="module_mio.Resource.on"></a>
####Resource.on(event, listener) ⇒ <code>[Resource](#module_mio.Resource)</code>
Register `listener` to be called when `event` is emitted.

| Param | Type | Description |
| ----- | ---- | ----------- |
| event | <code>String</code> |  |
| listener | <code>function</code> |  |


* [.on(event, listener)](#module_mio.Resource.on) ⇒ <code>[Resource](#module_mio.Resource)</code>
  * ["initialize" (resource, values)](#module_mio.Resource.on.event_initialize)
  * ["change" (resource, name, value, prev)](#module_mio.Resource.on.event_change)
  * ["change:[attr]" (resource, value, prev)](#module_mio.Resource.on.change_[attr])
  * ["create" (resource)](#module_mio.Resource.on.event_create)
  * ["attribute" (name, options)](#module_mio.Resource.on.event_attribute)
  * ["get" (query, resource)](#module_mio.Resource.on.event_get)
  * ["put" (query, representationresentation, resource)](#module_mio.Resource.on.event_put)
  * ["patch" (query, patch, resource)](#module_mio.Resource.on.event_patch)
  * ["post" (query, representation, resource)](#module_mio.Resource.on.event_post)
  * ["delete" (query, resource)](#module_mio.Resource.on.event_delete)
  * ["set" (resource, attributes)](#module_mio.Resource.on.event_set)
  * ["reset" (resource, attributes)](#module_mio.Resource.on.event_reset)
  * ["collection:get" (query, collection)](#module_mio.Resource.on.collection_get)
  * ["collection:put" (query, resources, collection)](#module_mio.Resource.on.collection_put)
  * ["collection:patch" (query, patch, collection)](#module_mio.Resource.on.collection_patch)
  * ["collection:post" (query, resources, collection)](#module_mio.Resource.on.collection_post)
  * ["collection:delete" (query, collection)](#module_mio.Resource.on.collection_delete)

<a name="module_mio.Resource.on.event_initialize"></a>
#####event: "initialize" (resource, values)
Run at the beginning of resource constructor.

| Param | Type | Description |
| ----- | ---- | ----------- |
| resource | <code>[Resource](#module_mio.Resource)</code> |  |
| values | <code>Object</code> | values passed to constructor |

<a name="module_mio.Resource.on.event_change"></a>
#####event: "change" (resource, name, value, prev)
Fired whenever a resource attribute is changed.

| Param | Type | Description |
| ----- | ---- | ----------- |
| resource | <code>[Resource](#module_mio.Resource)</code> |  |
| name | <code>String</code> | name of the attribute |
| value | <code>Mixed</code> |  |
| prev | <code>Mixed</code> |  |

<a name="module_mio.Resource.on.change_[attr]"></a>
#####event: "change:[attr]" (resource, value, prev)
Fired whenever [attr] is changed.

| Param | Type | Description |
| ----- | ---- | ----------- |
| resource | <code>Resource</code> |  |
| value | <code>Mixed</code> |  |
| prev | <code>Mixed</code> |  |

<a name="module_mio.Resource.on.event_create"></a>
#####event: "create" (resource)
Run at the end of resource constructor.

**Note:** Not the same event as [module:mio.Resource.on.post](module:mio.Resource.on.post).

| Param | Type | Description |
| ----- | ---- | ----------- |
| resource | <code>Resource</code> |  |

<a name="module_mio.Resource.on.event_attribute"></a>
#####event: "attribute" (name, options)
| Param | Type | Description |
| ----- | ---- | ----------- |
| name | <code>String</code> | attribute name |
| options | <code>Object</code> | attribute options |

<a name="module_mio.Resource.on.event_get"></a>
#####event: "get" (query, resource)
Runs at the beginning of callback for `Resource.get` or `Resource#get`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.event_put"></a>
#####event: "put" (query, representationresentation, resource)
Runs at the beginning of callback for `Resource.put` or `Resource#put`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| representationresentation | <code>Object</code> \| <code>[Resource](#module_mio.Resource)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.event_patch"></a>
#####event: "patch" (query, patch, resource)
Runs at the beginning of callback for `Resource.patch` or `Resource#patch`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| patch | <code>Object</code> \| <code>Array.&lt;Object&gt;</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.event_post"></a>
#####event: "post" (query, representation, resource)
Runs at the beginning of callback for `Resource.post` or `Resource#post`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| representation | <code>Object</code> \| <code>[Resource](#module_mio.Resource)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.event_delete"></a>
#####event: "delete" (query, resource)
Runs at the beginning of callback for `Resource.delete` or `Resource#delete`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| resource | <code>[Resource](#module_mio.Resource)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.event_set"></a>
#####event: "set" (resource, attributes)
| Param | Type | Description |
| ----- | ---- | ----------- |
| resource | <code>Resource</code> |  |
| attributes | <code>Object</code> |  |

<a name="module_mio.Resource.on.event_reset"></a>
#####event: "reset" (resource, attributes)
| Param | Type | Description |
| ----- | ---- | ----------- |
| resource | <code>[Resource](#module_mio.Resource)</code> |  |
| attributes | <code>Object</code> |  |

<a name="module_mio.Resource.on.collection_get"></a>
#####event: "collection:get" (query, collection)
Runs at the beginning of callback for `Resource.Collection.get`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.collection_put"></a>
#####event: "collection:put" (query, resources, collection)
Runs at the beginning of callback for `Resource.Collection.put`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| resources | <code>Array.&lt;Object&gt;</code> \| <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.collection_patch"></a>
#####event: "collection:patch" (query, patch, collection)
Runs at the beginning of callback for `Resource.Collection.patch`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| patch | <code>Object</code> \| <code>Array.&lt;Object&gt;</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.collection_post"></a>
#####event: "collection:post" (query, resources, collection)
Runs at the beginning of callback for `Resource.Collection.post`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| resources | <code>Array.&lt;Object&gt;</code> \| <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.on.collection_delete"></a>
#####event: "collection:delete" (query, collection)
Runs at the beginning of callback for `Resource.Collection.delete`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| collection | <code>[Resource.Collection](#module_mio.Resource.Collection)</code> | included if triggered by instance. |

<a name="module_mio.Resource.once"></a>
####Resource.once(event, listener) ⇒ <code>[Resource](#module_mio.Resource)</code>
Register `listener` to be called once when `event` is next emitted.

| Param | Type | Description |
| ----- | ---- | ----------- |
| event | <code>String</code> |  |
| listener | <code>function</code> |  |

<a name="module_mio.Resource.emit"></a>
####Resource.emit(event, ...) ⇒ <code>[Resource](#module_mio.Resource)</code>
Emit `event` and call listeners.

| Param | Type | Description |
| ----- | ---- | ----------- |
| event | <code>String</code> |  |
| ... | <code>Mixed</code> |  |

<a name="module_mio.Resource.trigger"></a>
####Resource.trigger(event, args, callback) ⇒ <code>[Resource](#module_mio.Resource)</code>
Run [module:mio.Resource.before](module:mio.Resource.before) hooks for given `event`.

Hooks are [triggered](#module_mio.Resource.trigger) by various methods
such as [get](#module_mio.Resource.get) or
[post](#module_mio.Resource#post), are asynchronous, and run in series.
Hooks receive a `next` function as the last argument, which must be called
to continue firing subsequent listeners. Subsequent hooks will not be run
if `next` receives any arguments. Arguments received by `next` are passed to
the callback of the method that fired the event.

| Param | Type | Description |
| ----- | ---- | ----------- |
| event | <code>String</code> |  |
| args | <code>Mixed</code> | multiple arguments can be passed |
| callback | <code>function</code> |  |

<a name="module_mio.Resource.trigger.next"></a>
#####callback: trigger.next → <code>function</code>
Call the next hook in series, unless an `error` or `result` was received.

| Param | Type | Description |
| ----- | ---- | ----------- |
| error | <code>Error</code> |  |
| result | <code>[Resource](#module_mio.Resource)</code> \| <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code> |  |
| ... | <code>Mixed</code> |  |

<a name="module_mio.Resource.url"></a>
####Resource.url([method]) ⇒ <code>Object</code> \| <code>String</code>
Returns map of HTTP methods to resource URLs. If `method` is specified, the
URL for that `method` is returned.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[method\] | <code>String</code> |  |

<a name="module_mio.Query"></a>
###class: mio.Query
<a name="new_module_mio.Query_new"></a>
####new Query(settings)
Queries are created by actions such as `Resource.get()` and provide a
consistent query interface across plugins and other related modules.

| Param | Type | Description |
| ----- | ---- | ----------- |
| settings | <code>Object</code> |  |
| settings.context | <code>[Resource](#module_mio.Resource)</code> \| <code>[Resource.Collection](#module_mio.Resource.Collection)</code> |  |
| \[settings.handler\] | <code>function</code> | method to execute for Query#exec |
| \[settings.state\] | <code>Object</code> | set initial query state |

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

The above is equivelant to:

```javascript
User.Collection.get({
  where: { active: true },
  sort:  { created_at: 'desc' },
  size:  10
}, function (err, users) {
  // ...
});
```
<a name="module_mio.Resource.Collection"></a>
###class: mio.Resource.Collection

* [class: .Resource.Collection](#module_mio.Resource.Collection)
  * [new Collection(resources, [options])](#new_module_mio.Resource.Collection_new)
  * _instance_
    * [.length](#module_mio.Resource.Collection#length) → <code>Number</code>
    * [.from](#module_mio.Resource.Collection#from) → <code>Number</code>
    * [.size](#module_mio.Resource.Collection#size) → <code>Number</code>
    * [.total](#module_mio.Resource.Collection#total) → <code>Number</code>
    * [.toArray](#module_mio.Resource.Collection#toArray) ⇒ <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code>
    * [.get(callback)](#module_mio.Resource.Collection#get) ⇒ <code>module:mio.Collection</code>
    * [.put(callback)](#module_mio.Resource.Collection#put) ⇒ <code>module:mio.Collection</code>
    * [.patch(callback)](#module_mio.Resource.Collection#patch) ⇒ <code>module:mio.Collection</code>
    * [.post(callback)](#module_mio.Resource.Collection#post) ⇒ <code>module:mio.Collection</code>
    * [.delete(callback)](#module_mio.Resource.Collection#delete) ⇒ <code>module:mio.Collection</code>
    * [.reset(resources)](#module_mio.Resource.Collection#reset) ⇒ <code>module:mio.Collection</code>
    * [.url([method])](#module_mio.Resource.Collection#url) ⇒ <code>Object</code> \| <code>String</code>
    * [.at(index)](#module_mio.Resource.Collection#at) ⇒ <code>[Resource](#module_mio.Resource)</code>
    * [.nextPage(number)](#module_mio.Resource.Collection#nextPage) ⇒ <code>[Query](#module_mio.Query)</code>
    * [.page(page)](#module_mio.Resource.Collection#page) ⇒ <code>[Query](#module_mio.Query)</code>
    * [.toJSON()](#module_mio.Resource.Collection#toJSON) ⇒ <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code>
    * [.[ArrayMethod]()](#module_mio.Resource.Collection#[ArrayMethod])
  * _static_
    * [.create(resources)](#module_mio.Resource.Collection.create) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
    * [.extend(prototype, statics)](#module_mio.Resource.Collection.extend) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
    * [.get(query, callback)](#module_mio.Resource.Collection.get) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
    * [.put(query, representation, callback)](#module_mio.Resource.Collection.put) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
    * [.patch(query, changes, callback)](#module_mio.Resource.Collection.patch) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
    * [.post(representations, callback)](#module_mio.Resource.Collection.post) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
    * [.delete(query, callback)](#module_mio.Resource.Collection.delete) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
    * [.url([method])](#module_mio.Resource.Collection.url) ⇒ <code>Object</code> \| <code>String</code>

<a name="new_module_mio.Resource.Collection_new"></a>
####new Collection(resources, [options])
A collection is the interface for working with multiple resources, and
exposes the same set of HTTP verbs as `Resource`.

Array.prototype methods are available for collections, but a collection
is not an array. The array of resources is kept at `Collection#resources`.
Methods such as `map` return arrays instead of the collection.

| Param | Type | Description |
| ----- | ---- | ----------- |
| resources | <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code> |  |
| \[options\] | <code>Object</code> |  |
| \[options.query\] | <code>[Query](#module_mio.Query)</code> |  |

**Example**  
```javascript
var resource1 = new Resource();
var collection = new Resource.Collection([resource]);

collection.push(new Resource());
collection.splice(1, 1, new Resource());

collection.at(0) === resource; // => true
collection.length === 2;       // => true
collection.indexOf(resource);  // => 0
```
<a name="module_mio.Resource.Collection#length"></a>
####resource.Collection.length → <code>Number</code>
Number of resources in the collection.

<a name="module_mio.Resource.Collection#from"></a>
####resource.Collection.from → <code>Number</code>
Query offset for collection.

<a name="module_mio.Resource.Collection#size"></a>
####resource.Collection.size → <code>Number</code>
Query limit for collection.

<a name="module_mio.Resource.Collection#total"></a>
####resource.Collection.total → <code>Number</code>
Number of resources in the database for this collection's query. Only
included if `query.withCount()` was used.

<a name="module_mio.Resource.Collection#toArray"></a>
####resource.Collection.toArray ⇒ <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code>
Returns array of resources in collection.

<a name="module_mio.Resource.Collection#get"></a>
####resource.Collection.get(callback) ⇒ <code>module:mio.Collection</code>
Refresh the collection instance with the most recent resource
representations passed to the last hook's `next()`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[get](#module_mio.Collection.get.get)</code> |  |

**Emits**: <code>[collection:get](#module_mio.Resource.hook.collection_get)</code>, <code>[collection:get](#module_mio.Resource.on.collection_get)</code>  
<a name="module_mio.Resource.Collection#put"></a>
####resource.Collection.put(callback) ⇒ <code>module:mio.Collection</code>
Replace the collection resources using the instance representation.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[put](#module_mio.Collection.put.put)</code> |  |

**Emits**: <code>[collection:put](#module_mio.Resource.hook.collection_put)</code>, <code>[collection:put](#module_mio.Resource.on.collection_put)</code>  
<a name="module_mio.Resource.Collection#patch"></a>
####resource.Collection.patch(callback) ⇒ <code>module:mio.Collection</code>
Patch the collection resources using the instance representation.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[patch](#module_mio.Collection.patch.patch)</code> |  |

**Emits**: <code>[collection:patch](#module_mio.Resource.hook.collection_patch)</code>, <code>[collection:patch](#module_mio.Resource.on.collection_patch)</code>  
<a name="module_mio.Resource.Collection#post"></a>
####resource.Collection.post(callback) ⇒ <code>module:mio.Collection</code>
Create resources using the instance representation.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[post](#module_mio.Collection.post.post)</code> |  |

**Emits**: <code>[collection:post](#module_mio.Resource.hook.collection_post)</code>, <code>[collection:post](#module_mio.Resource.on.collection_post)</code>  
<a name="module_mio.Resource.Collection#delete"></a>
####resource.Collection.delete(callback) ⇒ <code>module:mio.Collection</code>
Delete resources in collection.

| Param | Type | Description |
| ----- | ---- | ----------- |
| callback | <code>[post](#module_mio.Collection.post.post)</code> |  |

**Emits**: <code>[collection:post](#module_mio.Resource.hook.collection_post)</code>, <code>[collection:post](#module_mio.Resource.on.collection_post)</code>  
<a name="module_mio.Resource.Collection#reset"></a>
####resource.Collection.reset(resources) ⇒ <code>module:mio.Collection</code>
Reset collection with given `resources`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| resources | <code>Array.&lt;(Resource\|Object)&gt;</code> |  |

<a name="module_mio.Resource.Collection#url"></a>
####resource.Collection.url([method]) ⇒ <code>Object</code> \| <code>String</code>
Returns map of HTTP methods to collection URLs. If `method` is specified, the
URL for that `method` is returned.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[method\] | <code>String</code> |  |

<a name="module_mio.Resource.Collection#at"></a>
####resource.Collection.at(index) ⇒ <code>[Resource](#module_mio.Resource)</code>
Returns resource at given `index`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| index | <code>Number</code> |  |

<a name="module_mio.Resource.Collection#nextPage"></a>
####resource.Collection.nextPage(number) ⇒ <code>[Query](#module_mio.Query)</code>
Retrieve next page of collection.

| Param | Type | Description |
| ----- | ---- | ----------- |
| number | <code>Number</code> | page number |

**Example**  
```javascript
User.Collection.get().exec(function (err, users) {
  users.nextPage().exec(function (err, users) {
    // ...
  });
});
```
<a name="module_mio.Resource.Collection#page"></a>
####resource.Collection.page(page) ⇒ <code>[Query](#module_mio.Query)</code>
Retrieve specified `page` of collection.

| Param | Type | Description |
| ----- | ---- | ----------- |
| page | <code>Number</code> | page number |

**Example**  
```javascript
User.Collection.get().exec(function (err, users) {
  users.page(3).exec(function (err, users) {
    // ...
  });
});
```
<a name="module_mio.Resource.Collection#toJSON"></a>
####resource.Collection.toJSON() ⇒ <code>[Array.&lt;Resource&gt;](#module_mio.Resource)</code>
Returns array of resources in collection.

<a name="module_mio.Resource.Collection#[ArrayMethod]"></a>
####resource.Collection.[ArrayMethod]()
Collections inherit `Array.prototype` methods. `Array.prototype` methods
that return arrays such as `map` still return an array, not the collection.

<a name="module_mio.Resource.Collection.create"></a>
####Resource.Collection.create(resources) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
Create a collection of resources and hydrate them if necessary.

This is simply sugar for `new Collection(resources)`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| resources | <code>Array.&lt;(module:mio.Resource\|Object)&gt;</code> |  |

<a name="module_mio.Resource.Collection.extend"></a>
####Resource.Collection.extend(prototype, statics) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
Extend collection prototype or class properties.

| Param | Type | Description |
| ----- | ---- | ----------- |
| prototype | <code>Object</code> |  |
| statics | <code>Object</code> |  |
| statics.baseUrl | <code>String</code> |  |

<a name="module_mio.Resource.Collection.get"></a>
####Resource.Collection.get(query, callback) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
Get a collection of resources using given `query`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| callback | <code>[get](#module_mio.Collection.get.get)</code> |  |

**Emits**: <code>[collection:get](#module_mio.Resource.hook.collection_get)</code>, <code>[collection:get](#module_mio.Resource.on.collection_get)</code>  
<a name="module_mio.Resource.Collection.put"></a>
####Resource.Collection.put(query, representation, callback) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
Replace a collection of resources using given `query`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| representation | <code>Object</code> |  |
| callback | <code>[put](#module_mio.Collection.put.put)</code> |  |

**Emits**: <code>[collection:put](#module_mio.Resource.hook.collection_put)</code>, <code>[collection:put](#module_mio.Resource.on.collection_put)</code>  
<a name="module_mio.Resource.Collection.patch"></a>
####Resource.Collection.patch(query, changes, callback) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
Update (patch) a collection of resources using given `query` and `changes`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| changes | <code>Object</code> \| <code>Array.&lt;Object&gt;</code> |  |
| callback | <code>[patch](#module_mio.Collection.patch.patch)</code> |  |

**Emits**: <code>[collection:patch](#module_mio.Resource.hook.collection_patch)</code>, <code>[collection:patch](#module_mio.Resource.on.collection_patch)</code>  
<a name="module_mio.Resource.Collection.post"></a>
####Resource.Collection.post(representations, callback) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
Create resources using given `representations`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| representations | <code>Array.&lt;Object&gt;</code> |  |
| callback | <code>[post](#module_mio.Collection.post.post)</code> |  |

**Emits**: <code>[collection:post](#module_mio.Resource.hook.collection_post)</code>, <code>[collection:post](#module_mio.Resource.on.collection_post)</code>  
<a name="module_mio.Resource.Collection.delete"></a>
####Resource.Collection.delete(query, callback) ⇒ <code>[Resource.Collection](#module_mio.Resource.Collection)</code>
Delete resources using given `query`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| query | <code>[Query](#module_mio.Query)</code> |  |
| callback | <code>[delete](#module_mio.Collection.delete.delete)</code> |  |

**Emits**: <code>[collection:delete](#module_mio.Resource.hook.collection_delete)</code>, <code>[collection:delete](#module_mio.Resource.on.collection_delete)</code>  
<a name="module_mio.Resource.Collection.url"></a>
####Resource.Collection.url([method]) ⇒ <code>Object</code> \| <code>String</code>
Returns map of HTTP methods to collection URLs. If `method` is specified, the
URL for that `method` is returned.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[method\] | <code>String</code> |  |

