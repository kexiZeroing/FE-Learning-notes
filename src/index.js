console.log('hello world');

const a = 12;
console.log(a);

// JSDoc plugin: select the whole function signature then cmd + shift + p -> add doc comments (add @param and @return tags)
/**
 * @param  {} val
 */
const main = (val) => console.log(val);
main('hi');
