// Selvan Super Market - Application Logic with WhatsApp Automation, Audio & Iconic Cursor

// Target WhatsApp Number for Selvan Super Market
const STORE_WHATSAPP_NUMBER = "918778574669";
const STORE_WHATSAPP_DISPLAY = "8778574669";

// Application State
const state = {
  searchQuery: "",
  selectedCategory: "all",
  sortBy: "featured",
  onlyOffers: false,
  viewMode: "grid", // "grid" or "list"
  cart: JSON.parse(localStorage.getItem("selvan_cart") || "[]"),
  quickViewProduct: null,
  customerName: localStorage.getItem("selvan_cust_name") || "",
  customerAddress: localStorage.getItem("selvan_cust_address") || "",
  customerPhone: localStorage.getItem("selvan_cust_phone") || ""
};

// DOM Elements
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const categoryChipsContainer = document.getElementById("category-chips");
const sortSelect = document.getElementById("sort-select");
const onlyOffersToggle = document.getElementById("only-offers-toggle");
const productsContainer = document.getElementById("products-container");
const resultsCountEl = document.getElementById("results-count");
const activeFilterBar = document.getElementById("active-filter-bar");
const emptyStateEl = document.getElementById("empty-state");
const cartBadge = document.getElementById("cart-badge");
const cartTotalHeader = document.getElementById("cart-total-header");
const cartDrawer = document.getElementById("cart-drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartEmptyEl = document.getElementById("cart-empty-message");
const cartSummarySection = document.getElementById("cart-summary-section");
const cartTotalMrpEl = document.getElementById("cart-total-mrp");
const cartTotalSavingsEl = document.getElementById("cart-total-savings");
const cartFinalTotalEl = document.getElementById("cart-final-total");
const quickViewModal = document.getElementById("quick-view-modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const toastNotice = document.getElementById("toast-notice");
const toastMessage = document.getElementById("toast-message");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const soundFxToggleBtn = document.getElementById("sound-fx-toggle-btn");

// Format Currency
function formatCurrency(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// Calculate Discount Percentage
function getDiscountPercent(mrp, salesPrice) {
  if (!mrp || mrp <= salesPrice) return 0;
  return Math.round(((mrp - salesPrice) / mrp) * 100);
}

// Format Date for Display
function formatOfferDate(dateString) {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
  return date.toLocaleString('en-IN', options);
}

// Calculate Remaining Time from Now to Offer Expiry
function getOfferCountdown(dateString) {
  const targetTime = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return {
      expired: true,
      text: "Offer Expired",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-300",
      urgency: "expired"
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60)) / 1000);

  let countdownText = "";
  let badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-300";
  let urgency = "normal";

  if (days > 1) {
    countdownText = `${days}d ${hours}h left`;
    badgeClass = "bg-amber-50 text-amber-900 border-amber-300";
    urgency = "warning";
  } else if (days === 1) {
    countdownText = `1d ${hours}h left`;
    badgeClass = "bg-orange-50 text-orange-900 border-orange-300 font-semibold";
    urgency = "high";
  } else {
    countdownText = `${hours}h ${minutes}m left`;
    badgeClass = "bg-red-50 text-red-700 border-red-300 font-bold pulse-urgent";
    urgency = "urgent";
  }

  return {
    expired: false,
    text: countdownText,
    badgeClass,
    urgency
  };
}

// Initialize Category Filter Chips
function renderCategoryChips() {
  if (!categoryChipsContainer) return;
  categoryChipsContainer.innerHTML = CATEGORIES.map(cat => `
    <button 
      onclick="handleCategorySelect('${cat.id}')"
      class="category-btn flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition whitespace-nowrap shadow-sm ${state.selectedCategory === cat.id ? 'active' : ''}"
      data-category="${cat.id}">
      <i class="bi ${cat.icon} text-base"></i>
      <span>${cat.name}</span>
    </button>
  `).join("");
}

// Handle Category Selection
function handleCategorySelect(categoryId) {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  state.selectedCategory = categoryId;
  renderCategoryChips();
  renderProducts();
}

// Filter and Sort Products
function getFilteredProducts() {
  let list = [...PRODUCTS_DATA];

  // Search Query Filter
  if (state.searchQuery.trim() !== "") {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.offerLabel && item.offerLabel.toLowerCase().includes(q))
    );
  }

  // Category Filter (including special BOGO category)
  if (state.selectedCategory === "bogo") {
    list = list.filter(item => item.bogo === true || (item.offerLabel && item.offerLabel.includes("BUY 1 GET 1")) || (item.offerLabel && item.offerLabel.includes("BUY 2 GET 1")));
  } else if (state.selectedCategory !== "all") {
    list = list.filter(item => item.category === state.selectedCategory);
  }

  // Offers Only Filter
  if (state.onlyOffers) {
    list = list.filter(item => item.mrp > item.salesPrice && new Date(item.offerEndsAt) > new Date());
  }

  // Sort
  switch (state.sortBy) {
    case "price_asc":
      list.sort((a, b) => a.salesPrice - b.salesPrice);
      break;
    case "price_desc":
      list.sort((a, b) => b.salesPrice - a.salesPrice);
      break;
    case "discount":
      list.sort((a, b) => {
        const discA = getDiscountPercent(a.mrp, a.salesPrice);
        const discB = getDiscountPercent(b.mrp, b.salesPrice);
        return discB - discA;
      });
      break;
    case "ending_soon":
      list.sort((a, b) => new Date(a.offerEndsAt) - new Date(b.offerEndsAt));
      break;
    case "name_asc":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
    default:
      break;
  }

  return list;
}

