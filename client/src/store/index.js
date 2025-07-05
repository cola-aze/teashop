import Vue from 'vue';
import Vuex from 'vuex';
import { getDictionaryItems } from '@/api/admin';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        dictionary: {
            namespaced: true,
            state: {
                teaCategories: [],
                productLevels: [],
            },
            mutations: {
                setTeaCategories(state, categories) {
                    state.teaCategories = categories;
                },
                setProductLevels(state, levels) {
                    state.productLevels = levels;
                },
            },
            actions: {
                async fetchTeaCategories({ commit }) {
                    try {
                        const response = await getDictionaryItems({ type: 'tea_category' });
                        commit('setTeaCategories', response.data.items || response.data); // 兼容可能的数据结构
                        return response.data;
                    } catch (error) {
                        console.error("Error fetching tea categories:", error);
                        throw error; // 抛出错误以便组件处理
                    }
                },
                async fetchProductLevels({ commit }) {
                    try {
                        const response = await getDictionaryItems({ type: 'product_level' });
                        commit('setProductLevels', response.data.items || response.data); // 兼容可能的数据结构
                        return response.data;
                    } catch (error) {
                        console.error("Error fetching product levels:", error);
                        throw error; // 抛出错误以便组件处理
                    }
                },
            },
            getters: {
                allTeaCategories: (state) => state.teaCategories,
                allProductLevels: (state) => state.productLevels,
            },
        },
    },
});