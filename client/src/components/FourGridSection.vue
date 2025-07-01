<template>
    <section class="four-grid-section mb-10">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center font-noto-serif-sc">
            优选分类
        </h2>
        <div class="grid grid-cols-2 rounded-lg shadow-lg">
            <!-- 优选 -->
            <div class="bg-white overflow-hidden p-6 flex flex-col items-center justify-center text-center transition-shadow duration-300 border border-gray-300 rounded-tl-lg relative">
                <div class="absolute top-0 left-0 p-4 flex items-center">
                    <h4 class="font-bold text-lg text-gray-700">精选</h4>
                    <span class="ml-2.5 text-sm font-medium gradient-text">特别推荐</span>
                </div>
                <div class="flex items-center justify-center space-x-2.5 mb-3 mt-8">
                    <img src="/src/assets/images/green_tea.jpg" alt="优选图片1" class="w-16 h-16 object-cover rounded-lg">
                    <img src="/src/assets/images/matcha.jpg" alt="优选图片2" class="w-16 h-16 object-cover rounded-lg">
                </div>
            </div>
            <!-- 超值 -->
            <div class="bg-white overflow-hidden p-6 flex flex-col items-center justify-center text-center transition-shadow duration-300 border border-gray-300 rounded-tr-lg relative">
                <div class="absolute top-0 left-0 p-4 flex items-center">
                    <h4 class="font-bold text-lg text-gray-700">热卖</h4>
                    <span class="ml-2.5 text-sm font-medium gradient-text">限时抢购</span>
                </div>
                <div class="flex items-center justify-center space-x-2.5 mb-3 mt-8">
                    <img src="/src/assets/images/dahongpao.jpeg" alt="超值图片1" class="w-16 h-16 object-cover rounded-lg">
                    <img src="/src/assets/images/dancong.jpg" alt="超值图片2" class="w-16 h-16 object-cover rounded-lg">
                </div>
            </div>
            <!-- 榜单 -->
            <div class="bg-white overflow-hidden p-6 flex flex-col items-center justify-center text-center transition-shadow duration-300 border border-gray-300 rounded-bl-lg relative">
                <div class="absolute top-0 left-0 p-4 flex items-center">
                    <h4 class="font-bold text-lg text-gray-700">热门</h4>
                    <span class="ml-2.5 text-sm font-medium gradient-text">人气榜</span>
                </div>
                <div class="flex items-center justify-center space-x-2.5 mb-3 mt-8">
                    <img src="/src/assets/images/longjing.jpeg" alt="榜单图片1" class="w-16 h-16 object-cover rounded-lg">
                    <img src="/src/assets/images/teahill.png" alt="榜单图片2" class="w-16 h-16 object-cover rounded-lg">
                </div>
            </div>
            <!-- 应季上新 -->
            <div class="bg-white overflow-hidden p-6 flex flex-col items-center justify-center text-center transition-shadow duration-300 border border-gray-300 rounded-br-lg relative">
                <div class="absolute top-0 left-0 p-4 flex items-center">
                    <h4 class="font-bold text-lg text-gray-700">新品</h4>
                    <span class="ml-2.5 text-sm font-medium gradient-text">季节限定</span>
                </div>
                <div class="flex items-center justify-center space-x-2.5 mb-3 mt-8">
                    <img src="/src/assets/images/tea_bowl.jpg" alt="应季上新图片1" class="w-16 h-16 object-cover rounded-lg">
                    <img src="/src/assets/images/teacup.png" alt="应季上新图片2" class="w-16 h-16 object-cover rounded-lg">
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'FourGridSection',
};
</script>

<style scoped>
.gradient-text {
  background-image: linear-gradient(to bottom, #a78bfa, #f472b6); /* Example: purple to pink */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style> 