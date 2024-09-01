document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/index.html') {
      // Login page logic
      const loginForm = document.getElementById('loginForm');
      loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          try {
              await login(email, password);
          } catch (error) {
              document.getElementById('error').innerText = error.message;
          }
      });
  } else if (window.location.pathname === '/dashboard.html') {
      // Dashboard page logic
      const showManageDrugs = document.getElementById('showManageDrugs');
      const showManageOrders = document.getElementById('showManageOrders');
      const content = document.getElementById('content');

      showManageDrugs.addEventListener('click', async () => {
          content.innerHTML = `
              <h3>Manage Drugs</h3>
              <input type="text" id="drugName" placeholder="Drug Name">
              <input type="number" id="drugQuantity" placeholder="Quantity">
              <input type="date" id="drugExpirationDate" placeholder="Expiration Date">
              <button id="addDrugBtn">Add Drug</button>
              <ul id="drugList"></ul>
          `;
          const drugs = await fetchDrugs();
          const drugList = document.getElementById('drugList');
          drugs.forEach(drug => {
              const li = document.createElement('li');
              li.innerText = `${drug.name} - ${drug.quantity} - ${new Date(drug.expirationDate).toLocaleDateString()}`;
              drugList.appendChild(li);
          });
          document.getElementById('addDrugBtn').addEventListener('click', async () => {
              const name = document.getElementById('drugName').value;
              const quantity = document.getElementById('drugQuantity').value;
              const expirationDate = document.getElementById('drugExpirationDate').value;
              await addDrug({ name, quantity, expirationDate });
              location.reload(); // Refresh the page to see the updated drug list
          });
      });

      showManageOrders.addEventListener('click', async () => {
          content.innerHTML = `
              <h3>Manage Orders</h3>
              <ul id="orderList"></ul>
          `;
          const orders = await fetchOrders();
          const orderList = document.getElementById('orderList');
          orders.forEach(order => {
              const li = document.createElement('li');
              li.innerHTML = `
                  Drug: ${order.drug.name} - Quantity: ${order.quantity} - Status: ${order.status}
                  <button onclick="updateOrderStatus('${order._id}', 'shipped')">Mark as Shipped</button>
                  <button onclick="updateOrderStatus('${order._id}', 'delivered')">Mark as Delivered</button>
              `;
              orderList.appendChild(li);
          });
      });
  }
});

// Backend API interactions

async function login(email, password) {
  const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  localStorage.setItem('token', data.token); // Store JWT token
}

async function fetchDrugs() {
  const response = await fetch('http://localhost:5000/api/drugs', {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  });
  return await response.json();
}

async function addDrug(drug) {
  const response = await fetch('http://localhost:5000/api/drugs', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(drug)
  });
  if (!response.ok) throw new Error('Failed to add drug');
}

async function fetchOrders() {
  const response = await fetch('http://localhost:5000/api/orders', {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  });
  return await response.json();
}

async function updateOrderStatus(orderId, status) {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update order status');
}
