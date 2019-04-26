// module imports
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const app = express();
const router = express.Router();
const handlebars = require("express-handlebars").create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// body parser config
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

// connect to db
const sequelize = new Sequelize('test', 'jose', '12345Seis', {
    host: 'localhost',
    dialect: 'mysql'
   
});

// define schema
const Customer2 = sequelize.define('customer2', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    phone: Sequelize.STRING
},
{
    freezeTableName: true,
    operatorsAliases: Op,
    
    timestamps: false
})

// create a customer2 table if none exists in DB
Customer2.sync();

// CREATE
app.post('/create', (req, res) => {
    Customer2.create({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone
      });
      res.sendStatus(200)
})

// READ
app.get('/', (req, res) => {
   
    Customer2.findAll().then(listado => {
        res.render('home', {
            clientes: listado
        })
    })
    sequelize.query('select * from customer2').then(rows => {
        console.log(JSON.stringify(rows))})
})

// SEARCH
app.post('/search', (req, res) => {
    let buscar= req.body.buscar
    Customer2.findAll({ 
        where: {
            name:{ [Op.like]:  '%'+buscar+'%'}   
            //id: req.body.id
        }
    }).then(listado => {
        res.render('search', {
            listado
        })
    })
    sequelize.query('select * from customer2').then(rows => {
        console.log(JSON.stringify(rows))})
})

// UPDATE
app.post('/update', (req, res) => {
    Customer2.update(
        {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone
        },
        { 
            where: {
                 id: req.body.id   
                   }
        }
    ).then(result => {
        res.sendStatus(200)     
  });
});

// DELETE
app.post('/delete', (req, res) => {
    Customer2.findOne({ 
      where:{
      id: req.body.id 
     }  
      }).then(customer => {
        customer.destroy();
        res.sendStatus(200);
      });
});


// PAGINATION
app.get('/pagina/:page', (req, res) => {
    let limit = 2;   // number of records per page
    let offset = 0;
    Customer2.findAndCountAll()
    .then((data) => {
      let page = req.params.page;      // page number
      let pages = Math.ceil(data.count / limit);
          offset = limit * (page - 1);
      Customer2.findAll({
         attributes: ['id', 'name', 'address','phone'],
        limit: limit,
        offset: offset,
        $sort: { id: 1 }
      })
      .then((users) => {
        res.status(200).json({'result': users, 'count': data.count, 'pages': pages});
      });
    })
    .catch(function (error) {
          res.status(500).send('Internal Server Error');
      });
  });

// run server on port 3000
app.listen(3000, () => {
    console.log('server running')
})
