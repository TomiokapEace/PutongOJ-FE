<script setup>
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Problem from '@/components/Problem'
import { useProblemStore } from '@/store/modules/problem'
import { useContestStore } from '@/store/modules/contest'
import { onRouteParamUpdate } from '@/util/helper'
import { useStatisticsStore } from '@/store/modules/statistics'
import { onRouteQueryUpdate } from '@/util/helper'
import { useSessionStore } from '@/store/modules/session'
import Chart from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'

const { t } = useI18n()
const problemStore = useProblemStore()
const contestStore = useContestStore()
const router = useRouter()
const route = useRoute()
const statisticsStore = useStatisticsStore()
const sessionStore = useSessionStore()

const { findOne: findOneProblem } = problemStore
const { problem } = $(storeToRefs(problemStore))
const { overview, contest, totalProblems, solved } = $(storeToRefs(contestStore))
const { countList } = $(storeToRefs(statisticsStore))
const { find } = statisticsStore
const { isAdmin } = $(storeToRefs(sessionStore))

const proIndex = $computed(() => Number.parseInt(route.params.id || 1))

function fetch () {
  findOneProblem({ pid: overview[proIndex - 1].pid, cid: contest.cid })
}

const pageChange = val => router.push({ name: 'contestProblem', params: { id: val } })
const submit = () => router.push({ name: 'contestSubmit', params: router.params })

const pie = $computed(() => {
  const data = {
    title: {
      text: `Statistics for ${overview[proIndex - 1].pid}`,
      x: 'center',
      y: 'top',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'horizontal',
      x: 'center',
      y: 'bottom',
      data: [ 'CE', 'AC', 'RE', 'WA', 'TLE', 'MLE', 'OLE', 'PE', 'SE' ],
    },
    calculable: true,
    series: [
      {
        name: 'Statistics',
        type: 'pie',
        radius: '55%',
        center: [ '50%', '50%' ],
        data: [
          { value: countList[0] || 0, name: 'CE' },
          { value: countList[1] || 0, name: 'AC' },
          { value: countList[2] || 0, name: 'RE' },
          { value: countList[3] || 0, name: 'WA' },
          { value: countList[4] || 0, name: 'TLE' },
          { value: countList[5] || 0, name: 'MLE' },
          { value: countList[6] || 0, name: 'OLE' },
          { value: countList[7] || 0, name: 'PE' },
          { value: countList[8] || 0, name: 'SE' },
        ],
      },
    ],
  }
  return data
})

function getStatistics () {
// https://github.com/Justineo/vue-echarts/blob/master/demo/Demo.vue
  const opt = {
    pid: overview[proIndex - 1].pid,
    cid: contest.cid,
  }
  find(opt)
}

fetch()
onRouteParamUpdate(fetch)
getStatistics()
onRouteQueryUpdate(getStatistics)
</script>

<template>
  <div class="conpro-wrap">
    <ul>
      <li v-for="i in totalProblems" :key="i" :class="{ active: i === proIndex, solved: solved.includes(overview[i - 1].pid) }" @click="pageChange(i)">
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
  </div>
  <div v-if="isAdmin" class="chart-container">
    <h2>{{ "Status Review" }}</h2>
    <!-- <Chart ref="pie" :option="pie" auto-resize /> -->
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
  li.solved {
    background-color: #A0D468;
    color: #fff;
  }
  .chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px; /* 根据需要指定容器高度 */
}

</style>
