// =======================
// SINGLE FILE MERN PROJECT
// E-COMMERCE WITH CART & ORDERS
// =======================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------
// MongoDB Connection
// -----------------------
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce_single", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// -----------------------
// Mongoose Models
// -----------------------
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const OrderSchema = new mongoose.Schema({
  products: Array,
  total: Number,
  date: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

// -----------------------
// API Routes
// -----------------------
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.post("/api/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json({ message: "Order placed successfully" });
});

// -----------------------
// FRONTEND (React via CDN)
// -----------------------
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Simple MERN E-Commerce</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
</head>
<body>
  <h1>Simple E-Commerce App</h1>
  <div id="root"></div>

  <script type="text/babel">
    function App() {
      const [products, setProducts] = React.useState([]);
      const [cart, setCart] = React.useState([]);

      React.useEffect(() => {
        fetch("/api/products")
          .then(res => res.json())
          .then(data => setProducts(data));
      }, []);

      const addToCart = (p) => {
        setCart([...cart, p]);
      };

      const checkout = () => {
        const total = cart.reduce((sum, p) => sum + p.price, 0);
        fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: cart, total })
        });
        alert("Order placed!");
        setCart([]);
      };

      return (
        <div>
          <h2>Products</h2>
          {products.map(p => (
            <div key={p._id}>
              {p.name} - ₹{p.price}
              <button onClick={() => addToCart(p)}>Add</button>
            </div>
          ))}

          <h2>Cart</h2>
          <p>Items: {cart.length}</p>
          <p>Total: ₹{cart.reduce((s,p)=>s+p.price,0)}</p>
          <button onClick={checkout}>Checkout</button>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
`);
});

// -----------------------
app.listen(5000, () =>
  console.log("Server running at http://localhost:5000")
);
