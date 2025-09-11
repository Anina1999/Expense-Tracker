const form = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expense-list');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

expenses.forEach(renderExpense);
updateTotal();

form.addEventListener('submit', handleAddExpense);

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

