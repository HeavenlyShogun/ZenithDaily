import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Heart, Send, Sparkles, Smile, Meh, Frown } from 'lucide-react-native';

export default function JournalScreen() {
  const [mood, setMood] = useState<number>(3); // 預設 3 分
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [ans3, setAns3] = useState('');

  const handleSave = () => {
    if (!ans1.trim() && !ans2.trim() && !ans3.trim()) {
      Alert.alert('溫馨提醒', '寫下一點點想法，能幫你更好地整理心情喔！');
      return;
    }
    Alert.alert('儲存成功', '你的今日反思已安全封存。你真的很棒，今天辛苦了！🌸');
    // 清除欄位模擬儲存
    setAns1('');
    setAns2('');
    setAns3('');
    setMood(3);
  };

  const renderMoodEmoji = () => {
    switch (mood) {
      case 1: return { emoji: '😢', text: '有點低落，需要好好休息' };
      case 2: return { emoji: '😕', text: '有點焦慮，沒關係，慢慢來' };
      case 3: return { emoji: '😐', text: '平靜的一天，安穩前進' };
      case 4: return { emoji: '🙂', text: '滿不錯的，有小小的收穫' };
      case 5: return { emoji: '😄', text: '太棒了！充滿前進的力量' };
      default: return { emoji: '😐', text: '平靜' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 頂部標題 */}
          <View style={styles.header}>
            <Text style={styles.title}>反思引導手帳</Text>
            <Text style={styles.subtitle}>「今天辛苦了。把思緒倒出來，好壞都溫柔接納。」</Text>
          </View>

          {/* 心情溫度計區塊 */}
          <View style={styles.moodCard}>
            <Text style={styles.cardTitle}>1. 測量今天的心情溫度</Text>
            <View style={styles.emojiDisplay}>
              <Text style={styles.emojiText}>{renderMoodEmoji().emoji}</Text>
              <Text style={styles.emojiSubText}>{renderMoodEmoji().text}</Text>
            </View>
            <View style={styles.sliderRow}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.moodDot, mood === val && styles.moodDotActive]}
                  onPress={() => setMood(val)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.moodDotText, mood === val && styles.moodDotTextActive]}>
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 引導式問答 */}
          <Text style={styles.sectionTitle}>2. 溫和引導反思三問</Text>

          {/* Q1 卡片 */}
          <View style={styles.journalCard}>
            <View style={styles.questionHeader}>
              <Sparkles size={16} color={Colors.primary} />
              <Text style={styles.questionText}>今天最棒、最感謝的 3 件事是什麼？</Text>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              placeholder="例如：吃到好吃的午餐、成功解開一題數學、今天有乖乖去慢跑..."
              placeholderTextColor={Colors.textMuted}
              value={ans1}
              onChangeText={setAns1}
            />
          </View>

          {/* Q2 卡片 */}
          <View style={styles.journalCard}>
            <View style={styles.questionHeader}>
              <Heart size={16} color={Colors.warning} />
              <Text style={styles.questionText}>如果可以重新來過，今天能有什麼調整？</Text>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              placeholder="例如：下午滑手機太久，明天可以設定 App 時間限制限制自己..."
              placeholderTextColor={Colors.textMuted}
              value={ans2}
              onChangeText={setAns2}
            />
          </View>

          {/* Q3 卡片 */}
          <View style={styles.journalCard}>
            <View style={styles.questionHeader}>
              <Send size={16} color={Colors.secondary} />
              <Text style={styles.questionText}>對明天的自己說一句正向鼓勵的話！</Text>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={2}
              placeholder="例如：你今天已經跨出第一步了，你真的很棒，明天繼續加油！"
              placeholderTextColor={Colors.textMuted}
              value={ans3}
              onChangeText={setAns3}
            />
          </View>

          {/* 儲存按鈕 */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>安全儲存今日手帳 🌸</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  moodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emojiDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiText: {
    fontSize: 48,
    marginBottom: 6,
  },
  emojiSubText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
  },
  moodDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  moodDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  moodDotTextActive: {
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  journalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: Colors.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
