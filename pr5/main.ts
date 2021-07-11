import Utils from './utils'

const greet = (name: string): void => {
  console.log(`Hello ${name}!`)
}

const main1 = () => {
  greet('mahaker')
  
  console.log(Utils.add(2, 3))
  console.log(Utils.sub(0, 5))
}

const main2 = () => {
  greet('Hideaki!')
  
  console.log(Utils.add(10, 5))
  console.log(Utils.sub(10, 5))
}

declare let global: any
global.main1 = main1
global.main2 = main2
