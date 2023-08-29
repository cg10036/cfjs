# CFJS - deobfuscate variable names

## Usage

```bash
git clone https://github.com/cg10036/cfjs.git
cd cfjs
npm i
# edit IN, OUT in deobfuscator.js
node deobfuscator.js
```

## Result

```js
...,
...,
(a[b(1234)][b(1234)] = b(1234))),
...,
...
```

```js
...,
...,
(a.style.justifyContent = "center"),
...,
...
```
