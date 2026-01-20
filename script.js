const homePage = document.getElementById("homePage");
const results = document.getElementById("results");
const detailPage = document.getElementById("detailPage");
const readerPage = document.getElementById("readerPage");
const chapterList = document.getElementById("chapterList");
const readerPages = document.getElementById("readerPages");
const commentsList = document.getElementById("commentsList");
const commentInput = document.getElementById("commentInput");
const topBar = document.querySelector(".topBar");
const genreContainer = document.getElementById("genreContainer");
const advancedSearch = document.getElementById("advancedSearch");
const statusFilter = document.getElementById("statusFilter");

// ======= CURRENT STATE =======
let currentManhua = null;
let currentChapter = 0;
let comments = {};
let activeGenres = { include: [], exclude: [] };

// ======= FULL GENRES LIST =======
const allGenres = ["Action","Adult","Adventure","Anthology","Cartoon","Comedy","Cooking","Demons","Drama","Doujinshi","Ecchi","Fantasy","Full Color","Game","Ghosts","Harem","Historical","Horror","Isekai","Josei","Long strip","Magic","Martial arts","Manhua","Manhwa","Medical","Mecha","Monster","Monster girls","Mafia","Music","Mystery","One shot","Office","Office workers","Police","Psychological","Reincarnation","Romance","School life","Sci fi","Seinen","Shounen","Shounen ai","Shoujo","Shoujo ai","Soft Yaoi","Sports","Super Power","Superhero","Thriller","Time travel","Tragedy","Vampire","Vampires","Video games","Web comic","Webtoons","Yuri","Yaoi","tly cloudy","Adaptation"];

// ======= EXAMPLE MANHUAS INCLUDING WHO MADE ME A PRINCESS =======
let manhuas = [
  {
    title: "Who Made Me a Princess",
    alt: "어쩌다 공주가 되어버렸다",
    cover: "https://i.imgur.com/yourCoverImage.jpg",
    author: "Plutus",
    status: "Ongoing",
    genres: ["Fantasy","Romance","Drama"],
    lastUpdated: "2026-01-20",
    views: 50000,
    description: "A girl reincarnates as a princess in a novel and must survive her father’s palace.",
    chapters: Array.from({length:125},(_,i)=>({title:`Chapter ${i+1}`, pages:[]}))
  },
  {
    title: "Solo Leveling",
    alt: "나 혼자만 레벨업",
    cover: "https://i.imgur.com/8QZQZQZ.jpg",
    author: "Chugong",
    status: "Completed",
    genres: ["Action","Adventure","Fantasy"],
    lastUpdated: "2026-01-20",
    views: 120000,
    description: "A weak hunter becomes the strongest.",
    chapters:[
      { title: "Chapter 1", pages:["https://i.imgur.com/page1.jpg","https://i.imgur.com/page2.jpg"] },
      { title: "Chapter 2", pages:["https://i.imgur.com/page3.jpg","https://i.imgur.com/page4.jpg"] }
    ]
  },
  {
    title: "Tower of God",
    alt: "신의 탑",
    cover: "https://i.imgur.com/lUu0FQA.jpg",
    author: "SIU",
    status: "Ongoing",
    genres: ["Action","Adventure","Mystery"],
    lastUpdated: "2026-01-19",
    views: 95000,
    description: "A boy enters a mysterious tower seeking his friend.",
    chapters:[{ title: "Chapter 1", pages:["https://i.imgur.com/page5.jpg","https://i.imgur.com/page6.jpg"] }]
  }
];

// ======= HOME PAGE RENDER =======
function renderHome(list=manhuas){
  results.innerHTML = "";
  list.forEach(m=>{
    const wrap = document.createElement("div");
    wrap.className = "coverWrap";
    wrap.innerHTML = `
      <img src="${m.cover}" alt="${m.alt}">
      <div class="coverOverlay"><button onclick="startReading(event,'${m.title}')">Read</button></div>
      <div class="coverTitle">${m.title}</div>
    `;
    wrap.addEventListener("click", e=>{
      if(!e.target.closest("button")) openDetailPage(m);
    });
    results.appendChild(wrap);
  });
}

// ======= DETAIL PAGE =======
function openDetailPage(m){
  homePage.style.display="none";
  readerPage.style.display="none";
  detailPage.style.display="block";
  topBar.style.display = "flex";

  document.getElementById("detailCover").src = m.cover;
  document.getElementById("detailTitle").textContent = m.title;
  document.getElementById("detailAlt").textContent = m.alt;
  document.getElementById("detailAuthor").textContent = m.author;
  document.getElementById("detailStatus").textContent = m.status;
  document.getElementById("detailGenres").textContent = m.genres.join(", ");
  document.getElementById("detailChapters").textContent = m.chapters.length;
  document.getElementById("detailUpdated").textContent = m.lastUpdated;
  document.getElementById("detailViews").textContent = m.views;
  document.getElementById("detailDescription").textContent = m.description;

  chapterList.innerHTML="";
  m.chapters.forEach((c,i)=>{
    const btn=document.createElement("button");
    btn.textContent=c.title;
    btn.onclick=()=>startChapter(m,i);
    chapterList.appendChild(btn);
  });
}

