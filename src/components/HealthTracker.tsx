import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, MoonStar, PlusCircle, Sparkles, SunMedium, Trash2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import type { HealthEntry, MoodLevel } from '../types';
import { createId, formatDateLabel, getDateKey, getHealthEntries, saveHealthEntry, deleteHealthEntry } from '../utils/storage';

const moodOptions: Array<{ value: MoodLevel; emoji: string; label: string }> = [
  { value: 1, emoji: '😞', label: '低落' },
  { value: 2, emoji: '😕', label: '緊繃' },
  { value: 3, emoji: '😐', label: '平穩' },
  { value: 4, emoji: '🙂', label: '不錯' },
  { value: 5, emoji: '😄', label: '超棒' },
];

function clampNumber(value: string, min: number, max: number): number {
  const parsed = Number(value.replace(',', '.'));
  if (!Number.isFinite(parsed)) {
    return min;
  }
  return Math.min(max, Math.max(min, parsed));
}

function moodLabel(mood: MoodLevel): string {
  return moodOptions.find((option) => option.value === mood)?.label ?? '平穩';
}

export default function HealthTracker() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [sleepHours, setSleepHours] = useState('7.5');
  const [exerciseMinutes, setExerciseMinutes] = useState('30');
  const [waterGlasses, setWaterGlasses] = useState('6');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<MoodLevel>(3);

  const todayKey = useMemo(() => getDateKey(), []);
  const todayEntry = useMemo(() => entries.find((entry) => getDateKey(entry.createdAt) === todayKey) ?? null, [entries, todayKey]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const storedEntries = await getHealthEntries();
        if (!mounted) {
          return;
        }

        setEntries(storedEntries);
        const recent = storedEntries.find((entry) => getDateKey(entry.createdAt) === todayKey);
        if (recent) {
          setSleepHours(String(recent.sleepHours));
          setExerciseMinutes(String(recent.exerciseMinutes));
          setWaterGlasses(String(recent.waterGlasses));
          setMood(recent.mood);
          setNote(recent.note);
        }
      } catch (error) {
        console.error('讀取健康紀錄失敗:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [todayKey]);

  async function handleSave() {
    const entry: HealthEntry = {
      id: todayEntry?.id ?? createId('health'),
      createdAt: new Date().toISOString(),
      sleepHours: clampNumber(sleepHours, 0, 24),
      exerciseMinutes: clampNumber(exerciseMinutes, 0, 1440),
      waterGlasses: clampNumber(waterGlasses, 0, 50),
      mood,
      note: note.trim(),
    };

    try {
      await saveHealthEntry(entry);
      setEntries(await getHealthEntries());
      Alert.alert('已更新健康紀錄', '今天的健康打卡已安全保存。');
    } catch (error) {
      console.error('儲存健康紀錄失敗:', error);
      Alert.alert('儲存失敗', '請稍後再試一次。');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteHealthEntry(id);
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error('刪除健康紀錄失敗:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroIcon}>
                <Sparkles size={18} color={Colors.primary} />
              </View>
              <Text style={styles.title}>健康追蹤</Text>
            </View>
            <Text style={styles.subtitle}>睡眠、運動、補水與心情，今天一起完成小小的自我照顧。</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <MoonStar size={18} color={Colors.primary} />
                <Text style={styles.summaryValue}>{sleepHours || '--'}</Text>
                <Text style={styles.summaryLabel}>睡眠</Text>
              </View>
              <View style={styles.summaryItem}>
                <Activity size={18} color={Colors.secondary} />
                <Text style={styles.summaryValue}>{exerciseMinutes || '--'}</Text>
                <Text style={styles.summaryLabel}>運動</Text>
              </View>
              <View style={styles.summaryItem}>
                <SunMedium size={18} color={Colors.warning} />
                <Text style={styles.summaryValue}>{waterGlasses || '--'}</Text>
                <Text style={styles.summaryLabel}>飲水</Text>
              </View>
            </View>
            <Text style={styles.summaryFooter}>今日心情：{moodLabel(mood)} {moodOptions.find((option) => option.value === mood)?.emoji}</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>今天的健康打卡</Text>

            <View style={styles.fieldRow}>
              <MetricInput label="睡眠（小時）" value={sleepHours} onChangeText={setSleepHours} placeholder="例如 7.5" />
              <MetricInput label="運動（分鐘）" value={exerciseMinutes} onChangeText={setExerciseMinutes} placeholder="例如 30" />
            </View>

            <View style={styles.fieldRow}>
              <MetricInput label="飲水（杯）" value={waterGlasses} onChangeText={setWaterGlasses} placeholder="例如 6" />
              <View style={styles.moodPanel}>
                <Text style={styles.metricLabel}>心情</Text>
                <View style={styles.moodRow}>
                  {moodOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.moodChip, mood === option.value && styles.moodChipActive]}
                      onPress={() => setMood(option.value)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.moodChipEmoji}>{option.emoji}</Text>
                      <Text style={[styles.moodChipText, mood === option.value && styles.moodChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.metricLabel}>備註</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="今天有什麼值得記錄的小事？"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
              <PlusCircle size={18} color="#FFF" />
              <Text style={styles.saveButtonText}>{todayEntry ? '更新今日紀錄' : '儲存今日紀錄'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>最近紀錄</Text>
            {loading ? (
              <Text style={styles.emptyText}>正在載入...</Text>
            ) : entries.length === 0 ? (
              <Text style={styles.emptyText}>還沒有健康紀錄，先完成今天的第一筆打卡吧。</Text>
            ) : (
              entries.slice(0, 5).map((entry) => (
                <View key={entry.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyDate}>{formatDateLabel(entry.createdAt)}</Text>
                    <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.deleteButton} activeOpacity={0.8}>
                      <Trash2 size={14} color={Colors.warning} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.historyText}>
                    睡眠 {entry.sleepHours} 小時 · 運動 {entry.exerciseMinutes} 分鐘 · 飲水 {entry.waterGlasses} 杯 · 心情 {moodLabel(entry.mood)}
                  </Text>
                  {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MetricInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <TextInput
        style={styles.metricInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF2EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.textMuted,
  },
  summaryFooter: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  metricInput: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 14,
  },
  moodPanel: {
    flex: 1,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    minWidth: 60,
  },
  moodChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EBF2EE',
  },
  moodChipEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  moodChipText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  moodChipTextActive: {
    color: Colors.text,
  },
  noteInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.background,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  historyText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  historyNote: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  deleteButton: {
    padding: 6,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});