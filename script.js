$(document).ready(function() {
    // Book data
    const books = [
        { id: 1, title: "The Great Novel", author: "Jane Doe", category: "fiction", price: 19.99, image: "images/book1.jpg" },
        { id: 2, title: "Mystery at Midnight", author: "John Smith", category: "mystery", price: 15.99, image: "images/book2.jpg" },
        { id: 3, title: "Science Unveiled", author: "Dr. Lee", category: "non-fiction", price: 24.99, image: "images/book3.jpg" },
        { id: 4, title: "Epic Adventure", author: "Sam Wilson", category: "fiction", price: 17.99, image: "images/book4.jpg" },
        { id: 5, title: "Whodunit Tales", author: "Emma Brown", category: "mystery", price: 14.99, image: "images/book5.jpg" },
        { id: 6, title: "History Uncovered", author: "Prof. Green", category: "non-fiction", price: 22.99, image: "images/book6.jpg" }
    ];

    // Initialize cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Show toast notification
    function showToast(message) {
        $('#toast').text(message).addClass('show');
        setTimeout(() => {
            $('#toast').removeClass('show');
        }, 3000);
    }

    // Update cart count
    function updateCartCount() {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        $('#cart-count').text(cartCount);
    }

    // Navigation: Hamburger menu toggle
    $('.hamburger').on('click', function() {
        $('.nav-links').toggleClass('active');
    });

    // Back-to-top button
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 300) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });

    $('#back-to-top').on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    // Books page logic
    if ($('.books').length) {
        // Render books
        function renderBooks(bookList) {
            $('#book-grid').empty();
            bookList.forEach(book => {
                const bookCard = `
                    <div class="book-card" data-category="${book.category}">
                        <img src="${book.image}" alt="${book.title}">
                        <h3>${book.title}</h3>
                        <p>${book.author}</p>
                        <p class="price">$${book.price.toFixed(2)}</p>
                        <button class="add-to-cart" data-id="${book.id}">Add to Cart</button>
                    </div>
                `;
                $('#book-grid').append(bookCard);
            });
        }

        // Sort books
        function sortBooks(bookList, sortOption) {
            return bookList.sort((a, b) => {
                if (sortOption === 'title-asc') {
                    return a.title.localeCompare(b.title);
                } else if (sortOption === 'price-asc') {
                    return a.price - b.price;
                } else if (sortOption === 'price-desc') {
                    return b.price - a.price;
                }
                return 0;
            });
        }

        // Apply filters, search, and sort
        function applyBooksDisplay() {
            let filteredBooks = [...books];
            const filter = localStorage.getItem('bookFilter') || 'all';
            const searchQuery = $('#search').val().toLowerCase();
            const sortOption = $('#sort').val();

            if (filter !== 'all') {
                filteredBooks = filteredBooks.filter(book => book.category === filter);
            }

            if (searchQuery) {
                filteredBooks = filteredBooks.filter(book =>
                    book.title.toLowerCase().includes(searchQuery) || book.author.toLowerCase().includes(searchQuery)
                );
            }

            filteredBooks = sortBooks(filteredBooks, sortOption);
            renderBooks(filteredBooks);
        }

        // Restore search and filter
        const savedSearch = localStorage.getItem('bookSearch') || '';
        const savedFilter = localStorage.getItem('bookFilter') || 'all';
        const savedSort = localStorage.getItem('bookSort') || 'title-asc';
        $('#search').val(savedSearch);
        $('#sort').val(savedSort);
        $('.filter-buttons button').each(function() {
            if ($(this).data('filter') === savedFilter) {
                $(this).addClass('active');
            }
        });

        // Initial render
        applyBooksDisplay();

        // Book filter functionality
        $('.filter-buttons button').on('click', function() {
            $('.filter-buttons button').removeClass('active');
            $(this).addClass('active');
            const filter = $(this).data('filter');
            localStorage.setItem('bookFilter', filter);
            applyBooksDisplay();
        });

        // Search functionality
        $('#search').on('input', function() {
            const query = $(this).val();
            localStorage.setItem('bookSearch', query);
            applyBooksDisplay();
        });

        // Sort functionality
        $('#sort').on('change', function() {
            const sortOption = $(this).val();
            localStorage.setItem('bookSort', sortOption);
            applyBooksDisplay();
        });

        // Add to cart
        $(document).on('click', '.add-to-cart', function() {
            const bookId = parseInt($(this).data('id'));
            const book = books.find(b => b.id === bookId);
            const cartItem = cart.find(item => item.id === bookId);
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({ id: bookId, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            $('#cart-count').addClass('cart-pulse');
            setTimeout(() => {
                $('#cart-count').removeClass('cart-pulse');
            }, 300);
            showToast(`${book.title} added to cart!`);
        });
    }

    // Cart page logic
    if ($('.cart').length) {
        // Render cart
        function renderCart() {
            $('#cart-items').empty();
            let total = 0;
            cart.forEach(item => {
                const book = books.find(b => b.id === item.id);
                if (book) {
                    total += book.price * item.quantity;
                    const cartItem = `
                        <div class="cart-item">
                            <span>${book.title}</span>
                            <div class="quantity-controls">
                                <button class="decrease-quantity" data-id="${book.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="increase-quantity" data-id="${book.id}">+</button>
                            </div>
                            <span>$${(book.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `;
                    $('#cart-items').append(cartItem);
                }
            });
            $('#cart-total').text(total.toFixed(2));
        }

        // Initial render
        renderCart();

        // Increase quantity
        $(document).on('click', '.increase-quantity', function() {
            const bookId = parseInt($(this).data('id'));
            const cartItem = cart.find(item => item.id === bookId);
            if (cartItem) {
                cartItem.quantity += 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                updateCartCount();
            }
        });

        // Decrease quantity
        $(document).on('click', '.decrease-quantity', function() {
            const bookId = parseInt($(this).data('id'));
            const cartItem = cart.find(item => item.id === bookId);
            if (cartItem && cartItem.quantity > 1) {
                cartItem.quantity -= 1;
            } else if (cartItem) {
                cart = cart.filter(item => item.id !== bookId);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        });

        // Clear cart
        $('#clear-cart').on('click', function() {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        });

        // Checkout (mock)
        $('#checkout').on('click', function() {
            if (cart.length > 0) {
                showToast('Thank you for your purchase!');
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                renderCart();
            } else {
                showToast('Your cart is empty.');
            }
        });
    }

    // Contact page logic
    if ($('.contact').length) {
        // Restore form inputs
        $('#name').val(localStorage.getItem('contactName') || '');
        $('#email').val(localStorage.getItem('contactEmail') || '');
        $('#message').val(localStorage.getItem('contactMessage') || '');

        // Save form inputs
        $('#name').on('input', function() {
            localStorage.setItem('contactName', $(this).val());
        });
        $('#email').on('input', function() {
            localStorage.setItem('contactEmail', $(this).val());
        });
        $('#message').on('input', function() {
            localStorage.setItem('contactMessage', $(this).val());
        });

        // Contact form submission
        $('#contact-form').on('submit', function(e) {
            e.preventDefault();
            const name = $('#name').val().trim();
            const email = $('#email').val().trim();
            const message = $('#message').val().trim();

            if (name && email && message) {
                $('#form-message').text('Message sent successfully!').css('color', '#0288D1');
                $(this)[0].reset();
                localStorage.removeItem('contactName');
                localStorage.removeItem('contactEmail');
                localStorage.removeItem('contactMessage');
                setTimeout(() => {
                    $('#form-message').text('');
                }, 3000);
            } else {
                $('#form-message').text('Please fill out all fields.').css('color', '#dc3545');
            }
        });
    }

    // Initialize cart count on all pages
    updateCartCount();
});