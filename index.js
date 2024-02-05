const express = require("express");
const app = express();
const User = require("./models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

main().catch((err) => {
  console.log("Database connection error!");
  console.log(err);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/authDemo");
  console.log("Database connected");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true })); //to parse req.body
app.use(
  session({
    secret: "thisisnotagoodsecret",
    resave: true,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("THIS IS HOME PAGE!");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hash,
  });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      req.session.user_id = user._id;
      res.redirect("/secret");
    } else {
      res.redirect("/login");
    }
  } else {
    res.send("INCORRECT USERNAME OR PASSWORD!");
  }
});

app.post("/logout", (req, res) => {
  //req.session.user_id = null;
  req.session.destroy();
  res.redirect("/login");
});

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("secret");
  }
});

app.listen(3000, () => {
  console.log("APP IS SERVING ON 3000!");
});
