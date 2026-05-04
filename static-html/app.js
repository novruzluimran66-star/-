/* Antalya — фронтенд (без бэкенда)
   - Меню из массива
   - Фильтрация/поиск
   - Корзина + localStorage
   - Имитация оформления заказа (сохраняем историю)
   - Имитация бронирования + генерация .ics
   - Тема (dark/light)
*/

const STORAGE = {
  theme: "antalya_theme",
  cart: "antalya_cart_v1",
  orders: "antalya_orders_v1",
  reservation: "antalya_reservation_v1"
};

const RUB = (n) => `${Math.round(n)} ₽`;
const uid = () => Math.random().toString(16).slice(2, 10).toUpperCase();

const MENU = [
  // Мезе/закуски
  { id:"m1", name:"Хумус классический", cat:"Мезе", price:290, weight:"160 г", kcal:"320", tags:["вег"], desc:"Нежный нут, тахини, оливковое масло, паприка.", ingredients:"нут, тахини, лимон, чеснок, специи" },
  { id:"m2", name:"Бабагануш", cat:"Мезе", price:310, weight:"160 г", kcal:"280", tags:["вег"], desc:"Запечённый баклажан, тахини, дымный аромат.", ingredients:"баклажан, тахини, лимон, чеснок" },
  { id:"m3", name:"Сигара бёрек", cat:"Закуски", price:340, weight:"6 шт", kcal:"420", tags:["сыр"], desc:"Хрустящие рулетики из теста фило с сыром.", ingredients:"тесто фило, сыр, зелень" },

  // Супы
  { id:"s1", name:"Чечевичный суп (Mercimek)", cat:"Супы", price:320, weight:"300 мл", kcal:"210", tags:["вег"], desc:"Классика турецких супов — с лимоном и специями.", ingredients:"чечевица, овощи, специи" },
  { id:"s2", name:"Крем-суп из тыквы", cat:"Супы", price:330, weight:"300 мл", kcal:"240", tags:["вег"], desc:"Сливочный, мягкий, с семечками.", ingredients:"тыква, сливки, специи" },

  // Горячее/гриль
  { id:"g1", name:"Адана-кебаб", cat:"Гриль", price:690, weight:"220 г", kcal:"540", tags:["остро"], desc:"Рубленая баранина, угли, подача с лавашом.", ingredients:"баранина, специи, лаваш, соус" },
  { id:"g2", name:"Люля из курицы", cat:"Гриль", price:590, weight:"220 г", kcal:"460", tags:["нежно"], desc:"Сочный люля-кебаб из курицы с зеленью.", ingredients:"курица, зелень, специи, лаваш" },
  { id:"g3", name:"Донер-тарелка", cat:"Горячее", price:640, weight:"320 г", kcal:"610", tags:["хит"], desc:"Донер, рис/булгур, салат, соусы.", ingredients:"мясо, овощи, рис/булгур, соусы" },
  { id:"g4", name:"Искендер", cat:"Горячее", price:720, weight:"350 г", kcal:"740", tags:["хит"], desc:"Донер на лаваше с томатным соусом и йогуртом.", ingredients:"донер, лаваш, йогурт, томатный соус" },

  // Выпечка
  { id:"b1", name:"Пиде с сыром", cat:"Выпечка", price:520, weight:"300 г", kcal:"690", tags:["сыр"], desc:"Лодочка из теста с тягучим сыром.", ingredients:"тесто, сыр, масло" },
  { id:"b2", name:"Лахмаджун", cat:"Выпечка", price:390, weight:"1 шт", kcal:"410", tags:["мясо"], desc:"Тонкая лепёшка с пряным фаршем и зеленью.", ingredients:"тесто, фарш, томаты, зелень" },

  // Десерты
  { id:"d1", name:"Пахлава", cat:"Десерты", price:280, weight:"120 г", kcal:"520", tags:["орехи"], desc:"Слоёная, медовая, с орехами.", ingredients:"тесто, мёд, орехи, масло" },
  { id:"d2", name:"Кюнефе", cat:"Десерты", price:420, weight:"180 г", kcal:"610", tags:["сыр"], desc:"Тёплый десерт с сыром и сиропом.", ingredients:"кадаиф, сыр, сироп" },

  // Напитки
  { id:"p1", name:"Айран", cat:"Напитки", price:160, weight:"300 мл", kcal:"90", tags:["классика"], desc:"Освежающий кисломолочный напиток.", ingredients:"йогурт, вода, соль" },
  { id:"p2", name:"Чай турецкий", cat:"Напитки", price:140, weight:"250 мл", kcal:"0", tags:["чай"], desc:"Крепкий чёрный чай по-турецки.", ingredients:"чай" }
];

