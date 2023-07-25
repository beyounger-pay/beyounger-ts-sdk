import {  SHA512, WordArray } from "crypto-js";

// const crypto = require('crypto')
const baseUrl = "https://api.beyounger.com";
const SIGN_SEPARATOR = ":"
interface fetchDataParams{
  method: "POST" | "GET" | "PUT" | "DELETE",
  url: string,
  req: any, 
  authorizationStr: string
}
interface BeyoungerObj {
  Auth: {
    merchantId: string;
    timStamp: number;
    sign: WordArray;
  };
  SignatureParams: {
    merchantId: string;
    cust_order_id: string;
    amount: string;
    currency: string;
    apiSecret: string;
    timStamp: number;
  };
}

async function fetchData(data: fetchDataParams) {
  const { method, url, req, authorizationStr } = data;
  // Default options are marked with *
  const response = await fetch(`${baseUrl}${url}`, {
    method: method, // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      Authorization: authorizationStr,
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(req), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}



interface ReqBody {
  orderId: string,
  [key: string]: any;
}

const createUUID = () => {
  var result: any = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    result[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  // bits 12-15 of the time_hi_and_version field to 0010
  result[14] = "4";
  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  result[19] = hexDigits.substr((result[19] & 0x3) | 0x8, 1);
  result[8] = result[13] = result[18] = result[23] = "-";
  return result.join("");
};


const getReqBodyObj = (options: ReqBody): string => {
  const { orderId } = options;
  const req: any = {
    currency: "USD",
    amount: "100.05",
    cust_order_id: orderId,
    payment_method: "paypal",
    merchant_name: "test-api-name",
    site_id: 1,
    return_url: "https://api.beyounger.com/status.html",
    notification_url: "https://api.beyounger.com/status.html",
    customer: {
      email: "hello@inst.money",
      first_name: "Jack",
      last_name: "Li",
      phone: "+12123434235",
      country: "USA",
      city: "B",
      state: "A",
      address: "sgasgs,shfojsg,AA",
      zipcode: "24000",
    },
    cart_items: [
      {
        name: "Product 1",
        quantity: 1,
        amount: "100.00",
        currency: "USD",
        product_id: "12345",
        category: "Electronics",
      },
    ],

    delivery_details: {
      delivery_type: "PHYSICAL",
      delivery_method: "USPS - Ground Mail",
      delivery_time: 1415273168,
    },

    delivery_recipient: {
      email: "hello@gmail.com",
      phone: "1234567890",
      first_name: "Jack",
      last_name: "Li",
      country: "USA",
      state: "California",
      city: "Los Angeles",
      address1: "123 Main St",
      address2: "Apt 4B",
      zipcode: "90001",
    },
  };
  return req;
};

const getSignature = (SignatureParams: BeyoungerObj["SignatureParams"]) => {
  const { merchantId, cust_order_id, amount, currency, apiSecret, timStamp } =
    SignatureParams;
  const signature = `${merchantId}&${cust_order_id}&${amount}&${currency}&${apiSecret}&${timStamp}`;

  return SHA512(signature);
};

const generateAuth = (BeyoungerObj: BeyoungerObj["Auth"]): string => {

  const { merchantId, timStamp, sign } = BeyoungerObj;
  const authorizationStr = `${merchantId}${SIGN_SEPARATOR}${timStamp}${SIGN_SEPARATOR}${sign}`;

  return authorizationStr;
};

export default generateAuth;
interface paymentOptions  {
  url: string,
  merchantId : string,
  apiSecret: string,
  timStamp: number,
  merchantOrderId: string

}
const Payment = (paymentOptions: paymentOptions) => {
  const defaultOptions = {
    merchantId: "d73d82c2801b47c8b5247ad9344d5711",
    url: "/api/v1/payment",
    apiSecret : "61a02d15-760d-41ca-8126-60cbb77728c8",
    timStamp : Date.now(),
    merchantOrderId: createUUID()
  }
  const mergeOptions = Object.assign({}, defaultOptions, paymentOptions);
  
  const {url , apiSecret , timStamp , merchantOrderId , merchantId} = mergeOptions;

  const req:any = getReqBodyObj({
    orderId: merchantOrderId
  })

  const sign = getSignature({
    merchantId,
    apiSecret,
    timStamp,
    cust_order_id: req.cust_order_id,
    amount: req.amount,
    currency: req.currency,
  });
  const authorizationStr = generateAuth({
    merchantId,
    timStamp,
    sign,
  });

  return fetchData({
    method: "POST",
    authorizationStr,
    url,
    req
  })
};

interface chooseOptions {
  url: string,
  processor: string,
  orderId: string,
  timStamp: number,
  merchantId: string,
  apiSecret: string,
}

const Checkout = () => {

}

const chooseChannel = (chooseOptions: chooseOptions) => {
  const { url ,  orderId ,timStamp , processor ,merchantId , apiSecret} = chooseOptions
  if(!orderId){
    alert(`orderId is illegal`)
    return ''
  }
  const req: any = {
    id: orderId,
    processor: processor,
  }
  const signature = `${merchantId}&${apiSecret}&${timStamp}`
  const sign = SHA512(signature)


  const authorizationStr =  generateAuth({
    merchantId,
    timStamp,
    sign,
  });
  return fetchData({
    method: "POST",
    authorizationStr,
    url,
    req
  })
}

export { Payment , createUUID , chooseChannel , Checkout};
