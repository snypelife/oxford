# Oxford Localization/String Library
[![Build Status](https://travis-ci.org/snypelife/oxford.svg?branch=master)](https://travis-ci.org/snypelife/oxford)
[![Coverage Status](https://coveralls.io/repos/snypelife/oxford/badge.svg?branch=master&service=github)](https://coveralls.io/github/snypelife/oxford?branch=master)

This l10n module is used to localize applications. It is based on the principle of overrides/fallbacks, where injected string libraries are deeply merged from right to left.

```js
  var lib1 = { a: 1, b: 2, c: 3 };
  var lib2 = { b: 'foo', x: 7, y: 8, z: 9 };
  var lib3 = { b: 'baz', z: 'bar' };

  var oxford = require('oxford');
  var ox = oxford([lib1, lib2, lib3]);
  // lib1 is the base and each subsequent library is
  // merged in and overrides any values

  // Results in
  {
    a: '1',
    b: 'baz'
    c: '3',
    x: '7',
    y: '8',
    z: 'bar'
  }

```

It was heavily inspired by [Mozilla's L20n framework](http://www.l20n.org), which I recommend you checkout and see if it fits as your project's localization solution.

####%printf based dynamic placeholders that expect an input
```js
{
  "congratsMessage": "Congrats %s!"
}
```

It's also possible to use indexed placeholders for custom ordering, to account for things like grammatical conjugations.

```js
{
  "message": "Using Oxford is %s1 %s2"
}
{
  "message": "El uso de Oxford es %s2 %s1"
}

ox.get('message', 'dead', 'simple'); // Using Oxford is dead simple
ox.get('message', 'muertos', 'simple'); // El uso de Oxford es simple muertos

```


####{{mustache}} references to internal sibling props
```js
{
  "name": "Bob",
  "welcomeMessage": "Howdy {{name}}!" // 'Howdy Bob!'
}
```

####[[references]] used to inject prop into scope
```js
  {
    "oneScope": {
      "messages": "[[globalMessages]]" // resolves to "oneScope": { "messages": { "greeting": "Hello World" } }
    },
    "twoScope": {
      "messages": "[[globalMessages]]" // resolves to "twoScope": { "messages": { "greeting": "Hello World" } }
    },
    "redScope": {
      "messages": "[[globalMessages]]" // resolves to "redScope": { "messages": { "greeting": "Hello World" } }
    },
    "blueScope": {
      "messages": "[[globalMessages]]" // resolves to "blueScope": { "messages": { "greeting": "Hello World" } }
    },
    "globalMessages": {
      "greeting": "Hello World"
    }
  }
```


#### #(mixins) used to perform simple mods on values
```js
function capitalize(text) {
  text = text.trim();
  return text.slice(0, 1).toUpperCase() + text.slice(1);
}

{
  "world": "world",
  "hello": "Hello #capitalize({{world}})!" // 'Hello World!'
}
```


####String lookup method get()
```js
var oxford = require('oxford');
var ox = oxford([
  {
    "prop": "the quick %s"
  },
  {
    "nested": {
      "prop": "%s jumps over"
    }
  },
  {
    "routedProp": {
      "$key": "#pluralize(%d)",
      "singular": "the lazy dog",
      "plural": "the lazy dogs",
      "none": "nothing"
    },
    "defaultVariant": {
      "$default": "normal",
      "normal": "normal text",
      "alternate": "alternate text"
    }
  }
]);

// Get a value from prop
ox.get('prop', 'brown'); // => 'the quick brown'

// Get a value from a nested.prop
ox.get('nested.prop', 'fox'); // => 'fox jumps over'

// Get a value from a routed prop by dynamic key
ox.get('routedProp', 2); // => 'the lazy dogs'

// Get a value from a prop with variants
ox.get('defaultVariant'); // => 'normal text'
ox.get('defaultVariant.normal'); // => 'normal text'
ox.get('defaultVariant.alternate'); // => 'alternate text'
```

#### Child (sub-trees) oxford instances
Sometimes you may only want a portion of the string library for a particular view. Using the child method, it extracts an immutable version of the desired library.

```js
var oxford = require('oxford');

var ox = oxford([{
  a: {
    b : {
      c: 'foo',
      d: 'bar'
    }
  }
}]);

ox.get('a.b.c'); // 'foo'

var oxChild = ox.child('a.b');

oxChild.get('c') // "foo"
oxChild.get('d') // "bar"
oxChild.get('a.b.c') // throws ReferenceError

```

#### Exposed internal dictionary object
This may be useful when using the dictionary on both the server and the client.

**In the future this will be deprecated in favour of a deserialization method as it opens risk to state mutation**.

```js
var ox = oxford([dictionaryData]);

// This is the internal compiled dictionary, be careful not to mutate
var dictionary = ox.dictionary;

//wont lose data when stringified
var dictionaryString = JSON.stringify(dictionary);
var oxNew = oxford([JSON.parse(dictionaryString)]); //ox will be the same as oxNew
```

# Oxford Plugin System
Oxford exposes seams that you may register external plugins into the processing/query chain.

You can register a plugin by referencing an installed package. The convention is `oxford-plugin-<name>` and you
can reference it just by `<name>` and oxford will automatically try registering `oxford-plugin-<name>` first and then
the plain `<name>` if it fails

#### Example
```js
//installed package 'oxford-plugin-markdown'
// oxford-plugin-markdown/index.js
'use strict';

var parseMarkdown = require('marked');

module.exports = {
  hook: 'post-get',
  name: 'markdownPlugin',
  method: function (string) {
    return parseMarkdown(string);
};

// example.js
var oxford = require('oxford');
oxford.registerPlugin('markdown');
//or oxford.registerPlugin('oxford-plugin-markdown');
//or oxford.registerPlugin(require('oxford-plugin-markdown'));

var ox = oxford({ hello: '#Hello %s!' });

ox.get('hello', 'Brett'); // returns <h1>Hello Brett!</h1>

```

#### Current available hooks include:
- prebuild
- postbuild
- preget
- postget
- static

All hooks are normalized upon registering involving lowercasing and removing underscores(_), hyphens(-) and white spaces(" ").

This means that the following hook definitions are synonomous:
- 'preget'
- 'post-get'
- 'pre_build'
- 'post build'
- 'Preget'
- 'Pre-get'
- etc.

#### Pre-get hook
This hook is invoked before any processing occurs when calling the `.get()` method.  It is triggered before any additional traversals(i.e. mustaches/references) or decoding (i.e. HTML entity decoding).

#### Post-get hook
This hook is invoked after any processing occurs when calling the `.get()` method.  It is triggered after any additional traversals(i.e. mustaches/references) or decoding (i.e. HTML entity decoding).

#### Pre-build hook
This hook is invoked immediately before the string libray is built/comibined, so it can be used for any sort of custom preprocessing of the string library data before being handed off to Oxford.

#### Post-build hook
This hook is invoked immediately after the string libray is built/combined, so it can be used for any sort of custom post-processing of the string library data before being handed off to Oxford.

#### Static hook
This hook attaches a public static method onto the Oxford instance. It can be useful for things like parsing a custom data type or importing from a URL.

```yaml
# lib/text.yml
---
hello: Hello %s!
```

```js

//installed package 'oxford-plugin-yaml'
//oxford-plugin-yaml/index.js
'use strict';

var yaml = require('js-yaml');

module.exports = {
  hook: 'static',
  name: 'importYAML',
  method: function (url) {
    return this(yaml.safeLoad(fs.readFileSync(url, 'utf8')))
  }
};


// example.js
var oxford = require('oxford');
oxford.registerPlugin('yaml');

var ox = oxford.importYAML('./lib/text.yml');

ox.get('hello', 'Brett'); // returns Hello Brett!

```
