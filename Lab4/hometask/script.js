const books = [
    {
        id: 1,
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 45,
        stock: 8,
        category: "Programming"
    },
    {
        id: 2,
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        price: 35,
        stock: 3,
        category: "Programming"
    },
    {
        id: 3,
        title: "Atomic Habits",
        author: "James Clear",
        price: 25,
        stock: 10,
        category: "Self Help"
    },
    {
        id: 4,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 20,
        stock: 4,
        category: "Fiction"
    },
    {
        id: 5,
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        price: 30,
        stock: 6,
        category: "Finance"
    }
];
// let because incoming orders can be changed
let orders = [
    {
        bookId: 1,
        quantity: 2
    },
    {
        bookId: 3,
        quantity: 3
    },
    {
        bookId: 99,
        quantity: 1
    },
    {
        bookId: 2,
        quantity: 5
    }
];
// var function scoped
var bookstoreName = "Online Bookstore";

console.log("Bookstore:", bookstoreName);
console.log("Books:", books);
console.log("Orders:", orders);

function validateOrder(order) {

    const book = books.find((b) => b.id === order.bookId);

    const bookExists = book !== undefined;
    const validQuantity = order.quantity > 0;
    const enoughStock =
        bookExists && order.quantity <= book.stock;

    const status =
        bookExists && validQuantity && enoughStock
            ? "Order can be fulfilled"
            : "Order cannot be fulfilled";

    return status;
}
const validOrder = {
    bookId: 1,
    quantity: 2
};

console.log("Valid Order:");
console.log(validateOrder(validOrder));

const invalidOrder = {
    bookId: 99,
    quantity: 1
};

console.log("Invalid Order:");
console.log(validateOrder(invalidOrder));

function processOrders(incomingOrders) {

    const processedOrders = [];

    // FOR...OF LOOP
    for (const order of incomingOrders) {

        const book = books.find(
            (b) => b.id === order.bookId
        );

        const isValid =
            book !== undefined &&
            order.quantity > 0 &&
            order.quantity <= book.stock;

        if (isValid) {

            // Reduce stock
            book.stock -= order.quantity;

            // Calculate total
            const total =
                book.price * order.quantity;

            processedOrders.push({
                bookId: book.id,
                title: book.title,
                quantity: order.quantity,
                status: "Fulfilled",
                total: total
            });

        } else {

            processedOrders.push({
                bookId: order.bookId,
                title: book ? book.title : "Unknown Book",
                quantity: order.quantity,
                status: "Rejected",
                total: 0
            });
        }
    }


    // MAP create summary
    const summary = processedOrders.map((order) => {

        return `${order.title} | Quantity: ${order.quantity} | Status: ${order.status}`;
    });

    // REDUCE total revenue
    const totalRevenue = processedOrders.reduce(
        (total, order) => total + order.total,
        0
    );
    return {
        summary,
        totalRevenue,
        processedOrders
    };
}

// Process orders
const result = processOrders(orders);

// Display summary
console.log("========== ORDER SUMMARY ==========");

result.summary.forEach((item) => {
    console.log(item);
});

// Display revenue
console.log(
    "Total Revenue: $" + result.totalRevenue
);

class Book {

    constructor( id, title, author, price, stock, category) {

        this.id = id;
        this.title = title;
        this.author = author;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }

    // Ternary operator
    isLowStock() {

        return this.stock < 5 ? "Low Stock" : "Stock Available";
    }
}

// Create Book object
const book = new Book(10, "Clean Code","Robert C. Martin", 45, 4, "Programming");

// Check stock
console.log("Book:", book);
console.log("Stock Status:", book.isLowStock());

function orderConfirmation(book, quantity) {

    // Destructuring
    const { title, price } = book;

    // Calculate total
    const total = price * quantity;

    // Template literal
    return `Order confirmed: ${quantity} x ${title} — $${total.toFixed(2)} total.`;
}

console.log(
    orderConfirmation(book, 2)
);

function lowStockReport(books,threshold, category) {

    const result = books.filter((book) => {

        return book.stock < threshold &&
               book.category === category;
    });

    // SORT — ascending stock
    result.sort((a, b) => a.stock - b.stock);


    return result;
}

console.log("========== REPORT 1 ==========");

const report1 = lowStockReport(books, 5,"Programming"
);

console.log(report1);

console.log("========== REPORT 2 ==========");

const report2 = lowStockReport(books, 6, "Fiction");

console.log(report2);