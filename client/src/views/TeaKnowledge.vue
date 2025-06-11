<template>
    <div
        class="tea-knowledge-container p-8 max-w-screen-xl mx-auto bg-white shadow-lg rounded-lg my-8"
    >
        <h1
            class="text-4xl font-bold text-center text-gray-800 mb-10 font-noto-serif-sc"
        >
            茶知识百科
        </h1>

        <section
            v-for="(category, index) in teaCategories"
            :key="index"
            class="mb-12"
        >
            <h2
                class="text-3xl font-bold text-stone-700 mb-6 border-b-2 border-stone-300 pb-3"
            >
                {{ category.name }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        特点
                    </h3>
                    <p class="text-gray-600 leading-relaxed">
                        {{ category.features }}
                    </p>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        功效
                    </h3>
                    <ul
                        class="list-disc list-inside text-gray-600 leading-relaxed"
                    >
                        <li
                            v-for="(effect, idx) in category.effects"
                            :key="idx"
                        >
                            {{ effect }}
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        适宜人群
                    </h3>
                    <ul
                        class="list-disc list-inside text-gray-600 leading-relaxed"
                    >
                        <li
                            v-for="(group, idx) in category.suitableFor"
                            :key="idx"
                        >
                            {{ group }}
                        </li>
                    </ul>
                </div>
            </div>
            <div
                v-if="category.examples && category.examples.length > 0"
                class="mt-6"
            >
                <h3 class="text-xl font-semibold text-gray-800 mb-3">
                    代表茶品
                </h3>
                <div class="flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
                    <span
                        v-for="(tea, idx) in category.examples"
                        :key="idx"
                        class="bg-stone-100 px-3 py-1 rounded-full text-sm"
                    >
                        {{ tea }}
                    </span>
                </div>
            </div>
        </section>

        <section class="mt-12 text-center text-gray-500 text-sm">
            <p>
                内容参考自
                <a
                    href="https://baike.lingyaai.cn/zaijiagongcha/"
                    target="_blank"
                    class="text-stone-500 hover:underline"
                    >灵芽百科</a
                >
            </p>
        </section>
    </div>
</template>

<script>
export default {
    name: "TeaKnowledge",
    data() {
        return {
            teaCategories: [
                {
                    name: "绿茶",
                    features: "不发酵，性偏寒",
                    effects: ["抗氧化", "抗辐射", "抗击衰老", "清热解毒"],
                    suitableFor: ["电脑族", "吸烟喝酒者", "胃火旺者"],
                    examples: [
                        "西湖龙井",
                        "碧螺春",
                        "太平猴魁",
                        "黄山毛峰",
                        "信阳毛尖",
                        "都匀毛尖",
                        "六安瓜片",
                        "蒙顶甘露",
                        "安吉白茶",
                        "恩施玉露",
                    ],
                },
                {
                    name: "红茶",
                    features: "全发酵，性温和",
                    effects: ["暖胃", "助消化", "提神", "抗癌", "降低胆固醇"],
                    suitableFor: ["肠胃较弱者", "体寒者", "老年人"],
                    examples: [
                        "祁门红茶",
                        "滇红",
                        "正山小种",
                        "金骏眉",
                        "英德红茶",
                    ],
                },
                {
                    name: "黑茶",
                    features: "后发酵，性温",
                    effects: ["降脂减肥", "降血压", "降血糖", "暖胃", "助消化"],
                    suitableFor: ["肥胖者", "三高人群", "饮食油腻者"],
                    examples: [
                        "普洱茶",
                        "安化黑茶",
                        "六堡茶",
                        "茯砖茶",
                        "青砖茶",
                    ],
                },
                {
                    name: "白茶",
                    features: "微发酵，性凉",
                    effects: ["清热解毒", "消炎", "降火", "抗辐射", "抗氧化"],
                    suitableFor: ["上火者", "抽烟者", "熬夜者"],
                    examples: ["白毫银针", "白牡丹", "贡眉", "寿眉"],
                },
                {
                    name: "乌龙茶",
                    features: "半发酵，性平",
                    effects: [
                        "降脂减肥",
                        "抗衰老",
                        "助消化",
                        "提神",
                        "美容养颜",
                    ],
                    suitableFor: ["爱美人士", "想减肥者", "消化不良者"],
                    examples: [
                        "铁观音",
                        "大红袍",
                        "凤凰单丛",
                        "冻顶乌龙",
                        "东方美人",
                    ],
                },
                {
                    name: "黄茶",
                    features: "轻微发酵，性凉",
                    effects: ["清热解毒", "助消化", "消食", "提神"],
                    suitableFor: ["消化不良者", "食欲不振者"],
                    examples: ["君山银针", "蒙顶黄芽", "霍山黄芽"],
                },
                {
                    name: "普洱茶",
                    features: "后发酵，性温和",
                    effects: ["降脂减肥", "助消化", "暖胃", "解酒", "抗癌"],
                    suitableFor: ["肥胖者", "应酬多者", "老年人"],
                    examples: ["生普", "熟普", "七子饼茶", "沱茶", "砖茶"],
                },
                {
                    name: "再加工茶",
                    features: "以茶为原料，再加工制成",
                    effects: ["根据加工种类和添加物不同，功效各异"],
                    suitableFor: ["口味偏好者", "追求新颖者"],
                    examples: [
                        "碧潭飘雪 (茉莉花茶)",
                        "桂花龙井",
                        "蜜桃乌龙茶",
                        "玄米茶",
                    ],
                },
                {
                    name: "代用茶",
                    features: "非茶叶植物，具有类似茶叶的饮用方式和功效",
                    effects: ["根据植物种类不同，功效各异"],
                    suitableFor: ["不宜饮茶者", "特定功效需求者"],
                    examples: [
                        "玉米须茶",
                        "薄荷茶",
                        "牛蒡茶",
                        "栀子茶",
                        "金边玫瑰花茶",
                    ],
                },
            ],
        };
    },
};
</script>

<style scoped>
.tea-knowledge-container {
    font-family: "Noto Serif SC", serif;
}
</style>