// Карта изображений блюд -> имя файла (без расширения).
// Фото ищутся ТОЛЬКО локально в одной из папок:
// - images/dishes/
// - images/
// - food-photos/
// - фото для сайта имран/
// Можно класть файлы с расширениями: .jpg .jpeg .png .webp .jfif
const IMAGES = {
  // Мезе/закуски
  m1: "хумус",
  m2: "бабагануш",
  m3: "Сигара бёрек",
  // Супы
  s1: "Чечевичный суп (Mercimek)",
  s2: "Крем-суп из тыквы",
  // Гриль / Горячее
  g1: "Адана-кебаб",
  g2: "Люля из курицы",
  g3: "Донер-тарелка",
  g4: "Искендер-кебаб",
  // Выпечка
  b1: "Пиде с сыром",
  b2: "Лахмаджун",
  // Десерты
  d1: "Пахлава",
  d2: "Кюнефе",
  // Напитки
  p1: "Айран",
  p2: "Турецкий чай"
};

function encodePathSegments(path){
  if (!path) return path;
  const s = String(path);
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  const lead = s.startsWith("/") ? "/" : "";
  const rest = lead ? s.slice(1) : s;
  const parts = rest.split("/").filter(Boolean);
  return lead + parts.map((seg) => encodeURIComponent(seg)).join("/");
}

// Пытаемся загрузить картинку с запасными расширениями
function setImageWithFallback(imgEl, imageName){
  if (!imgEl) return;
  const folders = [
    "images/dishes/",
    "images/",
    "food-photos/",
    "фото для сайта имран/",
    "antalya-laravel/public/images/dishes/"
  ];
  const exts = [".jfif", ".jpg", ".jpeg", ".png", ".webp"];
  const candidates = [];
  folders.forEach(folder => {
    exts.forEach(ext => candidates.push(`${folder}${imageName}${ext}`));
  });
  let tryIdx = 0;

  function tryNext(){
    if (tryIdx >= candidates.length){
      // исчерпали варианты — скрываем обёртку, если есть
      const wrap = imgEl.closest(".menuItem__imgWrap, .dishImgWrap");
      if (wrap) wrap.hidden = true, (wrap.style.display = "none");
      return;
    }
    const nextSrc = encodePathSegments(candidates[tryIdx++]);
    // показываем обёртку на всякий случай
    const wrap = imgEl.closest(".menuItem__imgWrap, .dishImgWrap");
    if (wrap) wrap.hidden = false, (wrap.style.display = "");
    imgEl.onerror = tryNext;
    imgEl.src = nextSrc;
  }
  tryNext();
}

const CATEGORIES = ["Все", ...Array.from(new Set(MENU.map(x => x.cat)))];