// ======= BACK TO HOME =======
function backToHome(){
  detailPage.style.display="none";
  readerPage.style.display="none";
  homePage.style.display="block";
  topBar.style.display = "flex";
}

// ======= START READING =======
function startReading(e,title){
  e.stopPropagation();
  const manhua = manhuas.find(m=>m.title===title);
  if(!manhua || !manhua.chapters.length){ alert("No chapters!"); return; }
  startChapter(manhua,0);
}

// ======= CHAPTER READER =======
function startChapter(m,index){
  currentManhua = m;
  currentChapter = index;
  showReader();
}

function showReader(){
  topBar.style.display = "none";
  detailPage.style.display="none";
  homePage.style.display="none";
  readerPage.style.display="block";

  const chapter = currentManhua.chapters[currentChapter];
  readerPages.innerHTML = "";

  if(chapter.pages.length===0){
    readerPages.textContent="Pages not uploaded yet.";
  } else {
    chapter.pages.forEach(p=>{
      const img = document.createElement("img");
      img.src = p;
      img.className = "readerImg";
      readerPages.appendChild(img);
    });
  }

  document.getElementById("chapterTitle").textContent = `Chapter ${currentChapter+1}: ${chapter.title}`;
  document.getElementById("chapterInfo").textContent = `Author: ${currentManhua.author} | Status: ${currentManhua.status} | Genres: ${currentManhua.genres.join(", ")} | Views: ${currentManhua.views || 0}`;

  loadComments();
}

// ======= COMMENTS =======
function getCommentKey(){ return `${currentManhua.title}-${currentChapter}`; }

function loadComments(){
  const key = getCommentKey();
  commentsList.innerHTML="";
  if(comments[key]){
    comments[key].forEach(c=>{
      const div=document.createElement("div");
      div.textContent=`${c.user}: ${c.msg}`;
      div.style.marginBottom="5px";
      commentsList.appendChild(div);
    });
  }
}

function postComment(){
  const key=getCommentKey();
  const msg=commentInput.value.trim();
  if(!msg) return;
  if(!comments[key]) comments[key]=[];
  comments[key].push({user:"Guest",msg});
  commentInput.value="";
  loadComments();
}

// ======= CHAPTER NAVIGATION =======
function nextChapter(){
  if(currentChapter<currentManhua.chapters.length-1){
    currentChapter++;
    showReader();
  } else alert("No more chapters!");
}

function prevChapter(){
  if(currentChapter>0){
    currentChapter--;
    showReader();
  } else alert("This is the first chapter!");
}

function backToDetail(){
  readerPage.style.display="none";
  detailPage.style.display="block";
  topBar.style.display = "flex";
}

// ======= ADVANCED SEARCH =======
function toggleAdvancedSearch() {
  if(!advancedSearch) return;
  if(advancedSearch.style.display==="none" || advancedSearch.style.display==="") advancedSearch.style.display="block";
  else advancedSearch.style.display="none";
}

// Populate all genres dynamically
function renderGenres() {
  if(!genreContainer) return;
  genreContainer.innerHTML = "";
  allGenres.sort().forEach(g=>{
    const btn=document.createElement("button");
    btn.textContent=g;
    btn.className="genreBtn";
    btn.addEventListener("click",()=>toggleGenre(g,btn));
    genreContainer.appendChild(btn);
  });
}

// Toggle genre include/exclude
function toggleGenre(name,btn){
  if(!activeGenres.include.includes(name) && !activeGenres.exclude.includes(name)){
    activeGenres.include.push(name);
    btn.classList.add("activeInclude");
  } else if(activeGenres.include.includes(name)){
    activeGenres.include = activeGenres.include.filter(x=>x!==name);
    activeGenres.exclude.push(name);
    btn.classList.remove("activeInclude");
    btn.classList.add("activeExclude");
  } else {
    activeGenres.exclude = activeGenres.exclude.filter(x=>x!==name);
    btn.classList.remove("activeExclude");
  }
  applyAdvancedFilters();
}

// Apply filters
function applyAdvancedFilters(){
  const title = document.getElementById("advTitle")?.value.toLowerCase()||"";
  const author = document.getElementById("advAuthor")?.value.toLowerCase()||"";
  const status = statusFilter?.value||"";

  let filtered = manhuas.filter(m=>{
    if(title && !m.title.toLowerCase().includes(title)) return false;
    if(author && !m.author.toLowerCase().includes(author)) return false;
    if(status && m.status!==status) return false;

    for(let inc of activeGenres.include) if(!m.genres.includes(inc)) return false;
    for(let exc of activeGenres.exclude) if(m.genres.includes(exc)) return false;

    return true;
  });

  renderHome(filtered);
}

// Reset filters
function resetFilters(){
  document.getElementById("advTitle").value="";
  document.getElementById("advAuthor").value="";
  statusFilter.value="";
  activeGenres.include=[];
  activeGenres.exclude=[];
  renderGenres();
  renderHome(manhuas);
}

// ======= INITIALIZE =======
renderGenres();
renderHome(manhuas);
