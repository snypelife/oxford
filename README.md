# Oxford Localization/String Library
This l10n module is used to localize applications. It is based on the prinicple of overrides/fallbacks, where injected string libraries are deeply merged from right to left.

```
  var lib1 = { a: 1, b: 2, c: 3 };
  var lib2 = { b: 'foo', x: 7, y: 8, z: 9 };
  var lib3 = { b: 'baz', z: 'bar' };

  var oxford = require('oxford');
  var ox = oxford([lib1, lib2, lib3]);
  // lib1 is the base and each subsequent library is
  // merged in and overrides any values

  // Results in
  {
    a: 1,
    b: 'baz'
    c: 3,
    x: 7,
    y: 8,
    z: 'bar'
  }

```

It was heavily inspired by [Mozilla's L20n framework](http://www.l20n.org), which I recommend you checkout and see if it fits as your project's localization solution.

####%printf based dynamic placeholders that expect an input
```
{
  "congratsMessage": "Congrats %s!"
}
```


####{{mustache}} references to internal sibling props
```
{
  "name": "Bob",
  "welcomeMessage": "Howdy {{name}}!" // 'Howdy Bob!'
}
```


#### #(mixins) used to perform simple mods on values
```
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
```
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
    }
  }
]);

// Get a value from prop
ox.get('prop', 'brown'); // => 'the quick brown'

// Get a value from a nested.prop
ox.get('nested.prop', 'fox'); // => 'fox jumps over'

// Get a value from a routed prop by dynamic key
ox.get('routedProp', 2); // => 'the lazy dogs'
```
