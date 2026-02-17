// Main site scripts
document.addEventListener('DOMContentLoaded', function () {
	const mobileBtn = document.getElementById('mobileMenuBtn');
	const mobileMenu = document.getElementById('mobileMenu');

	if (mobileBtn && mobileMenu) {
		mobileBtn.addEventListener('click', () => {
			mobileMenu.classList.toggle('hidden');
		});
	}

	// Optionally close mobile menu when clicking outside
	document.addEventListener('click', (e) => {
		if (!mobileMenu || !mobileBtn) return;
		const target = /** @type {HTMLElement} */ (e.target);
		if (!mobileMenu.classList.contains('hidden')) {
			if (!mobileMenu.contains(target) && !mobileBtn.contains(target)) {
				mobileMenu.classList.add('hidden');
			}
		}
	});

	// set active top navigation based on current path
	setActiveTopNav();

	// Load trending products dynamically
	fetchTrendingProducts();

	// If on products page, load categories and initial products
	if (document.getElementById('categoryBar')) {
		fetchCategories();
		// load all products initially
		loadProductsByCategory('all');
	}

});

// --- Product page functions ---
function fetchCategories() {
	var bar = document.getElementById('categoryBar');
	if (!bar) return;

	// show small loading indicator
	bar.innerHTML = '<div class="text-sm text-gray-500">Loading categories...</div>';

	console.debug('[fetchCategories] loading categories from API...');

	fetch('https://fakestoreapi.com/products/categories')
		.then(function (res) {
			console.debug('[fetchCategories] response status', res.status, res.statusText);
			if (!res.ok) throw new Error('Network response was not ok');
			return res.json();
		})
		.then(function (cats) {
			var categories = Array.isArray(cats) ? cats : [];
			console.debug('[fetchCategories] categories loaded', categories.length, categories);
			// include 'all' option
			var html = [];
			html.push(`<button data-cat="all" class="px-3 py-1 rounded-full border border-gray-200 bg-indigo-50 text-indigo-600 font-semibold">All</button>`);
			categories.forEach(function (c) {
				html.push(`<button data-cat="${escapeHtml(c)}" class="px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-indigo-50">${escapeHtml(c)}</button>`);
			});
			bar.innerHTML = html.join('\n');

			// attach handlers
			bar.querySelectorAll('button[data-cat]').forEach(function (btn) {
				btn.addEventListener('click', function () {
					var cat = btn.getAttribute('data-cat');
					// visual active state: clear others and restore their default appearance
					bar.querySelectorAll('button[data-cat]').forEach(function (b) {
						b.classList.remove('bg-indigo-600','text-white','ring','ring-indigo-200','bg-indigo-50','text-indigo-600','font-semibold');
						// ensure default look is white background + gray text
						b.classList.add('bg-white','text-gray-700');
					});
					// set active appearance and remove bg-white if present
					btn.classList.remove('bg-white','text-gray-700');
					btn.classList.add('bg-indigo-600','text-white');
					loadProductsByCategory(cat);
				});
			});

			// initial active = All (remove bg-white so indigo shows)
			var allBtn = bar.querySelector('button[data-cat="all"]');
			if (allBtn) {
				// remove any light/contradictory classes
				allBtn.classList.remove('bg-white','text-gray-700','bg-indigo-50','text-indigo-600','font-semibold');
				allBtn.classList.add('bg-indigo-600','text-white');
			}
		})
		.catch(function (err) {
			console.error('Failed to load categories', err);
			bar.innerHTML = '<div class="text-sm text-red-500">Failed to load categories.</div>';
		});
}

