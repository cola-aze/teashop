import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import AllTeas from "../views/AllTeas.vue";
import Teaware from "../views/Teaware.vue";
import AboutUs from "../views/AboutUs.vue";
import Auth from "../views/Auth.vue";
import Profile from "../views/Profile.vue";
import AdminDashboard from "../views/AdminDashboard.vue";
import CarouselAdmin from "../views/admin/CarouselAdmin.vue";
import PosterAdmin from "../views/admin/PosterAdmin.vue";
import ProductAdmin from "../views/admin/ProductAdmin.vue";
import UserAdmin from "../views/admin/UserAdmin.vue";
import TeaKnowledgeAdmin from "../views/admin/TeaknowledgeAdmin/index.vue";
import TeaKnowledge from "../views/TeaKnowledge.vue";
import DictionaryAdmin from "../views/admin/DictionaryAdmin.vue"; // 新增：引入数据字典管理组件
import FeaturedCategoryAdmin from "../views/admin/FeaturedCategoryAdmin.vue"; // 新增：引入优选分类管理组件

Vue.use(VueRouter);

const routes = [{
        path: "/",
        name: "Home",
        component: Home,
        meta: { requiresAuth: false }, // 首页不需要登录
    },
    {
        path: "/all-teas",
        name: "AllTeas",
        component: AllTeas,
        meta: { requiresAuth: true }, // 需要登录
    },
    {
        path: "/teaware",
        name: "Teaware",
        component: Teaware,
        meta: { requiresAuth: true }, // 需要登录
    },
    {
        path: "/about-us",
        name: "AboutUs",
        component: AboutUs,
        meta: { requiresAuth: true }, // 需要登录
    },
    {
        path: "/profile",
        name: "Profile",
        component: Profile,
        meta: { requiresAuth: true }, // 个人信息页面需要登录
    },
    {
        path: "/auth",
        name: "Auth",
        component: Auth,
        meta: { requiresAuth: false }, // 认证页面不需要登录
    },
    {
        path: "/tea-knowledge",
        name: "TeaKnowledge",
        component: TeaKnowledge,
        meta: { requiresAuth: false }, // 茶知识页面不需要登录
    },
    {
        path: "/admin",
        name: "Admin",
        component: AdminDashboard,
        meta: { requiresAuth: true, isAdmin: true }, // 管理员页面需要登录且需要管理员权限
        children: [{
                path: "carousel", // /admin/carousel
                name: "AdminCarousel",
                component: CarouselAdmin,
                meta: { requiresAuth: true, isAdmin: true },
            },
            {
                path: "posters", // /admin/posters
                name: "AdminPosters",
                component: PosterAdmin,
                meta: { requiresAuth: true, isAdmin: true },
            },
            {
                path: "products", // /admin/products
                name: "AdminProducts",
                component: ProductAdmin,
                meta: { requiresAuth: true, isAdmin: true },
            },
            {
                path: "users", // /admin/users
                name: "AdminUsers",
                component: UserAdmin,
                meta: { requiresAuth: true, isAdmin: true },
            },
            {
                path: "tea-knowledge", // /admin/tea-knowledge
                name: "AdminTeaKnowledge",
                component: TeaKnowledgeAdmin,
                meta: { requiresAuth: true, isAdmin: true },
            },
            {
                path: "dictionary", // 新增：/admin/dictionary
                name: "AdminDictionary",
                component: DictionaryAdmin,
                meta: { requiresAuth: true, isAdmin: true },
            },
            {
                path: "featured-category", // 新增：/admin/featured-category
                name: "AdminFeaturedCategory",
                component: FeaturedCategoryAdmin,
                meta: { requiresAuth: true, isAdmin: true },
            },
        ],
    },
];

const router = new VueRouter({
    mode: "history", // 使用 history 模式，需要后端支持
    base: process.env.BASE_URL,
    routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem("token"); // 检查是否存在 token
    const isAdmin = localStorage.getItem("isAdmin") === "true"; // 检查是否是管理员

    // 如果路由需要认证，且用户未登录，则重定向到认证页面
    if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
        next({
            path: "/auth",
            query: { mode: "login" }, // 默认跳转到登录模式
        });
    } else if (to.name === "Auth" && loggedIn) {
        // 如果用户已登录，但尝试访问认证页面，则重定向到首页
        next({
            path: "/",
            query: { mode: "login" },
        });
    } else if (to.matched.some((record) => record.meta.isAdmin) && !isAdmin) {
        // 如果路由需要管理员权限，但用户不是管理员，则重定向到首页或显示无权访问信息
        alert("您无权访问此页面。"); // 可以替换为更友好的提示或跳转到错误页面
        next({ path: "/" });
    } else {
        next(); // 继续路由
    }
});

export default router;