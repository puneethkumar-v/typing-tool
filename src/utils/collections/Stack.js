const Stack = () => {
  let items = [];

  const isEmpty = () => items.length === 0;
  
  const size = () => items.length;
  
  const clear = () => {
    items = [];
  };
  
  const push = (item) => {
    items.push(item);
  };
  
  const pop = () => {
    if (isEmpty()) throw new Error("Stack is Empty!");
    return items.pop();
  };
  
  const peek = () => {
    if (isEmpty()) throw new Error("Stack is Empty!");
    return items[items.length - 1];
  };
  
  const print = () => {
    for (let i = items.length - 1; i >= 0; i--) console.log(items[i]);
  };
  
  const getStack = () => items;

  return { isEmpty, size, clear, push, pop, peek, print, getStack };
};

export default Stack;