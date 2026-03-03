const express = require('express');
const mongoose = require('mongoose');



const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use((req,res,next)=>{
    console.log("Authenticating....");
    next();
})


//=======================================================================
// DATABASE OPERATIONS
//=======================================================================

// Schema
const userSchema = new mongoose.Schema({
    firstName:{
        type: String,        // the type should be string
        required:true        // The field is required(important)
    },
    lastName:{
        type:String         // Type should be string and optional
    },
    email:{
        type:String,         // Type should be string
        required : true,        // Required
        unique : true,        // Field should be unique
    },
});


// Model
const User = mongoose.model("user",userSchema); 


// Connection



app.use((req,res,next)=>{
    console.log("Connecting to Database....");

    mongoose
    .connect("mongodb://localhost:27017/MongoDB")
    .then(()=>{ console.log("MognoDB Connected!") })
    .catch((error)=>{console.log("MongoDB Error : ",error)});

    next();
});






app.use((req,res,next)=>{
    console.log("This is middleware 3");
    next();
});

app.get("/",(req,res)=>{
    console.log("HI");
    res.end("Hello User!");
});

app.post("/post",(req,res)=>{
    console.log("Entered POST!");
    const body = req.body;
    console.log(body);
    res.status(500).send(body).end();
});


app.post("/createUser",(req,res)=>{
    
    const body = req.body;
    if(!body.firstName || !body.lastName || !body.email){
        return res.status(400).send("All fields are required!");
    }
    
    User.create({
        "firstName":body.firstName,
        "lastName":body.lastName,
        "email":body.email
    }).then(()=>{
        res.status(200).send("User Created Successfully!").end();
    }).catch(()=>{res.status(400).send("User Creation Error").end();});

    
});


app.get("/getUsers",async (req,res)=>{
    console.log("Fetching Users from DB....");
    const users = await User.find({});
    const html = `
        <ul>
        ${users.map((user)=>{return `<li> ${user._id} - ${user.email}</li>`}).join("")}
        </ul>
    `;
    return res.send(html);
});



app.get("/getUser/:id", async (req,res)=>{
    const user = await User.findById(req.params.id);
    res.send(`<h1>${user.email}</h1>`);
});




app.listen(3000,()=>{console.log("Server is listining on port 3000")});