const els = {
  year: document.getElementById("year"),

  categoryChips: document.getElementById("categoryChips"),
  menuGrid: document.getElementById("menuGrid"),
  menuSearch: document.getElementById("menuSearch"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),

  cartBtn: document.getElementById("cartBtn"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartList: document.getElementById("cartList"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartTotals: document.getElementById("cartTotals"),
  cartCount: document.getElementById("cartCount"),
  sumTotal: document.getElementById("sumTotal"),
  sumAdjust: document.getElementById("sumAdjust"),
  sumGrand: document.getElementById("sumGrand"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  openCartFromOrder: document.getElementById("openCartFromOrder"),

  dishModal: document.getElementById("dishModal"),
  dishTitle: document.getElementById("dishTitle"),
  dishDesc: document.getElementById("dishDesc"),
  dishIngredients: document.getElementById("dishIngredients"),
  dishWeight: document.getElementById("dishWeight"),
  dishKcal: document.getElementById("dishKcal"),
  dishAddBtn: document.getElementById("dishAddBtn"),
  dishImg: document.getElementById("dishImg"),
  dishImgWrap: document.getElementById("dishImgWrap"),

  checkoutModal: document.getElementById("checkoutModal"),
  checkoutForm: document.getElementById("checkoutForm"),
  checkoutTotal: document.getElementById("checkoutTotal"),
  addressRow: document.getElementById("addressRow"),

  ordersList: document.getElementById("ordersList"),
  clearOrdersBtn: document.getElementById("clearOrdersBtn"),

  reserveForm: document.getElementById("reserveForm"),
  downloadIcsBtn: document.getElementById("downloadIcsBtn"),

  toast: document.getElementById("toast"),
  themeBtn: document.getElementById("themeBtn"),

  reviewText: document.getElementById("reviewText"),
  reviewMeta: document.getElementById("reviewMeta"),
  prevReview: document.getElementById("prevReview"),
  nextReview: document.getElementById("nextReview"),
};

let state = {
  activeCategory: "Все",
  search: "",
  cart: loadJSON(STORAGE.cart, {}),   // {id: qty}
  orders: loadJSON(STORAGE.orders, []),
  dishModalId: null,
  theme: localStorage.getItem(STORAGE.theme) || "dark",
  fulfillment: "delivery"
};

const REVIEWS = [
  { text: "“Очень сочный адана-кебаб, лаваш свежий, обслуживание быстрое.”", meta:"— Мария, 2 дня назад" },
  { text: "“Пахлава — топ! И чай как в Турции. Вернёмся обязательно.”", meta:"— Илья, 1 неделю назад" },
  { text: "“Быстрая доставка, всё тёплое, соусы вкусные.”", meta:"— Алия, 3 недели назад" }
];
let reviewIdx = 0;

/* ---------- utils ---------- */
function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch{ return fallback; }
}
function save(){
  localStorage.setItem(STORAGE.cart, JSON.stringify(state.cart));
  localStorage.setItem(STORAGE.orders, JSON.stringify(state.orders));
}
function toast(msg){
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (els.toast.hidden = true), 2200);
}
function setTheme(theme){
  state.theme = theme;
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  localStorage.setItem(STORAGE.theme, state.theme);
}
function cartCount(){
  return Object.values(state.cart).reduce((a,b)=>a+b, 0);
}
function cartItems(){
  return Object.entries(state.cart)
    .map(([id, qty]) => ({ item: MENU.find(x => x.id === id), qty }))
    .filter(x => x.item && x.qty > 0);
}
function computeTotals(){
  const items = cartItems();
  const sum = items.reduce((acc, x) => acc + x.item.price * x.qty, 0);

  // delivery fee or pickup discount
  let adjust = 0;
  if (items.length > 0){
    if (state.fulfillment === "delivery"){
      adjust = 199;
    } else {
      adjust = -Math.round(sum * 0.10);
    }
  }
  const grand = Math.max(0, sum + adjust);
  return { sum, adjust, grand };
}

/* ---------- rendering ---------- */
function renderChips(){
  els.categoryChips.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.type = "button";
    btn.textContent = cat;
    btn.setAttribute("aria-pressed", String(state.activeCategory === cat));
    btn.addEventListener("click", () => {
      state.activeCategory = cat;
      render();
    });
    els.categoryChips.appendChild(btn);
  });
}

