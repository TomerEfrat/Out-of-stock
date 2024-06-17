import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
    user: "alma_db_user",
    host: "dpg-cp255ien7f5s73fb0l10-a.frankfurt-postgres.render.com",
    database: "alma_db",
    password: "YcKw6ps7C8J2NDUSPczmoGTgzedXzdJt",
    port: 5432,
    ssl: { rejectUnauthorized: false }
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Route for the home page
app.get("/", (req, res) => {
    res.render("index");
});

// Route for department pages
app.get("/department/:name", async (req, res) => {
    const department = req.params.name;
    try {
        const result = await db.query(`SELECT * FROM ${department}_tracking ORDER BY id ASC`);
        const trackingData = result.rows;

        res.render("department", {
            department: department,
            listsku: trackingData,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error retrieving data for department.");
    }
});

// Route for adding new SKU
app.post("/department/:name/add", async (req, res) => {
    const department = req.params.name;
    const sku_code = req.body.newSku;
    const date_added = new Date();
    try {
        await db.query(`INSERT INTO ${department}_tracking (sku_code, date_added) VALUES ($1, $2)`, [sku_code, date_added]);
        res.redirect(`/department/${department}`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding new SKU.");
    }
});

// Route for deleting an SKU
app.post("/department/:name/delete", async (req, res) => {
    const department = req.params.name;
    const id = req.body.deleteskuId;
    try {
        await db.query(`DELETE FROM ${department}_tracking WHERE id = $1`, [id]);
        res.redirect(`/department/${department}`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting SKU.");
    }
});

// Route for updating the order date
app.post("/department/:name/updateDateOrder", async (req, res) => {
    const department = req.params.name;
    const ordered = req.body.dateOrderChecked;
    const id = req.body.updatedskuId;
    const order_date = new Date();
    try {
        await db.query(`UPDATE ${department}_tracking SET ordered = $1, order_date = $2 WHERE id = $3`, [ordered, order_date, id]);
        res.redirect(`/department/${department}`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating order date.");
    }
});

// Route for deleting the order date
app.post("/department/:name/deleteDateOrder", async (req, res) => {
    const department = req.params.name;
    const id = req.body.updatedskuId;
    try {
        await db.query(`UPDATE ${department}_tracking SET ordered = false, order_date = NULL WHERE id = $1`, [id]);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting order date.");
    }
});

// Route for updating the arrival date
app.post("/department/:name/updateDateArrival", async (req, res) => {
    const department = req.params.name;
    const arrived = req.body.dateArrivalChecked;
    const id = req.body.updatedskuId2;
    const arrival_date = new Date();
    try {
        await db.query(`UPDATE ${department}_tracking SET arrived = $1, arrival_date = $2 WHERE id = $3`, [arrived, arrival_date, id]);
        res.redirect(`/department/${department}`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating arrival date.");
    }
});

// Route for deleting the arrival date
app.post("/department/:name/deleteDate", async (req, res) => {
    const department = req.params.name;
    const id = req.body.updatedskuId2;
    try {
        await db.query(`UPDATE ${department}_tracking SET arrived = false, arrival_date = NULL WHERE id = $1`, [id]);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting arrival date.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
