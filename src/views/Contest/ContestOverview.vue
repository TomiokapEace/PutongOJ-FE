<script setup>
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useContestStore } from '@/store/modules/contest'
import { formate, timePretty } from '@/util/formate'
import { reactive, ref, computed } from 'vue'
import { useSessionStore } from '@/store/modules/session'

const contestStore = useContestStore()
const sessionStore = useSessionStore()

const { contest, overview, solved, tagMap} = $(storeToRefs(contestStore))
const { isAdmin } = $(storeToRefs(sessionStore))

const route = useRoute()
const cid = $computed(() => Number.parseInt(route.params.cid || 1))

// 课程题目标签分类
// Tag对应颜色的map: 未出现过的将填颜色值  出现过的直接使用
const tagColorMap = reactive({})
// 定义一个颜色列表，可以根据需求进行调整
const tagColors = ref(['#FFCE54', '#48CFAD', '#AC92EC', '#ED5565', '#4FC1E9', '#A0D468', '#EC87C0', '#6A71D7', '#F5D76E', '#3BAFDA', '#BF55EC', '#FF6B6B', '#47B8E0', '#8CC152', '#D770AD', '#967ADC', '#FDD752', '#37BC9B', '#DA4453', '#AAB2BD'])
// 从列表中取一个值随机填到一种tag中
function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * tagColors.value.length)
  return tagColors.value[randomIndex]
}
</script>

<template>
  <div class="conover-wrap">
    <h2>{{ contest.title }}</h2>
    <h4>Start Time:&nbsp;&nbsp;{{ timePretty(contest.create) }}</h4>
    <h4>End Time:&nbsp;&nbsp;{{ timePretty(contest.end) }}</h4>
    <table>
      <tr>
        <th>#</th>
        <th>ID</th>
        <th>Title</th>
        <th>Ratio</th>
        <th v-if="isAdmin">
          Tags
        </th>
      </tr>
      <tr v-for="(item, index) in overview" :key="item.pid">
        <td>
          <Icon v-if="solved.includes(item.pid)" type="md-checkmark" />
        </td>
        <td>{{ index + 1 }}</td>
        <td>
          <router-link :to="{ name: 'contestProblem', params: { cid, id: index + 1 } }">
            <Button type="text">
              {{ item.title }}
            </Button>
          </router-link>
        </td>
        <td>
          <span>{{ formate(item.solve / (item.submit + 0.000001)) }}</span>&nbsp;
          ({{ item.solve }} / {{ item.submit }})
        </td>
        <td v-if="isAdmin">
          <template v-for="tag in tagMap[item.pid]">
            <Tag :style="{ backgroundColor: tagColorMap[tag] || (tagColorMap[tag] = getRandomColor()), height: '100%' }">{{ tag }}</Tag>
          </template>
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../styles/common'

h2
  text-align: center
  margin-top: 10px
  margin-bottom: 8px
h4
  text-align: center
  margin-bottom: 8px
table
  margin-bottom: 20px
</style>
