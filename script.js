const nav=document.getElementById("nav");
if(nav) window.addEventListener("scroll",()=>nav.classList.toggle("scrolled",window.scrollY>40));
const toggle=document.querySelector(".menu-toggle"), links=document.querySelector(".links");
if(toggle&&links){toggle.addEventListener("click",()=>links.classList.toggle("open"));links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));}
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("show")}),{threshold:.14});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
const year=document.getElementById("year"); if(year) year.textContent=new Date().getFullYear();

// KULHAD TALES simple POS — demo only. Selecting an item NEVER opens print.
const cart = {};
const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const clearCart = document.getElementById('clear-cart');
const payBtn = document.getElementById('pay-btn');
const bill = document.getElementById('bill');
const billContent = document.getElementById('bill-content');
const billClose = document.getElementById('bill-close');
const printBill = document.getElementById('print-bill');
const newOrderBtn = document.getElementById('new-order');
const customerName = document.getElementById('customer-name');
let currentBill = null;
let printing = false;

function renderCart(){
  const items = Object.values(cart);
  if(!items.length){ cartItems.innerHTML='<p class="empty-cart">No items yet. Tap an item to add it.</p>'; }
  else cartItems.innerHTML = items.map(i=>`<div class="cart-row"><div><b>${i.name}</b><small>${money(i.price)} each</small></div><div class="qty"><button type="button" data-action="minus" data-name="${i.name}">−</button><span>${i.qty}</span><button type="button" data-action="plus" data-name="${i.name}">+</button></div><strong>${money(i.price*i.qty)}</strong></div>`).join('');
  const total=items.reduce((s,i)=>s+i.price*i.qty,0); cartTotal.textContent=money(total); payBtn.disabled=!items.length;
}

document.querySelectorAll('.pos-item').forEach(btn=>btn.addEventListener('click',e=>{
  e.preventDefault();
  const name=btn.dataset.name, price=Number(btn.dataset.price);
  if(!cart[name]) cart[name]={name,price,qty:0};
  cart[name].qty++;
  renderCart();
}));

cartItems.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  const item=cart[b.dataset.name]; if(!item)return;
  if(b.dataset.action==='plus') item.qty++; else item.qty--;
  if(item.qty<=0) delete cart[b.dataset.name];
  renderCart();
});

clearCart.addEventListener('click',()=>{Object.keys(cart).forEach(k=>delete cart[k]);renderCart();});
function orderNo(){return 'KT-'+String(Date.now()).slice(-6)}

function buildBill(items,total,order,now,customer,orderType,payment){
  return `<div class="bill-logo">KULHAD TALES</div>
  <p class="bill-sub">Chai · Food · Good Company</p>
  <hr>
  <div class="bill-meta"><span>Order: ${order}</span><span>${now.toLocaleString('en-IN')}</span></div>
  <div class="bill-meta bill-extra"><span>Type: ${orderType}</span><span>Payment: ${payment}</span></div>
  ${customer ? `<div class="bill-customer">Customer: <b>${customer}</b></div>` : ''}
  <div class="bill-lines">${items.map(i=>`<div><span>${i.name} × ${i.qty}</span><b>${money(i.price*i.qty)}</b></div>`).join('')}</div>
  <hr><div class="bill-grand"><span>TOTAL PAID</span><strong>${money(total)}</strong></div>
  <p class="paid">✓ PAYMENT SUCCESSFUL — DEMO</p>
  <p class="bill-thanks">Thank you for visiting KULHAD TALES!</p>`;
}

payBtn.addEventListener('click',e=>{
  e.preventDefault();
  const items=Object.values(cart), total=items.reduce((s,i)=>s+i.price*i.qty,0); if(!total)return;
  const now=new Date(), order=orderNo();
  const customer=(customerName.value||'').trim().replace(/[<>]/g,'');
  const orderType=document.querySelector('input[name="order-type"]:checked')?.value||'Dine-in';
  const payment=document.querySelector('input[name="payment"]:checked')?.value||'UPI';
  currentBill={items:items.map(i=>({...i})),total,order,time:now,customer,orderType,payment};
  billContent.innerHTML=buildBill(items,total,order,now,customer,orderType,payment);
  bill.setAttribute('aria-hidden','false'); bill.classList.add('open');
});

billClose.addEventListener('click',()=>bill.classList.remove('open'));
bill.addEventListener('click',e=>{if(e.target===bill)bill.classList.remove('open')});

// Print only a tiny receipt document. This prevents the main website from being printed,
// prevents blank pages, and prevents the menu/page from creating multiple PDF pages.
printBill.addEventListener('click',()=>{
  if(!currentBill || printing) return;
  printing=true;
  printBill.disabled=true;
  const {items,total,order,time,customer,orderType,payment}=currentBill;
  const receipt=buildBill(items,total,order,time,customer,orderType,payment);
  const w=window.open('', 'kulhadReceipt', 'width=420,height=720');
  if(!w){
    alert('Please allow pop-ups for this site, then click Print Bill again.');
    printing=false; printBill.disabled=false; return;
  }
  w.document.open();
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>KULHAD TALES ${order}</title><style>
    @page{size:80mm auto;margin:0}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;color:#17110e}
    body{font-family:Arial,Helvetica,sans-serif;width:80mm;padding:7mm 5mm;font-size:12px}
    .bill-logo{text-align:center;font-family:Georgia,serif;font-size:21px;font-weight:700;letter-spacing:.08em}
    .bill-sub{text-align:center;color:#666;font-size:9px;margin:4px 0 10px}
    hr{border:0;border-top:1px dashed #777;margin:9px 0}
    .bill-meta{display:flex;justify-content:space-between;gap:8px;font-size:8px;color:#555}
    .bill-lines>div{display:flex;justify-content:space-between;gap:8px;padding:5px 0;font-size:11px}
    .bill-grand{display:flex;justify-content:space-between;font-weight:700;font-size:12px}
    .bill-grand strong{font-size:17px}
    .paid{text-align:center;font-weight:700;font-size:9px;margin:13px 0 7px}
    .bill-thanks{text-align:center;color:#666;font-size:9px;margin:0}
  </style></head><body>${receipt}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(()=>{
    try{w.print();}finally{
      setTimeout(()=>{try{w.close()}catch(_){ } printing=false; printBill.disabled=false;},700);
    }
  },300);
});

renderCart();

newOrderBtn.addEventListener('click',()=>{ Object.keys(cart).forEach(k=>delete cart[k]); renderCart(); customerName.value=''; bill.classList.remove('open'); });
