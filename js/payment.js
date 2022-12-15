import { getBuy, getProductDetail } from './getdata.js';
import { userOwnBank } from './userInfo.js';
import { delProduct } from '../admin/js/requests.js';
import { renderPayment } from './main.js';

// 주문 상품 정보 조회


export function lookProducts() {
  const tbodyEl = document.querySelector('.products');
  const cart = JSON.parse(localStorage.cart);
  if (cart.length > 0) {
    cart.forEach(async (e) => {
      const res = await getProductDetail(e);
      const product = document.createElement('tr');
      product.innerHTML = /* html */ `
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
        <td class="product-price">${res.price.toLocaleString()}원</td>`;
      priceCheck(product)
      tbodyEl.append(product);
    });
  } else return;
}

// 가격 렌더링 
function renderTotalPrice(){
  const totalPriceEl = document.querySelectorAll('.total-price');
  const products = document.querySelectorAll('.products tr');
  let totalPrice = 0;
  products.forEach( el => {
    if  (el.querySelector('.product-checkbox').checked) {
      totalPrice += parseInt(el.querySelector('td:nth-child(4)').textContent.slice(0,-1).replace(',','')); // 로케일 문자를 숫자로 변환
    }
  })
  totalPriceEl.forEach( el => {
    el.textContent = totalPrice.toLocaleString() + `원`;
  })
}

// 선택 박스 상태 변화에 따라 가격 렌더링 변화
export function priceCheck(product){
  const checkBox = product.querySelector('.product-checkbox')
  console.log(checkBox)
  checkBox.addEventListener('change', () => renderTotalPrice())
}

// 제품 전체 선택 및 해제
export function allCheckBox(){
  
  const allCheckBox = document.querySelector('tr input[type=checkbox]')
  allCheckBox.addEventListener('change', event => {
    event.preventDefault()
    const eachCheckBoxs = document.querySelectorAll('.product-checkbox')
    if(allCheckBox.checked){
      eachCheckBoxs.forEach(el => el.checked = true )
    } else {
      eachCheckBoxs.forEach(el => el.checked = false )
    }
    renderTotalPrice()
  })
}

// 삭제하기 버튼 클릭
export function cancelProduct() {
  const productDeleteBtn = document.querySelector('.product-delete-btn');
  const productCheckBox = document.querySelectorAll('.product-checkbox');

  productDeleteBtn.addEventListener('click', async (event) => {
    event.preventDefault;
    const totalPriceEl = document.querySelector('.total-price');
    productCheckBox.forEach((el) => {
      const isChecked = el.checked;
      try {
        if (isChecked) {
          const id = el.dataset.id;
          console.log(id)
          delProduct(id);
          const cart = JSON.parse(localStorage.cart);
          const AfterCart = cart.filter((el) => el !== id);
          localStorage.cart = JSON.stringify(AfterCart);
        }
      } catch {
        console.log('삭제 오류');
      }
    });
  renderPayment()
  });
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
    const payAccountEl = document.querySelector('#pay-account');
    const noBankEl = document.querySelector('.no-bank');
    noBankEl.remove();
    accounts.forEach((account) => {
      const createBankList = document.createElement('option');
      createBankList.value = account.bankCode;
      createBankList.setAttribute('data-id', account.id);
      createBankList.textContent = account.bankName;
      payAccountEl.appendChild(createBankList);
    });
  } else return;
}

// 보유 계좌 잔액 확인
export async function payBankLoopUp() {
  const { accounts } = await userOwnBank();
  const payAccountEl = document.querySelector('#pay-account');
  const charge = document.querySelector('.charge');
  payAccountEl.addEventListener('change', (e) => {
    accounts.forEach((account) => {
      if (account.bankCode === e.target.value) {
        charge.innerHTML = /* html */ `
        잔액: ${account.balance.toLocaleString()} 원
        `;
      } else if (e.target.value === 'default' || e.target.value === 'null') {
        charge.innerHTML = '';
      }
    });
  });
}



// 결제하기
export async function buyProducts() {
  const paymentBtn = document.querySelector('.payment-btn');
  const payAccountEl = document.querySelector('#pay-account');
  payAccountEl.addEventListener('change', (e) => {
    const dataResult = e.target[e.target.selectedIndex];
    const accountId = dataResult.dataset.id;
    paymentBtn.addEventListener('click', async () => {
      const checkBoxs = document.querySelectorAll('.product-checkbox');
      let productIds = []
      checkBoxs.forEach(el => {
        if (el.checked){
          productIds.push(el.dataset.id)
        }
      })
      productIds.forEach( async productId => {
        await getBuy(localStorage.accessToken, productId, accountId);
      })
      // 결제 완료시 로컬 스토리지 카트 삭제
      localStorage.cart = JSON.stringify([]);
      alert('거래가 완료되었습니다.');
      location.hash = '#myorder';
    });
  });
}
