import Vue from "vue";
import App from "./App.vue";
import router from "./router"; // 引入 router
import "./assets/css/tailwind.css"; // 引入 Tailwind CSS

Vue.config.productionTip = false;
Vue.prototype.$bus = new Vue(); // 创建事件总线

new Vue({
    router, // 注册 router
    render: (h) => h(App),
}).$mount("#app");
