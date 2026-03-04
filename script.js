// ================== Section Navigation ==================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
}

// ================== User Login ==================
function login() {
  const user = document.getElementById("username").value;
  if(!user) return alert("Enter a username");

  localStorage.setItem("sokUser", user);

  // Initialize balances
  if(!localStorage.getItem("sokBalances")) {
    const balances = { LR:0, GH:0, NG:0, SN:0 };
    localStorage.setItem("sokBalances", JSON.stringify(balances));
  }

  // Initialize affiliate
  if(!localStorage.getItem("sokAffiliate")) localStorage.setItem("sokAffiliate", 0);

  // Initialize posts
  if(!localStorage.getItem("sokPosts")) localStorage.setItem("sokPosts", JSON.stringify([]));

  document.getElementById("welcome").innerText = `Hello, ${user}`;
  updateBalances();
  updateCountryBalance();
  loadFeed();
  loadProfile();
  showSection('dashboard');
}

// ================== Profile ==================
function saveProfile() {
  const profile = {
    fullName: document.getElementById("fullName").value,
    dob: document.getElementById("dob").value,
    nationality: document.getElementById("nationality").value,
    countryResidence: document.getElementById("countryResidence").value,
    email: document.getElementById("email").value,
    contact: document.getElementById("contact").value,
    parent: document.getElementById("parent").value,
    twoFA: document.getElementById("2fa").value,
    profilePic: document.getElementById("profilePic").files[0] ? URL.createObjectURL(document.getElementById("profilePic").files[0]) : '',
    coverPic: document.getElementById("coverPic").files[0] ? URL.createObjectURL(document.getElementById("coverPic").files[0]) : ''
  };
  localStorage.setItem("sokProfile", JSON.stringify(profile));
  alert("Profile saved locally!");
  loadProfile();
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("sokProfile") || "{}");
  if(!profile) return;

  document.getElementById("fullName").value = profile.fullName || '';
  document.getElementById("dob").value = profile.dob || '';
  document.getElementById("nationality").value = profile.nationality || '';
  document.getElementById("countryResidence").value = profile.countryResidence || '';
  document.getElementById("email").value = profile.email || '';
  document.getElementById("contact").value = profile.contact || '';
  document.getElementById("parent").value = profile.parent || '';
  document.getElementById("2fa").value = profile.twoFA || '';

  // Display images
  if(profile.profilePic) document.getElementById("profilePic").style.backgroundImage = `url(${profile.profilePic})`;
  if(profile.coverPic) document.getElementById("coverPic").style.backgroundImage = `url(${profile.coverPic})`;
}

// ================== Dashboard ==================
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

// ================== Affiliate ==================
function addAffiliate() {
  const income = parseFloat(prompt("Enter affiliate income earned:"));
  if(!income || income <= 0) return;
  let aff = parseFloat(localStorage.getItem("sokAffiliate"));
  aff += income;
  localStorage.setItem("sokAffiliate", aff);
  updateBalances();
  alert(`Added $${income} to affiliate earnings!`);
}

// ================== Tools ==================
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

function calculateBudget() {
  const income = parseFloat(document.getElementById("income").value);
  const expenses = parseFloat(document.getElementById("expenses").value);
  if(isNaN(income) || isNaN(expenses)) return alert("Enter valid numbers");
  const savings = income - expenses;
  document.getElementById("budgetResult").innerText = `Your projected savings: $${savings.toFixed(2)}`;
}

// ================== Feed (Posts, Likes, Comments) ==================
function addPost() {
  const content = document.getElementById("postContent").value;
  if(!content) return alert("Write something before posting!");
  const posts = JSON.parse(localStorage.getItem("sokPosts") || "[]");
  const user = localStorage.getItem("sokUser");
  posts.push({ user, content, likes: 0, comments: [] });
  localStorage.setItem("sokPosts", JSON.stringify(posts));
  document.getElementById("postContent").value = '';
  loadFeed();
}

function loadFeed() {
  const posts = JSON.parse(localStorage.getItem("sokPosts") || "[]");
  const feedContainer = document.getElementById("feedPosts");
  feedContainer.innerHTML = '';
  posts.reverse().forEach((p,i)=>{
    const card = document.createElement("div");
    card.className = 'card';
    card.innerHTML = `
      <p><strong>${p.user}</strong>: ${p.content}</p>
      <button onclick="likePost(${i})">Like (${p.likes})</button>
      <button onclick="commentPost(${i})">Comment (${p.comments.length})</button>
      <div id="comments${i}"></div>
    `;
    feedContainer.appendChild(card);

    // Show comments
    const commentsDiv = document.getElementById(`comments${i}`);
    commentsDiv.innerHTML = '';
    p.comments.forEach(c=>{
      const cP = document.createElement("p");
      cP.textContent = `${c.user}: ${c.text}`;
      commentsDiv.appendChild(cP);
    });
  });
}

function likePost(index) {
  const posts = JSON.parse(localStorage.getItem("sokPosts"));
  posts[index].likes +=1;
  localStorage.setItem("sokPosts", JSON.stringify(posts));
  loadFeed();
}

function commentPost(index) {
  const comment = prompt("Enter your comment:");
  if(!comment) return;
  const posts = JSON.parse(localStorage.getItem("sokPosts"));
  const user = localStorage.getItem("sokUser");
  posts[index].comments.push({ user, text: comment });
  localStorage.setItem("sokPosts", JSON.stringify(posts));
  loadFeed();
}

// ================== Support Center ==================
function sendSupport() {
  const msg = document.getElementById("supportMessage").value;
  if(!msg) return alert("Write a message to support!");
  alert(`Thank you! Your support message has been recorded (simulation only).\nMessage: ${msg}`);
  document.getElementById("supportMessage").value = '';
}
