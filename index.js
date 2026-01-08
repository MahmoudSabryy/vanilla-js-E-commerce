let currentPage = 1;
const productsPerPage = 5;
async function fetchProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const products = await response.json();
    displayProducts(products);
    const applyButton = document.getElementById("apply");
    applyButton.addEventListener("click", function () {
      applyAllFilters(products);
    });
    const resetButton = document.getElementById("reset");
    resetButton.addEventListener("click", function () {
      clearFilters();
      displayProducts(products);
    });
    addToCart(products);
    setupViewButtons(products);
  } catch (error) {
    console.log("Error fetching products:", error);
  }
}

function displayProducts(products) {
  const productsContainer = document.querySelector(".products");
  productsContainer.innerHTML = "";

  const totalPages = Math.ceil(products.length / productsPerPage);
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const currentProducts = products.slice(start, end);

  currentProducts.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>💵 $${product.price}</p>
      <p>⭐ ${product.rating.rate} (${product.rating.count})</p>
      <div>
        <button class="add-btn" data-id="${product.id}">Add to Cart</button>
        <button class="view-btn" data-id="${product.id}">View Details</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  renderPagination(totalPages);
  addToCart(products);
  setupViewButtons(products);
}

function renderPagination(totalPages) {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  const prev = document.createElement("button");
  prev.textContent = "Prev";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchProducts();
    }
  });
  pagination.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      fetchProducts();
    });
    pagination.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = "Next";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchProducts();
    }
  });
  pagination.appendChild(next);
}

function applyAllFilters(products) {
  let filtered = [...products];

  const search = document.getElementById("search");

  const searchInput = search.value.toLowerCase();

  if (searchInput) {
    filtered = filtered.filter((product) => {
      return product.title.toLowerCase().includes(searchInput);
    });
  }
  const category = document.getElementById("Categories");
  const categorySelected = category.value;
  if (categorySelected !== "All Categories") {
    filtered = filtered.filter((product) => {
      return product.category.toLowerCase() === categorySelected.toLowerCase();
    });
  }

  const minVal = parseFloat(document.getElementById("min").value) || 0;
  const maxVal = parseFloat(document.getElementById("max").value) || Infinity;

  filtered = filtered.filter(
    (product) => product.price >= minVal && product.price <= maxVal
  );
  const sort = document.getElementById("sort");
  if (sort.value === "price")
    filtered = filtered.sort((a, b) => a.price - b.price);
  if (sort.value === "name")
    filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sort.value === "rating")
    filtered = filtered.sort((a, b) => b.rating.rate - a.rating.rate);
  displayProducts(filtered);
}

function clearFilters() {
  const search = document.getElementById("search");
  search.value = "";
  const category = document.getElementById("Categories");
  category.value = "All Categories";
  const min = document.getElementById("min");
  min.value = "";
  const max = document.getElementById("max");
  max.value = "";
  const sort = document.getElementById("sort");
  sort.value = "price";
}

