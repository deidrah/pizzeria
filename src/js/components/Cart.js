import {templates, select, classNames, settings} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';
class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = element.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click',function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update(){
    const thisCart = this;
    let deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;
    for (let product of thisCart.products){
      totalNumber += product.amount;
      subtotalPrice += product.priceSingle * product.amount;
    }
    if (totalNumber === 0){
      thisCart.totalPrice = 0;
      deliveryFee = 0; 
    } else {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subTotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;
    thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;
  }
  remove(cartProduct){
    const thisCart = this;
    cartProduct.dom.wrapper.remove();
    thisCart.products.splice(cartProduct,1);
    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {
      address: thisCart.dom.form.querySelector(select.cart.address).value,
      phone: thisCart.dom.form.querySelector(select.cart.phone).value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.dom.subTotalPrice.innerHTML,
      totalNumber: thisCart.dom.totalNumber.innerHTML,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: [],
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options);
  }
}

export default Cart;