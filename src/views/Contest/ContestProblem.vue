<script setup>
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Problem from '@/components/Problem'
import { useProblemStore } from '@/store/modules/problem'
import { useContestStore } from '@/store/modules/contest'
import { onRouteParamUpdate } from '@/util/helper'
// import { reactive, ref } from 'vue'
// import { ECharts as Chart } from 'vue-echarts'
// import 'echarts/lib/chart/pie'
// import 'echarts/lib/component/title'

const { t } = useI18n()
const problemStore = useProblemStore()
const contestStore = useContestStore()
const router = useRouter()
const route = useRoute()

const { findOne: findOneProblem } = problemStore
const { problem } = $(storeToRefs(problemStore))
const { overview, contest, totalProblems } = $(storeToRefs(contestStore))

const proIndex = $computed(() => Number.parseInt(route.params.id || 1))

function fetch () {
  findOneProblem({ pid: overview[proIndex - 1].pid, cid: contest.cid })
}

const pageChange = val => router.push({ name: 'contestProblem', params: { id: val } })
const submit = () => router.push({ name: 'contestSubmit', params: router.params })

// const pieOption = reactive({
//   title: {
//     text: 'Referer of a Website',
//     subtext: 'Fake Data',
//     left: 'center'
//   },
//   tooltip: {
//     trigger: 'item'
//   },
//   legend: {
//     orient: 'vertical',
//     left: 'left'
//   },
//   series: [
//     {
//       name: 'Access From',
//       type: 'pie',
//       radius: '50%',
//       data: [
//         { value: 100, name: 'CE' },
//         { value: 1000, name: 'AC' },
//         { value: 1000, name: 'RE' },
//         { value: 1000, name: 'WA' },
//         { value: 1000, name: 'TLE' },
//         { value: 1000, name: 'MLE' },
//         { value: 1000, name: 'OLE' },
//         { value: 1000, name: 'PE' },
//         { value: 1000, name: 'SE' },
//       ],
//       emphasis: {
//         itemStyle: {
//           shadowBlur: 10,
//           shadowOffsetX: 0,
//           shadowColor: 'rgba(0, 0, 0, 0.5)'
//         }
//       }
//     }
//   ]
// })

fetch()
onRouteParamUpdate(fetch)
</script>

<template>
  <div class="conpro-wrap">
    <ul>
      <li v-for="i in totalProblems" :key="i" :class="{ active: i === proIndex }" @click="pageChange(i)">
        {{ i }}
      </li>
    </ul>
    <Problem :problem="problem">
      <template #title>
        {{ $route.params.id }}:  {{ problem.title }}
      </template>
    </Problem>
    <Button shape="circle" icon="md-paper-plane" @click="submit">
      {{ t('oj.submit') }}
    </Button>
    <!-- <div class="chart-container">
      <Chart v-if="isAdmin" :option="pieOption" auto-resize />
    </div> -->
    <!-- .chart-container {
      height: 400px;
      margin-top: 20px;
    } -->
  </div>
</template>

<style lang="stylus" scoped>
ul
  margin-left: 10px
  li
    display: inline-block
    vertical-align: middle
    min-width: 32px
    height: 32px
    line-height: 30px
    margin-right: 8px
    text-align: center
    list-style: none
    background-color: #fff
    border: 1px solid #dddee1
    border-radius: 4px
    cursor: pointer
  .active
    color: #fff
    background-color: #e040fb
    border-color: #e040fb
</style>
