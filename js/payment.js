import { getBuy, getProductDetail } from "./getdata.js";
import { userOwnBank } from "./userInfo.js";

// 주문 상품 정보 조회
export function lookProducts() {
  const tbodyEl = document.querySelector('.products')
  const cart = JSON.parse(localStorage.cart)
  const totalPriceEl = document.querySelector('.total-price')
  let totalPrice = 0
  if (cart.length > 0) {
    cart.forEach(async (e) => {
      const res = await getProductDetail(e)
      tbodyEl.innerHTML += /* html */ `
      <tr>
        <td>
          <input type="checkbox" data-id="${res.id}" class="product-checkbox" />
         </td>
         <td>
           <a href="#detail/${res.id}">
             <img src="${res.thumbnail}" alt="" />
           </a>
         </td>
         <td>
           <span>${res.title}</span> <br />
         </td>
         <td>${res.price.toLocaleString()}원</td>
         <td>1</td>
         <td>[무료 배송]</td>
         <td class="product-price">${res.price.toLocaleString()}원</td>
       </tr>
      `
      totalPrice += res.price
      totalPriceEl.textContent = totalPrice.toLocaleString() + `원`
    })
  } else return
}

export function cancelProduct() {
  const productDeleteBtn = document.querySelector('.product-delete-btn')
  const productEl = document.querySelectorAll('.product-checkbox')
  const cart = JSON.parse(localStorage.cart)
  productEl.forEach(product => {
    productDeleteBtn.addEventListener('click', () => {
      console.log(product.dataset)
      // for (let i = 0; i < cart.length; i += 1) {
      //   if (cart[i] === product.dataset) {
      //     cart.splice(i, 1)
      //     localStorage.setItem('cart', cart)
      //     console.log('삭제됨!')
      //   }
      // }
    })
  })
}
// productDeleteBtn.addEventListener('click', () => {
//   // const index = cart.indexOf('bDsZ5y7DG9p39AlS05aj')
//   // console.log(cart.splice(index, 1))
//   })
// })
// productDeleteBtn.addEventListener('click', e => {
//   const cart = JSON.parse(localStorage.cart)
//   for (let i = 0; i < cart.length; i += 1) {
//     if (cart[i] === )
//   }
// })

// 보유 계좌 불러오기
export function payAccountList(accounts) {
  if (accounts.length > 0) {
    const payAccountEl = document.querySelector('#pay-account')
    const noBankEl = document.querySelector('.no-bank')
    noBankEl.remove()
    accounts.forEach(account => {
      const createBankList = document.createElement('option')
      createBankList.value = account.bankCode
      createBankList.setAttribute('data-id', account.id)
      createBankList.textContent = account.bankName
      payAccountEl.appendChild(createBankList)
    })
  } else return
}

// 보유 계좌 잔액 확인
export async function payBankLoopUp() {
  const { accounts } = await userOwnBank()
  const payAccountEl = document.querySelector('#pay-account')
  const charge = document.querySelector('.charge')
  payAccountEl.addEventListener('change', (e) => {
    accounts.forEach(account => {
      if (account.bankCode === e.target.value) {
        charge.innerHTML = /* html */ `
        잔액: ${account.balance.toLocaleString()} 원
        `
      } else if (e.target.value === 'default' || e.target.value === 'null') {
        charge.innerHTML = ''
      }
    })
  })
}

// 결제하기
export async function buyProducts() {
  const paymentBtn = document.querySelector('.payment-btn')
  const payAccountEl = document.querySelector('#pay-account')
  payAccountEl.addEventListener('change', (e) => {
    const dataResult = e.target[e.target.selectedIndex]
    const accountId = dataResult.dataset.id
    paymentBtn.addEventListener('click', async () => {
      await getBuy(localStorage.accessToken, productId, accountId)
      alert("거래가 완료되었습니다.")
      location.hash = "#myorder"
    })
  })
}