// CONTROLLER FILE

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const objectId = require("mongodb").ObjectId;
const User = require("./userModel");
const Doctor = require("./doctorModel");
const Medicine = require("./medicine");
const cors = require("cors");
const bcrypt = require("bcrypt");
const {createTokens,validateToken} = require("./Jwt");
const {PythonShell} = require("python-shell");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin:"*",methods:"GET,PUT,POST,DELETE"}));

mongoose.connect(process.env.MONGO_SERVER);
const Database = mongoose.connection;
Database.on("error", console.error.bind(console, "connection error: "));
Database.once("open", () => {
	console.log("Connected To Database successfully");
});

////				DRUG TO DRUG INTERACTION

app.post("/patient/drugtodrug",async (req, res) => {
	const {drug1,drug2} = req.body;
	console.log(__dirname)
	const options = {
		scriptPath:"F:/Jaweria_Files/pycharm/drugsnew",
		args:[drug1,drug2],
	};
	PythonShell.run("DrugtoDrug.py",options,(err,result)=>{
		console.log(result, err)
		res.send(JSON.stringify(result));
	});

});

////				DRUG TO DRUG INTERACTION

app.post("/patient/drugtofood",async (req, res) => {
	const {drug,food} = req.body;
	const options = {
		scriptPath:"F:/Jaweria_Files/pycharm/drugsnew",
		args:[drug,food],
	};
	PythonShell.run("DrugtoFood.py",options,(err,result)=>{
		console.log(result)
		res.send(JSON.stringify(result));
	});


});

app.post("/patient/medicine/search",async (req, res) => {
	const {med} = req.body;
	const options = {
		scriptPath:"F:/Jaweria_Files/pycharm/drugsnew",
		args:[med],
	};
	PythonShell.run("medicine.py",options,(err,result)=>{
		console.log(result)
		res.send(JSON.stringify(result));
	});

});

app.post("/patient/medicine/addMedicine",async (req, res) => {

	const Response = class {
    
		constructor(){
			this.message = ''
			this.data = []
			this.error = false
		}
	
	}

	const response = new Response()



	try {

        if (req?.body?.medicines.length > 0) {
          
            let objects = req?.body?.medicines.map(item => ({ name: item }))

            const medicine = new Medicine()

            medicine.collection.insertMany(objects)
                .then((result) => {
                    response.message = "Added successfully"
                    response.data = result
                    res.send(response)
                })
                .catch((err) => {
                    console.log(err, "err");
                    res.send("not saved")
                })

        } else {

            response.message = "No medicine recieved"
            response.error = true
            res.send(response)

        }

    } catch (error) {
        console.log(error)
        res.send(error)
    }


});




////				SIGN UP DOCTOR

app.post("/doctor/signup", async (req, res) => {
	const {password} = req.body;
	bcrypt.hash(password,10).then(async(hash)=>{
		const doc = new Doctor({
			name: req.body.name,
			email: req.body.email,
			password:hash,
            speciality:req.body.speciality,
			hospital:req.body.hospital,
            days:req.body.days,
            timing:req.body.timing

		});
		const H = await doc.save();
		res.status(200).send("Doctor's Account Registered");
	});
	
	
});

////				SIGN UP USER

app.post("/user/signup", async (req, res) => {
	const {password} = req.body;
	bcrypt.hash(password,10).then(async(hash)=>{
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password:hash,
		});
		const H = await user.save();
		res.status(200).send("Patient's Account Registered");
	});
	
	
});

////            DISPLAY Product BY ID

app.get('/user/:id', (req, res) => {
	User.findOne({ _id: req.params.id}, (findErr, result) => {
		if (findErr) {
		  console.error(findErr);
		  res.status(500).send(findErr);
		  return;
		}
		if(result == null){
		  res.status(404).send("User Not Found");
  
		}
		else {
		  res.send(result);
		}
	  });
  });

////				ADD USER MEDICAL RECORD

app.put("/user/record/:id", (req, res) => {
	const updatedRec = req.body;
	User.updateOne(
		{ _id: objectId(req.params.id) },
		{ $set: updatedRec },
		(updateErr, result) => {
			if (updateErr) {
				console.error(updateErr);
				res.status(500).send(updateErr);
				return;
			}

			res.send({ message: "Medical Record Details successfully updated" });
		}
	);
});

////			DISPLAY DOCTOR BY SPECIALITY

app.get("/doctor/:speciality", async (req, res) => {
	const speciality = req.params.speciality;
	const data = await Doctor.find({speciality:speciality});
	// Order.find((err, result).populate('products') => {
	// 	if (err) {
	// 		console.error(err);
	// 		res.status(500).send(err);
	// 		return;
	// 	}
		res.send(data);
	});


////				LOGIN DOCTOR

app.post("/doctor/login",async(req,res)=>{
	const {email,password} = req.body;
	const register = await Doctor.findOne({email:email});
	if(!register){
		return res.sendStatus(400);
	}
	const dbPassword = register.password;
	bcrypt.compare(password,dbPassword).then((match)=>{
		if(!match){
			return res.sendStatus(400);
		}
		else{
			const accessToken = createTokens(register);
			// res.json("Logged In")
			const result = {register,accessToken}
			res.send(result)
		}
	});
});

////				LOGIN PATIENT

app.post("/user/login",async(req,res)=>{
	const {email,password} = req.body;
	const register = await User.findOne({email:email});
	if(!register){
		return res.sendStatus(400);
	}
	const dbPassword = register.password;
	bcrypt.compare(password,dbPassword).then((match)=>{
		if(!match){
			return res.sendStatus(400);
		}
		else{
			const accessToken = createTokens(register);
			// res.json("Logged In")
			const result = {register,accessToken}
			res.send(result)
		}
	});
});

////            DISPLAY DOCTOR BY ID

app.get('/doctor/:id', (req, res) => {
	Doctor.findOne({ _id: req.params.id}, (findErr, result) => {
		if (findErr) {
		  console.error(findErr);
		  res.status(500).send(findErr);
		  return;
		}
		if(result == null){
		  res.status(404).send("Doctor Not Found");
  
		}
		else {
		  res.send(result);
		}
	  });
  });

////				ADD DOCTOR RECORD

app.put("/doctor/record/:id", (req, res) => {
	const updatedRec = req.body;
	Doctor.updateOne(
		{ _id: objectId(req.params.id) },
		{ $set: updatedRec },
		(updateErr, result) => {
			if (updateErr) {
				console.error(updateErr);
				res.status(500).send(updateErr);
				return;
			}

			res.send({ message: "DOctor Details successfully updated" });
		}
	);
});
app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});