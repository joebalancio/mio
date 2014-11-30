<a name="Resource"></a>
#class: Resource
**Members**

* [class: Resource](#Resource)
  * [new Resource(values)](#new_Resource)
  * [Resource.extend(prototype)](#Resource.extend)
  * [Resource.attr(name, options)](#Resource.attr)
  * [Resource.use(fn)](#Resource.use)
  * [Resource.browser(fn)](#Resource.browser)
  * [Resource.server(fn)](#Resource.server)
  * [Resource.on(ev, fn)](#Resource.on)
  * [Resource.once(ev, fn)](#Resource.once)
  * [Resource.emit(ev, ...)](#Resource.emit)
  * [Resource.before()](#Resource.before)
  * [Resource.after()](#Resource.after)
  * [Resource.create(attrs)](#Resource.create)
  * [Resource.findOne(query, callback)](#Resource.findOne)
  * [Resource.findAll(query, callback)](#Resource.findAll)
  * [Resource.count(query, callback)](#Resource.count)
  * [Resource.removeAll(query, callback)](#Resource.removeAll)
  * [Resource.query(method, query)](#Resource.query)
  * [resource.isNew()](#Resource#isNew)
  * [resource.isDirty(attr)](#Resource#isDirty)
  * [resource.changed()](#Resource#changed)
  * [resource.has(attr)](#Resource#has)
  * [resource.set(attrs)](#Resource#set)
  * [resource.save(callback)](#Resource#save)
  * [resource.remove(callback)](#Resource#remove)

<a name="new_Resource"></a>
##new Resource(values)
Create new `Resource` instance.

**Params**

- values `Object` - optional  

**Returns**: [Resource](#Resource)  
<a name="Resource.extend"></a>
##Resource.extend(prototype)
Extend `Resource` with new attributes or methods.

**Params**

- prototype `Object` - properties or methods to extend prototype  

**Returns**: [Resource](#Resource)  
<a name="Resource.attr"></a>
##Resource.attr(name, options)
Define a resource attribute with the given `name` and `params`.

Supported `options`:

   - default     Provide default value or function that returns value.
   - filtered    Exclude attribute from enumeration.
   - get         Accessor function. Optional.
   - primary     Use attribute as primary key.

**Params**

- name `String`  
- options `Object`  

**Returns**: [Resource](#Resource)  
<a name="Resource.use"></a>
##Resource.use(fn)
Call the given plugin `fn` with the Resource as both argument and context.

    User
      .use(require('example-plugin'))
      .server(function() {
        this.use(require('mio-mysql'));
      })
      .browser(function() {
        this.use(require('mio-ajax'));
      });

**Params**

- fn `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.browser"></a>
##Resource.browser(fn)
Use given `fn` only in browser.

**Params**

- fn `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.server"></a>
##Resource.server(fn)
Use given `fn` only in node.

**Params**

- fn `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.on"></a>
##Resource.on(ev, fn)
Register `fn` to be called when `ev` is emitted.

**Params**

- ev `String`  
- fn `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.once"></a>
##Resource.once(ev, fn)
Register `fn` to be called once when `ev` is next emitted.

**Params**

- ev `String`  
- fn `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.emit"></a>
##Resource.emit(ev, ...)
Emit `ev` and call listeners.

**Params**

- ev `String`  
- ... `Mixed`  

**Returns**: [Resource](#Resource)  
<a name="Resource.before"></a>
##Resource.before()
Alias for `Resource.on('before EVENT')`

<a name="Resource.after"></a>
##Resource.after()
Alias for `Resource.on('after EVENT')`

<a name="Resource.create"></a>
##Resource.create(attrs)
Create a new resource and hydrate with given `attrs`,
or if `attrs` is already a resource return it.

**Params**

- attrs `Object`  

**Returns**: [Resource](#Resource)  
<a name="Resource.findOne"></a>
##Resource.findOne(query, callback)
Find a resource with given `id` or `query`.

**Params**

- query `Number` | `Object`  
- callback `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.findAll"></a>
##Resource.findAll(query, callback)
Find collection of resources using given `query`.

**Params**

- query `Object`  
- callback `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.count"></a>
##Resource.count(query, callback)
Count resources using given `query`.

**Params**

- query `Object`  
- callback `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.removeAll"></a>
##Resource.removeAll(query, callback)
resources using given `query`.

**Params**

- query `Object`  
- callback `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource.query"></a>
##Resource.query(method, query)
Compose queries functionally.

**Params**

- method `String`  
- query `Object`  

**Returns**: `Object`  
**Example**  
User.findAll()
  .where({ active: true })
  .sort({ created_at: "desc" })
  .limit(10)
  .exec(function(err, users) {
  });

<a name="Resource#isNew"></a>
##resource.isNew()
Check if resource is new and has not been saved.

**Returns**: `Boolean`  
<a name="Resource#isDirty"></a>
##resource.isDirty(attr)
Check if resource is dirty (has any changed attributes).
If an attribute name is specified, check if that attribute is dirty.

**Params**

- attr `String` - optional attribute to check if dirty  

**Returns**: `Boolean`  
<a name="Resource#changed"></a>
##resource.changed()
Return attributes changed since last save.

**Returns**: `Object`  
<a name="Resource#has"></a>
##resource.has(attr)
Check if resource has given `attr`.

**Params**

- attr `String`  

**Returns**: `Boolean`  
<a name="Resource#set"></a>
##resource.set(attrs)
Set given resource `attrs`.

**Params**

- attrs `Object`  

**Returns**: [Resource](#Resource)  
<a name="Resource#save"></a>
##resource.save(callback)
Save resource.

**Params**

- callback `function`  

**Returns**: [Resource](#Resource)  
<a name="Resource#remove"></a>
##resource.remove(callback)
Remove resource.

**Params**

- callback `function`  

**Returns**: [Resource](#Resource)  
