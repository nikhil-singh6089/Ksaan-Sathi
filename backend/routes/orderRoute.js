const express =require("express");
const { newOrder, getSingleOrder, myOrders, deleteOrder, getAllOrders, updateOrder } = require("../controllers/orderControler");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

//admin routes
router.route("/order/new").post(isAuthenticatedUser,authorizeRoles("admin"),newOrder);
router.route("/order/:id").delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder);
router.route("/order/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleOrder);
router.route("/orders/all").get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders);
router.route("/admin/order/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder);


//logged in user routes
router.route("/orders/me").get(isAuthenticatedUser,myOrders);


module.exports =router;