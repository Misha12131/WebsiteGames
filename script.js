
document.addEventListener("DOMContentLoaded", function () {
    const cartKey = "technopc-cart";

    let cart = [];

    try {
        const savedCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        if (Array.isArray(savedCart)) cart = savedCart;
    } catch {
        cart = [];
    }

    const count = document.getElementById("cart-count");
    const addButton = document.getElementById("add-to-cart");
    const itemsContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const summary = document.getElementById("cart-summary");
    const clearButton = document.getElementById("clear-cart");
    const checkoutForm = document.getElementById("checkout-form");
    const checkoutMessage = document.getElementById("checkout-message");

    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCount();
        renderCart();
    }

    function updateCount() {
        if (!count) return;

        const totalQuantity = cart.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
        );

        count.textContent = totalQuantity;
    }

    // Додавання товару в кошик
    if (addButton) {
        addButton.addEventListener("click", function () {
            const id = addButton.dataset.id || "rtx4070super";
            const name = addButton.dataset.name || "GeForce RTX 4070 SUPER";
            const price = Number(addButton.dataset.price) || 27999;

            const existing = cart.find(item => item.id === id);

            if (existing) {
                existing.quantity = (Number(existing.quantity) || 0) + 1;
            } else {
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    quantity: 1
                });
            }

            saveCart();

            const originalText = addButton.textContent;
            addButton.textContent = "✓ Додано в кошик!";

            setTimeout(() => {
                addButton.textContent = originalText;
            }, 1500);
        });
    }

    // Відображення кошика
    function renderCart() {
        if (!itemsContainer) return;

        itemsContainer.innerHTML = "";

        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h2>Твій кошик поки порожній 😢</h2>
                    <p>Знайди щось круте в нашому каталозі!</p>
                </div>
            `;

            if (summary) summary.hidden = true;
            if (totalElement) totalElement.textContent = "0";
            return;
        }

        if (summary) summary.hidden = false;

        cart.forEach(item => {
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const price = Math.max(0, Number(item.price) || 0);

            const article = document.createElement("article");
            article.className = "cart-item";

            const info = document.createElement("div");

            const title = document.createElement("h3");
            title.textContent = item.name;

            const unitPrice = document.createElement("p");
            unitPrice.textContent =
                "Ціна: " + price.toLocaleString("uk-UA") + " ₴";

            const subtotal = document.createElement("p");
            subtotal.className = "cart-price";
            subtotal.textContent =
                "Сума: " +
                (price * quantity).toLocaleString("uk-UA") + " ₴";

            info.append(title, unitPrice, subtotal);

            const controls = document.createElement("div");
            controls.className = "cart-controls";

            const minus = document.createElement("button");
            minus.className = "qty-button";
            minus.textContent = "−";
            minus.type = "button";
            minus.setAttribute("aria-label", "Зменшити кількість");

            const qty = document.createElement("span");
            qty.textContent = quantity;

            const plus = document.createElement("button");
            plus.className = "qty-button";
            plus.textContent = "+";
            plus.type = "button";
            plus.setAttribute("aria-label", "Збільшити кількість");

            const remove = document.createElement("button");
            remove.className = "remove-button";
            remove.textContent = "🗑️ Видалити";
            remove.type = "button";

            minus.addEventListener("click", function () {
                const current = cart.find(product => product.id === item.id);
                if (!current) return;

                current.quantity--;

                if (current.quantity <= 0) {
                    cart = cart.filter(product => product.id !== item.id);
                }

                saveCart();
            });

            plus.addEventListener("click", function () {
                const current = cart.find(product => product.id === item.id);
                if (!current) return;

                current.quantity++;
                saveCart();
            });

            remove.addEventListener("click", function () {
                cart = cart.filter(product => product.id !== item.id);
                saveCart();
            });

            controls.append(minus, qty, plus, remove);
            article.append(info, controls);
            itemsContainer.appendChild(article);
        });

        const total = cart.reduce(
            (sum, item) =>
                sum + (Number(item.price) || 0) *
                (Number(item.quantity) || 0),
            0
        );

        if (totalElement) {
            totalElement.textContent = total.toLocaleString("uk-UA");
        }
    }

    // Очищення кошика
    if (clearButton) {
        clearButton.addEventListener("click", function () {
            if (cart.length === 0) return;

            if (confirm("Точно очистити весь кошик?")) {
                cart = [];
                saveCart();
            }
        });
    }

    // Оформлення замовлення
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (cart.length === 0) {
                alert("Твій кошик порожній!");
                return;
            }

            if (!checkoutForm.reportValidity()) return;

            const customerName =
                document.getElementById("customer-name").value.trim();

            const customerPhone =
                document.getElementById("customer-phone").value.trim();

            const customerAddress =
                document.getElementById("customer-address").value.trim();

            const total = cart.reduce(
                (sum, item) =>
                    sum + Number(item.price) * Number(item.quantity),
                0
            );

            const orderNumber = Date.now().toString().slice(-8);

            // Демонстраційне підтвердження замовлення
            const order = {
                number: orderNumber,
                customer: customerName,
                phone: customerPhone,
                address: customerAddress,
                items: cart,
                total: total,
                date: new Date().toLocaleString("uk-UA")
            };

            // Зберігаємо демонстраційне замовлення в браузері
            const orders = JSON.parse(
                localStorage.getItem("technopc-orders") || "[]"
            );

            orders.push(order);
            localStorage.setItem("technopc-orders", JSON.stringify(orders));

            if (checkoutMessage) {
                checkoutMessage.hidden = false;
                checkoutMessage.innerHTML = `
                    <h2>✓ Замовлення оформлено!</h2>
                    <p>Дякуємо, ${customerName}!</p>
                    <p>Номер замовлення: <strong>#${orderNumber}</strong></p>
                    <p>Сума: <strong>${total.toLocaleString("uk-UA")} ₴</strong></p>
                    <p>Це демонстраційне замовлення — магазин не отримав твої дані.</p>
                `;
            }

            cart = [];
            localStorage.removeItem(cartKey);
            updateCount();
            renderCart();
            checkoutForm.reset();
            checkoutForm.hidden = true;

            if (clearButton) clearButton.disabled = true;
        });
    }

    updateCount();
    renderCart();
});