function loadProductsByCategory(category) {
	var container = document.getElementById('productsGrid');
	if (!container) return;

	// show skeletons while loading
	container.innerHTML = Array.from({ length: 8 }).map(() => `
		<article class="skeleton-card">
			<div class="skeleton-rect skeleton-img"></div>
			<div class="p-4">
				<div class="skeleton-rect skeleton-line skeleton-sm"></div>
				<div class="mt-3"><div class="skeleton-rect skeleton-line skeleton-md"></div></div>
				<div class="mt-2"><div class="skeleton-rect skeleton-line skeleton-sm"></div></div>
				<div class="mt-4 flex gap-2"><div class="skeleton-rect" style="flex:1; height:36px"></div><div class="skeleton-rect" style="flex:1; height:36px"></div></div>
			</div>
		</article>
	`).join('\n');

	var url = category === 'all' ? 'https://fakestoreapi.com/products' : 'https://fakestoreapi.com/products/category/' + encodeURIComponent(category);
	console.debug('[loadProductsByCategory] loading category=', category, ' url=', url);

	fetch(url)
		.then(function (res) {
			console.debug('[loadProductsByCategory] response status', res.status, res.statusText);
			if (!res.ok) throw new Error('Network response was not ok');
			return res.json();
		})
		.then(function (data) {
			var items = Array.isArray(data) ? data : [];
			console.debug('[loadProductsByCategory] items loaded', items.length);
			renderProducts(items);
		})
		.catch(function (err) {
			console.error('Failed to load products for category', category, err);
			container.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load products. See console for details.</div>';
		});
}

// Highlight top navigation link for current page
function setActiveTopNav() {
	var links = document.querySelectorAll('header nav a, #mobileMenu a');
	var current = (location.pathname || '').split('/').pop() || 'index.html';

	links.forEach(function (link) {
		var href = link.getAttribute('href') || '';
		if (href.indexOf('#') === 0) return;
		var linkPath = href.split('/').pop();
		if (!linkPath) linkPath = 'index.html';

		// ensure default non-active appearance
		link.classList.remove('text-indigo-600');
		link.classList.add('text-gray-600', 'hover:text-indigo-600');

		if (linkPath === current) {
			link.classList.remove('text-gray-600');
			link.classList.add('text-indigo-600');
		}
	});

	// update active text color immediately on click
	links.forEach(function (link) {
		link.addEventListener('click', function () {
			var href = link.getAttribute('href') || '';
			if (!href || href.indexOf('#') === 0) return;

			links.forEach(function (l) {
				l.classList.remove('text-indigo-600');
				l.classList.add('text-gray-600', 'hover:text-indigo-600');
			});

			link.classList.remove('text-gray-600');
			link.classList.add('text-indigo-600');
		});
	});
}

function renderProducts(items) {
	var container = document.getElementById('productsGrid');
	if (!container) return;
	if (!Array.isArray(items) || items.length === 0) {
		container.innerHTML = '<div class="col-span-full text-center text-gray-500">No products found.</div>';
		return;
	}

	window.productCache = window.productCache || {};

	var html = items.map(function (p) {
		// cache product for later add-to-cart operations
		window.productCache[p.id] = p;
		var title = escapeHtml(p.title || '');
		var shortTitle = truncate(title, 60);
		var price = typeof p.price === 'number' ? p.price.toFixed(2) : escapeHtml(p.price);
		var img = escapeHtml(p.image || '');
		var category = escapeHtml(p.category || '');
		var rate = p.rating && typeof p.rating.rate !== 'undefined' ? p.rating.rate : 0;
		var count = p.rating && typeof p.rating.count !== 'undefined' ? p.rating.count : 0;

		// render simple star visualization
		var stars = '';
		var rounded = Math.round(rate);
		for (var i = 0; i < 5; i++) { stars += (i < rounded) ? '<i class="fa-solid fa-star text-yellow-400"></i>' : '<i class="fa-regular fa-star text-gray-300"></i>'; }

		return `
			<article class="bg-white rounded-xl shadow overflow-hidden">
				<img class="w-full h-48 object-contain bg-gray-100" src="${img}" alt="${title}">
				<div class="p-4">
					<div class="flex items-center justify-between">
							<span class="text-xs font-semibold inline-block bg-blue-500 text-white px-2 py-1 rounded shadow-sm">${category}</span>
							<div class="text-sm flex items-center gap-2">
								<i class="fa-solid fa-star text-yellow-400"></i>
								<span class="font-semibold text-gray-800">${rate}</span>
								<span class="text-xs text-gray-500">(${count})</span>
							</div>
				    </div>
					<h3 class="mt-3 font-semibold text-gray-900 one-line-ellipsis" title="${title}">${shortTitle}</h3>
					<div class="mt-2"><span class="font-bold text-lg text-gray-900">$${price}</span></div>
					<div class="mt-4 flex gap-2">
						<button type="button" onclick="openProductModal(${p.id})" class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm"><i class="fa-regular fa-eye"></i><span>Details</span></button>
						<button class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm" onclick="addToCart(${p.id})"><i class="fa-solid fa-cart-shopping"></i><span>Add</span></button>
					</div>
				</div>
			</article>
		`;
	}).join('\n');

	container.innerHTML = html;
}

