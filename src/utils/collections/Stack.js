export default class Stack {
    constructor() {
      this.items = [];
    }
  
    isEmpty() {
      return this.size() == 0;
    }
  
    size() {
      return this.items.length;
    }
  
    clear() {
      this.items = [];
    }
  
    push(item) {
      this.items.push(item);
    }
  
    pop() {
      if (this.isEmpty()) throw new Error("Stack is Empty!");
      return this.items.pop();
    }
  
    peek() {
      if (this.isEmpty()) throw new Error("Stack is Empty!");
      return this.items[this.items.length - 1];
    }
    print() {
      for (let i = this.items.length - 1; i >= 0; i--) console.log(this.items[i]);
    }
  
    getStack() {
      return this.items;
    }
  }