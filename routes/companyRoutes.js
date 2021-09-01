const express = require('express');
const { createCompany, createProduct, createInvoice, getInvoice } = require('../controllers/companyController.js');
const protect = require('../middleware/protect')

const router = express.Router()

router.post('/', protect, createCompany)
router.post('/product/:id', protect, createProduct)
router.post('/invoice/:id', createInvoice)
router.get('/invoice/:id', getInvoice)

module.exports = router