function truncate(str, max) {
	if (!str) return '';
	if (str.length <= max) return str;
	return str.slice(0, max - 1) + '…';
}

// Utility to escape HTML when injecting strings
function escapeHtml(str) {
	if (!str) return '';
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function fetchTrendingProducts() {
	const container = document.getElementById('trendingGrid');
	if (!container) return;
	// show skeleton loading state (3 cards)
	container.innerHTML = Array.from({ length: 3 }).map(() => {
		return `
		<article class="skeleton-card">
			<div class="skeleton-rect skeleton-img"></div>
			<div class="p-4">
				<div class="flex items-center justify-between">
					<div class="skeleton-rect skeleton-line skeleton-sm"></div>
					<div class="skeleton-rect skeleton-line skeleton-sm" style="width:48px"></div>
				</div>
				<div class="mt-3">
					<div class="skeleton-rect skeleton-line skeleton-md"></div>
				</div>
				<div class="mt-2">
					<div class="skeleton-rect skeleton-line skeleton-sm"></div>
				</div>
				<div class="mt-4 flex gap-2">
					<div class="skeleton-rect skeleton-line" style="flex:1; height:36px;"></div>
					<div class="skeleton-rect skeleton-line" style="flex:1; height:36px;"></div>
				</div>
			</div>
		</article>
		`;
	}).join('\n');

	fetch('https://fakestoreapi.com/products')
		.then(function (res) {
			if (!res.ok) throw new Error('Network response was not ok');
			return res.json();
		})
		.then(function (data) {
			// Sort by rating.rate descending and pick top 3
			const top = (Array.isArray(data) ? data : [])
				.sort(function (a, b) { return (b.rating && b.rating.rate ? b.rating.rate : 0) - (a.rating && a.rating.rate ? a.rating.rate : 0); })
				.slice(0, 3);

			if (top.length === 0) {
				container.innerHTML = '<div class="col-span-full text-center text-gray-500">No products found.</div>';
				return;
			}

			// Build readable multi-line HTML string and set once
			var html = top.map(function (p) {
				window.productCache = window.productCache || {};
				window.productCache[p.id] = p;
				var title = escapeHtml(p.title);
				var category = escapeHtml(p.category);
				var price = typeof p.price === 'number' ? p.price.toFixed(2) : escapeHtml(p.price);
				var img = escapeHtml(p.image || '');
				var rate = p.rating && typeof p.rating.rate !== 'undefined' ? p.rating.rate : 'N/A';
				var count = p.rating && typeof p.rating.count !== 'undefined' ? p.rating.count : 0;

				return `
				<article class="bg-white rounded-xl shadow overflow-hidden">
					<img class="w-full h-48 object-contain bg-gray-100" src="${img}" alt="${title}">
					<div class="p-4">
						<div class="flex items-center justify-between">
							<span class="text-xs font-semibold inline-block bg-blue-500 text-white px-2 py-1 rounded shadow-sm">${category}</span>
							<div class="text-sm flex items-center gap-2">
								<i class="fa-solid fa-star text-yellow-400"></i>
								<span class="font-semibold text-gray-800">${rate}</span>
								<span class="text-xs text-gray-500">(${count})</span>
							</div>
						</div>

						<h3 class="mt-3 font-semibold text-gray-900 one-line-ellipsis">${title}</h3>

						<div class="mt-2">
							<span class="font-bold text-lg text-gray-900">$${price}</span>
						</div>

						<div class="mt-4 flex gap-2">
							<button type="button" onclick="openProductModal(${p.id})" class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm">
								<i class="fa-regular fa-eye"></i>
								<span>Details</span>
							</button>
							<button class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm" onclick="addToCart(${p.id})">
								<i class="fa-solid fa-cart-shopping"></i>
								<span>Add</span>
							</button>
						</div>
					</div>
				</article>
				`;
			}).join('\n');

			container.innerHTML = html;
		})
		.catch(function (err) {
			console.error('Failed to load products', err);
			container.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load products.</div>';
		});
}

// Open modal and load product details via API
function openProductModal(id) {
	var modal = document.getElementById('productModal');
	var content = document.getElementById('modalContent');
	if (!modal || !content) return;

	// show modal and loading
	modal.classList.remove('hidden');
	content.innerHTML = '<div class="text-center py-12"><div class="spinner mx-auto"></div></div>';

	fetch('https://fakestoreapi.com/products/' + id)
		.then(function (res) { if (!res.ok) throw new Error('Network response was not ok'); return res.json(); })
		.then(function (p) {
			var title = escapeHtml(p.title);
			var desc = escapeHtml(p.description);
			var price = typeof p.price === 'number' ? p.price.toFixed(2) : escapeHtml(p.price);
			var img = escapeHtml(p.image || '');
			var rate = p.rating && typeof p.rating.rate !== 'undefined' ? p.rating.rate : 'N/A';
			var count = p.rating && typeof p.rating.count !== 'undefined' ? p.rating.count : 0;

			content.innerHTML = `
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div class="sm:col-span-1 flex items-center justify-center">
						<img class="max-h-48 object-contain" src="${img}" alt="${title}">
					</div>
					<div class="sm:col-span-2">
						<h3 class="text-xl font-bold mb-2">${title}</h3>
						<p class="text-sm text-gray-700 mb-4">${desc}</p>
						<div class="flex items-center justify-between">
							<div class="text-lg font-semibold">$${price}</div>
							<div class="text-sm text-gray-600">Rating: <span class="font-semibold">${rate}</span> (${count})</div>
						</div>
						<div class="mt-4 flex gap-2">
							<button id="modalBuyBtn" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md">Buy Now</button>
							<button id="modalAddBtn" class="flex-1 px-4 py-2 border rounded-md">Add to Cart</button>
						</div>
					</div>
				</div>
			`;

			// attach handlers
			var buyBtn = document.getElementById('modalBuyBtn');
			var addBtn = document.getElementById('modalAddBtn');
			if (buyBtn) buyBtn.addEventListener('click', function () { alert('Buy now: ' + title); });
			if (addBtn) addBtn.addEventListener('click', function () { addToCart(p.id); });
		})
		.catch(function (err) {
			console.error('Failed to load product', err);
			content.innerHTML = '<div class="text-center text-red-500 py-8">Failed to load product details.</div>';
		});
}

function closeProductModal() {
	var modal = document.getElementById('productModal');
	if (!modal) return;
	modal.classList.add('hidden');
}

// wire modal close UI
document.addEventListener('click', function (e) {
	var modal = document.getElementById('productModal');
	if (!modal || modal.classList.contains('hidden')) return;
	var overlay = document.getElementById('productModalOverlay');
	var closeBtn = document.getElementById('modalCloseBtn');
	if (e.target === overlay || e.target === closeBtn || closeBtn.contains(e.target)) {
		closeProductModal();
	}
});

// --- Cart and product storage ---
window.cart = window.cart || [];
window.productsArray = window.productsArray || [];

function loadCartFromStorage() {
	var raw = localStorage.getItem('swiftcart_cart');
	return Promise.resolve().then(function () {
		if (!raw) return [];
		return JSON.parse(raw);
	}).then(function (parsed) {
		window.cart = Array.isArray(parsed) ? parsed : [];
		return window.cart;
	}).catch(function (e) {
		console.error('Failed to load cart from storage', e);
		window.cart = [];
		return window.cart;
	});
}

function saveCartToStorage() {
	return Promise.resolve().then(function () {
		localStorage.setItem('swiftcart_cart', JSON.stringify(window.cart || []));
	}).catch(function (e) {
		console.error('Failed to save cart to storage', e);
	});
}

function loadProductsFromStorage() {
	var raw = localStorage.getItem('swiftcart_products');
	return Promise.resolve().then(function () {
		if (!raw) return [];
		return JSON.parse(raw);
	}).then(function (parsed) {
		window.productsArray = Array.isArray(parsed) ? parsed : [];
		return window.productsArray;
	}).catch(function (e) {
		console.error('Failed to load products from storage', e);
		window.productsArray = [];
		return window.productsArray;
	});
}

function saveProductsToStorage() {
	return Promise.resolve().then(function () {
		localStorage.setItem('swiftcart_products', JSON.stringify(window.productsArray || []));
	}).catch(function (e) {
		console.error('Failed to save products to storage', e);
	});
}

function storeProduct(p) {
	window.productsArray = window.productsArray || [];
	var exists = window.productsArray.find(function (x) { return String(x.id) === String(p.id); });
	if (!exists) {
		window.productsArray.push(p);
		saveProductsToStorage();
	}
}

function computeCartTotal() {
	return (window.cart || []).reduce(function (sum, item) {
		return sum + (Number(item.price || 0) * (item.quantity || 1));
	}, 0);
}

function updateCartCountUI() {
	var badge = document.getElementById('cartCountBadge');
	var badgeMobile = document.getElementById('cartCountBadgeMobile');
	var count = (window.cart || []).reduce(function (s, it) { return s + (it.quantity || 1); }, 0);
	if (count > 0) {
		if (badge) { badge.style.display = 'inline-block'; badge.textContent = String(count); }
		if (badgeMobile) { badgeMobile.style.display = 'inline-block'; badgeMobile.textContent = String(count); }
	} else {
		if (badge) badge.style.display = 'none';
		if (badgeMobile) badgeMobile.style.display = 'none';
	}
}

function renderCartSidebar() {
	var list = document.getElementById('cartItemsList');
	var totalEl = document.getElementById('cartTotalPrice');
	if (!list || !totalEl) return;
	if (!Array.isArray(window.cart) || window.cart.length === 0) {
		list.innerHTML = '<div class="text-sm text-gray-500">Your cart is empty.</div>';
		totalEl.textContent = '$0.00';
		return;
	}

	list.innerHTML = window.cart.map(function (it) {
		var title = escapeHtml(it.title || '');
		var price = Number(it.price || 0).toFixed(2);
		var qty = it.quantity || 1;
		var img = escapeHtml(it.image || '');
		return `
			<div class="flex items-start gap-3">
				<img src="${img}" class="w-14 h-14 object-contain bg-gray-100 rounded" alt="${title}">
				<div class="flex-1">
					<div class="flex items-center justify-between">
						<div class="font-semibold text-sm">${title}</div>
						<button data-remove="${it.id}" aria-label="Remove from cart" class="text-gray-400 hover:text-red-500 remove-cart-btn"><i class="fa-solid fa-xmark"></i></button>
					</div>
					<div class="mt-2 flex items-center gap-3">
						<div class="inline-flex items-center rounded border border-gray-200">
							<button data-dec="${it.id}" class="px-2 py-1 dec-btn text-gray-600">-</button>
							<div class="px-3 py-1 text-sm" data-qty="${it.id}">${qty}</div>
							<button data-inc="${it.id}" class="px-2 py-1 inc-btn text-gray-600">+</button>
						</div>
						<div class="text-sm text-gray-600">Unit: $${price}</div>
					</div>
				</div>
				<div class="text-right">
					<div class="font-semibold">$${(Number(price) * qty).toFixed(2)}</div>
				</div>
			</div>
		`;
	}).join('<hr class="my-3"/>');

	totalEl.textContent = '$' + computeCartTotal().toFixed(2);

	// attach remove handlers
	list.querySelectorAll('.remove-cart-btn').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var id = btn.getAttribute('data-remove');
			if (!id) return;
			removeFromCart(id);
		});
	});

	// attach increment/decrement handlers
	list.querySelectorAll('.inc-btn').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var id = btn.getAttribute('data-inc');
			if (!id) return;
			changeQuantity(id, 1);
		});
	});
	list.querySelectorAll('.dec-btn').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var id = btn.getAttribute('data-dec');
			if (!id) return;
			changeQuantity(id, -1);
		});
	});
}

