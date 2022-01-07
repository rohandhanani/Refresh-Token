const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.port || 8000;

app.use(express.json());

const refreshTokens = [];

// check the user access token is valid
function auth(req, res, next) {
    const accesstoken = req.headers['authorization'];
    const access = accesstoken.split(" ")[1]; //Access token
    req.token = access;

    jwt.verify(req.token, "access", (err, user) => {
        if (!err) {
            next();
        } else {
            return res.status(400).json({ mess: " user not authentication.." })
        }
    })
}

app.post("/protected", auth, (req, res) => {
    res.send("insided protected");
})

//renew access token and check access token
app.post("/renewToken", (req, res) => {
    const refreshToken = req.body.token;

    // if (!refreshToken || refreshTokens.includes(refreshToken)) {
    //     return res.status(400).json({ mess: "userb not authenticated" });
    // }

    jwt.verify(refreshToken, "refresh", (err, user) => {
        if (!err) {
            const accesstoken = jwt.sign({ username: user.name }, "access", { expiresIn: "20m" });
            return res.status(201).json({ accesstoken });
        } else {
            return res.status(400).json({ mess: "user not authenticated" })
        }
    })
})

// login and create access and refresh token
app.post("/login", (req, res) => {
    const user = req.body.user;

    if (!user) {
        res.status(400).json({ mess: "user not found plz try again..!!" })
    }
    else {

        const accessToken = jwt.sign(user, "access", { expiresIn: "20s" });
        const refreshToken = jwt.sign(user, "refresh", { expiresIn: "2d" });
        refreshTokens.push(refreshToken);

        return res.status(201).json({
            accessToken,
            refreshToken
        })

    }
})

app.listen(port, (err) => {
    console.log(`your port is currently running ${port}`);
})