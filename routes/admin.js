const router = require("express").Router();
const adminController = require("../controller/admin/adminAuthController");
const categoryController = require("../controller/admin/categoryController");
const dashboardController = require("../controller/admin/dashboardController");
const userController = require("../controller/admin/userManagement");
const productController = require("../controller/admin/productController");
const orderController = require("../controller/admin/ordersManagement");
const bannerController = require("../controller/admin/bannerManagement");
const couponController = require("../controller/admin/couponController");
const salesController = require("../controller/admin/salesManagement");
const profileSettings = require("../controller/admin/profileSetting");
const { validateSignin } = require("../middleware/validator");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../config/multerUpload");

// ---------- dev codes -----------
// router.use((req, res, next)=> {
//     req.session.admin = { _id: "68998afac35ccc072487277a", email: "nosnoice@gmail.com" }
//     next()
// })
// --------------------------

// login
router
    .route("/login")
    .get(adminAuth.isSession, adminController.loadLogin)
    .post(adminAuth.isSession, adminController.loginAdmin);

// logout
router.get("/logout", adminController.logout);

// dashboard
router
    .route("/dashboard")
    .get(adminAuth.isAuthenticated, dashboardController.loadDashboard);

// user
router.route("/users").get(adminAuth.isAuthenticated, userController.loadUsers);
router.patch("/users/edit", adminAuth.isAuthenticated, userController.editUser);
router
    .route("/users/:id/edit")
    .get(adminAuth.isAuthenticated, userController.loadUserEdit);
router.get(
    "/users/search",
    adminAuth.isAuthenticated,
    userController.searchUser
);
router.patch(
    "/users/:id/block",
    adminAuth.isAuthenticated,
    userController.changeUserStatus
);
router.patch(
    "/users/:id/active",
    adminAuth.isAuthenticated,
    userController.changeUserStatus
);

// products
router
    .route("/products")
    .get(adminAuth.isAuthenticated, productController.loadProducts);
router.get(
    "/products/show",
    adminAuth.isAuthenticated,
    productController.loadProductsShow
);

router
    .route("/products/add")
    .get(adminAuth.isAuthenticated, productController.loadProductsAdd)
    .post(adminAuth.isAuthenticated, upload, productController.addProduct);
router
    .route("/products/:_id/edit")
    .get(adminAuth.isAuthenticated, productController.editProduct)
    .patch(adminAuth.isAuthenticated, upload, productController.updateProduct);
router.patch(
    "/products/:id/active",
    adminAuth.isAuthenticated,
    productController.changeProductStatus
);
router.patch(
    "/products/:id/block",
    adminAuth.isAuthenticated,
    productController.changeProductStatus
);

// orders
router
    .route("/orders")
    .get(adminAuth.isAuthenticated, orderController.loadOrders);
router.get(
    "/orders/search",
    adminAuth.isAuthenticated,
    orderController.showOrders
);
router.get(
    "/orders/details",
    adminAuth.isAuthenticated,
    orderController.showOrderDetails
);
router.patch(
    "/orders/update-status",
    adminAuth.isAuthenticated,
    orderController.updateStatus
);
router.post(
    "/api/approve-return",
    adminAuth.isAuthenticated,
    orderController.approveReturn
);

// banners
router.route("/banners").get(bannerController.loadBanners);

// coupon
router.route("/coupons").get(couponController.loadCoupons);
router.get("/api/coupons", couponController.getCoupons);
router.put("/coupons/add", couponController.addCoupon);
router.patch("/api/coupons/:_id/active", couponController.changeCouponStatus);
router.patch("/api/coupons/:_id/block", couponController.changeCouponStatus);

//sales
router.route("/sales").get(salesController.loadSales);

// Category routes
router
    .route("/category")
    .get(adminAuth.isAuthenticated, categoryController.loadCategory)
    .post(adminAuth.isAuthenticated, categoryController.addCategory)
    .patch(adminAuth.isAuthenticated, categoryController.editCategory);
router.get(
    "/category/search",
    adminAuth.isAuthenticated,
    categoryController.showCategorys
);
router.get(
    "/category/:id",
    adminAuth.isAuthenticated,
    categoryController.showDetails
);
router.patch(
    "/category/:id/block",
    adminAuth.isAuthenticated,
    categoryController.changeCategoryStatus
);
router.patch(
    "/category/:id/active",
    adminAuth.isAuthenticated,
    categoryController.changeCategoryStatus
);

// settings
router.route("/settings").get(profileSettings.loadSettings);

module.exports = router;
