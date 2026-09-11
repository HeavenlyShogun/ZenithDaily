import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Award, Sun, Moon, CheckCircle2, Flame } from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 頂部歡迎與暖心問候 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>哈囉，同學 👋</Text>
          <Text style={styles.subGreeting}>今天也是新的一天。深呼吸，讓我們一起掌握生活律動。</Text>
        </View>

        {/* 今日生活律動進度 */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Flame size={20} color={Colors.primary} />
            <Text style={styles.progressTitle}>今日律動指數</Text>
          </View>
          <Text style={styles.progressValue}>65%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '65%' }]} />
          </View>
          <Text style={styles.progressFooter}>太棒了！你今天已經完成了 2 個好習慣！</Text>
        </View>

        {/* 健康三要素快速打卡 (睡眠、運動、飲食) */}
        <Text style={styles.sectionTitle}>今日健康指標</Text>
        <View style={styles.grid}>
          {/* 睡眠打卡卡片 */}
          <View style={styles.gridCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#EBF2EE' }]}>
              <Moon size={22} color={Colors.primary} />
            </View>
            <Text style={styles.cardLabel}>昨晚睡眠</Text>
            <Text style={styles.cardValue}>7.5 小時</Text>
            <Text style={styles.cardStatus}>黃金作息 ✨</Text>
          </View>

          {/* 運動打卡卡片 */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: '#EBF5F8' }]}>
              <Sun size={22} color={Colors.secondary} />
            </View>
            <Text style={styles.cardLabel}>每日運動</Text>
            <Text style={styles.cardValue}>未打卡</Text>
            <Text style={[styles.cardStatus, { color: Colors.warning }]}>點擊打卡 🏃‍♂️</Text>
          </TouchableOpacity>
        </View>

        {/* 今日核心任務快覽 */}
        <View style={styles.taskCard}>
          <View style={styles.taskCardHeader}>
            <Text style={styles.taskCardTitle}>今日最重要任務</Text>
            <Text style={styles.taskCardSub}>完成這 3 件事，今天就 100 分！</Text>
          </View>

          <View style={styles.taskItem}>
            <CheckCircle2 size={18} color={Colors.primary} />
            <Text style={[styles.taskText, styles.taskCompleted]}>背英文單字 L5 (20個)</Text>
          </View>
          <View style={styles.taskItem}>
            <CheckCircle2 size={18} color={Colors.primary} />
            <Text style={[styles.taskText, styles.taskCompleted]}>放學慢跑 15 分鐘</Text>
          </View>
          <View style={styles.taskItem}>
            <View style={styles.taskCheckboxPending} />
            <Text style={styles.taskText}>準備明天物理段考 Ch.3</Text>
          </View>
        </View>

        {/* 行為科學/醫學建議小語 */}
        <View style={styles.tipCard}>
          <Award size={20} color={Colors.primary} style={styles.tipIcon} />
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipTitle}>行為科學心法</Text>
            <Text style={styles.tipContent}>
              「《原子習慣》提到：把好習慣的起步動作變得極其簡單。例如，想讀書，先要求自己打開書本看一頁就好。」
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 6,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#EBEFEF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressFooter: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    flex: 0.48,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  taskCardHeader: {
    marginBottom: 16,
  },
  taskCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  taskCardSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  taskCheckboxPending: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.secondary,
    marginRight: 10,
  },
  taskText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  tipCard: {
    backgroundColor: '#EBF2EE',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  tipContent: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