function renderMenu(){
  const q = state.search.trim().toLowerCase();
  const filtered = MENU.filter(x => {
    const byCat = state.activeCategory === "Все" ? true : x.cat === state.activeCategory;
    const bySearch = !q ? true : (x.name + " " + x.desc + " " + x.tags.join(" ")).toLowerCase().includes(q);
    return byCat && bySearch;
  });

  els.menuGrid.innerHTML = "";

  if (filtered.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<strong>Ничего не найдено</strong><p class="muted">Попробуйте изменить категорию или запрос.</p>`;
    els.menuGrid.appendChild(empty);
    return;
  }

  filtered.forEach(x => {
    const el = document.createElement("article");
    el.className = "card menuItem";
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Открыть: ${x.name}`);

    el.innerHTML = `
      ${IMAGES[x.id] ? `<div class="menuItem__imgWrap"><img class="menuItem__img" alt="${escapeHtml(x.name)}" loading="lazy"/></div>` : ``}
      <div class="menuItem__top">
        <div>
          <h3 class="menuItem__name">${escapeHtml(x.name)}</h3>
          <div class="menuItem__meta">
            <span class="pill2">${escapeHtml(x.cat)}</span>
            <span class="pill2">${escapeHtml(x.weight)}</span>
          </div>
        </div>
        <div class="menuItem__price">${RUB(x.price)}</div>
      </div>
      <p class="menuItem__desc">${escapeHtml(x.desc)}</p>
      <div class="menuItem__meta">
        ${x.tags.map(t => `<span class="pill2">${escapeHtml(t)}</span>`).join("")}
      </div>
      <div class="menuItem__actions">
        <button class="btn btn--primary" type="button" data-add="${x.id}">Добавить</button>
        <button class="iconBtn" type="button" aria-label="Подробнее">ℹ️</button>
      </div>
    `;

    // hide image if it fails to load
    const img = el.querySelector(".menuItem__img");
    if (img && IMAGES[x.id]){
      setImageWithFallback(img, IMAGES[x.id]);
    }

    // click anywhere opens modal except add button
    el.addEventListener("click", (e) => {
      const addId = e.target?.dataset?.add;
      if (addId){
        addToCart(addId, 1);
        e.stopPropagation();
        return;
      }
      openDishModal(x.id);
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){
        e.preventDefault();
        openDishModal(x.id);
      }
    });

    els.menuGrid.appendChild(el);
  });
}

function renderCart(){
  const items = cartItems();
  els.cartCount.textContent = String(cartCount());

  els.cartList.innerHTML = "";

  if (items.length === 0){
    els.cartEmpty.hidden = false;
    els.cartTotals.hidden = true;
    return;
  }
  els.cartEmpty.hidden = true;
  els.cartTotals.hidden = false;

  items.forEach(({item, qty}) => {
    const row = document.createElement("div");
    row.className = "cartRow";
    row.innerHTML = `
      <div>
        <div class="cartRow__name">${escapeHtml(item.name)}</div>
        <div class="cartRow__sub">${escapeHtml(item.weight)} • ${RUB(item.price)}</div>
      </div>
      <div class="qty" aria-label="Количество">
        <button class="qty__btn" type="button" data-dec="${item.id}" aria-label="Уменьшить">−</button>
        <div class="qty__num" aria-label="Текущее количество">${qty}</div>
        <button class="qty__btn" type="button" data-inc="${item.id}" aria-label="Увеличить">+</button>
      </div>
    `;
    row.addEventListener("click", (e) => {
      if (e.target?.dataset?.dec) addToCart(e.target.dataset.dec, -1);
      if (e.target?.dataset?.inc) addToCart(e.target.dataset.inc, +1);
    });
    els.cartList.appendChild(row);
  });

  const { sum, adjust, grand } = computeTotals();
  els.sumTotal.textContent = RUB(sum);

  // For UX show +/- explicitly
  const adjText = (adjust > 0 ? `+ ${RUB(adjust)}` : adjust < 0 ? `− ${RUB(Math.abs(adjust))}` : RUB(0));
  els.sumAdjust.textContent = adjText;
  els.sumGrand.textContent = RUB(grand);
}

function renderOrders(){
  els.ordersList.innerHTML = "";
  if (!state.orders.length){
    els.ordersList.innerHTML = `<div class="orderItem"><strong>Пока нет заказов</strong><div class="orderItem__sub">Оформите заказ — он появится здесь.</div></div>`;
    return;
  }

  state.orders.slice(0, 6).forEach(o => {
    const el = document.createElement("div");
    el.className = "orderItem";
    el.innerHTML = `
      <div class="orderItem__top">
        <span>Заказ #${escapeHtml(o.number)}</span>
        <span>${escapeHtml(o.total)}</span>
      </div>
      <div class="orderItem__sub">${escapeHtml(o.when)} • ${escapeHtml(o.fulfillment)}</div>
      <div class="orderItem__sub">${escapeHtml(o.itemsSummary)}</div>
    `;
    els.ordersList.appendChild(el);
  });
}

function renderReview(){
  const r = REVIEWS[reviewIdx % REVIEWS.length];
  els.reviewText.textContent = r.text;
  els.reviewMeta.textContent = r.meta;
}

