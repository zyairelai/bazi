const { Lunar } = require('lunar-javascript');
const lunar = Lunar.fromDate(new Date());
const eightChar = lunar.getEightChar();
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar)));
