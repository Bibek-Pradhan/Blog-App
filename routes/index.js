const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/middle");

const Story = require("../modles/Story")

// Login page
router.get("/", ensureGuest, (req, res) => {
    res.render("login", {
        layout: 'login'
    })
});

// Dashbord page
router.get("/dashbord", ensureAuth, async(req, res) => {
    try {
        const stories = await Story.find({ user: req.user.id }).lean();
        console.log(`Stories are ${stories}`);
        res.render("dashbord", {
            name: req.user.firstName,
            stories
        })

    } catch (error) {
        console.error(error);
        res.render("error/500");
    }
});

module.exports = router