function changeQuantity(id, delta) {
	var pid = String(id);
	var item = (window.cart || []).find(function (it) { return String(it.id) === pid; });
	if (!item) return;
	item.quantity = (item.quantity || 1) + delta;
	if (item.quantity <= 0) {
		// remove if zero or less
		window.cart = (window.cart || []).filter(function (it) { return String(it.id) !== pid; });
	}
	saveCartToStorage().then(function () {
		updateCartCountUI();
		renderCartSidebar();
	});
}

function addToCart(id) {
	var pid = String(id);
	var p = (window.productsArray || []).find(function (x) { return String(x.id) === pid; });
	if (!p) {
		// try fetching if not present in stored products
		fetch('https://fakestoreapi.com/products/' + id)
			.then(function (res) { if (!res.ok) throw new Error('Network'); return res.json(); })
			.then(function (product) { storeProduct(product); addToCart(product.id); })
			.catch(function (err) { console.error('Failed to fetch product for addToCart', err); });
		return;
	}

	var existing = (window.cart || []).find(function (it) { return String(it.id) === pid; });
	if (existing) {
		existing.quantity = (existing.quantity || 1) + 1;
	} else {
		window.cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, quantity: 1 });
	}
	saveCartToStorage().then(function () {
		updateCartCountUI();
		renderCartSidebar();
	});
}

function removeFromCart(id) {
	var pid = String(id);
	window.cart = (window.cart || []).filter(function (it) { return String(it.id) !== pid; });
	saveCartToStorage().then(function () {
		updateCartCountUI();
		renderCartSidebar();
	});
}

// Cart & product startup wiring
document.addEventListener('DOMContentLoaded', function () {
	// load products and cart from localStorage (promise-based, no try/catch)
	Promise.all([loadProductsFromStorage(), loadCartFromStorage()]).then(function () {
		updateCartCountUI();
		renderCartSidebar();
	});

	var cartToggles = document.querySelectorAll('#cartToggleBtn, #cartToggleBtnMobile');
	var cartSidebar = document.getElementById('cartSidebar');
	var cartClose = document.getElementById('cartCloseBtn');
	if (cartToggles && cartToggles.length && cartSidebar) {
		cartToggles.forEach(function (cartToggle) {
			cartToggle.addEventListener('click', function () {
				cartSidebar.classList.toggle('hidden');
				renderCartSidebar();
			});
		});
	}
	if (cartClose && cartSidebar) {
		cartClose.addEventListener('click', function () { cartSidebar.classList.add('hidden'); });
	}
});

// close on Escape
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeProductModal(); });
