import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const userController = {
  createUser: async (req, res, User) => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Required fields missing" });

    try {
      await User.create({ username, password });
      return res.status(201).json({ message: "User created" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  loginUser: async (req, res, User) => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Required fields missing" });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({ message: "Login successful" });
  },

  userProfile: async (req, res, User) => {
    const token =  req.cookies.token || req.headers["authorization"]?.split(" ")[1] || "";
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "username", "image"],
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      const imageUrl = user.image ? `http://localhost:3000/${user.image}` : null;

      return res.json({
        id: user.id,
        username: user.username,
        imageUrl,
      });
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  },

  logoutUser: (req, res) => {
    return res.clearCookie("token").json({ message: "Logged out" });
  },
};

export default userController;
