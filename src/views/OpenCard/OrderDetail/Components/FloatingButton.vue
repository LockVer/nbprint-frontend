<template>
  <div class="floating">
    <div class="floating-title">快速定位</div>
    <div class="floating-item">
      <div :class="{ active: activeIndex === 0 }" @click="scrollToElement(auditRef, 0)">
        <i></i>
        <span>审核详情</span>
      </div>
      <div :class="{ active: activeIndex === 1 }" @click="scrollToElement(generalRef, 1)">
        <i></i>
        <span>通用信息</span>
      </div>
      <div :class="{ active: activeIndex === 2 }" @click="scrollToElement(smallCardRef, 2)">
        <i></i>
        <span>小卡信息</span>
      </div>
      <div :class="{ active: activeIndex === 3 }" @click="scrollToElement(adCardRef, 3)">
        <i></i>
        <span>宣传卡信息</span>
      </div>
      <div :class="{ active: activeIndex === 4 }" @click="scrollToElement(prizeMarkRef, 4)">
        <i></i>
        <span>奖符</span>
      </div>
      <div :class="{ active: activeIndex === 5 }" @click="scrollToElement(payoutRef, 5)">
        <i></i>
        <span>Payout信息</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  auditRef: Object,
  generalRef: Object,
  smallCardRef: Object,
  adCardRef: Object,
  payoutRef: Object,
  prizeMarkRef: Object
});

const activeIndex = ref(0);
const isScrollingProgrammatically = ref(false);
const scrollToElement = (refName, index) => {
  const element = refName?.$el || refName;
  if (element) {
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    isScrollingProgrammatically.value = true; // 设置标志为 true
    activeIndex.value = index; // 直接设置 activeIndex
    isScrollingProgrammatically.value = false; // 设置标志为 false
  }
};

const handleScroll = () => {
  console.log("Scroll event triggered");
  const sections = [
    props.auditRef,
    props.generalRef,
    props.smallCardRef,
    props.adCardRef,
    props.prizeMarkRef,
    props.payoutRef
  ];

  sections.forEach((section, index) => {
    const element = section?.$el || section;
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 120 ) {
        activeIndex.value = index;
      }
    }
  });
};


onMounted(() => {
  window.addEventListener('scroll', handleScroll, true);
  // 默认选中第一个
  activeIndex.value = 0;
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true);
});
</script>

<style lang="scss" scoped>
.floating {
  display: inline-flex;
  padding: 20px;
  margin-bottom: 90px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  border-radius: 10px;
  background: #FFF;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.10);
  font-family: "PingFang SC";
  font-weight: 500;
  position: fixed;
  right: 30px;
  top: 280px;

  .floating-title {
    color: #606266;
    font-size: 16px;
    padding-left: 12px;
  }

  .floating-item {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    color: #909399;
    row-gap: 6px;
    font-size: 14px;

    div {
      display: flex;
      align-items: center;
      column-gap: 8px;

      i {
        display: inline-block;
        height: 14px;
        width: 4px;
        border-radius: 8px;
      }
    }

    .active {
      color: #029;
    }

    .active i {
      background: #029;
    }
  }
}
</style>