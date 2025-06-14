import Vue from "vue";
import App from "./App.vue";
import router from "./router"; // 引入 router
import "./assets/css/tailwind.css"; // 引入 Tailwind CSS

// 引入 Vue Quill Editor 及其样式
import VueQuillEditor from 'vue-quill-editor';
import 'quill/dist/quill.core.css'; // import styles
import 'quill/dist/quill.snow.css'; // for snow theme
import 'quill/dist/quill.bubble.css'; // for bubble theme

// 引入 v-region
import Region from 'v-region';

Vue.use(VueQuillEditor, /* { default global options } */); // 全局注册 Quill Editor
Vue.use(Region); // 全局注册 v-region

Vue.config.productionTip = false;
Vue.prototype.$bus = new Vue(); // 创建事件总线

new Vue({
    router, // 注册 router
    render: (h) => h(App),
}).$mount("#app");