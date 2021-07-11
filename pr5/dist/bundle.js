let global = this;
function main1() {
}
function main2() {
}
(() => {
  // utils.ts
  var add = (n1, n2) => n1 + n2;
  var sub = (n1, n2) => n1 - n2;
  var utils_default = {
    add,
    sub
  };

  // main.ts
  var greet = (name) => {
    console.log(`Hello ${name}!`);
  };
  var main1 = () => {
    greet("mahaker");
    console.log(utils_default.add(2, 3));
    console.log(utils_default.sub(0, 5));
  };
  var main2 = () => {
    greet("Hideaki!");
    console.log(utils_default.add(10, 5));
    console.log(utils_default.sub(10, 5));
  };
  global.main1 = main1;
  global.main2 = main2;
})();
