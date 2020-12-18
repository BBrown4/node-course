const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const isAuth = require('../middleware/is-auth.middleware');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProductById);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.get('/orders', isAuth, shopController.getOrders);
router.get('/orders/:orderId', shopController.getInvoice);
router.post('/place-order', isAuth, shopController.postOrder);

module.exports = router;
