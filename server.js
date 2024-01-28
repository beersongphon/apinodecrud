var express = require('express')
var cors = require('cors')
const mysql = require('mysql2')

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const secret = 'Fullstack'

var app = express()
app.use(cors())
app.use(express.json())
const port = 5000;

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dbproject"
});

connection.connect((err) => {
    if (err) {
        console.log("Error connecting to MySQL", err);
        return;
    }
    console.log("Connected to MySQL Sucessfully");
});

app.post('/register', jsonParser, function (req, res, next) {
    bcrypt.hash(req.body.user_password, saltRounds, function (err, hash) {
        connection.execute(
            'INSERT INTO `tb_user` (`user_firstname`, `user_lastname`, `user_address`, `user_tel`, `user_email`, `user_sex`, `user_username`, `user_password`, `permission_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.body.user_firstname, req.body.user_lastname, req.body.user_address, req.body.user_tel, req.body.user_email, req.body.user_sex, req.body.user_username, hash, req.body.permission_id],
            function (err, results, fields) {
                if (err) {
                    res.json({ status: 'error', message: err });
                    return
                }
                res.json({ status: 'ok' });
                console.log(results);
            }
        );
    });
})

app.post('/login', jsonParser, function (req, res, next) {
    connection.execute(
        'SELECT * FROM tb_user WHERE user_username = ?',
        [req.body.user_username],
        function (err, users, fields) {
            if (err) {
                res.json({ status: 'error', message: err });
                return
            }
            if (users.length == 0) {
                res.json({ status: 'error', message: 'No user found' });
                return
            }
            bcrypt.compare(req.body.user_password, users[0].user_password, function (err, isLogin) {
                if (isLogin) {
                    var token = jwt.sign({ user_username: users[0].user_username }, secret, { expiresIn: '1h' });
                    res.json({ status: 'ok', message: 'Login success', token });
                } else {
                    res.json({ status: 'error', message: 'Login failed' });
                }
            })
        }
    );
})

app.post('/authen', jsonParser, function (req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1]
        var decoded = jwt.verify(token, secret);
        res.json({ status: 'ok', decoded });
    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }

})

// app.post('/api/insert', (req, res) => {
//     const { user_firstname, user_lastname, user_address, user_tel, user_email, user_sex, user_username, user_password, permission_id } = req.body;
//     const sql = 'INSERT INTO `tb_user` (`user_firstname`, `user_lastname`, `user_address`, `user_tel`, `user_email`, `user_sex`, `user_username`, `user_password`, `permission_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
//     connection.query(
//         sql,
//         [user_firstname, user_lastname, user_address, user_tel, user_email, user_sex, user_username, user_password, permission_id],
//         (err, results) => {
//             if (err) {
//                 console.error("Error inserting data: ", err);
//                 res.status(500).json({ error: "Internal Server Error" });
//             }
//             res.json({
//                 msg: "Data inserted successfully",
//                 insertedId: results.insertedId
//             })
//         }
//     );
// })

app.post('/api/insert', (req, res) => {
    req.body.forEach(element => {
        const { user_firstname, user_lastname, user_address, user_tel, user_email, user_sex, user_username, user_password, permission_id } = element;
        const sql = 'INSERT INTO `tb_user` (`user_firstname`, `user_lastname`, `user_address`, `user_tel`, `user_email`, `user_sex`, `user_username`, `user_password`, `permission_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'

        connection.query(
            sql,
            [user_firstname, user_lastname, user_address, user_tel, user_email, user_sex, user_username, user_password, permission_id],
            (err, results) => {
                if (err) {
                    console.error("Error inserting data: ", err);
                    res.status(500).json({ error: "Internal Server Error" });
                }
                res.json({
                    msg: "Data inserted successfully",
                    insertedId: results.insertedId
                })
            }
        );
    });
    // const { user_firstname, user_lastname, user_address, user_tel, user_email, user_sex, user_username, user_password, permission_id } = req.body;
    // const sql = 'INSERT INTO `tb_user` (`user_firstname`, `user_lastname`, `user_address`, `user_tel`, `user_email`, `user_sex`, `user_username`, `user_password`, `permission_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'

    // connection.query(
    //     sql,
    //     [user_firstname, user_lastname, user_address, user_tel, user_email, user_sex, user_username, user_password, permission_id],
    //     (err, results) => {
    //         if (err) {
    //             console.error("Error inserting data: ", err);
    //             res.status(500).json({ error: "Internal Server Error" });
    //         }
    //         res.json({
    //             msg: "Data inserted successfully",
    //             insertedId: results.insertedId
    //         })
    //     }
    // );
})


// app.get('/users', function (req, res, next) {
//     connection.query(
//         'SELECT * FROM `tb_user`',
//         function (err, results, fields) {
//             res.json(results);
//             console.log(results);
//             console.log(fields);
//         }
//     );
// })

// app.get('/users/:id', function (req, res, next) {
//     const id = req.params.id;
//     connection.query(
//         'SELECT * FROM `tb_user` WHERE `user_id` = ?',
//         [id],
//         function (err, results) {
//             res.json(results);
//             console.log(results);
//         }
//     );
// })

// app.post('/users', function (req, res, next) {
//     connection.query(
//         'INSERT INTO `tb_user` (`user_firstname`, `user_lastname`, `user_address`, `user_tel`, `user_email`, `user_sex`, `user_username`, `user_password`, `permission_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//         [req.body.user_firstname, req.body.user_lastname, req.body.user_address, req.body.user_tel, req.body.user_email, req.body.user_sex, req.body.user_username, req.body.user_password, req.body.permission_id],
//         function (err, results) {
//             res.json(results);
//             console.log(results);
//         }
//     );
// })

// app.put('/users', function (req, res, next) {
//     const id = req.params.id;
//     connection.query(
//         'UPDATE `tb_user` SET `user_firstname` = ?, `user_lastname` = ?, `user_address` = ?, `user_tel` = ?, `user_email` = ?, `user_sex` = ?, `user_username` = ?, `user_password` = ?, `permission_id` = ? WHERE `user_id` = ?',
//         [req.body.user_firstname, req.body.user_lastname, req.body.user_address, req.body.user_tel, req.body.user_email, req.body.user_sex, req.body.user_username, req.body.user_password, req.body.permission_id, req.body.user_id],
//         function (err, results) {
//             res.json(results);
//             console.log(results);
//         }
//     );
// })

// app.post('/delete', function (req, res, next) {
//     // const id = req.params.id;
//     connection.query(
//         'DELETE FROM `tb_user` WHERE `user_id` = ?',
//         [req.body.user_id],
//         function (err, results) {
//             res.json(results);
//             console.log(results);
//         }
//     );
// })

app.listen(port, function () {
    console.log(`Server is running on port ${port}`)
})
// app.listen(port, function () {
//     console.log(`CORS-enabled web server listening on port ${port}`)
// })
// app.listen(5000, function () {
//     console.log('CORS-enabled web server listening on port 5000')
// })