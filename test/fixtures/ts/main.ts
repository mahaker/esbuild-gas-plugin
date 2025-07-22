import Utils from './util'

const greet = (name: string): void => {
  console.log('Hello ' + name)
}

/**
 * A sample function
 * @param name Name to greet
 * @customfunction
 */
const main1 = (name: string) => {
  greet('Hello ' + name)
  
  console.log(Utils.add(2, 3))
  console.log(Utils.sub(0, 5))
}

const main2 = () => {
  greet('world!')
  
  console.log(Utils.add(10, 5))
  console.log(Utils.sub(10, 5))
}

declare let global: any
global.main1 = main1
global.main2 = main2
