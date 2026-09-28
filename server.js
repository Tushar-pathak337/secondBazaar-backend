const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());
let users = [];
if (fs.existsSync('users.json')) {
  users = JSON.parse(fs.readFileSync('users.json'));
}
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, mobile, password } = req.body;
  if (!firstName || !email || !mobile || !password) return res.json({ success: false, message: "Fill all fields" });
  if (users.find(u => u.email === email || u.mobile === mobile)) return res.json({ success: false, message: "User already exists" });
  const hashed = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), firstName, lastName, email, mobile, password: hashed });
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.json({ success: true, message: "Account Created" });
});
app.post('/api/login', async (req, res) => {
  const { emailOrMobile, password } = req.body;
  const user = users.find(u => u.email === emailOrMobile || u.mobile === emailOrMobile);
  if (!user) return res.json({ success: false, message: "User not found" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: "Wrong password" });
  res.json({ success: true, message: "Login Success", user });
});
app.get('/', (req, res) => res.send("Backend Running"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on "+PORT));
