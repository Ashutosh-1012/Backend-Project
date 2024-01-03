import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",
}).then(()=>console.log("datbase connected"))
.catch(()=>console.log("E"));

const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});
const User = mongoose.model("User",userSchema);
// const users=[];
// import path from "path";
const app=express();
//using middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(path.resolve(),"public")));
app.use(cookieParser());
//setting kar rahe h view engine ka ya render me ejs extension lagana padega repeatively
app.set("view engine","ejs");
// const token= jwt.sign({_id:User._id},"asfsadf");
const isAuthenticated=async(req,res,next)=>{
    const {token}=req.cookies;
    if(token){
        const decoded=jwt.verify(token,"asfsadhbjhghjf");
        console.log(decoded);
        req.user= await User.findById(decoded._id);
        next();
    }
    else{
        res.redirect("login");
    }
}


app.get("/",isAuthenticated,(req,res)=>{
    // const chal=path.resolve();
    // res.sendFile(path.join(chal,"./index.html"));
    // console.log(req.cookies);
    // const {token}=req.cookies;
    // if(token){
    //     res.render("logout");
    // }
    // else{
    //     res.render("login");
    // }
    // console.log(req.user);
    res.render("logout",{name:req.user.name});

    // res.render("login",{name:" kya kar raha h😊"});
});
app.get("/register",(req,res)=>{
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.post("/login",async(req,res)=>{
    const{email,password}=req.body;
    let user=await User.findOne({email});
    if(!user){
        return res.redirect("register");
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch) return res.render("login",{email,message:"Incorrect Password"},);
    
    const token= jwt.sign({ _id: user._id},"asfsadhbjhghjf");
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/");
    
})

// app.get("/add",async(req,res)=>{
//     await Message.create({name:"Ashutosh",email:"ashutoshashish@gmail.com"});
//     res.send("nice");
// });

// console.log(token);
 app.post("/register",async(req,res)=>{
    const{name ,email,password}=req.body
    let user=await User.findOne({email});
    if(user){
        // console.log("register first");
        return res.redirect("login");
    }
    const hassedPassword= await bcrypt.hash(password,10);
     user= await User.create({
        name,
        email,
        password:hassedPassword,
    })
    const token= jwt.sign({ _id: user._id},"asfsadhbjhghjf");
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/");
 })
 app.get("/logout",(req,res)=>{
    res.cookie("token","null",{
        httpOnly:true,
        expires:new Date(Date.now()),
    });
    res.redirect("/");
 })

// app.get("/success",(req,res)=>{
//     res.render("success");
// });
// app.post("/contact",async(req,res)=>{
// //    console.log(req.body.name);
// //    const userData={Username:req.body.name,email:req.body.email};
// //    res.render("success");
// // await Message.create({name:req.body.name,email:req.body.email}); 
//   const {name,email}=req.body;
//   await Message.create({name,email});
//     res.redirect("/success");

// });
// app.get("/users",(req,res)=>{
//     res.json({
//         users,
//     });
// });
app.listen(5000,()=>{
    console.log("server is running");
});