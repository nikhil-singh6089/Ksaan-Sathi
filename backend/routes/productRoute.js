const express =require("express");
const { getAllProducts,createProduct,updateProduct, deleteProduct, getProductDetails, createProductReview, deleteReview, getProductReviews, getAdminProducts } = require("../controllers/productController");



const { isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");
const router = express.Router();





router.route("/product/:id").get(getProductDetails);
router.route("/products").get(getAllProducts);

//admin routes
router.route("/admin/product/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);
router.route("/admin/products").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminProducts);
router.route("/admin/product/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct);
//user reviews
router.route("/review").put(isAuthenticatedUser,createProductReview);
router.route("/reviews").get(getProductReviews);//give product id in query
router.route("/review").delete(isAuthenticatedUser,deleteReview);//give product and review id in query



module.exports = router