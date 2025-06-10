import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import AllTeas from "../views/AllTeas.vue";
import Teaware from "../views/Teaware.vue";
import AboutUs from "../views/AboutUs.vue";
import Auth from "../views/Auth.vue";
import Profile from "../views/Profile.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
        meta: { requiresAuth: true }, // 需要登录
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
];

const router = new VueRouter({
    mode: "history", // 使用 history 模式，需要后端支持
    base: process.env.BASE_URL,
    routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem("token"); // 检查是否存在 token

    // 如果路由需要认证，且用户未登录，则重定向到认证页面
    if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
        next({
            path: "/auth",
            query: { mode: "login" }, // 默认跳转到登录模式
        });
    } else if (to.name === "Auth" && loggedIn) {
        // 如果用户已登录，但尝试访问认证页面，则重定向到首页
        next({ path: "/" });
    } else {
        next(); // 继续路由
    }
});

export default router;