// Render Products Grid / List
function renderProducts() {
  const filtered = getFilteredProducts();

  if (resultsCountEl) {
    resultsCountEl.innerText = `${filtered.length} products available`;
  }

  updateActiveFilterBar();

  if (filtered.length === 0) {
    if (productsContainer) productsContainer.innerHTML = "";
    if (emptyStateEl) emptyStateEl.classList.remove("hidden");
    return;
  } else {
    if (emptyStateEl) emptyStateEl.classList.add("hidden");
  }

  if (!productsContainer) return;

  const isGrid = state.viewMode === "grid";
  productsContainer.className = isGrid 
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
    : "space-y-4";

  productsContainer.innerHTML = filtered.map(product => {
    const discount = getDiscountPercent(product.mrp, product.salesPrice);
    const savings = product.mrp - product.salesPrice;
    const countdown = getOfferCountdown(product.offerEndsAt);
    const cartItem = state.cart.find(c => c.id === product.id);
    const cartQty = cartItem ? cartItem.qty : 0;

    let offerRibbonHtml = '';
    if (product.bogo || (product.offerLabel && product.offerLabel.includes("BUY 1 GET 1"))) {
      offerRibbonHtml = `
        <div class="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <i class="bi bi-gift-fill"></i>
          <span>BUY 1 GET 1 FREE</span>
        </div>
      `;
    } else if (product.offerLabel && product.offerLabel.includes("BUY 2 GET 1")) {
      offerRibbonHtml = `
        <div class="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <i class="bi bi-gift-fill"></i>
          <span>BUY 2 GET 1 FREE</span>
        </div>
      `;
    } else if (discount > 0) {
      offerRibbonHtml = `
        <div class="absolute top-3 left-3 z-10 ribbon-discount text-white font-bold text-xs uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
          <i class="bi bi-tag-fill"></i>
          <span>${discount}% OFF</span>
        </div>
      `;
    }

    if (isGrid) {
      return `
        <div class="product-card bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col justify-between relative group hover:border-emerald-300">
          
          ${offerRibbonHtml}

          <div class="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition">
            <button 
              onclick="openQuickView('${product.id}')"
              class="w-8 h-8 rounded-full bg-white/95 text-gray-700 hover:text-emerald-700 hover:bg-white shadow flex items-center justify-center transition"
              title="Quick Product Preview">
              <i class="bi bi-eye text-base"></i>
            </button>
            <button 
              onclick="orderSingleProductWhatsApp('${product.id}')"
              class="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center justify-center transition"
              title="Order this product instantly on WhatsApp">
              <i class="bi bi-whatsapp text-sm"></i>
            </button>
          </div>

          <div class="relative bg-gray-50 aspect-square overflow-hidden cursor-pointer" onclick="openQuickView('${product.id}')">
            <img 
              src="${product.image}" 
              alt="${product.name}" 
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80'"
            />
            
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent p-2.5 text-white">
              <div class="flex items-center justify-between text-[11px] font-medium mb-0.5">
                <span class="flex items-center gap-1 text-amber-300">
                  <i class="bi bi-alarm-fill"></i> Offer Valid Till:
                </span>
                <span class="text-white/90 font-bold">${formatOfferDate(product.offerEndsAt).split(',')[0]}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-amber-300 truncate mr-1 font-bold">${product.offerLabel || 'Limited Deal'}</span>
                <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${countdown.badgeClass} border text-xs" data-countdown-id="${product.id}">
                  <i class="bi bi-stopwatch"></i> ${countdown.text}
                </span>
              </div>
            </div>
          </div>

          <div class="p-4 flex flex-col flex-1 justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span class="uppercase tracking-wider font-semibold text-emerald-700">${product.brand}</span>
                <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">${product.unit}</span>
              </div>
              <h3 
                class="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer mb-2"
                onclick="openQuickView('${product.id}')"
                title="${product.name}">
                ${product.name}
              </h3>
            </div>

            <div class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-2xl font-black text-gray-900 brand-font">
                  ${formatCurrency(product.salesPrice)}
                </span>
                <span class="mrp-strike text-xs text-gray-400 font-medium">
                  MRP: ${formatCurrency(product.mrp)}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs mb-3">
                <span class="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <i class="bi bi-piggy-bank"></i> Save ${formatCurrency(savings)}
                </span>
                <span class="text-amber-500 font-medium text-[11px] flex items-center gap-0.5">
                  <i class="bi bi-star-fill text-[10px]"></i> ${product.rating}
                </span>
              </div>

              <div class="flex items-center gap-2">
                ${cartQty === 0 ? `
                  <button 
                    onclick="addToCart('${product.id}')"
                    class="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs sm:text-sm">
                    <i class="bi bi-cart-plus text-base"></i>
                    <span>Add to Cart</span>
                  </button>
                ` : `
                  <div class="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                    <button 
                      onclick="decreaseCartQty('${product.id}')"
                      class="w-8 h-8 bg-white text-emerald-800 rounded-lg font-bold flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm">
                      <i class="bi bi-dash-lg"></i>
                    </button>
                    <span class="font-bold text-emerald-900 text-xs px-1">${cartQty} in cart</span>
                    <button 
                      onclick="addToCart('${product.id}')"
                      class="w-8 h-8 bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center hover:bg-emerald-700 transition shadow-sm">
                      <i class="bi bi-plus-lg"></i>
                    </button>
                  </div>
                `}

                <button 
                  onclick="orderSingleProductWhatsApp('${product.id}')" 
                  class="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                  title="Direct WhatsApp Order to 8778574669">
                  <i class="bi bi-whatsapp text-emerald-600"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="product-card bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-5 hover:border-emerald-300">
          <div class="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden cursor-pointer" onclick="openQuickView('${product.id}')">
            <img 
              src="${product.image}" 
              alt="${product.name}" 
              class="w-full h-full object-cover"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80'"
            />
            ${offerRibbonHtml}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-xs mb-1">
              <span class="font-bold text-emerald-700">${product.brand}</span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-500">${product.categoryLabel}</span>
              <span class="text-gray-300">•</span>
              <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">${product.unit}</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 hover:text-emerald-700 cursor-pointer" onclick="openQuickView('${product.id}')">
              ${product.name}
            </h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-1">${product.description}</p>
            
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${countdown.badgeClass} border inline-flex items-center gap-1.5" data-countdown-id="${product.id}">
                <i class="bi bi-clock-history"></i>
                <span>Offer ends: <strong>${formatOfferDate(product.offerEndsAt)}</strong> (${countdown.text})</span>
              </span>
              <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ${product.offerLabel}
              </span>
            </div>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-48 gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <div class="text-left sm:text-right">
              <div class="text-2xl font-black text-gray-900 brand-font">
                ${formatCurrency(product.salesPrice)}
              </div>
              <div class="mrp-strike text-xs text-gray-400">
                MRP: ${formatCurrency(product.mrp)}
              </div>
              <div class="text-[11px] text-emerald-700 font-semibold">
                Save ${formatCurrency(savings)}
              </div>
            </div>

            <div class="flex items-center gap-1.5 w-full sm:w-auto">
              <div class="flex-1 sm:w-32">
                ${cartQty === 0 ? `
                  <button 
                    onclick="addToCart('${product.id}')"
                    class="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition">
                    <i class="bi bi-cart-plus"></i> Add
                  </button>
                ` : `
                  <div class="w-full flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                    <button 
                      onclick="decreaseCartQty('${product.id}')"
                      class="w-7 h-6 bg-white text-emerald-800 rounded font-bold flex items-center justify-center hover:bg-emerald-600 hover:text-white">
                      <i class="bi bi-dash"></i>
                    </button>
                    <span class="font-bold text-xs text-emerald-900">${cartQty}</span>
                    <button 
                      onclick="addToCart('${product.id}')"
                      class="w-7 h-6 bg-emerald-600 text-white rounded font-bold flex items-center justify-center hover:bg-emerald-700">
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                `}
              </div>
              <button 
                onclick="orderSingleProductWhatsApp('${product.id}')"
                class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold"
                title="Direct WhatsApp Order">
                <i class="bi bi-whatsapp"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }).join("");
}

// Update Active Filter Bar
function updateActiveFilterBar() {
  if (!activeFilterBar) return;
  const pills = [];

  if (state.searchQuery.trim() !== "") {
    pills.push(`
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold">
        Search: "${state.searchQuery}"
        <button onclick="clearSearch()" class="hover:text-red-700"><i class="bi bi-x-circle-fill"></i></button>
      </span>
    `);
  }

  if (state.selectedCategory !== "all") {
    const catObj = CATEGORIES.find(c => c.id === state.selectedCategory);
    pills.push(`
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold">
        Category: ${catObj ? catObj.name : state.selectedCategory}
        <button onclick="handleCategorySelect('all')" class="hover:text-red-700"><i class="bi bi-x-circle-fill"></i></button>
      </span>
    `);
  }

  if (state.onlyOffers) {
    pills.push(`
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold">
        Only Discount Offers
        <button onclick="toggleOnlyOffers(false)" class="hover:text-red-700"><i class="bi bi-x-circle-fill"></i></button>
      </span>
    `);
  }

  if (pills.length > 0) {
    activeFilterBar.innerHTML = `
      <div class="flex items-center gap-2 flex-wrap py-2">
        <span class="text-xs text-gray-500 font-medium">Active Filters:</span>
        ${pills.join("")}
        <button onclick="resetAllFilters()" class="text-xs text-red-600 hover:underline font-semibold ml-2">
          Reset All
        </button>
      </div>
    `;
    activeFilterBar.classList.remove("hidden");
  } else {
    activeFilterBar.innerHTML = "";
    activeFilterBar.classList.add("hidden");
  }
}

// Reset All Filters
function resetAllFilters() {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  state.searchQuery = "";
  if (searchInput) searchInput.value = "";
  if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
  state.selectedCategory = "all";
  state.onlyOffers = false;
  if (onlyOffersToggle) onlyOffersToggle.checked = false;
  renderCategoryChips();
  renderProducts();
}

function clearSearch() {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  state.searchQuery = "";
  if (searchInput) searchInput.value = "";
  if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
  renderProducts();
}

function toggleOnlyOffers(forcedValue) {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  state.onlyOffers = typeof forcedValue === "boolean" ? forcedValue : !state.onlyOffers;
  if (onlyOffersToggle) onlyOffersToggle.checked = state.onlyOffers;
  renderProducts();
}

// Cart Logic
function addToCart(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  // Cash Register Sound!
  if (typeof soundEngine !== "undefined") soundEngine.playAddToCart();

  const existing = state.cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      unit: product.unit,
      mrp: product.mrp,
      salesPrice: product.salesPrice,
      image: product.image,
      offerEndsAt: product.offerEndsAt,
      offerLabel: product.offerLabel,
      qty: 1
    });
  }

  saveCart();
  renderProducts();
  renderCartDrawer();
  showToast(`Added "${product.name.substring(0, 22)}..." to cart!`);
}

function decreaseCartQty(productId) {
  if (typeof soundEngine !== "undefined") soundEngine.playRemove();
  const index = state.cart.findIndex(c => c.id === productId);
  if (index === -1) return;

  if (state.cart[index].qty > 1) {
    state.cart[index].qty -= 1;
  } else {
    state.cart.splice(index, 1);
  }

  saveCart();
  renderProducts();
  renderCartDrawer();
}

function removeFromCart(productId) {
  if (typeof soundEngine !== "undefined") soundEngine.playRemove();
  state.cart = state.cart.filter(c => c.id !== productId);
  saveCart();
  renderProducts();
  renderCartDrawer();
  showToast("Item removed from cart");
}

function clearCart() {
  if (state.cart.length === 0) return;
  if (confirm("Are you sure you want to clear your shopping cart?")) {
    if (typeof soundEngine !== "undefined") soundEngine.playRemove();
    state.cart = [];
    saveCart();
    renderProducts();
    renderCartDrawer();
    showToast("Cart has been cleared");
  }
}

function saveCart() {
  localStorage.setItem("selvan_cart", JSON.stringify(state.cart));
  updateCartBadge();
}

function updateCartBadge() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.salesPrice * item.qty), 0);

  if (cartBadge) {
    cartBadge.innerText = totalItems;
    cartBadge.classList.toggle("hidden", totalItems === 0);
  }

  if (cartTotalHeader) {
    cartTotalHeader.innerText = formatCurrency(totalAmount);
  }
}

// Render Cart Drawer
function renderCartDrawer() {
  if (!cartItemsContainer) return;

  const totalMrp = state.cart.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
  const totalSales = state.cart.reduce((sum, item) => sum + (item.salesPrice * item.qty), 0);
  const totalSavings = totalMrp - totalSales;

  if (state.cart.length === 0) {
    if (cartEmptyEl) cartEmptyEl.classList.remove("hidden");
    if (cartSummarySection) cartSummarySection.classList.add("hidden");
    cartItemsContainer.innerHTML = "";
    return;
  }

  if (cartEmptyEl) cartEmptyEl.classList.add("hidden");
  if (cartSummarySection) cartSummarySection.classList.remove("hidden");

  cartItemsContainer.innerHTML = state.cart.map(item => `
    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-white" />
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-bold text-gray-900 line-clamp-1">${item.name}</h4>
        <div class="text-[11px] text-gray-500 font-medium">${item.unit}</div>
        ${item.offerLabel ? `<div class="text-[10px] text-amber-700 font-bold">${item.offerLabel}</div>` : ''}
        <div class="flex items-baseline gap-1.5 mt-1">
          <span class="text-sm font-black text-gray-900">${formatCurrency(item.salesPrice)}</span>
          <span class="mrp-strike text-[10px] text-gray-400">MRP: ${formatCurrency(item.mrp)}</span>
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <button onclick="removeFromCart('${item.id}')" class="text-gray-400 hover:text-red-600 text-xs" title="Remove item">
          <i class="bi bi-trash3"></i>
        </button>
        <div class="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
          <button onclick="decreaseCartQty('${item.id}')" class="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-100">-</button>
          <span class="px-2 text-xs font-bold text-gray-800">${item.qty}</span>
          <button onclick="addToCart('${item.id}')" class="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-100">+</button>
        </div>
      </div>
    </div>
  `).join("");

  if (cartTotalMrpEl) cartTotalMrpEl.innerText = formatCurrency(totalMrp);
  if (cartTotalSavingsEl) cartTotalSavingsEl.innerText = "- " + formatCurrency(totalSavings);
  if (cartFinalTotalEl) cartFinalTotalEl.innerText = formatCurrency(totalSales);
}

// Drawer Open/Close
function openCart() {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  if (cartDrawer && drawerBackdrop) {
    drawerBackdrop.classList.add("open");
    cartDrawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeCart() {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  if (cartDrawer && drawerBackdrop) {
    drawerBackdrop.classList.remove("open");
    cartDrawer.classList.remove("open");
    document.body.style.overflow = "auto";
  }
}

// Quick View Modal
function openQuickView(productId) {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product || !quickViewModal || !modalBackdrop) return;

  const discount = getDiscountPercent(product.mrp, product.salesPrice);
  const savings = product.mrp - product.salesPrice;
  const countdown = getOfferCountdown(product.offerEndsAt);
  const cartItem = state.cart.find(c => c.id === product.id);
  const cartQty = cartItem ? cartItem.qty : 0;

  const modalBody = document.getElementById("modal-content-area");
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div class="flex flex-col">
          <div class="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square border border-gray-100">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
            ${product.bogo ? `
              <span class="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow">
                <i class="bi bi-gift-fill"></i> BUY 1 GET 1 FREE
              </span>
            ` : (discount > 0 ? `
              <span class="absolute top-3 left-3 ribbon-discount text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow">
                <i class="bi bi-tag-fill"></i> Save ${discount}%
              </span>
            ` : '')}
          </div>

          <div class="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div class="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
              <span class="flex items-center gap-1"><i class="bi bi-calendar-event"></i> Offer Expiry Date</span>
              <span class="px-2 py-0.5 rounded-full ${countdown.badgeClass} border">${countdown.text}</span>
            </div>
            <div class="text-sm font-extrabold text-emerald-950 mt-1">
              Valid until: ${formatOfferDate(product.offerEndsAt)}
            </div>
            <div class="text-xs text-emerald-700 mt-0.5 font-bold">
              ${product.offerLabel}
            </div>
          </div>
        </div>

        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700 mb-1">
              <span>${product.brand}</span>
              <span>•</span>
              <span class="text-gray-500">${product.categoryLabel}</span>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900 leading-snug">${product.name}</h2>
            <div class="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700">
              Unit: ${product.unit}
            </div>

            <div class="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div class="text-xs text-gray-500 font-medium">Customer Deal Price:</div>
              <div class="flex items-baseline gap-3 mt-1">
                <span class="text-3xl font-black text-gray-900 brand-font">${formatCurrency(product.salesPrice)}</span>
                <span class="mrp-strike text-base text-gray-400">MRP: ${formatCurrency(product.mrp)}</span>
              </div>
              <div class="mt-2 text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <i class="bi bi-shield-check"></i> You Save ${formatCurrency(savings)} (${discount}% Instant Store Discount)
              </div>
            </div>

            <div class="mt-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Description</h4>
              <p class="text-sm text-gray-600 leading-relaxed">${product.description}</p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2.5">
            <button 
              onclick="addToCart('${product.id}')"
              class="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition text-sm">
              <i class="bi bi-cart-plus text-base"></i>
              <span>${cartQty > 0 ? `Add More (${cartQty} in cart)` : 'Add to Cart'}</span>
            </button>
            <button 
              onclick="orderSingleProductWhatsApp('${product.id}')"
              class="w-full sm:w-auto py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm">
              <i class="bi bi-whatsapp"></i>
              <span>Order on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  modalBackdrop.classList.add("open");
  quickViewModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  if (quickViewModal && modalBackdrop) {
    modalBackdrop.classList.remove("open");
    quickViewModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

// Toast Alert
function showToast(msg) {
  if (!toastNotice || !toastMessage) return;
  toastMessage.innerText = msg;
  toastNotice.classList.add("show");
  setTimeout(() => {
    toastNotice.classList.remove("show");
  }, 2800);
}

// Direct 1-Click WhatsApp Quick Order for Single Product
function orderSingleProductWhatsApp(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  if (typeof soundEngine !== "undefined") soundEngine.playOrderFanfare();

  let customerName = document.getElementById("cust-name-input") ? document.getElementById("cust-name-input").value.trim() : state.customerName;
  let customerAddress = document.getElementById("cust-address-input") ? document.getElementById("cust-address-input").value.trim() : state.customerAddress;

  const savings = product.mrp - product.salesPrice;
  const discount = getDiscountPercent(product.mrp, product.salesPrice);

  let message = `🛒 *QUICK ORDER - SELVAN SUPER MARKET*\n\n`;
  message += `Hello Selvan Super Market, I would like to order this item:\n\n`;
  message += `📦 *Product:* ${product.name}\n`;
  message += `🏷️ *Unit:* ${product.unit}\n`;
  message += `💥 *Offer:* ${product.offerLabel || 'Special Discount'}\n`;
  message += `💰 *Deal Price:* ${formatCurrency(product.salesPrice)} (MRP: ${formatCurrency(product.mrp)})\n`;
  message += `🎉 *Savings:* ${formatCurrency(savings)} (${discount}% OFF)\n`;
  message += `⏳ *Offer Valid Till:* ${formatOfferDate(product.offerEndsAt)}\n\n`;

  if (customerName) message += `👤 *Customer Name:* ${customerName}\n`;
  if (customerAddress) message += `📍 *Delivery Address:* ${customerAddress}\n`;

  message += `\nPlease confirm availability and deliver to my address. Thank you!`;

  const url = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Full Shopping Cart WhatsApp Order Generator
function sendWhatsAppOrder() {
  if (state.cart.length === 0) {
    alert("Your shopping cart is empty! Please add some grocery products first.");
    return;
  }

  if (typeof soundEngine !== "undefined") soundEngine.playOrderFanfare();

  const nameInput = document.getElementById("cust-name-input");
  const addressInput = document.getElementById("cust-address-input");
  const phoneInput = document.getElementById("cust-phone-input");

  if (nameInput) state.customerName = nameInput.value.trim();
  if (addressInput) state.customerAddress = addressInput.value.trim();
  if (phoneInput) state.customerPhone = phoneInput.value.trim();

  localStorage.setItem("selvan_cust_name", state.customerName);
  localStorage.setItem("selvan_cust_address", state.customerAddress);
  localStorage.setItem("selvan_cust_phone", state.customerPhone);

  let totalMrp = 0;
  let totalSales = 0;
  let totalSavings = 0;

  let text = `🛒 *NEW GROCERY ORDER - SELVAN SUPER MARKET*\n`;
  text += `------------------------------------\n`;

  if (state.customerName) text += `👤 *Customer Name:* ${state.customerName}\n`;
  if (state.customerAddress) text += `📍 *Delivery Address:* ${state.customerAddress}\n`;
  if (state.customerPhone) text += `📞 *Contact Phone:* ${state.customerPhone}\n`;
  text += `📅 *Date & Time:* ${new Date().toLocaleString('en-IN')}\n`;
  text += `------------------------------------\n\n`;
  text += `📦 *ORDERED ITEMS LIST:*\n`;

  state.cart.forEach((item, idx) => {
    const itemTotal = item.salesPrice * item.qty;
    const itemMrpTotal = item.mrp * item.qty;
    const itemSavings = itemMrpTotal - itemTotal;

    totalSales += itemTotal;
    totalMrp += itemMrpTotal;
    totalSavings += itemSavings;

    text += `${idx + 1}. *${item.name}* (${item.unit})\n`;
    if (item.offerLabel) text += `   💥 Offer: ${item.offerLabel}\n`;
    text += `   Qty: ${item.qty} × ₹${item.salesPrice} = *₹${itemTotal.toLocaleString('en-IN')}*\n`;
    text += `   (MRP: ₹${item.mrp} • Saved ₹${itemSavings.toLocaleString('en-IN')})\n`;
  });

  text += `\n------------------------------------\n`;
  text += `💰 *Total MRP Value:* ₹${totalMrp.toLocaleString('en-IN')}\n`;
  text += `🎉 *Total Offer Discount Saved:* -₹${totalSavings.toLocaleString('en-IN')}\n`;
  text += `🚚 *Home Delivery:* FREE (Orders above ₹500)\n`;
  text += `💵 *FINAL PAYABLE AMOUNT: ₹${totalSales.toLocaleString('en-IN')}*\n`;
  text += `------------------------------------\n\n`;
  text += `💬 *Please accept this order and let me know the delivery dispatch time. Thank you!*`;

  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

// Audio Toggles (Music & Sound Effects)
function toggleMusic() {
  if (typeof soundEngine === "undefined") return;
  const isPlaying = soundEngine.toggleBackgroundMusic();
  
  if (musicToggleBtn) {
    if (isPlaying) {
      musicToggleBtn.innerHTML = `
        <span class="flex items-center gap-1.5 text-amber-300 font-bold">
          <span class="inline-flex gap-0.5 items-end h-3">
            <span class="w-1 bg-amber-400 animate-pulse h-3"></span>
            <span class="w-1 bg-amber-400 animate-pulse h-2"></span>
            <span class="w-1 bg-amber-400 animate-pulse h-3.5"></span>
          </span>
          <span>Music: ON</span>
        </span>
      `;
      showToast("🎵 Relaxing Supermarket Music Playing");
    } else {
      musicToggleBtn.innerHTML = `
        <span class="flex items-center gap-1 text-gray-300">
          <i class="bi bi-music-note-beamed"></i>
          <span>Music: OFF</span>
        </span>
      `;
      showToast("Music Paused");
    }
  }
}

function toggleSoundFx() {
  if (typeof soundEngine === "undefined") return;
  const isEnabled = soundEngine.toggleSoundEffects();
  if (soundFxToggleBtn) {
    soundFxToggleBtn.innerHTML = isEnabled 
      ? `<i class="bi bi-volume-up-fill text-emerald-400"></i><span>Sound FX: ON</span>` 
      : `<i class="bi bi-volume-mute-fill text-gray-400"></i><span>Sound FX: OFF</span>`;
  }
  showToast(isEnabled ? "Sound Effects Enabled" : "Sound Effects Muted");
}

// Real-Time Countdown Tick loop
function startLiveCountdownLoop() {
  setInterval(() => {
    const countdownElements = document.querySelectorAll("[data-countdown-id]");
    countdownElements.forEach(el => {
      const prodId = el.getAttribute("data-countdown-id");
      const prod = PRODUCTS_DATA.find(p => p.id === prodId);
      if (prod) {
        const cd = getOfferCountdown(prod.offerEndsAt);
        el.innerHTML = `<i class="bi bi-stopwatch"></i> ${cd.text}`;
        if (cd.urgency === "urgent" && !el.classList.contains("pulse-urgent")) {
          el.className = `inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cd.badgeClass} border text-xs`;
        }
      }
    });
  }, 1000);
}

// Switch View Mode (Grid vs List)
function setViewMode(mode) {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  state.viewMode = mode;
  const gridBtn = document.getElementById("view-grid-btn");
  const listBtn = document.getElementById("view-list-btn");
  
  if (gridBtn && listBtn) {
    if (mode === "grid") {
      gridBtn.classList.add("bg-emerald-600", "text-white");
      gridBtn.classList.remove("bg-white", "text-gray-600");
      listBtn.classList.remove("bg-emerald-600", "text-white");
      listBtn.classList.add("bg-white", "text-gray-600");
    } else {
      listBtn.classList.add("bg-emerald-600", "text-white");
      listBtn.classList.remove("bg-white", "text-gray-600");
      gridBtn.classList.remove("bg-emerald-600", "text-white");
      gridBtn.classList.add("bg-white", "text-gray-600");
    }
  }
  renderProducts();
}

// Quick Search from suggested keywords
function quickSearch(keyword) {
  if (typeof soundEngine !== "undefined") soundEngine.playClick();
  if (searchInput) {
    searchInput.value = keyword;
    state.searchQuery = keyword;
    if (clearSearchBtn) clearSearchBtn.classList.remove("hidden");
    renderProducts();
  }
}

// Iconic Mouse Trailing Sparkle Effect
function setupIconicMouseTrail() {
  let lastTime = 0;
  window.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastTime > 35) { // 28fps smooth trail
      lastTime = now;
      const dot = document.createElement("div");
      dot.className = "cursor-particle";
      const size = Math.floor(Math.random() * 6) + 4;
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
      const colors = ["#22c55e", "#f59e0b", "#10b981", "#fbbf24", "#34d399"];
      const col = colors[Math.floor(Math.random() * colors.length)];
      dot.style.backgroundColor = col;
      dot.style.boxShadow = `0 0 6px ${col}`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 550);
    }
  });
}

// Event Listeners Setup
function setupEventListeners() {
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      if (clearSearchBtn) {
        if (state.searchQuery.length > 0) {
          clearSearchBtn.classList.remove("hidden");
        } else {
          clearSearchBtn.classList.add("hidden");
        }
      }
      renderProducts();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", clearSearch);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      if (typeof soundEngine !== "undefined") soundEngine.playClick();
      state.sortBy = e.target.value;
      renderProducts();
    });
  }

  if (onlyOffersToggle) {
    onlyOffersToggle.addEventListener("change", (e) => {
      if (typeof soundEngine !== "undefined") soundEngine.playClick();
      state.onlyOffers = e.target.checked;
      renderProducts();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
      closeQuickView();
    }
  });

  // Setup Iconic Supermarket Cursor Trail
  setupIconicMouseTrail();
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryChips();
  renderProducts();
  updateCartBadge();
  renderCartDrawer();
  setupEventListeners();
  startLiveCountdownLoop();

  const nameInput = document.getElementById("cust-name-input");
  const addressInput = document.getElementById("cust-address-input");
  const phoneInput = document.getElementById("cust-phone-input");

  if (nameInput && state.customerName) nameInput.value = state.customerName;
  if (addressInput && state.customerAddress) addressInput.value = state.customerAddress;
  if (phoneInput && state.customerPhone) phoneInput.value = state.customerPhone;
});
