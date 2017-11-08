# 3.1.0

* `FEAT`: keep non-decodeable entities _as is_
* `FEAT`: decode only [required sub-set](https://www.w3.org/TR/REC-xml/#sec-predefined-ent) of named entities

# 3.0.1

* `CHORE`: add license field to `package.json`

# 3.0.0

* `FEAT`: throw on handler errors [`4b0ebb1`](https://github.com/nikku/saxen/commit/4b0ebb12edb6f98064f33f555d519f58a8ec3a63)
* `FEAT`: expose current namespaces in proxy mode
* `FEAT`: normalize `xsi:type` attribute values [#4](https://github.com/nikku/saxen/issues/4)
* `FEAT`: add `warn` event, informing about recoverable errors [`7fce2151`](https://github.com/nikku/saxen/commit/7fce2151acc9bf006feab6cb3d892a004504c6ce)

# 2.0.0

* `FEAT`: rename events

  * `textNode -> text`
  * `startNode -> openTag`
  * `endNode -> closeTag`

# 1.1.0

* `FEAT`: handle non-xml input

# 1.0.4

* `DOCS`: better `@type` annotations
* `CHORE`: save a few bytes in decoding logic

# 1.0.3

* `DOCS`: correct `@type` and `@return` annotations in parser

# 1.0.2

* `FIX`: properly handle namespace prefix collisions [#1](https://github.com/nikku/saxen/issues/1)

# 1.0.1

* `CHORE`: improve test coverage and documentation

# 1.0.0

* `FEAT`: don't skip unknown namespace nodes
* `FEAT`: expose parse context in `startNode`, `endNode` and `error`
* `FEAT`: introduce parser object mode
* `FEAT`: pipe handler errors to `error` handler
* `FEAT`: allow non-args `#ns` call
* `FIX`: various namespace handling errors
* `STYLE`: unify code style
* `CHORE`: rename library to _saxen_
* `CHORE`: improve test coverage
* `CHORE`: add linting
* `DOCS`: move to english language for documentation and README

# ...

Check `git log` for earlier history.