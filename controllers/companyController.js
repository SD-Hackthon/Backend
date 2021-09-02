const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
const asyncHandler = require('express-async-handler');
const Company = require('./../models/company.js');
const Product = require('./../models/product.js');
const Invoice = require('./../models/invoice.js');
const User = require('./../models/user.js');

const createCompany = asyncHandler(async (req, res) => {
    const logo = req.file;
    const { name, address, paidToEmail, paidToNo } = req.body;

    console.log(req.file, req.body);

    const logoPath = logo.filename;

    if(!logo){
        res.status(400)
        throw new Error ("Image not selected")
    }

    const company = await Company.create({
        name: name,
        address: address,
        paidToEmail: paidToEmail,
        paidToNo: paidToNo,
        logoAddress: logoPath,
        handler: req.user._id
    })

    if(company) {
        res.status(201).json({
            result: "Created Successfully"
        })
    } else {
        res.status(400)
        throw new Error ('Invalid company data')
    }
})

const createProduct = asyncHandler(async (req, res) => {
    const { name, price } = req.body;

    console.log(req.body);

    const product = await Product.create({
        name: name,
        price: price,
        company: req.params.id
    })

    if(product) {
        res.status(201).json({
            result: "Created Successfully"
        })
    } else {
        res.status(400)
        throw new Error ('Invalid company data')
    }
})

const createInvoice = asyncHandler(async (req, res) => {
    const data = [
        {
            name: "Product 1",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod ullam repudiandae provident, deleniti ratione ipsum sunt porro deserunt",
            unit:"pack",
            quantity: 2,
            price: 20,
            imgurl: "https://micro-cdn.sumo.com/image-resize/sumo-convert?uri=https://media.sumo.com/storyimages/ef624259-6815-44e2-b905-580f927bd608&hash=aa79d9187ddde664f8b3060254f1a5d57655a3340145e011b5b5ad697addb9c0&format=webp"
        },
        {
            name: "Product 2",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod ullam repudiandae provident, deleniti ratione ipsum sunt porro deserunt",
            unit:"pack",
            quantity: 4,
            price: 80,
            imgurl: "https://micro-cdn.sumo.com/image-resize/sumo-convert?uri=https://media.sumo.com/storyimages/ef624259-6815-44e2-b905-580f927bd608&hash=aa79d9187ddde664f8b3060254f1a5d57655a3340145e011b5b5ad697addb9c0&format=webp"
        },
        {
            name: "Product 3",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod ullam repudiandae provident, deleniti ratione ipsum sunt porro deserunt",
            unit:"pack",
            quantity: 3,
            price: 60,
            imgurl: "https://micro-cdn.sumo.com/image-resize/sumo-convert?uri=https://media.sumo.com/storyimages/ef624259-6815-44e2-b905-580f927bd608&hash=aa79d9187ddde664f8b3060254f1a5d57655a3340145e011b5b5ad697addb9c0&format=webp"
        },
    ]

    const options = {
        formate: 'A3',
        orientation: 'portrait',
        border: '2mm',
        header: {
            height: '15mm',
            contents: '<h4 style=" color: red;font-size:20;font-weight:800;text-align:center;">CUSTOMER INVOICE</h4>'
        },
        footer: {
            height: '20mm',
            contents: {
                first: 'Cover page',
                2: 'Second page',
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', 
                last: 'Last Page'
            }
        }
    }

    const { email } = req.body;

    const user = await User.find({ email: email })
    if(user){
        console.log(user)
    } else {
        res.status(404)
        throw new Error('user not found')
    }

    const html = fs.readFileSync(path.join(__dirname, '../template.html'), 'utf-8');
    const filename = Math.random() + '_doc' + '.pdf';
    let array = [];

    const company = await Company.findById(req.params.id)
    let logoURL 

    if(company){
        logoURL = 'http://localhost:5000/' + company.logoAddress
        console.log(logoURL)
    } else {
        res.status(404)
        throw new Error('Company not found')
    }

    // const logoURL = 'http://localhost:5000/' + 'lg.png';

    data.forEach(d => {
        const prod = {
            name: d.name,
            description: d.description,
            unit: d.unit,
            quantity: d.quantity,
            price: d.price,
            total: d.quantity * d.price,
            imgurl: d.imgurl
        }
        array.push(prod);
    });

    let subtotal = 0;
    array.forEach(i => {
        subtotal += i.total
    });
    const tax = (subtotal * 20) / 100;
    const grandtotal = subtotal - tax;
    const obj = {
        prodlist: array,
        subtotal: subtotal,
        tax: tax,
        gtotal: grandtotal,
        logoURL: logoURL
    }
    const document = {
        html: html,
        data: {
            products: obj
        },
        path: './docs/' + filename
    }
    pdf.create(document, options)
        .then(res => {
            console.log(res);
        }).catch(error => {
            console.log(error);
        })

    const invoice = await Invoice.create({
        from: company.name,
        to: user[0]._id,
        amount: grandtotal,
        isPaid: false,
        paidToEmail: company.paidToEmail,
        paidToNo: company.paidToNo,
        clientAddress: user[0].address,
        invoiceAddress: filename
    })

    if(invoice){
        res.status(201).json({
            result: "Created Successfully"
        })
    } else {
        res.status(404)
        throw new Error('Invoice not created')
    }
})

const getInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)

    if(!invoice){
        res.status(404)
        throw new Error('Invoice not found')
    }

    // const filePath = 'http://localhost:5000/docs/' + invoice.invoiceAddress;

    const invoicePath = path.join('docs', invoice.invoiceAddress);

    const file = fs.createReadStream(invoicePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
    'Content-Disposition',
    'attachment;'
    );
    file.pipe(res);
})

const getAllInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ to: req.params.id })

    if(invoices){
        res.status('200').json({
            invoices: invoices
        })
    } else {
        res.status(404)
        throw new Error('Invoice not found')
    }
})

module.exports = {
    createCompany,
    createProduct,
    createInvoice,
    getInvoice,
    getAllInvoices
}