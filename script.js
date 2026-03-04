// ===== Initialize default local storage =====
if(!localStorage.getItem("sokBalances")) localStorage.setItem("sokBalances", JSON.stringify({ LR:0, GH:0, NG:0, SN:0 }));
if(!localStorage.getItem("sokAffiliate")) localStorage.setItem("sokAffiliate", 0);
if(!localStorage.getItem("sokPosts")) localStorage.setItem("sokPosts", JSON.stringify([]));
if(!localStorage.getItem("sokProfile")) localStorage.setItem("sokProfile", JSON.stringify({}));

// ===== Section Navigation =====
function showSection(sectionId){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  const sec = document.getElementById(sectionId);
  if(sec){ sec.classList.add("active"); sec.scrollTop=0; }
}

// ===== Login =====
function login(){
  const user = document.getElementById("username").value;
  if(!user) return alert("Enter a username");
  localStorage.setItem("sokUser", user);
  document.getElementById("welcome").innerText = `Hello, ${user}`;
  updateBalances(); updateCountryBalance(); loadProfile(); loadFeed();
  showSection('dashboard');
}

// ===== Dashboard =====
function updateBalances(){
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  const total = Object.values(balances).reduce((a,b)=>a+b,0);
  document.getElementById("balance").innerText = total.toFixed(2);
  document.getElementById("affiliateBalance").innerText = parseFloat(localStorage.getItem("sokAffiliate")).toFixed(2);
}
function updateCountryBalance(){
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  const country = document.getElementById("country").value;
  document.getElementById("countryBalance").innerText = balances[country].toFixed(2);
}
function deposit(){
  const amt = parseFloat(document.getElementById("depositAmount").value);
  if(amt<=0) return alert("Invalid amount");
  const country = document.getElementById("country").value;
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  balances[country]+=amt;
  localStorage.setItem("sokBalances", JSON.stringify(balances));
  updateBalances(); updateCountryBalance();
  alert(`Deposited $${amt} (${document.getElementById("depositMethod").value})`);
}
function withdraw(){
  const amt = parseFloat(document.getElementById("withdrawAmount").value);
  const country = document.getElementById("country").value;
  const balances = JSON.parse(localStorage.getItem("sokBalances"));
  if(amt<=0 || amt>balances[country]) return alert("Invalid withdraw amount");
  balances[country]-=amt;
  localStorage.setItem("sokBalances", JSON.stringify(balances));
  updateBalances(); updateCountryBalance();
  alert(`Withdrew $${amt} (${document.getElementById("withdrawMethod").value})`);
}

// ===== Profile =====
function saveProfile(){
  const profile = {
    fullName: document.getElementById("fullName").value,
    dob: document.getElementById("dob").value,
    nationality: document.getElementById("nationality").value,
    countryResidence: document.getElementById("countryResidence").value,
    email: document.getElementById("email").value,
    contact: document.getElementById("contact").value,
    parent: document.getElementById("parent").value,
    twoFA: document.getElementById("2fa").value,
    profilePic: document.getElementById("profilePic").files[0]?URL.createObjectURL(document.getElementById("profilePic").files[0]):'',
    coverPic: document.getElementById("coverPic").files[0]?URL.createObjectURL(document.getElementById("coverPic").files[0]):''
  };
  localStorage.setItem("sokProfile", JSON.stringify(profile));
  alert("Profile saved locally!");
}
function loadProfile(){
  const profile = JSON.parse(localStorage.getItem("sokProfile"));
  if(!profile) return;
  document.getElementById("fullName").value = profile.fullName || '';
  document.getElementById("dob").value = profile.dob || '';
  document.getElementById("nationality").value = profile.nationality || '';
  document.getElementById("countryResidence").value = profile.countryResidence || '';
  document.getElementById("email").value = profile.email || '';
  document.getElementById("contact").value = profile.contact || '';
  document.getElementById("parent").value = profile.parent || '';
  document.getElementById("2fa").value = profile.twoFA || '';
}

// ===== Feed =====
function addPost(){
  const content = document.getElementById("postContent").value;
  if(!content) return alert("Write something before posting!");
  const posts = JSON.parse(localStorage.getItem("sokPosts")||"[]");
  posts.push({user: localStorage.getItem("sokUser"), content, likes:0, comments:[]});
  localStorage.setItem("sokPosts", JSON.stringify(posts));
  document.getElementById("postContent").value='';
  loadFeed();
}
function loadFeed(){
  const posts = JSON.parse(localStorage.getItem("sokPosts")||"[]");
  const feed = document.getElementById("feedPosts");
  feed.innerHTML='';
  posts.slice().reverse().forEach((p,i)=>{
    const card = document.createElement("div");
    card.className='card';
    card.innerHTML=`
      <p><strong>${p.user}</strong>: ${p.content}</p>
      <button onclick="likePost(${i})">Like (${p.likes})</button>
      <button onclick="commentPost(${i})">Comment (${p.comments.length})</button>
      <div id="comments${i}"></div>
    `;
    feed.appendChild(card);
    const commentsDiv = document.getElementById(`comments${i}`);
    p.comments.forEach(c=>{
      const cp = document.createElement("p"); cp.textContent=`${c.user}: ${c.text}`;
      commentsDiv.appendChild(cp);
    });
  });
}
function likePost(index){
  const posts = JSON.parse(localStorage.getItem("sokPosts"));
  posts[index].likes+=1;
  localStorage.setItem("sokPosts", JSON.stringify(posts));
  loadFeed();
}
function commentPost(index){
  const comment = prompt("Enter your comment:");
  if(!comment) return;
  const posts = JSON.parse(localStorage.getItem("sokPosts"));
  posts[index].comments.push({user: localStorage.getItem("sokUser"), text:comment});
  localStorage.setItem("sokPosts", JSON.stringify(posts));
  loadFeed();
}

// ===== Affiliate =====
function addAffiliate(){
  const inc = parseFloat(prompt("Enter affiliate income:"));
  if(!inc || inc<=0) return;
  const total = parseFloat(localStorage.getItem("sokAffiliate")) + inc;
  localStorage.setItem("sokAffiliate", total);
  updateBalances();
  alert(`Added $${inc} to affiliate earnings!`);
}

// ===== Support =====
function sendSupport(){
  const msg = document.getElementById("supportMessage").value;
  if(!msg) return alert("Write a message to support!");
  alert(`Thank you! Your message has been recorded (simulation).\nMessage: ${msg}`);
  document.getElementById("supportMessage").value='';
}

// ===== Tools =====
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
["USD","EUR","GBP","NGN","JPY","CAD","AUD","INR","CNY"].forEach(c=>{
  const o1 = document.createElement("option");
  const o2 = document.createElement("option");
  o1.value=o2.value=c; o1.text=o2.text=c;
  fromCurrency.appendChild(o1); toCurrency.appendChild(o2);
});
fromCurrency.value="USD"; toCurrency.value="EUR";

async function convertCurrency(){
  const amount=parseFloat(document.getElementById("amount").value);
  const from=fromCurrency.value; const to=toCurrency.value;
  const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
  const data = await res.json();
  const rate = data.rates[to];
  document.getElementById("result").innerText=`${amount} ${from} = ${(amount*rate).toFixed(2)} ${to}`;
}
function calculateBudget(){
  const income=parseFloat(document.getElementById("income").value);
  const expenses=parseFloat(document.getElementById("expenses").value);
  if(isNaN(income)||isNaN(expenses)) return alert("Enter valid numbers");
  document.getElementById("budgetResult").innerText=`Your projected savings: $${(income-expenses).toFixed(2)}`;
}
