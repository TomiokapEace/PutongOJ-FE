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
const { find } = statisticsStore
const { isAdmin } = $(storeToRefs(sessionStore))

const proIndex = $computed(() => Number.parseInt(route.params.id || 1))

function fetch () {
  findOneProblem({ pid: overview[proIndex - 1].pid, cid: contest.cid })
}

const pageChange = val => router.push({ name: 'contestProblem', params: { id: val } })
const submit = () => router.push({ name: 'contestSubmit', params: router.params })

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
