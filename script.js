// ================== Section Navigation ==================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
}

// ================== User Login ==================
function login() {
  const user = document.getElementById("username").value;
  if(!user) return alert("Enter a username");
  
  // Store user in localStorage
  localStorage.setItem("sokUser", user);
  
  // Initialize balances if not present
  if(!localStorage.getItem("sokBalances")) {
    const balances = { LR:0, GH:0, NG:0, SN:0 };
    localStorage.setItem("sokBalances", JSON.stringify(balances));
  }
  
  if(!localStorage.getItem("sokAffiliate")) localStorage.setItem("sokAffiliate", 0);
  
  document.getElementById("welcome").innerText = `Hello, ${user}`;
  updateBalances();
  updateCountryBalance();
  showSection('dashboard');
}

// ================== Update Balances ==================
function updateBalances() {
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  const total = Object.values(balances).reduce((a,b)=>a+b,0);
  document.getElementById("balance").innerText = total.toFixed(2);
  document.getElementById("affiliateBalance").innerText = parseFloat(localStorage.getItem("sokAffiliate")).toFixed(2);
}

function updateCountryBalance() {
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  const country = document.getElementById("country").value;
  document.getElementById("countryBalance").innerText = balances[country].toFixed(2);
}

// ================== Deposit & Withdraw ==================
function deposit() {
  const amount = parseFloat(document.getElementById("depositAmount").value);
  if(amount <= 0) return alert("Enter valid deposit amount");
  const country = document.getElementById("country").value;
  
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  balances[country] += amount;
  localStorage.setItem("sokBalances", JSON.stringify(balances));
  
  alert(`Deposited $${amount} via ${document.getElementById("depositMethod").value} in ${country}`);
  updateBalances();
  updateCountryBalance();
}

function withdraw() {
  const amount = parseFloat(document.getElementById("withdrawAmount").value);
  const country = document.getElementById("country").value;
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  
  if(amount <= 0 || amount > balances[country]) return alert("Invalid withdraw amount");
  
  balances[country] -= amount;
  localStorage.setItem("sokBalances", JSON.stringify(balances));
  
  alert(`Withdrew $${amount} via ${document.getElementById("withdrawMethod").value} from ${country}`);
  updateBalances();
  updateCountryBalance();
}

// ================== Affiliate Tracker ==================
function addAffiliate() {
  const income = parseFloat(prompt("Enter affiliate income earned:"));
  if(!income || income <= 0) return;
  let aff = parseFloat(localStorage.getItem("sokAffiliate"));
  aff += income;
  localStorage.setItem("sokAffiliate", aff);
  updateBalances();
  alert(`Added $${income} to affiliate earnings!`);
}

// ================== Currency Converter ==================
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const currencyList = ["USD","EUR","GBP","NGN","JPY","CAD","AUD","INR","CNY"];

currencyList.forEach(c => {
  const o1 = document.createElement("option");
  const o2 = document.createElement("option");
  o1.value = o2.value = c;
  o1.text = o2.text = c;
  fromCurrency.appendChild(o1);
  toCurrency.appendChild(o2);
});

fromCurrency.value = "USD";
toCurrency.value = "EUR";

async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
  const data = await res.json();
  const rate = data.rates[to];
  const result = (amount * rate).toFixed(2);
  document.getElementById("result").innerText = `${amount} ${from} = ${result} ${to}`;
}

// ================== Budget Planner ==================
function calculateBudget() {
  const income = parseFloat(document.getElementById("income").value);
  const expenses = parseFloat(document.getElementById("expenses").value);
  if(isNaN(income) || isNaN(expenses)) return alert("Enter valid numbers");
  const savings = income - expenses;
  document.getElementById("budgetResult").innerText = `Your projected savings: $${savings.toFixed(2)}`;
}
