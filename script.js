function generateInvoiceID() {
  const now = new Date();
  return 'INV-' + now.getFullYear().toString().slice(-2) + 
         (now.getMonth() + 1).toString().padStart(2, '0') + 
         now.getDate().toString().padStart(2, '0') + 
         '-' + Math.floor(Math.random() * 1000);
}

function saveDraft() {
  const formData = {
    invoiceId: document.getElementById('invoiceId').value,
    businessName: document.getElementById('businessName').value,
    sellerGST: document.getElementById('sellerGST').value,
    customerName: document.getElementById('customerName').value,
    buyerGST: document.getElementById('buyerGST').value,
    invoiceDate: document.getElementById('invoiceDate').value,
    items: []
  };

  const names = document.querySelectorAll('.item-name');
  const qtys = document.querySelectorAll('.item-qty');
  const prices = document.querySelectorAll('.item-price');
  const gstPercents = document.querySelectorAll('.item-gst');

  for (let i = 0; i < names.length; i++) {
    formData.items.push({
      name: names[i].value,
      qty: qtys[i].value,
      price: prices[i].value,
      gst: gstPercents[i].value
    });
  }

  localStorage.setItem('invoiceDraft', JSON.stringify(formData));
}

function loadDraft() {
  const data = JSON.parse(localStorage.getItem('invoiceDraft'));
  if (!data) return;

  document.getElementById('invoiceId').value = data.invoiceId || generateInvoiceID();
  document.getElementById('businessName').value = data.businessName || '';
  document.getElementById('sellerGST').value = data.sellerGST || '';
  document.getElementById('customerName').value = data.customerName || '';
  document.getElementById('buyerGST').value = data.buyerGST || '';
  document.getElementById('invoiceDate').value = data.invoiceDate || '';

  // Clear existing items
  document.querySelectorAll('.item-row').forEach((row, i) => {
    if (i > 0) row.remove();
  });

  data.items.forEach((item, index) => {
    if (index > 0) addItem();
    const rows = document.querySelectorAll('.item-row');
    rows[index].querySelector('.item-name').value = item.name;
    rows[index].querySelector('.item-qty').value = item.qty;
    rows[index].querySelector('.item-price').value = item.price;
    rows[index].querySelector('.item-gst').value = item.gst;
  });
}

function clearDraft() {
  localStorage.removeItem('invoiceDraft');
  location.reload();
}

function addItem() {
  const itemHTML = `
    <div class="item-row">
      <input type="text" class="item-name" placeholder="Item Name" required>
      <input type="number" class="item-qty" placeholder="Qty" required>
      <input type="number" class="item-price" placeholder="Price" required>
      <input type="number" class="item-gst" placeholder="GST (%)" required>
    </div>
  `;
  document.getElementById('items-section').insertAdjacentHTML('beforeend', itemHTML);
}

function generateInvoice() {
  saveDraft(); // Save before generating

  const invoiceId = document.getElementById('invoiceId').value;
  const business = document.getElementById('businessName').value;
  const sellerGST = document.getElementById('sellerGST').value;
  const customer = document.getElementById('customerName').value;
  const buyerGST = document.getElementById('buyerGST').value;
  const date = document.getElementById('invoiceDate').value;

  const names = document.querySelectorAll('.item-name');
  const qtys = document.querySelectorAll('.item-qty');
  const prices = document.querySelectorAll('.item-price');
  const gstPercents = document.querySelectorAll('.item-gst');

  let subtotal = 0;
  let gstTotal = 0;
  let itemRows = '';

  for (let i = 0; i < names.length; i++) {
    const name = names[i].value;
    const qty = parseFloat(qtys[i].value);
    const price = parseFloat(prices[i].value);
    const gst = parseFloat(gstPercents[i].value);

    const amount = qty * price;
    const gstAmount = (amount * gst) / 100;

    subtotal += amount;
    gstTotal += gstAmount;

    itemRows += `
      <tr>
        <td>${name}</td>
        <td>${qty}</td>
        <td>₹${price.toFixed(2)}</td>
        <td>${gst}%</td>
        <td>₹${(amount + gstAmount).toFixed(2)}</td>
      </tr>
    `;
  }

  const total = subtotal + gstTotal;

  document.getElementById('subtotal').innerText = `Subtotal: ₹${subtotal.toFixed(2)}`;
  document.getElementById('gstAmount').innerText = `GST: ₹${gstTotal.toFixed(2)}`;
  document.getElementById('grandTotal').innerText = `Total: ₹${total.toFixed(2)}`;

  const outputHTML = `
    <div id="invoicePreviewBox">
      <h2>${business}</h2>
      <p><strong>Invoice No:</strong> ${invoiceId}</p>
      <p><strong>Seller GSTIN:</strong> ${sellerGST || 'N/A'}</p>
      <p><strong>Customer:</strong> ${customer}</p>
      <p><strong>Buyer GSTIN:</strong> ${buyerGST || 'N/A'}</p>
      <p><strong>Date:</strong> ${date}</p>
      <br>
      <table border="1" cellspacing="0" cellpadding="5" width="100%">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>GST</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <h3>Total: ₹${total.toFixed(2)}</h3>
    </div>
  `;

  document.getElementById('invoice-output').innerHTML = outputHTML;
}

function downloadInvoice() {
  const element = document.getElementById('invoice-output');
  const opt = {
    margin: 0.5,
    filename: 'invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

// Auto-save on change
document.addEventListener('input', saveDraft);
window.onload = loadDraft;
