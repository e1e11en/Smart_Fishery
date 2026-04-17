<template>
  <div>
    <!-- 轮播图 -->
    <el-carousel height="350px" indicator-position="outside">
      <el-carousel-item v-for="(img, idx) in carouselImages" :key="idx">
        <div class="carousel-bg" :style="{ backgroundImage: `url(${img})` }"></div>
      </el-carousel-item>
    </el-carousel>

    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :span="12">
        <el-card class="brand-card">
          <template #header>
            <span><el-icon><OfficeBuilding /></el-icon> 企业简介</span>
          </template>
          <p><strong>闽海兴业养殖集团</strong> 成立于2010年，位于福建省宁德市三沙湾，是集大黄鱼育苗、养殖、加工、销售于一体的现代化渔业企业。集团拥有海域面积570公顷，网箱30多万口，年产大黄鱼15万吨以上。</p>
          <p>通过智慧渔业系统，实现全程透明化养殖，让消费者吃得放心。产品远销国内外，荣获“国家地理标志产品”、“福建省著名商标”等荣誉。</p>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="brand-card">
          <template #header>
            <span><el-icon><Picture /></el-icon> 养殖环境展示</span>
          </template>
          <el-image :src="envImage" fit="cover" style="width:100%; height:180px; border-radius: 8px;" />
          <p style="margin-top: 12px;">三沙湾海域水质优良，潮流畅通，是大黄鱼生长的天然牧场。公司采用仿生态网箱养殖技术，模拟野生环境，确保肉质鲜嫩。</p>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span><el-icon><Medal /></el-icon> 资质荣誉</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="honor in honors" :key="honor.name">
              <div class="honor-item">
                <el-icon :size="32"><Trophy /></el-icon>
                <div>{{ honor.name }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const carouselImages = ref([
  'https://picsum.photos/id/15/1200/350',
  'https://picsum.photos/id/26/1200/350',
  'https://picsum.photos/id/129/1200/350'
])
const envImage = ref('https://picsum.photos/id/25/600/300')
const honors = ref([
  { name: '国家地理标志产品' },
  { name: '福建省著名商标' },
  { name: '无公害农产品认证' },
  { name: '出口备案基地' }
])
</script>

<style scoped>
.carousel-bg {
  height: 100%;
  background-size: cover;
  background-position: center;
}
.brand-card p {
  line-height: 1.8;
  color: #555;
}
.honor-item {
  text-align: center;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 12px;
  color: #1f7b6e;
}
</style>