const form = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total');
const clearBtn = document.getElementById('clear-btn');
const downloadBtn = document.getElementById('download-btn');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
expenses.forEach(renderExpense);
updateTotal();

form.addEventListener('submit', handleAddExpense);
clearBtn.addEventListener('click', handleClearExpenses);
downloadBtn.addEventListener('click', downloadPDF);

function handleAddExpense(e) {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value.trim();
  const date = dateInput.value;

  if (!isValidExpense(amount, category, date)) {
    alert('Please enter valid amount, category, and date.');
    return;
  }

  const newExpense = {
    id: Date.now(),
    amount,
    category,
    date
  };

  expenses.push(newExpense);
  saveExpenses();
  renderExpense(newExpense);
  updateTotal();
  form.reset();
}

function isValidExpense(amount, category, date) {
  return !isNaN(amount) && amount > 0 && category !== '' && date;
}

function handleClearExpenses() {
  if (confirm('Are you sure you want to clear all expenses?')) {
    expenses = [];
    saveExpenses();
    expenseList.innerHTML = '';
    updateTotal();
  }
}

function renderExpense(expense) {
  const li = document.createElement('li');
  li.dataset.id = expense.id;
  li.textContent = `${expense.date} – ${expense.amount.toFixed(2)} BGN – ${expense.category}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.addEventListener('click', () => deleteExpense(expense.id));

  li.appendChild(deleteBtn);
  expenseList.appendChild(li);
}

function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveExpenses();

  const li = document.querySelector(`li[data-id="${id}"]`);
  if (li) li.remove();
  
  updateTotal();
}

function updateTotal() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  totalDisplay.textContent = `Total: ${total.toFixed(2)} BGN`;
}

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Expense Tracker Report", 14, 22);

  const columns = [
    { header: 'No.', dataKey: 'no' },
    { header: 'Date', dataKey: 'date' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Amount (BGN)', dataKey: 'amount' }
  ];

  const rows = expenses.map((exp, index) => ({
    no: index + 1,
    date: exp.date,
    category: exp.category,
    amount: exp.amount.toFixed(2)
  }));

  if (rows.length === 0) {
    doc.setFontSize(12);
    doc.text("No expenses recorded.", 14, 40);
  } else {
    doc.autoTable({
      startY: 30,
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      styles: { fillColor: [240, 255, 240] },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total: ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)} BGN`, 14, finalY + 10);
  }

  doc.save("expenses.pdf");
}