function render(){
  if (els.categoryChips) renderChips();
  if (els.menuGrid) renderMenu();
  if (els.cartList || els.cartTotals || els.cartEmpty) renderCart();
  if (els.ordersList) renderOrders();
}

/* ---------- interactions ---------- */
function addToCart(id, delta){
  const cur = state.cart[id] || 0;
  const next = cur + delta;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;

  save();
  renderCart();

  const it = MENU.find(x => x.id === id);
  if (delta > 0) toast(`Добавлено: ${it?.name || "блюдо"}`);
}

function openDrawer(){
  els.cartDrawer.setAttribute("aria-hidden", "false");
  // focus first interactive
  els.cartDrawer.querySelector("button, [href], input")?.focus?.();
}
function closeDrawer(){
  els.cartDrawer.setAttribute("aria-hidden", "true");
  els.cartBtn.focus();
}

function openDishModal(id){
  const it = MENU.find(x => x.id === id);
  if (!it) return;
  state.dishModalId = id;
  els.dishTitle.textContent = it.name;
  els.dishDesc.textContent = it.desc;
  els.dishIngredients.textContent = it.ingredients;
  els.dishWeight.textContent = it.weight;
  els.dishKcal.textContent = it.kcal;

  // Show image in modal if available
  const imgSrc = IMAGES[id];
  if (imgSrc){
    els.dishImgWrap.hidden = false;
    els.dishImg.alt = it.name;
    setImageWithFallback(els.dishImg, imgSrc);
  } else {
    els.dishImgWrap.hidden = true;
    els.dishImg.removeAttribute("src");
    els.dishImg.alt = "";
  }

  els.dishModal.setAttribute("aria-hidden", "false");
  els.dishAddBtn.focus();
}
function closeDishModal(){
  els.dishModal.setAttribute("aria-hidden", "true");
  state.dishModalId = null;
}

