const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let Material = require('./models/material');
let Suppliers = require('./models/supplier');
mongoose.connect('mongodb://localhost:27017/inventory2', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

function today() {
  let date = new Date();
  let todaydate = date.toDateString();
  let minutes = date.getUTCMinutes();
  let hours = date.getHours();
  let seconds = date.getSeconds();
  let format = hours + ':' + minutes + ':' + seconds + ' ' + todaydate;
  return format;
}

function sanitizer(string) {
  return entities.encode(string);
}

// Your existing routes...
app.get('/index', (req, res) => {
  res.render('index');
});

// Add other routes here...
app.get('/addmaterial' , (req ,res)=>{
    res.render('addmaterial');
});
//getting editmaterial page
app.get('/editmaterial/:id',(req, res)=>{
    var id = req.params.id;
    res.render('editmaterial',{ id:id });
});
//getting materials
app.get('/materials',(req , res)=>{
    Material.getMaterials((err , materials)=>{
        if(err){
            res.render('material' , {
                msg:'Error in getting details..' 
            });
        }
        else{
        var obj = materials;
        res.render('material', { obj:obj } );
        }
    }) 
});
// add the materials 
app.post('/addmaterial',(req, res)=>{
    var name = entities.encode(req.body.name);
    var price = entities.encode(req.body.price);
    var qty = entities.encode(req.body.qty);
    var state = entities.encode(req.body.state);
    var on = today();
    Material.addMaterial({
        name:name,price:price,qty:qty,state:state,created_on:on
    } , (err , material)=>{
        if(err)
        { res.render('addmaterial', {
            msg:'Please fill required details!'
        })}
        var obj = material;
        // res.render('addmaterial' , {
        //     msg:'successfully submit!!'
        //});
        res.redirect('/materials');  
    });
});
// update the material data
app.post('/editmaterial/:id',(req ,res)=>{
    var  id = req.params.id;
    var name = entities.encode(req.body.name);
    var price = entities.encode(req.body.price);
    var qty = entities.encode(req.body.qty);
    var state = entities.encode(req.body.state);
    //for creating date
    var on = today();
    Material.updateMaterial(id , {
        name:name,price:price,qty:qty,state:state,created_on:on
    },{}, (err , callback)=>{
        if(err){
            res.render('editmaterial', {msg:"Error Occured."});
        }
        // res.render('editmaterial' ,{ id:id ,msg:"Successfully updated!!"} );
        res.redirect('/materials');
    });
 });
//delete the data of materials
app.post('/deletematerial/:_id',(req , res)=>{
    var id = req.params._id;
    Material.removeMaterial(id , (err ,callback)=>{
        if(err){throw err}
        res.redirect('/materials');
        } );
});
app.post('/showmaterials/:id',(req ,res)=>{
    var id = req.params.id;
    Material.findbyid(id , (err , materials)=>{
        if(err){throw err;}
        var obj = materials;
        res.render('showmaterials', {obj:obj});
    });
});
//--------------------------------------------------
app.get('/addsupplier',(req,res)=>{
    res.render('addsupplier');
});
app.get('/editsupplier/:id',(req,res)=>{
    var id = req.params.id;
    res.render('editsupplier', {id:id});
});
// finds the suppliers
app.get('/suppliers',(req, res)=>{
        Suppliers.getSuppliers((err , suppliers)=>{
            if(err)
            {
                res.render('supplier' , {
                    msg:'some error occured!!'
                });
            }
            var obj = suppliers; 
            res.render('supplier' , {obj:obj});
        });
});
app.post('/addsupplier' , (req ,res)=>{
    var cmpname = sanitizer(req.body.cmpname);
    var materialname = sanitizer(req.body.materialname);
    var state = sanitizer(req.body.state);
    var emailid = sanitizer(req.body.emailid);
    var contactno = sanitizer(req.body.contactno);
    var address = sanitizer(req.body.address);
    var costprice = sanitizer(req.body.costprice);
    var qty = sanitizer(req.body.qty);
    var on = today();
    var supplier = {cmpname:cmpname, materialname:materialname, state:state, emailid:emailid, 
                contactno:contactno, address:address, costprice:costprice, qty:qty ,created_on:on };
    Suppliers.addSupplier(supplier , (err , supplier)=>{
        if(err){throw err}
        res.redirect('/suppliers');
    })
});
// //add suppliers
// app.post('/addsupplier',(req ,res)=>{
//     var supplier = req.body;
//     Suppliers.addSupplier(supplier , (err, supplier)=>{
//         if(err){
//             throw err; 
//         }
//         res.json(supplier);
//     });
// });
//update the supplier data
app.get('/showsupplier/:id',(req , res)=>{
    var id = req.params.id;
    Suppliers.getSuppliersById(id , (err , supplier)=>{
        if(err){throw err}
        var obj = supplier;
        res.render('showsupplier', {obj:obj});
    });
});
app.post('/editsupplier/:_id',(req ,res)=>{
    var id = req.params._id;
    var cmpname = sanitizer(req.body.cmpname);
    var materialname = sanitizer(req.body.materialname);
    var state = sanitizer(req.body.state);
    var emailid = sanitizer(req.body.emailid);
    var contactno = sanitizer(req.body.contactno);
    var address = sanitizer(req.body.address);
    var costprice = sanitizer(req.body.costprice);
    var qty = sanitizer(req.body.qty);
    var on = today();
    var supplier = {cmpname:cmpname, materialname:materialname, state:state, emailid:emailid, 
                contactno:contactno, address:address, costprice:costprice, qty:qty ,created_on:on };
    Suppliers.updateSupplier(id , supplier ,{},(err , supplier)=>{
        if(err){
            throw err
        }
        res.redirect('/suppliers');
    });
} );
//delete the data from supplier ...
app.post('/deletesupplier/:_id',(req,res)=>{
    var id = req.params._id;
    Suppliers.removeSupplier(id, (err , callback)=>{
        if(err){throw err}
        res.redirect('/suppliers');
    });
});

// Error handling middleware for 404 errors
app.use((req, res, next) => {
  res.status(404).send('Sorry, this page does not exist.');
});

// Error handling middleware for 500 errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
