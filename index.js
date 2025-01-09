const express = require('express');
const bcrypt = require("bcrypt");
const {UserModel , TodoModel } = require('./db');
const jwt = require("jsonwebtoken");
JWT_SECRET = "asdasdlascas@asdfia";
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
mongoose.connect("mongodb+srv://pseudonerd:ZtqOIzZzpDQAOvQV@cluster0.zqwec.mongodb.net/todo-bharath-2003")
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Error connecting to MongoDB:", err));


app.post("/signup",async function(req,res){
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hashpwd = await bcrypt.hash(password,10);
    await UserModel.create({
        email : email,
        password : hashpwd,
        name : name
    });

    res.json({
        message : "User signed up!"
    })
});


app.post("/signin", async function(req,res){
    const email = req.body.email;
    const password = req.body.password;



    console.log("Request email:", email);
    
    const user = await UserModel.findOne({
        email:email
    })
    if(user){
        console.log("password stored in db:", user.password);
        const compare =bcrypt.compare(password,user.password);
        if(compare){
            const token = jwt.sign({
                id:user._id.toString()
            },JWT_SECRET);
            res.json({
                token : token
            });
        }else{
            res.status(403).json({message : "Invalid credentials!"});
        }
    }else{
        res.json({
            message: "user not found in database!"
        })
    }
});

function authenticationMiddleWare(req,res,next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token,JWT_SECRET);
    if(decodedData){
        req.userId = decodedData.id;
        next();
    }
    else{
        res.status(403).json({
            message:"You arent allowed to do this operation! try logging in first!"
        });
    }
}
app.use(authenticationMiddleWare);


app.post("/todo",async function(req,res){
    const title = req.body.title;
    const done = req.body.done;
    const uid = req.userId;

    await TodoModel.create({
        title : title,
        done : done,
        uid : uid
    });

    
    res.json({
        message : "todo created successfully"
    });
});


app.get("/todos", async function (req, res) {
    const uid = req.userId;
    const todos = await TodoModel.find({
        uid: uid // Use 'uid' to match the schema
    });
    res.json({
        todos
    });
});


app.listen(3000);