function addToCart(products) {
  const cartArr = JSON.parse(localStorage.getItem("cart")) || [];
  const cart = document.querySelector(".cart");
  updateCartUI();

  const addbtns = document.querySelectorAll(".add-btn");

  addbtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(btn.getAttribute("data-id"));

      if (cartArr.some((product) => product.id === productId)) {
        const product = cartArr.find((product) => product.id === productId);
        product.quantity++;
        updateCartUI();
        return;
      }

      const selectedItem = products.find((product) => product.id === productId);
      cartArr.push({
        id: selectedItem.id,
        title: selectedItem.title,
        price: selectedItem.price,
        quantity: 1,
      });

      saveCart();
      updateCartUI();
    });
  });

  function updateCartUI() {
    cart.innerHTML = "";
    const cartContainer = document.createElement("div");

    if (cartArr.length === 0) {
      cartContainer.classList.add("cart-container");
      cartContainer.innerHTML = `
      <p>Cart is empty !</p>
      `;
      cart.appendChild(cartContainer);
      return;
    }
    cartArr.forEach((product) => {
      const cartContainer = document.createElement("div");
      cartContainer.classList.add("cart-container");
      cartContainer.innerHTML = `
        <p>${product.title}</p>
        <p>
  <span class="label">Price:</span>
  <span class="value">$${product.price}</span>
        </p>
        
                <p>
  <span class="label">Quantity:</span>
  <span class="value">${product.quantity}</span>
                </p>
                
        <p><span class="label">Total product Price:</span>${
          product.price * product.quantity
        }</p>
        <button class="remove-btn" data-id="${
          product.id
        }">Remove from Cart</button>
        `;

      cart.appendChild(cartContainer);
    });
    calculateTotalPrice();
    calculateTotalQuantity();
    attachRemoveEvents();
  }
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cartArr));
  }
  function calculateTotalPrice() {
    const cartContainer = document.querySelectorAll(".cart-container");
    let total = 0;
    cartContainer.forEach((product) => {
      const totalElement = product.querySelector("p:nth-of-type(4)");
      if (totalElement) {
        const price = parseFloat(
          totalElement.textContent.replace(/[^0-9.]/g, "")
        );
        total += price;
      }
    });
    let cartTotalDiv = document.querySelector(".cart-total");
    if (!cartTotalDiv) {
      cartTotalDiv = document.createElement("div");
      cartTotalDiv.classList.add("cart-total");
      cart.appendChild(cartTotalDiv);
    }
    cartTotalDiv.style.cssText =
      "text-align: center; color: green; font-size: 20px; margin-top: 10px;";
    cartTotalDiv.innerHTML = `<h4>Total Cart Price: ${total.toFixed(2)} $</h4>`;
  }
  function calculateTotalQuantity() {
    const cartContainer = document.querySelectorAll(".cart-container");
    let total = 0;
    cartContainer.forEach((product) => {
      const totalElement = product.querySelector("p:nth-of-type(3)");
      if (totalElement) {
        const price = parseFloat(
          totalElement.textContent.replace(/[^0-9.]/g, "")
        );
        total += price;
      }
    });
    let cartTotalDiv = document.querySelector(".cart-quantity");
    if (!cartTotalDiv) {
      cartTotalDiv = document.createElement("div");
      cartTotalDiv.classList.add("cart-quantity");
      cart.appendChild(cartTotalDiv);
    }
    cartTotalDiv.style.cssText =
      "text-align: center; color: wheat; font-size: 18px; margin-top: 10px;";
    cartTotalDiv.innerHTML = `<h4>Total Cart Quantity: ${total} item</h4>`;
  }

  function attachRemoveEvents() {
    const removeBtns = document.querySelectorAll(".remove-btn");
    removeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        // حذف المنتج من المصفوفة
        const index = cartArr.findIndex((product) => product.id === id);
        if (index > -1) {
          cartArr.splice(index, 1);
          saveCart();
          updateCartUI();
        }
      });
    });
  }
}

function setupViewButtons(products) {
  const viewButtons = document.querySelectorAll(".view-btn");
  const popup = document.getElementById("popup");
  const closePopup = document.getElementById("closePopup");
  const popupImg = document.getElementById("popup-img");
  const popupTitle = document.getElementById("popup-title");
  const popupPrice = document.getElementById("popup-price");

  const popupRating = document.getElementById("popup-rating");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(btn.getAttribute("data-id"));
      const product = products.find((p) => p.id === productId);

      popupImg.src = product.image;
      popupTitle.textContent = product.title;
      popupPrice.textContent = `Price: $${product.price}`;

      popupRating.textContent = `Rating: ${product.rating.rate} ⭐ (${product.rating.count} reviews)`;

      popup.style.display = "flex";
    });
  });

  closePopup.addEventListener("click", () => {
    popup.style.display = "none";
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}

fetchProducts();
