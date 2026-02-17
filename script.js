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

	// Load trending products dynamically
	fetchTrendingProducts();
});

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
	// show loading state
	container.innerHTML = '<div class="col-span-full text-center text-gray-500">Loading...</div>';

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

						<h3 class="mt-3 font-semibold text-gray-900">${title}</h3>

						<div class="mt-2">
							<span class="font-bold text-lg text-gray-900">$${price}</span>
						</div>

						<div class="mt-4 flex gap-2">
							<button class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm">
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

