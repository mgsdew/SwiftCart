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

	var html = items.map(function (p) {
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
						<button class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm" onclick="alert('Added to cart: ${escapeHtml(p.title)}')"><i class="fa-solid fa-cart-shopping"></i><span>Add</span></button>
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
							<button class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">
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

			// attach simple handlers (placeholder)
			var buyBtn = document.getElementById('modalBuyBtn');
			var addBtn = document.getElementById('modalAddBtn');
			if (buyBtn) buyBtn.addEventListener('click', function () { alert('Buy now: ' + title); });
			if (addBtn) addBtn.addEventListener('click', function () { alert('Added to cart: ' + title); });
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

// close on Escape
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeProductModal(); });
