const express=require("express");//First step is I have require the express package
const app=express();
const Listing=require("../Major Project/models/listings");
const mongoose=require("mongoose");//after assigning the port I have require the mongoose package for database purpose
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const path =require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync =require("./utils/wrapAsyc.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");
const Review=require("./models/review.js");

//i have copy this url from mongoose package which is located at npm
async function main(){
    await mongoose.connect(MONGO_URL);
}//for connceting purpose
main()
  .then(()=>{
    console.log("connect to db");
  })
  .catch((err)=>{
    console.log(err);
  });//I have called the main() function

app.get("/",(req,res)=>{
    res.send("Hi I am a Rooot !");
})//I have created one basic api to check the server ia start or not









const validateListing =(req,res,next) =>{
  let { error } =listingSchema.validate(req.body);
  if(error){
    let errMsg =error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);

  }else{
    next();
  }
};


const validateReview =(req,res,next) =>{
  let { error } =reviewSchema.validate(req.body);
  if(error){
    let errMsg =error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);

  }else{
    next();
  }
};










app.listen(8080,()=>{
    console.log("port is Listening to port 8080!");
});//After requiring express() then I have assign the port

/*app.get("/testListing",async(req,res)=>{
    let sampleListing=new Listing({
        title:"My New Villa",
        description:"By the beach",
        price:1200,
        location:"calangute,Goa",
        country:"india",
    });
    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful Testing");
});*/
//index  Route
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/listings",
  wrapAsync(async (req,res)=>
{
  const allListings=await Listing.find({});
  res.render("../views/listings/index",{allListings})
})
);

//new Route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new");
})


//update route

app.put("/listings/:id",
  validateListing,
  wrapAsync(async(req,res)=>{
  let {id} =req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect("/listings");
})
);


//show Route
app.get("/listings/:id",
  wrapAsync(async (req,res)=>{
  let {id}=req.params;
  const listing =await Listing.findById(id).populate("reviews");
  res.render("../views/listings/show",{listing});
})
);

//Create Route
app.post("/listings",
  validateListing,
  wrapAsync(async(req,res,next)=>{
   
    const newListing=new Listing(req.body.listing);
   await newListing.save();
    res.redirect("/listings");


})
);

app.get("/listings/:id/edit",
  wrapAsync(async(req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
})
);

app.delete("/listings/:id",
  wrapAsync(async (req,res)=>{
  let {id} =req.params;
  let deleteListing=await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
})
);

//Reviews
//Post Route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
  let listing =await Listing.findById(req.params.id);
  let newReview =new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  
  res.redirect(`/Listings/${listing._id}`);
}));






app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
  let {statusCode=500,message="something went wrong!"}=err;
 res.status(statusCode).render("err.ejs",{message});
  // res.status(statusCode).send(message);
});