function openCheckout(){
  const items = cartItems();
  if (!items.length){
    toast("Корзина пустая");
    return;
  }
  const { grand } = computeTotals();
  els.checkoutTotal.textContent = RUB(grand);

  // show/hide address
  const isDelivery = state.fulfillment === "delivery";
  els.addressRow.style.display = isDelivery ? "" : "none";
  els.checkoutForm.address.required = isDelivery;

  els.checkoutModal.setAttribute("aria-hidden", "false");
  els.checkoutForm.name.focus();
}
function closeCheckout(){
  els.checkoutModal.setAttribute("aria-hidden", "true");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ---------- forms ---------- */
function normalizePhone(raw){
  // простая нормализация: оставляем цифры и плюс
  const digits = raw.replace(/[^\d+]/g, "");
  return digits;
}

function validateForm(form){
  // минимальная валидация + подсветка
  let ok = true;
  const inputs = form.querySelectorAll("input,textarea,select");
  inputs.forEach(inp => {
    const valid = inp.checkValidity();
    inp.style.borderColor = valid ? "" : "var(--danger)";
    if (!valid) ok = false;
  });
  return ok;
}

function formatDateTimeLocal(dt = new Date()){
  const pad = (n) => String(n).padStart(2,"0");
  return `${pad(dt.getDate())}.${pad(dt.getMonth()+1)}.${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

/* ---------- ICS (reservation) ---------- */
function buildIcs({ name, date, time, guests }){
  // Minimal .ics for calendar import
  // date: YYYY-MM-DD, time: HH:MM
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 90*60*1000); // 1.5h
  const toICS = (d) => {
    const pad = (n) => String(n).padStart(2,"0");
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  };

  const uidStr = `${uid()}@antalya`;
  const now = toICS(new Date());
  const dtStart = toICS(start);
  const dtEnd = toICS(end);

  const summary = `Бронирование Antalya (${guests} гост.)`;
  const desc = `Имя: ${name}\nГостей: ${guests}\nПодтверждение: по телефону`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Antalya//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uidStr}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function downloadFile(filename, content, mime="text/plain"){
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- init ---------- */
function init(){
  els.year.textContent = String(new Date().getFullYear());

  // theme
  setTheme(state.theme);
  els.themeBtn.addEventListener("click", () => {
    setTheme(state.theme === "light" ? "dark" : "light");
    toast(state.theme === "light" ? "Светлая тема" : "Тёмная тема");
  });


  // profile menu
  const profileBtn = document.getElementById("profileBtn");
  const profileMenu = document.getElementById("profileMenu");
  const profileLogin = document.getElementById("profileLogin");
  const profileOrders = document.getElementById("profileOrders");

  function openProfileMenu(){
    if (!profileMenu || !profileBtn) return;
    profileMenu.hidden = false;
    profileBtn.setAttribute("aria-expanded","true");
  }
  function closeProfileMenu(){
    if (!profileMenu || !profileBtn) return;
    profileMenu.hidden = true;
    profileBtn.setAttribute("aria-expanded","false");
  }

  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!profileMenu) return;
    profileMenu.hidden ? openProfileMenu() : closeProfileMenu();
  });

  profileLogin?.addEventListener("click", () => {
    closeProfileMenu();
    toast("Вход и регистрация будут доступны после подключения сервера");
  });

  profileOrders?.addEventListener("click", () => {
    closeProfileMenu();
    location.hash = "#order";
    toast("Ваши заказы — в разделе “Заказ”");
  });

  // close profile on click outside
  document.addEventListener("click", (e) => {
    if (!profileMenu || profileMenu.hidden) return;
    const profile = document.getElementById("profile");
    if (profile && !profile.contains(e.target)) closeProfileMenu();
  });

  // search
  els.menuSearch?.addEventListener("input", (e) => {
    state.search = e.target.value;
    if (els.menuGrid) renderMenu();
  });
  els.clearSearchBtn?.addEventListener("click", () => {
    state.search = "";
    if (els.menuSearch) els.menuSearch.value = "";
    if (els.menuGrid) renderMenu();
    toast("Поиск сброшен");
  });

  // drawer open/close
  els.cartBtn?.addEventListener("click", openDrawer);
  els.openCartFromOrder?.addEventListener("click", openDrawer);


  // nav drawer (mobile)
  const navDrawer = document.getElementById("navDrawer");
  const menuBtn = document.getElementById("menuBtn");

  function openNav(){
    if (!navDrawer) return;
    navDrawer.setAttribute("aria-hidden","false");
    menuBtn?.setAttribute("aria-expanded","true");
    navDrawer.querySelector("a,button")?.focus?.();
  }
  function closeNav(){
    if (!navDrawer) return;
    navDrawer.setAttribute("aria-hidden","true");
    menuBtn?.setAttribute("aria-expanded","false");
    menuBtn?.focus?.();
  }

  menuBtn?.addEventListener("click", openNav);

  // overlay close
  document.addEventListener("click", (e) => {
    const close = e.target?.dataset?.close;
    if (close === "drawer") closeDrawer();
    if (close === "modal") closeDishModal();
    if (close === "checkout") closeCheckout();
    if (close === "nav") closeNav();
  });

  // esc close
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (els.checkoutModal.getAttribute("aria-hidden") === "false") closeCheckout();
    else if (els.dishModal.getAttribute("aria-hidden") === "false") closeDishModal();
    else if (els.cartDrawer.getAttribute("aria-hidden") === "false") closeDrawer();
    else if (document.getElementById("navDrawer")?.getAttribute("aria-hidden") === "false") closeNav();
    else {
      const profileMenu = document.getElementById("profileMenu");
      const profileBtn = document.getElementById("profileBtn");
      if (profileMenu && !profileMenu.hidden) {
        profileMenu.hidden = true;
        profileBtn?.setAttribute("aria-expanded","false");
      }
    }
  });

  // dish add
  els.dishAddBtn.addEventListener("click", () => {
    if (!state.dishModalId) return;
    addToCart(state.dishModalId, 1);
    closeDishModal();
  });

  // fulfillment
  els.cartDrawer.querySelectorAll('input[name="fulfillment"]').forEach(r => {
    r.addEventListener("change", () => {
      state.fulfillment = els.cartDrawer.querySelector('input[name="fulfillment"]:checked')?.value || "delivery";
      renderCart();
    });
  });

  // clear cart
  els.clearCartBtn?.addEventListener("click", () => {
    state.cart = {};
    save();
    renderCart();
    toast("Корзина очищена");
  });

  // checkout
  els.checkoutBtn?.addEventListener("click", openCheckout);

  els.checkoutForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(els.checkoutForm)){
      toast("Проверьте поля оформления");
      return;
    }

    const items = cartItems();
    const { grand } = computeTotals();
    const fulfillmentText = state.fulfillment === "delivery" ? "Доставка" : "Самовывоз";

    const name = els.checkoutForm.name.value.trim();
    const phone = normalizePhone(els.checkoutForm.phone.value);
    const address = (state.fulfillment === "delivery") ? (els.checkoutForm.address.value.trim() || "—") : "—";
    const payment = els.checkoutForm.payment.value;
    const note = els.checkoutForm.note.value.trim();

    const order = {
      number: uid(),
      when: formatDateTimeLocal(new Date()),
      fulfillment: fulfillmentText,
      total: RUB(grand),
      customer: { name, phone, address, payment, note },
      itemsSummary: items.map(x => `${x.item.name} ×${x.qty}`).join(", "),
      items: items.map(x => ({ id: x.item.id, name: x.item.name, qty: x.qty, price: x.item.price }))
    };

    state.orders.unshift(order);
    // limit history
    state.orders = state.orders.slice(0, 20);

    // clear cart
    state.cart = {};
    save();

    closeCheckout();
    closeDrawer();
    render();
    toast(`Заказ #${order.number} оформлен ✅`);

    // reset form
    els.checkoutForm.reset();
  });

  // orders clear
  els.clearOrdersBtn?.addEventListener("click", () => {
    state.orders = [];
    save();
    if (els.ordersList) renderOrders();
    toast("История заказов очищена");
  });

  // reservation
  if (els.reserveForm){
    // set min date = today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,"0");
    const dd = String(today.getDate()).padStart(2,"0");
    const minDate = `${yyyy}-${mm}-${dd}`;
    if (els.reserveForm.date) els.reserveForm.date.min = minDate;

    // default time
    if (els.reserveForm.time) els.reserveForm.time.value = "19:00";

    els.reserveForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(els.reserveForm)){
        toast("Проверьте поля бронирования");
        return;
      }

      const payload = {
        name: els.reserveForm.name.value.trim(),
        phone: normalizePhone(els.reserveForm.phone.value),
        guests: els.reserveForm.guests.value,
        date: els.reserveForm.date.value,
        time: els.reserveForm.time.value,
        note: els.reserveForm.note.value.trim(),
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE.reservation, JSON.stringify(payload));
      toast("Бронь создана ✅");
    });
  }

  els.downloadIcsBtn?.addEventListener("click", () => {
    if (!els.reserveForm){
      toast("Сначала откройте страницу бронирования");
      return;
    }
    // берём текущие значения формы; если нет — подставим из localStorage
    let name = els.reserveForm.name.value.trim();
    let date = els.reserveForm.date.value;
    let time = els.reserveForm.time.value;
    let guests = els.reserveForm.guests.value || "2";

    if (!name || !date || !time){
      const saved = loadJSON(STORAGE.reservation, null);
      if (saved){
        name = name || saved.name;
        date = date || saved.date;
        time = time || saved.time;
        guests = guests || saved.guests;
      }
    }
    if (!name || !date || !time){
      toast("Сначала заполните форму бронирования");
      return;
    }

    const ics = buildIcs({ name, date, time, guests });
    downloadFile(`reservation-antalya-${date}.ics`, ics, "text/calendar");
    toast("Файл .ics скачан");
  });

  // reviews
  if (els.reviewText && els.reviewMeta){
    renderReview();
    els.prevReview?.addEventListener("click", () => { reviewIdx = (reviewIdx - 1 + REVIEWS.length) % REVIEWS.length; renderReview(); });
    els.nextReview?.addEventListener("click", () => { reviewIdx = (reviewIdx + 1) % REVIEWS.length; renderReview(); });
  }

  // smooth hash scroll (nice)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", () => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      // close drawer if navigation click inside it
      if (els.cartDrawer.getAttribute("aria-hidden") === "false") closeDrawer();
    });
  });

  // Фото для секции меню на случай отсутствия локального файла
  const menuPhotoImg = document.querySelector(".menuPhoto img");
  if (menuPhotoImg){
    menuPhotoImg.onerror = () => {
      menuPhotoImg.style.display = "none";
    };
  }

  render();
}

init();
